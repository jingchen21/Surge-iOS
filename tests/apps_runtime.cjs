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

// Preserve QX conversion except the five category-loading rejects; App JS stays upstream.
const core = fs.readFileSync(path.join(root,'Modules/Meituan.sgmodule'),'utf8');
const qx = fs.readFileSync(path.join(root,'maintenance/apps/source/MT.snippet'),'utf8');
const mapping = {host:'DOMAIN','host-wildcard':'DOMAIN-WILDCARD','host-suffix':'DOMAIN-SUFFIX','ip-cidr':'IP-CIDR','ip6-cidr':'IP-CIDR6'};
const expected = qx.split(/\r?\n/).map(line => {
  const match = line.match(/^(host|host-suffix|host-wildcard|ip-cidr|ip6-cidr),\s*([^,]+),\s*reject$/i);
  if (!match) return null;
  const kind = mapping[match[1]];
  return kind + ',' + match[2] + ',REJECT' + (kind.startsWith('IP-CIDR') ? ',no-resolve' : ',extended-matching');
}).filter(Boolean);
const actual = core.match(/\[Rule\]\n([\s\S]*?)\n\n\[URL Rewrite\]/)[1].split('\n');
assert.equal(expected.length,46);
const categoryConflictRules = new Set([
  'IP-CIDR,203.76.217.241/32,REJECT,no-resolve',
  'IP-CIDR,203.76.217.243/32,REJECT,no-resolve',
  'IP-CIDR,101.50.8.64/32,REJECT,no-resolve',
  'IP-CIDR,103.63.160.64/32,REJECT,no-resolve',
  'IP-CIDR,119.29.48.215/32,REJECT,no-resolve',
]);
assert.equal(expected.filter(rule=>categoryConflictRules.has(rule)).length,5);
assert.equal(actual.length,41);
assert.deepEqual(actual,expected.filter(rule=>!categoryConflictRules.has(rule)));
assert.equal(actual.some(rule=>/,DIRECT(?:,|$)/.test(rule)),false);
const unescapeQx = value => value.split('\\/').join('/');
const qxRewrites = qx.split(/\r?\n/).filter(x=>/ url reject$/.test(x)).map(x=>unescapeQx(x.split(' url reject')[0])+' - reject');
assert.equal(qxRewrites.length,2);
assert.deepEqual(core.match(/\[URL Rewrite\]\n([\s\S]*?)\n\n\[Script\]/)[1].split('\n'),qxRewrites);
const qxPatterns = qx.split(/\r?\n/).filter(x=>x.includes(' url script-response-body ')).map(x=>unescapeQx(x.split(' url script-response-body ')[0]));
const orig = 'https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/MT.js';
const appScripts = core.match(/\[Script\]\n([\s\S]*?)\n\n\[MITM\]/)[1].split('\n');
assert.equal(qxPatterns.length,8);
assert.equal(appScripts.length,8);
appScripts.forEach((line,i)=>assert.equal(line,'MT-'+(i+1)+' = type=http-response,pattern='+qxPatterns[i]+',script-path='+orig+',requires-body=true'));
assert.equal(core.match(/hostname = %APPEND% ([^\n]+)/)[1],qx.match(/^hostname = (.*)$/m)[1]);
assert.doesNotMatch(core,/JS\/Meituan\.surge\.js|MeituanMiniProgram|\[Map Local\]/);
checks++;
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
const miniModule=fs.readFileSync(path.join(root,'Modules/MeituanMiniProgram.sgmodule'),'utf8');
assert.equal([...miniModule.matchAll(/MeituanMini-\d+ =/g)].length,2);
assert.equal([...miniModule.matchAll(/data-type=text/g)].length,6);
assert.doesNotMatch(miniModule,/energy\.xiaojukeji|wx\.17u|wxgateway/);

for (const match of miniModule.matchAll(/pattern=(.*?), requires-body=/g)) new RegExp(match[1]);
assert.equal([...miniModule.matchAll(/script-path=/g)].length,2);
assert.doesNotMatch(miniModule,/\[Rule\]|shark-|httpdns|mquic/);
const appLock = JSON.parse(fs.readFileSync(path.join(root,'maintenance/apps/lock.json'),'utf8'));
assert.equal(appLock.outputs.some(o => o.destination_path === 'Modules/MeituanMiniProgram.sgmodule'),true);
assert.equal(appLock.outputs.some(o => o.destination_path === 'JS/Meituan.surge.js'),false);
console.log(`PASS: ${checks} app cases; Tencent parity, ZenmoFeiShi QX->Surge conversion and separate mini-program.`);
