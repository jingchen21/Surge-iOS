// 个人自用独立实现，AI 辅助；未经实机验证。开屏配置、信息流和搜索广告，保留普通笔记、直播与商品
// 无远程导入、数据上传、持久化读写或第三方执行依赖。
"use strict";
function o(x){return x!==null&&typeof x==="object"&&!Array.isArray(x)}
function xhs(r,u){if(!r||typeof r!=="object")return r;let d=r.data;const isAd=x=>!!x&&typeof x==="object"&&(x.is_ad===true||x.isAd===true||x.is_ad===1||x.is_advert===true||x.model_type==="ad"||x.model_type==="advertisement"||!!x.ads_info);const filter=(x,k)=>{if(x&&Array.isArray(x[k]))x[k]=x[k].filter(i=>!isAd(i))};
if(/\/system_service\/splash_config(?:\?|$)/.test(u)){if(d&&typeof d==="object"){if(Array.isArray(d.ads_groups))d.ads_groups=[];if(Array.isArray(d.ads))d.ads=[]}}
else if(/\/system_service\/config(?:\?|$)/.test(u)){if(d&&typeof d==="object"){delete d.splash;delete d.loading_img}}
else if(/\/surprisebox\/(?:get_style|open|submit_action)(?:\?|$)/.test(u)){if(Array.isArray(d))r.data=[];else if(o(d))r.data={}}
else if(/\/search\/banner_list(?:\?|$)/.test(u)){if(Array.isArray(d))r.data=[];else if(o(d)){filter(d,"banners");filter(d,"items");filter(d,"banner_list")}}
else if(/\/search\/(?:notes|hot_list|hint|trending)(?:\?|$)/.test(u)){if(d&&typeof d==="object"){filter(d,"items");filter(d,"queries");filter(d,"hint_words")}}
else if(/\/(?:homefeed|followfeed)(?:\?|$)/.test(u)){if(Array.isArray(d))r.data=d.filter(i=>!isAd(i));else if(o(d)){filter(d,"items");filter(d,"feeds");filter(d,"sections")}}
else if(/\/note\/widgets(?:\?|$)/.test(u)){if(o(d)){if(Array.isArray(d.cooperate_binds))d.cooperate_binds=[];filter(d,"widget_list");filter(d,"widgets")}}
else if(/\/user\/followings\/followfeed(?:\?|$)/.test(u)){if(o(d))filter(d,"items")}
return r}
(function(){try{if(typeof $response!=="object"||typeof $response.body!=="string")return $done({});
const u=(typeof $request==="object"&&$request.url)||"";
const data=JSON.parse($response.body),before=JSON.stringify(data);
const out=xhs(data,u),after=JSON.stringify(out);
return $done(after!==before?{body:after}:{});
}catch(error){return $done({});}})();
