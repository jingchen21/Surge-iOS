// Independent Surge response handler for Fliggy.
// Filters recognized ad fields only. No external script, telemetry, or remote dependency.
"use strict";
function o(x){return x!==null&&typeof x==="object"&&!Array.isArray(x)}
function fliggy(r,u){if(!r||!o(r.data))return r;const d=r.data;const ad=x=>{if(!o(x))return false;let t=String(x.bizType||x.type||x.cardType||x.template?.name||"").toLowerCase();return x.isAd===true||x.is_ad===true||t==="ad"||t==="sponsor"||t==="advertisement"};if(/mtop\.fliggy\.crm\.screen\.(?:allresource|predict)/.test(u)){for(const k of ["ads","adList","advertisements","bannerList","materials","popups"])if(Array.isArray(d[k]))d[k]=[]}else if(/mtop\.fliggy\.ssif\.pattern\.home/.test(u)){for(const k of ["sections","modules","items"])if(Array.isArray(d[k]))d[k]=d[k].filter(x=>!ad(x))}return r}
(function(){try{if(typeof $response!=="object"||typeof $response.body!=="string")return $done({});
const u=(typeof $request==="object"&&$request.url)||"";
const data=JSON.parse($response.body),before=JSON.stringify(data);
const out=fliggy(data,u),after=JSON.stringify(out);
return $done(after!==before?{body:after}:{});
}catch(error){return $done({});}})();
