# 应用模块

这些是自用的独立可选模块。安装地址及所需 JS 都指向本仓库，没有把手机原始配置、节点或证书放进来。

## 安装地址

| 模块 | 原文 / Surge 模块地址 | 使用方式 |
| --- | --- | --- |
| 腾讯视频 | [TencentVideo.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/TencentVideo.sgmodule) | 单独启用，需要 MITM 和 Scripting |
| 美团 App / 小程序净化 | [Meituan.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Meituan.sgmodule) | App 与小程序在同一模块，需要 MITM、Scripting 和 Rewrite |
| 美团网络兼容 | [Meituan-Network-Compatibility.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Meituan-Network-Compatibility.sgmodule) | 可选；页面脚本不命中时再考虑与页面模块配合 |
| 滴滴出行 | [Didi.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Apps/Didi.sgmodule) | 原生 jq/Map Local，无 JS 依赖；需要 MITM 和 Rewrite |

MITM CA 仍在自己的设备本地生成、安装和信任，不随模块分发。腾讯视频有根目录入口和 `Modules/Apps/` 入口，两者内容相同，不要同时启用。原 `Modules/RoaycL/` 目录已改名，使用该旧目录地址安装的模块需替换为新地址。

## 腾讯视频

已核对 2026-10-27 17:14 的源码版本。之前保存的 JS 已经包含这次新增的暂停广告命令和信息流处理，本次没有虚构一个尚不存在的新版本；现在可从仓库内的快照离线重新生成 Surge 适配。

已保留暂停广告、前贴/中插、开屏、底栏和页面处理逻辑。模拟测试专门检查纯广告信息流可以删除，混合正常内容的模块不被整块删除；gzip、JCE 和 AB 配置仍通过二进制适配。实际当前 App 的开屏与视频广告效果未做真机证明。

## 美团

按 `12.67.403` 的八类接口整理：底栏、两种推荐流、个人中心、默认搜索词、热词推荐、AI 技能、购物车顶部横幅和启动图。另外已从历史版恢复“我的”页六类服务入口精简，并与当前版本的推荐区移除合入同一个响应处理脚本。未知接口或异常 JSON 原样放行，不改登录、支付或扫码接口。

页面模块没有 SHARK / mquic / HTTPDNS 和整组 IP 的拒绝规则。网络兼容模块会主动拦截这些通道，可能影响业务或使请求回退到其他通道；启用后需实际检查登录、下单、支付、扫码和小程序。若不正常，可单独关掉网络兼容模块排查。

参考转换中列为“未转换”的两条 URL 拦截已补入网络兼容模块。它们大多已有域名/IP 规则覆盖，但这里保留完整的规则语义。JS 已保存到本仓库，不从外部脚本地址实时加载。

完整的新旧功能逐项对照、历史文件和小程序相关处理见 [美团审查记录](MEITUAN_AUDIT.md)。原作者 README 的“真机验证”标签不代表本仓库的 Surge 转换也已经经过真机验证。

`MeiTuanNoAd.js` 的“美团相关处理”已追查到微信美团小程序的两个触发接口，并合入同一份 `Meituan.sgmodule`，无需再安装小程序模块。它处理“首页 / 神券 / 我的”、一分购及部分广告/钱包区域；相关影响与来源范围见审查记录。两个 JS 各自只匹配明确的 App 或小程序接口，未使用泛用的全域名匹配。

## 滴滴出行

保存了 16 条原始域名/IP 拦截、12 条空 JSON 返回，以及 12 条原生 jq 正文处理，涵盖个人中心、导航、推荐、行程页与钱包页面精简。原始模块没有 JS，因此这里也没有额外的运行脚本或外部依赖。

jq 语法需要 Surge iOS 5.14.0+ / Mac 5.9.0+。转换保留正常响应的原始处理语义，并在缺少 data 或表达式遇到未知结构时报错时保留原 JSON。它仍会按原规则精简部分钱包/金融入口，并包含网关和固定 IP 拦截；请实际检查叫车、行程、支付和钱包，不正常时先关闭模块。

## 检查与维护

41 组腾讯/美团模拟用例及 48 组滴滴原生 jq 用例通过。模块另经本机 Surge 离线解析；这些检查不等于真机验收。

日后继续用 AI 修改时，参见 [应用模块维护](../maintenance/apps/README.md)。所有源快照、JS 和适配工具已在仓库内保存。
