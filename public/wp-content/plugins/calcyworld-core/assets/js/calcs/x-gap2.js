/* Calcyworld — gap pack 2: health, medical scores, pregnancy, nutrition, sports */
(function (CW) {
  'use strict';
  var C = CW.C, M = CW.M, R = CW.Rr;
  var Mx = function (l, v, dp, u) { return M(l, v, 'num', { dp: dp === undefined ? 1 : dp, u: u || '' }); }, Rx = function (l, v, dp, u) { return R(l, v, 'num', { dp: dp === undefined ? 1 : dp, u: u || '' }); };
  var Mp = function (l, v, dp) { return M(l, v, 'pct', { dp: dp === undefined ? 1 : dp }); }, Rp = function (l, v, dp) { return R(l, v, 'pct', { dp: dp === undefined ? 1 : dp }); };
  var Tx = function (l, v) { return R(l, v, 'text'); }, Mt = function (l, v) { return M(l, v, 'text'); };
  var num = function (s) { return +String(s).replace(/,/g, ''); };
  var lines2 = function (s) { return String(s).trim().split(/\n/).map(function (l) { var m = /^(.*?)[\s:]+([\d.,]+)\s*$/.exec(l.trim()); return m ? [m[1], num(m[2])] : null; }).filter(Boolean); };
  var lines3 = function (s) { return String(s).trim().split(/\n/).map(function (l) { var m = /^(.*?)[\s:]+([\d.,]+)[\s:]+([\d.,]+)\s*$/.exec(l.trim()); return m ? [m[1], num(m[2]), num(m[3])] : null; }).filter(Boolean); };
  var fd = function (d) { return CW.fmt.date(d); };
  var addDays = function (d, n) { return new Date(d.getTime() + n * 86400000); };
  var imp = function (c) { return c.imperial ? 2 : 1; };
  var UN = ['u', 'Units', 'g', imp, [[1, 'Metric (kg, cm)'], [2, 'US (lb, in)']]];
  var kgOf = function (v, u) { return u === 2 ? v * 0.45359237 : v; }, cmOf = function (v, u) { return u === 2 ? v * 2.54 : v; };
  var chk = function (k, l) { return [k, l, 'c', 0]; };
  var score = function (arr, v) { return arr.reduce(function (s, a) { return s + (v[a[0]] ? a[2] : 0); }, 0); };

  /* ---------- Body ---------- */
  C('body-shape-calculator', 'Body Shape Calculator', 'health/body', 'Find your body shape from bust, waist and hip measurements.', 'Shapes are classified by comparing bust, waist and hip: hourglass, pear, apple, rectangle, inverted triangle.',
    [['u', 'Units', 'g', 1, [[1, 'cm'], [2, 'inches']]], ['b', 'Bust (fullest part)', 'n', 92], ['w', 'Waist (narrowest part)', 'n', 70], ['h', 'Hips (fullest part)', 'n', 98]],
    function (v) {
      var b = v.b, w = v.w, h = v.h, hb = h / b, wh = w / h, wb = w / b, shape, tip;
      if (hb >= 0.95 && hb <= 1.05 && (wh <= 0.75 || wb <= 0.75)) { shape = 'Hourglass'; tip = 'Bust and hips are balanced with a clearly defined waist.'; }
      else if (hb > 1.05 && wh <= 0.77) { shape = 'Bottom hourglass'; tip = 'Fuller hips than bust with a defined waist.'; }
      else if (hb < 0.95 && wb <= 0.77) { shape = 'Top hourglass'; tip = 'Fuller bust than hips with a defined waist.'; }
      else if (hb >= 1.05) { shape = 'Pear (triangle)'; tip = 'Hips are wider than the bust and shoulders.'; }
      else if (hb <= 0.95) { shape = 'Inverted triangle'; tip = 'Bust or shoulders are wider than the hips.'; }
      else if (wh >= 0.85) { shape = 'Apple (round)'; tip = 'Waist is close to the bust and hip measurements.'; }
      else { shape = 'Rectangle'; tip = 'Bust, waist and hips are similar in size.'; }
      return { results: [Mt('Your body shape', shape), Rx('Waist-to-hip ratio', wh, 2), Rx('Hip-to-bust ratio', hb, 2), Rx('Waist-to-bust ratio', wb, 2)], note: tip + ' Shape is a styling guide, not a health measure.' };
    }, { pop: 1 });

  C('weight-loss-date-calculator', 'Weight Loss Date Predictor', 'health/body', 'The date you will reach your goal weight at a steady weekly loss.', 'Weeks to goal = (current − goal) ÷ weekly loss. A safe pace is 0.25–1 kg (0.5–2 lb) a week.',
    [UN, ['cw', 'Current weight', 'n', function (c) { return c.imperial ? 187 : 85; }], ['gw', 'Goal weight', 'n', function (c) { return c.imperial ? 154 : 70; }], ['r', 'Weekly loss', 's', 0.5, [[0.25, '0.25 kg (0.5 lb) — gentle'], [0.5, '0.5 kg (1 lb) — steady'], [0.75, '0.75 kg (1.5 lb)'], [1, '1 kg (2 lb) — fast']]], ['st', 'Start date', 'd', 0]],
    function (v) {
      var cw = kgOf(v.cw, v.u), gw = kgOf(v.gw, v.u); if (gw >= cw) return { error: 'Goal weight must be lower than current weight.' };
      var wk = (cw - gw) / v.r, end = addDays(v.st, Math.ceil(wk * 7)), rows = [], pts = [], lab = [], step = Math.max(1, Math.round(wk / 12));
      for (var k = 0; k <= Math.ceil(wk); k += step) { var w = Math.max(gw, cw - k * v.r); rows.push([k, fd(addDays(v.st, k * 7)), v.u === 2 ? w / 0.45359237 : w]); lab.push('Wk ' + k); pts.push(v.u === 2 ? w / 0.45359237 : w); }
      return { results: [M('Goal date', end, 'date'), Rx('Weeks to go', wk, 1), Rx('Total to lose', v.u === 2 ? (cw - gw) / 0.45359237 : cw - gw, 1, v.u === 2 ? 'lb' : 'kg'), Rx('Daily calorie deficit needed', v.r * 7700 / 7, 0, 'kcal')], chart: { type: 'line', title: 'Projected weight', labels: lab, series: [{ l: 'Weight', pts: pts }], f: 'num' }, table: { head: ['Week', 'Date', 'Weight'], rows: rows, fmt: ['int', '', 'num'], title: 'Milestones' } };
    }, { pop: 1 });

  C('navy-body-fat-calculator', 'Navy Body Fat Calculator (US Navy / Army Method)', 'health/body', 'Body fat percentage from neck, waist and height using the US Navy formula.', 'Men: 495 ÷ (1.0324 − 0.19077·log(waist − neck) + 0.15456·log(height)) − 450. Women also use hips.',
    [UN, ['sx', 'Sex', 'g', 1, [[1, 'Male'], [2, 'Female']]], ['h', 'Height', 'n', function (c) { return c.imperial ? 69 : 175; }], ['n', 'Neck (below the larynx)', 'n', function (c) { return c.imperial ? 15.5 : 39; }], ['w', 'Waist (at the navel for men, narrowest for women)', 'n', function (c) { return c.imperial ? 34 : 86; }], ['hp', 'Hips (women)', 'n', function (c) { return c.imperial ? 38 : 96; }, '', { show: 'sx==2' }], ['wt', 'Body weight (optional)', 'n', function (c) { return c.imperial ? 170 : 77; }, '', { opt: 1 }]],
    function (v) {
      var h = cmOf(v.h, v.u), n = cmOf(v.n, v.u), w = cmOf(v.w, v.u), hp = cmOf(v.hp, v.u), bf;
      if (v.sx === 1) { if (w <= n) return { error: 'Waist must be larger than neck.' }; bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450; }
      else { if (w + hp <= n) return { error: 'Check the measurements.' }; bf = 495 / (1.29579 - 0.35004 * Math.log10(w + hp - n) + 0.221 * Math.log10(h)) - 450; }
      var cat = v.sx === 1 ? (bf < 6 ? 'Essential fat' : bf < 14 ? 'Athletes' : bf < 18 ? 'Fitness' : bf < 25 ? 'Average' : 'Obese') : (bf < 14 ? 'Essential fat' : bf < 21 ? 'Athletes' : bf < 25 ? 'Fitness' : bf < 32 ? 'Average' : 'Obese');
      var res = [Mp('Body fat', bf, 1), Tx('Category (ACE)', cat)];
      if (v.wt > 0) { var kg = kgOf(v.wt, v.u), fat = kg * bf / 100, f = v.u === 2 ? 1 / 0.45359237 : 1, un = v.u === 2 ? 'lb' : 'kg'; res.push(Rx('Fat mass', fat * f, 1, un)); res.push(Rx('Lean mass', (kg - fat) * f, 1, un)); }
      return { results: res, note: 'Tape-measure methods are accurate to roughly ±3–4 percentage points.' };
    }, { pop: 1 });

  C('ffmi-calculator', 'FFMI (Fat-Free Mass Index) Calculator', 'health/body', 'Muscularity relative to height, with the height-adjusted FFMI.', 'FFMI = lean mass (kg) ÷ height (m)²; normalized FFMI = FFMI + 6.1 × (1.8 − height in m).',
    [UN, ['sx', 'Sex', 'g', 1, [[1, 'Male'], [2, 'Female']]], ['wt', 'Weight', 'n', function (c) { return c.imperial ? 176 : 80; }], ['h', 'Height', 'n', function (c) { return c.imperial ? 70 : 178; }], ['bf', 'Body fat', 'p', 14]],
    function (v) {
      var kg = kgOf(v.wt, v.u), hm = cmOf(v.h, v.u) / 100, lbm = kg * (1 - v.bf / 100), ff = lbm / (hm * hm), nf = ff + 6.1 * (1.8 - hm);
      var m = v.sx === 1, r = m ? (nf < 18 ? 'Below average' : nf < 20 ? 'Average' : nf < 22 ? 'Above average' : nf < 23 ? 'Excellent' : nf < 26 ? 'Superior' : 'Very rare without enhancement') : (nf < 14 ? 'Below average' : nf < 17 ? 'Average' : nf < 18.5 ? 'Above average' : nf < 20 ? 'Excellent' : 'Superior');
      return { results: [Mx('Normalized FFMI', nf, 1), Rx('FFMI', ff, 1), Rx('Lean body mass', v.u === 2 ? lbm / 0.45359237 : lbm, 1, v.u === 2 ? 'lb' : 'kg'), Tx('Rating', r)] };
    });

  C('healthy-weight-range-calculator', 'Healthy Weight Range Calculator', 'health/body', 'The weight range for your height that falls in the healthy BMI band.', 'Weight = BMI × height². Healthy BMI is 18.5–24.9 (18.5–22.9 for many Asian populations).',
    [UN, ['h', 'Height', 'n', function (c) { return c.imperial ? 66 : 168; }], ['pop', 'BMI standard', 's', 24.9, [[24.9, 'WHO (18.5–24.9)'], [22.9, 'Asian-Pacific (18.5–22.9)']]]],
    function (v) {
      var hm = cmOf(v.h, v.u) / 100, lo = 18.5 * hm * hm, hi = v.pop * hm * hm, f = v.u === 2 ? 1 / 0.45359237 : 1, un = v.u === 2 ? 'lb' : 'kg';
      return { results: [Mx('Healthy weight — upper limit', hi * f, 1, un), Rx('Healthy weight — lower limit', lo * f, 1, un), Rx('Midpoint', (lo + hi) / 2 * f, 1, un)], note: 'BMI ignores muscle and body-fat distribution; use it as a starting point only.' };
    });

  /* ---------- Nutrition ---------- */
  C('meal-calorie-calculator', 'Meal Calorie Calculator', 'health/nutrition', 'Total calories of a meal from the weight and calorie density of each food.', 'Calories = grams ÷ 100 × kcal per 100 g.',
    [['f', 'Foods — "name grams kcal-per-100g", one per line', 'ta', 'Cooked rice 180 130\nDal 150 105\nChicken curry 120 165\nCurd 100 60\nSalad 80 20', '', { rows: 6 }]],
    function (v) {
      var fs = lines3(v.f); if (!fs.length) return { error: 'Enter lines like "Rice 180 130".' };
      var tot = 0, g = 0, rows = fs.map(function (x) { var k = x[1] * x[2] / 100; tot += k; g += x[1]; return [x[0], x[1], x[2], k]; });
      return { results: [Mx('Meal calories', tot, 0, 'kcal'), Rx('Total weight', g, 0, 'g'), Rx('Calories per 100 g of meal', tot / g * 100, 0, 'kcal'), Rx('Share of a 2,000 kcal day', tot / 20, 0, '%')], table: { head: ['Food', 'Grams', 'kcal / 100 g', 'kcal'], rows: rows, fmt: ['', 'num', 'num', 'num'], title: 'Breakdown' }, chart: { type: 'donut', data: rows.map(function (x) { return { l: x[0], v: x[3] }; }), f: 'num' } };
    }, { pop: 1 });

  C('caffeine-half-life-calculator', 'Caffeine Half-Life Calculator', 'health/nutrition', 'How much caffeine is left in your body at bedtime.', 'Remaining = dose × 0.5^(hours ÷ half-life). The average half-life is about 5 hours.',
    [['d', 'Caffeine consumed', 's', 95, [[95, 'Cup of coffee (~95 mg)'], [47, 'Cup of tea (~47 mg)'], [80, 'Espresso double (~80 mg)'], [34, 'Cola can (~34 mg)'], [160, 'Energy drink (~160 mg)'], [200, 'Pre-workout (~200 mg)']]], ['n', 'Servings', 'n', 2], ['t', 'Hours until bedtime', 'n', 8], ['hl', 'Your half-life', 's', 5, [[3, '3 h — smoker'], [5, '5 h — average adult'], [7, '7 h — slower metabolism'], [10, '10 h — oral contraceptive'], [10.5, '10.5 h — pregnancy']]], ['lim', 'Level you are comfortable sleeping with', 'n', 50, 'mg']],
    function (v) {
      var dose = v.d * v.n, left = dose * Math.pow(0.5, v.t / v.hl), rows = [], pts = [], lab = [];
      for (var h = 0; h <= Math.max(24, v.t + 2); h += 2) { var x = dose * Math.pow(0.5, h / v.hl); rows.push([h, x]); lab.push(h + 'h'); pts.push(x); }
      var clear = v.hl * Math.log(dose / v.lim) / Math.LN2;
      return { results: [Mx('Caffeine left at bedtime', left, 0, 'mg'), Rx('Total consumed', dose, 0, 'mg'), Rx('Share still in your body', left / dose * 100, 0, '%'), Rx('Hours until under your limit', Math.max(0, clear), 1, 'h')], chart: { type: 'line', title: 'Caffeine over time', labels: lab, series: [{ l: 'mg in body', pts: pts }], f: 'num' }, table: { head: ['Hours after', 'mg left'], rows: rows, fmt: ['int', 'num'], title: 'Decay' } };
    });

  C('vitamin-d-intake-calculator', 'Vitamin D Intake Calculator', 'health/nutrition', 'Recommended daily vitamin D and the safe upper limit for your age group.', 'NIH recommendations: 400 IU for infants, 600 IU for ages 1–70, 800 IU above 70. 40 IU = 1 mcg.',
    [['g', 'Age group', 's', 2, [[1, 'Infant 0–12 months'], [2, 'Child / adult 1–70 years'], [3, 'Adult over 70'], [4, 'Pregnant or breastfeeding']]], ['age', 'Age (years)', 'n', 30, '', { show: 'g==2' }], ['cur', 'What you take now (IU / day)', 'n', 400, '', { opt: 1 }]],
    function (v) {
      var rda = [400, 600, 800, 600][v.g - 1], ul = v.g === 1 ? 1000 : v.g === 2 ? (v.age < 4 ? 2500 : v.age < 9 ? 3000 : 4000) : 4000;
      var res = [Mx('Recommended intake', rda, 0, 'IU / day'), Rx('Same in micrograms', rda / 40, 1, 'mcg'), Rx('Upper safe limit', ul, 0, 'IU / day'), Rx('Per week', rda * 7, 0, 'IU')];
      if (v.cur > 0) res.push(Tx('Your intake', v.cur > ul ? 'Above the upper limit' : v.cur >= rda ? 'Meets the recommendation' : 'Below the recommendation'));
      return { results: res, note: 'People with low sun exposure, darker skin or certain conditions may need more. A blood test (25-OH vitamin D) is the way to know.' };
    });

  C('glycemic-load-calculator', 'Glycemic Load Calculator', 'health/nutrition', 'Glycemic load of each food and your whole meal.', 'GL = glycemic index × carbohydrate (g) ÷ 100. Low ≤ 10, medium 11–19, high ≥ 20 per serving.',
    [['f', 'Foods — "name GI carbs-in-serving(g)", one per line', 'ta', 'White rice 73 45\nDal 29 20\nBanana 51 27\nWhite bread slice 75 14', '', { rows: 5 }]],
    function (v) {
      var fs = lines3(v.f); if (!fs.length) return { error: 'Enter lines like "Banana 51 27".' };
      var tot = 0, rows = fs.map(function (x) { var gl = x[1] * x[2] / 100; tot += gl; return [x[0], x[1], x[2], gl, gl <= 10 ? 'Low' : gl < 20 ? 'Medium' : 'High']; });
      return { results: [Mx('Meal glycemic load', tot, 1), Tx('Meal rating', tot <= 10 ? 'Low' : tot < 20 ? 'Medium' : 'High'), Rx('Share of a daily ~100 GL budget', tot, 0, '%')], table: { head: ['Food', 'GI', 'Carbs (g)', 'GL', 'Level'], rows: rows, fmt: ['', 'int', 'num', 'num', ''], title: 'Per food' } };
    });

  var FOODS = [
    ['roti', '1 roti (40 g)', 100], ['chapati', '1 chapati (40 g)', 100], ['phulka', '1 phulka', 80], ['plain paratha', '1 paratha', 180], ['aloo paratha', '1 paratha', 260], ['paratha', '1 paratha', 180], ['puri', '1 puri', 125], ['naan', '1 naan', 260], ['bhatura', '1 bhatura', 300], ['thepla', '1 thepla', 100],
    ['jeera rice', '1 katori', 230], ['veg pulao', '1 katori', 250], ['chicken biryani', '1 plate (300 g)', 470], ['biryani', '1 plate (300 g)', 470], ['fried rice', '1 plate', 330], ['khichdi', '1 katori', 170], ['rice', '1 katori cooked (150 g)', 195],
    ['dal makhani', '1 katori', 230], ['dal tadka', '1 katori', 150], ['dal fry', '1 katori', 150], ['dal', '1 katori', 150], ['rajma', '1 katori', 190], ['chole', '1 katori', 210], ['sambar', '1 katori', 90],
    ['paneer butter masala', '1 katori', 320], ['palak paneer', '1 katori', 250], ['matar paneer', '1 katori', 260], ['paneer', '1 katori', 260], ['mixed veg', '1 katori', 120], ['sabzi', '1 katori', 120], ['aloo gobi', '1 katori', 140], ['bhindi', '1 katori', 130], ['baingan bharta', '1 katori', 120],
    ['butter chicken', '1 katori', 340], ['chicken curry', '1 katori', 250], ['egg curry', '1 katori', 210], ['fish curry', '1 katori', 190], ['mutton curry', '1 katori', 330],
    ['boiled egg', '1 egg', 78], ['egg', '1 egg', 78], ['omelette', '2-egg omelette', 190],
    ['idli', '1 idli', 58], ['masala dosa', '1 dosa', 250], ['dosa', '1 plain dosa', 135], ['uttapam', '1 uttapam', 190], ['upma', '1 plate', 230], ['poha', '1 plate', 250], ['dhokla', '2 pieces', 130],
    ['samosa', '1 samosa', 260], ['pakora', '5 pieces', 250], ['vada pav', '1 piece', 290], ['pav bhaji', '1 plate', 420], ['maggi', '1 packet', 330], ['sandwich', '1 veg sandwich', 200], ['burger', '1 veg burger', 350], ['pizza', '1 slice', 285], ['french fries', '1 medium', 365], ['chips', '1 small pack', 160],
    ['curd', '1 katori (100 g)', 60], ['raita', '1 katori', 80], ['sweet lassi', '1 glass', 200], ['lassi', '1 glass', 200], ['buttermilk', '1 glass', 40], ['chaas', '1 glass', 40], ['milk', '1 glass (200 ml)', 130],
    ['tea', '1 cup with milk and sugar', 70], ['coffee', '1 cup with milk and sugar', 80], ['cola', '1 can', 140], ['juice', '1 glass', 110],
    ['banana', '1 banana', 105], ['apple', '1 apple', 95], ['orange', '1 orange', 62], ['mango', '1 medium', 200], ['papaya', '1 katori', 60],
    ['gulab jamun', '1 piece', 150], ['jalebi', '1 piece', 70], ['rasgulla', '1 piece', 125], ['kheer', '1 katori', 220], ['halwa', '1 katori', 270], ['ladoo', '1 ladoo', 185], ['barfi', '1 piece', 100], ['ice cream', '1 scoop', 140],
    ['bread', '1 slice', 75], ['butter', '1 teaspoon', 36], ['ghee', '1 teaspoon', 45], ['peanuts', '1 handful (30 g)', 170], ['almonds', '10 almonds', 70], ['marie biscuit', '1 biscuit', 30], ['biscuit', '1 biscuit', 30]
  ];
  C('indian-food-calorie-calculator', 'Indian Food Calorie Calculator', 'health/nutrition', 'Calories in everyday Indian foods by the usual home serving.', 'Total = servings × calories per standard serving. Portions are typical home sizes.',
    [['f', 'What you ate — "food servings", one per line', 'ta', 'roti 3\ndal tadka 1\nrice 1\nsabzi 1\ncurd 1\ntea 2', '', { rows: 7 }], ['t', 'Daily calorie target', 'n', 2000]],
    function (v) {
      var ls = String(v.f).trim().split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean), rows = [], miss = [], tot = 0;
      ls.forEach(function (l) {
        var m = /^(.*?)[\s:x×]*([\d.]+)?\s*$/.exec(l), name = (m[1] || l).toLowerCase().trim(), q = m[2] ? +m[2] : 1, hit = null;
        FOODS.forEach(function (f) { if (!hit && name.indexOf(f[0]) === 0) hit = f; });
        if (!hit) FOODS.forEach(function (f) { if (!hit && name.indexOf(f[0]) > -1) hit = f; });
        if (hit) { rows.push([name, hit[1], q, hit[2] * q]); tot += hit[2] * q; } else miss.push(l);
      });
      if (!rows.length) return { error: 'No known foods found. Try: roti, dal, rice, idli, dosa, samosa, paneer, chicken curry, tea…' };
      return { results: [Mx('Total calories', tot, 0, 'kcal'), Rx('Share of your daily target', tot / v.t * 100, 0, '%'), Rx('Left for the day', Math.max(0, v.t - tot), 0, 'kcal')], table: { head: ['Food', 'Serving size', 'Servings', 'kcal'], rows: rows, fmt: ['', '', 'num', 'num'], title: 'Breakdown' }, chart: { type: 'donut', data: rows.map(function (x) { return { l: x[0], v: x[3] }; }), f: 'num' }, note: (miss.length ? 'Not recognised: ' + miss.join(', ') + '. ' : '') + 'Values are typical averages — oil, sugar and portion size change them.' };
    }, { pop: 1 });

  C('protein-for-muscle-gain-calculator', 'Protein for Muscle Gain Calculator', 'health/nutrition', 'Daily protein to build or keep muscle, split across meals.', 'Muscle gain: about 1.6–2.2 g of protein per kg of body weight per day.',
    [UN, ['wt', 'Body weight', 'n', function (c) { return c.imperial ? 165 : 75; }], ['g', 'Goal', 's', 2, [[1, 'Maintain (1.0–1.4 g/kg)'], [2, 'Build muscle (1.6–2.2 g/kg)'], [3, 'Lose fat, keep muscle (1.8–2.7 g/kg)']]], ['m', 'Meals per day', 'i', 4]],
    function (v) {
      var kg = kgOf(v.wt, v.u), r = [[1, 1.4], [1.6, 2.2], [1.8, 2.7]][v.g - 1], lo = kg * r[0], hi = kg * r[1], mid = (lo + hi) / 2;
      return { results: [Mx('Daily protein target', mid, 0, 'g'), Rx('Range — low', lo, 0, 'g'), Rx('Range — high', hi, 0, 'g'), Rx('Per meal', mid / v.m, 0, 'g'), Rx('Eggs for the target', mid / 6, 0), Rx('Dal / paneer / chicken (100 g ≈ 8 / 18 / 27 g)', mid / 18 * 100, 0, 'g paneer')] };
    });

  /* ---------- Pregnancy ---------- */
  var FRUIT = { 4: 'poppy seed', 5: 'sesame seed', 6: 'lentil', 7: 'blueberry', 8: 'raspberry', 9: 'cherry', 10: 'strawberry', 11: 'fig', 12: 'lime', 13: 'lemon', 14: 'peach', 15: 'apple', 16: 'avocado', 17: 'pear', 18: 'bell pepper', 19: 'mango', 20: 'banana', 21: 'carrot', 22: 'papaya', 23: 'grapefruit', 24: 'ear of corn', 25: 'cauliflower', 26: 'lettuce head', 27: 'broccoli head', 28: 'eggplant', 29: 'butternut squash', 30: 'cabbage', 31: 'coconut', 32: 'squash', 33: 'pineapple', 34: 'cantaloupe', 35: 'honeydew melon', 36: 'romaine lettuce', 37: 'swiss chard bunch', 38: 'leek bunch', 39: 'mini watermelon', 40: 'small pumpkin' };
  C('pregnancy-week-by-week-calculator', 'Pregnancy Week-by-Week Calculator', 'health/pregnancy', 'Your current week, trimester, due date and baby’s size.', 'Gestational age counts from the first day of your last period. Due date = LMP + 280 days.',
    [['m', 'I know', 'g', 1, [[1, 'First day of last period'], [2, 'My due date']]], ['d', 'Date', 'd', -98]],
    function (v) {
      var lmp = v.m === 1 ? v.d : addDays(v.d, -280), due = addDays(lmp, 280), today = new Date(); today.setHours(0, 0, 0, 0);
      var dd = Math.round((today - lmp) / 86400000); if (dd < 0 || dd > 300) return { error: 'That date is not within a current pregnancy.' };
      var w = Math.floor(dd / 7), d = dd % 7, tri = w < 14 ? 1 : w < 28 ? 2 : 3, fr = FRUIT[Math.max(4, Math.min(40, w))];
      var mil = [[8, 'First antenatal visit and dating scan'], [12, 'Nuchal translucency scan window (11–14 wk)'], [20, 'Anomaly (level II) scan window (18–22 wk)'], [26, 'Glucose tolerance test window (24–28 wk)'], [30, 'Tdap vaccine window (27–36 wk)'], [36, 'Group B strep test (36–37 wk)'], [40, 'Due date']];
      return { results: [Mt('You are', w + ' weeks ' + d + ' days'), Rx('Trimester', tri, 0), R('Due date', due, 'date'), Rx('Days to go', Math.max(0, 280 - dd), 0), Rp('Pregnancy complete', Math.min(100, dd / 280 * 100), 0), Tx('Baby is about the size of a', fr)], table: { head: ['Week', 'Date', 'Usual care'], rows: mil.map(function (m) { return [m[0], fd(addDays(lmp, m[0] * 7)), m[1]]; }), fmt: ['int', '', ''], title: 'Key weeks' }, note: 'Only an ultrasound scan can date a pregnancy accurately. This is general information, not medical advice.' };
    }, { pop: 1 });

  C('fertile-window-calculator', 'Fertile Window Calculator', 'health/pregnancy', 'Your most fertile days and the next ovulation dates.', 'Ovulation happens about 14 days before the next period. The fertile window is the 5 days before ovulation plus the day itself.',
    [['lmp', 'First day of last period', 'd', -12], ['cl', 'Average cycle length (days)', 'i', 28]],
    function (v) {
      var rows = [], first;
      for (var k = 0; k < 6; k++) { var st = addDays(v.lmp, k * v.cl), ov = addDays(st, v.cl - 14), fs = addDays(ov, -5), fe = addDays(ov, 1); rows.push([fd(st), fd(fs) + ' – ' + fd(fe), fd(ov), fd(addDays(st, v.cl))]); }
      var ov0 = addDays(v.lmp, v.cl - 14);
      return { results: [M('Ovulation (this cycle)', ov0, 'date'), R('Fertile window starts', addDays(ov0, -5), 'date'), R('Fertile window ends', addDays(ov0, 1), 'date'), R('Next period expected', addDays(v.lmp, v.cl), 'date')], table: { head: ['Cycle starts', 'Fertile window', 'Ovulation', 'Next period'], rows: rows, fmt: ['', '', '', ''], title: 'Next six cycles' }, note: 'Cycles vary. Ovulation kits or tracking basal temperature give more precise timing.' };
    }, { pop: 1 });

  C('safe-period-calculator', 'Safe Period Calculator (Calendar Method)', 'health/pregnancy', 'Days of the cycle that are usually less fertile — with the limits of this method.', 'First fertile day = shortest cycle − 18; last fertile day = longest cycle − 11.',
    [['lmp', 'First day of last period', 'd', -5], ['s', 'Shortest cycle in the last 6 months (days)', 'i', 26], ['l', 'Longest cycle (days)', 'i', 31]],
    function (v) {
      if (v.l < v.s) return { error: 'The longest cycle must be at least as long as the shortest.' };
      var a = v.s - 18, b = v.l - 11, rows = [['Day 1 – ' + (a - 1), fd(v.lmp) + ' – ' + fd(addDays(v.lmp, a - 2)), 'Lower fertility'], ['Day ' + a + ' – ' + b, fd(addDays(v.lmp, a - 1)) + ' – ' + fd(addDays(v.lmp, b - 1)), 'Fertile — avoid or use protection'], ['Day ' + (b + 1) + ' – next period', fd(addDays(v.lmp, b)) + ' – ' + fd(addDays(v.lmp, v.l - 1)), 'Lower fertility']];
      return { results: [Mx('Fertile days in the cycle', b - a + 1, 0, 'days'), Tx('Fertile from day', a + ' to day ' + b), R('Fertile dates', fd(addDays(v.lmp, a - 1)) + ' – ' + fd(addDays(v.lmp, b - 1)), 'text')], table: { head: ['Cycle days', 'Dates', 'Meaning'], rows: rows, fmt: ['', '', ''], title: 'This cycle' }, note: 'The calendar method fails in roughly 1 in 4 couples over a year of typical use. It does not protect against infections. Talk to a doctor about reliable contraception.' };
    });

  C('hcg-doubling-time-calculator', 'hCG Doubling Time Calculator', 'health/pregnancy', 'How fast your hCG level is rising between two blood tests.', 'Doubling time = hours between tests × ln 2 ÷ ln(second level ÷ first level).',
    [['a', 'First hCG level (mIU/mL)', 'n', 480], ['b', 'Second hCG level (mIU/mL)', 'n', 1050], ['h', 'Hours between the tests', 'n', 48]],
    function (v) {
      if (v.a <= 0 || v.b <= 0 || v.h <= 0) return { error: 'Levels and hours must be above zero.' };
      var td = v.h * Math.LN2 / Math.log(v.b / v.a), rise = (v.b / v.a - 1) * 100, exp = v.a < 1500 ? 'about 49 hours or less' : v.a < 3000 ? 'up to about 72 hours' : 'slower, up to 96 hours or more';
      return { results: [Mx('Doubling time', td, 1, 'hours'), Rp('Rise between tests', rise, 0), Rx('Expected level after 48 h at this rate', v.b * Math.pow(2, 48 / td), 0, 'mIU/mL'), Tx('Typical early pregnancy', 'For a starting level like this, doubling is ' + exp)], note: 'A single pattern does not diagnose anything. Only your doctor can interpret hCG together with scans and symptoms.' };
    });

  C('baby-feeding-calculator', 'Baby Feeding Calculator', 'health/pregnancy', 'A guide to how much milk your baby may need each day.', 'Typical intake is about 150 ml per kg of body weight per day for babies under 6 months (range 120–180).',
    [['u', 'Weight unit', 'g', imp, [[1, 'kg'], [2, 'lb']]], ['w', 'Baby’s weight', 'n', function (c) { return c.imperial ? 11 : 5; }], ['m', 'Age (months)', 'n', 2]],
    function (v) {
      var kg = v.u === 2 ? v.w * 0.45359237 : v.w, daily = Math.min(960, kg * 150), feeds = v.m < 1 ? 10 : v.m < 2 ? 8 : v.m < 4 ? 7 : v.m < 6 ? 6 : 5;
      return { results: [Mx('Milk per day (guide)', daily, 0, 'ml'), Rx('Range', kg * 120, 0, 'ml'), Rx('Up to', Math.min(960, kg * 180), 0, 'ml'), Rx('Feeds per day', feeds, 0), Rx('Per feed', daily / feeds, 0, 'ml'), Rx('Per feed in ounces', daily / feeds / 29.5735, 1, 'oz')], note: v.m >= 6 ? 'After 6 months solids join milk, so milk volume per day usually falls. ' : 'Babies feed on demand — hunger cues matter more than a fixed amount. Check growth with your paediatrician.' };
    });

  /* ---------- Medical ---------- */
  C('pediatric-dose-calculator', 'Pediatric Dose Calculator', 'health/medical', 'Child dose from the weight-based, Clark, Young and Fried rules.', 'Weight-based: dose = mg per kg × weight. Clark: adult dose × weight(lb) ÷ 150. Young: adult × age ÷ (age + 12).',
    [['wu', 'Weight unit', 'g', imp, [[1, 'kg'], [2, 'lb']]], ['w', 'Child’s weight', 'n', function (c) { return c.imperial ? 33 : 15; }], ['age', 'Child’s age (years)', 'n', 4], ['mk', 'Dose per kg (from the label or prescriber)', 'n', 10, 'mg/kg'], ['ad', 'Adult dose (for the rules below)', 'n', 500, 'mg'], ['mx', 'Maximum daily dose per kg', 'n', 60, 'mg/kg', { opt: 1 }]],
    function (v) {
      var kg = v.wu === 2 ? v.w * 0.45359237 : v.w, lb = kg / 0.45359237, wd = v.mk * kg, clark = v.ad * lb / 150, young = v.ad * v.age / (v.age + 12), fried = v.ad * (v.age * 12) / 150;
      var res = [Mx('Weight-based dose', wd, 1, 'mg'), Rx('Clark’s rule', clark, 1, 'mg'), Rx('Young’s rule (1–12 years)', young, 1, 'mg'), Rx('Fried’s rule (under 2 years)', fried, 1, 'mg')];
      if (v.mx > 0) res.push(Rx('Maximum in 24 hours', v.mx * kg, 0, 'mg'));
      return { results: res, note: 'For safety, follow the product label or the prescriber’s dose. For liquids, convert mg to ml using the concentration printed on the bottle.' };
    });

  C('qtc-calculator', 'QTc Calculator (Corrected QT Interval)', 'health/medical', 'QT corrected for heart rate by Bazett, Fridericia, Framingham and Hodges.', 'Bazett: QTc = QT ÷ √RR. Fridericia: QT ÷ ∛RR. RR = 60 ÷ heart rate (seconds).',
    [['qt', 'QT interval (ms)', 'n', 400], ['hr', 'Heart rate (bpm)', 'n', 75], ['sx', 'Sex', 'g', 1, [[1, 'Male'], [2, 'Female']]]],
    function (v) {
      var rr = 60 / v.hr, baz = v.qt / Math.sqrt(rr), fri = v.qt / Math.cbrt(rr), fra = v.qt + 154 * (1 - rr), hod = v.qt + 1.75 * (v.hr - 60), lim = v.sx === 1 ? 450 : 460;
      return { results: [Mx('QTc (Bazett)', baz, 0, 'ms'), Rx('QTc (Fridericia)', fri, 0, 'ms'), Rx('QTc (Framingham)', fra, 0, 'ms'), Rx('QTc (Hodges)', hod, 0, 'ms'), Tx('Reading (Fridericia)', fri > 500 ? 'Markedly prolonged — high risk' : fri > lim ? 'Prolonged' : fri < 350 ? 'Short' : 'Normal range')], note: 'Bazett over-corrects at high heart rates; Fridericia is usually preferred above 90 bpm. Clinical interpretation belongs to a doctor.' };
    });

  C('insulin-dose-calculator', 'Insulin Dose Calculator', 'health/medical', 'Mealtime and correction insulin from carbs, glucose and your ratios.', 'Dose = carbs ÷ carb ratio + (glucose − target) ÷ correction factor. Rule of thumb: ratio = 500 ÷ TDD, factor = 1800 ÷ TDD.',
    [['m', 'Glucose unit', 'g', 1, [[1, 'mg/dL'], [2, 'mmol/L']]], ['c', 'Carbs in the meal (g)', 'n', 60], ['bg', 'Current glucose', 'n', 180], ['tg', 'Target glucose', 'n', 110], ['tdd', 'Total daily insulin dose (units)', 'n', 40], ['cr', 'Carb ratio override (g per unit)', 'n', 0, '', { opt: 1 }], ['cf', 'Correction factor override', 'n', 0, '', { opt: 1 }]],
    function (v) {
      var cr = v.cr > 0 ? v.cr : 500 / v.tdd, cf = v.cf > 0 ? v.cf : (v.m === 1 ? 1800 / v.tdd : 100 / v.tdd), meal = v.c / cr, corr = Math.max(0, (v.bg - v.tg) / cf);
      return { results: [Mx('Total dose (before rounding)', meal + corr, 1, 'units'), Rx('For the meal', meal, 1, 'units'), Rx('Correction', corr, 1, 'units'), Rx('Carb ratio used', cr, 1, 'g per unit'), Rx('Correction factor used', cf, 1, v.m === 1 ? 'mg/dL per unit' : 'mmol/L per unit')], note: 'These are rules of thumb. Always confirm doses with your diabetes care team and subtract insulin already on board.' };
    });

  var PCE = function (sx, race, age, tc, hdl, sbp, treated, smoker, dm) {
    var la = Math.log(age), lt = Math.log(tc), lh = Math.log(hdl), ls = Math.log(sbp), s, mean, s0;
    if (race === 1 && sx === 2) { s = -29.799 * la + 4.884 * la * la + 13.54 * lt - 3.114 * la * lt - 13.578 * lh + 3.149 * la * lh + (treated ? 2.019 : 1.957) * ls + 7.574 * smoker - 1.665 * la * smoker + 0.661 * dm; mean = -29.18; s0 = 0.9665; }
    else if (race === 1) { s = 12.344 * la + 11.853 * lt - 2.664 * la * lt - 7.99 * lh + 1.769 * la * lh + (treated ? 1.797 : 1.764) * ls + 7.837 * smoker - 1.795 * la * smoker + 0.658 * dm; mean = 61.18; s0 = 0.9144; }
    else if (sx === 2) { s = 17.114 * la + 0.94 * lt - 18.92 * lh + 4.475 * la * lh + (treated ? 29.291 * ls - 6.432 * la * ls : 27.82 * ls - 6.087 * la * ls) + 0.691 * smoker + 0.874 * dm; mean = 86.61; s0 = 0.9533; }
    else { s = 2.469 * la + 0.302 * lt - 0.307 * lh + (treated ? 1.916 : 1.809) * ls + 0.549 * smoker + 0.645 * dm; mean = 19.54; s0 = 0.8954; }
    return (1 - Math.pow(s0, Math.exp(s - mean))) * 100;
  };
  CW._pce = PCE;
  C('ascvd-risk-calculator', '10-Year ASCVD Risk Calculator (Pooled Cohort)', 'health/medical', 'Ten-year risk of heart attack or stroke using the ACC/AHA Pooled Cohort Equations.', 'Valid for ages 40–79 without existing cardiovascular disease. Cholesterol in mg/dL, blood pressure in mmHg.',
    [['sx', 'Sex', 'g', 1, [[1, 'Male'], [2, 'Female']]], ['rc', 'Race', 's', 1, [[1, 'White or other'], [2, 'African American']]], ['age', 'Age (40–79)', 'i', 55], ['tc', 'Total cholesterol (mg/dL)', 'n', 213], ['hdl', 'HDL cholesterol (mg/dL)', 'n', 50], ['sbp', 'Systolic blood pressure', 'n', 120], ['tr', 'Treated for high blood pressure', 'c', 0], ['sm', 'Current smoker', 'c', 0], ['dm', 'Diabetes', 'c', 0]],
    function (v) {
      if (v.age < 40 || v.age > 79) return { error: 'The equations are validated for ages 40 to 79.' };
      var r = PCE(v.sx, v.rc, v.age, v.tc, v.hdl, v.sbp, v.tr, v.sm, v.dm);
      return { results: [Mp('10-year ASCVD risk', r, 1), Tx('Category', r < 5 ? 'Low (< 5%)' : r < 7.5 ? 'Borderline (5–7.4%)' : r < 20 ? 'Intermediate (7.5–19.9%)' : 'High (≥ 20%)')], note: 'Risk categories guide statin discussion with a doctor. Newer PREVENT equations exist; this tool uses the 2013 ACC/AHA equations.' };
    });

  var CHADS = [['chf', 'Heart failure or reduced heart function', 1], ['htn', 'High blood pressure', 1], ['a75', 'Age 75 or older', 2], ['dm', 'Diabetes', 1], ['st', 'Previous stroke, TIA or clot', 2], ['vd', 'Vascular disease (heart attack, PAD, aortic plaque)', 1], ['a65', 'Age 65–74', 1], ['fe', 'Female', 1]];
  C('cha2ds2-vasc-calculator', 'CHA₂DS₂-VASc Score Calculator', 'health/medical', 'Stroke risk in atrial fibrillation.', 'Adds points for heart failure, hypertension, age, diabetes, previous stroke, vascular disease and sex.',
    CHADS.map(function (a) { return chk(a[0], a[1]); }),
    function (v) {
      var s = score(CHADS, v), risk = { 0: 0, 1: 1.3, 2: 2.2, 3: 3.2, 4: 4, 5: 6.7, 6: 9.8, 7: 9.6, 8: 6.7, 9: 15.2 }[s];
      return { results: [Mx('Score', s, 0), Rp('Approx. yearly stroke risk', risk, 1), Tx('Guideline view', s >= 2 ? 'Oral anticoagulation is usually recommended' : s === 1 ? 'Anticoagulation may be considered' : 'Usually no antithrombotic therapy needed')], note: 'Women get 1 point for sex only, so a woman with no other factor scores 1 but is treated as low risk. Decisions rest with the treating doctor.' };
    });

  var WELLS_DVT = [['ca', 'Active cancer (treatment within 6 months or palliative)', 1], ['pa', 'Paralysis, paresis or recent plaster cast of the leg', 1], ['bed', 'Bedridden 3+ days or major surgery in the last 12 weeks', 1], ['te', 'Tenderness along the deep veins', 1], ['sw', 'Entire leg swollen', 1], ['ca3', 'Calf swelling more than 3 cm over the other leg', 1], ['pit', 'Pitting oedema in the affected leg', 1], ['col', 'Collateral superficial veins (non-varicose)', 1], ['pd', 'Previously documented DVT', 1], ['alt', 'Another diagnosis at least as likely as DVT', -2]];
  C('wells-score-dvt-calculator', 'Wells Score for DVT', 'health/medical', 'Clinical probability of deep vein thrombosis.', 'Add one point per criterion and subtract two if another diagnosis is as likely.',
    WELLS_DVT.map(function (a) { return chk(a[0], a[1]); }),
    function (v) { var s = score(WELLS_DVT, v); return { results: [Mx('Wells score', s, 0), Tx('Three-level probability', s >= 3 ? 'High (~75%)' : s >= 1 ? 'Moderate (~17%)' : 'Low (~5%)'), Tx('Two-level', s >= 2 ? 'DVT likely — imaging needed' : 'DVT unlikely — D-dimer can help rule out')], note: 'A clinical aid only. It does not replace examination, D-dimer or ultrasound.' }; });

  var WELLS_PE = [['dv', 'Clinical signs of DVT (leg swelling, pain on palpation)', 3], ['pe', 'PE is the most likely diagnosis, or equally likely', 3], ['hr', 'Heart rate above 100', 1.5], ['im', 'Immobilisation (3+ days) or surgery in the last 4 weeks', 1.5], ['pv', 'Previous DVT or PE', 1.5], ['hm', 'Haemoptysis (coughing blood)', 1], ['mal', 'Malignancy (treated in last 6 months or palliative)', 1]];
  C('wells-score-pe-calculator', 'Wells Score for Pulmonary Embolism', 'health/medical', 'Clinical probability of pulmonary embolism.', 'Points: signs of DVT 3, PE most likely 3, heart rate > 100 1.5, immobilisation 1.5, previous DVT/PE 1.5, haemoptysis 1, cancer 1.',
    WELLS_PE.map(function (a) { return chk(a[0], a[1]); }),
    function (v) { var s = score(WELLS_PE, v); return { results: [Mx('Wells score', s, 1), Tx('Three-level probability', s > 6 ? 'High (~65%)' : s >= 2 ? 'Moderate (~20%)' : 'Low (~2%)'), Tx('Two-level', s > 4 ? 'PE likely — CT pulmonary angiogram' : 'PE unlikely — D-dimer')], note: 'A clinical aid only. Suspected PE is an emergency — seek medical care.' }; });

  C('apgar-score-calculator', 'APGAR Score Calculator', 'health/medical', 'Newborn condition at 1 and 5 minutes after birth.', 'Five signs, each scored 0–2: appearance, pulse, grimace, activity and respiration.',
    [['a', 'Appearance (skin colour)', 's', 2, [[0, '0 — blue or pale all over'], [1, '1 — body pink, hands and feet blue'], [2, '2 — pink all over']]], ['p', 'Pulse (heart rate)', 's', 2, [[0, '0 — absent'], [1, '1 — below 100 bpm'], [2, '2 — 100 bpm or more']]], ['g', 'Grimace (reflex response)', 's', 2, [[0, '0 — no response'], [1, '1 — grimace or weak cry'], [2, '2 — cry, cough or sneeze']]], ['t', 'Activity (muscle tone)', 's', 2, [[0, '0 — limp'], [1, '1 — some flexion'], [2, '2 — active movement']]], ['r', 'Respiration (breathing)', 's', 2, [[0, '0 — absent'], [1, '1 — weak or irregular'], [2, '2 — strong cry']]]],
    function (v) { var s = v.a + v.p + v.g + v.t + v.r; return { results: [Mx('APGAR score', s, 0), Tx('Reading', s >= 7 ? 'Reassuring (7–10)' : s >= 4 ? 'Moderately low (4–6) — may need help' : 'Low (0–3) — needs immediate resuscitation')], note: 'A score of 7 or more at 5 minutes is normal. The score does not predict long-term outcome.' }; });

  C('sodium-correction-calculator', 'Sodium Correction for Hyperglycemia', 'health/medical', 'Serum sodium corrected for a high glucose level.', 'Corrected Na = measured Na + factor × (glucose − 100) ÷ 100, with factor 1.6 (Katz) or 2.4 (Hillier).',
    [['u', 'Glucose unit', 'g', 1, [[1, 'mg/dL'], [2, 'mmol/L']]], ['na', 'Measured sodium (mEq/L)', 'n', 128], ['gl', 'Glucose', 'n', 600]],
    function (v) { var g = v.u === 2 ? v.gl * 18.016 : v.gl, k = v.na + 1.6 * (g - 100) / 100, h = v.na + 2.4 * (g - 100) / 100; return { results: [Mx('Corrected sodium (factor 1.6)', k, 1, 'mEq/L'), Rx('Corrected sodium (factor 2.4)', h, 1, 'mEq/L'), Tx('Reading', k < 135 ? 'Still low after correction' : k > 145 ? 'High after correction' : 'Normal after correction')] }; });

  C('holliday-segar-fluid-calculator', 'Maintenance Fluid Calculator (Holliday-Segar)', 'health/medical', 'Daily and hourly maintenance IV fluid for a child or adult.', 'First 10 kg: 100 mL/kg · next 10 kg: 50 mL/kg · above 20 kg: 20 mL/kg per day. Hourly: 4-2-1 rule.',
    [['u', 'Weight unit', 'g', imp, [[1, 'kg'], [2, 'lb']]], ['w', 'Weight', 'n', function (c) { return c.imperial ? 44 : 20; }]],
    function (v) { var kg = v.u === 2 ? v.w * 0.45359237 : v.w, d = kg <= 10 ? kg * 100 : kg <= 20 ? 1000 + (kg - 10) * 50 : 1500 + (kg - 20) * 20, h = kg <= 10 ? kg * 4 : kg <= 20 ? 40 + (kg - 10) * 2 : 60 + (kg - 20); return { results: [Mx('Fluid per 24 hours', d, 0, 'mL'), Rx('Per hour (4-2-1 rule)', h, 0, 'mL/h'), Rx('Per kg per day', d / kg, 0, 'mL/kg'), Rx('Per hour (daily ÷ 24)', d / 24, 0, 'mL/h')], note: 'For clinical use under supervision; adult maintenance usually caps near 2,400 mL a day.' }; });

  var RN = [['hd', 'Head and neck', 9, 18], ['ft', 'Front of trunk', 18, 18], ['bk', 'Back of trunk', 18, 18], ['ra', 'Right arm', 9, 9], ['la', 'Left arm', 9, 9], ['rl', 'Right leg', 18, 14], ['ll', 'Left leg', 18, 14], ['pn', 'Groin / genitals', 1, 0]];
  C('burn-area-calculator', 'Burn Area Calculator (Rule of Nines) & Parkland Fluids', 'health/medical', 'Percentage of body surface burned and the Parkland formula fluid volume.', 'Adult rule of nines: head 9%, each arm 9%, front trunk 18%, back 18%, each leg 18%, groin 1%. Parkland: 4 mL × kg × %TBSA.',
    [['a', 'Patient', 'g', 1, [[1, 'Adult'], [2, 'Child (under 10)']]], ['w', 'Weight (kg)', 'n', 70]].concat(RN.map(function (r) { return ['p' + r[0], r[1] + ' — how much is burned', 'p', r[0] === 'ra' ? 50 : r[0] === 'ft' ? 40 : 0]; })),
    function (v) {
      var tb = 0, rows = []; RN.forEach(function (r) { var sz = v.a === 1 ? r[2] : r[3], b = sz * v['p' + r[0]] / 100; tb += b; if (b > 0) rows.push([r[1], sz, v['p' + r[0]], b]); });
      var fl = 4 * v.w * tb;
      return { results: [Mp('Total body surface area burned', tb, 1), Rx('Parkland fluid in 24 hours', fl, 0, 'mL'), Rx('First 8 hours', fl / 2, 0, 'mL'), Rx('Rate in first 8 hours', fl / 2 / 8, 0, 'mL/h'), Rx('Next 16 hours', fl / 2, 0, 'mL')], table: { head: ['Region', 'Region size %', 'Burned %', 'Contribution %'], rows: rows, fmt: ['', 'pct', 'pct', 'pct'], title: 'By region' }, note: 'Count partial- and full-thickness burns only (not simple redness). Emergency medical care is required for significant burns.' };
    });

  C('curb-65-calculator', 'CURB-65 Pneumonia Severity Score', 'health/medical', 'Severity and 30-day mortality risk in community-acquired pneumonia.', 'One point each for Confusion, Urea > 7 mmol/L, Respiratory rate ≥ 30, low Blood pressure, age ≥ 65.',
    [chk('c', 'New confusion'), chk('u', 'Urea above 7 mmol/L (BUN above 19 mg/dL)'), chk('r', 'Respiratory rate 30 or more'), chk('b', 'Systolic BP below 90 or diastolic 60 or less'), chk('a', 'Age 65 or older')],
    function (v) { var s = v.c + v.u + v.r + v.b + v.a, mort = [0.6, 2.7, 6.8, 14, 27.8, 27.8][s]; return { results: [Mx('CURB-65 score', s, 0), Rp('30-day mortality', mort, 1), Tx('Suggested setting', s <= 1 ? 'Likely suitable for home treatment' : s === 2 ? 'Consider short hospital stay' : 'Hospital — consider intensive care if 4–5')], note: 'A decision aid, not a replacement for clinical judgment.' }; });

  C('qsofa-score-calculator', 'qSOFA Score Calculator', 'health/medical', 'A quick bedside screen for risk of poor outcome in suspected sepsis.', 'One point each: respiratory rate ≥ 22, altered mentation, systolic BP ≤ 100.',
    [chk('r', 'Respiratory rate 22 or more'), chk('m', 'Altered mental status (GCS below 15)'), chk('s', 'Systolic blood pressure 100 or less')],
    function (v) { var s = v.r + v.m + v.s; return { results: [Mx('qSOFA', s, 0), Tx('Reading', s >= 2 ? 'High risk — assess for organ dysfunction urgently' : 'Lower risk — keep monitoring')], note: 'qSOFA does not diagnose sepsis. Suspected sepsis needs urgent medical assessment.' }; });

  C('centor-score-calculator', 'Centor / McIsaac Score (Strep Throat)', 'health/medical', 'Likelihood that a sore throat is Group A strep.', 'Points: tonsillar exudate, tender neck nodes, fever, no cough; McIsaac adds age.',
    [chk('e', 'Tonsillar swelling or exudate'), chk('n', 'Tender or swollen front neck lymph nodes'), chk('f', 'Fever above 38 °C (100.4 °F)'), chk('c', 'No cough'), ['a', 'Age group', 's', 0, [[1, '3–14 years (+1)'], [0, '15–44 years (0)'], [-1, '45 years or older (−1)']]]],
    function (v) { var s = v.e + v.n + v.f + v.c + v.a, p = s <= 0 ? '1–2%' : s === 1 ? '5–10%' : s === 2 ? '11–17%' : s === 3 ? '28–35%' : '51–53%'; return { results: [Mx('Score', s, 0), Tx('Chance of strep', p), Tx('Usual next step', s <= 1 ? 'No test or antibiotic needed' : s <= 3 ? 'Rapid strep test or culture' : 'Test, and consider treating')], note: 'Guidance only; the treating clinician decides.' }; });

  C('child-pugh-score-calculator', 'Child-Pugh Score Calculator', 'health/medical', 'Severity of cirrhosis and expected survival.', 'Five parameters scored 1–3 each: bilirubin, albumin, INR, ascites and encephalopathy.',
    [['b', 'Bilirubin (mg/dL)', 'n', 1.8], ['a', 'Albumin (g/dL)', 'n', 3.2], ['i', 'INR', 'n', 1.5], ['as', 'Ascites', 's', 1, [[1, 'None'], [2, 'Mild / controlled'], [3, 'Moderate to severe']]], ['en', 'Encephalopathy', 's', 1, [[1, 'None'], [2, 'Grade 1–2'], [3, 'Grade 3–4']]]],
    function (v) {
      var s = (v.b < 2 ? 1 : v.b <= 3 ? 2 : 3) + (v.a > 3.5 ? 1 : v.a >= 2.8 ? 2 : 3) + (v.i < 1.7 ? 1 : v.i <= 2.3 ? 2 : 3) + +v.as + +v.en, cl = s <= 6 ? 'A' : s <= 9 ? 'B' : 'C', surv = { A: ['100%', '85%'], B: ['80%', '60%'], C: ['45%', '35%'] }[cl];
      return { results: [Mx('Child-Pugh score', s, 0), Tx('Class', cl + (cl === 'A' ? ' — well compensated' : cl === 'B' ? ' — significant compromise' : ' — decompensated')), Tx('1-year survival', surv[0]), Tx('2-year survival', surv[1])], note: 'Survival figures are population estimates.' };
    });

  C('meld-score-calculator', 'MELD & MELD-Na Score Calculator', 'health/medical', 'Short-term mortality risk in end-stage liver disease.', 'MELD = 3.78·ln(bilirubin) + 11.2·ln(INR) + 9.57·ln(creatinine) + 6.43. MELD-Na adds sodium.',
    [['b', 'Bilirubin (mg/dL)', 'n', 2.4], ['i', 'INR', 'n', 1.6], ['c', 'Creatinine (mg/dL)', 'n', 1.3], ['na', 'Sodium (mEq/L)', 'n', 133]],
    function (v) {
      var b = Math.max(1, v.b), i = Math.max(1, v.i), c = Math.min(4, Math.max(1, v.c)), meld = 3.78 * Math.log(b) + 11.2 * Math.log(i) + 9.57 * Math.log(c) + 6.43, na = Math.min(137, Math.max(125, v.na)), mna = meld + 1.32 * (137 - na) - 0.033 * meld * (137 - na);
      var m = Math.round(meld), mort = m < 10 ? '1.9%' : m < 20 ? '6%' : m < 30 ? '19.6%' : m < 40 ? '52.6%' : '71.3%';
      return { results: [Mx('MELD', meld, 0), Rx('MELD-Na', mna, 0), Tx('3-month mortality (MELD)', mort)], note: 'Lab values below 1 are set to 1 and creatinine is capped at 4, as in the standard score. Used by transplant teams.' };
    });

  C('homa-ir-calculator', 'HOMA-IR Calculator (Insulin Resistance)', 'health/medical', 'Insulin resistance from fasting glucose and fasting insulin.', 'HOMA-IR = fasting glucose (mg/dL) × fasting insulin (µU/mL) ÷ 405.',
    [['u', 'Glucose unit', 'g', 1, [[1, 'mg/dL'], [2, 'mmol/L']]], ['g', 'Fasting glucose', 'n', 98], ['i', 'Fasting insulin (µU/mL)', 'n', 11]],
    function (v) { var g = v.u === 2 ? v.g * 18.016 : v.g, h = g * v.i / 405, beta = 360 * v.i / (g - 63); return { results: [Mx('HOMA-IR', h, 2), Tx('Reading', h < 1 ? 'Optimal insulin sensitivity' : h < 2 ? 'Early insulin resistance' : h < 2.9 ? 'Insulin resistance' : 'Significant insulin resistance'), Rx('HOMA-β (β-cell function)', g > 63 ? beta : 0, 0, '%')], note: 'Cut-offs vary by population. Interpret with your doctor.' }; });

  /* ---------- Lifestyle ---------- */
  C('pack-year-calculator', 'Pack-Year Calculator (Smoking)', 'health/lifestyle', 'Your smoking exposure in pack-years.', 'Pack-years = packs per day × years smoked (20 cigarettes = 1 pack).',
    [['c', 'Cigarettes per day', 'n', 10], ['y', 'Years smoked', 'n', 12], ['age', 'Your age', 'i', 45], ['q', 'Years since quitting (0 if still smoking)', 'n', 0]],
    function (v) { var py = v.c / 20 * v.y, elig = v.age >= 50 && v.age <= 80 && py >= 20 && v.q <= 15; return { results: [Mx('Pack-years', py, 1), Rx('Cigarettes smoked in total', v.c * 365 * v.y, 0), Tx('Lung-cancer screening (US guideline)', elig ? 'Meets age, 20 pack-year and quit-time criteria — ask your doctor' : 'Does not currently meet the 50–80 years, 20 pack-year, quit within 15 years criteria')], note: 'Quitting at any age lowers risk. Ask your doctor about help to stop.' }; });

  var LE = { IN: ['India', 70.4, 73.7], US: ['United States', 76.3, 81.4], GB: ['United Kingdom', 79, 83], CA: ['Canada', 80.3, 84.1], AU: ['Australia', 81.2, 85.3], DE: ['Germany', 78.7, 83.5], FR: ['France', 80.1, 85.9], JP: ['Japan', 81.5, 87.6], CN: ['China', 75, 80.5], BR: ['Brazil', 72.8, 79.3], RU: ['Russia', 68, 78], PK: ['Pakistan', 65.5, 68.5], BD: ['Bangladesh', 72.6, 75.5], NG: ['Nigeria', 52.5, 54.5], ZA: ['South Africa', 62.5, 68.5], ID: ['Indonesia', 69.5, 74], MX: ['Mexico', 71, 77.5], IT: ['Italy', 81, 85.5], ES: ['Spain', 81, 86.5], SA: ['Saudi Arabia', 76, 79.5], AE: ['UAE', 79, 81.5], SG: ['Singapore', 81.5, 86], LK: ['Sri Lanka', 73.5, 80], NP: ['Nepal', 68.5, 72.5], KR: ['South Korea', 80.5, 86.5], TR: ['Türkiye', 75.5, 80.5], EG: ['Egypt', 70, 74.5], PH: ['Philippines', 68.5, 75], VN: ['Vietnam', 70.5, 79] };
  C('life-expectancy-calculator', 'Life Expectancy Calculator', 'health/lifestyle', 'Average life expectancy for your country, sex and age, and what remains.', 'Uses national averages at birth, adjusted for the extra years survivors gain with age. A statistical average, not a prediction.',
    [['c', 'Country', 's', function (c) { return LE[c.country.code] ? c.country.code : 'IN'; }, Object.keys(LE).map(function (k) { return [k, LE[k][0]]; })], ['sx', 'Sex', 'g', 1, [[1, 'Male'], [2, 'Female']]], ['age', 'Your age', 'n', 35]],
    function (v) {
      var e0 = LE[v.c][v.sx], death = Math.max(v.age + 1, e0 + 0.0018 * v.age * v.age * (e0 / 76)), rem = death - v.age;
      return { results: [Mx('Average years remaining', rem, 1, 'years'), Rx('Average age at death', death, 1, 'years'), Rx('Life expectancy at birth', e0, 1, 'years'), Rp('Of an average life already lived', v.age / death * 100, 0), Rx('Weeks remaining', rem * 52.18, 0), Rx('Days remaining', rem * 365.25, 0)], note: 'National averages hide huge individual variation — health, income, habits and family history all matter. Edit nothing here as a forecast.' };
    });

  C('biological-age-calculator', 'Biological Age Calculator (Lifestyle Estimate)', 'health/lifestyle', 'An indicative “body age” from lifestyle and basic health numbers.', 'Starts from your real age and adds or subtracts years for weight, heart rate, activity, sleep, smoking, alcohol, diet and stress.',
    [['age', 'Your real age', 'n', 38], ['bmi', 'BMI', 'n', 26], ['hr', 'Resting heart rate (bpm)', 'n', 72], ['ex', 'Exercise days per week', 'n', 3], ['sl', 'Sleep hours per night', 'n', 7], ['sm', 'Smoking', 's', 0, [[0, 'Never'], [1, 'Former'], [2, 'Current']]], ['al', 'Alcoholic drinks per week', 'n', 3], ['fv', 'Fruit and veg servings a day', 'n', 3], ['st', 'Stress level', 's', 0, [[-1, 'Low'], [0, 'Moderate'], [2, 'High']]]],
    function (v) {
      var a = [['Weight (BMI)', v.bmi < 18.5 ? 1 : v.bmi < 25 ? 0 : v.bmi < 30 ? 1.5 : v.bmi < 35 ? 3 : 5], ['Resting heart rate', v.hr < 60 ? -2 : v.hr < 71 ? -1 : v.hr < 81 ? 0 : v.hr < 91 ? 1.5 : 3], ['Exercise', v.ex < 1 ? 2.5 : v.ex < 3 ? 0.5 : v.ex < 5 ? -1.5 : -3], ['Sleep', v.sl < 5 ? 3 : v.sl < 7 ? 1.5 : v.sl <= 9 ? -1 : 1], ['Smoking', [0, 1, 6][v.sm]], ['Alcohol', v.al < 1 ? -0.5 : v.al <= 7 ? 0 : v.al <= 14 ? 1.5 : 3.5], ['Fruit and vegetables', v.fv < 2 ? 1.5 : v.fv < 5 ? 0 : -1], ['Stress', +v.st]];
      var d = a.reduce(function (s, x) { return s + x[1]; }, 0);
      return { results: [Mx('Estimated biological age', v.age + d, 1, 'years'), Rx('Difference from real age', d, 1, 'years'), Tx('Reading', d <= -2 ? 'Younger than your years' : d < 2 ? 'About your age' : 'Older than your years — lifestyle changes can help')], table: { head: ['Factor', 'Years added (+) or removed (−)'], rows: a, fmt: ['', 'num'], title: 'What moved it' }, note: 'Indicative only. Clinical “biological age” uses blood biomarkers or epigenetic tests.' };
    });

  /* ---------- Fitness & sports ---------- */
  C('walking-running-distance-calculator', 'Walking & Running Distance Calculator', 'fitness/running', 'Distance, steps and calories from your speed and time.', 'Distance = speed × time. Calories = MET × weight (kg) × hours.',
    [['a', 'Activity', 's', 5, [[3.5, 'Walk — easy (3.5 km/h)'], [5, 'Walk — brisk (5 km/h)'], [8, 'Jog (8 km/h)'], [10, 'Run (10 km/h)'], [12, 'Run — fast (12 km/h)'], [18, 'Cycle (18 km/h)']]], ['sp', 'Your speed (km/h)', 'n', 5], ['t', 'Time (minutes)', 'n', 45], ['wt', 'Weight (kg)', 'n', 70]],
    function (v) { var h = v.t / 60, d = v.sp * h, met = v.sp < 4 ? 3.3 : v.sp < 6 ? 4.3 : v.sp < 9 ? 8.3 : v.sp < 11 ? 9.8 : v.sp < 14 ? 11.8 : 8, step = v.sp < 7 ? 0.76 : 1.0; return { results: [Mx('Distance', d, 2, 'km'), Rx('In miles', d / 1.609344, 2, 'mi'), Rx('Estimated steps', d * 1000 / step, 0), Rx('Calories burned', met * v.wt * h, 0, 'kcal'), Tx('Pace', Math.floor(60 / v.sp) + ':' + ('0' + Math.round((60 / v.sp % 1) * 60)).slice(-2) + ' min/km')] }; });

  C('fantasy-cricket-points-calculator', 'Fantasy Cricket Points Calculator (T20)', 'fitness/sports-scores', 'Fantasy points for a player from runs, wickets and fielding.', 'Dream11-style T20 scoring: run 1, four +1, six +2, 30/50/100 bonus, wicket 25, catch 8, etc. Rules differ by app — check yours.',
    [['r', 'Runs', 'n', 62], ['f', 'Fours', 'n', 6], ['s', 'Sixes', 'n', 2], ['dk', 'Dismissed for a duck', 'c', 0], ['w', 'Wickets (excluding run-outs)', 'n', 2], ['lb', 'Of which bowled / LBW', 'n', 1], ['mo', 'Maiden overs', 'n', 0], ['ct', 'Catches', 'n', 1], ['st', 'Stumpings', 'n', 0], ['rd', 'Direct run-outs', 'n', 0], ['ri', 'Indirect run-outs', 'n', 0], ['cv', 'Role', 's', 1, [[1, 'Normal'], [1.5, 'Vice-captain (1.5×)'], [2, 'Captain (2×)']]]],
    function (v) {
      var bat = v.r + v.f + 2 * v.s + (v.r >= 100 ? 16 : v.r >= 50 ? 8 : v.r >= 30 ? 4 : 0) - (v.dk && v.r === 0 ? 2 : 0), bowl = 25 * v.w + 8 * v.lb + 12 * v.mo + (v.w >= 5 ? 16 : v.w === 4 ? 8 : v.w === 3 ? 4 : 0), fld = 8 * v.ct + (v.ct >= 3 ? 4 : 0) + 12 * v.st + 12 * v.rd + 6 * v.ri, tot = bat + bowl + fld;
      return { results: [Mx('Fantasy points (with role)', tot * v.cv, 1), Rx('Batting', bat, 0), Rx('Bowling', bowl, 0), Rx('Fielding', fld, 0), Rx('Base total', tot, 0)], chart: { type: 'donut', data: [{ l: 'Batting', v: Math.max(0, bat) }, { l: 'Bowling', v: bowl }, { l: 'Fielding', v: fld }], f: 'num' } };
    });

  C('bowling-score-calculator', 'Bowling Score Calculator', 'fitness/sports-scores', 'Ten-pin bowling score from your rolls, frame by frame.', 'Strike = 10 + next two rolls · Spare = 10 + next roll · Open frame = pins knocked down.',
    [['r', 'Pins knocked down on each roll, in order (use 10 for a strike)', 'ta', '10, 7, 3, 9, 0, 10, 0, 8, 8, 2, 0, 6, 10, 10, 10, 8, 1', '', { rows: 3 }]],
    function (v) {
      var r = String(v.r).split(/[\s,;]+/).map(function (x) { return x === 'X' || x === 'x' ? 10 : x === '/' ? NaN : parseFloat(x); }).filter(function (x) { return isFinite(x); }), i = 0, tot = 0, rows = [], ok = true;
      for (var f = 1; f <= 10 && ok; f++) {
        if (i >= r.length) { break; }
        if (f < 10) {
          if (r[i] === 10) { if (i + 2 >= r.length) { rows.push([f, 'X', '', 'pending']); break; } tot += 10 + r[i + 1] + r[i + 2]; rows.push([f, 'X', '', tot]); i += 1; }
          else { if (i + 1 >= r.length) { rows.push([f, r[i], '', 'pending']); break; } var s = r[i] + r[i + 1]; if (s > 10) return { error: 'Frame ' + f + ' has more than 10 pins.' }; if (s === 10) { if (i + 2 >= r.length) { rows.push([f, r[i], '/', 'pending']); break; } tot += 10 + r[i + 2]; rows.push([f, r[i], '/', tot]); } else { tot += s; rows.push([f, r[i], r[i + 1], tot]); } i += 2; }
        } else { var a = r[i], b = r[i + 1], c = r[i + 2]; if (b === undefined) { rows.push([f, a, '', 'pending']); break; } if (a === 10 || a + b === 10) { if (c === undefined) { rows.push([f, a, b, 'pending']); break; } tot += a + b + c; rows.push([f, a + ' ' + b + ' ' + c, '', tot]); } else { tot += a + b; rows.push([f, a, b, tot]); } }
      }
      return { results: [Mx('Score', tot, 0), Rx('Frames scored', rows.filter(function (x) { return x[3] !== 'pending'; }).length, 0), Rx('Maximum possible (perfect game)', 300, 0)], table: { head: ['Frame', 'Roll 1', 'Roll 2', 'Running score'], rows: rows, fmt: ['int', '', '', 'num'], title: 'Scorecard' } };
    });
})(window.CW);
