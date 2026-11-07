/*!
 * Calcyworld formula DSL — define a full calculator (inputs, results, chart, schedule) as plain data.
 *   CW.F(id, title, 'section/group', description, formula, inputs, outputs, extras)
 *   inputs : [key, label, type, default, unit|options, {slider:[min,max,step], show:'expr', opt:1, help:'..'}]
 *            types  n number · m money · p percent · i integer · s select · g segmented · c checkbox · t text · d date
 *   outputs: [label, expression, format, unit, {main,hl,dp,k,bands}]
 *            formats n num · m money · m2 money(2dp) · p percent · i integer · f fixed(dp) · b band(text)
 *   extras : { donut:[[label,expr]..], plot:{x,from,to,n,series:[[label,expr]],f}, seq:{n,head,cols:[[expr,fmt]]}, note, faq, pop, ex }
 * Expressions use the safe evaluator (no eval) with every input as a variable.
 */
(function (CW) {
  'use strict';
  var FM = { n: 'num', m: 'money', m2: 'money2', p: 'pct', i: 'int', f: 'fixed', t: 'text', d: 'date', b: 'text' };
  var TY = { n: 'number', m: 'money', p: 'percent', i: 'int', s: 'select', g: 'seg', c: 'check', t: 'text', d: 'date', ta: 'textarea', r: 'rows' };
  var RESERVED = ['sin','cos','tan','asin','acos','atan','sinh','cosh','tanh','sqrt','cbrt','abs','exp','ln','log','log2','round','floor','ceil','min','max','pow','root','logb','if','sign','pmt','fvs','hypot','mod','gcd','comb','perm','rad','deg','trunc','ncdf','erf','atan2','asinh','acosh','atanh','pi','e','ans'];
  var isNum = function (x) { return typeof x === 'string' && /^-?\d+(\.\d+)?$/.test(x); };

  /* Packs written with defaults in another currency (e.g. INR) set CW.defBase while loading; money defaults are then converted for visitors. */
  CW.defBase = null;
  function mkInput(a) {
    var o = { k: a[0], l: a[1], t: TY[a[2]] || a[2], v: a[3] }, x = a[5] || {};
    if (o.t === 'select' || o.t === 'seg') o.o = a[4]; else if (a[4]) o.u = a[4];
    Object.keys(x).forEach(function (k) { o[k] = x[k]; });
    if (o.t === 'money' && CW.defBase && !o.base) o.base = CW.defBase;
    if (typeof x.show === 'string') {
      var e = x.show;
      o.show = function (raw) { var v = {}; Object.keys(raw).forEach(function (k) { var n = isNum(raw[k]) ? +raw[k] : CW.parse(raw[k]); v[k] = isNaN(n) ? 0 : n; }); try { return !!CW.evaluate(e, v); } catch (er) { return true; } };
    }
    return o;
  }
  function band(bands, v) {
    for (var i = 0; i < bands.length; i++) if (v < bands[i][0]) return bands[i][1];
    return bands[bands.length - 1][1];
  }
  function ev(expr, vars) { return typeof expr === 'function' ? expr(vars) : CW.evaluate(expr, vars); }

  CW.F = function (id, title, g, desc, formula, inputs, outputs, ex) {
    ex = ex || {};
    var ins = inputs.map(mkInput);
    ins.forEach(function (i) { if (RESERVED.indexOf(i.k.toLowerCase()) > -1) throw new Error('Input key "' + i.k + '" in ' + id + ' clashes with a function name'); });
    var selKeys = ins.filter(function (i) { return i.t === 'select' || i.t === 'seg'; }).map(function (i) { return i.k; });
    var def = {
      id: id, title: title, g: g, cur: ex.cur || '', desc: desc, formula: formula || '', inputs: ins, pop: ex.pop ? 1 : 0, faq: ex.faq || [], ex: ex.ex || '',
      calc: function (v, ctx) {
        var vars = {};
        Object.keys(v).forEach(function (k) {
          var x = v[k];
          if (selKeys.indexOf(k) > -1 && isNum(x)) x = +x;
          else if (x instanceof Date) x = x.getTime();
          else if (x === true) x = 1; else if (x === false) x = 0;
          vars[k] = x;
        });
        var res = [], firstVis = -1;
        for (var q0 = 0; q0 < outputs.length; q0++) { if (!(outputs[q0][4] && outputs[q0][4].hide)) { firstVis = q0; break; } }
        for (var i = 0; i < outputs.length; i++) {
          var o = outputs[i], xo = o[4] || {}, val = ev(o[1], vars);
          vars['o' + (i + 1)] = val; if (xo.k) vars[xo.k] = val;
          var f = o[2] || 'n', r = { l: o[0], v: val, f: FM[f] || f };
          if (f === 'b') r.v = band(xo.bands, val);
          if (xo.dp !== undefined) r.dp = xo.dp;
          if (o[3]) r.u = o[3];
          if (xo.main || (i === firstVis && !outputs.some(function (q) { return q[4] && q[4].main; }))) r.main = true;
          if (xo.hl) r.hl = true;
          if (xo.words === false) r.words = false;
          if (xo.sub) r.sub = xo.sub;
          if (xo.hide) continue;
          res.push(r);
        }
        var main = res.filter(function (r) { return r.main; })[0];
        if (!main || (typeof main.v === 'number' && !isFinite(main.v)) || (typeof main.v === 'number' && isNaN(main.v))) return { error: 'Please check your inputs.' };
        var out = { results: res };
        if (typeof ex.note === 'string') out.note = ex.note;
        if (typeof ex.badge === 'function') out.badge = ex.badge(vars);
        if (ex.donut) {
          var data = ex.donut.map(function (d) { return { l: d[0], v: Math.max(0, ev(d[1], vars)) }; });
          if (data.some(function (d) { return d.v > 0 && isFinite(d.v); })) out.chart = { type: 'donut', data: data, f: ex.donutF ? FM[ex.donutF] : FM[outputs[0][2] || 'n'] };
        }
        if (ex.plot) {
          var p = ex.plot, n = p.n || 20, from = typeof p.from === 'string' ? ev(p.from, vars) : (p.from || 0), to = typeof p.to === 'string' ? ev(p.to, vars) : p.to;
          if (isFinite(from) && isFinite(to) && to !== from) {
            var labels = [], series = p.series.map(function (s) { return { l: s[0], pts: [] }; });
            for (var j = 0; j <= n; j++) {
              var xv = from + (to - from) * j / n, vv = {};
              Object.keys(vars).forEach(function (k) { vv[k] = vars[k]; }); vv[p.x || 'x'] = xv;
              labels.push(CW.fmt.num(xv, 2));
              p.series.forEach(function (s, si) { var y = ev(s[1], vv); series[si].pts.push(isFinite(y) ? y : 0); });
            }
            out.chart = { type: p.type || 'line', labels: labels, series: series, f: FM[p.f || 'n'] };
          }
        }
        if (ex.seq) {
          var q = ex.seq, N = Math.min(600, Math.round(ev(q.n, vars))), rows = [];
          for (var ii = 1; ii <= N; ii++) {
            var sv = {}; Object.keys(vars).forEach(function (k) { sv[k] = vars[k]; }); sv.i = ii;
            rows.push(q.cols.map(function (c, ci) { return ci === 0 && c[0] === 'i' ? ii : ev(c[0], sv); }));
          }
          if (rows.length) {
            out.table = { head: q.head, rows: rows, fmt: q.cols.map(function (c) { return FM[c[1] || 'n']; }), title: q.title || 'Schedule' };
            if (q.chart && rows.length > 1) {
              out.chart = out.chart || { type: q.chart.type || 'line', labels: rows.map(function (r) { return String(r[0]); }), series: q.chart.cols.map(function (ci, k) { return { l: q.head[ci], pts: rows.map(function (r) { return +r[ci] || 0; }) }; }), f: FM[q.chart.f || 'n'] };
            }
          }
        }
        if (typeof ex.extra === 'function') ex.extra(vars, out, ctx);
        return out;
      }
    };
    CW.register(def);
    return def;
  };
  /* Calculator with the short input syntax but a hand-written calc(v, ctx) -> {results, chart, table, note, html}. */
  CW.C = function (id, title, g, desc, formula, inputs, calc, ex) {
    ex = ex || {};
    var ins = inputs.map(mkInput);
    ins.forEach(function (i) { if (i.t === 'textarea') { i.wide = 1; i.rows = i.rows || 5; } });
    var def = { id: id, title: title, g: g, cur: ex.cur || '', desc: desc, formula: formula || '', inputs: ins, pop: ex.pop ? 1 : 0, faq: ex.faq || [], ex: ex.ex || '', calc: calc };
    if (ex.layout) def.layout = ex.layout;
    CW.register(def);
    return def;
  };
  /* Parse a pasted list of numbers (commas, spaces, semicolons or new lines). */
  CW.list = function (s) {
    return String(s == null ? '' : s).split(/[\s,;]+/).map(function (x) { return x.replace(/[^0-9eE+\-.]/g, ''); }).filter(function (x) { return x !== '' && x !== '-' && x !== '.'; }).map(Number).filter(function (x) { return isFinite(x); });
  };
  CW.M = function (l, v, f, o) { var x = { l: l, v: v, f: f || 'num', main: true }; if (o) for (var k in o) x[k] = o[k]; return x; };
  CW.Rr = function (l, v, f, o) { var x = { l: l, v: v, f: f || 'num' }; if (o) for (var k in o) x[k] = o[k]; return x; };
  /* Fix the currency of calculators tied to one country (e.g. India-only tax tools): their defaults are written in that currency. */
  CW.setCur = function (ids, cur, cc) {
    ids.forEach(function (id) {
      var d = CW.defs[id]; if (!d) return; d.cur = cur;
      (d.inputs || []).forEach(function (i) { if (i.t === 'money' && cc && i.local && i.local[cc] !== undefined) i.v = i.local[cc]; });
    });
  };
  /* A family of near-identical calculators: base definition plus overrides on inputs. */
  CW.X = function (id, base, title, g, desc, set, ex) {
    var d = { id: id, extends: base, title: title, g: g, desc: desc, set: set || {} };
    if (ex) Object.keys(ex).forEach(function (k) { d[k] = ex[k]; });
    CW.register(d);
    return d;
  };
})(window.CW);
