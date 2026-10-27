#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Restore a local profile without uploading its private overlay anywhere."""
import argparse
import json
import re
from pathlib import Path


def render(template, overlay, output):
    repository = Path(__file__).resolve().parents[1]
    if output.resolve().is_relative_to(repository):
        raise SystemExit('Local profile must be written outside the public repository.')
    data = json.loads(overlay.read_text())
    text = template.read_text()
    def restore(match):
        key = match[1]
        if key not in data['slots']:
            raise SystemExit(f'Missing private slot: {key}')
        return data['slots'][key]
    pattern = r'^# BEGIN PRIVATE-SLOT (S\d+)\n.*?^# END PRIVATE-SLOT \1$'
    text = re.sub(pattern, restore, text, flags=re.M | re.S)
    # A restored private value might contain text that resembles an alias.
    # Only complete, comma-delimited policy names are replaced.
    for alias, original in data['aliases'].items():
        text = re.sub(r'(?<=[,=])\s*"?' + re.escape(alias) + r'"?(?=\s*[,\n]|$)',
                      lambda match: ' ' + original, text, flags=re.M)
    if re.search(r'^# (?:BEGIN|END) PRIVATE-SLOT', text, re.M):
        raise SystemExit('Unresolved private slots; no output written.')
    output.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    output.touch(mode=0o600, exist_ok=True)
    output.chmod(0o600)
    output.write_text(text)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--template', type=Path, required=True)
    parser.add_argument('--private-overlay', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    render(args.template, args.private_overlay, args.output)
    print('Local private profile written. No network request was made.')
