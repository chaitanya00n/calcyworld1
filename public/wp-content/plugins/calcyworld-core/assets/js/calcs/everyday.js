/* Calcyworld — Date & time, education, everyday life, cooking, travel, pets */
(function (CW) {
  'use strict';
  var r = function (l, v, f, x) { var o = { l: l, v: v, f: f || 'num' }; if (x) for (var k in x) o[k] = x[k]; return o; };
  var M = function (l, v, f, x) { x = x || {}; x.main = true; return r(l, v, f, x); };
  var DAY = 864e5;
  function diffYMD(a, b) {
    var y = b.getFullYear() - a.getFullYear(), m = b.getMonth() - a.getMonth(), d = b.getDate() - a.getDate();
    if (d < 0) { m--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    return { y: y, m: m, d: d };
  }
  function bizDays(a, b) { var n = 0, d = new Date(a); while (d < b) { d.setDate(d.getDate() + 1); var w = d.getDay(); if (w && w !== 6) n++; } return n; }
  var dstr = function (d) { return d.toLocaleDateString(CW.locale(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); };

  CW.register([
  {
    id: 'age-calculator', title: 'Age Calculator', sec: 'everyday', sub: 'Date & Time', pop: 1,
    desc: 'Calculate your exact age in years, months and days — plus total days, weeks and hours, and a countdown to your next birthday.',
    formula: 'Age = date today − date of birth, counted in whole years, then months, then days (borrowing days from the previous month when needed).',
    faq: [['How is age calculated?', 'We count full years since your birth date, then full months, then the remaining days — the same way age is calculated on official forms.'],
      ['Can I calculate age on a past or future date?', 'Yes. Change the “Age on” date to any date, for example an exam cut-off date or a retirement date.']],
    inputs: [{ k: 'dob', l: 'Date of birth', t: 'date', v: function () { var d = new Date(); d.setFullYear(d.getFullYear() - 25); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); } }, { k: 'on', l: 'Age on', t: 'date', v: 0 }],
    calc: function (v) {
      if (v.dob > v.on) return { error: 'The date of birth must be before the “age on” date.' };
      var a = diffYMD(v.dob, v.on), days = Math.round((v.on - v.dob) / DAY);
      var nb = new Date(v.on.getFullYear(), v.dob.getMonth(), v.dob.getDate()); if (nb < v.on) nb.setFullYear(nb.getFullYear() + 1);
      var toNb = Math.round((nb - v.on) / DAY);
      return { results: [M('Age', a.y + ' years ' + a.m + ' months ' + a.d + ' days', 'text'), r('Total months', a.y * 12 + a.m, 'int'), r('Total weeks', Math.floor(days / 7), 'int'), r('Total days', days, 'int'),
        r('Total hours', days * 24, 'int'), r('Born on a', v.dob.toLocaleDateString(CW.locale(), { weekday: 'long' }), 'text'), r('Next birthday in', toNb === 0 ? 'Today — happy birthday! 🎉' : toNb + ' days', 'text', { hl: 1 })] };
    }
  },
  {
    id: 'date-difference-calculator', title: 'Days Between Dates Calculator', sec: 'everyday', sub: 'Date & Time', pop: 1,
    desc: 'Count the days, weeks, months and working days between two dates.',
    formula: 'Days = (end date − start date). Working days exclude Saturdays and Sundays (public holidays are not removed).',
    inputs: [{ k: 'a', l: 'Start date', t: 'date', v: 0 }, { k: 'b', l: 'End date', t: 'date', v: 90 }, { k: 'inc', l: 'Include the end date', t: 'check', v: false }],
    calc: function (v) { var s = v.a <= v.b ? v.a : v.b, e = v.a <= v.b ? v.b : v.a, days = Math.round((e - s) / DAY) + (v.inc ? 1 : 0), ymd = diffYMD(s, e);
      return { results: [M('Days between', days, 'int', { u: 'days' }), r('Duration', ymd.y + ' years ' + ymd.m + ' months ' + ymd.d + ' days', 'text'), r('Weeks', Math.floor(days / 7) + ' weeks ' + days % 7 + ' days', 'text'),
        r('Working days (Mon–Fri)', bizDays(s, e) + (v.inc && s.getDay() % 6 ? 1 : 0), 'int'), r('Hours', days * 24, 'int')] }; }
  },
  {
    id: 'date-calculator', title: 'Date Calculator (Add or Subtract Days)', sec: 'everyday', sub: 'Date & Time', pop: 1,
    desc: 'Add or subtract days, weeks, months or years from a date — or count only working days.',
    formula: 'New date = start date ± the chosen number of days, weeks, months or years.',
    inputs: [{ k: 'd', l: 'Start date', t: 'date', v: 0 }, { k: 'op', l: 'Operation', t: 'seg', v: '+', o: [['+', 'Add'], ['-', 'Subtract']] },
      { k: 'n', l: 'Amount', t: 'int', v: 30 }, { k: 'u', l: 'Unit', t: 'select', v: 'd', o: [['d', 'Days'], ['bd', 'Working days'], ['w', 'Weeks'], ['m', 'Months'], ['y', 'Years']] }],
    calc: function (v) { var d = new Date(v.d), s = v.op === '+' ? 1 : -1, n = Math.round(v.n);
      if (v.u === 'd') d.setDate(d.getDate() + s * n); else if (v.u === 'w') d.setDate(d.getDate() + s * n * 7); else if (v.u === 'm') d.setMonth(d.getMonth() + s * n); else if (v.u === 'y') d.setFullYear(d.getFullYear() + s * n);
      else { var c = 0; while (c < n) { d.setDate(d.getDate() + s); if (d.getDay() % 6) c++; } }
      return { results: [M('Result', dstr(d), 'text'), r('Day of year', Math.ceil((d - new Date(d.getFullYear(), 0, 1)) / DAY) + 1, 'int'), r('ISO week', isoWeek(d), 'int')] }; }
  },
  {
    id: 'time-calculator', title: 'Time Calculator', sec: 'everyday', sub: 'Date & Time', pop: 1,
    desc: 'Add or subtract hours, minutes and seconds, and convert the total into decimal hours.',
    formula: 'Everything is converted to seconds, added or subtracted, then converted back to hh:mm:ss.',
    inputs: [{ k: 'h1', l: 'Hours', t: 'int', v: 2 }, { k: 'm1', l: 'Minutes', t: 'int', v: 45 }, { k: 's1', l: 'Seconds', t: 'int', v: 0, opt: 1 },
      { k: 'op', l: 'Operation', t: 'seg', v: '+', o: [['+', 'Add'], ['-', 'Subtract']] }, { k: 'h2', l: 'Hours', t: 'int', v: 1 }, { k: 'm2', l: 'Minutes', t: 'int', v: 30 }, { k: 's2', l: 'Seconds', t: 'int', v: 0, opt: 1 }],
    calc: function (v) { var a = v.h1 * 3600 + v.m1 * 60 + v.s1, b = v.h2 * 3600 + v.m2 * 60 + v.s2, t = v.op === '+' ? a + b : a - b, neg = t < 0; t = Math.abs(t);
      var h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60;
      return { results: [M('Result', (neg ? '−' : '') + h + 'h ' + m + 'm ' + s + 's', 'text'), r('Decimal hours', (neg ? -1 : 1) * t / 3600, 'num', { dp: 4 }), r('Total minutes', (neg ? -1 : 1) * t / 60, 'num', { dp: 2 }), r('Total seconds', (neg ? -1 : 1) * t, 'int')] }; }
  },
  {
    id: 'hours-calculator', title: 'Hours Calculator (Work Hours)', sec: 'everyday', sub: 'Date & Time', pop: 1,
    desc: 'Calculate hours worked between a start and end time, minus breaks — works across midnight. Optional pay calculation.',
    formula: 'Hours = (end − start) − break. If the end time is earlier than the start, the shift is assumed to cross midnight.',
    inputs: [{ k: 'a', l: 'Start time', t: 'time', v: '09:00' }, { k: 'b', l: 'End time', t: 'time', v: '17:30' }, { k: 'br', l: 'Unpaid break', t: 'int', v: 30, u: 'min', opt: 1 },
      { k: 'pay', l: 'Hourly rate (optional)', t: 'money', v: 0, opt: 1 }, { k: 'days', l: 'Days like this', t: 'int', v: 5 }],
    calc: function (v) { var p = function (s) { s = (s || '0:0').split(':'); return +s[0] * 60 + +s[1]; }, m = p(v.b) - p(v.a); if (m < 0) m += 1440; m -= v.br;
      if (m < 0) return { error: 'The break is longer than the shift.' };
      return { results: [M('Hours worked', Math.floor(m / 60) + 'h ' + m % 60 + 'm', 'text'), r('Decimal hours', m / 60, 'fixed', { dp: 2 }), r('Total for ' + v.days + ' days', m * v.days / 60, 'fixed', { dp: 2, u: 'h' }), r('Pay per day', v.pay ? m / 60 * v.pay : NaN, 'money'), r('Total pay', v.pay ? m / 60 * v.pay * v.days : NaN, 'money')] }; }
  },
  {
    id: 'time-zone-converter', title: 'Time Zone Converter', sec: 'everyday', sub: 'Date & Time', pop: 1,
    desc: 'Convert a time between any two time zones in the world, with daylight saving handled automatically.',
    formula: 'Uses your browser’s official IANA time zone database, so daylight saving changes are applied for the chosen date.',
    inputs: [{ k: 'd', l: 'Date', t: 'date', v: 0 }, { k: 't', l: 'Time', t: 'time', v: '10:00' },
      { k: 'f', l: 'From time zone', t: 'select', v: function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return 'UTC'; } }, o: zones },
      { k: 'to', l: 'To time zone', t: 'select', v: 'America/New_York', o: zones }],
    calc: function (v) {
      var p = (v.t || '00:00').split(':'), y = v.d.getFullYear(), mo = v.d.getMonth(), da = v.d.getDate();
      var guess = Date.UTC(y, mo, da, +p[0], +p[1]), off = tzOffset(guess, v.f), utc = guess - off; off = tzOffset(utc, v.f); utc = guess - off;
      var fmt = function (tz) { return new Date(utc).toLocaleString(CW.locale(), { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); };
      var diff = (tzOffset(utc, v.to) - tzOffset(utc, v.f)) / 36e5;
      return { results: [M('Time in ' + v.to.split('/').pop().replace(/_/g, ' '), fmt(v.to), 'text'), r('Original', fmt(v.f), 'text'), r('Difference', (diff >= 0 ? '+' : '') + diff + ' hours', 'text'), r('UTC', new Date(utc).toISOString().replace('T', ' ').slice(0, 16), 'text')] };
    }
  },
  {
    id: 'unix-timestamp-converter', title: 'Unix Timestamp Converter', sec: 'technology', sub: 'Computing & Internet',
    desc: 'Convert a Unix (epoch) timestamp into a readable date, or get the timestamp for any date and time.',
    formula: 'Unix time = seconds since 1 January 1970 00:00:00 UTC.',
    inputs: [{ k: 'ts', l: 'Unix timestamp (seconds or milliseconds)', t: 'number', v: function () { return Math.floor(Date.now() / 1000); } }],
    calc: function (v) { var ms = Math.abs(v.ts) > 1e11 ? v.ts : v.ts * 1000, d = new Date(ms); if (isNaN(d)) return { error: 'Invalid timestamp.' };
      return { results: [M('Your local time', d.toLocaleString(CW.locale(), { dateStyle: 'full', timeStyle: 'long' }), 'text'), r('UTC', d.toUTCString(), 'text'), r('ISO 8601', d.toISOString(), 'text'), r('Milliseconds', ms, 'int')] }; }
  },
  {
    id: 'gpa-calculator', title: 'GPA Calculator', sec: 'everyday', sub: 'Education & Grades', pop: 1,
    desc: 'Calculate your grade point average on the 4.0 scale from letter grades and credit hours, with an optional cumulative GPA.',
    formula: 'GPA = Σ(grade points × credits) ÷ Σ credits.',
    inputs: [{ k: 'rows', l: 'Courses', t: 'rows', add: 'Add course', cols: [{ l: 'Course', t: 'text' }, { l: 'Grade', t: 'select', v: 'A', o: [['4.0', 'A / A+'], ['3.7', 'A−'], ['3.3', 'B+'], ['3.0', 'B'], ['2.7', 'B−'], ['2.3', 'C+'], ['2.0', 'C'], ['1.7', 'C−'], ['1.3', 'D+'], ['1.0', 'D'], ['0.7', 'D−'], ['0', 'F']] }, { l: 'Credits', t: 'number', v: 3 }],
      v: [['Math', '4.0', 4], ['English', '3.3', 3], ['Science', '3.7', 4], ['History', '3.0', 3]] },
      { k: 'pg', l: 'Previous cumulative GPA (optional)', t: 'number', v: 0, opt: 1 }, { k: 'pc', l: 'Previous credits (optional)', t: 'number', v: 0, opt: 1 }],
    calc: function (v) { var pts = 0, cr = 0; v.rows.forEach(function (x) { var g = parseFloat(x[1]), c = x[2]; if (!isNaN(g) && !isNaN(c)) { pts += g * c; cr += c; } });
      if (!cr) return { error: 'Add at least one course with credits.' };
      return { results: [M('Semester GPA', pts / cr, 'fixed', { dp: 2 }), r('Total credits', cr, 'num'), r('Cumulative GPA', v.pc ? (pts + v.pg * v.pc) / (cr + v.pc) : NaN, 'fixed', { dp: 2 })] }; }
  },
  {
    id: 'cgpa-to-percentage-calculator', title: 'CGPA to Percentage Calculator', sec: 'everyday', sub: 'Education & Grades', pop: 1,
    desc: 'Convert CGPA to percentage (CBSE ×9.5 or your university’s formula) and percentage back to CGPA.',
    formula: 'CBSE: percentage = CGPA × 9.5. Many universities use (CGPA − 0.75) × 10 or CGPA × 10 — choose yours.',
    inputs: [{ k: 'mode', l: 'Convert', t: 'seg', v: 'c2p', o: [['c2p', 'CGPA → %'], ['p2c', '% → CGPA']] }, { k: 'x', l: 'Value', t: 'number', v: 8.2 },
      { k: 'f', l: 'Formula', t: 'select', v: '9.5', o: [['9.5', 'CBSE / most Indian boards (× 9.5)'], ['10', 'Multiply by 10'], ['vtu', 'VTU / some universities ((CGPA − 0.75) × 10)'], ['4', '4-point scale (CGPA ÷ 4 × 100)']] }],
    calc: function (v) { var x = v.x, out;
      if (v.mode === 'c2p') out = v.f === 'vtu' ? (x - 0.75) * 10 : v.f === '4' ? x / 4 * 100 : x * +v.f;
      else out = v.f === 'vtu' ? x / 10 + 0.75 : v.f === '4' ? x / 100 * 4 : x / +v.f;
      return { results: [M(v.mode === 'c2p' ? 'Percentage' : 'CGPA', out, v.mode === 'c2p' ? 'pct' : 'fixed', { dp: 2 })], note: 'Always check the conversion formula printed on your marksheet or university rules.' }; }
  },
  {
    id: 'marks-percentage-calculator', title: 'Marks Percentage Calculator', sec: 'everyday', sub: 'Education & Grades', pop: 1,
    desc: 'Find your percentage from marks obtained and total marks — for one exam or a whole marksheet.',
    formula: 'Percentage = marks obtained ÷ total marks × 100.',
    inputs: [{ k: 'rows', l: 'Subjects', t: 'rows', add: 'Add subject', cols: [{ l: 'Subject', t: 'text' }, { l: 'Marks obtained', t: 'number' }, { l: 'Out of', t: 'number', v: 100 }],
      v: [['Subject 1', 85, 100], ['Subject 2', 78, 100], ['Subject 3', 92, 100], ['Subject 4', 70, 100], ['Subject 5', 88, 100]] }],
    calc: function (v) { var o = 0, t = 0, best = []; v.rows.forEach(function (x) { if (!isNaN(x[1]) && !isNaN(x[2]) && x[2] > 0) { o += x[1]; t += x[2]; best.push(x[1] / x[2] * 100); } });
      if (!t) return { error: 'Enter marks and totals.' };
      var b5 = best.sort(function (a, b) { return b - a; }).slice(0, 5), p = o / t * 100;
      return { results: [M('Percentage', p, 'pct'), r('Marks', o + ' / ' + t, 'text'), r('Best of 5 average', b5.reduce(function (a, c) { return a + c; }, 0) / b5.length, 'pct'), r('Approx. CGPA (÷ 9.5)', p / 9.5, 'fixed', { dp: 2 })] }; }
  },
  {
    id: 'attendance-calculator', title: 'Attendance Percentage Calculator', sec: 'everyday', sub: 'Education & Grades',
    desc: 'Check your attendance percentage, how many classes you must attend to reach the minimum, or how many you can safely miss.',
    formula: 'Attendance = attended ÷ held × 100. Classes needed = ⌈(target × held − 100 × attended) ÷ (100 − target)⌉.',
    inputs: [{ k: 'a', l: 'Classes attended', t: 'int', v: 42 }, { k: 'h', l: 'Classes held', t: 'int', v: 60 }, { k: 't', l: 'Required attendance', t: 'percent', v: 75 }],
    calc: function (v) { var p = v.a / v.h * 100, need = Math.ceil((v.t * v.h - 100 * v.a) / (100 - v.t)), can = Math.floor((100 * v.a - v.t * v.h) / v.t);
      return { results: [M('Your attendance', p, 'pct'), p >= v.t ? r('Classes you can miss', Math.max(0, can), 'int', { hl: 1 }) : r('Classes you must attend in a row', need, 'int', { hl: 1 })],
        badge: p >= v.t ? { t: 'Above the ' + v.t + '% requirement', tone: 'ok' } : { t: 'Below the requirement', tone: 'warn' } }; }
  },
  {
    id: 'final-grade-calculator', title: 'Final Grade Calculator', sec: 'everyday', sub: 'Education & Grades',
    desc: 'Find the score you need on your final exam to reach the overall grade you want.',
    formula: 'Needed = (target − current × (1 − final weight)) ÷ final weight.',
    inputs: [{ k: 'c', l: 'Current grade', t: 'percent', v: 82 }, { k: 't', l: 'Grade you want', t: 'percent', v: 85 }, { k: 'w', l: 'Final exam weight', t: 'percent', v: 30 }],
    calc: function (v) { var n = (v.t - v.c * (1 - v.w / 100)) / (v.w / 100);
      return { results: [M('Score needed on final', n, 'pct', { dp: 1 })], badge: n > 100 ? { t: 'Above 100% — not reachable with the final alone', tone: 'warn' } : n <= 0 ? { t: 'Already secured', tone: 'ok' } : null }; }
  },
  {
    id: 'word-counter', title: 'Word Counter', sec: 'everyday', sub: 'Education & Grades', pop: 1,
    desc: 'Count words, characters, sentences and paragraphs, and estimate reading and speaking time — as you type.',
    formula: 'Words are counted as groups of letters/numbers; reading time uses 238 words per minute and speaking time 150 words per minute.',
    inputs: [{ k: 't', l: 'Your text', t: 'textarea', rows: 10, v: '', ph: 'Type or paste your text here…', wide: 1 }],
    calc: function (v) { var t = v.t || '', w = (t.match(/[\p{L}\p{N}’'-]+/gu) || []).length, s = (t.match(/[^.!?…]+[.!?…]+/g) || []).length || (t.trim() ? 1 : 0);
      return { results: [M('Words', w, 'int'), r('Characters', [...t].length, 'int'), r('Characters (no spaces)', [...t.replace(/\s/g, '')].length, 'int'), r('Sentences', s, 'int'),
        r('Paragraphs', t.trim() ? t.trim().split(/\n\s*\n/).length : 0, 'int'), r('Reading time', Math.max(0, Math.ceil(w / 238)) + ' min', 'text'), r('Speaking time', Math.max(0, Math.ceil(w / 150)) + ' min', 'text')] }; }
  },
  {
    id: 'unit-price-calculator', title: 'Unit Price Comparison Calculator', sec: 'everyday', sub: 'Everyday Life & Shopping',
    desc: 'Compare pack sizes and prices to see which product is really the better deal per unit.',
    formula: 'Unit price = price ÷ quantity. The lowest unit price is the best value.',
    inputs: [{ k: 'rows', l: 'Products', t: 'rows', add: 'Add product', cols: [{ l: 'Product', t: 'text' }, { l: 'Price', t: 'number' }, { l: 'Quantity (g, ml, pcs…)', t: 'number' }],
      v: [['Small pack', 2.49, 250], ['Large pack', 6.99, 1000], ['Family pack', 11.5, 2000]] }],
    calc: function (v) { var rows = v.rows.filter(function (x) { return !isNaN(x[1]) && x[2] > 0; }).map(function (x) { return [x[0] || 'Item', x[1], x[2], x[1] / x[2]]; });
      if (!rows.length) return { error: 'Add prices and quantities.' }; rows.sort(function (a, b) { return a[3] - b[3]; });
      return { results: [M('Best value', rows[0][0], 'text'), r('Unit price', rows[0][3], 'money', { cur: undefined }), r('Saving vs most expensive', rows.length > 1 ? (1 - rows[0][3] / rows[rows.length - 1][3]) * 100 : 0, 'pct')],
        table: { open: true, title: 'Ranked by unit price', head: ['Product', 'Price', 'Quantity', 'Price per unit'], fmt: ['text', 'money2', 'num', 'num'], rows: rows } }; }
  },
  {
    id: 'fuel-cost-calculator', title: 'Fuel Cost Calculator', sec: 'construction', sub: 'Automotive & Transport', pop: 1,
    desc: 'Work out the fuel cost of a trip from distance, your vehicle’s mileage and the fuel price — and split it between passengers.',
    formula: 'Fuel needed = distance ÷ fuel efficiency. Cost = fuel needed × price per litre (or gallon).',
    inputs: [{ k: 'd', l: 'Trip distance', t: 'number', v: function (c) { return c.imperial ? 250 : 400; }, u: function () { return CW.imperial() ? 'miles' : 'km'; } },
      { k: 'e', l: 'Fuel efficiency', t: 'number', v: function (c) { return c.imperial ? 28 : 15; }, u: function () { return CW.imperial() ? 'mpg' : 'km/L'; } },
      { k: 'p', l: 'Fuel price', t: 'money', v: function (c) { return c.imperial ? 3.5 : 1.5; }, local: { IN: 103, GB: 1.4 }, u: function () { return CW.imperial() ? 'per gal' : 'per L'; } },
      { k: 'rt', l: 'Return trip', t: 'check', v: false }, { k: 'pp', l: 'People sharing', t: 'int', v: 1 }],
    calc: function (v) { var d = v.d * (v.rt ? 2 : 1), f = d / v.e, c = f * v.p, un = CW.imperial() ? 'gallons' : 'litres';
      return { results: [M('Trip fuel cost', c, 'money'), r('Fuel needed', f, 'fixed', { dp: 2, u: un }), r('Cost per person', c / Math.max(1, v.pp), 'money'), r('Cost per ' + (CW.imperial() ? 'mile' : 'km'), c / d, 'money2')] }; }
  },
  {
    id: 'mileage-calculator', title: 'Mileage (Fuel Efficiency) Calculator', sec: 'construction', sub: 'Automotive & Transport', pop: 1,
    desc: 'Calculate your vehicle’s real mileage (km/L, L/100 km or MPG) from distance driven and fuel used.',
    formula: 'Mileage = distance ÷ fuel used. L/100 km = fuel ÷ distance × 100.',
    inputs: [{ k: 'd', l: 'Distance driven', t: 'number', v: 450, u: function () { return CW.imperial() ? 'miles' : 'km'; } }, { k: 'f', l: 'Fuel used', t: 'number', v: 30, u: function () { return CW.imperial() ? 'gallons' : 'litres'; } }],
    calc: function (v) { var imp = CW.imperial(), km = imp ? v.d * 1.609344 : v.d, l = imp ? v.f * 3.785411784 : v.f, kml = km / l;
      return { results: [M(imp ? 'Miles per gallon' : 'Kilometres per litre', imp ? v.d / v.f : kml, 'fixed', { dp: 2 }), r('L/100 km', 100 / kml, 'fixed', { dp: 2 }), r('km/L', kml, 'fixed', { dp: 2 }), r('MPG (US)', kml / 0.425143707, 'fixed', { dp: 2 }), r('MPG (UK)', kml / 0.354006189, 'fixed', { dp: 2 })] }; }
  },
  {
    id: 'gold-jewellery-price-calculator', title: 'Gold Jewellery Price Calculator', sec: 'everyday', sub: 'Everyday Life & Shopping',
    desc: 'Calculate the final price of gold jewellery from today’s gold rate, weight, purity, making charges and GST.',
    formula: 'Gold value = rate per gram (24K) × purity ÷ 24 × weight. Price = gold value + making charges, then 3% GST in India.',
    inputs: [{ k: 'rate', l: 'Gold rate per gram (24K)', t: 'money', v: 130, local: { IN: 13000 }, help: 'Enter today’s rate from your jeweller or a trusted source' }, { k: 'w', l: 'Weight', t: 'number', v: 10, u: 'g' },
      { k: 'k', l: 'Purity', t: 'select', v: '22', o: [['24', '24K (99.9%)'], ['22', '22K (91.6%)'], ['18', '18K (75%)'], ['14', '14K (58.5%)']] },
      { k: 'mk', l: 'Making charges', t: 'percent', v: 12 }, { k: 'tax', l: 'GST / tax', t: 'percent', v: function (c) { return c.country.code === 'IN' ? 3 : 0; }, opt: 1 }],
    calc: function (v) { var g = v.rate * (+v.k / 24) * v.w, mk = g * v.mk / 100, t = (g + mk) * v.tax / 100;
      return { results: [M('Final price', g + mk + t, 'money'), r('Gold value', g, 'money'), r('Making charges', mk, 'money'), r('Tax', t, 'money')] }; }
  },
  {
    id: 'recipe-scaler', title: 'Recipe Scaler', sec: 'everyday', sub: 'Cooking & Food',
    desc: 'Scale any recipe up or down for a different number of servings — just paste the ingredient list.',
    formula: 'New quantity = original quantity × (new servings ÷ original servings). Fractions such as 1/2 and 1 1/2 are understood.',
    inputs: [{ k: 'a', l: 'Original servings', t: 'number', v: 4 }, { k: 'b', l: 'Servings you need', t: 'number', v: 6 },
      { k: 't', l: 'Ingredients (one per line, quantity first)', t: 'textarea', rows: 7, wide: 1, v: '2 cups flour\n1 1/2 tsp baking powder\n3 eggs\n250 ml milk\n1/2 cup sugar' }],
    calc: function (v) { var f = v.b / v.a;
      var lines = String(v.t || '').split('\n').filter(Boolean).map(function (line) {
        var m = /^\s*(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.?\d+)\s*(.*)$/.exec(line); if (!m) return [line, ''];
        var q = m[1].trim(), n = 0; q.split(/\s+/).forEach(function (p) { if (p.indexOf('/') > -1) { var s = p.split('/'); n += s[0] / s[1]; } else n += +p; });
        var x = n * f, fr = CW.mathx ? CW.mathx.toFrac(x, 8) : null, nice = fr && Math.abs(fr[0] / fr[1] - x) < 0.02 && fr[1] > 1 ? (Math.floor(fr[0] / fr[1]) ? Math.floor(fr[0] / fr[1]) + ' ' : '') + (fr[0] % fr[1]) + '/' + fr[1] : CW.fmt.num(x, 2);
        return [nice + ' ' + m[2], line];
      });
      return { results: [M('Scale factor', f, 'num', { dp: 3, u: '×' })], table: { open: true, title: 'Scaled ingredients', head: ['New amount', 'Original'], fmt: ['text', 'text'], rows: lines } }; }
  },
  {
    id: 'dog-age-calculator', title: 'Dog Age Calculator', sec: 'everyday', sub: 'Pets & Animals',
    desc: 'Convert your dog’s age into human years using the size-based method vets use, or the newer DNA-based formula.',
    formula: 'DNA method (UC San Diego, 2019): human age = 16 × ln(dog age) + 31. Size method: first year ≈ 15, second ≈ +9, then +4 to +7 per year by size.',
    inputs: [{ k: 'a', l: 'Dog’s age', t: 'number', v: 5, u: 'years' }, { k: 's', l: 'Size', t: 'seg', v: 'm', o: [['s', 'Small'], ['m', 'Medium'], ['l', 'Large'], ['g', 'Giant']] }],
    calc: function (v) { var per = { s: 4, m: 5, l: 6, g: 7 }[v.s], h = v.a <= 1 ? v.a * 15 : v.a <= 2 ? 15 + (v.a - 1) * 9 : 24 + (v.a - 2) * per;
      return { results: [M('Human years (size method)', h, 'num', { dp: 1 }), r('Human years (DNA method)', v.a > 0 ? 16 * Math.log(v.a) + 31 : NaN, 'num', { dp: 1 })] }; }
  },
  {
    id: 'cat-age-calculator', title: 'Cat Age Calculator', sec: 'everyday', sub: 'Pets & Animals',
    desc: 'Convert your cat’s age into human years and see its life stage.',
    formula: 'First year ≈ 15 human years, second ≈ +9, then about +4 per year.',
    inputs: [{ k: 'a', l: 'Cat’s age', t: 'number', v: 6, u: 'years' }],
    calc: function (v) { var h = v.a <= 1 ? v.a * 15 : v.a <= 2 ? 15 + (v.a - 1) * 9 : 24 + (v.a - 2) * 4, st = v.a < 0.5 ? 'Kitten' : v.a < 2 ? 'Junior' : v.a < 7 ? 'Prime' : v.a < 11 ? 'Mature' : v.a < 15 ? 'Senior' : 'Geriatric';
      return { results: [M('Human years', h, 'num', { dp: 1 }), r('Life stage', st, 'text')] }; }
  }
  ]);

  function zones() {
    var z = []; try { z = Intl.supportedValuesOf('timeZone'); } catch (e) { z = ['UTC', 'Europe/London', 'Europe/Paris', 'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'America/New_York', 'America/Chicago', 'America/Los_Angeles']; }
    if (z.indexOf('UTC') < 0) z.unshift('UTC');
    return z.map(function (x) { return [x, x.replace(/_/g, ' ')]; });
  }
  function tzOffset(ms, tz) {
    try { var p = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(ms)), o = {};
      p.forEach(function (x) { o[x.type] = +x.value; }); return Date.UTC(o.year, o.month - 1, o.day, o.hour % 24, o.minute, o.second) - Math.floor(ms / 1000) * 1000; } catch (e) { return 0; }
  }
  function isoWeek(d) { var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n); var y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return Math.ceil(((t - y) / DAY + 1) / 7); }
})(window.CW);
