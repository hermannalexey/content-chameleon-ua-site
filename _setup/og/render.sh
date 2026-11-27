#!/usr/bin/env bash
# Renders _setup/og/algorytmy-og.html to algorytmy/og.png (1200×630) with headless Chrome.
set -euo pipefail
cd "$(dirname "$0")/../.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --virtual-time-budget=8000 \
  --screenshot="$PWD/algorytmy/og.png" "file://$PWD/_setup/og/algorytmy-og.html" 2>/dev/null
echo "algorytmy/og.png: $(wc -c < algorytmy/og.png | tr -d ' ') bytes"
