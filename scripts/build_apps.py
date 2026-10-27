#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Rebuild the app modules from local snapshots. No network access or publishing."""
import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / 'maintenance/apps/source'
RAW = 'https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/'
QX_SOURCE = 'https://github.com/ZenmoFeiShi/Qx/blob/3e442e78e95be2c71153e55560a977ea42495f27/'


def parse(text):
    metadata, rules, routes, hosts = {}, [], [], []
    kinds = {'host': 'DOMAIN', 'host-suffix': 'DOMAIN-SUFFIX',
             'host-wildcard': 'DOMAIN-WILDCARD', 'ip-cidr': 'IP-CIDR',
             'ip6-cidr': 'IP-CIDR6'}
    for number, raw in enumerate(text.splitlines(), 1):
        line = raw.strip()
        if not line or line.startswith(('# ', '//')):
            continue
        if line.startswith('#!'):
            match = re.fullmatch(r'#!([\w-]+)\s*=\s*(.*)', line)
            if match:
                metadata[match[1]] = match[2]
            continue
        if line.startswith('hostname'):
            hosts = [x.strip() for x in line.split('=', 1)[1].split(',')]
            continue
        match = re.fullmatch(r'(host|host-suffix|host-wildcard|ip-cidr|ip6-cidr),\s*([^,]+),\s*reject', line, re.I)
        if match:
            kind = kinds[match[1].lower()]
            rules.append(f'{kind},{match[2].strip()},REJECT' + (',no-resolve' if kind.startswith('IP-CIDR') else ''))
            continue
        match = re.fullmatch(r'(\S+)\s+url\s+(script-request-body|script-response-body|reject|reject-dict|jsonjq-response-body)(?:\s+(.+))?', line)
        if not match:
            raise ValueError(f'Unsupported rule on line {number}; existing outputs were not changed')
        pattern, action, argument = match.groups()
        pattern = pattern.replace(r'\/', '/')
        if ',' in pattern:
            raise ValueError('Pattern with comma needs manual review')
        routes.append({'pattern': pattern, 'action': action, 'argument': argument})
    if not routes or not hosts:
        raise ValueError('Missing routes or hostnames')
    return metadata, rules, routes, hosts


def header(name, description, author):
    return f'#!name={name}\n#!desc={description}\n' + (f'#!author={author}\n' if author else '')


def script_line(name, route, path, binary=False, max_size=2097152):
    phase = 'request' if route['action'] == 'script-request-body' else 'response'
    return (f'{name} = type=http-{phase}, pattern={route["pattern"]}, requires-body=true, '
            f'binary-body-mode={str(binary).lower()}, max-size={max_size}, '
            f'script-path={RAW}{path}, timeout=10')


def planned_outputs():
    texts = {name: (INPUT / name).read_text() for name in
             ['Txvideoad.js', 'TxvideoAD.snippet', 'MT.js', 'MT.snippet',
              'Didichuxing.snippet', 'MTAppAdClean.js', 'MTAppAdCleanMine.js',
              'MTAppAdClean.snippet', 'MeiTuanNoAd.js', 'MeituanMiniProgram.snippet']}
    metadata, rules, routes, hosts = parse(texts['TxvideoAD.snippet'])
    if len(routes) != 5 or any(not (r['argument'] or '').endswith('/Txvideoad.js') for r in routes):
        raise ValueError('Tencent routes changed; review binary/text mode before rebuilding')
    source = texts['Txvideoad.js']
    replacements = {'$request.bodyBytes': ('$request.body', 1),
                    '$response.bodyBytes': ('$response.body', 1),
                    '{ bodyBytes: toBuf(r) }': ('{ body: r }', 2)}
    for old, (new, count) in replacements.items():
        if source.count(old) != count:
            raise ValueError('Tencent body API changed; manual adapter review is required')
        source = source.replace(old, new)
    if 'bodyBytes' in source:
        raise ValueError('Unsupported QX body API remains')
    tencent = header('腾讯视频净化', '开屏、贴片、暂停广告与页面净化；二进制接口使用 Surge 原生正文 API。',
                     metadata.get('author', ''))
    tencent += '# Original rules: ' + QX_SOURCE + 'TxvideoAD.snippet\n'
    tencent += '# Earlier Surge adapter reference: https://github.com/RoaycL/Surge\n'
    tencent += '\n[Rule]\n' + '\n'.join(rules) + '\n\n[Script]\n'
    tencent += '\n'.join(script_line(f'TencentVideo-{i}', route, 'JS/Txvideoad.surge.js',
                                     binary='rdelivery' not in route['pattern'], max_size=1048576)
                         for i, route in enumerate(routes))
    tencent += '\n\n[MITM]\nhostname = %APPEND% ' + ', '.join(hosts) + '\n'
    outputs = {
        'JS/Txvideoad.surge.js': ('// Original logic: ' + QX_SOURCE + 'Txvideoad.js\n'
                                '// Surge adaptation: bodyBytes -> body (Uint8Array).\n'
                                '// Rebuild from maintenance/apps/source using scripts/build_apps.py.\n' + source),
        'Modules/TencentVideo.sgmodule': tencent,
        'Modules/TxvideoAD.sgmodule': tencent,
    }
    metadata, rules, routes, hosts = parse(texts['MT.snippet'])
    scripts = [route for route in routes if route['action'] != 'reject']
    rejects = [route for route in routes if route['action'] == 'reject']
    if len(scripts) != 8 or any(route['action'] != 'script-response-body'
                              or not (route['argument'] or '').endswith('/MT.js') for route in scripts):
        raise ValueError('Meituan routes changed; review the new actions')
    mt_source = texts['MT.js']
    if re.search(r'\$(?:task|prefs)\b|\.bodyBytes\b', mt_source):
        raise ValueError('New QX-only APIs in Meituan source require an adapter')
    # The current script dropped the older service-entry cleanup. Merge it into
    # the SAME handler because Surge executes only the first matching response script.
    legacy = texts['MTAppAdCleanMine.js']
    tools = re.search(r'const mtqxDropTools = \[[\s\S]*?\];', legacy)
    function = re.search(r'^function mtqxTools\(obj\) \{[\s\S]*?^\}', legacy, re.M)
    original_mine = '''function mtqxMine(obj) {
  if (!mtqxIsObj(obj) || !Array.isArray(obj.children)) return false;
  const kept = obj.children.filter(c => !(mtqxIsObj(c) && mtqxMineHide.indexOf(c.name) >= 0));
  if (kept.length === obj.children.length) return false;
  obj.children = kept;
  return true;
}'''
    if not tools or not function or mt_source.count(original_mine) != 1:
        raise ValueError('Meituan personal-center shape changed; review the legacy merge')
    merged_mine = '''function mtqxMine(obj) {
  if (!mtqxIsObj(obj) || !Array.isArray(obj.children)) return false;
  let changed = mtqxTools(obj);
  const kept = obj.children.filter(c => !(mtqxIsObj(c) && mtqxMineHide.indexOf(c.name) >= 0));
  if (kept.length !== obj.children.length) {
    obj.children = kept;
    changed = true;
  }
  return changed;
}'''
    mt_source = mt_source.replace(original_mine, tools[0] + '\n\n' + function[0] + '\n\n' + merged_mine)
    outputs['JS/Meituan.surge.js'] = ('// Original logic: ' + QX_SOURCE + 'MT.js\n'
                                    '// Legacy mine-service handling: MTAppAdCleanMine.js, snapshot 354e6d5217bb2d0fecdfbf506cd3d480d30d53b7.\n'
                                    '// Surge HTTP JSON response script; local snapshot, no runtime download.\n'
                                    '// Rebuild from maintenance/apps/source using scripts/build_apps.py.\n' + mt_source)
    core = header('美团净化（App/小程序）', '按 12.67.403 结构净化底栏、推荐流、搜索词、开屏与我的服务入口；不改变网络通道。',
                  metadata.get('author', ''))
    core += '# Original rules: ' + QX_SOURCE + 'MT.snippet\n'
    core += '# Conversion reference: https://github.com/muktsoen/SurgeRules/blob/main/MT.sgmodule\n'
    core += '\n[Script]\n' + '\n'.join(script_line(f'Meituan-{i}', route, 'JS/Meituan.surge.js')
                                           for i, route in enumerate(scripts))
    core_hosts = [host for host in hosts if not host.startswith('httpdns')]
    core += '\n\n[MITM]\nhostname = %APPEND% ' + ', '.join(core_hosts) + '\n'
    outputs['Modules/Meituan.sgmodule'] = core
    transport = header('美团网络兼容（可选）', '拦截 SHARK、mquic 与 HTTPDNS；仅在正文净化不命中时按需使用，需检查登录、支付和扫码。',
                       metadata.get('author', ''))
    transport += '# Original rules: ' + QX_SOURCE + 'MT.snippet\n'
    transport += '# Kept separate from page cleanup to allow independent network troubleshooting.\n'
    transport += '\n[Rule]\n' + '\n'.join(rules)
    transport += '\n\n[URL Rewrite]\n' + '\n'.join(route['pattern'] + ' - reject' for route in rejects) + '\n'
    outputs['Modules/Meituan-Network-Compatibility.sgmodule'] = transport
    metadata, rules, routes, hosts = parse(texts['Didichuxing.snippet'])
    jq_routes = [r for r in routes if r['action'] == 'jsonjq-response-body']
    dict_routes = [r for r in routes if r['action'] == 'reject-dict']
    if len(jq_routes) != 12 or len(dict_routes) != 12 or len(routes) != 24:
        raise ValueError('DiDi actions changed; review native jq and Map Local conversion')
    didi = header('滴滴出行净化', '个人中心、导航、推荐及钱包页面精简；原生 jq/Map Local，无 JS 依赖。', metadata.get('author', ''))
    didi += '# Original rules: ' + QX_SOURCE + 'Didichuxing.snippet\n'
    didi += '# Requires Surge iOS 5.14.0+ / Mac 5.9.0+ for native jq.\n'
    didi += '\n[Rule]\n' + '\n'.join(rules) + '\n\n[Body Rewrite]\n'
    for route in jq_routes:
        argument = route['argument'] or ''
        if len(argument) < 2 or not (argument.startswith("'") and argument.endswith("'")):
            raise ValueError('Unexpected DiDi jq quoting')
        expression = argument[1:-1]
        if "'" in expression or '\n' in expression:
            raise ValueError('DiDi jq quoting needs manual review')
        guarded = ('. as $original | try (if (type == "object" and '
                   '((.data | type) == "object" or (.data | type) == "array")) then ('
                   + expression + ') else . end) catch $original')
        didi += f'http-response-jq {route["pattern"]} \'{guarded}\'\n'
    didi += '\n[Map Local]\n'
    didi += '\n'.join(r['pattern'] + ' data-type=text data="{}" status-code=200 header="Content-Type:application/json"' for r in dict_routes)
    didi += '\n\n[MITM]\nhostname = %APPEND% ' + ', '.join(hosts) + '\n'
    outputs['Modules/Didi.sgmodule'] = didi
    metadata, rules, routes, hosts = parse(texts['MeituanMiniProgram.snippet'])
    mini_scripts = [r for r in routes if r['action'] == 'script-response-body']
    mini_mock = [r for r in routes if r['action'] == 'reject-dict']
    if rules or len(mini_scripts) != 2 or len(mini_mock) != 6 or len(routes) != 8:
        raise ValueError('Meituan mini-program rules changed; review the scoped extraction')
    if any(not (r['argument'] or '').endswith('/MeiTuanNoAd.js') for r in mini_scripts):
        raise ValueError('Unexpected Meituan mini-program script dependency')
    # Keep one installable Meituan module for both App and mini-program routes.
    # Each JS keeps a narrow URL pattern; no two handlers compete for one URL.
    main = outputs['Modules/Meituan.sgmodule']
    main = main.replace('按 12.67.403 结构净化底栏、推荐流、搜索词、开屏与我的服务入口；不改变网络通道。',
                        '美团 App 与微信小程序净化，含我的服务入口、导航和广告卡片；不改变网络通道。')
    section = main.index('\n\n[MITM]')
    main = main[:section] + '\n' + '\n'.join(script_line(f'MeituanMini-{i}',r,'JS/MeituanMiniProgram.surge.js') for i,r in enumerate(mini_scripts)) + main[section:]
    main += '\n# Meituan mini-program section: ' + QX_SOURCE + 'WxPureDominion.snippet\n'
    main += '\n[Map Local]\n' + '\n'.join(r['pattern']+' data-type=text data="{}" status-code=200 header="Content-Type:application/json"' for r in mini_mock) + '\n'
    app_hosts = [h.strip() for h in re.search(r'hostname = %APPEND% (.*)', main)[1].split(',')]
    combined_hosts = list(dict.fromkeys(app_hosts + hosts))
    main = re.sub(r'hostname = %APPEND% .*', 'hostname = %APPEND% ' + ', '.join(combined_hosts), main, count=1)
    outputs['Modules/Meituan.sgmodule'] = main
    outputs['JS/MeituanMiniProgram.surge.js'] = ('// Original logic: '+QX_SOURCE+'MeiTuanNoAd.js\n'
                                               '// Only used by the two scoped Meituan mini-program response routes.\n'+texts['MeiTuanNoAd.js'])
    manifest = {
        'format': 1,
        'baseline_commit': '3e442e78e95be2c71153e55560a977ea42495f27',
        'baseline_time_asia_shanghai': '2026-10-27T17:14:24+08:00',
        'baseline_already_present_in_initial_tencent_snapshot': True,
        'inputs': [{'path': 'maintenance/apps/source/' + name,
                    'sha256': hashlib.sha256((INPUT / name).read_bytes()).hexdigest()}
                   for name in sorted(texts)],
        'outputs': [{'destination_path': path,
                     'destination_sha256': hashlib.sha256(text.encode()).hexdigest()}
                    for path, text in sorted(outputs.items())],
    }
    outputs['maintenance/apps/lock.json'] = json.dumps(manifest, ensure_ascii=False, indent=2) + '\n'
    return outputs


def main(check=False):
    outputs = planned_outputs()
    changed = [name for name, text in outputs.items()
               if not (ROOT / name).exists() or (ROOT / name).read_text() != text]
    if check:
        if changed:
            raise SystemExit('Rebuild required: ' + ', '.join(changed))
    else:
        for name, text in outputs.items():
            path = ROOT / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text)
    print(json.dumps({'passed': True, 'check_only': check, 'generated_files': len(outputs),
                      'changed': changed}, ensure_ascii=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    main(parser.parse_args().check)
