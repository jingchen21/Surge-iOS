# 🛠️ App module maintenance

Modules, JavaScript, source snapshots, and build tools are stored in this repository and can be regenerated locally. This directory is intended for maintainers who edit and validate modules.

> **Personal use and AI assistance:** Some code, build helpers, and documentation were generated or edited with AI assistance. A successful build does not prove real-app behavior. Review code, functionality, attribution, and licensing after every change.

## 📂 File relationships

| Input | Generated output |
| --- | --- |
| source/TxvideoAD.snippet and source/Txvideoad.js | Tencent Video module and JS/Txvideoad.surge.js |
| source/MeituanMiniProgram.snippet and source/MeiTuanNoAd.js | Separate Meituan WeChat mini-program module and its JS |
| source/Didichuxing.snippet | Didi module using native jq / Map Local; no JS |
| source/pdxb.js | SPDB module and JS/pdxb.surge.js |

lock.json records input and generated-file hashes. See the [module index](../../Modules/README.md) for installation and usage.


## ▶️ Build and validate

Requirements: Python 3.9+, Node.js 18+, and jq.

Run from the repository root:

~~~sh
python3 scripts/build_apps.py
python3 scripts/build_apps.py --check
node tests/apps_runtime.cjs
node tests/didi_runtime.cjs
node tests/spdb_runtime.cjs
python3 scripts/check_module_dependencies.py
python3 scripts/check_public.py
~~~

The build does not automatically access the network, download upstream updates, or push to GitHub. If a check fails, inspect the error and review the source files instead of ignoring it.

## ✏️ Editing rules

1. Prefer editing source files under maintenance/apps/source/ for page-handling logic.
2. Maintain module rules and arguments in the corresponding .snippet files.
3. Change generation logic in scripts/build_apps.py.
4. Rebuild and run the checks above after editing.
5. Verify source, version, diff, and license before updating upstream content.

Do not edit only the generated JS and then rebuild; the build may overwrite those changes with the source snapshot.

## ⚠️ Verification limits

Automated tests and offline parsing prove only the scenarios they cover. They do not prove that the current iPhone app version has been tested on a real device. Before regular use, verify login, ordering, payment, QR scanning, and other critical flows.

