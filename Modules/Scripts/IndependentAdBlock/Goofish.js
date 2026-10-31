// 个人自用独立实现，AI 辅助；未经实机验证。开屏、首页、同城与搜索中明确广告条目，不动商品和订单
// 无远程导入、数据上传、持久化读写或第三方执行依赖。
"use strict";
function o(x){return x!==null&&typeof x==="object"&&!Array.isArray(x)}
function goofish(r,u){if(!r||!o(r.data))return r;const d=r.data;function ad(x){if(!o(x))return false;let b=String(x.data?.bizType||x.bizType||x.cardType||x.data?.clickParam?.args?.cardType||"").toLowerCase(),n=String(x.data?.item?.main?.exContent?.dislikeFeedback?.clickParam?.args?.bizType||"").toLowerCase(),t=String(x.template?.name||"").toLowerCase();return x.isAd===true||x.is_ad===true||x.data?.isAd===true||b==="ad"||b==="mamaad"||n==="ad"||t==="mamaad"}const f=(x,k)=>{if(o(x)&&Array.isArray(x[k]))x[k]=x[k].filter(i=>!ad(i))};if(/idlecommerce\.splash(?:\.async)?\.ads/.test(u)){for(const k of ["adMap","adsMap"])if(o(d[k]))d[k]={};for(const k of ["adList","ads","advertisements"])if(Array.isArray(d[k]))d[k]=[]}
else if(/idlehome\.home\.nextfresh|idle\.local\.home|idlehome\.home\.community|idlehome\.home\.newitem\.page|idle\.home\.whale\.modulet/.test(u)){f(d,"sections");f(d,"feedsList");f(d,"homeTopList");if(o(d.container))f(d.container,"sections")}
else if(/idlemtopsearch\.search/.test(u)){f(d,"resultList");f(d,"items");f(d,"cardList")}return r}
(function(){try{if(typeof $response!=="object"||typeof $response.body!=="string")return $done({});
const u=(typeof $request==="object"&&$request.url)||"";
const data=JSON.parse($response.body),before=JSON.stringify(data);
const out=goofish(data,u),after=JSON.stringify(out);
return $done(after!==before?{body:after}:{});
}catch(error){return $done({});}})();
