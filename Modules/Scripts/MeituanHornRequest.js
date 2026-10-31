// 美团 Horn 通道适配：清空 shark etag，强制拉取可改写的配置。
// 配合 MeituanHornResponse.js，使小团/购物车接口走可脚本的普通 HTTP。
(function () {
  try {
    var body = JSON.parse($request.body);
    if (!body || !body.shark || typeof body.shark !== "object" || Array.isArray(body.shark)) {
      $done({});
      return;
    }
    body.shark.etag = "";
    $done({ body: JSON.stringify(body) });
  } catch (error) {
    $done({});
  }
})();
