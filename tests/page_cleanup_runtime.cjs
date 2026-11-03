// SPDX-License-Identifier: MIT
// Sanitized fixtures based on device-observed layouts; no captured account data.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
let cases = 0;
function clean(file, url, input) {
  let output, calls = 0;
  vm.runInNewContext(read(file), {
    $request: {url, headers: {}},
    $response: {body: typeof input === 'string' ? input : JSON.stringify(input)},
    $done(value) { output = value || {}; calls++; },
  }, {timeout: 1000});
  assert.equal(calls, 1);
  cases++;
  return output.body ? JSON.parse(output.body) : input;
}
const goofish = (api, input) => clean('Modules/Scripts/Goofish.js', 'https://acs.m.goofish.com/gw/' + api + '/1.0/', input);
const member = {exContent: {type: 'normal', tips: 'level benefits'}};
const profile = {data: {base: {avatar: 'keep', name: 'fixture'}, container: {sections: [
  {sectionBizCode: 'user2026', item: {level: member, collect: {value: 2}, history: {value: 3}}},
  {sectionBizCode: 'trade2026', item: {publish: {value: 1}, buy: {value: 2}}},
  {sectionBizCode: 'recycle202511'}, {sectionBizCode: 'entry2025'}, {sectionBizCode: 'card2026'},
]}}};
let result = goofish('mtop.idle.user.page.my.adapter', profile);
assert.deepEqual(result.data.base, profile.data.base);
assert.deepEqual(result.data.container.sections, profile.data.container.sections.slice(0, 2));
assert.deepEqual(result.data.container.sections[0].item.level, member);
result = goofish('mtop.taobao.idlehome.home.circle.list', {data: {
  headList: [{bizCode: 'market'}, {bizCode: 'main'}],
  circleList: [{bizCode: 'follow'}, {bizCode: 'home', circleId: '2'}, {bizCode: 'new'}], selectedCircleId: '2',
}});
assert.deepEqual(result.data.headList, [{bizCode: 'main'}]);
assert.deepEqual(result.data.circleList, [{bizCode: 'home', circleId: '2'}]);
assert.equal(result.data.selectedCircleId, '2');
const unknownTabs = {data: {headList: [{bizCode: 'unknown'}], circleList: [{bizCode: 'other'}]}};
assert.deepEqual(goofish('mtop.taobao.idlehome.home.circle.list', unknownTabs), unknownTabs);
const goods = [{data: {bizType: 'item', id: 1}}, {template: {name: 'fish_home_feeds_commodity_card_2'}, data: {id: 2}}];
result = goofish('mtop.taobao.idlehome.home.nextfresh', {data: {homeTopList: [{sectionType: 'kingkongDo'}], widgetReturnDO: {}, sections: [
  goods[0], {data: {bizType: 'AD'}}, {data: {bizType: 'mamaAD'}}, goods[1],
]}});
assert.deepEqual(result.data.sections, goods);
assert.deepEqual(result.data.homeTopList, []);
assert.equal(result.data.widgetReturnDO, undefined);
const amdcPattern = read('Modules/Goofish.sgmodule').split('\n').find(line => line.startsWith('^http:')).split(' data-type=')[0];
assert(new RegExp(amdcPattern).test('http://amdc.m.taobao.com/amdc/mobileDispatch?x=1&appkey=12431167'));
assert(!new RegExp(amdcPattern).test('http://amdc.m.taobao.com/amdc/mobileDispatch?appkey=99999'));

const pupu = input => clean('Modules/Scripts/PuPuMall.js', 'https://j1.pupuapi.com/client/marketing/advertisement/v1?region_codes=1,2,50,100,140,2400', input);
const home = {region_code: 1, positions: [{component_code: 120, value: 'normal goods'}]};
const services = {component_code: 560, advertisements: {560: [{title: '客服'}, {title: '收货地址'}]}};
const support = {region_code: 2400, positions: [{component_code: 2400, value: 'top support'}]};
const expectedPuPu = {errcode: 0, data: [home, {region_code: 2, positions: [services]}, support], orders: {keep: true}};
for (const duration of [3000, 5000]) {
  const input = {errcode: 0, data: [home,
    {region_code: 50, positions: [{ext_params: {show_duration: duration}}]},
    {region_code: 100, positions: []}, {region_code: 140, positions: [{title: '直播'}]},
    {region_code: 2, positions: [{component_code: 890, title: '免费返45'}, services, {component_code: 60, title: '轮播'}]}, support,
  ], orders: {keep: true}};
  assert.deepEqual(pupu(input), expectedPuPu);
}
assert.deepEqual(pupu(expectedPuPu), expectedPuPu);
const splashPattern = read('Modules/PuPuMall.sgmodule').split('\n').find(line => line.includes('position_types=100') && line.endsWith(' - reject')).split(' - reject')[0];
assert(new RegExp(splashPattern).test('https://j1.pupuapi.com/client/marketing/banner/v7?store_id=fixture&position_types=100'));
assert(!new RegExp(splashPattern).test('https://j1.pupuapi.com/client/marketing/banner/v7?position_types=2%2C100&store_id=fixture'));
for (const file of ['Modules/Scripts/Goofish.js', 'Modules/Scripts/PuPuMall.js']) {
  assert.equal(clean(file, 'https://example.com/unrelated', 'invalid json'), 'invalid json');
}
function smzdm(url, input) {
  let result = input, matches = 0;
  for (const line of read('Modules/SMZDM-AdFilter-Complete.sgmodule').split('\n')) {
    const m = line.match(/^http-response-jq (\S+) '(.*)'$/);
    if (!m) continue;
    const insensitive = m[1].startsWith('(?i)');
    if (!new RegExp(insensitive ? m[1].slice(4) : m[1], insensitive ? 'i' : '').test(url)) continue;
    result = JSON.parse(execFileSync('jq', ['-c', m[2]], {input: JSON.stringify(result), encoding: 'utf8'}));
    matches++;
  }
  assert(matches > 0); cases++;
  return result;
}
const normal = {cell_type: 'normal', title: 'keep'};
result = smzdm('https://s-api.smzdm.com/sou/list_v10?keyword=fixture', {data: {rows: [normal, {model_type: 'ads'}], top_aladdin: [
  {cell_type: 25105}, {ai_search_type: 'scene_ranking'}, {ad: true}, normal,
]}});
assert.deepEqual(result.data.rows, [normal]);
assert.deepEqual(result.data.top_aladdin, [normal]);
result = smzdm('https://user-api.smzdm.com/vip', {data: {xinren_fuli: {}, featured_activitys: [], services: [{title: 'fallback'}], member: {keep: true}}});
assert.deepEqual(result.data, {services: [{}], member: {keep: true}});
result = smzdm('https://user-api.smzdm.com/vip/creator_user_center', {data: {card: [{}], title: 'keep'}});
assert.deepEqual(result.data, {card: [], title: 'keep'});
result = smzdm('https://interest-api.smzdm.com/interest/home_interest_icon_list', {data: {rows: [{}], all_interest_redirect_data: {}, goods: 'keep'}});
assert.deepEqual(result.data, {rows: [], goods: 'keep'});
console.log(`PASS: ${cases} page-cleanup cases; Goofish level/trades, PuPu 3/5s splash and services, SMZDM normal search and approved placeholder.`);
