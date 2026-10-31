// Independent Surge response handler for Coolapk.
// Filters recognized ad fields only. No external script, telemetry, or remote dependency.
"use strict";
function o(x){return x!==null&&typeof x==="object"&&!Array.isArray(x)}
function coolapk(r,u){if(!r||typeof r!=="object")return r;const d=r.data;const ad=x=>o(x)&&(x.entityTemplate==="sponsorCard"||x.isAd===true||x.is_ad===true||String(x.entityType||"").toLowerCase()==="advertisement");if(/\/feed\/detail(?:\?|$)/.test(u)&&o(d)){if("detailSponsorCard" in d)delete d.detailSponsorCard;for(const k of ["hotReplyRows","topReplyRows"])if(Array.isArray(d[k]))d[k]=d[k].filter(x=>!ad(x)&&!!x?.id);for(const k of ["include_goods","include_goods_ids"])if(k in d)d[k]=[]}
else if(/\/(?:main\/(?:dataList|indexV\d*|init)|page\/dataList|feed\/replyList)(?:\?|$)/.test(u)){const extra=x=>o(x)&&((/\/main\/dataList/.test(u)&&x.title==="精选配件")||(/\/main\/indexV/.test(u)&&([8639,29349,33006,32557].includes(x.entityId)||/值得买|红包/.test(String(x.title||""))))||(/\/main\/init/.test(u)&&[944,945,6390].includes(x.entityId))||(/\/page\/dataList/.test(u)&&x.title==="酷安热搜"));if(Array.isArray(d))r.data=d.filter(x=>!ad(x)&&!extra(x)&&(/\/feed\/replyList/.test(u)?!!x?.id:true));else if(o(d))for(const k of ["items","list","rows"])if(Array.isArray(d[k]))d[k]=d[k].filter(x=>!ad(x)&&!extra(x))}return r}
(function(){try{if(typeof $response!=="object"||typeof $response.body!=="string")return $done({});
const u=(typeof $request==="object"&&$request.url)||"";
const data=JSON.parse($response.body),before=JSON.stringify(data);
const out=coolapk(data,u),after=JSON.stringify(out);
return $done(after!==before?{body:after}:{});
}catch(error){return $done({});}})();
