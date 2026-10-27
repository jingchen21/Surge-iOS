# Surge iOS

自用 Surge iOS 配置的公开模板、独立模块和引用清单。

保留国内业务直连、Apple 日常服务与 Apple AI 分开处理、AI 固定出口、流媒体按地区选择等结构。公开文件不包含节点、订阅链接、家庭 WireGuard、MITM 证书和个人访问例外。

**公开模板需要填入自己的节点才能使用。`LOCAL-*` 占位策略默认拒绝连接。请先保留原配置，不要直接覆盖正在使用的配置。**

[查看公开配置原文](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Profiles/Surge-iPhone.conf) · [Google 重定向模块原文](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Google-CN-Redirect.sgmodule)

## 文件

| 路径 | 用途 |
| --- | --- |
| [Profiles/Surge-iPhone.conf](Profiles/Surge-iPhone.conf) | 单文件公开模板，包含策略组与规则顺序 |
| [Modules](Modules/README.md) | 从本配置中单独整理的可选模块 |
| [Modules/RoaycL](Modules/RoaycL/README.md) | 2026-10-27 同步的去广告模块及静态番茄规则 |
| [JS](JS/README.md) | 关联 JS 与固定的外部依赖说明 |
| [Rules](Rules/README.md) | 可独立引用的国内业务和 Apple AI 规则 |
| [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) | 第三方来源、许可证与引用方式 |
| [upstreams/references.json](upstreams/references.json) | 实际引用的上游链接清单 |
| [docs/PRIVACY.md](docs/PRIVACY.md) | 公开范围与私密文件保存方式 |
| [docs/LOCAL_USE.md](docs/LOCAL_USE.md) | 本地恢复完整配置与后续维护 |
| [docs/VALIDATION.md](docs/VALIDATION.md) | 已完成的验证与实际限制 |

## 使用方式

仅查看结构：直接阅读公开模板即可。

使用自己的节点：在 Surge 本地副本中导入节点，调整 `AllServer` 与各地区组，并把 `LOCAL-*` 占位策略改为自己的节点。AI 固定组请手动选定一个长期使用的节点。地区组的正则名称需要与你的节点命名一致。

维护自己的完整配置：保留一份只在本地存放的私密覆盖文件。仓库提供本地导出和恢复工具，具体操作见 [本地使用说明](docs/LOCAL_USE.md)。工具不会把配置发送到任何服务器。

Google 中国域名重定向模块和两份独立小规则已经在主模板中内置，无需重复安装。`Modules/RoaycL/` 是另外同步的可选模块，没有自动并入主配置；[安装地址与依赖说明](Modules/RoaycL/README.md)单独列出。

## 引用与许可

本仓库最初参考 [RoaycL/Surge](https://github.com/RoaycL/Surge) 的分类思路，现另行按个人自用要求同步了其 2026-10-27 更新的指定模块和关联文件，三个运行 JS 均已保存到本仓库。来源、固定版本和原作者说明见 [同步记录](docs/ROAYCL_SYNC.md)；其他目录不因此改用同一种许可证。

第三方大型规则集通过作者原始链接引用。原配置内嵌的 AI 规则快照未随仓库转载，公开模板改用 Sukka 的上游 AI 规则链接。上游规则的范围和更新会影响匹配结果，不能把公开模板视为原配置的等价副本。

脚本工具采用 MIT 许可；配置及第三方内容的许可范围见 [LICENSE.md](LICENSE.md) 和 [第三方说明](THIRD_PARTY_NOTICES.md)。标注来源、写“自用”或“侵权联系删除”都不能替代相应授权。

## 隐私检查

提交前运行：

```sh
python3 scripts/check_public.py
```

如果本机有原始配置，建议再做一次原始凭据比对：

```sh
python3 scripts/check_public.py --source "/path/to/Surge-iPhone.conf"
```

检查只输出文件名、行号和问题类别，不输出命中的凭据。新仓库可启用本地提交检查：

```sh
git config core.hooksPath .githooks
```

GitHub Actions 会在提交后再检查一次，但不能阻止已经上传的秘密进入历史，因此本地检查仍然必要。

## 反馈

反馈问题时，只提供去除订阅链接、节点凭据、密钥、证书和个人请求数据后的最小示例。请通过 issue 补充缺失的来源或授权说明。
