/* Calcyworld — gap pack 4: everyday planning, sizes, farming, photo, AI costs, finance extras */
(function (CW) {
  'use strict';
  var C = CW.C, M = CW.M, R = CW.Rr;
  var Mx = function (l, v, dp, u) { return M(l, v, 'num', { dp: dp === undefined ? 2 : dp, u: u || '' }); }, Rx = function (l, v, dp, u) { return R(l, v, 'num', { dp: dp === undefined ? 2 : dp, u: u || '' }); };
  var Mo = function (l, v, dp) { return M(l, v, 'm', { dp: dp === undefined ? 0 : dp }); }, Ro = function (l, v, dp) { return R(l, v, 'm', { dp: dp === undefined ? 0 : dp }); };
  var Mp = function (l, v, dp) { return M(l, v, 'pct', { dp: dp === undefined ? 1 : dp }); }, Rp = function (l, v, dp) { return R(l, v, 'pct', { dp: dp === undefined ? 1 : dp }); };
  var Tx = function (l, v) { return R(l, v, 'text'); }, Mt = function (l, v) { return M(l, v, 'text'); };
  var num = function (s) { return +String(s).replace(/,/g, ''); };
  var lines2 = function (s) { return String(s).trim().split(/\n/).map(function (l) { var m = /^(.*?)[\s:]+([\d.,]+)\s*$/.exec(l.trim()); return m ? [m[1], num(m[2])] : null; }).filter(Boolean); };
  var lines3 = function (s) { return String(s).trim().split(/\n/).map(function (l) { var m = /^(.*?)[\s:]+([\d.,]+)[\s:]+([\d.,]+)\s*$/.exec(l.trim()); return m ? [m[1], num(m[2]), num(m[3])] : null; }).filter(Boolean); };
  var nums = function (s) { return String(s).split(/[\s,;]+/).map(function (x) { return parseFloat(x); }).filter(function (x) { return isFinite(x); }); };
  var fd = function (d) { return CW.fmt.date(d); };
  var addDays = function (d, n) { return new Date(d.getTime() + n * 86400000); };
  var dayDiff = function (a, b) { return Math.round((b - a) / 86400000); };
  var gcd = function (a, b) { while (b) { var t = a % b; a = b; b = t; } return a; };

  /* =========================== INR-scale section =========================== */
  CW.defBase = 'INR';

  /* ---------- Education ---------- */
  var SA = { 36: 1590, 35: 1540, 34: 1500, 33: 1460, 32: 1430, 31: 1400, 30: 1370, 29: 1340, 28: 1310, 27: 1280, 26: 1240, 25: 1210, 24: 1180, 23: 1140, 22: 1110, 21: 1080, 20: 1040, 19: 1010, 18: 970, 17: 930, 16: 890, 15: 850, 14: 800, 13: 760, 12: 710, 11: 670, 10: 630, 9: 590 };
  C('sat-act-score-converter', 'SAT ↔ ACT Score Converter', 'everyday/education', 'Convert a SAT total to an ACT composite or the other way round.', 'Uses the official 2018 ACT–SAT concordance table.',
    [['d', 'Convert', 'g', 1, [[1, 'ACT → SAT'], [2, 'SAT → ACT']]], ['act', 'ACT composite (1–36)', 'i', 28, '', { show: 'd==1' }], ['sat', 'SAT total (400–1600)', 'i', 1320, '', { show: 'd==2' }]],
    function (v) {
      var rows = Object.keys(SA).map(Number).sort(function (a, b) { return b - a; }).map(function (k) { return [k, SA[k]]; });
      if (+v.d === 1) { var a = Math.max(1, Math.min(36, Math.round(v.act))), s = a < 9 ? 400 + a * 20 : SA[a]; return { results: [Mx('Equivalent SAT', s, 0), Rx('Percentile (approx.)', a >= 35 ? 99 : a >= 33 ? 98 : a >= 30 ? 95 : a >= 28 ? 90 : a >= 25 ? 80 : a >= 22 ? 65 : a >= 20 ? 50 : 30, 0, '%')], table: { head: ['ACT', 'SAT'], rows: rows, fmt: ['int', 'int'], title: 'Concordance table' }, note: a < 9 ? 'Below ACT 9 the table has no official value; this is a rough linear estimate.' : undefined }; }
      var best = 36, diff = 1e9; rows.forEach(function (r) { var d = Math.abs(r[1] - v.sat); if (d < diff) { diff = d; best = r[0]; } });
      return { results: [Mx('Equivalent ACT', v.sat < 590 ? 8 : best, 0), Rx('SAT of that ACT score', SA[best] || 590, 0)], table: { head: ['ACT', 'SAT'], rows: rows, fmt: ['int', 'int'], title: 'Concordance table' } };
    }, { pop: 1 });

  C('exam-rank-percentile-calculator', 'Exam Rank ↔ Percentile Calculator (JEE, NEET, CAT)', 'everyday/education', 'Percentile from your rank, or the rank a percentile corresponds to.', 'Percentile ≈ (candidates − rank + 1) ÷ candidates × 100.',
    [['m', 'Find', 'g', 1, [[1, 'Percentile from rank'], [2, 'Rank from percentile']]], ['n', 'Total candidates', 'n', 1200000], ['r', 'Your rank', 'n', 15000, '', { show: 'm==1' }], ['p', 'Percentile', 'n', 98.75, '', { show: 'm==2' }]],
    function (v) {
      if (+v.m === 1) { if (v.r < 1 || v.r > v.n) return { error: 'Rank must be between 1 and the number of candidates.' }; var p = (v.n - v.r + 1) / v.n * 100; return { results: [Mp('Percentile', p, 4), Rx('Candidates ahead of you', v.r - 1, 0), Rx('Candidates behind you', v.n - v.r, 0), Rp('You are in the top', v.r / v.n * 100, 3)] }; }
      var rk = Math.round(v.n - v.p / 100 * v.n + 1); return { results: [Mx('Approximate rank', rk, 0), Rp('Top share of candidates', rk / v.n * 100, 3), Rx('Candidates ahead', rk - 1, 0)] };
    });

  C('best-of-five-percentage-calculator', 'Best of Five Subjects Percentage Calculator', 'everyday/education', 'Board exam percentage counting only your best five subjects.', 'Percentage = sum of best five ÷ (5 × maximum marks) × 100.',
    [['s', 'Subjects and marks — "subject marks", one per line', 'ta', 'English 82\nHindi 88\nMathematics 91\nScience 85\nSocial Science 79\nInformation Technology 96', '', { rows: 7 }], ['mx', 'Maximum marks per subject', 'n', 100], ['m', 'Rule', 'g', 1, [[1, 'Best 5 of all'], [2, 'English + best 4 others']]]],
    function (v) {
      var ss = lines2(v.s); if (ss.length < 5) return { error: 'Enter at least five subjects.' };
      var pick, drop; var srt = ss.slice().sort(function (a, b) { return b[1] - a[1]; });
      if (+v.m === 1) { pick = srt.slice(0, 5); drop = srt.slice(5); }
      else { var en = ss.filter(function (x) { return /english/i.test(x[0]); })[0] || srt[0], rest = ss.filter(function (x) { return x !== en; }).sort(function (a, b) { return b[1] - a[1]; }); pick = [en].concat(rest.slice(0, 4)); drop = rest.slice(4); }
      var tot = pick.reduce(function (s, x) { return s + x[1]; }, 0), all = ss.reduce(function (s, x) { return s + x[1]; }, 0);
      return { results: [Mp('Percentage (best five)', tot / (5 * v.mx) * 100, 2), Rx('Marks in best five', tot, 0), Rx('Out of', 5 * v.mx, 0), Tx('Counted', pick.map(function (x) { return x[0]; }).join(', ')), Tx('Left out', drop.length ? drop.map(function (x) { return x[0]; }).join(', ') : 'none'), Rp('Percentage of all subjects', all / (ss.length * v.mx) * 100, 2)] };
    }, { pop: 1 });

  /* ---------- Planning ---------- */
  C('party-food-calculator', 'Party Food Quantity Calculator', 'everyday/planning', 'How much of each dish to make or order for your guests.', 'Total = guests × portion per person × (1 + buffer). Children eat about 60% of an adult portion.',
    [['a', 'Adults', 'i', 30], ['k', 'Children', 'i', 8], ['b', 'Extra buffer', 'p', 10], ['m', 'Menu — "dish per-person amount" (put the unit in brackets), one per line', 'ta', 'Rice (g) 120\nDal (g) 100\nPaneer sabzi (g) 100\nVeg sabzi (g) 100\nRoti (pcs) 3\nSalad (g) 60\nRaita (g) 80\nSweet (pcs) 1.5\nWater and soft drinks (ml) 500', '', { rows: 8 }]],
    function (v) {
      var m = lines2(v.m); if (!m.length) return { error: 'Add dishes like "Rice (g) 120".' };
      var eq = v.a + v.k * 0.6, rows = m.map(function (x) { var q = x[1] * eq * (1 + v.b / 100), u = (/\((g|ml)\)/i.exec(x[0]) || [])[1], t = u && q >= 1000 ? (q / 1000).toFixed(1) + (u === 'g' ? ' kg' : ' L') : Math.round(q * 10) / 10 + (u ? ' ' + u : ' ' + ((/\(([a-z]+)\)/i.exec(x[0]) || [0, ''])[1])); return [x[0].replace(/\s*\(.*?\)\s*/, ' ').trim(), x[1], t]; });
      return { results: [Mx('Portions to plan for (adult equivalents)', eq * (1 + v.b / 100), 1), Rx('Guests', v.a + v.k, 0), Rx('Dishes', m.length, 0)], table: { head: ['Dish', 'Per adult', 'Total to prepare'], rows: rows, fmt: ['', 'num', ''], title: 'Shopping and cooking quantities' } };
    }, { pop: 1 });

  C('travel-budget-calculator', 'Travel Budget Calculator', 'everyday/planning', 'Total trip cost and per-person, per-day budget.', 'Total = stay + food + local transport + activities + flights + visa/insurance + shopping + buffer.',
    [['d', 'Days', 'i', 7], ['p', 'Travellers', 'i', 2], ['st', 'Stay per night (all rooms)', 'm', 4500], ['fo', 'Food per person per day', 'm', 1200], ['tr', 'Local transport per day (total)', 'm', 1000], ['ac', 'Activities and entry fees per person per day', 'm', 800], ['fl', 'Flights / train per person (round trip)', 'm', 12000], ['vi', 'Visa, insurance and forex per person', 'm', 3000], ['sh', 'Shopping and gifts (total)', 'm', 10000], ['bf', 'Buffer for surprises', 'p', 10]],
    function (v) {
      var parts = [['Stay', v.st * v.d], ['Food', v.fo * v.p * v.d], ['Local transport', v.tr * v.d], ['Activities', v.ac * v.p * v.d], ['Flights / train', v.fl * v.p], ['Visa and insurance', v.vi * v.p], ['Shopping', v.sh]], sub = parts.reduce(function (s, x) { return s + x[1]; }, 0), tot = sub * (1 + v.bf / 100);
      return { results: [Mo('Total trip budget', tot), Ro('Per person', tot / v.p), Ro('Per day', tot / v.d), Ro('Buffer included', sub * v.bf / 100), Ro('Daily spending money per person', (tot - v.fl * v.p - v.vi * v.p) / v.p / v.d)], chart: { type: 'donut', data: parts.map(function (x) { return { l: x[0], v: x[1] }; }), f: 'money' } };
    }, { pop: 1 });

  C('hotel-cost-split-calculator', 'Hotel Cost Split Calculator', 'everyday/planning', 'Each person’s share of rooms, taxes and extras.', 'Share = (rooms × nights × rate × (1 + tax) + extras) ÷ people.',
    [['r', 'Rooms', 'i', 2], ['n', 'Nights', 'i', 3], ['rt', 'Rate per room per night', 'm', 5200], ['tx', 'Taxes and service charge', 'p', 12], ['ex', 'Extras (breakfast, parking) in total', 'm', 4000], ['p', 'People sharing the cost', 'i', 5]],
    function (v) { var room = v.r * v.n * v.rt, tax = room * v.tx / 100, tot = room + tax + v.ex; return { results: [Mo('Each person pays', tot / v.p), Ro('Total bill', tot), Ro('Room charges', room), Ro('Taxes', tax), Ro('Extras', v.ex), Ro('Per room per night (with tax)', v.rt * (1 + v.tx / 100))] }; });

  C('luggage-weight-limit-calculator', 'Luggage Weight Limit Checker', 'everyday/planning', 'Check your bags against the airline allowance and see the excess fee.', 'Excess = total weight − allowance; fee = excess kg × rate.',
    [['u', 'Unit', 'g', 1, [[1, 'kg'], [2, 'lb']]], ['b', 'Bags — "name weight", one per line', 'ta', 'Check-in bag 1 17.5\nCheck-in bag 2 11.2\nCabin bag 6.4', '', { rows: 4 }], ['pb', 'Allowance per bag', 'n', 23], ['tot', 'Total allowance (all bags)', 'n', 30], ['fee', 'Excess baggage fee per kg', 'm', 600]],
    function (v) {
      var bs = lines2(v.b); if (!bs.length) return { error: 'Add bags like "Bag 1 17.5".' };
      var f = v.u === 2 ? 0.45359237 : 1, rows = bs.map(function (x) { return [x[0], x[1], x[1] > v.pb ? 'Over by ' + (x[1] - v.pb).toFixed(1) : 'OK']; }), tw = bs.reduce(function (s, x) { return s + x[1]; }, 0), ex = Math.max(0, tw - v.tot);
      return { results: [Mx('Total weight', tw, 1, v.u === 2 ? 'lb' : 'kg'), Rx('Over the total allowance by', ex, 1, v.u === 2 ? 'lb' : 'kg'), Ro('Excess fee', ex * f * v.fee), Rx('Bags over the per-bag limit', rows.filter(function (r) { return r[2] !== 'OK'; }).length, 0)], table: { head: ['Bag', 'Weight', 'Status'], rows: rows, fmt: ['', 'num', ''], title: 'Bag by bag' } };
    });

  C('retirement-date-calculator', 'Retirement Date Calculator', 'date-time/age', 'The date you retire and the time left until then.', 'Retirement date = date of birth + retirement age.',
    [['dob', 'Date of birth', 'd', -12775], ['age', 'Retirement age', 'i', 60]],
    function (v) {
      var rd = new Date(v.dob.getFullYear() + v.age, v.dob.getMonth(), v.dob.getDate()), t = new Date(); t.setHours(0, 0, 0, 0);
      var left = dayDiff(t, rd); if (left <= 0) return { results: [M('Retirement date', rd, 'date'), Tx('Status', 'You have already reached retirement age')] };
      var y = rd.getFullYear() - t.getFullYear(), m = rd.getMonth() - t.getMonth(), d = rd.getDate() - t.getDate(); if (d < 0) { m--; d += new Date(rd.getFullYear(), rd.getMonth(), 0).getDate(); } if (m < 0) { y--; m += 12; }
      return { results: [M('Retirement date', rd, 'date'), Tx('Time left', y + ' years, ' + m + ' months, ' + d + ' days'), Rx('Days left', left, 0), Rx('Weeks left', left / 7, 0), Rx('Working days left (approx.)', left * 5 / 7, 0), Tx('Day of the week', rd.toLocaleDateString(undefined, { weekday: 'long' }))] };
    }, { pop: 1 });

  var nth = function (y, mo, wd, n) { var d = new Date(y, mo, 1); while (d.getDay() !== wd) d.setDate(d.getDate() + 1); d.setDate(d.getDate() + (n - 1) * 7); return d; };
  var FEST = [
    ['New Year’s Day', function (y) { return new Date(y, 0, 1); }], ['Republic Day (India)', function (y) { return new Date(y, 0, 26); }], ['Valentine’s Day', function (y) { return new Date(y, 1, 14); }], ['Holi', { 2027: [2, 22], 2028: [2, 11], 2029: [2, 1], 2030: [2, 20] }],
    ['Eid al-Fitr (approx.)', { 2027: [2, 10], 2028: [1, 27], 2029: [1, 15], 2030: [1, 5] }], ['Easter', { 2027: [2, 28], 2028: [3, 16], 2029: [3, 1], 2030: [3, 21] }], ['Mother’s Day (US)', function (y) { return nth(y, 4, 0, 2); }], ['Eid al-Adha (approx.)', { 2027: [4, 17], 2028: [4, 5], 2029: [3, 25], 2030: [3, 14] }],
    ['Father’s Day (US)', function (y) { return nth(y, 5, 0, 3); }], ['Independence Day (US)', function (y) { return new Date(y, 6, 4); }], ['Independence Day (India)', function (y) { return new Date(y, 7, 15); }], ['Halloween', function (y) { return new Date(y, 9, 31); }],
    ['Diwali', { 2026: [10, 8], 2027: [9, 29], 2028: [9, 17], 2029: [10, 5], 2030: [9, 26] }], ['Thanksgiving (US)', function (y) { return nth(y, 10, 4, 4); }], ['Black Friday', function (y) { var t = nth(y, 10, 4, 4); t.setDate(t.getDate() + 1); return t; }], ['Christmas', function (y) { return new Date(y, 11, 25); }], ['New Year’s Eve', function (y) { return new Date(y, 11, 31); }],
    ['Chinese New Year', { 2027: [1, 6], 2028: [0, 26], 2029: [1, 13], 2030: [1, 3] }]
  ];
  var nextFest = function (f, from) { for (var y = from.getFullYear(); y <= from.getFullYear() + 4; y++) { var d = typeof f[1] === 'function' ? f[1](y) : (f[1][y] ? new Date(y, f[1][y][0], f[1][y][1]) : null); if (d && d >= from) return d; } return null; };
  C('festival-countdown-calculator', 'Festival & Holiday Countdown', 'date-time/countdown', 'Days left until Diwali, Holi, Christmas, Eid and other big days.', 'Counts the days from today to the next occurrence. Moving festival dates are approximate and can shift by a day.',
    [['f', 'Countdown to', 's', 12, FEST.map(function (f, i) { return [i, f[0]]; })]],
    function (v) {
      var t = new Date(); t.setHours(0, 0, 0, 0); var rows = FEST.map(function (f) { var d = nextFest(f, t); return d ? [f[0], fd(d), dayDiff(t, d), d] : null; }).filter(Boolean).sort(function (a, b) { return a[2] - b[2]; });
      var sel = FEST[+v.f], d = nextFest(sel, t); if (!d) return { error: 'No date available for that festival yet.' }; var n = dayDiff(t, d);
      return { results: [Mx(sel[0] + ' in', n, 0, 'days'), R('Date', d, 'date'), Rx('Weeks', n / 7, 1), Rx('Hours', n * 24, 0), Tx('Day of the week', d.toLocaleDateString(undefined, { weekday: 'long' }))], table: { head: ['Festival', 'Next date', 'Days left'], rows: rows.map(function (r) { return [r[0], r[1], r[2]]; }), fmt: ['', '', 'int'], title: 'All upcoming' }, note: 'Lunar-calendar dates (Diwali, Holi, Eid) come from published calendars and can differ by a day with moon sighting or region.' };
    }, { pop: 1 });

  /* ---------- Sizes ---------- */
  var PAPER = { A0: [841, 1189], A1: [594, 841], A2: [420, 594], A3: [297, 420], A4: [210, 297], A5: [148, 210], A6: [105, 148], A7: [74, 105], A8: [52, 74], B4: [250, 353], B5: [176, 250], Letter: [215.9, 279.4], Legal: [215.9, 355.6], Tabloid: [279.4, 431.8], Executive: [184.15, 266.7], Statement: [139.7, 215.9], 'Envelope DL': [110, 220], 'Envelope C5': [162, 229] };
  C('paper-size-converter', 'Paper Size Converter (A4, Letter, Legal…)', 'converters/sizes', 'Paper dimensions in mm, inches, points and pixels.', 'ISO A sizes keep a 1 : √2 ratio; each size is half the previous one.',
    [['s', 'Paper size', 's', 'A4', Object.keys(PAPER).map(function (k) { return [k, k]; })], ['o', 'Orientation', 'g', 1, [[1, 'Portrait'], [2, 'Landscape']]], ['dpi', 'Resolution for pixels', 's', 300, [[72, '72 dpi (screen / PDF points)'], [96, '96 dpi (web)'], [150, '150 dpi'], [300, '300 dpi (print)'], [600, '600 dpi']]]],
    function (v) {
      var p = PAPER[v.s], w = +v.o === 1 ? p[0] : p[1], h = +v.o === 1 ? p[1] : p[0];
      return { results: [Mt('Size', w.toFixed(1) + ' × ' + h.toFixed(1) + ' mm'), Tx('In inches', (w / 25.4).toFixed(2) + ' × ' + (h / 25.4).toFixed(2) + ' in'), Tx('In centimetres', (w / 10).toFixed(2) + ' × ' + (h / 10).toFixed(2) + ' cm'), Tx('In points (72 per inch)', Math.round(w / 25.4 * 72) + ' × ' + Math.round(h / 25.4 * 72) + ' pt'), Tx('In pixels at ' + v.dpi + ' dpi', Math.round(w / 25.4 * v.dpi) + ' × ' + Math.round(h / 25.4 * v.dpi) + ' px'), Rx('Area', w * h / 100, 0, 'cm²')], table: { head: ['Size', 'mm', 'inches'], rows: Object.keys(PAPER).map(function (k) { return [k, PAPER[k][0] + ' × ' + PAPER[k][1], (PAPER[k][0] / 25.4).toFixed(2) + ' × ' + (PAPER[k][1] / 25.4).toFixed(2)]; }), fmt: ['', '', ''], title: 'All sizes' } };
    }, { pop: 1 });

  C('ring-size-converter', 'Ring Size Converter & Finder', 'converters/sizes', 'Ring size from finger circumference or diameter, in US, EU and Japan sizes.', 'US size = (inside diameter in mm − 11.63) ÷ 0.8128. EU/ISO size = inside circumference in mm.',
    [['m', 'You know', 's', 3, [[1, 'US / Canada size'], [2, 'Inside diameter (mm)'], [3, 'Finger circumference (mm)'], [4, 'EU size']]], ['x', 'Value', 'n', 54]],
    function (v) {
      var d; if (+v.m === 1) d = v.x * 0.8128 + 11.63; else if (+v.m === 2) d = v.x; else d = v.x / Math.PI; var circ = d * Math.PI, us = (d - 11.63) / 0.8128, jp = Math.floor((d - 13) * 3 + 1);
      if (+v.m === 4) { circ = v.x; d = circ / Math.PI; us = (d - 11.63) / 0.8128; jp = Math.floor((d - 13) * 3 + 1); }
      return { results: [Mx('US / Canada size', Math.round(us * 4) / 4, 2), Rx('EU / ISO size', Math.round(circ), 0), Rx('Inside diameter', d, 2, 'mm'), Rx('Inside circumference', circ, 1, 'mm'), Rx('Japan size (approx.)', jp, 0), Rx('Diameter in inches', d / 25.4, 3, 'in')], note: 'Measure at the end of the day when fingers are largest. For wide bands, go up half a size.' };
    }, { pop: 1 });

  C('shoe-size-converter', 'Shoe Size Calculator & Converter', 'converters/sizes', 'US, UK, EU and India shoe sizes from your foot length.', 'US men’s size = 3 × foot length (in) − 22; women’s = men’s + 1.5; UK = US men’s − 1; EU = (foot length cm + 2) × 1.5.',
    [['u', 'Foot length unit', 'g', 1, [[1, 'cm'], [2, 'inches']]], ['l', 'Foot length (heel to longest toe)', 'n', 25.5]],
    function (v) {
      var cm = +v.u === 1 ? v.l : v.l * 2.54, inch = cm / 2.54, usm = 3 * inch - 22, r2 = function (x) { return Math.round(x * 2) / 2; };
      return { results: [Mx('US men’s', r2(usm), 1), Rx('US women’s', r2(usm + 1.5), 1), Rx('UK / India', r2(usm - 1), 1), Rx('EU', Math.round((cm + 2) * 1.5 * 2) / 2, 1), Rx('Foot length', cm, 1, 'cm'), Rx('Mondopoint (cm)', Math.ceil(cm * 2) / 2, 1)], note: 'Adult sizes. Brands differ by up to a size — try on in the afternoon and leave about 1 cm of toe room.' };
    }, { pop: 1 });

  var CUPUS = ['AA', 'A', 'B', 'C', 'D', 'DD', 'DDD/F', 'G', 'H', 'I', 'J'], CUPUK = ['AA', 'A', 'B', 'C', 'D', 'DD', 'E', 'F', 'FF', 'G', 'GG'], CUPEU = ['AA', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  C('bra-size-calculator', 'Bra Size Calculator', 'converters/sizes', 'Band and cup size from your underbust and bust measurements, in US, UK and EU.', 'Band = underbust rounded to an even number; cup = bust − band (1 in per cup letter).',
    [['u', 'Unit', 'g', 1, [[1, 'cm'], [2, 'inches']]], ['ub', 'Underbust (snug, under the bust)', 'n', 76], ['b', 'Bust (fullest part, relaxed)', 'n', 91]],
    function (v) {
      var f = +v.u === 1 ? 1 / 2.54 : 1, ub = v.ub * f, bu = v.b * f, band = Math.round(ub / 2) * 2, diff = Math.max(0, Math.min(10, Math.round(bu - band))), eu = Math.round(band * 2.54 / 5) * 5;
      var cupAt = function (k) { return CUPUS[Math.max(0, Math.min(10, k))]; };
      return { results: [Mt('US size', band + CUPUS[diff]), Tx('UK size', band + CUPUK[diff]), Tx('EU / FR size', eu + CUPEU[diff]), Tx('Sister sizes (same fit)', (band - 2) + cupAt(diff + 1) + ' · ' + (band + 2) + cupAt(diff - 1)), Rx('Band (inches)', band, 0), Rx('Cup difference', bu - band, 1, 'in')], note: 'A starting point — fit varies by brand and style. If the band rides up, try a smaller band with a bigger cup.' };
    }, { pop: 1 });

  C('clothing-size-converter', 'Clothing Size Converter (Women’s Dress & Men’s Chest)', 'converters/sizes', 'Convert dress and shirt sizes between US, UK, EU, AU and more.', 'Women’s dress: UK = US + 4, EU(DE) = US + 30, FR = US + 32, IT = US + 36. Men’s: UK/US chest in inches, EU = inches + 10.',
    [['w', 'Garment', 'g', 1, [[1, 'Women’s dress / tops'], [2, 'Men’s shirt / suit']]], ['us', 'Your US size', 'n', 8, '', { show: 'w==1' }], ['ch', 'Chest (inches)', 'n', 40, '', { show: 'w==2' }]],
    function (v) {
      if (+v.w === 1) { var us = Math.round(v.us / 2) * 2, let_ = us <= 2 ? 'XS' : us <= 6 ? 'S' : us <= 10 ? 'M' : us <= 14 ? 'L' : 'XL'; var rows = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18].map(function (u) { return [u, u + 4, u + 30, u + 32, u + 36, u <= 2 ? 'XS' : u <= 6 ? 'S' : u <= 10 ? 'M' : u <= 14 ? 'L' : 'XL']; }); return { results: [Mt('UK / AU', String(us + 4)), Tx('EU (Germany)', String(us + 30)), Tx('France', String(us + 32)), Tx('Italy', String(us + 36)), Tx('Letter size', let_)], table: { head: ['US', 'UK / AU', 'EU', 'FR', 'IT', 'Letter'], rows: rows, fmt: ['int', 'int', 'int', 'int', 'int', ''], title: 'Dress sizes' }, note: 'Brands vary — always check the brand’s own size chart.' }; }
      var c = Math.round(v.ch), let2 = c <= 36 ? 'S' : c <= 40 ? 'M' : c <= 44 ? 'L' : c <= 48 ? 'XL' : 'XXL'; return { results: [Mt('Letter size', let2), Tx('US / UK chest', c + ' in'), Tx('EU size', String(c + 10)), Tx('Chest in cm', Math.round(c * 2.54) + ' cm')], note: 'Measure around the fullest part of the chest. Brands vary — check the size chart.' };
    });

  /* ---------- Farming & garden ---------- */
  C('irrigation-water-requirement-calculator', 'Irrigation Water Requirement Calculator', 'pets-garden/farming', 'Daily crop water need and pump time from evapotranspiration.', 'Crop water need ETc = ET₀ × Kc. Gross irrigation = (ETc − effective rain) ÷ efficiency. 1 mm over 1 ha = 10 m³.',
    [['ar', 'Field area', 'n', 2], ['au', 'Area unit', 'g', 1, [[1, 'Acres'], [2, 'Hectares'], [3, 'Square metres']]], ['et', 'Reference evapotranspiration ET₀ (mm/day)', 'n', 5.5], ['kc', 'Crop', 's', 1.15, [[1.15, 'Wheat (mid-season)'], [1.2, 'Paddy / maize'], [1.15, 'Tomato / cotton'], [1.25, 'Sugarcane'], [1.0, 'Vegetables'], [0.9, 'Orchard'], [0.6, 'Initial growth stage']]], ['rn', 'Effective rain (mm/day)', 'n', 0], ['ef', 'Irrigation method', 's', 75, [[90, 'Drip (90%)'], [75, 'Sprinkler (75%)'], [60, 'Furrow (60%)'], [50, 'Flood (50%)']]], ['fl', 'Pump flow (litres/second)', 'n', 8]],
    function (v) {
      var ha = +v.au === 1 ? v.ar * 0.404686 : +v.au === 2 ? v.ar : v.ar / 10000, etc = v.et * v.kc, net = Math.max(0, etc - v.rn), gross = net / (v.ef / 100), m3 = gross * ha * 10;
      return { results: [Mx('Water needed per day', m3 * 1000, 0, 'litres'), Rx('In cubic metres', m3, 1, 'm³'), Rx('Crop water use ETc', etc, 2, 'mm/day'), Rx('Gross irrigation depth', gross, 2, 'mm/day'), Rx('Pump running time per day', m3 * 1000 / v.fl / 3600, 1, 'hours'), Rx('Per week', m3 * 7, 0, 'm³')], note: 'ET₀ varies by weather — get the current value from your local agro-met service or weather station.' };
    }, { pop: 1 });

  C('pesticide-dilution-calculator', 'Pesticide / Spray Mixing Calculator', 'pets-garden/farming', 'How much product to put in each tank and how many tanks you need.', 'Product per tank = dose per litre × tank size. Tanks = (water per acre × area) ÷ tank size.',
    [['m', 'Label gives the dose per', 'g', 1, [[1, 'Litre of water'], [2, 'Acre / hectare']]], ['dl', 'Dose per litre of water (ml or g)', 'n', 2, '', { show: 'm==1' }], ['da', 'Dose per acre (ml or g)', 'n', 400, '', { show: 'm==2' }], ['wa', 'Spray volume per acre (litres)', 'n', 200], ['ar', 'Area to spray (acres)', 'n', 3], ['t', 'Tank size (litres)', 'n', 16], ['pr', 'Price of product per 100 ml / g', 'm', 45]],
    function (v) {
      var perL = +v.m === 1 ? v.dl : v.da / v.wa, water = v.wa * v.ar, tanks = water / v.t, prod = perL * water;
      return { results: [Mx('Product per tank', perL * v.t, 1, 'ml / g'), Rx('Tanks needed', tanks, 1), Rx('Total product', prod, 0, 'ml / g'), Rx('Total water', water, 0, 'litres'), Rx('Concentration', perL, 2, 'ml / g per litre'), Ro('Product cost', prod / 100 * v.pr, 0), Rx('Product per acre', prod / v.ar, 0, 'ml / g')], note: 'Always follow the label for dose, protective gear and waiting period before harvest.' };
    }, { pop: 1 });

  var LIV = { 3: 'Cow (3% of body weight)', 2.5: 'Buffalo (2.5%)', 3.5: 'Goat (3.5%)', 3.2: 'Sheep (3.2%)', 2.2: 'Horse (2.2%)' };
  C('livestock-feed-calculator', 'Livestock Feed Calculator', 'pets-garden/farming', 'Daily dry matter, green fodder and concentrate feed for your animals.', 'Dry-matter intake ≈ 2–3.5% of body weight. Roughage and concentrate are split by your chosen ratio.',
    [['a', 'Animal', 's', 3, Object.keys(LIV).map(function (k) { return [+k, LIV[k]]; })], ['n', 'Number of animals', 'i', 4], ['w', 'Average body weight (kg)', 'n', 400], ['rr', 'Roughage share of dry matter', 'p', 70], ['gf', 'Green fodder price per kg', 'm', 3], ['cf', 'Concentrate price per kg', 'm', 28]],
    function (v) {
      var dm = v.w * v.a / 100, rough = dm * v.rr / 100, conc = dm - rough, green = rough / 0.2, hay = rough / 0.9, cc = conc / 0.9, day = (green * v.gf + cc * v.cf) * v.n;
      return { results: [Mx('Dry matter per animal per day', dm, 1, 'kg'), Rx('Green fodder (if only green)', green, 1, 'kg'), Rx('Or dry fodder / hay', hay, 1, 'kg'), Rx('Concentrate feed (as fed)', cc, 1, 'kg'), Rx('Herd: green fodder per day', green * v.n, 0, 'kg'), Rx('Herd: concentrate per day', cc * v.n, 0, 'kg'), Ro('Feed cost per day (herd)', day), Ro('Feed cost per month (herd)', day * 30)], note: 'High-yielding or milking animals need extra concentrate. A veterinarian or extension officer can set an exact ration.' };
    });

  C('greenhouse-size-calculator', 'Greenhouse Size Calculator', 'pets-garden/garden', 'Floor area, dimensions and vent area for a greenhouse from your plant count.', 'Floor area = plants × spacing ÷ tiers × (1 + aisle allowance).',
    [['n', 'Plants', 'n', 600], ['sp', 'Space per plant (sq ft)', 'n', 1.5], ['t', 'Growing levels / tiers', 'i', 1], ['ai', 'Aisle and working space', 'p', 30], ['ra', 'Length : width ratio', 'n', 3], ['cost', 'Build cost per sq ft', 'm', 1100]],
    function (v) {
      var area = v.n * v.sp / v.t * (1 + v.ai / 100), w = Math.sqrt(area / v.ra), l = w * v.ra;
      return { results: [Mx('Greenhouse floor area', area, 0, 'sq ft'), Rx('Suggested width', w, 1, 'ft'), Rx('Suggested length', l, 1, 'ft'), Rx('Vent opening needed (20%)', area * 0.2, 0, 'sq ft'), Rx('Cover film (approx.)', area * 1.6, 0, 'sq ft'), Ro('Estimated build cost', area * v.cost), Rx('In square metres', area * 0.092903, 0, 'm²')], note: 'Rule-of-thumb sizing. Orient the long side east–west in cooler climates and add shade nets in hot ones.' };
    });

  /* ---------- Photo & odds ---------- */
  var parseT = function (s) { s = String(s).trim(); var m = /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/.exec(s); return m ? +m[1] / +m[2] : parseFloat(s); };
  var fmtT = function (t) { return t >= 1 ? (Math.round(t * 10) / 10) + ' s' : '1/' + Math.round(1 / t) + ' s'; };
  C('f-stop-calculator', 'F-Stop Calculator', 'media-fun/photo', 'Stops between two apertures and the matching shutter speed or ISO.', 'Stops = 2 × log₂(f₂ ÷ f₁). Same exposure: t₂ = t₁ × (f₂ ÷ f₁)².',
    [['f1', 'Starting aperture f/', 'n', 2.8], ['f2', 'New aperture f/', 'n', 8], ['t', 'Shutter speed at the start (e.g. 1/250)', 't', '1/250'], ['iso', 'ISO at the start', 'n', 100]],
    function (v) {
      var st = 2 * Math.log2(v.f2 / v.f1), t = parseT(v.t); if (!(t > 0)) return { error: 'Enter a shutter speed like 1/250 or 0.5.' };
      var k = Math.pow(v.f2 / v.f1, 2), scale = [1, 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32].map(function (f, i) { return ['f/' + f, i]; });
      return { results: [Mx('Difference', st, 2, 'stops'), Rx('Light ratio', Math.pow(2, st), 2, '×'), Tx('Same exposure — shutter becomes', fmtT(t * k)), Tx('Or keep shutter, change ISO to', Math.round(v.iso * k) + ''), Tx('Direction', st > 0 ? 'Smaller opening — less light, more depth of field' : st < 0 ? 'Larger opening — more light, shallower depth of field' : 'Same aperture')], table: { head: ['Full-stop aperture', 'Stops from f/1'], rows: scale, fmt: ['', 'int'], title: 'Standard scale' } };
    });

  C('betting-odds-converter', 'Odds Converter (Decimal, Fractional, American, Probability)', 'statistics/probability', 'Convert odds between formats and see the implied probability and payout.', 'Decimal = fractional + 1 · American + : x ÷ 100 + 1 · American − : 100 ÷ x + 1 · probability = 1 ÷ decimal.',
    [['f', 'Odds are in', 's', 1, [[1, 'Decimal (2.50)'], [2, 'Fractional (3/2)'], [3, 'American (+150 / −200)'], [4, 'Implied probability (%)']]], ['x', 'Odds', 't', '2.50'], ['st', 'Stake', 'm', 1000], ['mk', 'Other outcomes’ decimal odds (optional, for the margin)', 't', '3.4, 3.1', '', { opt: 1 }]],
    function (v) {
      var d, s = String(v.x).trim().replace(/%/g, '');
      if (+v.f === 1) d = parseFloat(s); else if (+v.f === 2) { var m = /^(\d+(?:\.\d+)?)\s*[\/-]\s*(\d+(?:\.\d+)?)$/.exec(s); if (!m) return { error: 'Write fractional odds like 3/2.' }; d = +m[1] / +m[2] + 1; }
      else if (+v.f === 3) { var a = parseFloat(s.replace('+', '')); if (!a) return { error: 'Enter American odds like +150 or -200.' }; d = a > 0 ? a / 100 + 1 : 100 / -a + 1; } else d = 100 / parseFloat(s);
      if (!(d > 1)) return { error: 'Decimal odds must be above 1.' };
      var fr = d - 1, best = '', n, de; for (de = 1; de <= 50; de++) { n = Math.round(fr * de); if (n > 0 && Math.abs(fr - n / de) < 0.001) { var g = gcd(n, de); best = (n / g) + '/' + (de / g); break; } } if (!best) best = (Math.round(fr * 100) / 100) + '/1';
      var us = d >= 2 ? '+' + Math.round((d - 1) * 100) : '−' + Math.round(100 / (d - 1)), res = [Mx('Decimal', d, 3), Tx('Fractional', best), Tx('American', us), Rp('Implied probability', 100 / d, 2), Ro('Profit if it wins', v.st * (d - 1), 2), Ro('Total return', v.st * d, 2)];
      var others = nums(v.mk); if (others.length) { var book = 1 / d + others.reduce(function (s2, o) { return s2 + 1 / o; }, 0); res.push(Rp('Bookmaker margin (overround)', (book - 1) * 100, 2)); }
      return { results: res, note: 'Odds describe probability and price, not a prediction. Gambling can lead to losses — only bet what you can afford to lose.' };
    });

  /* =========================== USD-scale section =========================== */
  CW.defBase = null;

  /* ---------- AI & web costs ---------- */
  C('ai-image-generation-cost-calculator', 'AI Image Generation Cost Calculator', 'tech/ai', 'Monthly cost of generating images by API compared with renting a GPU.', 'API cost = generated images × price. Self-host cost = GPU hours × hourly price. Prices are editable — check your provider.',
    [['n', 'Images you need to keep per month', 'n', 3000], ['k', 'Images generated per image kept (retries)', 'n', 3.5], ['p', 'API price per image', 'm', 0.04], ['up', 'Share that is upscaled', 'p', 30], ['upp', 'Upscale price per image', 'm', 0.02], ['gp', 'GPU price per hour (self-host)', 'm', 1.2], ['ih', 'Images per GPU hour', 'n', 400]],
    function (v) {
      var gen = v.n * v.k, api = gen * v.p + v.n * v.up / 100 * v.upp, hrs = gen / v.ih, self = hrs * v.gp + v.n * v.up / 100 * v.upp * 0.5;
      return { results: [Mo('API cost per month', api, 2), Ro('Self-hosted GPU cost per month', self, 2), Ro('Cost per kept image (API)', api / v.n, 3), Ro('Cost per kept image (self-host)', self / v.n, 3), Rx('Images generated', gen, 0), Rx('GPU hours', hrs, 1), Tx('Cheaper option', api < self ? 'API' : 'Self-hosted GPU')], note: 'Self-hosting excludes setup, idle time and engineering effort.' };
    });

  C('ai-agent-cost-calculator', 'AI Agent Cost per Task Calculator', 'tech/ai', 'What one agent task costs when context grows with each step.', 'Input tokens add up because each step re-sends the growing context: Σ (start context + step × growth).',
    [['st', 'Steps per task (model calls)', 'i', 12], ['c0', 'Starting context (system prompt + task, tokens)', 'n', 3000], ['g', 'Context added per step (tool results, tokens)', 'n', 1500], ['o', 'Output tokens per step', 'n', 400], ['pi', 'Input price per 1M tokens', 'm', 3], ['po', 'Output price per 1M tokens', 'm', 15], ['ch', 'Share of input served from cache', 'p', 70], ['cd', 'Cache read discount', 'p', 90], ['t', 'Tasks per month', 'n', 5000], ['ok', 'Task success rate', 'p', 85]],
    function (v) {
      var inT = 0; for (var s = 0; s < v.st; s++) inT += v.c0 + s * v.g; var outT = v.st * v.o, eff = 1 - v.ch / 100 * v.cd / 100, cost = inT * eff * v.pi / 1e6 + outT * v.po / 1e6, nocache = inT * v.pi / 1e6 + outT * v.po / 1e6;
      return { results: [Mo('Cost per task', cost, 4), Ro('Cost per successful task', cost / (v.ok / 100), 4), Ro('Monthly cost', cost * v.t, 0), Rx('Input tokens per task', inT, 0), Rx('Output tokens per task', outT, 0), Ro('Cost per task without caching', nocache, 4), Rp('Saved by caching', (1 - cost / nocache) * 100, 0)], note: 'Replace the prices with your model’s current rates.' };
    });

  C('prompt-cache-savings-calculator', 'Prompt Caching Savings Calculator', 'tech/ai', 'How much a cached prompt prefix saves on repeated LLM requests.', 'Cached reads cost a fraction of normal input; writing the cache costs a small premium.',
    [['pre', 'Static prefix (system prompt, docs) in tokens', 'n', 12000], ['dyn', 'Dynamic part per request in tokens', 'n', 800], ['out', 'Output tokens per request', 'n', 500], ['rq', 'Requests per day', 'n', 4000], ['pi', 'Input price per 1M tokens', 'm', 3], ['po', 'Output price per 1M tokens', 'm', 15], ['rd', 'Cached read price (% of input price)', 'p', 10], ['wr', 'Cache write price (% of input price)', 'p', 125], ['hit', 'Share of requests that hit the cache', 'p', 90]],
    function (v) {
      var h = v.hit / 100, base = (v.pre + v.dyn) * v.pi / 1e6 + v.out * v.po / 1e6, cached = (h * v.pre * v.rd / 100 + (1 - h) * v.pre * v.wr / 100 + v.dyn) * v.pi / 1e6 + v.out * v.po / 1e6, be = (v.wr / 100 - 1) / (v.wr / 100 - v.rd / 100);
      return { results: [Mo('Saving per month', (base - cached) * v.rq * 30, 0), Ro('Cost per month without caching', base * v.rq * 30, 0), Ro('Cost per month with caching', cached * v.rq * 30, 0), Rp('Reduction', (1 - cached / base) * 100, 0), Rp('Break-even cache hit rate', Math.max(0, be) * 100, 0)] };
    });

  C('fine-tuning-cost-calculator', 'LLM Fine-Tuning Cost & Break-Even Calculator', 'tech/ai', 'Training cost of a fine-tune and when cheaper inference pays it back.', 'Training cost = dataset tokens × epochs × price per 1M tokens. Break-even = training cost ÷ monthly saving.',
    [['ds', 'Training data (tokens)', 'n', 4000000], ['ep', 'Epochs', 'n', 3], ['tp', 'Training price per 1M tokens', 'm', 8], ['rq', 'Requests per month', 'n', 300000], ['ti', 'Tokens per request (input + output)', 'n', 2000], ['bp', 'Cost per 1M tokens — large base model with long prompts', 'm', 6], ['fp', 'Cost per 1M tokens — fine-tuned small model with short prompts', 'm', 1.2]],
    function (v) {
      var train = v.ds * v.ep * v.tp / 1e6, base = v.rq * v.ti * v.bp / 1e6, ft = v.rq * v.ti * v.fp / 1e6, sv = base - ft;
      return { results: [Mo('Training cost', train, 0), Ro('Monthly inference — base', base, 0), Ro('Monthly inference — fine-tuned', ft, 0), Ro('Monthly saving', sv, 0), sv > 0 ? Rx('Break-even', train / sv, 1, 'months') : Tx('Break-even', 'No saving at these prices'), Ro('Saving over 12 months', sv * 12 - train, 0)] };
    });

  var GPUS = [[3350, 989, 'H100 80 GB'], [2039, 312, 'A100 80 GB'], [1008, 165, 'RTX 4090 24 GB'], [864, 362, 'L40S 48 GB'], [300, 65, 'T4 16 GB'], [4800, 1979, 'H200 141 GB']];
  C('llm-inference-throughput-calculator', 'LLM Inference Throughput Calculator', 'tech/ai', 'Estimate tokens per second from model size, precision and GPU.', 'Decode is memory-bound: tokens/s per sequence ≈ bandwidth ÷ model bytes. Batching raises total throughput until compute-bound.',
    [['p', 'Model parameters (billions)', 'n', 8], ['b', 'Precision', 's', 2, [[4, 'FP32 (4 bytes)'], [2, 'FP16 / BF16 (2 bytes)'], [1, 'INT8 / FP8 (1 byte)'], [0.5, 'INT4 (0.5 byte)']]], ['g', 'GPU', 's', 0, GPUS.map(function (g, i) { return [i, g[2]]; })], ['n', 'GPUs', 'i', 1], ['bs', 'Batch size (concurrent requests)', 'i', 16], ['mfu', 'Compute efficiency (MFU)', 'p', 35]],
    function (v) {
      var G = GPUS[v.g], wGB = v.p * v.b, bw = G[0] * v.n, per = bw / wGB, comp = G[1] * 1e12 * v.n * v.mfu / 100 / (2 * v.p * 1e9), tot = Math.min(per * v.bs, comp);
      return { results: [Mx('Total throughput', tot, 0, 'tokens/s'), Rx('Per sequence (decode)', Math.min(per, tot / v.bs), 1, 'tokens/s'), Rx('Memory-bound limit', per * v.bs, 0, 'tokens/s'), Rx('Compute-bound limit', comp, 0, 'tokens/s'), Rx('Weights size', wGB, 1, 'GB'), Tx('Bottleneck', per * v.bs < comp ? 'Memory bandwidth' : 'Compute')], note: 'First-order estimate. Real speed depends on the serving stack, KV-cache size, context length and kernels.' };
    });

  var NET = [[1.6, 150, 'Slow 4G / fast 3G (1.6 Mbps, 150 ms)'], [5, 28, 'Cable (5 Mbps, 28 ms)'], [9, 170, '4G (9 Mbps, 170 ms)'], [30, 50, 'Fast Wi-Fi / LTE (30 Mbps, 50 ms)'], [100, 10, 'Fibre (100 Mbps, 10 ms)']];
  C('website-performance-budget-calculator', 'Website Performance Budget Calculator', 'tech/developer', 'Maximum page weight to load within your target time on a given connection.', 'Budget (KB) ≈ (target time − 4 × RTT) × bandwidth. Then split by asset type.',
    [['t', 'Target load time (seconds)', 'n', 3], ['c', 'Connection', 's', 0, NET.map(function (n, i) { return [i, n[2]]; })]],
    function (v) {
      var N = NET[v.c], xfer = Math.max(0, v.t - 4 * N[1] / 1000), kb = xfer * N[0] * 125, sp = [['HTML + CSS', 0.15], ['JavaScript', 0.3], ['Images', 0.4], ['Fonts', 0.1], ['Other', 0.05]];
      return { results: [Mx('Total page weight budget', kb, 0, 'KB'), Rx('Time left after network round-trips', xfer, 2, 's'), Rx('In megabytes', kb / 1024, 2, 'MB')], table: { head: ['Asset type', 'Share', 'Budget (KB)'], rows: sp.map(function (s) { return [s[0], s[1] * 100, kb * s[1]]; }), fmt: ['', 'pct', 'num'], title: 'Suggested split' }, chart: { type: 'donut', data: sp.map(function (s) { return { l: s[0], v: kb * s[1] }; }), f: 'num' } };
    });

  /* ---------- Finance extras ---------- */
  C('pmi-calculator', 'PMI Calculator (Private Mortgage Insurance)', 'real-estate/property-costs', 'Monthly PMI and when it can be removed.', 'PMI = loan × annual PMI rate ÷ 12. It can be cancelled at 80% LTV and ends automatically at 78%.',
    [['hp', 'Home price', 'm', 400000], ['dp', 'Down payment', 'p', 10], ['r', 'Mortgage rate', 'p', 6.5], ['y', 'Term (years)', 'i', 30], ['pm', 'PMI rate per year', 'p', 0.6]],
    function (v) {
      var L = v.hp * (1 - v.dp / 100), n = v.y * 12, i = v.r / 1200, pay = i ? L * i / (1 - Math.pow(1 + i, -n)) : L / n, pmi = L * v.pm / 100 / 12, bal = L, k = 0, m80 = null, m78 = null, paid = 0;
      if (v.dp >= 20) return { results: [Mo('Monthly PMI', 0, 2), Tx('Status', '20% down or more — no PMI is normally required')] };
      for (k = 1; k <= n; k++) { bal = bal * (1 + i) - pay; if (m80 === null && bal <= v.hp * 0.8) m80 = k; if (m78 === null && bal <= v.hp * 0.78) { m78 = k; break; } }
      var months = m78 || n; paid = pmi * (m80 || months);
      return { results: [Mo('Monthly PMI', pmi, 2), Ro('Principal + interest', pay, 2), Ro('Total monthly payment', pay + pmi, 2), Rx('Can request removal after', m80 || n, 0, 'months'), Rx('Removed automatically after', m78 || n, 0, 'months'), Ro('Total PMI paid (until removal request)', paid, 0)] };
    }, { pop: 1 });

  C('escrow-calculator', 'Escrow Payment Calculator', 'real-estate/property-costs', 'Monthly escrow for property tax and insurance, plus the cushion your lender holds.', 'Monthly escrow = (annual property tax + home insurance + flood/HOA items) ÷ 12; lenders may hold up to 2 months of cushion.',
    [['pt', 'Annual property tax', 'm', 4800], ['hi', 'Annual homeowners insurance', 'm', 1800], ['oth', 'Other annual escrow items (flood, HOA)', 'm', 0], ['pm', 'Monthly PMI', 'm', 200], ['cu', 'Cushion held (months)', 'n', 2]],
    function (v) { var mo = (v.pt + v.hi + v.oth) / 12; return { results: [Mo('Monthly escrow payment', mo + v.pm, 2), Ro('Taxes + insurance + other', mo, 2), Ro('Cushion the lender may hold', mo * v.cu, 2), Ro('Annual escrow total', (mo + v.pm) * 12, 0)] }; });
  CW.setCur(['pmi-calculator', 'escrow-calculator'], 'USD');

  C('dscr-calculator', 'DSCR (Debt Service Coverage Ratio) Calculator', 'real-estate/rental', 'Can the property’s income cover its loan payments?', 'DSCR = net operating income ÷ annual debt service. Lenders usually want 1.2–1.25 or more.',
    [['noi', 'Net operating income (yearly)', 'm', 60000], ['m', 'Debt service', 'g', 1, [[1, 'I know the yearly payment'], [2, 'Calculate from the loan']]], ['ds', 'Annual debt service', 'm', 46000, '', { show: 'm==1' }], ['la', 'Loan amount', 'm', 600000, '', { show: 'm==2' }], ['r', 'Interest rate', 'p', 7, '', { show: 'm==2' }], ['y', 'Term (years)', 'i', 25, '', { show: 'm==2' }], ['t', 'Target DSCR', 'n', 1.25]],
    function (v) {
      var ds = +v.m === 1 ? v.ds : (function () { var i = v.r / 1200, n = v.y * 12; return (i ? v.la * i / (1 - Math.pow(1 + i, -n)) : v.la / n) * 12; })(), d = v.noi / ds, maxDs = v.noi / v.t, i2 = v.r / 1200, n2 = v.y * 12, maxLoan = +v.m === 2 && i2 ? maxDs / 12 * (1 - Math.pow(1 + i2, -n2)) / i2 : NaN;
      var res = [Mx('DSCR', d, 2, ': 1'), Ro('Annual debt service', ds, 0), Ro('Cash left after debt service', v.noi - ds, 0), Ro('Maximum debt service at the target', maxDs, 0), Tx('Reading', d >= v.t ? 'Meets the lender’s target' : d >= 1 ? 'Covers the loan but below the target' : 'Income does not cover the payments')];
      if (!isNaN(maxLoan)) res.push(Ro('Largest loan at the target DSCR', maxLoan, 0)); return { results: res };
    }, { pop: 1 });

  C('capm-calculator', 'CAPM Calculator (Expected Return)', 'finance/investing', 'Required return on an investment from its risk relative to the market.', 'Expected return = risk-free rate + beta × (market return − risk-free rate).',
    [['rf', 'Risk-free rate', 'p', 4.2], ['b', 'Beta', 'n', 1.2], ['rm', 'Expected market return', 'p', 9.5]],
    function (v) {
      var re = v.rf + v.b * (v.rm - v.rf), rows = [0.5, 0.8, 1, 1.2, 1.5, 2].map(function (b) { return [b, v.rf + b * (v.rm - v.rf)]; });
      return { results: [Mp('Expected return', re, 2), Rp('Market risk premium', v.rm - v.rf, 2), Rp('Beta-adjusted premium', v.b * (v.rm - v.rf), 2), Tx('Risk', v.b > 1 ? 'More volatile than the market' : v.b < 1 ? 'Less volatile than the market' : 'Moves with the market')], chart: { type: 'line', title: 'Security market line', labels: rows.map(function (r) { return 'β ' + r[0]; }), series: [{ l: 'Expected return %', pts: rows.map(function (r) { return r[1]; }) }], f: 'pct' }, table: { head: ['Beta', 'Expected return'], rows: rows, fmt: ['num', 'pct'], title: 'By beta' } };
    });

  C('sharpe-ratio-calculator', 'Sharpe & Sortino Ratio Calculator', 'finance/investing', 'Risk-adjusted return from summary figures or a series of returns.', 'Sharpe = (return − risk-free rate) ÷ standard deviation. Sortino divides by downside deviation only.',
    [['m', 'Input', 'g', 1, [[1, 'Annual figures'], [2, 'Series of returns']]], ['rp', 'Portfolio return (% per year)', 'n', 12, '', { show: 'm==1' }], ['sd', 'Standard deviation (% per year)', 'n', 15, '', { show: 'm==1' }], ['s', 'Periodic returns in % — comma separated', 'ta', '2.1, -1.4, 3.2, 0.8, -2.6, 4.1, 1.9, -0.7, 2.8, 3.3, -1.8, 2.4', '', { rows: 3, show: 'm==2' }], ['f', 'Periods per year', 's', 12, [[12, 'Monthly'], [52, 'Weekly'], [252, 'Daily'], [4, 'Quarterly'], [1, 'Yearly']], { show: 'm==2' }], ['rf', 'Risk-free rate (% per year)', 'n', 4]],
    function (v) {
      var rp, sd, dd = NaN;
      if (+v.m === 1) { rp = v.rp; sd = v.sd; }
      else { var r = nums(v.s); if (r.length < 3) return { error: 'Enter at least three returns.' }; var mean = r.reduce(function (a, b) { return a + b; }, 0) / r.length, vr = r.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / (r.length - 1), rfp = v.rf / v.f; rp = mean * v.f; sd = Math.sqrt(vr) * Math.sqrt(v.f); var dn = r.reduce(function (a, b) { return a + Math.pow(Math.min(0, b - rfp), 2); }, 0) / r.length; dd = Math.sqrt(dn) * Math.sqrt(v.f); }
      var sh = (rp - v.rf) / sd, res = [Mx('Sharpe ratio', sh, 2), Rp('Return', rp, 2), Rp('Volatility', sd, 2), Tx('Reading', sh >= 2 ? 'Very good' : sh >= 1 ? 'Good' : sh >= 0 ? 'Subpar' : 'Worse than the risk-free rate')];
      if (!isNaN(dd) && dd > 0) res.push(Rx('Sortino ratio', (rp - v.rf) / dd, 2)); return { results: res };
    });

  CW.defBase = 'INR';
  C('barista-fire-calculator', 'Barista FIRE Calculator', 'finance/retirement', 'The portfolio you need if part-time work covers some of your expenses.', 'Needed portfolio = (yearly expenses − part-time income) ÷ safe withdrawal rate.',
    [['ex', 'Yearly expenses in retirement', 'm', 900000], ['pt', 'Part-time income per year', 'm', 360000], ['sw', 'Safe withdrawal rate', 'p', 3.5], ['cur', 'Current savings', 'm', 2500000], ['mo', 'Monthly investment', 'm', 40000], ['r', 'Expected return', 'p', 10]],
    function (v) {
      var need = Math.max(0, v.ex - v.pt) / (v.sw / 100), full = v.ex / (v.sw / 100), i = v.r / 100, n;
      if (v.cur >= need) n = 0; else { var a = (need * i + v.mo * 12) / (v.cur * i + v.mo * 12); n = a > 0 ? Math.log(a) / Math.log(1 + i) : NaN; }
      return { results: [Mo('Portfolio needed (Barista FIRE)', need), Ro('Full FIRE number (no part-time work)', full), Ro('Saved by working part-time', full - need), isFinite(n) ? Rx('Years to reach it', n, 1) : Tx('Years to reach it', 'Not reachable'), Rp('Progress today', Math.min(100, v.cur / need * 100), 1)] };
    });
  CW.defBase = null;
})(window.CW);
