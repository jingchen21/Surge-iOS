# China Mobile splash screen: Surge syntax fix

Updated 2026-10-28. The module retains ccyykk666's page-handling logic and existing personal adaptations. Original attribution and the companion JavaScript URL are preserved. This change fixes module syntax only; it does not claim that the client-side splash countdown has been removed.

## Observed behavior

A phone screenshot showed a blank splash page that still contained a “Skip” countdown and clickable area. Request logs showed that startInit matched the CM-splash-init request script and was modified. The home-page and navigation scripts also showed evidence of execution. Therefore, a matched rule does not prove that the entire splash UI has disappeared.

The old public module used reject-dict and reject-200 under URL Rewrite, which the local Surge CLI rejected as invalid syntax. Those China Mobile URL Rewrite or Map Local entries were also not visible in the phone's effective profile. These facts alone do not establish why the phone did not load those entries, but the syntax needed correction.

## Changes

The 15 existing match expressions were converted to Map Local:

- 12 empty-dictionary rules return HTTP 200, body {}, and Content-Type application/json.
- Three empty-response rules return HTTP 200 with an empty body.

The match expressions are retained. Ten scripts, four network rules, the MITM hostname list, and default arguments remain unchanged. No broad CDN block was added, and the main profile, DNS, global network settings, and companion JavaScript were not modified. The module still requires Rewrite; HTTPS matching also requires successful MITM for the relevant hostname.

References: [Surge URL Rewrite](https://manual.nssurge.com/http/url-rewrite.html) and [Surge Map Local](https://manual.nssurge.com/http/map-local.html).

## Verification limits

The revised module passed local Surge CLI parsing. The original scripts, network rules, MITM settings, and 15 URL match expressions were checked for consistency. The revised module was not applied to the phone before publication, and the splash screen was not retested on-device. Cache behavior and the client's countdown handling remain unconfirmed.

startInit previously returned an empty result while the splash shell remained visible. This syntax fix may therefore leave the blank countdown in place. No real upstream response structure was captured, so no unsupported field was invented and the block scope was not expanded.

After updating, enable only one China Mobile module and test both the splash screen and normal app flows. If the blank page remains, investigate using fresh request and response evidence. Do not attribute the issue to DNS or claim it has been fixed without proof.
