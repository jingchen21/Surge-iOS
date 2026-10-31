// PuPu Mall ad filter: splash (region 100) + home banners + search/order promos.
(function () {
  "use strict";
  var url = ($request && $request.url) || "";
  var body = $response && $response.body;
  var root;
  if (typeof body !== "string") return $done({});
  try {
    root = JSON.parse(body);
  } catch (_) {
    return $done({});
  }
  if (!root || typeof root !== "object") return $done({});
  var d = root.data,
    changed = false;
  var badTypes = [50, 100, 320, 710, 770];
  var badRegions = [30, 50, 90, 100, 320, 770];
  var badComponents = [890, 60, 2, 240, 2503];
  function o(x) {
    return x !== null && typeof x === "object" && !Array.isArray(x);
  }
  function clear(x, k) {
    if (o(x) && Array.isArray(x[k]) && x[k].length) {
      x[k] = [];
      changed = true;
    }
  }
  function ad(x) {
    return (
      o(x) &&
      (badTypes.includes(Number(x.position_type)) ||
        badRegions.includes(Number(x.region_code)) ||
        x.isAd === true ||
        x.is_ad === 1 ||
        x.is_ad === true)
    );
  }
  function clean(a) {
    if (!Array.isArray(a)) return a;
    var b = a.filter(function (x) {
      return !ad(x);
    });
    if (a.length !== b.length) changed = true;
    b.forEach(function (x) {
      if (o(x) && Number(x.region_code) === 2 && Array.isArray(x.positions)) {
        var n = x.positions.length;
        x.positions = x.positions.filter(function (p) {
          return !badComponents.includes(Number(p && p.component_code));
        });
        if (n !== x.positions.length) changed = true;
      }
    });
    return b;
  }
  function scan(x, depth) {
    if (!o(x) || depth > 3) return;
    ["bannerList", "banner_list", "banners", "list", "items", "rows", "content", "data"].forEach(
      function (k) {
        if (Array.isArray(x[k])) {
          x[k] = clean(x[k]);
          if (depth < 2) x[k].forEach(function (v) {
            scan(v, depth + 1);
          });
        } else if (o(x[k]) && depth < 2) scan(x[k], depth + 1);
      }
    );
  }
  if (/\/client\/marketing\/banner\/(?:v\d+|search_component_banner)(?:\?|$)/.test(url)) {
    if (Array.isArray(d)) root.data = clean(d);
    else if (o(d)) {
      scan(d, 0);
      clear(d, "adList");
      clear(d, "ads");
    }
  } else if (/\/client\/marketing\/advertisement\/v1(?:\?|$)/.test(url)) {
    if (Array.isArray(d)) root.data = clean(d);
    else if (o(d)) scan(d, 0);
  } else if (/\/client\/search\/hot_keywords\/v3(?:\?|$)/.test(url)) {
    if (Array.isArray(d) && d.length) {
      root.data = [];
      changed = true;
    }
  } else if (/\/client\/search\/hub\/search_box\/products\/v6(?:\?|$)/.test(url)) clear(d, "feed_banner_cards");
  else if (/\/client\/order_settlement\/detail(?:\?|$)/.test(url)) {
    if (o(d) && d.member_card_v2 != null) {
      d.member_card_v2 = {};
      changed = true;
    }
  } else if (/\/client\/order\/orders\/list\/v4(?:\?|$)/.test(url)) {
    if (Array.isArray(d))
      d.forEach(function (x) {
        if (o(x) && "just_in_time_comment" in x) {
          delete x.just_in_time_comment;
          changed = true;
        }
      });
  } else if (/\/client\/(?:app_)?resource\/resource_preload\/list_h5_resource(?:\?|$)/.test(url)) {
    if (Array.isArray(d)) {
      var n = d.length;
      root.data = d.filter(function (x) {
        return x && x.filename !== "RecommendProduct.29e31893.js";
      });
      if (n !== root.data.length) changed = true;
    }
  } else if (/\/client\/recommendation\/(?:hub\/)?interests\/products/.test(url)) {
    if (Array.isArray(d)) {
      root.data = [];
      changed = true;
    } else if (o(d)) {
      clear(d, "list");
      clear(d, "products");
      clear(d, "items");
    }
  }
  return $done(changed ? { body: JSON.stringify(root) } : {});
})();
