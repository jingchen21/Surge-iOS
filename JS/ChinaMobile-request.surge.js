// 个人使用快照：来自 muktsoen/SurgeRules（ChinaMobile-request.js），原逻辑未改。
// 中国移动去广告：http-request 拦截（对应 Loon Rewrite 第 1 条 reject_dict(200)）。
// 5 个 biz-orange 广告/弹窗/吐司接口直接返回 200 空字典，不再发往服务端。
$done({response: {status: 200, headers: {"Content-Type": "application/json"}, body: "{}"}});
