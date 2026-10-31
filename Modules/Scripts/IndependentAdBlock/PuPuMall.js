// PuPu promotional sections and card filter.
(function(){"use strict";
var u=$request&&$request.url||"",body=$response&&$response.body,r;
if(typeof body!=="string")return $done({});
try{r=JSON.parse(body)}catch(_){return $done({})}
var d=r&&r.data,changed=false;
function o(x){return x&&typeof x==="object"&&!Array.isArray(x)}
function clear(x,k){if(o(x)&&Array.isArray(x[k])&&x[k].length){x[k]=[];changed=true}}
if(/\/search\/hot_keywords\/v3/.test(u)&&Array.isArray(d)){if(d.length){r.data=[];changed=true}}
else if(/\/marketing\/advertisement\/v1/.test(u)&&Array.isArray(d)){
 var n=d.length;r.data=d.filter(function(x){return ![30,50,90,320,100,770].includes(x&&x.region_code)});
 if(r.data.length!==n)changed=true;
 r.data.forEach(function(x){if(x&&x.region_code===2&&Array.isArray(x.positions)){
 var prev=x.positions.length;x.positions=x.positions.filter(function(p){return ![890,60,2,240,2503].includes(p&&p.component_code)});if(x.positions.length!==prev)changed=true}});
}else if(/\/search\/hub\/search_box\/products\/v6/.test(u))clear(d,"feed_banner_cards");
else if(/\/order_settlement\/detail/.test(u)){if(o(d)&&d.member_card_v2!=null){d.member_card_v2={};changed=true}}
else if(/\/order\/orders\/list\/v4/.test(u)){if(Array.isArray(d))d.forEach(function(x){if(o(x)&&"just_in_time_comment" in x){delete x.just_in_time_comment;changed=true}})}
else if(/\/marketing\/banner\/(?:v\d+|search_component_banner)/.test(u)){if(Array.isArray(d)&&d.length){r.data=[];changed=true}else{clear(d,"banners");clear(d,"bannerList")}}
return $done(changed?{body:JSON.stringify(r)}:{});
})();