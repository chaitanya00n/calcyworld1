/* Calcyworld — gap pack 5: basic calculator, interest-rate tools, universal unit converter, small finance/pet/AI extras */
(function (CW) {
  'use strict';
  var C = CW.C, M = CW.M, R = CW.Rr;
  var Mx = function (l, v, dp, u) { return M(l, v, 'num', { dp: dp === undefined ? 2 : dp, u: u || '' }); }, Rx = function (l, v, dp, u) { return R(l, v, 'num', { dp: dp === undefined ? 2 : dp, u: u || '' }); };
  var Mo = function (l, v, dp) { return M(l, v, 'm', { dp: dp === undefined ? 0 : dp }); }, Ro = function (l, v, dp) { return R(l, v, 'm', { dp: dp === undefined ? 0 : dp }); };
  var Mp = function (l, v, dp) { return M(l, v, 'pct', { dp: dp === undefined ? 2 : dp }); }, Rp = function (l, v, dp) { return R(l, v, 'pct', { dp: dp === undefined ? 2 : dp }); };
  var Tx = function (l, v) { return R(l, v, 'text'); }, Mt = function (l, v) { return M(l, v, 'text'); };
  var nums = function (s) { return String(s).split(/[\s,;]+/).map(function (x) { return parseFloat(x); }).filter(function (x) { return isFinite(x); }); };

  /* ---------- Basic calculator (keypad) ---------- */
  CW.register({
    id: 'basic-calculator', title: 'Basic Calculator', g: 'math/arithmetic', pop: 1,
    desc: 'A simple online calculator for everyday sums: add, subtract, multiply, divide, percent and square root. Works with your keyboard.',
    formula: 'Follows the standard order of operations: brackets first, then multiplication and division, then addition and subtraction.',
    faq: [['How do I calculate a percentage?', 'Type the number, press %, and it becomes a hundredth, so 200 × 15% gives 30.'], ['Can I use my keyboard?', 'Yes. Type numbers and operators, press Enter for the answer and Esc to clear.']],
    inputs: [], calc: function () { return { results: [] }; },
    render: function (el) {
      var keys = [['C', '⌫', '(', ')'], ['7', '8', '9', '÷'], ['4', '5', '6', '×'], ['1', '2', '3', '−'], ['0', '.', '%', '+'], ['√', 'x²', '1/x', '=']];
      el.innerHTML = '<div class="cw-sci cw-basic"><div class="cw-screen"><div class="cw-hist" aria-live="polite"></div><input class="cw-expr" aria-label="Expression" inputmode="none" autocomplete="off" spellcheck="false"><div class="cw-live"></div></div>' +
        '<div class="cw-keys cw-keys4">' + keys.map(function (row) { return row.map(function (k) { return '<button type="button" data-k="' + k + '" class="' + (/^[0-9.]$/.test(k) ? 'n' : k === '=' ? 'eq' : /^[+−×÷]$/.test(k) ? 'op' : 'fn') + '">' + k + '</button>'; }).join(''); }).join('') + '</div></div>';
      var ex = el.querySelector('.cw-expr'), live = el.querySelector('.cw-live'), hist = el.querySelector('.cw-hist'), ans = 0;
      var map = { '÷': '÷', '×': '×', '−': '-', 'x²': '^2', '√': '√(', '%': '/100', '1/x': '1/(' };
      var ins = function (t) { var s = ex.selectionStart || ex.value.length; ex.value = ex.value.slice(0, s) + t + ex.value.slice(ex.selectionEnd || s); ex.setSelectionRange(s + t.length, s + t.length); upd(); };
      var calc = function (s) { return CW.evaluate(s, { ans: ans }, {}); };
      var upd = function () { try { var v = ex.value.trim() ? calc(ex.value) : ''; live.textContent = v === '' ? '' : '= ' + CW.fmt.num(v, 10); } catch (e) { live.textContent = ''; } };
      var eq = function () { try { var v = calc(ex.value); hist.insertAdjacentHTML('afterbegin', '<div>' + CW.esc(ex.value) + ' = <b>' + CW.fmt.num(v, 12) + '</b></div>'); ans = v; ex.value = String(+v.toPrecision(15)); upd(); } catch (e) { live.textContent = 'Check the expression'; } };
      el.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-k]'); if (!b) return; var k = b.getAttribute('data-k');
        if (k === 'C') { ex.value = ''; upd(); } else if (k === '⌫') { ex.value = ex.value.slice(0, -1); upd(); } else if (k === '=') eq(); else ins(map[k] || k);
        if (!/Mobi|Android/i.test(navigator.userAgent)) ex.focus();
      });
      ex.addEventListener('input', upd);
      ex.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); eq(); } if (e.key === 'Escape') { ex.value = ''; upd(); } });
    }
  });

  /* ---------- Interest rate tools (INR-scale defaults) ---------- */
  CW.defBase = 'INR';
  C('interest-rate-calculator', 'Interest Rate Calculator', 'finance/interest-savings', 'Find the interest rate of a loan from its payment, or the growth rate of a deposit.', 'Loan: solve P = PMT × (1 − (1 + r)^−n) ÷ r for r. Deposit: rate = (FV ÷ PV)^(1 ÷ years) − 1.',
    [['m', 'Find the rate of', 'g', 1, [[1, 'A loan (from the EMI)'], [2, 'A deposit or investment']]], ['p', 'Loan amount', 'm', 500000, '', { show: 'm==1' }], ['pm', 'Monthly payment (EMI)', 'm', 10500, '', { show: 'm==1' }], ['n', 'Term (months)', 'i', 60, '', { show: 'm==1' }],
     ['pv', 'Amount invested', 'm', 100000, '', { show: 'm==2' }], ['fv', 'Value at the end', 'm', 161051, '', { show: 'm==2' }], ['y', 'Years', 'n', 5, '', { show: 'm==2' }]],
    function (v) {
      if (+v.m === 2) { if (v.pv <= 0 || v.fv <= 0 || v.y <= 0) return { error: 'Enter positive amounts and years.' }; var g = Math.pow(v.fv / v.pv, 1 / v.y) - 1; return { results: [Mp('Annual growth rate (CAGR)', g * 100), Ro('Total gain', v.fv - v.pv), Rp('Total return', (v.fv / v.pv - 1) * 100, 1)] }; }
      if (v.pm * v.n < v.p) return { error: 'The total of all payments is below the loan amount, so the rate would be negative.' };
      var lo = 0, hi = 5, f = function (r) { return r === 0 ? v.pm * v.n - v.p : v.pm * (1 - Math.pow(1 + r, -v.n)) / r - v.p; }; for (var i = 0; i < 200; i++) { var mid = (lo + hi) / 2; if (f(mid) > 0) lo = mid; else hi = mid; }
      var r = (lo + hi) / 2, tot = v.pm * v.n;
      return { results: [Mp('Interest rate per year', r * 1200), Rp('Effective annual rate', (Math.pow(1 + r, 12) - 1) * 100), Rp('Rate per month', r * 100, 3), Ro('Total interest paid', tot - v.p), Ro('Total paid', tot)] };
    }, { pop: 1 });

  C('interest-rate-converter', 'Interest Rate Converter (Nominal, Effective, Flat)', 'finance/interest-savings', 'Convert between monthly, annual, effective and flat interest rates.', 'EAR = (1 + r ÷ m)^m − 1. A flat rate f is roughly 1.8–1.9 × f as a reducing-balance rate over typical terms.',
    [['m', 'Convert from', 'g', 1, [[1, 'Nominal annual rate'], [2, 'Effective annual rate (EAR)'], [3, 'Monthly rate'], [4, 'Flat rate']]], ['r', 'Rate', 'p', 12], ['c', 'Compounding per year', 's', 12, [[1, 'Yearly'], [2, 'Half-yearly'], [4, 'Quarterly'], [12, 'Monthly'], [365, 'Daily']], { show: 'm==1' }], ['n', 'Loan term in months (flat rate only)', 'i', 36, '', { show: 'm==4' }]],
    function (v) {
      var ear, nom12;
      if (+v.m === 1) { ear = Math.pow(1 + v.r / 100 / v.c, v.c) - 1; nom12 = (Math.pow(1 + ear, 1 / 12) - 1) * 12; }
      else if (+v.m === 2) { ear = v.r / 100; nom12 = (Math.pow(1 + ear, 1 / 12) - 1) * 12; }
      else if (+v.m === 3) { nom12 = v.r / 100 * 12; ear = Math.pow(1 + nom12 / 12, 12) - 1; }
      else { var n = v.n, emi = (1 + v.r / 100 * n / 12) / n, lo = 0, hi = 2; for (var i = 0; i < 200; i++) { var mid = (lo + hi) / 2, q = mid === 0 ? 1 / n : (mid / 12) / (1 - Math.pow(1 + mid / 12, -n)); if (q < emi) lo = mid; else hi = mid; } nom12 = (lo + hi) / 2; ear = Math.pow(1 + nom12 / 12, 12) - 1; }
      return { results: [Mp('Effective annual rate (EAR)', ear * 100), Rp('Nominal rate (monthly compounding)', nom12 * 100), Rp('Monthly rate', nom12 * 100 / 12, 3), Rp('Daily rate', (Math.pow(1 + ear, 1 / 365) - 1) * 100, 4), Rp('Quarterly rate', (Math.pow(1 + ear, 1 / 4) - 1) * 100, 3)].concat(+v.m === 4 ? [Rp('Flat rate entered', v.r)] : []), note: +v.m === 4 ? 'The reducing-balance rate is the true cost of a loan quoted at a flat rate.' : undefined };
    });

  C('lakh-crore-to-million-converter', 'Lakh / Crore to Million / Billion Converter', 'converters/number-systems', 'Switch between lakh, crore and million, billion numbers.', '1 lakh = 100,000 · 1 crore = 100 lakh = 10,000,000 · 1 million = 10 lakh · 1 billion = 100 crore.',
    [['v', 'Value', 'n', 25], ['u', 'In', 's', 'crore', [['thousand', 'Thousand'], ['lakh', 'Lakh'], ['million', 'Million'], ['crore', 'Crore'], ['billion', 'Billion'], ['arab', 'Arab (100 crore)'], ['trillion', 'Trillion']]]],
    function (v) {
      var f = { thousand: 1e3, lakh: 1e5, million: 1e6, crore: 1e7, billion: 1e9, arab: 1e9, trillion: 1e12 }, n = v.v * f[v.u], fm = function (x) { return CW.fmt.num(x, 4); };
      var ind = n.toLocaleString('en-IN', { maximumFractionDigits: 2 }), intl = n.toLocaleString('en-US', { maximumFractionDigits: 2 });
      return { results: [Mt('Full number', ind), Tx('International grouping', intl), Rx('Thousand', n / 1e3, 4), Rx('Lakh', n / 1e5, 4), Rx('Million', n / 1e6, 4), Rx('Crore', n / 1e7, 4), Rx('Billion', n / 1e9, 4), Rx('Trillion', n / 1e12, 6)] };
    }, { pop: 1 });

  C('bacterial-generation-time-calculator', 'Bacterial Generation Time Calculator', 'science/biology', 'Doubling time and growth rate from two cell counts.', 'Generations n = log₂(N ÷ N₀). Generation time g = t ÷ n. Growth rate μ = ln 2 ÷ g.',
    [['n0', 'Starting cell count', 'n', 1000], ['n1', 'Final cell count', 'n', 2000000], ['t', 'Time elapsed (hours)', 'n', 4]],
    function (v) {
      if (v.n0 <= 0 || v.n1 <= v.n0 || v.t <= 0) return { error: 'The final count must be larger than the starting count.' };
      var n = Math.log(v.n1 / v.n0) / Math.LN2, g = v.t / n;
      return { results: [Mx('Generation time', g * 60, 1, 'minutes'), Rx('Generations', n, 2), Rx('Growth rate μ', Math.LN2 / g, 3, 'per hour'), Rx('Fold increase', v.n1 / v.n0, 1, '×')] };
    });

  /* ---------- Universal unit converter (type "10 miles to km") ---------- */
  var ALIAS = { inches: 'in', inch: 'in', '"': 'in', feet: 'ft', foot: 'ft', "'": 'ft', yards: 'yd', yard: 'yd', miles: 'mi', mile: 'mi', kms: 'km', meters: 'm', meter: 'm', metres: 'm', metre: 'm', centimeters: 'cm', centimeter: 'cm', millimeters: 'mm', millimeter: 'mm', kilometers: 'km', kilometer: 'km', kilometres: 'km',
    pounds: 'lb', pound: 'lb', lbs: 'lb', ounces: 'oz', ounce: 'oz', grams: 'g', gram: 'g', kilograms: 'kg', kilogram: 'kg', kgs: 'kg', kilos: 'kg', kilo: 'kg', tonnes: 't', tonne: 't', stones: 'st', stone: 'st',
    celsius: 'c', centigrade: 'c', fahrenheit: 'f', kelvin: 'k', '°c': 'c', '°f': 'f',
    liters: 'l', liter: 'l', litres: 'l', litre: 'l', gallons: 'gal', gallon: 'gal', cups: 'cup', teaspoons: 'tsp', teaspoon: 'tsp', tablespoons: 'tbsp', tablespoon: 'tbsp', pints: 'pt', pint: 'pt', quarts: 'qt', quart: 'qt', millilitres: 'ml', milliliters: 'ml',
    acres: 'ac', acre: 'ac', hectares: 'ha', hectare: 'ha', sqft: 'ft2', 'sq ft': 'ft2', 'square feet': 'ft2', 'square foot': 'ft2', sqm: 'm2', 'sq m': 'm2', 'square meters': 'm2', 'square metres': 'm2', 'sq km': 'km2', 'sq yd': 'yd2',
    'km/h': 'kmh', kph: 'kmh', kmph: 'kmh', mph: 'mph', knots: 'kn', 'm/s': 'mps',
    seconds: 's', second: 's', sec: 's', minutes: 'min', minute: 'min', mins: 'min', hours: 'h', hour: 'h', hr: 'h', hrs: 'h', days: 'd', day: 'd', weeks: 'wk', week: 'wk', months: 'mo', month: 'mo', years: 'yr', year: 'yr',
    bytes: 'B', byte: 'B', bits: 'b', kilobytes: 'KB', megabytes: 'MB', gigabytes: 'GB', terabytes: 'TB',
    kilowatts: 'kw', watts: 'w', horsepower: 'hp', joules: 'j', calories: 'cal', kilocalories: 'kcal', kcal: 'kcal', kwh: 'kwh', btu: 'btu',
    degrees: 'deg', degree: 'deg', radians: 'rad', radian: 'rad', psi: 'psi', bar: 'bar', atm: 'atm', pascal: 'pa', pascals: 'pa', hertz: 'hz', newtons: 'n', newton: 'n' };
    var resolveUnit = function (txt) {
    var t = String(txt).trim().replace(/\.$/, ''), lc = t.toLowerCase(), hits = [], seen = {};
    var add = function (g, k) { if (!seen[g + '|' + k]) { seen[g + '|' + k] = 1; hits.push([g, k]); } };
    Object.keys(CW.UNITS).forEach(function (g) {
      var U = CW.UNITS[g].u, a = ALIAS[lc];
      Object.keys(U).forEach(function (k) {
        var nm = String(U[k][0]).toLowerCase().replace(/\s*\(.*?\)/g, '');
        if (k === t || k.toLowerCase() === lc || (a && k === a) || nm === lc || nm + 's' === lc || nm.replace('metre', 'meter') === lc || nm.replace('litre', 'liter') === lc) add(g, k);
      });
    });
    return hits;
  };
  var GROUPS_OK = ['length', 'weight', 'temperature', 'area', 'volume', 'speed', 'time', 'data', 'pressure', 'energy', 'power', 'angle', 'fuel', 'frequency', 'force', 'torque', 'density', 'flow', 'datarate', 'cooking'];
  C('unit-converter', 'Unit Converter (All-in-One)', 'converters/general', 'Type a sentence like “10 miles to km” and get the answer for any common unit.', 'Result = value × (unit factor ÷ target factor). Temperature and fuel economy use their own formulas.',
    [['q', 'Convert', 't', '10 miles to km']],
    function (v) {
      var m = /^\s*([-+]?\d[\d,]*\.?\d*(?:e[-+]?\d+)?|[-+]?\.\d+)\s*(.+?)\s+(?:to|in|into|as|=|->|→)\s+(.+?)\s*$/i.exec(String(v.q));
      if (!m) return { error: 'Write it like “5 ft to cm”, “72 f to c” or “2 kg in lb”.' };
      var val = parseFloat(m[1].replace(/,/g, '')), a = resolveUnit(m[2]), b = resolveUnit(m[3]);
      if (!a.length) return { error: 'I do not know the unit “' + m[2] + '”.' }; if (!b.length) return { error: 'I do not know the unit “' + m[3] + '”.' };
      var pair = null; a.forEach(function (x) { b.forEach(function (y) { if (!pair && x[0] === y[0] && GROUPS_OK.indexOf(x[0]) >= 0) pair = [x[0], x[1], y[1]]; }); });
      if (!pair) return { error: 'Those two units measure different things, so they cannot be converted into each other.' };
      var g = pair[0], U = CW.UNITS[g].u, out = CW.convertUnit(g, val, pair[1], pair[2]);
      var rows = Object.keys(U).slice(0, 14).map(function (k) { return [U[k][0], CW.convertUnit(g, val, pair[1], k)]; });
      return { results: [M(CW.fmt.num(val, 8) + ' ' + U[pair[1]][0].toLowerCase() + ' =', out, 'num', { dp: 6, u: U[pair[2]][0].toLowerCase() }), Rx('Reverse: 1 ' + U[pair[2]][0].toLowerCase(), CW.convertUnit(g, 1, pair[2], pair[1]), 6, U[pair[1]][0].toLowerCase()), Tx('Unit family', g)], table: { head: ['Unit', 'Same value in'], rows: rows, fmt: ['', 'num'], title: 'Same value in other ' + g + ' units' } };
    }, { pop: 1 });

  var MI = [['Inches', 'Centimetres', 2.54, 'in', 'cm'], ['Feet', 'Metres', 0.3048, 'ft', 'm'], ['Yards', 'Metres', 0.9144, 'yd', 'm'], ['Miles', 'Kilometres', 1.609344, 'mi', 'km'], ['Ounces', 'Grams', 28.349523, 'oz', 'g'], ['Pounds', 'Kilograms', 0.45359237, 'lb', 'kg'], ['Fluid ounces (US)', 'Millilitres', 29.5735, 'fl oz', 'ml'], ['Gallons (US)', 'Litres', 3.785412, 'gal', 'L'], ['Square feet', 'Square metres', 0.09290304, 'sq ft', 'm²'], ['Acres', 'Hectares', 0.40468564, 'ac', 'ha'], ['Miles per hour', 'Kilometres per hour', 1.609344, 'mph', 'km/h'], ['Miles per gallon (US)', 'Kilometres per litre', 0.425144, 'mpg', 'km/L']];
  C('metric-to-imperial-converter', 'Metric ↔ Imperial Converter', 'converters/general', 'Common metric and imperial conversions in one table, in both directions.', 'Each row multiplies by an exact factor, for example 1 inch = 2.54 cm and 1 mile = 1.609344 km.',
    [['d', 'Direction', 'g', 1, [[1, 'Imperial → Metric'], [2, 'Metric → Imperial']]], ['x', 'Value', 'n', 10], ['r', 'Row to highlight', 's', 3, MI.map(function (r, i) { return [i, r[0] + ' ↔ ' + r[1]]; })]],
    function (v) {
      var rw = MI[v.r], f = rw[2], o = +v.d === 1 ? v.x * f : v.x / f, from = +v.d === 1 ? rw[3] : rw[4], to = +v.d === 1 ? rw[4] : rw[3];
      var rows = MI.map(function (r) { return [r[3] + ' ↔ ' + r[4], +v.d === 1 ? v.x * r[2] : v.x / r[2], +v.d === 1 ? r[4] : r[3]]; });
      return { results: [M(CW.fmt.num(v.x, 6) + ' ' + from + ' =', o, 'num', { dp: 5, u: to }), Rx('Factor', f, 6), Rx('Reverse factor', 1 / f, 6)], table: { head: ['Pair', 'Result', 'Unit'], rows: rows, fmt: ['', 'num', ''], title: 'The same value in every pair' } };
    });

  /* ---------- Small finance / business extras ---------- */
  C('discount-stacking-calculator', 'Discount Stacking Calculator', 'everyday/shopping', 'Final price when you stack several discounts, coupons and cashback.', 'Stacked discounts multiply, not add: 20% then 10% = 1 − 0.8 × 0.9 = 28%.',
    [['p', 'Original price', 'm', 5000], ['d', 'Discounts in % — one per line, in the order they apply', 'ta', '20\n10\n5', '', { rows: 4 }], ['f', 'Flat coupon off', 'm', 250], ['cb', 'Cashback after purchase', 'p', 5], ['tx', 'Tax on the final price', 'p', 18]],
    function (v) {
      var ds = nums(v.d), price = v.p, rows = [], i;
      for (i = 0; i < ds.length; i++) { var before = price; price = price * (1 - ds[i] / 100); rows.push([i + 1, ds[i], before, price]); }
      var afterCoupon = Math.max(0, price - v.f), taxed = afterCoupon * (1 + v.tx / 100), cb = afterCoupon * v.cb / 100;
      return { results: [Mo('You pay', taxed, 2), Ro('Price after discounts and coupon', afterCoupon, 2), Rp('Total discount (before coupon)', (1 - price / v.p) * 100, 2), Rp('Same as one discount of', (1 - afterCoupon / v.p) * 100, 2), Ro('Cashback you get back', cb, 2), Ro('Effective price after cashback', taxed - cb, 2)], table: rows.length ? { head: ['Step', 'Discount %', 'Price before', 'Price after'], rows: rows, fmt: ['int', 'pct', 'money', 'money'], title: 'Step by step' } : undefined };
    }, { pop: 1 });

  C('exchange-rate-margin-calculator', 'Exchange Rate Margin Calculator', 'finance/budget', 'The hidden markup your bank or app adds to the mid-market exchange rate.', 'Margin % = (mid-market rate − rate you get) ÷ mid-market rate × 100.',
    [['a', 'Amount you send', 'm', 100000], ['mid', 'Mid-market rate (Google / XE)', 'n', 0.01155], ['g', 'Rate your provider gave', 'n', 0.01128], ['fee', 'Fixed fee', 'm', 500]],
    function (v) {
      var best = v.a * v.mid, got = (v.a - v.fee) * v.g, loss = best - got, mg = (v.mid - v.g) / v.mid * 100;
      return { results: [Mp('Hidden rate margin', mg), Rx('Recipient gets', got, 2), Rx('Would get at mid-market', best, 2), Rx('Total cost (margin + fee)', loss, 2), Rp('Total cost as a share', loss / best * 100, 2)], note: 'Amounts on the receiving side are in the destination currency.' };
    });

  var IT = [[5, 'Buildings — residential'], [10, 'Buildings — other, furniture and fittings'], [15, 'Plant and machinery (general)'], [25, 'Intangibles (patents, trademarks, licences)'], [40, 'Computers and software'], [30, 'Motor cars (non-hire)'], [45, 'Motor buses, lorries on hire']];
  C('income-tax-depreciation-calculator', 'Depreciation as per Income Tax Act (WDV Block Rates)', 'tax-salary/income-tax', 'Block-wise written down value depreciation for Indian income tax.', 'Depreciation = WDV at the start of the year × block rate. Half the rate applies to assets used for less than 180 days in the year of purchase.',
    [['b', 'Asset block', 's', 15, IT.map(function (r) { return [r[0], r[0] + '% — ' + r[1]]; })], ['c', 'Cost of the asset', 'm', 800000], ['y', 'Years to show', 'i', 8], ['h', 'Used 180 days or more in year 1', 'c', 1]],
    function (v) {
      var r = +v.b / 100, w = v.c, rows = [], tot = 0;
      for (var i = 1; i <= v.y; i++) { var d = w * r * (i === 1 && !v.h ? 0.5 : 1); w -= d; tot += d; rows.push([i, d, w]); }
      return { results: [Mo('Depreciation in year 1', rows[0][1]), Ro('Total over ' + v.y + ' years', tot), Ro('Written down value at the end', w), Rp('Rate used', r * 100, 0)], table: { head: ['Year', 'Depreciation', 'Closing WDV'], rows: rows, fmt: ['int', 'money', 'money'], title: 'Year by year' }, chart: { type: 'bar', title: 'Depreciation per year', labels: rows.map(function (x) { return 'Y' + x[0]; }), series: [{ l: 'Depreciation', pts: rows.map(function (x) { return x[1]; }) }], f: 'money' }, note: 'Check the current block rates and additional-depreciation rules with a tax professional.' };
    });

  C('intangible-amortization-calculator', 'Amortization of Intangibles Calculator', 'business/accounting', 'Spread the cost of a patent, licence or software over its useful life.', 'Straight-line amortization = (cost − residual value) ÷ useful life.',
    [['c', 'Cost of the intangible asset', 'm', 1200000], ['r', 'Residual value', 'm', 0], ['l', 'Useful life (years)', 'n', 5], ['k', 'Years already amortized', 'n', 0]],
    function (v) {
      var a = (v.c - v.r) / v.l, rows = []; for (var i = 1; i <= Math.ceil(v.l); i++) rows.push([i, a, v.c - Math.min(i, v.l) * a]);
      return { results: [Mo('Annual amortization', a), Ro('Monthly amortization', a / 12), Ro('Book value now', v.c - Math.min(v.k, v.l) * a), Ro('Remaining to amortize', Math.max(0, v.l - v.k) * a)], table: { head: ['Year', 'Amortization', 'Book value'], rows: rows, fmt: ['int', 'money', 'money'], title: 'Schedule' } };
    });

  C('football-fantasy-points-calculator', 'Football Fantasy Points Calculator', 'fitness/sports-scores', 'Fantasy football points for a player from goals, assists and clean sheets.', 'Points follow the common Fantasy Premier League scheme; check your league’s own rules.',
    [['pos', 'Position', 'g', 3, [[1, 'Goalkeeper'], [2, 'Defender'], [3, 'Midfielder'], [4, 'Forward']]], ['mn', 'Minutes played', 'i', 90], ['g', 'Goals', 'i', 1], ['a', 'Assists', 'i', 1], ['cs', 'Clean sheet', 'c', 0], ['sv', 'Saves (goalkeeper)', 'i', 0, '', { show: 'pos==1' }], ['yc', 'Yellow cards', 'i', 0], ['rc', 'Red cards', 'i', 0], ['og', 'Own goals', 'i', 0], ['pm', 'Penalties missed', 'i', 0], ['bn', 'Bonus points', 'i', 0]],
    function (v) {
      var p = +v.pos, gp = [0, 10, 6, 5, 4][p], csp = [0, 4, 4, 1, 0][p], pts = (v.mn >= 60 ? 2 : v.mn > 0 ? 1 : 0) + v.g * gp + v.a * 3 + (v.cs && v.mn >= 60 ? csp : 0) + (p === 1 ? Math.floor((v.sv || 0) / 3) : 0) - v.yc - v.rc * 3 - v.og * 2 - v.pm * 2 + v.bn;
      return { results: [Mx('Fantasy points', pts, 0), Rx('From goals', v.g * gp, 0), Rx('From assists', v.a * 3, 0), Rx('Appearance', v.mn >= 60 ? 2 : v.mn > 0 ? 1 : 0, 0), Rx('Clean sheet', v.cs && v.mn >= 60 ? csp : 0, 0)] };
    });

  /* ---------- Pets ---------- */
  C('pet-food-calculator', 'Pet Food Calculator (Dog & Cat)', 'pets-garden/pets', 'Daily food amount for a dog or cat, from weight and activity.', 'Resting energy RER = 70 × kg^0.75. Daily need = RER × life-stage factor. Food = kcal ÷ kcal per 100 g.',
    [['s', 'Pet', 'g', 1, [[1, 'Dog'], [2, 'Cat']]], ['w', 'Weight (kg)', 'n', 18], ['st', 'Life stage', 's', 1.6, [[1.6, 'Adult, neutered'], [1.8, 'Adult, intact'], [1.2, 'Weight loss'], [2.0, 'Active / working'], [2.5, 'Puppy / kitten (4–12 months)'], [3.0, 'Growing (under 4 months)'], [1.1, 'Senior, inactive']]], ['k', 'Food energy (kcal per 100 g)', 'n', 360], ['pk', 'Price of 1 kg of food', 'm', 450]],
    function (v) {
      var rer = 70 * Math.pow(v.w, 0.75), kc = rer * v.st, g = kc / v.k * 100, perMonth = g * 30 / 1000;
      return { results: [Mx('Food per day', g, 0, 'g'), Rx('Energy per day', kc, 0, 'kcal'), Rx('Per meal (2 meals)', g / 2, 0, 'g'), Rx('Food per month', perMonth, 1, 'kg'), Ro('Cost per month', perMonth * v.pk)], note: 'A starting estimate. Adjust to body condition and ask your vet for medical diets.' };
    }, { pop: 1 });

  var interp = function (T, x) { if (x <= T[0][0]) return T[0][1]; for (var i = 1; i < T.length; i++) if (x <= T[i][0]) return T[i - 1][1] + (T[i][1] - T[i - 1][1]) * (x - T[i - 1][0]) / (T[i][0] - T[i - 1][0]); return 1; };
  var GROW = { small: [[8, 0.3], [12, 0.45], [16, 0.6], [26, 0.85], [39, 0.95], [52, 1]], medium: [[8, 0.25], [14, 0.5], [26, 0.75], [39, 0.9], [52, 0.97], [78, 1]], large: [[8, 0.17], [14, 0.33], [26, 0.6], [39, 0.8], [52, 0.92], [78, 1]], cat: [[8, 0.25], [16, 0.45], [26, 0.7], [39, 0.88], [52, 0.97], [78, 1]] };
  C('pet-adult-weight-calculator', 'Puppy & Kitten Adult Weight Predictor', 'pets-garden/pets', 'Estimate your pet’s adult weight from its weight at a young age.', 'Adult weight ≈ current weight ÷ the share of adult weight that breeds of that size usually reach at that age.',
    [['s', 'Pet', 'g', 1, [[1, 'Dog'], [2, 'Cat']]], ['w', 'Current weight (kg)', 'n', 6], ['a', 'Age (weeks)', 'n', 14], ['sz', 'Expected adult size', 's', 'medium', [['small', 'Small / toy breed (under 10 kg)'], ['medium', 'Medium breed (10–25 kg)'], ['large', 'Large / giant breed (over 25 kg)']], { show: 's==1' }]],
    function (v) {
      var f = interp(+v.s === 1 ? GROW[v.sz] : GROW.cat, v.a), adult = v.w / f;
      return { results: [Mx('Estimated adult weight', adult, 1, 'kg'), Rx('In pounds', adult * 2.20462, 1, 'lb'), Rp('Share of adult weight reached', f * 100, 0), Tx('Likely range', (adult * 0.88).toFixed(1) + ' – ' + (adult * 1.12).toFixed(1) + ' kg')], note: 'Growth varies by breed, so treat this as a rough guide. Your vet can give a breed-specific estimate.' };
    });

  /* ---------- AI ---------- */
  CW.defBase = null;
  C('ai-vs-human-cost-calculator', 'AI vs Human Cost Comparison', 'tech/ai', 'Compare the cost of doing a task with AI against doing it by hand.', 'Human cost = hours × hourly rate × tasks. AI cost = (tokens × price) + review time. Break-even = tasks where the totals meet.',
    [['n', 'Tasks per month', 'n', 2000], ['hh', 'Human time per task (minutes)', 'n', 15], ['hr', 'Human cost per hour', 'm', 12], ['it', 'AI input tokens per task', 'n', 3000], ['ot', 'AI output tokens per task', 'n', 700], ['pi', 'AI input price per 1M tokens', 'm', 3], ['po', 'AI output price per 1M tokens', 'm', 15], ['rv', 'Human review time per AI task (minutes)', 'n', 2], ['ok', 'Share of AI outputs that need a full redo', 'p', 8], ['fx', 'Fixed monthly cost of the AI setup', 'm', 100]],
    function (v) {
      var human = v.n * v.hh / 60 * v.hr, ai1 = (v.it * v.pi + v.ot * v.po) / 1e6, redo = v.ok / 100, aiTask = ai1 * (1 + redo) + v.rv / 60 * v.hr + redo * v.hh / 60 * v.hr, ai = aiTask * v.n + v.fx, perHuman = v.hh / 60 * v.hr, be = perHuman > aiTask ? v.fx / (perHuman - aiTask) : NaN;
      return { results: [Mo('Monthly saving with AI', human - ai), Ro('Human cost per month', human), Ro('AI-assisted cost per month', ai), Ro('Cost per task — human', perHuman, 2), Ro('Cost per task — AI-assisted', aiTask, 2), Rp('Saving', (1 - ai / human) * 100, 0), isFinite(be) ? Rx('Break-even', Math.ceil(be), 0, 'tasks per month') : Tx('Break-even', 'AI does not pay off at these numbers')], note: 'Counts review time and redo cost, not only the model bill. Replace the token prices with your model’s current rates.' };
    });
})(window.CW);
