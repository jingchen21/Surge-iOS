// Luckin Coffee: clean known promotional popups without touching menus, orders, or coupons.
(function(){
"use strict";
var url=$request&&$request.url||"",body=$response&&$response.body;
if(typeof body!=="string")return $done({});
var root;try{root=JSON.parse(body)}catch(_){return $done({})}
if(!root||typeof root!=="object")return $done({});
var changed=false;
function obj(x){return x!==null&&typeof x==="object"&&!Array.isArray(x)}
function drop(x,k){if(obj(x)&&Object.prototype.hasOwnProperty.call(x,k)){delete x[k];changed=true}}
function empty(x,k){if(obj(x)&&Array.isArray(x[k])&&x[k].length){x[k]=[];changed=true}}
function popup(x){
 if(!obj(x))return;
 if(typeof x.popTitle==="string"&&x.popTitle){x.popTitle="";changed=true}
 ["adPopup","popBanner","popWindow","popApp"].forEach(k=>drop(x,k));
 ["advertisementList","adList","popupList"].forEach(k=>empty(x,k));
}
if(/\/resource\/m\/growUp\/main(?:\?|$)/.test(url)){
 popup(root);popup(root.data);
}else if(/\/resource\/m\/member\/exchange\/page(?:\?|$)/.test(url)){
 popup(root.data);
 if(obj(root.data)&&obj(root.data.pageInfo))popup(root.data.pageInfo);
}else if(/\/resource\/m\/sys\/common\/modules(?:\?|$)/.test(url)){
 if(obj(root.data)){
  ["adList","advertisementList"].forEach(k=>empty(root.data,k));
  if(Array.isArray(root.data.modules)){var prev=root.data.modules.length;
   root.data.modules=root.data.modules.filter(x=>!(obj(x)&&(x.isAd===true||x.is_ad===1||x.type==="ad"||x.type==="advertisement")));
   if(prev!==root.data.modules.length)changed=true;
  }
 }
}
return $done(changed?{body:JSON.stringify(root)}:{});
})();