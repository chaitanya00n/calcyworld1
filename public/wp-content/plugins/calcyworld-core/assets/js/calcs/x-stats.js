/* Calcyworld — statistics core: special functions, descriptive statistics, probability */
(function (CW) {
  'use strict';
  var C = CW.C, F = CW.F, M = CW.M, R = CW.Rr, L = CW.list;
  var N = function (x, d) { return CW.fmt.num(x, d === undefined ? 6 : d); };

  /* ======================= special functions (exposed as CW.stat) ======================= */
  var S = CW.stat = {};
  var LG = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  S.lgamma = function (z) {
    if (z < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * z))) - S.lgamma(1 - z);
    z -= 1; var x = LG[0]; for (var i = 1; i < 9; i++) x += LG[i] / (z + i);
    var t = z + 7.5; return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  };
  S.lfact = function (n) { return S.lgamma(n + 1); };
  S.lcomb = function (n, k) { return S.lfact(n) - S.lfact(k) - S.lfact(n - k); };
  S.comb = function (n, k) { if (k < 0 || k > n) return 0; var v = Math.exp(S.lcomb(n, k)); return v < 1e15 ? Math.round(v) : v; };
  function gammaQcf(a, x) {
    var b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
    for (var i = 1; i < 500; i++) {
      var an = -i * (i - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
      c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; var del = d * c; h *= del; if (Math.abs(del - 1) < 1e-15) break;
    }
    return Math.exp(-x + a * Math.log(x) - S.lgamma(a)) * h;
  }
  S.gammaP = function (a, x) {
    if (x <= 0) return 0;
    if (x < a + 1) { var ap = a, sum = 1 / a, del = sum; for (var n = 0; n < 1000; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * 1e-16) break; } return sum * Math.exp(-x + a * Math.log(x) - S.lgamma(a)); }
    return 1 - gammaQcf(a, x);
  };
  S.gammaQ = function (a, x) { if (x <= 0) return 1; return x < a + 1 ? 1 - S.gammaP(a, x) : gammaQcf(a, x); };
  function betacf(a, b, x) {
    var qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap; if (Math.abs(d) < 1e-300) d = 1e-300; d = 1 / d; var h = d;
    for (var m = 1; m <= 500; m++) {
      var m2 = 2 * m, aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < 1e-300) d = 1e-300; c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d;
      var del = d * c; h *= del; if (Math.abs(del - 1) < 1e-15) break;
    }
    return h;
  }
  S.betai = function (x, a, b) {
    if (x <= 0) return 0; if (x >= 1) return 1;
    var bt = Math.exp(S.lgamma(a + b) - S.lgamma(a) - S.lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  };
  /* Normal */
  S.ncdf = function (z) { if (z === 0) return 0.5; var p = 0.5 * S.gammaQ(0.5, z * z / 2); return z > 0 ? 1 - p : p; };
  S.nsf = function (z) { return S.ncdf(-z); };
  S.npdf = function (z) { return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI); };
  S.ninv = function (p) {
    if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
    var a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00],
      b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01],
      c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00],
      d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00], q, r, x;
    if (p < 0.02425) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    else if (p <= 1 - 0.02425) { q = p - 0.5; r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    else { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    var e = S.ncdf(x) - p, u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2); return x - u / (1 + x * u / 2);
  };
  S.bisect = function (f, p, lo, hi) { for (var i = 0; i < 300; i++) { var mid = (lo + hi) / 2; if (f(mid) < p) lo = mid; else hi = mid; if (hi - lo < 1e-13 * Math.max(1, Math.abs(mid))) break; } return (lo + hi) / 2; };
  /* Student t */
  S.tcdf = function (t, df) { var p = 0.5 * S.betai(df / (df + t * t), df / 2, 0.5); return t > 0 ? 1 - p : p; };
  S.t2p = function (t, df) { return S.betai(df / (df + t * t), df / 2, 0.5); };
  S.tpdf = function (t, df) { return Math.exp(S.lgamma((df + 1) / 2) - S.lgamma(df / 2)) / Math.sqrt(df * Math.PI) * Math.pow(1 + t * t / df, -(df + 1) / 2); };
  S.tinv = function (p, df) { if (p === 0.5) return 0; if (p < 0.5) return -S.tinv(1 - p, df); return S.bisect(function (t) { return S.tcdf(t, df); }, p, 0, 1e9); };
  /* Chi-square */
  S.chicdf = function (x, df) { return S.gammaP(df / 2, x / 2); };
  S.chisf = function (x, df) { return S.gammaQ(df / 2, x / 2); };
  S.chipdf = function (x, df) { return x <= 0 ? 0 : Math.exp((df / 2 - 1) * Math.log(x) - x / 2 - (df / 2) * Math.LN2 - S.lgamma(df / 2)); };
  S.chiinv = function (p, df) { return S.bisect(function (x) { return S.chicdf(x, df); }, p, 0, df + 200 * Math.sqrt(2 * df) + 1000); };
  /* F */
  S.fcdf = function (x, d1, d2) { return x <= 0 ? 0 : S.betai(d1 * x / (d1 * x + d2), d1 / 2, d2 / 2); };
  S.fsf = function (x, d1, d2) { return x <= 0 ? 1 : S.betai(d2 / (d2 + d1 * x), d2 / 2, d1 / 2); };
  S.finv = function (p, d1, d2) { return S.bisect(function (x) { return S.fcdf(x, d1, d2); }, p, 0, 1e7); };
  /* Discrete */
  S.binpmf = function (k, n, p) { if (k < 0 || k > n || k !== Math.floor(k)) return 0; if (p <= 0) return k === 0 ? 1 : 0; if (p >= 1) return k === n ? 1 : 0; return Math.exp(S.lcomb(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p)); };
  S.bincdf = function (k, n, p) { var s = 0; for (var i = 0; i <= Math.min(k, n); i++) s += S.binpmf(i, n, p); return Math.min(1, s); };
  S.poipmf = function (k, l) { if (k < 0 || k !== Math.floor(k)) return 0; if (l === 0) return k === 0 ? 1 : 0; return Math.exp(-l + k * Math.log(l) - S.lfact(k)); };
  S.poicdf = function (k, l) { var s = 0; for (var i = 0; i <= k; i++) s += S.poipmf(i, l); return Math.min(1, s); };
  S.hyppmf = function (k, Nn, K, n) { if (k < Math.max(0, n - (Nn - K)) || k > Math.min(K, n)) return 0; return Math.exp(S.lcomb(K, k) + S.lcomb(Nn - K, n - k) - S.lcomb(Nn, n)); };

  /* ======================= descriptive helpers ======================= */
  S.sorted = function (a) { return a.slice().sort(function (x, y) { return x - y; }); };
  S.sum = function (a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; };
  S.mean = function (a) { return S.sum(a) / a.length; };
  S.ss = function (a) { var m = S.mean(a), s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m); return s; };
  S.varS = function (a) { return S.ss(a) / (a.length - 1); };
  S.varP = function (a) { return S.ss(a) / a.length; };
  S.median = function (s) { var n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
  S.pct = function (s, p) { var h = (s.length - 1) * p, lo = Math.floor(h), hi = Math.min(lo + 1, s.length - 1); return s[lo] + (h - lo) * (s[hi] - s[lo]); };
  S.quartiles = function (s, m) {
    var n = s.length;
    if (+m === 2) return [S.pct(s, 0.25), S.median(s), S.pct(s, 0.75)];
    var half = Math.floor(n / 2); return [S.median(s.slice(0, half)), S.median(s), S.median(s.slice(n % 2 ? half + 1 : half))];
  };
  S.modes = function (a) {
    var cnt = {}, best = 0, key;
    a.forEach(function (x) { key = String(x); cnt[key] = (cnt[key] || 0) + 1; if (cnt[key] > best) best = cnt[key]; });
    return { freq: best, list: best < 2 ? [] : Object.keys(cnt).filter(function (k) { return cnt[k] === best; }).map(Number).sort(function (x, y) { return x - y; }), cnt: cnt };
  };
  S.hist = function (a, title) {
    var s = S.sorted(a), n = s.length, mn = s[0], mx = s[n - 1]; if (n < 3 || mn === mx) return null;
    var k = Math.min(12, Math.max(4, Math.ceil(Math.log(n) / Math.LN2 + 1))), w = (mx - mn) / k, bins = [], i;
    for (i = 0; i < k; i++) bins.push(0);
    s.forEach(function (x) { var b = Math.min(k - 1, Math.floor((x - mn) / w)); bins[b]++; });
    return { type: 'bar', title: title || 'Histogram', labels: bins.map(function (c, j) { return N(mn + j * w, 2); }), series: [{ l: 'Count', pts: bins }], f: 'int' };
  };
  S.curve = function (pdf, lo, hi, n, inside) {
    var labels = [], d = [], r = [];
    for (var i = 0; i <= n; i++) { var x = lo + (hi - lo) * i / n, y = pdf(x); labels.push(N(x, 2)); d.push(y); r.push(inside && inside(x) ? y : 0); }
    var out = { type: 'line', labels: labels, series: [{ l: 'Density', pts: d }], f: 'num' };
    if (inside) out.series.push({ l: 'Selected area', pts: r });
    return out;
  };
  S.bars = function (labels, pts, name, f, title) { return { type: 'bar', title: title, labels: labels, series: [{ l: name, pts: pts }], f: f || 'num' }; };
  S.rows = function (txt) { return String(txt == null ? '' : txt).trim().split(/\n|;/).map(L).filter(function (r) { return r.length > 0; }); };
  var DATA = function (label, def, extra) { return ['d', label || 'Numbers (separate with commas, spaces or new lines)', 'ta', def || '12, 15, 11, 18, 20, 14, 16, 15, 22, 13', extra || { rows: 4 }]; };
  var NEED = function (n) { return { error: 'Enter at least ' + n + ' number' + (n > 1 ? 's' : '') + '.' }; };
  var G = 'statistics/descriptive';
  var Q = [['m', 'Quartile method', 'g', 1, [[1, 'Exclusive (median of halves)'], [2, 'Inclusive (Excel)']]]];

  /* ======================= DESCRIPTIVE ======================= */
  C('mean-median-mode-calculator', 'Mean, Median, Mode & Range Calculator', G, 'Average, middle value, most frequent value and spread of a data set.', 'Mean = Σx ÷ n · Median = middle value · Mode = most frequent value.',
    [DATA()],
    function (v) {
      var d = L(v.d); if (d.length < 1) return NEED(1);
      var s = S.sorted(d), md = S.modes(d), n = d.length;
      return { results: [M('Mean', S.mean(d), 'num', { dp: 6 }), R('Median', S.median(s), 'num', { dp: 6 }), R('Mode', md.list.length ? md.list.map(function (x) { return N(x, 6); }).join(', ') : 'No mode', 'text', { sub: md.list.length ? 'appears ' + md.freq + ' times' : '' }),
        R('Range', s[n - 1] - s[0], 'num', { dp: 6 }), R('Count', n, 'int'), R('Sum', S.sum(d), 'num', { dp: 6 }), R('Minimum', s[0], 'num', { dp: 6 }), R('Maximum', s[n - 1], 'num', { dp: 6 }), R('Midrange', (s[0] + s[n - 1]) / 2, 'num', { dp: 6 })], chart: S.hist(d, 'Distribution of your data') || undefined };
    }, { pop: 1 });
  C('median-calculator', 'Median Calculator', G, 'The middle value of a list of numbers.', 'Sort the data; the median is the middle value (or the mean of the two middle values).',
    [DATA()],
    function (v) { var d = L(v.d); if (d.length < 1) return NEED(1); var s = S.sorted(d), n = s.length, h = Math.floor(n / 2);
      return { results: [M('Median', S.median(s), 'num', { dp: 6 }), R('Count', n, 'int'), R('Position', n % 2 ? 'Value ' + ((n + 1) / 2) : 'Between values ' + h + ' and ' + (h + 1), 'text'), R('Sorted list', s.map(function (x) { return N(x, 4); }).join(', '), 'text')] }; });
  C('mode-calculator', 'Mode Calculator', G, 'The most frequently occurring value(s) in a data set.', 'Mode = the value that appears most often.',
    [DATA('Numbers (separate with commas, spaces or new lines)', '4, 7, 4, 9, 2, 7, 4, 7, 1')],
    function (v) { var d = L(v.d); if (d.length < 1) return NEED(1); var md = S.modes(d), keys = Object.keys(md.cnt).map(Number).sort(function (a, b) { return a - b; });
      return { results: [M('Mode', md.list.length ? md.list.map(function (x) { return N(x, 6); }).join(', ') : 'No mode (all values are unique)', 'text'), R('Highest frequency', md.freq, 'int'), R('Distinct values', keys.length, 'int'), R('Count', d.length, 'int')],
        table: { head: ['Value', 'Frequency', 'Share'], rows: keys.map(function (k) { return [k, md.cnt[String(k)], md.cnt[String(k)] / d.length * 100]; }), fmt: ['num', 'int', 'pct'], title: 'Frequency table' },
        chart: S.bars(keys.map(function (k) { return N(k, 3); }), keys.map(function (k) { return md.cnt[String(k)]; }), 'Frequency', 'int', 'Frequency of each value') }; });
  C('range-calculator', 'Range Calculator', G, 'Range, midrange and interquartile range of a data set.', 'Range = maximum − minimum.',
    [DATA()],
    function (v) { var d = L(v.d); if (d.length < 2) return NEED(2); var s = S.sorted(d), q = S.quartiles(s, 2), n = s.length;
      return { results: [M('Range', s[n - 1] - s[0], 'num', { dp: 6 }), R('Minimum', s[0], 'num', { dp: 6 }), R('Maximum', s[n - 1], 'num', { dp: 6 }), R('Midrange', (s[0] + s[n - 1]) / 2, 'num', { dp: 6 }), R('Interquartile range', q[2] - q[0], 'num', { dp: 6 })] }; });
  var five = function (id, title, desc) {
    C(id, title, G, desc, 'IQR = Q3 − Q1 · Outliers lie below Q1 − 1.5×IQR or above Q3 + 1.5×IQR.',
      [DATA(null, '3, 7, 8, 5, 12, 14, 21, 13, 18, 41')].concat(Q),
      function (v) { var d = L(v.d); if (d.length < 4) return NEED(4); var s = S.sorted(d), q = S.quartiles(s, v.m), iqr = q[2] - q[0], lo = q[0] - 1.5 * iqr, hi = q[2] + 1.5 * iqr;
        var out = s.filter(function (x) { return x < lo || x > hi; });
        return { results: [M('Median (Q2)', q[1], 'num', { dp: 6 }), R('Q1', q[0], 'num', { dp: 6 }), R('Q3', q[2], 'num', { dp: 6 }), R('IQR', iqr, 'num', { dp: 6 }), R('Minimum', s[0], 'num', { dp: 6 }), R('Maximum', s[s.length - 1], 'num', { dp: 6 }),
          R('Lower fence', lo, 'num', { dp: 6 }), R('Upper fence', hi, 'num', { dp: 6 }), R('Outliers', out.length ? out.map(function (x) { return N(x, 4); }).join(', ') : 'None', 'text')], chart: S.hist(d, 'Distribution of your data') || undefined }; });
  };
  five('five-number-summary-calculator', 'Five-Number Summary & Box Plot Calculator', 'Minimum, Q1, median, Q3 and maximum with outlier fences.');
  five('quartile-calculator', 'Quartile Calculator', 'First, second and third quartiles of a data set.');
  five('outlier-calculator', 'Outlier Calculator (IQR Method)', 'Find outliers in a data set with the 1.5 × IQR rule.');
  C('percentile-calculator', 'Percentile Calculator', G, 'The percentile rank of a value, or the value at a given percentile.', 'Percentile rank = share of values below the score.',
    [DATA(null, '55, 62, 67, 70, 72, 75, 78, 81, 85, 90, 94'), ['x', 'Score to rank', 'n', 78], ['p', 'Percentile to find', 'n', 90, '%']],
    function (v) { var d = L(v.d); if (d.length < 2) return NEED(2); var s = S.sorted(d), below = s.filter(function (y) { return y < v.x; }).length, eq = s.filter(function (y) { return y === v.x; }).length;
      return { results: [M('Percentile rank of ' + N(v.x, 4), (below + 0.5 * eq) / s.length * 100, 'pct', { dp: 2 }), R(N(v.p, 2) + 'th percentile value', S.pct(s, Math.max(0, Math.min(100, v.p)) / 100), 'num', { dp: 6 }), R('Values below the score', below, 'int'), R('Count', s.length, 'int')] }; });
  C('weighted-mean-calculator', 'Weighted Mean Calculator', G, 'Weighted average of values, such as marks with credit weights.', 'Weighted mean = Σ(value × weight) ÷ Σ(weight).',
    [['d', 'Value and weight (one pair per line)', 'ta', '85 3\n90 4\n72 2\n95 5', { rows: 5 }]],
    function (v) { var r = S.rows(v.d).filter(function (x) { return x.length >= 2; }); if (!r.length) return NEED(1); var sw = 0, sx = 0; r.forEach(function (x) { sw += x[1]; sx += x[0] * x[1]; }); if (!sw) return { error: 'The weights cannot add up to zero.' };
      return { results: [M('Weighted mean', sx / sw, 'num', { dp: 6 }), R('Simple mean', S.mean(r.map(function (x) { return x[0]; })), 'num', { dp: 6 }), R('Total weight', sw, 'num', { dp: 6 }), R('Pairs', r.length, 'int')],
        table: { head: ['Value', 'Weight', 'Weighted'], rows: r.map(function (x) { return [x[0], x[1], x[0] * x[1]]; }), fmt: ['num', 'num', 'num'], title: 'Working' } }; });
  C('geometric-mean-calculator', 'Geometric Mean Calculator', G, 'The geometric mean of positive numbers.', 'GM = (x₁ × x₂ × … × xₙ)^(1/n).',
    [DATA(null, '4, 9, 16, 2')],
    function (v) { var d = L(v.d); if (d.length < 2) return NEED(2); if (d.some(function (x) { return x <= 0; })) return { error: 'All numbers must be positive.' };
      return { results: [M('Geometric mean', Math.exp(S.mean(d.map(Math.log))), 'num', { dp: 6 }), R('Arithmetic mean', S.mean(d), 'num', { dp: 6 }), R('Harmonic mean', d.length / S.sum(d.map(function (x) { return 1 / x; })), 'num', { dp: 6 })] }; });
  C('harmonic-mean-calculator', 'Harmonic Mean Calculator', G, 'The harmonic mean of positive numbers (average of rates).', 'HM = n ÷ Σ(1 ÷ x).',
    [DATA(null, '40, 60, 50')],
    function (v) { var d = L(v.d); if (d.length < 2) return NEED(2); if (d.some(function (x) { return x <= 0; })) return { error: 'All numbers must be positive.' };
      return { results: [M('Harmonic mean', d.length / S.sum(d.map(function (x) { return 1 / x; })), 'num', { dp: 6 }), R('Arithmetic mean', S.mean(d), 'num', { dp: 6 }), R('Geometric mean', Math.exp(S.mean(d.map(Math.log))), 'num', { dp: 6 })] }; });
  C('root-mean-square-calculator', 'Root Mean Square (RMS) Calculator', G, 'Quadratic mean of a list of numbers.', 'RMS = √(Σx² ÷ n).',
    [DATA(null, '3, 4, 5, 12')],
    function (v) { var d = L(v.d); if (d.length < 1) return NEED(1); return { results: [M('RMS', Math.sqrt(S.mean(d.map(function (x) { return x * x; }))), 'num', { dp: 6 }), R('Mean', S.mean(d), 'num', { dp: 6 }), R('Sum of squares', S.sum(d.map(function (x) { return x * x; })), 'num', { dp: 6 })] }; });
  C('coefficient-of-variation-calculator', 'Coefficient of Variation Calculator', G, 'Relative spread of a data set as a percentage of its mean.', 'CV = standard deviation ÷ mean × 100.',
    [DATA(), ['m', 'Data is a', 'g', 1, [[1, 'Sample'], [2, 'Population']]]],
    function (v) { var d = L(v.d); if (d.length < 2) return NEED(2); var m = S.mean(d), sd = Math.sqrt(+v.m === 1 ? S.varS(d) : S.varP(d)); if (!m) return { error: 'The mean is zero, so the CV is undefined.' };
      return { results: [M('Coefficient of variation', Math.abs(sd / m) * 100, 'pct', { dp: 3 }), R('Standard deviation', sd, 'num', { dp: 6 }), R('Mean', m, 'num', { dp: 6 })] }; });
  C('mean-absolute-deviation-calculator', 'Mean Absolute Deviation Calculator', G, 'Average distance of the values from the mean (and the median).', 'MAD = Σ|x − mean| ÷ n.',
    [DATA()],
    function (v) { var d = L(v.d); if (d.length < 2) return NEED(2); var m = S.mean(d), md = S.median(S.sorted(d));
      return { results: [M('Mean absolute deviation', S.mean(d.map(function (x) { return Math.abs(x - m); })), 'num', { dp: 6 }), R('Median absolute deviation', S.median(S.sorted(d.map(function (x) { return Math.abs(x - md); }))), 'num', { dp: 6 }), R('Mean', m, 'num', { dp: 6 }), R('Median', md, 'num', { dp: 6 })] }; });
  C('standard-error-calculator', 'Standard Error Calculator', G, 'Standard error of the mean from raw data or summary values.', 'SE = s ÷ √n.',
    [['m', 'Input', 'g', 1, [[1, 'Raw data'], [2, 'Summary']]], ['d', 'Numbers', 'ta', '12, 15, 11, 18, 20, 14, 16, 15, 22, 13', { rows: 3, show: 'm==1' }], ['s', 'Standard deviation (s)', 'n', 4, '', { show: 'm==2' }], ['n', 'Sample size (n)', 'i', 25, '', { show: 'm==2' }]],
    function (v) { var sd, n; if (+v.m === 1) { var d = L(v.d); if (d.length < 2) return NEED(2); sd = Math.sqrt(S.varS(d)); n = d.length; } else { sd = v.s; n = v.n; } if (!(n > 0)) return { error: 'Sample size must be positive.' };
      return { results: [M('Standard error', sd / Math.sqrt(n), 'num', { dp: 6 }), R('Standard deviation', sd, 'num', { dp: 6 }), R('Sample size', n, 'int')] }; });
  C('skewness-kurtosis-calculator', 'Skewness & Kurtosis Calculator', G, 'Shape of a distribution: skewness and excess kurtosis.', 'Skewness = m₃ ÷ m₂^1.5 · Excess kurtosis = m₄ ÷ m₂² − 3.',
    [DATA(null, '2, 3, 3, 4, 4, 4, 5, 5, 6, 9, 14')],
    function (v) { var d = L(v.d), n = d.length; if (n < 4) return NEED(4); var m = S.mean(d), m2 = 0, m3 = 0, m4 = 0; d.forEach(function (x) { var e = x - m; m2 += e * e; m3 += e * e * e; m4 += e * e * e * e; }); m2 /= n; m3 /= n; m4 /= n;
      if (!m2) return { error: 'All values are equal, so skewness is undefined.' };
      var g1 = m3 / Math.pow(m2, 1.5), g2 = m4 / (m2 * m2) - 3, G1 = Math.sqrt(n * (n - 1)) / (n - 2) * g1, G2 = (n - 1) / ((n - 2) * (n - 3)) * ((n + 1) * g2 + 6);
      return { results: [M('Skewness (sample)', G1, 'num', { dp: 4 }), R('Excess kurtosis (sample)', G2, 'num', { dp: 4 }), R('Skewness (population)', g1, 'num', { dp: 4 }), R('Excess kurtosis (population)', g2, 'num', { dp: 4 }), R('Shape', Math.abs(G1) < 0.5 ? 'Roughly symmetric' : G1 > 0 ? 'Right-skewed (long right tail)' : 'Left-skewed (long left tail)', 'text')], chart: S.hist(d, 'Distribution of your data') || undefined }; });
  C('sum-of-squares-calculator', 'Sum of Squares Calculator', G, 'Sum of squares, sum of squared deviations and related totals.', 'SS = Σ(x − mean)².',
    [DATA()],
    function (v) { var d = L(v.d); if (d.length < 1) return NEED(1); return { results: [M('Sum of squared deviations (SS)', S.ss(d), 'num', { dp: 6 }), R('Sum of squares (Σx²)', S.sum(d.map(function (x) { return x * x; })), 'num', { dp: 6 }), R('Sum (Σx)', S.sum(d), 'num', { dp: 6 }), R('Count', d.length, 'int')] }; });
  C('frequency-distribution-calculator', 'Frequency Distribution Calculator', G, 'Frequency, relative and cumulative frequency of each value.', 'Relative frequency = count ÷ total.',
    [DATA(null, '3, 5, 3, 2, 5, 5, 4, 3, 2, 5, 1, 4')],
    function (v) { var d = L(v.d); if (d.length < 1) return NEED(1); var md = S.modes(d), keys = Object.keys(md.cnt).map(Number).sort(function (a, b) { return a - b; }), cum = 0;
      var rows = keys.map(function (k) { var f = md.cnt[String(k)]; cum += f; return [k, f, f / d.length * 100, cum, cum / d.length * 100]; });
      return { results: [M('Distinct values', keys.length, 'int'), R('Total count', d.length, 'int'), R('Most frequent', keys.filter(function (k) { return md.cnt[String(k)] === md.freq; }).map(function (x) { return N(x, 4); }).join(', '), 'text')],
        table: { head: ['Value', 'Frequency', 'Relative %', 'Cumulative', 'Cumulative %'], rows: rows, fmt: ['num', 'int', 'pct', 'int', 'pct'], title: 'Frequency table' }, chart: S.bars(keys.map(function (k) { return N(k, 3); }), keys.map(function (k) { return md.cnt[String(k)]; }), 'Frequency', 'int', 'Frequency of each value') }; });
  C('grouped-data-calculator', 'Grouped Data Mean, Median & Mode Calculator', G, 'Statistics from a frequency table of class intervals.', 'Mean = Σ(f × midpoint) ÷ Σf.',
    [['d', 'Class lower, upper, frequency (one class per line)', 'ta', '0 10 4\n10 20 9\n20 30 15\n30 40 8\n40 50 4', { rows: 6 }]],
    function (v) { var r = S.rows(v.d).filter(function (x) { return x.length >= 3 && x[1] > x[0]; }); if (r.length < 2) return { error: 'Enter at least two classes as "lower upper frequency".' };
      var n = 0, sx = 0, cum = 0, mi = 0, mx = 0; r.forEach(function (x, i) { n += x[2]; sx += x[2] * (x[0] + x[1]) / 2; if (x[2] > mx) { mx = x[2]; mi = i; } }); if (!n) return { error: 'Frequencies cannot all be zero.' };
      var mean = sx / n, ss = 0; r.forEach(function (x) { var mid = (x[0] + x[1]) / 2; ss += x[2] * (mid - mean) * (mid - mean); });
      var med = NaN; for (var i = 0; i < r.length; i++) { if (cum + r[i][2] >= n / 2) { med = r[i][0] + (n / 2 - cum) / r[i][2] * (r[i][1] - r[i][0]); break; } cum += r[i][2]; }
      var f1 = r[mi][2], f0 = mi ? r[mi - 1][2] : 0, f2 = mi < r.length - 1 ? r[mi + 1][2] : 0, den = 2 * f1 - f0 - f2, mode = den ? r[mi][0] + (f1 - f0) / den * (r[mi][1] - r[mi][0]) : (r[mi][0] + r[mi][1]) / 2;
      return { results: [M('Mean', mean, 'num', { dp: 4 }), R('Median', med, 'num', { dp: 4 }), R('Mode (estimate)', mode, 'num', { dp: 4 }), R('Standard deviation (sample)', Math.sqrt(ss / (n - 1)), 'num', { dp: 4 }), R('Total frequency', n, 'num', { dp: 0 })],
        chart: S.bars(r.map(function (x) { return x[0] + '–' + x[1]; }), r.map(function (x) { return x[2]; }), 'Frequency', 'num', 'Class frequencies') }; });
  C('moving-average-calculator', 'Moving Average Calculator (SMA, EMA, WMA)', G, 'Smooth a series with a simple, exponential or weighted moving average.', 'SMA = average of the last k values.',
    [DATA(null, '22, 24, 23, 27, 30, 29, 33, 35, 34, 38, 40, 39'), ['k', 'Period (k)', 'i', 3], ['t', 'Type', 's', 1, [[1, 'Simple (SMA)'], [2, 'Exponential (EMA)'], [3, 'Weighted (WMA)']]]],
    function (v) { var d = L(v.d), k = Math.round(v.k), n = d.length; if (n < 2) return NEED(2); if (!(k >= 1) || k > n) return { error: 'The period must be between 1 and the number of values.' }; var ma = [], t = +v.t, i, j;
      for (i = 0; i < n; i++) {
        if (t === 2) { var al = 2 / (k + 1); ma.push(i ? al * d[i] + (1 - al) * ma[i - 1] : d[0]); }
        else if (i < k - 1) ma.push(NaN);
        else if (t === 1) ma.push(S.mean(d.slice(i - k + 1, i + 1)));
        else { var ws = 0, tw = 0; for (j = 0; j < k; j++) { ws += d[i - k + 1 + j] * (j + 1); tw += j + 1; } ma.push(ws / tw); }
      }
      var last = ma[n - 1];
      return { results: [M('Latest moving average', last, 'num', { dp: 4 }), R('Latest value', d[n - 1], 'num', { dp: 4 }), R('Overall mean', S.mean(d), 'num', { dp: 4 }), R('Trend', last > ma[Math.max(0, n - 2)] ? 'Rising' : last < ma[Math.max(0, n - 2)] ? 'Falling' : 'Flat', 'text')],
        chart: { type: 'line', labels: d.map(function (x, q) { return String(q + 1); }), series: [{ l: 'Data', pts: d }, { l: 'Moving average', pts: ma.map(function (x, q) { return isNaN(x) ? d[q] : x; }) }], f: 'num' },
        table: { head: ['#', 'Value', 'Moving average'], rows: d.map(function (x, q) { return [q + 1, x, isNaN(ma[q]) ? '—' : ma[q]]; }), fmt: ['int', 'num', 'num'], title: 'Series' } }; });
  C('stem-and-leaf-plot-generator', 'Stem-and-Leaf Plot Generator', G, 'Build a stem-and-leaf display from a list of numbers.', 'Stem = leading digits · Leaf = last digit.',
    [DATA(null, '12, 15, 21, 23, 23, 28, 34, 36, 41, 45, 45, 47, 52, 58')],
    function (v) { var d = S.sorted(L(v.d).map(Math.round)); if (d.length < 2) return NEED(2); var st = {}; d.forEach(function (x) { var neg = x < 0, a = Math.abs(x), s = Math.floor(a / 10), key = (neg ? '-' : '') + s; (st[key] = st[key] || []).push(a % 10); });
      var keys = Object.keys(st).sort(function (a, b) { return a === b ? 0 : (+a || (a[0] === '-' ? -1 : 0)) - (+b || (b[0] === '-' ? -1 : 0)); });
      var html = '<pre class="cw-pre">' + keys.map(function (k) { return ('      ' + k).slice(-5) + ' | ' + st[k].join(' '); }).join('\n') + '</pre><p class="cw-note">Key: 2 | 3 means 23.</p>';
      return { results: [M('Count', d.length, 'int'), R('Stems', keys.length, 'int'), R('Median', S.median(d), 'num', { dp: 4 })], html: html }; });
  C('data-normalization-calculator', 'Z-Score & Min-Max Normalization Calculator', G, 'Standardise a data set to z-scores or scale it to 0–1.', 'z = (x − mean) ÷ s · scaled = (x − min) ÷ (max − min).',
    [DATA(null, '12, 15, 11, 18, 20, 14, 16')],
    function (v) { var d = L(v.d); if (d.length < 2) return NEED(2); var m = S.mean(d), sd = Math.sqrt(S.varS(d)), mn = Math.min.apply(null, d), mx = Math.max.apply(null, d); if (!sd) return { error: 'All values are equal.' };
      return { results: [M('Mean', m, 'num', { dp: 4 }), R('Standard deviation', sd, 'num', { dp: 4 }), R('Minimum', mn, 'num', { dp: 4 }), R('Maximum', mx, 'num', { dp: 4 })],
        table: { head: ['Value', 'Z-score', 'Min-max (0–1)'], rows: d.map(function (x) { return [x, (x - m) / sd, (x - mn) / (mx - mn)]; }), fmt: ['num', 'num', 'num'], title: 'Normalised values' } }; });

  /* ======================= PROBABILITY ======================= */
  var P = 'statistics/probability';
  C('probability-calculator', 'Probability Calculator (Two Events)', P, 'Chance of A and B, A or B, neither, and exactly one happening.', 'P(A and B) = P(A) × P(B) · P(A or B) = P(A) + P(B) − P(A and B).',
    [['a', 'P(A)', 'p', 40], ['b', 'P(B)', 'p', 30], ['m', 'The events are', 'g', 1, [[1, 'Independent'], [2, 'Mutually exclusive']]]],
    function (v) { var a = v.a / 100, b = v.b / 100; if (a < 0 || a > 1 || b < 0 || b > 1) return { error: 'Probabilities must be between 0% and 100%.' }; var both = +v.m === 1 ? a * b : 0;
      return { results: [M('A and B', both * 100, 'pct', { dp: 4 }), R('A or B', (a + b - both) * 100, 'pct', { dp: 4 }), R('Neither', (1 - a - b + both) * 100, 'pct', { dp: 4 }), R('Only A', (a - both) * 100, 'pct', { dp: 4 }), R('Only B', (b - both) * 100, 'pct', { dp: 4 }), R('Exactly one of A, B', (a + b - 2 * both) * 100, 'pct', { dp: 4 }), R('Not A', (1 - a) * 100, 'pct', { dp: 4 })],
        chart: { type: 'donut', data: [{ l: 'Only A', v: Math.max(0, a - both) }, { l: 'A and B', v: both }, { l: 'Only B', v: Math.max(0, b - both) }, { l: 'Neither', v: Math.max(0, 1 - a - b + both) }], f: 'num' } }; }, { pop: 1 });
  C('conditional-probability-calculator', 'Conditional Probability Calculator', P, 'P(A | B) from the joint and marginal probabilities.', 'P(A | B) = P(A and B) ÷ P(B).',
    [['ab', 'P(A and B)', 'p', 12], ['a', 'P(A)', 'p', 30], ['b', 'P(B)', 'p', 40]],
    function (v) { var ab = v.ab / 100, a = v.a / 100, b = v.b / 100; if (ab > Math.min(a, b) + 1e-12) return { error: 'P(A and B) cannot exceed P(A) or P(B).' }; if (!(a > 0) || !(b > 0)) return { error: 'P(A) and P(B) must be above 0.' };
      return { results: [M('P(A | B)', ab / b * 100, 'pct', { dp: 4 }), R('P(B | A)', ab / a * 100, 'pct', { dp: 4 }), R('P(A or B)', (a + b - ab) * 100, 'pct', { dp: 4 }), R('Independent?', Math.abs(ab - a * b) < 1e-9 ? 'Yes — P(A and B) = P(A) × P(B)' : 'No — the events are dependent', 'text')] }; });
  C('bayes-theorem-calculator', "Bayes' Theorem Calculator", P, 'Update a probability after new evidence (diagnostic tests, spam filters).', 'P(A | B) = P(B | A) × P(A) ÷ P(B).',
    [['pa', 'Prior P(A)', 'p', 1, '%'], ['sens', 'P(B | A) — true positive rate', 'p', 95], ['fpr', 'P(B | not A) — false positive rate', 'p', 5]],
    function (v) { var pa = v.pa / 100, s = v.sens / 100, f = v.fpr / 100, pb = s * pa + f * (1 - pa); if (!(pb > 0)) return { error: 'P(B) is zero for these inputs.' }; var post = s * pa / pb;
      return { results: [M('Posterior P(A | B)', post * 100, 'pct', { dp: 3 }), R('P(B) — chance of the evidence', pb * 100, 'pct', { dp: 3 }), R('P(not A | B)', (1 - post) * 100, 'pct', { dp: 3 }), R('Likelihood ratio', f ? s / f : Infinity, 'num', { dp: 3 }), R('Out of 10,000 people', Math.round(pa * 10000 * s) + ' true hits and ' + Math.round((1 - pa) * 10000 * f) + ' false alarms', 'text')],
        chart: { type: 'donut', data: [{ l: 'True positives', v: pa * s }, { l: 'False positives', v: (1 - pa) * f }], f: 'num' } }; }, { pop: 1 });
  C('expected-value-calculator', 'Expected Value Calculator', P, 'Expected value, variance and standard deviation of a discrete random variable.', 'E[X] = Σ x · P(x).',
    [['d', 'Value and probability (one pair per line)', 'ta', '0 0.5\n10 0.3\n50 0.15\n200 0.05', { rows: 5 }]],
    function (v) { var r = S.rows(v.d).filter(function (x) { return x.length >= 2; }); if (!r.length) return NEED(1); var tp = S.sum(r.map(function (x) { return x[1]; })); if (Math.abs(tp - 1) > 0.001 && tp > 0) { /* allow percentages or counts */ }
      if (!(tp > 0)) return { error: 'Probabilities must add up to a positive total.' }; var ev = S.sum(r.map(function (x) { return x[0] * x[1]; })) / tp, vr = S.sum(r.map(function (x) { return x[1] * (x[0] - ev) * (x[0] - ev); })) / tp;
      return { results: [M('Expected value E[X]', ev, 'num', { dp: 6 }), R('Variance', vr, 'num', { dp: 6 }), R('Standard deviation', Math.sqrt(vr), 'num', { dp: 6 }), R('Total probability', tp, 'num', { dp: 4 }), R('Note', Math.abs(tp - 1) > 0.001 ? 'Probabilities were scaled to add up to 1' : 'Probabilities add up to 1', 'text')],
        chart: S.bars(r.map(function (x) { return N(x[0], 3); }), r.map(function (x) { return x[1] / tp; }), 'Probability', 'num', 'Probability of each outcome') }; });
  C('odds-calculator', 'Odds ↔ Probability Calculator', P, 'Convert between probability, odds for/against, decimal and American odds.', 'Odds for = P ÷ (1 − P).',
    [['m', 'You know', 's', 1, [[1, 'Probability (%)'], [2, 'Odds in favour (a : b)'], [3, 'Decimal odds'], [4, 'American odds']]], ['x', 'Value (or a)', 'n', 25], ['y', 'b (odds only)', 'n', 3, '', { show: 'm==2' }]],
    function (v) { var p, m = +v.m;
      if (m === 1) p = v.x / 100; else if (m === 2) p = v.x / (v.x + v.y); else if (m === 3) p = 1 / v.x; else p = v.x < 0 ? -v.x / (-v.x + 100) : 100 / (v.x + 100);
      if (!(p > 0 && p < 1)) return { error: 'The probability must be between 0% and 100% (exclusive).' }; var dec = 1 / p, usa = p >= 0.5 ? -100 * p / (1 - p) : 100 * (1 - p) / p;
      return { results: [M('Probability', p * 100, 'pct', { dp: 4 }), R('Odds in favour', N(p / (1 - p), 4) + ' : 1', 'text'), R('Odds against', N((1 - p) / p, 4) + ' : 1', 'text'), R('Decimal odds', dec, 'num', { dp: 4 }), R('American odds', (usa > 0 ? '+' : '') + N(usa, 0), 'text'), R('Fractional odds', N((1 - p) / p, 3) + '/1', 'text')] }; });
  C('dice-probability-calculator', 'Dice Probability Calculator', P, 'Probability of rolling a target sum with any number of dice.', 'Counts all the ways the dice can add up to the target.',
    [['n', 'Number of dice', 'i', 2], ['s', 'Sides per die', 'i', 6], ['t', 'Target sum', 'i', 7]],
    function (v) { var n = Math.round(v.n), s = Math.round(v.s), t = Math.round(v.t); if (n < 1 || n > 30 || s < 2 || s > 100) return { error: 'Use 1–30 dice with 2–100 sides.' };
      var dist = [1]; for (var i = 0; i < n; i++) { var nx = []; for (var k = 0; k < dist.length + s - 1; k++) { var sum = 0; for (var f = 1; f <= s; f++) if (dist[k - f + 1] !== undefined) sum += dist[k - f + 1]; nx[k] = sum; } dist = nx; }
      var tot = Math.pow(s, n), labels = [], pr = [], eq = 0, le = 0, ge = 0; for (var q = 0; q < dist.length; q++) { var sm = q + n; labels.push(String(sm)); pr.push(dist[q] / tot); if (sm === t) eq = dist[q] / tot; if (sm <= t) le += dist[q] / tot; if (sm >= t) ge += dist[q] / tot; }
      return { results: [M('P(sum = ' + t + ')', eq * 100, 'pct', { dp: 4 }), R('P(sum ≤ ' + t + ')', Math.min(1, le) * 100, 'pct', { dp: 4 }), R('P(sum ≥ ' + t + ')', Math.min(1, ge) * 100, 'pct', { dp: 4 }), R('Expected sum', n * (s + 1) / 2, 'num', { dp: 3 }), R('Possible outcomes', tot, 'num', { dp: 0 })], chart: S.bars(labels, pr, 'Probability', 'pct', 'Chance of each total') }; });
  C('coin-flip-probability-calculator', 'Coin Flip Probability Calculator', P, 'Probability of getting a number of heads in repeated flips.', 'P(k heads) = C(n, k) × pᵏ × (1 − p)ⁿ⁻ᵏ.',
    [['n', 'Number of flips', 'i', 10], ['k', 'Number of heads', 'i', 6], ['p', 'Chance of heads', 'p', 50]],
    function (v) { var n = Math.round(v.n), k = Math.round(v.k), p = v.p / 100; if (n < 1 || n > 1000 || k < 0 || k > n) return { error: 'Heads must be between 0 and the number of flips (max 1000).' };
      var lab = [], pm = []; for (var i = 0; i <= Math.min(n, 60); i++) { lab.push(String(i)); pm.push(S.binpmf(i, n, p)); }
      return { results: [M('Exactly ' + k + ' heads', S.binpmf(k, n, p) * 100, 'pct', { dp: 4 }), R('At most ' + k, S.bincdf(k, n, p) * 100, 'pct', { dp: 4 }), R('At least ' + k, (1 - S.bincdf(k - 1, n, p)) * 100, 'pct', { dp: 4 }), R('Expected heads', n * p, 'num', { dp: 3 })], chart: S.bars(lab, pm, 'Probability', 'pct', 'Chance of each number of heads') }; });
  C('birthday-paradox-calculator', 'Birthday Paradox Calculator', P, 'Chance that two people in a group share a birthday.', 'P(match) = 1 − Π (1 − i ÷ days).',
    [['n', 'People in the group', 'i', 23], ['d', 'Days in the year', 'i', 365]],
    function (v) { var n = Math.round(v.n), d = Math.round(v.d); if (n < 2 || d < 2) return { error: 'Use at least 2 people and 2 days.' }; var pn = 1; for (var i = 0; i < n; i++) pn *= Math.max(0, (d - i) / d);
      var need = 0, q = 1; while (q > 0.5 && need < 100000) { q *= (d - need) / d; need++; }
      var lab = [], pm = [], pp = 1; for (var j = 1; j <= Math.min(80, Math.max(n, 40)); j++) { pp *= Math.max(0, (d - j + 1) / d); lab.push(String(j)); pm.push(1 - pp); }
      return { results: [M('Chance of a shared birthday', (1 - pn) * 100, 'pct', { dp: 3 }), R('Chance of none shared', pn * 100, 'pct', { dp: 3 }), R('People needed for 50%', need, 'int'), R('Pairs of people', n * (n - 1) / 2, 'num', { dp: 0 })], chart: S.bars(lab, pm, 'Probability', 'pct', 'Chance of a match by group size') }; });
  C('at-least-one-probability-calculator', 'Probability of At Least One Success Calculator', P, 'Chance of at least one success in repeated independent trials.', 'P(at least one) = 1 − (1 − p)ⁿ.',
    [['p', 'Chance per trial', 'p', 5], ['n', 'Number of trials', 'i', 20], ['t', 'Target confidence', 'p', 95]],
    function (v) { var p = v.p / 100, n = Math.round(v.n), t = v.t / 100; if (!(p > 0 && p < 1) || n < 1) return { error: 'The chance per trial must be between 0% and 100%.' }; var lab = [], pm = [];
      for (var i = 1; i <= Math.min(Math.max(n, 20), 80); i++) { lab.push(String(i)); pm.push(1 - Math.pow(1 - p, i)); }
      return { results: [M('At least one success', (1 - Math.pow(1 - p, n)) * 100, 'pct', { dp: 4 }), R('No success at all', Math.pow(1 - p, n) * 100, 'pct', { dp: 4 }), R('Expected successes', n * p, 'num', { dp: 3 }), R('Trials needed for ' + N(v.t, 2) + '%', t > 0 && t < 1 ? Math.ceil(Math.log(1 - t) / Math.log(1 - p)) : '—', t > 0 && t < 1 ? 'int' : 'text')], chart: S.bars(lab, pm, 'Probability', 'pct', 'Chance of at least one success') }; });
  C('lottery-odds-calculator', 'Lottery Odds Calculator', P, 'Chance of matching any number of balls in a lottery draw.', 'P(match m) = C(k, m) × C(N − k, k − m) ÷ C(N, k).',
    [['N', 'Total numbers in the pool', 'i', 49], ['k', 'Numbers drawn / picked', 'i', 6], ['m', 'Matches you want', 'i', 3]],
    function (v) { var Nn = Math.round(v.N), k = Math.round(v.k), m = Math.round(v.m); if (Nn < 2 || k < 1 || k > Nn || m < 0 || m > k) return { error: 'Check the pool size, picks and matches.' };
      var rows = [], tot = S.comb(Nn, k); for (var i = 0; i <= k; i++) { var pr = S.hyppmf(i, Nn, k, k); rows.push([i, pr * 100, pr > 0 ? '1 in ' + CW.fmt.num(1 / pr, 0) : '—']); }
      var pm = S.hyppmf(m, Nn, k, k), ge = 0; for (var j = m; j <= k; j++) ge += S.hyppmf(j, Nn, k, k);
      return { results: [M('Odds of exactly ' + m + ' matches', pm > 0 ? '1 in ' + CW.fmt.num(1 / pm, 0) : '—', 'text', { sub: N(pm * 100, 6) + '%' }), R('At least ' + m + ' matches', ge * 100, 'pct', { dp: 6 }), R('Jackpot odds', '1 in ' + CW.fmt.num(tot, 0), 'text'), R('Possible combinations', tot, 'num', { dp: 0 })],
        table: { head: ['Matches', 'Chance %', 'Odds'], rows: rows, fmt: ['int', 'pct', 'text'], title: 'All outcomes' } }; });
  C('card-draw-probability-calculator', 'Card Draw Probability Calculator', P, 'Chance of drawing specific cards (aces, hearts, outs) from a deck.', 'Hypergeometric probability — drawing without replacement.',
    [['Nn', 'Cards in the deck', 'i', 52], ['K', 'Wanted cards in the deck', 'i', 4], ['n', 'Cards drawn', 'i', 5], ['k', 'Wanted cards in your draw', 'i', 1]],
    function (v) { var Nn = Math.round(v.Nn), K = Math.round(v.K), n = Math.round(v.n), k = Math.round(v.k); if (Nn < 1 || K < 0 || K > Nn || n < 1 || n > Nn || k < 0) return { error: 'Check the deck, wanted cards and draw size.' };
      var ex = S.hyppmf(k, Nn, K, n), le = 0, i; for (i = 0; i <= k; i++) le += S.hyppmf(i, Nn, K, n); var lab = [], pm = []; for (i = 0; i <= Math.min(n, K); i++) { lab.push(String(i)); pm.push(S.hyppmf(i, Nn, K, n)); }
      return { results: [M('Exactly ' + k, ex * 100, 'pct', { dp: 4 }), R('At least ' + k, (1 - le + ex) * 100, 'pct', { dp: 4 }), R('At most ' + k, le * 100, 'pct', { dp: 4 }), R('At least one', (1 - S.hyppmf(0, Nn, K, n)) * 100, 'pct', { dp: 4 }), R('Expected wanted cards', n * K / Nn, 'num', { dp: 3 })], chart: S.bars(lab, pm, 'Probability', 'pct', 'Chance of each count') }; });
  C('poker-outs-calculator', 'Poker Outs & Odds Calculator', P, 'Chance of hitting your outs on the turn or river, with pot odds.', 'Rule of 4 and 2: outs × 4 (flop) or × 2 (turn).',
    [['o', 'Outs', 'i', 9], ['s', 'Street', 'g', 1, [[1, 'Flop (2 cards to come)'], [2, 'Turn (1 card to come)']]], ['pot', 'Pot size', 'n', 100], ['bet', 'Bet to call', 'n', 25]],
    function (v) { var o = Math.round(v.o), flop = +v.s === 1, un = flop ? 47 : 46; if (o < 0 || o > un) return { error: 'Outs must be between 0 and ' + un + '.' }; var p = flop ? 1 - (S.comb(un - o, 2) / S.comb(un, 2)) : o / un; var need = v.bet / (v.pot + v.bet + v.bet);
      return { results: [M('Chance to hit', p * 100, 'pct', { dp: 2 }), R('Rule of 4 / 2 estimate', Math.min(100, o * (flop ? 4 : 2)), 'pct', { dp: 0 }), R('Odds against', N((1 - p) / p, 2) + ' : 1', 'text'), R('Equity needed to call', need * 100, 'pct', { dp: 2 }), R('Profitable call?', p >= need ? 'Yes — your equity beats the pot odds' : 'No — the price is too high', 'text')] }; });
  C('kelly-criterion-calculator', 'Kelly Criterion Calculator', P, 'Optimal stake size for a bet or trade with a known edge.', 'f* = (b × p − q) ÷ b, where b = net odds and q = 1 − p.',
    [['p', 'Chance of winning', 'p', 55], ['o', 'Payout odds (win b for each 1 staked)', 'n', 1, ''], ['bank', 'Bankroll', 'm', 10000]],
    function (v) { var p = v.p / 100, b = v.o; if (!(p > 0 && p < 1) || !(b > 0)) return { error: 'Enter a win chance between 0% and 100% and positive odds.' }; var f = (b * p - (1 - p)) / b;
      return { results: [M('Kelly fraction', Math.max(0, f) * 100, 'pct', { dp: 2 }), R('Stake (full Kelly)', Math.max(0, f) * v.bank, 'money'), R('Stake (half Kelly)', Math.max(0, f) * v.bank / 2, 'money'), R('Expected value per 1 staked', p * b - (1 - p), 'num', { dp: 4 }), R('Verdict', f > 0 ? 'Positive edge — a bet is justified' : 'No edge — do not bet', 'text')] }; });
  C('implied-probability-calculator', 'Implied Probability & Overround Calculator', P, 'Convert betting odds to probabilities and find the bookmaker margin.', 'Implied probability = 1 ÷ decimal odds.',
    [['f', 'Odds format', 'g', 1, [[1, 'Decimal'], [2, 'American'], [3, 'Fractional']]], ['d', 'Odds for each outcome (one per line)', 'ta', '2.10\n3.40\n3.60', { rows: 4 }]],
    function (v) { var f = +v.f, lines = String(v.d).trim().split(/\n|;|,\s*(?=[-+\d])/).map(function (s) { return s.trim(); }).filter(Boolean), dec = [];
      for (var i = 0; i < lines.length; i++) { var s = lines[i], x; if (f === 1) x = parseFloat(s); else if (f === 2) { var a = parseFloat(s); x = a > 0 ? 1 + a / 100 : 1 + 100 / Math.abs(a); } else { var q = s.split('/'); x = q.length === 2 ? 1 + parseFloat(q[0]) / parseFloat(q[1]) : 1 + parseFloat(s); } if (!(x > 1)) return { error: 'Could not read the odds on line ' + (i + 1) + '.' }; dec.push(x); }
      if (!dec.length) return NEED(1); var ip = dec.map(function (x) { return 1 / x; }), tot = S.sum(ip);
      return { results: [M('Total implied probability', tot * 100, 'pct', { dp: 2 }), R('Bookmaker margin (overround)', (tot - 1) * 100, 'pct', { dp: 2 }), R('Outcomes', dec.length, 'int')],
        table: { head: ['Decimal odds', 'Implied %', 'Fair % (margin removed)', 'Fair odds'], rows: dec.map(function (x, i) { return [x, ip[i] * 100, ip[i] / tot * 100, tot / ip[i]]; }), fmt: ['num', 'pct', 'pct', 'num'], title: 'Outcomes' } }; });
})(window.CW);
