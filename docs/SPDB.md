# 浦大喜奔开屏图片尺寸拦截

[安装模块](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/SPDB.sgmodule)。运行脚本为本仓库的 `JS/pdxb.surge.js`，无外部 JS 依赖。模块、源快照与工具都直接保存在本仓库，未开启定时同步。

在 Surge 安装并启用模块，同时开启 Scripting 和 HTTPS 解密，使用自己在本地安装并信任的 MITM 证书。只追加 `image.spdbccc.com.cn` 和 `images.spdbccc.com.cn` 两个图片域名，没有增加银行业务域名、全站拦截或跳过服务器证书验证。

## iPhone 18 Pro 的尺寸

这里检测的是下载图片文件头中的宽高。Apple 列出的 18 Pro 屏幕分辨率是 1206×2622，但它不能证明银行下发的广告图片也使用这个尺寸。[Apple 技术规格](https://www.apple.com.cn/iphone-18-pro/specs/)

用户提供的原文件只给出 `1125×1931` 样本，未提供 18 Pro 的广告响应。因此当前默认保留样本尺寸，没有按屏幕尺寸、比例或机型猜一个新值，也没有将其标成“18 Pro 已验证版”。同一广告尺寸可能被不同手机复用。

模块参数：

| 参数 | 默认值 | 含义 |
| --- | --- | --- |
| `width` | `1125` | 广告素材实际宽度，正整数 |
| `height` | `1931` | 广告素材实际高度，正整数 |
| `log` | `1` | 记录图片格式、宽高、目标尺寸与 BLOCK/PASS；设 0 关闭 |

先按默认参数启用，彻底关闭浦大喜奔并重新启动。如果开屏仍出现，在 Surge 的脚本日志中查看 `SPDB-Splash`，将启动阶段广告图片对应的 `[SPDB] PNG/JPEG/GIF 宽x高 ... PASS` 记录与广告出现时间核对。只需提供这行尺寸日志，不用上传银行请求头、Cookie、账户信息或完整配置。确认广告素材后，再将模块参数的宽高改成实际值；不能将日志里任意一张正常图片当作广告。

没有参数界面的客户端可在本地模块 Script 行把 `argument` 改成 `"width=1125&height=1931&log=1"`，并按实际尺寸替换两个数值；不要按屏幕像素直接改。

## Surge 适配修正

原文件命中图片后调用 `$done()`。Surge 明确规定该调用会原样放行，因此转换后使用 `$done({abort:true})` 中止该响应。原规则的无限制正文缓冲写成 Surge 文档规定的 `max-size=-1`，保留 `requires-body=true`、`binary-body-mode=true`、20 秒超时。[Surge HTTP Response Script](https://manual.nssurge.com/scripting/http-response.html)

处理范围是两个图片主机上的 GET、200 响应。PNG、GIF、JPEG/JPG 按图片头读取宽高；宽和高必须同时精确相等才中止。其他尺寸、未知格式（包括 WebP）、非二进制正文、截断或无法识别的数据原样放行。非法尺寸参数也放行，不扩大匹配。日志不输出 URL、查询参数、请求头或响应正文。

这是尺寸过滤：如果正常图片恰好也具有目标尺寸，同样会被拦。它只阻止图片响应，不能保证 App 同时取消广告容器或等待时间；如页面异常可关闭该模块恢复。旧广告缓存可能仍然显示，不应据此认定新请求已被成功拦截。

## 来源与验证

来源为用户上传的 `pdxb.js`；文件未提供原作者、公开链接或许可证，未擅自归属给其他作者。原始字节保存在 `maintenance/apps/source/pdxb.js`，哈希记录在 `maintenance/apps/lock.json`，可通过 `scripts/build_apps.py` 离线重新生成。

已使用模拟图片头验证三类格式的目标尺寸、相邻尺寸、正常尺寸、手动参数、截断、主机范围、非 200 响应和日志隐私；并执行 Surge 离线语法检查。上述检查不等于浦大喜奔当前版本、iPhone 18 Pro 的真实去广告验证。
