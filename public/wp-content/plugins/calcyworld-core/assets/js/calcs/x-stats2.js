/* Calcyworld — statistics: distributions, hypothesis tests, confidence intervals */
(function (CW) {
  'use strict';
  var C = CW.C, M = CW.M, R = CW.Rr, L = CW.list, S = CW.stat;
  var N = function (x, d) { return CW.fmt.num(x, d === undefined ? 6 : d); };
  var D = 'statistics/distributions', T = 'statistics/tests';
  var P = function (l, v, dp, main) { var o = { dp: dp === undefined ? 6 : dp }; return main ? M(l, v, 'num', o) : R(l, v, 'num', o); };
  var PP = function (l, v, dp, main) { var o = { dp: dp === undefined ? 4 : dp }; return main ? M(l, v * 100, 'pct', o) : R(l, v * 100, 'pct', o); };
  var TAIL = [['tail', 'Alternative hypothesis', 's', 1, [[1, 'Two-tailed (≠)'], [2, 'Left-tailed (<)'], [3, 'Right-tailed (>)']]]];
  var ALPHA = ['alpha', 'Significance level (α)', 'p', 5];
  var LEVEL = ['lv', 'Confidence level', 'p', 95];
  var decide = function (p, a) { return p < a ? 'Reject H₀ — the result is statistically significant' : 'Fail to reject H₀ — not statistically significant'; };
  var pZ = function (z, tail) { return +tail === 1 ? 2 * S.nsf(Math.abs(z)) : +tail === 2 ? S.ncdf(z) : S.nsf(z); };
  var pT = function (t, df, tail) { return +tail === 1 ? S.t2p(t, df) : +tail === 2 ? S.tcdf(t, df) : S.tcdf(-t, df); };
  var zc = function (lv) { return S.ninv(1 - (1 - lv / 100) / 2); };
  var tc = function (lv, df) { return S.tinv(1 - (1 - lv / 100) / 2, df); };
  var tailChart = function (pdf, stat, tail, lo, hi) {
    return S.curve(pdf, lo, hi, 90, function (x) { return +tail === 1 ? Math.abs(x) >= Math.abs(stat) : +tail === 2 ? x <= stat : x >= stat; });
  };
  var BAD = { error: 'Please check your inputs.' };

  /* ======================= DISTRIBUTIONS ======================= */
  C('normal-distribution-calculator', 'Normal Distribution Calculator', D, 'Probability under the bell curve for any mean and standard deviation.', 'z = (x − μ) ÷ σ · P = Φ(z).',
    [['mu', 'Mean (μ)', 'n', 100], ['sd', 'Standard deviation (σ)', 'n', 15],
      ['m', 'Find', 's', 3, [[1, 'P(X ≤ x₁)  — below'], [2, 'P(X ≥ x₁)  — above'], [3, 'P(x₁ ≤ X ≤ x₂)  — between'], [4, 'P(X ≤ x₁ or X ≥ x₂)  — outside']]],
      ['x1', 'x₁', 'n', 85], ['x2', 'x₂', 'n', 130, '', { show: 'm>=3' }]],
    function (v) {
      var mu = v.mu, sd = v.sd, m = +v.m, a = v.x1, b = v.x2; if (!(sd > 0)) return { error: 'The standard deviation must be above 0.' }; if (m >= 3 && a > b) { var t = a; a = b; b = t; }
      var z1 = (a - mu) / sd, z2 = (b - mu) / sd, p = m === 1 ? S.ncdf(z1) : m === 2 ? S.nsf(z1) : m === 3 ? S.ncdf(z2) - S.ncdf(z1) : S.ncdf(z1) + S.nsf(z2);
      var lo = mu - 4 * sd, hi = mu + 4 * sd, ins = function (x) { return m === 1 ? x <= a : m === 2 ? x >= a : m === 3 ? (x >= a && x <= b) : (x <= a || x >= b); };
      return { results: [PP('Probability', p, 4, true), P('z-score of x₁', z1, 4), m >= 3 ? P('z-score of x₂', z2, 4) : R('Percentile of x₁', S.ncdf(z1) * 100, 'pct', { dp: 2 }), P('Complement', 1 - p, 6)],
        chart: S.curve(function (x) { return S.npdf((x - mu) / sd) / sd; }, lo, hi, 90, ins) }; }, { pop: 1 });
  C('z-table-calculator', 'Z-Table Calculator (Standard Normal)', D, 'Areas under the standard normal curve for any z-score.', 'Area to the left = Φ(z).',
    [['z', 'z-score', 'n', 1.96]],
    function (v) { var z = v.z, l = S.ncdf(z);
      return { results: [P('Area to the left, P(Z ≤ z)', l, 6, true), P('Area to the right, P(Z ≥ z)', S.nsf(z), 6), P('Between 0 and z', Math.abs(l - 0.5), 6), P('Between −|z| and |z|', 1 - 2 * S.nsf(Math.abs(z)), 6), P('Two-tailed, P(|Z| ≥ |z|)', 2 * S.nsf(Math.abs(z)), 6)],
        chart: S.curve(S.npdf, -4, 4, 90, function (x) { return x <= z; }) }; }, { pop: 1 });
  C('inverse-normal-calculator', 'Inverse Normal Calculator (Percentile → z / x)', D, 'Find the z-score or value that cuts off a given area.', 'z = Φ⁻¹(p) · x = μ + zσ.',
    [['p', 'Area (probability)', 'p', 97.5], ['k', 'The area is', 's', 1, [[1, 'Left-tail area'], [2, 'Right-tail area'], [3, 'Central area (−z to z)'], [4, 'Two-tail area (outside ±z)']]], ['mu', 'Mean (μ)', 'n', 0], ['sd', 'Standard deviation (σ)', 'n', 1]],
    function (v) { var p = v.p / 100, k = +v.k, z; if (!(p > 0 && p < 1) || !(v.sd > 0)) return { error: 'The area must be between 0% and 100%, and σ above 0.' };
      z = k === 1 ? S.ninv(p) : k === 2 ? S.ninv(1 - p) : k === 3 ? S.ninv(0.5 + p / 2) : S.ninv(1 - p / 2);
      return { results: [P(k >= 3 ? 'z-score (±)' : 'z-score', z, 6, true), k >= 3 ? R('x values', N(v.mu - z * v.sd, 5) + '  and  ' + N(v.mu + z * v.sd, 5), 'text') : P('x value', v.mu + z * v.sd, 6)], chart: S.curve(S.npdf, -4, 4, 90, function (x) { return k === 1 ? x <= z : k === 2 ? x >= z : k === 3 ? Math.abs(x) <= z : Math.abs(x) >= z; }) }; });
  var discrete = function (id, title, desc, formula, inputs, fn, ex) { C(id, title, D, desc, formula, inputs, fn, ex); };
  discrete('binomial-distribution-calculator', 'Binomial Distribution Calculator', 'Probability of k successes in n independent trials.', 'P(X = k) = C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ.',
    [['n', 'Number of trials (n)', 'i', 20], ['p', 'Probability of success (p)', 'p', 30], ['k', 'Successes (k)', 'i', 6]],
    function (v) { var n = Math.round(v.n), k = Math.round(v.k), p = v.p / 100; if (n < 1 || n > 5000 || k < 0 || k > n || p < 0 || p > 1) return { error: 'Use 1–5000 trials and 0 ≤ k ≤ n.' }; var mean = n * p, sd = Math.sqrt(n * p * (1 - p)), lab = [], pm = [];
      var a = Math.max(0, Math.floor(mean - 4.5 * sd - 2)), b = Math.min(n, Math.ceil(mean + 4.5 * sd + 2)); for (var i = a; i <= b; i++) { lab.push(String(i)); pm.push(S.binpmf(i, n, p)); }
      return { results: [PP('P(X = ' + k + ')', S.binpmf(k, n, p), 5, true), PP('P(X ≤ ' + k + ')', S.bincdf(k, n, p), 5), PP('P(X < ' + k + ')', S.bincdf(k - 1, n, p), 5), PP('P(X ≥ ' + k + ')', 1 - S.bincdf(k - 1, n, p), 5), PP('P(X > ' + k + ')', 1 - S.bincdf(k, n, p), 5), P('Mean (np)', mean, 4), P('Variance', n * p * (1 - p), 4), P('Standard deviation', sd, 4)], chart: S.bars(lab, pm, 'Probability', 'pct', 'Binomial distribution') }; }, { pop: 1 });
  discrete('poisson-distribution-calculator', 'Poisson Distribution Calculator', 'Probability of k events when events occur at an average rate λ.', 'P(X = k) = e^−λ λᵏ ÷ k!',
    [['l', 'Average rate (λ)', 'n', 4], ['k', 'Events (k)', 'i', 6]],
    function (v) { var l = v.l, k = Math.round(v.k); if (!(l > 0) || l > 5000 || k < 0) return { error: 'λ must be positive and k ≥ 0.' }; var sd = Math.sqrt(l), lab = [], pm = [], a = Math.max(0, Math.floor(l - 4.5 * sd - 2)), b = Math.ceil(l + 4.5 * sd + 3);
      for (var i = a; i <= b; i++) { lab.push(String(i)); pm.push(S.poipmf(i, l)); }
      return { results: [PP('P(X = ' + k + ')', S.poipmf(k, l), 5, true), PP('P(X ≤ ' + k + ')', S.poicdf(k, l), 5), PP('P(X < ' + k + ')', k ? S.poicdf(k - 1, l) : 0, 5), PP('P(X ≥ ' + k + ')', 1 - (k ? S.poicdf(k - 1, l) : 0), 5), P('Mean = Variance', l, 4), P('Standard deviation', sd, 4)], chart: S.bars(lab, pm, 'Probability', 'pct', 'Poisson distribution') }; });
  discrete('geometric-distribution-calculator', 'Geometric Distribution Calculator', 'Probability that the first success happens on trial k.', 'P(X = k) = (1 − p)ᵏ⁻¹ p.',
    [['p', 'Probability of success (p)', 'p', 20], ['k', 'Trial number (k)', 'i', 3]],
    function (v) { var p = v.p / 100, k = Math.round(v.k); if (!(p > 0 && p <= 1) || k < 1) return { error: 'p must be above 0% and k ≥ 1.' }; var lab = [], pm = []; for (var i = 1; i <= Math.min(40, Math.max(k + 5, 15)); i++) { lab.push(String(i)); pm.push(Math.pow(1 - p, i - 1) * p); }
      return { results: [PP('P(X = ' + k + ')', Math.pow(1 - p, k - 1) * p, 5, true), PP('P(X ≤ ' + k + ')', 1 - Math.pow(1 - p, k), 5), PP('P(X > ' + k + ')', Math.pow(1 - p, k), 5), P('Mean (1 ÷ p)', 1 / p, 4), P('Variance', (1 - p) / (p * p), 4)], chart: S.bars(lab, pm, 'Probability', 'pct', 'Geometric distribution') }; });
  discrete('negative-binomial-calculator', 'Negative Binomial Distribution Calculator', 'Probability that the r-th success occurs on trial k.', 'P(X = k) = C(k − 1, r − 1) pʳ (1 − p)ᵏ⁻ʳ.',
    [['r', 'Successes needed (r)', 'i', 3], ['p', 'Probability of success (p)', 'p', 40], ['k', 'Trial of the r-th success (k)', 'i', 8]],
    function (v) { var r = Math.round(v.r), k = Math.round(v.k), p = v.p / 100; if (r < 1 || !(p > 0 && p < 1) || k < r || k > 5000) return { error: 'Need k ≥ r ≥ 1 and 0% < p < 100%.' }; var f = function (j) { return Math.exp(S.lcomb(j - 1, r - 1) + r * Math.log(p) + (j - r) * Math.log(1 - p)); }, cum = 0, lab = [], pm = [];
      for (var j = r; j <= k; j++) cum += f(j); for (var q = r; q <= Math.min(r + 40, Math.max(k + 6, r + 15)); q++) { lab.push(String(q)); pm.push(f(q)); }
      return { results: [PP('P(X = ' + k + ')', f(k), 5, true), PP('P(X ≤ ' + k + ')', Math.min(1, cum), 5), P('Mean (r ÷ p)', r / p, 4), P('Variance', r * (1 - p) / (p * p), 4)], chart: S.bars(lab, pm, 'Probability', 'pct', 'Negative binomial distribution') }; });
  discrete('hypergeometric-distribution-calculator', 'Hypergeometric Distribution Calculator', 'Probability of k successes when sampling without replacement.', 'P(X = k) = C(K, k) C(N − K, n − k) ÷ C(N, n).',
    [['Nn', 'Population size (N)', 'i', 50], ['K', 'Successes in population (K)', 'i', 10], ['n', 'Sample size (n)', 'i', 8], ['k', 'Successes in sample (k)', 'i', 2]],
    function (v) { var Nn = Math.round(v.Nn), K = Math.round(v.K), n = Math.round(v.n), k = Math.round(v.k); if (Nn < 1 || K < 0 || K > Nn || n < 1 || n > Nn || k < 0) return { error: 'Check N, K, n and k.' }; var le = 0, lab = [], pm = [], i;
      for (i = 0; i <= Math.min(K, n); i++) { lab.push(String(i)); pm.push(S.hyppmf(i, Nn, K, n)); if (i <= k) le += pm[pm.length - 1]; }
      return { results: [PP('P(X = ' + k + ')', S.hyppmf(k, Nn, K, n), 5, true), PP('P(X ≤ ' + k + ')', Math.min(1, le), 5), PP('P(X ≥ ' + k + ')', Math.min(1, 1 - le + S.hyppmf(k, Nn, K, n)), 5), P('Mean', n * K / Nn, 4), P('Variance', n * (K / Nn) * (1 - K / Nn) * (Nn - n) / Math.max(1, Nn - 1), 4)], chart: S.bars(lab, pm, 'Probability', 'pct', 'Hypergeometric distribution') }; });
  C('exponential-distribution-calculator', 'Exponential Distribution Calculator', D, 'Waiting time until the next event in a Poisson process.', 'P(X ≤ x) = 1 − e^(−λx).',
    [['l', 'Rate (λ) — events per unit time', 'n', 0.5], ['x', 'Time (x)', 'n', 2]],
    function (v) { var l = v.l, x = v.x; if (!(l > 0) || x < 0) return { error: 'λ must be positive and x ≥ 0.' }; var hi = 5 / l;
      return { results: [PP('P(X ≤ x)', 1 - Math.exp(-l * x), 4, true), PP('P(X > x)', Math.exp(-l * x), 4), P('Mean (1 ÷ λ)', 1 / l, 4), P('Median', Math.LN2 / l, 4), P('Variance', 1 / (l * l), 4), P('Density at x', l * Math.exp(-l * x), 6)], chart: S.curve(function (t) { return l * Math.exp(-l * t); }, 0, Math.max(hi, x * 1.3), 90, function (t) { return t <= x; }) }; });
  C('uniform-distribution-calculator', 'Continuous Uniform Distribution Calculator', D, 'Probability when every value in [a, b] is equally likely.', 'P(x₁ ≤ X ≤ x₂) = (x₂ − x₁) ÷ (b − a).',
    [['a', 'Minimum (a)', 'n', 0], ['b', 'Maximum (b)', 'n', 10], ['x1', 'From (x₁)', 'n', 2], ['x2', 'To (x₂)', 'n', 6]],
    function (v) { var a = v.a, b = v.b; if (!(b > a)) return { error: 'The maximum must exceed the minimum.' }; var lo = Math.max(a, Math.min(v.x1, v.x2)), hi = Math.min(b, Math.max(v.x1, v.x2));
      return { results: [PP('P(x₁ ≤ X ≤ x₂)', Math.max(0, hi - lo) / (b - a), 4, true), P('Mean', (a + b) / 2, 4), P('Variance', (b - a) * (b - a) / 12, 4), P('Standard deviation', (b - a) / Math.sqrt(12), 4), P('Density', 1 / (b - a), 6)] }; });
  C('t-distribution-calculator', "Student's t-Distribution Calculator", D, 'Cumulative and tail probabilities of the t-distribution.', 'Uses the regularized incomplete beta function.',
    [['t', 't value', 'n', 2.1], ['df', 'Degrees of freedom', 'n', 12]],
    function (v) { var t = v.t, df = v.df; if (!(df > 0)) return { error: 'Degrees of freedom must be above 0.' };
      return { results: [P('P(T ≤ t)', S.tcdf(t, df), 6, true), P('P(T ≥ t)', S.tcdf(-t, df), 6), P('Two-tailed P(|T| ≥ |t|)', S.t2p(t, df), 6), P('Density f(t)', S.tpdf(t, df), 6)], chart: tailChart(function (x) { return S.tpdf(x, df); }, t, 3, -5, 5) }; });
  C('chi-square-distribution-calculator', 'Chi-Square Distribution Calculator', D, 'Cumulative and right-tail probabilities of the χ² distribution.', 'P(X ≤ x) = P(df ÷ 2, x ÷ 2) — regularized gamma.',
    [['x', 'χ² value', 'n', 9.5], ['df', 'Degrees of freedom', 'n', 4]],
    function (v) { var x = v.x, df = v.df; if (!(df > 0) || x < 0) return { error: 'df must be above 0 and χ² ≥ 0.' };
      return { results: [P('P(X ≤ x)', S.chicdf(x, df), 6, true), P('P(X ≥ x)  — p-value', S.chisf(x, df), 6), P('Mean', df, 3), P('Variance', 2 * df, 3)], chart: S.curve(function (q) { return S.chipdf(q, df); }, 0, Math.max(x * 1.5, df + 5 * Math.sqrt(2 * df)), 90, function (q) { return q >= x; }) }; });
  C('f-distribution-calculator', 'F-Distribution Calculator', D, 'Cumulative and right-tail probabilities of the F-distribution.', 'Uses the regularized incomplete beta function.',
    [['x', 'F value', 'n', 3.2], ['d1', 'Numerator df', 'n', 4], ['d2', 'Denominator df', 'n', 20]],
    function (v) { if (!(v.d1 > 0) || !(v.d2 > 0) || v.x < 0) return { error: 'Degrees of freedom must be above 0 and F ≥ 0.' };
      return { results: [P('P(F ≤ x)', S.fcdf(v.x, v.d1, v.d2), 6, true), P('P(F ≥ x)  — p-value', S.fsf(v.x, v.d1, v.d2), 6), v.d2 > 2 ? P('Mean', v.d2 / (v.d2 - 2), 4) : R('Mean', 'Undefined', 'text')] }; });
  C('weibull-distribution-calculator', 'Weibull Distribution Calculator', D, 'Reliability and lifetime probabilities with the Weibull model.', 'F(x) = 1 − e^(−(x ÷ λ)ᵏ).',
    [['k', 'Shape (k)', 'n', 1.5], ['lm', 'Scale (λ)', 'n', 1000], ['x', 'Time (x)', 'n', 800]],
    function (v) { var k = v.k, l = v.lm, x = v.x; if (!(k > 0) || !(l > 0) || x < 0) return { error: 'Shape and scale must be positive; x ≥ 0.' }; var G = function (z) { return Math.exp(S.lgamma(z)); };
      return { results: [PP('P(failure by x)', 1 - Math.exp(-Math.pow(x / l, k)), 4, true), PP('Reliability R(x)', Math.exp(-Math.pow(x / l, k)), 4), P('Mean', l * G(1 + 1 / k), 4), P('Median', l * Math.pow(Math.LN2, 1 / k), 4), P('Hazard rate at x', x > 0 ? k / l * Math.pow(x / l, k - 1) : 0, 8)],
        chart: S.curve(function (q) { return q < 0 ? 0 : k / l * Math.pow(q / l, k - 1) * Math.exp(-Math.pow(q / l, k)); }, 0, l * 2.5, 90, function (q) { return q <= x; }) }; });
  C('gamma-distribution-calculator', 'Gamma Distribution Calculator', D, 'Cumulative probability of the gamma distribution.', 'F(x) = P(α, βx).',
    [['a', 'Shape (α)', 'n', 3], ['b', 'Rate (β)', 'n', 0.5], ['x', 'x', 'n', 8]],
    function (v) { if (!(v.a > 0) || !(v.b > 0) || v.x < 0) return { error: 'Shape and rate must be positive; x ≥ 0.' };
      return { results: [PP('P(X ≤ x)', S.gammaP(v.a, v.b * v.x), 4, true), PP('P(X > x)', S.gammaQ(v.a, v.b * v.x), 4), P('Mean', v.a / v.b, 4), P('Variance', v.a / (v.b * v.b), 4)] }; });
  C('beta-distribution-calculator', 'Beta Distribution Calculator', D, 'Cumulative probability of the beta distribution on [0, 1].', 'F(x) = Iₓ(α, β).',
    [['a', 'Alpha (α)', 'n', 2], ['b', 'Beta (β)', 'n', 5], ['x', 'x (0–1)', 'n', 0.4]],
    function (v) { if (!(v.a > 0) || !(v.b > 0) || v.x < 0 || v.x > 1) return { error: 'α, β > 0 and 0 ≤ x ≤ 1.' };
      return { results: [PP('P(X ≤ x)', S.betai(v.x, v.a, v.b), 4, true), PP('P(X > x)', 1 - S.betai(v.x, v.a, v.b), 4), P('Mean', v.a / (v.a + v.b), 4), P('Variance', v.a * v.b / ((v.a + v.b) * (v.a + v.b) * (v.a + v.b + 1)), 6)] }; });
  C('critical-value-calculator', 'Critical Value Calculator (z, t, χ², F)', T, 'Critical values for z, t, chi-square and F tests.', 'The value that cuts off α of the distribution.',
    [['dist', 'Distribution', 's', 1, [[1, 'Normal (z)'], [2, "Student's t"], [3, 'Chi-square (χ²)'], [4, 'F']]], ['alpha', 'Significance level (α)', 'p', 5], ['tail', 'Tail', 'g', 1, [[1, 'Two-tailed'], [2, 'Right-tailed'], [3, 'Left-tailed']]],
      ['d1', 'Degrees of freedom (df)', 'n', 10, '', { show: 'dist>1' }], ['d2', 'Denominator df', 'n', 20, '', { show: 'dist==4' }]],
    function (v) { var d = +v.dist, a = v.alpha / 100, tl = +v.tail, df = v.d1, d2 = v.d2; if (!(a > 0 && a < 1)) return { error: 'α must be between 0% and 100%.' }; if (d > 1 && !(df > 0)) return { error: 'Degrees of freedom must be above 0.' }; if (d === 4 && !(d2 > 0)) return { error: 'Degrees of freedom must be above 0.' };
      var inv = function (p) { return d === 1 ? S.ninv(p) : d === 2 ? S.tinv(p, df) : d === 3 ? S.chiinv(p, df) : S.finv(p, df, d2); }, sym = d <= 2, res;
      if (tl === 1) res = sym ? ['±' + N(inv(1 - a / 2), 5), inv(1 - a / 2)] : [N(inv(a / 2), 5) + '  and  ' + N(inv(1 - a / 2), 5), inv(1 - a / 2)];
      else if (tl === 2) res = [N(inv(1 - a), 5), inv(1 - a)]; else res = [N(inv(a), 5), inv(a)];
      return { results: [M('Critical value', res[0], 'text'), R('Distribution', ['', 'Normal (z)', "Student's t", 'Chi-square', 'F'][d], 'text'), R('α', a * 100, 'pct', { dp: 2 }), R('Confidence level', (1 - a) * 100, 'pct', { dp: 2 })] }; }, { pop: 1 });
  C('p-value-calculator', 'P-Value Calculator', T, 'P-value from a z, t, chi-square or F test statistic.', 'p = probability of a result at least as extreme as the statistic.',
    [['dist', 'Test statistic', 's', 1, [[1, 'z-score'], [2, 't-score'], [3, 'Chi-square (χ²)'], [4, 'F-score']]], ['x', 'Value of the statistic', 'n', 1.96], ['tail', 'Tail', 'g', 1, [[1, 'Two-tailed'], [2, 'Left-tailed'], [3, 'Right-tailed']]],
      ['d1', 'Degrees of freedom (df)', 'n', 20, '', { show: 'dist>1' }], ['d2', 'Denominator df', 'n', 30, '', { show: 'dist==4' }], ALPHA],
    function (v) { var d = +v.dist, x = v.x, tl = +v.tail, df = v.d1, d2 = v.d2, left, right; if (d > 1 && !(df > 0)) return { error: 'Degrees of freedom must be above 0.' };
      if (d === 1) { left = S.ncdf(x); right = S.nsf(x); } else if (d === 2) { left = S.tcdf(x, df); right = S.tcdf(-x, df); } else if (d === 3) { if (x < 0) return { error: 'χ² cannot be negative.' }; left = S.chicdf(x, df); right = S.chisf(x, df); } else { if (x < 0 || !(d2 > 0)) return { error: 'F cannot be negative; denominator df must be above 0.' }; left = S.fcdf(x, df, d2); right = S.fsf(x, df, d2); }
      var p = tl === 2 ? left : tl === 3 ? right : Math.min(1, 2 * Math.min(left, right)), a = v.alpha / 100;
      return { results: [P('P-value', p, 6, true), R('Significant at α = ' + N(v.alpha, 2) + '%?', p < a ? 'Yes — reject H₀' : 'No — fail to reject H₀', 'text'), P('Left-tail area', left, 6), P('Right-tail area', right, 6)] }; }, { pop: 1 });
  C('empirical-rule-calculator', 'Empirical Rule (68-95-99.7) Calculator', D, 'Ranges holding 68%, 95% and 99.7% of a normal distribution.', 'μ ± 1σ → 68% · μ ± 2σ → 95% · μ ± 3σ → 99.7%.',
    [['mu', 'Mean (μ)', 'n', 100], ['sd', 'Standard deviation (σ)', 'n', 15]],
    function (v) { if (!(v.sd > 0)) return { error: 'σ must be above 0.' }; var r = function (k) { return N(v.mu - k * v.sd, 4) + '  to  ' + N(v.mu + k * v.sd, 4); };
      return { results: [M('68% of values lie between', r(1), 'text'), R('95% of values lie between', r(2), 'text'), R('99.7% of values lie between', r(3), 'text')], chart: S.curve(function (x) { return S.npdf((x - v.mu) / v.sd) / v.sd; }, v.mu - 4 * v.sd, v.mu + 4 * v.sd, 90, function (x) { return Math.abs(x - v.mu) <= 2 * v.sd; }) }; });
  C('chebyshev-inequality-calculator', "Chebyshev's Inequality Calculator", D, 'Minimum share of any data set within k standard deviations.', 'At least 1 − 1 ÷ k² of values lie within k standard deviations.',
    [['m', 'Find', 'g', 1, [[1, 'Share within k σ'], [2, 'k for a given share']]], ['k', 'k (number of σ)', 'n', 2.5, '', { show: 'm==1' }], ['p', 'Share of data', 'p', 90, '', { show: 'm==2' }], ['mu', 'Mean (optional)', 'n', 50], ['sd', 'Standard deviation (optional)', 'n', 8]],
    function (v) { var k; if (+v.m === 1) { k = v.k; if (!(k > 1)) return { error: 'k must be greater than 1.' }; } else { var p = v.p / 100; if (!(p > 0 && p < 1)) return { error: 'The share must be between 0% and 100%.' }; k = 1 / Math.sqrt(1 - p); }
      return { results: [M('At least this share is within k σ', (1 - 1 / (k * k)) * 100, 'pct', { dp: 3 }), P('k', k, 4), R('Range', N(v.mu - k * v.sd, 4) + '  to  ' + N(v.mu + k * v.sd, 4), 'text'), R('Normal data would have', (1 - 2 * S.nsf(k)) * 100, 'pct', { dp: 3 })] }; });
  C('sampling-distribution-calculator', 'Sampling Distribution & Central Limit Theorem Calculator', D, 'Probability about a sample mean using the central limit theorem.', 'z = (x̄ − μ) ÷ (σ ÷ √n).',
    [['mu', 'Population mean (μ)', 'n', 100], ['sd', 'Population standard deviation (σ)', 'n', 15], ['n', 'Sample size (n)', 'i', 36], ['xb', 'Sample mean (x̄)', 'n', 104]],
    function (v) { if (!(v.sd > 0) || !(v.n >= 1)) return { error: 'σ and n must be positive.' }; var se = v.sd / Math.sqrt(v.n), z = (v.xb - v.mu) / se;
      return { results: [PP('P(x̄ ≥ sample mean)', S.nsf(z), 4, true), PP('P(x̄ ≤ sample mean)', S.ncdf(z), 4), P('Standard error', se, 5), P('z-score', z, 4)], chart: S.curve(function (x) { return S.npdf((x - v.mu) / se) / se; }, v.mu - 4 * se, v.mu + 4 * se, 90, function (x) { return x >= v.xb; }) }; });

  /* ======================= CONFIDENCE INTERVALS ======================= */
  C('confidence-interval-calculator', 'Confidence Interval Calculator (Mean)', T, 'Confidence interval for a population mean from sample statistics.', 'x̄ ± critical value × s ÷ √n.',
    [['xb', 'Sample mean (x̄)', 'n', 52.4], ['s', 'Standard deviation', 'n', 8.1], ['n', 'Sample size (n)', 'i', 40], LEVEL, ['t', 'Standard deviation is', 'g', 1, [[1, 'Sample (use t)'], [2, 'Known σ (use z)']]]],
    function (v) { var n = Math.round(v.n); if (n < 2 || !(v.s >= 0)) return { error: 'Need n ≥ 2 and a non-negative standard deviation.' }; var cv = +v.t === 1 ? tc(v.lv, n - 1) : zc(v.lv), se = v.s / Math.sqrt(n), me = cv * se;
      return { results: [M('Confidence interval', N(v.xb - me, 5) + '  to  ' + N(v.xb + me, 5), 'text'), P('Margin of error', me, 5), P('Standard error', se, 5), P(+v.t === 1 ? 't critical value' : 'z critical value', cv, 4), P('Lower bound', v.xb - me, 5), P('Upper bound', v.xb + me, 5)] }; }, { pop: 1 });
  C('confidence-interval-proportion-calculator', 'Confidence Interval for a Proportion Calculator', T, 'Confidence interval for a population proportion (Wald and Wilson).', 'p̂ ± z × √(p̂(1 − p̂) ÷ n).',
    [['x', 'Successes', 'i', 56], ['n', 'Sample size (n)', 'i', 200], LEVEL],
    function (v) { var x = Math.round(v.x), n = Math.round(v.n); if (n < 1 || x < 0 || x > n) return { error: 'Successes must be between 0 and n.' }; var p = x / n, z = zc(v.lv), me = z * Math.sqrt(p * (1 - p) / n), den = 1 + z * z / n, ce = (p + z * z / (2 * n)) / den, hw = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den;
      return { results: [M('Wilson interval', N(Math.max(0, ce - hw) * 100, 3) + '%  to  ' + N(Math.min(1, ce + hw) * 100, 3) + '%', 'text'), R('Wald interval', N(Math.max(0, p - me) * 100, 3) + '%  to  ' + N(Math.min(1, p + me) * 100, 3) + '%', 'text'), PP('Sample proportion', p, 3), PP('Margin of error (Wald)', me, 3), P('z critical value', z, 4)] }; });
  C('margin-of-error-calculator', 'Margin of Error Calculator', T, 'Margin of error of a survey or poll.', 'MOE = z × √(p(1 − p) ÷ n) × finite-population factor.',
    [['n', 'Sample size (n)', 'i', 1000], ['p', 'Expected proportion', 'p', 50], LEVEL, ['Pop', 'Population size (0 = very large)', 'i', 0, '', { opt: 1 }]],
    function (v) { var n = Math.round(v.n), p = v.p / 100; if (n < 1 || p < 0 || p > 1) return { error: 'Check the sample size and proportion.' }; var z = zc(v.lv), fpc = v.Pop > n ? Math.sqrt((v.Pop - n) / (v.Pop - 1)) : 1, me = z * Math.sqrt(p * (1 - p) / n) * fpc;
      return { results: [PP('Margin of error', me, 3, true), P('z critical value', z, 4), R('Result range', N(Math.max(0, p - me) * 100, 2) + '%  to  ' + N(Math.min(1, p + me) * 100, 2) + '%', 'text'), P('Finite population factor', fpc, 4)] }; });
  C('degrees-of-freedom-calculator', 'Degrees of Freedom Calculator', T, 'Degrees of freedom for common statistical tests.', 'One-sample t: n − 1 · Two-sample: n₁ + n₂ − 2 · Chi-square: (r − 1)(c − 1).',
    [['m', 'Test', 's', 1, [[1, 'One-sample or paired t-test'], [2, 'Two-sample t-test (pooled)'], [3, 'Two-sample t-test (Welch)'], [4, 'Chi-square goodness of fit'], [5, 'Chi-square independence'], [6, 'One-way ANOVA'], [7, 'Simple linear regression']]],
      ['n1', 'Sample size n₁ (or n)', 'i', 25, '', { show: 'if(m<=3,1,if(m==7,1,m==6))' }], ['n2', 'Sample size n₂', 'i', 30, '', { show: 'if(m==2,1,m==3)' }], ['s1', 'Standard deviation s₁', 'n', 4, '', { show: 'm==3' }], ['s2', 'Standard deviation s₂', 'n', 6, '', { show: 'm==3' }],
      ['k', 'Categories / groups (k)', 'i', 5, '', { show: 'if(m==4,1,m==6)' }], ['r', 'Rows', 'i', 3, '', { show: 'm==5' }], ['c', 'Columns', 'i', 4, '', { show: 'm==5' }]],
    function (v) { var m = +v.m, df, ex = '';
      if (m === 1) df = v.n1 - 1; else if (m === 2) df = v.n1 + v.n2 - 2; else if (m === 3) { var a = v.s1 * v.s1 / v.n1, b = v.s2 * v.s2 / v.n2; df = (a + b) * (a + b) / (a * a / (v.n1 - 1) + b * b / (v.n2 - 1)); }
      else if (m === 4) df = v.k - 1; else if (m === 5) df = (v.r - 1) * (v.c - 1); else if (m === 6) { df = v.k - 1; ex = 'Within groups: ' + (v.n1 - v.k); } else df = v.n1 - 2;
      if (!isFinite(df) || df <= 0) return BAD; return { results: [M('Degrees of freedom', df, 'num', { dp: m === 3 ? 3 : 0 }), R('Detail', ex || '—', 'text')] }; });

  /* ======================= HYPOTHESIS TESTS ======================= */
  C('one-sample-t-test-calculator', 'One-Sample t-Test Calculator', T, 'Test whether a sample mean differs from a hypothesised mean.', 't = (x̄ − μ₀) ÷ (s ÷ √n).',
    [['xb', 'Sample mean (x̄)', 'n', 52.4], ['mu', 'Hypothesised mean (μ₀)', 'n', 50], ['s', 'Sample standard deviation (s)', 'n', 8.1], ['n', 'Sample size (n)', 'i', 40]].concat(TAIL, [ALPHA]),
    function (v) { var n = Math.round(v.n); if (n < 2 || !(v.s > 0)) return { error: 'Need n ≥ 2 and s above 0.' }; var df = n - 1, se = v.s / Math.sqrt(n), t = (v.xb - v.mu) / se, p = pT(t, df, v.tail), a = v.alpha / 100, cv = tc(95, df);
      return { results: [P('P-value', p, 6, true), P('t statistic', t, 4), P('Degrees of freedom', df, 0), P('Standard error', se, 5), R('Decision', decide(p, a), 'text'), R('95% CI for the mean', N(v.xb - cv * se, 4) + '  to  ' + N(v.xb + cv * se, 4), 'text'), P("Cohen's d", (v.xb - v.mu) / v.s, 3)], chart: tailChart(function (x) { return S.tpdf(x, df); }, t, v.tail, -5, 5) }; }, { pop: 1 });
  C('two-sample-t-test-calculator', 'Two-Sample t-Test Calculator', T, 'Compare the means of two independent groups from summary statistics.', "Welch: t = (x̄₁ − x̄₂) ÷ √(s₁²/n₁ + s₂²/n₂).",
    [['m1', 'Group 1 mean', 'n', 52.4], ['s1', 'Group 1 standard deviation', 'n', 8.1], ['n1', 'Group 1 size', 'i', 40], ['m2', 'Group 2 mean', 'n', 48.9], ['s2', 'Group 2 standard deviation', 'n', 9.3], ['n2', 'Group 2 size', 'i', 35],
      ['w', 'Variances', 'g', 1, [[1, 'Unequal (Welch)'], [2, 'Equal (pooled)']]]].concat(TAIL, [ALPHA]),
    function (v) { var n1 = Math.round(v.n1), n2 = Math.round(v.n2); if (n1 < 2 || n2 < 2 || !(v.s1 > 0) || !(v.s2 > 0)) return { error: 'Need both group sizes ≥ 2 and standard deviations above 0.' }; var a1 = v.s1 * v.s1 / n1, a2 = v.s2 * v.s2 / n2, df, se;
      if (+v.w === 1) { se = Math.sqrt(a1 + a2); df = (a1 + a2) * (a1 + a2) / (a1 * a1 / (n1 - 1) + a2 * a2 / (n2 - 1)); } else { df = n1 + n2 - 2; var sp2 = ((n1 - 1) * v.s1 * v.s1 + (n2 - 1) * v.s2 * v.s2) / df; se = Math.sqrt(sp2 * (1 / n1 + 1 / n2)); }
      var diff = v.m1 - v.m2, t = diff / se, p = pT(t, df, v.tail), cv = tc(95, df), sd = Math.sqrt(((n1 - 1) * v.s1 * v.s1 + (n2 - 1) * v.s2 * v.s2) / (n1 + n2 - 2));
      return { results: [P('P-value', p, 6, true), P('t statistic', t, 4), P('Degrees of freedom', df, 2), P('Difference of means', diff, 4), R('Decision', decide(p, v.alpha / 100), 'text'), R('95% CI for the difference', N(diff - cv * se, 4) + '  to  ' + N(diff + cv * se, 4), 'text'), P("Cohen's d", diff / sd, 3)], chart: tailChart(function (x) { return S.tpdf(x, df); }, t, v.tail, -5, 5) }; }, { pop: 1 });
  C('paired-t-test-calculator', 'Paired t-Test Calculator', T, 'Test whether the mean difference between paired measurements is zero.', 't = d̄ ÷ (s_d ÷ √n).',
    [['a', 'Before (list)', 'ta', '82, 79, 85, 90, 77, 88, 84, 80', { rows: 3 }], ['b', 'After (list, same order)', 'ta', '78, 77, 80, 86, 75, 85, 80, 79', { rows: 3 }]].concat(TAIL, [ALPHA]),
    function (v) { var a = L(v.a), b = L(v.b); if (a.length !== b.length) return { error: 'Both lists must have the same number of values.' }; if (a.length < 2) return { error: 'Enter at least 2 pairs.' }; var d = a.map(function (x, i) { return x - b[i]; }), n = d.length, md = S.mean(d), sd = Math.sqrt(S.varS(d));
      if (!(sd > 0)) return { error: 'All the differences are identical, so the test is undefined.' }; var se = sd / Math.sqrt(n), t = md / se, df = n - 1, p = pT(t, df, v.tail), cv = tc(95, df);
      return { results: [P('P-value', p, 6, true), P('t statistic', t, 4), P('Degrees of freedom', df, 0), P('Mean difference', md, 4), R('Decision', decide(p, v.alpha / 100), 'text'), R('95% CI for the difference', N(md - cv * se, 4) + '  to  ' + N(md + cv * se, 4), 'text'), P('Pairs', n, 0)], chart: tailChart(function (x) { return S.tpdf(x, df); }, t, v.tail, -5, 5) }; });
  C('one-sample-z-test-calculator', 'One-Sample z-Test Calculator', T, 'Test a sample mean against a hypothesised mean when σ is known.', 'z = (x̄ − μ₀) ÷ (σ ÷ √n).',
    [['xb', 'Sample mean (x̄)', 'n', 105], ['mu', 'Hypothesised mean (μ₀)', 'n', 100], ['sd', 'Population standard deviation (σ)', 'n', 15], ['n', 'Sample size (n)', 'i', 50]].concat(TAIL, [ALPHA]),
    function (v) { if (!(v.sd > 0) || !(v.n >= 1)) return { error: 'σ and n must be positive.' }; var se = v.sd / Math.sqrt(v.n), z = (v.xb - v.mu) / se, p = pZ(z, v.tail);
      return { results: [P('P-value', p, 6, true), P('z statistic', z, 4), P('Standard error', se, 5), R('Decision', decide(p, v.alpha / 100), 'text'), R('95% CI for the mean', N(v.xb - 1.959964 * se, 4) + '  to  ' + N(v.xb + 1.959964 * se, 4), 'text')], chart: tailChart(S.npdf, z, v.tail, -4.5, 4.5) }; });
  C('one-proportion-z-test-calculator', 'One-Proportion z-Test Calculator', T, 'Test an observed proportion against a hypothesised value.', 'z = (p̂ − p₀) ÷ √(p₀(1 − p₀) ÷ n).',
    [['x', 'Successes', 'i', 58], ['n', 'Sample size (n)', 'i', 100], ['p0', 'Hypothesised proportion (p₀)', 'p', 50]].concat(TAIL, [ALPHA]),
    function (v) { var x = Math.round(v.x), n = Math.round(v.n), p0 = v.p0 / 100; if (n < 1 || x < 0 || x > n || !(p0 > 0 && p0 < 1)) return { error: 'Check the counts and p₀ (between 0% and 100%).' }; var ph = x / n, se = Math.sqrt(p0 * (1 - p0) / n), z = (ph - p0) / se, p = pZ(z, v.tail);
      return { results: [P('P-value', p, 6, true), P('z statistic', z, 4), PP('Sample proportion', ph, 3), R('Decision', decide(p, v.alpha / 100), 'text'), R('Normal approximation OK?', n * p0 >= 10 && n * (1 - p0) >= 10 ? 'Yes (np₀ and n(1−p₀) ≥ 10)' : 'Caution — small expected counts', 'text')], chart: tailChart(S.npdf, z, v.tail, -4.5, 4.5) }; });
  C('two-proportion-z-test-calculator', 'Two-Proportion z-Test Calculator', T, 'Compare two proportions (A/B tests, surveys).', 'z = (p̂₁ − p̂₂) ÷ √(p̂(1 − p̂)(1/n₁ + 1/n₂)).',
    [['x1', 'Group 1 successes', 'i', 120], ['n1', 'Group 1 size', 'i', 1000], ['x2', 'Group 2 successes', 'i', 150], ['n2', 'Group 2 size', 'i', 1000]].concat(TAIL, [ALPHA]),
    function (v) { var x1 = Math.round(v.x1), n1 = Math.round(v.n1), x2 = Math.round(v.x2), n2 = Math.round(v.n2); if (n1 < 1 || n2 < 1 || x1 < 0 || x2 < 0 || x1 > n1 || x2 > n2) return { error: 'Check the counts.' }; var p1 = x1 / n1, p2 = x2 / n2, pp = (x1 + x2) / (n1 + n2), se = Math.sqrt(pp * (1 - pp) * (1 / n1 + 1 / n2)); if (!se) return { error: 'No variation in the data.' }; var z = (p1 - p2) / se, p = pZ(z, v.tail), se2 = Math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2);
      return { results: [P('P-value', p, 6, true), P('z statistic', z, 4), PP('Group 1 proportion', p1, 3), PP('Group 2 proportion', p2, 3), R('Decision', decide(p, v.alpha / 100), 'text'), R('95% CI for the difference', N((p1 - p2 - 1.959964 * se2) * 100, 3) + '%  to  ' + N((p1 - p2 + 1.959964 * se2) * 100, 3) + '%', 'text')], chart: tailChart(S.npdf, z, v.tail, -4.5, 4.5) }; }, { pop: 1 });
  C('chi-square-goodness-of-fit-calculator', 'Chi-Square Goodness-of-Fit Test Calculator', T, 'Test whether observed counts match expected counts.', 'χ² = Σ (O − E)² ÷ E.',
    [['o', 'Observed counts', 'ta', '18, 22, 16, 25, 19', { rows: 2 }], ['ex', 'Expected counts (leave empty for equal)', 'ta', '', { rows: 2, opt: 1 }], ALPHA],
    function (v) { var o = L(v.o), e = L(v.ex); if (o.length < 2) return NEED(2); var tot = S.sum(o); if (!e.length) e = o.map(function () { return tot / o.length; });
      if (e.length !== o.length) return { error: 'Observed and expected lists must have the same length.' }; if (e.some(function (x) { return !(x > 0); })) return { error: 'Expected counts must be positive.' }; var se = S.sum(e); if (Math.abs(se - tot) > 1e-6 * tot) e = e.map(function (x) { return x * tot / se; });
      var chi = 0, rows = o.map(function (x, i) { var c = (x - e[i]) * (x - e[i]) / e[i]; chi += c; return [i + 1, x, e[i], c]; }), df = o.length - 1, p = S.chisf(chi, df);
      return { results: [P('P-value', p, 6, true), P('χ² statistic', chi, 4), P('Degrees of freedom', df, 0), R('Decision', decide(p, v.alpha / 100), 'text')], table: { head: ['Category', 'Observed', 'Expected', '(O−E)²/E'], rows: rows, fmt: ['int', 'num', 'num', 'num'], title: 'Working' }, chart: S.curve(function (q) { return S.chipdf(q, df); }, 0, Math.max(chi * 1.5, df + 5 * Math.sqrt(2 * df)), 90, function (q) { return q >= chi; }) }; });
  C('chi-square-independence-test-calculator', 'Chi-Square Test of Independence Calculator', T, 'Test whether two categorical variables are related (contingency table).', 'E = row total × column total ÷ grand total.',
    [['t', 'Observed counts (one row per line)', 'ta', '30 20 10\n25 35 20', { rows: 4 }], ALPHA],
    function (v) { var m = S.rows(v.t); if (m.length < 2 || m[0].length < 2 || m.some(function (r) { return r.length !== m[0].length; })) return { error: 'Enter a table with at least 2 rows and 2 columns, each row the same length.' };
      var r = m.length, c = m[0].length, rt = m.map(S.sum), ct = m[0].map(function (_, j) { return S.sum(m.map(function (row) { return row[j]; })); }), tot = S.sum(rt), chi = 0, lowE = 0, ex = [];
      m.forEach(function (row, i) { var er = []; row.forEach(function (x, j) { var e = rt[i] * ct[j] / tot; er.push(e); if (e < 5) lowE++; if (e > 0) chi += (x - e) * (x - e) / e; }); ex.push(er); }); var df = (r - 1) * (c - 1), p = S.chisf(chi, df);
      return { results: [P('P-value', p, 6, true), P('χ² statistic', chi, 4), P('Degrees of freedom', df, 0), P("Cramér's V", Math.sqrt(chi / (tot * Math.min(r - 1, c - 1))), 4), R('Decision', decide(p, v.alpha / 100), 'text'), R('Check', lowE ? lowE + ' cell(s) have an expected count below 5 — interpret with care' : 'All expected counts are at least 5', 'text')],
        table: { head: [''].concat(m[0].map(function (_, j) { return 'Col ' + (j + 1); })), rows: ex.map(function (row, i) { return ['Row ' + (i + 1) + ' expected'].concat(row); }), fmt: [''].concat(m[0].map(function () { return 'num'; })), title: 'Expected counts' } }; });
  C('one-way-anova-calculator', 'One-Way ANOVA Calculator', T, 'Compare the means of three or more groups.', 'F = MS between ÷ MS within.',
    [['g', 'Groups (one group per line)', 'ta', '23 25 28 24 26\n30 32 29 31 33\n27 26 29 28 30', { rows: 4 }], ALPHA],
    function (v) { var gs = S.rows(v.g).filter(function (r) { return r.length >= 1; }); if (gs.length < 2) return { error: 'Enter at least 2 groups (one per line).' }; var all = [].concat.apply([], gs), n = all.length, k = gs.length; if (n - k < 1) return { error: 'You need more observations than groups.' };
      var gm = S.mean(all), ssb = 0, ssw = 0; gs.forEach(function (g) { var m = S.mean(g); ssb += g.length * (m - gm) * (m - gm); g.forEach(function (x) { ssw += (x - m) * (x - m); }); }); var dfb = k - 1, dfw = n - k, msb = ssb / dfb, msw = ssw / dfw; if (!(msw > 0)) return { error: 'There is no variation within the groups.' }; var F = msb / msw, p = S.fsf(F, dfb, dfw);
      return { results: [P('P-value', p, 6, true), P('F statistic', F, 4), P('η² (effect size)', ssb / (ssb + ssw), 4), R('Decision', decide(p, v.alpha / 100), 'text'), P('Grand mean', gm, 4)],
        table: { head: ['Source', 'SS', 'df', 'MS', 'F'], rows: [['Between groups', ssb, dfb, msb, F], ['Within groups', ssw, dfw, msw, '—'], ['Total', ssb + ssw, n - 1, '—', '—']], fmt: ['', 'num', 'int', 'num', 'num'], title: 'ANOVA table' },
        chart: S.bars(gs.map(function (g, i) { return 'Group ' + (i + 1); }), gs.map(S.mean), 'Mean', 'num', 'Group means') }; });
  C('variance-ratio-f-test-calculator', 'F-Test for Equality of Variances Calculator', T, 'Test whether two populations have the same variance.', 'F = s₁² ÷ s₂².',
    [['s1', 'Group 1 standard deviation', 'n', 8.1], ['n1', 'Group 1 size', 'i', 25], ['s2', 'Group 2 standard deviation', 'n', 5.9], ['n2', 'Group 2 size', 'i', 30], ALPHA],
    function (v) { if (!(v.s1 > 0) || !(v.s2 > 0) || v.n1 < 2 || v.n2 < 2) return { error: 'Need positive standard deviations and sizes ≥ 2.' }; var F = v.s1 * v.s1 / (v.s2 * v.s2), d1 = v.n1 - 1, d2 = v.n2 - 1, p = Math.min(1, 2 * Math.min(S.fcdf(F, d1, d2), S.fsf(F, d1, d2)));
      return { results: [P('P-value (two-tailed)', p, 6, true), P('F statistic', F, 4), R('Degrees of freedom', d1 + ' and ' + d2, 'text'), R('Decision', decide(p, v.alpha / 100).replace('result is', 'difference in variances is'), 'text')] }; });
  C('cohens-d-calculator', "Cohen's d Effect Size Calculator", T, 'Standardised difference between two group means.', 'd = (x̄₁ − x̄₂) ÷ pooled standard deviation.',
    [['m1', 'Group 1 mean', 'n', 52.4], ['s1', 'Group 1 standard deviation', 'n', 8.1], ['n1', 'Group 1 size', 'i', 40], ['m2', 'Group 2 mean', 'n', 48.9], ['s2', 'Group 2 standard deviation', 'n', 9.3], ['n2', 'Group 2 size', 'i', 35]],
    function (v) { if (v.n1 < 2 || v.n2 < 2) return { error: 'Group sizes must be at least 2.' }; var sp = Math.sqrt(((v.n1 - 1) * v.s1 * v.s1 + (v.n2 - 1) * v.s2 * v.s2) / (v.n1 + v.n2 - 2)); if (!(sp > 0)) return BAD; var d = (v.m1 - v.m2) / sp, g = d * (1 - 3 / (4 * (v.n1 + v.n2) - 9)), a = Math.abs(d);
      return { results: [P("Cohen's d", d, 4, true), P("Hedges' g", g, 4), P('Pooled standard deviation', sp, 4), P('Correlation r', d / Math.sqrt(d * d + 4), 4), R('Size of effect', a < 0.2 ? 'Negligible' : a < 0.5 ? 'Small' : a < 0.8 ? 'Medium' : 'Large', 'text')] }; });
  C('statistical-power-calculator', 'Statistical Power & Required Sample Size Calculator', T, 'Power of a test for a given effect size and sample size.', 'Power = Φ(d√n − z₁₋α/₂).',
    [['d', "Effect size (Cohen's d)", 'n', 0.5], ['n', 'Sample size (per group)', 'i', 64], ALPHA, ['pw', 'Target power', 'p', 80], ['t', 'Design', 'g', 2, [[1, 'One-sample / paired'], [2, 'Two independent groups']]]],
    function (v) { var d = Math.abs(v.d), a = v.alpha / 100; if (!(d > 0) || !(v.n >= 2) || !(a > 0 && a < 1)) return { error: 'Effect size and sample size must be positive; α between 0% and 100%.' }; var za = S.ninv(1 - a / 2), f = +v.t === 1 ? 1 : 2, del = d * Math.sqrt(v.n / f), pw = S.ncdf(del - za) + S.ncdf(-del - za), zb = S.ninv(v.pw / 100), need = Math.ceil(f * Math.pow((za + zb) / d, 2));
      return { results: [PP('Power', pw, 2, true), PP('Chance of a Type II error (β)', 1 - pw, 2), R('Sample size needed for ' + N(v.pw, 3) + '% power', need, 'int', { sub: +v.t === 1 ? 'in total' : 'per group' })] }; });
  var risk = function (id, title, desc, main) {
    C(id, title, T, desc, 'RR = [a ÷ (a + b)] ÷ [c ÷ (c + d)] · OR = (a × d) ÷ (b × c).',
      [['a', 'Exposed — event occurred (a)', 'i', 30], ['b', 'Exposed — no event (b)', 'i', 70], ['c', 'Not exposed — event occurred (c)', 'i', 15], ['dd', 'Not exposed — no event (d)', 'i', 85], LEVEL],
      function (v) { var a = v.a, b = v.b, c = v.c, d = v.dd, z = zc(v.lv), cor = false; if ([a, b, c, d].some(function (x) { return x < 0; }) || a + b < 1 || c + d < 1) return { error: 'Counts cannot be negative and each group needs at least one person.' }; if ([a, b, c, d].some(function (x) { return x === 0; })) { a += .5; b += .5; c += .5; d += .5; cor = true; }
        var r1 = a / (a + b), r0 = c / (c + d), rr = r1 / r0, or = a * d / (b * c), seR = Math.sqrt(1 / a - 1 / (a + b) + 1 / c - 1 / (c + d)), seO = Math.sqrt(1 / a + 1 / b + 1 / c + 1 / d), rd = r1 - r0;
        var rrR = R('Relative risk (RR)', rr, 'num', { dp: 4, sub: N(Math.exp(Math.log(rr) - z * seR), 3) + ' – ' + N(Math.exp(Math.log(rr) + z * seR), 3) }), orR = R('Odds ratio (OR)', or, 'num', { dp: 4, sub: N(Math.exp(Math.log(or) - z * seO), 3) + ' – ' + N(Math.exp(Math.log(or) + z * seO), 3) });
        if (main === 'or') orR.main = true; else rrR.main = true;
        return { results: (main === 'or' ? [orR, rrR] : [rrR, orR]).concat([PP('Risk if exposed', r1, 2), PP('Risk if not exposed', r0, 2), PP('Risk difference', rd, 2), rd ? P('NNT / NNH', Math.abs(1 / rd), 1) : R('NNT / NNH', '—', 'text')]), note: cor ? 'A zero cell was found, so 0.5 was added to every cell (Haldane correction).' : undefined }; });
  };
  risk('relative-risk-calculator', 'Relative Risk Calculator', 'Relative risk, odds ratio and risk difference from a 2×2 table.', 'rr');
  risk('odds-ratio-calculator', 'Odds Ratio Calculator', 'Odds ratio with confidence interval from a 2×2 table.', 'or');
  C('diagnostic-test-calculator', 'Sensitivity, Specificity & Predictive Value Calculator', T, 'Predictive values and likelihood ratios of a diagnostic test.', 'PPV = sens × prev ÷ (sens × prev + (1 − spec)(1 − prev)).',
    [['se', 'Sensitivity', 'p', 90], ['sp', 'Specificity', 'p', 95], ['pr', 'Prevalence', 'p', 2]],
    function (v) { var se = v.se / 100, sp = v.sp / 100, pr = v.pr / 100; if ([se, sp, pr].some(function (x) { return x < 0 || x > 1; })) return { error: 'All values must be between 0% and 100%.' }; var tp = se * pr, fp = (1 - sp) * (1 - pr), fn = (1 - se) * pr, tn = sp * (1 - pr);
      return { results: [PP('Positive predictive value (PPV)', tp / (tp + fp), 2, true), PP('Negative predictive value (NPV)', tn / (tn + fn), 3), PP('Accuracy', tp + tn, 2), P('Positive likelihood ratio', se / (1 - sp), 3), P('Negative likelihood ratio', (1 - se) / sp, 4), R('Per 10,000 people tested', Math.round(tp * 1e4) + ' true +, ' + Math.round(fp * 1e4) + ' false +, ' + Math.round(fn * 1e4) + ' false −', 'text')],
        chart: { type: 'donut', data: [{ l: 'True positive', v: tp }, { l: 'False positive', v: fp }, { l: 'False negative', v: fn }, { l: 'True negative', v: tn }], f: 'num' } }; });
  C('fisher-exact-test-calculator', "Fisher's Exact Test Calculator", T, 'Exact p-value for a 2×2 table with small counts.', 'Hypergeometric probability summed over tables as extreme as the one observed.',
    [['a', 'a (row 1, col 1)', 'i', 8], ['b', 'b (row 1, col 2)', 'i', 2], ['c', 'c (row 2, col 1)', 'i', 1], ['dd', 'd (row 2, col 2)', 'i', 5], ALPHA],
    function (v) { var a = Math.round(v.a), b = Math.round(v.b), c = Math.round(v.c), d = Math.round(v.dd); if ([a, b, c, d].some(function (x) { return x < 0; }) || a + b + c + d < 1 || a + b + c + d > 5000) return { error: 'Use non-negative counts (total up to 5000).' }; var n = a + b + c + d, n1 = a + b, m1 = a + c, po = S.hyppmf(a, n, n1, m1), pt = 0, pl = 0, pr = 0;
      for (var k = Math.max(0, m1 - (n - n1)); k <= Math.min(n1, m1); k++) { var pk = S.hyppmf(k, n, n1, m1); if (pk <= po * (1 + 1e-7)) pt += pk; if (k <= a) pl += pk; if (k >= a) pr += pk; }
      return { results: [P('P-value (two-sided)', Math.min(1, pt), 6, true), P('P-value (left)', Math.min(1, pl), 6), P('P-value (right)', Math.min(1, pr), 6), P('Odds ratio', (a * d) / (b * c || Infinity), 4), R('Decision', decide(pt, v.alpha / 100), 'text')] }; });
  C('bonferroni-correction-calculator', 'Bonferroni Correction Calculator', T, 'Adjust the significance level for multiple comparisons.', 'Adjusted α = α ÷ m.',
    [['alpha', 'Overall significance level (α)', 'p', 5], ['k', 'Number of tests (m)', 'i', 10]],
    function (v) { var a = v.alpha / 100, m = Math.round(v.k); if (!(a > 0 && a < 1) || m < 1) return { error: 'α must be between 0% and 100% and m ≥ 1.' };
      return { results: [PP('Bonferroni-adjusted α', a / m, 5, true), PP('Šidák-adjusted α', 1 - Math.pow(1 - a, 1 / m), 5), PP('Chance of ≥ 1 false positive without correction', 1 - Math.pow(1 - a, m), 2)] }; });
  C('pooled-standard-deviation-calculator', 'Pooled Standard Deviation Calculator', T, 'Combine the standard deviations of several groups.', 'sp = √[Σ (nᵢ − 1) sᵢ² ÷ Σ (nᵢ − 1)].',
    [['d', 'Standard deviation and size of each group (one per line)', 'ta', '8.1 40\n9.3 35\n7.5 28', { rows: 4 }]],
    function (v) { var r = S.rows(v.d).filter(function (x) { return x.length >= 2 && x[1] > 1; }); if (r.length < 2) return { error: 'Enter at least 2 groups as "standard-deviation size".' }; var num = 0, den = 0; r.forEach(function (x) { num += (x[1] - 1) * x[0] * x[0]; den += x[1] - 1; });
      return { results: [P('Pooled standard deviation', Math.sqrt(num / den), 5, true), P('Pooled variance', num / den, 5), P('Total sample size', S.sum(r.map(function (x) { return x[1]; })), 0), P('Groups', r.length, 0)] }; });
})(window.CW);
