#!/usr/bin/env bash
set -euo pipefail

REPO="${PLUGIN_RELEASE_REPO:-694410194/mino-plugin-releases}"
if [[ "$REPO" == "694410194/mino-releases" ]]; then
  echo "Refusing the product release repository; plugin assets must not replace product downloads." >&2
  exit 2
fi

if [[ "$#" -ne 1 ]]; then
  echo "Usage: scripts/publish-plugins.sh plugins-v<major>.<minor>.<patch>" >&2
  exit 2
fi
TAG="$1"
if [[ ! "$TAG" =~ ^plugins-v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid plugin release tag: $TAG" >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
cd "$ROOT"

node scripts/verify-all.mjs --out dist

shopt -s nullglob
TARBALLS=(dist/*.tgz)
shopt -u nullglob
if [[ "${#TARBALLS[@]}" -eq 0 ]]; then
  echo "Verification produced no plugin tarballs." >&2
  exit 1
fi

TMP_DIR="$(mktemp -d .plugin-release.XXXXXX)"
trap 'rm -rf "$TMP_DIR"' EXIT
NOTES="$TMP_DIR/notes.md"
node --input-type=module -e '
  import { readdirSync, readFileSync } from "node:fs";
  import { join } from "node:path";
  const packages = readdirSync("packages").sort().map(dir => {
    const pkg = JSON.parse(readFileSync(join("packages", dir, "package.json"), "utf8"));
    return `- ${pkg.name} ${pkg.version}`;
  });
  console.log(packages.join("\n"));
' > "$NOTES"

CREATE_RELEASE=0
if IS_DRAFT="$(gh release view "$TAG" --repo "$REPO" --json isDraft --jq .isDraft 2>"$TMP_DIR/view-error")"; then
  if [[ "$IS_DRAFT" == "false" ]]; then
    if [[ "${ALLOW_REPLACE:-0}" != "1" ]]; then
      echo "Release $TAG is already published; set ALLOW_REPLACE=1 to replace its assets." >&2
      exit 1
    fi
    echo "WARNING: replacing assets on already-published release $TAG in $REPO." >&2
  fi
else
  if grep -Eiq 'HTTP 404|release not found|not found' "$TMP_DIR/view-error"; then
    CREATE_RELEASE=1
  else
    cat "$TMP_DIR/view-error" >&2
    echo "Unable to determine whether release $TAG exists." >&2
    exit 1
  fi
fi

if [[ "$CREATE_RELEASE" -eq 1 ]]; then
  gh release create "$TAG" \
    --repo "$REPO" \
    --draft \
    --latest=false \
    --title "Mino 推荐插件 ${TAG#plugins-}" \
    --notes-file "$NOTES"
fi

for tarball in "${TARBALLS[@]}"; do
  gh release upload "$TAG" "$tarball" --repo "$REPO" --clobber
done

gh release view "$TAG" --repo "$REPO" --json assets > "$TMP_DIR/assets.json"
ASSETS_JSON="$TMP_DIR/assets.json" node --input-type=module <<'NODE'
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'dist';
const release = JSON.parse(readFileSync(process.env.ASSETS_JSON, 'utf8'));
const local = readdirSync(dir).filter(name => name.endsWith('.tgz')).sort();
const assets = new Map((release.assets ?? []).map(asset => [asset.name, asset.digest]));
let failed = false;

for (const name of local) {
  const digest = `sha256:${createHash('sha256').update(readFileSync(join(dir, name))).digest('hex')}`;
  if (assets.get(name) !== digest) {
    console.error(`Asset digest mismatch: ${name} (expected ${digest}, got ${assets.get(name) ?? 'missing'})`);
    failed = true;
  } else {
    console.log(`Verified asset ${name}: ${digest}`);
  }
}

for (const name of assets.keys()) {
  if (!local.includes(name)) {
    console.error(`Unexpected release asset: ${name}`);
    failed = true;
  }
}

if (failed) process.exit(1);
NODE

gh release edit "$TAG" --repo "$REPO" --draft=false --latest=false

if ! PRODUCT_LATEST="$(gh api repos/694410194/mino-releases/releases/latest --jq .tag_name)"; then
  echo "ERROR: unable to verify the product repository's Latest release." >&2
  exit 1
fi
if [[ ! "$PRODUCT_LATEST" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "ERROR: the product repository's Latest release is wrong: $PRODUCT_LATEST" >&2
  exit 1
fi

echo "Published $TAG to $REPO; product Latest remains $PRODUCT_LATEST."
