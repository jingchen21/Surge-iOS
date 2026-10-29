# Local use and maintenance

Keep the public template and private overlay separate. The overlay contains real credentials and must remain outside the repository.

## Export from your own profile

Run the following commands from the repository root, replacing the example path:

~~~sh
python3 scripts/export_public.py \
  --source "/path/to/Surge-iPhone.conf" \
  --public Profiles/Surge-iPhone.conf \
  --private-overlay ../Surge-private/overlay.json

python3 scripts/check_public.py \
  --source "/path/to/Surge-iPhone.conf"
~~~

The tools do not call online subscription converters, download nodes, or execute scripts embedded in the profile. They generate a public template and a private overlay stored locally. Review the public file after export, especially any newly added sections.

## Render your full local profile

~~~sh
python3 scripts/render_private.py \
  --template Profiles/Surge-iPhone.conf \
  --private-overlay ../Surge-private/overlay.json \
  --output ../Surge-private/Surge-iPhone.local.conf
~~~

Import the rendered profile into Surge as a separate profile and validate it before switching. The tools do not overwrite the original profile.

The export and restore tools must be used together. PRIVATE-SLOT markers map private sections and must not be deleted or renumbered. Do not mix a template from one version with an incompatible overlay.

The initial public template and its matching overlay restored the same 764 effective configuration lines as the original profile. This does not mean that every future restore can skip review.

## Which public changes are carried into the restored profile?

Public rules and settings outside the marked sections are retained from the public template. Content between BEGIN PRIVATE-SLOT and END PRIVATE-SLOT is replaced by the corresponding private source, such as nodes, policy groups, home-network exceptions, the original embedded AI snapshot, and MITM settings.

**Changes inside marked sections do not directly modify the restored profile.** Make those changes in your original private profile and export again. This prevents node loss, changes to fixed egress, or accidental publication of certificates.

These tools generate files locally. The initial repository setup does not automatically sync the GitHub template to the iPhone's active profile or update node subscriptions.

Surge also supports [Detached Profile / Linked Profile](https://manual.nssurge.com/profile/format.html). You can later separate public and private sections using a reviewed repository URL. Never put private subscription URLs in the public profile or use public GitHub as a relay for real node files.

## Publish to GitHub

1. Sign in to GitHub locally and confirm the target account, repository name, and visibility.
2. Initialize Git only in the public repository directory and run the local checks against the original credentials.
3. Review every staged filename and file. The private overlay and original profile must not appear in the staged list.
4. Create the public repository and push the reviewed files. Do not enter real subscription details.
5. Review the published files and history to confirm that only public content was uploaded.

The public repository is [jingchen21/Surge-iOS](https://github.com/jingchen21/Surge-iOS). The private overlay and original profile must remain outside the repository.
