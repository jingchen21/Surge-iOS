# 美团新旧功能审查

本次以现行 `MT.js` / `MT.snippet`、历史 `MTAppAdClean.js` / `MTAppAdCleanMine.js` / `MTAppAdClean.snippet`，以及现存 `MeiTuanNoAd.js` 逐项对照。相关代码都保存在 `maintenance/apps/source/`，不依赖旧文件继续在线。

## 检查结果

| 功能 | 之前版本 | 本次处理 |
| --- | --- | --- |
| 底栏隐藏“视频 / 小团” | 已有，保留首页和“我的”的结构保护 | 保留并测试 |
| 购物车推荐流清空 | 已有 `gwc_feed1_2265` | 保留并测试 |
| 个人中心推荐流清空 | 已有 `personalcenter_2154` | 保留并测试 |
| 购物车顶部横幅清空 | 已有 `topBannerArea` | 保留并测试根层与 data 层 |
| 开屏图清空 | 已有 `startupPicArea` | 保留并测试 |
| “我的”页推荐区移除 | 已有 `mine_cross_recommend` | 保留并测试 |
| “我的”页六类服务入口精简 | 现行 MT.js 没有，历史 Mine 脚本有 | 已恢复并合并到同一 JS |
| 搜索默认词、热词与 AI 技能 | 现行 MT.js 新增 | 保留并测试 |
| SHARK、mquic、HTTPDNS 和 IP 拒绝 | 独立网络兼容模块 | 仍保持可选，未自动启用 |
| `MeiTuanNoAd.js` 的“首页 / 神券 / 我的”和一分购处理 | 引用规则藏在 WxPureDominion.snippet，属于微信美团小程序 | 已合入同一份美团模块，接口匹配仍各自收窄 |

## 补回的服务入口处理

针对 `usercenter/display` 中 `mine_serviceV3.data.newTools`，按历史版本移除以下 identification：

`xiaomeipingshen`、`meituangongyi`、`qiyefuwu`、`ruzhumeituan`、`mt_mine_myshop`、`zhaodianhuzhu`。

保留不在清单中的入口，测试中保留了订单、钱包和优惠券等示例入口；如果过滤会让整组清空，则按旧脚本的保护逻辑保留原列表。结构不符时也不强行修改。

此处理与当前脚本的“我的”页去推荐合在同一 handler。Surge 每个响应只执行首个匹配脚本，分成两个同接口脚本会导致其中一份被跳过。

## 微信美团小程序

`MeiTuanNoAd.js` 会把根 data 数组筛成“首页 / 神券 / 我的”，或移除 data.oneCentBuy。单看该 JS 没有 URL 规则，进一步搜索仓库引用后，在 `WxPureDominion.snippet` 的美团段找到了两个触发接口：`web.meituan.com/api/miniprogram/tabbar/all/query` 与 `web.meituan.com/api/miniprogram/index/aggregate`。

现已合入 `Modules/Meituan.sgmodule`，JS 仍完整存于本仓库。该段另外有六条空 JSON 返回规则，包括广告卡片、弹窗及小程序钱包区返回；按源规则保存，会影响相应区域展示。小程序部分的 MITM 只增加实际用到的 `web.meituan.com`、`mapi.dianping.com`、`npay.meituan.com` 三个主机，未搬入整份微信规则里的无关域名。

小程序与美团 App 的 `data.resource.tabArea` 处理不同，但按自用要求由同一份模块安装。每条脚本仍只匹配其明确接口，没有新增全域名匹配的泛用正文处理，也无需额外安装小程序模块。

## 来源与证据

现行代码：[ZenmoFeiShi/Qx](https://github.com/ZenmoFeiShi/Qx/tree/3e442e78e95be2c71153e55560a977ea42495f27)。历史文件对应的提交、删除记录和 SHA-256 见 [审查清单](../maintenance/apps/meituan-audit.json)。转换对照仍可参阅 [muktsoen 的 MT 模块](https://github.com/muktsoen/SurgeRules/blob/main/MT.sgmodule)。

原 README 对底栏、购物车、开屏等标注“真机验证”，对“我的”服务精简标注“仅静态检查”。这些是原作者对当时版本的说明。本仓库完成的是合成数据、语法、依赖和在线文件检查，没有据此声称当前 Surge / 美团版本已真机验收。
