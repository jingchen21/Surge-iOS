<div align="center">

# ⚡ Surge iOS

**个人 Surge 配置 · 模块 · 分流规则**

一份结构清楚、方便查找和维护的 Surge 配置仓库。

[📥 主配置](Profiles/Surge-iPhone.conf) · [🧩 模块](Modules/README.md) · [🛣️ 分流规则](Rules/README.md) · [📜 脚本](JS/README.md)

![Stars](https://img.shields.io/github/stars/jingchen21/Surge-iOS?style=flat-square)
![Last Commit](https://img.shields.io/github/last-commit/jingchen21/Surge-iOS?style=flat-square)

</div>

## 📦 仓库内容

| 内容 | 说明 |
| --- | --- |
| [主配置](Profiles/Surge-iPhone.conf) | iPhone Surge 配置模板，包含策略组与分流规则 |
| [独立模块](Modules/README.md) | Google 重定向、应用净化等可选模块 |
| [分流规则](Rules/README.md) | 国内业务直连、Apple AI 等规则 |
| [脚本](JS/README.md) | 模块使用的 JS 文件及来源 |
| [应用模块维护](maintenance/apps/README.md) | 源文件、构建方式与检查命令 |
| [隐私说明](docs/PRIVACY.md) | 公开内容与敏感信息边界 |
| [第三方来源](THIRD_PARTY_NOTICES.md) | 作者、来源及许可记录 |

## 🚀 快速开始

1. 下载[公开配置模板](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Profiles/Surge-iPhone.conf)。
2. 在本地副本中配置自己的节点和策略组。
3. 先作为新配置导入 Surge，检查 DNS、分流及常用 App，再决定是否替换现有配置。

> **注意：** 公开模板不包含个人节点、订阅地址、证书或私密配置。LOCAL-* 等占位策略默认拒绝连接；AI 出口也需要自行配置并验证。不要把模板直接当作开箱即用的完整配置。

## 🧩 模块怎么用

- 在[模块目录](Modules/README.md)选择需要的模块。
- 按说明配置 MITM、Rewrite 或 Scripting。
- 一次只启用一个相关模块，先检查登录、支付等核心功能。
- 主配置已内置 Google 中国域名重定向；不要重复启用同功能模块。

## 🔐 隐私与安全

请勿提交节点订阅、API Token、私钥、MITM 证书、抓包或包含个人信息的日志。提交前可运行：

~~~sh
python3 scripts/check_public.py
~~~

该检查只能辅助排查，不能保证识别所有敏感信息。完整说明见[隐私文档](docs/PRIVACY.md)。

## 🙏 鸣谢与版权声明

感谢 [Surge](https://www.nssurge.com/)、规则维护者、模块作者和脚本贡献者。第三方来源与许可见[第三方来源说明](THIRD_PARTY_NOTICES.md)。

本仓库包含个人配置整理、第三方规则及模块快照。**保留原作者署名不等于已取得全部内容的再分发授权。** 本仓库不主张拥有第三方内容的版权，也不会以本仓库的许可证覆盖上游许可。请遵守各项目的许可证和作者声明；未经许可，请勿将第三方作品冒充原创或再次分发。如权利人认为存在侵权或授权问题，请通过 [Issues](https://github.com/jingchen21/Surge-iOS/issues) 联系，以便核查、修正或移除相关内容。
