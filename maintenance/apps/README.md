# 应用模块维护

运行模块、JS、输入快照和转换工具都保存在本仓库。现有文件可离线重新生成，不需要其他仓库继续在线。

## 文件关系

| 输入 | 输出 |
| --- | --- |
| `source/TxvideoAD.snippet` + `source/Txvideoad.js` | `Modules/TencentVideo.sgmodule`、`Modules/TxvideoAD.sgmodule`、`JS/Txvideoad.surge.js` |
| `source/MT.snippet` + `source/MT.js` | `Modules/Meituan.sgmodule`、`Modules/Meituan-Network-Compatibility.sgmodule`、`JS/Meituan.surge.js` |
| `source/MTAppAdCleanMine.js` | 将旧版“我的”服务入口精简合入同一美团 JS，保留当前去推荐逻辑 |
| `source/pdxb.js` | `Modules/SPDB.sgmodule`、`JS/pdxb.surge.js`；用户上传文件，原作者和公开来源未提供 |
| `source/Didichuxing.snippet` | `Modules/Didi.sgmodule`；原生 jq/Map Local，无 JS |
| `source/MeituanMiniProgram.snippet` + `source/MeiTuanNoAd.js` | 合入 `Modules/Meituan.sgmodule`，关联 `JS/MeituanMiniProgram.surge.js`；同一模块中的小程序处理 |

`lock.json` 保存输入和生成文件的哈希。它覆盖历史快照清单中腾讯文件的旧哈希，其他已保存模块不受影响。

## 引用来源

- 腾讯视频、美团的原始规则和处理逻辑：[ZenmoFeiShi/Qx](https://github.com/ZenmoFeiShi/Qx/tree/3e442e78e95be2c71153e55560a977ea42495f27)。
- 早期腾讯 Surge 适配参考：[RoaycL/Surge](https://github.com/RoaycL/Surge)。
- 美团模块转换对照：[muktsoen/SurgeRules/MT.sgmodule](https://github.com/muktsoen/SurgeRules/blob/main/MT.sgmodule)。

来源仅在说明、代码注释和版本记录中标明；目录按用途命名。完整输入快照也已保存，不依赖引用仓库继续在线才能维护现有版本。

## 日后让 AI 修改

1. 页面处理逻辑在 `source/*.js`；接口、域名和路由在 `source/*.snippet`。
2. Surge API 的适配、模块拆分及地址生成在 `scripts/build_apps.py`。
3. 修改后在仓库根目录运行：

```sh
python3 scripts/build_apps.py
python3 scripts/build_apps.py --check
node tests/apps_runtime.cjs
node tests/didi_runtime.cjs
node tests/spdb_runtime.cjs
python3 scripts/check_module_dependencies.py
python3 scripts/check_public.py
```

需要 Python 3.9+、Node.js 18+ 与 jq。生成器不联网，不自动下载更新，也不自动推送；遇到未支持的新规则或二进制 API 变化会停止，让维护者检查。

不要只改生成后的 JS 再运行构建，否则该改动会被输入快照重新生成的内容覆盖。若需要新的上游版本，先取得对应输入文件、检查差异，再替换快照并修改适配逻辑。

## 腾讯二进制适配

业务逻辑保留，专门将 QX 的 `bodyBytes` 读取改为 Surge 的 `body`，返回 `Uint8Array`。二进制接口开启 `binary-body-mode`，`rdelivery` 的 JSON 接口保留文本模式。

模拟测试覆盖普通和 gzip 请求、带偏移的二进制数组、新的暂停广告 JCE 命令、纯广告与混合内容信息流、AB 开关、异常数据原样放行。测试数据是合成数据，不含真实抓包或用户信息。

## 美团拆分

页面模块只处理指定的八类 JSON 响应。网络兼容模块单独保存 SHARK、mquic、HTTPDNS、IPv4/IPv6 拦截和两条 URL 拒绝，不默认并入页面模块。两者合起来保留输入规则的覆盖范围。

现行脚本缺少旧版“我的”页服务入口精简，构建时从存档的 Mine 脚本提取该处理，并与当前推荐区移除合并。`MeiTuanNoAd.js` 的引用已从微信规则中找到，其小程序处理一并合入同一份美团模块，旧版其他文件也已存档，详见 [审查记录](../../docs/MEITUAN_AUDIT.md)。

## 滴滴原生处理

12 条 jq 和 12 条空 JSON 返回转换成 Surge 原生能力，保留 16 条域名/IP 规则。jq 外层加入错误回退，正常样例与原表达式逐项对比。没有虚构 JS 依赖。支付和钱包部分属于界面精简，仍需实际检查 App 当前版本。

真机是否走到这些 HTTP 接口，仍需在 Surge 的请求记录中检查。模拟数据和离线语法检查不能证明当前 App 的每一项功能都兼容。

## 浦大喜奔转换

`source/pdxb.js` 保留上传文件原始字节，当前锁定清单保存 SHA-256。文件没有署名或公开来源，未将其归为其他仓库作者的作品；清单的 QX 基准提交仅对应原 QX 输入。生成器沿用图片头尺寸读取逻辑，加入截断保护和 JPEG 扫描边界，将命中后的 `$done()` 改成 Surge 的 `$done({abort:true})`，原无限制缓冲参数按 Surge 文档改为 `max-size=-1`。完整使用范围与尺寸核对见 [说明](../../docs/SPDB.md)。
