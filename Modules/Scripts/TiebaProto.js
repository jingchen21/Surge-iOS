// Selective protobuf wire-format filter for Baidu Tieba, preserving unknown fields.
// Known schema paths are handled only; unrecognized or malformed messages pass through.
(function(){
"use strict";
try{
 var u=$request&&$request.url||"",bytes=$response&&$response.bodyBytes;
 if(bytes instanceof ArrayBuffer)bytes=new Uint8Array(bytes);
 else if(ArrayBuffer.isView(bytes))bytes=new Uint8Array(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(!(bytes instanceof Uint8Array)||bytes.length<2||bytes.length>5000000)return $done({});
 var count=0;
 function vi(b,pos,end){
  var n=0,f=1;
  for(var i=0;i<10;i++){
   if(pos>=end)throw Error("truncated");
   var v=b[pos++];n+=(v&127)*f;
   if(!(v&128))return {val:n,pos:pos};
   f*=128;
  }
  throw Error("oversized varint");
 }
 function ve(n){var a=[];do{var v=n%128;n=Math.floor(n/128);a.push(v|(n?128:0))}while(n);return new Uint8Array(a)}
 function cat(parts){var size=parts.reduce(function(s,x){return s+x.length},0),o=new Uint8Array(size),p=0;parts.forEach(function(x){o.set(x,p);p+=x.length});return o}
 function fields(b){
  var p=0,list=[];
  while(p<b.length){
   if(++count>25000)throw Error("complex");
   var start=p,t=vi(b,p,b.length);p=t.pos;
   var no=Math.floor(t.val/8),wire=t.val%8;
   if(!Number.isSafeInteger(no)||no<=0||no>268435455)throw Error("field");
   var data=null,value=null;
   if(wire===0){var val=vi(b,p,b.length);p=val.pos;value=val.val}
   else if(wire===1)p+=8;
   else if(wire===5)p+=4;
   else if(wire===2){
    var size=vi(b,p,b.length);p=size.pos;
    if(!Number.isSafeInteger(size.val)||size.val<0||size.val>b.length-p)throw Error("length");
    data=b.subarray(p,p+size.val);p+=size.val;
   }else throw Error("wire");
   if(p>b.length)throw Error("bounds");
   list.push({no:no,wire:wire,data:data,value:value,raw:b.subarray(start,p)});
  }
  return list;
 }
 function edit(b,cb){
  var prev=fields(b),next=cb(prev),modified=next.length!==prev.length,out=[];
  for(var i=0;i<next.length;i++){
   var f=next[i];
   if(f.replacement!==undefined){modified=true;out.push(ve(f.no*8+2),ve(f.replacement.length),f.replacement)}
   else out.push(f.raw);
  }
  return modified?cat(out):b;
 }
 function nested(f,fn){
  if(f.wire!==2)return f;
  var v=fn(f.data);
  return v===f.data?f:Object.assign({},f,{replacement:v});
 }
 function exists(b,no,wire,pred){
  return fields(b).some(function(f){return f.no===no&&f.wire===wire&&(!pred||pred(f))});
 }
 function app(b){return edit(b,function(a){return a.filter(function(f){return f.no!==30&&f.no!==38})})}
 function banner(b){return edit(b,function(a){return a.map(function(f){return f.no===1||f.no===5?nested(f,app):f})})}
 function forum(b){return edit(b,function(a){return a.map(function(f){return f.no===33?nested(f,banner):f})})}
 function post(b){return edit(b,function(a){return a.filter(function(f){return f.no!==54&&f.no!==67})})}
 function live(f){return f.wire===2&&exists(f.data,113,2)}
 function handle(b,type){
  return edit(b,function(a){
   var out=[];
   for(var i=0;i<a.length;i++){
    var f=a[i];
    if(type==="frs"){
     if(f.no===116||f.no===7&&live(f))continue;
     if(f.no===23&&f.wire===2&&exists(f.data,13,0,function(v){return v.value===1}))continue;
     if(f.no===2)f=nested(f,forum);
    }else if(type==="pb"){
     if(f.no===55)continue;
     if(f.no===6)f=nested(f,post);
     if(f.no===12)f=nested(f,banner);
    }else if(type==="personal"){
     if(f.no===17||f.no===2&&live(f))continue;
     if(f.no===9)f=nested(f,banner);
    }else if(type==="thread"){
     if(f.no===3)f=nested(f,banner);
    }else if(type==="tab"){
     if(f.no===10)f=nested(f,app);
    }else if(type==="feed"){
     if(f.no>=1&&f.no<=4&&f.wire===2)continue;
    }else if(type==="pblist"){
     if(f.no===6)f=nested(f,post);
    }
    out.push(f);
   }
   return out;
  });
 }
 var type=null;
 if(/\/c\/f\/frs\/page\?cmd/.test(u))type="frs";
 else if(/\/c\/f\/frs\/threadlist\?cmd/.test(u))type="thread";
 else if(/\/c\/f\/frs\/generalTabList\?cmd/.test(u))type="tab";
 else if(/\/c\/f\/excellent\/personalized\?cmd/.test(u))type="personal";
 else if(/\/c\/f\/ad\/getFeedAd\?cmd/.test(u))type="feed";
 else if(/\/c\/f\/pb\/page\?cmd/.test(u)){
  var cmd=(u.match(/[?&]cmd=(\d+)/)||[])[1];
  if(cmd==="302001")type="pb";
  else if(cmd==="309751")type="pblist";
 }
 if(!type)return $done({});
 var out=edit(bytes,function(fs){return fs.map(function(f){return f.no===2?nested(f,function(x){return handle(x,type)}):f})});
 return $done(out===bytes?{}:{body:out});
}catch(_){return $done({});}
})();