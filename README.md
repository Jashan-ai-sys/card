# E-signature + profile card

An email signature that opens a mobile profile page with a scripted "digital persona" chat.
Plain HTML/CSS/JS, no build step. Every bit of content is in `config.js`.

| File | What it is |
|---|---|
| `index.html`, `styles.css`, `app.js` | Profile page: portrait hero, ask bar, name card, socials, "Currently", work stories, persona chat |
| `signature.html` | Builds the Gmail-safe signature from `config.js` and copies it to the clipboard |
| `signature/render.html`, `signature/render-signature.sh` | Renders the signature images (`assets/sig/*.png`) with headless Chrome |
| `config.js` | Name, links, projects, persona answers, `baseUrl` |
| `icons.js` | Shared SVG icons |
| `persona.js`, `persona.test.js` | Persona answer matcher and its check (`node persona.test.js`) |

## Use it

1. **Photo (optional):** save a portrait as `assets/photo.jpg` (about 1200×1600). Without one, a "JS" monogram is used.
2. **Signature images:** `signature/render-signature.sh` (rerun after changing the photo or initials).
3. **Host the folder** at the `baseUrl` in `config.js` (default `https://jashan-ai-sys.github.io/card/`, i.e. a `card/` folder in the portfolio repo). Gmail loads the signature images from there, so it must be live first.
4. **Gmail:** open `<baseUrl>signature.html`, click **Copy signature**, then Gmail → Settings → See all settings → General → Signature → Create new → paste → **Save changes**.

Preview locally: `python3 -m http.server 8000` in this folder, then open `http://localhost:8000/`.
The signature preview shows broken images until `baseUrl` is live (the page says so).

## Notes

- The persona is scripted (keyword match in `config.js` → `persona`), labelled "Scripted answers, not a live AI" in the chat. Making it a real AI needs an API key behind a small server function so the key isn't exposed.
- Signature uses tables, inline styles and PNGs only, because Gmail and Outlook strip `<style>`, flexbox, SVG and background images.
- Respects `prefers-reduced-motion`: no glow travel, typewriter, word reveal or story auto-advance.
