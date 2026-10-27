#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Check public files without printing matched secrets.

--source enables an additional, local-only comparison with a private export.
This is a guardrail, not a universal guarantee that arbitrary input is safe.
"""
import argparse
import ipaddress
import json
import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
ALLOWED_HOSTS = {
    'github.com', 'raw.githubusercontent.com', 'ruleset.skk.moe',
    'www.apple.com', 'www.google.com', 'maps.google.com',
    'www.baidu.com', 'cp.cloudflare.com', 'dns.alidns.com',
    'cloudflare-dns.com', 'www.gstatic.com', 'connectivitycheck.gstatic.com',
}
URL = re.compile(r'https?://[^\s,\"<>]+')
KEY = re.compile(r'(?:password|passwd|psk|private-key|public-key|preshared-key|ca-p12|ca-passphrase|auth-key|token)\s*=\s*["\']?([^,\s"\'\)]+)', re.I)


def private_values(source):
    values = set()
    section = ''
    for line in source.read_text(encoding='utf-8-sig').splitlines():
        match = re.match(r'^\[([^]]+)\]', line)
        if match:
            section = match[1]
        if not line.strip() or line.lstrip().startswith(('#', ';', '//')):
            continue
        for match in KEY.finditer(line):
            if len(match[1]) >= 4:
                values.add(match[1])
        if section == 'Proxy' and '=' in line:
            name, rest = line.split('=', 1)
            values.add(name.strip())
            fields = [x.strip() for x in rest.split(',')]
            if len(fields) > 1 and fields[0] not in {'wireguard', 'tailscale'}:
                values.add(fields[1])
        if section.startswith(('WireGuard ', 'Tailscale ')):
            for match in re.finditer(r'endpoint\s*=\s*["\']?([^,\s"\'\)]+)', line, re.I):
                values.add(match[1].rsplit(':', 1)[0])
        for raw in URL.findall(line):
            parsed = urlsplit(re.sub(r'\$\d+', '', raw))
            if parsed.hostname not in ALLOWED_HOSTS or parsed.query or parsed.username:
                values.add(raw)
    return {value for value in values if len(value) >= 4}


def files(staged):
    if staged:
        result = subprocess.run(['git', 'diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR'],
                                cwd=ROOT, check=True, capture_output=True)
        return [(ROOT / name.decode(), subprocess.run(['git', 'show', ':' + name.decode()],
                  cwd=ROOT, check=True, capture_output=True).stdout)
                for name in result.stdout.split(b'\0') if name]
    return [(path, path.read_bytes()) for path in ROOT.rglob('*')
            if path.is_file() and '.git' not in path.relative_to(ROOT).parts]


def check(source=None, staged=False):
    known = private_values(source) if source else set()
    problems = []
    scanned = files(staged)
    for path, content in scanned:
        rel = path.relative_to(ROOT)
        if any(part.lower() in {'private', 'secrets', '.private', '__pycache__'} for part in rel.parts) or path.suffix in {'.p12', '.pfx', '.key', '.har', '.pcap', '.zip'} or path.name in {'overlay.json', '.env', 'Surge-iPhone.local.conf'}:
            problems.append((str(rel), 0, 'private-file-name'))
        try:
            text = content.decode('utf-8')
        except UnicodeDecodeError:
            problems.append((str(rel), 0, 'unexpected-binary'))
            continue
        if any(value in text for value in known):
            problems.append((str(rel), 0, 'matches-private-source'))
        section = ''
        for number, line in enumerate(text.splitlines(), 1):
            heading = re.fullmatch(r'\[([^]]+)\]\s*', line)
            if heading:
                section = heading[1]
            if re.search(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----', line):
                problems.append((str(rel), number, 'private-key-block'))
            if re.search(r'(?<![A-Za-z0-9+/])[A-Za-z0-9+/]{256,}={0,2}', line):
                problems.append((str(rel), number, 'long-encoded-data'))
            if path.suffix not in {'.conf', '.sgmodule', '.dconf', '.list'}:
                continue
            if not line.strip() or line.lstrip().startswith(('#', ';', '//')):
                continue
            if KEY.search(line):
                problems.append((str(rel), number, 'credential-field'))
            # URL patterns are matching expressions, not downloaded resources.
            # Keep credential checks above; inspect actual resource URLs here.
            resource_line = line
            if section == 'Script':
                resource_line = ' '.join(re.findall(r'script-path\s*=\s*([^,\s]+)', line))
            elif section == 'Map Local' or line.startswith(('http-request-jq ', 'http-response-jq ')):
                resource_line = ' '.join(line.split()[1:])
                if line.startswith(('http-request-jq ', 'http-response-jq ')):
                    resource_line = ' '.join(line.split()[2:])
            for raw in URL.findall(resource_line):
                parsed = urlsplit(re.sub(r'\$\d+', '', raw))
                if parsed.hostname not in ALLOWED_HOSTS or parsed.query or parsed.username or parsed.password:
                    problems.append((str(rel), number, 'unreviewed-url'))
            if re.match(r'^\[(WireGuard|Tailscale)\s+', line):
                problems.append((str(rel), number, 'private-tunnel-section'))
            if re.match(r'^[^#=]+\s*=\s*(trojan|ss|snell|vmess|vless|hysteria2|wireguard|tailscale)\s*,', line, re.I):
                problems.append((str(rel), number, 'proxy-definition'))
            if line.startswith(('IP-CIDR,', 'IP-CIDR6,')):
                try:
                    net = ipaddress.ip_network(line.split(',')[1], strict=False)
                    if net.is_private and not net.is_multicast:
                        problems.append((str(rel), number, 'private-network-rule'))
                except ValueError:
                    problems.append((str(rel), number, 'invalid-network'))
    print(json.dumps({'files_scanned': len(scanned), 'source_comparison': bool(source),
                      'passed': not problems,
                      'findings': [{'file': path, 'line': line, 'category': reason}
                                   for path, line, reason in problems]}, ensure_ascii=False, indent=2))
    return not problems


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path)
    parser.add_argument('--staged', action='store_true')
    args = parser.parse_args()
    sys.exit(0 if check(args.source, args.staged) else 1)
