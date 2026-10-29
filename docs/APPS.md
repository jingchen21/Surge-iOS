# App modules

These optional modules are maintained for personal use. Their installation URLs and required JavaScript point to this repository. The original phone profile, proxy nodes, and certificates are not included.

## Installation links

| Module | Surge module URL | How to use it |
| --- | --- | --- |
| Tencent Video | [TencentVideo.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/TencentVideo.sgmodule) | Enable separately; requires MITM and Scripting |
| Meituan app / mini-program cleanup | [Meituan.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Meituan.sgmodule) | App and mini-program rules are in the same module; requires MITM, Scripting, and Rewrite |
| SPDB app | [SPDB.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/SPDB.sgmodule) | Matches exact image dimensions; see [parameter and iPhone 18 Pro notes](SPDB.md) |
| Didi | [Didi.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Didi.sgmodule) | Native jq / Map Local; no JS dependency; requires MITM and Rewrite |

The former Meituan network-compatibility module is not included in the current public file set. Do not use an old installation URL unless you have a verified local copy.

Generate, install, and trust your MITM CA on your own device. It is not distributed with the modules. TencentVideo.sgmodule and TxvideoAD.sgmodule are identical; enable only one. All modules live directly in Modules/. Replace old installation URLs that pointed to a former subdirectory.

## Tencent Video

The source snapshot was checked against the version from 2026-10-27 at 17:14. The saved JavaScript already includes the pause-ad command and feed handling from that update. No nonexistent new version was invented; the Surge adaptation can be rebuilt offline from the local source snapshot.

Pause ads, pre-roll/mid-roll ads, splash ads, bottom-bar cleanup, and page handling are retained. Simulated tests verify that ad-only feed modules can be removed without deleting mixed modules containing normal content. Gzip, JCE, and AB responses remain supported by the binary-response adaptation. The current app's real-world splash and video-ad behavior has not been verified on a device.

## Meituan

The module covers eight endpoint categories based on version 12.67.403: bottom navigation, two recommendation feeds, profile page, default search terms, hot-word suggestions, AI skills, the cart banner, and the startup image. Six service-entry categories from the historical Me page have also been restored and merged with the current recommendation cleanup in one response handler. Unknown endpoints and unexpected JSON are passed through unchanged. Login, payment, and QR-code endpoints are not modified.

The page module does not reject SHARK, mquic, HTTPDNS, or entire IP groups. The optional network-compatibility module blocks these channels and may affect business functions or force requests to fall back to another channel. After enabling it, test login, ordering, payment, QR scanning, and mini-program flows. Disable that compatibility module first if problems occur.

Two URL blocks marked “not converted” in the source comparison were added to the network-compatibility module. Most were already covered by domain or IP rules, but their original semantics are retained. JavaScript is stored in this repository rather than loaded from an external script URL at runtime.

See the [Meituan audit](MEITUAN_AUDIT.md) for the old/new feature comparison, historical files, and mini-program behavior. The original author's “real-device tested” label does not mean that this Surge port has been tested on a real device.

The former MeiTuanNoAd.js handling for the Meituan WeChat mini program was traced to two trigger endpoints and merged into Modules/Meituan.sgmodule. No separate mini-program module is required. It handles the Home / Coupons / Me navigation, one-cent purchase, and selected ad/wallet areas. The two scripts match only their specific app or mini-program endpoints rather than every request on a broad domain.

## Didi

The module retains 16 original domain/IP blocks, 12 empty-JSON responses, and 12 native jq response transformations. These simplify selected profile, navigation, recommendation, trip, and wallet areas. The original module did not use JavaScript, so no additional runtime script or external dependency was introduced.

Native jq requires Surge iOS 5.14.0+ or Surge Mac 5.9.0+. The adaptation preserves the original response when data is missing or an expression encounters an unknown structure. It still simplifies selected wallet/finance entries and contains gateway and fixed-IP blocks. Test rides, trip details, payment, and wallet functions; disable the module if they fail.

## Checks and maintenance

41 Tencent/Meituan simulated cases and 48 native Didi jq cases pass. The modules also passed local offline Surge parsing. These checks are not equivalent to real-device acceptance.

For future AI-assisted changes, see [App module maintenance](../maintenance/apps/README.md). Source snapshots, JavaScript, and adaptation tools are stored in this repository.
