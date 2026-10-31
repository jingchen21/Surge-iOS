// 美团 Horn 通道适配：把观察到的 UI 接口加入 Shark blackList，绕开不透明通道。
// 目标：apimobile indexTab（底栏小团）、mop shoppingCartEntry（购物车顶部券）。
(function () {
  try {
    var body = JSON.parse($response.body);
    var entry = body && body.shark;
    if (!entry || typeof entry !== "object") {
      $done({});
      return;
    }
    var wasText = typeof entry.data === "string";
    var config = wasText ? JSON.parse(entry.data) : entry.data;
    var list = config && config.customer && config.customer.shark;
    if (!Array.isArray(list)) {
      $done({});
      return;
    }
    var changed = false;
    list.forEach(function (host) {
      if (!host || (host.host !== "apimobile.meituan.com" && host.host !== "mop.meituan.com")) return;
      if (host.blackList !== undefined && !Array.isArray(host.blackList)) return;
      var paths =
        host.host === "apimobile.meituan.com"
          ? ["/aggroup/indexTab", "/mop/entry/shoppingCartEntry"]
          : ["/mop/entry/shoppingCartEntry"];
      var blacklist = host.blackList || [];
      paths.forEach(function (path) {
        if (blacklist.indexOf(path) < 0) {
          blacklist.push(path);
          changed = true;
        }
      });
      if (changed) host.blackList = blacklist;
    });
    if (!changed) {
      $done({});
      return;
    }
    entry.data = wasText ? JSON.stringify(config) : config;
    if (typeof entry.etag === "string" && entry.etag.indexOf("-uihttp1") < 0) {
      entry.etag += "-uihttp1";
    }
    $done({ body: JSON.stringify(body) });
  } catch (error) {
    $done({});
  }
})();
