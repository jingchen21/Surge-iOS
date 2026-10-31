// Baidu Tieba JSON-only ad filter. Protobuf is intentionally untouched.
(function(){
  var raw=$response&&$response.body;
  if(typeof raw!=='string'||!raw.trim().startsWith('{'))return $done({});
  var obj;try{obj=JSON.parse(raw)}catch(e){return $done({})}
  var changed=false,visited=0;
  function isAd(v){
    if(!v||typeof v!=='object'||Array.isArray(v))return false;
    if(v.is_ad===true||v.isAd===true||v.is_ad===1||v.isAd===1)return true;
    var tag=String(v.type||v.item_type||v.itemType||'').toLowerCase();
    return tag==='ad'||tag==='advertisement'||tag==='advert';
  }
  function walk(x,d){
    if(++visited>12000||d>14||!x||typeof x!=='object')return;
    if(Array.isArray(x)){for(var i=x.length-1;i>=0;i--){if(isAd(x[i])){x.splice(i,1);changed=true}else walk(x[i],d+1)}return}
    Object.keys(x).forEach(function(k){var v=x[k];
      if(/^(?:adList|ad_list|advertList|advertisementList|adItems)$/i.test(k)&&Array.isArray(v)&&v.length){x[k]=[];changed=true;return}
      walk(v,d+1);
    });
  }
  walk(obj,0);$done(changed?{body:JSON.stringify(obj)}:{});
})();
