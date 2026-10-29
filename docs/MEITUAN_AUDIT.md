# Meituan: feature comparison and audit

This review compares the current MT.js / MT.snippet, historical MTAppAdClean.js / MTAppAdCleanMine.js / MTAppAdClean.snippet, and the existing MeiTuanNoAd.js. Related source files are stored in maintenance/apps/source/ and are not fetched from the old files at runtime.

## Results

| Feature | Previous implementation | Current handling |
| --- | --- | --- |
| Hide Video / Xiaotuan from the bottom bar | Already present, with protection for Home and Me-page structure | Retained and tested |
| Clear cart recommendation feed | Existing gwc_feed1_2265 handler | Retained and tested |
| Clear profile recommendation feed | Existing personalcenter_2154 handler | Retained and tested |
| Clear cart top banner | Existing topBannerArea handler | Retained; root and data levels tested |
| Clear startup image | Existing startupPicArea handler | Retained and tested |
| Remove recommendation section from the Me page | Existing mine_cross_recommend handler | Retained and tested |
| Simplify six service entries on the Me page | Missing from current MT.js; present in historical Mine script | Restored and merged into the same JS |
| Default search terms, hot words, and AI skills | Added in current MT.js | Retained and tested |
| SHARK, mquic, HTTPDNS, and IP blocks | Separate network-compatibility module | Still optional; not enabled automatically |
| Home / Coupons / Me navigation and one-cent purchase handling in MeiTuanNoAd.js | Rules were referenced by WxPureDominion.snippet for the Meituan WeChat mini program | Merged into the same Meituan module with endpoint-specific matching |

## Restored service-entry handling

For usercenter/display under mine_serviceV3.data.newTools, the historical implementation removes these identification values:

- xiaomeipingshen
- meituangongyi
- qiyefuwu
- ruzhumeituan
- mt_mine_myshop
- zhaodianhuzhu

Entries not in this list are retained. Tests preserve example entries for orders, wallet, and coupons. If filtering would empty the entire group, the original list is retained according to the old script's protection logic. Unknown structures are not forcibly modified.

This handling shares a response handler with the current recommendation cleanup for the Me page. Surge runs only the first matching response script for a given response, so splitting two scripts across the same endpoint could cause one to be skipped.

## Meituan WeChat mini program

MeiTuanNoAd.js filters the root data array to Home / Coupons / Me, or removes data.oneCentBuy. The JS alone did not reveal the URL rules. A repository search found two trigger endpoints in the Meituan section of WxPureDominion.snippet:

- web.meituan.com/api/miniprogram/tabbar/all/query
- web.meituan.com/api/miniprogram/index/aggregate

These handlers are now included in Modules/Meituan.sgmodule, and the JS remains stored in this repository. The section also has six empty-JSON responses for ad cards, pop-ups, and mini-program wallet areas. These preserve the source rules and can affect the corresponding UI. Mini-program MITM adds only web.meituan.com, mapi.dianping.com, and npay.meituan.com, rather than importing unrelated hosts from the full WeChat rule set.

The mini-program data.resource.tabArea handling differs from the Meituan app handler, but both are installed through one module for personal use. Each script matches only its specified endpoint. No generic response handler matching every URL on a domain was added, and no separate mini-program module is required.

## Sources and evidence

Current source: [ZenmoFeiShi/Qx](https://github.com/ZenmoFeiShi/Qx/tree/3e442e78e95be2c71153e55560a977ea42495f27). Historical commit references, deleted-file records, and SHA-256 values are in the [audit manifest](../maintenance/apps/meituan-audit.json). The [muktsoen MT module](https://github.com/muktsoen/SurgeRules/blob/main/MT.sgmodule) is another conversion reference.

The upstream README labels the bottom-bar, cart, and splash handling as real-device tested, while the historical service-entry cleanup is marked as static-check only. Those labels describe the upstream version at that time. This repository has completed synthetic-data tests, syntax checks, dependency checks, and online-file checks; it has not claimed real-device acceptance for the current Surge and Meituan versions.
