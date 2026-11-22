#!/usr/bin/env bash
# Renders the signature animations with three.js in headless Chrome, then ffmpeg makes GIFs:
#   assets/sig/card.gif  364×228 → shown at 280×175 (holo card signature)
#   assets/sig/art.gif   172×160 → shown at 86×80   (classic signature's art)
# Each plays 3 times then rests (WCAG 2.2.2); frame 0 is flat because Outlook desktop shows only that.
# Needs Chrome (WebGL via SwiftShader), ffmpeg, and network for the CDN scripts.
# A failed render never replaces the committed GIFs: output is checked in a temp dir first.
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME=${CHROME:-"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"}
FPS=12
tmp=$(mktemp -d)
port=$(python3 -c 'import socket; s = socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1])')
python3 -m http.server "$port" --bind 127.0.0.1 >/dev/null 2>&1 &
server=$!
cleanup() {
  kill "$server" 2>/dev/null || true
  wait "$server" 2>/dev/null || true
  rm -rf "$tmp"
}
trap cleanup EXIT
for _ in $(seq 50); do curl -sf "http://127.0.0.1:$port/signature/gif.html" >/dev/null && break; sleep 0.1; done

chrome() { # extra args...
  "$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 \
    --use-angle=swiftshader --enable-unsafe-swiftshader --virtual-time-budget=20000 "$@" 2>/dev/null
}

gif() { # name kind width height frames colors
  local name=$1 kind=$2 w=$3 h=$4 frames=$5 colors=$6
  local url="http://127.0.0.1:$port/signature/gif.html?kind=$kind&w=$w&h=$h&frames=$frames"
  if ! chrome --dump-dom "$url" | grep -q "<title>done</title>"; then
    echo "render failed for $name (three.js/CDN not loaded?); kept the existing assets/sig/$name.gif" >&2
    return 1
  fi
  chrome --window-size="$w,$((h * frames))" --screenshot="$tmp/$name.png" "$url"
  ffmpeg -loglevel error -y -i "$tmp/$name.png" -filter_complex \
    "untile=1x$frames,setpts=N/($FPS*TB),split[a][b];[a]palettegen=max_colors=$colors:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" \
    -r "$FPS" -loop 2 "$tmp/$name.gif"
  mv "$tmp/$name.gif" "assets/sig/$name.gif"
  echo "assets/sig/$name.gif ${w}x${h} $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 "assets/sig/$name.gif") frames $(du -k "assets/sig/$name.gif" | cut -f1)KB"
}

# Sizes measured: whole-card motion changes every pixel, so GIF size scales with area and frames.
gif card card 364 228 20 64
gif art tile 172 160 16 64
