# 独立模块

腾讯视频与美团的 [安装地址和使用说明](../docs/APPS.md) 单独维护，所需 JS 都在本仓库。美团的网络兼容模块是可选项。

今天同步的去广告模块见 [RoaycL 模块目录](RoaycL/README.md)，包含安装地址和 JS 依赖说明。下面的 Google 重定向模块仍单独维护。

[Google-CN-Redirect.sgmodule](Google-CN-Redirect.sgmodule) 将 Google 中国域名重定向到对应的国际域名，保留原路径与查询参数。

安装或查看原文：[Raw 链接](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/Google-CN-Redirect.sgmodule)。

主模板已经内置相同重定向。使用主模板时无需安装此模块；它供其他配置单独使用。

HTTPS 重定向需要用户在本地配置并信任自己的 MITM CA，且开启对应能力。模块只追加必要 hostname，不包含证书，也不解密所有域名。

模块会覆盖或追加主配置内容，详情见 [Surge 模块文档](https://manual.nssurge.com/profile/module.html)。

本次原始文件没有脚本定义，不能据此确认手机上启用的去广告模块清单。这里没有补入未经来源与授权核对的第三方脚本。
