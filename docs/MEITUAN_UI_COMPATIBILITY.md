# Meituan UI transport compatibility

The existing `Modules/Meituan.sgmodule` URL now includes the Horn transport adapter tested on 2026-10-31. The user identified this adapter as the version that removed the bottom Xiaotuan entry. It is merged into the main module rather than published as a second module to enable alongside it.

Two scripts match only `h.meituan.com/horn_ios/mergeRequest`. The request script asks for a fresh `shark` configuration. The response script appends the two observed UI paths to the `blackList` of existing matching host entries. It does not add new hosts or disable the entire transport. The original page scripts can then handle the HTTP responses. The companion scripts use public repository URLs; permanent debug input/output recording is omitted.

The 41 network rules and two URL rewrites are unchanged. The five IP rejects previously removed to restore store-category loading remain excluded. No global routing, DNS, proxy or IP-blocking changes are included. The seven upstream page scripts and the existing local cart script retain their patterns and bodies.

The cart coupon banner is not claimed fixed: its existing response adapter is retained, but the current user confirmation covers Xiaotuan removal. Menu loading, login, ordering and payment should be checked again after future app or upstream changes.

Update the existing Meituan module. Do not also enable the former standalone UI HTTP Compatibility Test, because duplicate script matches can compete. This publication does not change the phone's active module selection.

The adapter marks the modified cache etag with `-uihttp1` so a subsequent normal Horn refresh can replace it. To roll back, remove the two Horn script entries and allow the app to refresh its upstream configuration; cached configuration may persist until that refresh. Do not replace the entire app response with an empty object or restore the five conflicting IP rejects.

Validation includes Surge parsing, exact network-rule preservation, offline regeneration, dependency checks, and runtime cases for object/string configuration, unrelated fields, repeated execution and unknown schemas. No captured requests, account data or credentials are published.
