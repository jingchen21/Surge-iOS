# 应用净化模块

腾讯视频现按本地快照维护，根目录入口及美团模块见 [应用模块说明](../../docs/APPS.md)，以当前应用锁定文件和构建工具为准。

从 [RoaycL/Surge](https://github.com/RoaycL/Surge) 同步北京时间 **2026-10-27** 的更新，以提交 [`1e0c7bd`](https://github.com/RoaycL/Surge/commit/1e0c7bd2c3d381c31b8ee9ac766576669fe2353c) 为准。没有开启定时同步。

## 模块与依赖

| 模块 | 模块原文 / 导入地址 | JS 依赖 |
| --- | --- | --- |
| 拼多多页面净化 | [Pinduoduo.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Apps/Pinduoduo.sgmodule) | 无；使用原生 Body Rewrite jq 与 Map Local |
| 腾讯视频净化 | [TxvideoAD.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Apps/TxvideoAD.sgmodule) | 已同步到本仓库 `JS/Txvideoad.surge.js` |
| 微博与国际版净化 | [Weibo.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Apps/Weibo.sgmodule) | 已同步到本仓库 `JS/Weibo.surge.js` |
| 黑料页面净化 | [hlwxx_remove_ads.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Apps/hlwxx_remove_ads.sgmodule) | 已同步到本仓库 `JS/hlwxx_remove_ads.surge.js` |
| 番茄小说静态规则 | [FanQieNovel.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Apps/FanQieNovel.sgmodule) | 无；这是今天同步体系附带的静态来源，模块本体不是今天修改的 |
| 滴滴出行净化 | [Didi.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Apps/Didi.sgmodule) | 无；使用原生 jq / Map Local，输入快照已保存 |
| 美团 App / 微信小程序 | [Meituan.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Meituan.sgmodule) | App 和小程序同一模块，关联的两个 JS 都在本仓库 |

前四个模块是今天实际新增或修改的模块。拼多多已经移除旧 JS，不能再把旧 `Pinduoduo.surge.js` 当成依赖。

腾讯、微博和黑料的脚本地址均为本仓库 Raw 地址。腾讯在本地快照上进行 Surge 正文 API 适配，其他快照保留原有处理逻辑。微博的多份子脚本已嵌入合并文件，不需要再额外安装各个原始 JS。

## 个人使用快照

本目录按仓库所有者要求保存个人使用快照，原作者署名和来源注释保留。全部运行脚本均在本仓库，不依赖 RoaycL 的 `main` 分支继续提供 JS；原始来源、提交和哈希仍可追溯。

## 使用边界

这些是独立可选模块，没有自动加入主配置，也没有在 iPhone 上自动启用。请在 Surge 中按需安装，并避免同一 App 重复启用覆盖相同接口的模块。

需要正文改写的模块应开启对应 Rewrite / Scripting 能力，并在本地安装和信任自己的 MITM 证书。拼多多原生 jq 要求 Surge iOS 5.14.0+ / Mac 5.9.0+；仅域名拒绝的番茄小说不需要解密正文。

微博及番茄的图标仍引用作者的外部素材，没有转载图标文件。原作者的适用范围与使用声明继续有效，详见 [同步与授权记录](../../docs/ROAYCL_SYNC.md)。

本地依赖与哈希检查、模拟响应测试通过，不代表已经完成当前 App 版本的真机去广告验证。腾讯视频上游也未承诺解决所有开屏广告漏拦截。

目录原先为 `Modules/RoaycL/`，现统一使用 `Modules/Apps/`。已通过原目录地址安装的模块，请改用本页的新地址；腾讯视频根目录入口不受影响。
