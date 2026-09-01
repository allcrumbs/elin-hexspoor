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
      if (!isCompanyEmail(email)) { err.textContent = 'Please use a company email — free providers like Gmail, Yahoo or Outlook are not accepted.'; err.hidden = false; return; }
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
})();
