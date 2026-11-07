/* Calcyworld - search results page for the static (Vercel) version.
   WordPress builds this page on the server; here the browser does it with the same tool index and the same
   ranking as the search box (theme.js exposes CWT_find). */
(function () {
  'use strict';
  var q = '';
  try { q = (new URLSearchParams(location.search).get('s') || '').trim(); } catch (e) {}
  var list = document.querySelector('.js-sres'), qn = document.querySelector('.js-sq'), cn = document.querySelector('.js-sn');
  if (!list) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function tr(k, d, v) { try { return (window.CWT_t && window.CWT_t(k, v)) || d; } catch (e) { return d; } }
  function tile(ic) {
    return '<span class="itile" style="--ts:40px"><svg class="ti" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#ti-' + esc(ic || 'calc') + '"/></svg></span>';
  }
  var chev = '<svg class="ico ico-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m9 6 6 6-6 6"/></svg>';
  if (qn) qn.textContent = q;
  if (q) { try { document.title = q + ' - Calcyworld'; } catch (e) {} }
  if (!q || !window.CWT_find) { if (cn) cn.textContent = ''; return; }
  window.CWT_find(q, 60, function (res) {
    if (cn) cn.textContent = tr(res.length === 1 ? 'tools_1' : 'tools_n', res.length + (res.length === 1 ? ' tool' : ' tools'), { n: res.length });
    if (!res.length) {
      list.outerHTML = '<div class="nf-box"><p class="empty">' + esc(tr('no_results', 'No results found. Try a different word.')) + '</p></div>';
      return;
    }
    list.innerHTML = res.map(function (x) {
      return '<li><a class="tool" href="' + esc(x.u) + '">' + tile(x.ic) + '<span class="t">' + esc(x.t) + '<small>' + esc(x.g || x.s || '') + '</small></span>' + chev + '</a></li>';
    }).join('');
  });
})();
