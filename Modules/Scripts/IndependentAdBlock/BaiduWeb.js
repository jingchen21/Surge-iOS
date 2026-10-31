// Baidu search and home ad filtering for Safari. Non-HTML responses pass through.
(function(){
"use strict";
try {
 var u=$request&&$request.url||"";
 var m=/^https?:\/\/(?:m|www)\.baidu\.com(\/[^?#]*)(?:\?([^#]*))?/i.exec(u);
 if(!m)return $done({});
 var path=m[1],query=m[2]||"";
 var home=path==="/"&&!/(?:^|&)(?:wd|word|query|kw|q)=/i.test(query);
 var search=path==="/s"||path==="/s/"||path==="/"&&!home;
 if(!home&&!search)return $done({});
 var html=$response&&$response.body;
 if(typeof html!=="string"||!/<(?:html|head|body)[\s>]/i.test(html))return $done({});
 if(html.indexOf('id="jc-baidu-ads-style"')>=0)return $done({});
 var hide=[
 '#content_left > div[data-tuiguang]',
 '#content_left > div[data-ad="true"]',
 '#content_left > div[data-ec]',
 '#content_left > div.EC_result',
 '#content_left > div.ec_ad_results',
 '#content_left > div:has(.ec_tuiguang)',
 '#content_left > div:has(.ec-tuiguang)',
 '#content_left > div:has([data-ad="true"])',
 '#content_left > div:has([data-tuiguang="true"])',
 '#content_left > div:has(.ec_ad_results)',
 '#content_right .ec_ad_results',
 '#content_right [data-ad="true"]',
 'div[id^="ec_im_container"]',
 '.result:has(> .ec_tuiguang)',
 '.c-container:has(> .ec_tuiguang)',
 '.c-container:has(> [data-ad="true"])'
 ];
 if(home)hide.push("#s-news-wrapper","#s-news",".s-news-list-wrapper",".s-news-rank-wrapper",".s-news-wrapper",".s-home-news",".s-news-feed");
 var css='<style id="jc-baidu-ads-style">'+hide.join(",")+'{display:none!important}</style>';
 var out=/<\/head\s*>/i.test(html)?html.replace(/<\/head\s*>/i,css+"</head>"):html.replace(/<body([^>]*)>/i,"<body$1>"+css);
 return $done(out===html?{}:{body:out});
}catch(_){return $done({});}
})();