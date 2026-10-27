# 模块关联脚本

| 脚本 | 保存方式 |
| --- | --- |
| `Txvideoad.surge.js` | 本地快照重新生成的 Surge 二进制/文本正文适配，由腾讯视频模块引用 |
| `Meituan.surge.js` | 美团八类 JSON 页面处理，异常或未知结构原样放行 |
| `MeituanMiniProgram.surge.js` | 微信美团小程序的导航与首页处理，与 App 版本分开 |
| `hlwxx_remove_ads.surge.js` | 上游提交的原样副本，由黑料模块引用 |
| `pdxb.surge.js` | 用户提供 pdxb.js 的 Surge 转换；明确中止命中图片，可配置尺寸，只记录尺寸与结果 |
| `Weibo.surge.js` | 上游提交的原样副本，由微博模块引用；多个原始脚本已包含在该合并文件中 |
| `ChinaMobile.surge.js` | 个人快照自 muktsoen/SurgeRules；原 Loon 作者 ccyykk666，含 AES 垫片与 8 个开关，由中国移动模块引用 |
| `ChinaMobile-request.surge.js` | 个人快照自 muktsoen/SurgeRules；http-request 直接返回空字典，由中国移动模块引用 |
| `easybike.surge.js` | 哈啰出行 QX→Surge 移植个人快照；原作者 ZenmoFeiShi，含 AES/动态密钥与首页净化，由 HelloBike 模块引用 |

原作者及原始来源注释保留在文件中。这里的第三方 JS 不适用本仓库工具的 MIT 许可。

拼多多最新版使用 Surge 原生 jq/Map Local，没有遗漏 JS。番茄小说是静态规则，也没有 JS。

模块关联的实际运行 JS 都在本仓库，对应模块统一引用本仓库 Raw 地址。腾讯和美团的输入快照、生成工具及当前哈希在 [应用模块维护目录](../maintenance/apps/README.md)，其他快照及图片引用记录在 [历史清单](../upstreams/roaycl-2026-10-27.json)。滴滴使用原生 jq / Map Local，没有 JS 依赖。
