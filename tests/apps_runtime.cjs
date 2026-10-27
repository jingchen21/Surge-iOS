// SPDX-License-Identifier: MIT
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const zlib = require('node:zlib');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
let checks = 0;
function run(file, url, {body, requestBody, qx = false} = {}) {
  let calls = 0, result;
  const context = {
    $request: {url, headers: {}},
    $done(value) { calls++; result = value || {}; },
    console: {log() {}},
  };
  function attach(target, value) {
    if (typeof value === 'string') target.body = value;
    else if (value !== undefined) target[qx ? 'bodyBytes' : 'body'] = value;
  }
  attach(context.$request, requestBody);
  if (body !== undefined) { context.$response = {headers: {}, status: 200}; attach(context.$response, body); }
  vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {timeout: 2000});
  assert.equal(calls, 1, `${file}: $done must run exactly once`);
  if (result.bodyBytes !== undefined) { result = {...result, body: new Uint8Array(result.bodyBytes)}; delete result.bodyBytes; }
  const normalized = {};
  for (const [key, value] of Object.entries(result)) {
    normalized[key] = ArrayBuffer.isView(value) ? Buffer.from(value.buffer, value.byteOffset, value.byteLength)
      : Object.prototype.toString.call(value) === '[object ArrayBuffer]' ? Buffer.from(value)
      : JSON.parse(JSON.stringify(value));
  }
  return normalized;
}
function parity(url, options) {
  const original = run('maintenance/apps/source/Txvideoad.js', url, {...options, qx: true});
  const converted = run('JS/Txvideoad.surge.js', url, options);
  assert.deepEqual(converted, original);
  checks++;
  return converted;
}
function varint(n) { const a = []; do { let b = n & 127; n = Math.floor(n / 128); a.push(b | (n ? 128 : 0)); } while (n); return Buffer.from(a); }
function bytes(f, value) { const b = typeof value === 'string' ? Buffer.from(value) : value; return Buffer.concat([varint(f * 8 + 2), varint(b.length), b]); }
function frame(body, header = Buffer.alloc(0)) {
  const h = Buffer.alloc(16); h[0] = 9; h[1] = 48;
  h.writeUInt32BE(16 + header.length + body.length, 4); h.writeUInt16BE(header.length, 8);
  return Buffer.concat([h, header, body]);
}
for (const name of ['GetSplashPreload', 'GetSplashRealtimePoll', 'GetUnrelatedData']) {
  const input = frame(Buffer.alloc(0), bytes(7, '/trpc.business_splash.ad_ssp_splash.splashService/' + name));
  for (const compressed of [false, true]) {
    const data = compressed ? zlib.gzipSync(input) : input;
    // Nonzero offsets verify that typed-array views are not widened accidentally.
    const padding = Buffer.concat([Buffer.from([17, 18]), data, Buffer.from([19])]);
    const view = new Uint8Array(padding.buffer, padding.byteOffset + 2, data.length);
    const result = parity('https://i.video.qq.com/', {requestBody: view});
    if (name === 'GetUnrelatedData') assert.deepEqual(result, {});
    else { assert.ok(Buffer.isBuffer(result.body)); assert.notDeepEqual(result.body, data); }
  }
}

// The latest change removes an all-ad feed module but preserves a mixed module.
function any(name) { return bytes(1, 'type.googleapis.com/test.' + name); }
function feedModule(names) {
  const blocks = Buffer.concat(names.map(name => bytes(1, bytes(4, any(name)))));
  return Buffer.concat([bytes(1, 'module.123.456'), bytes(2, bytes(5, blocks)), bytes(6, 'waterfall_feeds_module_mergeid')]);
}
for (const names of [['AdFeedInfo'], ['AdFeedInfo', 'ArticleInfo']]) {
  const input = frame(Buffer.concat([Buffer.from([8, 7]), bytes(9, feedModule(names))]));
  const result = parity('https://i.video.qq.com/', {body: new Uint8Array(input)});
  if (names.includes('ArticleInfo')) {
    // The new logic deliberately leaves a mixed module untouched.
    assert.deepEqual(result, {});
  } else {
    assert.ok(Buffer.isBuffer(result.body));
    assert.equal(result.body.includes(Buffer.from('AdFeedInfo')), false);
    assert.equal(result.body.includes(Buffer.from('waterfall_feeds_module_mergeid')), false);
  }
}

function jInt(n) { return n === 0 ? Buffer.from([12]) : Buffer.from([0, n]); }
function simple(tag, data) { return Buffer.concat([Buffer.from([(tag << 4) | 13, 0]), jInt(data.length), data]); }
function pauseFrame(marker) {
  const text = Buffer.from(marker);
  const list = Buffer.concat([Buffer.from([9]), jInt(1), Buffer.from([6, text.length]), text]);
  const wrapped = Buffer.concat([Buffer.from([0x1a]), simple(1, list), Buffer.from([0x0b])]);
  const innerHeader = Buffer.alloc(16); innerHeader[0] = 0x26;
  const inner = Buffer.concat([innerHeader, simple(1, wrapped), Buffer.from([0x28])]);
  inner.writeUInt32BE(inner.length, 1);
  const outer = Buffer.alloc(80); outer[0] = 0x13;
  outer.writeUIntBE(129196, 8, 3); outer.writeUInt32BE(inner.length, 76);
  const full = Buffer.concat([outer, zlib.gzipSync(inner), Buffer.from([3])]);
  full.writeUInt32BE(full.length, 1);
  return full;
}
for (const marker of ['livemsg', 'normal-content']) {
  const input = pauseFrame(marker);
  const result = parity('https://iacc.qq.com/', {body: new Uint8Array(input)});
  if (marker === 'normal-content') assert.deepEqual(result, {});
  else {
    assert.ok(Buffer.isBuffer(result.body));
    assert.equal(result.body.readUInt32BE(1), result.body.length);
    const inside = zlib.gunzipSync(result.body.subarray(80, -1));
    assert.equal(result.body.readUInt32BE(76), inside.length);
    assert.equal(inside.includes(Buffer.from('livemsg')), false);
  }
}

function abEntry(key, value) { return bytes(3, Buffer.concat([bytes(1, key), bytes(2, bytes(1, JSON.stringify(value)))])); }
const ab = Buffer.concat([Buffer.from([8, 100]),
  abEntry('simple_mode_config', {enable: 0, feature_config: {enable: 0, tab_bar_cut_enable: 0}}),
  abEntry('ios_nx_netframework_compatible', {quic: {enabled: true, allPbReqEnabled: true, allJceReqEnabled: true}}),
  abEntry('network_resolve_config', {enablePreResolve: true, enableNac: true, enableHdns: true})]);
for (const compressed of [false, true]) {
  const result = parity('https://config.ab.qq.com/tab/GetTabRemoteConfig', {body: new Uint8Array(compressed ? zlib.gzipSync(ab) : ab)});
  const data = compressed ? zlib.gunzipSync(result.body) : result.body;
  assert.ok(data.includes(Buffer.from('"enabled":false')));
  assert.ok(data.includes(Buffer.from('"tab_bar_cut_whitelist":"0;2;4"')));
  assert.ok(data.includes(Buffer.from('"enableHdns":false')));
}
for (const body of ['{"tab_gray":true,"keep":1}', '{"tab_gray":false}', 'not-json']) {
  const r = parity('https://rdelivery.qq.com/v1/sdkconfig/get', {body});
  if (body.includes(':true')) assert.equal(JSON.parse(r.body).tab_gray, false);
  else assert.deepEqual(r, {});
}
for (const body of [new Uint8Array([0, 1, 2]), new Uint8Array(), 'unexpected-text']) {
  assert.deepEqual(parity('https://i.video.qq.com/', {body}), {});
}

function mt(url, value) {
  const body = typeof value === 'string' ? value : JSON.stringify(value);
  const original = run('maintenance/apps/source/MT.js', url, {body});
  const converted = run('JS/Meituan.surge.js', url, {body});
  assert.deepEqual(converted, original); checks++;
  return converted.body ? JSON.parse(converted.body) : null;
}
let v = mt('https://apimobile.meituan.com/aggroup/indexTab', {data: {resource: {tabArea: ['homepage','video','xiaotuan','mine','order'].map(tabName => ({tabName}))}}, keep: 1});
assert.deepEqual(v.data.resource.tabArea.map(x => x.tabName), ['homepage','mine','order']);
assert.equal(v.keep, 1);
assert.equal(mt('https://apimobile.meituan.com/aggroup/indexTab', {data: {resource: {tabArea: [{tabName: 'video'}]}}}), null);
for (const scene of ['gwc_feed1_2265', 'personalcenter_2154']) {
  v = mt('https://feedguess.meituan.com/lycoris/scene/' + scene, {data: [1,2], keep: 1});
  assert.deepEqual(v.data, []); assert.equal(v.bottom, true); assert.equal(v.ext.forbidByExp, true); assert.equal(v.keep, 1);
}
assert.equal(mt('https://feedguess.meituan.com/lycoris/scene/unrelated', {data: [1]}), null);
v = mt('https://mt-personalcenter.meituan.com/usercenter/display', {children: [{name:'mine_cross_recommend'},{name:'orders'},{name:'wallet'}]});
assert.deepEqual(v.children.map(x=>x.name), ['orders','wallet']);
v = mt('https://apimobile.meituan.com/group/v1/deal/searchpage/defaultword', {searchIntroduceResponse: {defaultWordRes: {defaultWordItems:[1]}, HotWordInfos:[2], keep:3}});
assert.deepEqual(v.searchIntroduceResponse.defaultWordRes.defaultWordItems, []); assert.equal(v.searchIntroduceResponse.keep,3);
v = mt('https://apimobile.meituan.com/group/v1/deal/searchpage/hotword/city/divide/hotrecommend/', {data: {segmentsV2: [{hotwordSegments:[{pageName:'EntranceHotwordsV2Hotwords'}]},{hotwordSegments:[{pageName:'ordinary'}]}], aiSearchBubble: {bubbleTexts:[1]}}});
assert.equal(v.data.segmentsV2.length,1); assert.deepEqual(v.data.aiSearchBubble.bubbleTexts,[]);
v = mt('https://assistify.meituan.com/assistant/getAppClientHornConfig', {data: JSON.stringify({skills:{ad:1},keep:2})});
assert.deepEqual(JSON.parse(v.data),{skills:{},keep:2});
for (const [url,key] of [['mop/entry/shoppingCartEntry','topBannerArea'],['api/entryModule/startupPicture','startupPicArea']]) {
  v = mt('https://mop.meituan.com/'+url,{data:{resourcesMap:{[key]:[1],keep:2}},resource:{[key]:[3]}});
  assert.deepEqual(v.data.resourcesMap[key],[]);assert.equal(v.data.resourcesMap.keep,2);assert.deepEqual(v.resource[key],[]);
}
for (const url of ['https://apimobile.meituan.com/pay/order','https://apimobile.meituan.com/login','https://apimobile.meituan.com/bike/scan']) {
  assert.equal(mt(url,{data:{keep:1}}),null);
}
for (const body of ['not-json','', '{}']) assert.equal(mt('https://apimobile.meituan.com/aggroup/indexTab',body),null);

// Restore the older My Page service cleanup without losing current recommendation removal.
const toolsUrl = 'https://mt-personalcenter.meituan.com/usercenter/display';
const dropTools = ['xiaomeipingshen','meituangongyi','qiyefuwu','ruzhumeituan','mt_mine_myshop','zhaodianhuzhu'];
const toolsInput = {children: [
  {name:'mine_cross_recommend',data:{ads:[1]}},
  {name:'mine_serviceV3',data:{newTools:[...dropTools.map(identification=>({identification})),{identification:'orders'},{identification:'wallet'},{identification:'coupon'}],keep:7}},
  {name:'orders',data:{keep:8}}, {name:'wallet',data:{keep:9}}
],keep:10};
let enhanced = run('JS/Meituan.surge.js',toolsUrl,{body:JSON.stringify(toolsInput)});
v = JSON.parse(enhanced.body); checks++;
assert.deepEqual(v.children.map(x=>x.name),['mine_serviceV3','orders','wallet']);
assert.deepEqual(v.children[0].data.newTools.map(x=>x.identification),['orders','wallet','coupon']);
assert.equal(v.children[0].data.keep,7);assert.equal(v.keep,10);
const legacyOnly = run('maintenance/apps/source/MTAppAdCleanMine.js',toolsUrl,{body:JSON.stringify(toolsInput)});
assert.deepEqual(JSON.parse(legacyOnly.body).children.find(x=>x.name==='mine_serviceV3').data.newTools,v.children[0].data.newTools);
for (const tools of [dropTools.map(identification=>({identification})),[],null]) {
  const input={children:[{name:'mine_serviceV3',data:{newTools:tools}}]};
  assert.deepEqual(run('JS/Meituan.surge.js',toolsUrl,{body:JSON.stringify(input)}),{});checks++;
}

// The generic older script belongs to WeChat's Meituan mini-program, not the App.
const miniCases = [
  ['https://web.meituan.com/api/miniprogram/tabbar/all/query',{data:[{name:'首页'},{name:'视频'},{name:'神券'},{name:'我的'},{name:'广告'}]},r=>assert.deepEqual(r.data.map(x=>x.name),['首页','神券','我的'])],
  ['https://web.meituan.com/api/miniprogram/index/aggregate',{data:{oneCentBuy:{ad:1},keep:2}},r=>assert.deepEqual(r.data,{keep:2})],
];
for(const [url,input,verify] of miniCases){
  const body=JSON.stringify(input);
  const result=run('JS/MeituanMiniProgram.surge.js',url,{body});
  assert.deepEqual(result,run('maintenance/apps/source/MeiTuanNoAd.js',url,{body}));
  verify(JSON.parse(result.body));checks++;
}
const miniModule=fs.readFileSync(path.join(root,'Modules/Meituan.sgmodule'),'utf8');
assert.equal([...miniModule.matchAll(/MeituanMini-\d+ =/g)].length,2);
assert.equal([...miniModule.matchAll(/data-type=text/g)].length,6);
assert.doesNotMatch(miniModule,/energy\.xiaojukeji|wx\.17u|wxgateway/);

// All app rewrite patterns must compile; the main Meituan module must not block transport.
for (const module of ['Modules/TencentVideo.sgmodule','Modules/Meituan.sgmodule']) {
  for (const pattern of fs.readFileSync(path.join(root,module),'utf8').matchAll(/pattern=(.*?), requires-body=/g)) new RegExp(pattern[1]);
}
const core = fs.readFileSync(path.join(root,'Modules/Meituan.sgmodule'),'utf8');
assert.doesNotMatch(core,/\[Rule\]|shark-|httpdns|IP-CIDR|mquic/);
assert.equal([...core.matchAll(/script-path=/g)].length,10);
const transport = fs.readFileSync(path.join(root,'Modules/Meituan-Network-Compatibility.sgmodule'),'utf8');
assert.match(transport,/DOMAIN-WILDCARD,mquic-\*\.meituan\.com,REJECT/);
assert.equal([...transport.matchAll(/ - reject$/gm)].length,2);
console.log(`PASS: ${checks} app cases; Tencent binary parity, Meituan 8 routes, merged My Page tools and fail-open behavior.`);
