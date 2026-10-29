# 📜 JavaScript resources

This directory contains JavaScript used by selected modules. The Meituan app module uses the original MT.js by ZenmoFeiShi; the Meituan mini-program module uses the script stored in this repository.

> **Personal use and AI assistance:** Some script adaptation, documentation, and edits were assisted by AI tools. Review the code and runtime behavior yourself, and verify upstream sources and licenses.

## 📂 Script index

| Script | Used by | Source / notes |
| --- | --- | --- |
| [Txvideoad.surge.js](Txvideoad.surge.js) | Tencent Video | Surge adaptation of ZenmoFeiShi/Qx logic for binary and text response APIs |
| [MeituanMiniProgram.surge.js](MeituanMiniProgram.surge.js) | Meituan mini program | Uses the existing mini-program logic and matches specific endpoints |
| [Weibo.surge.js](Weibo.surge.js) | Weibo | Merges upstream scripts from fmz200, Keywos, and zmqcherish |
| [hlwxx_remove_ads.surge.js](hlwxx_remove_ads.surge.js) | HLWXX | Based on a script from ZenmoFeiShi/Qx |
| [ChinaMobile.surge.js](ChinaMobile.surge.js) | China Mobile | Personal snapshot from muktsoen/SurgeRules; original author: ccyykk666 |
| [ChinaMobile-request.surge.js](ChinaMobile-request.surge.js) | China Mobile | Companion request-stage script that returns an empty object |
| [easybike.surge.js](easybike.surge.js) | HelloBike | Port of a Quantumult X script by ZenmoFeiShi |
| [pdxb.surge.js](pdxb.surge.js) | SPDB app | Adapted from a user-provided script; the original author and public source were not identified |

## 🛠️ Editing and building

- Source files and generation steps: [App module maintenance](../maintenance/apps/README.md).
- Build modules: python3 scripts/build_apps.py.
- Verify generated files: python3 scripts/build_apps.py --check.
- Pinduoduo, Tomato Novel, and Didi use native Surge rules or body processing and do not require a separate JS file.

Prefer editing the relevant source file or conversion tool, then rebuild. Direct edits to generated output may be overwritten.

## 🙏 Attribution and copyright

Thanks to [ZenmoFeiShi/Qx](https://github.com/ZenmoFeiShi/Qx), [fmz200/wool_scripts](https://github.com/fmz200/wool_scripts), [Keywos/rule](https://github.com/Keywos/rule), [zmqcherish/proxy-script](https://github.com/zmqcherish/proxy-script), [muktsoen/SurgeRules](https://github.com/muktsoen/SurgeRules), and the authors credited in each script.

This directory contains third-party snapshots and adapted code. **Keeping attribution does not automatically grant redistribution rights.** The repository does not claim ownership of third-party scripts or override upstream licenses. Follow the original author's terms; do not pass third-party code off as original or redistribute it without permission. For licensing or copyright concerns, open an [Issue](https://github.com/jingchen21/Surge-iOS/issues) for review.
