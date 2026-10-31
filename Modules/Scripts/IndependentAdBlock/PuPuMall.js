// PuPuMall marketing JSON cleaner; deliberately does not touch order discounts.
(function(){
  var raw=$response && $response.body,url=$request && $request.url || '';
  if(typeof raw!=='string')return $done({});
  var obj;try{obj=JSON.parse(raw)}catch(e){return $done({})}
  var target=/\/client\/(?:marketing\/(?:banner\/v7|banner\/search_component_banner|advertisement\/v1)|search\/hot_keywords\/v3)/.test(url);
  if(!target)return $done({});
  var changed=false;
  function clean(node,depth){
    if(!node||typeof node!=='object'||depth>7)return;
    if(Array.isArray(node)){node.forEach(function(v){clean(v,depth+1)});return}
    Object.keys(node).forEach(function(k){var v=node[k];
      if(/^(?:advertisement|adList|ad_list|bannerList|banner_list|hotKeywords|hot_keywords)$/i.test(k) && Array.isArray(v) && v.length){node[k]=[];changed=true;return}
      if(/(?:\/marketing\/banner\/|\/marketing\/advertisement\/)/.test(url) && /^(?:banners|banner|items)$/i.test(k) && Array.isArray(v) && v.length){node[k]=[];changed=true;return}
      clean(v,depth+1);
    });
  }
  clean(obj,0);
  $done(changed?{body:JSON.stringify(obj)}:{});
})();
