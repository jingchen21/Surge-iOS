# 本地使用与维护

公开模板和私密覆盖文件分开保存。覆盖文件内有真实凭据，始终保存在仓库之外。

## 从自己的配置重新导出

在仓库根目录运行，替换示例路径：

```sh
python3 scripts/export_public.py \
  --source "/path/to/Surge-iPhone.conf" \
  --public Profiles/Surge-iPhone.conf \
  --private-overlay ../Surge-private/overlay.json

python3 scripts/check_public.py \
  --source "/path/to/Surge-iPhone.conf"
```

工具不调用在线订阅转换服务，不下载节点，不执行配置内的脚本。它会生成一个公开模板和一个仅本地保存的覆盖文件。导出后应阅读公开文件，尤其是新增的配置段。

## 恢复自己的完整配置

```sh
python3 scripts/render_private.py \
  --template Profiles/Surge-iPhone.conf \
  --private-overlay ../Surge-private/overlay.json \
  --output ../Surge-private/Surge-iPhone.local.conf
```

先在 Surge 中作为独立配置导入和检查，再决定是否切换。原配置不被工具覆盖。

导出与恢复工具需配套使用。`PRIVATE-SLOT` 标记用于对应私密段，不要自行删除或编号重排，也不要把其他版本模板与不配套的覆盖文件混用。

本次初始模板恢复后，与原文件的有效配置行一致；这不等于任何未来版本的恢复结果都无需检查。

## 哪些公开修改会进入恢复文件

标记范围以外的公共规则和设置，在恢复时保留公开模板中的修改。`BEGIN PRIVATE-SLOT` 与 `END PRIVATE-SLOT` 之间的内容，会被对应私密原文替换，例如节点、策略组、家庭例外、原始内嵌 AI 快照和 MITM 段。

因此，**标记范围内的改动不会直接改变恢复文件**。要修改这些内容，应在自己的原始配置中完成，再重新导出。这一安排用于避免节点丢失、固定出口变化或证书被公开模板替换。

这套工具采用本地生成方式；初始仓库没有自动将 GitHub 模板同步到当前正在运行的 iPhone。也没有自动更新节点订阅。

Surge 本身另有 [Detached Profile / Linked Profile](https://manual.nssurge.com/profile/format.html) 功能。后续可以在明确仓库地址后，将公共段与本地私密段分离，但不要把私密订阅 URL 写进公开主配置，也不要使用公开 GitHub 中转真实节点文件。

## 发布到 GitHub

1. 在本机完成 GitHub 登录，并确定目标账号、仓库名和公开范围。
2. 只在公开仓库目录初始化 Git，运行带原始凭据比对的本地检查。
3. 审阅待提交的文件名与内容。私密覆盖文件和原配置不应出现在待提交清单。
4. 创建新的公开仓库并推送。无需填写任何真实订阅信息。
5. 发布后检查 GitHub 文件和历史，确认只包含公开文件。

公开仓库地址为 [jingchen21/Surge-iOS](https://github.com/jingchen21/Surge-iOS)。私密覆盖文件与原配置始终在仓库之外，不随公开文件发布。
