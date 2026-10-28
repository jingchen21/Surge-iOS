# 🧩 Surge 模块

按用途查找模块。点击模块名即可打开 Surge 安装文件。

> 模块均需手动安装。需要 MITM 的模块，请在自己的设备上安装并信任个人证书；仓库不提供证书。

> **个人自用 / AI 辅助：** 本仓库主要供个人使用。部分模块说明、整理或适配使用 AI 辅助；这不代表模块已完成真机验证或已取得第三方授权。

## 🌐 网络与通用

| 模块 | 用途 | 依赖 / 说明 | 安装 |
| --- | --- | --- | --- |
| Google 中国域名重定向 | 将 Google 中国域名跳转至国际域名 | URL Rewrite、MITM；主配置已内置 | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Google-CN-Redirect.sgmodule) |

## 📱 应用模块

| 模块 | 用途 | 依赖 / 注意事项 | 安装 |
| --- | --- | --- | --- |
| 腾讯视频 | 处理开屏、贴片、暂停广告及部分页面 | MITM、Scripting；关联 Txvideoad.surge.js | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/TencentVideo.sgmodule) |
| 微博 | 处理微博及国际版部分广告 | MITM、Scripting | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Weibo.sgmodule) |
| 美团 App / 小程序 | 处理部分广告、推荐内容和页面入口 | MITM、Rewrite、Scripting | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Meituan.sgmodule) |
| 美团网络兼容（可选） | 拦截部分 SHARK、mQUIC、HTTPDNS 通道 | 可能影响登录、下单、支付、扫码；仅在需要时启用 | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Meituan-Network-Compatibility.sgmodule) |
| 滴滴出行 | 精简部分个人中心、导航、推荐和钱包页面 | MITM、Rewrite；原生 jq 需 iOS 5.14.0+ / Mac 5.9.0+ | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Didi.sgmodule) |
| 中国移动 | 处理部分页面入口、底部导航和开屏广告 | MITM、Scripting；依赖仓库内 JS | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/ChinaMobile.sgmodule) |
| 浦大喜奔 | 按图片素材实际尺寸拦截指定开屏图 | MITM、Scripting；参数是素材尺寸，不是屏幕分辨率 | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/SPDB.sgmodule) |
| 哈啰出行 | 移植部分广告与页面处理 | MITM、Scripting；尚未完成真实 App 验证 | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/HelloBike.sgmodule) |
| 拼多多 | 使用原生规则和正文处理精简页面 | MITM；原生 jq 需 iOS 5.14.0+ / Mac 5.9.0+ | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Pinduoduo.sgmodule) |
| 番茄小说 | 静态规则拦截部分广告请求 | 不需要单独配置 MITM | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/FanQieNovel.sgmodule) |
| 黑料不打烊 | 处理指定网站的部分广告请求和页面内容 | MITM、Scripting | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/hlwxx_remove_ads.sgmodule) |

## ⚙️ 使用前请确认

- **腾讯视频：** TencentVideo.sgmodule 与 TxvideoAD.sgmodule 内容相同，二选一。
- **Google 重定向：** 主配置已内置，使用主配置时无需重复安装。
- **美团网络兼容：** 不是常规去广告的必需项；启用后请检查登录、支付、扫码及小程序。
- **模块验证：** 离线测试不代表当前 App 已通过真机验证。出现问题时，先停用最近添加的模块。
- **脚本依赖：** 查看 [JS 脚本索引](../JS/README.md)；构建与检查方法见[维护说明](../maintenance/apps/README.md)。

## 🙏 模块来源鸣谢

感谢为本目录中的模块及移植提供基础的项目与作者：

- [ZenmoFeiShi/Qx](https://github.com/ZenmoFeiShi/Qx)：腾讯视频、美团及部分应用规则与处理逻辑。
- [RoaycL/Surge](https://github.com/RoaycL/Surge)：部分模块的 Surge 版本与组织方式。
- [fmz200/wool_scripts](https://github.com/fmz200/wool_scripts)：微博模块相关实现。
- [muktsoen/SurgeRules](https://github.com/muktsoen/SurgeRules) 与 [ccyykk666](https://github.com/ccyykk666)：中国移动相关脚本来源。
- [luestr/ProxyResource](https://github.com/luestr/ProxyResource)：番茄小说相关规则来源。

合并脚本中其他作者的具体归属请见[脚本索引](../JS/README.md)及各文件头注释；完整来源与许可记录见[第三方来源说明](../THIRD_PARTY_NOTICES.md)。

## ⚖️ 版权与侵权处理

本目录包含第三方模块、规则和脚本的快照或移植。**标注作者和来源不代表自动获得转载或再分发授权。** 不主张拥有第三方内容的版权，也不以本仓库许可证覆盖上游许可。请遵守原作者声明与许可证；未经许可，请勿冒充原创或再次分发。如权利人认为存在侵权或授权问题，请通过 [Issues](https://github.com/jingchen21/Surge-iOS/issues) 联系，以便核查、修正或移除相关内容。
