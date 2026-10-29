# Meituan store-category loading fix

Updated 2026-10-28. This is a personal adaptation of rules and scripts from ZenmoFeiShi/Qx, not an upstream release.

## Issue and evidence

Switching categories in a food-delivery store caused the category list to keep spinning. Phone request logs showed five IP addresses repeatedly rejected by exact REJECT rules in the Meituan module, at least 115 times within about 38 seconds. After those addresses were temporarily allowed, the user reported that loading was noticeably better and nearly instant. This supports a connection between the blocks and the issue, but each IP rule has not been independently validated.

The rules appeared before the normal domestic-routing rules. There was no evidence that the global DNS configuration needed to change or that a broader DIRECT override should be added to the main profile.

## Module-level change

Modules/Meituan.sgmodule removes only these five IP REJECT rules from the original module:

- 203.76.217.241/32
- 203.76.217.243/32
- 101.50.8.64/32
- 103.63.160.64/32
- 119.29.48.215/32

After removal, the existing routing rules determine the path for these connections; no standalone DIRECT patch is required. The other 41 rules, two URL Rewrite rules, eight original response scripts, and MITM host scope are retained. The source snapshot and original-author JavaScript were not changed. The main profile, DNS, and global network settings were not modified.

The generator explicitly maintains these five exclusions. Tests compare the remaining rules, scripts, rewrites, hostnames, and source snapshot to prevent a rebuild from restoring the conflicting blocks.

## Usage and verification limits

When enabling this version, disable duplicate original Meituan modules, old network-compatibility modules, and standalone category-IP DIRECT patches. The WeChat mini-program module can remain enabled independently.

Local syntax checks and inspection of the phone's effective configuration passed. The same-store category experience still needs to be retested without the standalone patch. The earlier temporary allow-list success does not prove that the revised module has passed a real-device test. Login, ordering, payment, and QR scanning are outside the completed validation scope.

The current app request record reports version 12.68.201. Xiaotuan and cart coupon promotions may remain; this fix does not promise to remove them and does not broaden transport blocking. No real requests, account data, credentials, certificates, or diagnostic configuration were published.

When updating from upstream, retain the source snapshot and recheck these five rules and actual app behavior. Do not describe the local adaptation as a byte-for-byte equivalent of the original.
