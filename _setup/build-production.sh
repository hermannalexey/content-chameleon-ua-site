#!/usr/bin/env bash
# Builds the production copy of the site into _deploy/ (used by Cloudflare Workers Builds).
#
# The repo itself stays a "preview build" (noindex + robots Disallow) so the GitHub Pages
# test copy is never indexed; this script turns those off in the production copy only.
#
# Cloudflare: Build command  = bash _setup/build-production.sh
#             Deploy command = npx wrangler deploy
set -euo pipefail
cd "$(dirname "$0")/.."

SHA="${WORKERS_CI_COMMIT_SHA:-${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || date +%s)}}"
V="${SHA:0:7}"

rm -rf _deploy
mkdir _deploy
# Copy the site, leaving out repo/tooling files. .well-known/ is kept (security.txt).
tar -cf - \
  --exclude './.git' --exclude './.github' --exclude './.gitignore' --exclude './.nojekyll' \
  --exclude './.htaccess' --exclude './_deploy' --exclude './_setup' --exclude './node_modules' \
  --exclude './.wrangler' --exclude './wrangler.jsonc' --exclude '*.md' \
  . | tar -xf - -C _deploy
cd _deploy

# Drop the preview-only noindex (404.html keeps its own noindex)
find . -name '*.html' ! -name '404.html' -print0 | xargs -0 sed -i.bak \
  -e '/<!-- PREVIEW BUILD: remove this noindex/d' \
  -e '/<meta name="robots" content="noindex, nofollow">/d'
printf 'User-agent: *\nAllow: /\n\nSitemap: https://www.content-chameleon.com/sitemap.xml\n' > robots.txt

# 404.html is served for missing paths at any depth, so anchor its relative links at the root
sed -i.bak 's#<head>#<head>\
  <base href="/">#' 404.html

# Browsers cache CSS/JS, so stamp each deploy's version onto their links;
# otherwise returning visitors see new HTML with old styles.
find . -name '*.html' -print0 | xargs -0 sed -i.bak -E \
  "s#(css/styles\.css|js/main\.js)(\?v=[^\"]*)?\"#\1?v=${V}\"#g"
find . -name '*.bak' -delete

grep -q "styles.css?v=${V}" index.html || { echo "ERROR: CSS version stamp missing"; exit 1; }
# Link-only pages (e.g. algorytmy/) keep their noindex on purpose: they carry data-keep-noindex
stray=$(grep -rl 'noindex' --include='*.html' . | grep -v '^./404.html$' | xargs grep -L 'data-keep-noindex' || true)
if [ -n "$stray" ]; then
  echo "$stray"; echo "ERROR: noindex still present in the files above"; exit 1
fi
echo "Built _deploy/ (version ${V}): $(find . -type f | wc -l | tr -d ' ') files"
