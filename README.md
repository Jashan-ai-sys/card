# E-signature + profile card

An email signature that opens a mobile profile page with a scripted "digital persona" chat.
The signature is a holographic 3D card (three.js, rendered to an animated GIF for email); on the
page the same card is live: tilt it, drag to spin, tap to flip to a QR code.
Plain HTML/CSS/JS, no build step. Every bit of content is in `config.js`.

| File | What it is |
|---|---|
| `index.html`, `styles.css`, `app.js` | Profile page: portrait hero, ask bar, name card, socials, "Currently", work stories, persona chat |
| `signature.html` | Builds the Gmail-safe signature from `config.js` and copies it to the clipboard |
| `signature/render.html`, `signature/render-signature.sh` | Renders the signature images (`assets/sig/*.png`) with headless Chrome |
| `card3d.js`, `card-faces.js`, `holo-boot.js` | The 3D holo card: three.js scene, canvas-drawn faces and foil masks, loader with fallback |
| `signature/gif.html`, `signature/render-gif.sh` | Renders `assets/sig/card.gif` (holo signature) and `art.gif` (classic signature's art) |
| `config.js` | Name, links, projects, persona answers, `baseUrl` |
| `icons.js` | Shared SVG icons |
| `persona.js`, `persona.test.js` | Persona answer matcher and its check (`node persona.test.js`) |

## Use it

1. **Photo (optional):** save a portrait as `assets/photo.jpg` (about 1200×1600). Without one, a "JS" monogram is used.
2. **Signature images:** `signature/render-gif.sh` (animated card + art; rerun after changing the photo or any card text) and `signature/render-signature.sh` (mark + icons; rerun after changing initials).
3. **Host the folder** at the `baseUrl` in `config.js` (default `https://jashan-ai-sys.github.io/card/`, i.e. a `card/` folder in the portfolio repo). Gmail loads the signature images from there, so it must be live first.
4. **Gmail:** open `<baseUrl>signature.html`, pick **Holo card** or **Classic**, click **Copy signature**, then Gmail → Settings → See all settings → General → Signature → Create new → paste → **Save changes**.

Preview locally: `python3 -m http.server 8000` in this folder, then open `http://localhost:8000/`.
The signature preview shows broken images until `baseUrl` is live (the page says so).

## Notes

- The persona is scripted (keyword match in `config.js` → `persona`), labelled "Scripted answers, not a live AI" in the chat. Making it a real AI needs an API key behind a small server function so the key isn't exposed.
- Signature uses tables, inline styles and PNGs only, because Gmail and Outlook strip `<style>`, flexbox, SVG and background images.
- Respects `prefers-reduced-motion`: no 3D card (portrait hero instead), glow travel, typewriter, word reveal or story auto-advance. The dock's pause button freezes all looping motion, remembered per browser.
- The 3D card loads only with WebGL2 and falls back to the portrait if three.js can't load. CDN scripts are pinned with SRI (import-map `integrity` for three.js).
- Signature GIFs play 3 times then stop. Frame 0 is the card flat, which is all Outlook desktop shows. `card.gif` is ~480 KB because the whole card moves every frame; GIF size scales with its area.
