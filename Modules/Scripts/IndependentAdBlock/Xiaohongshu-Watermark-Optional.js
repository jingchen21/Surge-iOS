// 个人自用独立实现，AI 辅助；未经实机验证。只尝试修改图片保存水印开关，不伪造下载权限与视频 URL
// 无远程导入、数据上传、持久化读写或第三方执行依赖。
"use strict";
function o(x){return x!==null&&typeof x==="object"&&!Array.isArray(x)}
function watermark(r,u){if(!r||typeof r!=="object"||!/\/note\/(?:imagefeed|feed|videofeed)(?:\?|$)/.test(u))return r;let d=r.data,a=[];if(Array.isArray(d))a=d;if(o(d)&&Array.isArray(d.note_list))a=d.note_list;if(Array.isArray(d)&&o(d[0])&&Array.isArray(d[0].note_list))a=d[0].note_list;if(o(d)&&o(d.note)&&!a.length)a=[d.note];for(const n of a){if(!o(n)||!o(n.media_save_config))continue;n.media_save_config.disable_watermark=true;n.media_save_config.disable_weibo_cover=true}return r}
(function(){try{if(typeof $response!=="object"||typeof $response.body!=="string")return $done({});
const u=(typeof $request==="object"&&$request.url)||"";
const data=JSON.parse($response.body),before=JSON.stringify(data);
const out=watermark(data,u),after=JSON.stringify(out);
return $done(after!==before?{body:after}:{});
}catch(error){return $done({});}})();
