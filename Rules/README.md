# 🛣️ 分流规则

本目录提供两份小型规则集，供其他 Surge 配置按需引用。规则集不包含节点；使用时由主配置决定策略。

> **个人自用 / AI 辅助：** 本目录规则主要服务于个人配置。部分规则整理和文档编辑使用 AI 辅助；规则并非官方完整清单，使用前请核对实际效果、来源与许可证。

## 📂 本地规则

| 规则集 | 用途 | 下载 |
| --- | --- | --- |
| Business-DIRECT.list | 国内出行、电商、支付、银行及验证码相关域名，通常指定为 DIRECT | [下载](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Rules/Business-DIRECT.list) |
| Apple-AI.list | Apple AI、Siri、PCC 相关域名；应指定 AI 策略并使用 extended-matching | [下载](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Rules/Apple-AI.list) |

> 主配置已包含这两份规则。使用主配置时无需重复添加。

## 🌐 上游规则来源

主配置还会引用其他项目维护的规则或数据。以下为主要来源，具体引用地址见[上游资源清单](../upstreams/references.json)。

| 项目 | 用途 |
| --- | --- |
| [SukkaW/Surge](https://github.com/SukkaW/Surge) | 通用分流、域名集、IP 规则及 Apple AI 等规则 |
| [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script) | 应用与服务的分类规则 |
| [Hackl0us/GeoIP2-CN](https://github.com/Hackl0us/GeoIP2-CN) | 中国 IP 地理位置数据库 |
| [KIDA-MNESIA/gadgets](https://github.com/KIDA-MNESIA/gadgets) | HSBC 相关规则 |
| [zxfccmm4/Profiles](https://github.com/zxfccmm4/Profiles) | Unbreak 规则 |
| [Semporia/TikTok-Unlock](https://github.com/Semporia/TikTok-Unlock) | TikTok 相关规则 |
| [getsomecat/GetSomeCats](https://github.com/getsomecat/GetSomeCats) | Sub-Store 相关分流规则 |

## ⚙️ 使用提示

- 在其他配置中引用前，请先检查规则顺序和目标策略。
- Apple-AI.list 作为 RULE-SET 引用时，添加 extended-matching。
- 域名列表不保证覆盖 App 的所有请求，也不保证特定地区或账号功能可用。
- 本地规则从个人配置整理，不是完整的官方域名清单。
- 上游规则通过原始地址引用；请遵守各项目的许可证和文件头声明。

## 🙏 鸣谢与版权声明

感谢以上规则与数据维护者，以及 [Surge](https://www.nssurge.com/) 社区。Business-DIRECT.list 与 Apple-AI.list 是从个人配置中整理的本地规则，不声称是完整的官方域名数据库。

**保留来源不等于获得转载或再分发授权。** 不主张拥有第三方内容的版权，也不以本仓库许可证覆盖上游许可。请遵守各项目许可证及作者声明；未经许可，请勿将第三方规则冒充原创或再次分发。如权利人认为存在侵权或授权问题，请通过 [Issues](https://github.com/jingchen21/Surge-iOS/issues) 联系，以便核查、修正或移除相关内容。完整来源与许可说明见[第三方来源说明](../THIRD_PARTY_NOTICES.md)。
