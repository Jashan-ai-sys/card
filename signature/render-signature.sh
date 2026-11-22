#!/usr/bin/env bash
# Renders the signature PNGs (2x) into assets/sig/ with headless Chrome.
# Rerun after changing initials. The animated art is render-gif.sh.
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME=${CHROME:-"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}
mkdir -p assets/sig
shot() { # name part width height
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
    --default-background-color=00000000 --virtual-time-budget=3000 \
    --window-size="$3,$4" --screenshot="$PWD/assets/sig/$1.png" \
    "file://$PWD/signature/render.html?part=$2" 2>/dev/null
  echo "assets/sig/$1.png"
}
shot mark mark 48 48
for i in globe linkedin github mail; do shot "$i" "$i" 32 32; done
