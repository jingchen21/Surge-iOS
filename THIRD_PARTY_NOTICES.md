# 第三方来源与引用说明

核对日期：2026-10-27。

本仓库整理自用户提供的 Surge 配置。这里区分目录参考、外部链接和规则正文转载。链接指向作者维护的原始来源，不把链接等同于对上游内容的再许可。

## 项目用途与 AI 辅助说明

本仓库主要用于个人自用的 Surge 配置、规则和模块维护，并非官方方案或面向所有环境的通用配置。公开仓库用于版本管理、备份与交流；公开本身不代表第三方内容已获得转载、修改或再分发授权。

本仓库部分文档、规则整理、模块适配及代码修改使用 AI 辅助生成、编辑或核对；部分内容更新也由 AI 工具协助提交并上传到 GitHub。AI 参与不代表相关内容全部由 AI 原创，也不能替代代码审查、真机测试、来源核验或许可证审查。对于来源不明或授权未明确的内容，仍应按下文记录核查，不应因经过 AI 编辑就视为已获得授权。

## 来源

| 来源 | 核验结果 | 本仓库的处理 |
| --- | --- | --- |
| [RoaycL/Surge](https://github.com/RoaycL/Surge) | 根目录未发现 LICENSE 文件，GitHub API 未识别许可证；其模块还有多级来源 | 后续按用户个人自用要求同步 2026-10-27 指定模块及完整关联 JS；保留作者及来源，详见 [同步记录](docs/ROAYCL_SYNC.md)；没有复制其定时工作流或服务 |
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

上述“没有 `[Script]` 段”指用户最初提供的配置文件。后来单独同步的 RoaycL 模块含脚本，按 [2026-10-27 同步记录](docs/ROAYCL_SYNC.md) 的来源与许可范围处理，不能套用原配置审查结论。

## 许可范围

参见 [LICENSE.md](LICENSE.md)。本仓库的说明和工具不代表原作者为任何未明确授权的用途背书。作者及维护者如需补充来源、许可范围或纠正引用，可通过本仓库 issue 提出。

## 用户补充的浦大喜奔脚本

用户上传 `pdxb.js`，文件未提供作者署名、公开来源或许可证。原文件保存在 `maintenance/apps/source/pdxb.js`，不虚构作者归属，也不以工具的 MIT 许可覆盖其来源。`JS/pdxb.surge.js` 为其 Surge 适配，改动和使用方法见 [浦大喜奔说明](docs/SPDB.md)；来源记录同时保留在代码注释中。


## 携程去广告及导航精简实验版（2026-10-28）

- **文件：** `Modules/Ctrip-AdFilter.sgmodule`。
- **个人用途与 AI 辅助：** 该模块用于个人自用，非携程官方模块；本次扩展由 AI 辅助编辑，尚未完成携程当前版本的端到端真机验证。
- **主要来源：** [奶思 / fmz200/wool_scripts 的携程 Surge 模块](https://github.com/fmz200/wool_scripts/blob/main/Surge/module/split/partX/Ctrip.sgmodule)，上游仓库发布 [GPL-3.0](https://github.com/fmz200/wool_scripts/blob/main/LICENSE)。保留来源、修改说明及适用许可，不将本仓库许可证覆盖上游内容。
- **广告接口参考：** [blackmatrix7/ios_rule_script 的 AdvertisingLite Surge 规则](https://github.com/blackmatrix7/ios_rule_script/blob/master/rewrite/Surge/AdvertisingLite/AdvertisingLite.sgmodule) 用于核对公开的 `getAdsList` 接口线索；本模块未整体复制其规则文件。上游仓库标注 GPL-2.0，若后续直接移植其具体规则正文，应另行核对文件级许可及兼容性。
- **本次修改：** 保留已验证生效的 `tripAds` Map Local 规则和 `ma-adx.ctrip.com` 拦截；新增 `getAdsList` 空 JSON 响应；新增实验性 `getAppConfig` JSON 处理，尝试从常见导航数组中移除标签为“社区”或“问AI”的条目。
- **导航规则限制：** 只有当服务器确实通过匹配到的 `getAppConfig` 响应提供对应导航数组时，规则才可能生效；如果入口写死在 App 内，Surge 无法仅靠此规则移除。当前没有真实响应样本证明该接口包含这些入口。
- **风险与状态：** `getAdsList` 可能影响部分推广位或图片加载；`getAppConfig` 的响应改写可能影响页面配置。模块需要 MITM `m.ctrip.com`，若登录、酒店/机票搜索、图片、订单或支付异常，应立即停用。开屏规则已有用户实测反馈，其余新增规则尚待验证。
