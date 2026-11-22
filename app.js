const P = window.PROFILE;
const $ = (id) => document.getElementById(id);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- profile ----------
function setAvatar(el) {
  const img = new Image();
  img.alt = "";
  img.onload = () => el.replaceChildren(img);
  img.onerror = () => (el.textContent = P.initials);
  img.src = P.photo;
}

function renderProfile() {
  const portrait = $("portrait");
  const img = $("portraitImg");
  img.onerror = () => portrait.classList.add("no-photo");
  img.src = P.photo;
  $("monogram").innerHTML = `<span>${P.initials}</span>`;

  $("pinIcon").innerHTML = icon("pin");
  $("location").textContent = P.location;
  $("askMic").innerHTML = icon("mic");
  $("askSend").innerHTML = icon("arrowUp");

  [$("avatar"), $("personaAvatar")].forEach(setAvatar);
  $("name").innerHTML = `${P.name}${icon("spark")}`;
  $("tagline").textContent = P.tagline;
  $("workCount").textContent = P.work.length;

  const dm = `<a href="mailto:${P.email}">${icon("send")}DM</a>`;
  const links = P.links
    .map((l) => `<a href="${l.url}" target="_blank" rel="noopener" aria-label="${l.label}">${icon(l.id)}</a>`)
    .join("");
  $("socials").innerHTML = dm + links;

  $("currently").textContent = P.currently;
  $("workMeta").textContent = `${P.work.length} projects`;
  $("slides").innerHTML = P.work
    .map((w, i) => `<li><button class="slide" style="--h:${w.hue}" data-i="${i}">
        <small>${w.tags.slice(0, 2).join(" · ")}</small><b>${w.title}</b></button></li>`)
    .join("");

  const site = $("siteLink");
  site.href = P.website;
  site.textContent = `Full portfolio · ${new URL(P.website).host}`;

  $("dockTop").innerHTML = icon("user");
  $("dockWork").innerHTML = icon("grid");
  $("dockChat").innerHTML = icon("chat");
}

// Typewriter placeholder on the ask bar; stops while the field is in use.
function typePlaceholder() {
  const input = $("askInput");
  const text = "Ask me anything…";
  if (reduceMotion) return;
  let n = 0;
  let timer;
  const tick = () => {
    if (document.activeElement === input || input.value) {
      input.placeholder = text;
      timer = setTimeout(tick, 1200);
      return;
    }
    n = n > text.length + 12 ? 0 : n + 1; // the overshoot holds the full text for a beat
    input.placeholder = text.slice(0, Math.min(n, text.length)) + (n <= text.length ? "|" : "");
    timer = setTimeout(tick, n <= text.length ? 90 : 160);
  };
  tick();
  addEventListener("pagehide", () => clearTimeout(timer));
}

function revealOnScroll() {
  const els = document.querySelectorAll(".currently, .work");
  if (reduceMotion || !("IntersectionObserver" in window)) return;
  els.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach((el) => io.observe(el));
}

// ---------- digital persona (scripted) ----------
const thread = () => $("thread");

const answerFor = window.makeAnswerer(P);

function addMsg(text, who) {
  const el = document.createElement("p");
  el.className = `msg ${who}`;
  el.textContent = text;
  thread().append(el);
  el.scrollIntoView({ block: "end", behavior: reduceMotion ? "auto" : "smooth" });
  return el;
}

function typingRow() {
  const row = document.createElement("div");
  row.className = "typing";
  row.innerHTML = "<i></i><i></i><i></i><span></span>";
  row.querySelector("span").textContent = `${P.firstName}'s typing…`;
  return row;
}

let pending = null; // timer for the answer being "typed"

// Returns false when nothing was sent (empty, or still answering), so callers keep the input text.
function ask(question) {
  question = question.trim();
  if (!question || pending) return false;
  addMsg(question, "me");
  const row = typingRow();
  thread().append(row);
  pending = setTimeout(() => {
    pending = null;
    row.remove();
    addMsg(answerFor(question), "bot");
  }, reduceMotion ? 0 : 750 + Math.min(question.length * 12, 700));
  return true;
}

function cancelPending() {
  clearTimeout(pending);
  pending = null;
}

function greet() {
  const sentence = `Hey, you're chatting with ${P.firstName}'s digital persona.`;
  const h = document.createElement("p");
  h.className = "hello";
  const spoken = document.createElement("span");
  spoken.className = "sr-only";
  spoken.textContent = sentence;
  const shown = document.createElement("span");
  shown.setAttribute("aria-hidden", "true");
  shown.innerHTML = sentence
    .split(" ")
    .map((w, i) => `<span class="w" style="animation-delay:${i * 70}ms">${w}</span>`)
    .join(" ");
  h.append(spoken, shown);
  thread().replaceChildren(h);
}

function setupPersona() {
  const dlg = $("persona");
  $("personaTitle").innerHTML = `${P.firstName}'s <small>Digital persona</small>`;
  $("personaClose").innerHTML = icon("close");
  $("personaSend").innerHTML = icon("arrowUp");
  $("tabSpark").innerHTML = icon("spark");
  const human = $("tabHuman");
  human.href = `mailto:${P.email}`;
  human.innerHTML = `${icon("mail")}Email ${P.firstName}`;

  $("chips").innerHTML = P.persona.map((p, i) => `<button type="button" data-i="${i}">${p.q}</button>`).join("");
  $("chips").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) ask(P.persona[b.dataset.i].q);
  });

  const open = (firstQuestion) => {
    if (!dlg.open) {
      greet();
      dlg.showModal();
    }
    $("personaInput").focus();
    return firstQuestion ? ask(firstQuestion) : true;
  };

  $("askForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("askInput");
    if (open(input.value)) input.value = "";
  });
  $("dockChat").addEventListener("click", () => open());
  $("personaClose").addEventListener("click", () => dlg.close());
  // X button and Esc both end here: drop any half-typed answer so a reopen starts clean.
  dlg.addEventListener("close", cancelPending);
  $("personaForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("personaInput");
    if (ask(input.value)) input.value = "";
  });
}

// ---------- work stories ----------
function setupStories() {
  const dlg = $("story");
  const bars = $("bars");
  let at = 0;

  $("storyClose").innerHTML = icon("close");
  bars.innerHTML = P.work.map(() => "<span><i></i></span>").join("");

  const show = (i) => {
    if (i < 0) i = 0;
    if (i >= P.work.length) return dlg.close();
    at = i;
    const w = P.work[i];
    const body = $("storyBody");
    const hadFocus = body.contains(document.activeElement);
    body.style.setProperty("--h", w.hue);
    body.classList.add("art");
    body.innerHTML = `<div class="tags">${w.tags.map((t) => `<span>${t}</span>`).join("")}</div>
      <h3>${w.title}</h3><p>${w.text}</p>
      <a class="cta" href="${w.url}" target="_blank" rel="noopener">View the code</a>`;
    if (hadFocus) body.querySelector(".cta").focus();
    [...bars.children].forEach((b, j) => {
      b.className = j < i ? "done" : "";
      void b.offsetWidth; // restart the CSS animation on the current bar
      if (j === i) b.className = "now";
    });
  };

  // Hold to pause, like story apps. A long press must not also count as a prev/next tap.
  let downAt = 0;
  const tap = (step) => () => {
    if (performance.now() - downAt < 250) show(at + step);
  };
  const setPaused = (on) => dlg.classList.toggle("paused", on);

  bars.addEventListener("animationend", () => show(at + 1));
  $("storyPrev").addEventListener("click", tap(-1));
  $("storyNext").addEventListener("click", tap(1));
  $("storyClose").addEventListener("click", () => dlg.close());
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(at + 1);
    if (e.key === "ArrowLeft") show(at - 1);
    if (e.key === " " && !e.target.closest("a")) {
      e.preventDefault();
      setPaused(!dlg.classList.contains("paused"));
    }
  });
  let held = false; // only a pause started by a press is ended by the pointer
  dlg.addEventListener("pointerdown", () => {
    downAt = performance.now();
    held = true;
    setPaused(true);
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((t) =>
    dlg.addEventListener(t, () => {
      if (!held) return;
      held = false;
      setPaused(false);
    }));
  dlg.addEventListener("contextmenu", (e) => e.preventDefault());
  // Keyboard users get time to read and reach the link: stay paused while focus is visibly inside.
  dlg.addEventListener("focusin", (e) => {
    if (e.target.matches(":focus-visible")) setPaused(true);
  });
  dlg.addEventListener("close", () => setPaused(false));

  $("slides").addEventListener("click", (e) => {
    const b = e.target.closest(".slide");
    if (!b) return;
    dlg.showModal();
    show(Number(b.dataset.i));
  });
}

renderProfile();
typePlaceholder();
revealOnScroll();
setupPersona();
setupStories();
