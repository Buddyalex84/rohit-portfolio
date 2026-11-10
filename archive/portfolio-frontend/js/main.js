
(function () {
  function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  /* ── INTRO ── */
  const intro = document.getElementById('intro'),
    f = document.getElementById('introFirst'),
    l = document.getElementById('introLast'),
    t = document.getElementById('introTag'),
    bar = document.getElementById('introBar'),
    blades = document.querySelectorAll('.shutter-blade');

  if (window.location.search.includes('nointro') || window.location.hash) {
    if (intro) intro.style.display = 'none';
    document.getElementById('mainNav')?.classList.add('visible');
    revealHero();
  } else {
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
  }

  /* ── HERO REVEAL ── */
  function revealHero() {
    [
      { id: 'hEyebrow', d: 0 }, { id: 'hLine1', d: 150 }, { id: 'hLine2', d: 280 },
      { id: 'hSub', d: 420 }, { id: 'hDesc', d: 540 },
      { id: 'hBtn1', d: 640 }, { id: 'hBtn2', d: 740 }
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
    if (event.button !== undefined && event.button !== 0) return;
    dragging = true;
    moved = false;
    paused = true;
    pointerStart = event.clientX;
    offsetStart = offset;
  });
  viewport.addEventListener('pointermove', event => {
    if (!dragging) return;
    const distance = event.clientX - pointerStart;
    if (Math.abs(distance) > 6) {
      if (!moved) {
        moved = true;
        viewport.classList.add('dragging');
        try {
          viewport.setPointerCapture(event.pointerId);
        } catch (e) { }
      }
      offset = offsetStart + distance;
      normalize();
      draw();
    }
  });
  function stopDragging(event) {
    if (!dragging) return;
    dragging = false;
    suppressClick = moved;
    viewport.classList.remove('dragging');
    if (viewport.hasPointerCapture(event.pointerId)) {
      try {
        viewport.releasePointerCapture(event.pointerId);
      } catch (e) { }
    }
    paused = false;
    if (suppressClick) {
      setTimeout(() => { suppressClick = false; }, 80);
    }
  }
  viewport.addEventListener('pointerup', stopDragging);
  viewport.addEventListener('pointercancel', stopDragging);

  viewport.addEventListener('click', event => {
    if (suppressClick || moved) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const card = event.target.closest('.video-card');
    if (card) {
      window.openPortfolioVideo?.(card);
    }
  });

  window.addEventListener('resize', () => { normalize(); draw(); });
  requestAnimationFrame(animate);
})();

// ── VIDEO LIGHTBOX ──
(function () {
  const modal = document.getElementById('videoModal');
  const vid = document.getElementById('modalVideo');
  const lbl = document.getElementById('modalLabel');
  const close = document.getElementById('closeModal');

  function openVideo(card) {
    if (!card) return;
    const src = card.dataset.src;
    if (!src) return;
    const title = card.dataset.title || card.querySelector('.port-title')?.textContent || '';
    if (modal.style.display === 'flex' && vid.src.endsWith(src)) return;
    vid.src = src;
    vid.currentTime = 0;
    lbl.textContent = title;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    vid.play().catch(() => { });
  }
  window.openPortfolioVideo = openVideo;

  document.querySelectorAll('.video-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => openVideo(card));
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

  // ── CASE STUDIES REELS CAROUSEL & PREVIEW ──
  (function () {
    const reelsTrack = document.getElementById('reelsTrack');
    const reelsThumb = document.getElementById('reelsScrollThumb');

    // Hover video preview for all reel cards
    document.querySelectorAll('.reel-card').forEach(card => {
      const vid = card.querySelector('video');
      if (!vid) return;

      card.addEventListener('mouseenter', () => {
        vid.play().catch(() => {});
      });

      card.addEventListener('mouseleave', () => {
        vid.pause();
        vid.currentTime = 0;
      });
    });

    if (!reelsTrack) return;

    // Scroll progress indicator sync
    function updateThumb() {
      if (!reelsThumb) return;
      const maxScroll = reelsTrack.scrollWidth - reelsTrack.clientWidth;
      if (maxScroll > 0) {
        const progress = reelsTrack.scrollLeft / maxScroll;
        // With thumb width at 25%, remaining span is 75% -> 300% of thumb width
        reelsThumb.style.transform = `translateX(${Math.min(Math.max(progress * 300, 0), 300)}%)`;
      } else {
        reelsThumb.style.transform = 'translateX(0%)';
      }
    }

    reelsTrack.addEventListener('scroll', updateThumb, { passive: true });
    window.addEventListener('resize', updateThumb);
    setTimeout(updateThumb, 300);

    // Mouse drag scrolling support
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let hasDragged = false;

    reelsTrack.addEventListener('mousedown', (e) => {
      isDown = true;
      hasDragged = false;
      reelsTrack.classList.add('dragging');
      startX = e.pageX - reelsTrack.offsetLeft;
      scrollStart = reelsTrack.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        reelsTrack.classList.remove('dragging');
        setTimeout(() => { hasDragged = false; }, 60);
      }
    });

    reelsTrack.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - reelsTrack.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 6) {
        hasDragged = true;
      }
      reelsTrack.scrollLeft = scrollStart - walk;
    });

    // Suppress lightbox click if user was dragging
    reelsTrack.addEventListener('click', (e) => {
      if (hasDragged) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }, true);

    // ── SHOW ALL 18 VIDEOS TOGGLE ──
    const toggleVideosBtn = document.getElementById('toggleAllVideosBtn');
    if (toggleVideosBtn) {
      let showingAll = false;
      const toggleText = toggleVideosBtn.querySelector('.btn-toggle-text');
      const countBadge = document.getElementById('videoCountBadge');

      toggleVideosBtn.addEventListener('click', () => {
        showingAll = !showingAll;
        reelsTrack.classList.toggle('show-all', showingAll);
        toggleVideosBtn.setAttribute('aria-expanded', showingAll ? 'true' : 'false');

        if (showingAll) {
          if (toggleText) toggleText.textContent = 'Show Featured (9 Videos)';
          if (countBadge) countBadge.textContent = 'All 18 Shown';
          toggleVideosBtn.style.background = 'var(--gold)';
          toggleVideosBtn.style.color = 'var(--black)';
        } else {
          if (toggleText) toggleText.textContent = 'Show All 18 Videos';
          if (countBadge) countBadge.textContent = '18 Total';
          toggleVideosBtn.style.background = '';
          toggleVideosBtn.style.color = '';
          reelsTrack.scrollTo({ left: 0, behavior: 'smooth' });
        }

        setTimeout(updateThumb, 350);
      });
    }

  })();

  // ── PACKAGES & APPOINTMENT BOOKING SELECTION ──
  function setupPackageBooking() {
    const packageButtons = document.querySelectorAll('[data-select-package]');
    const contactSection = document.getElementById('contact');
    const contactService = document.getElementById('contactService');
    const contactMessage = document.getElementById('contactMessage');
    const contactForm = document.getElementById('portfolioContactForm');

    packageButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const pkgName = btn.dataset.selectPackage;
        let selectVal = '';

        if (pkgName === 'Individual Reel Package') {
          selectVal = 'Package: Individual Reel (₹1,499 / reel)';
        } else if (pkgName === 'Premium Page Management') {
          selectVal = 'Package: Premium Page Management (₹24,999 / month)';
        } else if (pkgName === 'Content Package') {
          selectVal = 'Package: Content Package (₹19,999 / month)';
        }

        if (contactService && selectVal) {
          contactService.value = selectVal;
        }

        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        setTimeout(() => {
          if (contactForm) {
            contactForm.classList.remove('form-highlight-pulse');
            void contactForm.offsetWidth;
            contactForm.classList.add('form-highlight-pulse');
          }
          if (contactMessage) {
            contactMessage.focus();
            contactMessage.value = `Hi studio.4ever, I would like to book an appointment/consultation for the ${pkgName}.\n\nPreferred shoot date & brand details:\n`;
          }
        }, 700);
      });
    });
  }
  setupPackageBooking();

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

    if (navLinks.classList.contains("active")) {
      menuToggle.innerHTML = "✕";
    } else {
      menuToggle.innerHTML = "☰";
    }

  });

  document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", (e) => {

      navLinks.classList.remove("active");
      menuToggle.classList.remove("active");
      menuToggle.innerHTML = "☰";

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

  /* ── CUSTOM ASK / SOMETHING ELSE IN MIND TRIGGER & ANIMATION ── */
  function setupCustomAsk() {
    const customCard = document.getElementById('customServiceCard');
    const customBtn = document.getElementById('customAskBtn');
    const customBannerBtn = document.getElementById('customBannerBtn');
    const contactSection = document.getElementById('contact');
    const contactService = document.getElementById('contactService');
    const contactMessage = document.getElementById('contactMessage');
    const contactForm = document.getElementById('portfolioContactForm');

    function triggerCustomAsk(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // 1. Pre-select "Something else in mind? (Custom Ask)"
      if (contactService) {
        contactService.value = 'Something else in mind? (Custom Ask)';
      }

      // 2. Smoothly scroll into the contact section / form
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // 3. Trigger glowing gold pulse animation on the form & focus input
      setTimeout(() => {
        if (contactForm) {
          contactForm.classList.remove('form-highlight-pulse');
          void contactForm.offsetWidth; // force reflow
          contactForm.classList.add('form-highlight-pulse');
        }
        if (contactMessage) {
          contactMessage.focus();
          if (!contactMessage.value) {
            contactMessage.value = 'Hi studio.4ever, I have a custom ask for my brand:\n';
          }
        }
      }, 700);
    }

    if (customCard) customCard.addEventListener('click', triggerCustomAsk);
    if (customBtn) customBtn.addEventListener('click', triggerCustomAsk);
    if (customBannerBtn) customBannerBtn.addEventListener('click', triggerCustomAsk);
  }
  setupCustomAsk();

  /* ── CONTACT FORM SUBMISSION PROCESS ── */
  function setupContactForm() {
    const form = document.getElementById('portfolioContactForm');
    const statusMsg = document.getElementById('formStatusMsg');
    const submitBtn = document.getElementById('contactSubmitBtn');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName')?.value.trim();
      const email = document.getElementById('contactEmail')?.value.trim();
      const phone = document.getElementById('contactPhone')?.value.trim() || 'Not specified';
      const service = document.getElementById('contactService')?.value || 'General Inquiry';
      const message = document.getElementById('contactMessage')?.value.trim();

      if (!name || !email || !message) {
        if (statusMsg) {
          statusMsg.style.display = 'block';
          statusMsg.style.color = '#ff6b6b';
          statusMsg.textContent = 'Please fill out your name, email, and project details.';
        }
        return;
      }

      // Loading state with micro-animation
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.querySelector('span').textContent = 'Submitting...';
      }

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, projectType: service, message })
        });
        const data = await res.json();
        if (data.ok) {
          if (statusMsg) {
            statusMsg.style.display = 'block';
            statusMsg.style.color = 'var(--gold)';
            statusMsg.innerHTML = '✓ <b>Inquiry submitted successfully!</b> We will get back to you within 24 hours.';
          }
          form.reset();
        } else {
          throw new Error(data.error || 'Server error');
        }
      } catch (err) {
        // Smooth graceful fallback for preview & instant direct submission
        const inquiryText = encodeURIComponent(
          `*New Project Inquiry via studio.4ever*\n\n` +
          `*Name/Brand:* ${name}\n` +
          `*Email:* ${email}\n` +
          `*Phone:* ${phone}\n` +
          `*Service Needed:* ${service}\n\n` +
          `*Project Details:*\n${message}`
        );

        if (statusMsg) {
          statusMsg.style.display = 'block';
          statusMsg.style.color = 'var(--gold)';
          statusMsg.innerHTML = `✓ <b>Inquiry ready!</b> <a href="https://wa.me/919109510469?text=${inquiryText}" target="_blank" rel="noopener" style="color:var(--gold);text-decoration:underline;font-weight:600;margin-left:4px;">Click to complete on WhatsApp &rarr;</a>`;
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.querySelector('span').textContent = 'Submit Inquiry →';
        }
      }
    });
  }
  setupContactForm();

})();

