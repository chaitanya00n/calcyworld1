/* Calcyworld theme: day/night, menu, search that opens the tool page, country → language, 10 interface languages,
   "Popular in your country", category explorer, live rates, filters, share. */
(function () {
  'use strict';
  var T = window.CWT || {}, CW = window.CW || null, CFG = window.CW_CONFIG || {}, LC = CFG.lang || {}, d = document, html = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var lsGet = function (k, def) { try { var v = localStorage.getItem(k); return v === null ? def : JSON.parse(v); } catch (e) { return def; } };
  var lsSet = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var raw = function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } };
  var rawSet = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} };
  var DICT = {}, LANG = LC.server || 'en';

  /* ---------- language ---------- */
  function t(key, vars) {
    var s = (DICT[key] != null) ? DICT[key] : null;
    if (s == null) return null;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function regionName(cc) {
    try { return new Intl.DisplayNames([LANG], { type: 'region' }).of(cc); } catch (e) { return (CW && CW.country().name) || cc; }
  }
  // Scripts that many phones and PCs do not ship: fetch the matching Noto font only when that language is used.
  var SCRIPT_FONT = { hi: 'Noto+Sans+Devanagari', bn: 'Noto+Sans+Bengali', ar: 'Noto+Sans+Arabic' };
  function loadScriptFont(code) {
    var fam = SCRIPT_FONT[code];
    if (!fam || d.getElementById('cwt-font-' + code) || !d.getElementById('cwt-font-css')) return;
    var l = d.createElement('link'); l.rel = 'stylesheet'; l.id = 'cwt-font-' + code;
    l.href = 'https://fonts.googleapis.com/css2?family=' + fam + ':wght@500..800&display=swap'; d.head.appendChild(l);
  }
  function applyLang() {
    $$('[data-i]').forEach(function (el) {
      var k = el.getAttribute('data-i');
      if (k === 'tools_n' && el.getAttribute('data-n') === '1') k = 'tools_1';
      var s = t(k);
      if (s == null) return;
      if (el.hasAttribute('data-n')) s = s.split('{n}').join(Number(el.getAttribute('data-n')).toLocaleString(LANG));
      if (el.classList.contains('js-hero-title')) {
        var parts = s.match(/[^.!?。।]+[.!?。।]?/g) || [s];
        el.innerHTML = parts.map(function (p) { return '<span class="l">' + esc(p.trim()) + '</span>'; }).join('');
      } else el.textContent = s;
    });
    $$('[data-ph]').forEach(function (el) { var s = t(el.getAttribute('data-ph')); if (s != null) el.setAttribute('placeholder', s); });
    var code = $('.js-lang-code'); if (code) code.textContent = LANG.toUpperCase();
    $$('#lang-menu button').forEach(function (b) { b.setAttribute('aria-current', String(b.getAttribute('data-lang') === LANG)); });
  }
  function setLang(code, remember, how) {
    if (!/^[a-z]{2}$/.test(code)) return;
    LANG = code;
    html.setAttribute('lang', code);
    html.setAttribute('dir', (LC.rtl || ['ar']).indexOf(code) > -1 ? 'rtl' : 'ltr');
    loadScriptFont(code);
    if (remember) { rawSet('cw_lang', code); rawSet('cw_lang_src', how || 'manual'); }
    var done = function () { applyLang(); personalise(true); paintCountry(); if (CW) { CW.cfg = CW.cfg || {}; CW.cfg.i18n = DICT; if (CW.relabel) CW.relabel(); } };
    if (!window.fetch || !LC.url) return done();
    fetch(LC.url + code + '.json').then(function (r) { return r.json(); }).then(function (j) { DICT = j; done(); }).catch(done);
  }
  function langNames(code) { return (LC.names && LC.names[code]) || code; }
  function langEnabled(code) { return !!code && (LC.enabled || []).indexOf(code) > -1; }

  var toastEl = null, toastTimer = 0;
  function toast(msg, undoLabel, onUndo) {
    if (toastEl) toastEl.remove();
    clearTimeout(toastTimer);
    toastEl = d.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status');
    toastEl.innerHTML = '<span>' + esc(msg) + '</span>' + (onUndo ? '<button type="button">' + esc(undoLabel) + '</button>' : '');
    d.body.appendChild(toastEl);
    var b = $('button', toastEl);
    if (b) b.addEventListener('click', function () { onUndo(); toastEl.remove(); toastEl = null; });
    toastTimer = setTimeout(function () { if (toastEl) { toastEl.remove(); toastEl = null; } }, 7000);
  }

  // Choosing a country also chooses the language people there read. Countries with no mapped language fall back to
  // the default only if the language was set by a country before; a language picked by hand is never overridden by "no mapping".
  function languageForCountry(cc) {
    var map = LC.byCountry || {}, want = map[cc];
    if (langEnabled(want)) return want;
    if (raw('cw_lang_src') === 'country') return LC.server || 'en';
    return null;
  }
  function followCountry(cc) {
    if (!LC.enabled || LC.own || LC.enabled.length < 2) return;
    var want = languageForCountry(cc);
    if (!want || want === LANG) return;
    var before = LANG, beforeSrc = raw('cw_lang_src') || '';
    setLang(want, true, 'country');
    // The toast text comes from the new language file, so wait for it.
    setTimeout(function () {
      toast(t('lang_set', { l: langNames(want) }) || ('Language: ' + langNames(want)), t('undo') || 'Undo', function () {
        setLang(before, true, beforeSrc || 'manual');
      });
    }, 260);
  }

  function initLang() {
    if (!LC.enabled || LC.own || LC.enabled.length < 2) { DICT = {}; return; }
    var saved = raw('cw_lang');
    var pick = langEnabled(saved) ? saved : null;
    if (!pick) {
      var nav = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']);
      for (var i = 0; i < nav.length && !pick; i++) { var c = String(nav[i]).slice(0, 2).toLowerCase(); if (langEnabled(c)) pick = c; }
    }
    pick = pick || LC.server || 'en';
    if (pick !== (LC.server || 'en') || (LC.rtl || []).indexOf(pick) > -1) setLang(pick, false);
    else { LANG = pick; var code = $('.js-lang-code'); if (code) code.textContent = pick.toUpperCase(); $$('#lang-menu button').forEach(function (b) { b.setAttribute('aria-current', String(b.getAttribute('data-lang') === pick)); }); }
    var btn = $('.js-lang'), menu = $('#lang-menu');
    if (btn && menu) {
      btn.addEventListener('click', function (e) { e.stopPropagation(); var o = menu.hidden; menu.hidden = !o; btn.setAttribute('aria-expanded', String(o)); });
      d.addEventListener('click', function (e) { if (!menu.hidden && !menu.contains(e.target)) { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
      menu.addEventListener('click', function (e) { var b = e.target.closest('button[data-lang]'); if (b) { setLang(b.getAttribute('data-lang'), true, 'manual'); menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
    }
  }

  /* ---------- day / night ---------- */
  function syncSwitch() { $$('.js-theme').forEach(function (b) { b.setAttribute('aria-checked', String(html.getAttribute('data-theme') === 'dark')); }); }
  $$('.js-theme').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next); syncSwitch();
      rawSet('cw_theme', next);
    });
  });
  syncSwitch();

  /* ---------- mobile menu ---------- */
  var nav = $('#site-nav'), menuBtn = $('.js-menu');
  function closeMenu() { if (!nav) return; nav.classList.remove('is-open'); if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false'); }
  if (menuBtn && nav) menuBtn.addEventListener('click', function () { var o = !nav.classList.contains('is-open'); nav.classList.toggle('is-open', o); menuBtn.setAttribute('aria-expanded', String(o)); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------- search index ---------- */
  var index = null, waiters = [];
  function loadIndex(cb) {
    if (index) return cb(index);
    waiters.push(cb); if (waiters.length > 1) return;
    var cached = lsGet('cw_idx2', null);
    var flush = function () { waiters.splice(0).forEach(function (f) { f(index); }); };
    if (cached && cached.v === T.ver && Array.isArray(cached.d)) { index = cached.d; return flush(); }
    if (!T.rest || !window.fetch) { index = []; return flush(); }
    fetch(T.rest + 'index.json').then(function (r) { return r.json(); }).then(function (data) {
      index = Array.isArray(data) ? data : []; lsSet('cw_idx2', { v: T.ver, d: index }); flush();
    }).catch(function () { index = cached && cached.d ? cached.d : []; flush(); });
  }

  // Words people add that say nothing about which tool they want.
  var STOP = { calculator: 1, calculators: 1, calc: 1, converter: 1, converters: 1, tool: 1, tools: 1, online: 1, free: 1, the: 1, a: 1, of: 1, for: 1 };
  // Short names people type for the long ones.
  var SYN = { emi: 'loan instalment monthly payment', loan: 'emi mortgage', bmi: 'body mass index', gst: 'tax vat', vat: 'tax gst', tax: 'income gst vat salary', sip: 'mutual fund investment',
    fd: 'fixed deposit', rd: 'recurring deposit', ppf: 'provident', epf: 'provident pf', salary: 'pay paycheck ctc in-hand take-home', mortgage: 'home loan house', age: 'birthday date',
    percent: 'percentage', cm: 'inches length height', kg: 'pounds lbs weight', lbs: 'kg weight', inch: 'cm length', mph: 'speed', km: 'miles length', celsius: 'fahrenheit temperature',
    currency: 'exchange rate dollar rupee euro', dollar: 'currency', rupee: 'currency inr', euro: 'currency', bitcoin: 'crypto', calories: 'calorie tdee bmr diet', pregnancy: 'due date ovulation',
    gpa: 'grade cgpa marks', fuel: 'petrol mileage trip', solar: 'panel electricity', ai: 'token llm api gpt claude', concrete: 'cement slab', paint: 'wall room', time: 'hours clock zone' };
  function clean(q) { return q.toLowerCase().replace(/[^\p{L}\p{M}\p{N}%\s.\-]/gu, ' ').split(/\s+/).filter(Boolean); }
  function core(title) { return title.toLowerCase().replace(/\s*[(—–].*$/, '').replace(/\s+(calculator|converter)$/, '').trim(); }
  function norm(q) { return q.toLowerCase().replace(/[^\p{L}\p{M}\p{N}%]+/gu, ' ').trim(); }
  function inOrder(tl, toks) { var pos = 0; for (var i = 0; i < toks.length; i++) { var j = tl.indexOf(toks[i], pos); if (j < 0) return false; pos = j + toks[i].length; } return true; }
  function score(it, toks, joined, full, qt) {
    var tl = it.t.toLowerCase().replace(/\s*\/\s*/g, ' '), c = core(it.t.replace(/\s*\/\s*/g, ' '));
    var kws = (it.k || '').split(',').map(function (x) { return x.replace(/\s*\/\s*/g, ' ').trim(); }).filter(Boolean);
    var hay = tl + ' ' + kws.join(' ') + ' ' + (it.d || '') + ' ' + (it.s || '') + ' ' + (it.g || '') + ' ' + (it.i || '').replace(/-/g, ' ');
    hay = hay.toLowerCase();
    var s = 0;
    // another name people type for this tool (set per tool as "Search keywords"): counts almost like the name itself
    for (var k = 0; k < kws.length; k++) {
      if (kws[k] === joined) { s = Math.max(s, 300); }
      else if (kws[k].indexOf(joined) === 0) { s = Math.max(s, 120); }
    }
    if (c === joined) s += 400;
    else if (c.indexOf(joined) === 0) s += 180;
    else if (tl.indexOf(joined) === 0) s += 160;
    else if (new RegExp('(^|[\\s/-])' + joined.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(tl)) s += 100;
    else if (tl.indexOf(joined) > -1) s += 60;
    var words = tl.split(/[^\p{L}\p{M}\p{N}%]+/u).filter(Boolean);
    // the whole title typed exactly, or the words typed in the same order as in the name ("eur to aed" is not "aed to eur")
    if (full && norm(tl) === full) s += 500;
    if (toks.length > 1 && inOrder(tl, toks)) s += 40;
    if (qt && tl.indexOf(qt) > -1) s += 25;
    for (var i = 0; i < toks.length; i++) {
      var tk = toks[i], hit = false;
      if (words.some(function (w) { return w === tk; })) { s += 50; hit = true; }
      else if (words.some(function (w) { return w.indexOf(tk) === 0; })) { s += 38; hit = true; }
      else if (tl.indexOf(tk) > -1) { s += 20; hit = true; }
      else if (hay.indexOf(tk) > -1) { s += 9; hit = true; }
      if (!hit && SYN[tk]) {
        SYN[tk].split(' ').forEach(function (w) { if (tl.indexOf(w) > -1) { s += 14; hit = true; } else if (hay.indexOf(w) > -1) { s += 4; hit = true; } });
      }
      if (!hit) return 0;
    }
    return s + (it.p ? 6 : 0) - Math.min(8, Math.floor(it.t.length / 12));
  }
  // Returns the matching tools, best first. A query of only filler words ("calculator") falls back to the raw words.
  function search(idx, q, limit) {
    var toks = clean(q).filter(function (w) { return !STOP[w]; });
    if (!toks.length) toks = clean(q);
    if (!toks.length) return [];
    var joined = toks.join(' '), full = norm(q), all = clean(q);
    var qt = all.some(function (w) { return w === 'converter' || w === 'converters'; }) ? 'converter' : (all.some(function (w) { return w === 'calculator' || w === 'calculators' || w === 'calc'; }) ? 'calculator' : '');
    return idx.map(function (x) { return [score(x, toks, joined, full, qt), x]; }).filter(function (p) { return p[0] > 0; })
      .sort(function (a, b) { return b[0] - a[0]; }).slice(0, limit || 30).map(function (p) { return p[1]; });
  }
  function hl(text, q) {
    var out = esc(text);
    clean(q).filter(function (w) { return w.length > 1 && !STOP[w]; }).forEach(function (w) { out = out.replace(new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>'); });
    return out;
  }
  function tile(ic, size, cls) {
    return '<span class="itile ' + (cls || '') + '" style="--ts:' + size + 'px"><svg class="ti" width="' + Math.round(size * 0.62) + '" height="' + Math.round(size * 0.62) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#ti-' + esc(ic || 'calc') + '"/></svg></span>';
  }
  function tag(it) { return it.g || it.s || ''; }
  function rowHTML(it, q, i, pre) {
    var tg = tag(it);
    return '<li><a href="' + esc(it.u) + '" role="option" id="' + pre + i + '">' + tile(it.ic, 38, 'p-i') + '<span class="p-t"><strong>' + (q ? hl(it.t, q) : esc(it.t)) + '</strong><small>' + esc(it.d || '') + '</small></span>' + (tg ? '<span class="p-tag">' + esc(tg) + '</span>' : '') + '</a></li>';
  }
  function allResultsRow(q, cls) {
    var label = t('see_all_results', { q: q }) || ('See all results for “' + q + '”');
    return '<li class="' + cls + '"><a href="' + esc((T.search || '/') + '?s=' + encodeURIComponent(q)) + '" role="option">' + esc(label) + '</a></li>';
  }
  // Go to the best tool for what was typed; if nothing matches, show the regular search results page.
  function goBest(q) {
    q = (q || '').trim();
    if (!q) return;
    loadIndex(function (idx) {
      var r = search(idx, q, 1);
      location.href = r.length ? r[0].u : (T.search || '/') + '?s=' + encodeURIComponent(q);
    });
  }

  /* static (Vercel) build: lets the /search/ page use the same index + ranking as the search box */
  window.CWT_find = function (q, limit, cb) { loadIndex(function (idx) { cb(search(idx, q, limit)); }); };
  window.CWT_t = t;

  /* ---------- hero search: suggestions under the box, Enter opens the best tool ---------- */
  (function () {
    var form = $('.js-hero-search'), inp = $('.js-hero-input'), list = $('#hs-list');
    if (!form || !inp || !list) return;
    var cur = -1, shown = [];
    function close() { list.hidden = true; inp.setAttribute('aria-expanded', 'false'); cur = -1; }
    function mark() { $$('a[role=option]', list).forEach(function (a, i) { a.setAttribute('aria-selected', String(i === cur)); if (i === cur) a.scrollIntoView({ block: 'nearest' }); }); }
    function render() {
      var q = inp.value.trim();
      if (!q) return close();
      loadIndex(function (idx) {
        if (inp.value.trim() !== q) return;
        shown = search(idx, q, 7);
        var h = shown.map(function (x, i) { return rowHTML(x, q, i, 'hs-o'); }).join('');
        h += shown.length ? allResultsRow(q, 'hs-all') : '<li class="empty">' + esc(t('no_results') || 'No results found') + '</li>';
        list.innerHTML = h; list.hidden = false; inp.setAttribute('aria-expanded', 'true'); cur = shown.length ? 0 : -1; mark();
      });
    }
    inp.addEventListener('input', render);
    inp.addEventListener('focus', function () { if (inp.value.trim()) render(); loadIndex(function () {}); });
    inp.addEventListener('keydown', function (e) {
      var opts = $$('a[role=option]', list).filter(function (a) { return !a.parentNode.classList.contains('hs-all'); });
      if (e.key === 'ArrowDown' && !list.hidden) { e.preventDefault(); cur = Math.min(opts.length - 1, cur + 1); mark(); }
      else if (e.key === 'ArrowUp' && !list.hidden) { e.preventDefault(); cur = Math.max(0, cur - 1); mark(); }
      else if (e.key === 'Escape') close();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = inp.value.trim(); if (!q) { inp.focus(); return; }
      var opts = $$('a[role=option]', list);
      if (!list.hidden && cur > -1 && opts[cur] && !opts[cur].parentNode.classList.contains('hs-all')) location.href = opts[cur].href; else goBest(q);
    });
    d.addEventListener('click', function (e) { if (!list.hidden && !form.contains(e.target) && !list.contains(e.target)) close(); });
  })();

  /* ---------- search palette (header icon, "/" and Ctrl+K) ---------- */
  var pal = $('#palette'), pin = $('.js-palette-input'), plist = $('#palette-list'), sel = -1, lastFocus = null;
  function renderPalette() {
    var q = (pin.value || '').trim();
    loadIndex(function (idx) {
      var h = '', n = 0;
      if (!q) {
        var rec = CW ? CW.recents() : [];
        if (rec.length) { h += '<li class="grp">★</li>'; rec.slice(0, 4).forEach(function (r) { h += rowHTML({ t: r.t, u: r.u, d: '' }, '', n++, 'po-'); }); }
        var pl = idx.filter(function (x) { return x.p; }).slice(0, 8);
        if (pl.length) { h += '<li class="grp">' + esc(t('popular') || 'Popular') + '</li>'; pl.forEach(function (x) { h += rowHTML(x, '', n++, 'po-'); }); }
      } else {
        var res = search(idx, q, 30);
        res.forEach(function (x) { h += rowHTML(x, q, n++, 'po-'); });
        h += res.length ? allResultsRow(q, 'all-res') : '<li class="empty">' + esc(t('no_results') || 'No results found') + '</li>';
      }
      plist.innerHTML = h; sel = n ? 0 : -1; mark();
    });
  }
  function mark() { var o = $$('a[role=option]', plist); o.forEach(function (a, i) { a.setAttribute('aria-selected', String(i === sel)); if (i === sel) a.scrollIntoView({ block: 'nearest' }); }); pin.setAttribute('aria-activedescendant', sel > -1 && o[sel] ? o[sel].id : ''); }
  function openPalette(text) { if (!pal) return; lastFocus = d.activeElement; closeMenu(); pal.hidden = false; d.body.classList.add('no-scroll'); pin.value = text || ''; renderPalette(); setTimeout(function () { pin.focus(); }, 10); }
  function closePalette() { if (!pal || pal.hidden) return; pal.hidden = true; d.body.classList.remove('no-scroll'); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  if (pal && pin) {
    $$('.js-open-search').forEach(function (b) { b.addEventListener('click', function () { openPalette(''); }); });
    $('.js-close-palette').addEventListener('click', closePalette);
    pal.addEventListener('click', function (e) { if (e.target === pal) closePalette(); });
    pin.addEventListener('input', renderPalette);
    var pform = pin.form;
    if (pform) pform.addEventListener('submit', function (e) { e.preventDefault(); var opts = $$('a[role=option]', plist); if (sel > -1 && opts[sel]) location.href = opts[sel].href; else goBest(pin.value); });
    pin.addEventListener('keydown', function (e) {
      var opts = $$('a[role=option]', plist);
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(opts.length - 1, sel + 1); mark(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); sel = Math.max(0, sel - 1); mark(); }
      else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
    });
    d.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase(), typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
      if ((e.key === '/' && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) { e.preventDefault(); openPalette(''); }
    });
    (window.requestIdleCallback || function (f) { setTimeout(f, 2000); })(function () { loadIndex(function () {}); });
  }

  /* ---------- country & currency ---------- */
  var cdlg = $('#country-dlg');
  function paintCountry() {
    if (!CW) return;
    var c = CW.country();
    $$('.js-country-label').forEach(function (el) { el.textContent = c.cur; });
    $$('.js-country-flag').forEach(function (el) { el.textContent = CW.flag(c.code); });
  }
  function renderCountries() {
    var q = ($('.js-country-input').value || '').toLowerCase().trim(), cur = CW.country().code;
    var list = CW.countries.filter(function (c) { return !q || c.name.toLowerCase().indexOf(q) > -1 || (regionName(c.code) || '').toLowerCase().indexOf(q) > -1 || c.code.toLowerCase() === q || c.cur.toLowerCase().indexOf(q) > -1; });
    $('.js-country-list').innerHTML = list.map(function (c) {
      return '<li><button type="button" data-cc="' + c.code + '"' + (c.code === cur ? ' aria-current="true"' : '') + '><span class="flag">' + CW.flag(c.code) + '</span><span class="p-t"><strong>' + esc(regionName(c.code) || c.name) + '</strong></span><span class="cur">' + esc(c.cur) + (CW.fmt.sym(c.cur) !== c.cur ? ' ' + esc(CW.fmt.sym(c.cur)) : '') + '</span></button></li>';
    }).join('') || '<li class="empty">—</li>';
  }
  if (CW && cdlg) {
    paintCountry(); CW.onCountry(function () { paintCountry(); personalise(true); });
    $$('.js-country').forEach(function (b) { b.addEventListener('click', function () { lastFocus = b; closeMenu(); cdlg.hidden = false; d.body.classList.add('no-scroll'); $('.js-country-input').value = ''; renderCountries(); setTimeout(function () { $('.js-country-input').focus(); }, 10); }); });
    var closeC = function () { cdlg.hidden = true; d.body.classList.remove('no-scroll'); if (lastFocus) lastFocus.focus(); };
    $('.js-close-country').addEventListener('click', closeC);
    cdlg.addEventListener('click', function (e) {
      if (e.target === cdlg) closeC();
      var b = e.target.closest('button[data-cc]');
      if (b) { var cc = b.getAttribute('data-cc'); CW.setCountry(cc); closeC(); followCountry(cc); }
    });
    cdlg.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeC(); });
    $('.js-country-input').addEventListener('input', renderCountries);
  } else { $$('.js-country').forEach(function (b) { b.hidden = true; }); }

  /* ---------- Popular in your country (learned from visitors, served by the plugin) ---------- */
  var popCache = {};
  function fetchPopular(cc, limit, cb) {
    var key = cc + ':' + limit;
    if (popCache[key]) return cb(popCache[key]);
    var ss = null; try { ss = JSON.parse(sessionStorage.getItem('cw_pop_' + key) || 'null'); } catch (e) {}
    if (ss && Date.now() - ss.t < 600000) { popCache[key] = ss.d; return cb(ss.d); }
    if (!window.fetch || !T.rest) return cb(null);
    fetch(T.rest + ((T.popc || []).indexOf(String(cc).toUpperCase()) > -1 ? 'popular__' + String(cc).toUpperCase() : 'popular') + '.json').then(function (r) { return r.json(); }).then(function (j) {
      var items = j && j.items || []; popCache[key] = items; try { sessionStorage.setItem('cw_pop_' + key, JSON.stringify({ t: Date.now(), d: items })); } catch (e) {} cb(items);
    }).catch(function () { cb(null); });
  }
  function fill(el, attr) {
    if (!el || !CW) return;
    var tpl = t(el.classList.contains('js-popular-sub') ? 'popular_sub' : 'popular_in') || el.getAttribute('data-tpl') || '';
    if (tpl) el.textContent = tpl.indexOf('{c}') > -1 ? tpl.split('{c}').join(regionName(CW.country().code)) : tpl;
  }
  function pcard(x) {
    var slug = x.s || 'math', name = t('s_' + slug) || x.sn || '';
    return '<li><a class="pcard" href="' + esc(x.u) + '">' + tile(x.ic, 48, 'pc-i') + '<span class="pc-t"><strong>' + esc(x.t) + '</strong><small>' + esc(name) + '</small></span></a></li>';
  }
  function personalise() {
    $$('.js-popular-title, .js-popular-sub').forEach(fill);
    var grid = $('.js-popular-grid');
    if (grid && CW) {
      var lim = parseInt(grid.getAttribute('data-limit') || '8', 10);
      fetchPopular(CW.country().code, lim, function (items) {
        if (!items || !items.length) return;
        grid.innerHTML = items.slice(0, lim).map(pcard).join('');
      });
    }
    // live rates panel
    var rl = $('.js-rates');
    if (rl && CW) {
      var cur = CW.currency(), pairs = ['USD', 'EUR', 'GBP', 'AED', 'AUD', 'CAD', 'SGD', 'JPY'].filter(function (c) { return c !== cur && CW.rate(c); }).slice(0, 6);
      rl.innerHTML = pairs.map(function (c) { var v = CW.convert(1, c, cur); return v == null ? '' : '<li><small>1 ' + esc(c) + ' =</small><b>' + esc(CW.fmt.money(v, cur, v < 10 ? 2 : 1)) + '</b></li>'; }).join('');
    }
    var nc = $('.js-n-cur');
    if (nc && CW && CW.cfg && CW.cfg.rates && CW.cfg.rates.rates) { var n = Object.keys(CW.cfg.rates.rates).length + 1; if (n >= 30) nc.textContent = n + ''; }
  }

  /* ---------- category explorer ---------- */
  (function () {
    var btns = $$('.ex-btn'); if (!btns.length) return;
    function pick(slug, focus) {
      btns.forEach(function (b) { var on = b.getAttribute('data-ex') === slug; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on)); });
      $$('.ex-panel').forEach(function (p) { p.hidden = p.getAttribute('data-ex-panel') !== slug; });
      if (focus && window.innerWidth < 1240) { var p = $('.ex-panel[data-ex-panel="' + slug + '"]'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { pick(b.getAttribute('data-ex'), true); }); b.addEventListener('mouseenter', function () { if (window.innerWidth >= 1240 && matchMedia('(hover: hover)').matches) pick(b.getAttribute('data-ex'), false); }); });
  })();

  /* ---------- live filter on category and "all tools" pages ---------- */
  (function () {
    var inp = $('.js-filter'); if (!inp) return;
    var empty = $('.js-empty'), lists = $$('.js-filter-list'), all = $('.js-filter-all');
    inp.addEventListener('input', function () {
      var q = inp.value.trim().toLowerCase(), shown = 0;
      lists.forEach(function (ul) { $$(':scope > li', ul).forEach(function (li) { if (li.classList.contains('ad-li')) return; var ok = !q || li.textContent.toLowerCase().indexOf(q) > -1; li.hidden = !ok; if (ok) shown++; }); });
      if (all) {
        $$('.as-g', all).forEach(function (g) { var any = 0, head = g.querySelector('h3').textContent.toLowerCase(); $$('li', g).forEach(function (li) { var ok = !q || li.textContent.toLowerCase().indexOf(q) > -1 || head.indexOf(q) > -1; li.hidden = !ok; if (ok) any++; }); g.hidden = !any; shown += any; });
        $$('.as-sec', all).forEach(function (s) { s.hidden = !$$('.as-g', s).some(function (g) { return !g.hidden; }); });
      }
      if (empty) empty.hidden = shown > 0 || !q;
    });
  })();

  /* ---------- share ---------- */
  $$('.js-share').forEach(function (b) {
    b.addEventListener('click', function () {
      var url = b.getAttribute('data-url') || location.href, title = b.getAttribute('data-title') || d.title;
      if (navigator.share) { navigator.share({ title: title, url: url }).catch(function () {}); return; }
      var done = function () { var o = b.innerHTML; b.textContent = '✓'; setTimeout(function () { b.innerHTML = o; }, 1400); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done); else done();
    });
  });

  /* ---------- on tool pages, remember the header height so the page can size the tool area ---------- */
  (function () {
    if (!d.body.classList.contains('is-calculator')) return;
    var hdr = $('.site-header');
    var set = function () { if (hdr) html.style.setProperty('--cw-header-h', hdr.offsetHeight + 'px'); };
    set(); window.addEventListener('resize', set); if (d.fonts && d.fonts.ready) d.fonts.ready.then(set);
  })();

  /* ---------- go ---------- */
  initLang();
  personalise();
})();
