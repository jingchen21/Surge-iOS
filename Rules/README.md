# 独立规则

这两个小规则集从用户配置的相应片段提取，供其他主配置按需引用。规则集不写入个人节点，使用时由主配置指定策略。

- `Business-DIRECT.list`：国内出行、电商、支付、银行与验证码域名。
- `Apple-AI.list`：原配置中 Apple AI / Siri / PCC 的精确匹配段；使用时应给整个 RULE-SET 添加 `extended-matching`。

原文地址：[国内业务直连](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Rules/Business-DIRECT.list) · [Apple AI](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Rules/Apple-AI.list)。

主模板已经内置这些规则。使用主模板时不必重复引用。

需要区分国内业务和香港银行、Wise、美国 PayPal 等独立策略。域名列表不能证明相关 App 的每个功能均已覆盖，也不能保证账号或地区功能可用。

其他大型规则通过上游链接使用，完整列表见 [upstreams/references.json](../upstreams/references.json)。没有将上游规则库复制到本目录。
