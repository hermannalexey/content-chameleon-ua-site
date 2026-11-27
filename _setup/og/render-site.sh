#!/usr/bin/env bash
# Renders _setup/og/site-og.html into images/og/<card>.png (1200×630) with headless Chrome.
set -euo pipefail
cd "$(dirname "$0")/../.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p images/og
for card in home sales brand storytelling interviews; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=1200,630 --virtual-time-budget=8000 \
    --screenshot="$PWD/images/og/$card.png" "file://$PWD/_setup/og/site-og.html#$card" 2>/dev/null
  echo "images/og/$card.png: $(wc -c < images/og/$card.png | tr -d ' ') bytes"
done
