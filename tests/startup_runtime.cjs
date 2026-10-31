// SPDX-License-Identifier: MIT
// Synthetic fixtures only; no real device requests or account data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'JS/ChinaMobile-startup.surge.js'), 'utf8');
const key = Buffer.from(source.match(/var AES_KEY = "([^"]+)"/)[1]);
const iv = Buffer.from(source.match(/var AES_IV = "([^"]+)"/)[1]);
function encrypt(value) {
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  return Buffer.concat([cipher.update(JSON.stringify(value)), cipher.final()]).toString('base64');
}
function decrypt(value) {
  const cipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  return JSON.parse(Buffer.concat([cipher.update(Buffer.from(value, 'base64')), cipher.final()]).toString());
}
function run(value, {nonce = true, protocol = '14', raw = false} = {}) {
  const body = raw ? value : encrypt(value);
  let calls = 0, result;
  vm.runInNewContext(source, {
    $request: {url: 'https://client.app.coc.10086.cn/biz-orange/DN/init/startInit', headers: nonce ? {'X-Nonce': 'test-nonce'} : {}},
    $response: {status: 200, body, headers: {'X-Pen': protocol, 'Content-Length': String(body.length), 'X-Fixture': 'keep'}},
    $done(value) {calls++; result = value;}, console: {log() {}},
  }, {timeout: 2000});
  assert.equal(calls, 1);
  return JSON.parse(JSON.stringify(result));
}
const normal = {cacheInfo: {cacheItem: [{busCode: 'fixture', busTimestamp: '1'}]}, riskSwitch: '1', domainSwitchState: '1'};
const payload = {retCode: '000000', retDesc: 'success', rspBody: {...normal,
  startImgInfo: {showSeconds: '3', startImgurl: 'fixture', elementMap: {showType: '1'}},
  startImgurl: 'fixture', videoUrl: '', actionUrl: 'fixture', marketId: 'fixture', videoMarketId: '', sdkAdWaitTime: 500}};
const result = run(payload), decoded = decrypt(result.body);
assert.equal(decoded.retCode, payload.retCode);
assert.equal(decoded.retDesc, payload.retDesc);
for (const [name, value] of Object.entries(normal)) assert.deepEqual(decoded.rspBody[name], value);
assert.deepEqual(decoded.rspBody.startImgInfo, {});
assert.equal(decoded.rspBody.sdkAdWaitTime, 0);
for (const name of ['startImgurl', 'videoUrl', 'actionUrl', 'marketId', 'videoMarketId']) assert.equal(decoded.rspBody[name], '');
assert.equal(result.headers['r-token'], crypto.createHash('md5').update('test-nonce+' + result.body).digest('hex'));
assert.equal(result.headers['X-Fixture'], 'keep');
assert.equal(Object.keys(result.headers).some(k => k.toLowerCase() === 'content-length'), false);
for (const [value, options] of [
  [{retCode: 'error', rspBody: payload.rspBody}, {}], [{retCode: '000000'}, {}],
  [{retCode: '000000', rspBody: {...normal, startImgInfo: {}, sdkAdWaitTime: 0}}, {}],
  ['invalid cipher', {raw: true}], [payload, {nonce: false}], [payload, {protocol: 'unknown'}],
]) assert.deepEqual(run(value, options), {});

const mobile = fs.readFileSync(path.join(root, 'Modules/ChinaMobile.sgmodule'), 'utf8');
const startup = mobile.split('\n').find(line => line.startsWith('CM-startup ='));
assert.ok(startup.includes('type=http-response') && !startup.includes('debug=true'));
assert.ok(startup.includes('https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/JS/ChinaMobile-startup.surge.js'));
const localRules = mobile.split('[Map Local]')[1].split('[MITM]')[0];
assert.equal(localRules.includes('/DN/init/startInit'), false);
const requestRule = mobile.split('\n').find(line => line.startsWith('CM-splash-init ='));
assert.equal(requestRule.includes('init/startInit'), false);
assert.ok(requestRule.includes('explorePage/getAdverList'));

const smzdm = fs.readFileSync(path.join(root, 'Modules/SMZDM-AdFilter-Complete.sgmodule'), 'utf8');
const jqLine = smzdm.split('\n').find(line => line.startsWith('http-response-jq ') && line.includes('/loading'));
assert.ok(jqLine);
const expression = jqLine.slice(jqLine.indexOf(" '") + 2, -1);
function rewrite(value) {
  return JSON.parse(execFileSync('jq', ['-c', expression], {input: JSON.stringify(value), encoding: 'utf8'}));
}
const campaign = {id: 'fixture', is_show_ad: '1', start_date: '2026-10-31 00:00:00', end_date: '2026-10-31 23:59:59',
  unix_start_date: '1793376000', unix_end_date: '1793462399', title: 'fixture', pic_url: 'fixture'};
const envelope = {error_code: '0', error_msg: '', keep: {normal: true}, data: [campaign]};
const rewritten = rewrite(envelope);
assert.deepEqual({...rewritten, data: null}, {...envelope, data: null});
assert.equal(rewritten.data[0].is_show_ad, '0');
assert.ok(Number(rewritten.data[0].unix_end_date) < 1000000000);
assert.equal(rewritten.data[0].id, campaign.id);
assert.equal(rewritten.data[0].title, campaign.title);
assert.equal(rewritten.data[0].pic_url, campaign.pic_url);
for (const fixture of [{}, {data: null}, {data: []}, {data: {normal: true}}, {data: ['keep', null, 1]}]) {
  assert.deepEqual(rewrite(fixture), fixture);
}
assert.equal(smzdm.split('[Map Local]')[1].split('[MITM]')[0].includes('/loading'), false);
console.log('PASS: China Mobile crypto/signature/pass-through cases and SMZDM splash jq preservation.');
