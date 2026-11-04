# Surge 模块隐私与安全整改（2026-11-04）

## 回滚基线

- 原始提交：`a6d6287f4b7a224689c42a79efa655596a3ff693`
- 永久保留的回滚分支：`backup/pre-security-hardening-20261104`
- 本次整改分支：`security/privacy-hardening-20261104`

## 本次修改

| 模块 | 调整 | 预期影响 |
| --- | --- | --- |
| 微博 | 避免打印完整响应正文和调试对象；将 `eval(method)` 改为固定处理函数映射；把 MITM 泛匹配收敛到实际脚本使用的主机 | 广告过滤仍由原处理函数执行，新增主机若以后变更需手动补充 |
| Google | MITM 移除 `*.google.com`，保留搜索所需的 `www.google.com` | Google 账号等其他子域不再由本模块解密 |
| 滴滴 | 去掉 MITM 中的 IP 地址及 IP 通配；独立 [Rule] 中的 IP 拦截规则保留 | 具体 HTTP(S) 域名广告规则保留；若 App 改为 IP 直连需另行评估 |
| 美团小程序 | 去掉钱包信息接口的空响应拦截及 `npay.meituan.com` 的 MITM | 钱包展示恢复原始返回，其他广告处理规则保留 |
| 仓库 CI | 添加运行脚本敏感日志、动态执行、敏感 MITM 与可变链接的检测 | 防止以后重新引入同类风险 |

## 尚需设备回归

1. 微博：发现、首页、搜索、热搜、个人中心、视频和信息流广告。
2. Google：CN 跳转和搜索结果无限滚动，Google 登录和 Gmail 不被该模块解密。
3. 滴滴：首页、我的、优惠券、广告弹窗与行程订单。
4. 美团小程序：首页、我的、购物车、钱包信息和支付流程。
5. 哈啰、中国移动、小红书：暂时保留当前功能逻辑，后续做脱敏模拟数据回放，不用真实 Token 或私人流量公开测试。

## 回滚

如尚未合并安全整改 PR：关闭 PR，不会影响 `main` 或当前已安装模块。

如已合并：从备份分支恢复受影响文件并新建恢复提交。例如只回滚某个模块：

```bash
git checkout backup/pre-security-hardening-20261104 -- Modules/Weibo.sgmodule JS/Weibo.surge.js
git commit -m "回滚：恢复微博旧版去广告模块"
git push
```

如果回滚的是由 `scripts/build_apps.py` 生成的模块，必须一起恢复生成器和 `maintenance/apps/lock.json`，再运行 `python3 scripts/build_apps.py --check`。

完整回滚前先比较当前新增提交，避免覆盖回滚基线之后其他人的修改。不建议直接对 `main` 做强制推送。

## 审计局限

这是源码静态检查和仓库一致性整改，不证明没有动态数据泄露。真实 MITM 生效范围由 iPhone/Mac 当前启用模块决定。脚本全部仍通过 `main` 下载；改为正式版不可变引用将作为后续独立发布步骤，以避免一次性更新全部安装 URL。
