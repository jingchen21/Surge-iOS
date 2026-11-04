#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Static privacy regression guard for shipped Surge modules and their JavaScript.

This check is intentionally conservative: it blocks known mistakes and reports
broader risks for manual review. It is not a malware scanner or a privacy proof.
"""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCES = sorted((ROOT / "Modules").glob("*.sgmodule"))
SCRIPTS = sorted((ROOT / "JS").glob("*.js"))
SCRIPTS += sorted((ROOT / "Modules" / "Scripts").glob("*.js"))
SCRIPTS += sorted((ROOT / "Modules").glob("*.js"))
SCRIPTS += sorted((ROOT / "maintenance" / "apps" / "source").glob("*.js"))

SENSITIVE_LOG = re.compile(
    r"\bconsole\.(?:log|info|warn|error)\s*\(\s*"
    r"(?:body|data|resp_data|\$response\.body|\$request\.body|"
    r"JSON\.stringify\s*\(\s*(?:body|data|resp_data)\b)"
    r"(?=\s*[,);])"
)
DYNAMIC_EVAL = re.compile(r"\beval\s*\(|\bnew\s+Function\s*\(")
MITM_LINE = re.compile(r"^\s*hostname\s*=\s*(?:%APPEND%\s*)?(.*)$", re.I)
BODY_SCRIPT = re.compile(r"type=http-(?:request|response)", re.I)
REMOTE_SCRIPT = re.compile(r"script-path\s*=\s*(https?://[^,\s]+)", re.I)
BANNED_MITM = {"*.google.com", "*.weibo.com", "*.weibo.cn", "npay.meituan.com"}


def main():
    assert SENSITIVE_LOG.search('console.log(body);')
    assert SENSITIVE_LOG.search('console.log(JSON.stringify(data));')
    failures = []
    warnings = []
    scripts_with_body_access = 0
    main_branch_script_refs = 0
    for path in SCRIPTS:
        rel = path.relative_to(ROOT)
        for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            stripped = line.strip()
            if stripped.startswith(("//", "#", "*")):
                continue
            if SENSITIVE_LOG.search(line):
                failures.append((str(rel), n, "sensitive-payload-log"))
            if DYNAMIC_EVAL.search(line):
                failures.append((str(rel), n, "dynamic-code-evaluation"))
            if "$httpClient." in line:
                warnings.append((str(rel), n, "active-network-capability-review"))
            if "$persistentStore." in line:
                warnings.append((str(rel), n, "persistent-storage-review"))

    for path in SOURCES:
        rel = path.relative_to(ROOT)
        section = ""
        for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            stripped = line.strip()
            if not stripped or stripped.startswith(("#", ";", "//")):
                continue
            section_match = re.fullmatch(r"\[([^\]]+)\]", stripped)
            if section_match:
                section = section_match.group(1)
                continue
            if section == "MITM":
                match = MITM_LINE.match(line)
                if match:
                    for host in map(str.strip, match.group(1).split(",")):
                        if host in BANNED_MITM:
                            failures.append((str(rel), n, "unnecessary-sensitive-mitm-host"))
                        if re.match(r"^\d+(?:\.\d+)+", host) or host.startswith("*"):
                            warnings.append((str(rel), n, "broad-mitm-host-review"))
            if section == "Map Local" and r"npay\.meituan\.com" in line:
                failures.append((str(rel), n, "wallet-response-interception"))
            if section == "Script" and BODY_SCRIPT.search(line) and re.search(r"requires-body\s*=\s*(?:true|1)", line, re.I):
                scripts_with_body_access += 1
            if section == "Script":
                for url in REMOTE_SCRIPT.findall(line):
                    if "/main/" in url or "/master/" in url:
                        main_branch_script_refs += 1

    print(f"Privacy guard: modules={len(SOURCES)}, runtime_js={len(SCRIPTS)}, "
          f"body_script_rules={scripts_with_body_access}, "
          f"mutable_script_refs={main_branch_script_refs}, "
          f"manual_review_warnings={len(warnings)}, failures={len(failures)}")
    for path, line, kind in failures:
        print(f"FAIL {path}:{line} {kind}")
    for path, line, kind in warnings[:20]:
        print(f"REVIEW {path}:{line} {kind}")
    if len(warnings) > 20:
        print(f"REVIEW ... {len(warnings) - 20} additional findings suppressed")
    return int(bool(failures))


if __name__ == "__main__":
    sys.exit(main())
