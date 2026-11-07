/* Calcyworld — arithmetic, fractions, number theory, algebra, calculus & matrices */
(function (CW) {
  'use strict';
  var F = CW.F, C = CW.C, M = CW.M, R = CW.Rr, L = CW.list;
  var fx = function (e) { return function (x) { return CW.evaluate(e, { x: x }); }; };
  var N = function (x, d) { return CW.fmt.num(x, d === undefined ? 8 : d); };
  var gcd = function (a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; };
  var esc = CW.esc;
  var tbl = function (rows) { return '<table class="cw-mx"><tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + (typeof x === 'number' ? N(x, 6) : esc(x)) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>'; };

  /* ---------------- Percentages & arithmetic ---------------- */
  F('percentage-increase-calculator', 'Percentage Increase Calculator', 'math/arithmetic', 'Find the percentage increase from an old value to a new value.', '% increase = (new − old) ÷ |old| × 100.',
    [['a', 'Old value', 'n', 80], ['b', 'New value', 'n', 100]],
    [['Percentage change', '(b-a)/abs(a)*100', 'p', '', { dp: 2 }], ['Difference', 'b-a', 'n'], ['Type', 'b-a', 'b', '', { bands: [[0, 'Decrease'], [0.0000001, 'No change'], [Infinity, 'Increase']] }]], { pop: 1 });
  F('percentage-decrease-calculator', 'Percentage Decrease Calculator', 'math/arithmetic', 'Find the percentage decrease from an old value to a new value.', '% decrease = (old − new) ÷ old × 100.',
    [['a', 'Old value', 'n', 120], ['b', 'New value', 'n', 90]],
    [['Percentage decrease', '(a-b)/abs(a)*100', 'p', '', { dp: 2 }], ['Amount lost', 'a-b', 'n'], ['Remaining', 'b/a*100', 'p', '', { dp: 2 }]]);
  F('percent-difference-calculator', 'Percent Difference Calculator', 'math/arithmetic', 'Percent difference between two numbers, relative to their average.', 'Difference = |a − b| ÷ ((a + b) ÷ 2) × 100.',
    [['a', 'First value', 'n', 50], ['b', 'Second value', 'n', 65]],
    [['Percent difference', 'abs(a-b)/((a+b)/2)*100', 'p', '', { dp: 2 }], ['Absolute difference', 'abs(a-b)', 'n'], ['Average', '(a+b)/2', 'n']]);
  F('percent-error-calculator', 'Percent Error Calculator', 'math/arithmetic', 'Percent error between a measured and the true value.', 'Percent error = |measured − true| ÷ |true| × 100.',
    [['m', 'Measured value', 'n', 9.6], ['t', 'True (accepted) value', 'n', 9.81]],
    [['Percent error', 'abs(m-t)/abs(t)*100', 'p', '', { dp: 3 }], ['Absolute error', 'abs(m-t)', 'n'], ['Relative error', 'abs(m-t)/abs(t)', 'n', '', { dp: 5 }]]);
  F('reverse-percentage-calculator', 'Reverse Percentage Calculator', 'math/arithmetic', 'Find the original number before a percentage was added or taken off.', 'Original = final ÷ (1 + p%) for an increase, final ÷ (1 − p%) for a decrease.',
    [['f', 'Final value', 'n', 120], ['p', 'Percentage change', 'p', 20], ['t', 'It was', 'g', 1, [[1, 'Increased'], [2, 'Decreased']]]],
    [['Original value', 'f/(1+if(t==1,1,-1)*p/100)', 'n', '', { dp: 4 }], ['Change amount', 'f-o1', 'n', '', { dp: 4 }]]);
  F('percentage-of-a-number-calculator', 'What Is X% of Y? Calculator', 'math/arithmetic', 'Find a percentage of a number, or what percent one number is of another.', 'X% of Y = X ÷ 100 × Y.',
    [['x', 'Percentage', 'p', 15], ['y', 'Number', 'n', 240]],
    [['X% of Y', 'x/100*y', 'n', '', { dp: 4 }], ['Y plus X%', 'y*(1+x/100)', 'n', '', { dp: 4 }], ['Y minus X%', 'y*(1-x/100)', 'n', '', { dp: 4 }], ['X is what % of Y', 'x/y*100', 'p', '', { dp: 3 }]]);
  F('proportion-calculator', 'Proportion Calculator (Rule of Three)', 'math/arithmetic', 'Solve a ÷ b = c ÷ x for the missing value.', 'a ÷ b = c ÷ x  →  x = b × c ÷ a.',
    [['a', 'A', 'n', 3], ['b', 'B', 'n', 12], ['c', 'C', 'n', 7]],
    [['X', 'b*c/a', 'n', '', { dp: 6 }], ['Ratio A : B', 'b/a', 'n', '', { dp: 4, sub: 'B per 1 of A' }]]);
  F('golden-ratio-calculator', 'Golden Ratio Calculator', 'math/arithmetic', 'Split a length or number into the golden ratio.', 'φ = (1 + √5) ÷ 2 ≈ 1.6180339887.',
    [['a', 'Value', 'n', 100], ['t', 'Treat the value as', 's', 1, [[1, 'The longer part (A)'], [2, 'The shorter part (B)'], [3, 'The whole (A + B)']]]],
    [['Longer part (A)', 'if(t==1,a,if(t==2,a*1.6180339887,a/1.6180339887))', 'n', '', { dp: 4 }], ['Shorter part (B)', 'o1/1.6180339887', 'n', '', { dp: 4 }], ['Whole (A + B)', 'o1+o2', 'n', '', { dp: 4 }]]);
  F('cube-root-calculator', 'Cube Root & Nth Root Calculator', 'math/arithmetic', 'The cube root or any root of a number.', 'ⁿ√x = x^(1/n)',
    [['x', 'Number', 'n', 27], ['n', 'Root', 'n', 3]],
    [['Root', 'sign(x)*abs(x)^(1/n)', 'n', '', { dp: 8 }], ['Check: root^n', 'o1^n', 'n', '', { dp: 6 }]]);
  F('long-division-calculator', 'Long Division Calculator', 'math/arithmetic', 'Quotient and remainder, plus the decimal answer.', 'dividend = divisor × quotient + remainder.',
    [['a', 'Dividend', 'n', 7856], ['b', 'Divisor', 'n', 12]],
    [['Quotient', 'trunc(a/b)', 'n', '', { dp: 0 }], ['Remainder', 'a-trunc(a/b)*b', 'n', '', { dp: 0 }], ['Decimal result', 'a/b', 'n', '', { dp: 8 }]]);
  F('modulo-calculator', 'Modulo Calculator', 'math/arithmetic', 'Find the remainder of a division (a mod b).', 'a mod b = a − b × floor(a ÷ b).',
    [['a', 'Dividend (a)', 'n', 29], ['b', 'Divisor (b)', 'n', 6]],
    [['a mod b', 'mod(a,b)', 'n', '', { dp: 0 }], ['Quotient', 'floor(a/b)', 'n', '', { dp: 0 }]]);
  F('sum-calculator', 'Sum Calculator', 'math/arithmetic', 'Sum, count, average and product of a list of numbers.', 'Sum = x₁ + x₂ + … + xₙ.',
    [['l', 'Numbers', 'ta', '4, 8, 15, 16, 23, 42']],
    [['Sum', function (v) { return L(v.l).reduce(function (a, b) { return a + b; }, 0); }, 'n', '', { dp: 8 }], ['Count', function (v) { return L(v.l).length; }, 'i'], ['Average', function (v) { var a = L(v.l); return a.reduce(function (x, y) { return x + y; }, 0) / a.length; }, 'n', '', { dp: 6 }], ['Product', function (v) { return L(v.l).reduce(function (a, b) { return a * b; }, 1); }, 'n', '', { dp: 6 }]]);
  F('percent-decimal-fraction-converter', 'Percent ↔ Decimal ↔ Fraction Converter', 'math/arithmetic', 'Convert a number between percent, decimal and fraction.', '50% = 0.5 = 1/2.',
    [['v', 'Value', 'n', 0.375], ['m', 'Value is a', 'g', 1, [[1, 'Decimal'], [2, 'Percent']]]],
    [['Decimal', 'if(m==1,v,v/100)', 'n', '', { dp: 8 }], ['Percent', 'o1*100', 'p', '', { dp: 6 }], ['Fraction', function (v) { var d = v.o1, den = 1, best = [Math.round(d), 1]; for (var q = 1; q <= 10000; q++) { var p = Math.round(d * q); if (Math.abs(d - p / q) < 1e-9) { best = [p, q]; break; } } return best[0] + '/' + best[1]; }, 'text']]);

  /* ---------------- Fractions ---------------- */
  var frac = function (id, title, op, desc, formula) {
    C(id, title, 'math/fractions', desc, formula,
      [['n1', 'Numerator 1', 'i', 3], ['d1', 'Denominator 1', 'i', 4], ['n2', 'Numerator 2', 'i', 5], ['d2', 'Denominator 2', 'i', 6]],
      function (v) {
        if (!v.d1 || !v.d2) return { error: 'A denominator cannot be zero.' };
        var n, d;
        if (op === '+') { n = v.n1 * v.d2 + v.n2 * v.d1; d = v.d1 * v.d2; }
        else if (op === '-') { n = v.n1 * v.d2 - v.n2 * v.d1; d = v.d1 * v.d2; }
        else if (op === '*') { n = v.n1 * v.n2; d = v.d1 * v.d2; }
        else { if (!v.n2) return { error: 'Cannot divide by zero.' }; n = v.n1 * v.d2; d = v.d1 * v.n2; }
        var g = gcd(n, d) || 1; n /= g; d /= g; if (d < 0) { n = -n; d = -d; }
        var w = Math.trunc(n / d), rem = Math.abs(n) - Math.abs(w) * d;
        return { results: [M('Result', d === 1 ? String(n) : n + '/' + d, 'text'), R('Mixed number', d === 1 ? String(n) : (w ? w + ' ' : (n < 0 ? '-' : '')) + rem + '/' + d, 'text'), R('Decimal', n / d, 'num', { dp: 8 }), R('Percent', n / d * 100, 'num', { dp: 4, u: '%' })] };
      });
  };
  frac('add-fractions-calculator', 'Add Fractions Calculator', '+', 'Add two fractions and see the simplified and mixed-number answer.', 'a/b + c/d = (ad + bc) ÷ bd, then simplify.');
  frac('subtract-fractions-calculator', 'Subtract Fractions Calculator', '-', 'Subtract one fraction from another.', 'a/b − c/d = (ad − bc) ÷ bd.');
  frac('multiply-fractions-calculator', 'Multiply Fractions Calculator', '*', 'Multiply two fractions.', 'a/b × c/d = ac ÷ bd.');
  frac('divide-fractions-calculator', 'Divide Fractions Calculator', '/', 'Divide one fraction by another.', 'a/b ÷ c/d = ad ÷ bc.');

  F('simplify-fraction-calculator', 'Simplify Fractions Calculator', 'math/fractions', 'Reduce a fraction to its lowest terms.', 'Divide numerator and denominator by their greatest common factor.',
    [['n', 'Numerator', 'i', 84], ['d', 'Denominator', 'i', 126]],
    [['Simplified', function (v) { var g = gcd(v.n, v.d) || 1; return v.n / g + '/' + v.d / g; }, 'text'], ['GCF', function (v) { return gcd(v.n, v.d); }, 'i'], ['Decimal', 'n/d', 'n', '', { dp: 8 }]]);
  F('mixed-number-calculator', 'Mixed Number ↔ Improper Fraction Calculator', 'math/fractions', 'Convert between mixed numbers and improper fractions.', 'a b/c = (a × c + b) ÷ c.',
    [['m', 'Convert', 'g', 1, [[1, 'Mixed → improper'], [2, 'Improper → mixed']]], ['w', 'Whole', 'i', 3, '', { show: 'm==1' }], ['n', 'Numerator', 'i', 5], ['d', 'Denominator', 'i', 8]],
    [['Result', function (v) { if (v.m == 1) return (v.w * v.d + v.n) + '/' + v.d; var w = Math.trunc(v.n / v.d), r = v.n - w * v.d; return r ? w + ' ' + r + '/' + v.d : String(w); }, 'text'], ['Decimal', 'if(m==1,w+n/d,n/d)', 'n', '', { dp: 8 }]]);
  F('fraction-to-decimal-calculator', 'Fraction to Decimal Calculator', 'math/fractions', 'Convert a fraction to a decimal and percent.', 'Decimal = numerator ÷ denominator.',
    [['n', 'Numerator', 'n', 7], ['d', 'Denominator', 'n', 16]],
    [['Decimal', 'n/d', 'n', '', { dp: 10 }], ['Percent', 'n/d*100', 'p', '', { dp: 6 }]]);
  F('compare-fractions-calculator', 'Compare Fractions Calculator', 'math/fractions', 'Which fraction is larger?', 'Cross-multiply: a/b vs c/d → ad vs bc.',
    [['n1', 'Numerator 1', 'n', 5], ['d1', 'Denominator 1', 'n', 8], ['n2', 'Numerator 2', 'n', 7], ['d2', 'Denominator 2', 'n', 12]],
    [['Comparison', 'n1*d2-n2*d1', 'b', '', { bands: [[0, 'First fraction is smaller'], [0.0000001, 'The fractions are equal'], [Infinity, 'First fraction is larger']] }], ['First as decimal', 'n1/d1', 'n', '', { dp: 6 }], ['Second as decimal', 'n2/d2', 'n', '', { dp: 6 }]]);
  C('equivalent-fractions-calculator', 'Equivalent Fractions Calculator', 'math/fractions', 'List fractions equal to the one you enter.', 'Multiply numerator and denominator by the same number.',
    [['n', 'Numerator', 'i', 2], ['d', 'Denominator', 'i', 3]],
    function (v) { if (!v.d) return { error: 'The denominator cannot be zero.' }; var rows = []; for (var k = 1; k <= 12; k++) rows.push([k + '×', v.n * k + '/' + v.d * k]); var g = gcd(v.n, v.d) || 1;
      return { results: [M('Simplest form', v.n / g + '/' + v.d / g, 'text'), R('Decimal', v.n / v.d, 'num', { dp: 8 })], table: { head: ['Multiply by', 'Equivalent fraction'], rows: rows, title: 'Equivalent fractions' } }; });
  C('lcd-calculator', 'Least Common Denominator (LCD) Calculator', 'math/fractions', 'The LCD of several fractions — the lowest common multiple of their denominators.', 'LCD = LCM of the denominators.',
    [['l', 'Denominators', 'ta', '4, 6, 10']],
    function (v) { var a = L(v.l).filter(function (x) { return x > 0 && x === Math.floor(x); }); if (a.length < 2) return { error: 'Enter at least two denominators.' }; var lcm = a.reduce(function (x, y) { return x / gcd(x, y) * y; }, 1);
      return { results: [M('LCD', lcm, 'int'), R('Multipliers', a.map(function (x) { return lcm / x; }).join(', '), 'text')] }; });

  /* ---------------- Number theory ---------------- */
  var isPrime = function (n) { if (n < 2 || n !== Math.floor(n)) return false; if (n < 4) return true; if (n % 2 === 0 || n % 3 === 0) return false; for (var i = 5; i * i <= n; i += 6) if (n % i === 0 || n % (i + 2) === 0) return false; return true; };
  C('prime-number-checker', 'Prime Number Checker', 'math/number-theory', 'Check whether a number is prime and find its neighbouring primes.', 'A prime has exactly two divisors: 1 and itself.',
    [['n', 'Number', 'i', 997]],
    function (v) { var n = Math.floor(v.n); if (n > 9e15) return { error: 'Please use a number below 9 × 10¹⁵.' }; var p = isPrime(n), nx = n + 1, pv = n - 1; while (!isPrime(nx)) nx++; while (pv > 1 && !isPrime(pv)) pv--;
      var f = 0; if (!p && n > 3) for (var i = 2; i * i <= n; i++) if (n % i === 0) { f = i; break; }
      return { results: [M('Is it prime?', p ? 'Yes, ' + n + ' is prime' : 'No, ' + n + ' is composite', 'text'), R('Smallest factor', p ? n : (f || '—'), 'text'), R('Next prime', nx, 'int'), R('Previous prime', pv > 1 ? pv : '—', 'text')] }; }, { pop: 1 });
  C('prime-number-generator', 'Prime Number Generator (List of Primes)', 'math/number-theory', 'List all prime numbers up to a limit using the sieve of Eratosthenes.', 'Sieve of Eratosthenes.',
    [['n', 'List primes up to', 'i', 200]],
    function (v) { var n = Math.min(Math.floor(v.n), 2000000); if (n < 2) return { error: 'Enter 2 or more.' }; var s = new Uint8Array(n + 1), out = []; for (var i = 2; i <= n; i++) { if (!s[i]) { out.push(i); for (var j = i * i; j <= n; j += i) s[j] = 1; } }
      return { results: [M('Primes found', out.length, 'int'), R('Largest prime', out[out.length - 1], 'int')], html: '<div class="cw-list">' + esc(out.slice(0, 5000).join(', ')) + (out.length > 5000 ? ' …' : '') + '</div>' }; });
  C('factor-calculator', 'Factor Calculator (All Factors of a Number)', 'math/number-theory', 'Every factor, factor pair and the prime factorisation of a number.', 'A factor divides the number with no remainder.',
    [['n', 'Number', 'i', 360]],
    function (v) { var n = Math.floor(Math.abs(v.n)); if (!n || n > 1e12) return { error: 'Enter a whole number between 1 and 10¹².' }; var f = [], pairs = []; for (var i = 1; i * i <= n; i++) if (n % i === 0) { f.push(i); if (i !== n / i) f.push(n / i); pairs.push([i, n / i]); } f.sort(function (a, b) { return a - b; });
      var x = n, pf = []; for (var p = 2; p * p <= x; p++) { var c = 0; while (x % p === 0) { x /= p; c++; } if (c) pf.push(p + (c > 1 ? '^' + c : '')); } if (x > 1) pf.push(String(x));
      return { results: [M('Number of factors', f.length, 'int'), R('Prime factorisation', pf.join(' × '), 'text'), R('Sum of factors', f.reduce(function (a, b) { return a + b; }, 0), 'int')], table: { head: ['Factor', 'Pair'], rows: pairs.map(function (p) { return [p[0], p[1]]; }), fmt: ['int', 'int'], title: 'Factor pairs' }, html: '<div class="cw-list">' + f.join(', ') + '</div>' }; });
  C('fibonacci-calculator', 'Fibonacci Calculator', 'math/number-theory', 'The nth Fibonacci number and the sequence up to it.', 'F(n) = F(n−1) + F(n−2), F(0)=0, F(1)=1.',
    [['n', 'n (position)', 'i', 30]],
    function (v) { var n = Math.floor(v.n); if (n < 0 || n > 1000) return { error: 'Choose n between 0 and 1000.' }; var a = 0n, b = 1n, seq = []; for (var i = 0; i <= n; i++) { if (i <= 40) seq.push(a.toString()); var t = a + b; a = b; b = t; } var fnv = (n === 0 ? 0n : (function () { var x = 0n, y = 1n; for (var i = 1; i < n; i++) { var t = x + y; x = y; y = t; } return y; })());
      return { results: [M('F(' + n + ')', fnv.toString().length > 18 ? fnv.toString() : fnv.toString(), 'text'), R('Digits', fnv.toString().length, 'int'), R('Ratio F(n)/F(n−1)', n > 1 ? Number(fnv) / Number(fnv - (function () { var x = 0n, y = 1n; for (var i = 1; i < n - 1; i++) { var t = x + y; x = y; y = t; } return y; })()) : '—', n > 1 ? 'num' : 'text', { dp: 8 })], html: '<div class="cw-list">' + seq.join(', ') + (n > 40 ? ' …' : '') + '</div>' }; });
  C('collatz-calculator', 'Collatz Conjecture Calculator', 'math/number-theory', 'Steps and peak value of the 3n + 1 sequence.', 'If even: n ÷ 2. If odd: 3n + 1. Repeat until 1.',
    [['n', 'Starting number', 'i', 27]],
    function (v) { var n = Math.floor(v.n); if (n < 1 || n > 1e12) return { error: 'Enter a whole number between 1 and 10¹².' }; var s = 0, mx = n, seq = [n]; while (n !== 1 && s < 100000) { n = n % 2 ? 3 * n + 1 : n / 2; s++; if (n > mx) mx = n; if (seq.length < 60) seq.push(n); }
      return { results: [M('Steps to reach 1', s, 'int'), R('Highest value', mx, 'int')], html: '<div class="cw-list">' + seq.join(' → ') + (s > 59 ? ' …' : '') + '</div>' }; });
  F('digital-root-calculator', 'Digital Root Calculator', 'math/number-theory', 'The digital root (repeated digit sum) of a number.', 'Digital root = 1 + (n − 1) mod 9 for n > 0.',
    [['n', 'Number', 'i', 98765]],
    [['Digital root', 'if(n==0,0,1+mod(n-1,9))', 'i'], ['Sum of digits', function (v) { return String(Math.abs(Math.floor(v.n))).split('').reduce(function (a, b) { return a + (+b); }, 0); }, 'i']]);
  C('euler-totient-calculator', 'Euler’s Totient Calculator', 'math/number-theory', 'Count the numbers up to n that are coprime to n.', 'φ(n) = n × Π (1 − 1/p) over the prime factors p of n.',
    [['n', 'n', 'i', 360]],
    function (v) { var n = Math.floor(v.n); if (n < 1 || n > 1e12) return { error: 'Enter a whole number between 1 and 10¹².' }; var r = n, x = n; for (var p = 2; p * p <= x; p++) if (x % p === 0) { while (x % p === 0) x /= p; r -= r / p; } if (x > 1) r -= r / x; return { results: [M('φ(n)', r, 'int')] }; });
  C('modular-exponentiation-calculator', 'Modular Exponentiation Calculator', 'math/number-theory', 'Compute a^b mod m quickly, even for huge exponents.', 'Square-and-multiply modular exponentiation.',
    [['a', 'Base (a)', 'i', 7], ['b', 'Exponent (b)', 'i', 128], ['m', 'Modulus (m)', 'i', 13]],
    function (v) { try { var a = BigInt(Math.floor(v.a)), b = BigInt(Math.floor(v.b)), m = BigInt(Math.floor(v.m)); if (m <= 0n || b < 0n) return { error: 'Use a positive modulus and a non-negative exponent.' }; var r = 1n; a %= m; while (b > 0n) { if (b & 1n) r = r * a % m; a = a * a % m; b >>= 1n; } return { results: [M('a^b mod m', r.toString(), 'text')] }; } catch (e) { return { error: 'Please use whole numbers.' }; } });
  C('modular-inverse-calculator', 'Modular Multiplicative Inverse Calculator', 'math/number-theory', 'Find x such that a × x ≡ 1 (mod m).', 'Extended Euclidean algorithm.',
    [['a', 'a', 'i', 17], ['m', 'm', 'i', 3120]],
    function (v) { var a = Math.floor(v.a), m = Math.floor(v.m); if (m < 2) return { error: 'The modulus must be at least 2.' }; var r0 = m, r1 = ((a % m) + m) % m, t0 = 0, t1 = 1; while (r1) { var q = Math.floor(r0 / r1), t = r0 - q * r1; r0 = r1; r1 = t; t = t0 - q * t1; t0 = t1; t1 = t; } if (r0 !== 1) return { error: 'No inverse exists: a and m are not coprime (gcd = ' + r0 + ').' }; return { results: [M('Inverse of a mod m', ((t0 % m) + m) % m, 'int'), R('gcd(a, m)', 1, 'int')] }; });

  var baseCalc = function (id, title, base, name) {
    C(id, title, 'math/number-theory', 'Add, subtract, multiply and divide ' + name + ' numbers.', 'Convert to decimal, calculate, convert back to ' + name + '.',
      [['a', 'First number (' + name + ')', 't', base === 2 ? '1011' : '1F4'], ['op', 'Operation', 'g', 1, [[1, '+'], [2, '−'], [3, '×'], [4, '÷']]], ['b', 'Second number (' + name + ')', 't', base === 2 ? '110' : '2A']],
      function (v) { var a = parseInt(String(v.a).trim(), base), b = parseInt(String(v.b).trim(), base); if (isNaN(a) || isNaN(b)) return { error: 'Enter valid ' + name + ' numbers.' }; var r = v.op == 1 ? a + b : v.op == 2 ? a - b : v.op == 3 ? a * b : (b ? Math.trunc(a / b) : NaN); if (isNaN(r)) return { error: 'Cannot divide by zero.' };
        return { results: [M('Result (' + name + ')', r.toString(base).toUpperCase(), 'text'), R('Decimal', r, 'int'), R('Binary', r.toString(2), 'text'), R('Hexadecimal', r.toString(16).toUpperCase(), 'text')] }; });
  };
  baseCalc('binary-calculator', 'Binary Calculator', 2, 'binary'); baseCalc('hex-calculator', 'Hex Calculator', 16, 'hexadecimal');
  var baseConv = function (from, to, fn, tn) {
    var BASES = { 2: 'Binary', 8: 'Octal', 10: 'Decimal', 16: 'Hexadecimal' }, id = fn.toLowerCase() + '-to-' + tn.toLowerCase() + '-converter';
    C(id, fn + ' to ' + tn + ' Converter', 'converters/number-systems', 'Convert a ' + fn.toLowerCase() + ' number to ' + tn.toLowerCase() + ', with all other bases shown.', 'Parse in base ' + from + ', print in base ' + to + '.',
      [['v', fn + ' number', 't', { 2: '101101', 8: '755', 10: '2026', 16: '7FF' }[from]]],
      function (v) { var s = String(v.v).trim().replace(/^0x/i, ''); var n = parseInt(s, from); if (isNaN(n) || (from !== 10 && !new RegExp('^[' + '0123456789ABCDEF'.slice(0, from) + ']+$', 'i').test(s))) return { error: 'Not a valid ' + fn.toLowerCase() + ' number.' };
        var rows = [2, 8, 10, 16].filter(function (b) { return b !== from; }).map(function (b) { return [BASES[b], n.toString(b).toUpperCase()]; });
        return { results: [M(tn, n.toString(to).toUpperCase(), 'text')], table: { head: ['Base', 'Value'], rows: rows, title: 'All bases' } }; });
  };
  [[2, 10, 'Binary', 'Decimal'], [10, 2, 'Decimal', 'Binary'], [16, 10, 'Hex', 'Decimal'], [10, 16, 'Decimal', 'Hex'], [2, 16, 'Binary', 'Hex'], [16, 2, 'Hex', 'Binary'], [8, 10, 'Octal', 'Decimal'], [10, 8, 'Decimal', 'Octal'], [2, 8, 'Binary', 'Octal'], [8, 2, 'Octal', 'Binary'], [16, 8, 'Hex', 'Octal'], [8, 16, 'Octal', 'Hex']].forEach(function (a) { baseConv.apply(null, a); });

  F('arithmetic-sequence-calculator', 'Arithmetic Sequence Calculator', 'math/number-theory', 'The nth term and sum of an arithmetic sequence.', 'aₙ = a₁ + (n − 1)d · Sₙ = n(a₁ + aₙ) ÷ 2.',
    [['a', 'First term (a₁)', 'n', 3], ['d', 'Common difference (d)', 'n', 4], ['n', 'Number of terms (n)', 'i', 20]],
    [['nth term', 'a+(n-1)*d', 'n', '', { dp: 6 }], ['Sum of n terms', 'n*(2*a+(n-1)*d)/2', 'n', '', { dp: 6 }]],
    { seq: { n: 'min(n,60)', head: ['n', 'Term', 'Sum'], cols: [['i', 'i'], ['a+(i-1)*d', 'n'], ['i*(2*a+(i-1)*d)/2', 'n']], title: 'Sequence' } });
  F('geometric-sequence-calculator', 'Geometric Sequence Calculator', 'math/number-theory', 'The nth term, sum and infinite sum of a geometric sequence.', 'aₙ = a₁ × r^(n−1) · Sₙ = a₁(1 − rⁿ) ÷ (1 − r).',
    [['a', 'First term (a₁)', 'n', 2], ['r', 'Common ratio (r)', 'n', 3], ['n', 'Number of terms (n)', 'i', 10]],
    [['nth term', 'a*r^(n-1)', 'n', '', { dp: 6 }], ['Sum of n terms', 'if(r==1,a*n,a*(1-r^n)/(1-r))', 'n', '', { dp: 6 }], ['Infinite sum', 'if(abs(r)<1,a/(1-r),0)', 'n', '', { dp: 6, sub: '0 when the series diverges' }]],
    { seq: { n: 'min(n,40)', head: ['n', 'Term'], cols: [['i', 'i'], ['a*r^(i-1)', 'n']], title: 'Sequence' } });
  F('triangular-number-calculator', 'Triangular Number Calculator', 'math/number-theory', 'The nth triangular number and the sum 1 + 2 + … + n.', 'Tₙ = n(n + 1) ÷ 2.',
    [['n', 'n', 'i', 100]],
    [['Triangular number', 'n*(n+1)/2', 'i'], ['Sum of squares 1² … n²', 'n*(n+1)*(2*n+1)/6', 'i'], ['Sum of cubes 1³ … n³', '(n*(n+1)/2)^2', 'i']]);
  C('complex-number-calculator', 'Complex Number Calculator', 'math/scientific', 'Add, subtract, multiply and divide complex numbers, with modulus and argument.', '(a + bi)(c + di) = (ac − bd) + (ad + bc)i.',
    [['a', 'a (real, first)', 'n', 3], ['b', 'b (imaginary, first)', 'n', 4], ['op', 'Operation', 'g', 3, [[1, '+'], [2, '−'], [3, '×'], [4, '÷']]], ['c', 'c (real, second)', 'n', 1], ['d', 'd (imaginary, second)', 'n', -2]],
    function (v) { var re, im; if (v.op == 1) { re = v.a + v.c; im = v.b + v.d; } else if (v.op == 2) { re = v.a - v.c; im = v.b - v.d; } else if (v.op == 3) { re = v.a * v.c - v.b * v.d; im = v.a * v.d + v.b * v.c; } else { var den = v.c * v.c + v.d * v.d; if (!den) return { error: 'Cannot divide by zero.' }; re = (v.a * v.c + v.b * v.d) / den; im = (v.b * v.c - v.a * v.d) / den; }
      return { results: [M('Result', N(re, 6) + (im < 0 ? ' − ' : ' + ') + N(Math.abs(im), 6) + 'i', 'text'), R('Modulus |z|', Math.hypot(re, im), 'num', { dp: 6 }), R('Argument', Math.atan2(im, re) * 180 / Math.PI, 'num', { dp: 4, u: '°' }), R('Conjugate', N(re, 6) + (im < 0 ? ' + ' : ' − ') + N(Math.abs(im), 6) + 'i', 'text')] }; });

  /* ---------------- Algebra ---------------- */
  F('linear-equation-solver', 'Linear Equation Solver', 'math/algebra', 'Solve ax + b = cx + d for x.', 'x = (d − b) ÷ (a − c).',
    [['a', 'a', 'n', 3], ['b', 'b', 'n', 7], ['c', 'c', 'n', 1], ['d', 'd', 'n', 19]],
    [['x', '(d-b)/(a-c)', 'n', '', { dp: 8 }]]);
  C('system-of-equations-calculator', 'System of Equations Calculator (2 & 3 variables)', 'math/algebra', 'Solve simultaneous linear equations with Cramer’s rule.', 'a₁x + b₁y + c₁z = d₁ … solved by determinants.',
    [['m', 'Equations', 'g', 2, [[2, '2 variables'], [3, '3 variables']]], ['eq', 'Coefficients (one equation per line)', 'ta', '2 1 5\n1 -1 1', { rows: 4 }]],
    function (v) {
      var A = String(v.eq).trim().split(/\n|;/).map(L).filter(function (r) { return r.length; }), n = +v.m;
      if (A.length < n || A.some(function (r) { return r.length < n + 1; })) return { error: 'Enter ' + n + ' lines with ' + (n + 1) + ' numbers each (coefficients, then the constant).' };
      var a = A.slice(0, n).map(function (r) { return r.slice(0, n + 1); }), i, j, k;
      for (i = 0; i < n; i++) { var p = i; for (j = i + 1; j < n; j++) if (Math.abs(a[j][i]) > Math.abs(a[p][i])) p = j; var t = a[i]; a[i] = a[p]; a[p] = t; if (Math.abs(a[i][i]) < 1e-12) return { error: 'No single solution (the equations are dependent or inconsistent).' };
        for (j = 0; j < n; j++) if (j !== i) { var f = a[j][i] / a[i][i]; for (k = i; k <= n; k++) a[j][k] -= f * a[i][k]; } }
      var names = ['x', 'y', 'z'], sol = a.map(function (r, ix) { return r[n] / r[ix]; });
      return { results: sol.map(function (s, ix) { return ix === 0 ? M(names[ix], s, 'num', { dp: 8 }) : R(names[ix], s, 'num', { dp: 8 }); }) }; }, { pop: 1 });
  C('cubic-equation-solver', 'Cubic Equation Solver', 'math/algebra', 'Solve ax³ + bx² + cx + d = 0 for real and complex roots.', 'Solved with the trigonometric / Cardano method.',
    [['a', 'a (x³)', 'n', 1], ['b', 'b (x²)', 'n', -6], ['c', 'c (x)', 'n', 11], ['d', 'd (constant)', 'n', -6]],
    function (v) { if (!v.a) return { error: 'a must not be zero (otherwise it is a quadratic).' }; var b = v.b / v.a, c = v.c / v.a, d = v.d / v.a, p = c - b * b / 3, q = 2 * b * b * b / 27 - b * c / 3 + d, D = q * q / 4 + p * p * p / 27, off = b / 3, roots = [];
      if (D > 1e-12) { var u = Math.cbrt(-q / 2 + Math.sqrt(D)), w = Math.cbrt(-q / 2 - Math.sqrt(D)), r1 = u + w - off, re = -(u + w) / 2 - off, im = Math.sqrt(3) / 2 * (u - w); roots = [N(r1, 6), N(re, 6) + ' + ' + N(Math.abs(im), 6) + 'i', N(re, 6) + ' − ' + N(Math.abs(im), 6) + 'i']; }
      else if (Math.abs(D) <= 1e-12) { var u2 = Math.cbrt(-q / 2); roots = [N(2 * u2 - off, 6), N(-u2 - off, 6), N(-u2 - off, 6)]; }
      else { var r = Math.sqrt(-p * p * p / 27), ph = Math.acos(Math.max(-1, Math.min(1, -q / (2 * r)))), m = 2 * Math.cbrt(r); roots = [0, 1, 2].map(function (k) { return N(m * Math.cos((ph + 2 * Math.PI * k) / 3) - off, 6); }); }
      return { results: [M('Root 1', roots[0], 'text'), R('Root 2', roots[1], 'text'), R('Root 3', roots[2], 'text'), R('Discriminant sign', D > 0 ? 'One real, two complex' : D === 0 ? 'Repeated roots' : 'Three real roots', 'text')] }; });
  F('discriminant-calculator', 'Discriminant Calculator', 'math/algebra', 'The discriminant of a quadratic and the nature of its roots.', 'Δ = b² − 4ac.',
    [['a', 'a', 'n', 2], ['b', 'b', 'n', -4], ['c', 'c', 'n', -6]],
    [['Discriminant (Δ)', 'b^2-4*a*c', 'n', '', { dp: 6 }], ['Roots', 'b^2-4*a*c', 'b', '', { bands: [[0, 'Two complex roots'], [0.0000001, 'One repeated real root'], [Infinity, 'Two distinct real roots']] }]]);
  F('parabola-vertex-calculator', 'Parabola Vertex & Axis Calculator', 'math/algebra', 'Vertex, axis of symmetry, focus and direction of y = ax² + bx + c.', 'Vertex x = −b ÷ 2a, y = c − b² ÷ 4a.',
    [['a', 'a', 'n', 1], ['b', 'b', 'n', -4], ['c', 'c', 'n', 3]],
    [['Vertex x', '-b/(2*a)', 'n', '', { dp: 6 }], ['Vertex y', 'c-b^2/(4*a)', 'n', '', { dp: 6 }], ['Focus y', 'c-b^2/(4*a)+1/(4*a)', 'n', '', { dp: 6 }], ['Opens', 'a', 'b', '', { bands: [[0, 'Downward'], [Infinity, 'Upward']] }]],
    { plot: { x: 'x', from: '-b/(2*a)-5', to: '-b/(2*a)+5', n: 40, series: [['y = ax² + bx + c', 'a*x^2+b*x+c']], f: 'n' } });
  F('exponential-growth-calculator', 'Exponential Growth & Decay Calculator', 'math/algebra', 'Growth or decay of a quantity at a constant percentage rate.', 'x(t) = x₀ × (1 ± r)^t.',
    [['x0', 'Initial value', 'n', 1000], ['r', 'Rate per period', 'p', 5], ['t', 'Periods', 'n', 10], ['m', 'Type', 'g', 1, [[1, 'Growth'], [2, 'Decay']]]],
    [['Final value', 'x0*(1+if(m==1,1,-1)*r/100)^t', 'n', '', { dp: 4 }], ['Total change', 'o1-x0', 'n', '', { dp: 4 }], ['Doubling / halving time', 'ln(2)/abs(ln(1+if(m==1,1,-1)*r/100))', 'n', 'periods', { dp: 2 }]],
    { plot: { x: 'x', from: 0, to: 't', n: 30, series: [['Value', 'x0*(1+if(m==1,1,-1)*r/100)^x']], f: 'n' } });
  F('antilog-calculator', 'Antilog & Natural Log Calculator', 'math/algebra', 'Antilogarithm, natural log, log base 2 and e^x of a number.', 'antilog(x) = 10^x · e^x · ln(x).',
    [['x', 'x', 'n', 2.5]],
    [['10^x (antilog)', '10^x', 'n', '', { dp: 8 }], ['e^x', 'exp(x)', 'n', '', { dp: 8 }], ['ln(x)', 'if(x>0,ln(x),0)', 'n', '', { dp: 8 }], ['log₁₀(x)', 'if(x>0,log(x),0)', 'n', '', { dp: 8 }], ['log₂(x)', 'if(x>0,log2(x),0)', 'n', '', { dp: 8 }]]);
  C('synthetic-division-calculator', 'Synthetic Division Calculator', 'math/algebra', 'Divide a polynomial by (x − c) and read off the quotient and remainder.', 'Bring down the leading coefficient and multiply-add across.',
    [['co', 'Coefficients (highest power first)', 't', '1, -6, 11, -6'], ['c', 'Divide by (x − c), c =', 'n', 1]],
    function (v) { var a = L(v.co); if (a.length < 2) return { error: 'Enter at least two coefficients.' }; var out = [a[0]]; for (var i = 1; i < a.length; i++) out.push(a[i] + out[i - 1] * v.c); var rem = out.pop(), deg = out.length - 1;
      var poly = out.map(function (k, i) { var p = deg - i; return k === 0 ? '' : (i && k > 0 ? ' + ' : i ? ' − ' : (k < 0 ? '−' : '')) + (Math.abs(k) === 1 && p ? '' : N(Math.abs(k), 6)) + (p ? 'x' + (p > 1 ? '^' + p : '') : ''); }).join('') || '0';
      return { results: [M('Quotient', poly, 'text'), R('Remainder', rem, 'num', { dp: 6 })] }; });
  CW.fnPlot = function (e, a, b, nPts) { var f = fx(e), xs = [], ys = []; for (var i = 0; i <= nPts; i++) { var x = a + (b - a) * i / nPts, y; try { y = f(x); } catch (er) { y = NaN; } xs.push(x); ys.push(isFinite(y) ? y : 0); } return { xs: xs, ys: ys }; };
  C('function-grapher', 'Function Grapher (Graphing Calculator)', 'math/scientific', 'Plot any function of x and find its minimum, maximum and value at a point.', 'Type an expression in x, e.g. sin(x)*x or x^3-2*x.',
    [['f', 'f(x) =', 't', 'sin(x)*x'], ['a', 'x from', 'n', -10], ['b', 'x to', 'n', 10], ['p', 'Evaluate f at x =', 'n', 2, '', { opt: 1 }]],
    function (v) { if (!(v.b > v.a)) return { error: '“x to” must be greater than “x from”.' }; var g = CW.fnPlot(v.f, v.a, v.b, 120), mn = Math.min.apply(null, g.ys), mx = Math.max.apply(null, g.ys), fp;
      try { fp = fx(v.f)(v.p); } catch (e) { return { error: 'Check the expression: ' + e.message }; }
      return { results: [M('f(' + N(v.p, 4) + ')', fp, 'num', { dp: 8 }), R('Minimum on range', mn, 'num', { dp: 4 }), R('Maximum on range', mx, 'num', { dp: 4 })], chart: { type: 'line', labels: g.xs.map(function (x) { return N(x, 2); }), series: [{ l: 'f(x)', pts: g.ys }], f: 'num' } }; }, { pop: 1 });

  /* ---------------- Calculus (numeric) ---------------- */
  var needF = function (e, x) { try { var y = fx(e)(x); if (!isFinite(y)) throw new Error('not finite'); return y; } catch (er) { throw new Error('Check f(x): ' + er.message); } };
  C('derivative-calculator', 'Derivative Calculator (Numeric)', 'math/calculus', 'First and second derivative of f(x) at a point, with the tangent line.', 'f′(x) ≈ [f(x+h) − f(x−h)] ÷ 2h (central difference).',
    [['f', 'f(x) =', 't', 'x^3 - 2*x'], ['x', 'At x =', 'n', 2]],
    function (v) { var f = function (t) { return needF(v.f, t); }, h = 1e-4 * Math.max(1, Math.abs(v.x)), d1 = (f(v.x + h) - f(v.x - h)) / (2 * h), d2 = (f(v.x + h) - 2 * f(v.x) + f(v.x - h)) / (h * h), y = f(v.x);
      return { results: [M('f′(x)', d1, 'num', { dp: 6 }), R('f″(x)', d2, 'num', { dp: 4 }), R('f(x)', y, 'num', { dp: 6 }), R('Tangent line', 'y = ' + N(d1, 6) + '·x ' + (y - d1 * v.x < 0 ? '− ' : '+ ') + N(Math.abs(y - d1 * v.x), 6), 'text')], note: 'Numeric result (accurate to about 6 digits).' }; }, { pop: 1 });
  C('integral-calculator', 'Definite Integral Calculator', 'math/calculus', 'Area under a curve from a to b using Simpson’s rule.', '∫ₐᵇ f(x) dx ≈ (h ÷ 3)[f₀ + 4f₁ + 2f₂ + … + fₙ]',
    [['f', 'f(x) =', 't', 'x^2'], ['a', 'Lower limit (a)', 'n', 0], ['b', 'Upper limit (b)', 'n', 3]],
    function (v) { var n = 2000, h = (v.b - v.a) / n, s = needF(v.f, v.a) + needF(v.f, v.b); for (var i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * needF(v.f, v.a + i * h); var res = s * h / 3, g = CW.fnPlot(v.f, Math.min(v.a, v.b), Math.max(v.a, v.b), 100);
      return { results: [M('∫ f(x) dx', res, 'num', { dp: 8 }), R('Average value of f', res / (v.b - v.a), 'num', { dp: 6 })], chart: { type: 'line', labels: g.xs.map(function (x) { return N(x, 2); }), series: [{ l: 'f(x)', pts: g.ys }], f: 'num' } }; }, { pop: 1 });
  C('limit-calculator', 'Limit Calculator (Numeric)', 'math/calculus', 'Estimate the limit of f(x) as x approaches a value from both sides.', 'Evaluates f very close to the point from the left and the right.',
    [['f', 'f(x) =', 't', 'sin(x)/x'], ['a', 'x approaches', 'n', 0]],
    function (v) { var out = []; [1e-3, 1e-5, 1e-7].forEach(function (h) { var l, r; try { l = fx(v.f)(v.a - h); r = fx(v.f)(v.a + h); } catch (e) { l = r = NaN; } out.push([h, l, r]); }); var l = out[2][1], r = out[2][2];
      var ok = isFinite(l) && isFinite(r) && Math.abs(l - r) < 1e-4 * Math.max(1, Math.abs(l));
      return { results: [M('Limit', ok ? Math.round((l + r) / 2 * 1e6) / 1e6 : 'Does not exist (or infinite)', ok ? 'num' : 'text', { dp: 6 }), R('From the left', l, 'num', { dp: 8 }), R('From the right', r, 'num', { dp: 8 })], table: { head: ['h', 'f(a − h)', 'f(a + h)'], rows: out, fmt: ['num', 'num', 'num'], title: 'Approach' } }; });
  C('newton-raphson-calculator', 'Newton-Raphson Method Calculator', 'math/calculus', 'Find a root of f(x) = 0 by Newton’s method with every iteration shown.', 'xₙ₊₁ = xₙ − f(xₙ) ÷ f′(xₙ).',
    [['f', 'f(x) =', 't', 'x^3 - 2*x - 5'], ['x0', 'Initial guess', 'n', 2]],
    function (v) { var x = v.x0, rows = []; for (var i = 1; i <= 30; i++) { var y = needF(v.f, x), h = 1e-6, d = (needF(v.f, x + h) - needF(v.f, x - h)) / (2 * h); if (!d) return { error: 'The derivative is zero at ' + N(x, 4) + '. Try another start.' }; var nx = x - y / d; rows.push([i, x, y, nx]); if (Math.abs(nx - x) < 1e-12) { x = nx; break; } x = nx; }
      return { results: [M('Root', x, 'num', { dp: 10 }), R('f(root)', needF(v.f, x), 'num', { dp: 4 }), R('Iterations', rows.length, 'int')], table: { head: ['n', 'xₙ', 'f(xₙ)', 'xₙ₊₁'], rows: rows, fmt: ['int', 'num', 'num', 'num'], title: 'Iterations' } }; });
  C('bisection-method-calculator', 'Bisection Method Calculator', 'math/calculus', 'Find a root of f(x) in an interval where the sign changes.', 'Repeatedly halve [a, b] and keep the half where f changes sign.',
    [['f', 'f(x) =', 't', 'x^3 - x - 2'], ['a', 'a', 'n', 1], ['b', 'b', 'n', 2]],
    function (v) { var a = v.a, b = v.b, fa = needF(v.f, a), fb = needF(v.f, b), rows = []; if (fa * fb > 0) return { error: 'f(a) and f(b) must have opposite signs.' }; for (var i = 1; i <= 60; i++) { var m = (a + b) / 2, fm = needF(v.f, m); rows.push([i, a, b, m, fm]); if (Math.abs(fm) < 1e-12 || (b - a) / 2 < 1e-12) { a = b = m; break; } if (fa * fm < 0) { b = m; fb = fm; } else { a = m; fa = fm; } }
      var r = (a + b) / 2; return { results: [M('Root', r, 'num', { dp: 10 }), R('Iterations', rows.length, 'int')], table: { head: ['n', 'a', 'b', 'mid', 'f(mid)'], rows: rows.slice(0, 40), fmt: ['int', 'num', 'num', 'num', 'num'], title: 'Iterations' } }; });
  C('riemann-sum-calculator', 'Riemann Sum Calculator', 'math/calculus', 'Approximate an integral with left, right, midpoint or trapezoid sums.', 'Σ f(xᵢ*) Δx with Δx = (b − a) ÷ n.',
    [['f', 'f(x) =', 't', 'x^2'], ['a', 'a', 'n', 0], ['b', 'b', 'n', 2], ['n', 'Rectangles (n)', 'i', 10]],
    function (v) { var n = Math.max(1, Math.min(100000, Math.floor(v.n))), dx = (v.b - v.a) / n, L_ = 0, R_ = 0, Mi = 0; for (var i = 0; i < n; i++) { var x0 = v.a + i * dx; L_ += needF(v.f, x0); R_ += needF(v.f, x0 + dx); Mi += needF(v.f, x0 + dx / 2); }
      return { results: [M('Midpoint sum', Mi * dx, 'num', { dp: 8 }), R('Left sum', L_ * dx, 'num', { dp: 8 }), R('Right sum', R_ * dx, 'num', { dp: 8 }), R('Trapezoid', (L_ + R_) / 2 * dx, 'num', { dp: 8 })] }; });
  C('area-between-curves-calculator', 'Area Between Curves Calculator', 'math/calculus', 'Area enclosed between two functions over an interval.', 'Area = ∫ₐᵇ |f(x) − g(x)| dx.',
    [['f', 'f(x) =', 't', 'x'], ['g', 'g(x) =', 't', 'x^2'], ['a', 'a', 'n', 0], ['b', 'b', 'n', 1]],
    function (v) { var n = 4000, h = (v.b - v.a) / n, s = 0; for (var i = 0; i < n; i++) { var x = v.a + (i + 0.5) * h; s += Math.abs(needF(v.f, x) - needF(v.g, x)); } return { results: [M('Area', s * h, 'num', { dp: 8 })] }; });

  /* ---------------- Matrices & vectors ---------------- */
  var parseM = function (s) { return String(s || '').trim().split(/\n|;/).map(L).filter(function (r) { return r.length; }); };
  var sq = function (a) { return a.length && a.every(function (r) { return r.length === a.length; }); };
  var det = function (m) { var n = m.length, a = m.map(function (r) { return r.slice(); }), d = 1; for (var i = 0; i < n; i++) { var p = i; for (var j = i + 1; j < n; j++) if (Math.abs(a[j][i]) > Math.abs(a[p][i])) p = j; if (Math.abs(a[p][i]) < 1e-14) return 0; if (p !== i) { var t = a[i]; a[i] = a[p]; a[p] = t; d = -d; } d *= a[i][i]; for (var j2 = i + 1; j2 < n; j2++) { var f = a[j2][i] / a[i][i]; for (var k = i; k < n; k++) a[j2][k] -= f * a[i][k]; } } return d; };
  var inv = function (m) { var n = m.length, a = m.map(function (r, i) { return r.concat(m.map(function (_, j) { return i === j ? 1 : 0; })); }); for (var i = 0; i < n; i++) { var p = i; for (var j = i + 1; j < n; j++) if (Math.abs(a[j][i]) > Math.abs(a[p][i])) p = j; if (Math.abs(a[p][i]) < 1e-14) return null; var t = a[i]; a[i] = a[p]; a[p] = t; var pv = a[i][i]; for (var k = 0; k < 2 * n; k++) a[i][k] /= pv; for (var j3 = 0; j3 < n; j3++) if (j3 !== i) { var f = a[j3][i]; for (var k2 = 0; k2 < 2 * n; k2++) a[j3][k2] -= f * a[i][k2]; } } return a.map(function (r) { return r.slice(n); }); };
  var mul = function (a, b) { return a.map(function (r) { return b[0].map(function (_, j) { return r.reduce(function (s, x, k) { return s + x * b[k][j]; }, 0); }); }); };
  var tr = function (a) { return a[0].map(function (_, j) { return a.map(function (r) { return r[j]; }); }); };
  var MA = ['mA', 'Matrix A (one row per line)', 'ta', '2 1 3\n0 4 1\n5 2 6', { rows: 4 }], MB = ['mB', 'Matrix B', 'ta', '1 0 2\n3 1 0\n2 2 1', { rows: 4 }];
  C('determinant-calculator', 'Determinant Calculator', 'math/matrices', 'Determinant of a square matrix of any size.', 'Gaussian elimination with partial pivoting.',
    [MA], function (v) { var a = parseM(v.mA); if (!sq(a)) return { error: 'Enter a square matrix (same number of rows and columns).' }; return { results: [M('det(A)', det(a), 'num', { dp: 8 }), R('Invertible?', Math.abs(det(a)) > 1e-12 ? 'Yes' : 'No (singular)', 'text')] }; }, { pop: 1 });
  C('inverse-matrix-calculator', 'Inverse Matrix Calculator', 'math/matrices', 'Find the inverse of a square matrix.', 'Gauss-Jordan elimination on [A | I].',
    [MA], function (v) { var a = parseM(v.mA); if (!sq(a)) return { error: 'Enter a square matrix.' }; var r = inv(a); if (!r) return { error: 'This matrix is singular, so it has no inverse.' }; return { results: [M('det(A)', det(a), 'num', { dp: 6 })], html: '<div class="cw-sub-t">A⁻¹</div>' + tbl(r) }; });
  C('matrix-multiplication-calculator', 'Matrix Multiplication Calculator', 'math/matrices', 'Multiply two matrices.', '(AB)ᵢⱼ = Σ Aᵢₖ × Bₖⱼ. A’s columns must equal B’s rows.',
    [MA, MB], function (v) { var a = parseM(v.mA), b = parseM(v.mB); if (!a.length || !b.length || a[0].length !== b.length) return { error: 'A’s number of columns must equal B’s number of rows.' }; return { results: [M('Size of A × B', a.length + ' × ' + b[0].length, 'text')], html: '<div class="cw-sub-t">A × B</div>' + tbl(mul(a, b)) }; });
  C('matrix-calculator', 'Matrix Calculator', 'math/matrices', 'Add, subtract, multiply, transpose, invert and find the determinant of matrices.', 'Choose an operation on matrices A and B.',
    [['op', 'Operation', 's', 1, [[1, 'A + B'], [2, 'A − B'], [3, 'A × B'], [4, 'Transpose of A'], [5, 'Inverse of A'], [6, 'Determinant of A'], [7, 'k × A']]], MA, MB, ['k', 'k (scalar)', 'n', 2, '', { show: 'op==7' }]],
    function (v) { var a = parseM(v.mA), b = parseM(v.mB), op = +v.op, res; if (!a.length) return { error: 'Enter matrix A.' };
      var same = b.length === a.length && a.every(function (r, i) { return r.length === b[i].length; });
      if (op === 1 || op === 2) { if (!same) return { error: 'A and B must be the same size.' }; res = a.map(function (r, i) { return r.map(function (x, j) { return op === 1 ? x + b[i][j] : x - b[i][j]; }); }); }
      else if (op === 3) { if (!b.length || a[0].length !== b.length) return { error: 'A’s columns must equal B’s rows.' }; res = mul(a, b); }
      else if (op === 4) res = tr(a); else if (op === 7) res = a.map(function (r) { return r.map(function (x) { return x * v.k; }); });
      else { if (!sq(a)) return { error: 'A must be square.' }; if (op === 6) return { results: [M('det(A)', det(a), 'num', { dp: 8 })] }; res = inv(a); if (!res) return { error: 'A is singular — no inverse.' }; }
      return { results: [M('Result size', res.length + ' × ' + res[0].length, 'text')], html: tbl(res) }; }, { pop: 1 });
  C('eigenvalue-calculator', 'Eigenvalue Calculator (2×2 & 3×3)', 'math/matrices', 'Eigenvalues and the trace and determinant of a small matrix.', 'Roots of det(A − λI) = 0.',
    [['mA', 'Matrix A (2×2 or 3×3)', 'ta', '4 1\n2 3', { rows: 4 }]],
    function (v) { var a = parseM(v.mA), n = a.length; if (!sq(a) || n < 2 || n > 3) return { error: 'Enter a 2×2 or 3×3 matrix.' }; var tra = a.reduce(function (s, r, i) { return s + r[i]; }, 0), d = det(a), ev;
      if (n === 2) { var disc = tra * tra - 4 * d; ev = disc >= 0 ? [(tra + Math.sqrt(disc)) / 2, (tra - Math.sqrt(disc)) / 2].map(function (x) { return N(x, 6); }) : [N(tra / 2, 6) + ' + ' + N(Math.sqrt(-disc) / 2, 6) + 'i', N(tra / 2, 6) + ' − ' + N(Math.sqrt(-disc) / 2, 6) + 'i']; }
      else { var c2 = -tra, c1 = a[0][0] * a[1][1] - a[0][1] * a[1][0] + a[0][0] * a[2][2] - a[0][2] * a[2][0] + a[1][1] * a[2][2] - a[1][2] * a[2][1], c0 = -d, p = c1 - c2 * c2 / 3, q = 2 * c2 * c2 * c2 / 27 - c2 * c1 / 3 + c0, D = q * q / 4 + p * p * p / 27, off = c2 / 3;
        if (D > 1e-12) { var u = Math.cbrt(-q / 2 + Math.sqrt(D)), w = Math.cbrt(-q / 2 - Math.sqrt(D)); ev = [N(u + w - off, 6), N(-(u + w) / 2 - off, 6) + ' + ' + N(Math.sqrt(3) / 2 * Math.abs(u - w), 6) + 'i', N(-(u + w) / 2 - off, 6) + ' − ' + N(Math.sqrt(3) / 2 * Math.abs(u - w), 6) + 'i']; }
        else { var r = Math.sqrt(Math.max(0, -p * p * p / 27)), ph = r ? Math.acos(Math.max(-1, Math.min(1, -q / (2 * r)))) : 0, m = 2 * Math.cbrt(r); ev = [0, 1, 2].map(function (k) { return N(m * Math.cos((ph + 2 * Math.PI * k) / 3) - off, 6); }); } }
      return { results: [M('Eigenvalue 1', ev[0], 'text'), R('Eigenvalue 2', ev[1], 'text')].concat(ev[2] ? [R('Eigenvalue 3', ev[2], 'text')] : [], [R('Trace', tra, 'num', { dp: 6 }), R('Determinant', d, 'num', { dp: 6 })]) }; });
  C('rref-calculator', 'RREF Calculator (Gaussian Elimination)', 'math/matrices', 'Reduce a matrix to reduced row echelon form and find its rank.', 'Row operations until each pivot is 1 with zeros above and below.',
    [MA], function (v) { var a = parseM(v.mA).map(function (r) { return r.slice(); }), rows = a.length, cols = a[0] ? a[0].length : 0, lead = 0, rank = 0; for (var r = 0; r < rows && lead < cols; r++) { var i = r; while (Math.abs(a[i][lead]) < 1e-12) { i++; if (i === rows) { i = r; lead++; if (lead === cols) break; } } if (lead === cols) break; var t = a[i]; a[i] = a[r]; a[r] = t; var d = a[r][lead]; a[r] = a[r].map(function (x) { return x / d; }); for (var j = 0; j < rows; j++) if (j !== r) { var f = a[j][lead]; a[j] = a[j].map(function (x, k) { return x - f * a[r][k]; }); } lead++; rank++; }
      return { results: [M('Rank', rank, 'int')], html: tbl(a.map(function (r) { return r.map(function (x) { return Math.abs(x) < 1e-10 ? 0 : x; }); })) }; });
  C('dot-product-calculator', 'Dot Product & Cross Product Calculator', 'math/matrices', 'Dot product, cross product, magnitudes and the angle between two vectors.', 'a·b = Σ aᵢbᵢ · |a×b| = |a||b| sin θ.',
    [['a', 'Vector a', 't', '1, 2, 3'], ['b', 'Vector b', 't', '4, 5, 6']],
    function (v) { var a = L(v.a), b = L(v.b); if (a.length !== b.length || a.length < 2) return { error: 'Both vectors need the same number of components (2 or 3).' }; var dot = a.reduce(function (s, x, i) { return s + x * b[i]; }, 0), ma = Math.hypot.apply(null, a), mb = Math.hypot.apply(null, b), res = [M('Dot product', dot, 'num', { dp: 8 }), R('|a|', ma, 'num', { dp: 6 }), R('|b|', mb, 'num', { dp: 6 }), R('Angle between', Math.acos(Math.max(-1, Math.min(1, dot / (ma * mb)))) * 180 / Math.PI, 'num', { dp: 4, u: '°' })];
      if (a.length === 3) res.push(R('Cross product', '(' + N(a[1] * b[2] - a[2] * b[1], 6) + ', ' + N(a[2] * b[0] - a[0] * b[2], 6) + ', ' + N(a[0] * b[1] - a[1] * b[0], 6) + ')', 'text')); return { results: res }; });
  C('vector-magnitude-calculator', 'Vector Magnitude & Unit Vector Calculator', 'math/matrices', 'Length and unit vector of a vector.', '|v| = √(v₁² + v₂² + …).',
    [['v', 'Vector', 't', '3, 4, 12']],
    function (v) { var a = L(v.v); if (!a.length) return { error: 'Enter the vector components.' }; var m = Math.hypot.apply(null, a); return { results: [M('Magnitude', m, 'num', { dp: 8 }), R('Unit vector', m ? '(' + a.map(function (x) { return N(x / m, 5); }).join(', ') + ')' : '—', 'text')] }; });
})(window.CW);
