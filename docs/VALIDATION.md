# Validation record

Last reviewed: 2026-10-27.

This page records validation of the initial public profile. The later RoaycL modules and associated JavaScript are covered separately in the [sync record](ROAYCL_SYNC.md) and are not included in the original profile's validation scope.

## Completed checks

- The public profile passed the local Surge CLI offline syntax check with an OK result.
- Private content was written only to a local overlay outside the repository; the original profile was not modified.
- After restoring the initial public template with its matching overlay, the 764 effective configuration lines matched the original profile. The comparison ignored comments, blank lines, and whitespace after commas; it was not a byte-for-byte comparison.
- The entire public directory was checked for common secrets and compared locally against node names, servers, passwords, keys, certificate material, and unreviewed URLs from the original file. No matching values were printed.
- At the time of review, 68 public rule or GeoIP resource URLs returned HTTP 200 or 206. The check inspected response headers to verify availability and some attribution; it did not download every resource or validate rule contents, nor does it guarantee future availability.
- Repository-level license files and selected runtime file headers were reviewed. Differences between repository-wide and file-specific license terms were recorded.

## Differences in the public template

1. Nodes and the home tunnel were removed. Fixed-node policies became placeholders that default to REJECT; related traffic cannot connect until nodes are configured.
2. Region groups retain node-name regular expressions. Names from other subscriptions may not match and may need adjustment. The provider-specific prefix filter was removed from AllServer.
3. Home-only rules and personal manual exceptions are not in the public template. They are restored only through the local overlay.
4. Embedded AI/Meta rule snapshots were not copied. The public template uses Sukka's online AI rules, whose match scope differs from the snapshot and changes with upstream updates.
5. Forty-seven third-party icon references were removed. MITM certificates are not distributed; the standalone Google redirect module requires a local CA.
6. An unreviewed custom test URL was replaced with a public Apple connectivity-test URL. The local restore still uses the original value.

## Not verified

The public template has not been imported into or applied to the active iPhone. Real-app rule matches, script ad filtering, Apple AI availability, account region, and the home remote tunnel have not been verified.

The supplied original profile did not contain a Script section, so the source or licensing of modules installed separately on the phone could not be fully audited from that file.

The local Surge parser may differ from the version and runtime environment on the iPhone. Passing offline syntax checks does not replace device testing.

Public files are published at [jingchen21/Surge-iOS](https://github.com/jingchen21/Surge-iOS). The original profile, private overlay, and complete runtime configuration are not distributed. Publication does not mean that the profile has been applied to an iPhone or verified in real app workflows.
