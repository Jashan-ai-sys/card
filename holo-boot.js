// Loads the 3D card only when it can run well: WebGL present and the visitor hasn't asked for
// reduced motion. Anything failing (offline CDN, old GPU) leaves the normal portrait hero.
const holo = document.getElementById("holo");
const hero = holo.closest(".hero");

function webglOK() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

function loadScript(src, integrity) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.integrity = integrity;
    s.crossOrigin = "anonymous";
    s.onload = resolve;
    s.onerror = reject;
    document.head.append(s);
  });
}

if (webglOK() && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  try {
    await loadScript("https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js",
      "sha384-8FWZA6BGMXhsfO+BLtrJK0We6gg5o1JyO8xQm6peWDEUs17ACA5ziE/NIAkl9z2k");
    const { mountHoloCard } = await import("./card3d.js");
    // The card fills the hero above the glass UI.
    const ui = hero.querySelector(".hero-ui");
    new ResizeObserver(() => hero.style.setProperty("--ui-h", `${ui.offsetHeight}px`)).observe(ui);
    holo.hidden = false;
    await mountHoloCard(holo);
    hero.classList.add("has-3d");
  } catch (err) {
    holo.hidden = true;
    holo.replaceChildren();
    console.warn("3D card unavailable, showing the portrait instead:", err);
  }
}
