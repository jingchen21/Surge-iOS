
This document records the initial snapshot. Tencent Video was later regenerated from local source files; the relationship between current files and historical hashes is recorded in maintenance/apps/lock.json. See [App modules](APPS.md) for Tencent Video and Meituan usage and maintenance.


## Scope

Four modules updated that day were organized under Modules/: Pinduoduo, Tencent Video, Weibo, and HLWXX cleanup. The Tomato Novel static module from the same upstream snapshot was also included, but is distinguished from modules changed that day.

Three JavaScript files were copied into JS/. Actual script-path references in the modules were changed to this repository's URLs; rule and JavaScript behavior was not intentionally changed. Pinduoduo uses the final version from that day and does not restore the deleted old JS.

Unrelated subscription panels, DNS control services, user profiles, and the upstream six-hour auto-sync workflow were not copied or enabled. This was a one-time snapshot sync.



File-level sources, source hashes, published hashes, change notes, and external script hashes are recorded in [upstreams/roaycl-2026-10-27.json](../upstreams/roaycl-2026-10-27.json).

~~~sh
python3 scripts/check_module_dependencies.py
python3 scripts/check_module_dependencies.py --online
~~~

The default check validates local files and dependency declarations. The --online option also downloads the three published JS URLs and verifies their hashes. Unavailable or mismatched content causes an error rather than being silently skipped.

## Verification

- The five commits from that day were reviewed; the complete version after the final sync is used.
- Local file hashes and runtime JS dependencies were checked. Raw URLs and published content hashes were checked again after publication.
- The configuration sections for all five modules passed local offline Surge syntax checks when combined into a minimal profile. Three JS files passed Node syntax checks.
- Credential comparison and public-content checks passed. No personal nodes, subscriptions, or certificates were added.
- Simulated response tests passed for Pinduoduo jq, Weibo user-agent routing and response handling, HLWXX HTML/header handling, and Tencent binary splash-endpoint adaptation.
- The modules were not installed or enabled on the phone. Ad-filtering behavior in current app versions has not been verified on a real device.
