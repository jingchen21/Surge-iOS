// 个人自用独立实现，AI 辅助；未经实机验证。赞助卡和明确广告标识，保留正常动态、评论和搜索
// 无远程导入、数据上传、持久化读写或第三方执行依赖。
"use strict";
function o(x){return x!==null&&typeof x==="object"&&!Array.isArray(x)}
function coolapk(r,u){if(!r||typeof r!=="object")return r;const d=r.data;const ad=x=>o(x)&&(x.entityTemplate==="sponsorCard"||x.isAd===true||x.is_ad===true||String(x.entityType||"").toLowerCase()==="advertisement");if(/\/feed\/detail(?:\?|$)/.test(u)&&o(d)){if("detailSponsorCard" in d)delete d.detailSponsorCard;for(const k of ["hotReplyRows","topReplyRows"])if(Array.isArray(d[k]))d[k]=d[k].filter(x=>!ad(x))}
else if(/\/(?:main\/(?:dataList|indexV\d*|init)|page\/dataList|feed\/replyList)(?:\?|$)/.test(u)){if(Array.isArray(d))r.data=d.filter(x=>!ad(x));else if(o(d))for(const k of ["items","list","rows"])if(Array.isArray(d[k]))d[k]=d[k].filter(x=>!ad(x))}return r}
(function(){try{if(typeof $response!=="object"||typeof $response.body!=="string")return $done({});
const u=(typeof $request==="object"&&$request.url)||"";
const data=JSON.parse($response.body),before=JSON.stringify(data);
const out=coolapk(data,u),after=JSON.stringify(out);
return $done(after!==before?{body:after}:{});
}catch(error){return $done({});}})();
