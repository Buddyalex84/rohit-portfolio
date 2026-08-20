(function () {
  function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  /* ── INTRO ── */
  const intro = document.getElementById('intro'),
    f = document.getElementById('introFirst'),
    l = document.getElementById('introLast'),
    t = document.getElementById('introTag'),
    bar = document.getElementById('introBar'),
    blades = document.querySelectorAll('.shutter-blade');

  let bs = null;
  (function ab(ts) { if (!bs) bs = ts; bar.style.width = (ease(Math.min((ts - bs) / 2200, 1)) * 100) + '%'; if ((ts - bs) < 2200) requestAnimationFrame(ab); })();

  setTimeout(() => { f.style.transition = 'opacity .9s ease,transform .9s ease'; f.style.opacity = '1'; f.style.transform = 'none'; }, 300);
  setTimeout(() => { l.style.transition = 'opacity .8s ease,transform .8s ease'; l.style.opacity = '1'; l.style.transform = 'none'; }, 900);
  setTimeout(() => { t.style.transition = 'opacity .7s ease'; t.style.opacity = '1'; }, 1400);
  setTimeout(() => { blades.forEach((b, i) => { b.style.transition = `transform .7s cubic-bezier(.4,0,.2,1) ${i * .06}s`; b.style.transform = 'scaleY(0)'; }); }, 2400);
  setTimeout(() => { intro.style.transition = 'opacity .6s ease'; intro.style.opacity = '0'; }, 3100);
  setTimeout(() => {
    intro.style.display = 'none';
    document.getElementById('mainNav').classList.add('visible');
    revealHero();
  }, 3700);

  /* ── HERO REVEAL ── */
  function revealHero() {
    [
      { id: 'hEyebrow', d: 0 }, { id: 'hLine1', d: 150 }, { id: 'hLine2', d: 280 },
      { id: 'hSub', d: 420 }, { id: 'hDesc', d: 540 }, { id: 'hBrands', d: 620 },
      { id: 'hBtn1', d: 720 }
    ].forEach(({ id, d }) => setTimeout(() => document.getElementById(id)?.classList.add('in'), d));
    setTimeout(() => {
      document.getElementById('heroScroll')?.classList.add('in');
      document.getElementById('filmReel')?.classList.add('visible');
    }, 950);
  }

  /* ── SCROLL REVEAL ── */
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        e.target.querySelectorAll('[data-target]').forEach(animateCounter);
        ro.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.port-card,.service-row').forEach(el => ro.observe(el));

  /* ── COUNTER ── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target), suffix = el.dataset.suffix || '', dur = 1800;
    let s = null;
    (function step(ts) {
      if (!s) s = ts;
      const p = Math.min((ts - s) / dur, 1);
      el.textContent = Math.floor(ease(p) * target) + suffix;
      if (p < 1) requestAnimationFrame(step); else el.textContent = target + suffix;
    })();
  }

  /* ── PARTICLES ── */
  const cv = document.getElementById('particles'), ctx = cv.getContext('2d');
  let W, H, pts = [];
  function resize() { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; }
  resize(); window.addEventListener('resize', resize);
  for (let i = 0; i < 55; i++) pts.push({ x: Math.random() * 1920, y: Math.random() * 1080, r: Math.random() * 1.2 + .2, vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18, a: Math.random() * .5 + .1 });
  (function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => { p.x += p.vx; p.y += p.vy; if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(201,169,110,${p.a})`; ctx.fill(); });
    requestAnimationFrame(draw);
  })();

  /* ── CURSOR ── */
  const dot = document.getElementById('cursorDot'), ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function mc() { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; rx += (mx - rx) * .12; ry += (my - ry) * .12; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(mc); })();
  document.querySelectorAll('a,button,.port-card,.service-row').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

  /* ── SMOOTH SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
})();

// ── MOVING PORTFOLIO GALLERY ──
(function () {
  const portfolio = document.getElementById('portfolio');
  const primaryGrid = portfolio?.querySelector('.portfolio-grid:not(.extra-projects)');
  const extraGrid = document.getElementById('extraProjects');
  if (!portfolio || !primaryGrid || !extraGrid) return;

  const cards = [
    ...primaryGrid.querySelectorAll(':scope > .port-card'),
    ...extraGrid.querySelectorAll(':scope > .port-card')
  ];
  if (!cards.length) return;

  const viewport = document.createElement('div');
  viewport.className = 'portfolio-marquee';
  viewport.setAttribute('aria-label', 'Draggable portfolio video gallery');
  const track = document.createElement('div');
  track.className = 'portfolio-marquee-track';
  viewport.appendChild(track);

  cards.forEach(card => track.appendChild(card));
  cards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.dataset.marqueeClone = 'true';
    track.appendChild(clone);
  });

  primaryGrid.before(viewport);
  primaryGrid.remove();
  extraGrid.remove();

  let offset = 0;
  let paused = false;
  let dragging = false;
  let pointerStart = 0;
  let offsetStart = 0;
  let moved = false;
  let suppressClick = false;
  let previousTime = 0;

  function halfWidth() { return track.scrollWidth / 2; }
  function normalize() {
    const width = halfWidth();
    if (!width) return;
    while (offset <= -width) offset += width;
    while (offset > 0) offset -= width;
  }
  function draw() { track.style.transform = `translate3d(${offset}px, 0, 0)`; }
  function animate(time) {
    if (!previousTime) previousTime = time;
    const delta = Math.min(time - previousTime, 48);
    previousTime = time;
    if (!paused && !dragging && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      offset -= delta * 0.03;
      normalize();
      draw();
    }
    requestAnimationFrame(animate);
  }

  viewport.addEventListener('mouseenter', () => { paused = true; });
  viewport.addEventListener('mouseleave', () => { if (!dragging) paused = false; });
  viewport.addEventListener('pointerdown', event => {
    dragging = true;
    moved = false;
    paused = true;
    pointerStart = event.clientX;
    offsetStart = offset;
    viewport.classList.add('dragging');
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove', event => {
    if (!dragging) return;
    const distance = event.clientX - pointerStart;
    if (Math.abs(distance) > 6) moved = true;
    offset = offsetStart + distance;
    normalize();
    draw();
  });
  function stopDragging(event) {
    if (!dragging) return;
    dragging = false;
    suppressClick = moved;
    viewport.classList.remove('dragging');
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    paused = false;
  }
  viewport.addEventListener('pointerup', stopDragging);
  viewport.addEventListener('pointercancel', stopDragging);
  track.addEventListener('click', event => {
    if (suppressClick) {
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressClick = false;
      return;
    }
    const clone = event.target.closest('[data-marquee-clone="true"]');
    if (!clone) return;
    const source = clone.dataset.src;
    const original = cards.find(card => card.dataset.src === source);
    if (original) original.click();
  }, true);
  window.addEventListener('resize', () => { normalize(); draw(); });
  requestAnimationFrame(animate);
})();

// ── VIDEO LIGHTBOX ──
(function () {
  const modal = document.getElementById('videoModal');
  const vid = document.getElementById('modalVideo');
  const lbl = document.getElementById('modalLabel');
  const close = document.getElementById('closeModal');

  document.querySelectorAll('.video-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const src = card.dataset.src;
      const title = card.dataset.title || card.querySelector('.port-title')?.textContent || '';
      vid.src = src;
      lbl.textContent = title;
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      vid.play().catch(() => { });
    });
  });

  function closeModal() {
    vid.pause();
    vid.src = '';
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
  close.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  /* ── VIEW MORE VIDEOS ── */
  const viewMoreBtn = document.getElementById("viewMoreBtn");
const extraProjects = document.getElementById("extraProjects");

if (viewMoreBtn && extraProjects) {

    viewMoreBtn.addEventListener("click", () => {

        extraProjects.classList.toggle("show");

        if (extraProjects.classList.contains("show")) {
            viewMoreBtn.textContent = "Show Less";
        } else {
            viewMoreBtn.textContent = "View More Projects";
        }

    });

}

// Tap the menu
  const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {

    navLinks.classList.toggle("active");
    menuToggle.classList.toggle("active");

    if(navLinks.classList.contains("active")){
        menuToggle.innerHTML = "✕";
    }else{
        menuToggle.innerHTML = "☰";
    }

});

document.querySelectorAll(".nav-links a").forEach(link=>{

    link.addEventListener("click",(e)=>{

        navLinks.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.innerHTML="☰";

        // Gallery link: just scroll to portfolio section (always visible now)
        if (link.id === "galleryLink") {
            e.preventDefault();
            const portfolioSection = document.getElementById("portfolio");
            if (portfolioSection) {
                portfolioSection.scrollIntoView({ behavior: "smooth" });
            }
        }

    });

});
})();
