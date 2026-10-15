/* Ruban Madhu | Portfolio scripts */
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* 1. Background colour and side rail follow the section on screen */
const dots = $$(".rail a");
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    document.body.dataset.tone = e.target.dataset.tone;
    dots.forEach((d) => d.classList.toggle("on", d.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("[data-tone]").forEach((s) => s.id && io.observe(s));

/* 2. Scroll-linked motion: rail fill, hero name drift, journey line */
const rail = $(".rail"), hero = $(".hero"), path = $(".path"), stops = $$(".path li");
let queued = false, lastY = 0;

function update() {
  const y = scrollY, h = innerHeight;
  const max = document.documentElement.scrollHeight - h;
  rail.style.setProperty("--p", max > 0 ? y / max : 0);
  if (Math.abs(y - lastY) > 1) { rail.classList.toggle("up", y < lastY); lastY = y; }
  if (!reduce) hero.style.setProperty("--s", Math.min(y, 600));

  const r = path.getBoundingClientRect();
  path.style.setProperty("--p", Math.max(0, Math.min(1, (h * 0.65 - r.top) / r.height)));
  stops.forEach((li) => li.classList.toggle("reached", li.getBoundingClientRect().top < h * 0.65));
  queued = false;
}
addEventListener("scroll", () => {
  if (!queued) { queued = true; requestAnimationFrame(update); }
}, { passive: true });
addEventListener("resize", update);
update();

/* 3. Skill ticker: duplicate the words so the loop is seamless */
const track = $(".track");
track.innerHTML += track.innerHTML;
if (!reduce) track.classList.add("loop");

/* 4. Show initials if the photo file is missing */
const img = $("#img"), frame = $("#frame");
function noPhoto() { img.remove(); frame.classList.add("none"); frame.textContent = "RM"; }
img.addEventListener("error", noPhoto);
if (img.complete && img.naturalWidth === 0) noPhoto();

/* 5. Copy email */
const copy = $("#copy");
copy.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText("rubanmadhu000@gmail.com"); copy.textContent = "Copied"; const r = copy.getBoundingClientRect(); burst(r.left + r.width / 2, r.top); }
  catch (e) { copy.textContent = "Copy failed"; }
  setTimeout(() => (copy.textContent = "Copy email"), 2000);
});

/* 6. Footer year */
$("#year").textContent = new Date().getFullYear();

/* 7. Burst of dots: copy button, photo, squashed bugs */
function burst(x, y) {
  if (reduce) return;
  for (let i = 0; i < 12; i++) {
    const d = document.createElement("i"), a = (Math.PI * 2 * i) / 12, r = 40 + Math.random() * 50;
    d.className = "pop";
    d.style.cssText = `left:${x}px;top:${y}px;background:var(${i % 2 ? "--accent" : "--fg"})`;
    document.body.append(d);
    d.animate([
      { transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * r}px),calc(-50% + ${Math.sin(a) * r}px)) scale(0)`, opacity: 0 }
    ], { duration: 650, easing: "ease-out" }).onfinish = () => d.remove();
  }
}
$(".photo").addEventListener("click", (e) => burst(e.clientX, e.clientY));

/* 8. Photo tilts toward the pointer, buttons lean toward it (mouse only) */
if (!reduce && matchMedia("(hover:hover)").matches) {
  const ph = $(".photo");
  addEventListener("pointermove", (e) => {
    ph.style.setProperty("--rx", (0.5 - e.clientY / innerHeight) * 16 + "deg");
    ph.style.setProperty("--ry", (e.clientX / innerWidth - 0.5) * 20 + "deg");
  }, { passive: true });
  $$(".btn").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      b.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.25}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`;
    });
    b.addEventListener("pointerleave", () => (b.style.translate = ""));
  });
}

/* 9. Headings, facts and skill rows rise into view */
if (!reduce) {
  const rv = new IntersectionObserver((es, o) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); o.unobserve(e.target); }
  }), { threshold: 0.15 });
  $$(".sec h2,.big,.facts>div,.skills>div,.proj,.path li,.mail,.contact .btns,.links li").forEach((el) => {
    el.style.setProperty("--i", Math.min([...el.parentNode.children].indexOf(el), 6));
    el.classList.add("rv");
    rv.observe(el);
  });
}

/* 10. Hero letters pop when hovered; stickers jiggle when clicked */
$$(".name .line span").forEach((s) => {
  s.innerHTML = [...s.textContent].map((c) => `<b class="ch">${c}</b>`).join("");
});
$(".line:nth-child(2) span").addEventListener("animationend", () => $$(".line").forEach((l) => (l.style.overflow = "visible")));
$$(".stk").forEach((s) => s.addEventListener("click", (e) => {
  burst(e.clientX, e.clientY);
  s.classList.remove("hit"); void s.offsetWidth; s.classList.add("hit");
}));

/* 11. Ticker speeds up when you scroll fast; cursor leaves a trail */
if (!reduce) {
  let ly = scrollY, rate = 1, last = 0;
  (function tick() {
    const d = Math.abs(scrollY - ly); ly = scrollY;
    rate += (1 + Math.min(d * 0.5, 9) - rate) * 0.1;
    const a = track.getAnimations()[0];
    if (a) a.playbackRate = rate;
    requestAnimationFrame(tick);
  })();
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || e.timeStamp - last < 40) return;
    last = e.timeStamp;
    const d = document.createElement("i");
    d.className = "pop";
    d.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:7px;height:7px;background:var(${last % 2 ? "--accent" : "--fg"})`;
    document.body.append(d);
    d.animate([{ opacity: 0.9, transform: "translate(-50%,-50%) scale(1)" },
      { opacity: 0, transform: "translate(-50%,calc(-50% + 18px)) scale(0)" }], 500).onfinish = () => d.remove();
  }, { passive: true });
}

/* 12. Bug hunt: bugs crawl across the page while you read. Squash 8 to win. */
if (!reduce) {
  const GOAL = 8, chip = document.createElement("span");
  let got = 0, live = 0, done = false;
  chip.className = "chip"; chip.textContent = "👾 0/" + GOAL;
  $(".bar nav").prepend(chip);
  const toast = (msg) => {
    const t = document.createElement("p");
    t.className = "toast"; t.textContent = msg;
    document.body.append(t);
    setTimeout(() => t.remove(), 3600);
  };
  function spawn() {
    if (done || document.hidden || live >= 2) return;
    const W = innerWidth, H = innerHeight, b = document.createElement("button"), ltr = Math.random() < 0.5;
    b.className = "bug"; b.type = "button"; b.textContent = "👾"; b.setAttribute("aria-label", "Zap the bug");
    const pts = [{ translate: `${ltr ? -60 : W + 60}px ${Math.random() * H}px` }];
    for (let i = 0; i < 3; i++) pts.push({ translate: `${W * (0.15 + Math.random() * 0.7)}px ${H * (0.15 + Math.random() * 0.7)}px` });
    pts.push({ translate: `${ltr ? W + 60 : -60}px ${Math.random() * H}px` });
    document.body.append(b); live++;
    const anim = b.animate(pts, 5500 + Math.random() * 2500);
    anim.onfinish = () => { b.remove(); live--; };
    b.onclick = () => {
      const r = b.getBoundingClientRect();
      anim.cancel(); b.remove(); live--;
      burst(r.left + r.width / 2, r.top + r.height / 2);
      if (done) return;
      chip.textContent = (++got >= GOAL ? "🏆 " : "👾 ") + got + "/" + GOAL;
      chip.classList.remove("hit"); void chip.offsetWidth; chip.classList.add("hit");
      if (got >= GOAL) {
        done = true;
        toast("Bug free! Thanks for helping me debug.");
        for (let i = 0; i < 10; i++) setTimeout(() => burst(Math.random() * innerWidth, Math.random() * innerHeight * 0.7), i * 120);
      }
    };
  }
  function next() { spawn(); if (!done) setTimeout(next, 3500 + Math.random() * 3500); }
  setTimeout(() => { toast("An alien bug got loose on my site. Zap 8 of them."); next(); }, 3500);
}

/* 13. Space: twinkling stars that drift as you scroll, plus the odd shooting star */
const cv = document.createElement("canvas"), cx = cv.getContext("2d");
cv.className = "space"; document.body.prepend(cv);
let stars = [], W = 0, H = 0, D = 1, shot = null;
function sky() {
  D = devicePixelRatio || 1; W = cv.width = innerWidth * D; H = cv.height = innerHeight * D;
  stars = Array.from({ length: Math.round((innerWidth * innerHeight) / 5500) }, () => ({ x: Math.random() * W, y: Math.random() * H, z: 0.3 + Math.random() * 0.7, p: Math.random() * 6.28 }));
  if (reduce) draw(0);
}
function draw(t) {
  cx.clearRect(0, 0, W, H);
  cx.fillStyle = "#fff";
  for (const s of stars) {
    const y = (((s.y - scrollY * s.z * 0.25 * D) % H) + H) % H;
    cx.globalAlpha = reduce ? 0.7 * s.z : s.z * (0.35 + 0.65 * Math.sin(t / 600 + s.p) ** 2);
    cx.fillRect(s.x, y, s.z * 2.2 * D, s.z * 2.2 * D);
  }
  if (!reduce) {
    if (!shot && Math.random() < 0.003) shot = { x: W * (0.3 + Math.random() * 0.7), y: -20 };
    if (shot) {
      const L = 160 * D, g = cx.createLinearGradient(shot.x, shot.y, shot.x + 0.86 * L, shot.y - 0.5 * L);
      g.addColorStop(0, "#fff"); g.addColorStop(1, "transparent");
      cx.globalAlpha = 1; cx.strokeStyle = g; cx.lineWidth = 2 * D;
      cx.beginPath(); cx.moveTo(shot.x, shot.y); cx.lineTo(shot.x + 0.86 * L, shot.y - 0.5 * L); cx.stroke();
      shot.x -= 12 * D; shot.y += 7 * D;
      if (shot.y > H + 50 || shot.x < -200) shot = null;
    }
    requestAnimationFrame(draw);
  }
}
addEventListener("resize", sky); sky();
if (!reduce) requestAnimationFrame(draw);

