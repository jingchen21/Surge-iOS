# 🧩 Surge modules

Browse modules by purpose. Select a module link to open its Surge installation file.

> Modules must be installed manually. Modules requiring MITM need a certificate generated, installed, and trusted on your own device. This repository does not distribute certificates.
>
> **Personal use and AI assistance:** Some module documentation, organization, and adaptation were assisted by AI tools. This does not mean that every module has been verified on a real device.

## 🌐 Network and general utilities

| Module | Purpose | Requirements / notes | Install |
| --- | --- | --- | --- |
| Google CN Redirect + Endless | Redirect Google China domains to international equivalents and enable auto-pagination on search results | URL Rewrite, Script, and MITM; already included in the main profile | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Google-CN-Redirect.sgmodule) |

## 📱 App modules

| Module | Purpose | Requirements / notes | Install |
| --- | --- | --- | --- |
| Tencent Video | Handle splash, pre-roll, mid-roll, pause ads, and selected page elements | MITM and Scripting; uses Txvideoad.surge.js | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/TencentVideo.sgmodule) |
| Weibo | Handle selected ads in Weibo and its international edition | MITM and Scripting | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Weibo.sgmodule) |
| Meituan (category compatibility) | Preserve store-category loading while retaining the original page script | 41 network rules, two Rewrite rules, eight original scripts; removal of selected promotions is not guaranteed | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Meituan.sgmodule) |
| Meituan mini program | Clean navigation, promotions, and ads in the WeChat mini program | Separate module; enable only if needed | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/MeituanMiniProgram.sgmodule) |
| Dianping (targeted ad filtering) | Filter known splash and ad-shopping endpoints | Matches two paths on mapi.dianping.com; not yet verified on Dianping 11.53.14 | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/DianPing-11.53.14-Full-AdBlock.sgmodule) |
| Didi | Simplify selected profile, navigation, recommendation, and wallet elements | MITM and Rewrite; native jq requires iOS 5.14.0+ / macOS 5.9.0+ | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Didi.sgmodule) |
| Amap | Filter selected splash, home, route, search, and ride-hailing promotions | MITM, Map Local, and Body Rewrite; real-device validation is pending | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Amap-AdFilter.sgmodule) |
| Ctrip | Filter splash ads and ad-list responses; experimentally remove selected navigation entries | MITM for m.ctrip.com; latest-version behavior is not fully verified and may affect images or page configuration | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Ctrip-AdFilter.sgmodule) |
| China Mobile | Preserve initialization and remove the observed splash ad and countdown | MITM, Scripting, and Map Local; startup response decryption and signing verified, splash disappearance confirmed on iPhone 2026-10-31; see [notes](../docs/CHINAMOBILE_SPLASH.md) | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/ChinaMobile.sgmodule) |
| SPDB splash image filter | Block a splash image by its actual image dimensions | MITM and Scripting; dimensions refer to the image asset, not the phone display; see [notes](../docs/SPDB.md) | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/SPDB.sgmodule) |
| HelloBike | Port selected ad and page handling | MITM and Scripting; real-app validation is pending | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/HelloBike.sgmodule) |
| Pinduoduo | Simplify selected page layouts with native rules and body processing | MITM; native jq requires iOS 5.14.0+ / macOS 5.9.0+ | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Pinduoduo.sgmodule) |
| Tomato Novel | Filter selected splash, article, audio, floating-widget, and bottom-bar promotions | MITM | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/FanQieNovel.sgmodule) |
| Mango TV | Filter ads and unlock selected API responses | MITM and Scripting | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/MangoTV.sgmodule) |
| What Worth Buying (SMZDM) | Broad ad filtering across splash, home, deals, search, encyclopedia, detail, membership, articles, and wallet | Splash response preserves its schema and disables existing campaigns; disappearance confirmed on iPhone 2026-10-31. Some other rules may hide non-ad content | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/SMZDM-AdFilter-Complete.sgmodule) |
| HLWXX | Filter selected ad requests and page content | MITM and Scripting | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/hlwxx_remove_ads.sgmodule) |

## ⚙️ Before enabling modules

- **Tencent Video:** TencentVideo.sgmodule and TxvideoAD.sgmodule are identical. Enable only one.
- **Google redirect:** Already included in the main profile; do not install the standalone module alongside it. Auto-pagination requires MITM on www.google.com.
- **Dianping:** The module uses targeted paths only. It does not block shared image hosts, shared IPs, push traffic, or broad page-configuration endpoints. If the Meituan module is also enabled, shared domains such as shark.dianping.com and shark-dp.meituan.com may still affect Dianping traffic; module names do not isolate apps.
- **Meituan:** Enable only this repository's Meituan.sgmodule. Disable duplicate Meituan modules, older network-compatibility modules, and standalone category-IP DIRECT patches. The mini-program module can be enabled separately. Category loading passed syntax and active-profile checks, but should be retested without the old patch. Verify login, ordering, payment, and QR scanning.
- **Validation:** Offline tests do not prove that a module works with the current app version. If an issue appears, disable the most recently enabled module first.
