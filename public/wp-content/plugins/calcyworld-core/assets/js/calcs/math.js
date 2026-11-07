/* Calcyworld — Math & statistics */
(function (CW) {
  'use strict';
  var r = function (l, v, f, x) { var o = { l: l, v: v, f: f || 'num' }; if (x) for (var k in x) o[k] = x[k]; return o; };
  var M = function (l, v, f, x) { x = x || {}; x.main = true; return r(l, v, f, x); };
  function nums(s) { return String(s || '').split(/[\s,;\n\t]+/).map(function (x) { return CW.parse(x); }).filter(function (x) { return !isNaN(x); }); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  function lcm(a, b) { return a && b ? Math.abs(a * b) / gcd(a, b) : 0; }
  function frac(n, d) { if (d === 0) return null; var g = gcd(n, d) || 1; n /= g; d /= g; if (d < 0) { n = -n; d = -d; } return [n, d]; }
  function fracStr(f) { if (!f) return '—'; if (f[1] === 1) return String(f[0]); var w = Math.trunc(f[0] / f[1]), rem = Math.abs(f[0] % f[1]);
    return f[0] + '/' + f[1] + (w && rem ? '  =  ' + w + ' ' + rem + '/' + f[1] : ''); }
  function toFrac(x, maxD) { maxD = maxD || 10000; var best = [Math.round(x), 1], err = Math.abs(x - best[0]);
    for (var d = 1; d <= maxD; d++) { var n = Math.round(x * d), e = Math.abs(x - n / d); if (e < err - 1e-12) { best = [n, d]; err = e; if (e < 1e-10) break; } } return frac(best[0], best[1]); }
  function stats(a) {
    var n = a.length, s = a.slice().sort(function (x, y) { return x - y; }), sum = a.reduce(function (p, c) { return p + c; }, 0), mean = sum / n;
    var med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2, cnt = {}, mc = 0, modes = [];
    a.forEach(function (x) { cnt[x] = (cnt[x] || 0) + 1; if (cnt[x] > mc) mc = cnt[x]; });
    Object.keys(cnt).forEach(function (k) { if (cnt[k] === mc && mc > 1) modes.push(+k); });
    var ss = a.reduce(function (p, c) { return p + (c - mean) * (c - mean); }, 0);
    var q = function (p) { var i = (n - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
    return { n: n, sum: sum, mean: mean, median: med, modes: modes, min: s[0], max: s[n - 1], range: s[n - 1] - s[0], vp: ss / n, vs: n > 1 ? ss / (n - 1) : NaN, q1: q(0.25), q3: q(0.75), sorted: s };
  }
  CW.mathx = { gcd: gcd, lcm: lcm, stats: stats, nums: nums, toFrac: toFrac };
  function bigFact(n) { var r = 1n; for (var i = 2n; i <= BigInt(n); i++) r *= i; return r; }
  function bigStr(b) { var s = b.toString(); return s.length > 60 ? s[0] + '.' + s.slice(1, 15) + ' × 10^' + (s.length - 1) : s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function normCdf(z) { var t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2);
    var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }

  CW.register([
  {
    id: 'percentage-calculator', title: 'Percentage Calculator', sec: 'math', sub: 'Basic & Everyday Math', pop: 1,
    desc: 'Solve every common percentage question: X% of Y, what percent X is of Y, percentage change, and adding or subtracting a percentage.',
    formula: 'X% of Y = X × Y ÷ 100. X as a % of Y = X ÷ Y × 100. % change = (new − old) ÷ |old| × 100.',
    faq: [['How do I calculate a percentage of a number?', 'Multiply the number by the percentage and divide by 100. For example, 15% of 200 = 15 × 200 ÷ 100 = 30.'],
      ['How do I work out a percentage increase?', 'Subtract the old value from the new value, divide by the old value and multiply by 100.']],
    inputs: [{ k: 'm', l: 'What do you want to find?', t: 'select', v: 'of', o: [['of', 'What is X% of Y?'], ['is', 'X is what % of Y?'], ['ch', '% change from X to Y'], ['add', 'Y increased by X%'], ['sub', 'Y decreased by X%'], ['rev', 'X is Y% of what?']] },
      { k: 'x', l: 'X', t: 'number', v: 15 }, { k: 'y', l: 'Y', t: 'number', v: 200 }],
    calc: function (v) {
      var x = v.x, y = v.y, out;
      switch (v.m) {
        case 'of': out = [M(x + '% of ' + y + ' =', x * y / 100)]; break;
        case 'is': out = [M(x + ' is', x / y * 100, 'pct', { sub: 'of ' + CW.fmt.num(y) })]; break;
        case 'ch': out = [M(y >= x ? 'Increase' : 'Decrease', Math.abs((y - x) / Math.abs(x) * 100), 'pct'), r('Difference', y - x)]; break;
        case 'add': out = [M(y + ' + ' + x + '% =', y * (1 + x / 100)), r('Amount added', y * x / 100)]; break;
        case 'sub': out = [M(y + ' − ' + x + '% =', y * (1 - x / 100)), r('Amount removed', y * x / 100)]; break;
        default: out = [M(x + ' is ' + y + '% of', x * 100 / y)];
      }
      return { results: out };
    }
  },
  {
    id: 'percentage-change-calculator', title: 'Percentage Change Calculator', sec: 'math', sub: 'Basic & Everyday Math',
    desc: 'Calculate the percentage increase or decrease between two values, plus the percentage difference.',
    formula: '% change = (new − old) ÷ |old| × 100. % difference = |a − b| ÷ ((a + b) ÷ 2) × 100.',
    inputs: [{ k: 'a', l: 'Old value', t: 'number', v: 80 }, { k: 'b', l: 'New value', t: 'number', v: 100 }],
    calc: function (v) { var c = (v.b - v.a) / Math.abs(v.a) * 100;
      return { results: [M(c >= 0 ? 'Percentage increase' : 'Percentage decrease', Math.abs(c), 'pct'), r('Change', v.b - v.a), r('Percentage difference', Math.abs(v.a - v.b) / ((v.a + v.b) / 2) * 100, 'pct'), r('Ratio new ÷ old', v.b / v.a, 'num', { dp: 4 })] }; }
  },
  {
    id: 'fraction-calculator', title: 'Fraction Calculator', sec: 'math', sub: 'Fractions, Ratios & Number Theory', pop: 1,
    desc: 'Add, subtract, multiply and divide fractions. Answers are simplified and shown as mixed numbers and decimals.',
    formula: 'a/b + c/d = (ad + bc) ÷ bd; a/b × c/d = ac ÷ bd; a/b ÷ c/d = ad ÷ bc. Results are reduced by the greatest common divisor.',
    inputs: [{ k: 'a', l: 'First numerator', t: 'int', v: 1 }, { k: 'b', l: 'First denominator', t: 'int', v: 2 },
      { k: 'op', l: 'Operation', t: 'seg', v: '+', o: [['+', '+'], ['-', '−'], ['*', '×'], ['/', '÷']] },
      { k: 'c', l: 'Second numerator', t: 'int', v: 1 }, { k: 'd', l: 'Second denominator', t: 'int', v: 3 }],
    calc: function (v) {
      if (!v.b || !v.d) return { error: 'Denominators cannot be zero.' };
      var n, d;
      switch (v.op) { case '+': n = v.a * v.d + v.c * v.b; d = v.b * v.d; break; case '-': n = v.a * v.d - v.c * v.b; d = v.b * v.d; break;
        case '*': n = v.a * v.c; d = v.b * v.d; break; default: n = v.a * v.d; d = v.b * v.c; }
      var f = frac(n, d); if (!f) return { error: 'Cannot divide by zero.' };
      return { results: [M('Result', fracStr(f), 'text'), r('Decimal', f[0] / f[1], 'num', { dp: 8 }), r('Percent', f[0] / f[1] * 100, 'pct')] };
    }
  },
  {
    id: 'decimal-to-fraction-calculator', title: 'Decimal to Fraction Calculator', sec: 'math', sub: 'Fractions, Ratios & Number Theory',
    desc: 'Convert any decimal number into a simplified fraction and mixed number.',
    formula: 'Write the decimal over a power of ten (e.g. 0.75 = 75/100), then divide top and bottom by their GCD.',
    inputs: [{ k: 'x', l: 'Decimal', t: 'number', v: 0.375 }],
    calc: function (v) { var f = toFrac(v.x, 100000); return { results: [M('Fraction', fracStr(f), 'text'), r('Percent', v.x * 100, 'pct')] }; }
  },
  {
    id: 'ratio-calculator', title: 'Ratio Calculator', sec: 'math', sub: 'Fractions, Ratios & Number Theory',
    desc: 'Simplify a ratio, or solve for the missing value in A : B = C : D.',
    formula: 'A : B = C : D, so D = B × C ÷ A. A ratio is simplified by dividing both sides by their GCD.',
    inputs: [{ k: 'a', l: 'A', t: 'number', v: 4 }, { k: 'b', l: 'B', t: 'number', v: 6 }, { k: 'c', l: 'C (optional)', t: 'number', v: 10, opt: 1 }],
    calc: function (v) { var m = 1; while ((v.a * m % 1 || v.b * m % 1) && m < 1e6) m *= 10; var g = gcd(v.a * m, v.b * m) || 1;
      return { results: [M('Simplified ratio', (v.a * m / g) + ' : ' + (v.b * m / g), 'text'), r('D in A:B = C:D', v.c ? v.b * v.c / v.a : NaN), r('A as a share of total', v.a / (v.a + v.b) * 100, 'pct'), r('Decimal A ÷ B', v.a / v.b, 'num', { dp: 6 })] }; }
  },
  {
    id: 'average-calculator', title: 'Average Calculator (Mean, Median, Mode)', sec: 'math', sub: 'Statistics & Probability', pop: 1,
    desc: 'Paste a list of numbers to get the mean, median, mode, range, sum and count instantly.',
    formula: 'Mean = sum ÷ count. Median = middle value of the sorted list. Mode = most frequent value(s).',
    inputs: [{ k: 'x', l: 'Numbers (separate with commas, spaces or new lines)', t: 'textarea', v: '12, 15, 18, 18, 21, 25, 30', wide: 1 }],
    calc: function (v) { var a = nums(v.x); if (!a.length) return { error: 'Enter at least one number.' }; var s = stats(a);
      return { results: [M('Mean (average)', s.mean, 'num', { dp: 6 }), r('Median', s.median), r('Mode', s.modes.length ? s.modes.join(', ') : 'No mode', 'text'), r('Range', s.range), r('Sum', s.sum), r('Count', s.n, 'int'), r('Minimum', s.min), r('Maximum', s.max)] }; }
  },
  {
    id: 'standard-deviation-calculator', title: 'Standard Deviation Calculator', sec: 'math', sub: 'Statistics & Probability', pop: 1,
    desc: 'Calculate sample and population standard deviation, variance, mean and quartiles from a list of numbers.',
    formula: 'Population σ = √(Σ(x − μ)² ÷ N). Sample s = √(Σ(x − x̄)² ÷ (n − 1)).',
    inputs: [{ k: 'x', l: 'Data set', t: 'textarea', v: '10, 12, 23, 23, 16, 23, 21, 16', wide: 1 }],
    calc: function (v) { var a = nums(v.x); if (a.length < 2) return { error: 'Enter at least two numbers.' }; var s = stats(a);
      return { results: [M('Sample standard deviation (s)', Math.sqrt(s.vs), 'num', { dp: 6 }), r('Population standard deviation (σ)', Math.sqrt(s.vp), 'num', { dp: 6 }), r('Sample variance', s.vs, 'num', { dp: 6 }), r('Population variance', s.vp, 'num', { dp: 6 }),
        r('Mean', s.mean, 'num', { dp: 6 }), r('Count', s.n, 'int'), r('Q1', s.q1), r('Q3', s.q3), r('IQR', s.q3 - s.q1), r('Coefficient of variation', Math.sqrt(s.vs) / s.mean * 100, 'pct')] }; }
  },
  {
    id: 'z-score-calculator', title: 'Z-Score Calculator', sec: 'math', sub: 'Statistics & Probability',
    desc: 'Find the z-score of a value and the probability (percentile) below and above it in a normal distribution.',
    formula: 'z = (x − μ) ÷ σ. Percentile = Φ(z), the standard normal cumulative probability.',
    inputs: [{ k: 'x', l: 'Value (x)', t: 'number', v: 85 }, { k: 'm', l: 'Mean (μ)', t: 'number', v: 70 }, { k: 's', l: 'Standard deviation (σ)', t: 'number', v: 10 }],
    calc: function (v) { if (v.s <= 0) return { error: 'Standard deviation must be positive.' }; var z = (v.x - v.m) / v.s, p = normCdf(z);
      return { results: [M('Z-score', z, 'fixed', { dp: 4 }), r('P(X < x) — percentile', p * 100, 'pct'), r('P(X > x)', (1 - p) * 100, 'pct'), r('P(between −|z| and |z|)', (normCdf(Math.abs(z)) - normCdf(-Math.abs(z))) * 100, 'pct')] }; }
  },
  {
    id: 'sample-size-calculator', title: 'Sample Size Calculator', sec: 'math', sub: 'Statistics & Probability',
    desc: 'Work out how many survey responses you need for a given confidence level and margin of error.',
    formula: 'n₀ = z² × p(1 − p) ÷ e². For a finite population N: n = n₀ ÷ (1 + (n₀ − 1) ÷ N).',
    inputs: [{ k: 'cl', l: 'Confidence level', t: 'select', v: '1.96', o: [['1.645', '90%'], ['1.96', '95%'], ['2.576', '99%']] }, { k: 'e', l: 'Margin of error', t: 'percent', v: 5 },
      { k: 'p', l: 'Expected proportion', t: 'percent', v: 50 }, { k: 'N', l: 'Population size (optional)', t: 'int', v: 0, opt: 1 }],
    calc: function (v) { var z = +v.cl, p = v.p / 100, e = v.e / 100, n0 = z * z * p * (1 - p) / (e * e), n = v.N > 0 ? n0 / (1 + (n0 - 1) / v.N) : n0;
      return { results: [M('Sample size needed', Math.ceil(n), 'int'), r('For an unlimited population', Math.ceil(n0), 'int')] }; }
  },
  {
    id: 'permutation-combination-calculator', title: 'Permutation & Combination Calculator', sec: 'math', sub: 'Statistics & Probability',
    desc: 'Calculate nPr (permutations) and nCr (combinations) exactly, even for large numbers.',
    formula: 'nPr = n! ÷ (n − r)!. nCr = n! ÷ (r! (n − r)!).',
    inputs: [{ k: 'n', l: 'Total items (n)', t: 'int', v: 10 }, { k: 'r', l: 'Items chosen (r)', t: 'int', v: 3 }],
    calc: function (v) { var n = Math.round(v.n), k = Math.round(v.r); if (n < 0 || k < 0 || k > n || n > 5000) return { error: 'Use whole numbers with 0 ≤ r ≤ n ≤ 5000.' };
      var p = 1n; for (var i = n - k + 1; i <= n; i++) p *= BigInt(i); var c = p / bigFact(k);
      return { results: [M('Combinations (nCr)', bigStr(c), 'text'), r('Permutations (nPr)', bigStr(p), 'text'), r('With repetition (nʳ)', bigStr(BigInt(n) ** BigInt(k)), 'text')] }; }
  },
  {
    id: 'factorial-calculator', title: 'Factorial Calculator', sec: 'math', sub: 'Basic & Everyday Math',
    desc: 'Calculate n! exactly for whole numbers up to 5,000, with the number of digits.',
    formula: 'n! = 1 × 2 × 3 × … × n, and 0! = 1.',
    inputs: [{ k: 'n', l: 'n', t: 'int', v: 20 }],
    calc: function (v) { var n = Math.round(v.n); if (n < 0 || n > 5000) return { error: 'Enter a whole number from 0 to 5000.' }; var f = bigFact(n), s = f.toString();
      return { results: [M(n + '! =', bigStr(f), 'text'), r('Digits', s.length, 'int')], html: s.length <= 400 ? '<p class="cw-mono">' + s + '</p>' : '' }; }
  },
  {
    id: 'lcm-gcf-calculator', title: 'LCM & GCF (HCF) Calculator', sec: 'math', sub: 'Fractions, Ratios & Number Theory',
    desc: 'Find the least common multiple and greatest common factor (HCF) of two or more whole numbers.',
    formula: 'GCF uses Euclid’s algorithm. LCM(a, b) = |a × b| ÷ GCF(a, b), applied across the list.',
    inputs: [{ k: 'x', l: 'Numbers', t: 'text', v: '12, 18, 30' }],
    calc: function (v) { var a = nums(v.x).map(Math.round).filter(function (x) { return x !== 0; }); if (a.length < 2) return { error: 'Enter at least two non-zero whole numbers.' };
      return { results: [M('LCM', a.reduce(lcm), 'int'), r('GCF / HCF', a.reduce(gcd), 'int')] }; }
  },
  {
    id: 'prime-factorization-calculator', title: 'Prime Number & Factorization Calculator', sec: 'math', sub: 'Fractions, Ratios & Number Theory',
    desc: 'Check whether a number is prime and break it into its prime factors, with all its divisors.',
    formula: 'Trial division by primes up to √n.',
    inputs: [{ k: 'n', l: 'Whole number', t: 'int', v: 360 }],
    calc: function (v) { var n = Math.round(Math.abs(v.n)); if (n < 2 || n > 1e15) return { error: 'Enter a whole number from 2 to 10¹⁵.' };
      var f = [], m = n; for (var d = 2; d * d <= m; d++) while (m % d === 0) { f.push(d); m /= d; } if (m > 1) f.push(m);
      var cnt = {}; f.forEach(function (x) { cnt[x] = (cnt[x] || 0) + 1; });
      var pf = Object.keys(cnt).map(function (k) { return k + (cnt[k] > 1 ? '^' + cnt[k] : ''); }).join(' × ');
      var divs = []; if (n <= 1e9) { for (var i = 1; i * i <= n; i++) if (n % i === 0) { divs.push(i); if (i !== n / i) divs.push(n / i); } divs.sort(function (a, b) { return a - b; }); }
      return { results: [M(f.length === 1 ? n + ' is prime' : n + ' is not prime', pf, 'text'), r('Number of divisors', divs.length || NaN, 'int')], html: divs.length && divs.length < 200 ? '<p class="cw-mono">Divisors: ' + divs.join(', ') + '</p>' : '' }; }
  },
  {
    id: 'square-root-calculator', title: 'Square Root & Nth Root Calculator', sec: 'math', sub: 'Basic & Everyday Math',
    desc: 'Find the square root, cube root or any nth root of a number.',
    formula: 'ⁿ√x = x^(1/n).',
    inputs: [{ k: 'x', l: 'Number', t: 'number', v: 144 }, { k: 'n', l: 'Root (n)', t: 'number', v: 2 }],
    calc: function (v) { var neg = v.x < 0 && Math.round(v.n) % 2 === 1, rt = neg ? -Math.pow(-v.x, 1 / v.n) : Math.pow(v.x, 1 / v.n);
      if (isNaN(rt)) return { error: 'Even roots of negative numbers are not real numbers.' };
      return { results: [M(v.n === 2 ? '√' + v.x : v.n + '-th root of ' + v.x, rt, 'num', { dp: 10 }), r('Square root', v.x >= 0 ? Math.sqrt(v.x) : NaN, 'num', { dp: 10 }), r('Cube root', Math.cbrt(v.x), 'num', { dp: 10 }), r('Square', v.x * v.x)] }; }
  },
  {
    id: 'exponent-calculator', title: 'Exponent Calculator', sec: 'math', sub: 'Basic & Everyday Math',
    desc: 'Raise any number to any power, including negative and fractional exponents.',
    formula: 'aⁿ = a × a × … × a (n times). a^(−n) = 1 ÷ aⁿ; a^(1/n) = ⁿ√a.',
    inputs: [{ k: 'a', l: 'Base', t: 'number', v: 2 }, { k: 'n', l: 'Exponent', t: 'number', v: 10 }],
    calc: function (v) { var x = Math.pow(v.a, v.n); return { results: [M(v.a + '^' + v.n + ' =', x, 'num', { dp: 10 }), r('Scientific notation', x.toExponential(6), 'text')] }; }
  },
  {
    id: 'logarithm-calculator', title: 'Logarithm Calculator', sec: 'math', sub: 'Algebra',
    desc: 'Calculate logarithms to any base, plus natural log (ln) and log base 10.',
    formula: 'log_b(x) = ln(x) ÷ ln(b).',
    inputs: [{ k: 'x', l: 'Number (x)', t: 'number', v: 1000 }, { k: 'b', l: 'Base (b)', t: 'number', v: 10 }],
    calc: function (v) { if (v.x <= 0 || v.b <= 0 || v.b === 1) return { error: 'x must be positive; base must be positive and not 1.' };
      return { results: [M('log' + v.b + '(' + v.x + ')', Math.log(v.x) / Math.log(v.b), 'num', { dp: 10 }), r('ln(x)', Math.log(v.x), 'num', { dp: 10 }), r('log10(x)', Math.log10(v.x), 'num', { dp: 10 }), r('log2(x)', Math.log2(v.x), 'num', { dp: 10 })] }; }
  },
  {
    id: 'quadratic-equation-solver', title: 'Quadratic Equation Solver', sec: 'math', sub: 'Algebra', pop: 1,
    desc: 'Solve ax² + bx + c = 0 for real or complex roots, with the discriminant and vertex.',
    formula: 'x = (−b ± √(b² − 4ac)) ÷ 2a. The discriminant D = b² − 4ac decides whether roots are real (D ≥ 0) or complex (D < 0).',
    inputs: [{ k: 'a', l: 'a', t: 'number', v: 1 }, { k: 'b', l: 'b', t: 'number', v: -3 }, { k: 'c', l: 'c', t: 'number', v: 2 }],
    calc: function (v) {
      if (v.a === 0) return v.b === 0 ? { error: 'Not an equation in x.' } : { results: [M('Linear solution x', -v.c / v.b, 'num', { dp: 8 })] };
      var D = v.b * v.b - 4 * v.a * v.c, h = -v.b / (2 * v.a), k = Math.sqrt(Math.abs(D)) / (2 * Math.abs(v.a)), f = function (x) { return CW.fmt.num(x, 8); };
      var roots = D > 0 ? 'x₁ = ' + f(h + k) + ',  x₂ = ' + f(h - k) : D === 0 ? 'x = ' + f(h) + ' (double root)' : 'x = ' + f(h) + ' ± ' + f(k) + 'i';
      return { results: [M('Roots', roots, 'text'), r('Discriminant', D), r('Vertex', '(' + f(h) + ', ' + f(v.c - v.b * v.b / (4 * v.a)) + ')', 'text'), r('Sum of roots', -v.b / v.a), r('Product of roots', v.c / v.a)] };
    }
  },
  {
    id: 'slope-calculator', title: 'Slope Calculator', sec: 'math', sub: 'Algebra',
    desc: 'Find the slope, distance, midpoint, angle and line equation between two points.',
    formula: 'Slope m = (y₂ − y₁) ÷ (x₂ − x₁). Distance = √((x₂ − x₁)² + (y₂ − y₁)²). Line: y = mx + b.',
    inputs: [{ k: 'x1', l: 'x₁', t: 'number', v: 1 }, { k: 'y1', l: 'y₁', t: 'number', v: 2 }, { k: 'x2', l: 'x₂', t: 'number', v: 4 }, { k: 'y2', l: 'y₂', t: 'number', v: 8 }],
    calc: function (v) { var dx = v.x2 - v.x1, dy = v.y2 - v.y1, m = dy / dx, b = v.y1 - m * v.x1, f = function (x) { return CW.fmt.num(x, 6); };
      return { results: [M('Slope (m)', dx === 0 ? 'Undefined (vertical line)' : f(m), 'text'), r('Equation', dx === 0 ? 'x = ' + f(v.x1) : 'y = ' + f(m) + 'x ' + (b < 0 ? '− ' + f(-b) : '+ ' + f(b)), 'text'),
        r('Distance', Math.hypot(dx, dy), 'num', { dp: 6 }), r('Midpoint', '(' + f((v.x1 + v.x2) / 2) + ', ' + f((v.y1 + v.y2) / 2) + ')', 'text'), r('Angle', Math.atan2(dy, dx) * 180 / Math.PI, 'num', { dp: 4, u: '°' })] }; }
  },
  {
    id: 'pythagorean-theorem-calculator', title: 'Pythagorean Theorem Calculator', sec: 'math', sub: 'Geometry & Trigonometry', pop: 1,
    desc: 'Find the missing side of a right triangle using a² + b² = c².',
    formula: 'c = √(a² + b²); a = √(c² − b²).',
    inputs: [{ k: 'find', l: 'Find', t: 'seg', v: 'c', o: [['c', 'Hypotenuse c'], ['a', 'Leg a']] }, { k: 'a', l: 'Leg a', t: 'number', v: 3, show: function (x) { return x.find === 'c'; } },
      { k: 'b', l: 'Leg b', t: 'number', v: 4 }, { k: 'c', l: 'Hypotenuse c', t: 'number', v: 5, show: function (x) { return x.find === 'a'; } }],
    calc: function (v) { var a = v.find === 'c' ? v.a : Math.sqrt(v.c * v.c - v.b * v.b), c = v.find === 'c' ? Math.hypot(v.a, v.b) : v.c;
      if (isNaN(a)) return { error: 'The hypotenuse must be the longest side.' };
      return { results: [M(v.find === 'c' ? 'Hypotenuse c' : 'Leg a', v.find === 'c' ? c : a, 'num', { dp: 8 }), r('Area', a * v.b / 2), r('Perimeter', a + v.b + c), r('Angle A', Math.atan(a / v.b) * 180 / Math.PI, 'num', { dp: 4, u: '°' }), r('Angle B', Math.atan(v.b / a) * 180 / Math.PI, 'num', { dp: 4, u: '°' })] }; }
  },
  {
    id: 'area-calculator', title: 'Area Calculator', sec: 'math', sub: 'Geometry & Trigonometry', pop: 1,
    desc: 'Calculate the area of a rectangle, square, circle, triangle, trapezoid, parallelogram, ellipse or sector.',
    formula: 'Rectangle = l × w; circle = πr²; triangle = ½ × b × h; trapezoid = ½(a + b)h; ellipse = πab; sector = ½ r²θ.',
    inputs: [{ k: 's', l: 'Shape', t: 'select', v: 'rect', o: [['rect', 'Rectangle'], ['sq', 'Square'], ['circ', 'Circle'], ['tri', 'Triangle (base × height)'], ['tri3', 'Triangle (three sides)'], ['trap', 'Trapezoid'], ['para', 'Parallelogram'], ['ell', 'Ellipse'], ['sec', 'Circle sector']] },
      { k: 'a', l: 'Length / side / radius / base', t: 'number', v: 10 }, { k: 'b', l: 'Width / height / second side', t: 'number', v: 5, show: function (x) { return ['sq', 'circ'].indexOf(x.s) < 0; } },
      { k: 'c', l: 'Third side / top base / angle (°)', t: 'number', v: 7, show: function (x) { return ['tri3', 'trap', 'sec'].indexOf(x.s) > -1; } }],
    calc: function (v) { var a = v.a, b = v.b, c = v.c, A;
      switch (v.s) { case 'rect': A = a * b; break; case 'sq': A = a * a; break; case 'circ': A = Math.PI * a * a; break; case 'tri': A = a * b / 2; break;
        case 'tri3': var s = (a + b + c) / 2; A = Math.sqrt(s * (s - a) * (s - b) * (s - c)); break; case 'trap': A = (a + c) / 2 * b; break; case 'para': A = a * b; break;
        case 'ell': A = Math.PI * a * b; break; default: A = a * a * (c * Math.PI / 180) / 2; }
      if (isNaN(A)) return { error: 'These sides cannot form a triangle.' };
      return { results: [M('Area', A, 'num', { dp: 6, u: 'square units' })] }; }
  },
  {
    id: 'volume-calculator', title: 'Volume Calculator', sec: 'math', sub: 'Geometry & Trigonometry', pop: 1,
    desc: 'Calculate the volume of a cube, box, cylinder, sphere, cone, pyramid or capsule, in any unit — with litres and gallons.',
    formula: 'Box = l × w × h; cylinder = πr²h; sphere = 4/3 πr³; cone = 1/3 πr²h; pyramid = 1/3 × base area × h.',
    inputs: [{ k: 's', l: 'Shape', t: 'select', v: 'cyl', o: [['cube', 'Cube'], ['box', 'Box / cuboid'], ['cyl', 'Cylinder'], ['sph', 'Sphere'], ['cone', 'Cone'], ['pyr', 'Square pyramid'], ['cap', 'Capsule']] },
      { k: 'a', l: 'Side / length / radius', t: 'number', v: 10 }, { k: 'b', l: 'Width / height', t: 'number', v: 20, show: function (x) { return ['cube', 'sph'].indexOf(x.s) < 0; } },
      { k: 'c', l: 'Height (box)', t: 'number', v: 5, show: function (x) { return x.s === 'box'; } },
      { k: 'u', l: 'Unit', t: 'select', v: 'cm', o: [['mm', 'mm'], ['cm', 'cm'], ['m', 'm'], ['in', 'in'], ['ft', 'ft']] }],
    calc: function (v) { var a = v.a, b = v.b, V;
      switch (v.s) { case 'cube': V = a * a * a; break; case 'box': V = a * b * v.c; break; case 'cyl': V = Math.PI * a * a * b; break; case 'sph': V = 4 / 3 * Math.PI * a * a * a; break;
        case 'cone': V = Math.PI * a * a * b / 3; break; case 'pyr': V = a * a * b / 3; break; default: V = Math.PI * a * a * (4 / 3 * a + b); }
      var toL = { mm: 1e-6, cm: 1e-3, m: 1000, in: 0.016387064, ft: 28.3168466 }[v.u] * V;
      return { results: [M('Volume', V, 'num', { dp: 4, u: v.u + '³' }), r('Litres', toL, 'num', { dp: 4 }), r('US gallons', toL / 3.785411784, 'num', { dp: 4 }), r('Cubic metres', toL / 1000, 'num', { dp: 6 })] }; }
  },
  {
    id: 'circle-calculator', title: 'Circle Calculator', sec: 'math', sub: 'Geometry & Trigonometry',
    desc: 'Enter any one of radius, diameter, circumference or area to get all the others.',
    formula: 'd = 2r; C = 2πr; A = πr².',
    inputs: [{ k: 'k', l: 'I know the', t: 'select', v: 'r', o: [['r', 'Radius'], ['d', 'Diameter'], ['c', 'Circumference'], ['a', 'Area']] }, { k: 'x', l: 'Value', t: 'number', v: 5 }],
    calc: function (v) { var rr = v.k === 'r' ? v.x : v.k === 'd' ? v.x / 2 : v.k === 'c' ? v.x / (2 * Math.PI) : Math.sqrt(v.x / Math.PI);
      return { results: [M('Area', Math.PI * rr * rr, 'num', { dp: 6 }), r('Radius', rr, 'num', { dp: 6 }), r('Diameter', 2 * rr, 'num', { dp: 6 }), r('Circumference', 2 * Math.PI * rr, 'num', { dp: 6 })] }; }
  },
  {
    id: 'triangle-calculator', title: 'Triangle Calculator', sec: 'math', sub: 'Geometry & Trigonometry',
    desc: 'Enter three sides to find every angle, the area, perimeter, heights and triangle type.',
    formula: 'Angles by the law of cosines: cos A = (b² + c² − a²) ÷ 2bc. Area by Heron’s formula.',
    inputs: [{ k: 'a', l: 'Side a', t: 'number', v: 5 }, { k: 'b', l: 'Side b', t: 'number', v: 6 }, { k: 'c', l: 'Side c', t: 'number', v: 7 }],
    calc: function (v) { var a = v.a, b = v.b, c = v.c; if (a + b <= c || a + c <= b || b + c <= a) return { error: 'These sides cannot form a triangle.' };
      var deg = 180 / Math.PI, A = Math.acos((b * b + c * c - a * a) / (2 * b * c)) * deg, B = Math.acos((a * a + c * c - b * b) / (2 * a * c)) * deg, C = 180 - A - B, s = (a + b + c) / 2, ar = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      var type = (a === b && b === c ? 'Equilateral' : a === b || b === c || a === c ? 'Isosceles' : 'Scalene') + ', ' + (Math.abs(Math.max(A, B, C) - 90) < 1e-9 ? 'right' : Math.max(A, B, C) > 90 ? 'obtuse' : 'acute');
      return { results: [M('Area', ar, 'num', { dp: 6 }), r('Angle A', A, 'num', { dp: 4, u: '°' }), r('Angle B', B, 'num', { dp: 4, u: '°' }), r('Angle C', C, 'num', { dp: 4, u: '°' }), r('Perimeter', 2 * s), r('Type', type, 'text')] }; }
  },
  {
    id: 'rounding-calculator', title: 'Rounding Calculator', sec: 'math', sub: 'Basic & Everyday Math',
    desc: 'Round a number to any number of decimal places or significant figures, or to the nearest 10, 100 or 1000.',
    formula: 'Round half away from zero: look at the next digit — 5 or more rounds up.',
    inputs: [{ k: 'x', l: 'Number', t: 'number', v: 3.14159265 }, { k: 'm', l: 'Round to', t: 'select', v: 'dp', o: [['dp', 'Decimal places'], ['sf', 'Significant figures'], ['near', 'Nearest (10, 100, …)']] }, { k: 'n', l: 'Places / figures / nearest', t: 'number', v: 2 }],
    calc: function (v) { var x = v.x, out;
      if (v.m === 'dp') { var p = Math.pow(10, v.n); out = Math.sign(x) * Math.round(Math.abs(x) * p + 1e-9) / p; }
      else if (v.m === 'sf') out = +x.toPrecision(Math.max(1, Math.min(100, Math.round(v.n))));
      else out = Math.round(x / v.n) * v.n;
      return { results: [M('Rounded', out, 'num', { dp: 12 }), r('Round up (ceiling)', v.m === 'near' ? Math.ceil(x / v.n) * v.n : Math.ceil(x * Math.pow(10, v.n)) / Math.pow(10, v.n), 'num', { dp: 12 }), r('Round down (floor)', v.m === 'near' ? Math.floor(x / v.n) * v.n : Math.floor(x * Math.pow(10, v.n)) / Math.pow(10, v.n), 'num', { dp: 12 })] }; }
  },
  {
    id: 'number-to-words-converter', title: 'Number to Words Converter', sec: 'math', sub: 'Basic & Everyday Math',
    desc: 'Write any number in words — in the international system (million, billion) and the Indian system (lakh, crore) — for cheques and invoices.',
    formula: 'The number is split into groups (thousands, millions… or thousands, lakhs, crores) and each group is spelled out.',
    inputs: [{ k: 'n', l: 'Number', t: 'number', v: 1250000 }, { k: 'cur', l: 'Write as currency', t: 'check', v: false }],
    calc: function (v) { var n = Math.floor(Math.abs(v.n)), ps = Math.round((Math.abs(v.n) - n) * 100), cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
      var name = new Intl.DisplayNames(['en'], { type: 'currency' }).of(CW.currency()) || CW.currency();
      var tail = function (s) { return v.cur ? s + ' ' + name + (ps ? ' and ' + CW.words(ps) + ' cents' : '') + ' only' : s; };
      return { results: [M('In words', cap(tail(CW.words(n, 'intl'))), 'text'), r('Indian system', cap(tail(CW.words(n, 'indian'))), 'text')] }; }
  },
  {
    id: 'roman-numeral-converter', title: 'Roman Numeral Converter', sec: 'math', sub: 'Basic & Everyday Math',
    desc: 'Convert numbers to Roman numerals and Roman numerals back to numbers (1 to 3,999).',
    formula: 'Symbols I=1, V=5, X=10, L=50, C=100, D=500, M=1000, with subtractive pairs such as IV=4 and CM=900.',
    inputs: [{ k: 'x', l: 'Number or Roman numeral', t: 'text', v: '2026' }],
    calc: function (v) { var s = String(v.x || '').trim().toUpperCase(), map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
      if (/^\d+$/.test(s)) { var n = +s; if (n < 1 || n > 3999) return { error: 'Use a number from 1 to 3999.' }; var out = ''; map.forEach(function (m) { while (n >= m[0]) { out += m[1]; n -= m[0]; } }); return { results: [M(s + ' in Roman numerals', out, 'text')] }; }
      if (!/^[MDCLXVI]+$/.test(s)) return { error: 'Enter a number or a valid Roman numeral.' };
      var val = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }, t = 0; for (var i = 0; i < s.length; i++) { var a = val[s[i]], b = val[s[i + 1]] || 0; t += a < b ? -a : a; }
      return { results: [M(s + ' =', t, 'int')] }; }
  },
  {
    id: 'number-base-converter', title: 'Binary, Hex & Number Base Converter', sec: 'math', sub: 'Fractions, Ratios & Number Theory',
    desc: 'Convert whole numbers between binary, octal, decimal, hexadecimal and any base from 2 to 36.',
    formula: 'Repeated division by the target base; digits above 9 use letters A–Z.',
    inputs: [{ k: 'x', l: 'Number', t: 'text', v: '255' }, { k: 'f', l: 'From base', t: 'select', v: '10', o: [['2', 'Binary (2)'], ['8', 'Octal (8)'], ['10', 'Decimal (10)'], ['16', 'Hexadecimal (16)'], ['36', 'Base 36']] }],
    calc: function (v) { var s = String(v.x || '').trim().replace(/^0[xbo]/i, ''); if (!s) return { error: 'Enter a number.' };
      var n; try { n = [...s.toLowerCase()].reduce(function (acc, ch) { var d = parseInt(ch, 36); if (isNaN(d) || d >= +v.f) throw 0; return acc * BigInt(+v.f) + BigInt(d); }, 0n); } catch (e) { return { error: 'That is not a valid base-' + v.f + ' number.' }; }
      return { results: [M('Decimal', n.toString(10), 'text'), r('Binary', n.toString(2), 'text'), r('Octal', n.toString(8), 'text'), r('Hexadecimal', n.toString(16).toUpperCase(), 'text'), r('Base 36', n.toString(36).toUpperCase(), 'text')] }; }
  },
  {
    id: 'scientific-notation-calculator', title: 'Scientific Notation Converter', sec: 'math', sub: 'Basic & Everyday Math',
    desc: 'Convert numbers to and from scientific and engineering notation.',
    formula: 'Any number = a × 10ⁿ with 1 ≤ |a| < 10.',
    inputs: [{ k: 'x', l: 'Number (e.g. 0.000452 or 4.52e-4)', t: 'number', v: 299792458 }, { k: 'sf', l: 'Significant figures', t: 'int', v: 6 }],
    calc: function (v) { var e = v.x.toExponential(Math.max(0, v.sf - 1)).split('e'), ex = +e[1], eng = Math.floor(ex / 3) * 3;
      return { results: [M('Scientific notation', e[0] + ' × 10^' + ex, 'text'), r('E notation', v.x.toExponential(Math.max(0, v.sf - 1)), 'text'), r('Engineering notation', CW.fmt.num(v.x / Math.pow(10, eng), v.sf) + ' × 10^' + eng, 'text'), r('Standard form', v.x, 'num', { dp: 12 })] }; }
  },
  {
    id: 'random-number-generator', title: 'Random Number Generator', sec: 'fun', sub: 'Fun & Random Tools', pop: 1,
    desc: 'Generate one or many random numbers in any range — with or without duplicates — using your browser’s secure random source.',
    formula: 'Uses crypto.getRandomValues for unbiased integers between min and max (inclusive).',
    inputs: [{ k: 'a', l: 'Minimum', t: 'int', v: 1 }, { k: 'b', l: 'Maximum', t: 'int', v: 100 }, { k: 'n', l: 'How many', t: 'int', v: 1 }, { k: 'u', l: 'No duplicates', t: 'check', v: true }, { k: 'go', l: 'Shuffle seed (change to re-roll)', t: 'text', v: '1', opt: 1 }],
    calc: function (v) { var lo = Math.ceil(Math.min(v.a, v.b)), hi = Math.floor(Math.max(v.a, v.b)), span = hi - lo + 1, n = Math.min(Math.max(1, Math.round(v.n)), 10000);
      if (v.u && n > span) return { error: 'Not enough unique numbers in that range.' };
      var rnd = function () { var a = new Uint32Array(1); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : (a[0] = Math.random() * 4294967296); return a[0] / 4294967296; };
      var out = [], seen = {}; while (out.length < n) { var x = lo + Math.floor(rnd() * span); if (v.u) { if (seen[x]) continue; seen[x] = 1; } out.push(x); }
      return { results: [M(n === 1 ? 'Your number' : 'Your numbers', out.slice(0, 30).join(', ') + (n > 30 ? ' …' : ''), 'text')], html: n > 30 ? '<p class="cw-mono">' + out.join(', ') + '</p>' : '', note: 'Change any value or press Reset to roll again.' }; }
  },
  {
    id: 'scientific-calculator', title: 'Scientific Calculator', sec: 'math', sub: 'Basic & Everyday Math', pop: 1,
    desc: 'A free online scientific calculator with trigonometry, logarithms, powers, roots, factorials and a running history. Works with your keyboard.',
    formula: 'Follows standard order of operations: brackets, powers, multiplication and division, then addition and subtraction.',
    inputs: [], calc: function () { return { results: [] }; },
    render: function (el) {
      var keys = [['deg', 'rad', 'ans', '(', ')', '⌫', 'C'], ['sin', 'cos', 'tan', '7', '8', '9', '÷'], ['asin', 'acos', 'atan', '4', '5', '6', '×'],
        ['ln', 'log', 'x²', '1', '2', '3', '−'], ['√', '^', '!', '0', '.', 'π', '+'], ['e^', '10^', '1/x', 'abs', '%', 'e', '=']];
      el.innerHTML = '<div class="cw-sci"><div class="cw-screen"><div class="cw-hist" aria-live="polite"></div><input class="cw-expr" aria-label="Expression" inputmode="none" autocomplete="off" spellcheck="false"><div class="cw-live"></div></div>' +
        '<div class="cw-keys">' + keys.map(function (row) { return row.map(function (k) { return '<button type="button" data-k="' + k + '" class="' + (/^[0-9.]$/.test(k) ? 'n' : k === '=' ? 'eq' : /^[+−×÷]$/.test(k) ? 'op' : 'fn') + '">' + k + '</button>'; }).join(''); }).join('') + '</div></div>';
      var ex = el.querySelector('.cw-expr'), live = el.querySelector('.cw-live'), hist = el.querySelector('.cw-hist'), mode = 'deg', ans = 0;
      var map = { 'π': 'π', '÷': '÷', '×': '×', '−': '-', 'x²': '^2', '√': '√(', '^': '^', '!': '!', 'e': 'e', 'ans': 'ans', 'EXP': 'e', '%': '/100', '10^': '10^(', 'e^': 'exp(', '1/x': '1/(', 'abs': 'abs(' };
      var ins = function (t) { var s = ex.selectionStart || ex.value.length; ex.value = ex.value.slice(0, s) + t + ex.value.slice(ex.selectionEnd || s); ex.setSelectionRange(s + t.length, s + t.length); upd(); };
      var calc = function (s) { return CW.evaluate(s.replace(/(\d)e(\d)/g, '$1*10^$2'), { ans: ans }, { angle: mode }); };
      var upd = function () { try { var v = ex.value.trim() ? calc(ex.value) : ''; live.textContent = v === '' ? '' : '= ' + CW.fmt.num(v, 10); } catch (e) { live.textContent = ''; } };
      var eq = function () { try { var v = calc(ex.value); hist.insertAdjacentHTML('afterbegin', '<div>' + CW.esc(ex.value) + ' = <b>' + CW.fmt.num(v, 12) + '</b></div>'); ans = v; ex.value = String(+v.toPrecision(15)); upd(); } catch (e) { live.textContent = e.message; } };
      el.addEventListener('click', function (e) { var b = e.target.closest('button[data-k]'); if (!b) return; var k = b.getAttribute('data-k');
        if (k === 'C') { ex.value = ''; upd(); } else if (k === '⌫') { ex.value = ex.value.slice(0, -1); upd(); } else if (k === '=') eq();
        else if (k === 'deg' || k === 'rad') { mode = k; el.querySelectorAll('[data-k=deg],[data-k=rad]').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-k') === mode); }); upd(); }
        else if (/^(sin|cos|tan|asin|acos|atan|ln|log)$/.test(k)) ins(k + '('); else ins(map[k] || k);
        if (!/Mobi|Android/i.test(navigator.userAgent)) ex.focus(); });
      ex.addEventListener('input', upd); ex.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); eq(); } if (e.key === 'Escape') { ex.value = ''; upd(); } });
      el.querySelector('[data-k=deg]').classList.add('on');
    }
  }
  ]);
})(window.CW);
