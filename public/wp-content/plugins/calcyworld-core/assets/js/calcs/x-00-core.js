/* Calcyworld — shared builders for the "solve for any variable" family (Ohm's law, F = ma, gas laws…) */
(function (CW) {
  'use strict';
  var C = CW.C, M = CW.M, R = CW.Rr;
  /*
   * CW.solve(id, title, 'section/group', desc, formula, vars, ex)
   *   vars : [[key, label, unit, default, solver(v) -> number, {dp, f}]]   every variable can be the unknown
   *   ex   : { more(v, val, target) -> [extra result rows], note, pop, pre: [extra inputs], chart(v,val) }
   */
  CW.solve = function (id, title, g, desc, formula, vars, ex) {
    ex = ex || {};
    var opts = vars.map(function (x, i) { return [i + 1, x[1]]; });
    var inputs = [['fnd', 'Find', 's', 1, opts]];
    vars.forEach(function (x, i) { inputs.push([x[0], x[1], 'n', x[3], x[2] || '', { show: 'if(fnd==' + (i + 1) + ',0,1)' }]); });
    (ex.pre || []).forEach(function (x) { inputs.push(x); });
    return C(id, title, g, desc, formula, inputs, function (v) {
      var f = Math.round(+v.fnd), x = vars[f - 1] || vars[0], vv = {}, k;
      for (k in v) if (Object.prototype.hasOwnProperty.call(v, k)) vv[k] = v[k];
      var val = x[4](vv);
      if (typeof val !== 'number' || !isFinite(val)) return { error: 'These values do not give a valid answer — please check them.' };
      var o = x[5] || {}, res = [M(x[1], val, o.f || 'num', { dp: o.dp === undefined ? 6 : o.dp, u: x[2] || '' })];
      if (ex.more) { vv[x[0]] = val; (ex.more(vv, val, x, f) || []).forEach(function (r) { res.push(r); }); }
      var out = { results: res };
      if (ex.note) out.note = ex.note;
      if (ex.chart) { vv[x[0]] = val; var ch = ex.chart(vv, val, f); if (ch) out.chart = ch; }
      return out;
    }, { pop: ex.pop ? 1 : 0 });
  };
  /* compact result helpers for packs */
  CW.R = function (l, v, dp, u) { return R(l, v, 'num', { dp: dp === undefined ? 6 : dp, u: u || '' }); };
  CW.RM = function (l, v, dp, u) { return M(l, v, 'num', { dp: dp === undefined ? 6 : dp, u: u || '' }); };
  CW.RT = function (l, v) { return R(l, v, 'text'); };
  CW.RP = function (l, v, dp) { return R(l, v, 'pct', { dp: dp === undefined ? 2 : dp }); };
  /* Solar-system reference data: g = surface gravity (m/s²), M = mass (kg), r = mean radius (m), T = orbital period (days), a = semi-major axis (AU) */
  CW.planets = [
    { k: 1, n: 'Mercury', g: 3.70, M: 3.3011e23, r: 2439700, T: 87.969, a: 0.38710 }, { k: 2, n: 'Venus', g: 8.87, M: 4.8675e24, r: 6051800, T: 224.701, a: 0.72333 },
    { k: 3, n: 'Earth', g: 9.80665, M: 5.97237e24, r: 6371000, T: 365.256, a: 1 }, { k: 4, n: 'Moon', g: 1.62, M: 7.342e22, r: 1737400, T: 27.3217, a: 0.002570 },
    { k: 5, n: 'Mars', g: 3.71, M: 6.4171e23, r: 3389500, T: 686.98, a: 1.52368 }, { k: 6, n: 'Jupiter', g: 24.79, M: 1.8982e27, r: 69911000, T: 4332.59, a: 5.2044 },
    { k: 7, n: 'Saturn', g: 10.44, M: 5.6834e26, r: 58232000, T: 10759.22, a: 9.5826 }, { k: 8, n: 'Uranus', g: 8.69, M: 8.6810e25, r: 25362000, T: 30688.5, a: 19.2184 },
    { k: 9, n: 'Neptune', g: 11.15, M: 1.02413e26, r: 24622000, T: 60182, a: 30.1104 }, { k: 10, n: 'Pluto', g: 0.62, M: 1.303e22, r: 1188300, T: 90560, a: 39.482 },
    { k: 11, n: 'Sun', g: 274, M: 1.98847e30, r: 695700000, T: 0, a: 0 }
  ];
  CW.planetOpts = function (custom, skipSun) { var o = CW.planets.filter(function (p) { return !(skipSun && p.n === 'Sun'); }).map(function (p) { return [p.k, p.n]; }); if (custom) o.push([99, 'Custom']); return o; };
  CW.planet = function (k) { for (var i = 0; i < CW.planets.length; i++) if (CW.planets[i].k === +k) return CW.planets[i]; return null; };
})(window.CW);
