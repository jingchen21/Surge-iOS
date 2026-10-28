# 🛠️ 应用模块维护

模块、JS、源快照和构建工具均保存在本仓库，可在本地重新生成。此目录主要供维护者修改和检查模块。

> **个人自用 / AI 辅助：** 本维护流程服务于个人配置。部分代码、构建辅助内容和文档使用 AI 辅助编辑或生成；构建成功不等于已完成真实 App 环境验证，修改后仍需检查代码、功能和来源许可。

## 📂 文件关系

| 输入 | 生成内容 |
| --- | --- |
| source/TxvideoAD.snippet、source/Txvideoad.js | 腾讯视频模块与 JS/Txvideoad.surge.js |
| source/MT.snippet、source/MT.js、旧版“我的”页脚本 | 美团页面模块、网络兼容模块及相关 JS |
| source/MeituanMiniProgram.snippet、source/MeiTuanNoAd.js | 美团小程序处理脚本 |
| source/Didichuxing.snippet | 滴滴模块；使用原生 jq / Map Local，无 JS |
| source/pdxb.js | 浦大喜奔模块与 JS/pdxb.surge.js |

lock.json 记录输入和生成文件的哈希。模块入口及使用方式见[模块目录](../../Modules/README.md)。

## ▶️ 构建与检查

环境要求：Python 3.9+、Node.js 18+、jq。

在仓库根目录执行：

~~~sh
python3 scripts/build_apps.py
python3 scripts/build_apps.py --check
node tests/apps_runtime.cjs
node tests/didi_runtime.cjs
node tests/spdb_runtime.cjs
python3 scripts/check_module_dependencies.py
python3 scripts/check_public.py
~~~

构建不会自动联网、下载上游更新或推送到 GitHub。若检查失败，先查看报错并核对源文件，不要直接忽略。

## ✏️ 修改原则

1. 页面处理逻辑优先修改 maintenance/apps/source/ 中的源文件。
2. 模块规则与参数在对应的 .snippet 中维护。
3. 生成逻辑修改 scripts/build_apps.py。
4. 修改后重新构建并运行上面的检查。
5. 更新上游内容前先核对来源、版本、差异与许可。

不要只修改生成后的 JS 再运行构建，否则改动可能被源快照覆盖。

## ⚠️ 验证边界

自动测试和离线解析只能证明已覆盖的测试场景，不代表当前版本的 iPhone App 已完成真机验证。上线前仍需检查登录、下单、支付、扫码等核心功能。

## 🙏 作者鸣谢与版权声明

感谢 [ZenmoFeiShi/Qx](https://github.com/ZenmoFeiShi/Qx)、[RoaycL/Surge](https://github.com/RoaycL/Surge)、[muktsoen/SurgeRules](https://github.com/muktsoen/SurgeRules)、[fmz200/wool_scripts](https://github.com/fmz200/wool_scripts) 及各源文件中注明的作者。详细来源、版本和许可记录见[第三方来源说明](../../THIRD_PARTY_NOTICES.md)。

本目录保留部分第三方源文件及个人提供的快照。**标注来源不等于取得再分发授权。** 不主张拥有第三方内容的版权，也不以本仓库许可证覆盖上游许可。请遵守原作者声明和适用许可证；未经许可，请勿冒充原创或再次分发。如权利人认为存在侵权或授权问题，请通过 [Issues](https://github.com/jingchen21/Surge-iOS/issues) 联系，以便核查、修正或移除相关内容。
