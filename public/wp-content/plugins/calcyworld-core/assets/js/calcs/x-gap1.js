/* Calcyworld — gap pack 1: finance, tax, insurance, business, crypto */
(function (CW) {
  'use strict';
  CW.defBase = 'INR';
  var C = CW.C, M = CW.M, R = CW.Rr;
  var Mo = function (l, v, dp) { return M(l, v, 'm', { dp: dp === undefined ? 0 : dp }); }, Ro = function (l, v, dp) { return R(l, v, 'm', { dp: dp === undefined ? 0 : dp }); };
  var Mp = function (l, v, dp) { return M(l, v, 'pct', { dp: dp === undefined ? 2 : dp }); }, Rp = function (l, v, dp) { return R(l, v, 'pct', { dp: dp === undefined ? 2 : dp }); };
  var Mx = function (l, v, dp, u) { return M(l, v, 'num', { dp: dp === undefined ? 2 : dp, u: u || '' }); }, Rx = function (l, v, dp, u) { return R(l, v, 'num', { dp: dp === undefined ? 2 : dp, u: u || '' }); };
  var Tx = function (l, v) { return R(l, v, 'text'); };
  var num = function (s) { return +String(s).replace(/,/g, ''); };
  var lines3 = function (s) { return String(s).trim().split(/\n/).map(function (l) { var m = /^(.*?)[\s:]+([\d.,]+)[\s:]+([\d.,]+)\s*$/.exec(l.trim()); return m ? [m[1], num(m[2]), num(m[3])] : null; }).filter(Boolean); };
  var lines2 = function (s) { return String(s).trim().split(/\n/).map(function (l) { var m = /^(.*?)[\s:]+([\d.,]+)\s*$/.exec(l.trim()); return m ? [m[1], num(m[2])] : null; }).filter(Boolean); };
  var nums = function (s) { return String(s).split(/[\s,;]+/).map(function (x) { return parseFloat(x); }).filter(function (x) { return isFinite(x); }); };
  var days = function (a, b) { return Math.round((b - a) / 86400000); };
  var fv = function (pmt, i, n) { return i ? pmt * (Math.pow(1 + i, n) - 1) / i : pmt * n; };
  var pmtFor = function (target, i, n) { return i ? target * i / (Math.pow(1 + i, n) - 1) : target / n; };
  var irr = function (flows) { var lo = -0.99, hi = 1, f = function (r) { return flows.reduce(function (s, c, t) { return s + c / Math.pow(1 + r, t); }, 0); }; if (f(lo) * f(hi) > 0) return NaN; for (var k = 0; k < 120; k++) { var mid = (lo + hi) / 2; if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid; } return (lo + hi) / 2; };

  /* ================= FINANCE & TAX ================= */
  var APY5000 = [210, 228, 248, 269, 292, 318, 346, 376, 409, 446, 485, 529, 577, 630, 687, 752, 824, 902, 990, 1087, 1196, 1318, 1454];
  var apyAt = function (age, pen) { return Math.round(APY5000[age - 18] * pen / 5000); };
  C('atal-pension-yojana-calculator', 'Atal Pension Yojana (APY) Calculator', 'finance/retirement', 'Monthly contribution, total paid and guaranteed pension under Atal Pension Yojana.', 'Contribution depends on your joining age (18–40) and the pension you pick (₹1,000–₹5,000 a month from age 60). Figures follow the PFRDA chart.',
    [['age', 'Your age when you join', 'i', 25], ['p', 'Monthly pension wanted from age 60', 's', 5000, [[1000, '₹1,000'], [2000, '₹2,000'], [3000, '₹3,000'], [4000, '₹4,000'], [5000, '₹5,000']]], ['f', 'Pay', 's', 1, [[1, 'Monthly'], [3, 'Quarterly'], [6, 'Half-yearly']]]],
    function (v) {
      var a = Math.round(v.age); if (a < 18 || a > 40) return { error: 'APY is open between age 18 and 40.' };
      var m = apyAt(a, v.p), yrs = 60 - a, tot = m * 12 * yrs, rows = [];
      for (var x = 18; x <= 40; x++) rows.push([x, apyAt(x, v.p), 60 - x, apyAt(x, v.p) * 12 * (60 - x)]);
      return {
        results: [Mo('Monthly contribution', m), Ro('Pay each ' + (v.f === 1 ? 'month' : v.f === 3 ? 'quarter' : 'half-year'), m * v.f), Rx('Years of contribution', yrs, 0), Ro('Total you contribute', tot), Ro('Guaranteed pension from age 60 (per month)', v.p), Ro('Corpus returned to nominee', 170000 * v.p / 1000), Rx('Pension covers your total contribution in', tot / (v.p * 12), 1, 'years')],
        table: { head: ['Joining age', 'Monthly', 'Years', 'Total paid'], rows: rows, fmt: ['int', 'money', 'int', 'money'], title: 'Contribution by joining age' },
        note: 'Since 1 Oct 2022, income-tax payers cannot join APY. Official chart amounts can differ by ₹1–2 because of rounding.'
      };
    }, { pop: 1 });

  C('cpp-calculator', 'CPP Contribution Calculator (Canada)', 'tax-salary/paycheck', 'Canada Pension Plan (CPP and CPP2) contributions for an employee or self-employed worker.', 'CPP = (earnings up to YMPE − $3,500) × 5.95%; CPP2 = (earnings between YMPE and YAMPE) × 4%. Limits below are the 2026 values.',
    [['inc', 'Annual pensionable earnings', 'm', 85000], ['t', 'You are', 'g', 1, [[1, 'Employee'], [2, 'Self-employed']]], ['pp', 'Pay periods per year', 's', 26, [[52, 'Weekly'], [26, 'Bi-weekly'], [24, 'Semi-monthly'], [12, 'Monthly']]], ['ex', 'Basic exemption', 'm', 3500], ['y1', 'YMPE (first ceiling)', 'm', 74600], ['y2', 'YAMPE (second ceiling)', 'm', 85000], ['r1', 'CPP rate (employee)', 'p', 5.95], ['r2', 'CPP2 rate (employee)', 'p', 4]],
    function (v) {
      var c1 = Math.max(0, Math.min(v.inc, v.y1) - v.ex) * v.r1 / 100, c2 = Math.max(0, Math.min(v.inc, v.y2) - v.y1) * v.r2 / 100, k = v.t === 2 ? 2 : 1, tot = (c1 + c2) * k;
      var res = [Mo(v.t === 2 ? 'Your CPP contribution (self-employed)' : 'Your CPP contribution', tot, 2), Ro('Base CPP', c1 * k, 2), Ro('CPP2 (second ceiling)', c2 * k, 2), Ro('Per paycheque', tot / v.pp, 2), Rp('Share of your earnings', tot / v.inc * 100)];
      if (v.t === 1) res.push(Ro('Your employer also pays', c1 + c2, 2));
      return { results: res, chart: { type: 'donut', data: [{ l: 'Base CPP', v: c1 * k }, { l: 'CPP2', v: c2 * k }, { l: 'You keep (before tax)', v: Math.max(0, v.inc - tot) }], f: 'money' } };
    }, { pop: 1 });

  C('council-tax-calculator', 'Council Tax Calculator (UK)', 'tax-salary/other-tax', 'Council tax for your band, with single-person and other discounts.', 'Each band is a fixed fraction of Band D: A 6/9, B 7/9, C 8/9, D 9/9, E 11/9, F 13/9, G 15/9, H 18/9.',
    [['d', 'Your council’s Band D charge (yearly)', 'm', 2300], ['b', 'Your band', 's', 3, [[1, 'A'], [2, 'B'], [3, 'C'], [4, 'D'], [5, 'E'], [6, 'F'], [7, 'G'], [8, 'H']]], ['ds', 'Discount', 's', 0, [[0, 'None'], [25, 'Single person (25%)'], [50, 'Everyone disregarded / empty (50%)'], [100, 'Exempt (100%)']]], ['n', 'Instalments', 's', 10, [[10, '10 (April–January)'], [12, '12']]]],
    function (v) {
      var fr = [6, 7, 8, 9, 11, 13, 15, 18], full = v.d * fr[v.b - 1] / 9, pay = full * (1 - v.ds / 100), rows = fr.map(function (f, i) { return ['Band ' + 'ABCDEFGH'.charAt(i), v.d * f / 9, v.d * f / 9 * (1 - v.ds / 100) / v.n]; });
      return { results: [Mo('Council tax per year', pay, 2), Ro('Per instalment', pay / v.n, 2), Ro('Before discount', full, 2), Ro('Discount saves you', full - pay, 2), Ro('Per week (52)', pay / 52, 2)], table: { head: ['Band', 'Yearly (before discount)', 'Per instalment'], rows: rows, fmt: ['', 'money', 'money'], title: 'All bands at your Band D' } };
    });

  C('payroll-tax-calculator', 'Payroll Tax Calculator (US employer & employee)', 'tax-salary/paycheck', 'Social Security, Medicare, FUTA and state unemployment tax on wages.', 'Employee FICA 7.65% + employer FICA 7.65% + FUTA 0.6% on the first $7,000 + state unemployment.',
    [['w', 'Annual wages per employee', 'm', 85000], ['n', 'Employees', 'i', 1], ['ssb', 'Social Security wage base', 'm', 184500], ['am', 'Additional Medicare threshold', 'm', 200000], ['fu', 'FUTA rate (after state credit)', 'p', 0.6], ['fb', 'FUTA wage base', 'm', 7000], ['su', 'State unemployment (SUTA) rate', 'p', 2.7], ['sb', 'SUTA wage base', 'm', 9000]],
    function (v) {
      var ss = Math.min(v.w, v.ssb) * 0.062, md = v.w * 0.0145, ad = Math.max(0, v.w - v.am) * 0.009, fu = Math.min(v.w, v.fb) * v.fu / 100, su = Math.min(v.w, v.sb) * v.su / 100;
      var emp = ss + md + ad, er = ss + md + fu + su;
      return { results: [Mo('Employer payroll tax per employee', er, 2), Ro('Employee FICA withheld', emp, 2), Ro('Employer Social Security', ss, 2), Ro('Employer Medicare', md, 2), Ro('FUTA', fu, 2), Ro('SUTA', su, 2), Ro('Total employer tax, all employees', er * v.n, 2), Rp('Employer tax as % of wages', er / v.w * 100)], chart: { type: 'donut', data: [{ l: 'Social Security', v: ss }, { l: 'Medicare', v: md }, { l: 'FUTA', v: fu }, { l: 'SUTA', v: su }], f: 'money' } };
    }, { pop: 1 });

  C('minimum-wage-calculator', 'Minimum Wage Calculator', 'tax-salary/hourly-overtime', 'Earnings at the minimum wage, and how your pay compares.', 'Pay = hourly minimum × hours per week × weeks per year.',
    [['mw', 'Minimum wage per hour', 'm', 7.25], ['h', 'Hours per week', 'n', 40], ['wk', 'Weeks worked per year', 'n', 52], ['yw', 'Your hourly pay (optional)', 'm', 11, '', { opt: 1 }]],
    function (v) {
      var y = v.mw * v.h * v.wk, res = [Mo('Yearly pay at minimum wage', y, 2), Ro('Monthly', y / 12, 2), Ro('Weekly', v.mw * v.h, 2), Ro('Daily (8 hours)', v.mw * 8, 2)];
      if (v.yw > 0) { res.push(Rp('Your pay vs minimum wage', (v.yw / v.mw - 1) * 100, 1)); res.push(Ro('Extra you earn per year', (v.yw - v.mw) * v.h * v.wk, 2)); }
      return { results: res };
    });

  C('employee-cost-calculator', 'True Cost of an Employee Calculator', 'tax-salary/hr-benefits', 'What an employee really costs you after taxes, benefits and overhead.', 'Total cost = salary + employer taxes + benefits + equipment + overhead.',
    [['s', 'Annual salary', 'm', 900000], ['t', 'Employer taxes / contributions', 'p', 13], ['b', 'Health insurance and benefits (per month)', 'm', 2500], ['rm', 'Retirement match', 'p', 4], ['bn', 'Bonus', 'p', 8], ['eq', 'Equipment and software (per year)', 'm', 40000], ['rc', 'Recruitment and onboarding (one-off)', 'm', 60000], ['oh', 'Office and admin overhead', 'p', 10], ['hr', 'Working hours per year', 'n', 2000]],
    function (v) {
      var tax = v.s * v.t / 100, ben = v.b * 12, ret = v.s * v.rm / 100, bon = v.s * v.bn / 100, oh = v.s * v.oh / 100, tot = v.s + tax + ben + ret + bon + v.eq + v.rc + oh;
      return { results: [Mo('Total yearly cost of the employee', tot), Rx('Multiple of salary', tot / v.s, 2, '×'), Ro('Cost per month', tot / 12), Ro('Cost per working hour', tot / v.hr, 2), Ro('Cost over and above salary', tot - v.s)], chart: { type: 'donut', data: [{ l: 'Salary', v: v.s }, { l: 'Taxes', v: tax }, { l: 'Benefits', v: ben }, { l: 'Retirement', v: ret }, { l: 'Bonus', v: bon }, { l: 'Equipment', v: v.eq }, { l: 'Recruitment', v: v.rc }, { l: 'Overhead', v: oh }], f: 'money' } };
    });

  C('purchasing-power-calculator', 'Purchasing Power Calculator', 'finance/interest-savings', 'How much your money will buy after years of inflation.', 'Future purchasing power = amount ÷ (1 + inflation)ⁿ.',
    [['a', 'Amount today', 'm', 100000], ['y', 'Years', 'i', 15], ['i', 'Average inflation', 'p', 6]],
    function (v) {
      var f = Math.pow(1 + v.i / 100, v.y), pts = [], lab = [], rows = [];
      for (var k = 0; k <= v.y; k++) { var pw = v.a / Math.pow(1 + v.i / 100, k); lab.push(String(k)); pts.push(pw); if (k % Math.max(1, Math.round(v.y / 15)) === 0 || k === v.y) rows.push([k, pw, v.a * Math.pow(1 + v.i / 100, k)]); }
      return { results: [Mo('What it will buy in ' + v.y + ' years (in today’s money)', v.a / f), Ro('Purchasing power lost', v.a - v.a / f), Rp('Loss of value', (1 - 1 / f) * 100, 1), Ro('Amount needed then to match today’s ' + CW.fmt.money(v.a, undefined, 0), v.a * f)], chart: { type: 'line', title: 'Real value of your money', labels: lab, series: [{ l: 'Purchasing power', pts: pts }], f: 'money' }, table: { head: ['Year', 'Real value', 'Needed to keep up'], rows: rows, fmt: ['int', 'money', 'money'], title: 'Year by year' } };
    }, { pop: 1 });

  C('marriage-planning-calculator', 'Marriage / Wedding Savings Planner', 'finance/budget', 'Monthly saving needed to fund a wedding on a future date.', 'Future cost = cost today × (1 + wedding inflation)ⁿ; monthly saving from the future-value formula.',
    [['c', 'Wedding budget at today’s prices', 'm', 2500000], ['y', 'Years until the wedding', 'i', 4], ['inf', 'Wedding cost inflation', 'p', 8], ['s', 'Already saved for this', 'm', 200000], ['r', 'Expected return on savings', 'p', 9]],
    function (v) {
      var fut = v.c * Math.pow(1 + v.inf / 100, v.y), n = v.y * 12, i = v.r / 1200, have = v.s * Math.pow(1 + i, n), need = Math.max(0, fut - have), pm = pmtFor(need, i, n), pts = [], lab = [];
      for (var k = 0; k <= v.y; k++) { lab.push('Year ' + k); pts.push(v.s * Math.pow(1 + i, k * 12) + fv(pm, i, k * 12)); }
      return { results: [Mo('Save every month', pm), Ro('Wedding cost at that time', fut), Ro('Your current savings grow to', have), Ro('Still to be built by saving', need), Ro('Total you will put in', pm * n)], chart: { type: 'line', title: 'Savings growth', labels: lab, series: [{ l: 'Savings', pts: pts }], f: 'money' } };
    });

  C('life-goal-planner-calculator', 'Life Goal Planner', 'finance/budget', 'Monthly investment needed for each of your life goals.', 'For every goal: future cost = cost × (1 + inflation)ⁿ, then monthly saving by the future-value formula.',
    [['g', 'Goals — "name years cost", one per line', 'ta', 'Child education 15 2500000\nHouse down payment 6 1500000\nCar 4 900000\nRetirement top-up 25 8000000', '', { rows: 5 }], ['inf', 'Inflation', 'p', 6], ['r', 'Expected return', 'p', 11]],
    function (v) {
      var gs = lines3(v.g); if (!gs.length) return { error: 'Enter lines like "House 6 1500000".' };
      var i = v.r / 1200, tot = 0, rows = gs.map(function (q) { var fut = q[2] * Math.pow(1 + v.inf / 100, q[1]), pm = pmtFor(fut, i, q[1] * 12); tot += pm; return [q[0], q[1], q[2], fut, pm]; });
      return { results: [Mo('Total monthly investment for all goals', tot), Rx('Goals', gs.length, 0), Ro('Largest single goal (monthly)', Math.max.apply(null, rows.map(function (x) { return x[4]; })))], table: { head: ['Goal', 'Years', 'Cost today', 'Cost then', 'Monthly saving'], rows: rows, fmt: ['', 'int', 'money', 'money', 'money'], title: 'Goal by goal' }, chart: { type: 'donut', data: rows.map(function (x) { return { l: x[0], v: x[4] }; }), f: 'money' } };
    });

  C('human-life-value-calculator', 'Human Life Value (HLV) Calculator', 'finance/insurance', 'Life cover you need based on your future earnings.', 'HLV = present value of (income − your own expenses) until retirement, with income growth and a discount rate.',
    [['inc', 'Annual income', 'm', 1200000], ['ex', 'Your personal expenses (per year)', 'm', 300000], ['age', 'Current age', 'i', 32], ['ret', 'Retirement age', 'i', 60], ['g', 'Expected income growth', 'p', 6], ['d', 'Discount rate', 'p', 8], ['ex2', 'Existing life cover', 'm', 5000000], ['ln', 'Loans outstanding', 'm', 2500000]],
    function (v) {
      var n = v.ret - v.age; if (n <= 0) return { error: 'Retirement age must be above your current age.' };
      var net = v.inc - v.ex, g = v.g / 100, d = v.d / 100, hlv = Math.abs(d - g) < 1e-9 ? net * n / (1 + g) : net * (1 - Math.pow((1 + g) / (1 + d), n)) / (d - g), need = hlv + v.ln - v.ex2;
      return { results: [Mo('Human Life Value', hlv), Rx('Years of earning left', n, 0), Ro('Plus loans to clear', v.ln), Ro('Existing cover', v.ex2), Ro(need > 0 ? 'Extra cover to buy' : 'You are over-covered by', Math.abs(need)), Rx('Cover as a multiple of income', (hlv + v.ln) / v.inc, 1, '×')] };
    }, { pop: 1 });

  C('lic-maturity-calculator', 'LIC Policy Maturity Calculator', 'finance/insurance', 'Maturity amount and real return of an endowment / money-back style policy.', 'Maturity = sum assured + reversionary bonus (rate per ₹1,000 × years) + final additional bonus.',
    [['sa', 'Sum assured', 'm', 1000000], ['t', 'Policy term (years)', 'i', 20], ['pr', 'Annual premium', 'm', 55000], ['b', 'Bonus rate per ₹1,000 sum assured per year', 'n', 48], ['fab', 'Final additional bonus (% of sum assured)', 'p', 10]],
    function (v) {
      var bon = v.sa / 1000 * v.b * v.t, fab = v.sa * v.fab / 100, mat = v.sa + bon + fab;
      var flows = []; for (var q = 0; q <= v.t; q++) flows.push(q === v.t ? mat : -v.pr); flows[0] = -v.pr;
      var ir = irr(flows) * 100, paid = v.pr * v.t;
      return { results: [Mo('Maturity amount', mat), Ro('Premiums paid in total', paid), Ro('Bonus added', bon), Ro('Final additional bonus', fab), Rp('Effective return (IRR) per year', ir, 2), Rx('Maturity ÷ premiums paid', mat / paid, 2, '×')], chart: { type: 'donut', data: [{ l: 'Sum assured', v: v.sa }, { l: 'Bonus', v: bon }, { l: 'Final bonus', v: fab }], f: 'money' }, note: 'Bonus rates change every year — enter the latest declared rate from your insurer.' };
    });

  C('health-insurance-premium-estimator', 'Health Insurance Premium Estimator', 'finance/insurance', 'A ballpark yearly premium for a family floater policy.', 'Premium ≈ base premium × age factor × cover factor × city factor × family factor × add-ons.',
    [['age', 'Age of the eldest member', 'i', 35], ['mem', 'Members covered', 's', 2, [[1, 'Just me'], [2, 'Me + spouse'], [3, 'Me + spouse + 1 child'], [4, 'Me + spouse + 2 children'], [5, 'Family + parents']]], ['si', 'Sum insured', 's', 1000000, [[300000, '3 lakh'], [500000, '5 lakh'], [1000000, '10 lakh'], [2500000, '25 lakh'], [5000000, '50 lakh'], [10000000, '1 crore']]], ['city', 'City', 's', 1, [[0.9, 'Tier 3'], [1, 'Tier 2'], [1.15, 'Tier 1 (metro)']]], ['sm', 'Smoker', 'c', 0], ['base', 'Base premium (age 30, 5 lakh, self)', 'm', 6500]],
    function (v) {
      var af = v.age < 25 ? 0.8 : v.age < 31 ? 1 : v.age < 36 ? 1.2 : v.age < 41 ? 1.55 : v.age < 46 ? 2 : v.age < 51 ? 2.7 : v.age < 56 ? 3.6 : v.age < 61 ? 4.8 : v.age < 66 ? 6.5 : 9;
      var cf = Math.pow(v.si / 500000, 0.6), ff = [1, 1.75, 2.1, 2.4, 3.6][v.mem - 1], sm = v.sm ? 1.2 : 1, p = v.base * af * cf * v.city * ff * sm, gst = p * 0.18;
      return { results: [Mo('Estimated yearly premium (before GST)', p), Ro('With 18% GST', p + gst), Ro('Per month', (p + gst) / 12), Rx('Age factor', af, 2, '×'), Rx('Cover factor', cf, 2, '×')], note: 'A rough guide only. Real quotes depend on insurer, medical history, riders and waiting periods.' };
    });

  C('pet-insurance-calculator', 'Pet Insurance Worth-It Calculator', 'finance/insurance', 'Is pet insurance cheaper than paying vet bills yourself?', 'Expected payout = reimbursement % × (vet costs − deductible), compared with the premium you pay.',
    [['pm', 'Monthly premium', 'm', 1800], ['ded', 'Annual deductible', 'm', 5000], ['rb', 'Reimbursement', 'p', 80], ['rc', 'Routine vet costs per year', 'm', 12000], ['ep', 'Chance of a major illness / accident in a year', 'p', 15], ['ec', 'Cost if it happens', 'm', 90000]],
    function (v) {
      var prem = v.pm * 12, base = v.rc, big = v.rc + v.ec, pay0 = Math.max(0, base - v.ded) * v.rb / 100, pay1 = Math.max(0, big - v.ded) * v.rb / 100, ep = v.ep / 100, exp = pay0 * (1 - ep) + pay1 * ep, selfCost = base * (1 - ep) + big * ep;
      return { results: [Mo('Expected yearly benefit minus premium', exp - prem), Ro('Premium per year', prem), Ro('Expected insurance payout', exp), Ro('Expected cost with no insurance', selfCost), Ro('Your cost in a bad year with insurance', big - pay1 + prem), Ro('Your cost in a bad year without', big)], note: 'Positive = insurance pays off on average. The real value is protection from a large one-off bill.' };
    });

  C('insurance-premium-calculator', 'Insurance Premium Calculator (Modal & GST)', 'finance/insurance', 'Annual vs monthly premium, GST and the hidden cost of paying in instalments.', 'Implied rate = the interest rate at which paying monthly equals paying the annual premium up front.',
    [['an', 'Annual premium (before GST)', 'm', 24000], ['mo', 'Monthly premium if paid in instalments', 'm', 2150], ['gst', 'GST', 'p', 18], ['cov', 'Cover (sum assured)', 'm', 10000000]],
    function (v) {
      var lo = 0, hi = 1, f = function (i) { var s = 0; for (var k = 0; k < 12; k++) s += v.mo / Math.pow(1 + i, k); return s - v.an; };
      var apr = 0; if (v.mo * 12 > v.an) { for (var q = 0; q < 100; q++) { var mid = (lo + hi) / 2; if (f(mid) > 0) lo = mid; else hi = mid; } apr = ((lo + hi) / 2) * 12 * 100; }
      return { results: [Mo('Annual premium incl. GST', v.an * (1 + v.gst / 100), 2), Ro('Monthly option incl. GST (×12)', v.mo * 12 * (1 + v.gst / 100), 2), Ro('Extra paid for monthly instalments', (v.mo * 12 - v.an) * (1 + v.gst / 100), 2), Rp('Implied interest on instalments (APR)', apr, 1), Ro('Premium per ₹1 lakh of cover', v.an / (v.cov / 100000), 2)] };
    });

  C('marginal-vs-effective-tax-calculator', 'Marginal vs Effective Tax Rate Calculator', 'tax-salary/income-tax', 'Your tax slab by slab, with marginal and effective rates.', 'Tax = sum of (income in each bracket × bracket rate).',
    [['inc', 'Taxable income', 'm', 120000], ['br', 'Brackets — "from rate", one per line', 'ta', '0 10\n11925 12\n48475 22\n103350 24\n197300 32\n250525 35\n626350 37', '', { rows: 7 }]],
    function (v) {
      var b = String(v.br).trim().split(/\n/).map(function (l) { var m = /^([\d.,]+)[\s:]+([\d.,]+)/.exec(l.trim()); return m ? [num(m[1]), num(m[2])] : null; }).filter(Boolean).sort(function (a, c) { return a[0] - c[0]; });
      if (!b.length) return { error: 'Enter brackets like "48475 22".' };
      var tax = 0, rows = [], marg = 0; b.forEach(function (x, i) { var hi = i < b.length - 1 ? b[i + 1][0] : Infinity, part = Math.max(0, Math.min(v.inc, hi) - x[0]); if (v.inc > x[0]) marg = x[1]; tax += part * x[1] / 100; if (part > 0) rows.push([x[0], hi === Infinity ? 'above' : hi, x[1], part, part * x[1] / 100]); });
      return { results: [Mp('Effective tax rate', tax / v.inc * 100, 2), Rp('Marginal rate (on your next unit of income)', marg, 1), Ro('Total tax', tax, 2), Ro('Income after tax', v.inc - tax, 2), Ro('Tax on an extra 10,000', 10000 * marg / 100, 2)], table: { head: ['From', 'To', 'Rate %', 'Income in slab', 'Tax'], rows: rows, fmt: ['money', '', 'num', 'money', 'money'], title: 'Slab by slab' } };
    }, { pop: 1 });

  /* ================= BUSINESS ================= */
  C('current-ratio-calculator', 'Current Ratio Calculator', 'business/accounting', 'Can the business pay its short-term bills? Current assets ÷ current liabilities.', 'Current ratio = current assets ÷ current liabilities. 1.5–2 is usually healthy.',
    [['ca', 'Current assets', 'm', 1850000], ['cl', 'Current liabilities', 'm', 1100000]],
    function (v) { var r = v.ca / v.cl; return { results: [Mx('Current ratio', r, 2, ': 1'), Ro('Working capital', v.ca - v.cl), Tx('Reading', r >= 2 ? 'Strong — comfortable cover' : r >= 1.2 ? 'Healthy' : r >= 1 ? 'Tight — watch cash flow' : 'Risky — liabilities exceed assets')] }; }, { pop: 1 });

  C('quick-ratio-calculator', 'Quick Ratio (Acid-Test) Calculator', 'business/accounting', 'Liquidity without counting inventory.', 'Quick ratio = (cash + marketable securities + receivables) ÷ current liabilities.',
    [['c', 'Cash and bank', 'm', 400000], ['s', 'Marketable securities', 'm', 150000], ['r', 'Accounts receivable', 'm', 600000], ['cl', 'Current liabilities', 'm', 1100000]],
    function (v) { var q = v.c + v.s + v.r, r = q / v.cl; return { results: [Mx('Quick ratio', r, 2, ': 1'), Ro('Quick assets', q), Rx('Cash ratio', (v.c + v.s) / v.cl, 2, ': 1'), Tx('Reading', r >= 1 ? 'Can meet short-term debts without selling stock' : 'Depends on selling inventory to pay bills')] }; });

  C('cogs-calculator', 'Cost of Goods Sold (COGS) Calculator', 'business/accounting', 'COGS, gross profit and inventory turnover.', 'COGS = opening inventory + purchases + freight − closing inventory.',
    [['op', 'Opening inventory', 'm', 500000], ['pu', 'Purchases during the period', 'm', 2400000], ['fr', 'Freight / direct costs', 'm', 120000], ['cl', 'Closing inventory', 'm', 650000], ['rev', 'Sales revenue', 'm', 4200000]],
    function (v) {
      var cg = v.op + v.pu + v.fr - v.cl, gp = v.rev - cg, avg = (v.op + v.cl) / 2;
      return { results: [Mo('Cost of goods sold', cg), Ro('Gross profit', gp), Rp('Gross margin', gp / v.rev * 100, 1), Rx('Inventory turnover', cg / avg, 2, '×'), Rx('Days to sell inventory', avg / cg * 365, 0, 'days')], chart: { type: 'donut', data: [{ l: 'COGS', v: cg }, { l: 'Gross profit', v: Math.max(0, gp) }], f: 'money' } };
    }, { pop: 1 });

  C('business-valuation-calculator', 'Business Valuation Calculator', 'business/startup', 'Value a small business by revenue, earnings, DCF and assets.', 'Several methods side by side: revenue multiple, EBITDA multiple, simple 5-year DCF and net assets.',
    [['rev', 'Annual revenue', 'm', 12000000], ['eb', 'EBITDA / owner earnings', 'm', 2400000], ['rm', 'Revenue multiple', 'n', 1.2], ['em', 'EBITDA multiple', 'n', 4.5], ['g', 'Growth for the next 5 years', 'p', 12], ['d', 'Discount rate', 'p', 18], ['tg', 'Long-term growth', 'p', 5], ['as', 'Total assets', 'm', 5000000], ['li', 'Total liabilities', 'm', 1800000]],
    function (v) {
      var a = v.rev * v.rm, b = v.eb * v.em, cf = v.eb, pv = 0; for (var k = 1; k <= 5; k++) { cf *= 1 + v.g / 100; pv += cf / Math.pow(1 + v.d / 100, k); }
      var tv = cf * (1 + v.tg / 100) / ((v.d - v.tg) / 100) / Math.pow(1 + v.d / 100, 5), dcf = pv + tv, nav = v.as - v.li, avg = (a + b + dcf) / 3;
      return { results: [Mo('Blended value (revenue, EBITDA, DCF)', avg), Ro('Revenue multiple method', a), Ro('EBITDA multiple method', b), Ro('Discounted cash flow', dcf), Ro('Net asset value (floor)', nav)], chart: { type: 'bar', title: 'Value by method', labels: ['Revenue ×', 'EBITDA ×', 'DCF', 'Net assets'], series: [{ l: 'Value', pts: [a, b, dcf, nav] }], f: 'money' } };
    }, { pop: 1 });

  C('late-payment-interest-calculator', 'Late Payment Interest Calculator (Invoices)', 'business/accounting', 'Interest you can charge on an overdue invoice.', 'Interest = invoice × annual rate × days late ÷ 365.',
    [['a', 'Invoice amount', 'm', 150000], ['due', 'Due date', 'd', -45], ['paid', 'Date paid (or today)', 'd', 0], ['r', 'Interest rate per year', 'p', 12], ['fee', 'Fixed recovery fee', 'm', 0, '', { opt: 1 }]],
    function (v) { var dl = days(v.due, v.paid); if (dl <= 0) return { results: [Mo('Interest due', 0), Tx('Status', 'Paid on time — nothing to charge')] }; var i = v.a * v.r / 100 * dl / 365; return { results: [Mo('Interest due', i, 2), Rx('Days late', dl, 0), Ro('Total to collect', v.a + i + v.fee, 2), Ro('Interest per day', v.a * v.r / 100 / 365, 2), Rp('Late cost as % of invoice', i / v.a * 100, 2)] }; });

  C('payroll-cost-calculator', 'Payroll Cost Calculator', 'business/accounting', 'Total monthly and yearly payroll cost for your team.', 'Payroll = salaries + employer contributions + benefits + bonuses.',
    [['n', 'Employees', 'i', 18], ['s', 'Average monthly salary', 'm', 45000], ['t', 'Employer taxes and contributions', 'p', 13], ['b', 'Benefits (% of salary)', 'p', 6], ['bn', 'Bonus (months of salary per year)', 'n', 1], ['rev', 'Yearly revenue (optional)', 'm', 15000000, '', { opt: 1 }]],
    function (v) {
      var base = v.n * v.s, mo = base * (1 + v.t / 100 + v.b / 100), yr = mo * 12 + base * v.bn * (1 + v.t / 100);
      var res = [Mo('Total payroll cost per year', yr), Ro('Per month (without bonus)', mo), Ro('Cost per employee per year', yr / v.n), Ro('Gross salaries only (month)', base)];
      if (v.rev > 0) res.push(Rp('Payroll as % of revenue', yr / v.rev * 100, 1)); return { results: res };
    });

  C('unit-economics-calculator', 'Unit Economics Calculator', 'business/startup', 'Contribution margin, LTV, CAC payback and LTV:CAC for one customer.', 'LTV = margin per month ÷ churn. LTV:CAC above 3 is generally healthy.',
    [['p', 'Revenue per customer per month', 'm', 1500], ['c', 'Variable cost per customer per month', 'm', 450], ['cac', 'Customer acquisition cost', 'm', 6000], ['ch', 'Monthly churn', 'p', 4]],
    function (v) {
      var cm = v.p - v.c, life = 100 / v.ch, ltv = cm * life, pay = v.cac / cm;
      return { results: [Mx('LTV : CAC', ltv / v.cac, 2, ': 1'), Ro('Contribution per customer per month', cm), Rp('Contribution margin', cm / v.p * 100, 1), Rx('Customer lifetime (months)', life, 1), Ro('Lifetime value (LTV)', ltv), Rx('CAC payback (months)', pay, 1), Tx('Reading', ltv / v.cac >= 3 ? 'Healthy' : ltv / v.cac >= 1 ? 'Thin — improve retention or CAC' : 'Losing money on each customer')] };
    }, { pop: 1 });

  C('cap-table-calculator', 'Cap Table & Funding Round Calculator', 'business/startup', 'Ownership before and after a funding round, including the option pool.', 'Investor % = investment ÷ post-money. Existing holders are diluted by the investor and any new pool.',
    [['h', 'Shareholders — "name shares", one per line', 'ta', 'Founder A 600000\nFounder B 300000\nESOP pool 100000', '', { rows: 5 }], ['inv', 'New investment', 'm', 20000000], ['pre', 'Pre-money valuation', 'm', 80000000], ['pool', 'New option pool (% of post-round)', 'p', 5]],
    function (v) {
      var hs = lines2(v.h); if (!hs.length) return { error: 'Enter lines like "Founder A 600000".' };
      var ex = hs.reduce(function (s, x) { return s + x[1]; }, 0), post = v.pre + v.inv, ip = v.inv / post, pp = v.pool / 100, tot = ex / (1 - ip - pp), inS = tot * ip, poS = tot * pp, price = v.inv / inS;
      var rows = hs.map(function (x) { return [x[0], x[1], x[1] / ex * 100, x[1], x[1] / tot * 100, x[1] * price]; }); rows.push(['New investor', 0, 0, inS, ip * 100, inS * price]); if (poS > 0) rows.push(['New option pool', 0, 0, poS, pp * 100, poS * price]);
      return { results: [Mp('Investor stake after the round', ip * 100, 2), Ro('Price per share', price, 2), Ro('Post-money valuation', post), Rx('Total shares after', tot, 0), Rp('Dilution to existing holders', (ip + pp) * 100, 2)], table: { head: ['Holder', 'Shares before', '% before', 'Shares after', '% after', 'Value now'], rows: rows, fmt: ['', 'num', 'pct', 'num', 'pct', 'money'], title: 'Cap table' }, chart: { type: 'donut', data: rows.map(function (x) { return { l: x[0], v: x[4] }; }), f: 'pct' } };
    }, { pop: 1 });

  C('saas-pricing-calculator', 'SaaS Pricing Calculator', 'business/startup', 'Price per user needed to cover costs and hit your margin.', 'Price = (fixed costs ÷ customers + variable cost per customer) ÷ (1 − target margin).',
    [['fx', 'Fixed costs per month (team, tools, hosting base)', 'm', 600000], ['vc', 'Variable cost per customer per month', 'm', 180], ['cu', 'Customers you expect', 'i', 800], ['mg', 'Target profit margin', 'p', 30], ['ch', 'Monthly churn', 'p', 3.5]],
    function (v) {
      var price = (v.fx / v.cu + v.vc) / (1 - v.mg / 100), mrr = price * v.cu, ltv = (price - v.vc) / (v.ch / 100);
      return { results: [Mo('Price per customer per month', price, 2), Ro('Monthly revenue (MRR)', mrr), Ro('Annual revenue (ARR)', mrr * 12), Ro('Monthly profit', mrr - v.fx - v.vc * v.cu), Ro('Customer LTV', ltv), Rx('Customers needed to break even', v.fx / (price - v.vc), 0)] };
    });

  C('nrr-calculator', 'Net Revenue Retention (NRR) Calculator', 'business/startup', 'NRR and gross revenue retention from your recurring revenue movements.', 'NRR = (starting MRR + expansion − contraction − churn) ÷ starting MRR.',
    [['s', 'Starting MRR', 'm', 1000000], ['e', 'Expansion MRR (upgrades)', 'm', 120000], ['c', 'Contraction MRR (downgrades)', 'm', 30000], ['ch', 'Churned MRR', 'm', 50000]],
    function (v) {
      var nrr = (v.s + v.e - v.c - v.ch) / v.s * 100, grr = (v.s - v.c - v.ch) / v.s * 100, pts = [], lab = [], m = v.s; for (var k = 0; k <= 12; k++) { lab.push('M' + k); pts.push(m); m *= (nrr / 100); }
      return { results: [Mp('Net revenue retention', nrr, 1), Rp('Gross revenue retention', grr, 1), Ro('Ending MRR from the same customers', v.s + v.e - v.c - v.ch), Tx('Reading', nrr >= 120 ? 'Excellent — growth without new customers' : nrr >= 100 ? 'Good — expansion offsets churn' : 'Below 100% — the base is shrinking')], chart: { type: 'line', title: 'Revenue from today’s customers if this repeats monthly', labels: lab, series: [{ l: 'MRR', pts: pts }], f: 'money' } };
    }, { pop: 1 });

  C('marketing-budget-calculator', 'Marketing Budget Calculator', 'business/marketing', 'How much to spend on marketing and how to split it across channels.', 'Budget = revenue × marketing % (by business stage), then split by channel.',
    [['rev', 'Yearly revenue', 'm', 20000000], ['st', 'Business stage', 's', 12, [[20, 'Early-stage startup (15–25%)'], [12, 'Growing business (10–15%)'], [8, 'Established (6–10%)'], [5, 'Mature / low-margin (3–6%)']]], ['sp', 'Split — "channel share%", one per line', 'ta', 'Performance ads 35\nSEO & content 25\nSocial media 15\nEmail & CRM 10\nEvents & PR 10\nBrand & creative 5', '', { rows: 6 }]],
    function (v) {
      var b = v.rev * v.st / 100, sp = lines2(v.sp), tot = sp.reduce(function (s, x) { return s + x[1]; }, 0) || 1;
      return { results: [Mo('Yearly marketing budget', b), Ro('Per month', b / 12), Ro('Per quarter', b / 4)], table: { head: ['Channel', 'Share', 'Yearly', 'Monthly'], rows: sp.map(function (x) { return [x[0], x[1] / tot * 100, b * x[1] / tot, b * x[1] / tot / 12]; }), fmt: ['', 'pct', 'money', 'money'], title: 'Channel split' }, chart: { type: 'donut', data: sp.map(function (x) { return { l: x[0], v: b * x[1] / tot }; }), f: 'money' } };
    });

  C('amazon-seller-fee-calculator', 'Amazon Seller Fee & Profit Calculator', 'business/ecommerce', 'Referral, closing and FBA fees, GST on fees and your net profit per sale.', 'Net payout = price − referral fee − closing fee − fulfilment fee − GST on fees.',
    [['p', 'Selling price', 'm', 1499], ['rf', 'Referral fee', 'p', 12], ['cf', 'Closing fee', 'm', 20], ['fb', 'Fulfilment / shipping fee', 'm', 65], ['gst', 'GST on Amazon fees', 'p', 18], ['pc', 'Product cost', 'm', 600], ['rt', 'Return rate', 'p', 8], ['ad', 'Ad cost per sale', 'm', 90]],
    function (v) {
      var ref = v.p * v.rf / 100, fees = ref + v.cf + v.fb, gst = fees * v.gst / 100, pay = v.p - fees - gst, ret = v.p * v.rt / 100 * 0.3, profit = pay - v.pc - v.ad - ret;
      return { results: [Mo('Profit per sale', profit, 2), Ro('Amount Amazon pays you', pay, 2), Ro('Total Amazon fees (with GST)', fees + gst, 2), Rp('Fees as % of price', (fees + gst) / v.p * 100, 1), Rp('Net margin', profit / v.p * 100, 1), Ro('Break-even price', (v.pc + v.ad + ret + (v.cf + v.fb) * (1 + v.gst / 100)) / (1 - v.rf / 100 * (1 + v.gst / 100)), 2)], chart: { type: 'donut', data: [{ l: 'Product cost', v: v.pc }, { l: 'Amazon fees + GST', v: fees + gst }, { l: 'Ads + returns', v: v.ad + ret }, { l: 'Profit', v: Math.max(0, profit) }], f: 'money' }, note: 'Fee percentages vary by category and price band; update them from the current Seller Central rate card.' };
    }, { pop: 1 });

  C('shipping-cost-calculator', 'Shipping Cost Calculator', 'business/ecommerce', 'Chargeable weight and delivery charge from size and weight.', 'Volumetric weight = L × W × H ÷ divisor. Chargeable weight is the higher of actual and volumetric.',
    [['w', 'Actual weight (kg)', 'n', 1.8], ['l', 'Length (cm)', 'n', 40], ['wd', 'Width (cm)', 'n', 30], ['h', 'Height (cm)', 'n', 20], ['dv', 'Volumetric divisor', 's', 5000, [[5000, '5000 (courier standard)'], [4000, '4000'], [6000, '6000 (air cargo)']]], ['b', 'Rate for the first 0.5 kg', 'm', 45], ['a', 'Rate per extra 0.5 kg', 'm', 38], ['fs', 'Fuel surcharge', 'p', 12], ['cod', 'COD / insurance fee', 'm', 30], ['gst', 'GST', 'p', 18]],
    function (v) {
      var vol = v.l * v.wd * v.h / v.dv, ch = Math.max(v.w, vol), slabs = Math.max(1, Math.ceil(ch / 0.5)), base = v.b + (slabs - 1) * v.a, fs = base * v.fs / 100, sub = base + fs + v.cod, tot = sub * (1 + v.gst / 100);
      return { results: [Mo('Shipping charge incl. GST', tot, 2), Rx('Volumetric weight', vol, 2, 'kg'), Rx('Chargeable weight', ch, 2, 'kg'), Ro('Base freight', base, 2), Ro('Fuel surcharge', fs, 2), Ro('Cost per kg', tot / ch, 2)] };
    });

  C('wholesale-price-calculator', 'Wholesale Price Calculator', 'business/pricing', 'Wholesale price and margins from the retail price (keystone or custom).', 'Wholesale = retail × (1 − retailer margin). Keystone pricing means a 50% retailer margin.',
    [['rp', 'Retail price', 'm', 2000], ['rm', 'Retailer margin on retail price', 'p', 50], ['dm', 'Distributor margin on wholesale price', 'p', 0], ['cost', 'Your production cost per unit', 'm', 520]],
    function (v) {
      var ws = v.rp * (1 - v.rm / 100), mf = ws * (1 - v.dm / 100);
      return { results: [Mo('Wholesale price', ws, 2), Ro('You receive (after distributor)', mf, 2), Ro('Your profit per unit', mf - v.cost, 2), Rp('Your margin', (mf - v.cost) / mf * 100, 1), Rp('Markup on cost', (mf - v.cost) / v.cost * 100, 1), Ro('Retailer profit per unit', v.rp - ws, 2)] };
    });

  C('return-rate-cost-calculator', 'Return Rate Cost Calculator', 'business/ecommerce', 'What product returns cost your store.', 'Cost = returned orders × (shipping both ways + handling + value lost).',
    [['o', 'Orders per month', 'n', 1500], ['rr', 'Return rate', 'p', 14], ['av', 'Average order value', 'm', 1400], ['sh', 'Shipping cost (both ways)', 'm', 140], ['hd', 'Handling per return', 'm', 35], ['rs', 'Items you can resell', 'p', 75], ['gm', 'Gross margin on sales', 'p', 40]],
    function (v) {
      var rt = v.o * v.rr / 100, lost = (1 - v.rs / 100) * v.av * (1 - v.gm / 100) + v.sh + v.hd, tot = rt * lost, rev = rt * v.av;
      return { results: [Mo('Monthly cost of returns', tot), Rx('Returned orders per month', rt, 0), Ro('Cost per return', lost, 2), Ro('Yearly cost', tot * 12), Ro('Revenue refunded per month', rev), Rp('Share of gross profit lost', tot / (v.o * v.av * v.gm / 100) * 100, 1)] };
    });

  C('facebook-video-earnings-calculator', 'Facebook Video Earnings Calculator', 'business/creators', 'Estimated income from Facebook in-stream ads and bonuses.', 'Earnings = views ÷ 1,000 × RPM. RPM varies widely by audience country.',
    [['v', 'Monthly video views', 'n', 2000000], ['rpm', 'Earnings per 1,000 views (RPM)', 'm', 30], ['sh', 'Your share of ad revenue', 'p', 55], ['bn', 'Bonuses / other income per month', 'm', 0, '', { opt: 1 }]],
    function (v) { var g = v.v / 1000 * v.rpm, y = g * v.sh / 100 + v.bn; return { results: [Mo('Estimated monthly earnings', y), Ro('Per year', y * 12), Ro('Gross ad revenue', g), Ro('Earnings per 1,000 views', y / v.v * 1000, 2)] }; });

  C('blog-income-calculator', 'Blog Income Calculator', 'business/creators', 'Monthly blog income from ads, affiliates and sponsored posts.', 'Income = pageviews ÷ 1,000 × RPM + affiliate sales + sponsorships − costs.',
    [['pv', 'Monthly pageviews', 'n', 80000], ['rpm', 'Ad RPM', 'm', 150], ['ac', 'Affiliate clicks per month', 'n', 2400], ['cv', 'Affiliate conversion', 'p', 2.5], ['cm', 'Average commission per sale', 'm', 220], ['sp', 'Sponsored posts per month', 'n', 1], ['spp', 'Price per sponsored post', 'm', 12000], ['cost', 'Hosting, tools, writers (per month)', 'm', 9000]],
    function (v) { var ad = v.pv / 1000 * v.rpm, af = v.ac * v.cv / 100 * v.cm, sp = v.sp * v.spp, tot = ad + af + sp; return { results: [Mo('Monthly profit', tot - v.cost), Ro('Gross income', tot), Ro('Ads', ad), Ro('Affiliate', af), Ro('Sponsored posts', sp), Ro('Yearly profit', (tot - v.cost) * 12)], chart: { type: 'donut', data: [{ l: 'Ads', v: ad }, { l: 'Affiliate', v: af }, { l: 'Sponsored', v: sp }], f: 'money' } }; });

  C('newsletter-revenue-calculator', 'Newsletter Revenue Calculator', 'business/creators', 'Income from paid subscribers and sponsorships.', 'Revenue = paid subscribers × price + sponsorship CPM × opens.',
    [['sub', 'Free subscribers', 'n', 15000], ['pc', 'Convert to paid', 'p', 4], ['pr', 'Paid price per month', 'm', 399], ['op', 'Open rate', 'p', 45], ['is', 'Issues sponsored per month', 'n', 4], ['cpm', 'Sponsor CPM', 'm', 2500], ['pf', 'Platform and payment fees', 'p', 12]],
    function (v) { var paid = v.sub * v.pc / 100, sub = paid * v.pr, sp = v.sub * v.op / 100 / 1000 * v.cpm * v.is, tot = (sub + sp) * (1 - v.pf / 100); return { results: [Mo('Monthly income after fees', tot), Rx('Paid subscribers', paid, 0), Ro('Subscription revenue', sub), Ro('Sponsorship revenue', sp), Ro('Yearly income', tot * 12)], chart: { type: 'donut', data: [{ l: 'Subscriptions', v: sub }, { l: 'Sponsors', v: sp }], f: 'money' } }; });

  C('food-delivery-rider-earnings-calculator', 'Food Delivery Rider Earnings Calculator', 'business/creators', 'What a delivery partner really earns after fuel and bike costs.', 'Net = (orders × payout + incentives) − fuel − maintenance.',
    [['o', 'Orders per day', 'n', 22], ['p', 'Payout per order', 'm', 38], ['inc', 'Incentive per day', 'm', 150], ['km', 'Distance per order (km)', 'n', 4.5], ['mil', 'Bike mileage (km per litre)', 'n', 45], ['fp', 'Petrol price per litre', 'm', 100], ['mt', 'Maintenance and tyres per km', 'm', 1.2], ['d', 'Working days per month', 'n', 26]],
    function (v) { var gross = v.o * v.p + v.inc, km = v.o * v.km * 1.6, fuel = km / v.mil * v.fp, mt = km * v.mt, net = gross - fuel - mt; return { results: [Mo('Net monthly earnings', net * v.d), Ro('Net per day', net), Ro('Gross per day', gross), Ro('Fuel per day', fuel), Ro('Maintenance per day', mt), Rx('Distance ridden per day (incl. returns)', km, 0, 'km')] }; });

  C('airbnb-income-calculator', 'Airbnb Income Calculator', 'real-estate/rental', 'Net income from a short-term rental after fees and costs.', 'Net = nights booked × rate − platform fee − cleaning − running costs.',
    [['r', 'Nightly rate', 'm', 4500], ['oc', 'Occupancy', 'p', 62], ['st', 'Average stay (nights)', 'n', 3], ['cl', 'Cleaning cost per stay', 'm', 800], ['fee', 'Platform fee', 'p', 3], ['mg', 'Monthly costs (utilities, internet, supplies)', 'm', 12000], ['rent', 'Monthly rent / EMI', 'm', 35000]],
    function (v) { var nights = 30.4 * v.oc / 100, rev = nights * v.r, stays = nights / v.st, cl = stays * v.cl, fee = rev * v.fee / 100, net = rev - fee - cl - v.mg - v.rent; return { results: [Mo('Net income per month', net), Ro('Revenue per month', rev), Rx('Nights booked', nights, 1), Ro('Platform fees', fee), Ro('Cleaning', cl), Ro('Net per year', net * 12), Rp('Break-even occupancy', (v.rent + v.mg) / (30.4 * v.r * (1 - v.fee / 100) - 0) * 100, 1)] }; });

  C('one-percent-rule-calculator', '1% Rule & 2% Rule Calculator', 'real-estate/rental', 'Does a rental property pass the 1% / 2% rule?', 'Monthly rent should be at least 1% (or 2%) of the purchase price plus repairs.',
    [['p', 'Purchase price', 'm', 6000000], ['rp', 'Repairs / renovation', 'm', 300000], ['r', 'Expected monthly rent', 'm', 55000]],
    function (v) { var tot = v.p + v.rp, pct = v.r / tot * 100; return { results: [Mp('Monthly rent as % of cost', pct, 2), Tx('1% rule', pct >= 1 ? 'Passes' : 'Fails'), Tx('2% rule', pct >= 2 ? 'Passes' : 'Fails'), Ro('Rent needed for 1%', tot * 0.01), Ro('Rent needed for 2%', tot * 0.02), Rp('Gross yield per year', v.r * 12 / tot * 100, 2), Rp('Estimated net yield (50% rule)', v.r * 12 * 0.5 / tot * 100, 2)] }; });

  C('rent-affordability-calculator', 'Rent Affordability Calculator', 'real-estate/buying', 'How much rent you can afford from your income.', 'Common rule: rent ≤ 30% of gross income; landlords often ask for income ≥ 40× monthly rent.',
    [['inc', 'Monthly gross income', 'm', 90000], ['db', 'Monthly debt payments', 'm', 8000], ['pc', 'Share of income for rent', 'p', 30], ['ut', 'Utilities and maintenance', 'm', 4000]],
    function (v) { var rent = v.inc * v.pc / 100, safe = Math.max(0, (v.inc * 0.43 - v.db)), mx = Math.min(rent, safe) - 0; return { results: [Mo('Comfortable rent', rent), Ro('Rent landlords would accept (income ÷ 40)', v.inc * 12 / 40), Ro('Max rent with debts (43% total rule)', safe), Ro('Total housing cost with utilities', rent + v.ut), Rp('Left for everything else', 100 - (rent + v.ut + v.db) / v.inc * 100, 0)] }; });

  C('remittance-cost-calculator', 'Money Transfer Cost Calculator', 'converters/currency', 'The real cost of sending money abroad, including the hidden FX margin.', 'Cost = fees + (mid-market rate − offered rate) × amount.',
    [['a', 'Amount you send', 'm', 100000], ['mid', 'Mid-market exchange rate', 'n', 0.0119], ['off', 'Rate the provider offers', 'n', 0.01155], ['ff', 'Flat fee', 'm', 500], ['pf', 'Percentage fee', 'p', 0.5]],
    function (v) { var fee = v.ff + v.a * v.pf / 100, rec = (v.a - fee) * v.off, ideal = v.a * v.mid, cost = (ideal - rec) / v.mid; return { results: [Mx('Recipient gets', rec, 2), Mx('They would get at mid-market', ideal, 2), Ro('Total cost of sending', cost, 2), Rp('Cost as % of amount', cost / v.a * 100, 2), Ro('Hidden FX margin (in your currency)', (v.mid - v.off) / v.mid * (v.a - fee), 2)] }; });

  C('shift-rota-calculator', 'Shift Rota Calculator', 'date-time/time-calc', 'Working days and days off for common shift patterns.', 'The pattern repeats from your start date.',
    [['pt', 'Pattern', 's', 1, [[1, '4 on, 4 off'], [2, '4 on, 2 off'], [3, '5 on, 2 off'], [4, '3 on, 3 off'], [5, '6 on, 3 off'], [6, '7 on, 7 off'], [7, '2 on, 2 off'], [8, '5 on, 3 off']]], ['st', 'First working day', 'd', 0], ['n', 'Days to show', 'i', 28]],
    function (v) {
      var P = { 1: [4, 4], 2: [4, 2], 3: [5, 2], 4: [3, 3], 5: [6, 3], 6: [7, 7], 7: [2, 2], 8: [5, 3] }[v.pt], on = P[0], cyc = P[0] + P[1], rows = [], wk = 0, n = Math.min(120, Math.max(7, Math.round(v.n)));
      for (var k = 0; k < n; k++) { var d = new Date(v.st.getTime() + k * 86400000), w = (k % cyc) < on; if (w) wk++; rows.push([d.toDateString(), w ? 'Working' : 'Off']); }
      return { results: [Mx('Working days in ' + n + ' days', wk, 0), Rx('Days off', n - wk, 0), Rp('Share of days worked', wk / n * 100, 0), Rx('Cycle length', cyc, 0, 'days'), Rx('Working days per year', 365 * on / cyc, 0)], table: { head: ['Date', 'Shift'], rows: rows, fmt: ['', ''], title: 'Rota' } };
    });

  /* ================= CRYPTO ================= */
  C('crypto-staking-rewards-calculator', 'Crypto Staking Rewards Calculator', 'tech/crypto', 'Rewards you can earn from staking, with compounding.', 'Balance = stake × (1 + APY ÷ n)^(n × years), after validator commission.',
    [['a', 'Coins staked', 'n', 10], ['apy', 'Staking APR', 'p', 5.2], ['cm', 'Validator commission', 'p', 5], ['f', 'Rewards compounded', 's', 365, [[1, 'Yearly'], [12, 'Monthly'], [365, 'Daily'], [0.0001, 'Never (simple)']]], ['y', 'Years', 'i', 3], ['pr', 'Price per coin now', 'm', 250000], ['pc', 'Expected price change over the period', 'p', 0]],
    function (v) {
      var r = v.apy * (1 - v.cm / 100) / 100, pts = [], lab = [], rows = [], end;
      for (var k = 0; k <= v.y; k++) { var b = v.f < 1 ? v.a * (1 + r * k) : v.a * Math.pow(1 + r / v.f, v.f * k); pts.push(b); lab.push('Year ' + k); if (k > 0) rows.push([k, b - v.a, b]); end = b; }
      var pe = v.pr * (1 + v.pc / 100);
      return { results: [Mx('Coins after ' + v.y + ' years', end, 4), Rx('Rewards earned (coins)', end - v.a, 4), Ro('Value of rewards at the future price', (end - v.a) * pe), Ro('Total value then', end * pe), Rp('Effective APY after commission', (Math.pow(1 + r / (v.f < 1 ? 1 : v.f), v.f < 1 ? 1 : v.f) - 1) * 100, 2)], chart: { type: 'line', title: 'Staked balance', labels: lab, series: [{ l: 'Coins', pts: pts }], f: 'num' }, table: { head: ['Year', 'Rewards so far', 'Balance'], rows: rows, fmt: ['int', 'num', 'num'], title: 'Year by year' } };
    });

  C('crypto-mining-profitability-calculator', 'Bitcoin Mining Profitability Calculator', 'tech/crypto', 'Daily profit and payback of a Bitcoin miner after electricity.', 'Coins per day = your hashrate ÷ network hashrate × 144 blocks × block reward.',
    [['h', 'Your hashrate (TH/s)', 'n', 200], ['pw', 'Power use (watts)', 'n', 3500], ['el', 'Electricity price per kWh', 'm', 6], ['nh', 'Network hashrate (EH/s)', 'n', 900], ['br', 'Block reward (BTC)', 'n', 3.125], ['pf', 'Pool fee', 'p', 2], ['pr', 'Bitcoin price', 'm', 8000000], ['hw', 'Miner cost', 'm', 350000]],
    function (v) {
      var coins = v.h / (v.nh * 1e6) * 144 * v.br * (1 - v.pf / 100), rev = coins * v.pr, cost = v.pw / 1000 * 24 * v.el, pr = rev - cost, back = pr > 0 ? v.hw / pr : NaN;
      return { results: [Mo('Profit per day', pr, 2), Ro('Revenue per day', rev, 2), Ro('Electricity per day', cost, 2), Mx('Bitcoin mined per day', coins, 8), Ro('Profit per month', pr * 30.4, 0), pr > 0 ? Rx('Miner pays back in', back, 0, 'days') : Tx('Payback', 'Not profitable at this power price'), Ro('Break-even electricity price / kWh', rev / (v.pw / 1000 * 24), 2)] };
    });

  C('eth-gas-fee-calculator', 'Ethereum Gas Fee Calculator', 'tech/crypto', 'Transaction fee in ETH and in money from gas and gwei.', 'Fee = gas used × (base fee + priority tip) × 10⁻⁹ ETH.',
    [['g', 'Transaction type', 's', 21000, [[21000, 'ETH transfer (21,000)'], [65000, 'Token transfer (65,000)'], [150000, 'Token swap (150,000)'], [120000, 'NFT mint (120,000)'], [250000, 'Add liquidity (250,000)']]], ['bf', 'Base fee (gwei)', 'n', 8], ['tip', 'Priority tip (gwei)', 'n', 1.5], ['pr', 'ETH price', 'm', 280000]],
    function (v) { var eth = v.g * (v.bf + v.tip) * 1e-9; return { results: [Mo('Fee in money', eth * v.pr, 2), Mx('Fee in ETH', eth, 6), Rx('Gas price total', v.bf + v.tip, 2, 'gwei'), Ro('Cost of 10 such transactions', eth * v.pr * 10, 2)] }; });

  C('impermanent-loss-calculator', 'Impermanent Loss Calculator', 'tech/crypto', 'Loss versus simply holding when you provide liquidity to an AMM pool.', 'IL = 2√r ÷ (1 + r) − 1, where r is the price ratio change between the two tokens.',
    [['a', 'Amount deposited', 'm', 100000], ['c1', 'Token A price change', 'p', 80], ['c2', 'Token B price change', 'p', 0], ['apr', 'Fee APR you earn', 'p', 18], ['d', 'Days in the pool', 'n', 90]],
    function (v) {
      var r = (1 + v.c1 / 100) / (1 + v.c2 / 100), il = 2 * Math.sqrt(r) / (1 + r) - 1, hold = v.a * (1 + (v.c1 + v.c2) / 200), lp = hold * (1 + il), fees = lp * v.apr / 100 * v.d / 365, rows = [];
      [-75, -50, -25, 0, 25, 50, 100, 200, 400].forEach(function (c) { var rr = 1 + c / 100; rows.push([c, (2 * Math.sqrt(rr) / (1 + rr) - 1) * 100]); });
      return { results: [Mp('Impermanent loss', il * 100, 2), Ro('Value if you just held', hold), Ro('Value in the pool (no fees)', lp), Ro('Fees earned', fees), Ro('Pool + fees vs holding', lp + fees - hold), Tx('Verdict', lp + fees >= hold ? 'Fees cover the loss' : 'Holding would have been better')], table: { head: ['Price change of A vs B %', 'Impermanent loss %'], rows: rows, fmt: ['int', 'pct'], title: 'Loss at different moves' } };
    });

  C('crypto-dca-calculator', 'Crypto DCA Calculator', 'tech/crypto', 'Average cost and result of buying a fixed amount every period.', 'Average cost = total invested ÷ coins bought.',
    [['amt', 'Amount invested each period', 'm', 5000], ['pr', 'Price at each purchase — comma or new-line separated', 'ta', '7200000, 6800000, 6100000, 6500000, 7000000, 7700000, 8400000, 8100000, 8900000, 9400000', '', { rows: 3 }], ['fee', 'Fee per purchase', 'p', 0.5]],
    function (v) {
      var p = nums(v.pr).filter(function (x) { return x > 0; }); if (p.length < 2) return { error: 'Enter at least two prices.' };
      var coins = 0, inv = 0, rows = [], pts = [], lab = []; p.forEach(function (x, i) { var c = v.amt * (1 - v.fee / 100) / x; coins += c; inv += v.amt; rows.push([i + 1, x, c, inv, coins * x]); lab.push(String(i + 1)); pts.push(coins * x); });
      var last = p[p.length - 1], val = coins * last, lump = inv * (1 - v.fee / 100) / p[0] * last;
      return { results: [Mp('Profit / loss on DCA', (val - inv) / inv * 100, 2), Ro('Total invested', inv), Ro('Value now', val), Ro('Average cost per coin', inv / coins, 0), Mx('Coins owned', coins, 6), Ro('If you invested everything at the start', lump)], chart: { type: 'line', title: 'Portfolio value', labels: lab, series: [{ l: 'Value', pts: pts }], f: 'money' }, table: { head: ['#', 'Price', 'Coins bought', 'Invested', 'Value'], rows: rows, fmt: ['int', 'money', 'num', 'money', 'money'], title: 'Purchases' } };
    });

  CW.setCur(['atal-pension-yojana-calculator', 'lic-maturity-calculator', 'health-insurance-premium-estimator', 'marriage-planning-calculator', 'food-delivery-rider-earnings-calculator', 'insurance-premium-calculator'], 'INR');
  CW.setCur(['cpp-calculator'], 'CAD');
  CW.setCur(['council-tax-calculator'], 'GBP');
  CW.setCur(['payroll-tax-calculator', 'minimum-wage-calculator', 'marginal-vs-effective-tax-calculator'], 'USD');
  CW.defBase = null;
})(window.CW);
