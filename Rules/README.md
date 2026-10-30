# 🛣️ Routing rules

This directory contains two small rule sets for use in Surge profiles. They do not contain proxy nodes; the main profile determines the policy for each set.

> **Personal use and AI assistance:** These rules are maintained for a personal configuration. AI tools assisted with some rule organization and documentation. The lists are not official or exhaustive; verify behavior, sources, and licenses before use.

## 📂 Local rule sets

| Rule set | Purpose | Download |
| --- | --- | --- |
| Business-DIRECT.list | Domains for domestic transport, shopping, payments, banking, and verification codes; usually routed DIRECT | [Download](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Rules/Business-DIRECT.list) |
| Apple-AI.list | Apple AI, Siri, and PCC domains; use the AI policy and extended-matching | [Download](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Rules/Apple-AI.list) |

> Both rule sets are already included in the main profile. Do not add them again when using that profile.

## ⚙️ Usage notes

- Check rule order and target policies before importing these sets into another profile.
- Add extended-matching when referencing Apple-AI.list as a RULE-SET.
- Domain lists may not cover every request made by an app and do not guarantee availability for a specific region or account.
- The local rules are extracted from a personal profile; they are not official or exhaustive domain databases.
- Upstream rules are referenced by their original URLs. Follow each project's license and file headers.

## 🙏 Attribution and copyright

Thanks to the rule and data maintainers listed above and to the [Surge](https://www.nssurge.com/) community. Business-DIRECT.list and Apple-AI.list are local selections from a personal profile, not original or exhaustive domain databases.

**Attribution does not grant redistribution rights.** The repository does not claim ownership of third-party content or override upstream licenses. Follow each project's terms; do not present third-party rules as original or redistribute them without permission. For copyright or licensing concerns, open an [Issue](https://github.com/jingchen21/Surge-iOS/issues). See [third-party notices](../THIRD_PARTY_NOTICES.md) for details.
