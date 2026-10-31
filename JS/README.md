# 📜 JavaScript resources

This directory contains JavaScript used by selected modules.

> **Personal use and AI assistance:** Some script adaptation, documentation, and edits were assisted by AI tools. Review the code and runtime behavior yourself.

## 📂 Script index

| Script | Used by | Notes |
| --- | --- | --- |
| [GoogleEndless.surge.js](GoogleEndless.surge.js) | Google CN Redirect | Injects Endless Google auto-pagination into search result pages |
| [Txvideoad.surge.js](Txvideoad.surge.js) | Tencent Video | Surge adaptation for binary and text response APIs |
| [MeituanMiniProgram.surge.js](MeituanMiniProgram.surge.js) | Meituan mini program | Matches specific endpoints |
| [Weibo.surge.js](Weibo.surge.js) | Weibo | Ad filtering based on user agent |
| [hlwxx_remove_ads.surge.js](hlwxx_remove_ads.surge.js) | HLWXX | Ad and page cleanup |
| [ChinaMobile.surge.js](ChinaMobile.surge.js) | China Mobile | Page and splash handling |
| [ChinaMobile-startup.surge.js](ChinaMobile-startup.surge.js) | China Mobile | Targeted encrypted startInit splash cleanup; preserves normal fields and recalculates the response signature |
| [ChinaMobile-request.surge.js](ChinaMobile-request.surge.js) | China Mobile | Companion request-stage script |
| [easybike.surge.js](easybike.surge.js) | HelloBike | API and UI handling |
| [pdxb.surge.js](pdxb.surge.js) | SPDB app | Splash image filter |

## 🛠️ Editing and building

- Source files and generation steps: [App module maintenance](../maintenance/apps/README.md).
- Build modules: python3 scripts/build_apps.py.
- Verify generated files: python3 scripts/build_apps.py --check.
- Pinduoduo, Tomato Novel, and Didi use native Surge rules or body processing and do not require a separate JS file.

Prefer editing the relevant source file or conversion tool, then rebuild. Direct edits to generated output may be overwritten.
