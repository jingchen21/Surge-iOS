<div align="center">

# ⚡ Surge iOS

<p><strong>个人 Surge 配置模板、独立模块与规则索引</strong></p>

<p>
  面向 iOS / macOS Surge 使用场景，整理清晰的分流结构、可选模块、可追溯的上游来源，以及公开配置与私密配置分离的本地维护工具。
</p>

<p>
  <a href="https://github.com/jingchen21/Surge-iOS/stargazers"><img src="https://img.shields.io/github/stars/jingchen21/Surge-iOS?style=flat-square" alt="Stars"></a>
  <a href="https://github.com/jingchen21/Surge-iOS/forks"><img src="https://img.shields.io/github/forks/jingchen21/Surge-iOS?style=flat-square" alt="Forks"></a>
  <a href="https://github.com/jingchen21/Surge-iOS/issues"><img src="https://img.shields.io/github/issues/jingchen21/Surge-iOS?style=flat-square" alt="Issues"></a>
  <a href="https://github.com/jingchen21/Surge-iOS/commits/main/"><img src="https://img.shields.io/github/last-commit/jingchen21/Surge-iOS?style=flat-square" alt="Last Commit"></a>
</p>

<p>
  <a href="https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Profiles/Surge-iPhone.conf">📥 公开配置模板</a>
  · <a href="Modules/README.md">🧩 模块索引</a>
  · <a href="docs/APPS.md">📱 应用模块</a>
  · <a href="docs/LOCAL_USE.md">🛠️ 本地使用与维护</a>
</p>

</div>

---

## 项目简介

本仓库用于分享 Surge 配置的公开结构、独立模块、规则入口和维护工具。重点是**结构清晰、模块可选、来源可追溯、私密信息不随公开仓库发布**。

公开配置是经过脱敏的模板，不是包含个人节点和所有私有例外的完整运行配置。导入前请阅读下方的使用说明。

## 主要内容

| 分类 | 内容 | 入口 |
| --- | --- | --- |
| 主配置 | iPhone Surge 公开模板；包含地区策略组、Apple 服务、AI 相关策略、常用服务分流及 QUIC 策略设置 | [查看配置](Profiles/Surge-iPhone.conf) · [Raw 下载](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Profiles/Surge-iPhone.conf) |
| 独立模块 | Google 中国域名重定向、应用页面处理及其他按需安装的模块 | [模块总览](Modules/README.md) |
| 应用模块说明 | 腾讯视频、美团、浦大喜奔、滴滴等模块的入口、依赖和使用边界 | [查看说明](docs/APPS.md) |
| 独立规则 | 国内业务直连、Apple AI 等可单独引用的小规则集 | [规则索引](Rules/README.md) |
| 关联脚本 | 模块使用的 JS 文件、来源和依赖关系 | [脚本索引](JS/README.md) |
| 本地维护工具 | 公开模板导出、私密配置恢复、模块构建与检查脚本 | [本地使用说明](docs/LOCAL_USE.md) · [应用模块维护](maintenance/apps/README.md) |

## 快速开始

### 1. 先查看公开模板

- [在线查看配置文件](Profiles/Surge-iPhone.conf)
- [下载原始配置文件](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Profiles/Surge-iPhone.conf)

建议先阅读配置中的策略组和规则顺序，确认它们符合自己的使用需求。

### 2. 配置自己的节点

公开模板不包含真实节点、订阅地址、家庭 WireGuard 凭据、MITM 证书或个人访问例外。

- `LOCAL-*` 是默认指向 `REJECT` 的占位策略，**未完成本地配置前，相关代理流量不会正常连接**。
- 请在自己的本地副本中配置节点，并按节点命名调整地区策略组的正则匹配。
- `AI SG` 是 AI 相关策略组的出口入口，但公开模板中的对应占位策略默认拒绝连接；需要自行选择并验证实际的新加坡节点，不能把占位组当成已经可用的新加坡出口。
- 若使用本仓库的导出与恢复工具，请保留 `PRIVATE-SLOT` 标记，并按[本地使用与维护说明](docs/LOCAL_USE.md)操作。

### 3. 在 Surge 中单独导入测试

请先将修改后的文件作为**新的独立配置**导入，检查节点、策略组、DNS、规则命中和常用 App，再决定是否切换。不要直接覆盖正在使用的配置。

### 4. 按需安装独立模块

`Modules/` 中的模块是可选项目，**不会自动并入主配置，也不会自动在设备上启用**。主模板已内置 Google 中国域名重定向及相关小规则；使用主模板时，不要重复安装功能相同的模块或规则。

部分模块需要 Surge 的 Rewrite / Scripting 能力和 MITM。MITM 证书必须在自己的设备上生成、安装并信任；仓库不分发证书。只对确有需要的域名启用相应解密能力，并在使用后检查 App 的登录、支付和核心功能。

## 配置、模块与规则

### 主配置

- [Surge-iPhone.conf](Profiles/Surge-iPhone.conf) — 公开配置模板，包含策略组和规则结构。
- [Google-CN-Redirect.sgmodule](Modules/Google-CN-Redirect.sgmodule) — 可独立安装的 Google 中国域名重定向模块；主模板已内置相同功能。
- [Business-DIRECT.list](Rules/Business-DIRECT.list) — 国内出行、电商、支付、银行与验证码等业务域名。
- [Apple-AI.list](Rules/Apple-AI.list) — Apple AI / Siri / PCC 相关规则；独立引用时需遵照规则说明配置匹配方式。

主模板已内置上述两份小规则。独立规则主要供其他 Surge 配置按需引用，具体用法见 [Rules/README.md](Rules/README.md)。

### 应用模块

应用模块按需单独安装，入口、依赖和注意事项集中在以下文档：

- [模块完整索引](Modules/README.md)
- [应用模块安装地址与说明](docs/APPS.md)
- [模块维护、输入快照与构建方式](maintenance/apps/README.md)
- [关联 JS 与依赖清单](JS/README.md)

部分模块源自第三方项目或用户提供的快照。模拟测试、离线解析或脚本构建成功，不等于已在当前版本的 iPhone App 上完成真机验证；各模块的已知限制以对应说明为准。

## 目录导航

| 路径 | 用途 |
| --- | --- |
| [`Profiles/`](Profiles/Surge-iPhone.conf) | 公开 Surge 配置模板 |
| [`Modules/`](Modules/README.md) | 独立模块及安装索引 |
| [`Rules/`](Rules/README.md) | 独立规则集 |
| [`JS/`](JS/README.md) | 模块关联脚本及依赖说明 |
| [`docs/APPS.md`](docs/APPS.md) | 应用模块入口和使用说明 |
| [`docs/LOCAL_USE.md`](docs/LOCAL_USE.md) | 公开配置导出、私密配置恢复与本地维护 |
| [`docs/PRIVACY.md`](docs/PRIVACY.md) | 公开范围、敏感信息边界与隐私检查说明 |
| [`docs/VALIDATION.md`](docs/VALIDATION.md) | 配置检查记录、验证范围与未验证事项 |
| [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) | 上游来源、版权声明及引用方式 |
| [`LICENSE.md`](LICENSE.md) | 本仓库不同文件类别的许可范围 |
| [`upstreams/references.json`](upstreams/references.json) | 上游仓库与外部资源引用清单 |
| [`maintenance/apps/`](maintenance/apps/README.md) | 应用模块输入快照、构建与维护记录 |
| [`scripts/`](scripts) | 本地导出、恢复、构建与检查工具 |

## 隐私与安全

公开仓库不会提供完整的私人运行配置。请将以下内容保存在仓库之外：

- 原始 Surge 配置、私密覆盖文件和恢复出的本地运行配置；
- 节点信息、订阅链接、API 密钥、WireGuard / Tailscale 凭据；
- MITM 证书、抓包、运行日志及包含个人访问痕迹的数据。

提交前建议在仓库根目录运行隐私检查：

```sh
python3 scripts/check_public.py
```

如果本机有原始配置，可进一步比对：

```sh
python3 scripts/check_public.py --source "/path/to/Surge-iPhone.conf"
```

也可以启用本地提交检查：

```sh
git config core.hooksPath .githooks
```

这些检查是辅助措施，不能保证识别所有类型的敏感信息，也不能撤回已经进入 Git 历史或被他人复制的内容。若曾公开真实凭据，应先撤销或轮换相关凭据，再处理仓库历史。

详细说明见 [隐私与公开范围](docs/PRIVACY.md)。

## 验证范围

[验证记录](docs/VALIDATION.md)记录了公开主配置的离线语法检查、恢复一致性和公开资源检查情况。该记录有明确的检查范围和日期，不代表所有后续模块均已完成真机验收。

- 离线语法检查不等于在 iPhone 上实际运行。
- 模拟响应测试不等于当前 App 版本的真实业务验证。
- 上游规则、外部链接和应用接口可能发生变化；不能保证所有规则长期可用，也不能保证所有 App、账号地区功能或流媒体服务始终正常。

遇到问题时，请先提供去除订阅地址、节点凭据、密钥、证书和个人请求数据后的最小复现信息。

## 上游来源与许可

本仓库引用了第三方规则、模块和脚本。外部链接指向原始来源，不代表相关内容自动获得再分发授权。请按具体文件的作者声明与许可证使用。

- [第三方来源与引用说明](THIRD_PARTY_NOTICES.md)
- [上游资源清单](upstreams/references.json)
- [许可范围说明](LICENSE.md)

本仓库的部分维护工具采用 MIT 许可；配置、规则、应用模块和第三方脚本**不因工具采用 MIT 许可而自动适用 MIT**。公开可查看也不等于可以不受限制地复制、修改或再分发。

本 README 的信息组织参考了以下项目的配置分类与资源索引方式；本仓库实际配置、模块来源和许可范围仍以本仓库文件记录为准：

- [cc63/Surge](https://github.com/cc63/Surge)
- [1an8r0wn/Surge](https://github.com/1an8r0wn/Surge/blob/main/README_CN.md)
- [Rabbit-Spec/Surge](https://github.com/Rabbit-Spec/Surge)

## 反馈与贡献

发现链接失效、规则问题、依赖遗漏或来源信息不完整时，请通过 [GitHub Issues](https://github.com/jingchen21/Surge-iOS/issues) 反馈。

提交问题前，请删除订阅链接、节点地址与凭据、令牌、证书、个人请求参数和其他敏感信息。报告模块问题时，建议附上 Surge 版本、App 版本、对应模块名称和脱敏后的最小复现步骤。
