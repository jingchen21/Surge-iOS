// Taobao splash response JSON cleaner; conservatively keeps business data.
(function(){
  var raw=$response && $response.body,url=$request && $request.url || '';
  if(typeof raw!=='string'||!raw.trim().startsWith('{'))return $done({});
  var isSplash=/wireless\.home\.splash\.awesome\.get|cloudvideo\.video\.query/.test(url),isPop=/poplayer\.template\.alibaba\.com/.test(url);
  if(!isSplash&&!isPop)return $done({});
  var root;try{root=JSON.parse(raw)}catch(e){return $done({})}
  var changed=false;
  function walk(x,d){
    if(!x||typeof x!=='object'||d>8)return;
    if(Array.isArray(x)){x.forEach(function(v){walk(v,d+1)});return}
    Object.keys(x).forEach(function(k){var v=x[k];
      if(/^(?:splashAdList|advertList|adList|poplayerList|startupAds|splashMaterials)$/i.test(k)&&Array.isArray(v)&&v.length){x[k]=[];changed=true;return}
      if(isSplash && /^(?:splash|splashAd|startupAd)$/i.test(k)&&v){x[k]=Array.isArray(v)?[]:{};changed=true;return}
      if(isPop && /^(?:poplayer|poplayers|advertisement)$/i.test(k)&&v){x[k]=Array.isArray(v)?[]:{};changed=true;return}
      walk(v,d+1);
    });
  }
  walk(root,0);$done(changed?{body:JSON.stringify(root)}:{});
})();
