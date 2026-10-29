# Third-party sources and attribution

Last reviewed: 2026-10-27.

This repository was organized from a Surge profile supplied by the repository owner. This notice distinguishes project references, external links, and copied rule text. A link to an upstream source does not grant permission to redistribute its contents.

## Project scope and AI assistance

This repository maintains a personal Surge profile, rules, and modules. It is not an official or universal configuration. The public repository is used for version control, backup, and discussion; publication does not mean that third-party material has been authorized for copying, modification, or redistribution.

AI tools assisted with some documentation, rule organization, module adaptation, code edits, and review. Some updates were also committed and uploaded with AI tooling. AI assistance does not mean that the content is entirely AI-original, nor does it replace code review, real-device testing, source verification, or license review. Unknown sources or unclear permissions must still be reviewed as described below.

## Sources

| Source | Review notes | Handling in this repository |
| --- | --- | --- |
| [RoaycL/Surge](https://github.com/RoaycL/Surge) | No root LICENSE file was found and the GitHub API did not identify a repository license; modules may have multiple upstream sources | The specified modules and associated JavaScript were synced on 2026-10-27 for personal use. Attribution and sources are retained in the [sync record](docs/ROAYCL_SYNC.md). The upstream scheduled workflow and services were not copied. |
| [SukkaW/Surge](https://github.com/SukkaW/Surge) / [Sukka Ruleset](https://ruleset.skk.moe) | Repository license is [AGPL-3.0](https://github.com/SukkaW/Surge/blob/master/LICENSE); AI file headers also specify AGPL-3.0. The headers of china_ip.conf and china_ip_ipv6.conf separately specify CC BY-SA 2.0. | Referenced through upstream RULE-SET / DOMAIN-SET URLs; large rule bodies are not mirrored. Follow the license for each specific file. |
| [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script) | [GPL-2.0](https://github.com/blackmatrix7/ios_rule_script/blob/master/LICENSE) | Original rule URLs are referenced; upstream scripts and rule databases are not copied. |
| [Hackl0us/GeoIP2-CN](https://github.com/Hackl0us/GeoIP2-CN) | [GPL-3.0](https://github.com/Hackl0us/GeoIP2-CN/blob/master/LICENSE) | The original GeoIP download URL is retained; no MMDB file is hosted here. |
| [KIDA-MNESIA/gadgets](https://github.com/KIDA-MNESIA/gadgets) | No root LICENSE was found; file-level redistribution permission was not confirmed | Only the original HSBC rule link is retained; the rule body is not mirrored. |
| [zxfccmm4/Profiles](https://github.com/zxfccmm4/Profiles) | No root LICENSE was found; file-level redistribution permission was not confirmed | Only the original Unbreak rule link is retained; the rule body is not mirrored. |
| [Semporia/TikTok-Unlock](https://github.com/Semporia/TikTok-Unlock) | No root LICENSE was found; file-level redistribution permission was not confirmed | Only the original TikTok rule link is retained; the rule body is not mirrored. |
| [getsomecat/GetSomeCats](https://github.com/getsomecat/GetSomeCats) | No root LICENSE was found; file-level redistribution permission was not confirmed | Only the original Sub-Store routing-rule link is retained; the Sub-Store program was not copied or deployed. |
| [lige47/QuanX-icon-rule](https://github.com/lige47/QuanX-icon-rule) | No root LICENSE was found; permission to redistribute assets was not confirmed | The 47 icon references in the original profile were removed. Icons were not downloaded or copied. |

“No root LICENSE found” is not a final determination of ownership or file-specific terms. Authors may specify conditions in individual files or other pages; users must verify them. Exact runtime URLs are listed in the [upstream manifest](upstreams/references.json).

File-level attribution is retained where present. For example, GetSomeCats' substore.list identifies zeaphyou as the author; the repository maintainer is not treated as the author of every file. The manifest records file-header notices found during review.

## Embedded rules in the original profile

The original profile contained an embedded AI rule snapshot marked AGPL-3.0 by Sukka, mixed with MIT / VPSDance notices and manual extensions. Those mixed comments do not establish that the entire section can be relicensed under MIT.

The public version does not reproduce that rule body. It references Sukka's original online AI rules instead; the match scope differs from the embedded snapshot and may change upstream. Embedded Meta/Muse sections with unverified origins were not published. The original text remains only in the owner's private local overlay for restoring the original configuration.

Before mirroring or modifying upstream rule bodies, identify the original file, version, and license; retain required copyright and license text; and comply with applicable requirements for change notices and source availability. This repository's license cannot override upstream AGPL/GPL terms or grant missing permissions.

## Standalone modules and local rule sets

Modules/Google-CN-Redirect.sgmodule separates two Google China-domain redirects from the user's profile. It does not copy third-party JavaScript.

Rules/Business-DIRECT.list and Rules/Apple-AI.list were extracted from corresponding sections of the user's profile to express this configuration's routing choices. They are not claimed as original domain databases. The original profile did not provide line-by-line provenance, and this repository does not grant a new blanket open-source license to those configuration materials.

The originally supplied profile did not contain a Script section, so the complete contents, versions, and licenses of modules installed separately on the phone could not be recovered from it. Modules mentioned in comments were not treated as source code or proof of authorization.

The statement about the missing Script section refers to the profile originally supplied by the user. RoaycL modules synced separately on 2026-10-27 do include scripts and are handled under the source and license scope in the [sync record](docs/ROAYCL_SYNC.md).

## License scope

See [LICENSE.md](LICENSE.md). The repository's documentation and tools do not imply that an original author endorses uses that have not been explicitly authorized. Authors or maintainers may open an issue to add sources, clarify license scope, or correct attribution.

## User-provided SPDB script

The user supplied pdxb.js without author attribution, public source, or license. The original file is stored in maintenance/apps/source/pdxb.js. No author is invented, and the tool's MIT license is not applied to this source. JS/pdxb.surge.js is its Surge adaptation; changes and usage are documented in [SPDB notes](docs/SPDB.md), and source attribution is also retained in code comments.

## Ctrip ad filtering and navigation experiment (2026-10-28)

- **File:** Modules/Ctrip-AdFilter.sgmodule.
- **Personal use and AI assistance:** This module is for personal use and is not an official Ctrip module. AI tools assisted with this update. End-to-end real-device verification for the current Ctrip version is pending.
- **Primary source:** [Ctrip Surge module from Naisi / fmz200/wool_scripts](https://github.com/fmz200/wool_scripts/blob/main/Surge/module/split/partX/Ctrip.sgmodule). The upstream repository uses [GPL-3.0](https://github.com/fmz200/wool_scripts/blob/main/LICENSE). Attribution, change notes, and applicable license terms are retained; this repository's license does not override upstream content.
- **Ad endpoint reference:** [AdvertisingLite Surge rules from blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script/blob/master/rewrite/Surge/AdvertisingLite/AdvertisingLite.sgmodule) were used to review public clues about the getAdsList endpoint. The module does not copy the entire rule file. The upstream repository specifies GPL-2.0; if specific rule text is ported later, file-level licensing and compatibility must be reviewed.
- **Changes:** The verified tripAds Map Local rule and ma-adx.ctrip.com block were retained. An empty-JSON response was added for getAdsList, plus an experimental getAppConfig JSON transformation that attempts to remove navigation entries labeled Community or Ask AI from common navigation arrays.
- **Navigation limitation:** The rule can work only if the matching getAppConfig response actually contains the navigation array. If the entry is hard-coded in the app, Surge cannot remove it with this rule alone. No real response sample currently proves that the endpoint contains these entries.
- **Risk and status:** getAdsList may affect some promotions or image loading; getAppConfig rewriting may affect page configuration. The module requires MITM for m.ctrip.com. Disable it immediately if login, hotel/flight search, images, orders, or payment break. The splash rule has user-reported positive results; the other new rules remain unverified.
