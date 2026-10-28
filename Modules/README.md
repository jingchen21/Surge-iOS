# Surge 独立模块

本目录收录可单独安装的 Surge 模块（`.sgmodule`），按用途分类，并提供安装入口、功能说明和使用注意事项。

**所有模块均为可选项，不会自动启用。** 安装前请先阅读对应说明；部分模块需要 MITM、Rewrite 或 Scripting。应用更新后，模块效果和兼容性可能发生变化。

## 快速入口

- [应用模块详细说明](../docs/APPS.md)：功能范围、使用风险和已知限制
- [模块关联脚本](../JS/README.md)：脚本文件、来源及依赖关系
- [应用模块维护说明](../maintenance/apps/README.md)：输入快照、构建方式和检查命令
- [第三方来源与许可](../THIRD_PARTY_NOTICES.md)：作者、来源和许可范围

## 网络与通用

### Google 中国域名重定向

将 Google 中国域名重定向至对应的国际域名，并保留路径和查询参数。

- **安装：** [Google-CN-Redirect.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Google-CN-Redirect.sgmodule)
- **依赖：** URL Rewrite、MITM。
- **注意：** 主配置 `Profiles/Surge-iPhone.conf` 已内置相同功能。使用主配置时无需重复安装；其他配置可单独使用此模块。

## 应用净化

### 视频与社交

- **[腾讯视频净化](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/TencentVideo.sgmodule)**  
  处理开屏、贴片、暂停广告及部分页面内容。需要 MITM 与 Scripting；关联脚本为 [Txvideoad.surge.js](../JS/Txvideoad.surge.js)。

- **[微博与国际版净化](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Weibo.sgmodule)**  
  根据客户端 UA 处理微博相关广告内容。需要 MITM 与 Scripting；关联脚本为 [Weibo.surge.js](../JS/Weibo.surge.js)。

### 出行与生活服务

- **[美团 App / 微信小程序净化](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Meituan.sgmodule)**  
  处理部分推荐内容、广告卡片、导航及“我的”页服务入口。需要 MITM、Rewrite 与 Scripting；关联脚本见 [JS 目录](../JS/README.md)。

- **[美团网络兼容模块（可选）](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Meituan-Network-Compatibility.sgmodule)**  
  拦截部分 SHARK、mQUIC 与 HTTPDNS 通道。**这是独立的网络规则模块，不是常规去广告的必需项。** 仅在页面净化不生效且确有排查需要时考虑启用；可能影响登录、下单、支付、扫码或小程序功能。

- **[滴滴出行净化](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Didi.sgmodule)**  
  精简部分个人中心、导航、推荐和钱包页面内容。使用 Surge 原生 Body Rewrite / Map Local，不依赖 JS；需要 MITM 与 Rewrite。原生 jq 处理要求 Surge iOS 5.14.0+ 或 Surge Mac 5.9.0+。

- **[中国移动去广告](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/ChinaMobile.sgmodule)**  
  处理部分页面入口、底部导航和开屏广告。需要 MITM 与 Scripting；关联脚本见 [JS/README.md](../JS/README.md)。

- **[浦大喜奔开屏拦截](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/SPDB.sgmodule)**  
  按广告图片的实际像素尺寸拦截指定素材。需要 MITM 与 Scripting。模块参数中的宽、高是**图片素材尺寸，不是手机屏幕分辨率**；默认值为原样本尺寸，使用前请查看日志核实当前设备实际素材。

- **[哈啰出行净化](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/HelloBike.sgmodule)**  
  移植原有规则及部分页面处理，关联脚本为 [easybike.surge.js](../JS/easybike.surge.js)。需要 MITM 与 Scripting；当前转换尚未完成真实 App 环境验证，启用后请检查核心功能。

### 电商与阅读

- **[拼多多页面净化](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Pinduoduo.sgmodule)**  
  使用原生 Body Rewrite / Map Local 处理页面布局，不依赖 JS；需要 MITM。原生 jq 处理要求 Surge iOS 5.14.0+ 或 Surge Mac 5.9.0+。

- **[番茄小说去广告](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/FanQieNovel.sgmodule)**  
  通过静态域名规则拦截部分广告请求，不包含正文解密脚本，也不需要为此模块单独添加 MITM 主机。

### 网站内容处理

- **[黑料不打烊页面净化](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/hlwxx_remove_ads.sgmodule)**  
  处理指定网站的部分广告请求与页面内容。需要 MITM 与 Scripting；关联脚本为 [hlwxx_remove_ads.surge.js](../JS/hlwxx_remove_ads.surge.js)。

## 使用前请确认

1. **先安装单个模块，再验证效果。** 不建议一次性启用多个会处理相同 App 或相同请求的模块。
2. **按模块要求配置 MITM。** 需要 HTTPS 正文处理的模块，应在自己的设备上生成、安装并信任个人 MITM 证书；证书和私钥不随本仓库分发。仅为模块所需的主机启用解密。
3. **注意重复模块。** `TencentVideo.sgmodule` 与 `TxvideoAD.sgmodule` 内容相同，二选一即可，勿同时启用。主配置已内置 Google 中国域名重定向，使用主配置时也不要重复安装 Google 模块。
4. **网络兼容模块需谨慎。** 美团网络兼容模块会拦截部分网络通道；启用后应检查登录、下单、支付、扫码和小程序等核心功能。出现异常时先停用该模块排查。
5. **离线测试不等于真机验收。** 语法检查、依赖检查和模拟响应测试只能验证相应范围，不能保证当前 App 版本中的所有广告都能拦截，也不能保证所有功能完全兼容。
6. **尊重原作者声明。** 部分模块和脚本来自第三方或用户提供的快照。使用与再分发前，请查看 [第三方来源与许可说明](../THIRD_PARTY_NOTICES.md)。

## 维护与排查

- 查看各模块使用方式与风险：[docs/APPS.md](../docs/APPS.md)
- 查看脚本与模块的对应关系：[JS/README.md](../JS/README.md)
- 重新构建和检查应用模块：[maintenance/apps/README.md](../maintenance/apps/README.md)
- 检查公开文件是否包含敏感信息：在仓库根目录运行 `python3 scripts/check_public.py`

反馈问题时，请注明 Surge 版本、目标 App 版本和模块名称，并提供去除订阅地址、节点凭据、令牌、证书及个人请求数据后的最小复现信息。
