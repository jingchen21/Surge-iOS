#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Verify the imported snapshot, its local JS files, and explicit external JS."""
import argparse
import hashlib
import json
import re
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
OWN_RAW = 'https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/'


def check(online=False):
    record = json.loads((ROOT / 'upstreams/roaycl-2026-10-27.json').read_text())
    # Updated, locally rebuilt apps supersede the historical imported snapshot.
    entries = {item['destination_path']: item for item in record['files']}
    app_lock = ROOT / 'maintenance/apps/lock.json'
    if app_lock.exists():
        for item in json.loads(app_lock.read_text())['outputs']:
            entries[item['destination_path']] = item
    external = {item['url']: item for item in record['external_runtime_dependencies']}
    dependencies = set()
    module_count = 0
    for entry in entries.values():
        path = (ROOT / entry['destination_path']).resolve()
        if not path.is_relative_to(ROOT) or not path.is_file():
            raise SystemExit('Missing or invalid snapshot file: ' + entry['destination_path'])
        if hashlib.sha256(path.read_bytes()).hexdigest() != entry['destination_sha256']:
            raise SystemExit('Snapshot hash mismatch: ' + entry['destination_path'])
        if path.suffix != '.sgmodule':
            continue
        module_count += 1
        for line in path.read_text().splitlines():
            if line.lstrip().startswith(('#', ';', '//')):
                continue
            for url in re.findall(r'script-path\s*=\s*(https://[^,\s]+)', line):
                dependencies.add(url)
                if url.startswith(OWN_RAW):
                    local = (ROOT / url[len(OWN_RAW):]).resolve()
                    if not local.is_relative_to(ROOT) or not local.is_file():
                        raise SystemExit('Missing local runtime dependency')
                elif url not in external:
                    raise SystemExit('Undeclared external runtime dependency')
    for url, entry in external.items():
        if url not in dependencies:
            raise SystemExit('Unused external runtime dependency in manifest')
    if online:
        for url in dependencies:
            with urlopen(url, timeout=30) as response:
                data = response.read()
            expected = (hashlib.sha256((ROOT / url[len(OWN_RAW):]).read_bytes()).hexdigest()
                        if url.startswith(OWN_RAW) else external[url]['sha256'])
            if hashlib.sha256(data).hexdigest() != expected:
                raise SystemExit('Published runtime hash mismatch')
    print(json.dumps({'passed': True, 'modules': module_count,
                      'unique_runtime_js': len(dependencies),
                      'local_runtime_js': sum(url.startswith(OWN_RAW) for url in dependencies),
                      'external_runtime_js': len(external), 'online_check': online}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--online', action='store_true')
    check(parser.parse_args().online)
