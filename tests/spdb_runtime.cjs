// SPDX-License-Identifier: MIT
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const code = fs.readFileSync(path.join(root, 'JS/pdxb.surge.js'), 'utf8');
const mod = fs.readFileSync(path.join(root, 'Modules/SPDB.sgmodule'), 'utf8');
let cases = 0;
function run(body, overrides = {}) {
  let calls = 0, result; const logs = [];
  const context = {
    $request: {url: 'https://image.spdbccc.com.cn/splash.jpg?private=test-value', method: 'GET'},
    $response: {status: 200, body},
    console: {log(message) { logs.push(message); }},
    ...overrides,
    $done(value) { calls++; result = JSON.parse(JSON.stringify(value || {})); },
  };
  vm.runInNewContext(code, context, {timeout: 1000});
  assert.equal(calls, 1);
  assert.ok(logs.every(message => !message.includes('test-value') && !message.includes('https://')));
  cases++;
  return {result, logs};
}
function png(w, h) {
  // Header and complete IHDR chunk; the parser only needs image metadata.
  const b = Buffer.alloc(33);
  Buffer.from([137,80,78,71,13,10,26,10]).copy(b);
  b.writeUInt32BE(13, 8); b.write('IHDR', 12); b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20);
  b[24] = 8; b[25] = 2;
  return b;
}
function gif(w, h) { const b = Buffer.alloc(14); b.write('GIF89a'); b.writeUInt16LE(w, 6); b.writeUInt16LE(h, 8); b[13] = 0x3b; return b; }
function jpeg(w, h, marker = 0xc0) {
  const b = Buffer.from([0xff,0xd8,0xff,marker,0,11,8,0,0,0,0,1,1,0x11,0,0xff,0xd9]);
  b.writeUInt16BE(h, 7); b.writeUInt16BE(w, 9); return b;
}
for (const make of [png, gif, jpeg]) {
  assert.deepEqual(run(make(1125, 1931)).result, {abort: true});
  for (const size of [[1124,1931], [1125,1932], [1931,1125], [1206,2622], [0,1931]]) {
    assert.deepEqual(run(make(...size)).result, {});
  }
  // Example custom dimensions are arbitrary fixtures, not an 18 Pro adaptation claim.
  assert.deepEqual(run(make(600, 900), {$argument: 'width=600&height=900&log=0'}), {result: {abort:true}, logs: []});
  const padded = Buffer.concat([Buffer.from([0,0]), make(1125,1931), Buffer.from([0])]);
  assert.deepEqual(run(new Uint8Array(padded.buffer, padded.byteOffset + 2, padded.length - 3)).result, {abort:true});
  const full = new Uint8Array(make(1125,1931));
  assert.deepEqual(run(full.buffer).result, {abort:true});
}
assert.deepEqual(run(jpeg(1125,1931,0xc2)).result, {abort:true});
for (const body of [null, undefined, '', 'not binary', Buffer.alloc(0), Buffer.from('RIFF....WEBP'), png(1125,1931).subarray(0,24), gif(1125,1931).subarray(0,10), jpeg(1125,1931).subarray(0,10)]) {
  assert.deepEqual(run(body).result, {});
}
const fakePng = png(1125,1931); fakePng.write('nope',12);
assert.deepEqual(run(fakePng).result, {});
const badJpeg = jpeg(1125,1931); badJpeg.writeUInt16BE(2,4);
assert.deepEqual(run(badJpeg).result, {});
const entropy = Buffer.concat([Buffer.from([0xff,0xd8,0xff,0xda,0,2]),jpeg(1125,1931).subarray(2)]);
assert.deepEqual(run(entropy).result, {});
for (const value of ['0','-1','1.5','65536','NaN','{{{width}}}']) {
  assert.deepEqual(run(png(1125,1931), {$argument: 'width=' + value + '&height=1931'}).result, {});
}
for (const url of ['https://api.spdbccc.com.cn/a','https://images.spdbccc.com.cn.evil.invalid/a','https://image.spdbccc.com.cn/','https://www.example.com/a']) {
  assert.deepEqual(run(png(1125,1931), {$request: {url, method:'GET'}}).result, {});
}
for (const status of [206,304,404]) {
  assert.deepEqual(run(png(1125,1931), {$response: {status,body:png(1125,1931)}}).result, {});
}
assert.deepEqual(run(png(1125,1931), {$request: {url:'https://images.spdbccc.com.cn/ad',method:'POST'}}).result, {});
assert.deepEqual(run(png(1125,1931), {$request: {url:'https://images.spdbccc.com.cn/ad',method:'GET'}}).result, {abort:true});
assert.match(mod, /binary-body-mode=true/); assert.match(mod, /max-size=-1/);
assert.match(mod, /argument="width=\{\{\{width\}\}\}&height=\{\{\{height\}\}\}&log=\{\{\{log\}\}\}"/);
assert.match(mod, /hostname = %APPEND% image\.spdbccc\.com\.cn, images\.spdbccc\.com\.cn/);
assert.doesNotMatch(mod, /\[Rule\]|skip-server-cert-verify|\*\.spdbccc/);
console.log(`PASS: ${cases} SPDB cases; exact dimensions, explicit abort, other sizes unchanged, malformed input, URL scope and private-free logging.`);
