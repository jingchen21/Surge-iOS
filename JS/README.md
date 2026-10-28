# 📜 模块脚本

本目录保存模块运行所需的 JS。模块会引用本仓库中的脚本，不依赖其他仓库继续在线提供运行文件。

> **个人自用 / AI 辅助：** 本目录脚本主要用于个人配置。部分脚本适配、说明整理或修改使用 AI 辅助；请自行检查代码和实际运行效果，并核对第三方来源与许可证。

## 📂 脚本索引

| 脚本 | 对应模块 | 来源 / 说明 |
| --- | --- | --- |
| [Txvideoad.surge.js](Txvideoad.surge.js) | 腾讯视频 | 基于 ZenmoFeiShi/Qx 逻辑适配 Surge 二进制与文本正文 API |
| [Meituan.surge.js](Meituan.surge.js) | 美团 App | 基于 ZenmoFeiShi/Qx，异常或未知 JSON 结构原样放行 |
| [MeituanMiniProgram.surge.js](MeituanMiniProgram.surge.js) | 美团微信小程序 | 基于原有小程序处理逻辑，限定匹配对应接口 |
| [Weibo.surge.js](Weibo.surge.js) | 微博 | 合并多个上游脚本，来源包括 fmz200、Keywos、zmqcherish |
| [hlwxx_remove_ads.surge.js](hlwxx_remove_ads.surge.js) | 黑料不打烊 | 基于 ZenmoFeiShi/Qx 的脚本 |
| [ChinaMobile.surge.js](ChinaMobile.surge.js) | 中国移动 | 个人快照来自 muktsoen/SurgeRules；原始作者 ccyykk666 |
| [ChinaMobile-request.surge.js](ChinaMobile-request.surge.js) | 中国移动 | 请求阶段返回空字典的配套脚本 |
| [easybike.surge.js](easybike.surge.js) | 哈啰出行 | 基于 ZenmoFeiShi 的 QX 脚本移植 |
| [pdxb.surge.js](pdxb.surge.js) | 浦大喜奔 | 用户提供的脚本适配；原作者与公开来源未注明 |

## 🛠️ 修改与构建

- 应用模块的源文件和生成步骤：见[应用模块维护说明](../maintenance/apps/README.md)。
- 构建脚本：执行 python3 scripts/build_apps.py。
- 检查生成结果：执行 python3 scripts/build_apps.py --check。
- 拼多多、番茄小说和滴滴模块使用原生 Surge 规则或正文处理，不需要 JS。

请优先修改对应的源文件或转换工具，再重新生成脚本，避免改动被构建覆盖。

## 🙏 作者鸣谢与版权声明

感谢 [ZenmoFeiShi/Qx](https://github.com/ZenmoFeiShi/Qx)、[fmz200/wool_scripts](https://github.com/fmz200/wool_scripts)、[Keywos/rule](https://github.com/Keywos/rule)、[zmqcherish/proxy-script](https://github.com/zmqcherish/proxy-script)、[muktsoen/SurgeRules](https://github.com/muktsoen/SurgeRules) 及各脚本中注明的作者。

本目录包含第三方脚本快照或移植代码。**保留作者和来源不等于自动获得再分发授权。** 不主张拥有第三方脚本的版权，也不以本仓库许可证覆盖上游许可。请遵守原作者声明与许可证；未经许可，请勿冒充原创或再次分发。如权利人认为存在侵权或授权问题，请通过 [Issues](https://github.com/jingchen21/Surge-iOS/issues) 联系，以便核查、修正或移除相关内容。
