// Target specific 12306 promotional operations without affecting ticketing.
(function(){
 "use strict";
 var url=$request&&$request.url||"";
 if(/^https?:\/\/ad\.12306\.cn\/ad\/ser\/getAdList(?:\?|$)/.test(url))
  return $done({response:{status:200,headers:{"Content-Type":"application/json"},body:'{"data":[],"success":true,"code":200}'}});
 if(!/^https?:\/\/mobile\.12306\.cn\/otsmobile\/app\/mgs\/mgw\.htm(?:\?|$)/.test(url))return $done({});
 var h=$request.headers||{},op=h["Operation-Type"]||h["operation-type"]||h["operation-Type"]||"";
 var blocked=["com.cars.otsmobile.memberInfo.getMemberQa","com.cars.otsmobile.newHomePage.initData","com.cars.otsmobile.newHomePageBussData"];
 return $done(blocked.includes(op)?{response:{status:204,body:""}}:{});
})();