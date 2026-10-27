// SPDX-License-Identifier: MIT
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const moduleText=fs.readFileSync(path.join(root,'Modules/Didi.sgmodule'),'utf8');
const source=fs.readFileSync(path.join(root,'maintenance/apps/source/Didichuxing.snippet'),'utf8');
const native=[...moduleText.matchAll(/^http-response-jq (\S+) '(.*)'$/gm)];
const original=[...source.matchAll(/^(\S+) url jsonjq-response-body '(.*)'$/gm)];
assert.equal(native.length,12);assert.equal(original.length,12);
assert.equal((moduleText.match(/data-type=text data="\{\}" status-code=200/g)||[]).length,12);
assert.equal((moduleText.match(/^(?:DOMAIN|IP-CIDR),/gm)||[]).length,16);
assert.doesNotMatch(moduleText,/\[Script\]|script-path=/);
let cases=0;
function jq(filter,input){return JSON.parse(execFileSync('jq',['-c',filter],{input:JSON.stringify(input),encoding:'utf8'}));}
function apply(index,url,input){
  const converted=native[index],old=original[index];
  assert.ok(new RegExp(converted[1]).test(url));
  assert.ok(new RegExp(old[1].replace(/\\\//g,'/')).test(url));
  const result=jq(converted[2],input);assert.deepEqual(result,jq(old[2],input));cases++;return result;
}
let v=apply(0,'https://common.diditaxi.com.cn/common/v5/usercenter/layout',{data:{layout:{order:['center_base_info_card','center_marketing_card','center_order_related_card','center_wallet_finance_card']},instances:{center_wallet_finance_card:{data:{view_info:[{title:'优惠卡券'},{title:'贷款'}]}},center_marketing_card:{},center_member_card:{},center_tool_card:{},center_widget_list:{},keep:7}}});
assert.deepEqual(v.data.layout.order,['center_base_info_card','center_order_related_card','center_wallet_finance_card']);
assert.deepEqual(v.data.instances.center_wallet_finance_card.data.view_info,[{title:'优惠卡券'}]);assert.equal(v.data.instances.keep,7);assert.equal(v.data.instances.center_member_card,undefined);
v=apply(1,'https://common.diditaxi.com.cn/common/v6/usercenter/me',{data:{cards:[{title:'天天领福利'},{title:'安全中心'},{title:'行程'},{tag:'wallet',items:[{title:'优惠券'},{title:'金融'}],card_type:4,bottom_items:[{title:'省钱套餐'},{title:'出行里程'},{title:'广告'}]}]}});
assert.equal(v.data.cards.length,2);assert.equal(v.data.cards[0].title,'行程');assert.deepEqual(v.data.cards[1].items,[{title:'优惠券'}]);assert.equal(v.data.cards[1].bottom_items.length,2);
v=apply(2,'https://conf.diditaxi.com.cn/homepage/v6/core',{data:{order_cards:{nav_list_card:{data:['dache_anycar','driverservice','bike','carmate','nav_more_v3','ad'].map(nav_id=>({nav_id}))}},disorder_cards:{bottom_nav_list:{data:['v6x_home','home_page','user_center','ad'].map(id=>({id}))},top_nav_list:{data:{top_nav_info:['旅行','车主','打车'].map(name=>({name}))}}}}});
assert.equal(v.data.order_cards.nav_list_card.data.length,5);assert.equal(v.data.disorder_cards.bottom_nav_list.data.length,3);assert.deepEqual(v.data.disorder_cards.top_nav_list.data.top_nav_info,[{name:'打车'}]);
v=apply(3,'https://api.udache.com/gulfstream/pre-sale/v1/other/pGetSceneList',{data:{scene_list:[{text:'优惠商城'},{text:'打车'}],show_data:[{scene_ids:['scene_coupon_mall','ride']} ]}});
assert.deepEqual(v.data.scene_list,[{text:'打车'}]);assert.deepEqual(v.data.show_data[0].scene_ids,['ride']);
v=apply(4,'https://conf.diditaxi.com.cn/homepage/v1/oversea/layout',{data:{instances:{oversea_main_banner:{ad:1},keep:2}}});assert.deepEqual(v.data.instances,{keep:2});
v=apply(5,'https://api.udache.com/gulfstream/porsche/v1/dache_homepage_layout',{data:{instances:{'xp-card-01':{},keep:2}}});assert.deepEqual(v.data.instances,{keep:2});
v=apply(6,'https://api.udache.com/gulfstream/passenger-center/v2/other/pInTripLayout',{data:{order_components:Array.from({length:10},(_,id)=>({name:id===2?'passenger_common_casper':'keep',id,data:{keep:id}}))}});assert.equal(v.data.order_components.length,9);assert.equal(v.data.order_components.find(x=>x.id===8).data,undefined);assert.deepEqual(v.data.order_components.find(x=>x.id===9).data,{keep:9});
v=apply(7,'https://mapi.xiaojukeji.com/passenger-wallet/api/v1.2/wallet/homepage',{data:{cardList:[{mcode:'other'},{mcode:'index_assets_v6',detailData:{myCreditLimit:9,discountList:[1,2,3,4],noticeList:[1],keep:2}}]}});assert.equal(v.data.cardList.length,1);assert.deepEqual(v.data.cardList[0].detailData,{discountList:[1,2,3],keep:2});
v=apply(8,'https://manhattan.webapp.xiaojukeji.com/zootopia/api/my-assets/get-assets-data',{data:{myQuotaModularRes:{},banner:{},myGuaranteeModularRes:{},assetsData:{myQuotaModularRes:{},banner:{},myGuaranteeModularRes:{},keep:2},keep:3}});assert.deepEqual(v.data,{assetsData:{keep:2},keep:3});
v=apply(9,'https://manhattan.webapp.xiaojukeji.com/zootopia/api/my-assets/module-is-show',{data:{ad:1},keep:2});assert.deepEqual(v,{data:[],keep:2});
v=apply(10,'https://ddpay.xiaojukeji.com/ddpay/api/manhattan-small-change/get-all-config',{data:{result:[1],keep:2}});assert.deepEqual(v.data,{result:[],keep:2});
v=apply(11,'https://ddpay.xiaojukeji.com/ddpay/api/manhattan-small-change/get-apollo-config',{data:{result:{hideList:[1],keep:2}}});assert.deepEqual(v.data.result,{hideList:[],keep:2});
for(const filter of native){
  for(const input of [{keep:1},null,'unexpected']){assert.deepEqual(jq(filter[2],input),input);cases++;}
}
for(const line of moduleText.split('\n')){
  if(line.includes(' data-type='))new RegExp(line.split(' ')[0]);
}
console.log(`PASS: ${cases} DiDi native-jq cases; all 12 transformations match source, 12 mock rules, 16 network rules, no JS dependency.`);
