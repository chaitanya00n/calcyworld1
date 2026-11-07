/* Calcyworld — Health, fitness & medical */
(function (CW) {
  'use strict';
  var r = function (l, v, f, x) { var o = { l: l, v: v, f: f || 'num' }; if (x) for (var k in x) o[k] = x[k]; return o; };
  var M = function (l, v, f, x) { x = x || {}; x.main = true; return r(l, v, f, x); };
  var UNITS = { k: 'units', l: 'Units', t: 'seg', v: function (c) { return c.imperial ? 'imp' : 'met'; }, o: [['met', 'Metric (kg, cm)'], ['imp', 'US (lb, ft/in)']] };
  var met = function (x) { return x.units === 'met'; }, imp = function (x) { return x.units === 'imp'; };
  var BODY = [UNITS,
    { k: 'kg', l: 'Weight', t: 'number', v: 70, u: 'kg', show: met }, { k: 'cm', l: 'Height', t: 'number', v: 170, u: 'cm', show: met },
    { k: 'lb', l: 'Weight', t: 'number', v: 155, u: 'lb', show: imp }, { k: 'ft', l: 'Height (feet)', t: 'number', v: 5, u: 'ft', show: imp }, { k: 'in', l: 'Height (inches)', t: 'number', v: 7, u: 'in', show: imp, opt: 1 }];
  function body(v) {
    if (v.units === 'imp') return { kg: v.lb * 0.45359237, cm: (v.ft * 12 + (v.in || 0)) * 2.54 };
    return { kg: v.kg, cm: v.cm };
  }
  var AGE = { k: 'age', l: 'Age', t: 'int', v: 30, u: 'years' }, SEX = { k: 'sex', l: 'Sex', t: 'seg', v: 'm', o: [['m', 'Male'], ['f', 'Female']] };
  var ACT = { k: 'act', l: 'Activity level', t: 'select', v: '1.55', o: [['1.2', 'Sedentary (little or no exercise)'], ['1.375', 'Light (1–3 days/week)'], ['1.55', 'Moderate (3–5 days/week)'], ['1.725', 'Very active (6–7 days/week)'], ['1.9', 'Extra active (physical job + training)']] };
  function bmr(kg, cm, age, sex) { return 10 * kg + 6.25 * cm - 5 * age + (sex === 'm' ? 5 : -161); }
  var wt = function (kg, v) { return v.units === 'imp' ? CW.fmt.num(kg / 0.45359237, 1) + ' lb' : CW.fmt.num(kg, 1) + ' kg'; };
  var MED = 'For information only — not a diagnosis. Please talk to a doctor about your results.';

  CW.register([
  {
    id: 'bmi-calculator', title: 'BMI Calculator', sec: 'health', sub: 'Body Metrics & Weight', pop: 1,
    desc: 'Calculate your body mass index (BMI) in metric or US units, see your weight category and your healthy weight range.',
    formula: 'BMI = weight (kg) ÷ height (m)². In US units: BMI = 703 × weight (lb) ÷ height (in)².',
    faq: [['What is a healthy BMI?', 'For most adults, a BMI of 18.5 to 24.9 is considered healthy. 25–29.9 is overweight and 30 or more is obese (WHO categories).'],
      ['Why is there an Asian BMI option?', 'Research shows health risks start at a lower BMI for many Asian populations, so WHO suggests lower cut-offs: 23 for overweight and 27.5 for obesity.'],
      ['Is BMI accurate for athletes?', 'Not always. BMI does not separate muscle from fat, so very muscular people can show a high BMI while being healthy.']],
    inputs: BODY.concat([{ k: 'std', l: 'Scale', t: 'seg', v: function (c) { return ['IN', 'CN', 'JP', 'SG', 'MY', 'PK', 'BD', 'LK', 'NP', 'PH', 'TH', 'VN', 'ID', 'KR', 'HK', 'TW'].indexOf(c.country.code) > -1 ? 'asia' : 'who'; }, o: [['who', 'WHO standard'], ['asia', 'Asian cut-offs']] }]),
    calc: function (v) {
      var b = body(v), m = b.cm / 100, bmi = b.kg / (m * m), a = v.std === 'asia';
      var cuts = a ? [18.5, 23, 27.5] : [18.5, 25, 30], cat = bmi < cuts[0] ? 'Underweight' : bmi < cuts[1] ? 'Healthy weight' : bmi < cuts[2] ? 'Overweight' : 'Obese';
      return { results: [M('Your BMI', bmi, 'fixed', { dp: 1 }), r('Category', cat, 'text', { hl: 1 }), r('Healthy weight for your height', wt(cuts[0] * m * m, v) + ' – ' + wt((cuts[1] - 0.1) * m * m, v), 'text'),
        r('BMI Prime', bmi / (cuts[1] - 0.1), 'fixed', { dp: 2 })],
        badge: { t: cat, tone: cat === 'Healthy weight' ? 'ok' : cat === 'Overweight' || cat === 'Underweight' ? 'mid' : 'warn' },
        html: '<div class="cw-scale" style="--p:' + Math.max(0, Math.min(100, (bmi - 12) / 28 * 100)).toFixed(1) + '%"><span>Under</span><span>Healthy</span><span>Over</span><span>Obese</span><i></i></div>', note: MED };
    }
  },
  {
    id: 'bmr-calculator', title: 'BMR Calculator', sec: 'health', sub: 'Body Metrics & Weight', pop: 1,
    desc: 'Find your basal metabolic rate — the calories your body burns at complete rest — using the Mifflin–St Jeor equation.',
    formula: 'Men: BMR = 10 × kg + 6.25 × cm − 5 × age + 5. Women: BMR = 10 × kg + 6.25 × cm − 5 × age − 161.',
    inputs: BODY.concat([AGE, SEX]),
    calc: function (v) { var b = body(v), x = bmr(b.kg, b.cm, v.age, v.sex);
      return { results: [M('BMR', x, 'int', { u: 'kcal/day' }), r('Sedentary', x * 1.2, 'int', { u: 'kcal' }), r('Light activity', x * 1.375, 'int', { u: 'kcal' }), r('Moderate activity', x * 1.55, 'int', { u: 'kcal' }), r('Very active', x * 1.725, 'int', { u: 'kcal' })] }; }
  },
  {
    id: 'calorie-calculator', title: 'Calorie Calculator', sec: 'health', sub: 'Body Metrics & Weight', pop: 1,
    desc: 'Estimate how many calories you need each day to maintain, lose or gain weight, based on your body and activity level.',
    formula: 'Daily calories (TDEE) = BMR × activity factor. A deficit of about 500 kcal/day leads to roughly 0.5 kg (1 lb) loss per week.',
    faq: [['How many calories should I eat to lose weight?', 'A moderate deficit of 300–500 kcal below your maintenance calories is a sustainable starting point for most adults. Avoid going below about 1,200 kcal (women) or 1,500 kcal (men) without medical advice.']],
    inputs: BODY.concat([AGE, SEX, ACT]),
    calc: function (v) { var b = body(v), t = bmr(b.kg, b.cm, v.age, v.sex) * +v.act, floor = v.sex === 'f' ? 1200 : 1500;
      return { results: [M('Maintain weight', t, 'int', { u: 'kcal/day' }), r('Mild weight loss (0.25 kg/wk)', Math.max(floor, t - 250), 'int', { u: 'kcal' }), r('Weight loss (0.5 kg/wk)', Math.max(floor, t - 500), 'int', { u: 'kcal' }),
        r('Extreme loss (1 kg/wk)', Math.max(floor, t - 1000), 'int', { u: 'kcal' }), r('Mild gain (0.25 kg/wk)', t + 250, 'int', { u: 'kcal' }), r('Weight gain (0.5 kg/wk)', t + 500, 'int', { u: 'kcal' })], note: MED }; }
  },
  { id: 'tdee-calculator', extends: 'calorie-calculator', title: 'TDEE Calculator', sub: 'Body Metrics & Weight',
    desc: 'Calculate your total daily energy expenditure (TDEE) — the calories you burn in a day including activity.' },
  {
    id: 'body-fat-calculator', title: 'Body Fat Calculator', sec: 'health', sub: 'Body Metrics & Weight', pop: 1,
    desc: 'Estimate your body fat percentage with the US Navy tape-measure method, plus fat mass and lean mass.',
    formula: 'US Navy method (cm): men: 495 ÷ (1.0324 − 0.19077 log10(waist − neck) + 0.15456 log10(height)) − 450; women add hip: 495 ÷ (1.29579 − 0.35004 log10(waist + hip − neck) + 0.22100 log10(height)) − 450.',
    inputs: [UNITS, SEX, { k: 'h', l: 'Height', t: 'number', v: function (c) { return c.imperial ? 67 : 170; }, u: function (x) { return (x ? x.units === 'imp' : CW.imperial()) ? 'in' : 'cm'; } },
      { k: 'w', l: 'Weight', t: 'number', v: function (c) { return c.imperial ? 155 : 70; }, u: function (x) { return (x ? x.units === 'imp' : CW.imperial()) ? 'lb' : 'kg'; } },
      { k: 'neck', l: 'Neck', t: 'number', v: function (c) { return c.imperial ? 15 : 38; }, u: function (x) { return (x ? x.units === 'imp' : CW.imperial()) ? 'in' : 'cm'; } },
      { k: 'waist', l: 'Waist (at navel)', t: 'number', v: function (c) { return c.imperial ? 34 : 85; }, u: function (x) { return (x ? x.units === 'imp' : CW.imperial()) ? 'in' : 'cm'; } },
      { k: 'hip', l: 'Hip', t: 'number', v: function (c) { return c.imperial ? 38 : 95; }, u: function (x) { return (x ? x.units === 'imp' : CW.imperial()) ? 'in' : 'cm'; }, show: function (x) { return x.sex === 'f'; } }],
    calc: function (v) {
      var f = v.units === 'imp' ? 2.54 : 1, h = v.h * f, n = v.neck * f, wa = v.waist * f, hp = (v.hip || 0) * f, kg = v.units === 'imp' ? v.w * 0.45359237 : v.w;
      var bf = v.sex === 'm' ? 495 / (1.0324 - 0.19077 * Math.log10(wa - n) + 0.15456 * Math.log10(h)) - 450 : 495 / (1.29579 - 0.35004 * Math.log10(wa + hp - n) + 0.221 * Math.log10(h)) - 450;
      if (!isFinite(bf) || bf <= 0 || bf > 75) return { error: 'Please check the measurements — waist must be larger than neck.' };
      var c = v.sex === 'm' ? (bf < 6 ? 'Essential fat' : bf < 14 ? 'Athletes' : bf < 18 ? 'Fitness' : bf < 25 ? 'Average' : 'Obese') : (bf < 14 ? 'Essential fat' : bf < 21 ? 'Athletes' : bf < 25 ? 'Fitness' : bf < 32 ? 'Average' : 'Obese');
      return { results: [M('Body fat', bf, 'pct', { dp: 1 }), r('Category', c, 'text', { hl: 1 }), r('Fat mass', wt(kg * bf / 100, v), 'text'), r('Lean mass', wt(kg * (1 - bf / 100), v), 'text')], note: MED };
    }
  },
  {
    id: 'ideal-weight-calculator', title: 'Ideal Weight Calculator', sec: 'health', sub: 'Body Metrics & Weight', pop: 1,
    desc: 'See your ideal body weight by four well-known formulas (Robinson, Miller, Devine, Hamwi) and your healthy BMI range.',
    formula: 'Devine: men 50 kg + 2.3 kg per inch over 5 ft; women 45.5 kg + 2.3 kg per inch over 5 ft. Other formulas use different constants.',
    inputs: [UNITS, SEX, { k: 'cm', l: 'Height', t: 'number', v: 170, u: 'cm', show: met }, { k: 'ft', l: 'Height (feet)', t: 'number', v: 5, u: 'ft', show: imp }, { k: 'in', l: 'Height (inches)', t: 'number', v: 7, u: 'in', show: imp, opt: 1 }],
    calc: function (v) {
      var cm = v.units === 'imp' ? (v.ft * 12 + (v.in || 0)) * 2.54 : v.cm, inch = cm / 2.54 - 60, m = v.sex === 'm';
      var f = { Robinson: m ? 52 + 1.9 * inch : 49 + 1.7 * inch, Miller: m ? 56.2 + 1.41 * inch : 53.1 + 1.36 * inch, Devine: m ? 50 + 2.3 * inch : 45.5 + 2.3 * inch, Hamwi: m ? 48 + 2.7 * inch : 45.5 + 2.2 * inch };
      var h = cm / 100;
      return { results: [M('Ideal weight (Devine)', wt(f.Devine, v), 'text'), r('Robinson', wt(f.Robinson, v), 'text'), r('Miller', wt(f.Miller, v), 'text'), r('Hamwi', wt(f.Hamwi, v), 'text'),
        r('Healthy BMI range', wt(18.5 * h * h, v) + ' – ' + wt(24.9 * h * h, v), 'text')] };
    }
  },
  {
    id: 'macro-calculator', title: 'Macro Calculator', sec: 'health', sub: 'Nutrition & Diet', pop: 1,
    desc: 'Split your daily calories into protein, carbs and fat for your goal — maintenance, fat loss or muscle gain.',
    formula: 'Protein and carbs have 4 kcal per gram; fat has 9 kcal per gram. Grams = calories × share ÷ kcal per gram.',
    inputs: BODY.concat([AGE, SEX, ACT, { k: 'goal', l: 'Goal', t: 'seg', v: 'm', o: [['l', 'Lose fat'], ['m', 'Maintain'], ['g', 'Build muscle']] },
      { k: 'split', l: 'Diet style', t: 'select', v: 'bal', o: [['bal', 'Balanced (30/40/30)'], ['lc', 'Lower carb (40/25/35)'], ['hc', 'Higher carb (25/55/20)'], ['keto', 'Keto (25/5/70)']] }]),
    calc: function (v) {
      var b = body(v), t = bmr(b.kg, b.cm, v.age, v.sex) * +v.act; t += v.goal === 'l' ? -500 : v.goal === 'g' ? 300 : 0;
      var s = { bal: [30, 40, 30], lc: [40, 25, 35], hc: [25, 55, 20], keto: [25, 5, 70] }[v.split], p = t * s[0] / 400, c = t * s[1] / 400, f = t * s[2] / 900;
      return { results: [M('Daily calories', t, 'int', { u: 'kcal' }), r('Protein', p, 'int', { u: 'g' }), r('Carbohydrates', c, 'int', { u: 'g' }), r('Fat', f, 'int', { u: 'g' })],
        chart: { type: 'donut', f: 'int', data: [{ l: 'Protein (kcal)', v: p * 4 }, { l: 'Carbs (kcal)', v: c * 4 }, { l: 'Fat (kcal)', v: f * 9 }] } };
    }
  },
  {
    id: 'protein-calculator', title: 'Protein Intake Calculator', sec: 'health', sub: 'Nutrition & Diet', pop: 1,
    desc: 'Find how much protein you need each day for your body weight and activity or training goal.',
    formula: 'Daily protein = body weight (kg) × grams per kg (0.8 g for general health, 1.2–2.0 g for active people and muscle gain).',
    inputs: [UNITS, { k: 'kg', l: 'Weight', t: 'number', v: 70, u: 'kg', show: met }, { k: 'lb', l: 'Weight', t: 'number', v: 155, u: 'lb', show: imp },
      { k: 'g', l: 'Goal', t: 'select', v: '1.2', o: [['0.8', 'General health (0.8 g/kg)'], ['1.2', 'Active lifestyle (1.2 g/kg)'], ['1.6', 'Muscle gain (1.6 g/kg)'], ['2.0', 'Fat loss, keep muscle (2.0 g/kg)']] }],
    calc: function (v) { var kg = v.units === 'imp' ? v.lb * 0.45359237 : v.kg, p = kg * +v.g;
      return { results: [M('Protein per day', p, 'int', { u: 'g' }), r('Per meal (3 meals)', p / 3, 'int', { u: 'g' }), r('Per meal (4 meals)', p / 4, 'int', { u: 'g' }), r('Calories from protein', p * 4, 'int', { u: 'kcal' })] }; }
  },
  {
    id: 'water-intake-calculator', title: 'Water Intake Calculator', sec: 'health', sub: 'Nutrition & Diet',
    desc: 'Estimate how much water to drink each day based on your weight, exercise and climate.',
    formula: 'Base = 35 ml per kg of body weight, plus about 350 ml for every 30 minutes of exercise, plus extra in hot weather.',
    inputs: [UNITS, { k: 'kg', l: 'Weight', t: 'number', v: 70, u: 'kg', show: met }, { k: 'lb', l: 'Weight', t: 'number', v: 155, u: 'lb', show: imp },
      { k: 'ex', l: 'Exercise per day', t: 'int', v: 30, u: 'min' }, { k: 'hot', l: 'Hot or humid climate', t: 'check', v: false }],
    calc: function (v) { var kg = v.units === 'imp' ? v.lb * 0.45359237 : v.kg, ml = kg * 35 + v.ex / 30 * 350 + (v.hot ? 500 : 0);
      return { results: [M('Water per day', ml / 1000, 'fixed', { dp: 1, u: 'litres' }), r('In US fluid ounces', ml / 29.5735, 'int', { u: 'fl oz' }), r('Glasses (250 ml)', ml / 250, 'int')] }; }
  },
  {
    id: 'due-date-calculator', title: 'Pregnancy Due Date Calculator', sec: 'health', sub: "Pregnancy, Fertility & Women's Health", pop: 1,
    desc: 'Find your baby’s estimated due date, how many weeks pregnant you are and your current trimester.',
    formula: 'Due date = first day of last period + 280 days, adjusted by (cycle length − 28) days (Naegele’s rule).',
    inputs: [{ k: 'lmp', l: 'First day of your last period', t: 'date', v: -60 }, { k: 'cyc', l: 'Average cycle length', t: 'int', v: 28, u: 'days' }],
    calc: function (v) {
      var adj = v.cyc - 28, due = new Date(v.lmp); due.setDate(due.getDate() + 280 + adj);
      var now = new Date(); now.setHours(0, 0, 0, 0); var days = Math.floor((now - v.lmp) / 864e5) - adj;
      if (days < 0) return { error: 'The date of your last period cannot be in the future.' };
      var w = Math.floor(days / 7), d = days % 7, tri = w < 13 ? 'First trimester' : w < 27 ? 'Second trimester' : 'Third trimester';
      var conc = new Date(v.lmp); conc.setDate(conc.getDate() + 14 + adj);
      return { results: [M('Estimated due date', due, 'date'), r('You are', w + ' weeks ' + d + ' days pregnant', 'text', { hl: 1 }), r('Trimester', tri, 'text'), r('Likely conception date', conc, 'date'), r('Days to go', Math.max(0, Math.round((due - now) / 864e5)), 'int')],
        note: 'Only about 1 in 20 babies arrive exactly on the due date. Your doctor may adjust it after an early ultrasound scan.' };
    }
  },
  {
    id: 'ovulation-calculator', title: 'Ovulation Calculator', sec: 'health', sub: "Pregnancy, Fertility & Women's Health", pop: 1,
    desc: 'Predict your ovulation day and most fertile days for the next three cycles.',
    formula: 'Ovulation ≈ next period start − 14 days. The fertile window is the 5 days before ovulation plus ovulation day.',
    inputs: [{ k: 'lmp', l: 'First day of your last period', t: 'date', v: -10 }, { k: 'cyc', l: 'Average cycle length', t: 'int', v: 28, u: 'days' }],
    calc: function (v) {
      var rows = [], first;
      for (var i = 0; i < 3; i++) {
        var start = new Date(v.lmp); start.setDate(start.getDate() + v.cyc * i);
        var ov = new Date(start); ov.setDate(ov.getDate() + v.cyc - 14);
        var fs = new Date(ov); fs.setDate(fs.getDate() - 5);
        var nx = new Date(start); nx.setDate(nx.getDate() + v.cyc);
        if (!first) first = { ov: ov, fs: fs, nx: nx };
        rows.push([fs.toLocaleDateString(CW.locale(), { month: 'short', day: 'numeric' }) + ' – ' + ov.toLocaleDateString(CW.locale(), { month: 'short', day: 'numeric' }), ov.toLocaleDateString(CW.locale(), { weekday: 'short', month: 'short', day: 'numeric' }), nx.toLocaleDateString(CW.locale(), { month: 'short', day: 'numeric' })]);
      }
      return { results: [M('Estimated ovulation', first.ov, 'date'), r('Fertile window starts', first.fs, 'date'), r('Next period', first.nx, 'date')],
        table: { open: true, title: 'Next 3 cycles', head: ['Fertile window', 'Ovulation', 'Next period'], fmt: ['text', 'text', 'text'], rows: rows }, note: 'Cycles vary — ovulation tests or tracking temperature give a more precise picture. ' + MED };
    }
  },
  {
    id: 'period-calculator', title: 'Period Calculator', sec: 'health', sub: "Pregnancy, Fertility & Women's Health", pop: 1,
    desc: 'Predict your next six periods from the date of your last period and cycle length.',
    formula: 'Next period = last period start + cycle length (repeated for each cycle).',
    inputs: [{ k: 'lmp', l: 'First day of your last period', t: 'date', v: -5 }, { k: 'cyc', l: 'Cycle length', t: 'int', v: 28, u: 'days' }, { k: 'len', l: 'Period length', t: 'int', v: 5, u: 'days' }],
    calc: function (v) { var rows = [], f = { month: 'short', day: 'numeric', year: 'numeric' }, nx;
      for (var i = 1; i <= 6; i++) { var s = new Date(v.lmp); s.setDate(s.getDate() + v.cyc * i); var e = new Date(s); e.setDate(e.getDate() + v.len - 1); if (i === 1) nx = s; rows.push([i, s.toLocaleDateString(CW.locale(), f), e.toLocaleDateString(CW.locale(), f)]); }
      return { results: [M('Next period starts', nx, 'date')], table: { open: true, title: 'Upcoming periods', head: ['#', 'Starts', 'Ends'], fmt: ['int', 'text', 'text'], rows: rows } }; }
  },
  {
    id: 'heart-rate-zones-calculator', title: 'Heart Rate Zone Calculator', sec: 'health', sub: 'Sports & Fitness Training',
    desc: 'Calculate your maximum heart rate and five training zones using the Karvonen (heart-rate reserve) method.',
    formula: 'Max HR = 208 − 0.7 × age (Tanaka). Zone target = resting HR + (max HR − resting HR) × intensity.',
    inputs: [AGE, { k: 'rest', l: 'Resting heart rate', t: 'int', v: 65, u: 'bpm' }],
    calc: function (v) { var mx = 208 - 0.7 * v.age, rr = mx - v.rest, z = [[50, 60, 'Zone 1 — Recovery'], [60, 70, 'Zone 2 — Endurance'], [70, 80, 'Zone 3 — Tempo'], [80, 90, 'Zone 4 — Threshold'], [90, 100, 'Zone 5 — Max effort']];
      return { results: [M('Maximum heart rate', mx, 'int', { u: 'bpm' }), r('Heart rate reserve', rr, 'int', { u: 'bpm' })],
        table: { open: true, title: 'Training zones', head: ['Zone', 'Intensity', 'Heart rate (bpm)'], fmt: ['text', 'text', 'text'], rows: z.map(function (x) { return [x[2], x[0] + '–' + x[1] + '%', Math.round(v.rest + rr * x[0] / 100) + ' – ' + Math.round(v.rest + rr * x[1] / 100)]; }) } }; }
  },
  {
    id: 'pace-calculator', title: 'Pace Calculator', sec: 'health', sub: 'Sports & Fitness Training', pop: 1,
    desc: 'Work out running or walking pace, speed and finish time for any distance — including 5K, 10K, half and full marathon.',
    formula: 'Pace = time ÷ distance. Speed = distance ÷ time.',
    inputs: [{ k: 'd', l: 'Distance', t: 'select', v: '10', o: [['5', '5K'], ['10', '10K'], ['21.0975', 'Half marathon'], ['42.195', 'Marathon'], ['custom', 'Custom…']] },
      { k: 'cd', l: 'Custom distance', t: 'number', v: 8, u: 'km', show: function (x) { return x.d === 'custom'; } },
      { k: 'h', l: 'Hours', t: 'int', v: 0, opt: 1 }, { k: 'm', l: 'Minutes', t: 'int', v: 55 }, { k: 's', l: 'Seconds', t: 'int', v: 0, opt: 1 }],
    calc: function (v) { var km = v.d === 'custom' ? v.cd : +v.d, sec = v.h * 3600 + v.m * 60 + v.s, p = sec / km, pm = sec / (km / 1.609344);
      var fmt = function (x) { x = Math.round(x); var h = Math.floor(x / 3600), m = Math.floor(x % 3600 / 60), s = x % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0'); };
      var preds = [['5K', 5], ['10K', 10], ['Half marathon', 21.0975], ['Marathon', 42.195]].map(function (x) { return [x[0], fmt(sec * Math.pow(x[1] / km, 1.06))]; });
      return { results: [M('Pace per km', fmt(p), 'text', { u: 'min/km' }), r('Pace per mile', fmt(pm), 'text', { u: 'min/mi' }), r('Speed', km / (sec / 3600), 'fixed', { dp: 2, u: 'km/h' }), r('Speed', km / 1.609344 / (sec / 3600), 'fixed', { dp: 2, u: 'mph' })],
        table: { title: 'Predicted race times (Riegel formula)', head: ['Race', 'Time'], fmt: ['text', 'text'], rows: preds } }; }
  },
  {
    id: 'one-rep-max-calculator', title: 'One Rep Max (1RM) Calculator', sec: 'health', sub: 'Sports & Fitness Training',
    desc: 'Estimate your one-rep max from a weight you can lift for several reps, with a percentage chart for training.',
    formula: 'Epley: 1RM = weight × (1 + reps ÷ 30). Brzycki: 1RM = weight × 36 ÷ (37 − reps).',
    inputs: [{ k: 'w', l: 'Weight lifted', t: 'number', v: 80, u: function () { return CW.imperial() ? 'lb' : 'kg'; } }, { k: 'r', l: 'Reps completed', t: 'int', v: 6 }],
    calc: function (v) { if (v.r < 1 || v.r > 15) return { error: 'Use a set of 1–15 reps for a reliable estimate.' };
      var e = v.r === 1 ? v.w : v.w * (1 + v.r / 30), b = v.w * 36 / (37 - v.r), avg = (e + b) / 2;
      return { results: [M('Estimated 1RM', avg, 'fixed', { dp: 1 }), r('Epley', e, 'fixed', { dp: 1 }), r('Brzycki', b, 'fixed', { dp: 1 })],
        table: { open: true, title: 'Training percentages', head: ['% of 1RM', 'Weight', 'Approx. reps'], fmt: ['text', 'fixed', 'text'], rows: [[100, 1], [95, 2], [90, 4], [85, 6], [80, 8], [75, 10], [70, 12], [65, 15], [60, 20]].map(function (x) { return [x[0] + '%', avg * x[0] / 100, String(x[1])]; }) } }; }
  },
  {
    id: 'calories-burned-calculator', title: 'Calories Burned Calculator', sec: 'health', sub: 'Sports & Fitness Training', pop: 1,
    desc: 'Estimate calories burned during walking, running, cycling, swimming, yoga and other activities.',
    formula: 'Calories = MET × body weight (kg) × duration (hours). MET values come from the Compendium of Physical Activities.',
    inputs: [{ k: 'a', l: 'Activity', t: 'select', v: '9.8', o: [['3.5', 'Walking (5 km/h)'], ['5', 'Brisk walking (6.4 km/h)'], ['8.3', 'Running (8 km/h)'], ['9.8', 'Running (9.7 km/h)'], ['11.5', 'Running (12 km/h)'],
      ['7.5', 'Cycling (moderate)'], ['10', 'Cycling (fast)'], ['5.8', 'Swimming (moderate)'], ['9.8', 'Swimming laps (fast)'], ['3', 'Yoga (hatha)'], ['6', 'Weight training (vigorous)'], ['7.3', 'Aerobics'],
      ['12.3', 'Skipping rope'], ['8', 'Football / soccer'], ['6.5', 'Badminton'], ['5', 'Cricket (batting/bowling)'], ['4.8', 'Dancing'], ['7', 'Hiking'], ['2.5', 'Household chores']] },
      UNITS, { k: 'kg', l: 'Weight', t: 'number', v: 70, u: 'kg', show: met }, { k: 'lb', l: 'Weight', t: 'number', v: 155, u: 'lb', show: imp }, { k: 'min', l: 'Duration', t: 'int', v: 30, u: 'min' }],
    calc: function (v) { var kg = v.units === 'imp' ? v.lb * 0.45359237 : v.kg, c = +v.a * kg * v.min / 60;
      return { results: [M('Calories burned', c, 'int', { u: 'kcal' }), r('Per hour', c / v.min * 60, 'int', { u: 'kcal' })] }; }
  },
  {
    id: 'sleep-calculator', title: 'Sleep Calculator', sec: 'health', sub: 'Medical & Clinical',
    desc: 'Find the best times to go to bed or wake up so you finish full 90-minute sleep cycles and wake up refreshed.',
    formula: 'Bedtime = wake time − (cycles × 90 minutes) − time to fall asleep (about 15 minutes).',
    inputs: [{ k: 'mode', l: 'I want to', t: 'seg', v: 'wake', o: [['wake', 'Wake up at'], ['bed', 'Go to bed at']] }, { k: 't', l: 'Time', t: 'time', v: '07:00' }, { k: 'fa', l: 'Time to fall asleep', t: 'int', v: 15, u: 'min' }],
    calc: function (v) {
      var p = (v.t || '07:00').split(':'), base = (+p[0]) * 60 + (+p[1]), out = [];
      var f = function (m) { m = ((m % 1440) + 1440) % 1440; var d = new Date(2000, 0, 1, Math.floor(m / 60), m % 60); return d.toLocaleTimeString(CW.locale(), { hour: 'numeric', minute: '2-digit' }); };
      [6, 5, 4, 3].forEach(function (c) { out.push([f(v.mode === 'wake' ? base - c * 90 - v.fa : base + c * 90 + v.fa), c + ' cycles', (c * 1.5) + ' h']); });
      return { results: [M(v.mode === 'wake' ? 'Go to bed at' : 'Wake up at', out[0][0] + '  or  ' + out[1][0], 'text')], table: { open: true, title: 'All good times', head: ['Time', 'Sleep cycles', 'Sleep'], fmt: ['text', 'text', 'text'], rows: out }, note: 'Most adults need 7–9 hours (5–6 cycles).' };
    }
  },
  {
    id: 'egfr-calculator', title: 'eGFR Calculator (CKD-EPI 2021)', sec: 'health', sub: 'Medical & Clinical',
    desc: 'Estimate glomerular filtration rate (kidney function) from serum creatinine, age and sex using the race-free CKD-EPI 2021 equation.',
    formula: 'eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^−1.200 × 0.9938^age × 1.012 (if female). κ = 0.7 (F) / 0.9 (M); α = −0.241 (F) / −0.302 (M).',
    inputs: [{ k: 'scr', l: 'Serum creatinine', t: 'number', v: 1.0 }, { k: 'u', l: 'Creatinine unit', t: 'seg', v: 'mg', o: [['mg', 'mg/dL'], ['um', 'µmol/L']] }, AGE, SEX],
    calc: function (v) { var s = v.u === 'um' ? v.scr / 88.4 : v.scr, f = v.sex === 'f', k = f ? 0.7 : 0.9, a = f ? -0.241 : -0.302;
      var g = 142 * Math.pow(Math.min(s / k, 1), a) * Math.pow(Math.max(s / k, 1), -1.2) * Math.pow(0.9938, v.age) * (f ? 1.012 : 1);
      var st = g >= 90 ? 'G1 — Normal or high' : g >= 60 ? 'G2 — Mildly decreased' : g >= 45 ? 'G3a — Mild to moderate decrease' : g >= 30 ? 'G3b — Moderate to severe decrease' : g >= 15 ? 'G4 — Severely decreased' : 'G5 — Kidney failure';
      return { results: [M('eGFR', g, 'int', { u: 'mL/min/1.73m²' }), r('Stage (KDIGO)', st, 'text', { hl: 1 })], note: 'For adults 18+. ' + MED }; }
  },
  {
    id: 'map-calculator', title: 'Mean Arterial Pressure (MAP) Calculator', sec: 'health', sub: 'Medical & Clinical',
    desc: 'Calculate mean arterial pressure from systolic and diastolic blood pressure, and see the blood pressure category.',
    formula: 'MAP = diastolic + (systolic − diastolic) ÷ 3.',
    inputs: [{ k: 's', l: 'Systolic (top number)', t: 'int', v: 120, u: 'mmHg' }, { k: 'd', l: 'Diastolic (bottom number)', t: 'int', v: 80, u: 'mmHg' }],
    calc: function (v) { var map = v.d + (v.s - v.d) / 3, c = v.s >= 180 || v.d >= 120 ? 'Hypertensive crisis — seek care now' : v.s >= 140 || v.d >= 90 ? 'High blood pressure (stage 2)' : v.s >= 130 || v.d >= 80 ? 'High blood pressure (stage 1)' : v.s >= 120 ? 'Elevated' : 'Normal';
      return { results: [M('Mean arterial pressure', map, 'int', { u: 'mmHg' }), r('Pulse pressure', v.s - v.d, 'int', { u: 'mmHg' }), r('Category (AHA)', c, 'text', { hl: 1 })], badge: { t: c, tone: c === 'Normal' ? 'ok' : c === 'Elevated' ? 'mid' : 'warn' }, note: MED }; }
  },
  {
    id: 'a1c-calculator', title: 'A1C to Average Blood Sugar Calculator', sec: 'health', sub: 'Medical & Clinical',
    desc: 'Convert an HbA1c result into estimated average glucose (eAG) in mg/dL and mmol/L.',
    formula: 'eAG (mg/dL) = 28.7 × A1C − 46.7. mmol/L = mg/dL ÷ 18.',
    inputs: [{ k: 'a', l: 'HbA1c', t: 'percent', v: 6.0 }],
    calc: function (v) { var mg = 28.7 * v.a - 46.7, c = v.a < 5.7 ? 'Normal' : v.a < 6.5 ? 'Prediabetes range' : 'Diabetes range';
      return { results: [M('Average glucose', mg, 'int', { u: 'mg/dL' }), r('In mmol/L', mg / 18, 'fixed', { dp: 1, u: 'mmol/L' }), r('Range', c, 'text', { hl: 1 })], note: MED }; }
  },
  {
    id: 'waist-to-height-ratio-calculator', title: 'Waist-to-Height Ratio Calculator', sec: 'health', sub: 'Body Metrics & Weight',
    desc: 'Check your waist-to-height ratio — a simple measure of central body fat and health risk.',
    formula: 'Ratio = waist circumference ÷ height (same units). Keep your waist to less than half your height.',
    inputs: [{ k: 'w', l: 'Waist', t: 'number', v: 80 }, { k: 'h', l: 'Height (same unit)', t: 'number', v: 170 }],
    calc: function (v) { var x = v.w / v.h; return { results: [M('Waist-to-height ratio', x, 'fixed', { dp: 2 })], badge: x < 0.4 ? { t: 'Below 0.4 — may be underweight', tone: 'mid' } : x < 0.5 ? { t: 'Healthy (under 0.5)', tone: 'ok' } : x < 0.6 ? { t: 'Increased risk', tone: 'mid' } : { t: 'High risk', tone: 'warn' } }; }
  }
  ]);
})(window.CW);
