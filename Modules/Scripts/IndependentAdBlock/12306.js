// 12306 splash list -- independent best-effort implementation.
// Target is exclusively /ad/ser/getAdList; avoids mutating booking endpoints.
(function () {
  var url = ($request && $request.url) || '';
  if (!/^https:\/\/ad\.12306\.cn\/ad\/ser\/getAdList(?:\?|$)/.test(url)) return $done({});
  return $done({response:{status:200,headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify({data:[],success:true,code:200})}});
})();
