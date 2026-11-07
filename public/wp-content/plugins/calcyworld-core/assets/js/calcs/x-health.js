/* Calcyworld — health & fitness calculators (formula DSL) */
(function (CW) {
  'use strict';
  var F = CW.F;
  /* shared unit-aware inputs: weight (kg/lb) and height (cm or ft+in) */
  var imp = function (c) { return c.imperial ? 2 : 1; };
  var WI = [['wu', 'Weight unit', 'g', imp, [[1, 'kg'], [2, 'lb']]], ['wt', 'Weight', 'n', function (c) { return c.imperial ? 154 : 70; }]];
  var HI = [['hu', 'Height unit', 'g', imp, [[1, 'cm'], [2, 'ft + in']]], ['hcm', 'Height', 'n', 170, 'cm', { show: 'hu==1' }], ['hft', 'Feet', 'i', 5, 'ft', { show: 'hu==2' }], ['hin', 'Inches', 'n', 7, 'in', { show: 'hu==2', opt: 1 }]];
  var SX = ['sx', 'Sex', 'g', 1, [[1, 'Male'], [2, 'Female']]];
  var AGE = ['age', 'Age', 'i', 30];
  var KG = 'if(wu==1,wt,wt*0.45359237)', CMH = 'if(hu==1,hcm,(hft*12+hin)*2.54)';
  var hms = function (s) { s = Math.round(s); var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + (m < 10 ? '0' : '') + m : m) + ':' + (x < 10 ? '0' : '') + x; };
  var mmss = function (s) { s = Math.round(s); var m = Math.floor(s / 60), x = s % 60; return m + ':' + (x < 10 ? '0' : '') + x; };
  var G = function () { return Array.prototype.slice.call(arguments); };

  /* ---------------- Body metrics ---------------- */
  F('body-surface-area-calculator', 'Body Surface Area (BSA) Calculator', 'health/body', 'Body surface area by the Mosteller, DuBois and Haycock formulas.', 'Mosteller: BSA = √(height cm × weight kg ÷ 3600).',
    WI.concat(HI),
    [['BSA (Mosteller)', 'sqrt(' + CMH + '*' + KG + '/3600)', 'f', 'm²', { dp: 2 }], ['BSA (DuBois)', '0.007184*(' + KG + ')^0.425*(' + CMH + ')^0.725', 'f', 'm²', { dp: 2 }], ['BSA (Haycock)', '0.024265*(' + KG + ')^0.5378*(' + CMH + ')^0.3964', 'f', 'm²', { dp: 2 }]]);

  F('lean-body-mass-calculator', 'Lean Body Mass Calculator', 'health/body', 'Your lean body mass and body fat using the Boer formula.', 'Men: 0.407W + 0.267H − 19.2 · Women: 0.252W + 0.473H − 48.3 (W kg, H cm).',
    [SX].concat(WI, HI),
    [['Lean body mass', 'if(sx==1,0.407*(' + KG + ')+0.267*(' + CMH + ')-19.2,0.252*(' + KG + ')+0.473*(' + CMH + ')-48.3)', 'f', 'kg', { dp: 1 }], ['Body fat mass', KG + '-o1', 'f', 'kg', { dp: 1 }], ['Body fat estimate', '(1-o1/(' + KG + '))*100', 'p', '', { dp: 1 }]],
    { donut: [['Lean mass', 'o1'], ['Fat mass', 'o2']], donutF: 'n' });

  F('waist-to-hip-ratio-calculator', 'Waist-to-Hip Ratio Calculator', 'health/body', 'Your waist-to-hip ratio and the related health risk band.', 'WHR = waist ÷ hip (same unit). WHO risk: men ≥ 0.90, women ≥ 0.85.',
    [SX, ['w', 'Waist circumference', 'n', 85, 'cm'], ['h', 'Hip circumference', 'n', 98, 'cm']],
    [['Waist-to-hip ratio', 'w/h', 'f', '', { dp: 2 }], ['Health risk', 'if(sx==1,if(w/h>=1,2,if(w/h>=0.9,1,0)),if(w/h>=0.85,2,if(w/h>=0.8,1,0)))', 'b', '', { bands: [[0.5, 'Low risk'], [1.5, 'Moderate risk'], [Infinity, 'High risk']] }]]);

  F('body-adiposity-index-calculator', 'Body Adiposity Index (BAI) Calculator', 'health/body', 'Estimate body fat percentage from hip circumference and height — no scale needed.', 'BAI = hip (cm) ÷ height (m)^1.5 − 18.',
    [['hip', 'Hip circumference', 'n', 98, 'cm']].concat(HI),
    [['BAI (body fat %)', 'hip/((' + CMH + ')/100)^1.5-18', 'p', '', { dp: 1 }]]);

  F('ponderal-index-calculator', 'Ponderal Index Calculator', 'health/body', 'The ponderal index — a height-cubed alternative to BMI.', 'PI = weight (kg) ÷ height (m)³.',
    WI.concat(HI),
    [['Ponderal index', KG + '/((' + CMH + ')/100)^3', 'f', 'kg/m³', { dp: 1 }], ['BMI', KG + '/((' + CMH + ')/100)^2', 'f', '', { dp: 1 }]]);

  F('bmi-prime-calculator', 'BMI Prime Calculator', 'health/body', 'BMI Prime — your BMI as a fraction of the upper healthy limit (25).', 'BMI Prime = BMI ÷ 25.',
    WI.concat(HI),
    [['BMI Prime', KG + '/((' + CMH + ')/100)^2/25', 'f', '', { dp: 2 }], ['BMI', KG + '/((' + CMH + ')/100)^2', 'f', '', { dp: 1 }], ['Category', 'o1', 'b', '', { bands: [[0.74, 'Underweight'], [1, 'Healthy'], [1.2, 'Overweight'], [Infinity, 'Obese']] }]]);

  F('adjusted-body-weight-calculator', 'Adjusted Body Weight Calculator', 'health/body', 'Adjusted body weight for dosing and nutrition planning in people above their ideal weight.', 'AdjBW = IBW + 0.4 × (actual − IBW). IBW (Devine): men 50 + 2.3 kg per inch over 5 ft; women 45.5 + 2.3.',
    [SX].concat(WI, HI),
    [['Ideal body weight', 'if(sx==1,50,45.5)+2.3*max(0,(' + CMH + ')/2.54-60)', 'f', 'kg', { dp: 1, k: 'ibw' }], ['Adjusted body weight', 'ibw+0.4*((' + KG + ')-ibw)', 'f', 'kg', { dp: 1, main: true }], ['Actual weight', KG, 'f', 'kg', { dp: 1 }]]);

  F('weight-loss-calculator', 'Weight Loss Calculator', 'health/body', 'How long it takes to reach your goal weight at a daily calorie deficit.', 'Weeks = (weight to lose × 7,700 kcal) ÷ (daily deficit × 7).',
    [['wu', 'Weight unit', 'g', imp, [[1, 'kg'], [2, 'lb']]], ['cur', 'Current weight', 'n', function (c) { return c.imperial ? 180 : 82; }], ['goal', 'Goal weight', 'n', function (c) { return c.imperial ? 160 : 72; }], ['def', 'Daily calorie deficit', 'n', 500, 'kcal']],
    [['Weeks to goal', 'max(0,(cur-goal)*if(wu==1,1,0.45359237)*7700/(def*7))', 'f', 'weeks', { dp: 1 }], ['Goal date', function (v) { return Date.now() + v.o1 * 7 * 86400000; }, 'd'], ['Weekly loss', 'def*7/7700*if(wu==1,1,2.20462)', 'f', '', { dp: 2 }], ['Total to lose', 'max(0,cur-goal)', 'n']],
    { note: 'About 7,700 kcal equals one kilogram of body fat. A deficit of 500 kcal a day is a steady, sustainable pace.' });

  F('calorie-deficit-calculator', 'Calorie Deficit Calculator', 'health/nutrition', 'Daily calories to eat for a target weekly weight loss.', 'Daily calories = maintenance calories − (weekly loss kg × 7,700 ÷ 7).',
    [['tdee', 'Maintenance calories (TDEE)', 'n', 2400, 'kcal'], ['loss', 'Target loss per week', 'n', 0.5, 'kg']],
    [['Daily calories', 'tdee-loss*7700/7', 'n', 'kcal', { dp: 0 }], ['Daily deficit', 'loss*7700/7', 'n', 'kcal', { dp: 0 }], ['Deficit as % of TDEE', 'o2/tdee*100', 'p', '', { dp: 0 }], ['Safe?', 'o2/tdee*100', 'b', '', { bands: [[25, 'Sustainable'], [Infinity, 'Aggressive — consider a smaller deficit']] }]]);

  F('carb-calculator', 'Carb Calculator', 'health/nutrition', 'Daily carbohydrate grams for your calorie goal.', 'Carbs (g) = calories × carb share ÷ 4.',
    [['cal', 'Daily calories', 'n', 2000, 'kcal'], ['pct', 'Carb share', 's', 50, [[10, 'Keto · 10%'], [25, 'Low-carb · 25%'], [40, 'Moderate · 40%'], [50, 'Balanced · 50%'], [60, 'High-carb · 60%']]]],
    [['Carbs per day', 'cal*pct/100/4', 'n', 'g', { dp: 0 }], ['Per meal (3 meals)', 'o1/3', 'n', 'g', { dp: 0 }], ['Calories from carbs', 'cal*pct/100', 'n', 'kcal', { dp: 0 }]]);

  F('fat-intake-calculator', 'Fat Intake Calculator', 'health/nutrition', 'Daily fat grams and saturated-fat limit for your calories.', 'Fat (g) = calories × fat share ÷ 9. Dietary guidelines: 20–35% of calories; saturated fat under 10%.',
    [['cal', 'Daily calories', 'n', 2000, 'kcal'], ['pct', 'Fat share', 'p', 30]],
    [['Fat per day', 'cal*pct/100/9', 'n', 'g', { dp: 0 }], ['Saturated fat limit (10%)', 'cal*0.1/9', 'n', 'g', { dp: 0 }], ['Range (20–35%)', 'cal*0.2/9', 'n', 'g', { dp: 0, sub: 'to about 78 g at 2,000 kcal' }]]);

  F('fiber-intake-calculator', 'Fiber Intake Calculator', 'health/nutrition', 'Daily fibre target for your calories.', 'Target = 14 g per 1,000 kcal (dietary guideline).',
    [['cal', 'Daily calories', 'n', 2000, 'kcal']],
    [['Fibre per day', 'cal/1000*14', 'n', 'g', { dp: 0 }], ['Soluble (about ⅓)', 'o1/3', 'n', 'g', { dp: 0 }]]);

  F('keto-macro-calculator', 'Keto Macro Calculator', 'health/nutrition', 'Fat, protein and net carb grams for a ketogenic diet.', 'Typical keto split: 70% fat · 25% protein · 5% net carbs.',
    [['cal', 'Daily calories', 'n', 1800, 'kcal'], ['f', 'Fat %', 'p', 70], ['p', 'Protein %', 'p', 25], ['c', 'Net carbs %', 'p', 5]],
    [['Fat', 'cal*f/100/9', 'n', 'g', { dp: 0 }], ['Protein', 'cal*p/100/4', 'n', 'g', { dp: 0 }], ['Net carbs', 'cal*c/100/4', 'n', 'g', { dp: 0 }], ['Split total', 'f+p+c', 'p', '', { dp: 0 }]], { donut: [['Fat', 'cal*f/100'], ['Protein', 'cal*p/100'], ['Carbs', 'cal*c/100']], donutF: 'n' });

  F('bulk-cut-calculator', 'Bulking & Cutting Calculator', 'health/nutrition', 'Calories to bulk or cut from your maintenance level.', 'Bulk = maintenance + surplus; cut = maintenance − deficit.',
    [['tdee', 'Maintenance calories', 'n', 2500, 'kcal'], ['m', 'Goal', 'g', 1, [[1, 'Bulk'], [2, 'Cut']]], ['pct', 'Change from maintenance', 'p', 10]],
    [['Daily calories', 'tdee*(1+if(m==1,1,-1)*pct/100)', 'n', 'kcal', { dp: 0 }], ['Change per day', 'o1-tdee', 'n', 'kcal', { dp: 0 }], ['Expected change per week', '(o1-tdee)*7/7700', 'f', 'kg', { dp: 2 }]]);

  F('intermittent-fasting-calculator', 'Intermittent Fasting Calculator', 'health/nutrition', 'Plan your eating window and fasting hours.', 'Eating window = start hour + window length; fasting = 24 − window.',
    [['plan', 'Plan', 's', 8, [[8, '16:8'], [6, '18:6'], [4, '20:4'], [10, '14:10'], [1, 'OMAD (23:1)']]], ['start', 'First meal at (24h, e.g. 12)', 'n', 12]],
    [['Eating window ends', function (v) { var e = (v.start + v.plan) % 24, h = Math.floor(e), m = Math.round((e - h) * 60); return h + ':' + (m < 10 ? '0' : '') + m; }, 'text'], ['Fasting hours', '24-plan', 'n', 'h'], ['Eating window', 'plan', 'n', 'h']]);

  F('sugar-intake-calculator', 'Daily Sugar Intake Calculator', 'health/nutrition', 'Recommended added-sugar limit in grams and teaspoons.', 'Added sugar under 10% of calories (WHO strongly suggests 5%). 4 kcal per gram.',
    [['cal', 'Daily calories', 'n', 2000, 'kcal']],
    [['Limit (10% of calories)', 'cal*0.1/4', 'n', 'g', { dp: 0 }], ['Ideal (5% of calories)', 'cal*0.05/4', 'n', 'g', { dp: 0 }], ['Teaspoons (10%)', 'o1/4.2', 'f', 'tsp', { dp: 1 }]]);

  F('caffeine-intake-calculator', 'Caffeine Limit Calculator', 'health/nutrition', 'How much caffeine is safe per day, in cups of coffee.', 'Adults: up to 400 mg a day; pregnancy: 200 mg. A cup of coffee has about 95 mg.',
    [['g', 'Who is it for?', 's', 400, [[400, 'Healthy adult'], [200, 'Pregnant / breastfeeding'], [100, 'Teen (12–18)']]], ['cup', 'Caffeine per cup', 'n', 95, 'mg'], ['have', 'Already had today', 'n', 0, 'mg', { opt: 1 }]],
    [['Remaining today', 'max(0,g-have)', 'n', 'mg', { dp: 0 }], ['Cups left', 'o1/cup', 'f', 'cups', { dp: 1 }], ['Daily limit', 'g', 'n', 'mg']]);

  F('bac-calculator', 'Blood Alcohol Content (BAC) Calculator', 'health/lifestyle', 'Estimate blood alcohol level and time to sober using the Widmark formula.', 'BAC = (grams of alcohol ÷ (body weight g × r)) × 100 − 0.015 × hours. r = 0.68 men, 0.55 women.',
    [SX].concat(WI, [['d', 'Standard drinks (14 g alcohol each)', 'n', 3], ['hrs', 'Hours since first drink', 'n', 2]]),
    [['Estimated BAC', 'max(0,(d*14/((' + KG + ')*1000*if(sx==1,0.68,0.55)))*100-0.015*hrs)', 'f', '%', { dp: 3, k: 'bac' }], ['Time to 0.00%', 'bac/0.015', 'f', 'hours', { dp: 1 }], ['Legal limit (0.08%)', 'bac-0.08', 'b', '', { bands: [[0, 'Below 0.08%'], [Infinity, 'Over 0.08% — do not drive']] }]],
    { note: 'This is only an estimate; real BAC varies with food, health and metabolism. Never drink and drive.' });

  F('smoking-cost-calculator', 'Smoking Cost Calculator', 'health/lifestyle', 'What smoking costs you — and what quitting would save.', 'Cost = cigarettes per day ÷ pack size × pack price × days.',
    [['n', 'Cigarettes per day', 'i', 10], ['pk', 'Cigarettes per pack', 'i', 20], ['pr', 'Price per pack', 'm', 8, '', { local: { IN: 300 } }], ['yrs', 'Years', 'n', 10], ['r', 'Return if invested', 'p', 7]],
    [['Per year', 'n/pk*pr*365', 'm'], ['Per month', 'o1/12', 'm'], ['Over the years', 'o1*yrs', 'm'], ['If invested instead', 'fvs(r/100,yrs,o1)', 'm', '', { hl: 1 }]]);

  F('alcohol-units-calculator', 'Alcohol Units Calculator', 'health/lifestyle', 'UK alcohol units in your drink and weekly total.', 'Units = volume (ml) × ABV% ÷ 1000. Low-risk guideline: 14 units a week.',
    [['ml', 'Drink volume', 'n', 330, 'ml'], ['abv', 'Strength (ABV)', 'p', 5], ['n', 'Drinks per week', 'n', 6]],
    [['Units per drink', 'ml*abv/1000', 'f', 'units', { dp: 1 }], ['Units per week', 'o1*n', 'f', 'units', { dp: 1 }], ['vs 14-unit guideline', 'o2-14', 'b', '', { bands: [[0.0001, 'Within the guideline'], [Infinity, 'Above the guideline']] }]]);

  F('steps-calculator', 'Steps to Distance & Calories Calculator', 'health/lifestyle', 'Convert steps into distance, calories and time.', 'Step length ≈ 0.415 × height (men) or 0.413 × height (women). Calories ≈ 0.57 × kg per km.',
    [SX].concat(WI, HI, [['st', 'Steps', 'i', 10000]]),
    [['Distance', 'st*(' + CMH + ')*if(sx==1,0.415,0.413)/100000', 'f', 'km', { dp: 2 }], ['In miles', 'o1/1.609344', 'f', 'mi', { dp: 2 }], ['Calories burned', 'o1*0.57*(' + KG + ')', 'n', 'kcal', { dp: 0 }], ['Walking time (5 km/h)', 'o1/5*60', 'n', 'min', { dp: 0 }]]);

  F('sleep-debt-calculator', 'Sleep Debt Calculator', 'health/lifestyle', 'How much sleep you owe your body this week.', 'Sleep debt = (hours needed − hours slept) × days.',
    [['need', 'Hours needed per night', 'n', 8], ['got', 'Hours you actually sleep', 'n', 6.5], ['d', 'Days', 'i', 7]],
    [['Sleep debt', 'max(0,(need-got)*d)', 'f', 'hours', { dp: 1 }], ['Nights of recovery (+1 h/night)', 'o1', 'n', 'nights', { dp: 0 }]]);

  /* ---------------- Pregnancy & family ---------------- */
  F('pregnancy-weight-gain-calculator', 'Pregnancy Weight Gain Calculator', 'health/pregnancy', 'Recommended weight gain during pregnancy by pre-pregnancy BMI.', 'IOM guidance: underweight 12.5–18 kg · normal 11.5–16 kg · overweight 7–11.5 kg · obese 5–9 kg.',
    WI.concat(HI, [['tw', 'Twins', 'c', 0, '']]),
    [['BMI before pregnancy', KG + '/((' + CMH + ')/100)^2', 'f', '', { dp: 1, k: 'bmi' }], ['Minimum gain', 'if(tw==1,if(bmi<25,17,if(bmi<30,14,11)),if(bmi<18.5,12.5,if(bmi<25,11.5,if(bmi<30,7,5))))', 'f', 'kg', { dp: 1 }], ['Maximum gain', 'if(tw==1,if(bmi<25,25,if(bmi<30,23,19)),if(bmi<18.5,18,if(bmi<25,16,if(bmi<30,11.5,9))))', 'f', 'kg', { dp: 1 }], ['Weekly gain (2nd & 3rd trimester)', 'if(bmi<18.5,0.51,if(bmi<25,0.42,if(bmi<30,0.28,0.22)))', 'f', 'kg/week', { dp: 2 }]]);

  F('ivf-due-date-calculator', 'IVF Due Date Calculator', 'health/pregnancy', 'Estimated due date from your embryo transfer date.', 'Due date = transfer date + 266 days − embryo age (3-day: +263, 5-day: +261).',
    [['t', 'Transfer date', 'd', 0], ['ea', 'Embryo age at transfer', 's', 5, [[3, 'Day 3'], [5, 'Day 5 (blastocyst)'], [6, 'Day 6']]]],
    [['Estimated due date', 't+(266-ea)*86400000', 'd'], ['Pregnancy test (about 9 days)', 't+9*86400000', 'd'], ['End of first trimester', 't+(84-ea)*86400000', 'd']]);

  F('conception-date-calculator', 'Conception Date Calculator', 'health/pregnancy', 'Work back from the due date to the likely conception window.', 'Conception ≈ due date − 266 days (fertile window ±5 days).',
    [['due', 'Due date', 'd', 150]],
    [['Likely conception', 'due-266*86400000', 'd'], ['Window starts', 'due-271*86400000', 'd'], ['Window ends', 'due-261*86400000', 'd'], ['Last period (LMP) was about', 'due-280*86400000', 'd']]);

  F('gestational-age-calculator', 'Gestational Age Calculator', 'health/pregnancy', 'How many weeks pregnant you are from your last period.', 'Gestational age = days since the first day of the last period.',
    [['lmp', 'First day of last period', 'd', -84], ['on', 'Calculate on', 'd', 0]],
    [['Gestational age', 'floor((on-lmp)/86400000/7)', 'i', 'weeks', { sub: 'plus the days shown below' }], ['Extra days', 'mod(floor((on-lmp)/86400000),7)', 'i', 'days'], ['Trimester', 'floor((on-lmp)/86400000/7)', 'b', '', { bands: [[14, 'First trimester'], [28, 'Second trimester'], [Infinity, 'Third trimester']] }], ['Due date', 'lmp+280*86400000', 'd']]);

  F('child-height-predictor', 'Child Height Predictor', 'health/pregnancy', 'Predict adult height from the parents’ heights (mid-parental method).', 'Boy = (father + mother + 13 cm) ÷ 2 · Girl = (father + mother − 13 cm) ÷ 2, ±8.5 cm.',
    [['f', 'Father’s height', 'n', 175, 'cm'], ['m', 'Mother’s height', 'n', 162, 'cm'], ['g', 'Child', 'g', 1, [[1, 'Boy'], [2, 'Girl']]]],
    [['Predicted adult height', '(f+m+if(g==1,13,-13))/2', 'f', 'cm', { dp: 1 }], ['Likely range', 'o1-8.5', 'f', 'cm', { dp: 0, sub: 'to the upper range below' }], ['Upper range', 'o1+8.5', 'f', 'cm', { dp: 0 }], ['In feet & inches', 'o1/2.54', 'f', 'inches', { dp: 1 }]]);

  /* ---------------- Medical ---------------- */
  F('blood-pressure-calculator', 'Blood Pressure Category Calculator', 'health/medical', 'Your blood pressure category, pulse pressure and mean arterial pressure.', 'Categories follow the AHA/ACC guideline.',
    [['s', 'Systolic (top number)', 'i', 118], ['d', 'Diastolic (bottom number)', 'i', 76]],
    [['Category', 'if(s>180,5,if(d>120,5,if(s>=140,4,if(d>=90,4,if(s>=130,3,if(d>=80,3,if(s>=120,2,1)))))))', 'b', '', { bands: [[1.5, 'Normal'], [2.5, 'Elevated'], [3.5, 'High — stage 1'], [4.5, 'High — stage 2'], [Infinity, 'Hypertensive crisis — seek care']] }], ['Pulse pressure', 's-d', 'n', 'mmHg'], ['Mean arterial pressure', 'd+(s-d)/3', 'f', 'mmHg', { dp: 0 }]],
    { note: 'For information only. Diagnosis needs repeated readings by a clinician.' });

  F('cholesterol-ratio-calculator', 'Cholesterol Ratio & LDL Calculator', 'health/medical', 'Total/HDL ratio, non-HDL and calculated LDL (mg/dL).', 'LDL (Friedewald) = total − HDL − triglycerides ÷ 5. Ratio = total ÷ HDL.',
    [['tc', 'Total cholesterol', 'n', 190, 'mg/dL'], ['hdl', 'HDL', 'n', 55, 'mg/dL'], ['tg', 'Triglycerides', 'n', 120, 'mg/dL']],
    [['Total/HDL ratio', 'tc/hdl', 'f', '', { dp: 1 }], ['LDL (calculated)', 'tc-hdl-tg/5', 'n', 'mg/dL', { dp: 0 }], ['Non-HDL', 'tc-hdl', 'n', 'mg/dL', { dp: 0 }], ['Ratio rating', 'tc/hdl', 'b', '', { bands: [[3.5, 'Optimal'], [5, 'Acceptable'], [Infinity, 'High']] }]]);

  F('creatinine-clearance-calculator', 'Creatinine Clearance Calculator (Cockcroft-Gault)', 'health/medical', 'Estimate kidney function from serum creatinine.', 'CrCl = (140 − age) × weight ÷ (72 × creatinine) × 0.85 if female.',
    [AGE, SX, ['kg', 'Weight', 'n', 70, 'kg'], ['cr', 'Serum creatinine', 'n', 0.9, 'mg/dL']],
    [['Creatinine clearance', '(140-age)*kg/(72*cr)*if(sx==2,0.85,1)', 'f', 'mL/min', { dp: 0 }]], { note: 'A screening estimate only; see eGFR for staging.' });

  F('corrected-calcium-calculator', 'Corrected Calcium Calculator', 'health/medical', 'Calcium corrected for low albumin.', 'Corrected Ca = measured Ca + 0.8 × (4.0 − albumin).',
    [['ca', 'Serum calcium', 'n', 8.4, 'mg/dL'], ['alb', 'Albumin', 'n', 3, 'g/dL']],
    [['Corrected calcium', 'ca+0.8*(4-alb)', 'f', 'mg/dL', { dp: 1 }], ['Reference range', 'ca+0.8*(4-alb)', 'b', '', { bands: [[8.5, 'Low'], [10.5, 'Normal (8.5–10.5)'], [Infinity, 'High']] }]]);

  F('anion-gap-calculator', 'Anion Gap Calculator', 'health/medical', 'Serum anion gap from sodium, chloride and bicarbonate.', 'Anion gap = Na − (Cl + HCO₃).',
    [['na', 'Sodium', 'n', 140, 'mmol/L'], ['cl', 'Chloride', 'n', 104, 'mmol/L'], ['hc', 'Bicarbonate', 'n', 24, 'mmol/L']],
    [['Anion gap', 'na-(cl+hc)', 'n', 'mmol/L', { dp: 0 }], ['Interpretation', 'na-(cl+hc)', 'b', '', { bands: [[8, 'Low'], [12.01, 'Normal (8–12)'], [Infinity, 'High']] }]]);

  F('iv-drip-rate-calculator', 'IV Drip Rate Calculator', 'health/medical', 'Infusion rate in mL/hour and drops per minute.', 'Drops/min = volume × drop factor ÷ time in minutes.',
    [['v', 'Volume', 'n', 1000, 'mL'], ['h', 'Time', 'n', 8, 'hours'], ['df', 'Drop factor', 's', 20, [[10, '10 gtt/mL'], [15, '15 gtt/mL'], [20, '20 gtt/mL'], [60, '60 gtt/mL (micro)']]]],
    [['Flow rate', 'v/h', 'f', 'mL/h', { dp: 1 }], ['Drops per minute', 'v*df/(h*60)', 'f', 'gtt/min', { dp: 0 }], ['Seconds per drop', '60/o2', 'f', 's', { dp: 1 }]], { note: 'For learning and checking only — always follow clinical orders.' });

  F('dosage-by-weight-calculator', 'Dosage by Weight Calculator', 'health/medical', 'Work out a dose from mg per kg of body weight.', 'Dose = weight × mg/kg. Volume = dose ÷ concentration.',
    [['w', 'Body weight', 'n', 20, 'kg'], ['mgkg', 'Dose per kg', 'n', 10, 'mg/kg'], ['n', 'Doses per day', 'i', 3], ['conc', 'Liquid strength', 'n', 125, 'mg per 5 mL']],
    [['Dose per administration', 'w*mgkg/n', 'f', 'mg', { dp: 1 }], ['Daily total', 'w*mgkg', 'f', 'mg', { dp: 1 }], ['Volume per dose', 'o1/conc*5', 'f', 'mL', { dp: 1 }]],
    { note: 'Always confirm the dose with a doctor or pharmacist and check the label.' });

  F('max-heart-rate-calculator', 'Maximum Heart Rate Calculator', 'health/medical', 'Your estimated maximum heart rate by three formulas.', 'Fox: 220 − age · Tanaka: 208 − 0.7 × age · Gulati (women): 206 − 0.88 × age.',
    [AGE],
    [['Tanaka', '208-0.7*age', 'n', 'bpm', { dp: 0 }], ['Fox (220 − age)', '220-age', 'n', 'bpm', { dp: 0 }], ['Gulati (women)', '206-0.88*age', 'n', 'bpm', { dp: 0 }], ['Moderate zone (50–70%)', 'o1*0.5', 'n', 'bpm', { dp: 0, sub: 'to 70% of max below' }], ['Vigorous zone (70–85%)', 'o1*0.7', 'n', 'bpm', { dp: 0 }]]);

  F('glucose-converter', 'Blood Glucose Converter (mg/dL ↔ mmol/L)', 'health/medical', 'Convert blood sugar between mg/dL and mmol/L.', 'mmol/L = mg/dL ÷ 18.016.',
    [['v', 'Value', 'n', 100], ['d', 'Direction', 'g', 1, [[1, 'mg/dL → mmol/L'], [2, 'mmol/L → mg/dL']]]],
    [['Converted', 'if(d==1,v/18.016,v*18.016)', 'f', '', { dp: 2 }], ['Reading', 'if(d==1,v,v*18.016)', 'b', '', { bands: [[70, 'Low'], [100, 'Normal fasting'], [126, 'Pre-diabetic range'], [Infinity, 'Diabetic range']] }]]);

  F('glasgow-coma-scale-calculator', 'Glasgow Coma Scale Calculator', 'health/medical', 'Total GCS from eye, verbal and motor responses.', 'GCS = eye (1–4) + verbal (1–5) + motor (1–6). Range 3–15.',
    [['ey', 'Eye opening', 's', 4, [[4, '4 · Spontaneous'], [3, '3 · To voice'], [2, '2 · To pain'], [1, '1 · None']]], ['vb', 'Verbal response', 's', 5, [[5, '5 · Oriented'], [4, '4 · Confused'], [3, '3 · Words only'], [2, '2 · Sounds only'], [1, '1 · None']]], ['mo', 'Motor response', 's', 6, [[6, '6 · Obeys commands'], [5, '5 · Localises pain'], [4, '4 · Withdraws'], [3, '3 · Flexion'], [2, '2 · Extension'], [1, '1 · None']]]],
    [['GCS total', 'ey+vb+mo', 'i', '/ 15'], ['Severity', 'ey+vb+mo', 'b', '', { bands: [[9, 'Severe (3–8)'], [13, 'Moderate (9–12)'], [Infinity, 'Mild (13–15)']] }]]);

  /* ---------------- Fitness: running ---------------- */
  CW.register({
    id: 'race-time-predictor', title: 'Race Time Predictor', g: 'fitness/running',
    desc: 'Predict your 5K, 10K, half marathon and marathon times from a recent race (Riegel formula).',
    formula: 'T₂ = T₁ × (D₂ ÷ D₁)^1.06',
    inputs: [{ k: 'd', l: 'Recent race distance', t: 'select', v: 10, o: [[1.609344, '1 mile'], [3, '3 km'], [5, '5 km'], [10, '10 km'], [15, '15 km'], [21.0975, 'Half marathon'], [42.195, 'Marathon']] },
      { k: 'h', l: 'Hours', t: 'int', v: 0, opt: 1 }, { k: 'm', l: 'Minutes', t: 'int', v: 50 }, { k: 's', l: 'Seconds', t: 'int', v: 0, opt: 1 }],
    calc: function (v) {
      var t = v.h * 3600 + v.m * 60 + v.s; if (!(t > 0)) return { error: 'Enter your finish time.' };
      var p = function (dist) { return t * Math.pow(dist / v.d, 1.06); };
      var T = [['5 km', 5], ['10 km', 10], ['10 miles', 16.09344], ['Half marathon', 21.0975], ['Marathon', 42.195]];
      return { results: T.map(function (x, i) { return { l: x[0], v: hms(p(x[1])), f: 'text', main: i === 3, sub: i === 3 ? 'Pace ' + mmss(p(x[1]) / x[1]) + ' per km' : '' }; }),
        note: 'Predictions assume equal training for the new distance. Longer races need more endurance than the formula can see.' };
    }
  });

  CW.register({
    id: 'marathon-pace-calculator', title: 'Marathon Pace Calculator', g: 'fitness/running',
    desc: 'Pace per km and mile for your target marathon time, with split times every 5 km.',
    formula: 'Pace = finish time ÷ 42.195 km.',
    inputs: [{ k: 'h', l: 'Target hours', t: 'int', v: 4 }, { k: 'm', l: 'Minutes', t: 'int', v: 0, opt: 1 }, { k: 's', l: 'Seconds', t: 'int', v: 0, opt: 1 }, { k: 'dist', l: 'Race', t: 'select', v: 42.195, o: [[42.195, 'Marathon'], [21.0975, 'Half marathon'], [10, '10 km'], [5, '5 km']] }],
    calc: function (v) {
      var t = v.h * 3600 + v.m * 60 + v.s; if (!(t > 0)) return { error: 'Enter your target time.' };
      var pk = t / v.dist, rows = [];
      for (var k = 5; k < v.dist; k += 5) rows.push([k + ' km', hms(pk * k)]);
      rows.push([CW.fmt.num(v.dist, 2) + ' km', hms(t)]);
      return { results: [{ l: 'Pace per km', v: mmss(pk), f: 'text', main: true }, { l: 'Pace per mile', v: mmss(pk * 1.609344), f: 'text' }, { l: 'Speed', v: 3600 / pk, f: 'fixed', dp: 2, u: 'km/h' }],
        table: { head: ['Distance', 'Time'], rows: rows, title: 'Split times' } };
    }
  });

  F('vo2-max-calculator', 'VO2 Max Calculator', 'fitness/running', 'Estimate your VO2 max from the Cooper test or from resting heart rate.', 'Cooper: VO₂max = (distance in 12 min (m) − 504.9) ÷ 44.73 · Uth: 15.3 × max HR ÷ resting HR.',
    [['m', 'Method', 'g', 1, [[1, 'Cooper 12-min run'], [2, 'Heart-rate ratio']]], ['d', 'Distance run in 12 minutes', 'n', 2400, 'm', { show: 'm==1' }], ['age', 'Age', 'i', 30, '', { show: 'm==2' }], ['rhr', 'Resting heart rate', 'n', 60, 'bpm', { show: 'm==2' }]],
    [['VO₂ max', 'if(m==1,(d-504.9)/44.73,15.3*(208-0.7*age)/rhr)', 'f', 'mL/kg/min', { dp: 1 }], ['Fitness level', 'if(m==1,(d-504.9)/44.73,15.3*(208-0.7*age)/rhr)', 'b', '', { bands: [[30, 'Below average'], [40, 'Average'], [50, 'Good'], [60, 'Excellent'], [Infinity, 'Elite']] }]]);

  F('walking-hiking-time-calculator', 'Hiking Time Calculator (Naismith’s Rule)', 'fitness/running', 'Estimate hiking time from distance and ascent.', 'Naismith’s rule: 1 hour per 5 km plus 1 hour per 600 m of ascent.',
    [['km', 'Distance', 'n', 12, 'km'], ['up', 'Total ascent', 'n', 600, 'm']],
    [['Estimated time', '(km/5+up/600)*60', 'n', 'min', { dp: 0 }], ['In hours', 'o1/60', 'f', 'h', { dp: 1 }], ['Average speed', 'km/(o1/60)', 'f', 'km/h', { dp: 1 }]], { note: 'Add time for breaks, heavy packs and rough ground.' });

  /* ---------------- Fitness: strength, cycling, swimming, rowing ---------------- */
  CW.register({
    id: 'plate-calculator', title: 'Barbell Plate Calculator', g: 'fitness/strength',
    desc: 'Which plates to load on each side of the barbell for your target weight.',
    formula: 'Per side = (target − bar) ÷ 2, loaded with the largest plates first.',
    inputs: [{ k: 'tw', l: 'Target weight', t: 'number', v: 100 }, { k: 'bar', l: 'Bar weight', t: 'number', v: 20 }, { k: 'u', l: 'Plates', t: 'seg', v: 1, o: [[1, 'kg'], [2, 'lb']] }],
    calc: function (v) {
      var plates = v.u == 2 ? [45, 35, 25, 10, 5, 2.5] : [25, 20, 15, 10, 5, 2.5, 1.25], rem = (v.tw - v.bar) / 2, used = [];
      if (rem < 0) return { error: 'Target is lighter than the bar.' };
      plates.forEach(function (p) { var n = Math.floor(rem / p + 1e-9); if (n > 0) { used.push(n + ' × ' + p); rem -= n * p; } });
      var u = v.u == 2 ? 'lb' : 'kg';
      return { results: [{ l: 'Plates on each side', v: used.length ? used.join(' + ') : 'Empty bar', f: 'text', main: true }, { l: 'Weight per side', v: (v.tw - v.bar) / 2 - rem, f: 'fixed', dp: 2, u: u }, { l: 'Actual total', v: v.bar + 2 * ((v.tw - v.bar) / 2 - rem), f: 'fixed', dp: 2, u: u }, { l: 'Cannot load', v: rem * 2, f: 'fixed', dp: 2, u: u }] };
    }
  });

  F('dots-score-calculator', 'DOTS Score Calculator (Powerlifting)', 'fitness/strength', 'Compare lifters of different body weights with the DOTS coefficient.', 'DOTS = total × 500 ÷ (a + b·bw + c·bw² + d·bw³ + e·bw⁴).',
    [['sx', 'Sex', 'g', 1, [[1, 'Male'], [2, 'Female']]], ['bw', 'Body weight', 'n', 83, 'kg'], ['tot', 'Squat + bench + deadlift', 'n', 500, 'kg']],
    [['DOTS score', 'tot*500/(if(sx==1,-307.75076,-57.96288)+if(sx==1,24.0900756,13.6175032)*bw+if(sx==1,-0.1918759221,-0.1126655495)*bw^2+if(sx==1,0.0007391293,0.0005158568)*bw^3+if(sx==1,-0.000001093,-0.0000010706)*bw^4)', 'f', '', { dp: 1 }], ['Total lifted', 'tot', 'n', 'kg'], ['Relative to body weight', 'tot/bw', 'f', 'x', { dp: 2 }]]);

  F('training-volume-calculator', 'Training Volume Calculator', 'fitness/strength', 'Total sets, reps and tonnage for an exercise.', 'Volume load = sets × reps × weight.',
    [['s', 'Sets', 'i', 4], ['r', 'Reps per set', 'i', 8], ['w', 'Weight per rep', 'n', 80, 'kg']],
    [['Volume load', 's*r*w', 'n', 'kg', { dp: 0 }], ['Total reps', 's*r', 'i'], ['Average load per set', 'r*w', 'n', 'kg']]);

  F('bike-gear-ratio-calculator', 'Bike Gear Ratio & Speed Calculator', 'fitness/cycling-swim', 'Gear ratio, gear inches and speed at your cadence.', 'Ratio = chainring ÷ cog. Speed = ratio × wheel circumference × cadence.',
    [['cr', 'Chainring teeth', 'i', 50], ['cog', 'Cog teeth', 'i', 16], ['wc', 'Wheel circumference', 'n', 2096, 'mm', { help: '700×25c ≈ 2096 mm' }], ['cad', 'Cadence', 'n', 90, 'rpm']],
    [['Speed', 'cr/cog*wc/1000*cad*60/1000', 'f', 'km/h', { dp: 1 }], ['Gear ratio', 'cr/cog', 'f', '', { dp: 2 }], ['Gear inches', 'cr/cog*wc/3.14159/25.4', 'f', '', { dp: 1 }], ['Speed in mph', 'o1/1.609344', 'f', 'mph', { dp: 1 }]]);

  F('ftp-power-zones-calculator', 'Cycling Power Zones (FTP) Calculator', 'fitness/cycling-swim', 'Training power zones from your functional threshold power.', 'Coggan zones are percentages of FTP.',
    [['ftp', 'FTP', 'n', 250, 'W']],
    [['Z1 Active recovery', 'ftp*0.55', 'n', 'W or less', { dp: 0 }], ['Z2 Endurance', 'ftp*0.75', 'n', 'W (up to)', { dp: 0 }], ['Z3 Tempo', 'ftp*0.9', 'n', 'W (up to)', { dp: 0 }], ['Z4 Threshold', 'ftp*1.05', 'n', 'W (up to)', { dp: 0 }], ['Z5 VO₂max', 'ftp*1.2', 'n', 'W (up to)', { dp: 0 }], ['Z6 Anaerobic', 'ftp*1.5', 'n', 'W (up to)', { dp: 0 }]]);

  F('bike-saddle-height-calculator', 'Bike Saddle Height Calculator', 'fitness/cycling-swim', 'Saddle height from your inseam (LeMond and Hamley methods).', 'LeMond: inseam × 0.883. Hamley: inseam × 1.09 (to pedal axle).',
    [['inseam', 'Inseam length', 'n', 82, 'cm']],
    [['Saddle height (LeMond)', 'inseam*0.883', 'f', 'cm', { dp: 1 }], ['Saddle height (Hamley)', 'inseam*1.09', 'f', 'cm', { dp: 1 }], ['In inches (LeMond)', 'o1/2.54', 'f', 'in', { dp: 1 }]]);

  CW.register({
    id: 'swim-pace-calculator', title: 'Swim Pace Calculator', g: 'fitness/cycling-swim',
    desc: 'Your pace per 100 m and 50 m from a swim distance and time.',
    formula: 'Pace per 100 m = total time ÷ distance × 100.',
    inputs: [{ k: 'd', l: 'Distance', t: 'number', v: 1500, u: 'm' }, { k: 'm', l: 'Minutes', t: 'int', v: 30 }, { k: 's', l: 'Seconds', t: 'int', v: 0, opt: 1 }],
    calc: function (v) { var t = v.m * 60 + v.s; if (!(t > 0 && v.d > 0)) return { error: 'Enter a distance and a time.' }; var p = t / v.d * 100;
      return { results: [{ l: 'Pace per 100 m', v: mmss(p), f: 'text', main: true }, { l: 'Pace per 50 m', v: mmss(p / 2), f: 'text' }, { l: 'Speed', v: v.d / t * 3.6, f: 'fixed', dp: 2, u: 'km/h' }, { l: 'Per 100 yards', v: mmss(p * 0.9144), f: 'text' }] }; }
  });

  F('rowing-watts-calculator', 'Rowing Split & Watts Calculator', 'fitness/cycling-swim', 'Convert a rowing split per 500 m into watts and calories per hour.', 'Watts = 2.80 ÷ (split in seconds per metre)³.',
    [['m', 'Split minutes', 'i', 2], ['s', 'Split seconds', 'n', 5]],
    [['Power', '2.8/((m*60+s)/500)^3', 'n', 'W', { dp: 0 }], ['Split per 500 m', 'm*60+s', 'n', 'sec', { dp: 0 }], ['Calories per hour', 'o1*4+300', 'n', 'kcal', { dp: 0 }], ['2,000 m time', '(m*60+s)*4', 'n', 'sec', { dp: 0 }]]);

  /* ---------------- Calories burned by activity (MET method) ---------------- */
  var ACT = [['walking', 'Walking', 3.5, 'at a steady 5 km/h'], ['brisk-walking', 'Brisk Walking', 4.3, 'at 6 km/h'], ['running', 'Running', 9.8, 'at about 10 km/h'], ['cycling', 'Cycling', 7.5, 'at a moderate pace'], ['swimming', 'Swimming', 6, 'laps at an easy pace'], ['hiking', 'Hiking', 6, 'on trails'], ['jump-rope', 'Jump Rope', 11.8, 'at a moderate pace'], ['rowing', 'Rowing Machine', 7, 'at a moderate pace'], ['yoga', 'Yoga', 2.5, 'hatha style'], ['dancing', 'Dancing', 5, 'general dancing'], ['weight-lifting', 'Weight Lifting', 5, 'general training'], ['hiit', 'HIIT Workout', 8, 'high-intensity intervals'], ['elliptical', 'Elliptical Trainer', 5, 'at a moderate effort'], ['stair-climbing', 'Stair Climbing', 8.8, 'at a steady pace'], ['zumba', 'Zumba', 6.5, 'class pace'], ['badminton', 'Badminton', 5.5, 'recreational play'], ['basketball', 'Basketball', 6.5, 'a game'], ['football', 'Football (Soccer)', 7, 'a casual game'], ['tennis', 'Tennis', 7.3, 'singles'], ['cricket', 'Cricket', 4.8, 'batting and fielding'], ['skipping', 'Skipping', 11.8, 'rope skipping'], ['pilates', 'Pilates', 3, 'mat class'], ['boxing', 'Boxing', 7.8, 'bag work and sparring'], ['martial-arts', 'Martial Arts', 10.3, 'training session'], ['gardening', 'Gardening', 3.8, 'general'], ['cleaning', 'House Cleaning', 3.3, 'general'], ['sleeping', 'Sleeping', 0.95, 'at rest'], ['standing', 'Standing', 1.8, 'at a desk'], ['sitting', 'Sitting at a Desk', 1.3, 'office work']];
  ACT.forEach(function (a) {
    F(a[0] + '-calories-burned-calculator', a[1] + ' Calories Burned Calculator', 'fitness/calories-burned',
      'Estimate the calories you burn ' + a[3] + ' during ' + a[1].toLowerCase() + '.', 'Calories = MET (' + a[2] + ') × body weight (kg) × hours.',
      WI.concat([['mn', 'Duration', 'n', 30, 'min']]),
      [['Calories burned', a[2] + '*(' + KG + ')*mn/60', 'n', 'kcal', { dp: 0 }], ['Per hour', a[2] + '*(' + KG + ')', 'n', 'kcal', { dp: 0 }], ['MET value', String(a[2]), 'f', '', { dp: 1 }]],
      { note: 'The MET method gives an average. Your fitness, pace and body composition change the real number.' });
  });

  /* ---------------- Sports ---------------- */
  F('net-run-rate-calculator', 'Net Run Rate (NRR) Calculator', 'fitness/sports-scores', 'Net run rate for a cricket tournament table.', 'NRR = runs scored ÷ overs faced − runs conceded ÷ overs bowled.',
    [['rs', 'Runs scored (total)', 'n', 920], ['of', 'Overs faced (total)', 'n', 100], ['rc', 'Runs conceded (total)', 'n', 880], ['ob', 'Overs bowled (total)', 'n', 100]],
    [['Net run rate', 'rs/(floor(of)+(of-floor(of))*10/6)-rc/(floor(ob)+(ob-floor(ob))*10/6)', 'f', '', { dp: 3 }], ['Run rate for', 'rs/(floor(of)+(of-floor(of))*10/6)', 'f', '', { dp: 2 }], ['Run rate against', 'rc/(floor(ob)+(ob-floor(ob))*10/6)', 'f', '', { dp: 2 }]],
    { note: 'Overs are entered in cricket notation: 19.3 means 19 overs and 3 balls.' });

  F('cricket-strike-rate-calculator', 'Cricket Strike Rate Calculator', 'fitness/sports-scores', 'Batting strike rate, boundary share and average.', 'Strike rate = runs ÷ balls faced × 100.',
    [['r', 'Runs', 'n', 74], ['b', 'Balls faced', 'n', 52], ['f', 'Fours', 'n', 7, '', { opt: 1 }], ['s', 'Sixes', 'n', 3, '', { opt: 1 }]],
    [['Strike rate', 'r/b*100', 'f', '', { dp: 2 }], ['Runs in boundaries', 'f*4+s*6', 'n', '', { dp: 0 }], ['Boundary share', 'o2/r*100', 'p', '', { dp: 0 }], ['Balls per boundary', 'b/max(1,f+s)', 'f', '', { dp: 1 }]]);

  F('cricket-batting-average-calculator', 'Cricket Batting Average Calculator', 'fitness/sports-scores', 'Batting average from runs, innings and not-outs.', 'Average = runs ÷ (innings − not outs).',
    [['r', 'Total runs', 'n', 3250], ['i', 'Innings', 'n', 80], ['no', 'Not outs', 'n', 10]],
    [['Batting average', 'r/(i-no)', 'f', '', { dp: 2 }], ['Dismissals', 'i-no', 'i'], ['Runs needed for +1 avg', '(o1+1)*(i+1-no)-r', 'n', '', { dp: 0, sub: 'in the next innings (out)' }]]);

  F('cricket-bowling-average-calculator', 'Bowling Average & Economy Calculator', 'fitness/sports-scores', 'Bowling average, economy rate and strike rate.', 'Average = runs conceded ÷ wickets. Economy = runs ÷ overs.',
    [['r', 'Runs conceded', 'n', 480], ['w', 'Wickets', 'n', 18], ['o', 'Overs bowled', 'n', 60]],
    [['Bowling average', 'r/w', 'f', '', { dp: 2 }], ['Economy rate', 'r/(floor(o)+(o-floor(o))*10/6)', 'f', '', { dp: 2 }], ['Strike rate (balls per wicket)', '(floor(o)*6+(o-floor(o))*10)/w', 'f', '', { dp: 1 }]]);

  F('required-run-rate-calculator', 'Required Run Rate Calculator', 'fitness/sports-scores', 'Run rate needed to chase a target, and the projected score.', 'RRR = runs needed ÷ overs left. CRR = runs ÷ overs bowled.',
    [['t', 'Target', 'n', 180], ['s', 'Current score', 'n', 92], ['o', 'Overs completed', 'n', 10], ['tot', 'Total overs', 'n', 20]],
    [['Required run rate', '(t-s)/(tot-o)', 'f', '', { dp: 2 }], ['Current run rate', 's/o', 'f', '', { dp: 2 }], ['Runs needed', 't-s', 'i'], ['Projected score', 's/o*tot', 'n', '', { dp: 0 }]]);

  F('baseball-batting-average-calculator', 'Batting Average & Slugging Calculator (Baseball)', 'fitness/sports-scores', 'Batting average, on-base, slugging and OPS.', 'AVG = hits ÷ at-bats · SLG = total bases ÷ at-bats.',
    [['h', 'Hits', 'n', 120], ['ab', 'At-bats', 'n', 420], ['bb', 'Walks', 'n', 45], ['hbp', 'Hit by pitch', 'n', 3, '', { opt: 1 }], ['sf', 'Sacrifice flies', 'n', 4, '', { opt: 1 }], ['d', 'Doubles', 'n', 25], ['t', 'Triples', 'n', 2], ['hr', 'Home runs', 'n', 18]],
    [['Batting average', 'h/ab', 'f', '', { dp: 3 }], ['On-base percentage', '(h+bb+hbp)/(ab+bb+hbp+sf)', 'f', '', { dp: 3 }], ['Slugging', '(h-d-t-hr+2*d+3*t+4*hr)/ab', 'f', '', { dp: 3 }], ['OPS', 'o2+o3', 'f', '', { dp: 3 }]]);

  F('era-calculator', 'ERA & WHIP Calculator (Baseball)', 'fitness/sports-scores', 'Earned run average and WHIP for a pitcher.', 'ERA = earned runs × 9 ÷ innings pitched. WHIP = (walks + hits) ÷ innings.',
    [['er', 'Earned runs', 'n', 55], ['ip', 'Innings pitched', 'n', 180], ['bb', 'Walks', 'n', 50], ['h', 'Hits allowed', 'n', 160]],
    [['ERA', 'er*9/ip', 'f', '', { dp: 2 }], ['WHIP', '(bb+h)/ip', 'f', '', { dp: 2 }]]);

  F('elo-rating-calculator', 'Elo Rating Calculator', 'fitness/sports-scores', 'Expected win chance and your new Elo rating after a game.', 'Expected = 1 ÷ (1 + 10^((opponent − you) ÷ 400)). New rating = old + K × (result − expected).',
    [['ra', 'Your rating', 'n', 1500], ['rb', 'Opponent rating', 'n', 1600], ['k', 'K-factor', 'n', 32], ['res', 'Result', 's', 1, [[1, 'Win'], [0.5, 'Draw'], [0, 'Loss']]]],
    [['Win probability', '100/(1+10^((rb-ra)/400))', 'p', '', { dp: 1 }], ['New rating', 'ra+k*(res-1/(1+10^((rb-ra)/400)))', 'n', '', { dp: 0 }], ['Change', 'o2-ra', 'n', '', { dp: 1 }]]);

  F('win-percentage-calculator', 'Win Percentage Calculator', 'fitness/sports-scores', 'Win percentage, games back and projected wins.', 'Win % = wins ÷ (wins + losses).',
    [['w', 'Wins', 'n', 48], ['l', 'Losses', 'n', 34], ['t', 'Ties', 'n', 0, '', { opt: 1 }], ['g', 'Season length', 'n', 82]],
    [['Win percentage', 'w/(w+l+t)*100', 'p', '', { dp: 1 }], ['Games played', 'w+l+t', 'i'], ['Projected wins', 'w/(w+l+t)*g', 'n', '', { dp: 0 }], ['Games left', 'g-w-l-t', 'i']]);

  CW.register({
    id: 'golf-handicap-calculator', title: 'Golf Handicap Index Calculator', g: 'fitness/sports-scores',
    desc: 'Handicap Index from your score differentials using the World Handicap System.',
    formula: 'Differential = (113 ÷ slope) × (adjusted gross score − course rating). Index = average of the best differentials × 1.0.',
    inputs: [{ k: 'rows', l: 'Your recent rounds (up to 20)', t: 'rows', add: 'Add round', cols: [{ l: 'Adjusted gross score', t: 'number', v: 88 }, { l: 'Course rating', t: 'number', v: 71.2 }, { l: 'Slope', t: 'number', v: 128 }],
      v: [[88, 71.2, 128], [92, 71.2, 128], [85, 70.5, 125], [90, 72, 130], [87, 71.2, 128]] }],
    calc: function (v) {
      var d = (v.rows || []).filter(function (r) { return r[2] > 0; }).slice(-20).map(function (r) { return Math.round((113 / r[2]) * (r[0] - r[1]) * 10) / 10; });
      if (d.length < 3) return { error: 'Add at least 3 rounds.' };
      var n = d.length, use = n <= 5 ? 1 : n <= 6 ? 2 : n <= 8 ? 2 : n <= 11 ? 3 : n <= 14 ? 4 : n <= 16 ? 5 : n <= 18 ? 6 : n === 19 ? 7 : 8, adj = n === 3 ? -2 : n === 4 ? -1 : n === 6 ? -1 : 0;
      var best = d.slice().sort(function (a, b) { return a - b; }).slice(0, use), idx = Math.round((best.reduce(function (a, b) { return a + b; }, 0) / use + adj) * 10) / 10;
      return { results: [{ l: 'Handicap Index', v: idx, f: 'fixed', dp: 1, main: true }, { l: 'Rounds used', v: use + ' of ' + n, f: 'text' }, { l: 'Best differential', v: best[0], f: 'fixed', dp: 1 }] };
    }
  });
})(window.CW);
