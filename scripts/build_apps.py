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

# This connection group repeatedly hit REJECT during store category loading.
# Keep the upstream snapshot intact; let the normal routing rules handle these IPs.
MEITUAN_CLASSIFICATION_CONFLICTS = frozenset({
    'IP-CIDR,203.76.217.241/32,REJECT,no-resolve',
    'IP-CIDR,203.76.217.243/32,REJECT,no-resolve',
    'IP-CIDR,101.50.8.64/32,REJECT,no-resolve',
    'IP-CIDR,103.63.160.64/32,REJECT,no-resolve',
    'IP-CIDR,119.29.48.215/32,REJECT,no-resolve',
})


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


def spdb_outputs(source):
    # User-supplied pdxb.js has no author or source URL; do not invent attribution.
    helpers = source[:source.index('try {')]
    helpers = helpers.replace('Match images by actual dimensions. The original sample is 1125 x 1931; do not infer dimensions from the phone model.', 'Match image assets by configured dimensions; the default is 1125 x 1931 and is not inferred from the device model.')
    helpers = helpers.replace('// max-size=0', '// max-size=-1 (Surge)')
    for old in ['const TARGET_WIDTH = 1125;', 'const TARGET_HEIGHT = 1931;']:
        if helpers.count(old) != 1:
            raise ValueError('SPDB source changed; review dimension defaults')
        helpers = helpers.replace(old, '')
    helpers = helpers.replace('if (bytes.length < 24)', 'if (bytes.length < 33)')
    helpers = helpers.replace('if (!isPNG)', 'if (!isPNG || readBE32(bytes, 8) !== 13 || String.fromCharCode(...bytes.subarray(12, 16)) !== "IHDR")')
    helpers = helpers.replace('if (bytes.length < 10)', 'if (bytes.length < 13)')
    helpers = helpers.replace('while (pos + 8 < bytes.length)', 'while (pos < bytes.length)')
    helpers = helpers.replace('const marker = bytes[pos++];', 'const marker = bytes[pos++];\n        if (marker === 0xD9 || marker === 0xDA) return null;')
    helpers = helpers.replace('if (isSOF && segmentLength >= 7)', 'if (isSOF && segmentLength >= 8 && bytes[pos + 7] > 0 && segmentLength === 8 + 3 * bytes[pos + 7])')
    runtime = r'''
(function () {
    let verbose = true;
    function log(message) { if (verbose) console.log("[SPDB] " + message); }
    try {
        const options = {};
        const argument = typeof $argument === "string" ? $argument : "";
        for (const pair of argument.split("&")) {
            const i = pair.indexOf("=");
            if (i > 0) options[pair.slice(0, i)] = pair.slice(i + 1);
        }
        verbose = options.log !== "0";
        function dimension(key, fallback) {
            if (!Object.prototype.hasOwnProperty.call(options, key)) return fallback;
            const value = options[key];
            return /^[1-9][0-9]{0,4}$/.test(value) && Number(value) <= 65535 ? Number(value) : null;
        }
        const width = dimension("width", 1125), height = dimension("height", 1931);
        if (!width || !height) { log("INVALID_TARGET PASS"); $done({}); return; }
        const request = typeof $request !== "undefined" && $request ? $request : {};
        const response = typeof $response !== "undefined" && $response ? $response : {};
        if (!/^https?:\/\/images?\.spdbccc\.com\.cn\/.+/i.test(request.url || "") ||
            (request.method && request.method.toUpperCase() !== "GET") || Number(response.status) !== 200) {
            $done({}); return;
        }
        const raw = response.body;
        let body;
        if (Object.prototype.toString.call(raw) === "[object ArrayBuffer]") body = new Uint8Array(raw);
        else if (ArrayBuffer.isView(raw)) body = new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
        if (!body || !body.length) { log("NO_BINARY_BODY PASS"); $done({}); return; }
        const info = getPNGSize(body) || getGIFSize(body) || getJPEGSize(body);
        if (!info || !info.width || !info.height) { log("UNKNOWN_IMAGE PASS"); $done({}); return; }
        const matched = info.width === width && info.height === height;
        log(info.type + " " + info.width + "x" + info.height + " target=" + width + "x" + height + (matched ? " BLOCK" : " PASS"));
        // In Surge $done() means passthrough. abort:true explicitly stops delivery.
        $done(matched ? {abort: true} : {});
    } catch (_) {
        log("PARSE_ERROR PASS");
        $done({});
    }
})();
'''
    js = ('// Source: user-supplied pdxb.js; original author and public URL not supplied.\n'
          '// Surge adaptation: explicit abort, configurable exact dimensions, URL-free logs, parser bounds.\n'
          '// The original 1125x1931 sample is not a verified iPhone 18 Pro asset size.\n'
          '// Rebuild with scripts/build_apps.py; original file archived in maintenance/apps/source/pdxb.js.\n'
          + helpers + runtime)
    module = header('SPDB - Splash Image Dimension Filter', 'Match exact image-asset dimensions. The default keeps the 1125×1931 sample; confirm the actual iPhone 18 Pro asset in logs.', '')
    module += '#!arguments=width:1125,height:1931,log:1\n'
    module += '#!arguments-desc=width/height are the actual ad-image dimensions, not the phone display size. log=1 records dimensions; 0 disables logging.\n'
    module += '# Source: user-supplied pdxb.js; author and public URL not supplied.\n'
    module += '# Surge uses abort:true to stop a response and max-size=-1 for unlimited buffering.\n'
    module += '\n[Script]\n'
    module += ('SPDB-Splash = type=http-response, pattern=^https?://images?\\.spdbccc\\.com\\.cn/.+, '
               'requires-body=true, binary-body-mode=true, max-size=-1, '
               f'script-path={RAW}JS/pdxb.surge.js, timeout=20, '
               'argument="width={{{width}}}&height={{{height}}}&log={{{log}}}"\n')
    module += '\n[MITM]\nhostname = %APPEND% image.spdbccc.com.cn, images.spdbccc.com.cn\n'
    return {'Modules/SPDB.sgmodule': module, 'JS/pdxb.surge.js': js}


def planned_outputs():
    texts = {name: (INPUT / name).read_text() for name in
             ['Txvideoad.js', 'TxvideoAD.snippet', 'MT.js', 'MT.snippet',
              'Didichuxing.snippet', 'MTAppAdClean.js', 'MTAppAdCleanMine.js',
              'MTAppAdClean.snippet', 'MeiTuanNoAd.js', 'MeituanMiniProgram.snippet', 'pdxb.js']}
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
    tencent = header('Tencent Video - Cleanup', 'Clean up splash, pre-roll, mid-roll, pause ads, and selected page elements. Binary endpoints use Surge's native body API.',
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
    # Preserve upstream scripts and actions apart from the scoped category fix.
    metadata, rules, routes, hosts = parse(texts['MT.snippet'])
    scripts = [r for r in routes if r['action'] == 'script-response-body']
    rejects = [r for r in routes if r['action'] == 'reject']
    if len(rules) != 46 or len(scripts) != 8 or len(rejects) != 2 or len(hosts) != 7:
        raise ValueError('Unexpected ZenmoFeiShi QX rules; review conversion')
    if any(not (r['argument'] or '').endswith('/MT.js') for r in scripts):
        raise ValueError('Unexpected Meituan response script source')
    if not MEITUAN_CLASSIFICATION_CONFLICTS.issubset(rules):
        raise ValueError('Meituan category conflict rules changed; review the local adaptation')
    rules = [r for r in rules if r not in MEITUAN_CLASSIFICATION_CONFLICTS]
    app = header('Meituan App 12.67.403 - Category Compatibility Fix',
                 'Fixes store-category loading by removing five conflicting IP blocks while retaining the other 41 rules, two Rewrite rules, and eight original response scripts.',
                 metadata.get('author', ''))
    app += '# Source: https://github.com/ZenmoFeiShi/Qx/blob/main/MT.snippet\n'
    app += '# Script: https://github.com/ZenmoFeiShi/Qx/blob/main/MT.js\n'
    app += '# Source update: ' + metadata.get('update', '') + '\n'
    app += '# Local adaptation: remove five category-loading IP rejects; add no DIRECT overrides.\n'
    app += '\n[Rule]\n' + '\n'.join(
        r + ',extended-matching' if r.startswith('DOMAIN') else r for r in rules)
    app += '\n\n[URL Rewrite]\n' + '\n'.join(
        r['pattern'] + ' - reject' for r in rejects)
    app += '\n\n[Script]\n' + '\n'.join(
        'MT-' + str(i+1) + ' = type=http-response,pattern=' + r['pattern']
        + ',script-path=' + (r['argument'] or '') + ',requires-body=true'
        for i, r in enumerate(scripts))
    app += '\n\n[MITM]\nhostname = %APPEND% ' + ', '.join(hosts) + '\n'
    outputs['Modules/Meituan.sgmodule'] = app
    metadata, rules, routes, hosts = parse(texts['Didichuxing.snippet'])
    jq_routes = [r for r in routes if r['action'] == 'jsonjq-response-body']
    dict_routes = [r for r in routes if r['action'] == 'reject-dict']
    if len(jq_routes) != 12 or len(dict_routes) != 12 or len(routes) != 24:
        raise ValueError('DiDi actions changed; review native jq and Map Local conversion')
    didi = header('Didi - App Cleanup', 'Simplifies selected profile, navigation, recommendation, and wallet sections using native jq and Map Local; no JS dependency.', 'ZenmoFeiShi')
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
    # WeChat mini-program stays independent from the original App rules.
    mini = header('Meituan WeChat Mini Program - Cleanup', 'Clean up navigation, promotions, and ads in the Meituan WeChat mini program.', 'TG@ZenMoFiShi')
    mini += '# Original rules: ' + QX_SOURCE + 'WxPureDominion.snippet\n'
    mini += '\n[Script]\n' + '\n'.join(script_line(
        f'MeituanMini-{i}', r, 'JS/MeituanMiniProgram.surge.js')
        for i, r in enumerate(mini_scripts))
    mini += '\n\n[Map Local]\n' + '\n'.join(
        r['pattern'] + ' data-type=text data="{}" status-code=200 header="Content-Type:application/json"'
        for r in mini_mock)
    mini += '\n\n[MITM]\nhostname = %APPEND% ' + ', '.join(hosts) + '\n'
    outputs['Modules/MeituanMiniProgram.sgmodule'] = mini
    outputs['JS/MeituanMiniProgram.surge.js'] = ('// Original logic: '+QX_SOURCE+'MeiTuanNoAd.js\n'
                                               '// Only used by the two scoped Meituan mini-program response routes.\n'+texts['MeiTuanNoAd.js'])
    outputs.update(spdb_outputs(texts['pdxb.js']))
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
