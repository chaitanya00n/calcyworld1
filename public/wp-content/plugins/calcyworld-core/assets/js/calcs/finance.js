/* Calcyworld — Money & Finance calculators */
(function (CW) {
  'use strict';
  var r = function (l, v, f, x) { var o = { l: l, v: v, f: f || 'money' }; if (x) for (var k in x) o[k] = x[k]; return o; };
  var M = function (l, v, f, x) { x = x || {}; x.main = true; return r(l, v, f, x); };
  var IN = function (ctx) { return ctx.country.code === 'IN'; };

  /* ---------- shared maths ---------- */
  function emi(p, annual, months) {
    var i = annual / 1200;
    if (months <= 0) return NaN;
    if (i === 0) return p / months;
    var f = Math.pow(1 + i, months);
    return p * i * f / (f - 1);
  }
  function schedule(p, annual, months, pay, extra) {
    var i = annual / 1200, bal = p, yearly = [], monthly = [], m = 0, totI = 0, y = { p: 0, i: 0 };
    extra = extra || 0;
    while (bal > 0.005 && m < 1200) {
      m++;
      var int = bal * i, prin = Math.min(bal, pay + extra - int);
      if (prin <= 0) return null;
      bal -= prin; totI += int; y.p += prin; y.i += int;
      monthly.push([m, prin + int, prin, int, Math.max(bal, 0)]);
      if (m % 12 === 0 || bal <= 0.005) { yearly.push([Math.ceil(m / 12), y.p, y.i, Math.max(bal, 0)]); y = { p: 0, i: 0 }; }
    }
    return { months: m, interest: totI, yearly: yearly, monthly: monthly };
  }
  function addMonths(n) { var d = new Date(); d.setMonth(d.getMonth() + Math.round(n)); return d; }
  function yrsMo(m) { m = Math.round(m); var y = Math.floor(m / 12), mo = m % 12; return (y ? y + ' yr ' : '') + (mo ? mo + ' mo' : (y ? '' : '0 mo')); }
  CW.fin = { emi: emi, schedule: schedule, yrsMo: yrsMo };
  /* 2026 US federal tax on taxable income (brackets match the paycheck calculator). */
  CW.fin.usTax = function (ti, fs) {
    var B = { s: [[12400, 10], [50400, 12], [105700, 22], [201775, 24], [256225, 32], [640600, 35], [Infinity, 37]], mfj: [[24800, 10], [100800, 12], [211400, 22], [403550, 24], [512450, 32], [768700, 35], [Infinity, 37]],
      hoh: [[17700, 10], [67450, 12], [105700, 22], [201750, 24], [256200, 32], [640600, 35], [Infinity, 37]] }[fs || 's'];
    var t = 0, prev = 0, marg = 10; B.forEach(function (b) { if (ti > prev) { t += (Math.min(ti, b[0]) - prev) * b[1] / 100; marg = b[1]; } prev = b[0]; });
    return { tax: t, marginal: marg };
  };

  function indiaTaxNew(taxable) {
    var slabs = [[400000, 0], [800000, 5], [1200000, 10], [1600000, 15], [2000000, 20], [2400000, 25], [Infinity, 30]];
    var t = 0, prev = 0, rows = [];
    slabs.forEach(function (s) { if (taxable > prev) { var amt = Math.min(taxable, s[0]) - prev; t += amt * s[1] / 100; rows.push([s[0] === Infinity ? 'Above ₹24 lakh' : '₹' + prev / 1e5 + 'L – ₹' + s[0] / 1e5 + 'L', s[1], amt * s[1] / 100]); } prev = s[0]; });
    if (taxable <= 1200000) t = 0; else t = Math.min(t, taxable - 1200000); // 87A rebate + marginal relief
    var sc = taxable > 2e7 ? 0.25 : taxable > 1e7 ? 0.15 : taxable > 5e6 ? 0.10 : 0;
    var tax = t * (1 + sc); return { base: t, surcharge: t * sc, cess: tax * 0.04, total: tax * 1.04, rows: rows };
  }
  function indiaTaxOld(taxable, age) {
    var ex = age === 'super' ? 500000 : age === 'senior' ? 300000 : 250000;
    var slabs = [[ex, 0], [500000, 5], [1000000, 20], [Infinity, 30]];
    var t = 0, prev = 0;
    slabs.forEach(function (s) { if (taxable > prev && s[0] > prev) { t += (Math.min(taxable, s[0]) - prev) * s[1] / 100; } prev = Math.max(prev, s[0]); });
    if (taxable <= 500000) t = Math.max(0, t - 12500);
    var sc = taxable > 5e7 ? 0.37 : taxable > 2e7 ? 0.25 : taxable > 1e7 ? 0.15 : taxable > 5e6 ? 0.10 : 0;
    var tax = t * (1 + sc); return { base: t, surcharge: t * sc, cess: tax * 0.04, total: tax * 1.04 };
  }
  CW.inTax = { newRegime: indiaTaxNew, oldRegime: indiaTaxOld };

  function loanResult(p, rate, months, title) {
    var pay = emi(p, rate, months);
    var s = schedule(p, rate, months, pay);
    if (!s) return { error: 'Please check the loan details.' };
    return {
      results: [M(title || 'Monthly payment', pay), r('Total interest', s.interest), r('Total amount paid', p + s.interest), r('Loan amount', p), r('Payoff date', addMonths(months), 'date')],
      chart: { type: 'donut', f: 'money', data: [{ l: 'Principal', v: p }, { l: 'Interest', v: s.interest }] },
      table: { title: 'Year-by-year schedule', head: ['Year', 'Principal paid', 'Interest paid', 'Balance'], fmt: ['int', 'money', 'money', 'money'], rows: s.yearly }
    };
  }
  var TENURE_UNIT = { k: 'unit', l: 'Tenure in', t: 'seg', v: 'y', o: [['y', 'Years'], ['m', 'Months']] };
  var months = function (v) { return v.unit === 'm' ? Math.round(v.n) : Math.round(v.n * 12); };

  CW.register([
  {
    id: 'paycheck-calculator', title: 'Paycheck Calculator (US Take-Home Pay 2026)', sec: 'finance', sub: 'Salary, Pay & HR', pop: 1,
    desc: 'Estimate your take-home pay per paycheck after 2026 federal income tax, Social Security, Medicare, 401(k) and state income tax.',
    formula: 'Taxable = salary − pre-tax 401(k) − standard deduction. Federal tax uses the 2026 IRS brackets. Social Security 6.2% up to $184,500; Medicare 1.45% plus 0.9% above $200,000 ($250,000 joint).',
    faq: [['What is the 2026 standard deduction?', '$16,100 for single filers, $32,200 for married couples filing jointly and $24,150 for heads of household (IRS Rev. Proc. 2025-32).'],
      ['Why is state tax a percentage?', 'Every state taxes income differently (and some, like Texas and Florida, have no income tax). Enter your state’s approximate effective rate for a quick estimate.']],
    inputs: [{ k: 'sal', l: 'Annual salary', t: 'money', v: 75000, local: {} }, { k: 'fs', l: 'Filing status', t: 'select', v: 's', o: [['s', 'Single'], ['mfj', 'Married filing jointly'], ['hoh', 'Head of household']] },
      { k: 'freq', l: 'Pay frequency', t: 'select', v: '26', o: [['52', 'Weekly'], ['26', 'Every two weeks'], ['24', 'Twice a month'], ['12', 'Monthly']] },
      { k: 'k401', l: '401(k) contribution', t: 'percent', v: 5, opt: 1 }, { k: 'st', l: 'State income tax (effective)', t: 'percent', v: 4, opt: 1 }],
    calc: function (v) {
      var B = { s: [[12400, 10], [50400, 12], [105700, 22], [201775, 24], [256225, 32], [640600, 35], [Infinity, 37]], mfj: [[24800, 10], [100800, 12], [211400, 22], [403550, 24], [512450, 32], [768700, 35], [Infinity, 37]],
        hoh: [[17700, 10], [67450, 12], [105700, 22], [201750, 24], [256200, 32], [640600, 35], [Infinity, 37]] }[v.fs];
      var sd = { s: 16100, mfj: 32200, hoh: 24150 }[v.fs], k = Math.min(v.sal * v.k401 / 100, 24500), ti = Math.max(0, v.sal - k - sd), fed = 0, prev = 0;
      B.forEach(function (b) { if (ti > prev) fed += (Math.min(ti, b[0]) - prev) * b[1] / 100; prev = b[0]; });
      var ss = Math.min(v.sal, 184500) * 0.062, med = v.sal * 0.0145 + Math.max(0, v.sal - (v.fs === 'mfj' ? 250000 : 200000)) * 0.009, st = (v.sal - k) * v.st / 100;
      var net = v.sal - k - fed - ss - med - st, n = +v.freq;
      return { results: [M('Take-home per paycheck', net / n, 'money2', { cur: 'USD' }), r('Annual take-home', net, 'money', { cur: 'USD' }), r('Federal income tax', fed, 'money', { cur: 'USD' }), r('Social Security', ss, 'money', { cur: 'USD' }),
        r('Medicare', med, 'money', { cur: 'USD' }), r('State income tax', st, 'money', { cur: 'USD' }), r('401(k)', k, 'money', { cur: 'USD' }), r('Effective federal rate', v.sal ? fed / v.sal * 100 : 0, 'pct')],
        chart: { type: 'donut', f: 'money', data: [{ l: 'Take-home', v: net }, { l: 'Federal tax', v: fed }, { l: 'FICA', v: ss + med }, { l: 'State tax', v: st }, { l: '401(k)', v: k }] },
        note: '2026 federal rules with the standard deduction. Local taxes, credits and other deductions are not included — this is an estimate, not tax advice.' };
    }
  },
  {
    id: 'uk-take-home-pay-calculator', title: 'UK Take-Home Pay Calculator (2026/27)', sec: 'finance', sub: 'Salary, Pay & HR',
    desc: 'Work out your UK take-home pay after Income Tax, National Insurance, pension and student loan for the 2026/27 tax year.',
    formula: 'Personal allowance £12,570 (reduced by £1 for every £2 over £100,000). Income Tax 20% / 40% / 45%. Employee NI 8% between £12,570 and £50,270, 2% above.',
    inputs: [{ k: 'sal', l: 'Annual salary', t: 'money', v: 40000, local: {} }, { k: 'pen', l: 'Pension contribution (salary sacrifice)', t: 'percent', v: 5, opt: 1 },
      { k: 'sl', l: 'Student loan', t: 'select', v: 'none', o: [['none', 'None'], ['p1', 'Plan 1'], ['p2', 'Plan 2'], ['p4', 'Plan 4 (Scotland)'], ['p5', 'Plan 5'], ['pg', 'Postgraduate']] }],
    calc: function (v) {
      var gross = v.sal * (1 - v.pen / 100), pa = Math.max(0, 12570 - Math.max(0, gross - 100000) / 2), ti = Math.max(0, gross - pa);
      var tax = Math.min(ti, 37700) * 0.2 + Math.max(0, Math.min(ti, 125140 - pa > 37700 ? 125140 - pa : 37700) - 37700) * 0.4 + Math.max(0, gross - 125140) * 0.45;
      var ni = Math.max(0, Math.min(gross, 50270) - 12570) * 0.08 + Math.max(0, gross - 50270) * 0.02;
      var th = { none: Infinity, p1: 26900, p2: 29385, p4: 33795, p5: 25000, pg: 21000 }[v.sl], slr = v.sl === 'pg' ? 0.06 : 0.09, sl = isFinite(th) ? Math.max(0, gross - th) * slr : 0;
      var net = gross - tax - ni - sl;
      return { results: [M('Monthly take-home', net / 12, 'money', { cur: 'GBP' }), r('Yearly take-home', net, 'money', { cur: 'GBP' }), r('Income Tax', tax, 'money', { cur: 'GBP' }), r('National Insurance', ni, 'money', { cur: 'GBP' }),
        r('Pension', v.sal - gross, 'money', { cur: 'GBP' }), r('Student loan', sl, 'money', { cur: 'GBP' }), r('Weekly take-home', net / 52, 'money', { cur: 'GBP' })],
        note: 'England, Wales & Northern Ireland rates. Scotland has different Income Tax bands. Student loan thresholds change each April — check gov.uk for the current figures.' };
    }
  },
  {
    id: 'emi-calculator', title: 'EMI Calculator', sec: 'finance', sub: 'Loans & Mortgage', pop: 1,
    desc: 'Work out the equated monthly instalment (EMI) for any loan, with total interest and a year-by-year repayment schedule.',
    formula: 'EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where P is the loan amount, r is the monthly interest rate (annual rate ÷ 12 ÷ 100) and n is the number of monthly instalments.',
    faq: [['What is an EMI?', 'An EMI (equated monthly instalment) is the fixed amount you pay your lender every month until the loan is repaid. Each EMI contains part interest and part principal; early EMIs are mostly interest.'],
      ['Does a longer tenure reduce my EMI?', 'Yes, a longer tenure lowers the monthly EMI but increases the total interest you pay over the life of the loan.'],
      ['Is processing fee included?', 'No. Processing fees, insurance and GST on fees are charged separately by most lenders. Add them to your cost comparison.']],
    inputs: [
      { k: 'p', l: 'Loan amount', t: 'money', v: 50000, local: { IN: 1000000 }, slider: [0, 50000000, 10000] },
      { k: 'rate', l: 'Interest rate (per year)', t: 'percent', v: function (c) { return IN(c) ? 9.5 : 7; }, slider: [0, 30, 0.05] },
      { k: 'n', l: 'Loan tenure', t: 'number', v: 5, slider: [1, 30, 1] }, TENURE_UNIT ],
    calc: function (v) { return loanResult(v.p, v.rate, months(v), 'Monthly EMI'); }
  },
  { id: 'home-loan-emi-calculator', extends: 'emi-calculator', title: 'Home Loan EMI Calculator', sub: 'Loans & Mortgage',
    desc: 'Calculate your home loan EMI, the total interest over the full term and how your outstanding balance falls each year.',
    set: { p: { v: 300000, local: { IN: 5000000 } }, rate: { v: function (c) { return IN(c) ? 8.5 : 6.5; } }, n: { v: 20 } } },
  { id: 'personal-loan-calculator', extends: 'emi-calculator', title: 'Personal Loan Calculator', sub: 'Loans & Mortgage',
    desc: 'See the monthly payment and total interest for a personal loan before you apply.',
    set: { p: { v: 10000, local: { IN: 500000 } }, rate: { v: function (c) { return IN(c) ? 12 : 11; } }, n: { v: 3 } } },
  { id: 'education-loan-calculator', extends: 'emi-calculator', title: 'Education Loan EMI Calculator', sub: 'Loans & Mortgage',
    desc: 'Plan repayments on a study or student loan: monthly instalment, total interest and payoff schedule.',
    set: { p: { v: 30000, local: { IN: 1500000 } }, rate: { v: function (c) { return IN(c) ? 10 : 6.5; } }, n: { v: 10 } } },
  { id: 'loan-calculator', extends: 'emi-calculator', title: 'Loan Calculator', sub: 'Loans & Mortgage', pop: 1,
    desc: 'A simple loan payment calculator: enter the amount, rate and term to get the monthly payment, total interest and full schedule.',
    set: { p: { v: 20000 }, rate: { v: 8 } } },
  {
    id: 'mortgage-calculator', title: 'Mortgage Calculator', sec: 'finance', sub: 'Loans & Mortgage', pop: 1,
    desc: 'Estimate your full monthly mortgage payment including principal, interest, property tax, home insurance and HOA fees.',
    formula: 'Principal & interest = L × r(1 + r)^n ÷ ((1 + r)^n − 1). Total monthly payment = P&I + property tax ÷ 12 + insurance ÷ 12 + HOA.',
    faq: [['How much should my down payment be?', 'Many lenders accept 3–10%, but 20% or more usually avoids mortgage insurance (PMI) and lowers your monthly payment.'],
      ['What is included in a mortgage payment?', 'Usually principal and interest, plus an escrow share of property tax and homeowners insurance. Some homes also carry HOA dues.']],
    inputs: [
      { k: 'price', l: 'Home price', t: 'money', v: 400000, local: { IN: 7500000 } },
      { k: 'down', l: 'Down payment', t: 'percent', v: 20 },
      { k: 'rate', l: 'Interest rate (per year)', t: 'percent', v: function (c) { return IN(c) ? 8.5 : 6.5; } },
      { k: 'years', l: 'Loan term', t: 'number', v: 30, u: 'years' },
      { k: 'tax', l: 'Property tax (per year)', t: 'percent', v: function (c) { return c.country.code === 'US' ? 1.1 : 0.2; }, help: 'As a percentage of the home value' },
      { k: 'ins', l: 'Home insurance (per year)', t: 'money', v: 1500, local: { IN: 10000 }, opt: 1 },
      { k: 'hoa', l: 'HOA / maintenance (per month)', t: 'money', v: 0, opt: 1 } ],
    calc: function (v) {
      var loan = v.price * (1 - v.down / 100), n = v.years * 12, pi = emi(loan, v.rate, n);
      var tx = v.price * v.tax / 100 / 12, ins = v.ins / 12, total = pi + tx + ins + v.hoa;
      var s = schedule(loan, v.rate, n, pi);
      if (!s) return { error: 'Please check the loan details.' };
      return {
        results: [M('Total monthly payment', total), r('Principal & interest', pi), r('Property tax', tx), r('Insurance', ins), r('HOA / maintenance', v.hoa),
          r('Loan amount', loan), r('Down payment', v.price - loan), r('Total interest', s.interest), r('Payoff date', addMonths(n), 'date')],
        chart: { type: 'donut', f: 'money', data: [{ l: 'Principal & interest', v: pi }, { l: 'Property tax', v: tx }, { l: 'Insurance', v: ins }, { l: 'HOA', v: v.hoa }] },
        table: { title: 'Amortization by year', head: ['Year', 'Principal', 'Interest', 'Balance'], fmt: ['int', 'money', 'money', 'money'], rows: s.yearly }
      };
    }
  },
  {
    id: 'car-loan-calculator', title: 'Car Loan Calculator', sec: 'finance', sub: 'Loans & Mortgage', pop: 1,
    desc: 'Find the monthly payment on a car loan after your down payment and trade-in, including sales tax.',
    formula: 'Loan = price + tax − down payment − trade-in. Monthly payment uses the standard amortizing loan formula.',
    inputs: [
      { k: 'price', l: 'Vehicle price', t: 'money', v: 30000, local: { IN: 900000 } },
      { k: 'down', l: 'Down payment', t: 'money', v: 5000, local: { IN: 200000 }, opt: 1 },
      { k: 'trade', l: 'Trade-in value', t: 'money', v: 0, opt: 1 },
      { k: 'tax', l: 'Sales tax', t: 'percent', v: function (c) { return c.country.code === 'US' ? 7 : 0; }, opt: 1 },
      { k: 'rate', l: 'Interest rate (per year)', t: 'percent', v: function (c) { return IN(c) ? 9 : 7; } },
      { k: 'n', l: 'Loan term', t: 'number', v: 5 }, TENURE_UNIT ],
    calc: function (v) {
      var loan = v.price * (1 + v.tax / 100) - v.down - v.trade;
      if (loan <= 0) return { error: 'Your down payment and trade-in cover the full price — no loan needed.' };
      var out = loanResult(loan, v.rate, months(v), 'Monthly payment');
      out.results.push(r('Total cost of car', v.price * (1 + v.tax / 100) + (out.results[1].v)));
      return out;
    }
  },
  {
    id: 'loan-prepayment-calculator', title: 'Loan Prepayment Calculator', sec: 'finance', sub: 'Loans & Mortgage',
    desc: 'See how much interest and time you save by paying a little extra every month on your loan or mortgage.',
    formula: 'The schedule is rebuilt month by month with (EMI + extra) as the payment until the balance reaches zero.',
    inputs: [
      { k: 'p', l: 'Outstanding loan', t: 'money', v: 200000, local: { IN: 3000000 } },
      { k: 'rate', l: 'Interest rate (per year)', t: 'percent', v: 8.5 },
      { k: 'n', l: 'Remaining tenure', t: 'number', v: 20, u: 'years' },
      { k: 'extra', l: 'Extra payment every month', t: 'money', v: 200, local: { IN: 5000 } } ],
    calc: function (v) {
      var n = v.n * 12, pay = emi(v.p, v.rate, n), a = schedule(v.p, v.rate, n, pay), b = schedule(v.p, v.rate, n, pay, v.extra);
      if (!a || !b) return { error: 'Please check the loan details.' };
      return {
        results: [M('Interest saved', a.interest - b.interest), r('Time saved', yrsMo(a.months - b.months), 'text'), r('New payoff', yrsMo(b.months), 'text'),
          r('Regular EMI', pay), r('Interest without prepayment', a.interest), r('Interest with prepayment', b.interest)],
        chart: { type: 'bar', f: 'money', labels: ['Without', 'With extra'], series: [{ l: 'Total interest', pts: [a.interest, b.interest] }] }
      };
    }
  },
  {
    id: 'amortization-calculator', title: 'Amortization Schedule Calculator', sec: 'finance', sub: 'Loans & Mortgage',
    desc: 'Generate a full month-by-month amortization schedule showing how each payment splits between principal and interest.',
    formula: 'Each month: interest = balance × monthly rate; principal = payment − interest; new balance = balance − principal.',
    inputs: [{ k: 'p', l: 'Loan amount', t: 'money', v: 100000, local: { IN: 2000000 } }, { k: 'rate', l: 'Interest rate (per year)', t: 'percent', v: 7.5 },
      { k: 'n', l: 'Term', t: 'number', v: 10 }, TENURE_UNIT],
    calc: function (v) {
      var n = months(v), pay = emi(v.p, v.rate, n), s = schedule(v.p, v.rate, n, pay);
      if (!s) return { error: 'Please check the loan details.' };
      return { results: [M('Monthly payment', pay), r('Total interest', s.interest), r('Total paid', v.p + s.interest)],
        table: { open: true, title: 'Monthly schedule', head: ['Month', 'Payment', 'Principal', 'Interest', 'Balance'], fmt: ['int', 'money2', 'money2', 'money2', 'money2'], rows: s.monthly } };
    }
  },
  {
    id: 'refinance-calculator', title: 'Refinance Calculator', sec: 'finance', sub: 'Loans & Mortgage',
    desc: 'Compare your current loan with a refinance offer: new payment, monthly savings, lifetime interest and break-even point.',
    formula: 'Break-even (months) = closing costs ÷ monthly savings.',
    inputs: [{ k: 'bal', l: 'Current loan balance', t: 'money', v: 250000, local: { IN: 4000000 } }, { k: 'cur', l: 'Current interest rate', t: 'percent', v: 7.5 },
      { k: 'rem', l: 'Years remaining', t: 'number', v: 25 }, { k: 'nr', l: 'New interest rate', t: 'percent', v: 6.25 },
      { k: 'nt', l: 'New term', t: 'number', v: 25, u: 'years' }, { k: 'cost', l: 'Closing / switching costs', t: 'money', v: 4000, local: { IN: 25000 }, opt: 1 }],
    calc: function (v) {
      var a = emi(v.bal, v.cur, v.rem * 12), b = emi(v.bal, v.nr, v.nt * 12), save = a - b;
      var ia = a * v.rem * 12 - v.bal, ib = b * v.nt * 12 - v.bal;
      return { results: [M('Monthly savings', save), r('Current payment', a), r('New payment', b), r('Break-even', save > 0 ? Math.ceil(v.cost / save) : NaN, 'int', { u: 'months' }),
        r('Lifetime interest change', ib - ia + v.cost)],
        note: save <= 0 ? 'The new loan does not lower your monthly payment.' : (ib - ia + v.cost < 0 ? 'Refinancing saves money over the life of the loan.' : 'Lower monthly payment, but you pay more interest overall because of the longer term or costs.') };
    }
  },
  {
    id: 'compound-interest-calculator', title: 'Compound Interest Calculator', sec: 'finance', sub: 'Interest, Savings & Banking', pop: 1,
    desc: 'See how your money grows with compound interest and regular monthly contributions, year by year.',
    formula: 'A = P(1 + r/n)^(nt) + contributions grown at the same rate. P is the starting amount, r the annual rate, n compounding periods per year and t years.',
    faq: [['How often should interest compound?', 'More frequent compounding (monthly or daily) earns slightly more than yearly compounding at the same nominal rate.'],
      ['What is the difference between simple and compound interest?', 'Simple interest is earned only on the original amount; compound interest is also earned on interest already added.']],
    inputs: [{ k: 'p', l: 'Initial amount', t: 'money', v: 10000, local: { IN: 100000 } }, { k: 'pm', l: 'Monthly contribution', t: 'money', v: 200, local: { IN: 5000 }, opt: 1 },
      { k: 'rate', l: 'Interest rate (per year)', t: 'percent', v: 7 }, { k: 'y', l: 'Years', t: 'number', v: 10, slider: [1, 50, 1] },
      { k: 'n', l: 'Compounding', t: 'select', v: '12', o: [['1', 'Yearly'], ['2', 'Half-yearly'], ['4', 'Quarterly'], ['12', 'Monthly'], ['365', 'Daily']] }],
    calc: function (v) {
      var n = +v.n, mf = Math.pow(1 + v.rate / 100 / n, n / 12), bal = v.p, inv = v.p, labels = [], s1 = [], s2 = [], rows = [];
      for (var m = 1; m <= Math.round(v.y * 12); m++) {
        bal = bal * mf + v.pm; inv += v.pm;
        if (m % 12 === 0) { labels.push('Y' + m / 12); s1.push(bal); s2.push(inv); rows.push([m / 12, inv, bal - inv, bal]); }
      }
      return { results: [M('Future value', bal), r('Total invested', inv), r('Interest earned', bal - inv), r('Effective annual rate', (Math.pow(1 + v.rate / 100 / n, n) - 1) * 100, 'pct')],
        chart: { type: 'line', f: 'money', labels: labels, series: [{ l: 'Balance', pts: s1 }, { l: 'Invested', pts: s2 }] },
        table: { head: ['Year', 'Invested', 'Interest', 'Balance'], fmt: ['int', 'money', 'money', 'money'], rows: rows } };
    }
  },
  { id: 'investment-calculator', extends: 'compound-interest-calculator', title: 'Investment Calculator', sub: 'Investment & Stock Market', pop: 1,
    desc: 'Project the future value of an investment with a starting amount, monthly additions and an expected annual return.',
    set: { rate: { v: 10, l: 'Expected return (per year)' }, y: { v: 15 } } },
  {
    id: 'simple-interest-calculator', title: 'Simple Interest Calculator', sec: 'finance', sub: 'Interest, Savings & Banking', pop: 1,
    desc: 'Calculate simple interest and the total amount for any principal, rate and time period.',
    formula: 'Simple interest = P × R × T ÷ 100. Total = P + SI.',
    inputs: [{ k: 'p', l: 'Principal', t: 'money', v: 10000, local: { IN: 100000 } }, { k: 'rate', l: 'Rate (per year)', t: 'percent', v: 8 },
      { k: 't', l: 'Time', t: 'number', v: 3 }, { k: 'tu', l: 'Time in', t: 'seg', v: 'y', o: [['y', 'Years'], ['m', 'Months'], ['d', 'Days']] }],
    calc: function (v) {
      var t = v.tu === 'm' ? v.t / 12 : v.tu === 'd' ? v.t / 365 : v.t, si = v.p * v.rate * t / 100;
      return { results: [M('Total amount', v.p + si), r('Simple interest', si), r('Principal', v.p)], chart: { type: 'donut', f: 'money', data: [{ l: 'Principal', v: v.p }, { l: 'Interest', v: si }] } };
    }
  },
  {
    id: 'fd-calculator', title: 'FD Calculator (Fixed Deposit)', sec: 'finance', sub: 'Interest, Savings & Banking', pop: 1,
    desc: 'Find the maturity value and interest earned on a fixed deposit (also called a term deposit or CD).',
    formula: 'Maturity = P × (1 + r/n)^(n × t). Indian banks usually compound fixed deposits quarterly (n = 4).',
    inputs: [{ k: 'p', l: 'Deposit amount', t: 'money', v: 10000, local: { IN: 100000 } }, { k: 'rate', l: 'Interest rate (per year)', t: 'percent', v: function (c) { return IN(c) ? 7 : 4.5; } },
      { k: 't', l: 'Tenure', t: 'number', v: 5 }, { k: 'tu', l: 'Tenure in', t: 'seg', v: 'y', o: [['y', 'Years'], ['m', 'Months'], ['d', 'Days']] },
      { k: 'n', l: 'Compounding', t: 'select', v: '4', o: [['12', 'Monthly'], ['4', 'Quarterly'], ['2', 'Half-yearly'], ['1', 'Yearly']] }],
    calc: function (v) {
      var t = v.tu === 'm' ? v.t / 12 : v.tu === 'd' ? v.t / 365 : v.t, n = +v.n, a = v.p * Math.pow(1 + v.rate / 100 / n, n * t);
      return { results: [M('Maturity value', a), r('Interest earned', a - v.p), r('Deposit', v.p), r('Effective yield (per year)', (Math.pow(1 + v.rate / 100 / n, n) - 1) * 100, 'pct')],
        chart: { type: 'donut', f: 'money', data: [{ l: 'Deposit', v: v.p }, { l: 'Interest', v: a - v.p }] } };
    }
  },
  { id: 'cd-calculator', extends: 'fd-calculator', title: 'CD Calculator (Certificate of Deposit)', sub: 'Interest, Savings & Banking',
    desc: 'Calculate the value of a certificate of deposit (CD) at maturity, with interest earned and APY.', set: { n: { v: '12' }, rate: { v: 4.25 } } },
  {
    id: 'rd-calculator', title: 'RD Calculator (Recurring Deposit)', sec: 'finance', sub: 'Interest, Savings & Banking', pop: 1,
    desc: 'Calculate the maturity amount of a recurring deposit where you save a fixed amount every month.',
    formula: 'Maturity = Σ P × (1 + r/4)^(4 × m/12) for each monthly instalment, where m is the months that instalment stays invested (quarterly compounding).',
    inputs: [{ k: 'p', l: 'Monthly deposit', t: 'money', v: 200, local: { IN: 5000 } }, { k: 'rate', l: 'Interest rate (per year)', t: 'percent', v: function (c) { return IN(c) ? 6.8 : 4; } },
      { k: 'm', l: 'Tenure', t: 'int', v: 60, u: 'months' }],
    calc: function (v) {
      var tot = 0;
      for (var j = 1; j <= v.m; j++) tot += v.p * Math.pow(1 + v.rate / 400, 4 * (v.m - j + 1) / 12);
      var dep = v.p * v.m;
      return { results: [M('Maturity value', tot), r('Total deposited', dep), r('Interest earned', tot - dep)], chart: { type: 'donut', f: 'money', data: [{ l: 'Deposits', v: dep }, { l: 'Interest', v: tot - dep }] } };
    }
  },
  {
    id: 'sip-calculator', title: 'SIP Calculator', sec: 'finance', sub: 'Investment & Stock Market', pop: 1,
    desc: 'Estimate how much your monthly SIP (systematic investment plan) in mutual funds could grow to, with an optional yearly step-up.',
    formula: 'FV = P × [((1 + i)^n − 1) ÷ i] × (1 + i), where P is the monthly SIP, i the monthly return (annual ÷ 12 ÷ 100) and n the number of months. With a step-up, P rises by the step-up % every 12 months.',
    faq: [['Are SIP returns guaranteed?', 'No. Mutual fund returns depend on the market. This calculator shows an estimate for a steady return; real returns go up and down.'],
      ['What is a step-up SIP?', 'A step-up (or top-up) SIP increases your monthly investment every year, usually in line with salary increases. It can build a much larger corpus.']],
    inputs: [{ k: 'p', l: 'Monthly investment', t: 'money', v: 200, local: { IN: 10000 }, slider: [0, 500000, 500] }, { k: 'rate', l: 'Expected return (per year)', t: 'percent', v: 12, slider: [1, 30, 0.5] },
      { k: 'y', l: 'Time period', t: 'number', v: 10, u: 'years', slider: [1, 40, 1] }, { k: 'step', l: 'Annual step-up', t: 'percent', v: 0, opt: 1 }],
    calc: function (v) {
      var i = v.rate / 1200, bal = 0, inv = 0, p = v.p, labels = [], s1 = [], s2 = [], rows = [];
      for (var m = 1; m <= Math.round(v.y * 12); m++) {
        if (m > 1 && (m - 1) % 12 === 0) p = p * (1 + v.step / 100);
        bal = (bal + p) * (1 + i); inv += p;
        if (m % 12 === 0) { labels.push('Y' + m / 12); s1.push(bal); s2.push(inv); rows.push([m / 12, p, inv, bal]); }
      }
      return { results: [M('Estimated value', bal), r('Amount invested', inv), r('Estimated returns', bal - inv), r('Wealth gain', inv ? (bal - inv) / inv * 100 : 0, 'pct')],
        chart: { type: 'line', f: 'money', labels: labels, series: [{ l: 'Value', pts: s1 }, { l: 'Invested', pts: s2 }] },
        table: { head: ['Year', 'Monthly SIP', 'Invested', 'Value'], fmt: ['int', 'money', 'money', 'money'], rows: rows } };
    }
  },
  { id: 'step-up-sip-calculator', extends: 'sip-calculator', title: 'Step-up SIP Calculator', sub: 'Investment & Stock Market',
    desc: 'See how increasing your SIP amount every year boosts your final corpus compared with a flat SIP.', set: { step: { v: 10 }, y: { v: 15 } } },
  {
    id: 'lumpsum-calculator', title: 'Lumpsum Investment Calculator', sec: 'finance', sub: 'Investment & Stock Market',
    desc: 'Find the future value of a one-time (lumpsum) investment at an expected annual return.',
    formula: 'FV = P × (1 + r)^t.',
    inputs: [{ k: 'p', l: 'Investment amount', t: 'money', v: 10000, local: { IN: 500000 } }, { k: 'rate', l: 'Expected return (per year)', t: 'percent', v: 12 }, { k: 'y', l: 'Time period', t: 'number', v: 10, u: 'years' }],
    calc: function (v) {
      var labels = [], s = [];
      for (var y = 1; y <= v.y; y++) { labels.push('Y' + y); s.push(v.p * Math.pow(1 + v.rate / 100, y)); }
      var fv = v.p * Math.pow(1 + v.rate / 100, v.y);
      return { results: [M('Estimated value', fv), r('Invested', v.p), r('Estimated returns', fv - v.p)], chart: { type: 'line', f: 'money', labels: labels, series: [{ l: 'Value', pts: s }] } };
    }
  },
  {
    id: 'swp-calculator', title: 'SWP Calculator (Systematic Withdrawal)', sec: 'finance', sub: 'Investment & Stock Market',
    desc: 'Plan a systematic withdrawal plan: see how long your corpus lasts and what remains after regular monthly withdrawals.',
    formula: 'Each month: balance = (balance − withdrawal) × (1 + monthly return).',
    inputs: [{ k: 'c', l: 'Total investment', t: 'money', v: 100000, local: { IN: 2500000 } }, { k: 'w', l: 'Monthly withdrawal', t: 'money', v: 700, local: { IN: 15000 } },
      { k: 'rate', l: 'Expected return (per year)', t: 'percent', v: 8 }, { k: 'y', l: 'Time period', t: 'number', v: 10, u: 'years' }],
    calc: function (v) {
      var i = v.rate / 1200, bal = v.c, out = 0, m, ran = null, labels = [], s = [];
      for (m = 1; m <= v.y * 12; m++) { var w = Math.min(v.w, bal); bal = (bal - w) * (1 + i); out += w; if (bal <= 0 && ran === null) ran = m; if (m % 12 === 0) { labels.push('Y' + m / 12); s.push(bal); } }
      return { results: [M('Final value', bal), r('Total withdrawn', out), r('Invested', v.c)], chart: { type: 'line', f: 'money', labels: labels, series: [{ l: 'Balance', pts: s }] },
        note: ran ? 'Your money runs out after about ' + yrsMo(ran) + '.' : 'Your corpus lasts the full period.' };
    }
  },
  {
    id: 'cagr-calculator', title: 'CAGR Calculator', sec: 'finance', sub: 'Investment & Stock Market', pop: 1,
    desc: 'Calculate the compound annual growth rate (CAGR) between a starting value and an ending value.',
    formula: 'CAGR = (Ending value ÷ Beginning value)^(1 ÷ years) − 1.',
    inputs: [{ k: 'a', l: 'Beginning value', t: 'money', v: 10000 }, { k: 'b', l: 'Ending value', t: 'money', v: 25000 }, { k: 'y', l: 'Number of years', t: 'number', v: 5 }],
    calc: function (v) { if (v.a <= 0 || v.y <= 0) return { error: 'Beginning value and years must be above zero.' };
      return { results: [M('CAGR', (Math.pow(v.b / v.a, 1 / v.y) - 1) * 100, 'pct'), r('Absolute return', (v.b - v.a) / v.a * 100, 'pct'), r('Gain', v.b - v.a)] }; }
  },
  {
    id: 'roi-calculator', title: 'ROI Calculator', sec: 'finance', sub: 'Investment & Stock Market', pop: 1,
    desc: 'Work out return on investment (ROI) as a percentage, plus the annualised return when you know the holding period.',
    formula: 'ROI = (Final value − Amount invested) ÷ Amount invested × 100. Annualised ROI = (Final ÷ Invested)^(1/years) − 1.',
    inputs: [{ k: 'a', l: 'Amount invested', t: 'money', v: 1000 }, { k: 'b', l: 'Amount returned', t: 'money', v: 1500 }, { k: 'y', l: 'Investment length (optional)', t: 'number', v: 3, u: 'years', opt: 1 }],
    calc: function (v) { var roi = (v.b - v.a) / v.a * 100;
      return { results: [M('Return on investment', roi, 'pct'), r('Profit / loss', v.b - v.a), r('Annualised return', v.y > 0 ? (Math.pow(v.b / v.a, 1 / v.y) - 1) * 100 : NaN, 'pct')] }; }
  },
  {
    id: 'ppf-calculator', title: 'PPF Calculator', sec: 'finance', sub: 'Retirement & Pension', pop: 1,
    desc: 'Calculate the maturity value of your Public Provident Fund (PPF) account with yearly deposits.',
    formula: 'Each year: balance = (balance + deposit) × (1 + rate). Deposits are assumed before 5 April so they earn the full year’s interest.',
    faq: [['What is the current PPF interest rate?', 'The government reviews the PPF rate every quarter. The default here is 7.1% per year — check the latest notified rate and change it if needed.'],
      ['How much can I invest in PPF?', 'Between ₹500 and ₹1.5 lakh per financial year. The account matures after 15 years and can be extended in blocks of 5 years.']],
    inputs: [{ k: 'p', l: 'Yearly investment', t: 'money', v: 1800, local: { IN: 150000 }, help: 'Maximum ₹1.5 lakh per year in India' }, { k: 'rate', l: 'Interest rate', t: 'percent', v: 7.1 }, { k: 'y', l: 'Time period', t: 'int', v: 15, u: 'years' }],
    calc: function (v) {
      var bal = 0, rows = [];
      for (var y = 1; y <= v.y; y++) { var int = (bal + v.p) * v.rate / 100; bal = bal + v.p + int; rows.push([y, v.p, int, bal]); }
      var inv = v.p * v.y;
      return { results: [M('Maturity value', bal), r('Total investment', inv), r('Total interest', bal - inv)], chart: { type: 'donut', f: 'money', data: [{ l: 'Invested', v: inv }, { l: 'Interest', v: bal - inv }] },
        table: { head: ['Year', 'Deposit', 'Interest', 'Balance'], fmt: ['int', 'money', 'money', 'money'], rows: rows }, note: v.y < 15 ? 'A PPF account matures after a minimum of 15 years.' : '' };
    }
  },
  {
    id: 'epf-calculator', title: 'EPF Calculator', sec: 'finance', sub: 'Retirement & Pension', pop: 1,
    desc: 'Estimate your Employees’ Provident Fund (EPF) balance at retirement from your basic salary, contributions and salary growth.',
    formula: 'Monthly credit = 12% employee share + 3.67% employer share of basic + DA. Interest is calculated monthly on the running balance and credited yearly.',
    inputs: [{ k: 'b', l: 'Monthly basic + DA', t: 'money', v: 30000, local: { IN: 30000 } }, { k: 'age', l: 'Current age', t: 'int', v: 28 }, { k: 'ret', l: 'Retirement age', t: 'int', v: 58 },
      { k: 'bal', l: 'Current EPF balance', t: 'money', v: 0, opt: 1 }, { k: 'inc', l: 'Expected salary increase (per year)', t: 'percent', v: 7 },
      { k: 'rate', l: 'EPF interest rate', t: 'percent', v: 8.25 }],
    calc: function (v) {
      var bal = v.bal, b = v.b, yrs = v.ret - v.age, rows = [], own = 0, emp = 0;
      if (yrs <= 0) return { error: 'Retirement age must be greater than current age.' };
      for (var y = 1; y <= yrs; y++) {
        var acc = 0;
        for (var m = 0; m < 12; m++) { bal += b * 0.12 + b * 0.0367; own += b * 0.12; emp += b * 0.0367; acc += bal * v.rate / 1200; }
        bal += acc; rows.push([v.age + y, b, acc, bal]); b *= 1 + v.inc / 100;
      }
      return { results: [M('Balance at retirement', bal), r('Your contribution', own), r('Employer contribution', emp), r('Interest earned', bal - own - emp - v.bal)],
        table: { head: ['Age', 'Monthly basic', 'Interest', 'Balance'], fmt: ['int', 'money', 'money', 'money'], rows: rows } };
    }
  },
  {
    id: 'nps-calculator', title: 'NPS Calculator', sec: 'finance', sub: 'Retirement & Pension',
    desc: 'Estimate your National Pension System (NPS) corpus, the tax-free lump sum and the monthly pension from your annuity.',
    formula: 'Corpus = SIP future value of monthly contributions until age 60. Pension = (corpus × annuity share) × annuity rate ÷ 12.',
    inputs: [{ k: 'p', l: 'Monthly contribution', t: 'money', v: 60, local: { IN: 5000 } }, { k: 'age', l: 'Current age', t: 'int', v: 30 }, { k: 'ret', l: 'Retirement age', t: 'int', v: 60 },
      { k: 'rate', l: 'Expected return', t: 'percent', v: 10 }, { k: 'ann', l: 'Corpus used for annuity', t: 'percent', v: 40, help: 'Minimum 40%' }, { k: 'ar', l: 'Annuity rate', t: 'percent', v: 6 }],
    calc: function (v) {
      var n = (v.ret - v.age) * 12, i = v.rate / 1200; if (n <= 0) return { error: 'Retirement age must be greater than current age.' };
      var c = v.p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i), a = c * v.ann / 100;
      return { results: [M('Monthly pension', a * v.ar / 1200), r('Total corpus', c), r('Lump sum you can withdraw', c - a), r('Annuity purchase', a), r('Total invested', v.p * n)] };
    }
  },
  {
    id: 'retirement-calculator', title: 'Retirement Calculator', sec: 'finance', sub: 'Retirement & Pension', pop: 1,
    desc: 'Find out how much you need for retirement, how much you are on track to have and how much more to save each month.',
    formula: 'Needed corpus = present value of inflation-rising expenses over retirement, discounted at the post-retirement return. Projected = savings grown + monthly SIP future value.',
    inputs: [{ k: 'age', l: 'Current age', t: 'int', v: 30 }, { k: 'ret', l: 'Retirement age', t: 'int', v: 60 }, { k: 'life', l: 'Plan until age', t: 'int', v: 85 },
      { k: 'exp', l: 'Monthly expenses today', t: 'money', v: 3000, local: { IN: 50000 } }, { k: 'sav', l: 'Current savings', t: 'money', v: 20000, local: { IN: 500000 }, opt: 1 },
      { k: 'pm', l: 'Monthly saving', t: 'money', v: 500, local: { IN: 15000 }, opt: 1 }, { k: 'inf', l: 'Inflation', t: 'percent', v: function (c) { return IN(c) ? 6 : 3; } },
      { k: 'r1', l: 'Return before retirement', t: 'percent', v: function (c) { return IN(c) ? 11 : 7; } }, { k: 'r2', l: 'Return after retirement', t: 'percent', v: function (c) { return IN(c) ? 7 : 5; } }],
    calc: function (v) {
      var yrs = v.ret - v.age, ry = v.life - v.ret;
      if (yrs <= 0 || ry <= 0) return { error: 'Check the ages: current < retirement < plan-until age.' };
      var e = v.exp * 12 * Math.pow(1 + v.inf / 100, yrs), g = v.inf / 100, rr = v.r2 / 100;
      var need = Math.abs(rr - g) < 1e-9 ? e * ry : e * (1 - Math.pow((1 + g) / (1 + rr), ry)) / (rr - g) * (1 + rr);
      var i = v.r1 / 1200, n = yrs * 12, fvs = v.sav * Math.pow(1 + v.r1 / 100, yrs), fvp = i ? v.pm * ((Math.pow(1 + i, n) - 1) / i) * (1 + i) : v.pm * n;
      var have = fvs + fvp, gap = need - have, extra = gap > 0 ? gap * i / ((Math.pow(1 + i, n) - 1) * (1 + i)) : 0;
      return { results: [M('Retirement corpus needed', need), r('You are on track for', have), r(gap > 0 ? 'Shortfall' : 'Surplus', Math.abs(gap), 'money', { hl: gap > 0 }),
        r('Extra monthly saving needed', extra), r('Monthly expenses at retirement', e / 12)],
        badge: gap > 0 ? { t: 'Shortfall — consider saving more or retiring later', tone: 'warn' } : { t: 'On track', tone: 'ok' } };
    }
  },
  {
    id: 'inflation-calculator', title: 'Inflation Calculator', sec: 'finance', sub: 'Budget & Personal Finance', pop: 1,
    desc: 'See what something will cost in the future, and how much your money’s buying power falls, at a given inflation rate.',
    formula: 'Future cost = Amount × (1 + inflation)^years. Buying power = Amount ÷ (1 + inflation)^years.',
    inputs: [{ k: 'a', l: 'Amount today', t: 'money', v: 1000, local: { IN: 100000 } }, { k: 'inf', l: 'Inflation rate (per year)', t: 'percent', v: function (c) { return IN(c) ? 6 : 3; } }, { k: 'y', l: 'Years', t: 'number', v: 10 }],
    calc: function (v) { var f = Math.pow(1 + v.inf / 100, v.y);
      return { results: [M('Future cost', v.a * f), r('Buying power of today’s amount', v.a / f), r('Value lost', v.a - v.a / f), r('Cumulative inflation', (f - 1) * 100, 'pct')] }; }
  },
  {
    id: 'future-value-calculator', title: 'Future Value Calculator', sec: 'finance', sub: 'Interest, Savings & Banking',
    desc: 'Calculate the future value of a present sum plus regular payments at a fixed interest rate.',
    formula: 'FV = PV(1 + r)^n + PMT × [((1 + r)^n − 1) ÷ r], with payments at the end of each period (or × (1 + r) if at the start).',
    inputs: [{ k: 'pv', l: 'Present value', t: 'money', v: 1000 }, { k: 'pmt', l: 'Payment per period', t: 'money', v: 100, opt: 1 }, { k: 'rate', l: 'Rate per period', t: 'percent', v: 0.5 },
      { k: 'n', l: 'Number of periods', t: 'int', v: 120 }, { k: 'when', l: 'Payments at', t: 'seg', v: 'end', o: [['end', 'End'], ['begin', 'Beginning']] }],
    calc: function (v) { var i = v.rate / 100, f = Math.pow(1 + i, v.n), ann = i ? (f - 1) / i : v.n; if (v.when === 'begin') ann *= 1 + i;
      var fv = v.pv * f + v.pmt * ann; return { results: [M('Future value', fv), r('Total payments', v.pv + v.pmt * v.n), r('Total interest', fv - v.pv - v.pmt * v.n)] }; }
  },
  {
    id: 'present-value-calculator', title: 'Present Value Calculator', sec: 'finance', sub: 'Interest, Savings & Banking',
    desc: 'Find what a future amount is worth today, given a discount rate and time period.',
    formula: 'PV = FV ÷ (1 + r)^n.',
    inputs: [{ k: 'fv', l: 'Future value', t: 'money', v: 10000 }, { k: 'rate', l: 'Discount rate (per year)', t: 'percent', v: 6 }, { k: 'y', l: 'Years', t: 'number', v: 10 }],
    calc: function (v) { var pv = v.fv / Math.pow(1 + v.rate / 100, v.y); return { results: [M('Present value', pv), r('Discount', v.fv - pv)] }; }
  },
  {
    id: 'savings-goal-calculator', title: 'Savings Goal Calculator', sec: 'finance', sub: 'Interest, Savings & Banking',
    desc: 'Work out how much to save each month to reach a savings goal by a target date.',
    formula: 'Monthly saving = (Goal − Current × (1 + i)^n) × i ÷ ((1 + i)^n − 1), where i is the monthly return.',
    inputs: [{ k: 'g', l: 'Savings goal', t: 'money', v: 20000, local: { IN: 1000000 } }, { k: 'cur', l: 'Already saved', t: 'money', v: 0, opt: 1 },
      { k: 'y', l: 'Time to reach goal', t: 'number', v: 3, u: 'years' }, { k: 'rate', l: 'Expected return (per year)', t: 'percent', v: 5 }],
    calc: function (v) { var i = v.rate / 1200, n = Math.round(v.y * 12), f = Math.pow(1 + i, n), need = v.g - v.cur * f;
      var pm = need <= 0 ? 0 : (i ? need * i / (f - 1) : need / n);
      return { results: [M('Save every month', pm), r('Total you will deposit', pm * n), r('Interest earned', v.g - v.cur - pm * n)], note: need <= 0 ? 'Your current savings will already reach the goal.' : '' }; }
  },
  {
    id: 'rule-of-72-calculator', title: 'Rule of 72 Calculator', sec: 'finance', sub: 'Interest, Savings & Banking',
    desc: 'Estimate how long it takes to double your money at a given rate of return, with the exact answer alongside.',
    formula: 'Years to double ≈ 72 ÷ rate. Exact: ln(2) ÷ ln(1 + rate).',
    inputs: [{ k: 'rate', l: 'Annual return', t: 'percent', v: 8 }],
    calc: function (v) { return { results: [M('Years to double (Rule of 72)', 72 / v.rate, 'num', { dp: 1, u: 'years' }), r('Exact years', Math.log(2) / Math.log(1 + v.rate / 100), 'num', { dp: 2, u: 'years' }), r('Years to triple', Math.log(3) / Math.log(1 + v.rate / 100), 'num', { dp: 2, u: 'years' })] }; }
  },
  {
    id: 'apy-calculator', title: 'APY Calculator', sec: 'finance', sub: 'Interest, Savings & Banking',
    desc: 'Convert a nominal interest rate into annual percentage yield (APY) for any compounding frequency.',
    formula: 'APY = (1 + r/n)^n − 1.',
    inputs: [{ k: 'rate', l: 'Nominal rate', t: 'percent', v: 5 }, { k: 'n', l: 'Compounding', t: 'select', v: '12', o: [['1', 'Yearly'], ['2', 'Half-yearly'], ['4', 'Quarterly'], ['12', 'Monthly'], ['365', 'Daily']] }],
    calc: function (v) { return { results: [M('APY', (Math.pow(1 + v.rate / 100 / +v.n, +v.n) - 1) * 100, 'pct', { dp: 4 })] }; }
  },
  {
    id: 'apr-calculator', title: 'APR Calculator', sec: 'finance', sub: 'Loans & Mortgage',
    desc: 'Find the true annual percentage rate (APR) of a loan once upfront fees are included.',
    formula: 'APR is the rate at which the monthly payment repays (loan − fees) over the term. It is solved numerically.',
    inputs: [{ k: 'p', l: 'Loan amount', t: 'money', v: 20000 }, { k: 'rate', l: 'Interest rate', t: 'percent', v: 8 }, { k: 'n', l: 'Term', t: 'int', v: 60, u: 'months' }, { k: 'fee', l: 'Upfront fees', t: 'money', v: 500 }],
    calc: function (v) {
      var pay = emi(v.p, v.rate, v.n), net = v.p - v.fee, lo = 0, hi = 200;
      for (var k = 0; k < 200; k++) { var mid = (lo + hi) / 2; if (emi(net, mid, v.n) > pay) hi = mid; else lo = mid; }
      return { results: [M('APR', lo, 'pct', { dp: 3 }), r('Monthly payment', pay), r('Total of payments', pay * v.n), r('Total cost (interest + fees)', pay * v.n - v.p + v.fee)] };
    }
  },
  {
    id: 'credit-card-payoff-calculator', title: 'Credit Card Payoff Calculator', sec: 'finance', sub: 'Budget & Personal Finance',
    desc: 'See how long it takes to clear a credit card balance and the interest you pay at a fixed monthly payment.',
    formula: 'Each month: balance = balance × (1 + APR/12) − payment, repeated until the balance reaches zero.',
    inputs: [{ k: 'b', l: 'Card balance', t: 'money', v: 5000, local: { IN: 100000 } }, { k: 'apr', l: 'APR', t: 'percent', v: function (c) { return IN(c) ? 42 : 22; } }, { k: 'pay', l: 'Monthly payment', t: 'money', v: 200, local: { IN: 6000 } }],
    calc: function (v) {
      var i = v.apr / 1200; if (v.pay <= v.b * i) return { error: 'This payment does not cover the monthly interest — the balance would never be paid off.' };
      var s = schedule(v.b, v.apr, 0, v.pay);
      return { results: [M('Time to pay off', yrsMo(s.months), 'text'), r('Total interest', s.interest), r('Total paid', v.b + s.interest), r('Debt-free by', addMonths(s.months), 'date')] };
    }
  },
  {
    id: 'debt-to-income-calculator', title: 'Debt-to-Income (DTI) Ratio Calculator', sec: 'finance', sub: 'Loans & Mortgage',
    desc: 'Calculate your debt-to-income ratio, a key number lenders use to decide how much you can borrow.',
    formula: 'DTI = total monthly debt payments ÷ gross monthly income × 100.',
    inputs: [{ k: 'inc', l: 'Gross monthly income', t: 'money', v: 6000, local: { IN: 120000 } }, { k: 'debt', l: 'Monthly debt payments', t: 'money', v: 1800, local: { IN: 35000 }, help: 'EMIs, card minimums, rent/mortgage' }],
    calc: function (v) { var d = v.debt / v.inc * 100;
      return { results: [M('Debt-to-income ratio', d, 'pct', { dp: 1 })], badge: d <= 36 ? { t: 'Healthy — most lenders are comfortable below 36%', tone: 'ok' } : d <= 43 ? { t: 'Manageable — some lenders may hesitate', tone: 'mid' } : { t: 'High — reduce debt before borrowing more', tone: 'warn' } }; }
  },
  {
    id: 'house-affordability-calculator', title: 'House Affordability Calculator', sec: 'finance', sub: 'Loans & Mortgage', pop: 1,
    desc: 'Estimate how much house you can afford from your income, existing debts and down payment using the 28/36 rule.',
    formula: 'Max housing payment = min(28% of gross monthly income, 36% − existing debt payments). Price is solved so that P&I + tax/insurance fits that payment.',
    inputs: [{ k: 'inc', l: 'Annual household income', t: 'money', v: 100000, local: { IN: 2400000 } }, { k: 'debt', l: 'Monthly debt payments', t: 'money', v: 400, opt: 1 },
      { k: 'down', l: 'Down payment available', t: 'money', v: 60000, local: { IN: 1500000 } }, { k: 'rate', l: 'Interest rate', t: 'percent', v: function (c) { return IN(c) ? 8.5 : 6.5; } },
      { k: 'y', l: 'Loan term', t: 'number', v: 30, u: 'years' }, { k: 'ti', l: 'Tax + insurance (per year)', t: 'percent', v: 1.5, help: 'As % of home price' }],
    calc: function (v) {
      var mi = v.inc / 12, pay = Math.min(mi * 0.28, mi * 0.36 - v.debt);
      if (pay <= 0) return { error: 'Your current debts leave no room for a housing payment under the 28/36 rule.' };
      var k = emi(1, v.rate, v.y * 12), t = v.ti / 100 / 12, price = (pay + v.down * k) / (k + t);
      return { results: [M('Home price you can afford', price), r('Loan amount', price - v.down), r('Monthly housing payment', pay), r('Down payment', v.down)] };
    }
  },
  {
    id: 'gst-calculator', title: 'GST Calculator', sec: 'finance', sub: 'Tax', pop: 1,
    desc: 'Add GST to a price or remove GST from a GST-inclusive amount, with the CGST/SGST or IGST split. Uses India’s current GST slabs.',
    formula: 'Add GST: GST = amount × rate ÷ 100. Remove GST: base = amount × 100 ÷ (100 + rate); GST = amount − base. Within a state, GST is split equally into CGST and SGST; between states it is charged as IGST.',
    faq: [['What are the current GST rates in India?', 'Since 22 September 2025 (GST 2.0) the main slabs are 5% and 18%, with 40% on luxury and sin goods and 0% on exempt items. Special rates such as 3% on gold and 0.25% on rough diamonds continue.'],
      ['What happened to the 12% and 28% slabs?', 'Most items in the old 12% and 28% slabs moved to 5% or 18%; some luxury items moved to 40%.']],
    inputs: [{ k: 'a', l: 'Amount', t: 'money', v: 1000, local: { IN: 10000 } },
      { k: 'rate', l: 'GST rate', t: 'select', v: '18', o: [['0', '0% (nil / exempt)'], ['0.25', '0.25% (rough diamonds)'], ['3', '3% (gold, silver)'], ['5', '5%'], ['18', '18% (standard)'], ['40', '40% (luxury / sin)'], ['custom', 'Other rate…']] },
      { k: 'cr', l: 'Custom rate', t: 'percent', v: 12, show: function (x) { return x.rate === 'custom'; } },
      { k: 'mode', l: 'Amount is', t: 'seg', v: 'ex', o: [['ex', 'Before GST (add)'], ['in', 'Including GST (remove)']] },
      { k: 'sup', l: 'Supply', t: 'seg', v: 'intra', o: [['intra', 'Within state'], ['inter', 'Inter-state']] }],
    calc: function (v) {
      var rt = v.rate === 'custom' ? v.cr : +v.rate, base = v.mode === 'ex' ? v.a : v.a * 100 / (100 + rt), g = base * rt / 100;
      var res = [M(v.mode === 'ex' ? 'Total including GST' : 'Amount before GST', v.mode === 'ex' ? base + g : base), r('GST amount', g)];
      if (v.sup === 'intra') { res.push(r('CGST (' + rt / 2 + '%)', g / 2)); res.push(r('SGST (' + rt / 2 + '%)', g / 2)); } else res.push(r('IGST (' + rt + '%)', g));
      res.push(r('Net price', base)); res.push(r('Gross price', base + g));
      return { results: res };
    }
  },
  {
    id: 'vat-calculator', title: 'VAT Calculator', sec: 'finance', sub: 'Tax', pop: 1,
    desc: 'Add or remove VAT from any price. The rate starts at your country’s standard VAT rate — change it for reduced rates.',
    formula: 'Add VAT: gross = net × (1 + rate). Remove VAT: net = gross ÷ (1 + rate).',
    inputs: [{ k: 'a', l: 'Amount', t: 'money', v: 100 }, { k: 'rate', l: 'VAT rate', t: 'percent', v: function (c) { var p = c.preset('vat'); return p && p.length ? p[0] : 20; } },
      { k: 'mode', l: 'Amount is', t: 'seg', v: 'ex', o: [['ex', 'Excluding VAT'], ['in', 'Including VAT']] }],
    calc: function (v) { var net = v.mode === 'ex' ? v.a : v.a / (1 + v.rate / 100), vat = net * v.rate / 100;
      return { results: [M(v.mode === 'ex' ? 'Price including VAT' : 'Price excluding VAT', v.mode === 'ex' ? net + vat : net), r('VAT amount', vat), r('Net', net), r('Gross', net + vat)] }; }
  },
  {
    id: 'sales-tax-calculator', title: 'Sales Tax Calculator', sec: 'finance', sub: 'Tax', pop: 1,
    desc: 'Calculate sales tax and the final price, or work backwards from a tax-inclusive total.',
    formula: 'Tax = price × rate ÷ 100; total = price + tax. Reverse: price = total ÷ (1 + rate ÷ 100).',
    inputs: [{ k: 'a', l: 'Price', t: 'money', v: 100 }, { k: 'rate', l: 'Sales tax rate', t: 'percent', v: function (c) { var p = c.preset('vat'); return c.country.code === 'US' ? 7.25 : (p && p.length ? p[0] : 10); } },
      { k: 'q', l: 'Quantity', t: 'int', v: 1 }, { k: 'mode', l: 'Price is', t: 'seg', v: 'ex', o: [['ex', 'Before tax'], ['in', 'After tax']] }],
    calc: function (v) { var each = v.mode === 'ex' ? v.a : v.a / (1 + v.rate / 100), net = each * v.q, t = net * v.rate / 100;
      return { results: [M('Total price', net + t), r('Sales tax', t), r('Price before tax', net), r('Price per item (with tax)', (net + t) / v.q)] }; }
  },
  {
    id: 'income-tax-calculator-india', title: 'Income Tax Calculator (India) — Old vs New Regime', sec: 'finance', sub: 'Tax', pop: 1,
    desc: 'Calculate your income tax for FY 2026-27 under both the new and old regimes, see which one saves more and how much.',
    formula: 'Taxable income = gross income − standard deduction − eligible deductions. Tax is applied slab by slab, then the Section 87A rebate, surcharge and 4% health & education cess.',
    faq: [['What are the new regime slabs for FY 2026-27?', 'Up to ₹4 lakh: nil; ₹4–8 lakh: 5%; ₹8–12 lakh: 10%; ₹12–16 lakh: 15%; ₹16–20 lakh: 20%; ₹20–24 lakh: 25%; above ₹24 lakh: 30%. Budget 2026 kept these slabs unchanged.'],
      ['Is income up to ₹12 lakh tax-free?', 'Under the new regime, taxable income up to ₹12 lakh gets a full rebate under Section 87A. With the ₹75,000 standard deduction, salary up to ₹12.75 lakh is effectively tax-free.'],
      ['Which regime should I choose?', 'If your deductions (80C, 80D, HRA, home loan interest) are large, the old regime can be cheaper. Otherwise the new regime usually wins. This calculator shows both.']],
    inputs: [{ k: 'sal', l: 'Annual salary income', t: 'money', v: 15000, local: { IN: 1500000 } }, { k: 'oth', l: 'Other income (interest, rent etc.)', t: 'money', v: 0, opt: 1 },
      { k: 'age', l: 'Age group', t: 'select', v: 'below', o: [['below', 'Below 60'], ['senior', '60 to 79'], ['super', '80 and above']] },
      { k: 'c80', l: '80C investments (old regime)', t: 'money', v: 0, local: { IN: 150000 }, opt: 1, help: 'PPF, ELSS, EPF, LIC etc. — capped at ₹1.5 lakh' },
      { k: 'd80', l: '80D health insurance (old regime)', t: 'money', v: 0, local: { IN: 25000 }, opt: 1 },
      { k: 'hra', l: 'HRA exemption (old regime)', t: 'money', v: 0, opt: 1 }, { k: 'hl', l: 'Home loan interest (old regime)', t: 'money', v: 0, opt: 1, help: 'Self-occupied: capped at ₹2 lakh' },
      { k: 'od', l: 'Other deductions (old regime)', t: 'money', v: 0, opt: 1, help: '80E, 80G, 80CCD(1B) etc.' }],
    calc: function (v) {
      var sd = v.sal > 0 ? 75000 : 0, tn = Math.max(0, v.sal - Math.min(sd, v.sal) + v.oth);
      var nw = indiaTaxNew(tn);
      var ded = Math.min(v.sal, 50000) + Math.min(v.c80, 150000) + v.d80 + v.hra + Math.min(v.hl, 200000) + v.od, to = Math.max(0, v.sal + v.oth - ded);
      var od = indiaTaxOld(to, v.age), best = nw.total <= od.total ? 'New regime' : 'Old regime';
      return { results: [M('Tax under new regime', nw.total, 'money', { sub: 'Taxable income ' + CW.fmt.money(tn) }), r('Tax under old regime', od.total), r('Better option', best, 'text', { hl: 1 }),
        r('You save', Math.abs(nw.total - od.total)), r('Monthly take-home (new)', (v.sal + v.oth - nw.total) / 12), r('Effective tax rate (new)', (v.sal + v.oth) ? nw.total / (v.sal + v.oth) * 100 : 0, 'pct')],
        table: { title: 'New regime slab breakdown', head: ['Income slab', 'Rate %', 'Tax before rebate'], fmt: ['text', 'num', 'money'], rows: nw.rows },
        note: 'FY 2026-27 rules for resident individuals: new-regime rebate up to ₹12 lakh with marginal relief, surcharge above ₹50 lakh, 4% cess. Marginal relief on surcharge is not applied. Not tax advice — confirm with a CA for complex cases.' };
    }
  },
  {
    id: 'salary-calculator-india', title: 'CTC to In-Hand Salary Calculator (India)', sec: 'finance', sub: 'Salary, Pay & HR', pop: 1,
    desc: 'Convert your CTC into monthly in-hand salary after PF, gratuity, professional tax and income tax (new regime).',
    formula: 'In-hand = CTC − employer PF − gratuity − employee PF − professional tax − income tax.',
    inputs: [{ k: 'ctc', l: 'Annual CTC', t: 'money', v: 12000, local: { IN: 1200000 } }, { k: 'bp', l: 'Basic salary (% of CTC)', t: 'percent', v: 40 },
      { k: 'pf', l: 'PF calculated on', t: 'seg', v: 'cap', o: [['cap', '₹15,000 cap'], ['full', 'Full basic'], ['none', 'No PF']] },
      { k: 'gr', l: 'Gratuity is part of CTC', t: 'check', v: true }, { k: 'pt', l: 'Professional tax (per year)', t: 'money', v: 30, local: { IN: 2400 }, opt: 1 }],
    calc: function (v) {
      var basic = v.ctc * v.bp / 100, pfBase = v.pf === 'none' ? 0 : v.pf === 'cap' ? Math.min(basic, 180000) : basic, pf = pfBase * 0.12;
      var grat = v.gr ? basic * 0.0481 : 0, gross = v.ctc - pf - grat, tax = indiaTaxNew(Math.max(0, gross - 75000)).total;
      var inhand = gross - pf - v.pt - tax;
      return { results: [M('Monthly in-hand salary', inhand / 12), r('Annual in-hand', inhand), r('Gross salary', gross), r('Employee PF (yearly)', pf), r('Employer PF (yearly)', pf), r('Gratuity (yearly)', grat), r('Income tax (yearly)', tax), r('Professional tax', v.pt)],
        chart: { type: 'donut', f: 'money', data: [{ l: 'In-hand', v: inhand }, { l: 'PF (both)', v: pf * 2 }, { l: 'Tax', v: tax + v.pt }, { l: 'Gratuity', v: grat }] } };
    }
  },
  {
    id: 'hourly-to-salary-calculator', title: 'Hourly to Salary Calculator', sec: 'finance', sub: 'Salary, Pay & HR', pop: 1,
    desc: 'Convert an hourly wage to annual, monthly, weekly and daily pay — or turn a salary back into an hourly rate.',
    formula: 'Annual pay = hourly rate × hours per week × weeks worked per year.',
    inputs: [{ k: 'mode', l: 'I know my', t: 'seg', v: 'h', o: [['h', 'Hourly rate'], ['y', 'Annual salary']] },
      { k: 'h', l: 'Hourly rate', t: 'money', v: 25, local: { IN: 400 }, show: function (x) { return x.mode === 'h'; } },
      { k: 'y', l: 'Annual salary', t: 'money', v: 52000, local: { IN: 800000 }, show: function (x) { return x.mode === 'y'; } },
      { k: 'hw', l: 'Hours per week', t: 'number', v: 40 }, { k: 'wk', l: 'Weeks worked per year', t: 'number', v: 52 }],
    calc: function (v) { var hrs = v.hw * v.wk, yr = v.mode === 'h' ? v.h * hrs : v.y, hr = yr / hrs;
      return { results: [M(v.mode === 'h' ? 'Annual salary' : 'Hourly rate', v.mode === 'h' ? yr : hr), r('Monthly', yr / 12), r('Bi-weekly', yr / 26), r('Weekly', yr / v.wk), r('Daily (5-day week)', yr / v.wk / 5), r('Hourly', hr, 'money2')] }; }
  },
  { id: 'salary-to-hourly-calculator', extends: 'hourly-to-salary-calculator', title: 'Salary to Hourly Calculator', sub: 'Salary, Pay & HR',
    desc: 'Turn an annual salary into an hourly rate, plus monthly, weekly and daily pay.', set: { mode: { v: 'y' } } },
  {
    id: 'overtime-calculator', title: 'Overtime Calculator', sec: 'finance', sub: 'Salary, Pay & HR',
    desc: 'Calculate overtime pay and total weekly earnings at time-and-a-half, double time or any multiplier.',
    formula: 'Overtime pay = hourly rate × multiplier × overtime hours.',
    inputs: [{ k: 'h', l: 'Hourly rate', t: 'money', v: 20, local: { IN: 300 } }, { k: 'reg', l: 'Regular hours', t: 'number', v: 40 }, { k: 'ot', l: 'Overtime hours', t: 'number', v: 6 },
      { k: 'mul', l: 'Overtime rate', t: 'select', v: '1.5', o: [['1.25', '1.25×'], ['1.5', '1.5× (time and a half)'], ['2', '2× (double time)']] }],
    calc: function (v) { var ot = v.h * +v.mul * v.ot, reg = v.h * v.reg; return { results: [M('Total pay', ot + reg), r('Overtime pay', ot), r('Regular pay', reg), r('Overtime hourly rate', v.h * +v.mul, 'money2')] }; }
  },
  {
    id: 'pay-raise-calculator', title: 'Pay Raise Calculator', sec: 'finance', sub: 'Salary, Pay & HR',
    desc: 'See your new salary after a percentage raise, or find the raise percentage between two salaries.',
    formula: 'New salary = current × (1 + raise %). Raise % = (new − current) ÷ current × 100.',
    inputs: [{ k: 'cur', l: 'Current salary', t: 'money', v: 50000, local: { IN: 800000 } }, { k: 'mode', l: 'I know the', t: 'seg', v: 'p', o: [['p', 'Raise %'], ['n', 'New salary']] },
      { k: 'p', l: 'Raise', t: 'percent', v: 8, show: function (x) { return x.mode === 'p'; } }, { k: 'n', l: 'New salary', t: 'money', v: 55000, local: { IN: 900000 }, show: function (x) { return x.mode === 'n'; } }],
    calc: function (v) { var nw = v.mode === 'p' ? v.cur * (1 + v.p / 100) : v.n, pct = (nw - v.cur) / v.cur * 100;
      return { results: [M(v.mode === 'p' ? 'New salary' : 'Raise', v.mode === 'p' ? nw : pct, v.mode === 'p' ? 'money' : 'pct'), r('Increase per year', nw - v.cur), r('Increase per month', (nw - v.cur) / 12), r('New monthly salary', nw / 12)] }; }
  },
  {
    id: 'gratuity-calculator', title: 'Gratuity Calculator', sec: 'finance', sub: 'Salary, Pay & HR', pop: 1,
    desc: 'Calculate the gratuity you are due on leaving a job in India, based on your last drawn salary and years of service.',
    formula: 'Covered by the Gratuity Act: 15 × last salary × years ÷ 26. Not covered: 15 × last salary × years ÷ 30. Service of more than 6 months in the final year counts as a full year.',
    inputs: [{ k: 's', l: 'Last monthly basic + DA', t: 'money', v: 600, local: { IN: 50000 } }, { k: 'y', l: 'Years of service', t: 'number', v: 7 },
      { k: 'act', l: 'Employer covered by the Gratuity Act', t: 'check', v: true }],
    calc: function (v) { var yrs = Math.floor(v.y) + ((v.y % 1) > 0.5 ? 1 : 0), g = 15 * v.s * yrs / (v.act ? 26 : 30);
      return { results: [M('Gratuity amount', g), r('Years counted', yrs, 'int')], note: (v.y < 5 ? 'Gratuity is normally payable only after 5 years of continuous service. ' : '') + 'Gratuity up to ₹20 lakh is tax-free for private-sector employees.' }; }
  },
  {
    id: 'hra-calculator', title: 'HRA Exemption Calculator', sec: 'finance', sub: 'Tax',
    desc: 'Work out how much of your house rent allowance (HRA) is tax-exempt under the old tax regime.',
    formula: 'Exempt HRA = the lowest of: HRA received; rent paid − 10% of salary; 50% of salary (metro) or 40% (non-metro). Salary = basic + DA.',
    inputs: [{ k: 'b', l: 'Basic salary + DA (yearly)', t: 'money', v: 6000, local: { IN: 600000 } }, { k: 'h', l: 'HRA received (yearly)', t: 'money', v: 2400, local: { IN: 240000 } },
      { k: 'rent', l: 'Rent paid (yearly)', t: 'money', v: 2400, local: { IN: 240000 } }, { k: 'metro', l: 'City', t: 'seg', v: 'm', o: [['m', 'Metro'], ['n', 'Non-metro']] }],
    calc: function (v) { var a = v.h, b = Math.max(0, v.rent - 0.1 * v.b), c = v.b * (v.metro === 'm' ? 0.5 : 0.4), ex = Math.min(a, b, c);
      return { results: [M('Exempt HRA', ex), r('Taxable HRA', v.h - ex), r('Actual HRA', a), r('Rent − 10% of salary', b), r((v.metro === 'm' ? '50%' : '40%') + ' of salary', c)] }; }
  },
  {
    id: 'budget-calculator', title: 'Budget Calculator (50/30/20)', sec: 'finance', sub: 'Budget & Personal Finance', pop: 1,
    desc: 'Split your take-home pay into needs, wants and savings with the 50/30/20 rule — or set your own split.',
    formula: 'Needs = income × 50%; Wants = income × 30%; Savings = income × 20% (or your own percentages).',
    inputs: [{ k: 'inc', l: 'Monthly take-home income', t: 'money', v: 4000, local: { IN: 80000 } }, { k: 'n', l: 'Needs', t: 'percent', v: 50 }, { k: 'w', l: 'Wants', t: 'percent', v: 30 }, { k: 's', l: 'Savings & debt', t: 'percent', v: 20 }],
    calc: function (v) { var t = v.n + v.w + v.s; if (Math.abs(t - 100) > 0.01) return { error: 'The three percentages should add up to 100% (now ' + t + '%).' };
      return { results: [M('Needs', v.inc * v.n / 100), r('Wants', v.inc * v.w / 100), r('Savings & debt', v.inc * v.s / 100), r('Yearly savings', v.inc * v.s / 100 * 12)],
        chart: { type: 'donut', f: 'money', data: [{ l: 'Needs', v: v.inc * v.n / 100 }, { l: 'Wants', v: v.inc * v.w / 100 }, { l: 'Savings', v: v.inc * v.s / 100 }] } }; }
  },
  {
    id: 'net-worth-calculator', title: 'Net Worth Calculator', sec: 'finance', sub: 'Budget & Personal Finance',
    desc: 'Add up what you own and what you owe to find your net worth.',
    formula: 'Net worth = total assets − total liabilities.',
    inputs: [{ k: 'rows', l: 'Assets and liabilities', t: 'rows', add: 'Add item', cols: [{ l: 'Item', t: 'text' }, { l: 'Type', t: 'select', o: [['a', 'Asset'], ['l', 'Liability']], v: 'a' }, { l: 'Amount', t: 'number' }],
      v: [['Savings & cash', 'a', 10000], ['Investments', 'a', 25000], ['Home value', 'a', 0], ['Home loan', 'l', 0], ['Car loan', 'l', 5000], ['Credit cards', 'l', 1000]] }],
    calc: function (v) { var a = 0, l = 0; v.rows.forEach(function (x) { var n = isNaN(x[2]) ? 0 : x[2]; if (x[1] === 'l') l += n; else a += n; });
      return { results: [M('Net worth', a - l), r('Total assets', a), r('Total liabilities', l), r('Debt ratio', a ? l / a * 100 : 0, 'pct')], chart: { type: 'donut', f: 'money', data: [{ l: 'Assets', v: a }, { l: 'Liabilities', v: l }] } }; }
  },
  {
    id: 'tip-calculator', title: 'Tip Calculator', sec: 'everyday', sub: 'Everyday Life & Shopping', pop: 1,
    desc: 'Work out the tip and split the bill between any number of people, with an option to round up.',
    formula: 'Tip = bill × tip % ÷ 100. Per person = (bill + tip) ÷ people.',
    inputs: [{ k: 'b', l: 'Bill amount', t: 'money', v: 80, local: { IN: 2400 } }, { k: 't', l: 'Tip', t: 'percent', v: function (c) { return c.country.code === 'US' ? 18 : 10; }, slider: [0, 30, 1] },
      { k: 'p', l: 'Number of people', t: 'int', v: 2 }, { k: 'ru', l: 'Round up each share', t: 'check', v: false }],
    calc: function (v) { var tip = v.b * v.t / 100, tot = v.b + tip, pp = tot / Math.max(1, v.p); if (v.ru) pp = Math.ceil(pp);
      return { results: [M('Each person pays', pp), r('Tip', tip), r('Total bill', v.ru ? pp * v.p : tot), r('Tip per person', tip / Math.max(1, v.p))] }; }
  },
  {
    id: 'discount-calculator', title: 'Discount Calculator', sec: 'everyday', sub: 'Everyday Life & Shopping', pop: 1,
    desc: 'Find the sale price after a discount — including stacked “extra % off” deals and sales tax.',
    formula: 'Sale price = price × (1 − d1) × (1 − d2). Final = sale price × (1 + tax).',
    inputs: [{ k: 'p', l: 'Original price', t: 'money', v: 120, local: { IN: 2999 } }, { k: 'd', l: 'Discount', t: 'percent', v: 25 }, { k: 'd2', l: 'Extra discount', t: 'percent', v: 0, opt: 1 }, { k: 'tax', l: 'Sales tax', t: 'percent', v: 0, opt: 1 }],
    calc: function (v) { var s = v.p * (1 - v.d / 100) * (1 - v.d2 / 100), f = s * (1 + v.tax / 100);
      return { results: [M('You pay', f), r('You save', v.p - s), r('Price after discount', s), r('Total discount', (1 - s / v.p) * 100, 'pct')] }; }
  },
  {
    id: 'life-insurance-calculator', title: 'Life Insurance Needs Calculator', sec: 'finance', sub: 'Insurance',
    desc: 'Estimate how much life cover your family would need, using the human life value method.',
    formula: 'Cover = present value of (income − own expenses) until retirement + outstanding loans + goals − existing cover and savings.',
    inputs: [{ k: 'inc', l: 'Annual income', t: 'money', v: 60000, local: { IN: 1200000 } }, { k: 'own', l: 'Spent on yourself', t: 'percent', v: 30 },
      { k: 'yrs', l: 'Years until retirement', t: 'int', v: 25 }, { k: 'gr', l: 'Income growth (per year)', t: 'percent', v: 5 }, { k: 'dr', l: 'Discount rate', t: 'percent', v: 7 },
      { k: 'loans', l: 'Outstanding loans', t: 'money', v: 0, opt: 1 }, { k: 'goals', l: 'Future goals (education, marriage)', t: 'money', v: 0, opt: 1 }, { k: 'have', l: 'Existing cover + savings', t: 'money', v: 0, opt: 1 }],
    calc: function (v) { var c = v.inc * (1 - v.own / 100), g = v.gr / 100, d = v.dr / 100, n = v.yrs;
      var pv = Math.abs(d - g) < 1e-9 ? c * n : c * (1 - Math.pow((1 + g) / (1 + d), n)) / (d - g);
      var need = Math.max(0, pv + v.loans + v.goals - v.have);
      return { results: [M('Life cover needed', need), r('Income replacement value', pv), r('Rule of thumb (10× income)', v.inc * 10)] }; }
  }
  ]);
})(window.CW);
