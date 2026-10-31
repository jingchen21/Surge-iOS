# Verified startup fixes, 2026-10-31

## What Worth Buying (SMZDM)

The previous /util/loading Map Local returned {} and matched on the phone, but a complete image and countdown still appeared. The upstream success response contained an array of splash campaigns. The revised jq rule preserves the envelope and array entries, disables is_show_ad and expires existing campaign dates. Other module rules are unchanged. Empty or unexpected structures pass through.

Surge parsing and fixture replay passed, including non-ad-field preservation. Phone request notes confirmed the new rewrite ran; the user cold-launched the app without clearing its cache and confirmed the image and countdown disappeared. This supports a compatibility problem with the former empty-response handling; the app's internal cache implementation was not proven.

## China Mobile

The previous empty initialization response left a blank splash. The revised targeted response script preserves initialization and clears the observed startup-ad fields, then encrypts and signs the response. The user confirmed disappearance on the phone. See [details](CHINAMOBILE_SPLASH.md).

## Scope

These observations validate the tested startup flows, not all pages or payment flows. The existing stable module URLs are retained. No private profile, real request, personal identifier, credential, or diagnostic capture is included. The Meituan category-loading fix and original page scripts are unchanged in this update.
