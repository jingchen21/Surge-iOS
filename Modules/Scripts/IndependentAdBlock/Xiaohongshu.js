// Independent Surge handler: ad filtering and media watermark handling.
// Media matching uses a ten-minute on-device cache. No external script or telemetry.
"use strict";
function o(x){return x!==null&&typeof x==="object"&&!Array.isArray(x)}
function baseXhs(r,u){if(!r||typeof r!=="object")return r;let d=r.data;const isAd=x=>!!x&&typeof x==="object"&&(x.is_ad===true||x.isAd===true||x.is_ad===1||x.is_advert===true||x.model_type==="ad"||x.model_type==="advertisement"||!!x.ads_info);const filter=(x,k)=>{if(x&&Array.isArray(x[k]))x[k]=x[k].filter(i=>!isAd(i))};
if(/\/system_service\/splash_config(?:\?|$)/.test(u)){if(d&&typeof d==="object"){if(Array.isArray(d.ads_groups))d.ads_groups=[];if(Array.isArray(d.ads))d.ads=[]}}
else if(/\/system_service\/config(?:\?|$)/.test(u)){if(d&&typeof d==="object"){delete d.splash;delete d.loading_img}}
else if(/\/surprisebox\/(?:get_style|open|submit_action)(?:\?|$)/.test(u)){if(Array.isArray(d))r.data=[];else if(o(d))r.data={}}
else if(/\/search\/banner_list(?:\?|$)/.test(u)){if(Array.isArray(d))r.data=[];else if(o(d)){filter(d,"banners");filter(d,"items");filter(d,"banner_list")}}
else if(/\/search\/(?:notes|hot_list|hint|trending)(?:\?|$)/.test(u)){if(d&&typeof d==="object"){filter(d,"items");filter(d,"queries");filter(d,"hint_words")}}
else if(/\/(?:homefeed|followfeed)(?:\?|$)/.test(u)){if(Array.isArray(d))r.data=d.filter(i=>!isAd(i));else if(o(d)){filter(d,"items");filter(d,"feeds");filter(d,"sections")}}
else if(/\/note\/widgets(?:\?|$)/.test(u)){if(o(d)){if(Array.isArray(d.cooperate_binds))d.cooperate_binds=[];filter(d,"widget_list");filter(d,"widgets")}}
else if(/\/user\/followings\/followfeed(?:\?|$)/.test(u)){if(o(d))filter(d,"items")}
return r}


const CACHE_KEY="jc.xhs.media.v2",TTL_MS=600000;
function readCache(){
  try{
    if(typeof $persistentStore==="undefined"||typeof $persistentStore.read!=="function")return [];
    const data=JSON.parse($persistentStore.read(CACHE_KEY)||"[]"),now=Date.now();
    return Array.isArray(data)?data.filter(e=>o(e)&&typeof e.id==="string"&&typeof e.url==="string"&&e.time>now-TTL_MS&&e.time<=now):[];
  }catch(_){return []}
}
function cacheMedia(id,url,kind){
  if(id==null||typeof url!=="string"||!/^https:\/\//.test(url))return;
  if(typeof $persistentStore==="undefined"||typeof $persistentStore.write!=="function")return;
  const data=readCache().filter(e=>!(e.id===String(id)&&e.kind===kind));
  data.push({id:String(id),url:url,kind:kind,time:Date.now()});
  try{$persistentStore.write(JSON.stringify(data.slice(-20)),CACHE_KEY)}catch(_){}
}
function cachedMedia(id,kind){
  if(id==null)return null;
  const entry=readCache().find(e=>e.id===String(id)&&e.kind===kind);
  return entry?entry.url:null;
}
function streamUrl(stream){
  if(!o(stream))return null;
  const values=[...(Array.isArray(stream.h265)?stream.h265:[]),...(Array.isArray(stream.h264)?stream.h264:[])];
  const avail=values.filter(x=>o(x)&&typeof x.master_url==="string"&&/^https:\/\//.test(x.master_url));
  avail.sort((a,b)=>(Number(b.height)||0)-(Number(a.height)||0));
  return avail.length?avail[0].master_url:null;
}
function processNote(note){
  if(!o(note))return;
  if(o(note.media_save_config)){
    note.media_save_config.disable_save=false;
    note.media_save_config.disable_watermark=true;
    note.media_save_config.disable_weibo_cover=true;
  }
  if(Array.isArray(note.function_switch)){
    for(const sw of note.function_switch){
      if(!o(sw))continue;
      const kind=String(sw.type||sw.key||sw.name||sw.function_name||"").toLowerCase();
      if(/^(download|save|video_download|image_download|save_image|save_video|allow_save)$/.test(kind)){
        sw.enable=true;
        if(typeof sw.reason==="string")sw.reason="";
      }
    }
  }
  const entries=note.share_info?.function_entries;
  if(Array.isArray(entries)&&entries.length>0&&
     !entries.some(e=>o(e)&&e.type==="video_download")&&
     (o(note.video_info_v2)||o(note.video_info)))entries.unshift({type:"video_download"});
  const id=note.id||note.note_id;
  const url=streamUrl(note.video_info_v2?.media?.stream||note.video_info?.media?.stream);
  if(url&&id!=null)cacheMedia(id,url,"video");
  if(Array.isArray(note.images_list)){
    for(const pic of note.images_list){
      if(!o(pic)||!pic.live_photo_file_id)continue;
      const live=streamUrl(pic.live_photo?.media?.stream);
      if(live)cacheMedia(pic.live_photo_file_id,live,"live");
    }
  }
}
function mediaNotes(d){
  const result=[];
  function add(x){if(o(x)&&!result.includes(x))result.push(x)}
  if(Array.isArray(d)){
    for(const n of d){add(n);if(o(n)&&Array.isArray(n.note_list))n.note_list.forEach(add)}
  }else if(o(d)){
    add(d);add(d.note);add(d.note_info);
    if(Array.isArray(d.note_list))d.note_list.forEach(add);
    if(Array.isArray(d.items))for(const n of d.items){add(n.note);add(n.note_info)}
  }
  return result;
}
function xhs(root,url){
  if(!o(root)||typeof url!=="string")return root;
  const d=root.data;
  if(/\/note\/(?:imagefeed|feed|videofeed)(?:\?|$)/.test(url)){
    mediaNotes(d).forEach(processNote);
    if(/\/note\/videofeed(?:\?|$)/.test(url)){
      const ad=e=>o(e)&&(e.is_ad===true||e.is_ad===1||e.isAd===true||e.ads_info!=null||e.model_type==="ad");
      if(Array.isArray(d))root.data=d.filter(e=>!ad(e));
      else if(o(d)&&Array.isArray(d.items))d.items=d.items.filter(e=>!ad(e));
    }
    return root;
  }
  if(/\/note\/video\/save(?:\?|$)/.test(url)&&o(d)){
    const saved=cachedMedia(d.note_id||d.noteId||d.id,"video");
    if(saved){
      d.download_url=saved;
      if(typeof d.disable==="boolean")d.disable=false;
    }
    return root;
  }
  if(/\/note\/live_photo\/save(?:\?|$)/.test(url)&&o(d)&&Array.isArray(d.datas)){
    for(const item of d.datas){
      if(!o(item))continue;
      const saved=cachedMedia(item.file_id||item.fileId,"live");
      if(saved&&typeof item.url==="string")item.url=saved;
    }
    return root;
  }
  return baseXhs(root,url);
}

(function(){try{if(typeof $response!=="object"||typeof $response.body!=="string")return $done({});
const u=(typeof $request==="object"&&$request.url)||"";
const data=JSON.parse($response.body),before=JSON.stringify(data);
const out=xhs(data,u),after=JSON.stringify(out);
return $done(after!==before?{body:after}:{});
}catch(error){return $done({});}})();
