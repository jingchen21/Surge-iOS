// Taobao splash and pop-up filter with specific response-field handling.
(function(){"use strict";
var u=$request&&$request.url||"",body=$response&&$response.body;
if(typeof body!=="string")return $done({});
var r;try{r=JSON.parse(body)}catch(_){return $done({})}
if(!r||typeof r!=="object")return $done({});
var d=r.data,modified=false;
function o(x){return x&&typeof x==="object"&&!Array.isArray(x)}
function set(x,k,v){if(o(x)&&x[k]!==undefined&&x[k]!==v){x[k]=v;modified=true}}
function clear(x,k){if(o(x)&&Array.isArray(x[k])&&x[k].length){x[k]=[];modified=true}}
if(u.includes("mtop.taobao.cloudvideo.video.query")){
 set(d,"duration","0");clear(d,"resources");clear(d,"caches");set(d,"respTimeInMs","3818332800000");
}else if(u.includes("mtop.taobao.wireless.home.splash.awesome.get")){
 var c=d&&d.containers&&d.containers.splash_home_base;
 if(c&&c.base&&Array.isArray(c.base.sections))c.base.sections.forEach(function(section){
 var a=section&&section.bizData&&section.bizData["taobao-splash"];
 if(a&&Array.isArray(a.data))a.data.forEach(function(item){
  ["imgUrl","videoUrl"].forEach(function(k){set(item,k,"")});
  ["waitTime","times"].forEach(function(k){set(item,k,"0")});
  ["hotStart","haveVoice","coldStart"].forEach(function(k){set(item,k,"false")});
  set(item,"startTime","3818332800000");set(item,"endTime","3818419199000");
 });
 });
}else if(u.includes("poplayer.template.alibaba.com")){
 clear(r.res,"images");clear(r.res,"videos");clear(r.mainRes,"images");set(r,"enable",false);
}
return $done(modified?{body:JSON.stringify(r)}:{});
})();