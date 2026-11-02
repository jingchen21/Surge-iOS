#!/usr/bin/env node
// SPDX-License-Identifier: MIT
'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),mods=JSON.parse(read('maintenance/modules/catalog.json')).modules;
const check=process.argv.includes('--check'),esc=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const raw='https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/',repo='https://github.com/jingchen21/Surge-iOS',pages='https://jingchen21.github.io/Surge-iOS/';
const files=fs.readdirSync(path.join(root,'Modules')).filter(x=>x.endsWith('.sgmodule')).sort(),listed=mods.map(x=>x.file).sort();
if(JSON.stringify(files)!==JSON.stringify(listed))throw Error('Catalog does not cover all Modules/*.sgmodule');
for(const m of mods){
 const s=read('Modules/'+m.file);
 if(!/^#!name\s*=/m.test(s)||!s.includes('#!category='+m.category))throw Error('Invalid name or category: '+m.file);
 m.updated=cp.execFileSync('git',['log','-1','--format=%cs','--','Modules/'+m.file],{cwd:root,encoding:'utf8'}).trim();
 if(!/^\d{4}-\d{2}-\d{2}$/.test(m.updated))throw Error('Full Git history needed for '+m.file);
 m.url=raw+encodeURIComponent(m.file);
}
for(const m of mods.filter(x=>x.aliasOf))if(read('Modules/'+m.file)!==read('Modules/'+m.aliasOf))throw Error('Legacy alias diverged '+m.file);
const active=mods.filter(x=>x.display!==false).sort((a,b)=>a.name.localeCompare(b.name,'en')),n=type=>active.filter(x=>x.category===type).length;
const state=m=>m.deviceVerifiedAt?'Device checked '+m.deviceVerifiedAt:m.experimental?'Experimental · not device-verified':'Device verification pending';
function card(m){
 const category=m.category==='Ad Remove'?'ad':m.category==='Hack VIP'?'vip':'utility',initial=Array.from(m.name).slice(0,2).join('');
 return '<article class="module" data-name="'+esc(m.name.toLowerCase())+'" data-aliases="'+esc(m.aliases||'')+'" data-category="'+esc(m.category)+'">\n'+
 '<div class="module-main"><div class="name-line"><img class="app-icon" src="'+esc(m.icon)+'" data-initial="'+esc(initial)+'" alt="" width="38" height="38" loading="lazy"><h2>'+esc(m.name)+'</h2><span class="category '+category+'">'+esc(m.category)+'</span></div>\n'+
 '<p>'+esc(m.description)+'</p><small>Code updated '+m.updated+' · '+esc(state(m))+'</small></div>\n'+
 '<a class="install" href="surge:///install-module?url='+encodeURIComponent(m.url)+'" aria-label="Install '+esc(m.name)+' in Surge">Install in Surge <span aria-hidden="true">&#8599;</span></a>\n'+
 '<div class="module-actions"><a href="'+repo+'/blob/main/Modules/'+encodeURIComponent(m.file)+'" rel="noopener noreferrer">Source &amp; details</a><button type="button" class="copy-module" data-url="'+esc(m.url)+'">Copy URL</button></div>\n</article>';
}
let html=read('docs/index.html');
const region=/(<div class="list" id="modules">)[\s\S]*?(<\/div>\s*<p id="empty")/;
if(!region.test(html))throw Error('Pages module list missing');
html=html.replace(region,(_x,start,end)=>start+'\n'+active.map(card).join('\n')+'\n'+end)
 .replace(/(<p class="subtitle">)\d+ modules\./,'$1'+active.length+' modules.')
 .replace(/(data-category="" aria-pressed="true">All )\d+/,'$1'+active.length)
 .replace(/(id="count" role="status" aria-live="polite">Showing )\d+ of \d+/,'$1'+Math.min(active.length,8)+' of '+active.length)
 .replace(/<footer>[\s\S]*?<\/footer>/,'<footer>Personal Surge modules · <a href="'+repo+'/tree/main/Modules">Source files</a> · <a href="'+repo+'/blob/main/Modules/README.md">Module guide</a>. Code updates and device-check dates are separate. Upstream icons are referenced, not mirrored. If Safari cannot open Surge, tap Copy URL and import from Surge.</footer>');
for(const kind of ['Ad Remove','Hack VIP','Utilities']){
 const re=new RegExp('(data-category="'+kind+'" aria-pressed="false">'+kind+' )\\d+');
 html=html.replace(re,'$1'+n(kind));
}
if(!html.includes('id="module-extra-style"'))html=html.replace('</head>','<style id="module-extra-style">.module-actions{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:11px;font-size:12px}.module-actions a{color:var(--blue);text-decoration:none}.copy-module{cursor:pointer;border:1px solid var(--border);border-radius:9px;background:var(--paper);color:var(--text);min-height:42px;padding:0 12px;font:inherit;font-weight:600}.module small{line-height:1.5;display:block}.app-emoji{display:flex;align-items:center;justify-content:center;background:var(--border);font-size:13px;font-weight:800;border-radius:9px;color:var(--text)}</style>\n</head>');
html=html.replace('el.textContent="🧩";','el.textContent=(img.getAttribute("data-initial")||"APP").slice(0,2);')
 .replace('(!q||x.textContent.toLowerCase().indexOf(q)>=0)','(!q||(x.textContent+" "+(x.getAttribute("data-aliases")||"")).toLowerCase().indexOf(q)>=0)');
if(!html.includes('id="module-copy-handler"'))html=html.replace('</body>','<script id="module-copy-handler">document.addEventListener("click",async function(e){var b=e.target.closest(".copy-module");if(!b)return;var url=b.getAttribute("data-url");try{if(!navigator.clipboard)throw Error("Unavailable");await navigator.clipboard.writeText(url);b.textContent="Copied";setTimeout(function(){b.textContent="Copy URL"},1800)}catch(_){window.prompt("Copy module URL",url)}});</script>\n</body>');
let md='# Surge iOS Modules\n\n**'+active.length+' modules** · **'+n('Ad Remove')+' Ad Remove** · **'+n('Hack VIP')+' Hack VIP** · **'+n('Utilities')+' Utilities**\n\n[📱 Open mobile installer]('+pages+') · [📁 Source files]('+repo+'/tree/main/Modules)\n\nCode update dates are taken from each module file’s last Git commit; device verification is listed separately. Use iPhone Safari to install and enable MITM/Scripting when a module requires it.\n\n';
for(const [label,regex] of [['0–D',/^[0-9A-D]/i],['E–M',/^[E-M]/i],['N–S',/^[N-S]/i],['T–Z',/^[T-Z]/i]]){
 const list=active.filter(x=>regex.test(x.name));if(!list.length)continue;
 md+='<details>\n<summary><strong>'+label+'</strong> · '+list.length+' modules</summary>\n\n';
 for(const m of list)md+='### <img src="'+m.icon+'" width="26" height="26" alt=""> '+m.name+'\n\n'+m.description+'\n\n<sub>Code updated '+m.updated+' · '+state(m)+'</sub>\n\n[**📲 Install in Surge**](https://link.lxya.de/surge/install-module?url='+encodeURIComponent(m.url)+') · [Source]('+repo+'/blob/main/Modules/'+encodeURIComponent(m.file)+')\n\n';
 md+='</details>\n\n';
}
md+='## Installation troubleshooting\n\nIf Safari cannot open Surge, copy the module URL from the [installer]('+pages+') and import it in Surge. Only enable one overlapping module per app. Check HTTPS inspection and script permissions if filtering does not work.\n\nThe old TxvideoAD.sgmodule URL is kept as an identical alias of TencentVideo.sgmodule but is hidden from the installer. Icons link to upstream hosts; Pages uses text initials if an icon fails to load.\n';
const outputs={'docs/index.html':html,'Modules/README.md':md},changed=[];
for(const [f,body] of Object.entries(outputs))if(read(f)!==body){changed.push(f);if(!check)fs.writeFileSync(path.join(root,f),body);}
if(check&&changed.length){console.error('Indexes stale: '+changed.join(', '));process.exit(1);}
console.log(JSON.stringify({passed:true,checkOnly:check,visible:active.length,all:mods.length,changed}));