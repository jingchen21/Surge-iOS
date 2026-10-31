// Independent JD response filter covering splash, home, order and profile placements.
(function(){
"use strict";
var raw=$response&&$response.body,url=$request&&$request.url||"";
if(typeof raw!=="string"||!/^\s*[\[{]/.test(raw))return $done({});
var fid=(url.match(/[?&]functionId=([^&]+)/)||[])[1]||"";
try{fid=decodeURIComponent(fid)}catch(_){}
var handled=["start","startup","getSplash","welcomeHome","deliverLayer","orderTrackBusiness","getTabHomeInfo","myOrderInfo","personinfoBusiness","readCustomSurfaceList"];
if(!handled.includes(fid))return $done({});
var root;try{root=JSON.parse(raw)}catch(_){return $done({})}
if(!root||typeof root!=="object")return $done({});
var changed=false;
function o(x){return x&&typeof x==="object"&&!Array.isArray(x)}
function empty(x,k){if(o(x)&&Array.isArray(x[k])&&x[k].length){x[k]=[];changed=true}}
function remove(x,k){if(o(x)&&Object.prototype.hasOwnProperty.call(x,k)){delete x[k];changed=true}}
function keep(a,pred){if(!Array.isArray(a))return a;var b=a.filter(pred);if(a.length!==b.length)changed=true;return b}
function adItem(x){var t=String(x&&((x.mId||x.type||x.floorType||x.templateType)||"")).toLowerCase();return x&&(x.isAd===true||x.isAdvert===true||t==="ad"||t==="advertisement")}
function cleanFloor(f){
 if(!o(f))return;
 var id=f.mId||"";
 if(id==="basefloorinfo"&&o(f.data)){remove(f.data,"commonPopup");remove(f.data,"commonPopup_dynamic");empty(f.data,"commonTips");empty(f.data,"commonWindows");remove(f.data,"floatLayer")}
 if(id==="orderIdFloor"&&o(f.data))empty(f.data.commentRemindInfo,"infos");
 if(id==="userinfo"&&o(f.data))remove(f.data,"newPlusBlackCard");
}
function cleanPersonFloors(x){
 if(!Array.isArray(x))return x;
 var excluded=["bigSaleFloor","buyOften","newAttentionCard","newBigSaleFloor","newStyleAttentionCard","newsFloor","noticeFloor","recommendfloor"];
 var out=keep(x,function(f){return !(o(f)&&excluded.includes(f.mId))&&!adItem(f)});
 out.forEach(cleanFloor);return out;
}
if(fid==="start"||fid==="startup"||fid==="getSplash"){
 empty(root,"images");empty(root,"adList");empty(root,"splashAdList");
 if(root.showTimesDaily){root.showTimesDaily=0;changed=true}
 var splash=root.data;
 if(Array.isArray(splash)&&fid==="getSplash"&&splash.length){root.data=[];changed=true}
 else if(o(splash)){
  ["images","adList","splashAdList","splashAds","advertisementList","splashMaterials"].forEach(function(k){empty(splash,k)});
  if(splash.showTimesDaily){splash.showTimesDaily=0;changed=true}
  if(o(splash.splash))["images","adList","ads","materials"].forEach(function(k){empty(splash.splash,k)});
 }
}else if(fid==="welcomeHome"){
 if(Array.isArray(root.floorList))root.floorList=keep(root.floorList,function(f){return f&&["topTab","searchC","dynamicIcon","locPermission","login","hybrid","recommend"].includes(f.type)});
 empty(root,"webViewFloorList");remove(root,"promotionTabs");
}else if(fid==="readCustomSurfaceList"){
 ["dark","normal"].forEach(function(mode){
  var x=root.result&&root.result.modeMap&&root.result.modeMap[mode];
  if(o(x)&&Array.isArray(x.navigationAll))x.navigationAll=keep(x.navigationAll,function(v){return v&&["index","messagenew","cart","home"].includes(v.functionId)});
 });
}else if(fid==="deliverLayer"||fid==="orderTrackBusiness"){
 remove(root,"bannerInfo");
 if(Array.isArray(root.floors))root.floors=keep(root.floors,function(f){return f&&!["banner","jdDeliveryBanner"].includes(f.mId)});
}else if(fid==="getTabHomeInfo"){
 if(o(root.result)){remove(root.result,"iconInfo");remove(root.result,"roofTop")}
}else if(fid==="myOrderInfo"){
 if(Array.isArray(root.floors))root.floors=keep(root.floors,function(f){return !f||!["bannerFloor","bpDynamicFloor","plusFloor"].includes(f.mId)});
 (root.floors||[]).forEach(function(f){
  if(!o(f))return;
  if(f.mId==="virtualServiceCenter"&&o(f.data)&&Array.isArray(f.data.virtualServiceCenters))
   f.data.virtualServiceCenters.forEach(function(c){if(o(c)&&Array.isArray(c.serviceList))c.serviceList=keep(c.serviceList,function(x){return x&&x.serviceTitle!=="精选特惠"})});
  if(f.mId==="customerServiceFloor"&&o(f.data)&&f.data.moreText){remove(f.data,"moreIcon");remove(f.data,"moreIcon_dark");f.data.moreText=" ";changed=true}
 });
}else if(fid==="personinfoBusiness"){
 if(Array.isArray(root.floors))root.floors=cleanPersonFloors(root.floors);
 if(o(root.others)&&Array.isArray(root.others.floors))root.others.floors=cleanPersonFloors(root.others.floors);
}
function walk(x,depth){
 if(!x||typeof x!=="object"||depth>7)return;
 if(Array.isArray(x)){for(var i=x.length-1;i>=0;i--){if(adItem(x[i])){x.splice(i,1);changed=true}else walk(x[i],depth+1)}return}
 Object.keys(x).forEach(function(k){
 var val=x[k];
 if(/^(?:adList|advertList|splashAdList|advertisementList)$/i.test(k)&&Array.isArray(val)){empty(x,k);return}
 walk(val,depth+1);
 });
}
walk(root,0);
return $done(changed?{body:JSON.stringify(root)}:{});
})();