// Holographic 3D card (three.js). Two uses:
//   mountHoloCard(el)   – interactive card in the profile hero (tilt, drag-spin, tap to flip)
//   createArtTile(...)  – the signature's art as a tilting holo tile, rendered frame by frame for the GIF
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { CARD_W, CARD_H, drawFront, drawBack, drawFoilMask, drawArt, loadImage } from "./card-faces.js";

const P = window.PROFILE;

// ---------- shared scene pieces ----------
function makeRenderer(canvas, opts = {}) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: !opts.background, ...opts.gl });
  r.setPixelRatio(Math.min(devicePixelRatio, 2));
  r.toneMapping = THREE.NeutralToneMapping; // keeps the card art true to colour
  r.outputColorSpace = THREE.SRGBColorSpace;
  if (opts.background) r.setClearColor(opts.background, 1);
  return r;
}

function envFor(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return env;
}

// Colour images are sRGB; foil masks are plain 0..1 weights, so they must not be sRGB-decoded.
function texture(canvas, colorSpace = THREE.SRGBColorSpace) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = colorSpace;
  t.anisotropy = 8;
  return t;
}

// Rounded-rectangle face with 0..1 UVs (ShapeGeometry's own UVs are in shape units).
function faceGeometry(w, h, r) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  const g = new THREE.ShapeGeometry(s, 12);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / w + 0.5, pos.getY(i) / h + 0.5);
  return { shape: s, geometry: g };
}

// Additive rainbow layer. Colour bands move with the card's tilt and a sweeping glint, masked so
// only the foil areas (border, wordmark, shards, fine lines) light up.
function foilMaterial(mask) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uMask: { value: mask }, uTilt: { value: new THREE.Vector2() }, uSweep: { value: -1 }, uStrength: { value: 0.55 }, uGlint: { value: 0.6 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMask; uniform vec2 uTilt; uniform float uSweep; uniform float uStrength; uniform float uGlint;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        float m = texture2D(uMask, vUv).r;
        float band = vUv.x * 1.3 + vUv.y * 0.7 + uTilt.y * 1.8 - uTilt.x * 1.2;
        vec3 rainbow = 0.5 + 0.5 * cos(6.28318 * (band + vec3(0.0, 0.33, 0.67)));
        float d = vUv.x + vUv.y * 0.55 - uSweep;            // diagonal glint position
        float glint = exp(-d * d * 180.0);
        float sparkle = step(0.985, hash(floor(vUv * vec2(260.0, 162.0)))) * glint * 2.5;
        vec3 col = rainbow * m * uStrength * (0.55 + 0.45 * abs(sin(band * 3.14159)))
                 + vec3(1.0) * glint * (0.35 + m) * uGlint + vec3(sparkle);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

function pearl(map, env) {
  return new THREE.MeshPhysicalMaterial({
    map, envMap: env, envMapIntensity: 0.9, roughness: 0.32, metalness: 0.05,
    clearcoat: 1, clearcoatRoughness: 0.12, iridescence: 0.35, iridescenceIOR: 1.35, iridescenceThicknessRange: [180, 520],
  });
}

// ---------- interactive card ----------
const CW = 3.2;
const CH = (CW * CARD_H) / CARD_W;

async function buildCard(env, { photoSrc = P.photo, forEmail = false } = {}) {
  const photo = await loadImage(photoSrc);
  const [front, back] = await Promise.all([drawFront(photo, { forEmail }), drawBack()]);
  const { shape, geometry } = faceGeometry(CW, CH, 0.13);
  const depth = 0.028;
  const card = new THREE.Group();

  const edge = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 12 }),
    new THREE.MeshPhysicalMaterial({ color: 0xdfe3ff, envMap: env, roughness: 0.2, metalness: 0.6, iridescence: 1, iridescenceIOR: 1.6 }));
  edge.position.z = -depth / 2;
  card.add(edge);

  const foils = [];
  const face = (canvas, side) => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(geometry, pearl(texture(canvas), env)));
    const foil = new THREE.Mesh(geometry, foilMaterial(texture(drawFoilMask(side, { lines: !forEmail }), THREE.NoColorSpace)));
    foil.position.z = 0.0015;
    foils.push(foil.material);
    g.add(foil);
    g.position.z = depth / 2 + 0.0005;
    if (side === "back") {
      g.rotation.y = Math.PI;
      g.position.z = -g.position.z;
    }
    card.add(g);
  };
  face(front, "front");
  face(back, "back");
  return { card, foils };
}

function shadowSprite() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,.55)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(CW * 1.15, 0.7), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.y = -CH / 2 - 0.45;
  return m;
}

export async function mountHoloCard(el) {
  const canvasEl = document.createElement("canvas");
  el.append(canvasEl);
  const renderer = makeRenderer(canvasEl);
  const env = envFor(renderer);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 7);
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(2, 3, 4);
  scene.add(key, new THREE.AmbientLight(0xffffff, 0.25));

  const { card, foils } = await buildCard(env);
  const shadow = shadowSprite();
  scene.add(card, shadow);

  // ---- state: yaw (spin/flip), tilt (pointer or gyro) ----
  let yaw = 0;
  let yawTarget = 0;
  const tilt = new THREE.Vector2();
  const tiltTarget = new THREE.Vector2();
  let drag = null;
  let sweep = -1;
  let idle = 0; // idle-animation clock; frozen while the page's motion is paused
  const paused = () => document.documentElement.classList.contains("motion-paused");

  const fit = () => {
    const w = el.clientWidth;
    const h = el.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the card ~86% of the width on phones, capped by height on wide screens
    const vFov = (camera.fov * Math.PI) / 180;
    const distForW = (CW / 0.86 / camera.aspect) / (2 * Math.tan(vFov / 2));
    const distForH = (CH / 0.62) / (2 * Math.tan(vFov / 2));
    camera.position.z = Math.max(distForW, distForH);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(fit).observe(el);
  fit();

  const flip = () => {
    yawTarget = Math.round(yawTarget / Math.PI) * Math.PI + Math.PI;
    sweep = -0.6;
  };

  el.addEventListener("pointermove", (e) => {
    if (drag) {
      const dx = e.clientX - drag.x;
      drag.moved = Math.max(drag.moved, Math.abs(dx));
      yaw = yawTarget = drag.yaw + dx * 0.011;
      drag.v = e.movementX;
      return;
    }
    if (e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    tiltTarget.set(((e.clientY - r.top) / r.height - 0.5) * 0.5, ((e.clientX - r.left) / r.width - 0.5) * 0.7);
  });
  el.addEventListener("pointerleave", () => tiltTarget.set(0, 0));
  el.addEventListener("pointerdown", (e) => {
    el.setPointerCapture(e.pointerId);
    drag = { x: e.clientX, yaw, moved: 0, v: 0, t: performance.now() };
    askForGyro();
  });
  el.addEventListener("pointerup", () => {
    if (!drag) return;
    const tap = drag.moved < 6 && performance.now() - drag.t < 350;
    if (tap) flip();
    else yawTarget = Math.round((yaw + drag.v * 0.06) / Math.PI) * Math.PI; // fling, then settle on a face
    drag = null;
  });
  el.addEventListener("pointercancel", () => {
    drag = null;
    yawTarget = Math.round(yaw / Math.PI) * Math.PI;
  });
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      flip();
    }
  });

  // Phone tilt. iOS asks for permission, which must come from a tap.
  let gyro = false;
  // beta/gamma are relative to the device, so rotate them into screen axes first.
  const onOrient = (e) => {
    if (e.beta == null) return;
    gyro = true;
    const angle = screen.orientation?.angle ?? window.orientation ?? 0;
    const [front, side] = {
      0: [e.beta, e.gamma],
      90: [-e.gamma, e.beta],
      180: [-e.beta, -e.gamma],
      270: [e.gamma, -e.beta],
    }[(angle + 360) % 360] ?? [e.beta, e.gamma];
    tiltTarget.set(THREE.MathUtils.clamp((front - 45) / 90, -0.35, 0.35), THREE.MathUtils.clamp(side / 70, -0.45, 0.45));
    wake();
  };
  function askForGyro() {
    if (gyro || !window.DeviceOrientationEvent) return;
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission().then((s) => s === "granted" && addEventListener("deviceorientation", onOrient)).catch(() => {});
    } else addEventListener("deviceorientation", onOrient);
  }
  if (typeof window.DeviceOrientationEvent?.requestPermission !== "function") askForGyro();

  // ---- loop: runs while on screen; sleeps when motion is paused and the card has settled ----
  let visible = true;
  let last = performance.now();
  let raf = 0;
  function wake() {
    if (raf || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    wake();
  }).observe(el);
  document.addEventListener("visibilitychange", wake);
  // the page's pause toggle flips a class on <html>
  new MutationObserver(wake).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  ["pointerdown", "pointermove", "keydown"].forEach((t) => el.addEventListener(t, wake));

  function frame(now) {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!paused()) idle += dt;
    const t = idle;
    const k = 1 - Math.exp(-dt * 7);
    if (!drag) yaw += (yawTarget - yaw) * k;
    tilt.lerp(tiltTarget, 1 - Math.exp(-dt * 5));

    card.rotation.set(tilt.x + Math.sin(t * 0.8) * 0.03, yaw + tilt.y + Math.sin(t * 0.55) * 0.05, Math.sin(t * 0.7) * 0.015);
    card.position.y = Math.sin(t * 1.2) * 0.05;
    shadow.material.opacity = 0.75 - card.position.y * 2;
    shadow.scale.setScalar(1 - card.position.y * 0.6);

    // idle glint every ~5 s, or right after a flip
    if (!paused()) sweep += dt * 0.9;
    if (sweep > 2.4) sweep = -1.6;
    foils.forEach((f) => {
      f.uniforms.uTilt.value.set(card.rotation.x, card.rotation.y);
      f.uniforms.uSweep.value = sweep;
    });
    renderer.render(scene, camera);
    const settled = Math.abs(yawTarget - yaw) < 1e-3 && tilt.distanceTo(tiltTarget) < 1e-3;
    if (paused() && !drag && settled) return; // still frame; wake() resumes on input or un-pause
    raf = requestAnimationFrame(frame);
  }
  wake();
}

// ---------- GIF tile for the email signature ----------
// Renders the signature art as a holo tile on white; frame(i/n) poses one loop step.
export async function createArtTile(canvasEl, size) {
  const renderer = makeRenderer(canvasEl, { background: 0xffffff, gl: { preserveDrawingBuffer: true } });
  renderer.setPixelRatio(1);
  renderer.setSize(size.w, size.h, false);
  const env = envFor(renderer);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, size.w / size.h, 0.1, 20);
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(2, 3, 4);
  scene.add(key, new THREE.AmbientLight(0xffffff, 0.3));

  const art = document.createElement("canvas");
  art.width = art.height = 512;
  const ctx = art.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, 512, 512);
  drawArt(ctx, 24, 40, 464, 432, await loadImage("../" + P.photo));

  const mask = document.createElement("canvas");
  mask.width = mask.height = 256;
  const mctx = mask.getContext("2d");
  mctx.fillStyle = "#000";
  mctx.fillRect(0, 0, 256, 256);
  mctx.strokeStyle = "#fff";
  mctx.lineWidth = 6;
  mctx.beginPath();
  mctx.roundRect(6, 6, 244, 244, 26);
  mctx.stroke();
  mctx.strokeStyle = "rgba(255,255,255,.22)";
  mctx.lineWidth = 2;
  for (let x = -256; x < 256; x += 9) {
    mctx.beginPath();
    mctx.moveTo(x, 256);
    mctx.lineTo(x + 136, 0);
    mctx.stroke();
  }

  const w = 2;
  const h = (2 * size.h) / size.w;
  const { geometry } = faceGeometry(w * 0.86, h * 0.86, 0.16);
  const tile = new THREE.Group();
  tile.add(new THREE.Mesh(geometry, pearl(texture(art), env)));
  const foilMesh = new THREE.Mesh(geometry, foilMaterial(texture(mask, THREE.NoColorSpace)));
  foilMesh.position.z = 0.002;
  foilMesh.material.uniforms.uStrength.value = 0.8;
  tile.add(foilMesh);
  scene.add(tile);
  camera.position.z = h / (2 * Math.tan((camera.fov * Math.PI) / 360)) * 1.02;

  return function frame(p) {
    const a = p * Math.PI * 2;
    // figure-8 sway that starts flat: frame 0 is what Outlook desktop shows as a still
    tile.rotation.set(Math.sin(a * 2) * 0.1, Math.sin(a) * 0.32, 0);
    foilMesh.material.uniforms.uTilt.value.set(tile.rotation.x, tile.rotation.y);
    foilMesh.material.uniforms.uSweep.value = -0.4 + p * 2.2; // one glint per loop
    renderer.render(scene, camera);
    return canvasEl;
  };
}

// ---------- GIF of the whole card for the email signature ----------
// The page's holo card on its dark stage: a gentle tilt loop with one foil glint per loop.
export async function createCardLoop(canvasEl, size) {
  const renderer = makeRenderer(canvasEl, { background: 0x0e0e14, gl: { preserveDrawingBuffer: true } });
  renderer.setPixelRatio(1);
  renderer.setSize(size.w, size.h, false);
  const env = envFor(renderer);
  const scene = new THREE.Scene();

  const stage = document.createElement("canvas");
  stage.width = 512;
  stage.height = 320;
  const sctx = stage.getContext("2d");
  const glow = sctx.createRadialGradient(256, 150, 0, 256, 150, 300);
  glow.addColorStop(0, "#2b3266");
  glow.addColorStop(0.45, "#17172a");
  glow.addColorStop(1, "#0b0b10");
  sctx.fillStyle = glow;
  sctx.fillRect(0, 0, 512, 320);
  scene.background = texture(stage);

  const camera = new THREE.PerspectiveCamera(30, size.w / size.h, 0.1, 30);
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(2, 3, 4);
  scene.add(key, new THREE.AmbientLight(0xffffff, 0.25));
  const { card, foils } = await buildCard(env, { photoSrc: "../" + P.photo, forEmail: true });
  scene.add(card);
  // card fills ~84% of the frame width
  camera.position.z = (CW / 0.84 / camera.aspect) / (2 * Math.tan((camera.fov * Math.PI) / 360));

  return function frame(p) {
    const a = p * Math.PI * 2;
    // starts flat and centred: frame 0 is the still Outlook desktop shows
    card.rotation.set(Math.sin(a * 2) * 0.07, Math.sin(a) * 0.3, Math.sin(a) * 0.012);
    card.position.y = Math.sin(a) * 0.03;
    foils.forEach((f) => {
      f.uniforms.uTilt.value.set(card.rotation.x, card.rotation.y);
      f.uniforms.uSweep.value = -0.5 + p * 2.4;
      f.uniforms.uGlint.value = 0.3; // a softer glint keeps the small GIF text readable
    });
    renderer.render(scene, camera);
    return canvasEl;
  };
}
