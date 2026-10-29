# 🧩 Surge modules

Browse modules by purpose. Select a module link to open its Surge installation file.

> Modules must be installed manually. Modules requiring MITM need a certificate generated, installed, and trusted on your own device. This repository does not distribute certificates.
>
> **Personal use and AI assistance:** Some module documentation, organization, and adaptation were assisted by AI tools. This does not mean that every module has been verified on a real device or that all third-party permissions have been obtained.

## 🌐 Network and general utilities

| Module | Purpose | Requirements / notes | Install |
| --- | --- | --- | --- |
| Google CN Redirect | Redirect Google China domains to their international equivalents | URL Rewrite and MITM; already included in the main profile | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Google-CN-Redirect.sgmodule) |

## 📱 App modules

The Meituan app module is adapted from [ZenmoFeiShi/Qx MT.snippet](https://github.com/ZenmoFeiShi/Qx/blob/main/MT.snippet) with a compatibility fix for store-category loading. It removes only five conflicting IP-block rules and retains the other 41 network rules, two Rewrite rules, eight original response scripts, and the original MITM scope. No standalone DIRECT override is added. See the [fix notes](../docs/MEITUAN_CLASSIFICATION_FIX.md).

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
| China Mobile | Fix invalid rewrite syntax and handle selected splash endpoints | MITM, Scripting, and Map Local; blank splash countdown still needs real-device testing; see [notes](../docs/CHINAMOBILE_SPLASH.md) | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/ChinaMobile.sgmodule) |
| SPDB splash image filter | Block a splash image by its actual image dimensions | MITM and Scripting; dimensions refer to the image asset, not the phone display; see [notes](../docs/SPDB.md) | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/SPDB.sgmodule) |
| HelloBike | Port selected ad and page handling | MITM and Scripting; real-app validation is pending | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/HelloBike.sgmodule) |
| Pinduoduo | Simplify selected page layouts with native rules and body processing | MITM; native jq requires iOS 5.14.0+ / macOS 5.9.0+ | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Pinduoduo.sgmodule) |
| Tomato Novel | Filter selected splash, article, audio, floating-widget, and bottom-bar promotions | Adapted third-party rules; review source and license notes | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/FanQieNovel.sgmodule) |
| Mango TV | Filter ads and unlock selected API responses | Adapted third-party module; review attribution and license notes in the file | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/MangoTV.sgmodule) |
| What Worth Buying (SMZDM) | Broad ad filtering across splash, home, deals, search, encyclopedia, detail, membership, articles, and wallet | Some aggressive rules may hide non-ad content; review license notes before redistribution | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/SMZDM-AdFilter-Complete.sgmodule) |
| HLWXX | Filter selected ad requests and page content | MITM and Scripting | [Install](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/hlwxx_remove_ads.sgmodule) |

## ⚙️ Before enabling modules

- **Tencent Video:** TencentVideo.sgmodule and TxvideoAD.sgmodule are identical. Enable only one.
- **Google redirect:** Already included in the main profile; do not install the standalone module alongside it.
- **Dianping:** The module uses targeted paths only. It does not block shared image hosts, shared IPs, push traffic, or broad page-configuration endpoints. If the Meituan module is also enabled, shared domains such as shark.dianping.com and shark-dp.meituan.com may still affect Dianping traffic; module names do not isolate apps.
- **Meituan:** Enable only this repository's Meituan.sgmodule. Disable duplicate Meituan modules, older network-compatibility modules, and standalone category-IP DIRECT patches. The mini-program module can be enabled separately. Category loading passed syntax and active-profile checks, but should be retested without the old patch. Verify login, ordering, payment, and QR scanning.
- **Validation:** Offline tests do not prove that a module works with the current app version. If an issue appears, disable the most recently enabled module first.
