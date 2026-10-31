// Independent Surge response handler for Dewu.
// Filters recognized ad fields only. No external script, telemetry, or remote dependency.
"use strict";
function o(x){return x!==null&&typeof x==="object"&&!Array.isArray(x)}
function dewu(r,u){if(!r||typeof r!=="object"||!/\/api\/v\d+\/app\/advertisement(?:\/|\?|$)/.test(u)||/\/new\/activity\/receiveCoupon/.test(u))return r;if(Array.isArray(r.data)){r.data=[];return r}if(!o(r.data))return r;const d=r.data;for(const k of ["ads","adList","ad_list","advertList","advertisements","bannerList","splashList","splashAds"])if(Array.isArray(d[k]))d[k]=[];for(const k of ["splashAd","advertisement","splash"])if(o(d[k]))d[k]={};return r}
(function(){try{if(typeof $response!=="object"||typeof $response.body!=="string")return $done({});
const u=(typeof $request==="object"&&$request.url)||"";
const data=JSON.parse($response.body),before=JSON.stringify(data);
const out=dewu(data,u),after=JSON.stringify(out);
return $done(after!==before?{body:after}:{});
}catch(error){return $done({});}})();
