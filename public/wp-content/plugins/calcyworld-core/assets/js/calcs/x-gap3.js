/* Calcyworld — gap pack 3: math, calculus, lab science, electrical, construction, auto */
(function (CW) {
  'use strict';
  CW.defBase = 'INR';
  var C = CW.C, M = CW.M, R = CW.Rr;
  var Mx = function (l, v, dp, u) { return M(l, v, 'num', { dp: dp === undefined ? 4 : dp, u: u || '' }); }, Rx = function (l, v, dp, u) { return R(l, v, 'num', { dp: dp === undefined ? 4 : dp, u: u || '' }); };
  var Mo = function (l, v, dp) { return M(l, v, 'm', { dp: dp === undefined ? 0 : dp }); }, Ro = function (l, v, dp) { return R(l, v, 'm', { dp: dp === undefined ? 0 : dp }); };
  var Mp = function (l, v, dp) { return M(l, v, 'pct', { dp: dp === undefined ? 1 : dp }); }, Rp = function (l, v, dp) { return R(l, v, 'pct', { dp: dp === undefined ? 1 : dp }); };
  var Tx = function (l, v) { return R(l, v, 'text'); }, Mt = function (l, v) { return M(l, v, 'text'); };
  var num = function (s) { return +String(s).replace(/,/g, ''); };
  var lines2 = function (s) { return String(s).trim().split(/\n/).map(function (l) { var m = /^(.*?)[\s:]+([\d.,]+)\s*$/.exec(l.trim()); return m ? [m[1], num(m[2])] : null; }).filter(Boolean); };
  var gcd = function (a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; };
  var big = function (s) { s = String(s).replace(/[\s,_]/g, ''); if (!/^[+-]?\d+$/.test(s)) throw new Error('Use whole numbers only.'); return BigInt(s); };
  var grp = function (b) { var s = b.toString(), neg = s.charAt(0) === '-'; if (neg) s = s.slice(1); s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (neg ? '-' : '') + s; };
  var clean = function (x) { return Math.abs(x) < 1e-12 ? 0 : +x.toPrecision(10); };
  var frac = function (x) { x = clean(x); if (Number.isInteger(x)) return String(x); var best = null; for (var d = 1; d <= 720; d++) { var n = Math.round(x * d); if (Math.abs(x - n / d) < 1e-9) { var g = gcd(n, d); best = (n / g) + '/' + (d / g); break; } } return best || String(+x.toFixed(6)); };
  var sg = function (x) { return x < 0 ? '−' + frac(-x) : frac(x); };
  var shw = function () { var a = Array.prototype.slice.call(arguments); return a.map(function (k) { return '(' + k + ')'; }).join('+'); };

  /* ===== Arithmetic & number theory ===== */
  C('big-number-calculator', 'Big Number Calculator', 'math/arithmetic', 'Add, subtract, multiply, divide and raise huge whole numbers exactly.', 'Exact integer arithmetic with unlimited digits (no rounding).',
    [['a', 'First number', 't', '123456789012345678901234567890'], ['op', 'Operation', 's', 3, [[1, 'A + B'], [2, 'A − B'], [3, 'A × B'], [4, 'A ÷ B (quotient and remainder)'], [5, 'A ^ B (power)'], [6, 'A mod B'], [7, 'GCD(A, B)'], [8, 'A! (factorial of A)']]], ['b', 'Second number', 't', '987654321098765432109876543210']],
    function (v) {
      try {
        var a = big(v.a), b = big(v.b), r, res;
        switch (+v.op) {
          case 1: r = a + b; break; case 2: r = a - b; break; case 3: r = a * b; break;
          case 4: if (b === 0n) return { error: 'Cannot divide by zero.' }; r = a / b; res = [Rx('Remainder', 0, 0)]; res = [Tx('Remainder', grp(a % b))]; break;
          case 5: if (b < 0n || b > 5000n) return { error: 'Use an exponent from 0 to 5,000.' }; r = a ** b; break;
          case 6: if (b === 0n) return { error: 'Cannot divide by zero.' }; r = ((a % b) + b) % b; break;
          case 7: var x = a < 0n ? -a : a, y = b < 0n ? -b : b; while (y) { var t = x % y; x = y; y = t; } r = x; break;
          case 8: if (a < 0n || a > 3000n) return { error: 'Use a number from 0 to 3,000 for the factorial.' }; r = 1n; for (var k = 2n; k <= a; k++) r *= k; break;
        }
        var s = r.toString().replace('-', '');
        var out = [Mt('Result', grp(r)), Rx('Digits', s.length, 0)];
        if (res) out = out.concat(res); if (s.length > 6) out.push(Tx('Scientific notation', (r < 0n ? '-' : '') + s.charAt(0) + '.' + s.slice(1, 7) + ' × 10^' + (s.length - 1)));
        return { results: out };
      } catch (e) { return { error: e.message }; }
    });

  C('long-multiplication-calculator', 'Long Multiplication Calculator', 'math/arithmetic', 'Multiply two numbers step by step with partial products.', 'Multiply the top number by each digit of the bottom number, shift left, and add.',
    [['a', 'Multiplicand', 'i', 4783], ['b', 'Multiplier', 'i', 276]],
    function (v) {
      var a = Math.abs(Math.round(v.a)), b = Math.abs(Math.round(v.b)), ds = String(b).split('').reverse(), rows = [], tot = 0;
      ds.forEach(function (d, i) { var p = a * +d; tot += p * Math.pow(10, i); rows.push([i + 1, d + (i ? ' × 10^' + i : ''), p, p * Math.pow(10, i)]); });
      var sgn = (v.a < 0) !== (v.b < 0) ? -1 : 1;
      return { results: [Mx('Product', sgn * tot, 0), Rx('Digits in the answer', String(tot).length, 0)], table: { head: ['Step', 'Bottom digit', 'Partial product', 'Shifted'], rows: rows, fmt: ['int', '', 'num', 'num'], title: 'Partial products' } };
    });

  C('remainder-calculator', 'Remainder Calculator', 'math/arithmetic', 'Quotient and remainder of a division, with the check.', 'Dividend = divisor × quotient + remainder.',
    [['a', 'Dividend', 'n', 487], ['b', 'Divisor', 'n', 12]],
    function (v) {
      if (v.b === 0) return { error: 'Divisor cannot be zero.' };
      var q = Math.trunc(v.a / v.b), r = v.a - q * v.b, fq = Math.floor(v.a / v.b), fr = v.a - fq * v.b;
      return { results: [Mx('Remainder', r, 6), Rx('Quotient (whole part)', q, 0), Rx('Decimal result', v.a / v.b, 8), Tx('Check', v.a + ' = ' + v.b + ' × ' + q + ' + ' + clean(r)), Rx('Modulo (floored)', fr, 6), Tx('As a mixed number', q + (r ? ' ' + frac(r) + '/' + frac(v.b).split('/')[0] : ''))] };
    });

  C('divisibility-calculator', 'Divisibility Calculator', 'math/number-theory', 'Test a number against divisibility rules for 2 to 13 and see why.', 'A number is divisible by d when the remainder after division by d is zero.',
    [['n', 'Whole number', 't', '98765432']],
    function (v) {
      try {
        var n = big(v.n), s = n.toString().replace('-', ''), digs = s.split('').map(Number), ds = digs.reduce(function (a, b) { return a + b; }, 0), alt = digs.slice().reverse().reduce(function (a, d, i) { return a + (i % 2 ? -d : d); }, 0);
        var rules = { 2: 'Last digit is even (' + s.slice(-1) + ')', 3: 'Digit sum is ' + ds + ', divisible by 3?', 4: 'Last two digits (' + s.slice(-2) + ') divisible by 4?', 5: 'Last digit is 0 or 5', 6: 'Divisible by both 2 and 3', 7: 'Direct division check', 8: 'Last three digits (' + s.slice(-3) + ') divisible by 8?', 9: 'Digit sum is ' + ds + ', divisible by 9?', 10: 'Last digit is 0', 11: 'Alternating digit sum is ' + alt + ', divisible by 11?', 12: 'Divisible by both 3 and 4', 13: 'Direct division check', 25: 'Last two digits are 00, 25, 50 or 75' };
        var rows = [], yes = [];
        Object.keys(rules).forEach(function (d) { var ok = n % BigInt(d) === 0n; if (ok) yes.push(d); rows.push([+d, ok ? 'Yes' : 'No (remainder ' + (n % BigInt(d)) + ')', rules[d]]); });
        return { results: [Mt('Divisible by', yes.length ? yes.join(', ') : 'none of 2–13, 25'), Rx('Digit sum', ds, 0), Rx('Alternating sum', alt, 0), Tx('Even or odd', n % 2n === 0n ? 'Even' : 'Odd')], table: { head: ['Divisor', 'Divisible?', 'Rule'], rows: rows, fmt: ['int', '', ''], title: 'Rule by rule' } };
      } catch (e) { return { error: e.message }; }
    }, { pop: 1 });

  /* ===== Algebra ===== */
  C('factoring-calculator', 'Factoring Calculator (Quadratic Polynomials)', 'math/algebra', 'Factor ax² + bx + c into its factors, with roots and discriminant.', 'Take out the greatest common factor, then factor using the roots: ax² + bx + c = a(x − r₁)(x − r₂).',
    [['a', 'a (coefficient of x²)', 'i', 6], ['b', 'b (coefficient of x)', 'i', 5], ['c', 'c (constant)', 'i', -4]],
    function (v) {
      var a = Math.round(v.a), b = Math.round(v.b), c = Math.round(v.c); if (a === 0) return { error: 'a cannot be zero for a quadratic.' };
      var g = gcd(gcd(a, b), c) || 1; if (a < 0) g = -g; var A = a / g, B = b / g, Cc = c / g, D = B * B - 4 * A * Cc, gs = Math.abs(g) === 1 ? (g < 0 ? '−' : '') : String(g), res = [], f;
      var poly = a + 'x² ' + (b < 0 ? '− ' : '+ ') + Math.abs(b) + 'x ' + (c < 0 ? '− ' : '+ ') + Math.abs(c);
      var sq = Math.round(Math.sqrt(Math.abs(D)));
      if (D >= 0 && sq * sq === D) {
        var n1 = -B + sq, n2 = -B - sq, d = 2 * A, g1 = gcd(n1, d) || 1, g2 = gcd(n2, d) || 1, p1 = n1 / g1, q1 = d / g1, p2 = n2 / g2, q2 = d / g2, k = A / (q1 * q2);
        if (q1 < 0) { q1 = -q1; p1 = -p1; } if (q2 < 0) { q2 = -q2; p2 = -p2; }
        var term = function (q, p) { return '(' + (q === 1 ? '' : q) + 'x ' + (p <= 0 ? '+ ' + (-p) : '− ' + p) + ')'; };
        var lead = g * k, ls = lead === 1 ? '' : lead === -1 ? '−' : lead;
        f = ls + term(q1, p1) + (D === 0 ? '' : term(q2, p2)); if (D === 0) f = ls + term(q1, p1) + '²';
        res = [Mt('Factored form', f), Tx('Roots', D === 0 ? 'x = ' + frac(n1 / d) : 'x = ' + frac(n1 / d) + ' and x = ' + frac(n2 / d))];
      } else if (D < 0) { res = [Mt('Factored form', 'Does not factor over the real numbers'), Tx('Complex roots', clean(-B / (2 * A)) + ' ± ' + clean(Math.sqrt(-D) / (2 * A)) + 'i')]; }
      else { res = [Mt('Factored form', 'Does not factor over the integers'), Tx('Real roots (irrational)', clean((-B + Math.sqrt(D)) / (2 * A)) + ' and ' + clean((-B - Math.sqrt(D)) / (2 * A)))]; }
      res.push(Tx('Polynomial', poly)); res.push(Rx('Greatest common factor', Math.abs(g), 0)); res.push(Rx('Discriminant', D, 0));
      return { results: res };
    }, { pop: 1 });

  var OPS = [[1, '<'], [2, '≤'], [3, '>'], [4, '≥']];
  var ivl = function (parts) { return parts.length ? parts.join(' ∪ ') : 'No solution'; };
  C('inequality-solver', 'Inequality Solver (Linear, Quadratic, Absolute Value)', 'math/algebra', 'Solve an inequality and write the answer in interval notation.', 'Solve like an equation; flip the sign when you multiply or divide by a negative number.',
    [['t', 'Type', 's', 1, [[1, 'Linear: ax + b ? c'], [2, 'Quadratic: ax² + bx + c ? 0'], [3, 'Absolute value: |ax + b| ? c']]], ['a', 'a', 'n', 3], ['b', 'b', 'n', -5], ['c', 'c', 'n', 7], ['o', 'Inequality sign', 's', 2, OPS]],
    function (v) {
      var a = v.a, b = v.b, c = v.c, o = +v.o, sym = OPS[o - 1][1], strict = o === 1 || o === 3, gt = o >= 3, ans, steps = [];
      if (+v.t === 1) {
        if (a === 0) { var ok = [function (x, y) { return x < y; }, function (x, y) { return x <= y; }, function (x, y) { return x > y; }, function (x, y) { return x >= y; }][o - 1](b, c); ans = ok ? 'All real numbers' : 'No solution'; }
        else { var r = (c - b) / a, flip = a < 0, g2 = flip ? !gt : gt, cl = !strict; ans = g2 ? 'x ' + (cl ? '≥' : '>') + ' ' + frac(r) + '   →   ' + (cl ? '[' : '(') + frac(r) + ', ∞)' : 'x ' + (cl ? '≤' : '<') + ' ' + frac(r) + '   →   (−∞, ' + frac(r) + (cl ? ']' : ')'); steps.push('Subtract ' + b + ' → ' + a + 'x ' + sym + ' ' + clean(c - b)); steps.push('Divide by ' + a + (flip ? ' (negative, so the sign flips)' : '')); }
      } else if (+v.t === 2) {
        if (a === 0) return { error: 'a cannot be zero for a quadratic.' };
        var D = b * b - 4 * a * c, cl2 = !strict, parts;
        if (D > 0) {
          var r1 = (-b - Math.sqrt(D)) / (2 * a), r2 = (-b + Math.sqrt(D)) / (2 * a); if (r1 > r2) { var t = r1; r1 = r2; r2 = t; }
          var pos = a > 0, outside = (gt && pos) || (!gt && !pos), s1 = frac(r1), s2 = frac(r2), L = cl2 ? '[' : '(', Rr = cl2 ? ']' : ')', Lr = cl2 ? ']' : ')', Rl = cl2 ? '[' : '(';
          parts = outside ? ['(−∞, ' + s1 + Lr, Rl + s2 + ', ∞)'] : [L + s1 + ', ' + s2 + Rr];
        } else if (D === 0) {
          var r0 = frac(-b / (2 * a)), pos0 = a > 0; var posReg = pos0 ? 'all reals except x = ' + r0 : 'none';
          if (gt) parts = pos0 ? (cl2 ? ['(−∞, ∞)'] : ['(−∞, ' + r0 + ') ∪ (' + r0 + ', ∞)']) : (cl2 ? ['{' + r0 + '}'] : []);
          else parts = pos0 ? (cl2 ? ['{' + r0 + '}'] : []) : (cl2 ? ['(−∞, ∞)'] : ['(−∞, ' + r0 + ') ∪ (' + r0 + ', ∞)']);
        } else { var allPos = a > 0; parts = ((gt && allPos) || (!gt && !allPos)) ? ['(−∞, ∞)'] : []; }
        ans = ivl(parts); steps.push('Discriminant = ' + clean(D) + (D > 0 ? ' → two real roots' : D === 0 ? ' → one repeated root' : ' → no real roots'));
      } else {
        if (c < 0) { ans = (gt) ? 'All real numbers' : 'No solution'; steps.push('An absolute value is never negative.'); }
        else if (a === 0) { var okk = [Math.abs(b) < c, Math.abs(b) <= c, Math.abs(b) > c, Math.abs(b) >= c][o - 1]; ans = okk ? 'All real numbers' : 'No solution'; }
        else { var x1 = (-c - b) / a, x2 = (c - b) / a, lo = Math.min(x1, x2), hi = Math.max(x1, x2), cl3 = !strict; ans = gt ? '(−∞, ' + frac(lo) + (cl3 ? ']' : ')') + ' ∪ ' + (cl3 ? '[' : '(') + frac(hi) + ', ∞)' : (cl3 ? '[' : '(') + frac(lo) + ', ' + frac(hi) + (cl3 ? ']' : ')'); steps.push('Split: −' + c + ' ' + (gt ? 'or' : 'to') + ' ' + c + ' for ' + a + 'x + ' + b); }
      }
      return { results: [Mt('Solution', ans)], note: steps.join(' · ') };
    }, { pop: 1 });

  C('logarithmic-equation-solver', 'Logarithmic & Exponential Equation Solver', 'math/algebra', 'Solve log and exponential equations and check the domain.', 'Rewrite log_b(y) = d as y = b^d, then solve and check that every log argument is positive.',
    [['t', 'Equation', 's', 1, [[1, 'log_b(ax + c) = d'], [2, 'log_b(x) + log_b(x + k) = m'], [3, 'log_b(x) − log_b(x − k) = m'], [4, 'a^x = c  (exponential)']]], ['b', 'Base b (or a for type 4)', 'n', 2], ['a', 'a', 'n', 3, '', { show: 'if(t==1,1,0)' }], ['c', 'c', 'n', 1, '', { show: '(t==1)+(t==4)' }], ['d', 'd', 'n', 4, '', { show: 'if(t==1,1,0)' }], ['k', 'k', 'n', 2, '', { show: '(t==2)+(t==3)' }], ['m', 'm', 'n', 3, '', { show: '(t==2)+(t==3)' }]],
    function (v) {
      var t = +v.t, b = v.b, x, chk;
      if (t !== 4 && (b <= 0 || b === 1)) return { error: 'The base must be positive and not 1.' };
      if (t === 1) { if (v.a === 0) return { error: 'a cannot be zero.' }; x = (Math.pow(b, v.d) - v.c) / v.a; chk = v.a * x + v.c > 0; }
      else if (t === 2) { var rhs = Math.pow(b, v.m), D = v.k * v.k + 4 * rhs, xs = [(-v.k + Math.sqrt(D)) / 2, (-v.k - Math.sqrt(D)) / 2].filter(function (z) { return z > 0 && z + v.k > 0; }); if (!xs.length) return { error: 'No solution inside the domain.' }; x = xs[0]; chk = true; }
      else if (t === 3) { var p = Math.pow(b, v.m); if (p === 1) return { error: 'No solution (b^m = 1).' }; x = v.k * p / (p - 1); chk = x > 0 && x - v.k > 0; }
      else { if (b <= 0 || b === 1 || v.c <= 0) return { error: 'Use a positive base other than 1 and c above 0.' }; x = Math.log(v.c) / Math.log(b); chk = true; }
      if (!chk) return { error: 'The solution falls outside the domain of the logarithm — no valid solution.' };
      return { results: [Mx('x', x, 8), Tx('Domain check', 'Valid — every logarithm argument is positive'), Rx('x as a fraction (if exact)', x, 8)] };
    });

  C('summation-calculator', 'Summation (Sigma) Calculator', 'math/algebra', 'Sum any expression in i from a start to an end value.', 'Σ f(i) for i = a to b. Use i in the expression, e.g. i^2, 1/i, 2^i, sin(i).',
    [['f', 'Expression f(i)', 't', 'i^2'], ['a', 'From i =', 'i', 1], ['b', 'To i =', 'i', 10]],
    function (v) {
      var a = Math.round(v.a), b = Math.round(v.b); if (b < a) return { error: 'The end value must be at least the start value.' }; if (b - a > 200000) return { error: 'Use at most 200,000 terms.' };
      var s = 0, rows = [], lab = [], pts = [], step = Math.max(1, Math.floor((b - a) / 60));
      try { for (var k = a; k <= b; k++) { var t = CW.evaluate(v.f, { i: k, n: k, k: k }); if (!isFinite(t)) return { error: 'The expression is undefined at i = ' + k + '.' }; s += t; if (rows.length < 20) rows.push([k, t, s]); if ((k - a) % step === 0 || k === b) { lab.push(String(k)); pts.push(s); } } } catch (e) { return { error: e.message }; }
      return { results: [Mx('Sum', s, 8), Rx('Number of terms', b - a + 1, 0), Rx('Average term', s / (b - a + 1), 8)], table: { head: ['i', 'f(i)', 'Running sum'], rows: rows, fmt: ['int', 'num', 'num'], title: 'First terms' }, chart: { type: 'line', title: 'Partial sums', labels: lab, series: [{ l: 'Σ', pts: pts }], f: 'num' } };
    });

  C('absolute-value-calculator', 'Absolute Value Calculator & Equation Solver', 'math/algebra', 'Absolute value of a number, or solve |ax + b| = c.', '|x| is the distance of x from zero. |ax + b| = c gives ax + b = c or ax + b = −c.',
    [['m', 'Mode', 'g', 1, [[1, '|x|'], [2, '|ax + b| = c']]], ['x', 'Number x', 'n', -7.5, '', { show: 'm==1' }], ['a', 'a', 'n', 2, '', { show: 'm==2' }], ['b', 'b', 'n', -3, '', { show: 'm==2' }], ['c', 'c', 'n', 9, '', { show: 'm==2' }]],
    function (v) {
      if (+v.m === 1) return { results: [Mx('|x|', Math.abs(v.x), 8), Rx('Distance from zero', Math.abs(v.x), 8), Tx('Sign', v.x < 0 ? 'Negative' : v.x > 0 ? 'Positive' : 'Zero'), Rx('x²', v.x * v.x, 8), Rx('√(x²)', Math.sqrt(v.x * v.x), 8)] };
      if (v.c < 0) return { results: [Mt('Solution', 'No solution — an absolute value cannot be negative')] };
      if (v.a === 0) return { results: [Mt('Solution', Math.abs(v.b) === v.c ? 'All real numbers' : 'No solution')] };
      var x1 = (v.c - v.b) / v.a, x2 = (-v.c - v.b) / v.a;
      return { results: [Mt('Solution', v.c === 0 ? 'x = ' + frac(x1) : 'x = ' + frac(x1) + ' or x = ' + frac(x2)), Rx('x₁', x1, 8), Rx('x₂', x2, 8)] };
    });

  C('partial-fraction-calculator', 'Partial Fraction Decomposition Calculator', 'math/algebra', 'Break a rational expression into simpler fractions.', 'For distinct linear factors, A = N(a) ÷ ∏(a − other roots).',
    [['t', 'Denominator', 's', 1, [[1, '(x − a)(x − b)'], [2, '(x − a)²'], [3, '(x − a)(x − b)(x − d)']]], ['p', 'Numerator: p·x² (type 3 only)', 'n', 1, '', { show: 'if(t==3,1,0)' }], ['q', 'Numerator: q·x', 'n', 3], ['r', 'Numerator: constant r', 'n', 5], ['a', 'a', 'n', 1], ['b', 'b', 'n', -2, '', { show: '(t==1)+(t==3)' }], ['d', 'd', 'n', 3, '', { show: 'if(t==3,1,0)' }]],
    function (v) {
      var N = function (x) { return (+v.t === 3 ? v.p : 0) * x * x + v.q * x + v.r; }, term = function (c, root) { var cs = sg(c); return (cs.indexOf('/') > -1 ? '(' + cs + ')' : cs) + '/(x ' + (root <= 0 ? '+ ' + frac(-root) : '− ' + frac(root)) + ')'; }, out, A, B, Cc;
      if (+v.t === 1) { if (v.a === v.b) return { error: 'a and b must differ (use the repeated-factor type).' }; A = N(v.a) / (v.a - v.b); B = N(v.b) / (v.b - v.a); out = term(A, v.a) + '  +  ' + term(B, v.b); }
      else if (+v.t === 2) { A = v.q; B = v.q * v.a + v.r; out = term(A, v.a) + '  +  ' + sg(B) + '/(x ' + (v.a <= 0 ? '+ ' + frac(-v.a) : '− ' + frac(v.a)) + ')²'; }
      else { if (v.a === v.b || v.a === v.d || v.b === v.d) return { error: 'a, b and d must be different.' }; A = N(v.a) / ((v.a - v.b) * (v.a - v.d)); B = N(v.b) / ((v.b - v.a) * (v.b - v.d)); Cc = N(v.d) / ((v.d - v.a) * (v.d - v.b)); out = term(A, v.a) + '  +  ' + term(B, v.b) + '  +  ' + term(Cc, v.d); }
      return { results: [Mt('Decomposition', out), Rx('A', A, 6), Rx('B', B, 6)].concat(Cc !== undefined ? [Rx('C', Cc, 6)] : []) };
    });

  C('laplace-transform-calculator', 'Laplace Transform Calculator', 'math/calculus', 'Laplace transform of common functions with the region of convergence.', 'F(s) = ∫₀^∞ f(t) e^(−st) dt. Uses the standard transform table.',
    [['f', 'Function f(t)', 's', 3, [[1, 'tⁿ'], [2, 'e^(at)'], [3, 'sin(ωt)'], [4, 'cos(ωt)'], [5, 'sinh(at)'], [6, 'cosh(at)'], [7, 't·e^(at)'], [8, 'tⁿ·e^(at)'], [9, 'e^(at)·sin(ωt)'], [10, 'e^(at)·cos(ωt)'], [11, 'u(t − a)  (unit step)'], [12, 'δ(t − a)  (impulse)']]], ['n', 'n', 'i', 2, '', { show: '(f==1)+(f==8)' }], ['a', 'a', 'n', 2, '', { show: 'if(f==1,0,if(f==3,0,if(f==4,0,1)))' }], ['w', 'ω', 'n', 3, '', { show: '(f==3)+(f==4)+(f==9)+(f==10)' }], ['s', 'Evaluate F(s) at s =', 'n', 5]],
    function (v) {
      var f = +v.f, n = Math.max(0, Math.round(v.n)), a = v.a, w = v.w, s = v.s, fact = function (k) { var r = 1; for (var i = 2; i <= k; i++) r *= i; return r; }, F, txt, roc;
      var sa = 's' + (a < 0 ? ' + ' + frac(-a) : a > 0 ? ' − ' + frac(a) : '');
      switch (f) {
        case 1: txt = n + '! / s^' + (n + 1) + ' = ' + fact(n) + ' / s^' + (n + 1); F = fact(n) / Math.pow(s, n + 1); roc = 's > 0'; break;
        case 2: txt = '1 / (' + sa + ')'; F = 1 / (s - a); roc = 's > ' + a; break;
        case 3: txt = frac(w) + ' / (s² + ' + frac(w * w) + ')'; F = w / (s * s + w * w); roc = 's > 0'; break;
        case 4: txt = 's / (s² + ' + frac(w * w) + ')'; F = s / (s * s + w * w); roc = 's > 0'; break;
        case 5: txt = frac(a) + ' / (s² − ' + frac(a * a) + ')'; F = a / (s * s - a * a); roc = 's > ' + Math.abs(a); break;
        case 6: txt = 's / (s² − ' + frac(a * a) + ')'; F = s / (s * s - a * a); roc = 's > ' + Math.abs(a); break;
        case 7: txt = '1 / (' + sa + ')²'; F = 1 / Math.pow(s - a, 2); roc = 's > ' + a; break;
        case 8: txt = fact(n) + ' / (' + sa + ')^' + (n + 1); F = fact(n) / Math.pow(s - a, n + 1); roc = 's > ' + a; break;
        case 9: txt = frac(w) + ' / ((' + sa + ')² + ' + frac(w * w) + ')'; F = w / (Math.pow(s - a, 2) + w * w); roc = 's > ' + a; break;
        case 10: txt = '(' + sa + ') / ((' + sa + ')² + ' + frac(w * w) + ')'; F = (s - a) / (Math.pow(s - a, 2) + w * w); roc = 's > ' + a; break;
        case 11: txt = 'e^(−' + frac(a) + 's) / s'; F = Math.exp(-a * s) / s; roc = 's > 0 (a ≥ 0)'; break;
        default: txt = 'e^(−' + frac(a) + 's)'; F = Math.exp(-a * s); roc = 'all s (a ≥ 0)';
      }
      if (!isFinite(F)) return { error: 'F(s) is undefined at s = ' + s + ' — choose s inside the region of convergence.' };
      return { results: [Mt('F(s)', txt), Tx('Region of convergence', roc), Rx('F(' + s + ')', F, 8)] };
    });

  C('taylor-series-calculator', 'Taylor / Maclaurin Series Calculator', 'math/calculus', 'Series expansion of common functions and how close n terms get.', 'Maclaurin series about x = 0. The error shrinks as you add terms (inside the radius of convergence).',
    [['f', 'Function', 's', 1, [[1, 'e^x'], [2, 'sin x'], [3, 'cos x'], [4, 'ln(1 + x)'], [5, '1 / (1 − x)'], [6, 'arctan x'], [7, 'sinh x'], [8, 'cosh x']]], ['x', 'x =', 'n', 0.5], ['n', 'Number of terms', 'i', 6]],
    function (v) {
      var f = +v.f, x = v.x, N = Math.max(1, Math.min(20, Math.round(v.n))), fa = function (k) { var r = 1; for (var i = 2; i <= k; i++) r *= i; return r; };
      var term = [function (k) { return Math.pow(x, k) / fa(k); }, function (k) { return Math.pow(-1, k) * Math.pow(x, 2 * k + 1) / fa(2 * k + 1); }, function (k) { return Math.pow(-1, k) * Math.pow(x, 2 * k) / fa(2 * k); }, function (k) { return Math.pow(-1, k) * Math.pow(x, k + 1) / (k + 1); }, function (k) { return Math.pow(x, k); }, function (k) { return Math.pow(-1, k) * Math.pow(x, 2 * k + 1) / (2 * k + 1); }, function (k) { return Math.pow(x, 2 * k + 1) / fa(2 * k + 1); }, function (k) { return Math.pow(x, 2 * k) / fa(2 * k); }][f - 1];
      var exact = [Math.exp(x), Math.sin(x), Math.cos(x), Math.log(1 + x), 1 / (1 - x), Math.atan(x), Math.sinh(x), Math.cosh(x)][f - 1], radius = [Infinity, Infinity, Infinity, 1, 1, 1, Infinity, Infinity][f - 1];
      if (Math.abs(x) >= radius && radius !== Infinity) return { error: 'x must satisfy |x| < ' + radius + ' for this series to converge.' };
      var s = 0, rows = []; for (var k = 0; k < N; k++) { var t = term(k); s += t; rows.push([k + 1, t, s, Math.abs(exact - s)]); }
      var series = ['1 + x + x²/2! + x³/3! + …', 'x − x³/3! + x⁵/5! − …', '1 − x²/2! + x⁴/4! − …', 'x − x²/2 + x³/3 − …', '1 + x + x² + x³ + …', 'x − x³/3 + x⁵/5 − …', 'x + x³/3! + x⁵/5! + …', '1 + x²/2! + x⁴/4! + …'][f - 1];
      return { results: [Mx('Series sum (' + N + ' terms)', s, 10), Rx('Exact value', exact, 10), Rx('Absolute error', Math.abs(exact - s), 12), Tx('Series', series), Tx('Radius of convergence', radius === Infinity ? 'All real x' : '|x| < ' + radius)], table: { head: ['Term #', 'Term value', 'Partial sum', 'Error'], rows: rows, fmt: ['int', 'num', 'num', 'num'], title: 'Term by term' } };
    });

  C('differential-equation-calculator', 'Differential Equation Solver (Linear, Constant Coefficients)', 'math/calculus', 'Solve first-order and second-order linear ODEs with initial conditions.', "First order: y' + p·y = q. Second order: a·y'' + b·y' + c·y = 0 (roots of the characteristic equation).",
    [['t', 'Type', 'g', 1, [[1, "y' + p·y = q"], [2, "a·y'' + b·y' + c·y = 0"]]], ['p', 'p', 'n', 2, '', { show: 't==1' }], ['q', 'q', 'n', 6, '', { show: 't==1' }], ['a', 'a', 'n', 1, '', { show: 't==2' }], ['b', 'b', 'n', 2, '', { show: 't==2' }], ['c', 'c', 'n', 5, '', { show: 't==2' }], ['y0', 'y(0)', 'n', 1], ['v0', "y'(0)", 'n', 0, '', { show: 't==2' }], ['T', 'Plot up to t =', 'n', 5]],
    function (v) {
      var fn, txt, extra = [];
      if (+v.t === 1) {
        if (v.p === 0) { fn = function (t) { return v.y0 + v.q * t; }; txt = 'y = ' + clean(v.y0) + ' + ' + clean(v.q) + '·t'; }
        else { var ss = v.q / v.p, c1 = v.y0 - ss; fn = function (t) { return ss + c1 * Math.exp(-v.p * t); }; txt = 'y = ' + clean(ss) + ' + (' + clean(c1) + ')·e^(−' + clean(v.p) + 't)'; extra.push(Rx('Steady state (t → ∞)', v.p > 0 ? ss : NaN, 6)); }
      } else {
        if (v.a === 0) return { error: 'a cannot be zero.' };
        var D = v.b * v.b - 4 * v.a * v.c;
        if (D > 0) { var r1 = (-v.b + Math.sqrt(D)) / (2 * v.a), r2 = (-v.b - Math.sqrt(D)) / (2 * v.a), C2 = (v.v0 - r1 * v.y0) / (r2 - r1), C1 = v.y0 - C2; fn = function (t) { return C1 * Math.exp(r1 * t) + C2 * Math.exp(r2 * t); }; txt = 'y = ' + clean(C1) + '·e^(' + clean(r1) + 't) + ' + clean(C2) + '·e^(' + clean(r2) + 't)'; extra.push(Tx('Roots', clean(r1) + ', ' + clean(r2) + ' (overdamped)')); }
        else if (D === 0) { var r = -v.b / (2 * v.a), K2 = v.v0 - r * v.y0; fn = function (t) { return (v.y0 + K2 * t) * Math.exp(r * t); }; txt = 'y = (' + clean(v.y0) + ' + ' + clean(K2) + 't)·e^(' + clean(r) + 't)'; extra.push(Tx('Root', clean(r) + ' (critically damped)')); }
        else { var al = -v.b / (2 * v.a), be = Math.sqrt(-D) / (2 * v.a), K = (v.v0 - al * v.y0) / be; fn = function (t) { return Math.exp(al * t) * (v.y0 * Math.cos(be * t) + K * Math.sin(be * t)); }; txt = 'y = e^(' + clean(al) + 't)·(' + clean(v.y0) + '·cos ' + clean(be) + 't + ' + clean(K) + '·sin ' + clean(be) + 't)'; extra.push(Tx('Roots', clean(al) + ' ± ' + clean(be) + 'i (' + (al < 0 ? 'decaying oscillation' : al > 0 ? 'growing oscillation' : 'steady oscillation') + ')')); }
      }
      var N = 40, pts = [], lab = [], i; for (i = 0; i <= N; i++) { var t = v.T * i / N; pts.push(fn(t)); lab.push(clean(t).toFixed(2)); }
      return { results: [Mt('Solution', txt), Rx('y(' + v.T + ')', fn(v.T), 6)].concat(extra), chart: { type: 'line', title: 'y(t)', labels: lab, series: [{ l: 'y', pts: pts }], f: 'num' } };
    });

  C('relative-frequency-calculator', 'Relative Frequency Calculator', 'statistics/descriptive', 'Frequency, relative frequency and cumulative frequency of your data.', 'Relative frequency = frequency ÷ total observations.',
    [['d', 'Data — numbers or words separated by commas or lines', 'ta', 'red, blue, red, green, blue, red, yellow, green, red, blue', '', { rows: 4 }]],
    function (v) {
      var d = String(v.d).split(/[\n,;]+/).map(function (x) { return x.trim(); }).filter(Boolean); if (d.length < 2) return { error: 'Enter at least two values.' };
      var cnt = {}, order = []; d.forEach(function (x) { if (!(x in cnt)) { cnt[x] = 0; order.push(x); } cnt[x]++; });
      var allNum = order.every(function (x) { return isFinite(+x); }); if (allNum) order.sort(function (a, b) { return a - b; });
      var cum = 0, rows = order.map(function (k) { cum += cnt[k]; return [k, cnt[k], cnt[k] / d.length, cnt[k] / d.length * 100, cum / d.length * 100]; });
      var top = rows.slice().sort(function (a, b) { return b[1] - a[1]; })[0];
      return { results: [Mx('Total observations', d.length, 0), Mt('Most frequent', top[0] + ' (' + top[1] + ' times)'), Rp('Its relative frequency', top[3], 1), Rx('Distinct values', order.length, 0)], table: { head: ['Value', 'Frequency', 'Relative freq.', 'Percent', 'Cumulative %'], rows: rows, fmt: ['', 'int', 'num', 'pct', 'pct'], title: 'Frequency table' }, chart: { type: 'donut', data: rows.map(function (r) { return { l: String(r[0]), v: r[1] }; }), f: 'int' } };
    });

  /* ===== Geometry & trig ===== */
  C('perimeter-calculator', 'Perimeter Calculator', 'geometry/shapes', 'Perimeter (and area) of common shapes.', 'Perimeter is the distance around a shape. Circle: 2πr · Rectangle: 2(l + w).',
    [['sh', 'Shape', 's', 1, [[1, 'Rectangle'], [2, 'Square'], [3, 'Triangle'], [4, 'Circle'], [5, 'Trapezoid'], [6, 'Regular polygon'], [7, 'Rhombus'], [8, 'Parallelogram'], [9, 'Ellipse'], [10, 'Semicircle'], [11, 'Sector']]], ['a', 'Side a / length / radius', 'n', 8], ['b', 'Side b / width', 'n', 5, '', { show: '(sh==1)+(sh==3)+(sh==5)+(sh==8)+(sh==9)' }], ['c', 'Side c / leg', 'n', 6, '', { show: '(sh==3)+(sh==5)' }], ['d', 'Side d / leg', 'n', 5, '', { show: 'if(sh==5,1,0)' }], ['n', 'Number of sides', 'i', 6, '', { show: 'if(sh==6,1,0)' }], ['ang', 'Angle (degrees)', 'n', 60, '', { show: 'if(sh==11,1,0)' }]],
    function (v) {
      var a = v.a, b = v.b, c = v.c, d = v.d, p, ar, PI = Math.PI;
      switch (+v.sh) {
        case 1: p = 2 * (a + b); ar = a * b; break; case 2: p = 4 * a; ar = a * a; break;
        case 3: if (a + b <= c || a + c <= b || b + c <= a) return { error: 'These sides cannot form a triangle.' }; p = a + b + c; var s = p / 2; ar = Math.sqrt(s * (s - a) * (s - b) * (s - c)); break;
        case 4: p = 2 * PI * a; ar = PI * a * a; break; case 5: p = a + b + c + d; break;
        case 6: p = v.n * a; ar = v.n * a * a / (4 * Math.tan(PI / v.n)); break; case 7: p = 4 * a; break; case 8: p = 2 * (a + b); break;
        case 9: var h = Math.pow((a - b) / (a + b), 2); p = PI * (a + b) * (1 + 3 * h / (10 + Math.sqrt(4 - 3 * h))); ar = PI * a * b; break;
        case 10: p = PI * a + 2 * a; ar = PI * a * a / 2; break; case 11: p = 2 * a + a * v.ang * PI / 180; ar = 0.5 * a * a * v.ang * PI / 180; break;
      }
      var res = [Mx('Perimeter', p, 6)]; if (ar !== undefined) res.push(Rx('Area', ar, 6)); return { results: res };
    }, { pop: 1 });

  C('sin-cos-tan-calculator', 'Sine, Cosine & Tangent Calculator', 'geometry/trig', 'All six trigonometric ratios of an angle, in degrees, radians or gradians.', 'sin, cos, tan and their reciprocals csc, sec, cot.',
    [['x', 'Angle', 'n', 30], ['u', 'Unit', 'g', 1, [[1, 'Degrees'], [2, 'Radians'], [3, 'Gradians']]]],
    function (v) {
      var r = +v.u === 1 ? v.x * Math.PI / 180 : +v.u === 2 ? v.x : v.x * Math.PI / 200, deg = r * 180 / Math.PI, sn = Math.sin(r), cs = Math.cos(r), tn = Math.abs(cs) < 1e-12 ? NaN : sn / cs, nz = function (z) { return Math.abs(z) < 1e-12 ? NaN : z; };
      var q = ((deg % 360) + 360) % 360, quad = q === 0 || q === 90 || q === 180 || q === 270 ? 'On an axis' : q < 90 ? 'Quadrant I' : q < 180 ? 'Quadrant II' : q < 270 ? 'Quadrant III' : 'Quadrant IV';
      var ra = q % 180 > 90 ? 180 - q % 180 : q % 180; if (q > 180 && q < 270) ra = q - 180; else if (q >= 270) ra = 360 - q; else if (q > 90) ra = 180 - q;
      var out = function (z) { return isNaN(z) ? 'undefined' : clean(z); };
      return { results: [M('sin', clean(sn), 'num', { dp: 10 }), Rx('cos', clean(cs), 10), Tx('tan', out(tn)), Tx('csc', out(1 / nz(sn))), Tx('sec', out(1 / nz(cs))), Tx('cot', out(nz(sn) ? cs / sn : NaN)), Rx('Angle in degrees', deg, 8), Rx('Angle in radians', r, 10), Tx('Quadrant', quad), Rx('Reference angle', ra, 6, '°')] };
    }, { pop: 1 });

  C('coordinate-geometry-calculator', 'Coordinate Geometry Calculator (Two Points)', 'geometry/coordinates', 'Distance, midpoint, slope, line equation and angle between two points.', 'd = √((x₂ − x₁)² + (y₂ − y₁)²) · slope m = (y₂ − y₁) ÷ (x₂ − x₁).',
    [['x1', 'x₁', 'n', 1], ['y1', 'y₁', 'n', 2], ['x2', 'x₂', 'n', 7], ['y2', 'y₂', 'n', 10], ['m', 'Section ratio m (point dividing the segment m : n)', 'n', 1], ['n', 'n', 'n', 1]],
    function (v) {
      var dx = v.x2 - v.x1, dy = v.y2 - v.y1, d = Math.hypot(dx, dy), mx = (v.x1 + v.x2) / 2, my = (v.y1 + v.y2) / 2, sl = dx === 0 ? NaN : dy / dx, px = (v.m * v.x2 + v.n * v.x1) / (v.m + v.n), py = (v.m * v.y2 + v.n * v.y1) / (v.m + v.n), eq;
      if (dx === 0 && dy === 0) return { error: 'The two points are the same.' };
      if (dx === 0) eq = 'x = ' + frac(v.x1); else { var b = v.y1 - sl * v.x1; eq = 'y = ' + (sl === 1 ? '' : sl === -1 ? '−' : frac(sl)) + 'x ' + (b < 0 ? '− ' + frac(-b) : '+ ' + frac(b)); }
      var pts = [[v.x1, v.y1], [v.x2, v.y2]];
      return { results: [Mx('Distance', d, 6), Tx('Midpoint', '(' + frac(mx) + ', ' + frac(my) + ')'), Tx('Slope', dx === 0 ? 'undefined (vertical)' : frac(sl)), Tx('Line equation', eq), Rx('Angle of inclination', dx === 0 ? 90 : Math.atan(sl) * 180 / Math.PI, 4, '°'), Tx('Perpendicular slope', dx === 0 ? '0' : dy === 0 ? 'undefined' : frac(-1 / sl)), Tx('Point dividing ' + v.m + ':' + v.n, '(' + frac(px) + ', ' + frac(py) + ')')], chart: { type: 'scatter', title: 'The two points', series: [{ l: 'Line', pts: pts, line: true }], f: 'num' } };
    });

  /* ===== Lab science ===== */
  C('stoichiometry-calculator', 'Stoichiometry Calculator', 'science/chemistry', 'Mass and moles of a product from the mass of a reactant.', 'moles A = mass ÷ molar mass; moles B = moles A × (coefficient B ÷ coefficient A).',
    [['m', 'Mass of reactant A (g)', 'n', 10], ['ma', 'Molar mass of A (g/mol)', 'n', 32.04], ['ca', 'Coefficient of A in the balanced equation', 'n', 2], ['cb', 'Coefficient of B (what you want)', 'n', 2], ['mb', 'Molar mass of B (g/mol)', 'n', 18.02], ['y', 'Percent yield', 'p', 100], ['g', 'B is a gas at STP (22.414 L/mol)', 'c', 0]],
    function (v) {
      var na = v.m / v.ma, nb = na * v.cb / v.ca, mass = nb * v.mb * v.y / 100, res = [Mx('Mass of B', mass, 4, 'g'), Rx('Moles of A', na, 6, 'mol'), Rx('Moles of B', nb * v.y / 100, 6, 'mol'), Rx('Theoretical mass of B (100% yield)', nb * v.mb, 4, 'g')];
      if (v.g) res.push(Rx('Gas volume at STP', nb * v.y / 100 * 22.414, 3, 'L')); return { results: res };
    });

  C('ligation-calculator', 'DNA Ligation Calculator', 'science/biology', 'How much insert DNA to add for a chosen insert : vector molar ratio.', 'Insert (ng) = ratio × vector (ng) × insert length ÷ vector length.',
    [['v', 'Vector amount (ng)', 'n', 50], ['vl', 'Vector length (bp)', 'n', 5000], ['il', 'Insert length (bp)', 'n', 1000], ['r', 'Molar ratio insert : vector', 'n', 3], ['vc', 'Vector concentration (ng/µL)', 'n', 25, '', { opt: 1 }], ['ic', 'Insert concentration (ng/µL)', 'n', 20, '', { opt: 1 }]],
    function (v) {
      var ins = v.r * v.v * v.il / v.vl, res = [Mx('Insert to add', ins, 2, 'ng'), Rx('Vector pmol', v.v / (v.vl * 0.65) , 4, 'pmol'), Rx('Insert pmol', ins / (v.il * 0.65), 4, 'pmol')];
      if (v.vc > 0) res.push(Rx('Vector volume', v.v / v.vc, 2, 'µL')); if (v.ic > 0) res.push(Rx('Insert volume', ins / v.ic, 2, 'µL')); return { results: res };
    });

  C('primer-tm-calculator', 'Primer Tm & Annealing Temperature Calculator', 'science/biology', 'Melting temperature and annealing temperature of a DNA primer.', 'Basic: Tm = 64.9 + 41 × (G + C − 16.4) ÷ N. Short primers (< 14 nt): Tm = 2(A + T) + 4(G + C).',
    [['s', 'Primer sequence (5′→3′)', 't', 'ATGCGTACGTTAGCCTAGGA'], ['na', 'Na⁺ concentration (mM)', 'n', 50]],
    function (v) {
      var s = String(v.s).toUpperCase().replace(/[^A-Z]/g, ''); if (!/^[ACGT]+$/.test(s)) return { error: 'Use only A, C, G and T.' };
      var N = s.length, g = (s.match(/G/g) || []).length, c = (s.match(/C/g) || []).length, a = (s.match(/A/g) || []).length, t = (s.match(/T/g) || []).length, gc = (g + c) / N * 100;
      var tm = N < 14 ? 2 * (a + t) + 4 * (g + c) : 64.9 + 41 * (g + c - 16.4) / N, ts = 81.5 + 16.6 * Math.log10(v.na / 1000) + 0.41 * gc - 600 / N;
      return { results: [Mx('Tm (basic)', tm, 1, '°C'), Rx('Recommended annealing temperature', tm - 5, 1, '°C'), Rx('Tm (salt-adjusted)', ts, 1, '°C'), Rx('Length', N, 0, 'nt'), Rp('GC content', gc, 1), Tx('Counts', 'A ' + a + ' · T ' + t + ' · G ' + g + ' · C ' + c), Tx('Quality', gc >= 40 && gc <= 60 ? 'GC content in the ideal 40–60% range' : 'GC content outside the ideal 40–60% range')] };
    });

  C('protein-concentration-calculator', 'Protein Concentration Calculator (A280)', 'science/biology', 'Protein concentration from absorbance at 280 nm (Beer–Lambert).', 'c = A ÷ (ε × path length), with ε in M⁻¹cm⁻¹. For a 1 mg/mL solution use the A₂₈₀ of 0.1%.',
    [['a', 'Absorbance at 280 nm', 'n', 0.85], ['e', 'Extinction coefficient ε (M⁻¹cm⁻¹)', 'n', 43824], ['mw', 'Molecular weight (kDa)', 'n', 50], ['l', 'Path length (cm)', 'n', 1], ['df', 'Dilution factor', 'n', 1]],
    function (v) { var m = v.a * v.df / (v.e * v.l), mg = m * v.mw * 1000; return { results: [Mx('Concentration', mg, 3, 'mg/mL'), Rx('Molar concentration', m * 1e6, 3, 'µM'), Rx('A280 of a 1 mg/mL solution', v.e * v.l / (v.mw * 1000), 3)] }; });

  C('cell-seeding-calculator', 'Cell Seeding & Dilution Calculator', 'science/biology', 'Volume of cell suspension to seed a plate at your target density.', 'Volume = cells wanted ÷ cell concentration.',
    [['c', 'Cell concentration (cells/mL)', 'n', 1200000], ['t', 'Target cells per well', 'n', 10000], ['w', 'Number of wells', 'i', 24], ['v', 'Medium per well (µL)', 'n', 500], ['ex', 'Extra for pipetting loss', 'p', 10]],
    function (v) {
      var tot = v.t * v.w * (1 + v.ex / 100), sus = tot / v.c, med = v.v * v.w * (1 + v.ex / 100) / 1000;
      return { results: [Mx('Cell suspension to take', sus * 1000, 1, 'µL'), Rx('Total cells needed', tot, 0), Rx('Medium to add', Math.max(0, med - sus), 2, 'mL'), Rx('Cells per well in the final mix', v.t, 0), Rx('Final suspension concentration', tot / med, 0, 'cells/mL')] };
    });

  /* ===== Electrical & construction ===== */
  C('three-phase-power-calculator', 'Three-Phase Power Calculator', 'engineering/electrical', 'kW, kVA, kVAR and current of a three-phase load.', 'P = √3 × V(line) × I × PF. S = √3 × V × I.',
    [['m', 'Find', 'g', 1, [[1, 'Power from current'], [2, 'Current from kW'], [3, 'Current from kVA']]], ['v', 'Line-to-line voltage (V)', 'n', 415], ['i', 'Current (A)', 'n', 40, '', { show: 'm==1' }], ['kw', 'Power (kW)', 'n', 22, '', { show: 'm==2' }], ['kva', 'Apparent power (kVA)', 'n', 30, '', { show: 'm==3' }], ['pf', 'Power factor', 'n', 0.85, '', { show: 'if(m==3,0,1)' }]],
    function (v) {
      var r3 = Math.sqrt(3), kw, kva, i, kvar; if (v.pf <= 0 || v.pf > 1) return { error: 'Power factor must be between 0 and 1.' };
      if (+v.m === 1) { i = v.i; kva = r3 * v.v * i / 1000; kw = kva * v.pf; } else if (+v.m === 2) { kw = v.kw; kva = kw / v.pf; i = kva * 1000 / (r3 * v.v); } else { kva = v.kva; i = kva * 1000 / (r3 * v.v); kw = kva * (v.pf || 1); }
      kvar = Math.sqrt(Math.max(0, kva * kva - kw * kw));
      return { results: [Mx(+v.m === 1 ? 'Real power' : 'Current', +v.m === 1 ? kw : i, 3, +v.m === 1 ? 'kW' : 'A'), Rx('Apparent power', kva, 3, 'kVA'), Rx('Reactive power', kvar, 3, 'kVAR'), Rx('Current per phase', i, 3, 'A'), Rx('Real power', kw, 3, 'kW')] };
    }, { pop: 1 });

  var WIRE = { '14': 0.0097, '12': 0.0133, '10': 0.0211, '8': 0.0366, '6': 0.0507, '4': 0.0824, '3': 0.0973, '2': 0.1158, '1': 0.1562, '1/0': 0.1855, '2/0': 0.2223, '3/0': 0.2679, '4/0': 0.3237 };
  var EMT = [['1/2"', 0.304], ['3/4"', 0.533], ['1"', 0.864], ['1-1/4"', 1.496], ['1-1/2"', 2.036], ['2"', 3.356], ['2-1/2"', 5.858], ['3"', 8.846], ['3-1/2"', 11.545], ['4"', 14.753]];
  C('conduit-fill-calculator', 'Conduit Fill Calculator (EMT, THHN)', 'engineering/electrical', 'Smallest EMT conduit for your wires and the percentage fill (NEC limits).', 'Fill limits (NEC Chapter 9): 53% for one wire, 31% for two, 40% for three or more.',
    [['w', 'Wires — "AWG count", one per line (14, 12, 10, 8, 6, 4, 3, 2, 1, 1/0 … 4/0)', 'ta', '12 6\n10 2\n8 1', '', { rows: 4 }], ['c', 'Check this conduit', 's', 2, [[0, 'Find the smallest'], [1, '1/2"'], [2, '3/4"'], [3, '1"'], [4, '1-1/4"'], [5, '1-1/2"'], [6, '2"'], [7, '2-1/2"'], [8, '3"'], [9, '3-1/2"'], [10, '4"']]]],
    function (v) {
      var ws = String(v.w).trim().split(/\n/).map(function (l) { var m = /^\s*([0-9/]+)\s*(?:awg)?[\s:,x]+(\d+)/i.exec(l); return m ? [m[1], +m[2]] : null; }).filter(Boolean); if (!ws.length) return { error: 'Enter lines like "12 6".' };
      var area = 0, cnt = 0, bad = null; ws.forEach(function (w) { if (!WIRE[w[0]]) bad = w[0]; else { area += WIRE[w[0]] * w[1]; cnt += w[1]; } }); if (bad) return { error: 'Unknown wire size "' + bad + '". Use 14, 12, 10, 8, 6, 4, 3, 2, 1, 1/0, 2/0, 3/0 or 4/0.' };
      var lim = cnt === 1 ? 0.53 : cnt === 2 ? 0.31 : 0.4, pick = EMT.filter(function (e) { return area <= e[1] * lim; })[0], chk = +v.c ? EMT[v.c - 1] : pick;
      if (!chk) return { error: 'The wires do not fit even a 4" EMT — split them over several conduits.' };
      var rows = EMT.map(function (e) { return [e[0], e[1], e[1] * lim, area / e[1] * 100, area <= e[1] * lim ? 'Fits' : 'Too full']; });
      return { results: [Mt('Smallest conduit that fits', pick ? pick[0] + ' EMT' : 'None up to 4"'), Rx('Total wire area', area, 4, 'in²'), Rx('Fill limit', lim * 100, 0, '%'), Rp('Fill in ' + chk[0] + ' conduit', area / chk[1] * 100, 1), Tx('Selected conduit', area <= chk[1] * lim ? chk[0] + ' passes' : chk[0] + ' is over the limit')], table: { head: ['Conduit', 'Area in²', 'Allowed in²', 'Fill %', 'Result'], rows: rows, fmt: ['', 'num', 'num', 'pct', ''], title: 'All sizes' }, note: 'Wire areas are for THHN/THWN conductors. Always confirm with the current electrical code.' };
    });

  C('boq-estimator-calculator', 'BOQ Estimator (Building Material Quantities & Cost)', 'construction/home-cost', 'Thumb-rule quantities and cost of the main materials for a house.', 'Rule of thumb per sq ft of built-up area: cement 0.4 bag, steel 4 kg, sand 1.2 cft, aggregate 1.35 cft, bricks 8.',
    [['a', 'Built-up area per floor (sq ft)', 'n', 1000], ['f', 'Floors', 'i', 2], ['q', 'Construction quality', 's', 1, [[0.9, 'Economy'], [1, 'Standard'], [1.15, 'Premium']]], ['rc', 'Cement price per 50 kg bag', 'm', 400], ['rs', 'Steel price per kg', 'm', 65], ['rsd', 'Sand price per cft', 'm', 55], ['rag', 'Aggregate price per cft', 'm', 45], ['rb', 'Brick price each', 'm', 9]],
    function (v) {
      var A = v.a * v.f, k = v.q, rows = [['Cement (bags)', A * 0.4 * k, v.rc], ['Steel (kg)', A * 4 * k, v.rs], ['Sand (cft)', A * 1.2 * k, v.rsd], ['Aggregate (cft)', A * 1.35 * k, v.rag], ['Bricks (nos.)', A * 8, v.rb]].map(function (r) { return [r[0], r[1], r[2], r[1] * r[2]]; });
      var tot = rows.reduce(function (s, r) { return s + r[3]; }, 0);
      return { results: [Mo('Estimated material cost', tot), Rx('Built-up area', A, 0, 'sq ft'), Ro('Material cost per sq ft', tot / A, 0), Rx('Cement', A * 0.4 * k, 0, 'bags'), Rx('Steel', A * 4 * k, 0, 'kg'), Rx('Bricks', A * 8, 0)], table: { head: ['Material', 'Quantity', 'Rate', 'Cost'], rows: rows, fmt: ['', 'num', 'money', 'money'], title: 'Bill of quantities' }, chart: { type: 'donut', data: rows.map(function (r) { return { l: r[0], v: r[3] }; }), f: 'money' }, note: 'Thumb-rule figures for RCC framed houses; actual quantities come from drawings. Materials are roughly 55–65% of total build cost.' };
    });

  C('plywood-calculator', 'Plywood / Sheet Calculator', 'construction/flooring-walls', 'Number of plywood or board sheets for an area, with waste and cost.', 'Sheets = area ÷ sheet area × (1 + waste), rounded up.',
    [['l', 'Length of the area (ft)', 'n', 12], ['w', 'Width of the area (ft)', 'n', 10], ['s', 'Sheet size', 's', 32, [[32, '4 × 8 ft'], [18, '3 × 6 ft'], [24, '4 × 6 ft'], [20, '4 × 5 ft']]], ['ws', 'Waste allowance', 'p', 10], ['p', 'Price per sheet', 'm', 2400]],
    function (v) { var area = v.l * v.w, raw = area / v.s, n = Math.ceil(raw * (1 + v.ws / 100)); return { results: [Mx('Sheets to buy', n, 0), Rx('Exact sheets (no waste)', raw, 2), Rx('Area to cover', area, 1, 'sq ft'), Mo('Total cost', n * v.p), Rx('Left over', n * v.s - area, 1, 'sq ft')] }; });

  /* ===== Auto & solar ===== */
  C('road-tax-calculator', 'Road Tax & On-Road Price Calculator (India)', 'auto-travel/vehicle', 'On-road price of a new vehicle from ex-showroom price, road tax and charges.', 'On-road price = ex-showroom + road tax + registration + insurance + other charges.',
    [['p', 'Ex-showroom price', 'm', 1000000], ['rt', 'Road tax rate (check your state)', 'p', 10], ['rg', 'Registration and smart-card fee', 'm', 3000], ['ins', 'Insurance (first year)', 'm', 38000], ['ot', 'Other charges (FASTag, handling, accessories)', 'm', 15000]],
    function (v) { var tax = v.p * v.rt / 100, tot = v.p + tax + v.rg + v.ins + v.ot; return { results: [Mo('On-road price', tot), Ro('Road tax', tax), Rp('Add-ons over ex-showroom', (tot - v.p) / v.p * 100, 1), Ro('Down payment at 80% loan', tot - v.p * 0.8)], chart: { type: 'donut', data: [{ l: 'Ex-showroom', v: v.p }, { l: 'Road tax', v: tax }, { l: 'Insurance', v: v.ins }, { l: 'Other', v: v.rg + v.ot }], f: 'money' }, note: 'Road tax slabs differ by state, fuel type and price band. Electric vehicles are often exempt.' }; }, { pop: 1 });

  C('cc-to-hp-calculator', 'Engine CC to HP Calculator', 'auto-travel/vehicle', 'A rough horsepower figure from engine displacement.', 'HP ≈ displacement (litres) × typical output per litre for the engine type.',
    [['cc', 'Engine displacement (cc)', 'n', 1500], ['t', 'Engine type', 's', 65, [[65, 'Petrol car, naturally aspirated'], [100, 'Petrol car, turbocharged'], [70, 'Diesel car, turbocharged'], [85, 'Motorcycle / scooter'], [120, 'High-performance engine'], [45, 'Tractor / low-revving diesel']]]],
    function (v) { var hp = v.cc / 1000 * v.t; return { results: [Mx('Estimated power', hp, 0, 'hp'), Rx('In kilowatts', hp * 0.7457, 0, 'kW'), Rx('In PS (metric hp)', hp * 1.01387, 0, 'PS'), Rx('Output per litre', v.t, 0, 'hp/L')], note: 'Displacement does not fix power: tuning, turbo boost and RPM decide it. Read the spec sheet for the real number.' }; });

  C('toll-cost-calculator', 'Toll Cost Calculator', 'auto-travel/travel', 'Toll for a road trip, with return-trip and monthly pass comparison.', 'Toll = distance on tolled road × rate per km (or plaza count × fee).',
    [['d', 'Distance on tolled roads (km)', 'n', 280], ['r', 'Rate per km for your vehicle', 'm', 2.4], ['rt', 'Return trip', 'c', 1], ['tr', 'Trips per month', 'n', 4], ['mp', 'Monthly pass price (optional)', 'm', 340, '', { opt: 1 }]],
    function (v) { var one = v.d * v.r, trip = v.rt ? one * 1.0 + one * 0.8 : one, mo = trip * v.tr, res = [Mo('Toll for the trip', trip), Ro('One way', one), Ro('Per km', v.r, 2), Ro('Per month', mo), Ro('Per year', mo * 12)]; if (v.mp > 0) res.push(Tx('Monthly pass', mo > v.mp ? 'Saves ' + CW.fmt.money(mo - v.mp, undefined, 0) + ' a month' : 'Not worth it at this usage')); return { results: res, note: 'Return-trip discounts (about 20%) apply on many Indian highways within 24 hours; set the rate from the plaza board.' }; });

  C('pm-surya-ghar-subsidy-calculator', 'PM Surya Ghar Rooftop Solar Subsidy Calculator', 'auto-travel/ev-solar', 'Central subsidy, net cost and payback for a rooftop solar system.', 'Subsidy: ₹30,000 per kW up to 2 kW, ₹18,000 for the 3rd kW, capped at ₹78,000 for 3 kW and above.',
    [['kw', 'System size (kW)', 'n', 3], ['c', 'System cost per kW', 'm', 62000], ['t', 'Electricity tariff per unit', 'm', 7], ['u', 'Units generated per kW per day', 'n', 4]],
    function (v) {
      var kw = v.kw, sub = Math.min(kw, 2) * 30000 + Math.max(0, Math.min(kw, 3) - 2) * 18000, cost = kw * v.c, net = cost - sub, yr = kw * v.u * 365, save = yr * v.t;
      return { results: [Mo('Central subsidy', sub), Ro('System cost', cost), Ro('Net cost after subsidy', net), Rx('Units generated per year', yr, 0), Ro('Bill saving per year', save), Rx('Payback period', net / save, 1, 'years'), Ro('Savings over 25 years', save * 25 - net)], chart: { type: 'donut', data: [{ l: 'Subsidy', v: sub }, { l: 'You pay', v: net }], f: 'money' }, note: 'Scheme rules, caps and the DISCOM tariff can change — confirm on the official PM Surya Ghar portal.' };
    }, { pop: 1 });
  CW.setCur(['pm-surya-ghar-subsidy-calculator', 'road-tax-calculator', 'boq-estimator-calculator'], 'INR');

  C('heat-pump-savings-calculator', 'Heat Pump Savings Calculator', 'auto-travel/ev-solar', 'Running-cost saving and payback of a heat pump versus a gas or oil boiler.', 'Heat pump cost = heat demand ÷ COP × electricity price; boiler cost = heat demand ÷ efficiency × fuel price.',
    [['h', 'Heat needed per year (kWh)', 'n', 12000], ['e', 'Boiler efficiency', 'p', 88], ['fp', 'Fuel price per kWh', 'm', 0.09, '', { base: 'USD' }], ['cop', 'Heat pump COP (efficiency)', 'n', 3.8], ['ep', 'Electricity price per kWh', 'm', 0.15, '', { base: 'USD' }], ['ins', 'Net installed cost of the heat pump', 'm', 9000, '', { base: 'USD' }]],
    function (v) {
      var boiler = v.h / (v.e / 100) * v.fp, hp = v.h / v.cop * v.ep, sv = boiler - hp;
      return { results: [Mo('Yearly saving', sv, 0), Ro('Boiler running cost', boiler, 0), Ro('Heat pump running cost', hp, 0), sv > 0 ? Rx('Payback period', v.ins / sv, 1, 'years') : Tx('Payback', 'No saving at these prices'), Ro('Saving over 15 years', sv * 15 - v.ins, 0), Rx('Break-even electricity price per kWh', v.fp / (v.e / 100) * v.cop, 3)] };
    });
  CW.defBase = null;
})(window.CW);
