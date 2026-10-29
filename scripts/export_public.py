#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Build a public Surge template and an OUTSIDE-repository private overlay.

No network requests are made. The private overlay restores removed content when
rendering a local profile. It must never be committed or sent to an online tool.
"""
import argparse
import hashlib
import ipaddress
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

PUBLIC_HOSTS = {
    'raw.githubusercontent.com', 'github.com', 'ruleset.skk.moe',
    'dns.alidns.com', 'cloudflare-dns.com', 'cp.cloudflare.com',
    'connectivitycheck.gstatic.com', 'www.gstatic.com', 'www.apple.com',
    'www.google.com', 'maps.google.com', 'www.baidu.com',
}
URL = re.compile(r'https?://[^\s,\"<>]+')
AI_URL = 'https://ruleset.skk.moe/List/non_ip/ai.conf'


def sections(text):
    result = []
    for line in text.splitlines():
        match = re.fullmatch(r'\[([^\]]+)\]\s*', line)
        if match:
            result.append([match[1], []])
        elif result:
            result[-1][1].append(line)
        elif line.strip():
            # Managed-profile headers can embed a private subscription URL.
            continue
    return result


def active(line):
    return bool(line.strip()) and not line.lstrip().startswith(('#', ';', '//'))


def safe_url(raw):
    try:
        value = urlsplit(re.sub(r'\$\d+', '', raw))
        return (value.hostname in PUBLIC_HOSTS and not value.query
                and not value.username and not value.password)
    except ValueError:
        return False


def export(source, public, private):
    root = public.parent.parent.resolve()
    if private.resolve().is_relative_to(root):
        raise SystemExit('Private overlay must be outside the public repository.')
    text = source.read_text(encoding='utf-8-sig')
    parsed = sections(text)
    by_name = dict(parsed)
    nodes = [line.split('=', 1)[0].strip()
             for line in by_name.get('Proxy', []) if active(line) and '=' in line]
    aliases = {name: f'LOCAL-{index:03d}' for index, name in enumerate(nodes, 1)}
    slots = {}

    def slot(original, fallback=''):
        name = f'S{len(slots) + 1:03d}'
        slots[name] = original
        return [f'# BEGIN PRIVATE-SLOT {name}', *fallback.splitlines(),
                f'# END PRIVATE-SLOT {name}']

    def neutral(line):
        for name in sorted(aliases, key=len, reverse=True):
            line = line.replace(name, aliases[name])
        return line

    out = [
        '# Surge iOS public template',
        '# No proxy nodes, subscription URLs, WireGuard keys, or MITM CA are included.',
        '# LOCAL-* policies default to REJECT placeholders; configure your own nodes before use.',
        '# This is not a complete copy of the original runtime profile; see repository docs for differences and third-party sources.',
        '# PRIVATE-SLOT markers are used by local tools to restore private content. Keep them unchanged.', '',
    ]
    removed = {'proxy_entries': len(nodes), 'wireguard_sections': 0,
               'private_rule_lines': 0, 'embedded_rule_lines': 0,
               'icon_references': 0, 'credential_fields': 0}
    for name, body in parsed:
        if name.startswith(('WireGuard ', 'Tailscale ')):
            out += slot('\n'.join([f'[{name}]', *body]))
            removed['wireguard_sections'] += 1
            continue
        out.append(f'[{name}]')
        if name == 'Proxy':
            out += slot('\n'.join(body), '# Import nodes locally; keep the public repository free of node credentials.')
        elif name == 'Proxy Group':
            clean = []
            for line in body:
                if not active(line):
                    continue
                removed['icon_references'] += line.count('icon-url=')
                line = re.sub(r',\s*icon-url=[^,\s]+', '', line)
                key = line.split('=', 1)[0].strip()
                if key == 'Home Access':
                    line = 'Home Access = select, REJECT, DIRECT'
                elif key == 'AllServer':
                    line = 'AllServer = select, REJECT, include-all-proxies=true, hidden=true'
                elif key == 'AI US':
                    line = 'AI US = select, REJECT, include-other-group=AllServer, policy-regex-filter=美国|United States|USA|US'
                else:
                    line = neutral(line)
                    # Empty regional filters must not quietly choose DIRECT.
                    if re.match(r'^[^=]+=\s*(url-test|fallback|smart)\s*,', line):
                        line = re.sub(r'(=\s*(?:url-test|fallback|smart)\s*,)', r'\1 REJECT,', line, count=1)
                    elif '= select, include-' in line:
                        line = line.replace('= select, include-', '= select, REJECT, include-', 1)
                clean.append(line)
            used = set(re.findall(r'\bLOCAL-\d{3}\b', '\n'.join(clean)))
            for line in by_name.get('Rule', []):
                used.update(re.findall(r'\bLOCAL-\d{3}\b', neutral(line)))
            placeholder = [f'{alias} = select, REJECT' for alias in sorted(used)]
            out += slot('\n'.join(body), '\n'.join([*placeholder, '', *clean]))
        elif name == 'Rule':
            index = 0
            while index < len(body):
                line = body[index]
                # The input's copied MIT/AGPL rule block is kept private. A link
                # to the original author's live AI rules is published instead.
                if line.strip() == '# MIT License':
                    end = index
                    while end < len(body) and not body[end].startswith('DOMAIN,guzzoni.apple.com,'):
                        end += 1
                    if any("Sukka's Ruleset" in item for item in body[index:end]):
                        original = body[index:end]
                        removed['embedded_rule_lines'] += sum(active(item) for item in original)
                        out += slot('\n'.join(original),
                                    '# SukkaW/Surge, AGPL-3.0; referenced by URL only, rule bodies are not mirrored.\n'
                                    f'RULE-SET,{AI_URL},"AI SG",extended-matching')
                        index = end
                        continue
                index += 1
                if not active(line):
                    continue
                private_rule = '// Added for:' in line
                if line.startswith(('IP-CIDR,', 'IP-CIDR6,')):
                    try:
                        network = ipaddress.ip_network(line.split(',')[1], strict=False)
                        private_rule |= network.is_private and not network.is_multicast
                    except ValueError:
                        private_rule = True
                if line.startswith(('DOMAIN,', 'DOMAIN-SUFFIX,', 'DOMAIN-KEYWORD,')):
                    fields = [x.strip().strip('"') for x in line.split(',')]
                    if len(fields) > 2:
                        private_rule |= fields[2] in {'Automatic', 'AllServer', 'HK Experimental', 'US Experimental', 'United States'}
                        private_rule |= fields[0] == 'DOMAIN' and fields[2] == 'DIRECT' and not fields[1].endswith('.apple.com')
                private_rule |= any(not safe_url(url) for url in URL.findall(line))
                if private_rule:
                    out += slot(line)
                    removed['private_rule_lines'] += 1
                else:
                    out.append(neutral(line))
        elif name == 'MITM':
            clean = [line for line in body if active(line)
                     and not re.match(r'\s*(ca-p12|ca-passphrase)\s*=', line, re.I)]
            removed['credential_fields'] += sum(bool(re.match(r'\s*(ca-p12|ca-passphrase)\s*=', line, re.I)) for line in body)
            out += slot('\n'.join(body), '# Generate, install, and trust the CA locally; do not share it in this repository.\n' + '\n'.join(clean))
        else:
            for line in body:
                if not active(line):
                    continue
                if re.match(r'\s*(http-api|external-controller|snell-server|socks5-listener)\s*=', line, re.I):
                    out += slot(line)
                    removed['credential_fields'] += 1
                elif any(not safe_url(url) for url in URL.findall(line)):
                    # Do not guess whether an unfamiliar URL is a credential.
                    # These per-line slots keep it only in the local overlay.
                    fallback = ''
                    if line.startswith('internet-test-url'):
                        fallback = 'internet-test-url = http://www.apple.com/library/test/success.html'
                    out += slot(line, fallback)
                else:
                    out.append(neutral(line))
        out.append('')
    public.parent.mkdir(parents=True, exist_ok=True)
    public.write_text('\n'.join(out).rstrip() + '\n')
    private.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    private.touch(mode=0o600, exist_ok=True)
    private.chmod(0o600)
    private.write_text(json.dumps({'format': 1, 'slots': slots,
                                   'aliases': {v: k for k, v in aliases.items()},
                                   'source_sha256': hashlib.sha256(text.encode()).hexdigest()},
                                  ensure_ascii=False, indent=2) + '\n')
    return removed


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--public', type=Path, required=True)
    parser.add_argument('--private-overlay', type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(export(args.source, args.public, args.private_overlay), ensure_ascii=False))
