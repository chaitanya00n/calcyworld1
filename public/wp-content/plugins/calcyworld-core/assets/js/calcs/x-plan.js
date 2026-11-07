/* Calcyworld — retirement, insurance, budget & life-planning calculators (formula DSL) */
(function (CW) {
  'use strict';
  var F = CW.F;
  /* future value of an annual contribution C that grows at g, earning r, over n years (end-of-year) */
  var GROW = function (c, r, g, n) { return 'if(abs(' + r + '-' + g + ')<0.0000001,' + n + '*' + c + '*(1+' + r + ')^(' + n + '-1),' + c + '*((1+' + r + ')^' + n + '-(1+' + g + ')^' + n + ')/(' + r + '-' + g + '))'; };

  /* ---------------- Retirement ---------------- */
  F('401k-calculator', '401(k) Calculator', 'finance/retirement', 'Project your 401(k) balance at retirement including employer match and salary growth.', 'Balance = current × (1+r)^n + Σ contributions growing with salary. 2026 employee limit: $24,500.',
    [['age', 'Current age', 'i', 32], ['ret', 'Retirement age', 'i', 65], ['sal', 'Annual salary', 'm', 85000, ''], ['pct', 'Your contribution (% of salary)', 'p', 8], ['match', 'Employer match (% of salary)', 'p', 4], ['bal', 'Current 401(k) balance', 'm', 25000, ''], ['r', 'Expected return', 'p', 7], ['g', 'Salary growth', 'p', 3]],
    [['Yearly', 'min(sal*pct/100,24500)+sal*match/100', 'm', '', { k: 'c0', hide: 1 }], ['Balance at retirement', 'bal*(1+r/100)^(ret-age)+' + GROW('c0', '(r/100)', '(g/100)', '(ret-age)'), 'm'], ['Total you contribute', 'min(sal*pct/100,24500)*((1+g/100)^(ret-age)-1)/max(g/100,0.0000001)', 'm'], ['Employer match total', 'sal*match/100*((1+g/100)^(ret-age)-1)/max(g/100,0.0000001)', 'm'], ['Growth earned', 'o2-bal-o3-o4', 'm'], ['Monthly income (4% rule)', 'o2*0.04/12', 'm']],
    { seq: { n: 'ret-age', head: ['Year', 'Balance'], cols: [['i', 'i'], ['bal*(1+r/100)^i+' + GROW('c0', '(r/100)', '(g/100)', 'i'), 'm']], chart: { type: 'line', cols: [1], f: 'm' }, title: 'Growth by year' }, note: 'Assumes end-of-year contributions and the match is paid on your contribution.', pop: 1 });

  F('roth-ira-calculator', 'Roth IRA Calculator', 'finance/retirement', 'See how a Roth IRA grows tax-free and compare it with a taxable account.', 'FV = contributions compounded monthly. Roth withdrawals in retirement are tax-free. 2026 limit: $7,500 ($8,600 age 50+).',
    [['bal', 'Current balance', 'm', 10000, ''], ['c', 'Monthly contribution', 'm', 500, ''], ['yrs', 'Years to grow', 'n', 25], ['r', 'Expected return', 'p', 7], ['tax', 'Tax rate on a taxable account', 'p', 15]],
    [['Roth IRA value', 'bal*(1+r/1200)^(yrs*12)+fvs(r/1200,yrs*12,c)', 'm'], ['Total contributed', 'bal+c*yrs*12', 'm'], ['Tax-free growth', 'o1-o2', 'm'], ['Same money in taxable account', 'o2+o3*(1-tax/100)', 'm'], ['Roth advantage', 'o1-o4', 'm', '', { hl: 1 }], ['Within annual limit?', '7500-c*12', 'b', '', { bands: [[0, 'Over the $7,500 limit'], [Infinity, 'Within the limit']] }]],
    { plot: { x: 'x', from: 0, to: 'yrs', n: 24, series: [['Roth IRA', 'bal*(1+r/1200)^(x*12)+fvs(r/1200,x*12,c)'], ['Contributed', 'bal+c*x*12']], f: 'm' } });

  F('traditional-ira-calculator', 'Traditional IRA Calculator', 'finance/retirement', 'Value of a Traditional IRA after the upfront deduction and taxes on withdrawal.', 'You get a deduction now and pay income tax on withdrawals.',
    [['bal', 'Current balance', 'm', 10000, ''], ['c', 'Yearly contribution', 'm', 7000, ''], ['yrs', 'Years to grow', 'n', 25], ['r', 'Expected return', 'p', 7], ['t1', 'Tax rate now', 'p', 24], ['t2', 'Tax rate in retirement', 'p', 18]],
    [['Balance at retirement', 'bal*(1+r/100)^yrs+fvs(r/100,yrs,c)', 'm'], ['After-tax value', 'o1*(1-t2/100)', 'm'], ['Tax saved on contributions', 'c*yrs*t1/100', 'm'], ['Tax due on withdrawal', 'o1*t2/100', 'm']]);

  CW.register({
    id: 'rmd-calculator', title: 'RMD Calculator (Required Minimum Distribution)', g: 'finance/retirement',
    desc: 'Find your required minimum distribution from a 401(k) or IRA using the IRS Uniform Lifetime Table.',
    formula: 'RMD = account balance on 31 December of last year ÷ distribution period for your age.',
    inputs: [{ k: 'age', l: 'Age this year', t: 'int', v: 75 }, { k: 'bal', l: 'Account balance (31 Dec last year)', t: 'money', v: 500000 }],
    calc: function (v) {
      var T = { 72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2, 104: 4.9, 105: 4.6 };
      var a = Math.min(Math.round(v.age), 105), d = T[a];
      if (v.age < 73) return { results: [{ l: 'RMD status', v: 'Not required yet', f: 'text', main: true, sub: 'RMDs start at age 73 (75 if born in 1960 or later).' }] };
      var rmd = v.bal / d;
      return { results: [{ l: 'RMD this year', v: rmd, f: 'money', main: true }, { l: 'Distribution period', v: d, f: 'fixed', dp: 1, u: 'years' }, { l: 'Per month', v: rmd / 12, f: 'money' }, { l: '% of balance', v: rmd / v.bal * 100, f: 'pct', dp: 2 }], note: 'Uniform Lifetime Table. Different rules apply to inherited accounts or spouses over 10 years younger.' };
    }
  });

  F('social-security-calculator', 'Social Security Benefit Calculator', 'finance/retirement', 'Estimate your monthly US Social Security retirement benefit by claiming age.', 'PIA = 90% of AIME up to $1,286 + 32% to $7,749 + 15% above (2026 bend points). Claiming age changes the amount.',
    [['aime', 'Average indexed monthly earnings (AIME)', 'm', 6000, '', { help: 'Find it on your SSA statement.' }], ['age', 'Claiming age', 's', 67, [[62, '62'], [63, '63'], [64, '64'], [65, '65'], [66, '66'], [67, '67 (full retirement age)'], [68, '68'], [69, '69'], [70, '70']]]],
    [['PIA', '0.9*min(aime,1286)+0.32*max(0,min(aime,7749)-1286)+0.15*max(0,aime-7749)', 'm', '', { k: 'pia', hide: 1 }], ['Monthly benefit', 'pia*if(age==62,0.70,if(age==63,0.75,if(age==64,0.80,if(age==65,0.8667,if(age==66,0.9333,if(age==67,1,if(age==68,1.08,if(age==69,1.16,1.24))))))))', 'm'], ['At full retirement age (67)', 'pia', 'm'], ['Yearly', 'o2*12', 'm'], ['Change vs age 67', '(o2/pia-1)*100', 'p', '', { dp: 1 }]],
    { plot: { x: 'x', from: 62, to: 70, n: 8, series: [['Monthly benefit', 'pia*if(x<63,0.70,if(x<64,0.75,if(x<65,0.80,if(x<66,0.8667,if(x<67,0.9333,if(x<68,1,if(x<69,1.08,if(x<70,1.16,1.24))))))))']], f: 'm' }, note: 'Assumes full retirement age 67 (born 1960 or later). Before-tax estimate; actual benefit also depends on your 35 highest-earning years.' });

  F('fire-calculator', 'FIRE Calculator', 'finance/retirement', 'Find your financial independence number and how many years until you can retire early.', 'FI number = annual expenses ÷ safe withdrawal rate. Years = ln((FI·r + s) ÷ (P·r + s)) ÷ ln(1 + r).',
    [['xp', 'Annual expenses', 'm', 40000, '', { local: { IN: 720000 } }], ['p', 'Current savings', 'm', 100000, '', { local: { IN: 1500000 } }], ['s', 'Savings per year', 'm', 25000, '', { local: { IN: 600000 } }], ['r', 'Real return (after inflation)', 'p', 5], ['w', 'Safe withdrawal rate', 'p', 4]],
    [['FI number', 'xp/(w/100)', 'm', '', { k: 'fi', hide: 1 }], ['Years to FIRE', 'if(p>=fi,0,ln((fi*r/100+s)/(p*r/100+s))/ln(1+r/100))', 'f', 'years', { dp: 1 }], ['FI number', 'fi', 'm'], ['Progress', 'p/fi*100', 'p', '', { dp: 1 }], ['Savings rate needed', 's/(xp+s)*100', 'p', '', { dp: 0 }]],
    { plot: { x: 'x', from: 0, to: 'min(max(o2*1.3,5),60)', n: 24, series: [['Portfolio', 'p*(1+r/100)^x+s*((1+r/100)^x-1)/(r/100)'], ['FI number', 'fi']], f: 'm' }, pop: 1 });

  F('coast-fire-calculator', 'Coast FIRE Calculator', 'finance/retirement', 'The amount you need today so growth alone carries you to retirement.', 'Coast number = FI number ÷ (1 + r)^years to retirement.',
    [['xp', 'Retirement expenses (yearly, today’s money)', 'm', 45000, ''], ['age', 'Current age', 'i', 30], ['ret', 'Retirement age', 'i', 62], ['r', 'Real return', 'p', 5], ['w', 'Withdrawal rate', 'p', 4], ['p', 'Current savings', 'm', 60000, '']],
    [['Coast FIRE number today', 'xp/(w/100)/(1+r/100)^(ret-age)', 'm'], ['You have', 'p', 'm'], ['Status', 'p-o1', 'b', '', { bands: [[0, 'Keep saving'], [Infinity, 'You have reached Coast FIRE']] }], ['Final target', 'xp/(w/100)', 'm'], ['Projected with no more saving', 'p*(1+r/100)^(ret-age)', 'm']]);

  F('4-percent-rule-calculator', '4% Rule Calculator', 'finance/retirement', 'How much you can withdraw each year and how long your portfolio lasts.', 'First-year withdrawal = portfolio × rate; later years rise with inflation.',
    [['p', 'Portfolio value', 'm', 1500000, '', { local: { IN: 30000000 } }], ['w', 'Withdrawal rate', 'p', 4], ['r', 'Return after retirement', 'p', 6], ['i', 'Inflation', 'p', 3]],
    [['First-year withdrawal', 'p*w/100', 'm'], ['Per month', 'o1/12', 'm'], ['Years portfolio lasts', 'if(((1+r/100)/(1+i/100)-1)*p>=o1,100,-ln(1-((1+r/100)/(1+i/100)-1)*p/o1)/ln((1+r/100)/(1+i/100)))', 'f', 'years', { dp: 0 }], ['Portfolio needed for ₹/$ 1,000/month', '12000/(w/100)', 'm']]);

  F('retirement-corpus-calculator', 'Retirement Corpus Calculator', 'finance/retirement', 'The corpus you need at retirement after inflation, and the SIP to build it.', 'Corpus = inflated annual expense × annuity factor at the real post-retirement return.',
    [['xp', 'Monthly expense today', 'm', 4000, '', { local: { IN: 50000 } }], ['age', 'Current age', 'i', 32], ['ret', 'Retirement age', 'i', 60], ['life', 'Life expectancy', 'i', 85], ['inf', 'Inflation', 'p', 6], ['post', 'Return after retirement', 'p', 8], ['pre', 'Return before retirement', 'p', 12]],
    [['Expense at retirement (monthly)', 'xp*(1+inf/100)^(ret-age)', 'm', '', { k: 'e1', hide: 1 }], ['Corpus needed', 'e1*12*(1-((1+post/100)/(1+inf/100))^-(life-ret))/((1+post/100)/(1+inf/100)-1)', 'm'], ['Monthly SIP needed', 'o2*(pre/1200)/((1+pre/1200)^((ret-age)*12)-1)', 'm', '', { hl: 1 }], ['Monthly expense at retirement', 'e1', 'm'], ['Years of retirement', 'life-ret', 'i', 'years']],
    { note: 'Assumes expenses rise with inflation every year in retirement and returns stay constant.', pop: 1 });

  F('pension-calculator', 'Pension Calculator', 'finance/retirement', 'Monthly pension from a retirement corpus at a given annuity rate.', 'Pension = corpus × annuity rate ÷ 12 (or by years using a payment formula).',
    [['c', 'Corpus', 'm', 500000, '', { local: { IN: 5000000 } }], ['r', 'Annuity rate', 'p', 6.5], ['yrs', 'Pay-out period (years)', 'n', 25]],
    [['Monthly pension (lifelong, fixed)', 'c*r/1200', 'm'], ['Monthly pension over the period', 'pmt(r/1200,yrs*12,c)', 'm'], ['Yearly', 'o1*12', 'm']]);

  F('pension-vs-lump-sum-calculator', 'Pension vs Lump Sum Calculator', 'finance/retirement', 'Decide between a monthly pension and a one-time lump sum.', 'Compares the present value of the pension with the lump sum at your discount rate.',
    [['lump', 'Lump sum offered', 'm', 400000, ''], ['pen', 'Monthly pension offered', 'm', 2400, ''], ['yrs', 'Years you expect to receive it', 'n', 25], ['r', 'Return on invested lump sum', 'p', 5]],
    [['Present value of pension', 'pen*(1-(1+r/1200)^-(yrs*12))/(r/1200)', 'm', '', { k: 'pv', hide: 1 }], ['Better choice', 'pv-lump', 'b', '', { bands: [[0, 'Take the lump sum'], [Infinity, 'Take the pension']], main: true }], ['Pension present value', 'pv', 'm'], ['Break-even years (no growth)', 'lump/(pen*12)', 'f', 'years', { dp: 1 }], ['Monthly income from lump sum', 'pmt(r/1200,yrs*12,lump)', 'm']]);

  F('retirement-savings-gap-calculator', 'Retirement Savings Gap Calculator', 'finance/retirement', 'How far your projected savings are from what you need.', 'Gap = needed corpus − projected balance. Extra saving = gap ÷ growth factor.',
    [['need', 'Corpus you will need', 'm', 3000000, ''], ['bal', 'Current savings', 'm', 200000, ''], ['c', 'Monthly saving', 'm', 1000, ''], ['yrs', 'Years to retirement', 'n', 25], ['r', 'Expected return', 'p', 7]],
    [['Projected balance', 'bal*(1+r/1200)^(yrs*12)+fvs(r/1200,yrs*12,c)', 'm', '', { k: 'pb', hide: 1 }], ['Savings gap', 'need-pb', 'm'], ['Extra monthly saving needed', 'max(0,need-pb)*(r/1200)/((1+r/1200)^(yrs*12)-1)', 'm', '', { hl: 1 }], ['Projected balance', 'pb', 'm'], ['On track', 'pb/need*100', 'p', '', { dp: 0 }]]);

  F('rrsp-calculator', 'RRSP Calculator (Canada)', 'finance/retirement', 'RRSP contribution room, tax refund and growth.', 'Room = 18% of last year’s earned income up to $33,810 (2026). Refund = contribution × marginal rate.',
    [['inc', 'Earned income last year (CAD)', 'm', 95000, ''], ['c', 'RRSP contribution', 'm', 12000, ''], ['mr', 'Marginal tax rate', 'p', 31], ['yrs', 'Years to grow', 'n', 25], ['r', 'Expected return', 'p', 6]],
    [['Contribution room', 'min(inc*0.18,33810)', 'm'], ['Tax refund', 'min(c,o1)*mr/100', 'm'], ['Value after growth', 'c*(1+r/100)^yrs', 'm'], ['Over the limit?', 'o1-c', 'b', '', { bands: [[0, 'Yes — over by the shown amount'], [Infinity, 'No']] }]]);

  F('superannuation-calculator', 'Superannuation Calculator (Australia)', 'finance/retirement', 'Projected super balance with the 12% employer guarantee.', 'Balance grows with employer SG 12%, extra contributions and net return after fees.',
    [['age', 'Current age', 'i', 35], ['ret', 'Retirement age', 'i', 67], ['sal', 'Annual salary (AUD)', 'm', 100000, ''], ['bal', 'Current balance', 'm', 80000, ''], ['extra', 'Extra yearly contributions', 'm', 0, '', { opt: 1 }], ['r', 'Return', 'p', 7], ['fee', 'Fees', 'p', 0.8], ['g', 'Salary growth', 'p', 3]],
    [['Net', '(r-fee)/100', 'n', '', { k: 'nr', hide: 1 }], ['Balance at retirement', 'bal*(1+nr)^(ret-age)+' + GROW('(sal*0.12*0.85+extra)', 'nr', '(g/100)', '(ret-age)'), 'm'], ['Employer contributions (12%)', 'sal*0.12', 'm'], ['Yearly retirement income (4%)', 'o2*0.04', 'm']],
    { note: '12% SG less 15% contributions tax is assumed.' });

  F('uk-state-pension-calculator', 'UK State Pension Calculator', 'finance/retirement', 'Estimate your new State Pension from qualifying National Insurance years.', 'Weekly pension = full rate × qualifying years ÷ 35 (10 years minimum).',
    [['yrs', 'Qualifying NI years', 'i', 30], ['full', 'Full weekly rate (£)', 'm', 241.30, '', { help: 'Updated every April.' }]],
    [['Weekly pension', 'if(yrs<10,0,full*min(yrs,35)/35)', 'm2'], ['Per month', 'o1*52/12', 'm2'], ['Per year', 'o1*52', 'm'], ['Years still needed for full pension', 'max(0,35-yrs)', 'i']]);

  F('vpf-calculator', 'VPF Calculator (Voluntary Provident Fund)', 'finance/retirement', 'Return on extra voluntary contributions to your EPF account.', 'FV with monthly compounding at the EPF interest rate (8.25%).',
    [['c', 'Monthly VPF contribution', 'm', 5000, '', { local: { IN: 5000 } }], ['yrs', 'Years', 'n', 15], ['r', 'EPF interest rate', 'p', 8.25]],
    [['VPF maturity', 'fvs(r/1200,yrs*12,c)', 'm'], ['You invest', 'c*yrs*12', 'm'], ['Interest earned', 'o1-o2', 'm']], { donut: [['Invested', 'o2'], ['Interest', 'o3']], donutF: 'm', note: 'Interest on employee contributions above ₹2.5 lakh a year is taxable.' });

  F('ulip-calculator', 'ULIP Calculator', 'finance/investing', 'Estimate ULIP maturity after charges and compare with a plain index fund.', 'Net return = fund return − yearly charges. FV of yearly premium at net return.',
    [['p', 'Yearly premium', 'm', 5000, '', { local: { IN: 100000 } }], ['yrs', 'Policy term (years)', 'n', 15], ['r', 'Fund return', 'p', 10], ['ch', 'Total charges per year', 'p', 2.2], ['idx', 'Index fund return for comparison', 'p', 10], ['ixc', 'Index fund cost', 'p', 0.3]],
    [['ULIP maturity', 'fvs((r-ch)/100,yrs,p)', 'm'], ['Index fund value', 'fvs((idx-ixc)/100,yrs,p)', 'm'], ['Total premiums', 'p*yrs', 'm'], ['Difference', 'o2-o1', 'm']]);

  /* ---------------- Insurance ---------------- */
  F('life-insurance-needs-calculator', 'Life Insurance Needs Calculator (DIME)', 'finance/insurance', 'How much life cover you should have using the DIME method.', 'Cover = Debt + Income × years + Mortgage + Education − existing cover & savings.',
    [['debt', 'Debts (non-mortgage)', 'm', 15000, ''], ['inc', 'Annual income', 'm', 70000, ''], ['yrs', 'Years of income to replace', 'n', 10], ['mort', 'Mortgage balance', 'm', 200000, ''], ['edu', 'Children’s education cost', 'm', 80000, ''], ['have', 'Existing cover & savings', 'm', 50000, '']],
    [['Cover needed', 'max(0,debt+inc*yrs+mort+edu-have)', 'm'], ['Total need', 'debt+inc*yrs+mort+edu', 'm'], ['As multiple of income', 'o1/inc', 'f', 'x', { dp: 1 }]],
    { donut: [['Debts', 'debt'], ['Income', 'inc*yrs'], ['Mortgage', 'mort'], ['Education', 'edu']], donutF: 'm' });

  F('term-insurance-cover-calculator', 'Term Insurance Cover Calculator', 'finance/insurance', 'Suggested term cover from income, age and liabilities.', 'Cover ≈ (annual income × years left to retire × discount) + liabilities − assets.',
    [['inc', 'Annual income', 'm', 80000, '', { local: { IN: 1200000 } }], ['age', 'Age', 'i', 32], ['ret', 'Retirement age', 'i', 60], ['liab', 'Loans & liabilities', 'm', 150000, '', { local: { IN: 3000000 } }], ['assets', 'Existing savings & cover', 'm', 50000, '', { local: { IN: 1000000 } }], ['inf', 'Discount rate (return − inflation)', 'p', 4]],
    [['Suggested cover', 'max(0,inc*(1-(1+inf/100)^-(ret-age))/(inf/100)+liab-assets)', 'm'], ['Income multiple', 'o1/inc', 'f', 'x', { dp: 1 }], ['Years of income covered', 'ret-age', 'i', 'years']],
    { note: 'A rule-of-thumb is 10–15 times annual income.' });

  F('car-insurance-idv-calculator', 'Car Insurance IDV Calculator (India)', 'finance/insurance', 'Insured Declared Value of your car by age using IRDAI depreciation.', 'IDV = ex-showroom price × (1 − depreciation %), by vehicle age.',
    [['p', 'Ex-showroom price', 'm', 900000, '', { local: { IN: 900000 } }], ['age', 'Vehicle age', 's', 3, [[0.5, 'Under 6 months'], [1, '6 months to 1 year'], [2, '1 to 2 years'], [3, '2 to 3 years'], [4, '3 to 4 years'], [5, '4 to 5 years']]], ['acc', 'Accessories value', 'm', 0, '', { opt: 1 }]],
    [['Depreciation', 'if(age==0.5,5,if(age==1,15,if(age==2,20,if(age==3,30,if(age==4,40,50)))))', 'p', '', { dp: 0, k: 'dep', hide: 1 }], ['IDV', 'p*(1-dep/100)+acc*0.5', 'm'], ['Depreciation applied', 'dep', 'p', '', { dp: 0 }], ['Value lost', 'p-o2+acc*0.5', 'm']],
    { note: 'Cars older than 5 years are valued by mutual agreement between you and the insurer.' });

  F('no-claim-bonus-calculator', 'No Claim Bonus (NCB) Calculator', 'finance/insurance', 'Premium discount from your no-claim bonus on motor insurance.', 'NCB steps up 20% → 25% → 35% → 45% → 50% for each claim-free year.',
    [['od', 'Own-damage premium', 'm', 12000, '', { local: { IN: 12000 } }], ['yrs', 'Claim-free years', 's', 3, [[0, '0'], [1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5 or more']]]],
    [['NCB discount', 'if(yrs==0,0,if(yrs==1,20,if(yrs==2,25,if(yrs==3,35,if(yrs==4,45,50)))))', 'p', '', { dp: 0, k: 'ncb' }], ['Premium after NCB', 'od*(1-ncb/100)', 'm'], ['You save', 'od*ncb/100', 'm']]);

  F('health-insurance-80d-calculator', 'Section 80D Health Insurance Deduction Calculator (India)', 'finance/insurance', 'Tax deduction on health insurance premiums for you and your parents.', 'Limits: ₹25,000 (₹50,000 if senior) for self/family and the same for parents, plus ₹5,000 for preventive check-ups within the limit.',
    [['self', 'Premium for self & family', 'm', 22000, '', { local: { IN: 22000 } }], ['ssr', 'You or spouse is 60+', 'c', 0, ''], ['par', 'Premium for parents', 'm', 40000, '', { local: { IN: 40000 } }], ['psr', 'Parents are 60+', 'c', 1, ''], ['slab', 'Your tax slab', 's', 30, [[5, '5%'], [20, '20%'], [30, '30%']]]],
    [['Deduction', 'min(self,if(ssr==1,50000,25000))+min(par,if(psr==1,50000,25000))', 'm'], ['Tax saved', 'o1*slab/100*1.04', 'm', '', { hl: 1 }], ['Self & family limit', 'if(ssr==1,50000,25000)', 'm'], ['Parents limit', 'if(psr==1,50000,25000)', 'm']]);

  F('disability-insurance-calculator', 'Disability Insurance Calculator', 'finance/insurance', 'How much monthly income cover to buy in case you cannot work.', 'Target = income × replacement % − existing employer cover.',
    [['inc', 'Monthly gross income', 'm', 6000, ''], ['rep', 'Income to replace', 'p', 65], ['emp', 'Employer cover per month', 'm', 1500, '', { opt: 1 }]],
    [['Cover to buy (per month)', 'max(0,inc*rep/100-emp)', 'm'], ['Total target', 'inc*rep/100', 'm'], ['Yearly', 'o1*12', 'm']]);

  /* ---------------- Budget & life planning ---------------- */
  F('50-30-20-budget-calculator', '50/30/20 Budget Calculator', 'finance/budget', 'Split your take-home pay into needs, wants and savings.', '50% needs · 30% wants · 20% savings & debt.',
    [['inc', 'Monthly take-home pay', 'm', 4000, '', { local: { IN: 80000 } }], ['n', 'Needs', 'p', 50], ['w', 'Wants', 'p', 30], ['s', 'Savings & debt', 'p', 20]],
    [['Needs', 'inc*n/100', 'm'], ['Wants', 'inc*w/100', 'm'], ['Savings & debt', 'inc*s/100', 'm'], ['Check total', 'n+w+s', 'p', '', { dp: 0 }]], { donut: [['Needs', 'o1'], ['Wants', 'o2'], ['Savings', 'o3']], donutF: 'm' });

  F('credit-card-interest-calculator', 'Credit Card Interest Calculator', 'finance/debt-credit', 'Monthly interest on your credit card balance.', 'Interest = balance × APR ÷ 12 (or ÷ 365 per day).',
    [['bal', 'Balance', 'm', 5000, '', { local: { IN: 100000 } }], ['apr', 'APR', 'p', 22, '', { local: { IN: 42 } }], ['days', 'Days carried', 'i', 30]],
    [['Interest for the period', 'bal*apr/100/365*days', 'm'], ['Per month', 'bal*apr/1200', 'm'], ['Per year', 'bal*apr/100', 'm'], ['Daily interest', 'bal*apr/36500', 'm2']]);

  F('credit-utilization-calculator', 'Credit Utilization Calculator', 'finance/debt-credit', 'Your credit utilization ratio and how to improve your score.', 'Utilization = total balances ÷ total credit limits.',
    [['bal', 'Total balances', 'm', 3000, ''], ['lim', 'Total credit limit', 'm', 12000, '']],
    [['Utilization', 'bal/lim*100', 'p', '', { dp: 1 }], ['Rating', 'bal/lim*100', 'b', '', { bands: [[10, 'Excellent'], [30, 'Good'], [50, 'Fair'], [Infinity, 'High — pay down']] }], ['Pay down to reach 30%', 'max(0,bal-lim*0.3)', 'm'], ['Pay down to reach 10%', 'max(0,bal-lim*0.1)', 'm']]);

  CW.register({
    id: 'credit-card-minimum-payment-calculator', title: 'Credit Card Minimum Payment Calculator', g: 'finance/debt-credit',
    desc: 'How long minimum payments take to clear a credit card and how much interest it costs.',
    formula: 'Each month: interest = balance × APR ÷ 12; minimum = max(floor, 1% of balance + interest). Repeat until paid off.',
    inputs: [{ k: 'bal', l: 'Balance', t: 'money', v: 5000 }, { k: 'apr', l: 'APR', t: 'percent', v: 22 }, { k: 'pct', l: 'Minimum payment (% of balance, plus interest)', t: 'percent', v: 1 }, { k: 'floor', l: 'Minimum floor', t: 'money', v: 25 }],
    calc: function (v) {
      var b = v.bal, i = 0, ti = 0, rows = [];
      while (b > 0.005 && i < 1200) {
        var int_ = b * v.apr / 1200, pay = Math.min(b + int_, Math.max(v.floor, b * v.pct / 100 + int_));
        if (pay <= int_) return { error: 'The minimum payment does not cover the interest, so the balance never falls.' };
        b = b + int_ - pay; ti += int_; i++;
        if (i % 12 === 0 || b <= 0.005) rows.push([i, ti, Math.max(0, b)]);
      }
      return { results: [{ l: 'Months to pay off', v: i, f: 'int', main: true, sub: CW.fin.yrsMo ? CW.fin.yrsMo(i) : '' }, { l: 'Total interest', v: ti, f: 'money' }, { l: 'Total paid', v: v.bal + ti, f: 'money' }],
        table: { head: ['Month', 'Interest so far', 'Balance'], rows: rows, fmt: ['int', 'money', 'money'], title: 'Yearly snapshot' }, chart: { type: 'donut', data: [{ l: 'Balance', v: v.bal }, { l: 'Interest', v: ti }], f: 'money' } };
    }
  });

  F('wedding-budget-calculator', 'Wedding Budget Calculator', 'finance/budget', 'Plan your wedding spend by guests and category.', 'Total = guests × per-guest cost + fixed costs.',
    [['g', 'Guests', 'i', 150], ['pg', 'Catering & venue per guest', 'm', 80, '', { local: { IN: 2500 } }], ['dec', 'Decor & flowers', 'm', 6000, '', { local: { IN: 300000 } }], ['ph', 'Photo & video', 'm', 4000, '', { local: { IN: 150000 } }], ['att', 'Attire & beauty', 'm', 5000, '', { local: { IN: 400000 } }], ['ent', 'Music & entertainment', 'm', 3000, '', { local: { IN: 120000 } }], ['oth', 'Other', 'm', 3000, '', { local: { IN: 150000 } }]],
    [['Total budget', 'g*pg+dec+ph+att+ent+oth', 'm'], ['Cost per guest', 'o1/g', 'm'], ['Catering & venue', 'g*pg', 'm'], ['Contingency (10%)', 'o1*0.1', 'm']],
    { donut: [['Catering & venue', 'g*pg'], ['Decor', 'dec'], ['Photo & video', 'ph'], ['Attire', 'att'], ['Entertainment', 'ent'], ['Other', 'oth']], donutF: 'm' });

  F('baby-cost-calculator', 'Baby Cost Calculator', 'finance/budget', 'Estimate the first-year cost of a new baby.', 'Total = one-off items + monthly costs × 12.',
    [['once', 'One-off items (crib, stroller, car seat)', 'm', 2500, '', { local: { IN: 80000 } }], ['food', 'Food & formula per month', 'm', 150, '', { local: { IN: 4000 } }], ['dia', 'Diapers & care per month', 'm', 120, '', { local: { IN: 3500 } }], ['med', 'Healthcare per month', 'm', 100, '', { local: { IN: 3000 } }], ['care', 'Childcare per month', 'm', 800, '', { opt: 1, local: { IN: 10000 } }]],
    [['First-year cost', 'once+(food+dia+med+care)*12', 'm'], ['Monthly running cost', 'food+dia+med+care', 'm'], ['One-off', 'once', 'm']]);

  F('college-savings-calculator', 'College Savings (529) Calculator', 'finance/budget', 'Monthly saving needed to fund future college costs.', 'Future cost = today’s cost × (1 + education inflation)^years; monthly saving from the FV annuity formula.',
    [['cost', 'Cost per year today', 'm', 30000, '', { local: { IN: 800000 } }], ['n', 'Years of study', 'n', 4], ['yrs', 'Years until college', 'n', 12], ['inf', 'Education inflation', 'p', 5], ['have', 'Saved so far', 'm', 5000, ''], ['r', 'Investment return', 'p', 6]],
    [['Total cost at start of college', 'cost*n*(1+inf/100)^(yrs+n/2)', 'm', '', { k: 'tc', hide: 1 }], ['Monthly saving needed', 'max(0,tc-have*(1+r/1200)^(yrs*12))*(r/1200)/((1+r/1200)^(yrs*12)-1)', 'm', '', { hl: 1 }], ['Future total cost', 'tc', 'm'], ['Already covered', 'have*(1+r/1200)^(yrs*12)', 'm']]);

  F('education-cost-planner', 'Education Cost Planner', 'finance/budget', 'Future cost of school or college and the SIP to fund it.', 'Future cost = present cost × (1 + inflation)^years.',
    [['c', 'Cost today', 'm', 60000, '', { local: { IN: 1500000 } }], ['yrs', 'Years until needed', 'n', 12], ['inf', 'Education inflation', 'p', 8], ['r', 'Investment return', 'p', 12]],
    [['Future cost', 'c*(1+inf/100)^yrs', 'm'], ['Monthly SIP needed', 'o1*(r/1200)/((1+r/1200)^(yrs*12)-1)', 'm', '', { hl: 1 }], ['One-time investment today', 'o1/(1+r/100)^yrs', 'm']]);

  F('car-cost-of-ownership-calculator', 'Car Cost of Ownership Calculator', 'auto-travel/vehicle', 'True yearly and per-km cost of owning a car.', 'Total = depreciation + fuel + insurance + maintenance + loan interest + parking.',
    [['price', 'Purchase price', 'm', 1000000, '', { local: { IN: 1000000 } }], ['dep', 'Depreciation per year', 'p', 15], ['km', 'Distance per year', 'n', 12000, 'km'], ['eff', 'Fuel efficiency (km per litre)', 'n', 15], ['fp', 'Fuel price per litre', 'm', 100, '', { local: { IN: 100 } }], ['ins', 'Insurance per year', 'm', 30000, '', { local: { IN: 30000 } }], ['mnt', 'Maintenance per year', 'm', 20000, '', { local: { IN: 20000 } }], ['int', 'Loan interest per year', 'm', 0, '', { opt: 1 }], ['oth', 'Parking & tolls per year', 'm', 15000, '', { opt: 1, local: { IN: 15000 } }]],
    [['Yearly cost', 'price*dep/100+km/eff*fp+ins+mnt+int+oth', 'm'], ['Per month', 'o1/12', 'm'], ['Cost per km', 'o1/km', 'm2'], ['Fuel per year', 'km/eff*fp', 'm']],
    { donut: [['Depreciation', 'price*dep/100'], ['Fuel', 'km/eff*fp'], ['Insurance', 'ins'], ['Maintenance', 'mnt'], ['Interest', 'int'], ['Parking & tolls', 'oth']], donutF: 'm' });

  F('subscription-cost-calculator', 'Subscription Cost Calculator', 'finance/budget', 'What your subscriptions cost per year and what that money could grow into.', 'Yearly = monthly total × 12. Invested value uses compound growth.',
    [['m', 'Total monthly subscriptions', 'm', 60, '', { local: { IN: 2500 } }], ['yrs', 'Years', 'n', 10], ['r', 'Return if invested instead', 'p', 8]],
    [['Per year', 'm*12', 'm'], ['Over the years', 'm*12*yrs', 'm'], ['If invested instead', 'fvs(r/1200,yrs*12,m)', 'm']]);

  F('savings-rate-calculator', 'Savings Rate Calculator', 'finance/budget', 'The share of income you save and what it means for your future.', 'Savings rate = savings ÷ income × 100.',
    [['inc', 'Monthly income (after tax)', 'm', 4000, ''], ['sav', 'Monthly savings', 'm', 600, '']],
    [['Savings rate', 'sav/inc*100', 'p', '', { dp: 1 }], ['Yearly savings', 'sav*12', 'm'], ['Rating', 'sav/inc*100', 'b', '', { bands: [[10, 'Start higher'], [20, 'Decent'], [35, 'Strong'], [Infinity, 'Excellent']] }], ['Years to FI (5% real, 25× rule)', 'ln((25*(inc-sav)*12*0.05+sav*12)/(sav*12))/ln(1.05)', 'f', 'years', { dp: 1 }]]);

  F('latte-factor-calculator', 'Latte Factor Calculator', 'finance/budget', 'See what small daily spends become if invested.', 'FV of daily spending invested monthly.',
    [['d', 'Daily spend', 'm', 5, '', { local: { IN: 150 } }], ['days', 'Days per week', 'n', 5], ['yrs', 'Years', 'n', 20], ['r', 'Return', 'p', 8]],
    [['Per month', 'd*days*52/12', 'm'], ['Spent over the years', 'o1*12*yrs', 'm'], ['If invested instead', 'fvs(r/1200,yrs*12,o1)', 'm', '', { hl: 1 }]]);

  CW.register({
    id: 'denomination-counter', title: 'Cash Denomination Counter', g: 'finance/budget',
    desc: 'Count notes and coins by denomination to get the total cash in hand.',
    formula: 'Total = Σ (denomination × count).',
    inputs: [{ k: 'rows', l: 'Notes & coins', t: 'rows', add: 'Add denomination', cols: [{ l: 'Denomination', t: 'number', v: 100 }, { l: 'Count', t: 'number', v: 0 }],
      v: [[500, 2], [200, 3], [100, 5], [50, 4], [20, 6], [10, 10]] }],
    calc: function (v) {
      var tot = 0, n = 0, rows = (v.rows || []).filter(function (r) { return r[0] > 0; }).map(function (r) { var a = r[0] * r[1]; tot += a; n += r[1]; return [r[0], r[1], a]; });
      return { results: [{ l: 'Total cash', v: tot, f: 'money', main: true }, { l: 'Notes & coins', v: n, f: 'int' }], table: { head: ['Denomination', 'Count', 'Amount'], rows: rows, fmt: ['money', 'int', 'money'], title: 'Breakdown' } };
    }
  });

  CW.setCur(['401k-calculator', 'roth-ira-calculator', 'traditional-ira-calculator', 'rmd-calculator', 'social-security-calculator'], 'USD');
  CW.setCur(['rrsp-calculator'], 'CAD'); CW.setCur(['superannuation-calculator'], 'AUD'); CW.setCur(['uk-state-pension-calculator'], 'GBP');
  CW.setCur(['vpf-calculator', 'ulip-calculator', 'car-insurance-idv-calculator', 'no-claim-bonus-calculator', 'health-insurance-80d-calculator'], 'INR', 'IN');
})(window.CW);
