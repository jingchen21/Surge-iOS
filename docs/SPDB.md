# SPDB splash image dimension filter

[Install the module](https://raw.githubusercontent.com/jingchen21/Surge-iOS/main/Modules/SPDB.sgmodule). The runtime script is JS/pdxb.surge.js in this repository and has no external JS dependency. The module, source snapshot, and tools are stored locally in the repository; no scheduled sync is enabled.

Install and enable the module in Surge, turn on Scripting and HTTPS decryption, and use your own locally installed and trusted MITM certificate. Only the two image hosts image.spdbccc.com.cn and images.spdbccc.com.cn are added. No bank-service domains, broad site blocks, or server-certificate bypasses are added.

## iPhone 18 Pro dimensions

The script reads the width and height from the downloaded image file header. Apple lists the iPhone 18 Pro display resolution as 1206×2622, but that does not prove that the bank's ad image uses those dimensions. See [Apple technical specifications](https://www.apple.com.cn/iphone-18-pro/specs/).

The supplied original file contains only a 1125×1931 sample and no ad response captured from an iPhone 18 Pro. The default therefore keeps the sample dimensions instead of guessing from display resolution, aspect ratio, or device model. It is not labeled as verified for iPhone 18 Pro. The same ad image size may be reused across phones.

Module parameters:

| Parameter | Default | Meaning |
| --- | --- | --- |
| width | 1125 | Actual image-asset width, as a positive integer |
| height | 1931 | Actual image-asset height, as a positive integer |
| log | 1 | Log image format, dimensions, target dimensions, and BLOCK/PASS; set to 0 to disable |

Start with the defaults, force-quit SPDB, and reopen it. If the splash still appears, check the Surge script log for SPDB-Splash and compare the startup image's [SPDB] PNG/JPEG/GIF width × height ... PASS record with the time the ad appeared. Only that dimension log is needed; do not upload bank request headers, cookies, account information, or the full configuration. After confirming the actual ad asset, set the module's width and height to those values. Do not assume that any normal image in the log is an ad.

If the client has no argument editor, change the argument in the module's Script line locally to width=1125&height=1931&log=1 and replace the dimensions with the actual values. Do not set them from the phone's display pixels.

## Surge adaptation

The original file called $done() when an image matched. Surge documents that this passes the response through unchanged, so the adaptation uses $done({abort:true}) to abort the response. Unlimited body buffering is expressed as max-size=-1 as documented by Surge; requires-body=true, binary-body-mode=true, and the 20-second timeout are retained. See [Surge HTTP Response Script](https://manual.nssurge.com/scripting/http-response.html).

The handler applies only to GET responses with status 200 from the two image hosts. It reads PNG, GIF, and JPEG/JPG dimensions from the file header and blocks only when both dimensions match exactly. Other dimensions, unknown formats including WebP, non-binary bodies, truncated content, and unrecognized data pass through unchanged. Invalid dimension arguments also pass through. Logs do not include URLs, query parameters, request headers, or response bodies.

This is dimension-based filtering: a normal image with the same target dimensions will also be blocked. It only blocks the image response and cannot guarantee that the app removes the ad container or waiting time. Disable the module to restore normal behavior if the page breaks. A cached ad may remain visible even when a new request is blocked.

## Source and validation

The source was a user-provided pdxb.js file with no author attribution, public URL, or license supplied. Its original bytes are kept in maintenance/apps/source/pdxb.js, with a hash in maintenance/apps/lock.json. The module can be regenerated offline using scripts/build_apps.py.

Simulated image headers were used to test target dimensions, adjacent dimensions, normal sizes, manual arguments, truncation, hostname scope, non-200 responses, and log privacy for all three supported formats. Local Surge syntax checks also passed. These checks do not prove real-world ad filtering on the current SPDB app or an iPhone 18 Pro.
