/* Calcyworld — Finance pack 1: loans, mortgage, savings, investing */
(function (CW) {
  'use strict';
  var F = CW.F, X = CW.X, IN = function (c) { return c.country.code === 'IN'; };
  var yr = function (a, b) { return function (c) { return IN(c) ? a : b; }; };
  var r = function (l, v, f, x) { var o = { l: l, v: v, f: f || 'num' }; if (x) for (var k in x) o[k] = x[k]; return o; };
  var M = function (l, v, f, x) { x = x || {}; x.main = true; return r(l, v, f, x); };
  var num = function (id) { return CW.parse(id); };

  /* ---------- loan family (reuse the EMI engine) ---------- */
  X('business-loan-calculator', 'emi-calculator', 'Business Loan Calculator', 'finance/loans-emi', 'Monthly payment, total interest and repayment schedule for a business or working-capital loan.', { p: { v: 100000, local: { IN: 2500000 } }, rate: { v: yr(14, 9) }, n: { v: 5 } });
  X('sba-loan-calculator', 'emi-calculator', 'SBA Loan Calculator (US)', 'finance/loans-emi', 'Estimate payments on an SBA 7(a) or 504 small-business loan.', { p: { v: 350000 }, rate: { v: 10.5 }, n: { v: 10 } });
  X('boat-loan-calculator', 'emi-calculator', 'Boat Loan Calculator', 'finance/loans-emi', 'Monthly payment and total interest for financing a boat.', { p: { v: 40000 }, rate: { v: 8.5 }, n: { v: 10 } });
  X('rv-loan-calculator', 'emi-calculator', 'RV Loan Calculator', 'finance/loans-emi', 'Monthly payment and total interest for an RV or camper loan.', { p: { v: 80000 }, rate: { v: 8.5 }, n: { v: 12 } });
  X('motorcycle-loan-calculator', 'emi-calculator', 'Motorcycle Loan Calculator', 'finance/loans-emi', 'Monthly payment for a motorcycle or scooter loan.', { p: { v: 12000, local: { IN: 150000 } }, rate: { v: yr(11, 9) }, n: { v: 4 } });
  X('two-wheeler-loan-emi-calculator', 'emi-calculator', 'Two-Wheeler Loan EMI Calculator (India)', 'finance/loans-emi', 'EMI for a bike or scooter loan in India with total interest.', { p: { v: 100000, local: { IN: 100000 } }, rate: { v: 12 }, n: { v: 3 } });
  X('gold-loan-calculator', 'emi-calculator', 'Gold Loan Calculator (India)', 'finance/loans-emi', 'EMI and interest on a loan against gold jewellery.', { p: { v: 3000, local: { IN: 200000 } }, rate: { v: yr(10, 12) }, n: { v: 1 } });
  X('loan-against-property-calculator', 'emi-calculator', 'Loan Against Property Calculator (India)', 'finance/loans-emi', 'EMI for a loan against property (LAP) over up to 20 years.', { p: { v: 300000, local: { IN: 5000000 } }, rate: { v: yr(9.5, 8) }, n: { v: 15 } });
  X('student-loan-payoff-calculator', 'emi-calculator', 'Student Loan Payoff Calculator', 'finance/loans-emi', 'Monthly repayment, total interest and payoff date for student loans.', { p: { v: 35000, local: { IN: 1500000 } }, rate: { v: yr(10, 5.5) }, n: { v: 10 } });

  F('loan-tenure-calculator', 'Loan Tenure Calculator', 'finance/loans-emi', 'Find how long it takes to repay a loan for the EMI you can afford.', 'n = −ln(1 − P × r ÷ EMI) ÷ ln(1 + r), r = monthly rate.',
    [['p', 'Loan amount', 'm', 500000, '', { local: { IN: 1000000 } }], ['rate', 'Interest rate (per year)', 'p', 9], ['emi', 'EMI you can pay', 'm', 10000, '', { local: { IN: 15000 } }]],
    [['Months to repay', '-ln(1-p*(rate/1200)/emi)/ln(1+rate/1200)', 'i', 'months'], ['Years', 'o1/12', 'f', 'years', { dp: 1 }], ['Total interest', 'emi*o1-p', 'm'], ['Total paid', 'emi*o1', 'm']],
    { donut: [['Principal', 'p'], ['Interest', 'emi*o1-p']], donutF: 'm' });

  F('loan-comparison-calculator', 'Loan Comparison Calculator', 'finance/loans-emi', 'Compare two loan offers side by side and see which costs less overall.', 'EMI = P × r ÷ (1 − (1 + r)^−n) for each loan; compare total payments.',
    [['p1', 'Loan A amount', 'm', 300000, '', { local: { IN: 5000000 } }], ['r1', 'Loan A rate', 'p', 8.5], ['n1', 'Loan A years', 'n', 20], ['p2', 'Loan B amount', 'm', 300000, '', { local: { IN: 5000000 } }], ['r2', 'Loan B rate', 'p', 8], ['n2', 'Loan B years', 'n', 25]],
    [['A EMI', 'pmt(r1/1200,n1*12,p1)', 'm', '', { k: 'ea', hide: 1 }], ['B EMI', 'pmt(r2/1200,n2*12,p2)', 'm', '', { k: 'eb', hide: 1 }],
      ['A total', 'ea*n1*12', 'm', '', { k: 'ta', hide: 1 }], ['B total', 'eb*n2*12', 'm', '', { k: 'tb', hide: 1 }],
      ['Cheaper overall', 'tb-ta', 'b', '', { bands: [[0, 'Loan B costs less'], [Infinity, 'Loan A costs less']], main: true }],
      ['Loan A EMI', 'ea', 'm'], ['Loan B EMI', 'eb', 'm'], ['Loan A total paid', 'ta', 'm'], ['Loan B total paid', 'tb', 'm'], ['Difference', 'abs(tb-ta)', 'm', '', { hl: 1 }]],
    { donut: [['Loan A interest', 'ta-p1'], ['Loan B interest', 'tb-p2']], donutF: 'm' });

  F('flat-vs-reducing-rate-calculator', 'Flat vs Reducing Rate Calculator (India)', 'finance/loans-emi', 'Convert a flat interest rate to the true reducing-balance rate and see the real cost.', 'Flat EMI = P × (1 + f × n) ÷ (12n). The reducing rate is the rate at which a normal EMI equals the flat EMI.',
    [['p', 'Loan amount', 'm', 100000, '', { local: { IN: 100000 } }], ['flat', 'Flat rate (per year)', 'p', 8], ['n', 'Tenure (years)', 'n', 3]],
    [['Equivalent reducing rate', function (v) { var emi = v.p * (1 + v.flat / 100 * v.n) / (12 * v.n), N = v.n * 12, lo = 0, hi = 1; for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2, e = m ? v.p * m / (1 - Math.pow(1 + m, -N)) : v.p / N; if (e < emi) lo = m; else hi = m; } return (lo + hi) / 2 * 1200; }, 'p', 'per year'], ['Flat-rate EMI', 'p*(1+flat/100*n)/(12*n)', 'm'], ['Total interest', 'p*flat/100*n', 'm'], ['Total paid', 'p*(1+flat/100*n)', 'm']],
    { note: 'A flat rate charges interest on the full amount for the whole tenure, so the true (reducing) rate is almost double.' });

  F('credit-card-emi-calculator', 'Credit Card EMI / No-Cost EMI Calculator (India)', 'finance/loans-emi', 'See the real extra cost of converting a purchase to EMI, including GST and processing fee.', 'Interest = EMI × n − price. GST 18% applies on interest and fee.',
    [['p', 'Purchase amount', 'm', 60000, '', { local: { IN: 60000 } }], ['rate', 'Interest rate (per year)', 'p', 15], ['n', 'Tenure (months)', 'i', 6], ['fee', 'Processing fee', 'm', 199, '', { local: { IN: 199 }, opt: 1 }]],
    [['Monthly EMI', 'pmt(rate/1200,n,p)', 'm'], ['Interest paid', 'o1*n-p', 'm'], ['GST on interest + fee', '(o2+fee)*0.18', 'm'], ['Total extra cost', 'o2+fee+o3', 'm', '', { hl: 1 }], ['Total you pay', 'p+o4', 'm']],
    { note: 'On a “no-cost” EMI the interest is usually adjusted against an upfront discount, but the GST and fee still apply.' });

  F('payday-loan-calculator', 'Payday Loan Cost Calculator', 'finance/debt-credit', 'Turn a payday loan fee into its true annual percentage rate (APR).', 'APR = fee ÷ amount × 365 ÷ term days × 100.',
    [['amt', 'Amount borrowed', 'm', 500, ''], ['fee', 'Fee per 100 borrowed', 'm', 15, ''], ['days', 'Loan term (days)', 'i', 14]],
    [['APR', 'fee/100*365/days*100', 'p', 'per year', { dp: 0 }], ['Total fee', 'amt/100*fee', 'm'], ['Total to repay', 'amt+o2', 'm']], { donut: [['Borrowed', 'amt'], ['Fee', 'o2']], donutF: 'm' });

  F('lease-calculator', 'Lease Calculator', 'finance/loans-emi', 'Monthly lease payment from price, residual value, money factor and term.', 'Payment = (cap cost − residual) ÷ term + (cap cost + residual) × money factor.',
    [['cap', 'Capitalised cost', 'm', 35000, '', { local: { IN: 1500000 } }], ['res', 'Residual value', 'm', 21000, '', { local: { IN: 900000 } }], ['term', 'Lease term (months)', 'i', 36], ['mf', 'Money factor', 'n', 0.0025]],
    [['Monthly payment', '(cap-res)/term+(cap+res)*mf', 'm'], ['Depreciation part', '(cap-res)/term', 'm'], ['Finance part', '(cap+res)*mf', 'm'], ['Equivalent APR', 'mf*2400', 'p', 'per year'], ['Total of payments', 'o1*term', 'm']],
    { donut: [['Depreciation', '(cap-res)/term*term'], ['Finance charge', '(cap+res)*mf*term']], donutF: 'm' });
  F('auto-lease-calculator', 'Auto Lease Calculator', 'finance/loans-emi', 'Estimate a car lease payment with down payment, sales tax and fees.', 'Monthly = (net cap − residual) ÷ term + (net cap + residual) × money factor, plus tax.',
    [['msrp', 'Vehicle price', 'm', 38000, '', { local: { IN: 1500000 } }], ['down', 'Down payment', 'm', 2000, '', { opt: 1, local: { IN: 100000 } }], ['res', 'Residual value (% of price)', 'p', 60], ['term', 'Term (months)', 'i', 36], ['apr', 'Interest rate (APR)', 'p', 6], ['tax', 'Sales tax', 'p', 7, '', { opt: 1 }]],
    [['Monthly payment (with tax)', '((msrp-down)-msrp*res/100)/term*(1+tax/100)+((msrp-down)+msrp*res/100)*(apr/2400)*(1+tax/100)', 'm'], ['Payment before tax', 'o1/(1+tax/100)', 'm'], ['Residual value', 'msrp*res/100', 'm'], ['Total of payments', 'o1*term+down', 'm', '', { hl: 1 }]]);

  F('car-affordability-calculator', 'Car Affordability Calculator', 'finance/loans-emi', 'Find the car price you can afford from your income, down payment and loan terms.', 'Loan = payment × (1 − (1 + r)^−n) ÷ r; price = loan + down payment.',
    [['inc', 'Monthly income', 'm', 5000, '', { local: { IN: 80000 } }], ['pct', 'Share of income for the car', 'p', 15], ['down', 'Down payment', 'm', 4000, '', { opt: 1, local: { IN: 150000 } }], ['rate', 'Interest rate', 'p', 8], ['yrs', 'Loan years', 'n', 5]],
    [['Car price you can afford', 'inc*pct/100*(1-(1+rate/1200)^-(yrs*12))/(rate/1200)+down', 'm'], ['Monthly payment', 'inc*pct/100', 'm'], ['Loan amount', 'o1-down', 'm']]);

  F('cash-back-or-low-interest-calculator', 'Cash Back or Low Interest Calculator', 'finance/loans-emi', 'Decide between a cash rebate and a low-interest dealer loan.', 'Compare total paid: (price − rebate) at your bank rate vs full price at the promotional rate.',
    [['p', 'Vehicle price', 'm', 30000, '', { local: { IN: 1200000 } }], ['rebate', 'Cash back offer', 'm', 2500, '', { local: { IN: 80000 } }], ['promo', 'Promotional rate', 'p', 1.9], ['bank', 'Your bank rate', 'p', 7], ['yrs', 'Loan years', 'n', 5]],
    [['Better deal', 'pmt(bank/1200,yrs*12,p-rebate)*yrs*12-pmt(promo/1200,yrs*12,p)*yrs*12', 'b', '', { bands: [[0, 'Take the cash back'], [Infinity, 'Take the low-interest loan']], main: true }], ['Cash back: monthly', 'pmt(bank/1200,yrs*12,p-rebate)', 'm'], ['Low rate: monthly', 'pmt(promo/1200,yrs*12,p)', 'm'], ['Cash back: total paid', 'o2*yrs*12', 'm'], ['Low rate: total paid', 'o3*yrs*12', 'm'], ['You save', 'abs(o4-o5)', 'm', '', { hl: 1 }]]);

  F('balloon-loan-calculator', 'Balloon Loan Calculator', 'finance/loans-emi', 'Payment on a loan with a large final (balloon) payment.', 'Payment = (P − B ÷ (1 + r)^n) × r ÷ (1 − (1 + r)^−n).',
    [['p', 'Loan amount', 'm', 200000, ''], ['rate', 'Interest rate', 'p', 7], ['yrs', 'Term (years)', 'n', 5], ['b', 'Balloon payment', 'm', 150000, '']],
    [['Monthly payment', 'pmt(rate/1200,yrs*12,p-b/(1+rate/1200)^(yrs*12))', 'm'], ['Balloon due at end', 'b', 'm'], ['Total paid', 'o1*yrs*12+b', 'm'], ['Total interest', 'o3-p', 'm']]);

  F('debt-consolidation-calculator', 'Debt Consolidation Calculator', 'finance/debt-credit', 'See if one consolidation loan saves money versus paying your debts as they are.', 'Compare total paid at the current payment with total paid on a new loan.',
    [['d', 'Total debt', 'm', 20000, '', { local: { IN: 600000 } }], ['r', 'Current average rate', 'p', 22], ['pay', 'Current total monthly payment', 'm', 600, '', { local: { IN: 18000 } }], ['nr', 'Consolidation loan rate', 'p', 11], ['ny', 'Consolidation term (years)', 'n', 4]],
    [['Interest saved', '(pay*(-ln(1-d*(r/1200)/pay)/ln(1+r/1200))-d)-(pmt(nr/1200,ny*12,d)*ny*12-d)', 'm'], ['New monthly payment', 'pmt(nr/1200,ny*12,d)', 'm'], ['Months to pay off now', '-ln(1-d*(r/1200)/pay)/ln(1+r/1200)', 'i', 'months'], ['Total interest now', 'pay*o3-d', 'm'], ['Total interest after', 'o2*ny*12-d', 'm']]);

  CW.register({
    id: 'debt-payoff-calculator', title: 'Debt Payoff Calculator (Snowball / Avalanche)', g: 'finance/debt-credit', desc: 'Plan how to clear several debts faster with the snowball or avalanche method and see your debt-free date.',
    formula: 'Snowball pays the smallest balance first; avalanche pays the highest interest rate first. Every freed-up payment rolls into the next debt.',
    inputs: [{ k: 'debts', l: 'Your debts', t: 'rows', add: 'Add debt', cols: [{ l: 'Name', t: 'text', v: 'Card' }, { l: 'Balance', t: 'number', v: 3000 }, { l: 'APR %', t: 'number', v: 20 }, { l: 'Min. payment', t: 'number', v: 90 }],
      v: [['Credit card', 4000, 22, 120], ['Car loan', 9000, 9, 220], ['Store card', 1500, 27, 55]] },
      { k: 'extra', l: 'Extra monthly payment', t: 'money', v: 200, opt: 1, local: { IN: 5000 } }, { k: 'm', l: 'Method', t: 'seg', v: 'av', o: [['av', 'Avalanche'], ['sn', 'Snowball']] }],
    calc: function (v) {
      var D = v.debts.filter(function (d) { return d[1] > 0; }).map(function (d) { return { n: d[0] || 'Debt', b: d[1], r: d[2] / 1200, p: d[3] }; });
      if (!D.length) return { error: 'Add at least one debt with a balance.' };
      var pool = D.reduce(function (a, d) { return a + d.p; }, 0) + v.extra, months = 0, tot = 0, order = [], series = [D.reduce(function (a, d) { return a + d.b; }, 0)];
      while (D.some(function (d) { return d.b > 0.005; }) && months < 600) {
        months++; var left = pool;
        D.forEach(function (d) { if (d.b > 0) { var i = d.b * d.r; d.b += i; tot += i; var pay = Math.min(d.p, d.b); d.b -= pay; left -= pay; } });
        var live = D.filter(function (d) { return d.b > 0.005; }).sort(function (a, b) { return v.m === 'av' ? b.r - a.r : a.b - b.b; });
        live.forEach(function (d) { var x = Math.min(left, d.b); d.b -= x; left -= x; });
        D.forEach(function (d) { if (d.b <= 0.005 && !d.done) { d.done = months; order.push([d.n, months]); d.b = 0; } });
        series.push(D.reduce(function (a, d) { return a + d.b; }, 0));
      }
      if (months >= 600) return { error: 'These payments never clear the debt — increase the payment.' };
      var step = Math.max(1, Math.ceil(series.length / 18)), lab = [], pts = [];
      series.forEach(function (s, i) { if (i % step === 0 || i === series.length - 1) { lab.push(i + ' mo'); pts.push(s); } });
      var d = new Date(); d.setMonth(d.getMonth() + months);
      return { results: [M('Debt-free in', CW.fin.yrsMo(months), 'text'), r('Debt-free date', d, 'date'), r('Total interest', tot, 'money'), r('Total paid', tot + series[0], 'money')],
        chart: { type: 'line', labels: lab, series: [{ l: 'Total balance', pts: pts }], f: 'money' },
        table: { title: 'Payoff order', head: ['Debt', 'Cleared in month'], fmt: ['text', 'int'], rows: order } };
    }
  });

  /* ---------- mortgage ---------- */
  F('mortgage-payoff-calculator', 'Mortgage Payoff Calculator', 'finance/mortgage', 'See how much time and interest extra payments save on your mortgage.', 'Months = −ln(1 − B × r ÷ payment) ÷ ln(1 + r). Extra payments raise the payment.',
    [['b', 'Current balance', 'm', 250000, '', { local: { IN: 4000000 } }], ['rate', 'Interest rate', 'p', 6.5], ['pay', 'Current monthly payment', 'm', 1800, '', { local: { IN: 38000 } }], ['extra', 'Extra monthly payment', 'm', 300, '', { local: { IN: 5000 } }]],
    [['Time saved (months)', '-ln(1-b*(rate/1200)/pay)/ln(1+rate/1200)--ln(1-b*(rate/1200)/(pay+extra))/ln(1+rate/1200)', 'i', 'months'], ['Interest saved', '(pay*(-ln(1-b*(rate/1200)/pay)/ln(1+rate/1200))-b)-((pay+extra)*(-ln(1-b*(rate/1200)/(pay+extra))/ln(1+rate/1200))-b)', 'm'], ['Months with extra', '-ln(1-b*(rate/1200)/(pay+extra))/ln(1+rate/1200)', 'i'], ['Months without extra', '-ln(1-b*(rate/1200)/pay)/ln(1+rate/1200)', 'i']]);

  F('down-payment-calculator', 'Down Payment Calculator', 'finance/mortgage', 'How much to put down on a home, and what your monthly payment will be.', 'Down payment = price × %; loan = price − down payment. PMI is estimated at 0.5% a year when the down payment is under 20%.',
    [['price', 'Home price', 'm', 400000, '', { local: { IN: 7500000 } }], ['pct', 'Down payment', 'p', 20], ['rate', 'Interest rate', 'p', 6.5], ['yrs', 'Loan term (years)', 'n', 30]],
    [['Down payment', 'price*pct/100', 'm'], ['Loan amount', 'price-o1', 'm'], ['Monthly payment', 'pmt(rate/1200,yrs*12,o2)+if(pct<20,o2*0.005/12,0)', 'm'], ['PMI (est. monthly)', 'if(pct<20,o2*0.005/12,0)', 'm'], ['Cash to save for 20%', 'max(0,price*0.2-o1)', 'm']],
    { donut: [['Down payment', 'price*pct/100'], ['Loan', 'price-price*pct/100']], donutF: 'm' });

  CW.register({
    id: 'rent-vs-buy-calculator', title: 'Rent vs Buy Calculator', g: 'finance/mortgage', desc: 'Compare the long-term cost of renting with buying a home, including appreciation and investing the difference.',
    formula: 'Buying cost = mortgage payments + tax + upkeep − equity gained. Renting cost = rent paid − growth on the down payment you invest instead.',
    inputs: [{ k: 'price', l: 'Home price', t: 'money', v: 400000, local: { IN: 7500000 } }, { k: 'down', l: 'Down payment', t: 'percent', v: 20 }, { k: 'rate', l: 'Mortgage rate', t: 'percent', v: 6.5 }, { k: 'tax', l: 'Property tax & upkeep (per year)', t: 'percent', v: 1.8 },
      { k: 'app', l: 'Home price growth', t: 'percent', v: 3.5 }, { k: 'rent', l: 'Monthly rent', t: 'money', v: 1900, local: { IN: 30000 } }, { k: 'ri', l: 'Rent increase', t: 'percent', v: 3 }, { k: 'inv', l: 'Investment return', t: 'percent', v: 7 }, { k: 'yrs', l: 'Years to compare', t: 'number', v: 10 }],
    calc: function (v) {
      var loan = v.price * (1 - v.down / 100), pay = CW.fin.emi(loan, v.rate, 360), bal = loan, rent = v.rent * 12, rented = 0, bought = 0, inv = v.price * v.down / 100, lab = [], a = [], b = [];
      for (var y = 1; y <= v.yrs; y++) {
        for (var m = 0; m < 12; m++) { var i = bal * v.rate / 1200; bal -= pay - i; bought += i; }
        bought += v.price * Math.pow(1 + v.app / 100, y - 1) * v.tax / 100; inv *= 1 + v.inv / 100; rented += rent; rent *= 1 + v.ri / 100;
        lab.push('Y' + y); a.push(bought); b.push(rented - (inv - v.price * v.down / 100));
      }
      var val = v.price * Math.pow(1 + v.app / 100, v.yrs), net = bought - (val - v.price) - 0, rentNet = rented - (inv - v.price * v.down / 100);
      var buyBetter = net < rentNet;
      return { results: [M('Cheaper over ' + v.yrs + ' years', buyBetter ? 'Buying' : 'Renting', 'text', { sub: 'by about ' + CW.fmt.money(Math.abs(net - rentNet)) }), r('Net cost of buying', net, 'money'), r('Net cost of renting', rentNet, 'money'), r('Home value at the end', val, 'money'), r('Mortgage balance left', bal, 'money')],
        chart: { type: 'line', labels: lab, series: [{ l: 'Buy: interest + upkeep', pts: a }, { l: 'Rent: rent − investment gain', pts: b }], f: 'money' } };
    }
  });

  F('fha-loan-calculator', 'FHA Loan Calculator (US)', 'finance/mortgage', 'FHA mortgage payment with the upfront and annual mortgage insurance premiums.', 'UFMIP 1.75% is added to the loan; annual MIP is about 0.55% of the loan for most 30-year loans.',
    [['price', 'Home price', 'm', 350000, ''], ['dp', 'Down payment', 'p', 3.5], ['rate', 'Interest rate', 'p', 6.25], ['yrs', 'Term (years)', 'n', 30]],
    [['Monthly payment', 'pmt(rate/1200,yrs*12,price*(1-dp/100)*1.0175)+price*(1-dp/100)*0.0055/12', 'm'], ['Principal & interest', 'pmt(rate/1200,yrs*12,price*(1-dp/100)*1.0175)', 'm'], ['Monthly MIP', 'price*(1-dp/100)*0.0055/12', 'm'], ['Upfront premium (UFMIP)', 'price*(1-dp/100)*0.0175', 'm'], ['Down payment', 'price*dp/100', 'm']],
    { donut: [['Principal & interest', 'o2'], ['Mortgage insurance', 'o3']], donutF: 'm', note: 'Minimum down payment is 3.5% with a 580+ credit score. Premiums vary with loan size, term and LTV.' });
  F('va-mortgage-calculator', 'VA Mortgage Calculator (US)', 'finance/mortgage', 'VA loan payment including the VA funding fee, with no mortgage insurance.', 'Funding fee: 2.15% first use / 3.3% repeat with no down payment, 1.5% with 5%+ down, 1.25% with 10%+ down.',
    [['price', 'Home price', 'm', 400000, ''], ['dp', 'Down payment', 'p', 0], ['use', 'VA loan use', 'g', 1, [[1, 'First use'], [2, 'Repeat use']]], ['rate', 'Interest rate', 'p', 6.25], ['yrs', 'Term (years)', 'n', 30]],
    [['Fee %', 'if(dp>=10,1.25,if(dp>=5,1.5,if(use==1,2.15,3.3)))', 'f', '%', { k: 'ff', hide: 1 }], ['Monthly payment', 'pmt(rate/1200,yrs*12,price*(1-dp/100)*(1+ff/100))', 'm'], ['Funding fee %', 'ff', 'f', '%', { dp: 2 }], ['Funding fee', 'price*(1-dp/100)*ff/100', 'm'], ['Loan amount (with fee)', 'price*(1-dp/100)*(1+ff/100)', 'm']]);
  F('jumbo-loan-calculator', 'Jumbo Loan Calculator (US)', 'finance/mortgage', 'Check if your mortgage is jumbo and estimate the payment.', 'A loan above the conforming limit ($832,750 baseline for 2026) is a jumbo loan.',
    [['price', 'Home price', 'm', 1100000, ''], ['dp', 'Down payment', 'p', 20], ['rate', 'Interest rate', 'p', 6.9], ['yrs', 'Term (years)', 'n', 30], ['lim', 'Conforming loan limit', 'm', 832750, '']],
    [['Monthly payment', 'pmt(rate/1200,yrs*12,price*(1-dp/100))', 'm'], ['Loan amount', 'price*(1-dp/100)', 'm'], ['Amount over the limit', 'max(0,o2-lim)', 'm'], ['Is it jumbo?', 'o2-lim', 'b', '', { bands: [[0, 'No — conforming loan'], [Infinity, 'Yes — jumbo loan']] }], ['Total interest', 'o1*yrs*12-o2', 'm']]);
  F('interest-only-mortgage-calculator', 'Interest-Only Mortgage Calculator', 'finance/mortgage', 'Compare the interest-only period payment with the later amortising payment.', 'Interest-only payment = P × r ÷ 12. After that the balance is repaid over the remaining term.',
    [['p', 'Loan amount', 'm', 400000, '', { local: { IN: 5000000 } }], ['rate', 'Interest rate', 'p', 6.5], ['io', 'Interest-only years', 'n', 10], ['yrs', 'Total term (years)', 'n', 30]],
    [['Interest-only payment', 'p*rate/1200', 'm'], ['Payment after interest-only', 'pmt(rate/1200,(yrs-io)*12,p)', 'm'], ['Payment jump', 'o2-o1', 'm', '', { hl: 1 }], ['Total interest', 'o1*io*12+o2*(yrs-io)*12-p', 'm']]);
  F('arm-calculator', 'ARM Calculator (Adjustable Rate Mortgage)', 'finance/mortgage', 'See how your payment changes when an adjustable-rate mortgage resets.', 'The balance after the fixed period is re-amortised over the remaining term at the new rate.',
    [['p', 'Loan amount', 'm', 350000, ''], ['r1', 'Initial rate', 'p', 5.5], ['fix', 'Fixed period (years)', 'n', 5], ['r2', 'Rate after reset', 'p', 7.5], ['yrs', 'Term (years)', 'n', 30]],
    [['Initial payment', 'pmt(r1/1200,yrs*12,p)', 'm'], ['Balance at reset', 'p*(1+r1/1200)^(fix*12)-o1*((1+r1/1200)^(fix*12)-1)/(r1/1200)', 'm'], ['Payment after reset', 'pmt(r2/1200,(yrs-fix)*12,o2)', 'm'], ['Payment increase', 'o3-o1', 'm', '', { hl: 1 }]]);
  F('heloc-calculator', 'HELOC Calculator', 'finance/mortgage', 'Available equity and payments for a home equity line of credit.', 'Available credit = home value × max LTV − current mortgage balance.',
    [['hv', 'Home value', 'm', 450000, '', { local: { IN: 8000000 } }], ['mb', 'Mortgage balance', 'm', 250000, '', { local: { IN: 4000000 } }], ['ltv', 'Maximum combined LTV', 'p', 85], ['draw', 'Amount you draw', 'm', 50000, '', { local: { IN: 1000000 } }], ['rate', 'HELOC rate', 'p', 8.5], ['rp', 'Repayment years', 'n', 15]],
    [['Available credit', 'max(0,hv*ltv/100-mb)', 'm'], ['Interest-only payment (draw period)', 'draw*rate/1200', 'm'], ['Repayment-period payment', 'pmt(rate/1200,rp*12,draw)', 'm'], ['Equity now', 'hv-mb', 'm']]);
  F('home-equity-loan-calculator', 'Home Equity Loan Calculator', 'finance/mortgage', 'How much you can borrow against your home and the fixed monthly payment.', 'Borrowable = home value × max LTV − mortgage balance.',
    [['hv', 'Home value', 'm', 450000, '', { local: { IN: 8000000 } }], ['mb', 'Mortgage balance', 'm', 250000, '', { local: { IN: 4000000 } }], ['ltv', 'Maximum combined LTV', 'p', 85], ['rate', 'Interest rate', 'p', 8], ['yrs', 'Term (years)', 'n', 10]],
    [['You can borrow up to', 'max(0,hv*ltv/100-mb)', 'm'], ['Monthly payment', 'pmt(rate/1200,yrs*12,o1)', 'm'], ['Total interest', 'o2*yrs*12-o1', 'm']]);
  F('reverse-mortgage-calculator', 'Reverse Mortgage Calculator', 'finance/mortgage', 'A rough estimate of the cash a reverse mortgage (HECM) may release.', 'Estimate: principal limit ≈ home value × a factor that rises with age (about 38% at 62 to 65% at 85).',
    [['hv', 'Home value', 'm', 500000, ''], ['age', 'Youngest borrower age', 'i', 70, ''], ['mb', 'Existing mortgage', 'm', 0, '', { opt: 1 }], ['cap', 'Maximum claim amount', 'm', 1249125, '']],
    [['Estimated available cash', 'max(0,min(hv,cap)*(0.38+(min(max(age,62),90)-62)*0.0096)-mb)', 'm'], ['Principal limit factor', '0.38+(min(max(age,62),90)-62)*0.0096', 'p', '', { dp: 1 }], ['Principal limit', 'min(hv,cap)*o2', 'm']], { note: 'A rough estimate only — real limits depend on current rates and lender rules. Speak to an FHA-approved HECM counsellor.' });
  F('mortgage-points-calculator', 'Mortgage Points Calculator', 'finance/mortgage', 'Is buying discount points worth it? See the break-even point.', 'Break-even months = cost of points ÷ monthly saving.',
    [['p', 'Loan amount', 'm', 350000, '', { local: { IN: 5000000 } }], ['rate', 'Rate without points', 'p', 6.75], ['pts', 'Points to buy', 'n', 1], ['red', 'Rate cut per point', 'p', 0.25], ['yrs', 'Term (years)', 'n', 30]],
    [['Break-even', 'p*pts/100/(pmt(rate/1200,yrs*12,p)-pmt((rate-pts*red)/1200,yrs*12,p))', 'i', 'months'], ['Cost of points', 'p*pts/100', 'm'], ['Monthly saving', 'pmt(rate/1200,yrs*12,p)-pmt((rate-pts*red)/1200,yrs*12,p)', 'm'], ['New payment', 'pmt((rate-pts*red)/1200,yrs*12,p)', 'm'], ['Lifetime saving', 'o3*yrs*12-o2', 'm']]);

  /* ---------- interest & savings ---------- */
  F('effective-annual-rate-calculator', 'Effective Annual Rate (EAR) Calculator', 'finance/interest-savings', 'Convert a nominal rate and compounding frequency to the true effective annual rate.', 'EAR = (1 + r ÷ m)^m − 1.',
    [['r', 'Nominal rate', 'p', 12], ['m', 'Compounding', 's', 12, [[1, 'Annually'], [2, 'Semi-annually'], [4, 'Quarterly'], [12, 'Monthly'], [52, 'Weekly'], [365, 'Daily']]]],
    [['Effective annual rate', '((1+r/100/m)^m-1)*100', 'p', '', { dp: 4 }], ['Extra over nominal', 'o1-r', 'p', '', { dp: 4 }], ['Continuous compounding', '(exp(r/100)-1)*100', 'p', '', { dp: 4 }]],
    { plot: { x: 'x', from: 1, to: 365, n: 24, series: [['EAR %', '((1+r/100/x)^x-1)*100']], f: 'n' } });
  F('daily-compound-interest-calculator', 'Daily Compound Interest Calculator', 'finance/interest-savings', 'Growth of a deposit when interest compounds every day, with optional monthly deposits.', 'FV = P × (1 + r/365)^(365t) + deposits compounded daily.',
    [['p', 'Starting amount', 'm', 10000, ''], ['c', 'Monthly deposit', 'm', 200, '', { opt: 1 }], ['r', 'Interest rate', 'p', 5], ['t', 'Years', 'n', 10]],
    [['Future value', 'p*(1+r/36500)^(365*t)+c*((1+r/36500)^(365*t)-1)/((1+r/36500)^(365/12)-1)', 'm'], ['Total deposited', 'p+c*12*t', 'm'], ['Interest earned', 'o1-o2', 'm']],
    { donut: [['Deposits', 'p+c*12*t'], ['Interest', 'o1-o2']], donutF: 'm', plot: { x: 'x', from: 0, to: 't', n: 20, series: [['Balance', 'p*(1+r/36500)^(365*x)+c*((1+r/36500)^(365*x)-1)/((1+r/36500)^(365/12)-1)']], f: 'm' } });
  F('high-yield-savings-calculator', 'High-Yield Savings Calculator', 'finance/interest-savings', 'See how a high-APY savings account grows with monthly deposits.', 'Monthly rate = (1 + APY)^(1/12) − 1.',
    [['p', 'Starting balance', 'm', 5000, ''], ['c', 'Monthly deposit', 'm', 300, '', { opt: 1 }], ['apy', 'APY', 'p', 4.3], ['t', 'Years', 'n', 5]],
    [['Balance after', 'p*(1+apy/100)^t+c*((1+apy/100)^t-1)/((1+apy/100)^(1/12)-1)', 'm'], ['Total deposited', 'p+c*12*t', 'm'], ['Interest earned', 'o1-o2', 'm']], { donut: [['Deposits', 'p+c*12*t'], ['Interest', 'o1-o2']], donutF: 'm' });
  F('emergency-fund-calculator', 'Emergency Fund Calculator', 'finance/budget', 'How big your emergency fund should be and how long it will take to build.', 'Target = monthly essential expenses × months of cover.',
    [['ex', 'Monthly essential expenses', 'm', 2500, '', { local: { IN: 40000 } }], ['mo', 'Months of cover', 's', 6, [[3, '3 months'], [6, '6 months'], [9, '9 months'], [12, '12 months']]], ['have', 'Already saved', 'm', 3000, '', { opt: 1, local: { IN: 50000 } }], ['sv', 'You can save per month', 'm', 400, '', { local: { IN: 8000 } }]],
    [['Emergency fund target', 'ex*mo', 'm'], ['Still needed', 'max(0,o1-have)', 'm'], ['Months to reach it', 'o2/sv', 'f', 'months', { dp: 1 }]], { donut: [['Saved', 'min(have,ex*mo)'], ['Still needed', 'max(0,ex*mo-have)']], donutF: 'm' });
  F('annuity-calculator', 'Annuity Calculator', 'finance/interest-savings', 'Future and present value of regular payments (ordinary annuity or annuity due).', 'FV = PMT × ((1 + r)^n − 1) ÷ r; PV = PMT × (1 − (1 + r)^−n) ÷ r. Annuity due × (1 + r).',
    [['pm', 'Payment per period', 'm', 1000, ''], ['r', 'Rate per year', 'p', 6], ['n', 'Years', 'n', 20], ['f', 'Payments per year', 's', 12, [[1, 'Yearly'], [4, 'Quarterly'], [12, 'Monthly']]], ['due', 'Payment timing', 'g', 0, [[0, 'End of period'], [1, 'Start of period']]]],
    [['Future value', 'pm*((1+r/100/f)^(n*f)-1)/(r/100/f)*(1+due*r/100/f)', 'm'], ['Present value', 'pm*(1-(1+r/100/f)^-(n*f))/(r/100/f)*(1+due*r/100/f)', 'm'], ['Total paid in', 'pm*n*f', 'm'], ['Interest earned', 'o1-o3', 'm']], { donut: [['Payments', 'pm*n*f'], ['Interest', 'o1-pm*n*f']], donutF: 'm' });
  F('annuity-payout-calculator', 'Annuity Payout Calculator', 'finance/interest-savings', 'Regular income you can draw from a lump sum over a fixed number of years.', 'Payout = P × r ÷ (1 − (1 + r)^−n).',
    [['p', 'Lump sum', 'm', 500000, '', { local: { IN: 5000000 } }], ['r', 'Rate per year', 'p', 6], ['n', 'Payout years', 'n', 20], ['f', 'Payments per year', 's', 12, [[1, 'Yearly'], [4, 'Quarterly'], [12, 'Monthly']]]],
    [['Payout per period', 'pmt(r/100/f,n*f,p)', 'm'], ['Total received', 'o1*n*f', 'm'], ['Interest earned', 'o2-p', 'm']]);
  F('time-value-of-money-calculator', 'Time Value of Money (TVM) Calculator', 'finance/interest-savings', 'Solve for future value, present value, payment or number of periods.', 'FV = PV(1 + r)^n + PMT((1 + r)^n − 1) ÷ r.',
    [['w', 'Solve for', 's', 1, [[1, 'Future value'], [2, 'Present value'], [3, 'Payment'], [4, 'Number of periods']]], ['pv', 'Present value', 'm', 10000, '', { opt: 1 }], ['pm', 'Payment per period', 'm', 200, '', { opt: 1 }], ['r', 'Rate per period', 'p', 0.5], ['n', 'Periods', 'n', 120, '', {}], ['fv', 'Future value', 'm', 50000, '', { opt: 1 }]],
    [['Result', 'if(w==1,pv*(1+r/100)^n+pm*((1+r/100)^n-1)/(r/100),if(w==2,(fv-pm*((1+r/100)^n-1)/(r/100))/(1+r/100)^n,if(w==3,(fv-pv*(1+r/100)^n)*(r/100)/((1+r/100)^n-1),ln((fv*(r/100)+pm)/(pv*(r/100)+pm))/ln(1+r/100))))', 'n', '', { dp: 2 }]]);
  F('sinking-fund-calculator', 'Sinking Fund Calculator', 'finance/interest-savings', 'Regular deposit needed to reach a future target.', 'Payment = target × r ÷ ((1 + r)^n − 1).',
    [['t', 'Target amount', 'm', 100000, '', { local: { IN: 1000000 } }], ['r', 'Rate per year', 'p', 6], ['y', 'Years', 'n', 5], ['f', 'Deposits per year', 's', 12, [[1, 'Yearly'], [4, 'Quarterly'], [12, 'Monthly']]]],
    [['Deposit per period', 't*(r/100/f)/((1+r/100/f)^(y*f)-1)', 'm'], ['Total deposited', 'o1*y*f', 'm'], ['Interest earned', 't-o2', 'm']], { donut: [['Deposits', 't*(r/100/f)/((1+r/100/f)^(y*f)-1)*y*f'], ['Interest', 't-t*(r/100/f)/((1+r/100/f)^(y*f)-1)*y*f']], donutF: 'm' });
  F('post-office-scheme-calculator', 'Post Office Schemes Calculator (MIS, NSC, KVP) (India)', 'finance/savings-schemes', 'Returns on Post Office Monthly Income Scheme, NSC and Kisan Vikas Patra.', 'MIS: monthly income = P × rate ÷ 12. NSC: yearly compounding for 5 years. KVP: money doubles in about 115 months.',
    [['s', 'Scheme', 's', 1, [[1, 'Monthly Income Scheme (MIS)'], [2, 'National Savings Certificate (NSC)'], [3, 'Kisan Vikas Patra (KVP)']]], ['p', 'Investment', 'm', 500000, '', { local: { IN: 500000 } }], ['r', 'Interest rate', 'p', 7.4]],
    [['Maturity / total value', 'if(s==1,p+p*r/100*5,if(s==2,p*(1+r/100)^5,p*2))', 'm'], ['Monthly income (MIS)', 'if(s==1,p*r/1200,0)', 'm'], ['Interest earned', 'o1-p', 'm']], { note: 'Rates are revised every quarter by the Government of India — enter the current rate. MIS runs 5 years, NSC 5 years, KVP about 9 years 7 months.' });
  F('sukanya-samriddhi-yojana-calculator', 'Sukanya Samriddhi Yojana (SSY) Calculator (India)', 'finance/savings-schemes', 'Maturity value of an SSY account for your daughter.', 'Deposits for 15 years, matures at 21 years. FV = d × (1 + r)^(M − D + 1) × ((1 + r)^D − 1) ÷ r (yearly approximation).',
    [['d', 'Yearly deposit (max 1,50,000)', 'm', 150000, '', { local: { IN: 150000 } }], ['r', 'Interest rate', 'p', 8.2], ['dy', 'Deposit years', 'i', 15], ['my', 'Maturity (years from opening)', 'i', 21]],
    [['Maturity value', 'd*(1+r/100)^(my-dy+1)*((1+r/100)^dy-1)/(r/100)', 'm'], ['Total deposited', 'd*dy', 'm'], ['Interest earned', 'o1-o2', 'm']], { donut: [['Deposits', 'd*dy'], ['Interest', 'd*(1+r/100)^(my-dy+1)*((1+r/100)^dy-1)/(r/100)-d*dy']], donutF: 'm', note: 'The scheme rate is notified quarterly. This is a yearly-compounding estimate.' });
  F('senior-citizen-savings-scheme-calculator', 'Senior Citizen Savings Scheme (SCSS) Calculator (India)', 'finance/savings-schemes', 'Quarterly interest payout from SCSS.', 'Quarterly interest = P × rate ÷ 4. Limit ₹30 lakh, tenure 5 years.',
    [['p', 'Deposit (max 30,00,000)', 'm', 3000000, '', { local: { IN: 3000000 } }], ['r', 'Interest rate', 'p', 8.2], ['y', 'Years', 'i', 5]],
    [['Quarterly interest', 'p*r/400', 'm'], ['Monthly equivalent', 'p*r/1200', 'm'], ['Total interest', 'p*r/100*y', 'm']]);
  F('isa-calculator', 'ISA Calculator (UK)', 'finance/savings-schemes', 'Growth of an ISA with the £20,000 yearly allowance in mind.', 'FV = P(1 + r)^t + monthly × ((1 + r_m)^(12t) − 1) ÷ r_m.',
    [['p', 'Starting ISA value', 'm', 5000, ''], ['c', 'Monthly contribution', 'm', 500, ''], ['r', 'Expected annual return', 'p', 5], ['t', 'Years', 'n', 15]],
    [['ISA value', 'p*(1+r/100)^t+c*((1+r/100)^t-1)/((1+r/100)^(1/12)-1)', 'm'], ['Total paid in', 'p+c*12*t', 'm'], ['Tax-free growth', 'o1-o2', 'm'], ['Yearly allowance used', 'c*12/20000*100', 'p']], { note: 'The annual ISA allowance is £20,000 across all adult ISAs.' });

  /* ---------- investing & trading ---------- */
  F('mutual-fund-returns-calculator', 'Mutual Fund Returns Calculator', 'finance/investing', 'Absolute return and CAGR on a mutual fund or any lump-sum investment.', 'CAGR = (current ÷ invested)^(1 ÷ years) − 1.',
    [['i', 'Amount invested', 'm', 100000, '', { local: { IN: 100000 } }], ['c', 'Current value', 'm', 165000, '', { local: { IN: 165000 } }], ['y', 'Years held', 'n', 4]],
    [['CAGR', '((c/i)^(1/y)-1)*100', 'p', 'per year'], ['Absolute return', '(c/i-1)*100', 'p'], ['Profit', 'c-i', 'm']]);
  F('dividend-calculator', 'Dividend Calculator', 'finance/investing', 'Annual dividend income, yield and after-tax dividends.', 'Annual dividend = shares × dividend per share × payments per year.',
    [['sh', 'Shares owned', 'i', 500], ['dps', 'Dividend per share (per payment)', 'n', 0.6], ['f', 'Payments per year', 's', 4, [[1, 'Yearly'], [2, 'Half-yearly'], [4, 'Quarterly'], [12, 'Monthly']]], ['pr', 'Share price', 'm', 60, ''], ['tax', 'Tax on dividends', 'p', 15, '', { opt: 1 }]],
    [['Annual dividend', 'sh*dps*f', 'm'], ['Dividend yield', 'dps*f/pr*100', 'p'], ['After-tax income', 'o1*(1-tax/100)', 'm'], ['Per payment', 'sh*dps', 'm']]);
  CW.register({
    id: 'drip-calculator', title: 'DRIP Calculator (Dividend Reinvestment)', g: 'finance/investing', desc: 'Project the value of a stock when you reinvest all dividends.',
    formula: 'Each year: shares += dividends ÷ price; price and dividend grow at your assumed rates.',
    inputs: [{ k: 'sh', l: 'Shares owned', t: 'number', v: 100 }, { k: 'pr', l: 'Share price', t: 'money', v: 50 }, { k: 'dy', l: 'Dividend yield', t: 'percent', v: 3.5 }, { k: 'pg', l: 'Price growth per year', t: 'percent', v: 6 }, { k: 'dg', l: 'Dividend growth per year', t: 'percent', v: 5 }, { k: 'y', l: 'Years', t: 'number', v: 15 }],
    calc: function (v) {
      var sh = v.sh, pr = v.pr, div = v.pr * v.dy / 100, lab = [], pts = [], rows = [], plain = v.sh * v.pr, inc = 0;
      for (var y = 1; y <= v.y; y++) { var d = sh * div; sh += d / pr; inc += d; pr *= 1 + v.pg / 100; div *= 1 + v.dg / 100; lab.push('Y' + y); pts.push(sh * pr); rows.push([y, sh, sh * pr, d]); }
      var noDrip = v.sh * v.pr * Math.pow(1 + v.pg / 100, v.y);
      return { results: [M('Value with DRIP', sh * pr, 'money'), r('Shares at the end', sh, 'num', { dp: 2 }), r('Dividends reinvested', inc, 'money'), r('Value without reinvesting', noDrip, 'money'), r('Extra from DRIP', sh * pr - noDrip, 'money', { hl: 1 })],
        chart: { type: 'line', labels: lab, series: [{ l: 'Portfolio value', pts: pts }], f: 'money' }, table: { head: ['Year', 'Shares', 'Value', 'Dividends'], fmt: ['int', 'num', 'money', 'money'], rows: rows, title: 'Year by year' } };
    }
  });
  F('brokerage-calculator', 'Brokerage Calculator (India)', 'finance/stocks-trading', 'Net profit after brokerage, STT, exchange charges, GST and stamp duty for NSE/BSE trades.', 'Net P&L = (sell − buy) × qty − brokerage − STT − exchange charges − SEBI fee − GST − stamp duty.',
    [['t', 'Trade type', 'g', 1, [[1, 'Delivery'], [2, 'Intraday']]], ['buy', 'Buy price', 'm', 500, '', { local: { IN: 500 } }], ['sell', 'Sell price', 'm', 520, '', { local: { IN: 520 } }], ['q', 'Quantity', 'i', 100], ['b', 'Brokerage (% per side, 0 = free)', 'n', 0, '', { opt: 1 }]],
    [['Charges', 'b/100*(buy+sell)*q+if(t==1,(buy+sell)*q*0.001,sell*q*0.00025)+(buy+sell)*q*0.0000297+(buy+sell)*q*0.000001+(b/100*(buy+sell)*q+(buy+sell)*q*0.0000297+(buy+sell)*q*0.000001)*0.18+if(t==1,buy*q*0.00015,buy*q*0.00003)', 'm', '', { k: 'chg', hide: 1 }], ['Net profit / loss', '(sell-buy)*q-chg', 'm'], ['Total charges', 'chg', 'm'], ['Gross profit', '(sell-buy)*q', 'm'], ['Break-even sell price', 'buy+chg/q', 'm', '', { dp: 2 }]],
    { note: 'Approximate statutory charges on NSE equity. Your broker’s actual charges may differ slightly.' });
  F('margin-trading-calculator', 'Margin Calculator (Trading)', 'finance/stocks-trading', 'Margin needed for a leveraged position and the price that triggers liquidation.', 'Margin = position value ÷ leverage.',
    [['pos', 'Position value', 'm', 50000, ''], ['lev', 'Leverage (x)', 'n', 5], ['side', 'Direction', 'g', 1, [[1, 'Long'], [-1, 'Short']]], ['entry', 'Entry price', 'm', 100, '']],
    [['Margin required', 'pos/lev', 'm'], ['Borrowed amount', 'pos-o1', 'm'], ['Liquidation price (approx.)', 'entry*(1-side/lev)', 'm', '', { dp: 2 }], ['Price move to wipe out margin', '100/lev', 'p']]);
  F('options-profit-calculator', 'Options Profit Calculator', 'finance/stocks-trading', 'Profit or loss and break-even for a long call or put at expiry, with a payoff chart.', 'Call P/L = max(S − K, 0) − premium; put P/L = max(K − S, 0) − premium.',
    [['t', 'Option type', 'g', 1, [[1, 'Call'], [-1, 'Put']]], ['k', 'Strike price', 'm', 100, ''], ['pr', 'Premium paid (per share)', 'm', 4, ''], ['q', 'Contracts × lot size', 'i', 100], ['s', 'Price at expiry', 'm', 112, '']],
    [['Profit / loss', '(max(t*(s-k),0)-pr)*q', 'm'], ['Break-even price', 'k+t*pr', 'm'], ['Maximum loss', 'pr*q', 'm'], ['Return on premium', '(max(t*(s-k),0)-pr)/pr*100', 'p']],
    { plot: { x: 'x', from: 'k*0.7', to: 'k*1.3', n: 24, series: [['P/L at expiry', '(max(t*(x-k),0)-pr)*q']], f: 'm' } });
  F('black-scholes-calculator', 'Black-Scholes Option Pricing Calculator', 'finance/stocks-trading', 'Fair value of European call and put options with the Greeks.', 'C = S·N(d1) − K·e^(−rT)·N(d2); d1 = [ln(S/K) + (r + σ²/2)T] ÷ (σ√T); d2 = d1 − σ√T.',
    [['s', 'Stock price', 'm', 100, ''], ['k', 'Strike price', 'm', 105, ''], ['t', 'Time to expiry (years)', 'n', 0.5], ['r', 'Risk-free rate', 'p', 4.5], ['v', 'Volatility', 'p', 25]],
    [['Call price', 's*ncdf(d1)-k*exp(-r/100*t)*ncdf(d1-v/100*sqrt(t))', 'm', '', { dp: 2, k: 'call' }], ['Put price', 'k*exp(-r/100*t)*ncdf(-(d1-v/100*sqrt(t)))-s*ncdf(-d1)', 'm', '', { dp: 2 }], ['Call delta', 'ncdf(d1)', 'n', '', { dp: 3 }], ['Put delta', 'ncdf(d1)-1', 'n', '', { dp: 3 }], ['Gamma', 'exp(-d1*d1/2)/sqrt(2*pi)/(s*v/100*sqrt(t))', 'n', '', { dp: 4 }]],
    { extra: function (vars) { vars.d1 = (Math.log(vars.s / vars.k) + (vars.r / 100 + Math.pow(vars.v / 100, 2) / 2) * vars.t) / (vars.v / 100 * Math.sqrt(vars.t)); } });
  // Black-Scholes needs d1 before the outputs run; wrap the generated calc.
  (function () { var d = CW.defs['black-scholes-calculator'], inner = d.calc; d.calc = function (v, ctx) {
    var s = +v.s, k = +v.k, t = +v.t, rr = v.r / 100, sg = v.v / 100; if (!(s > 0 && k > 0 && t > 0 && sg > 0)) return { error: 'All values must be above zero.' };
    var d1 = (Math.log(s / k) + (rr + sg * sg / 2) * t) / (sg * Math.sqrt(t)), d2 = d1 - sg * Math.sqrt(t), N = function (x) { return 0.5 * (1 + CW.erf(x / Math.SQRT2)); };
    var call = s * N(d1) - k * Math.exp(-rr * t) * N(d2), put = k * Math.exp(-rr * t) * N(-d2) - s * N(-d1);
    return { results: [M('Call price', call, 'money2'), r('Put price', put, 'money2'), r('Call delta', N(d1), 'num', { dp: 3 }), r('Put delta', N(d1) - 1, 'num', { dp: 3 }), r('Gamma', Math.exp(-d1 * d1 / 2) / Math.sqrt(2 * Math.PI) / (s * sg * Math.sqrt(t)), 'num', { dp: 4 }), r('Vega (per 1% vol)', s * Math.exp(-d1 * d1 / 2) / Math.sqrt(2 * Math.PI) * Math.sqrt(t) / 100, 'num', { dp: 3 })] };
  }; })();
  F('position-size-calculator', 'Position Size Calculator', 'finance/stocks-trading', 'How many shares or lots to trade so a stop-out loses only your chosen risk.', 'Size = account × risk % ÷ |entry − stop|.',
    [['acc', 'Account size', 'm', 10000, ''], ['rk', 'Risk per trade', 'p', 1], ['en', 'Entry price', 'm', 50, ''], ['sl', 'Stop-loss price', 'm', 48, '']],
    [['Position size (units)', 'floor(acc*rk/100/abs(en-sl))', 'i'], ['Money at risk', 'acc*rk/100', 'm'], ['Position value', 'o1*en', 'm']]);
  F('risk-reward-ratio-calculator', 'Risk-Reward Ratio Calculator', 'finance/stocks-trading', 'Risk-reward ratio of a trade and the win rate you need to break even.', 'R:R = reward ÷ risk; break-even win rate = 1 ÷ (1 + R:R).',
    [['en', 'Entry price', 'm', 100, ''], ['sl', 'Stop-loss', 'm', 96, ''], ['tp', 'Target', 'm', 112, '']],
    [['Risk : Reward', 'abs(tp-en)/abs(en-sl)', 'n', ': 1 reward per 1 risk', { dp: 2 }], ['Break-even win rate', '100/(1+o1)', 'p'], ['Risk per unit', 'abs(en-sl)', 'm', '', { dp: 2 }], ['Reward per unit', 'abs(tp-en)', 'm', '', { dp: 2 }]]);
  F('pivot-point-calculator', 'Pivot Point Calculator', 'finance/stocks-trading', 'Classic pivot points with three support and resistance levels.', 'PP = (H + L + C) ÷ 3; R1 = 2PP − L; S1 = 2PP − H; R2 = PP + (H − L); S2 = PP − (H − L).',
    [['h', 'High', 'n', 105], ['l', 'Low', 'n', 98], ['c', 'Close', 'n', 102]],
    [['Pivot point', '(h+l+c)/3', 'n', '', { dp: 2 }], ['Resistance 1', '2*o1-l', 'n', '', { dp: 2 }], ['Resistance 2', 'o1+(h-l)', 'n', '', { dp: 2 }], ['Resistance 3', 'h+2*(o1-l)', 'n', '', { dp: 2 }], ['Support 1', '2*o1-h', 'n', '', { dp: 2 }], ['Support 2', 'o1-(h-l)', 'n', '', { dp: 2 }], ['Support 3', 'l-2*(h-o1)', 'n', '', { dp: 2 }]]);
  F('fibonacci-retracement-calculator', 'Fibonacci Retracement Calculator', 'finance/stocks-trading', 'Fibonacci retracement and extension levels for an up or down move.', 'Level = high − (high − low) × ratio for an uptrend.',
    [['h', 'Swing high', 'n', 120], ['l', 'Swing low', 'n', 100], ['d', 'Trend', 'g', 1, [[1, 'Uptrend'], [-1, 'Downtrend']]]],
    [['38.2% retracement', 'if(d==1,h-(h-l)*0.382,l+(h-l)*0.382)', 'n', '', { dp: 2 }], ['23.6% retracement', 'if(d==1,h-(h-l)*0.236,l+(h-l)*0.236)', 'n', '', { dp: 2 }], ['50% retracement', 'if(d==1,h-(h-l)*0.5,l+(h-l)*0.5)', 'n', '', { dp: 2 }], ['61.8% retracement', 'if(d==1,h-(h-l)*0.618,l+(h-l)*0.618)', 'n', '', { dp: 2 }], ['78.6% retracement', 'if(d==1,h-(h-l)*0.786,l+(h-l)*0.786)', 'n', '', { dp: 2 }], ['127.2% extension', 'if(d==1,l+(h-l)*1.272,h-(h-l)*1.272)', 'n', '', { dp: 2 }], ['161.8% extension', 'if(d==1,l+(h-l)*1.618,h-(h-l)*1.618)', 'n', '', { dp: 2 }]]);
  F('forex-pip-value-calculator', 'Forex Pip Value Calculator', 'finance/stocks-trading', 'Value of one pip for your lot size and currency pair.', 'Pip value = lots × 100,000 × pip size (÷ price if the quote currency is not your account currency).',
    [['lots', 'Lot size', 'n', 1], ['pip', 'Pip size', 's', 0.0001, [[0.0001, '0.0001 (most pairs)'], [0.01, '0.01 (JPY pairs)']]], ['fx', 'Quote currency → account currency rate', 'n', 1]],
    [['Pip value', 'lots*100000*pip*fx', 'n', 'in account currency', { dp: 2 }], ['10 pips', 'o1*10', 'n', '', { dp: 2 }], ['50 pips', 'o1*50', 'n', '', { dp: 2 }], ['100 pips', 'o1*100', 'n', '', { dp: 2 }]]);
  F('forex-compounding-calculator', 'Forex Compounding Calculator', 'finance/stocks-trading', 'Project account growth from a monthly percentage return.', 'Balance = start × (1 + monthly return)^months.',
    [['s', 'Starting balance', 'm', 1000, ''], ['r', 'Monthly return', 'p', 5], ['m', 'Months', 'i', 24], ['c', 'Monthly deposit', 'm', 0, '', { opt: 1 }]],
    [['Final balance', 's*(1+r/100)^m+c*((1+r/100)^m-1)/(r/100)', 'm'], ['Profit', 'o1-s-c*m', 'm']], { plot: { x: 'x', from: 0, to: 'm', n: 24, series: [['Balance', 's*(1+r/100)^x+c*((1+r/100)^x-1)/(r/100)']], f: 'm' }, note: 'Compounding assumes a steady return every month, which real trading rarely delivers.' });
  F('lot-size-calculator', 'Lot Size Calculator', 'finance/stocks-trading', 'Forex lot size for your risk and stop-loss in pips.', 'Lots = risk amount ÷ (stop pips × pip value per lot).',
    [['acc', 'Account balance', 'm', 5000, ''], ['rk', 'Risk per trade', 'p', 1], ['sl', 'Stop-loss (pips)', 'n', 30], ['pv', 'Pip value per 1 lot', 'n', 10]],
    [['Lot size', 'acc*rk/100/(sl*pv)', 'n', 'lots', { dp: 2 }], ['Risk amount', 'acc*rk/100', 'm'], ['Units', 'o1*100000', 'i']]);

  CW.register({
    id: 'bond-yield-calculator', title: 'Bond Yield Calculator (Current Yield & YTM)', g: 'finance/investing', desc: 'Current yield and yield to maturity (YTM) of a bond from its price and coupon.',
    formula: 'Price = Σ coupon ÷ (1 + y)^t + face ÷ (1 + y)^n. YTM is the y that makes this equal the market price.',
    inputs: [{ k: 'face', l: 'Face value', t: 'money', v: 1000 }, { k: 'cr', l: 'Coupon rate', t: 'percent', v: 5 }, { k: 'pr', l: 'Market price', t: 'money', v: 960 }, { k: 'y', l: 'Years to maturity', t: 'number', v: 8 }, { k: 'f', l: 'Coupons per year', t: 'select', v: '2', o: [['1', 'Yearly'], ['2', 'Half-yearly'], ['4', 'Quarterly']] }],
    calc: function (v) {
      var f = +v.f, n = Math.round(v.y * f), c = v.face * v.cr / 100 / f, lo = -0.5, hi = 1, i;
      for (i = 0; i < 100; i++) { var m = (lo + hi) / 2, p = c * (1 - Math.pow(1 + m, -n)) / m + v.face * Math.pow(1 + m, -n); if (!isFinite(p)) { lo = m; continue; } if (p > v.pr) lo = m; else hi = m; }
      var ytm = (lo + hi) / 2 * f * 100;
      return { results: [M('Yield to maturity', ytm, 'pct'), r('Current yield', v.face * v.cr / 100 / v.pr * 100, 'pct'), r('Annual coupon', v.face * v.cr / 100, 'money'), r('Capital gain at maturity', v.face - v.pr, 'money')] };
    }
  });
  X('yield-to-maturity-calculator', 'bond-yield-calculator', 'Yield to Maturity (YTM) Calculator', 'finance/investing', 'Calculate the yield to maturity of a bond from price, coupon and years left.', {});
  F('bond-price-calculator', 'Bond Price Calculator', 'finance/investing', 'Fair price of a bond for a required yield.', 'Price = C × (1 − (1 + y)^−n) ÷ y + F × (1 + y)^−n.',
    [['face', 'Face value', 'm', 1000, ''], ['cr', 'Coupon rate', 'p', 5], ['yl', 'Required yield', 'p', 6], ['y', 'Years to maturity', 'n', 10], ['f', 'Coupons per year', 's', 2, [[1, 'Yearly'], [2, 'Half-yearly'], [4, 'Quarterly']]]],
    [['Bond price', 'face*cr/100/f*(1-(1+yl/100/f)^-(y*f))/(yl/100/f)+face*(1+yl/100/f)^-(y*f)', 'm'], ['Premium / discount', 'o1-face', 'm'], ['Coupon per payment', 'face*cr/100/f', 'm']]);
  F('pe-ratio-calculator', 'P/E Ratio Calculator', 'finance/investing', 'Price-to-earnings ratio and earnings yield.', 'P/E = share price ÷ earnings per share.',
    [['pr', 'Share price', 'm', 150, ''], ['eps', 'Earnings per share (EPS)', 'm', 6, '']], [['P/E ratio', 'pr/eps', 'n', '', { dp: 2 }], ['Earnings yield', 'eps/pr*100', 'p'], ['Years of earnings to repay price', 'pr/eps', 'f', 'years', { dp: 1 }]]);
  F('eps-calculator', 'EPS Calculator (Earnings Per Share)', 'finance/investing', 'Earnings per share from net income, preferred dividends and share count.', 'EPS = (net income − preferred dividends) ÷ weighted average shares.',
    [['ni', 'Net income', 'm', 5000000, ''], ['pd', 'Preferred dividends', 'm', 0, '', { opt: 1 }], ['sh', 'Weighted average shares', 'i', 2000000]],
    [['EPS', '(ni-pd)/sh', 'm2'], ['Earnings available to shareholders', 'ni-pd', 'm']]);
  F('intrinsic-value-calculator', 'Intrinsic Value Calculator (DCF)', 'finance/investing', 'Discounted cash flow value of a stock per share.', 'Value = Σ FCF(1 + g)^t ÷ (1 + d)^t for N years + terminal value, divided by shares.',
    [['fcf', 'Free cash flow (this year)', 'm', 1000000000, ''], ['g', 'Growth for the next years', 'p', 10], ['n', 'Years of growth', 'i', 10], ['tg', 'Terminal growth', 'p', 2.5], ['d', 'Discount rate', 'p', 9], ['sh', 'Shares outstanding', 'i', 500000000], ['debt', 'Net debt', 'm', 0, '', { opt: 1 }]],
    [['Intrinsic value per share', '((fcf*((1+g/100)/(1+d/100))*(1-((1+g/100)/(1+d/100))^n)/(1-(1+g/100)/(1+d/100))+fcf*(1+g/100)^n*(1+tg/100)/((d-tg)/100)/(1+d/100)^n)-debt)/sh', 'm2'], ['Enterprise value', 'o1*sh+debt', 'm']]);
  F('stock-split-calculator', 'Stock Split Calculator', 'finance/investing', 'Shares and price per share after a stock split or reverse split.', 'New shares = old shares × ratio; new price = old price ÷ ratio.',
    [['sh', 'Shares you own', 'i', 100], ['pr', 'Price per share', 'm', 800, ''], ['a', 'Split: new shares', 'n', 4], ['b', 'for every', 'n', 1]],
    [['Shares after split', 'sh*a/b', 'n', '', { dp: 4 }], ['New price per share', 'pr*b/a', 'm2'], ['Total value (unchanged)', 'sh*pr', 'm']]);
  F('capital-gains-calculator', 'Capital Gains Calculator (LTCG / STCG)', 'tax-salary/other-tax', 'Tax on profit from selling shares, funds or property for India, the US or a custom rate.', 'India equity: STCG 20% (under 12 months), LTCG 12.5% above ₹1.25 lakh. US: long-term 0/15/20%.',
    [['t', 'Asset / rule', 's', 1, [[1, 'India — listed equity / equity funds'], [2, 'India — property / other assets'], [3, 'US — long-term (15%)'], [4, 'US — short-term (ordinary rate)'], [5, 'Custom rate']]], ['buy', 'Purchase value', 'm', 500000, '', { local: { IN: 500000 } }], ['sell', 'Sale value', 'm', 800000, '', { local: { IN: 800000 } }], ['mo', 'Months held', 'i', 18], ['cr', 'Custom / ordinary tax rate', 'p', 24, '', { show: 't>=4' }]],
    [['Tax payable', 'if(t==1,if(mo<12,max(0,gain)*0.2,max(0,gain-125000)*0.125),if(t==2,max(0,gain)*0.125,if(t==3,max(0,gain)*0.15,max(0,gain)*cr/100)))*if(t<=2,1.04,1)', 'm'], ['Capital gain', 'sell-buy', 'm', '', { k: 'gain' }], ['Net after tax', 'sell-o1', 'm'], ['Effective tax rate', 'if(gain>0,o1/gain*100,0)', 'p']],
    { note: 'India figures include 4% cess and the Budget 2024 rates; surcharge is excluded. Check the latest rules or ask a tax professional.' });
  (function () { var d = CW.defs['capital-gains-calculator'], inner = d.calc; d.calc = function (v, c) { v = Object.assign({}, v); v.gain = v.sell - v.buy; return inner(v, c); }; })();
  F('inflation-adjusted-return-calculator', 'Inflation-Adjusted Return Calculator', 'finance/investing', 'Your real return after inflation (Fisher equation).', 'Real return = (1 + nominal) ÷ (1 + inflation) − 1.',
    [['n', 'Nominal return', 'p', 11], ['i', 'Inflation', 'p', 5], ['p', 'Investment', 'm', 100000, ''], ['y', 'Years', 'n', 10]],
    [['Real return', '((1+n/100)/(1+i/100)-1)*100', 'p', 'per year', { dp: 2 }], ['Value in today’s money', 'p*(1+o1/100)^y', 'm'], ['Nominal value', 'p*(1+n/100)^y', 'm'], ['Lost to inflation', 'o3-o2', 'm']], { donut: [['Real value', 'p*(1+((1+n/100)/(1+i/100)-1))^y'], ['Lost to inflation', 'p*(1+n/100)^y-p*(1+((1+n/100)/(1+i/100)-1))^y']], donutF: 'm' });
  X('real-rate-of-return-calculator', 'inflation-adjusted-return-calculator', 'Real Rate of Return Calculator', 'finance/investing', 'Real rate of return after inflation using the Fisher equation.', {});
  F('index-fund-calculator', 'Index Fund Calculator', 'finance/investing', 'Grow a monthly index-fund investment and see what fees take away.', 'FV = monthly × ((1 + r)^n − 1) ÷ r with the return reduced by the expense ratio.',
    [['c', 'Monthly investment', 'm', 500, '', { local: { IN: 10000 } }], ['r', 'Market return', 'p', 10], ['er', 'Expense ratio', 'p', 0.2], ['y', 'Years', 'n', 20]],
    [['Value after fees', 'c*((1+(r-er)/1200)^(y*12)-1)/((r-er)/1200)', 'm'], ['Total invested', 'c*y*12', 'm'], ['Gain', 'o1-o2', 'm'], ['Lost to fees', 'c*((1+r/1200)^(y*12)-1)/(r/1200)-o1', 'm']], { donut: [['Invested', 'c*y*12'], ['Growth', 'c*((1+(r-er)/1200)^(y*12)-1)/((r-er)/1200)-c*y*12']], donutF: 'm' });
  F('gold-investment-calculator', 'Gold Investment Calculator', 'finance/investing', 'Future value of gold bought now or through a monthly plan.', 'Value = amount × (1 + gold CAGR)^years.',
    [['a', 'Amount invested', 'm', 100000, '', { local: { IN: 100000 } }], ['g', 'Expected gold return (CAGR)', 'p', 9], ['y', 'Years', 'n', 10], ['c', 'Monthly purchase', 'm', 0, '', { opt: 1 }]],
    [['Value of gold', 'a*(1+g/100)^y+c*((1+g/100)^y-1)/((1+g/100)^(1/12)-1)', 'm'], ['Total invested', 'a+c*12*y', 'm'], ['Gain', 'o1-o2', 'm']]);
  F('expense-ratio-impact-calculator', 'Expense Ratio Impact Calculator', 'finance/investing', 'How much a higher fund fee costs you over time.', 'Compare FV at (return − fee A) with (return − fee B).',
    [['p', 'Starting investment', 'm', 100000, ''], ['c', 'Monthly contribution', 'm', 500, '', { opt: 1 }], ['r', 'Gross return', 'p', 8], ['a', 'Fund A expense ratio', 'p', 0.1], ['b', 'Fund B expense ratio', 'p', 1.2], ['y', 'Years', 'n', 25]],
    [['FVA', 'p*(1+(r-a)/100)^y+c*((1+(r-a)/100)^y-1)/((1+(r-a)/100)^(1/12)-1)', 'm', '', { k: 'fa', hide: 1 }], ['FVB', 'p*(1+(r-b)/100)^y+c*((1+(r-b)/100)^y-1)/((1+(r-b)/100)^(1/12)-1)', 'm', '', { k: 'fb', hide: 1 }], ['Extra lost to the higher fee', 'fa-fb', 'm'], ['Fund A final value', 'p*(1+(r-a)/100)^y+c*((1+(r-a)/100)^y-1)/((1+(r-a)/100)^(1/12)-1)', 'm'], ['Fund B final value', 'p*(1+(r-b)/100)^y+c*((1+(r-b)/100)^y-1)/((1+(r-b)/100)^(1/12)-1)', 'm']]);

  CW.register({
    id: 'stp-calculator', title: 'STP Calculator (Systematic Transfer Plan) (India)', g: 'finance/investing', desc: 'Move a lump sum from a debt fund to an equity fund in monthly instalments and see the final value.',
    formula: 'Each month the source fund earns its return, a fixed amount moves to the target fund, which compounds at its own return.',
    inputs: [{ k: 'l', l: 'Lump sum in source fund', t: 'money', v: 1000000, local: { IN: 1000000 } }, { k: 't', l: 'Transfer per month', t: 'money', v: 50000, local: { IN: 50000 } }, { k: 'r1', l: 'Source fund return', t: 'percent', v: 7 }, { k: 'r2', l: 'Target fund return', t: 'percent', v: 12 }, { k: 'm', l: 'Months', t: 'int', v: 24 }],
    calc: function (v) {
      var a = v.l, b = 0, moved = 0; for (var i = 1; i <= v.m; i++) { a *= 1 + v.r1 / 1200; b *= 1 + v.r2 / 1200; var x = Math.min(v.t, a); a -= x; b += x; moved += x; }
      return { results: [M('Total value after STP', a + b, 'money'), r('In target fund', b, 'money'), r('Left in source fund', a, 'money'), r('Amount transferred', moved, 'money'), r('Gain', a + b - v.l, 'money', { hl: 1 })] };
    }
  });
  CW.register({
    id: 'npv-calculator', title: 'NPV Calculator (Net Present Value)', g: 'finance/investing', desc: 'Net present value of a series of cash flows at your discount rate.',
    formula: 'NPV = Σ CFt ÷ (1 + r)^t. Period 0 is the initial investment (enter as negative).',
    inputs: [{ k: 'r', l: 'Discount rate', t: 'percent', v: 10 }, { k: 'cf', l: 'Cash flows (period 0 first)', t: 'rows', add: 'Add period', cols: [{ l: 'Cash flow', t: 'number', v: 0 }], v: [[-10000], [3000], [4000], [5000], [3000]] }],
    calc: function (v) {
      var n = 0, rows = [], pv = []; v.cf.forEach(function (row, t) { var c = row[0] || 0, d = c / Math.pow(1 + v.r / 100, t); n += d; rows.push([t, c, d]); pv.push(d); });
      return { results: [M('NPV', n, 'money2'), r('Verdict', n >= 0 ? 'Worth investing' : 'Not worth it at this rate', 'text')], chart: { type: 'bar', labels: rows.map(function (x) { return 'P' + x[0]; }), series: [{ l: 'Present value', pts: pv }], f: 'money' }, table: { head: ['Period', 'Cash flow', 'Present value'], fmt: ['int', 'money', 'money'], rows: rows, title: 'Discounted flows' } };
    }
  });
  CW.register({
    id: 'irr-calculator', title: 'IRR Calculator (Internal Rate of Return)', g: 'finance/investing', desc: 'Internal rate of return for a project or investment with regular cash flows.',
    formula: 'IRR is the discount rate that makes NPV equal zero.',
    inputs: [{ k: 'cf', l: 'Cash flows (period 0 first)', t: 'rows', add: 'Add period', cols: [{ l: 'Cash flow', t: 'number', v: 0 }], v: [[-50000], [12000], [18000], [22000], [25000]] }],
    calc: function (v) {
      var c = v.cf.map(function (x) { return x[0] || 0; }), f = function (r) { return c.reduce(function (a, x, t) { return a + x / Math.pow(1 + r, t); }, 0); }, lo = -0.99, hi = 10;
      if (f(lo) * f(hi) > 0) return { error: 'No IRR found — the cash flows need both an outflow and inflows.' };
      for (var i = 0; i < 200; i++) { var m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; }
      var irr = (lo + hi) / 2 * 100; return { results: [M('IRR', irr, 'pct'), r('Total inflows', c.filter(function (x) { return x > 0; }).reduce(function (a, b) { return a + b; }, 0), 'money'), r('Total outflows', c.filter(function (x) { return x < 0; }).reduce(function (a, b) { return a + b; }, 0), 'money')] };
    }
  });
  CW.register({
    id: 'xirr-calculator', title: 'XIRR Calculator', g: 'finance/investing', desc: 'Annualised return for investments with irregular dates, like SIPs and withdrawals.',
    formula: 'XIRR solves Σ CFi ÷ (1 + r)^((di − d0) ÷ 365) = 0.',
    inputs: [{ k: 'cf', l: 'Dated cash flows (investment negative)', t: 'rows', add: 'Add cash flow', cols: [{ l: 'Date (YYYY-MM-DD)', t: 'text', v: '' }, { l: 'Amount', t: 'number', v: 0 }], v: [['2023-01-05', -10000], ['2023-07-05', -10000], ['2024-01-05', -10000], ['2025-01-05', 38000]] }],
    calc: function (v) {
      var rows = v.cf.map(function (x) { return [new Date(x[0] + 'T00:00:00'), x[1] || 0]; }).filter(function (x) { return !isNaN(x[0]); });
      if (rows.length < 2) return { error: 'Enter at least two dated cash flows (YYYY-MM-DD).' };
      var d0 = rows[0][0], f = function (r) { return rows.reduce(function (a, x) { return a + x[1] / Math.pow(1 + r, (x[0] - d0) / 31536000000); }, 0); }, lo = -0.99, hi = 20;
      if (f(lo) * f(hi) > 0) return { error: 'No XIRR found — include both investments and a final value.' };
      for (var i = 0; i < 200; i++) { var m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; }
      return { results: [M('XIRR', (lo + hi) / 2 * 100, 'pct')] };
    }
  });
  CW.register({
    id: 'portfolio-rebalancing-calculator', title: 'Portfolio Rebalancing Calculator', g: 'finance/investing', desc: 'Find what to buy or sell to bring your portfolio back to its target allocation.',
    formula: 'Target value = total portfolio × target %; trade = target value − current value.',
    inputs: [{ k: 'a', l: 'Holdings', t: 'rows', add: 'Add asset', cols: [{ l: 'Asset', t: 'text', v: '' }, { l: 'Current value', t: 'number', v: 0 }, { l: 'Target %', t: 'number', v: 0 }], v: [['Equity', 70000, 60], ['Debt', 20000, 30], ['Gold', 10000, 10]] }, { k: 'add', l: 'New money to invest', t: 'money', v: 0, opt: 1 }],
    calc: function (v) {
      var tot = v.a.reduce(function (s, x) { return s + (x[1] || 0); }, 0) + v.add, tp = v.a.reduce(function (s, x) { return s + (x[2] || 0); }, 0);
      if (Math.abs(tp - 100) > 0.01) return { error: 'Target percentages add up to ' + CW.fmt.num(tp, 2) + '% — they must total 100%.' };
      var rows = v.a.map(function (x) { var t = tot * x[2] / 100; return [x[0] || 'Asset', x[1] || 0, t, t - (x[1] || 0)]; });
      return { results: [M('Total portfolio', tot, 'money')].concat(rows.map(function (x) { return r((x[3] >= 0 ? 'Buy ' : 'Sell ') + x[0], Math.abs(x[3]), 'money', { hl: Math.abs(x[3]) > tot * 0.05 }); })),
        chart: { type: 'donut', f: 'money', data: rows.map(function (x) { return { l: x[0], v: x[2] }; }) }, table: { head: ['Asset', 'Current', 'Target', 'Trade'], fmt: ['text', 'money', 'money', 'money'], rows: rows, title: 'Rebalancing plan' } };
    }
  });

  CW.setCur(['flat-vs-reducing-rate-calculator', 'credit-card-emi-calculator', 'post-office-scheme-calculator', 'sukanya-samriddhi-yojana-calculator', 'senior-citizen-savings-scheme-calculator', 'brokerage-calculator', 'two-wheeler-loan-emi-calculator'], 'INR', 'IN');
  CW.setCur(['fha-loan-calculator', 'va-mortgage-calculator', 'jumbo-loan-calculator', 'sba-loan-calculator', 'payday-loan-calculator', 'reverse-mortgage-calculator'], 'USD');
  CW.setCur(['isa-calculator'], 'GBP');
})(window.CW);
