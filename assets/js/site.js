/* site.js - Uforia "SILVER NOCTURNE" behaviour (FOUNDATION): header state, mega menus + dropdowns (hover intent with
   a gap bridge, click, keyboard, Escape), drawer below 1024px, hours today, 21+ gate, reveals, parallax, tilt,
   pointer-follow key light, marquee, rotator, chip filters, video pause toggles, demo forms. No dependencies,
   defer-safe. Contract D6: no string literal in this file starts with a slash; every URL is read from HTML
   attributes. All motion is off under prefers-reduced-motion. */
(function () {
  'use strict';
  var doc = document;
  var root = doc.documentElement;
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; };
  var reduce = mq('(prefers-reduced-motion: reduce)').matches;
  var finePointer = mq('(hover: hover) and (pointer: fine)').matches;
  var coarse = mq('(hover: none), (pointer: coarse)').matches;
  var desktopMq = mq('(min-width: 1024px)');
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(sel)); };
  var $ = function (sel, el) { return (el || doc).querySelector(sel); };
  var hasIO = 'IntersectionObserver' in window;
  var onMq = function (m, fn) { if (m.addEventListener) m.addEventListener('change', fn); else if (m.addListener) m.addListener(fn); };
  root.classList.add('js');

  /* ---------------- header: scrolled state ---------------- */
  var header = $('[data-header]');
  var tick = false;
  function onScrollHeader() { tick = false; if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScrollHeader();
  window.addEventListener('scroll', function () { if (!tick) { tick = true; window.requestAnimationFrame(onScrollHeader); } }, { passive: true });

  /* ---------------- hours today (America/New_York) ---------------- */
  (function () {
    if (!header) return;
    var byDay = {};
    try { byDay = JSON.parse(header.getAttribute('data-hours') || '{}'); } catch (e) { byDay = {}; }
    var tz = header.getAttribute('data-tz') || 'America/New_York';
    var day = -1;
    try {
      var wd = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(new Date());
      day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(wd);
    } catch (e) { day = new Date().getDay(); }
    var h = byDay[String(day)];
    if (h && h.length === 2) {
      $$('[data-hours-today]').forEach(function (el) { el.textContent = 'Today ' + h[0] + ' to ' + h[1]; });
    }
    $$('.hours__row[data-days]').forEach(function (row) {
      var days = (row.getAttribute('data-days') || '').split(' ');
      if (days.indexOf(String(day)) >= 0) row.classList.add('is-today');
    });
  })();

  /* ---------------- dropdowns: nav megas, the category "More" list, the store hours ---------------- */
  var items = $$('[data-mega], [data-dropdown]');
  var openItem = null;
  var openTimer = 0;
  var closeTimer = 0;
  function trig(item) { return $('[data-dropdown-trigger]', item); }
  function setOpen(item, open) {
    var btn = trig(item);
    item.classList.toggle('is-open', open);
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      if (openItem && openItem !== item && !openItem.contains(item)) setOpen(openItem, false);
      openItem = item;
    } else if (openItem === item) {
      openItem = null;
    }
    if (header) header.classList.toggle('has-open-mega', !!(openItem && openItem.hasAttribute('data-mega')) && desktopMq.matches);
  }
  function closeAll() { items.forEach(function (m) { if (m.classList.contains('is-open')) setOpen(m, false); }); }
  items.forEach(function (item) {
    var btn = trig(item);
    if (!btn) return;
    var isMega = item.hasAttribute('data-mega');
    btn.addEventListener('click', function () {
      clearTimeout(openTimer); clearTimeout(closeTimer);
      setOpen(item, !item.classList.contains('is-open'));
    });
    item.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || !desktopMq.matches) return;
      clearTimeout(closeTimer); clearTimeout(openTimer);
      openTimer = setTimeout(function () { setOpen(item, true); }, openItem && isMega ? 0 : 120);
    });
    item.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse' || !desktopMq.matches) return;
      clearTimeout(openTimer);
      closeTimer = setTimeout(function () { setOpen(item, false); }, 320);
    });
    item.addEventListener('focusout', function (e) {
      if (!desktopMq.matches) return;
      if (e.relatedTarget && item.contains(e.relatedTarget)) return;
      setTimeout(function () { if (!item.contains(doc.activeElement) && item.classList.contains('is-open')) setOpen(item, false); }, 0);
    });
  });
  doc.addEventListener('click', function (e) {
    if (openItem && desktopMq.matches && !openItem.contains(e.target)) closeAll();
  });

  /* ---------------- drawer (below 1024px), with a focus loop while open ---------------- */
  var nav = $('[data-nav]');
  var toggle = $('[data-nav-toggle]');
  var scrim = $('[data-nav-scrim]');
  var closeBtn = $('[data-nav-close]');
  var focusables = function (el) {
    return $$('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', el).filter(function (x) {
      return !x.hidden && x.offsetParent !== null;
    });
  };
  var loop = function (box, e) {
    var f = focusables(box);
    if (!f.length) return;
    var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && (doc.activeElement === a || !box.contains(doc.activeElement))) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && (doc.activeElement === z || !box.contains(doc.activeElement))) { e.preventDefault(); a.focus(); }
  };
  function setDrawer(open, returnFocus) {
    if (!nav || !toggle) return;
    root.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (scrim) scrim.hidden = !open;
    if (open) {
      setTimeout(function () { var f = closeBtn || focusables(nav)[0]; if (f) f.focus(); }, 60);
    } else {
      closeAll();
      if (returnFocus) toggle.focus();
    }
  }
  if (toggle) toggle.addEventListener('click', function () { setDrawer(!root.classList.contains('nav-open')); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setDrawer(false, true); });
  if (scrim) scrim.addEventListener('click', function () { setDrawer(false, true); });
  if (nav) {
    nav.addEventListener('keydown', function (e) { if (e.key === 'Tab' && root.classList.contains('nav-open')) loop(nav, e); });
    nav.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (a && root.classList.contains('nav-open')) setDrawer(false);
    });
  }
  /* focus parity across the 1024px change: close everything, keep focus on something visible */
  onMq(desktopMq, function () {
    var active = doc.activeElement;
    var wasOpen = root.classList.contains('nav-open');
    setDrawer(false);
    closeAll();
    if (active && active !== doc.body && active.offsetParent === null) {
      var t = desktopMq.matches ? ($('.nav__trigger') || $('.brand')) : toggle;
      if (t) t.focus();
    } else if (wasOpen && !desktopMq.matches && toggle) {
      toggle.focus();
    }
  });

  /* Escape: close the open dropdown (focus back on its trigger) or the drawer */
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' && e.key !== 'Esc') return;
    if (openItem) {
      var btn = trig(openItem);
      setOpen(openItem, false);
      if (btn && btn.offsetParent !== null) btn.focus();
      return;
    }
    if (root.classList.contains('nav-open')) setDrawer(false, true);
  });

  /* ---------------- 21+ gate (D7): localStorage uforia-age-ok = 1; never blocks without JS ---------------- */
  var gate = $('[data-age-gate]');
  var KEY = (gate && gate.getAttribute('data-age-key')) || 'uforia-age-ok';
  var ok = false;
  try { ok = window.localStorage.getItem(KEY) === '1'; } catch (err) { ok = false; }
  if (gate && !ok) {
    var lastFocus = doc.activeElement;
    var check = $('[data-age-check]', gate);
    var yes = $('[data-age-yes]', gate);
    gate.hidden = false;
    root.classList.add('gate-open');
    setTimeout(function () { if (check) check.focus(); }, 40);
    if (check && yes) {
      var sync = function () { yes.disabled = !check.checked; };
      check.addEventListener('change', sync);
      sync();
    }
    if (yes) yes.addEventListener('click', function () {
      if (check && !check.checked) return;
      try { window.localStorage.setItem(KEY, '1'); } catch (err) { /* private mode: the gate just closes */ }
      gate.hidden = true;
      root.classList.remove('gate-open');
      if (lastFocus && lastFocus.focus && lastFocus !== doc.body) lastFocus.focus();
    });
    gate.addEventListener('keydown', function (e) { if (e.key === 'Tab') loop(gate, e); });
    doc.addEventListener('focusin', function (e) { if (!gate.hidden && !gate.contains(e.target) && check) check.focus(); });
  }

  /* ---------------- reveals (+ fail-safe at 2.5 s) ---------------- */
  var reveals = $$('[data-reveal]');
  var ioAlive = false;
  if (reduce || !hasIO) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
    root.classList.add('reveal-all');
  } else if (reveals.length) {
    var ioReveal = new IntersectionObserver(function (entries) {
      ioAlive = true;
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); ioReveal.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { ioReveal.observe(el); });
    var vh = function () { return window.innerHeight || root.clientHeight; };
    var mark = function (el) { el.classList.add('is-in'); ioReveal.unobserve(el); };
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        reveals.forEach(function (el) { var r = el.getBoundingClientRect(); if ((r.width || r.height) && r.bottom > 0 && r.top < vh()) mark(el); });
      });
    });
    setTimeout(function () {
      root.classList.add('reveal-all');
      reveals.forEach(function (el) { var r = el.getBoundingClientRect(); if (!ioAlive || r.top < vh()) mark(el); });
    }, 2500);
  }

  /* ---------------- parallax ([data-depth], rAF, transform only) ---------------- */
  var depthEls = (reduce || coarse) ? [] : $$('[data-depth]');
  if (depthEls.length) {
    var ticking = false;
    var vis = [];
    var update = function () {
      ticking = false;
      var h = window.innerHeight;
      vis.forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-depth')) || 0;
        var r = el.getBoundingClientRect();
        var y = Math.max(-90, Math.min(90, -(r.top + r.height / 2 - h / 2) * d));
        el.style.setProperty('--py', y.toFixed(1) + 'px');
      });
    };
    var queue = function () { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } };
    if (hasIO) {
      var ioDepth = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var i = vis.indexOf(en.target);
          if (en.isIntersecting && i < 0) { vis.push(en.target); en.target.classList.add('is-moving'); }
          if (!en.isIntersecting && i >= 0) { vis.splice(i, 1); en.target.classList.remove('is-moving'); }
        });
        queue();
      }, { rootMargin: '20% 0px 20% 0px' });
      depthEls.forEach(function (el) { ioDepth.observe(el); });
    } else { vis = depthEls.slice(); }
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    queue();
  }

  /* ---------------- pointer tilt (fine pointers): --rx/--ry, plus --mx/--my for a .glint ---------------- */
  if (!reduce && finePointer) {
    $$('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 6;
      var raf = 0, px = 0, py = 0;
      var paint = function () {
        raf = 0;
        el.style.setProperty('--mx', ((px + 0.5) * 100).toFixed(1) + '%');
        el.style.setProperty('--my', ((py + 0.5) * 100).toFixed(1) + '%');
        el.style.setProperty('--ry', (px * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-py * max * 2).toFixed(2) + 'deg');
      };
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        px = (e.clientX - r.left) / r.width - 0.5;
        py = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('is-tilting');
        if (!raf) raf = window.requestAnimationFrame(paint);
      });
      el.addEventListener('pointerleave', function () {
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------------- [data-spot]: the key light follows the pointer (--lx/--ly in %) ---------------- */
  if (!reduce && finePointer) {
    $$('[data-spot]').forEach(function (el) {
      var raf = 0, lx = 0, ly = 0;
      var paint = function () { raf = 0; el.style.setProperty('--lx', lx.toFixed(1) + '%'); el.style.setProperty('--ly', ly.toFixed(1) + '%'); };
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        lx = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
        ly = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
        el.classList.add('is-spotting');
        if (!raf) raf = window.requestAnimationFrame(paint);
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('is-spotting'); el.style.removeProperty('--lx'); el.style.removeProperty('--ly'); });
    });
  }

  /* ---------------- [data-marquee]: two copies in a track; pause on hover, focus, off screen ---------------- */
  $$('[data-marquee]').forEach(function (m) {
    if (m.classList.contains('is-marquee') || reduce) return;
    var track = $('.marquee__track', m);
    if (!track) {
      track = doc.createElement('div');
      track.className = 'marquee__track';
      while (m.firstChild) track.appendChild(m.firstChild);
      m.appendChild(track);
    }
    var group = doc.createElement('div');
    group.className = 'marquee__group';
    while (track.firstChild) group.appendChild(track.firstChild);
    track.appendChild(group);
    var copy = group.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    $$('a, button, input, select, textarea, [tabindex]', copy).forEach(function (x) { x.setAttribute('tabindex', '-1'); });
    $$('[id]', copy).forEach(function (x) { x.removeAttribute('id'); });
    track.appendChild(copy);
    m.classList.add('is-marquee');
    if (hasIO) new IntersectionObserver(function (en) { en.forEach(function (x) { m.classList.toggle('is-paused', !x.isIntersecting); }); }).observe(m);
  });

  /* ---------------- footer wordmark: the light sweep runs only while the mark is on screen ---------------- */
  $$('[data-footer-mark]').forEach(function (fm) {
    if (!hasIO) return;
    fm.classList.add('is-paused');
    new IntersectionObserver(function (en) { en.forEach(function (x) { fm.classList.toggle('is-paused', !x.isIntersecting); }); }).observe(fm);
  });

  /* ---------------- [data-rotator]: [data-slide] children rotate (ms in the attribute, default 5000) ---------------- */
  $$('[data-rotator]').forEach(function (rot, rIndex) {
    var slides = $$('[data-slide]', rot);
    if (slides.length < 2) return;
    var stage = slides[0].parentNode;
    if (stage && stage.classList) stage.classList.add('rotator__stage');
    var dotsBox = $('[data-rotator-dots]', rot);
    if (!dotsBox) { dotsBox = doc.createElement('div'); rot.appendChild(dotsBox); }
    dotsBox.classList.add('rotator__dots');
    var label = rot.getAttribute('aria-label') || 'slide';
    var delay = parseInt(rot.getAttribute('data-rotator'), 10) || 5000;
    var cur = 0, timer = 0, paused = false;
    var dots = slides.map(function (s, i) {
      if (!s.id) s.id = 'rot' + rIndex + '-s' + i;
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'rotator__dot';
      b.setAttribute('aria-controls', s.id);
      b.setAttribute('aria-label', 'Show ' + label + ' ' + (i + 1) + ' of ' + slides.length);
      b.addEventListener('click', function () { show(i); restart(); });
      dotsBox.appendChild(b);
      return b;
    });
    function show(i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        var on = k === cur;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
        if ('inert' in s) s.inert = !on;
      });
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === cur ? 'true' : 'false'); });
    }
    function restart() {
      clearInterval(timer);
      if (reduce || paused) return;
      timer = setInterval(function () { if (!doc.hidden) show(cur + 1); }, delay);
    }
    rot.addEventListener('pointerenter', function () { paused = true; clearInterval(timer); });
    rot.addEventListener('pointerleave', function () { if (!rot.contains(doc.activeElement)) { paused = false; restart(); } });
    rot.addEventListener('focusin', function () { paused = true; clearInterval(timer); });
    rot.addEventListener('focusout', function (e) { if (!e.relatedTarget || !rot.contains(e.relatedTarget)) { paused = false; restart(); } });
    rot.classList.add('is-rotator');
    show(0);
    restart();
  });

  /* ---------------- [data-filter-group]: chip filters over [data-filter-item][data-tags] ----------------
     Scope = the closest [data-filter-scope] (else the document). Chips are buttons with data-filter="<tag>" (or
     "all"); multi-select within a group (OR), groups combine with AND. [data-filter-count] shows the number of
     matches; [data-filter-empty] shows when none match; [data-more] reveals the next data-limit items (data-limit on
     the scope or on the [data-more] button). */
  var scopes = [];
  $$('[data-filter-group]').forEach(function (g) {
    var scope = (g.closest && g.closest('[data-filter-scope]')) || doc.body;
    if (scopes.indexOf(scope) < 0) scopes.push(scope);
  });
  $$('[data-more]').forEach(function (b) {
    var scope = (b.closest && b.closest('[data-filter-scope]')) || doc.body;
    if (scopes.indexOf(scope) < 0) scopes.push(scope);
  });
  scopes.forEach(function (scope) {
    var groups = $$('[data-filter-group]', scope);
    var itemsF = $$('[data-filter-item]', scope);
    var more = $('[data-more]', scope);
    var countEl = $$('[data-filter-count]', scope);
    var empty = $('[data-filter-empty]', scope);
    var limit = parseInt(scope.getAttribute('data-limit') || (more && more.getAttribute('data-limit')) || '0', 10) || 0;
    var shown = limit;
    var sel = groups.map(function () { return []; });
    var tagsOf = function (el) { return (el.getAttribute('data-tags') || '').toLowerCase().split(/[\s,]+/).filter(Boolean); };
    function apply() {
      var match = itemsF.filter(function (el) {
        var t = tagsOf(el);
        return sel.every(function (s) { return !s.length || s.some(function (v) { return t.indexOf(v) >= 0; }); });
      });
      itemsF.forEach(function (el) { el.classList.toggle('is-filtered-out', match.indexOf(el) < 0); el.classList.remove('is-over'); });
      if (limit) match.forEach(function (el, i) { if (i >= shown) el.classList.add('is-over'); });
      countEl.forEach(function (c) {
        var n = match.length;
        c.textContent = n + ' ' + (n === 1 ? (c.getAttribute('data-one') || 'item') : (c.getAttribute('data-many') || 'items'));
      });
      if (empty) empty.hidden = match.length > 0;
      if (more) more.hidden = !limit || match.length <= shown;
    }
    groups.forEach(function (g, gi) {
      var chips = $$('[data-filter]', g);
      chips.forEach(function (c) {
        if (!c.hasAttribute('aria-pressed')) c.setAttribute('aria-pressed', c.getAttribute('data-filter') === 'all' ? 'true' : 'false');
        c.addEventListener('click', function () {
          var v = (c.getAttribute('data-filter') || '').toLowerCase();
          if (v === 'all' || !v) {
            sel[gi] = [];
          } else {
            var i = sel[gi].indexOf(v);
            if (i >= 0) sel[gi].splice(i, 1); else sel[gi].push(v);
          }
          chips.forEach(function (x) {
            var xv = (x.getAttribute('data-filter') || '').toLowerCase();
            x.setAttribute('aria-pressed', (xv === 'all' ? !sel[gi].length : sel[gi].indexOf(xv) >= 0) ? 'true' : 'false');
          });
          shown = limit;
          apply();
        });
      });
    });
    if (more) more.addEventListener('click', function () { shown += limit || itemsF.length; apply(); });
    apply();
  });

  /* ---------------- video pause / play (WCAG 2.2.2): [data-video-toggle] buttons, plus one auto-added toggle for
     any muted autoplay loop inside a .band that has none. Under reduced motion loops are paused. ---------------- */
  function bindToggle(b, v) {
    var label = $('.video-toggle__label', b) || b;
    var set = function (paused) {
      b.setAttribute('aria-pressed', paused ? 'true' : 'false');
      if (label) label.textContent = paused ? 'Play motion' : 'Pause motion';
    };
    b.addEventListener('click', function () {
      if (v.paused) { var p = v.play && v.play(); if (p && p.catch) p.catch(function () {}); set(false); }
      else { v.pause(); set(true); }
    });
    set(!!reduce);
  }
  $$('video[autoplay]').forEach(function (v) { if (reduce) { v.removeAttribute('autoplay'); if (v.pause) v.pause(); } });
  $$('[data-video-toggle]').forEach(function (b) {
    var id = b.getAttribute('aria-controls');
    var v = id ? doc.getElementById(id) : null;
    if (!v) { var host = b.closest ? b.closest('.band, section, [data-video-host]') : null; v = host ? $('video', host) : null; }
    if (v) bindToggle(b, v);
  });
  if (!reduce) {
    $$('video[autoplay][muted], video[autoplay][loop]').forEach(function (v) {
      var host = v.closest ? v.closest('.band, section') : null;
      if (!host || $('[data-video-toggle]', host)) return;
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'video-toggle';
      b.setAttribute('data-video-toggle', '');
      b.innerHTML = '<span class="video-toggle__ico" aria-hidden="true"></span><span class="video-toggle__label">Pause motion</span>';
      host.appendChild(b);
      bindToggle(b, v);
    });
  }

  /* ---------------- demo forms (D9): never post; show the form's one honest line ---------------- */
  $$('[data-demo-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = $('[data-demo-note]', f);
      if (note) note.hidden = false;
    });
  });
})();
