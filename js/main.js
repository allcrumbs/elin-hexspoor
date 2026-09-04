/* ===================================================================
   Elin S. Hexspoor — interactions
   =================================================================== */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* year */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* sticky nav */
  var nav = document.getElementById('nav');
  function onScroll() { if (nav) nav.classList.toggle('is-stuck', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* brand -> soft scroll to very top (home page) */
  document.querySelectorAll('.nav__brand[href="#top"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* mobile menu toggle */
  document.querySelectorAll('.nav').forEach(function (navEl) {
    var toggle = navEl.querySelector('.nav__toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      var open = navEl.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    navEl.querySelectorAll('.nav__links a').forEach(function (a) {
      a.addEventListener('click', function () {
        navEl.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  });

  /* ---- toast ---- */
  var toast;
  function showToast(msg) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>' + msg;
    // force reflow so re-triggering the animation works
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toast.classList.remove('show'); }, 2000);
  }

  /* ---- copy email ---- */
  var EMAIL = 'elin.hexspoor@gmail.com';
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.top = '-9999px';
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject();
      } catch (e) { reject(e); }
    });
  }
  document.querySelectorAll('[data-copy-email]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      copyText(EMAIL).then(function () {
        showToast('Email copied');
      }).catch(function () {
        // fallback: open mail client if copy blocked
        window.location.href = 'mailto:' + EMAIL;
      });
    });
  });

  /* ---- CV dropdown ---- */
  document.querySelectorAll('[data-dd]').forEach(function (dd) {
    var btn = dd.querySelector('[data-dd-btn]');
    if (!btn) return;
    function close() { dd.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
    function open() { dd.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      dd.classList.contains('is-open') ? close() : open();
    });
    dd.querySelectorAll('.cv-dd__menu a').forEach(function (a) {
      a.addEventListener('click', function () { setTimeout(close, 50); });
    });
    document.addEventListener('click', function (e) { if (!dd.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  });

  /* ---- accordion ---- */
  document.querySelectorAll('[data-acc]').forEach(function (acc) {
    var head = acc.querySelector('.acc__head');
    var panel = acc.querySelector('.acc__panel');
    if (!head || !panel) return;
    head.addEventListener('click', function () {
      var open = acc.classList.toggle('is-open');
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        panel.style.height = panel.scrollHeight + 'px';
        panel.addEventListener('transitionend', function te() {
          if (acc.classList.contains('is-open')) panel.style.height = 'auto';
          panel.removeEventListener('transitionend', te);
        });
      } else {
        panel.style.height = panel.scrollHeight + 'px';
        void panel.offsetHeight;
        panel.style.height = '0px';
      }
    });
  });
  window.addEventListener('resize', function () {
    document.querySelectorAll('.acc.is-open .acc__panel').forEach(function (p) { p.style.height = 'auto'; });
  });

  /* ---- timeline: swap the sticky photo stage per era ---- */
  (function () {
    var chapters = Array.prototype.slice.call(document.querySelectorAll('.tl [data-era]'));
    var shots = {};
    document.querySelectorAll('.tl__shot[data-era]').forEach(function (s) { shots[s.getAttribute('data-era')] = s; });
    if (!chapters.length || !Object.keys(shots).length) return;
    var current = null;
    function update() {
      var line = window.innerHeight * 0.42;
      var active = chapters[0];
      chapters.forEach(function (c) { if (c.getBoundingClientRect().top < line) active = c; });
      var era = active.getAttribute('data-era');
      if (era === current) return;
      if (shots[era] && !shots[era].style.backgroundImage) return; // no photo for this era: keep showing the previous one
      current = era;
      Object.keys(shots).forEach(function (k) { shots[k].classList.toggle('is-active', k === era); });
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  })();

  /* ---- whole role card clickable ---- */
  document.querySelectorAll('.rolecard').forEach(function (card) {
    var link = card.querySelector('.rolecard__more');
    if (!link) return;
    card.addEventListener('click', function (e) {
      if (e.target.closest('a,button')) return;
      window.location.href = link.getAttribute('href');
    });
  });

  /* ---- recommendation letter request modal ---- */
  (function () {
    var modal = document.getElementById('recoModal');
    if (!modal) return;
    var form = document.getElementById('recoForm'),
        err = document.getElementById('recoErr'),
        ok = document.getElementById('recoOk'),
        letterField = document.getElementById('recoLetter');
    var FREE = ['gmail.com','googlemail.com','yahoo.','ymail.com','hotmail.','outlook.','live.','msn.com','icloud.com','me.com','mac.com','aol.com','proton.me','protonmail.com','pm.me','gmx.','mail.com','yandex.','zoho.com','tutanota.com','hey.com','fastmail.com','inbox.com'];
    function isCompanyEmail(e) {
      e = (e || '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return false;
      var dom = e.split('@')[1];
      return !FREE.some(function (x) { return x.charAt(x.length - 1) === '.' ? dom.indexOf(x) === 0 : dom === x; });
    }
    if (typeof module !== 'undefined') module.exports = { isCompanyEmail: isCompanyEmail };
    function openModal(letter) { letterField.value = letter; err.hidden = true; ok.hidden = true; form.hidden = false; modal.hidden = false; }
    function closeModal() { modal.hidden = true; form.reset(); }
    document.querySelectorAll('.reco__req').forEach(function (b) { b.addEventListener('click', function () { openModal(b.getAttribute('data-letter')); }); });
    modal.querySelectorAll('[data-close]').forEach(function (x) { x.addEventListener('click', closeModal); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var company = form.company.value.trim(), email = form.email.value.trim();
      if (!company) { err.textContent = 'Please enter your company.'; err.hidden = false; return; }
      if (!isCompanyEmail(email)) { err.textContent = 'Please use a company email. Free providers like Gmail, Yahoo or Outlook are not accepted.'; err.hidden = false; return; }
      err.hidden = true;
      var KEY = 'WEB3FORMS_ACCESS_KEY';
      var subject = 'Recommendation letter request: ' + letterField.value;
      var body = 'Company: ' + company + '\nWork email: ' + email + '\nRequested letter: ' + letterField.value;
      var done = function () { form.hidden = true; ok.hidden = false; };
      if (KEY === 'WEB3FORMS_ACCESS_KEY') {
        window.location.href = 'mailto:elin.hexspoor@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        done(); return;
      }
      fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: KEY, subject: subject, from_name: company, email: email, message: body }) })
        .then(function (r) { return r.json(); }).then(done).catch(done);
    });
  })();

  /* ---- carousel (prev/next scroll) ---- */
  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var scope = car.closest('section') || document;
    var prev = scope.querySelector('[data-carousel-prev]');
    var next = scope.querySelector('[data-carousel-next]');
    function amount() {
      var card = car.querySelector('.achv__item, .carousel__track > *');
      var gap = 16;
      return card ? card.getBoundingClientRect().width + gap : car.clientWidth * 0.8;
    }
    function sync() {
      if (!prev || !next) return;
      prev.disabled = car.scrollLeft <= 2;
      next.disabled = car.scrollLeft + car.clientWidth >= car.scrollWidth - 2;
    }
    if (prev) prev.addEventListener('click', function () { car.scrollBy({ left: -amount() * 1.5, behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { car.scrollBy({ left: amount() * 1.5, behavior: 'smooth' }); });
    car.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  /* ---- hero background wandering line (pre-scroll only) ---- */
  (function () {
    var canvas = document.querySelector('.hero__anim');
    var hero = document.querySelector('.hero');
    if (!canvas || !hero || reduceMotion) return;
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var keepLeft = 0, enabled = true;
    function size() {
      var r = hero.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // keep the lines to the right of the text block so they never cross any text
      var content = hero.querySelector('.hero__content');
      var cl = content ? content.getBoundingClientRect() : null;
      keepLeft = cl ? (cl.right - r.left + 72) : W * 0.5;
      enabled = (W - keepLeft) > 240;            // only animate if there is real empty room
      if (!enabled) ctx.clearRect(0, 0, W, H);
    }
    size();
    window.addEventListener('resize', size);

    var rnd = function (a, b) { return a + Math.random() * (b - a); };
    var TRAIL = 210;
    function makeTrail() {
      var s = { pts: [] };
      var x0 = keepLeft + 20, x1 = W - 20;
      var edge = Math.floor(rnd(0, 3));
      if (edge === 0) { s.x = W + 20; s.y = rnd(0, H); s.ang = Math.PI + rnd(-0.5, 0.5); }
      else if (edge === 1) { s.x = rnd(x0, x1); s.y = -20; s.ang = Math.PI / 2 + rnd(-0.5, 0.5); }
      else { s.x = rnd(x0, x1); s.y = H + 20; s.ang = -Math.PI / 2 + rnd(-0.5, 0.5); }
      s.speed = rnd(1.1, 2.1);
      s.curve = rnd(0.006, 0.02);                 // how tightly it curls
      s.curvePhase = rnd(0, Math.PI * 2);
      s.curveSpeed = rnd(0.01, 0.03) * (Math.random() < 0.5 ? -1 : 1);
      s.hue = Math.random() < 0.6 ? 'copper' : 'green';
      return s;
    }
    // three concurrent trails, always on screen (right side only), always circling
    var trails = [makeTrail(), makeTrail(), makeTrail()];

    function advance(s, idx) {
      s.curvePhase += s.curveSpeed;
      s.ang += Math.sin(s.curvePhase) * s.curve;
      // steer back toward the centre of the allowed right-hand region near any edge
      var cx = (keepLeft + W) / 2, cy = H / 2;
      var leftProx = s.x - keepLeft;
      var edgeProx = Math.min(leftProx, W - s.x, s.y, H - s.y);
      if (edgeProx < 140) {
        var toC = Math.atan2(cy - s.y, cx - s.x);
        var diff = Math.atan2(Math.sin(toC - s.ang), Math.cos(toC - s.ang));
        s.ang += diff * (leftProx < 60 ? 0.13 : 0.05);   // push harder away from the text edge
      }
      s.x += Math.cos(s.ang) * s.speed;
      s.y += Math.sin(s.ang) * s.speed;
      // hard stop: never let a head cross into the text column
      if (s.x < keepLeft) { s.x = keepLeft; s.ang = Math.atan2(Math.sin(s.ang), Math.abs(Math.cos(s.ang))); }
      s.pts.push({ x: s.x, y: s.y });
      if (s.pts.length > TRAIL) s.pts.shift();
      s.life = (s.life || 0) + 1;
      if (s.life > 900 && Math.random() < 0.004) {
        s.curveSpeed = (0.01 + Math.random() * 0.02) * (Math.random() < 0.5 ? -1 : 1);
        s.hue = Math.random() < 0.6 ? 'copper' : 'green';
        s.life = 0;
      }
    }
    function draw(s) {
      var col = s.hue === 'copper' ? '236,152,80' : '166,193,151';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (var i = 1; i < s.pts.length; i++) {
        var t = i / s.pts.length;                 // 0 tail -> 1 head
        var a = Math.pow(t, 1.5) * 0.72;          // stronger presence, still soft
        ctx.strokeStyle = 'rgba(' + col + ',' + a.toFixed(3) + ')';
        ctx.lineWidth = 0.7 + t * 2.3;
        ctx.beginPath();
        ctx.moveTo(s.pts[i - 1].x, s.pts[i - 1].y);
        ctx.lineTo(s.pts[i].x, s.pts[i].y);
        ctx.stroke();
      }
    }

    var running = true, raf;
    function step() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      if (enabled) { for (var i = 0; i < trails.length; i++) { advance(trails[i], i); draw(trails[i]); } }
      raf = requestAnimationFrame(step);
    }
    step();

    // only run while the hero is in view (perf + "pre-scroll only")
    function onHeroScroll() {
      var scrolled = window.scrollY > 8;
      hero.classList.toggle('is-scrolled', scrolled);
      var visible = window.scrollY < H;
      if (visible && !running) { running = true; step(); }
      else if (!visible && running) { running = false; cancelAnimationFrame(raf); }
    }
    onHeroScroll();
    window.addEventListener('scroll', onHeroScroll, { passive: true });
  })();

  /* ---- reveals ---- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---- back-to-top button + hide nav on scroll-down ---- */
  (function () {
    var navEl = document.getElementById('nav');
    var btn = document.createElement('button');
    btn.className = 'totop';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg class="totop__ring" viewBox="0 0 48 48" aria-hidden="true" fill="none"><circle class="totop__track" cx="24" cy="24" r="21" stroke-width="2.5"/><circle class="totop__prog" cx="24" cy="24" r="21" stroke-width="2.5" pathLength="100"/></svg><svg class="totop__arrow" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17.5V7m0 0-4.5 4.5M12 7l4.5 4.5"/></svg>';
    document.body.appendChild(btn);
    var prog = btn.querySelector('.totop__prog');
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    var last = window.scrollY;
    function upd() {
      var y = window.scrollY;
      if (y > 500) btn.classList.add('show'); else btn.classList.remove('show');
      if (navEl) {
        if (y > 320 && y > last + 6) navEl.classList.add('is-hidden');
        else if (y < last - 6 || y < 320) navEl.classList.remove('is-hidden');
      }
      if (prog) {
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        var pct = docH > 0 ? y / docH : 0;
        if (pct < 0) pct = 0; else if (pct > 1) pct = 1;
        prog.style.strokeDashoffset = (100 - pct * 100).toFixed(1);
      }
      last = y;
    }
    upd();
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd, { passive: true });
  })();

})();
