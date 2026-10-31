// Baidu Tieba JSON response filter; binary responses use the companion wire filter.
(function(){
"use strict";
var input=$response&&$response.body;
if(typeof input!=="string"||!/^\s*[\[{]/.test(input))return $done({});
var root;try{root=JSON.parse(input)}catch(_){return $done({})}
if(!root||typeof root!=="object")return $done({});
var u=$request&&$request.url||"", changed=false;
function obj(x){return x!==null&&typeof x==="object"&&!Array.isArray(x)}
function empty(x,k){if(obj(x)&&Array.isArray(x[k])&&x[k].length){x[k]=[];changed=true}}
function nullify(x,k){if(obj(x)&&x[k]!=null){x[k]=null;changed=true}}
function isAd(x){
 if(!obj(x))return false;
 var t=String(x.type||x.item_type||x.itemType||x.bizType||"").toLowerCase();
 return x.is_ad===true||x.is_ad===1||x.isAd===true||x.isAd===1||x.is_sponsored===true||
 t==="ad"||t==="advert"||t==="advertisement"||x.ad_info!=null||x.ads_info!=null;
}
function strip(x,k){
 if(!obj(x)||!Array.isArray(x[k]))return;
 var filtered=x[k].filter(function(v){return !isAd(v)});
 if(filtered.length!==x[k].length){x[k]=filtered;changed=true}
}
function banners(x){
 if(!obj(x))return;
 if(Array.isArray(x.app))x.app.forEach(function(a){empty(a,"goods_info");empty(a,"goodsInfo")});
 if(obj(x.pb_banner_ad)){empty(x.pb_banner_ad,"goods_info");empty(x.pb_banner_ad,"goodsInfo")}
}
function threads(x){
 if(!obj(x)||!Array.isArray(x.thread_list))return;
 var a=x.thread_list.filter(function(item){return !isAd(item)&&!(obj(item)&&obj(item.ala_info)&&item.ala_info.live_id)});
 if(a.length!==x.thread_list.length){x.thread_list=a;changed=true}
}
if(u.includes("/c/f/ad/getSplashAd")){
 if(root.error_code===0){root.error_code=2230209;root.data=null;changed=true}
}else if(u.includes("/tiebaads/commonbatch")){
 empty(root.res,"ad");
}else if(u.includes("/c/s/sync")){
 nullify(root,"floating_icon");
 if(obj(root.advertisement_config)&&root.advertisement_config.advertisement_str)nullify(root,"advertisement_config");
 if(obj(root.config)&&Array.isArray(root.config.switch)){
  var adKeys=["platform_csj_init","platform_ks_init","platform_gdt_init","platform_baidu_bqt_init",
   "platform_jy_init","platform_ubix_init","platform_hw_init","ad_baichuan_open"];
  root.config.switch.forEach(function(sw){if(obj(sw)&&adKeys.includes(sw.name)&&sw.type!=="0"){sw.type="0";changed=true}});
 }
 if(obj(root.screen_fill_data_result)){
  ["screen_fill_advertisement_bear_switch","screen_fill_advertisement_plj_cpc_switch",
  "screen_fill_advertisement_plj_switch"].forEach(function(k){
   if(root.screen_fill_data_result[k]==="1"){root.screen_fill_data_result[k]="0";changed=true}
  });
 }
}else if(u.includes("/c/f/pb/picpage")){
 empty(root,"recom_live_list");
}else if(u.includes("/c/f/frs/page")){
 empty(root,"live_fuse_forum");
 if(obj(root.activityhead)&&(root.activityhead.is_ad===true||root.activityhead.is_ad===1))nullify(root,"activityhead");
 threads(root);if(obj(root.forum))banners(root.forum.banner_list);
}else if(u.includes("/c/f/frs/threadlist")||u.includes("/c/f/frs/generalTabList")){
 banners(root.banner_list);
 if(Array.isArray(root.app_list))root.app_list.forEach(function(a){empty(a,"goods_info")});
}else if(u.includes("/c/f/pb/page")){
 if(obj(root.recom_ala_info)&&root.recom_ala_info.live_id)nullify(root,"recom_ala_info");
 if(Array.isArray(root.post_list))root.post_list.forEach(function(p){nullify(p,"outer_item");nullify(p,"novel_recom_card")});
 banners(root.banner_list);
}else if(u.includes("/c/f/excellent/personalized")){
 nullify(root,"live_answer");threads(root);banners(root.banner_list);
}else if(u.includes("/c/f/ad/getFeedAd")){
 if(obj(root.data))["recom","frs","pb_banner","pb_comment"].forEach(function(k){empty(root.data,k)});
}else if(u.includes("/c/f/sidebar/home")||u.includes("/c/u/user/profile")){
 nullify(root,"vip_banner");
}
return $done(changed?{body:JSON.stringify(root)}:{});
})();