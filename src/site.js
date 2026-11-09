(function () {
  'use strict';

  // Old shared links of the form /#/services/<slug> (from the earlier single-page version)
  // are sent to the real page URL. Skipped inside the single-file preview, which still uses hash routes.
  try {
    var h = location.hash;
    if (h.indexOf('#/') === 0 && !document.querySelector('[data-view]')) {
      var p = h.slice(2).replace(/\/+$/, '');
      var dest = null;
      if (p === 'home' || p === '') dest = '/';
      else if (p.indexOf('home/') === 0) dest = '/#' + p.slice(5);
      else if (/^(services|insights|courts)\/[\w-]+$/.test(p) || /^(insights|disclaimer|privacy|terms)$/.test(p)) dest = '/' + p + '/';
      if (dest && dest !== location.pathname + location.hash) { location.replace(dest); return; }
    }
  } catch (err) { /* ignore */ }

  // Direct load of a URL with a fragment (e.g. /contact-us/#appointment). A small inline script in <head> turns off
  // smooth scrolling while the page loads, because the browser's smooth scroll to the fragment can be abandoned
  // part-way on a slow device or a long page. Once the page has loaded, jump to the target if the visitor has not
  // scrolled, then restore smooth scrolling. Skipped in the single-file preview (hash routes).
  try {
    if (!document.querySelector('[data-view]')) {
      var moved = false;
      ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { window.addEventListener(ev, function () { moved = true; }, { passive: true }); });
      window.addEventListener('load', function () {
        window.setTimeout(function () {
          var hh = location.hash;
          if (!moved && hh.length > 1 && hh.indexOf('#/') !== 0) {
            var tgt = document.getElementById(decodeURIComponent(hh.slice(1)));
            if (tgt) tgt.scrollIntoView();
          }
          document.documentElement.style.scrollBehavior = '';
        }, 50);
      });
    }
  } catch (err2) { /* ignore */ }

  // Mobile drawer
  var drawer = document.getElementById('drawer');
  var openBtn = document.getElementById('menu-open');
  var closeBtns = document.querySelectorAll('[data-drawer-close]');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.hidden = !open;
    if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var f = drawer.querySelector('a,button'); if (f) f.focus(); }
    else if (openBtn) openBtn.focus();
  }
  if (openBtn) openBtn.addEventListener('click', function () { setDrawer(true); });
  closeBtns.forEach(function (b) { b.addEventListener('click', function () { setDrawer(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (drawer && !drawer.hidden) setDrawer(false);
      document.querySelectorAll('.dd.open').forEach(function (d) { d.classList.remove('open'); });
    }
  });

  // Desktop dropdown (click support for touch laptops)
  document.querySelectorAll('.dd > button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dd = btn.parentElement;
      var open = dd.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.dd.open').forEach(function (d) {
      if (!d.contains(e.target)) d.classList.remove('open');
    });
  });

  // Footer year
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  // Consultation form -> WhatsApp message (no data is stored by this site)
  // Every form is handled on its own and its fields are read from inside that form, so the same form can appear on more than one page or view.
  document.querySelectorAll('form[data-wa]').forEach(function (form) {
    var dateInput = form.querySelector('#f-date');
    if (dateInput) {
      var t = new Date();
      var pad = function (n) { return String(n).padStart(2, '0'); };
      dateInput.min = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var v = function (id) { var el = form.querySelector('#' + id); return el ? el.value.trim() : ''; };
      var lines = [
        'Hello Shasti Law Firm, I would like to request a consultation.',
        '',
        'Name: ' + v('f-name'),
        'Phone: ' + v('f-phone'),
      ];
      if (v('f-email')) lines.push('Email: ' + v('f-email'));
      lines.push('Matter: ' + v('f-service'));
      lines.push('Preferred date: ' + v('f-date'));
      lines.push('Preferred time: ' + v('f-time'));
      lines.push('Brief note: ' + v('f-summary'));
      var url = 'https://wa.me/' + form.getAttribute('data-wa') + '?text=' + encodeURIComponent(lines.join('\n'));
      var status = form.querySelector('#form-status');
      var w = window.open(url, '_blank');
      if (w) { try { w.opener = null; } catch (err) { /* ignore */ } }
      if (status) {
        status.hidden = false;
        status.textContent = w
          ? 'WhatsApp is opening with your request filled in. Press send there to submit it. This website does not store what you typed.'
          : 'Your browser blocked the new window. Use the WhatsApp button below, or call the number above.';
      }
      if (!w) {
        var fb = form.querySelector('#form-fallback');
        if (fb) { fb.href = url; fb.hidden = false; }
      }
    });
  });
})();

/* Scroll-driven horizontal sections (one reversible mapping per section, native vertical scrolling is never intercepted).
   Only the card row ("stage") is pinned, so it fits any realistic window height; the group heading scrolls away normally.
   pin   : track overflows -> stage sticks while vertical progress drives translateX of the track (distance = real overflow).
   enter : all cards already fit -> no pin; cards slide in horizontally as a pure function of the section's scroll position.
   off   : reduced motion, or a window too short for the stage -> the swipe/arrow scroller stays. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var secs = [].slice.call(document.querySelectorAll('.pg-section'));
  if (!secs.length) return;
  var header = document.querySelector('header');
  var bottomBar = document.querySelector('nav[aria-label="Quick actions"]');
  var items = [], raf = 0;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function fixedH(el) {
    if (!el) return 0;
    var cs = window.getComputedStyle(el);
    return (cs.position === 'fixed' || cs.position === 'sticky') && cs.display !== 'none' ? el.offsetHeight : 0;
  }
  function setHints(it, on) {
    it.hints.forEach(function (h) { h.el.textContent = on ? 'Keep scrolling to explore' : h.text; });
  }
  secs.forEach(function (sec) {
    var wrap = sec.querySelector('.pg-wrap'), track = sec.querySelector('.pg-track');
    if (!wrap || !track) return;
    var first = wrap, prev = wrap.previousElementSibling;
    if (prev && prev.querySelector && prev.querySelector('.pg-progress')) first = prev;
    var outer = document.createElement('div'), stage = document.createElement('div');
    outer.className = 'pg-pin'; stage.className = 'pg-stage';
    first.parentNode.insertBefore(outer, first);
    outer.appendChild(stage);
    stage.appendChild(first);
    if (first !== wrap) stage.appendChild(wrap);
    var it = { sec: sec, wrap: wrap, track: track, outer: outer, stage: stage, cards: [].slice.call(track.querySelectorAll('.pg-card')),
      mode: 'off', dist: 0, top: 0, vis: false, x: -9999, offs: [], cw: 0, vw: 0, hints: [], prog: sec.querySelector('.pg-progress'), bar: null };
    [].forEach.call(sec.querySelectorAll('p,span'), function (el) {
      if (!el.children.length && /^Swipe/.test(el.textContent)) it.hints.push({ el: el, text: el.textContent });
    });
    if (!it.prog) {
      var b = document.createElement('div');
      b.className = 'pg-pbar'; b.setAttribute('aria-hidden', 'true'); b.innerHTML = '<span></span>';
      stage.appendChild(b); it.bar = b.firstChild;
    }
    items.push(it);
  });
  function reset(it) {
    it.track.style.transform = ''; it.wrap.scrollLeft = 0; it.x = -9999;
    it.cards.forEach(function (c) { c.style.opacity = ''; c.style.transform = ''; });
  }
  function setMode(it, mode) {
    if (it.mode !== mode) { reset(it); }
    it.mode = mode;
    it.sec.classList.toggle('is-pinned', mode === 'pin');
    it.sec.classList.toggle('is-enter', mode === 'enter');
    if (mode !== 'pin') it.outer.style.height = '';
    setHints(it, mode === 'pin');
  }
  // Measure and apply without tearing the layout down first, so a resize never collapses the page height or moves the scroll position.
  function setup(it) {
    if (reduce) { setMode(it, 'off'); return; }
    var dist = it.track.scrollWidth - it.track.clientWidth;
    var stageH = it.stage.offsetHeight;
    var top = fixedH(header) + 12;
    var avail = window.innerHeight - top - fixedH(bottomBar) - 8;
    it.offs = it.cards.map(function (c) { return c.offsetLeft; });
    it.cw = it.cards.length ? it.cards[0].offsetWidth : 0;
    it.vw = it.wrap.clientWidth;
    if (dist >= 24 && stageH <= avail) {
      setMode(it, 'pin');
      it.dist = dist; it.top = Math.round(top + clamp((avail - stageH) * 0.4, 0, 160));
      it.sec.style.setProperty('--pin-top', it.top + 'px');
      it.outer.style.height = Math.round(stageH + dist) + 'px';
    } else if (dist < 24 && it.cards.length) {
      setMode(it, 'enter');
    } else {
      setMode(it, 'off');
    }
    it.x = -9999;
  }
  function startY(it) { return window.pageYOffset + it.outer.getBoundingClientRect().top - it.top; }
  function goTo(it, x) {
    window.scrollTo({ top: startY(it) + clamp(x, 0, it.dist), behavior: 'instant' });
  }
  function tick() {
    raf = 0;
    var vh = window.innerHeight;
    // Every section is evaluated each frame (a handful of rect reads, no writes in between), so a fast jump never leaves stale off-screen state.
    var act = items.filter(function (it) { return it.mode === 'pin' || it.mode === 'enter'; });
    var tops = act.map(function (it) { return (it.mode === 'pin' ? it.outer : it.stage).getBoundingClientRect().top; });
    act.forEach(function (it, i) {
      if (it.mode === 'pin') {
        var x = clamp((it.top - tops[i]) / it.dist, 0, 1) * it.dist;
        if (Math.abs(x - it.x) < 0.5) return;
        it.x = x;
        it.track.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
        if (it.prog) it.prog.style.transform = 'scaleX(' + ((x + it.vw) / (it.dist + it.vw)).toFixed(3) + ')';
        if (it.bar) it.bar.style.transform = 'scaleX(' + (x / it.dist).toFixed(3) + ')';
        it.wrap.classList.toggle('has-prev', x > 2);
        it.wrap.classList.toggle('has-next', x < it.dist - 2);
        for (var k = 0; k < it.cards.length; k++) {
          var o = clamp((it.vw - (it.offs[k] - x)) / (it.cw * 0.4), 0.4, 1);
          it.cards[k].style.opacity = o < 1 ? o.toFixed(2) : '';
        }
      } else {
        var q = clamp((vh - tops[i]) / (vh * 0.55), 0, 1);
        if (Math.abs(q - it.x) < 0.004) return;
        it.x = q;
        for (var n = 0; n < it.cards.length; n++) {
          var qi = clamp(q * 1.5 - n * 0.18, 0, 1), e = 1 - Math.pow(1 - qi, 3);
          it.cards[n].style.transform = e < 1 ? 'translate3d(' + ((1 - e) * 72).toFixed(1) + 'px,0,0)' : '';
          it.cards[n].style.opacity = e < 1 ? (0.35 + 0.65 * e).toFixed(2) : '';
        }
      }
    });
  }
  function req() { if (!raf) raf = window.requestAnimationFrame(tick); }
  function setupAll() { items.forEach(setup); req(); }
  items.forEach(function (it) {
    it.sec.addEventListener('focusin', function (e) {
      if (it.mode !== 'pin') return;
      var li = e.target.closest ? e.target.closest('.pg-card') : null;
      if (!li) return;
      it.wrap.scrollLeft = 0;
      var pad = 16, l = li.offsetLeft - Math.max(it.x, 0), x = Math.max(it.x, 0);
      if (l < pad) x = li.offsetLeft - pad;
      else if (l + li.offsetWidth > it.vw - pad) x = li.offsetLeft + li.offsetWidth - it.vw + pad;
      if (Math.abs(x - it.x) > 1) goTo(it, x);
    });
    it.wrap.addEventListener('scroll', function () {
      if (it.mode !== 'pin' || !it.wrap.scrollLeft) return;
      var x = it.wrap.scrollLeft + Math.max(it.x, 0);
      it.wrap.scrollLeft = 0;
      goTo(it, x);
    }, { passive: true });
  });
  window.addEventListener('scroll', req, { passive: true });
  var rt = 0, lw = window.innerWidth, lh = window.innerHeight;
  window.addEventListener('resize', function () {
    // Ignore the small height changes caused by mobile browser toolbars appearing and disappearing while scrolling.
    if (window.innerWidth === lw && Math.abs(window.innerHeight - lh) < 120) return;
    window.clearTimeout(rt);
    rt = window.setTimeout(function () { lw = window.innerWidth; lh = window.innerHeight; setupAll(); }, 150);
  });
  window.addEventListener('load', setupAll);
  window.addEventListener('pageshow', setupAll);
  window.addEventListener('hashchange', function () { window.setTimeout(setupAll, 60); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setupAll);
  setupAll();
})();

/* Homepage practice-group carousels: arrows, edge hints, one-time reveal. Cards are plain links in the HTML, so everything works without this script. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wraps = document.querySelectorAll('.pg-wrap');
  Array.prototype.forEach.call(wraps, function (wrap) {
    var track = wrap.querySelector('.pg-track');
    var section = wrap.closest('.pg-section');
    var ctl = section && section.querySelector('[data-ctl]');
    if (!track) return;
    var prev = ctl && ctl.querySelector('[data-dir="-1"]');
    var next = ctl && ctl.querySelector('[data-dir="1"]');
    var prog = section && section.querySelector('.pg-progress');
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      if (prog) prog.style.transform = 'scaleX(' + Math.min(1, (track.scrollLeft + track.clientWidth) / track.scrollWidth).toFixed(3) + ')';
      var atStart = track.scrollLeft <= 2;
      var atEnd = track.scrollLeft >= max - 2;
      wrap.classList.toggle('has-prev', !atStart && max > 4);
      wrap.classList.toggle('has-next', !atEnd && max > 4);
      if (prev) prev.disabled = atStart;
      if (next) next.disabled = atEnd;
      if (ctl && max <= 4) ctl.classList.remove('is-ready');
      else if (ctl) ctl.classList.add('is-ready');
    }
    function step(dir) {
      var card = track.querySelector('.pg-card');
      var w = card ? card.getBoundingClientRect().width + 16 : track.clientWidth * 0.8;
      var n = Math.max(1, Math.floor(track.clientWidth / w) - (track.clientWidth / w > 2 ? 1 : 0));
      track.scrollBy({ left: dir * w * n, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
  var secs = document.querySelectorAll('.pg-section[data-reveal]');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.remove('pg-pre'); e.target.classList.add('pg-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0 });
    Array.prototype.forEach.call(secs, function (el) {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('pg-pre'); io.observe(el); }
    });
  }
})();
