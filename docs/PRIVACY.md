# Privacy and public repository scope

The public repository shares configuration structure and rules without storing real connection credentials.

## What has been removed

- All 123 proxy definitions, including server addresses, ports, passwords, and private node names.
- The private WireGuard section, keys, peers, and specific home subnets; home-router policy groups were replaced.
- MITM certificate bundles and certificate passwords. Generate, install, and trust your own certificate locally when needed.
- Provider names, custom node labels, and manual exceptions that could reveal personal access patterns.
- Unreviewed URLs. The public profile keeps only sources explicitly reviewed for publication.
- Runtime references to third-party icons whose redistribution status was not confirmed.

Generic private-network ranges, such as 192.168.0.0/16 used to bypass a proxy, are protocol constants and do not identify a specific home network.

## Keep these files out of the repository

Keep the original profile, private overlay, rendered local profile, subscription URLs, node lists, API control keys, WireGuard/Tailscale credentials, MITM certificates, packet captures, and runtime logs outside the repository.

.gitignore and the checking scripts are only safeguards. Manual browser uploads do not obey .gitignore, and adding an ignore rule does not remove a file already tracked by Git. Upload only reviewed public files.

Do not store proxy credentials in a private GitHub repository, Secret Gist, Base64-encoded file, or GitHub Actions Secrets. Encoding does not make a secret safe; generating a complete runtime profile in an Actions artifact or log can still expose credentials.

## Limits of local tools

The export tool was written for this profile structure and cannot guarantee detection of every secret in an arbitrary configuration. Review new scripts, modules, tokens, custom DNS paths, and named sections individually.

The rendered local profile contains real secrets. The tool writes it outside the public repository and restricts access to the current user. Do not package, screenshot, or upload it.

If real credentials were ever published, deleting the current file does not remove historical commits or other people's copies. Revoke affected subscription tokens, node credentials, or keys first, then clean up the history. The original private profile was not uploaded as part of this repository work.
