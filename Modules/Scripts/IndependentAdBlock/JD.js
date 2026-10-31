// Jingdong limited JSON sanitizer. No base64-protocol decoder is included.
(function () {
  var raw=$response && $response.body, url=$request && $request.url || '';
  if(typeof raw!=='string' || !raw.trim().startsWith('{')) return $done({});
  var m=url.match(/[?&]functionId=([^&]+)/), fid=m?decodeURIComponent(m[1]):'';
  if(!/^(start|startup|welcomeHome|deliverLayer|getTabHomeInfo|myOrderInfo|orderTrackBusiness|personinfoBusiness)$/.test(fid))return $done({});
  var obj;try{obj=JSON.parse(raw)}catch(e){return $done({})}
  var changed=false;
  function walk(x,depth){
    if(depth>8 || !x || typeof x!=='object')return;
    if(Array.isArray(x)){for(var i=x.length-1;i>=0;i--){
      var v=x[i],kind=v && typeof v==='object' ? String(v.type||v.floorType||v.templateType||'').toLowerCase() : '';
      if(v && typeof v==='object' && (v.isAd===true || v.isAdvert===true || /^(ad|advert|advertisement)$/.test(kind))){x.splice(i,1);changed=true}else walk(v,depth+1);
    }return}
    Object.keys(x).forEach(function(k){var v=x[k];
      if(/^(adList|advertList|splashAdList|advertisementList)$/i.test(k) && Array.isArray(v) && v.length){x[k]=[];changed=true;return}
      if((fid==='start'||fid==='startup'||fid==='welcomeHome') && /^(splash|splashAd|startupAd)$/i.test(k) && v){x[k]=Array.isArray(v)?[]:{};changed=true;return}
      walk(v,depth+1);
    });
  }
  walk(obj,0);
  $done(changed?{body:JSON.stringify(obj)}:{});
})();
