# 独立去广告｜Surge iOS

> 个人自用、AI 辅助重写；未完成 iPhone 实机验证。所有执行脚本均存放在本仓库，不依赖 kelee.one 等第三方执行地址。

| App | 独立模块 | 作用范围 |
| --- | --- | --- |
| 小红书 | [Xiaohongshu.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/IndependentAdBlock/Xiaohongshu.sgmodule) | 开屏配置、信息流和搜索广告，保留普通笔记、直播与商品 |
| 闲鱼 | [Goofish.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/IndependentAdBlock/Goofish.sgmodule) | 开屏、首页、同城与搜索中明确广告条目，不动商品和订单 |
| 得物 | [Dewu.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/IndependentAdBlock/Dewu.sgmodule) | 广告接口中的已知广告结构，保留优惠券、商品和交易 |
| 飞猪 | [Fliggy.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/IndependentAdBlock/Fliggy.sgmodule) | 营销资源和首页显式广告，保留机票酒店及预订订单 |
| 酷安 | [Coolapk.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/IndependentAdBlock/Coolapk.sgmodule) | 赞助卡和明确广告标识，保留正常动态、评论和搜索 |
| 小红书可选 | [Xiaohongshu-Watermark-Optional.sgmodule](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/IndependentAdBlock/Xiaohongshu-Watermark-Optional.sgmodule) | 只尝试修改图片保存水印开关，不伪造下载权限与视频 URL，不保证实际去水印 |

## 使用说明

1. 关闭其他同 App 模块，开启 Surge MITM 并信任证书；仅启用需使用的模块。
2. 每次启用一个，检查开屏、首页、搜索、消息、播放、下单、付款、订单。
3. 异常时停用并提供脱敏响应。非 JSON / 异常结构不作修改。接口规则可能随 App 版本变化。
4. 小红书去水印模块需另外单独启用。视频、实况照片和服务器下载权限无法保证。

## 来源、声明与感谢

- 参考 [zirawell/R-Store](https://github.com/zirawell/R-Store)、[fmz200/wool_scripts](https://github.com/fmz200/wool_scripts)、[QingRex/LoonKissSurge](https://github.com/QingRex/LoonKissSurge) 公开规则，以及 RuCu6 酷安接口线索。
- 文件均为自主重写的保守实现，不复制上游脚本，不使用外部执行依赖，不采集用户数据。
- 各来源版权与许可归原作者；本仓库仅个人维护学习，转载或公开传播应另行核查上游许可。
