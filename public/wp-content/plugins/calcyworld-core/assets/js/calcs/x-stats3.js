/* Calcyworld — statistics: regression, correlation, sampling & survey tools */
(function (CW) {
  'use strict';
  var C = CW.C, M = CW.M, R = CW.Rr, L = CW.list, S = CW.stat;
  var N = function (x, d) { return CW.fmt.num(x, d === undefined ? 6 : d); };
  var G = 'statistics/regression', Z = 'statistics/sampling';
  var P = function (l, v, dp, main) { var o = { dp: dp === undefined ? 6 : dp }; return main ? M(l, v, 'num', o) : R(l, v, 'num', o); };
  var PP = function (l, v, dp, main) { var o = { dp: dp === undefined ? 3 : dp }; return main ? M(l, v * 100, 'pct', o) : R(l, v * 100, 'pct', o); };
  var XY = ['d', 'Data — one "x y" pair per line', 'ta', '1 2.1\n2 3.9\n3 6.2\n4 7.8\n5 10.1\n6 12.2\n7 13.8', { rows: 7 }];
  var LEVEL = ['lv', 'Confidence level', 'p', 95];
  var xy = function (txt) { var r = S.rows(txt).filter(function (q) { return q.length >= 2; }); return { x: r.map(function (q) { return q[0]; }), y: r.map(function (q) { return q[1]; }), n: r.length }; };
  var NEEDXY = { error: 'Enter at least 3 "x y" pairs, one per line.' };

  /* simple least squares helpers */
  function fit(x, y) {
    var n = x.length, mx = S.mean(x), my = S.mean(y), sxx = 0, sxy = 0, syy = 0;
    for (var i = 0; i < n; i++) { sxx += (x[i] - mx) * (x[i] - mx); sxy += (x[i] - mx) * (y[i] - my); syy += (y[i] - my) * (y[i] - my); }
    var b = sxy / sxx, a = my - b * mx, sse = 0; for (var j = 0; j < n; j++) { var e = y[j] - (a + b * x[j]); sse += e * e; }
    return { n: n, mx: mx, my: my, sxx: sxx, sxy: sxy, syy: syy, b: b, a: a, sse: sse, r: sxy / Math.sqrt(sxx * syy) };
  }
  function solve(A, b) {
    var n = b.length, i, j, k;
    for (i = 0; i < n; i++) {
      var mx = i; for (k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[mx][i])) mx = k;
      var t = A[i]; A[i] = A[mx]; A[mx] = t; var tb = b[i]; b[i] = b[mx]; b[mx] = tb;
      if (Math.abs(A[i][i]) < 1e-14) return null;
      for (k = i + 1; k < n; k++) { var f = A[k][i] / A[i][i]; for (j = i; j < n; j++) A[k][j] -= f * A[i][j]; b[k] -= f * b[i]; }
    }
    var x = new Array(n); for (i = n - 1; i >= 0; i--) { var s = b[i]; for (j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i]; } return x;
  }
  function polyfit(x, y, deg) {
    var m = S.mean(x), u = x.map(function (v) { return v - m; }), A = [], b = [], i, j;
    for (i = 0; i <= deg; i++) { A.push([]); b.push(S.sum(u.map(function (q, k) { return Math.pow(q, i) * y[k]; }))); for (j = 0; j <= deg; j++) A[i].push(S.sum(u.map(function (q) { return Math.pow(q, i + j); }))); }
    var c = solve(A, b); if (!c) return null;
    var out = []; for (j = 0; j <= deg; j++) { var s = 0; for (var k = j; k <= deg; k++) s += c[k] * S.comb(k, j) * Math.pow(-m, k - j); out.push(s); } return out;
  }
  var polyEval = function (c, x) { var s = 0; for (var i = c.length - 1; i >= 0; i--) s = s * x + c[i]; return s; };
  var sgn = function (v, d) { return (v < 0 ? '− ' : '+ ') + N(Math.abs(v), d || 5); };
  var polyStr = function (c) { var s = 'y = '; for (var i = c.length - 1; i >= 0; i--) { var t = N(Math.abs(c[i]), 5) + (i === 0 ? '' : i === 1 ? 'x' : 'x^' + i); s += (i === c.length - 1 ? (c[i] < 0 ? '−' : '') + t : (c[i] < 0 ? ' − ' : ' + ') + t); } return s; };
  var r2of = function (y, f) { var m = S.mean(y), sse = 0, sst = 0; y.forEach(function (v, i) { sse += (v - f[i]) * (v - f[i]); sst += (v - m) * (v - m); }); return sst ? 1 - sse / sst : 1; };
  var scatter = function (x, y, fx, title) {
    var lo = Math.min.apply(null, x), hi = Math.max.apply(null, x), pad = (hi - lo) * 0.05 || 1, pts = [], n = 60; for (var i = 0; i <= n; i++) { var q = lo - pad + (hi - lo + 2 * pad) * i / n; var v = fx(q); if (isFinite(v)) pts.push([q, v]); }
    return { type: 'scatter', title: title || 'Data and fitted line', series: [{ l: 'Data', pts: x.map(function (q, i) { return [q, y[i]]; }) }, { l: 'Fit', pts: pts, line: true }], f: 'num' };
  };
  var resTable = function (x, y, fx) { return { head: ['x', 'y', 'Predicted', 'Residual'], rows: x.slice(0, 60).map(function (q, i) { var f = fx(q); return [q, y[i], f, y[i] - f]; }), fmt: ['num', 'num', 'num', 'num'], title: 'Residuals' }; };

  C('linear-regression-calculator', 'Linear Regression Calculator (Least Squares)', G, 'Best-fit line, correlation, R² and predictions from x–y data.', 'ŷ = a + bx · b = Sxy ÷ Sxx.',
    [XY, ['x0', 'Predict y for x =', 'n', 8], LEVEL],
    function (v) { var q = xy(v.d); if (q.n < 3) return NEEDXY; var f = fit(q.x, q.y); if (!(f.sxx > 0)) return { error: 'All x values are identical.' }; var df = q.n - 2, s = Math.sqrt(f.sse / df), seb = s / Math.sqrt(f.sxx), sea = s * Math.sqrt(1 / q.n + f.mx * f.mx / f.sxx), t = f.b / seb, p = S.t2p(t, df), cv = S.tinv(1 - (1 - v.lv / 100) / 2, df), fx = function (z) { return f.a + f.b * z; };
      var pr = fx(v.x0), pi = cv * s * Math.sqrt(1 + 1 / q.n + (v.x0 - f.mx) * (v.x0 - f.mx) / f.sxx);
      return { results: [M('Regression line', 'y = ' + N(f.a, 5) + ' ' + sgn(f.b) + 'x', 'text'), P('Slope (b)', f.b, 6), P('Intercept (a)', f.a, 6), P('Correlation (r)', f.r, 5), P('R²', f.r * f.r, 5), P('Prediction at x = ' + N(v.x0, 4), pr, 5), R('Prediction interval', N(pr - pi, 4) + '  to  ' + N(pr + pi, 4), 'text'), P('Standard error of estimate', s, 5), P('Slope p-value', p, 6), R('Slope confidence interval', N(f.b - cv * seb, 5) + '  to  ' + N(f.b + cv * seb, 5), 'text'), P('Intercept standard error', sea, 5), P('Data points', q.n, 0)],
        chart: scatter(q.x, q.y, fx), table: resTable(q.x, q.y, fx) }; }, { pop: 1 });
  C('correlation-coefficient-calculator', 'Correlation Coefficient Calculator (Pearson r)', G, 'Pearson correlation, significance and confidence interval for paired data.', 'r = Sxy ÷ √(Sxx × Syy).',
    [XY, LEVEL],
    function (v) { var q = xy(v.d); if (q.n < 3) return NEEDXY; var f = fit(q.x, q.y); if (!(f.sxx > 0) || !(f.syy > 0)) return { error: 'x and y must both vary.' }; var r = f.r, df = q.n - 2, t = r * Math.sqrt(df / Math.max(1e-300, 1 - r * r)), p = S.t2p(t, df), z = Math.atanh(Math.min(0.9999999, Math.max(-0.9999999, r))), se = 1 / Math.sqrt(Math.max(1, q.n - 3)), cz = S.ninv(1 - (1 - v.lv / 100) / 2), a = Math.abs(r);
      return { results: [P('Correlation (r)', r, 5, true), P('R²', r * r, 5), P('p-value', p, 6), R('Confidence interval for r', N(Math.tanh(z - cz * se), 4) + '  to  ' + N(Math.tanh(z + cz * se), 4), 'text'), R('Strength', (a < 0.1 ? 'Negligible' : a < 0.3 ? 'Weak' : a < 0.5 ? 'Moderate' : a < 0.7 ? 'Strong' : 'Very strong') + (r < 0 ? ' negative' : r > 0 ? ' positive' : ''), 'text'), P('Covariance (sample)', f.sxy / (q.n - 1), 5), P('Data points', q.n, 0)], chart: scatter(q.x, q.y, function (z2) { return f.a + f.b * z2; }, 'Scatter plot') }; }, { pop: 1 });
  var rank = function (a) { var idx = a.map(function (x, i) { return [x, i]; }).sort(function (p, q) { return p[0] - q[0]; }), rk = new Array(a.length), i = 0; while (i < idx.length) { var j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; var av = (i + j) / 2 + 1; for (var k = i; k <= j; k++) rk[idx[k][1]] = av; i = j + 1; } return rk; };
  C('spearman-rank-correlation-calculator', 'Spearman Rank Correlation Calculator', G, 'Rank-based correlation for monotonic relationships and ordinal data.', 'ρ = Pearson correlation of the ranks.',
    [XY],
    function (v) { var q = xy(v.d); if (q.n < 3) return NEEDXY; var rx = rank(q.x), ry = rank(q.y), f = fit(rx, ry); if (!(f.sxx > 0) || !(f.syy > 0)) return { error: 'x and y must both vary.' }; var rho = f.r, df = q.n - 2, t = rho * Math.sqrt(df / Math.max(1e-300, 1 - rho * rho));
      return { results: [P('Spearman ρ', rho, 5, true), P('p-value (approx.)', S.t2p(t, df), 6), P('Pearson r (for comparison)', fit(q.x, q.y).r, 5), P('Data points', q.n, 0)], table: { head: ['x', 'y', 'Rank x', 'Rank y'], rows: q.x.slice(0, 60).map(function (a, i) { return [a, q.y[i], rx[i], ry[i]]; }), fmt: ['num', 'num', 'num', 'num'], title: 'Ranks' } }; });
  C('r-squared-calculator', 'R-Squared (Coefficient of Determination) Calculator', G, 'How well predictions explain the observed data.', 'R² = 1 − SSE ÷ SST.',
    [['a', 'Actual values', 'ta', '3, 5, 7, 9, 11, 14', { rows: 2 }], ['p', 'Predicted values', 'ta', '2.8, 5.3, 7.1, 9.4, 11.2, 13.1', { rows: 2 }]],
    function (v) { var a = L(v.a), p = L(v.p); if (a.length !== p.length) return { error: 'Both lists must be the same length.' }; if (a.length < 2) return { error: 'Enter at least 2 pairs.' }; var m = S.mean(a), sse = 0, sst = 0, sae = 0; a.forEach(function (y, i) { sse += (y - p[i]) * (y - p[i]); sst += (y - m) * (y - m); sae += Math.abs(y - p[i]); }); if (!sst) return { error: 'The actual values do not vary.' };
      return { results: [P('R²', 1 - sse / sst, 5, true), P('Adjusted for 1 predictor', 1 - (1 - (1 - sse / sst)) * (a.length - 1) / Math.max(1, a.length - 2), 5), P('RMSE', Math.sqrt(sse / a.length), 5), P('MAE', sae / a.length, 5), P('SSE (residual)', sse, 5), P('SST (total)', sst, 5)] }; });
  C('covariance-calculator', 'Covariance Calculator', G, 'Sample and population covariance of two variables.', 'cov(x, y) = Σ (x − x̄)(y − ȳ) ÷ (n − 1).',
    [XY],
    function (v) { var q = xy(v.d); if (q.n < 2) return { error: 'Enter at least 2 "x y" pairs.' }; var f = fit(q.x, q.y);
      return { results: [P('Sample covariance', f.sxy / (q.n - 1), 6, true), P('Population covariance', f.sxy / q.n, 6), P('Correlation', f.sxx && f.syy ? f.r : 0, 5), P('Mean of x', f.mx, 5), P('Mean of y', f.my, 5)] }; });
  var curve = function (id, title, desc, formula, tx, ty, back, label) {
    C(id, title, G, desc, formula, [XY, ['x0', 'Predict y for x =', 'n', 8]],
      function (v) { var q = xy(v.d); if (q.n < 3) return NEEDXY; var xs = q.x.map(tx), ys = q.y.map(ty); if (xs.concat(ys).some(function (z) { return !isFinite(z); })) return { error: 'The data must suit this model (e.g. positive x or y for logs).' }; var f = fit(xs, ys); if (!(f.sxx > 0)) return { error: 'All x values are identical.' };
        var fn = back(f.a, f.b), pred = q.x.map(fn.f); return { results: [M(label, fn.eq, 'text'), P('a', fn.a, 6), P('b', fn.b, 6), P('R² (on your original data)', r2of(q.y, pred), 5), P('Prediction at x = ' + N(v.x0, 4), fn.f(v.x0), 5), P('Data points', q.n, 0)], chart: scatter(q.x, q.y, fn.f, 'Data and fitted curve'), table: resTable(q.x, q.y, fn.f) }; });
  };
  curve('exponential-regression-calculator', 'Exponential Regression Calculator', 'Fit y = a·e^(bx) to growth or decay data.', 'ln y = ln a + bx.', function (x) { return x; }, Math.log, function (a, b) { var A = Math.exp(a); return { a: A, b: b, eq: 'y = ' + N(A, 5) + ' · e^(' + N(b, 5) + 'x)', f: function (x) { return A * Math.exp(b * x); } }; }, 'Exponential model');
  curve('logarithmic-regression-calculator', 'Logarithmic Regression Calculator', 'Fit y = a + b·ln(x) to data that levels off.', 'y = a + b ln x.', Math.log, function (y) { return y; }, function (a, b) { return { a: a, b: b, eq: 'y = ' + N(a, 5) + ' ' + sgn(b) + ' ln(x)', f: function (x) { return a + b * Math.log(x); } }; }, 'Logarithmic model');
  curve('power-regression-calculator', 'Power Regression Calculator', 'Fit y = a·xᵇ to scaling data.', 'ln y = ln a + b ln x.', Math.log, Math.log, function (a, b) { var A = Math.exp(a); return { a: A, b: b, eq: 'y = ' + N(A, 5) + ' · x^' + N(b, 5), f: function (x) { return A * Math.pow(x, b); } }; }, 'Power model');
  var poly = function (id, title, deg, desc) {
    C(id, title, G, desc, 'Least-squares polynomial of degree ' + deg + '.', [XY, ['x0', 'Predict y for x =', 'n', 8]],
      function (v) { var q = xy(v.d); if (q.n < deg + 2) return { error: 'Enter at least ' + (deg + 2) + ' "x y" pairs.' }; var c = polyfit(q.x, q.y, deg); if (!c || c.some(function (z) { return !isFinite(z); })) return { error: 'Could not fit — try different data.' }; var fn = function (x) { return polyEval(c, x); }, pred = q.x.map(fn), res = [M('Equation', polyStr(c), 'text')];
        c.forEach(function (z, i) { res.push(P('Coefficient of x' + (i === 0 ? '⁰ (constant)' : i === 1 ? '' : '^' + i), z, 6)); }); res.push(P('R²', r2of(q.y, pred), 5), P('Prediction at x = ' + N(v.x0, 4), fn(v.x0), 5));
        return { results: res, chart: scatter(q.x, q.y, fn, 'Data and fitted curve'), table: resTable(q.x, q.y, fn) }; });
  };
  poly('quadratic-regression-calculator', 'Quadratic Regression Calculator', 2, 'Fit a parabola y = ax² + bx + c to your data.');
  poly('cubic-regression-calculator', 'Cubic Regression Calculator', 3, 'Fit a cubic polynomial to your data.');
  poly('polynomial-regression-calculator', 'Polynomial Regression Calculator (Degree 4)', 4, 'Fit a degree-4 polynomial to your data.');
  C('trendline-forecast-calculator', 'Trendline Forecast Calculator', G, 'Extend a series with a linear trend and forecast future values.', 'Linear trend fitted to period numbers 1…n.',
    [['d', 'Series (oldest first)', 'ta', '120, 132, 128, 141, 150, 158, 163, 171', { rows: 3 }], ['h', 'Periods to forecast', 'i', 4]],
    function (v) { var y = L(v.d), n = y.length; if (n < 3) return { error: 'Enter at least 3 values.' }; var h = Math.max(1, Math.min(60, Math.round(v.h))), x = y.map(function (_, i) { return i + 1; }), f = fit(x, y), fn = function (t) { return f.a + f.b * t; }, rows = [];
      for (var i = 1; i <= h; i++) rows.push([n + i, fn(n + i)]);
      var all = y.concat(rows.map(function (r) { return r[1]; })); return { results: [M('Next period forecast', fn(n + 1), 'num', { dp: 4 }), R('Trend per period', f.b, 'num', { dp: 4 }), R('Forecast at the end', fn(n + h), 'num', { dp: 4 }), R('R²', f.r * f.r, 'num', { dp: 4 })],
        table: { head: ['Period', 'Forecast'], rows: rows, fmt: ['int', 'num'], title: 'Forecast' }, chart: { type: 'line', labels: all.map(function (_, i) { return String(i + 1); }), series: [{ l: 'Actual then forecast', pts: all }, { l: 'Linear trend', pts: all.map(function (_, i) { return fn(i + 1); }) }], f: 'num' } }; });

  /* ======================= SAMPLING & SURVEYS ======================= */
  C('sample-size-for-mean-calculator', 'Sample Size Calculator (Estimating a Mean)', Z, 'Sample size needed to estimate a mean within a chosen margin of error.', 'n = (z × σ ÷ E)².',
    [['sd', 'Estimated standard deviation (σ)', 'n', 15], ['me', 'Margin of error (E)', 'n', 2], LEVEL, ['Pop', 'Population size (0 = very large)', 'i', 0, '', { opt: 1 }]],
    function (v) { if (!(v.sd > 0) || !(v.me > 0)) return { error: 'σ and the margin of error must be above 0.' }; var z = S.ninv(1 - (1 - v.lv / 100) / 2), n0 = Math.pow(z * v.sd / v.me, 2), n = v.Pop > 0 ? n0 / (1 + (n0 - 1) / v.Pop) : n0;
      return { results: [M('Required sample size', Math.ceil(n), 'int'), R('Without population correction', Math.ceil(n0), 'int'), R('z critical value', z, 'num', { dp: 4 })] }; });
  C('survey-sample-size-calculator', 'Survey Sample Size Calculator (Proportion)', Z, 'How many people to survey for a chosen confidence and margin of error.', 'n = z² × p(1 − p) ÷ e², adjusted for population size.',
    [['me', 'Margin of error', 'p', 5], LEVEL, ['p', 'Expected proportion', 'p', 50], ['Pop', 'Population size (0 = very large)', 'i', 0, '', { opt: 1 }]],
    function (v) { var e = v.me / 100, p = v.p / 100; if (!(e > 0 && e < 1) || p < 0 || p > 1) return { error: 'Check the margin of error and proportion.' }; var z = S.ninv(1 - (1 - v.lv / 100) / 2), n0 = z * z * p * (1 - p) / (e * e), n = v.Pop > 0 ? n0 / (1 + (n0 - 1) / v.Pop) : n0;
      return { results: [M('Required sample size', Math.ceil(n), 'int'), R('Without population correction', Math.ceil(n0), 'int'), R('z critical value', z, 'num', { dp: 4 }), R('If response rate is 30%, invite', Math.ceil(n / 0.3), 'int')] }; }, { pop: 1 });
  C('ab-test-significance-calculator', 'A/B Test Significance Calculator', Z, 'Is your A/B test result statistically significant?', 'Two-proportion z-test on the conversion rates.',
    [['n1', 'Visitors in A (control)', 'i', 5000], ['x1', 'Conversions in A', 'i', 250], ['n2', 'Visitors in B (variant)', 'i', 5000], ['x2', 'Conversions in B', 'i', 295], ['cf', 'Confidence required', 'p', 95]],
    function (v) { var n1 = Math.round(v.n1), n2 = Math.round(v.n2), x1 = Math.round(v.x1), x2 = Math.round(v.x2); if (n1 < 1 || n2 < 1 || x1 < 0 || x2 < 0 || x1 > n1 || x2 > n2) return { error: 'Conversions cannot exceed visitors.' }; var p1 = x1 / n1, p2 = x2 / n2, pp = (x1 + x2) / (n1 + n2), se = Math.sqrt(pp * (1 - pp) * (1 / n1 + 1 / n2)); if (!se) return { error: 'No variation in the data.' };
      var z = (p2 - p1) / se, p = 2 * S.nsf(Math.abs(z)), sig = p < 1 - v.cf / 100;
      return { results: [M('Result', sig ? (p2 > p1 ? 'B wins — significant at ' + N(v.cf, 3) + '%' : 'A wins — significant at ' + N(v.cf, 3) + '%') : 'Not significant yet — keep testing', 'text'), PP('Conversion rate A', p1, 3), PP('Conversion rate B', p2, 3), R('Relative uplift', p1 ? (p2 - p1) / p1 * 100 : 0, 'pct', { dp: 2 }), P('p-value', p, 5), P('z-score', z, 3), PP('Confidence that B ≠ A', 1 - p, 2)],
        chart: S.bars(['A', 'B'], [p1, p2], 'Conversion rate', 'pct', 'Conversion rates') }; }, { pop: 1 });
  C('ab-test-sample-size-calculator', 'A/B Test Sample Size Calculator', Z, 'Visitors needed per variation to detect a given uplift.', 'n = (zα√(2p̄q̄) + zβ√(p₁q₁ + p₂q₂))² ÷ (p₂ − p₁)².',
    [['b', 'Baseline conversion rate', 'p', 5], ['mde', 'Minimum detectable uplift (relative)', 'p', 10], ['alpha', 'Significance level (α)', 'p', 5], ['pw', 'Power', 'p', 80], ['vis', 'Daily visitors (optional)', 'i', 1000, '', { opt: 1 }]],
    function (v) { var p1 = v.b / 100, p2 = p1 * (1 + v.mde / 100), a = v.alpha / 100; if (!(p1 > 0 && p1 < 1) || !(p2 > 0 && p2 < 1) || !(v.mde > 0) || !(a > 0 && a < 1)) return { error: 'Check the baseline, uplift and α.' }; var za = S.ninv(1 - a / 2), zb = S.ninv(v.pw / 100), pb = (p1 + p2) / 2, n = Math.pow(za * Math.sqrt(2 * pb * (1 - pb)) + zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2) / Math.pow(p2 - p1, 2);
      return { results: [M('Visitors per variation', Math.ceil(n), 'int'), R('Total visitors (A + B)', Math.ceil(n) * 2, 'int'), R('Variant conversion rate', p2 * 100, 'pct', { dp: 3 }), R('Test duration', v.vis > 0 ? Math.ceil(Math.ceil(n) * 2 / v.vis) : '—', v.vis > 0 ? 'int' : 'text', { u: v.vis > 0 ? 'days' : '' })] }; });
  C('response-rate-calculator', 'Survey Response Rate Calculator', Z, 'Response rate and the invitations needed for a target number of responses.', 'Response rate = responses ÷ invitations.',
    [['sent', 'Invitations sent', 'i', 2500], ['got', 'Responses received', 'i', 410], ['goal', 'Target responses', 'i', 600]],
    function (v) { if (!(v.sent > 0) || v.got < 0 || v.got > v.sent) return { error: 'Responses cannot exceed invitations.' }; var r = v.got / v.sent;
      return { results: [PP('Response rate', r, 2, true), R('Non-responses', v.sent - v.got, 'int'), R('Invitations needed for the target', r > 0 ? Math.ceil(v.goal / r) : '—', r > 0 ? 'int' : 'text'), R('More invitations to send', r > 0 ? Math.max(0, Math.ceil(v.goal / r) - v.sent) : '—', r > 0 ? 'int' : 'text')] }; });
  C('net-promoter-score-calculator', 'Net Promoter Score (NPS) Calculator', Z, 'NPS from promoters, passives and detractors.', 'NPS = % promoters (9–10) − % detractors (0–6).',
    [['pr', 'Promoters (scores 9–10)', 'i', 120], ['pa', 'Passives (scores 7–8)', 'i', 60], ['de', 'Detractors (scores 0–6)', 'i', 40]],
    function (v) { var t = v.pr + v.pa + v.de; if (!(t > 0)) return { error: 'Enter your response counts.' }; var p = v.pr / t, d = v.de / t, nps = (p - d) * 100, se = Math.sqrt((p + d - (p - d) * (p - d)) / t) * 100;
      return { results: [M('NPS', nps, 'num', { dp: 1 }), PP('Promoters', p, 1), PP('Passives', v.pa / t, 1), PP('Detractors', d, 1), R('95% margin of error', 1.96 * se, 'num', { dp: 1, u: 'points' }), R('Rating', nps >= 70 ? 'World-class' : nps >= 50 ? 'Excellent' : nps >= 30 ? 'Good' : nps >= 0 ? 'Needs work' : 'Critical', 'text')], chart: { type: 'donut', data: [{ l: 'Promoters', v: v.pr }, { l: 'Passives', v: v.pa }, { l: 'Detractors', v: v.de }], f: 'num' } }; }, { pop: 1 });
  C('csat-calculator', 'CSAT (Customer Satisfaction) Calculator', Z, 'Customer satisfaction score from 1–5 ratings.', 'CSAT = satisfied responses (4–5) ÷ all responses × 100.',
    [['c1', 'Rated 1', 'i', 5], ['c2', 'Rated 2', 'i', 8], ['c3', 'Rated 3', 'i', 22], ['c4', 'Rated 4', 'i', 70], ['c5', 'Rated 5', 'i', 95]],
    function (v) { var t = v.c1 + v.c2 + v.c3 + v.c4 + v.c5; if (!(t > 0)) return { error: 'Enter your response counts.' }; var avg = (v.c1 + 2 * v.c2 + 3 * v.c3 + 4 * v.c4 + 5 * v.c5) / t;
      return { results: [PP('CSAT score', (v.c4 + v.c5) / t, 1, true), P('Average rating', avg, 2), R('Total responses', t, 'int'), PP('Dissatisfied (1–2)', (v.c1 + v.c2) / t, 1)], chart: S.bars(['1', '2', '3', '4', '5'], [v.c1, v.c2, v.c3, v.c4, v.c5], 'Responses', 'int', 'Ratings') }; });
  C('stratified-sampling-calculator', 'Stratified Sampling Calculator', Z, 'Proportional allocation of a sample across strata.', 'nₕ = n × Nₕ ÷ N.',
    [['n', 'Total sample size (n)', 'i', 400], ['d', 'Stratum name and size (one per line)', 'ta', 'Urban 5200\nSemi-urban 2800\nRural 2000', { rows: 4 }]],
    function (v) { var rows = String(v.d).trim().split(/\n/).map(function (l) { var m = /^(.*?)[\s,:=]+([\d.,]+)\s*$/.exec(l.trim()); return m ? [m[1] || 'Stratum', parseFloat(m[2].replace(/,/g, ''))] : null; }).filter(function (r) { return r && r[1] > 0; }); if (rows.length < 2) return { error: 'Enter at least 2 strata as "name size".' }; var tot = S.sum(rows.map(function (r) { return r[1]; })), n = Math.round(v.n);
      var alloc = rows.map(function (r) { return [r[0], r[1], r[1] / tot * 100, Math.round(n * r[1] / tot)]; }), got = S.sum(alloc.map(function (a) { return a[3]; }));
      return { results: [M('Total sample', n, 'int'), R('Population', tot, 'int'), R('Sampling fraction', n / tot * 100, 'pct', { dp: 2 }), R('After rounding', got, 'int')], table: { head: ['Stratum', 'Size', 'Share', 'Sample'], rows: alloc, fmt: ['', 'int', 'pct', 'int'], title: 'Allocation' }, chart: { type: 'donut', data: alloc.map(function (a) { return { l: a[0], v: a[3] }; }), f: 'int' } }; });
  C('systematic-sampling-calculator', 'Systematic Sampling Calculator', Z, 'Sampling interval and the units selected.', 'k = N ÷ n · pick every k-th unit from a random start.',
    [['Pop', 'Population size (N)', 'i', 500], ['n', 'Sample size (n)', 'i', 40], ['st', 'Random start (1 to k)', 'i', 7]],
    function (v) { var Nn = Math.round(v.Pop), n = Math.round(v.n); if (Nn < 2 || n < 1 || n > Nn) return { error: 'The sample must be between 1 and the population size.' }; var k = Math.floor(Nn / n), st = Math.max(1, Math.min(k, Math.round(v.st))), list = []; for (var i = 0; i < n; i++) list.push(st + i * k);
      return { results: [M('Sampling interval (k)', k, 'int'), R('Starting unit', st, 'int'), R('Units selected', list.length, 'int'), R('First 12 units', list.slice(0, 12).join(', ') + (list.length > 12 ? ' …' : ''), 'text')] }; });
})(window.CW);
