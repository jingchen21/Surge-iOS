// 美团 12.68.201 购物车顶部推广横幅处理（测试版）
// 基于 ZenmoFeiShi/Qx MT.js 的 topBannerArea 处理范围扩展。
// 仅针对 shoppingCartEntry；保留商品、优惠核算与结算接口。
(function () {
  const url = (typeof $request !== "undefined" && $request && $request.url) || "";
  if (!/\/mop\/entry\/shoppingCartEntry(?:\?|$)/.test(url)) {
    $done({});
    return;
  }
  const body = typeof $response !== "undefined" && $response ? $response.body : "";
  if (typeof body !== "string" || !body) {
    $done({});
    return;
  }
  let root;
  try {
    root = JSON.parse(body);
  } catch (_) {
    $done({});
    return;
  }

  const isObject = x => x !== null && typeof x === "object" && !Array.isArray(x);
  const promoText = /免费领神券|下单一省再省/;
  const areaKey = /banner|promotion|marketing|module|component|widget|area|section/i;
  const businessKey = /goods|products|cartItems|orderItems|checkout|settlement/i;
  let changed = false;
  let visited = 0;

  function isTargetPromo(value) {
    if (!isObject(value)) return false;
    try {
      const text = JSON.stringify(value);
      if (text.length > 10000 || !promoText.test(text)) return false;
      // Never remove a container which also contains the actual cart/checkout data.
      return !/"(?:goodsList|products|cartItems|orderItems|checkout|settlement)"\s*:/.test(text);
    } catch (_) {
      return false;
    }
  }

  function visit(node, depth) {
    if (depth > 15 || ++visited > 5000) return;
    if (Array.isArray(node)) {
      node.forEach(value => visit(value, depth + 1));
      return;
    }
    if (!isObject(node)) return;

    Object.keys(node).forEach(key => {
      let value = node[key];
      // Extend upstream's four fixed paths: clear topBannerArea at any nesting depth.
      if (key === "topBannerArea" && Array.isArray(value)) {
        if (value.length) {
          node[key] = [];
          changed = true;
        }
        return;
      }
      if (Array.isArray(value)) {
        if (areaKey.test(key) && !businessKey.test(key)) {
          const filtered = value.filter(entry => !isTargetPromo(entry));
          if (filtered.length !== value.length) {
            node[key] = filtered;
            value = filtered;
            changed = true;
          }
        }
        value.forEach(entry => visit(entry, depth + 1));
      } else if (isObject(value)) {
        if (/banner|promotion|marketing/i.test(key) && isTargetPromo(value)) {
          delete node[key];
          changed = true;
        } else {
          visit(value, depth + 1);
        }
      }
    });
  }

  visit(root, 0);
  $done(changed ? { body: JSON.stringify(root) } : {});
})();