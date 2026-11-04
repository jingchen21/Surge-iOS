#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Audit every published Surge module (not just historical imported snapshots)."""
import hashlib
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
MODULES = ROOT / "Modules"
RAW = "https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/"
CATALOG = json.loads((ROOT / "maintenance/modules/catalog.json").read_text())["modules"]
ALLOWED = {"Rule", "Script", "MITM", "Map Local", "URL Rewrite", "Body Rewrite", "Header Rewrite", "Host"}
SCRIPT = re.compile(r"script-path\s*=\s*(https?://[^,\s]+)")
SECTION = re.compile(r"^\[([^\]]+)\]\s*$", re.M)
errors = []
paths = sorted(MODULES.glob("*.sgmodule"))
catalog_names = {x["file"] for x in CATALOG}
on_disk = {x.name for x in paths}
if len(CATALOG) != len(catalog_names) or catalog_names != on_disk:
    errors.append("Catalog differs from module files")
digests = {}
scripts = set()
for file in paths:
    content = file.read_text(encoding="utf-8")
    digest = hashlib.sha256(content.encode()).hexdigest()
    digests.setdefault(digest, []).append(file.name)
    if not re.search(r"^#!name\s*=\s*\S", content, re.M):
        errors.append(f"{file.name}: missing module name")
    if not re.search(r"^#!category\s*=\s*(Ad Remove|Hack VIP|Utilities)\s*$", content, re.M):
        errors.append(f"{file.name}: invalid category")
    sections = SECTION.findall(content)
    if not sections or len(set(sections)) != len(sections):
        errors.append(f"{file.name}: missing or duplicated sections")
    for section in sections:
        if section not in ALLOWED:
            errors.append(f"{file.name}: unsupported section [{section}]")
    if any(section in sections for section in ("Script", "Map Local", "URL Rewrite", "Body Rewrite")):
        if "MITM" not in sections:
            errors.append(f"{file.name}: HTTPS interception sections without MITM")
    for url in SCRIPT.findall(content):
        parsed = urlsplit(url)
        scripts.add(url)
        if parsed.hostname != "raw.githubusercontent.com":
            errors.append(f"{file.name}: runtime script must have a reviewed, self-hosted URL")
            continue
        own_root = RAW.removesuffix("main/")
        if not url.startswith(own_root):
            errors.append(f"{file.name}: unreviewed external script URL {parsed.hostname}")
            continue
        ref_and_path = url[len(own_root):]
        revision, separator, encoded_path = ref_and_path.partition("/")
        if not separator or not re.fullmatch(r"(?:main|[0-9a-f]{40})", revision):
            errors.append(f"{file.name}: script reference must be main or a full commit SHA")
            continue
        rel = unquote(encoded_path)
        target = (ROOT / rel).resolve()
        if not target.is_relative_to(ROOT) or not target.is_file():
            errors.append(f"{file.name}: missing runtime {rel}")
            continue
        if revision != "main":
            result = subprocess.run(
                ["git", "cat-file", "-e", f"{revision}:{rel}"],
                cwd=ROOT, capture_output=True, check=False
            )
            if result.returncode != 0:
                errors.append(f"{file.name}: pinned script missing at {revision}:{rel}")
    # Sanity-check that every non-comment script declaration has a pattern and path.
    for line in content.splitlines():
        line = line.strip()
        if line.startswith(("#", ";")) or not line:
            continue
        if "type=http-" in line and "script-path=" not in line:
            errors.append(f"{file.name}: script without script-path")
for group in digests.values():
    if len(group) <= 1:
        continue
    if set(group) != {"TencentVideo.sgmodule", "TxvideoAD.sgmodule"}:
        errors.append("Unexpected identical modules: " + ", ".join(group))
for item in CATALOG:
    if item.get("aliasOf"):
        if item.get("display", True):
            errors.append("Legacy alias must not be published as separate card: " + item["file"])
        elif item["file"] in on_disk and item["aliasOf"] in on_disk:
            if (MODULES/item["file"]).read_bytes() != (MODULES/item["aliasOf"]).read_bytes():
                errors.append("Alias file has diverged: " + item["file"])
if errors:
    for error in errors:
        print("ERROR:", error)
    raise SystemExit(1)
print(json.dumps({"passed": True, "modules": len(paths), "runtime_urls": len(scripts), "catalog_entries": len(CATALOG)}))
