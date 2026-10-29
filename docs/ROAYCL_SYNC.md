# 2026-10-27 RoaycL module sync

This document records the initial snapshot. Tencent Video was later regenerated from local source files; the relationship between current files and historical hashes is recorded in maintenance/apps/lock.json. See [App modules](APPS.md) for Tencent Video and Meituan usage and maintenance.

Source repository: [RoaycL/Surge](https://github.com/RoaycL/Surge). Pinned commit: 1e0c7bd2c3d381c31b8ee9ac766576669fe2353c, committed at 2026-10-27 20:39:56 China Standard Time.

## Scope

Four modules updated that day were organized under Modules/: Pinduoduo, Tencent Video, Weibo, and HLWXX cleanup. The Tomato Novel static module from the same upstream snapshot was also included, but is distinguished from modules changed that day.

Three JavaScript files were copied into JS/. Actual script-path references in the modules were changed to this repository's URLs; rule and JavaScript behavior was not intentionally changed. Pinduoduo uses the final version from that day and does not restore the deleted old JS.

Unrelated subscription panels, DNS control services, user profiles, and the upstream six-hour auto-sync workflow were not copied or enabled. This was a one-time snapshot sync.

## Authors and licenses

| Content | Original author / source | Handling |
| --- | --- | --- |
| Surge module conversion and Tencent adaptation | RoaycL/Surge | Commit, paths, changes, and hashes are recorded. The source repository has no repository-wide license, so this project does not claim that an overall open-source license was granted. |
| Original Pinduoduo, Tencent, and HLWXX rules or scripts | ZenmoFeiShi/Qx; original module attribution is retained | The [README](https://github.com/ZenmoFeiShi/Qx) describes learning and personal use. No standard LICENSE was found. The snapshot is retained for personal configuration use; original notices remain and no MIT license or unrestricted redistribution permission is claimed. |
| Original Weibo module and implementation | fmz200/wool_scripts, Naisi, and authors listed in the files | The upstream repository uses GPL-3.0. The [license text](../LICENSES/GPL-3.0-fmz200.txt) is included and attribution is retained; it does not override separate restrictions from other authors. |
| Part of the merged Weibo implementation | Keywos/rule | Saved in the personal snapshot with original-source comments and identified upstream notices recorded in the manifest. |
| Other merged Weibo implementations | zmqcherish/proxy-script and others | Saved as part of the merged file with source records. License terms from one source are not applied to unrelated contributors' work. |
| Tomato Novel static rules | Kelee / luestr/ProxyResource | Original author, homepage, date, and icon reference are retained. The file is preserved under [CC BY-NC-SA 4.0](../LICENSES/CC-BY-NC-SA-4.0-luestr.txt), without changing rule behavior. |

The snapshot was synced for the repository owner's personal use. Original attribution, file comments, and source records were retained. Third-party files were not relabeled as MIT-licensed tools from this repository.

## Dependency integrity

All three runtime JavaScript dependencies were copied into this repository and added to checks. No runtime script continues to load from the RoaycL repository. Multiple original Weibo scripts are included in the merged JS; their sources and input hashes are recorded in the manifest. Module icons and image URLs in responses still reference external assets and were not downloaded for redistribution.

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
