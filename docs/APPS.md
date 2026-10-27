# 腾讯视频与美团

这些是自用的独立可选模块。安装地址及所需 JS 都指向本仓库，没有把手机原始配置、节点或证书放进来。

## 安装地址

| 模块 | 原文 / Surge 模块地址 | 使用方式 |
| --- | --- | --- |
| 腾讯视频 | [TencentVideo.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/TencentVideo.sgmodule) | 单独启用，需要 MITM 和 Scripting |
| 美团页面净化 | [Meituan.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Meituan.sgmodule) | 默认先只安装这一份，需要 MITM 和 Scripting |
| 美团网络兼容 | [Meituan-Network-Compatibility.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Meituan-Network-Compatibility.sgmodule) | 可选；页面脚本不命中时再考虑与页面模块配合 |

MITM CA 仍在自己的设备本地生成、安装和信任，不随模块分发。腾讯旧模块地址继续提供相同内容，已安装旧地址的可以直接刷新；不要同时启用两个腾讯模块。

## 腾讯视频

已核对 2026-10-27 17:14 的源码版本。之前保存的 JS 已经包含这次新增的暂停广告命令和信息流处理，本次没有虚构一个尚不存在的新版本；现在可从仓库内的快照离线重新生成 Surge 适配。

已保留暂停广告、前贴/中插、开屏、底栏和页面处理逻辑。模拟测试专门检查纯广告信息流可以删除，混合正常内容的模块不被整块删除；gzip、JCE 和 AB 配置仍通过二进制适配。实际当前 App 的开屏与视频广告效果未做真机证明。

## 美团

按 `12.67.403` 的八类接口整理：底栏、两种推荐流、个人中心、默认搜索词、热词推荐、AI 技能、购物车顶部横幅和启动图。未匹配的内容、结构不符或异常 JSON 都原样放行，不改登录、支付或扫码接口。

页面模块没有 SHARK / mquic / HTTPDNS 和整组 IP 的拒绝规则。网络兼容模块会主动拦截这些通道，可能影响业务或使请求回退到其他通道；启用后需实际检查登录、下单、支付、扫码和小程序。若不正常，可单独关掉网络兼容模块排查。

参考转换中列为“未转换”的两条 URL 拦截已补入网络兼容模块。它们大多已有域名/IP 规则覆盖，但这里保留完整的规则语义。JS 已保存到本仓库，不从外部脚本地址实时加载。

## 检查与维护

35 组模拟响应/请求用例通过，包含腾讯新逻辑、二进制 API 一致性、美团八类接口及异常放行。模块另经本机 Surge 离线解析；这些检查不等于真机验收。

日后继续用 AI 修改时，参见 [应用模块维护](../maintenance/apps/README.md)。所有源快照、JS 和适配工具已在仓库内保存。
