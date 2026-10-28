# 🧩 Surge 模块

按用途查找模块。点击模块名即可打开 Surge 安装文件。

> 模块均需手动安装。需要 MITM 的模块，请在自己的设备上安装并信任个人证书；仓库不提供证书。

> **个人自用 / AI 辅助：** 本仓库主要供个人使用。部分模块说明、整理或适配使用 AI 辅助；这不代表模块已完成真机验证或已取得第三方授权。

## 🌐 网络与通用

| 模块 | 用途 | 依赖 / 说明 | 安装 |
| --- | --- | --- | --- |
| Google 中国域名重定向 | 将 Google 中国域名跳转至国际域名 | URL Rewrite、MITM；主配置已内置 | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Google-CN-Redirect.sgmodule) |

## 📱 应用模块

**美团 App 基于 [ZenmoFeiShi/Qx 的 MT.snippet](https://github.com/ZenmoFeiShi/Qx/blob/main/MT.snippet) 转换并做分类加载兼容修复**：仅移除五条冲突 IP 拦截，保留其余 41 条网络规则、2 条 Rewrite、8 条原作者脚本及 MITM 范围；不添加独立 DIRECT 补丁。原始快照保留，微信小程序独立安装。[修复范围及验证状态](../docs/MEITUAN_CLASSIFICATION_FIX.md)。

| 模块 | 用途 | 依赖 / 注意事项 | 安装 |
| --- | --- | --- | --- |
| 腾讯视频 | 处理开屏、贴片、暂停广告及部分页面 | MITM、Scripting；关联 Txvideoad.surge.js | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/TencentVideo.sgmodule) |
| 微博 | 处理微博及国际版部分广告 | MITM、Scripting | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Weibo.sgmodule) |
| 美团 App（分类兼容修复） | 优先保留店铺分类加载；沿用原作者页面脚本 | 41 条网络规则、2 条 Rewrite、8 条原作者脚本；不保证小团与优惠券去除效果 | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Meituan.sgmodule) |
| 美团微信小程序 | 微信里的美团小程序导航与广告清理 | 独立模块，按需启用 | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/MeituanMiniProgram.sgmodule) |
| 大众点评（精准去广告） | 过滤已知开屏和广告购物接口 | 仅匹配 `mapi.dianping.com` 两条路径；减少共享域名与正常资源误拦截，待 11.53.14 真机验证 | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/DianPing-11.53.14-Full-AdBlock.sgmodule) |
| 滴滴出行 | 精简部分个人中心、导航、推荐和钱包页面 | MITM、Rewrite；原生 jq 需 iOS 5.14.0+ / Mac 5.9.0+ | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Didi.sgmodule) |
| 高德地图 | 过滤开屏、首页、路线、搜索和打车页面的部分推广内容 | MITM、Map Local、Body Rewrite；尚未完成真机验证 | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Amap-AdFilter.sgmodule) |
| 携程旅行 | 开屏广告过滤、广告列表处理，并实验性隐藏“社区”“问AI”导航项 | 需 MITM `m.ctrip.com`；`getAdsList` / `getAppConfig` 规则未完成最新版真机验证，可能影响图片或页面配置 | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Ctrip-AdFilter.sgmodule) |
| 中国移动（Surge 语法修复） | 处理部分页面入口、底部导航和已列出的开屏接口 | MITM、Scripting、Map Local；已修正 15 条无效重写，空白开屏倒计时尚待验证，[说明](../docs/CHINAMOBILE_SPLASH.md) | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/ChinaMobile.sgmodule) |
| 浦大喜奔 | 按图片素材实际尺寸拦截指定开屏图 | MITM、Scripting；参数是素材尺寸，不是屏幕分辨率 | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/SPDB.sgmodule) |
| 哈啰出行 | 移植部分广告与页面处理 | MITM、Scripting；尚未完成真实 App 验证 | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/HelloBike.sgmodule) |
| 拼多多 | 使用原生规则和正文处理精简页面 | MITM；原生 jq 需 iOS 5.14.0+ / Mac 5.9.0+ | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Pinduoduo.sgmodule) |
| 番茄小说 | 静态规则拦截部分广告请求 | 不需要单独配置 MITM | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/FanQieNovel.sgmodule) |
| 黑料不打烊 | 处理指定网站的部分广告请求和页面内容 | MITM、Scripting | [安装](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/hlwxx_remove_ads.sgmodule) |

## ⚙️ 使用前请确认

- **腾讯视频：** TencentVideo.sgmodule 与 TxvideoAD.sgmodule 内容相同，二选一。
- **Google 重定向：** 主配置已内置，使用主配置时无需重复安装。
- **大众点评：** 已从全量版调整为精准版；沿用原安装地址。规则只处理两个已知广告路径，不再拦截共用图片、IP、推送与大范围 MITM。若同时使用美团模块，请注意美团规则中的 `shark.dianping.com`、`shark-dp.meituan.com` 仍可能影响点评通信，模块名称不等于 App 隔离。
- **美团模块切换：** Surge 只启用本仓库 `Meituan.sgmodule`，停用旧「美团网络兼容」、重复美团模块及独立分类 IP 直连补丁；小程序模块独立启用。分类兼容版已通过语法及手机实际配置检查，移除独立补丁后的店铺分类体验仍待复测；登录、下单、支付和扫码也需自行确认。
- **模块验证：** 离线测试不代表当前 App 已通过真机验证。出现问题时，先停用最近添加的模块。
- **脚本依赖：** 查看 [JS 脚本索引](../JS/README.md)；构建与检查方法见[维护说明](../maintenance/apps/README.md)。

## 🙏 模块来源鸣谢

感谢为本目录中的模块及移植提供基础的项目与作者：

- [ZenmoFeiShi/Qx](https://github.com/ZenmoFeiShi/Qx)：腾讯视频、美团及部分应用规则与处理逻辑。
- [RoaycL/Surge](https://github.com/RoaycL/Surge)：部分模块的 Surge 版本与组织方式。
- [fmz200/wool_scripts](https://github.com/fmz200/wool_scripts)：微博模块相关实现及携程去广告规则参考；感谢原模块维护者奶思。
- [muktsoen/SurgeRules](https://github.com/muktsoen/SurgeRules) 与 [ccyykk666](https://github.com/ccyykk666)：中国移动相关脚本来源。
- [luestr/ProxyResource](https://github.com/luestr/ProxyResource)：番茄小说相关规则来源。

合并脚本中其他作者的具体归属请见[脚本索引](../JS/README.md)及各文件头注释；完整来源与许可记录见[第三方来源说明](../THIRD_PARTY_NOTICES.md)。

## ⚖️ 版权与侵权处理

本目录包含第三方模块、规则和脚本的快照或移植。**标注作者和来源不代表自动获得转载或再分发授权。** 不主张拥有第三方内容的版权，也不以本仓库许可证覆盖上游许可。请遵守原作者声明与许可证；未经许可，请勿冒充原创或再次分发。如权利人认为存在侵权或授权问题，请通过 [Issues](https://github.com/jingchen21/Surge-iOS/issues) 联系，以便核查、修正或移除相关内容。
