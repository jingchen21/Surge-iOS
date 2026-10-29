<div align="center">

# ⚡ Surge iOS

**Personal Surge profile · Modules · Routing rules**

A compact, documented repository for maintaining a personal Surge setup.

[📥 Profile](Profiles/Surge-iPhone.conf) · [🧩 Modules](Modules/README.md) · [🛣️ Rules](Rules/README.md) · [📜 Scripts](JS/README.md)

![Stars](https://img.shields.io/github/stars/jingchen21/Surge-iOS?style=flat-square)
![Last Commit](https://img.shields.io/github/last-commit/jingchen21/Surge-iOS?style=flat-square)

</div>

## 🧭 Project scope

- **Personal use:** This repository is a personal configuration, backup, and maintenance project. It is not an official Surge configuration and is not guaranteed to fit other devices, networks, or accounts.
- **AI-assisted work:** AI tools have assisted with documentation, rule organization, module adaptation, code edits, and some GitHub updates.
- **Verification:** AI assistance does not mean that every change is original, authorized, or verified on a real device. Review behavior, upstream sources, and applicable licenses before use.

## 📦 Repository map

| Area | Contents |
| --- | --- |
| [Main profile](Profiles/Surge-iPhone.conf) | Public iPhone profile template with policy groups and routing rules |
| [Modules](Modules/README.md) | Optional app cleanup and utility modules |
| [Routing rules](Rules/README.md) | Local business-direct and Apple AI rule sets |
| [Scripts](JS/README.md) | JavaScript resources used by selected modules |
| [App module maintenance](maintenance/apps/README.md) | Source snapshots, build steps, and validation commands |
| [Privacy notes](docs/PRIVACY.md) | Public/private file boundaries and credential handling |
| [Third-party notices](THIRD_PARTY_NOTICES.md) | Upstream sources, authorship, and license notes |

## 🚀 Quick start

1. Download the [public profile template](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Profiles/Surge-iPhone.conf).
2. Add your own nodes and policy-group settings to a local copy.
3. Import it as a separate profile in Surge and verify DNS, routing, and essential apps before replacing an existing profile.

> **Important:** The public template contains no personal nodes, subscription URLs, certificates, or private settings. Placeholder policies such as LOCAL-* default to REJECT. Configure and verify your own AI egress before use; this is not a ready-to-run profile.

## 🧩 Using modules

- Browse the [module index](Modules/README.md) and install only what you need.
- Configure MITM, URL Rewrite, or Scripting as documented by each module.
- Enable one module at a time and check login, payments, and other critical app flows.
- The main profile already includes Google China-domain redirects. Do not enable the standalone module at the same time.

## 🔐 Privacy and security

Never commit subscription URLs, API tokens, private keys, MITM certificates, packet captures, or logs containing personal information. Run the local check before publishing:

~~~sh
python3 scripts/check_public.py
~~~

This check is a helper, not a guarantee that every secret will be detected. See [Privacy](docs/PRIVACY.md) for the full boundary.

## 🙏 Acknowledgements

This repository references and adapts work shared by the Surge community. Thanks to the maintainers of:

- **Rules and rule sets:** [SukkaW/Surge](https://github.com/SukkaW/Surge), [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script), [Hackl0us/GeoIP2-CN](https://github.com/Hackl0us/GeoIP2-CN), [KIDA-MNESIA/gadgets](https://github.com/KIDA-MNESIA/gadgets), [zxfccmm4/Profiles](https://github.com/zxfccmm4/Profiles), [Semporia/TikTok-Unlock](https://github.com/Semporia/TikTok-Unlock), and [getsomecat/GetSomeCats](https://github.com/getsomecat/GetSomeCats).
- **App modules and ports:** [ZenmoFeiShi/Qx](https://github.com/ZenmoFeiShi/Qx), [RoaycL/Surge](https://github.com/RoaycL/Surge), [fmz200/wool_scripts](https://github.com/fmz200/wool_scripts), [muktsoen/SurgeRules](https://github.com/muktsoen/SurgeRules), and [luestr/ProxyResource](https://github.com/luestr/ProxyResource).
- **Script contributors:** [Keywos/rule](https://github.com/Keywos/rule), [zmqcherish/proxy-script](https://github.com/zmqcherish/proxy-script), [ccyykk666](https://github.com/ccyykk666), and other authors credited in individual files.
- **Platform:** [Surge](https://www.nssurge.com/) for its proxy and rule-processing capabilities.

See the [rules index](Rules/README.md), [module index](Modules/README.md), [script index](JS/README.md), and [third-party notices](THIRD_PARTY_NOTICES.md) for more specific attributions.

## ⚖️ Copyright and takedown requests

This repository contains personal configuration, third-party rules, and module snapshots. **Attribution does not automatically grant permission to copy or redistribute a work.** The repository does not claim ownership of third-party content or override upstream licenses. Follow each author's license and usage terms; do not present third-party work as original or redistribute it without permission. If you are a rights holder and believe a file has an attribution, licensing, or copyright issue, please open an [Issue](https://github.com/jingchen21/Surge-iOS/issues) so it can be reviewed, corrected, or removed.
