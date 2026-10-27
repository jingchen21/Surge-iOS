# 第三方来源与引用说明

核对日期：2026-10-27。

本仓库整理自用户提供的 Surge 配置。这里区分目录参考、外部链接和规则正文转载。链接指向作者维护的原始来源，不把链接等同于对上游内容的再许可。

## 来源

| 来源 | 核验结果 | 本仓库的处理 |
| --- | --- | --- |
| [RoaycL/Surge](https://github.com/RoaycL/Surge) | 根目录未发现 LICENSE 文件，GitHub API 未识别许可证 | 仅参考分类思路，没有复制模块、脚本、服务或工作流 |
| [SukkaW/Surge](https://github.com/SukkaW/Surge) / [Sukka Ruleset](https://ruleset.skk.moe) | 仓库 [AGPL-3.0](https://github.com/SukkaW/Surge/blob/master/LICENSE)；AI 文件头也是 AGPL 3.0；`china_ip.conf` 与 `china_ip_ipv6.conf` 文件头另标注 CC BY-SA 2.0 | 通过上游 RULE-SET / DOMAIN-SET URL 引用；不镜像大型规则正文，以具体文件条款为准 |
| [blackmatrix7/ios_rule_script](https://github.com/blackmatrix7/ios_rule_script) | [GPL-2.0](https://github.com/blackmatrix7/ios_rule_script/blob/master/LICENSE) | 通过原始规则 URL 引用，不复制上游脚本或规则库 |
| [Hackl0us/GeoIP2-CN](https://github.com/Hackl0us/GeoIP2-CN) | [GPL-3.0](https://github.com/Hackl0us/GeoIP2-CN/blob/master/LICENSE) | 保留原配置的 GeoIP 下载链接，不托管 mmdb 文件 |
| [KIDA-MNESIA/gadgets](https://github.com/KIDA-MNESIA/gadgets) | 根目录未发现 LICENSE，未确认文件级再分发授权 | 仅保留原始 HSBC 规则链接，不镜像正文 |
| [zxfccmm4/Profiles](https://github.com/zxfccmm4/Profiles) | 根目录未发现 LICENSE，未确认文件级再分发授权 | 仅保留原始 Unbreak 规则链接，不镜像正文 |
| [Semporia/TikTok-Unlock](https://github.com/Semporia/TikTok-Unlock) | 根目录未发现 LICENSE，未确认文件级再分发授权 | 仅保留原始 TikTok 规则链接，不镜像正文 |
| [getsomecat/GetSomeCats](https://github.com/getsomecat/GetSomeCats) | 根目录未发现 LICENSE，未确认文件级再分发授权 | 仅保留原始 Sub-Store 分流规则链接；没有复制或部署 Sub-Store 程序 |
| [lige47/QuanX-icon-rule](https://github.com/lige47/QuanX-icon-rule) | 根目录未发现 LICENSE，未确认素材再分发授权 | 原配置中的 47 处图标引用已移除，没有下载或转载图标 |

“根目录未发现 LICENSE”不是对文件版权归属或文件级条款的最终判断。作者可能在单独文件或其他页面说明使用条件；使用者仍应核对。详细运行时 URL 见 [引用清单](upstreams/references.json)。

文件头另有作者署名时，仍保留其归属。例如 GetSomeCats 的 `substore.list` 标注 `AUTHOR: zeaphyou`，不能把仓库维护者直接当作每个文件的原作者。引用清单记录了本次读取到的文件头声明。

## 原配置中的内嵌规则

原配置包含标注 Sukka AGPL-3.0 的 AI 规则快照，并混有 MIT / VPSDance 版权注释和其他手工扩展。仅凭这些混合注释，无法确认整段规则可以统一改用 MIT 授权。

本次公开版没有转载这段正文，而是使用 Sukka 原始 AI 规则链接；出处尚未核实的 Meta/Muse 内嵌段也没有发布。原文只保存在用户自己的本地私密覆盖文件中，以便恢复原有配置。

如果以后决定镜像或修改上游正文，应先明确原始文件、版本与许可证，保留所需版权和许可文本，并按对应许可证履行修改说明、源码提供等适用义务。不能用仓库自己的 MIT 声明覆盖上游 AGPL/GPL 或缺失的授权。

## 独立模块与本地小规则

`Modules/Google-CN-Redirect.sgmodule` 是把用户配置中的两条 Google 中国域名重定向单独整理为模块；没有复制第三方 JavaScript。

`Rules/Business-DIRECT.list` 与 `Rules/Apple-AI.list` 从用户配置的相应小段提取，用于表达本配置的分流选择，不声称是原创域名数据库。原配置未提供完整的逐行来源，仓库没有为这些配置材料重新授予整体开源许可。

本次提供的文件中没有 `[Script]` 段，无法从中恢复手机已安装模块的完整内容、版本或授权。仓库没有把配置注释中提到的模块当作已取得源码或授权。

## 许可范围

参见 [LICENSE.md](LICENSE.md)。本仓库的说明和工具不代表原作者为任何未明确授权的用途背书。作者及维护者如需补充来源、许可范围或纠正引用，可通过本仓库 issue 提出。
