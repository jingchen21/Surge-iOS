'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const names = {request:'MeituanHornRequest.js', response:'MeituanHornResponse.js'};
let checks = 0;
function run(phase, body, argument = '') {
  const results = [];
  const context = {$request:{body:typeof body==='string'?body:JSON.stringify(body)},
    $response:{body:typeof body==='string'?body:JSON.stringify(body)}, $argument:argument,
    $done:value=>results.push(JSON.parse(JSON.stringify(value))), console:{log(){}}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'Modules/Scripts',names[phase]),'utf8'),context,{timeout:1000});
  assert.equal(results.length,1);
  checks++;
  return results[0];
}
const request = {shark:{etag:'cache-v1',query:'public-options'}, unrelated:{etag:'keep',query:'keep'}};
const refreshed = JSON.parse(run('request',request).body);
assert.deepEqual(refreshed,{...request,shark:{...request.shark,etag:''}});
assert.deepEqual(request.shark.etag,'cache-v1');
for (const value of ['not-json',{}, {shark:[]}, {shark:null}]) assert.deepEqual(run('request',value),{});

const config = {customer:{shark:[{host:'apimobile.meituan.com',blackList:['/existing']},
  {host:'other.meituan.com',paths:['/business']}]}, horn:{version:123,cacheDuration:0}};
for (const asText of [false,true]) {
  const source = {shark:{data:asText?JSON.stringify(config):config,etag:'original'},
    sharkdns:{data:{customer:{enabled:true}},etag:'unchanged'}};
  const patched = JSON.parse(run('response',source).body);
  assert.equal(typeof patched.shark.data,asText?'string':'object');
  const actual = asText?JSON.parse(patched.shark.data):patched.shark.data;
  assert.deepEqual(actual.customer.shark[0].blackList,
    ['/existing','/aggroup/indexTab','/mop/entry/shoppingCartEntry']);
  assert.deepEqual(actual.customer.shark.slice(1),config.customer.shark.slice(1));
  assert.deepEqual(actual.horn,config.horn);
  assert.deepEqual(patched.sharkdns,source.sharkdns);
  assert.equal(patched.shark.etag,'original-uihttp1');
  assert.deepEqual(run('response',patched),{});
}
const mop = JSON.parse(run('response',{shark:{data:{customer:{shark:[{host:'mop.meituan.com'}]}}}}).body);
assert.deepEqual(mop.shark.data.customer.shark[0].blackList,['/mop/entry/shoppingCartEntry']);
for (const source of ['not-json',{}, {shark:{data:'invalid'}},
  {shark:{data:{customer:{shark:[{host:'apimobile.meituan.com',blackList:'unknown-schema'}]}}}},
  {shark:{data:{customer:{shark:[{host:'unrelated.meituan.com'}]}}}}]) {
  assert.deepEqual(run('response',source),{});
}
console.log(`PASS: ${checks} Meituan Horn runtime cases`);
