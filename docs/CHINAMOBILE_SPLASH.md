# China Mobile startup-ad removal

Updated 2026-10-31. The previous empty-object response blocked the ad material but left a blank splash with a three-second countdown and a click area. Returning HTTP 503 and clearing the app cache had also failed to remove it.

## Targeted fix

Real phone request notes confirmed that the original startInit response used the existing encrypted protocol and contained a successful initialization envelope. Its rspBody.startImgInfo held the splash campaign, including showSeconds set to "3". Normal initialization data lived in the same response, so replacing the entire response with {} discarded more than ad configuration.

The module now lets this exact startup request reach its server and uses [ChinaMobile-startup.surge.js](../JS/ChinaMobile-startup.surge.js) to decrypt it, clear the observed startup-ad object and associated media/redirect fields, set the SDK ad wait to zero, and re-encrypt and sign the response using the request nonce. Other initialization fields and the existing page filters remain in place. Errors, unknown protocols, and missing signing input preserve the original response.

## Verification and limits

Surge syntax validation passed. Seven fixture cases ran in the iPhone script engine, checking encryption, the response signature, normal-field preservation, and safe pass-through cases. Real request notes then confirmed the cleanup and signing path ran. The user cold-launched the app and confirmed the blank splash/countdown disappeared on 2026-10-31. Temporary diagnostics and extra logging were removed.

This validates the observed startup flow. Login, recharge, payment, every regional variant, and future app releases have not all been tested. No new broad CDN block, global DNS change, or network-policy change was made.

Update the existing module rather than enabling duplicates. The new script is a required companion resource and is hosted in this repository. To roll back, use the previous module/script revision. No real requests, account information, credentials, certificates, or diagnostic settings are published here.

See [Surge response scripts](https://manual.nssurge.com/scripting/http-response.html).
