#!/usr/bin/env python3
# SPDX-License-Identifier: MIT
"""Scheduled availability audit for upstream icons (do not mirror unlicensed artwork)."""
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
root = Path(__file__).resolve().parents[1]
items = json.loads((root/"maintenance/modules/catalog.json").read_text())["modules"]
icons = sorted({x["icon"] for x in items if x.get("icon")})
broken = []
for url in icons:
    try:
        req = Request(url, headers={"User-Agent": "Surge-iOS-icon-check"}, method="HEAD")
        try:
            with urlopen(req, timeout=12) as r:
                status = r.status
        except HTTPError as e:
            if e.code not in (403, 405):
                raise
            req = Request(url, headers={"User-Agent":"Surge-iOS-icon-check","Range":"bytes=0-0"})
            with urlopen(req, timeout=12) as r:
                status = r.status
        if status not in (200,206):
            broken.append((url, "HTTP "+str(status)))
    except (HTTPError, URLError, TimeoutError, ValueError) as e:
        broken.append((url, str(e)[:130]))
summary = ["## External app icon audit", "", "Checked "+str(len(icons))+" unique upstream icon URLs.", ""]
if broken:
    summary += ["Unavailable: "+str(len(broken)), ""]
    summary += ["- "+url+" — "+error for url,error in broken]
else:
    summary += ["All checked icons returned success."]
print("\n".join(summary))
if os.environ.get("GITHUB_STEP_SUMMARY"):
    with open(os.environ["GITHUB_STEP_SUMMARY"],"a") as f: f.write("\n".join(summary)+"\n")
if broken:
    raise SystemExit(1)
