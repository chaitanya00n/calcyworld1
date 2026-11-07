/* Calcyworld — tax, salary & HR calculators (formula DSL) */
(function (CW) {
  'use strict';
  var F = CW.F;
  var fsKey = function (n) { return +n === 3 ? 'hoh' : +n === 2 ? 'mfj' : 's'; };
  var STATUS = [[1, 'Single'], [2, 'Married filing jointly'], [3, 'Head of household']];
  var STD = 'if(fs==1,16100,if(fs==2,32200,24150))';

  /* ---------------- Income tax ---------------- */
  F('us-federal-income-tax-calculator', 'US Federal Income Tax Calculator', 'tax-salary/income-tax', 'Estimate your 2026 federal income tax, effective rate and marginal bracket.', 'Taxable income = income − deduction. Tax is charged bracket by bracket (10% to 37%).',
    [['inc', 'Gross income', 'm', 85000, ''], ['fs', 'Filing status', 's', 1, STATUS], ['ded', 'Deduction', 'g', 1, [[1, 'Standard'], [2, 'Itemized']]], ['item', 'Itemized deductions', 'm', 20000, '', { show: 'ded==2' }], ['kids', 'Children under 17', 'i', 0, '', { opt: 1 }]],
    [['Taxable', 'max(0,inc-if(ded==1,' + STD + ',item))', 'm', '', { k: 'ti', hide: 1 }],
      ['Federal income tax', function (v) { return Math.max(0, CW.fin.usTax(v.ti, fsKey(v.fs)).tax - v.kids * 2200); }, 'm', '', { k: 'tax' }],
      ['Effective tax rate', 'tax/inc*100', 'p', '', { dp: 2 }], ['Marginal bracket', function (v) { return CW.fin.usTax(v.ti, fsKey(v.fs)).marginal; }, 'p', '', { dp: 0 }], ['Taxable income', 'ti', 'm'], ['After-tax income', 'inc-tax', 'm', '', { hl: 1 }]],
    { donut: [['Federal tax', 'tax'], ['Take-home', 'inc-tax']], donutF: 'm', note: '2026 brackets and standard deduction. Excludes FICA, state tax and other credits. A $2,200 child tax credit is applied per child.', pop: 1 });

  F('us-tax-bracket-calculator', 'Tax Bracket Calculator (US)', 'tax-salary/income-tax', 'Find your marginal tax bracket and how much income is left before the next one.', 'Marginal rate = bracket rate on your last dollar; effective rate = total tax ÷ income.',
    [['ti', 'Taxable income', 'm', 95000, ''], ['fs', 'Filing status', 's', 1, STATUS]],
    [['Marginal bracket', function (v) { return CW.fin.usTax(v.ti, fsKey(v.fs)).marginal; }, 'p', '', { dp: 0 }], ['Federal tax', function (v) { return CW.fin.usTax(v.ti, fsKey(v.fs)).tax; }, 'm', '', { k: 'tx' }], ['Effective rate', 'tx/ti*100', 'p', '', { dp: 2 }],
      ['Room left in bracket', function (v) { var T = { s: [12400, 50400, 105700, 201775, 256225, 640600], mfj: [24800, 100800, 211400, 403550, 512450, 768700], hoh: [17700, 67450, 105700, 201750, 256200, 640600] }[fsKey(v.fs)]; for (var i = 0; i < T.length; i++) if (v.ti < T[i]) return T[i] - v.ti; return 0; }, 'm']]);

  F('self-employment-tax-calculator', 'Self-Employment Tax Calculator (US)', 'tax-salary/income-tax', 'Social Security and Medicare tax on freelance or business income.', 'SE tax = 92.35% of net earnings × 15.3% (12.4% Social Security up to the wage base + 2.9% Medicare).',
    [['net', 'Net self-employment income', 'm', 80000, '']],
    [['Self-employment tax', 'min(net*0.9235,184500)*0.124+net*0.9235*0.029', 'm'], ['Social Security part', 'min(net*0.9235,184500)*0.124', 'm'], ['Medicare part', 'net*0.9235*0.029', 'm'], ['Deductible half', 'o1/2', 'm'], ['Effective SE rate', 'o1/net*100', 'p', '', { dp: 2 }]],
    { note: '2026 Social Security wage base: $184,500. Additional 0.9% Medicare tax applies to high earners.' });

  F('quarterly-estimated-tax-calculator', 'Quarterly Estimated Tax Calculator (US)', 'tax-salary/income-tax', 'How much to send the IRS each quarter if you are self-employed.', 'Quarterly payment = (income tax + self-employment tax − withholding) ÷ 4.',
    [['net', 'Expected net profit', 'm', 90000, ''], ['fs', 'Filing status', 's', 1, STATUS], ['other', 'Other income', 'm', 0, '', { opt: 1 }], ['wh', 'Tax already withheld', 'm', 0, '', { opt: 1 }]],
    [['SE tax', 'min(net*0.9235,184500)*0.124+net*0.9235*0.029', 'm', '', { k: 'se', hide: 1 }], ['Taxable', 'max(0,net+other-se/2-' + STD + ')', 'm', '', { k: 'ti', hide: 1 }],
      ['Federal income tax', function (v) { return CW.fin.usTax(v.ti, fsKey(v.fs)).tax; }, 'm', '', { k: 'it', hide: 1 }],
      ['Each quarterly payment', 'max(0,it+se-wh)/4', 'm'], ['Total for the year', 'max(0,it+se-wh)', 'm'], ['Income tax', 'it', 'm'], ['Self-employment tax', 'se', 'm']],
    { note: 'Due dates: April 15, June 15, September 15 and January 15.' });

  F('federal-tax-refund-calculator', 'Federal Tax Refund Calculator (US)', 'tax-salary/income-tax', 'Estimate whether you will get a refund or owe tax this year.', 'Refund = tax withheld + credits − tax owed.',
    [['inc', 'Total income', 'm', 75000, ''], ['fs', 'Filing status', 's', 1, STATUS], ['wh', 'Federal tax withheld (W-2 box 2)', 'm', 8000, ''], ['cr', 'Other tax credits', 'm', 0, '', { opt: 1 }], ['adj', 'Other deductions', 'm', 0, '', { opt: 1 }]],
    [['Tax', function (v) { return Math.max(0, CW.fin.usTax(Math.max(0, v.inc - v.adj - ({ 1: 16100, 2: 32200, 3: 24150 }[+v.fs])), fsKey(v.fs)).tax - v.cr); }, 'm', '', { k: 'tx', hide: 1 }],
      ['Refund (+) / amount owed (−)', 'wh-tx', 'm', '', { main: true }], ['Tax owed', 'tx', 'm'], ['Withheld', 'wh', 'm']]);

  F('state-income-tax-calculator', 'State Income Tax Calculator', 'tax-salary/income-tax', 'Estimate state income tax using your state’s effective rate.', 'Tax = (income − deduction) × rate.',
    [['inc', 'Taxable income', 'm', 80000, ''], ['rate', 'State tax rate', 'p', 4.5, '', { help: 'Use your state’s flat rate or average effective rate.' }], ['ded', 'State deduction', 'm', 0, '', { opt: 1 }]],
    [['State tax', 'max(0,inc-ded)*rate/100', 'm'], ['Monthly', 'o1/12', 'm'], ['After state tax', 'inc-o1', 'm']]);

  F('canada-income-tax-calculator', 'Canada Federal Income Tax Calculator', 'tax-salary/income-tax', 'Federal income tax for 2026 with the basic personal amount credit.', 'Brackets 14% / 20.5% / 26% / 29% / 33% less the non-refundable basic personal credit at 14%.',
    [['inc', 'Taxable income (CAD)', 'm', 90000, ''], ['bpa', 'Basic personal amount', 'm', 16452, '']],
    [['Federal tax', 'max(0,0.14*min(inc,58523)+0.205*max(0,min(inc,117045)-58523)+0.26*max(0,min(inc,181440)-117045)+0.29*max(0,min(inc,258482)-181440)+0.33*max(0,inc-258482)-0.14*bpa)', 'm'], ['Average rate', 'o1/inc*100', 'p', '', { dp: 2 }], ['Marginal rate', 'if(inc>258482,33,if(inc>181440,29,if(inc>117045,26,if(inc>58523,20.5,14))))', 'p', '', { dp: 1 }], ['After federal tax', 'inc-o1', 'm']],
    { note: 'Federal tax only. Provincial/territorial tax, CPP and EI are extra.' });

  F('australia-income-tax-calculator', 'Australia Income Tax Calculator', 'tax-salary/income-tax', 'Resident income tax and Medicare levy for 2026–27.', 'Rates: 0% to $18,200 · 15% to $45,000 · 30% to $135,000 · 37% to $190,000 · 45% above. Medicare levy 2%.',
    [['inc', 'Taxable income (AUD)', 'm', 95000, ''], ['ml', 'Medicare levy applies', 'g', 1, [[1, 'Yes'], [0, 'No']]]],
    [['Income tax', '0.15*max(0,min(inc,45000)-18200)+0.30*max(0,min(inc,135000)-45000)+0.37*max(0,min(inc,190000)-135000)+0.45*max(0,inc-190000)', 'm', '', { k: 'it', hide: 1 }], ['Total tax + Medicare', 'it+ml*inc*0.02', 'm'], ['Income tax', 'it', 'm'], ['Medicare levy', 'ml*inc*0.02', 'm'], ['Take-home pay', 'inc-o2', 'm', '', { hl: 1 }], ['Monthly take-home', 'o5/12', 'm']]);

  F('uk-stamp-duty-calculator', 'UK Stamp Duty (SDLT) Calculator', 'tax-salary/other-tax', 'Stamp Duty Land Tax on a property purchase in England and Northern Ireland.', 'Bands from 1 April 2025: 0% to £125k · 2% to £250k · 5% to £925k · 10% to £1.5m · 12% above. Extra 5% on additional homes.',
    [['p', 'Property price (£)', 'm', 450000, ''], ['t', 'Buyer', 'g', 1, [[1, 'Home mover'], [2, 'First-time buyer'], [3, 'Additional property']]]],
    [['Stamp Duty', 'if(t==2,if(p>500000,0.02*(min(p,250000)-125000)+0.05*(min(p,925000)-250000)+0.10*max(0,min(p,1500000)-925000)+0.12*max(0,p-1500000),0.05*max(0,p-300000)),0.02*max(0,min(p,250000)-125000)+0.05*max(0,min(p,925000)-250000)+0.10*max(0,min(p,1500000)-925000)+0.12*max(0,p-1500000))+if(t==3,0.05*p,0)', 'm'], ['Effective rate', 'o1/p*100', 'p', '', { dp: 2 }], ['Total cost with duty', 'p+o1', 'm']]);

  F('uk-student-loan-repayment-calculator', 'UK Student Loan Repayment Calculator', 'tax-salary/income-tax', 'Monthly student loan deduction from your salary.', 'Repayment = 9% of earnings above the plan threshold (6% for postgraduate loans).',
    [['sal', 'Annual salary (£)', 'm', 42000, ''], ['plan', 'Repayment plan', 's', 29385, [[26900, 'Plan 1'], [29385, 'Plan 2'], [33795, 'Plan 4'], [25000, 'Plan 5'], [21000, 'Postgraduate']]], ['pg', 'Postgraduate loan too?', 'c', 0, '', { opt: 1 }]],
    [['Yearly repayment', 'max(0,sal-plan)*if(plan==21000,0.06,0.09)+pg*max(0,sal-21000)*0.06*if(plan==21000,0,1)', 'm'], ['Monthly repayment', 'o1/12', 'm'], ['Take-home reduction', 'o1/sal*100', 'p', '', { dp: 2 }]],
    { note: 'Thresholds change every April — edit the plan values if the rules have moved.' });

  F('effective-tax-rate-calculator', 'Effective Tax Rate Calculator', 'tax-salary/income-tax', 'Find your effective (average) tax rate from total tax and income.', 'Effective rate = total tax ÷ total income × 100.',
    [['tax', 'Total tax paid', 'm', 14000, ''], ['inc', 'Total income', 'm', 80000, '']],
    [['Effective tax rate', 'tax/inc*100', 'p', '', { dp: 2 }], ['Income after tax', 'inc-tax', 'm'], ['Tax per month', 'tax/12', 'm']], { donut: [['Tax', 'tax'], ['After tax', 'inc-tax']], donutF: 'm' });

  /* ---------------- India tax ---------------- */
  F('capital-gains-tax-india-calculator', 'Capital Gains Tax Calculator (India)', 'tax-salary/income-tax', 'Short- and long-term capital gains tax on shares, mutual funds, property and gold.', 'Equity: STCG 20% (≤12 months), LTCG 12.5% above ₹1.25 lakh. Other assets: LTCG 12.5% after 24 months; short term at slab rate.',
    [['a', 'Asset', 's', 1, [[1, 'Listed shares / equity funds'], [2, 'Property, gold, debt funds, other']]], ['buy', 'Purchase price', 'm', 400000, '', { local: { IN: 400000 } }], ['sell', 'Sale price', 'm', 700000, '', { local: { IN: 700000 } }], ['mo', 'Holding period (months)', 'i', 18], ['slab', 'Your slab rate (short-term other assets)', 'p', 30, '', { show: 'a==2' }]],
    [['Gain', 'sell-buy', 'm', '', { k: 'gain', hide: 1 }], ['Capital gains tax', 'max(0,if(a==1,if(mo>12,max(0,gain-125000)*0.125,gain*0.20),if(mo>24,gain*0.125,gain*slab/100)))*1.04', 'm'], ['Capital gain', 'gain', 'm'], ['Type', 'if(a==1,if(mo>12,1,0),if(mo>24,1,0))', 'b', '', { bands: [[1, 'Short-term'], [Infinity, 'Long-term']] }], ['Net after tax', 'sell-o2', 'm', '', { hl: 1 }]],
    { note: 'Includes 4% cess. Surcharge not included. Property bought before July 2024 may qualify for indexation at 20%.' });

  F('tds-calculator-india', 'TDS Calculator (India)', 'tax-salary/income-tax', 'Tax deducted at source by section — interest, rent, contractor, professional fees and more.', 'TDS = amount × section rate. Without a PAN the rate is the higher of the section rate or 20%.',
    [['amt', 'Payment amount', 'm', 100000, '', { local: { IN: 100000 } }], ['r', 'Nature of payment', 's', 10, [[10, '194A — Interest (bank/other) · 10%'], [1, '194C — Contractor (individual/HUF) · 1%'], [2, '194C — Contractor (others) · 2%'], [2.001, '194H — Commission/brokerage · 2%'], [2.002, '194I(a) — Rent, plant & machinery · 2%'], [10.001, '194I(b) — Rent, land/building · 10%'], [10.002, '194J — Professional fees · 10%'], [2.003, '194J — Technical services · 2%'], [0.1, '194Q — Purchase of goods · 0.1%'], [1.001, '194S — Crypto / VDA transfer · 1%']]], ['pan', 'PAN available', 'g', 1, [[1, 'Yes'], [0, 'No']]]],
    [['TDS to deduct', 'amt*if(pan==1,floor(r*10+0.4)/10,max(floor(r*10+0.4)/10,20))/100', 'm'], ['Rate applied', 'if(pan==1,floor(r*10+0.4)/10,max(floor(r*10+0.4)/10,20))', 'p', '', { dp: 1 }], ['Net payable to payee', 'amt-o1', 'm']],
    { note: 'Basic rates; annual thresholds (for example ₹50,000 for bank interest) are not applied.' });

  F('advance-tax-calculator-india', 'Advance Tax Calculator (India)', 'tax-salary/income-tax', 'Instalment-wise advance tax with due dates.', 'Advance tax is paid 15% by 15 Jun, 45% by 15 Sep, 75% by 15 Dec and 100% by 15 Mar.',
    [['tax', 'Estimated total tax for the year', 'm', 150000, '', { local: { IN: 150000 } }], ['tds', 'TDS / TCS already deducted', 'm', 40000, '', { local: { IN: 40000 } }]],
    [['Net tax payable', 'max(0,tax-tds)', 'm'], ['By 15 June (15%)', 'o1*0.15', 'm'], ['By 15 September (30%)', 'o1*0.30', 'm'], ['By 15 December (30%)', 'o1*0.30', 'm'], ['By 15 March (25%)', 'o1*0.25', 'm'], ['Advance tax needed?', 'o1-10000', 'b', '', { bands: [[0.0001, 'No — liability is ₹10,000 or less'], [Infinity, 'Yes — pay in instalments']] }]],
    { donut: [['15 Jun', 'o2'], ['15 Sep', 'o3'], ['15 Dec', 'o4'], ['15 Mar', 'o5']], donutF: 'm' });

  F('gst-late-fee-calculator-india', 'GST Late Fee & Interest Calculator (India)', 'tax-salary/indirect-tax', 'Late fee and 18% interest for delayed GSTR-1 / GSTR-3B filing.', 'Late fee ₹50 a day (₹20 for nil returns), capped at ₹10,000. Interest = 18% p.a. on net tax due.',
    [['tax', 'Net tax payable', 'm', 50000, '', { local: { IN: 50000 } }], ['days', 'Days late', 'i', 20], ['nil', 'Nil return', 'c', 0, '']],
    [['Late fee', 'min(days*if(nil==1,20,50),if(nil==1,1000,10000))', 'm', '', { k: 'lf', hide: 1 }], ['Interest', 'tax*0.18*days/365', 'm', '', { k: 'ti', hide: 1 }], ['Total penalty', 'lf+ti', 'm'], ['Late fee', 'lf', 'm'], ['Interest @18%', 'ti', 'm']]);

  F('presumptive-tax-44ada-calculator', 'Presumptive Tax Calculator (44AD / 44ADA)', 'tax-salary/income-tax', 'Tax for small businesses and professionals under the presumptive scheme.', '44ADA: 50% of receipts is deemed profit. 44AD: 6% (digital) or 8% (cash) of turnover.',
    [['t', 'Scheme', 'g', 1, [[1, '44ADA professional'], [2, '44AD business (digital)'], [3, '44AD business (cash)']]], ['rec', 'Gross receipts / turnover', 'm', 2000000, '', { local: { IN: 2000000 } }]],
    [['Deemed profit', 'rec*if(t==1,0.5,if(t==2,0.06,0.08))', 'm', '', { k: 'pf', hide: 1 }], ['Income tax (new regime)', function (v) { return CW.inTax.newRegime(Math.max(0, v.pf)).total; }, 'm'], ['Deemed profit', 'pf', 'm'], ['Tax as % of receipts', 'o2/rec*100', 'p', '', { dp: 2 }]],
    { note: 'New-regime slabs incl. 87A rebate and cess; standard deduction is not available on business income.' });

  F('section-80c-calculator', 'Section 80C Tax Saving Calculator (India)', 'tax-salary/income-tax', 'See how much tax your 80C investments save under the old regime.', 'Deduction = min(investments, ₹1.5 lakh). Tax saved = deduction × slab rate × 1.04 (cess).',
    [['inv', 'Total 80C investments', 'm', 150000, '', { local: { IN: 150000 } }], ['slab', 'Your tax slab', 's', 30, [[5, '5%'], [20, '20%'], [30, '30%']]]],
    [['Tax saved', 'min(inv,150000)*slab/100*1.04', 'm'], ['Eligible deduction', 'min(inv,150000)', 'm'], ['Room left under ₹1.5L', 'max(0,150000-inv)', 'm']]);

  F('crypto-tax-india-calculator', 'Crypto Tax Calculator (India)', 'tax-salary/other-tax', 'Tax at 30% on crypto gains plus 1% TDS on transfers.', 'Tax = 30% of gains + 4% cess. TDS = 1% of the sale value. No set-off of losses.',
    [['buy', 'Purchase cost', 'm', 200000, '', { local: { IN: 200000 } }], ['sell', 'Sale value', 'm', 350000, '', { local: { IN: 350000 } }]],
    [['Tax on gains', 'max(0,sell-buy)*0.30*1.04', 'm'], ['TDS @1% (already deducted)', 'sell*0.01', 'm'], ['Balance tax to pay', 'max(0,o1-o2)', 'm'], ['Net profit after tax', 'sell-buy-o1', 'm', '', { hl: 1 }]]);

  /* ---------------- Other & indirect tax ---------------- */
  F('reverse-sales-tax-calculator', 'Reverse Sales Tax Calculator', 'tax-salary/indirect-tax', 'Work back from a tax-inclusive price to the price before tax.', 'Pre-tax price = total ÷ (1 + rate).',
    [['tot', 'Total price (with tax)', 'm', 107.5, ''], ['r', 'Tax rate', 'p', 7.5]],
    [['Price before tax', 'tot/(1+r/100)', 'm'], ['Tax amount', 'tot-o1', 'm']], { donut: [['Before tax', 'o1'], ['Tax', 'o2']], donutF: 'm' });

  F('import-duty-calculator', 'Import Duty & Customs Calculator', 'tax-salary/indirect-tax', 'Estimate duty and VAT/GST on imported goods.', 'Duty = (goods + shipping + insurance) × duty rate; VAT/GST is charged on value + duty.',
    [['g', 'Value of goods', 'm', 1000, ''], ['sh', 'Shipping', 'm', 80, ''], ['ins', 'Insurance', 'm', 0, '', { opt: 1 }], ['d', 'Customs duty rate', 'p', 10], ['v', 'VAT / GST rate', 'p', 18]],
    [['Customs value', 'g+sh+ins', 'm', '', { k: 'cv', hide: 1 }], ['Total landed cost', 'cv+cv*d/100+(cv+cv*d/100)*v/100', 'm'], ['Customs duty', 'cv*d/100', 'm'], ['VAT / GST', '(cv+cv*d/100)*v/100', 'm'], ['Total taxes', 'o3+o4', 'm', '', { hl: 1 }]],
    { donut: [['Goods + freight', 'cv'], ['Duty', 'o3'], ['VAT / GST', 'o4']], donutF: 'm' });

  F('property-tax-calculator', 'Property Tax Calculator', 'tax-salary/other-tax', 'Annual and monthly property tax from assessed value and local rate.', 'Tax = assessed value × assessment ratio × rate. Mill rate: 1 mill = 0.1%.',
    [['v', 'Property value', 'm', 350000, ''], ['ar', 'Assessment ratio', 'p', 100], ['rate', 'Tax rate', 'p', 1.1, '', { help: 'Percent of assessed value per year.' }], ['ex', 'Exemptions', 'm', 0, '', { opt: 1 }]],
    [['Annual property tax', 'max(0,v*ar/100-ex)*rate/100', 'm'], ['Monthly', 'o1/12', 'm'], ['Assessed value', 'v*ar/100', 'm']]);

  F('estate-tax-calculator', 'Estate Tax Calculator (US Federal)', 'tax-salary/other-tax', 'Federal estate tax on an estate above the exemption.', 'Tax = (estate − exemption) × 40%. The 2026 exemption is $15 million per person.',
    [['es', 'Gross estate', 'm', 18000000, ''], ['ex', 'Exemption', 'm', 15000000, ''], ['debts', 'Debts & deductions', 'm', 0, '', { opt: 1 }]],
    [['Estimated estate tax', 'max(0,es-debts-ex)*0.4', 'm'], ['Taxable estate', 'max(0,es-debts-ex)', 'm'], ['Net to heirs', 'es-debts-o1', 'm']]);

  F('gift-tax-calculator', 'Gift Tax Calculator (US)', 'tax-salary/other-tax', 'Check if a gift needs a gift tax return and how it uses your lifetime exemption.', 'The 2026 annual exclusion is $19,000 per recipient. Excess reduces the lifetime exemption.',
    [['g', 'Gift per person', 'm', 30000, ''], ['n', 'Number of recipients', 'i', 1], ['sp', 'Gift splitting with spouse', 'c', 0, '', { opt: 1 }]],
    [['Taxable gift (above exclusion)', 'max(0,g-19000*(1+sp))*n', 'm'], ['Form 709 needed?', 'o1', 'b', '', { bands: [[0.0001, 'No'], [Infinity, 'Yes']] }], ['Lifetime exemption used', 'o1/15000000*100', 'p', '', { dp: 3 }], ['Gift tax due now', '0', 'm']],
    { note: 'You normally owe no gift tax until lifetime gifts pass the exemption ($15M in 2026).' });

  F('uk-inheritance-tax-calculator', 'UK Inheritance Tax Calculator', 'tax-salary/other-tax', 'Inheritance Tax due on an estate above the nil-rate bands.', 'Tax = 40% of the estate above the nil-rate band (£325,000) plus residence nil-rate band (up to £175,000).',
    [['es', 'Total estate (£)', 'm', 800000, ''], ['home', 'Home left to children/grandchildren', 'm', 350000, ''], ['sp', 'Unused allowance from late spouse', 'g', 0, [[0, 'None'], [1, 'Full']]]],
    [['Allowances', '325000*(1+sp)+min(175000*(1+sp),home)*if(es>2000000,0,1)', 'm', '', { k: 'al', hide: 1 }], ['Inheritance Tax', 'max(0,es-al)*0.4', 'm'], ['Taxable estate', 'max(0,es-al)', 'm'], ['Allowances used', 'al', 'm'], ['Net to heirs', 'es-o2', 'm']],
    { note: 'The residence band tapers away above a £2m estate; this uses a simple cut-off.' });

  F('stamp-duty-calculator', 'Stamp Duty & Registration Calculator', 'real-estate/property-costs', 'Stamp duty and registration fee on a property purchase using your state or city rates.', 'Total = value × (stamp duty % + registration %).',
    [['v', 'Property value', 'm', 400000, '', { local: { IN: 7500000 } }], ['sd', 'Stamp duty', 'p', 5, '', { help: 'Rate in your state or city.' }], ['rg', 'Registration fee', 'p', 1], ['fem', 'Concession for women', 'p', 0, '', { opt: 1 }]],
    [['Total duty + registration', 'v*(max(0,sd-fem)+rg)/100', 'm'], ['Stamp duty', 'v*max(0,sd-fem)/100', 'm'], ['Registration', 'v*rg/100', 'm'], ['Total cost of property', 'v+o1', 'm']]);

  F('depreciation-calculator', 'Depreciation Calculator', 'business/accounting', 'Annual depreciation using straight-line, declining balance or sum-of-years methods, with a schedule.', 'Straight-line = (cost − salvage) ÷ life. Declining balance = book value × rate.',
    [['cost', 'Asset cost', 'm', 100000, ''], ['sal', 'Salvage value', 'm', 10000, ''], ['life', 'Useful life (years)', 'i', 5], ['m', 'Method', 's', 1, [[1, 'Straight-line'], [2, 'Double-declining balance'], [3, 'Sum-of-years digits'], [4, 'Written-down value (WDV)']]], ['wdv', 'WDV rate', 'p', 15, '', { show: 'm==4' }]],
    [['Year 1 depreciation', 'if(m==1,(cost-sal)/life,if(m==2,cost*2/life,if(m==3,(cost-sal)*life/(life*(life+1)/2),cost*wdv/100)))', 'm'], ['Total depreciable', 'cost-sal', 'm'], ['Book value after year 1', 'cost-o1', 'm']],
    { seq: { n: 'life', head: ['Year', 'Depreciation', 'Book value'], cols: [['i', 'i'], ['if(m==1,(cost-sal)/life,if(m==2,max(0,min(cost*(1-2/life)^(i-1)*2/life,cost*(1-2/life)^(i-1)-sal)),if(m==3,(cost-sal)*(life-i+1)/(life*(life+1)/2),cost*(1-wdv/100)^(i-1)*wdv/100)))', 'm'], ['cost-if(m==1,(cost-sal)/life*i,if(m==2,cost-cost*(1-2/life)^i,if(m==3,(cost-sal)*(i*(2*life-i+1)/2)/(life*(life+1)/2),cost-cost*(1-wdv/100)^i)))', 'm']], title: 'Depreciation schedule' } });

  F('lottery-tax-calculator', 'Lottery / Prize Tax Calculator', 'tax-salary/other-tax', 'Net winnings after tax on a lottery, game show or prize.', 'Tax = prize × tax rate. Lump sum shown against the annuity option.',
    [['pz', 'Prize amount', 'm', 1000000, ''], ['r', 'Tax rate', 'p', 30, '', { local: { IN: 31.2 } }], ['lump', 'Lump-sum payout', 'p', 100, '', { help: 'Percent of the headline prize if you take cash.' }]],
    [['Net winnings', 'pz*lump/100*(1-r/100)', 'm'], ['Tax withheld', 'pz*lump/100*r/100', 'm'], ['Cash before tax', 'pz*lump/100', 'm']]);

  /* ---------------- Salary & pay ---------------- */
  F('ctc-to-in-hand-salary-calculator', 'CTC to In-Hand Salary Calculator (India)', 'tax-salary/paycheck', 'Convert annual CTC to monthly take-home after PF, professional tax and income tax.', 'In-hand = CTC − employer PF − gratuity − employee PF − professional tax − income tax (new regime).',
    [['ctc', 'Annual CTC', 'm', 1200000, '', { local: { IN: 1200000 } }], ['basic', 'Basic pay (% of CTC)', 'p', 40], ['pf', 'PF on', 'g', 1, [[1, 'Capped at ₹15,000 basic'], [2, 'Full basic']]], ['pt', 'Professional tax / month', 'm', 200, '', { opt: 1, local: { IN: 200 } }]],
    [['Basic', 'ctc*basic/100', 'm', '', { k: 'bs', hide: 1 }], ['EPF', 'if(pf==1,min(bs,180000),bs)*0.12', 'm', '', { k: 'epf', hide: 1 }], ['Gratuity', 'bs*0.0481', 'm', '', { k: 'gr', hide: 1 }],
      ['Taxable', 'max(0,ctc-epf-gr-75000)', 'm', '', { k: 'tx', hide: 1 }], ['Tax', function (v) { return CW.inTax.newRegime(v.tx).total; }, 'm', '', { k: 'it', hide: 1 }],
      ['Monthly in-hand', '(ctc-epf-gr-epf-it-pt*12)/12', 'm'], ['Annual in-hand', 'o6*12', 'm'], ['Employer + employee PF', 'epf*2', 'm'], ['Income tax', 'it', 'm'], ['Gratuity provision', 'gr', 'm']],
    { donut: [['In-hand', 'o7'], ['PF (both)', 'epf*2'], ['Income tax', 'it'], ['Gratuity & PT', 'gr+pt*12']], donutF: 'm', note: 'Estimate under the new tax regime with a ₹75,000 standard deduction; variable pay and deductions differ by company.', pop: 1 });

  F('bonus-tax-calculator', 'Bonus Tax Calculator', 'tax-salary/paycheck', 'Net amount from a bonus after supplemental tax withholding.', 'US supplemental withholding is a flat 22% federal (37% above $1M) plus FICA and state tax.',
    [['b', 'Bonus amount', 'm', 10000, ''], ['st', 'State tax', 'p', 5, '', { opt: 1 }], ['fica', 'Include Social Security + Medicare (7.65%)', 'c', 1, '']],
    [['Federal', 'min(b,1000000)*0.22+max(0,b-1000000)*0.37', 'm', '', { k: 'fd', hide: 1 }], ['FICA', 'fica*b*0.0765', 'm', '', { k: 'fc', hide: 1 }], ['State', 'b*st/100', 'm', '', { k: 'sx', hide: 1 }],
      ['Net bonus', 'b-fd-fc-sx', 'm'], ['Federal withholding', 'fd', 'm'], ['FICA', 'fc', 'm'], ['State tax', 'sx', 'm'], ['Total withheld', 'fd+fc+sx', 'm']],
    { donut: [['Net', 'o4'], ['Federal', 'fd'], ['FICA', 'fc'], ['State', 'sx']], donutF: 'm' });

  F('gross-to-net-salary-calculator', 'Gross to Net Salary Calculator', 'tax-salary/paycheck', 'Take-home pay from gross salary with your own tax and deduction rates.', 'Net = gross − tax − social/other deductions.',
    [['g', 'Gross salary (yearly)', 'm', 60000, ''], ['t', 'Income tax rate', 'p', 18], ['s', 'Social security / pension', 'p', 7], ['o', 'Other deductions (yearly)', 'm', 0, '', { opt: 1 }]],
    [['Net salary (yearly)', 'g-g*t/100-g*s/100-o', 'm'], ['Net per month', 'o1/12', 'm'], ['Net per week', 'o1/52', 'm'], ['Total deducted', 'g-o1', 'm']], { donut: [['Net', 'o1'], ['Tax', 'g*t/100'], ['Social', 'g*s/100'], ['Other', 'o']], donutF: 'm' });

  F('net-to-gross-salary-calculator', 'Net to Gross Salary Calculator', 'tax-salary/paycheck', 'Find the gross salary needed for a target take-home pay.', 'Gross = (net + other deductions) ÷ (1 − tax% − social%).',
    [['n', 'Desired net salary (yearly)', 'm', 50000, ''], ['t', 'Income tax rate', 'p', 18], ['s', 'Social security / pension', 'p', 7], ['o', 'Other deductions (yearly)', 'm', 0, '', { opt: 1 }]],
    [['Gross salary needed', '(n+o)/(1-t/100-s/100)', 'm'], ['Gross per month', 'o1/12', 'm'], ['Tax + deductions', 'o1-n', 'm']]);

  F('salary-comparison-calculator', 'Salary Comparison Calculator', 'tax-salary/paycheck', 'Compare two job offers on pay, tax and benefits.', 'Net value = salary × (1 − tax) + bonus + benefits.',
    [['a', 'Offer A salary', 'm', 70000, ''], ['at', 'Offer A tax rate', 'p', 22], ['ab', 'Offer A bonus & benefits', 'm', 4000, '', { opt: 1 }], ['b', 'Offer B salary', 'm', 78000, ''], ['bt', 'Offer B tax rate', 'p', 28], ['bb', 'Offer B bonus & benefits', 'm', 0, '', { opt: 1 }]],
    [['Offer A value', 'a*(1-at/100)+ab', 'm', '', { k: 'va', hide: 1 }], ['Offer B value', 'b*(1-bt/100)+bb', 'm', '', { k: 'vb', hide: 1 }], ['Better offer', 'vb-va', 'b', '', { bands: [[0, 'Offer A pays more'], [Infinity, 'Offer B pays more']], main: true }], ['Offer A net value', 'va', 'm'], ['Offer B net value', 'vb', 'm'], ['Difference per year', 'abs(vb-va)', 'm', '', { hl: 1 }], ['Difference per month', 'abs(vb-va)/12', 'm']]);

  F('freelance-vs-full-time-calculator', 'Freelance vs Full-Time Calculator', 'tax-salary/paycheck', 'Find the freelance rate that matches a full-time job.', 'Freelance rate = (salary + benefits + extra costs) ÷ billable hours.',
    [['sal', 'Full-time salary', 'm', 80000, ''], ['ben', 'Value of benefits (health, PF, leave)', 'm', 12000, ''], ['cost', 'Freelance costs (tools, insurance)', 'm', 5000, ''], ['hr', 'Billable hours per week', 'n', 25], ['wk', 'Working weeks per year', 'n', 46]],
    [['Equivalent hourly rate', '(sal+ben+cost)/(hr*wk)', 'm2'], ['Annual revenue needed', 'sal+ben+cost', 'm'], ['Equivalent monthly', 'o2/12', 'm']]);

  F('contractor-rate-calculator', 'Contractor Rate Calculator', 'tax-salary/hourly-overtime', 'Convert an employee salary into a contractor day or hourly rate.', 'Rate = (salary × (1 + overhead%)) ÷ billable days.',
    [['sal', 'Employee salary', 'm', 90000, ''], ['oh', 'Overhead (leave, insurance, tax)', 'p', 35], ['days', 'Billable days per year', 'i', 220]],
    [['Day rate', 'sal*(1+oh/100)/days', 'm'], ['Hourly rate (8h)', 'o1/8', 'm2'], ['Annual contract value', 'o1*days', 'm']]);

  F('cost-of-living-comparison-calculator', 'Cost of Living Comparison Calculator', 'tax-salary/paycheck', 'How much salary you need in a new city to keep your lifestyle.', 'Needed salary = current salary × (new city index ÷ current city index).',
    [['sal', 'Current salary', 'm', 60000, ''], ['c1', 'Cost index — current city', 'n', 100, '', { help: 'Use any cost-of-living index (Numbeo, Expatistan…).' }], ['c2', 'Cost index — new city', 'n', 125]],
    [['Salary needed in new city', 'sal*c2/c1', 'm'], ['Difference', 'o1-sal', 'm'], ['Cost change', '(c2/c1-1)*100', 'p', '', { dp: 1 }]]);

  F('pay-frequency-converter', 'Pay Frequency Calculator (Weekly, Biweekly, Monthly)', 'tax-salary/hourly-overtime', 'Convert any pay amount to weekly, biweekly, semi-monthly, monthly and yearly.', 'Yearly = pay × periods per year. Then divide by the target frequency.',
    [['pay', 'Pay amount', 'm', 2500, ''], ['f', 'Per', 's', 12, [[52, 'Week'], [26, 'Two weeks'], [24, 'Half month'], [12, 'Month'], [4, 'Quarter'], [1, 'Year']]]],
    [['Yearly', 'pay*f', 'm'], ['Monthly', 'o1/12', 'm'], ['Semi-monthly', 'o1/24', 'm'], ['Biweekly', 'o1/26', 'm'], ['Weekly', 'o1/52', 'm'], ['Daily (260 days)', 'o1/260', 'm'], ['Hourly (2,080 h)', 'o1/2080', 'm2']]);

  F('time-and-a-half-calculator', 'Time and a Half Calculator', 'tax-salary/hourly-overtime', 'Overtime pay at 1.5x or double time.', 'Overtime rate = regular rate × multiplier.',
    [['r', 'Regular hourly rate', 'm', 20, ''], ['reg', 'Regular hours', 'n', 40], ['ot', 'Overtime hours', 'n', 8], ['mult', 'Multiplier', 's', 1.5, [[1.25, '1.25x'], [1.5, '1.5x (time and a half)'], [2, '2x (double time)']]]],
    [['Total pay', 'r*reg+r*mult*ot', 'm'], ['Overtime rate', 'r*mult', 'm2'], ['Overtime pay', 'r*mult*ot', 'm'], ['Regular pay', 'r*reg', 'm']]);

  F('shift-differential-calculator', 'Shift Differential Pay Calculator', 'tax-salary/hourly-overtime', 'Extra pay for night, weekend or holiday shifts.', 'Pay = hours × (rate + differential).',
    [['r', 'Base hourly rate', 'm', 18, ''], ['h', 'Hours on the special shift', 'n', 32], ['d', 'Differential', 'p', 10], ['o', 'Regular hours', 'n', 8, '', { opt: 1 }]],
    [['Total pay', 'h*r*(1+d/100)+o*r', 'm'], ['Differential pay only', 'h*r*d/100', 'm'], ['Shift hourly rate', 'r*(1+d/100)', 'm2']]);

  F('work-hours-calculator', 'Work Hours Calculator', 'tax-salary/hourly-overtime', 'Total hours and pay from start time, end time and breaks.', 'Hours = (end − start − break) per day × days.',
    [['sh', 'Start (24h, e.g. 9)', 'n', 9], ['eh', 'End (24h, e.g. 17.5)', 'n', 17.5], ['br', 'Unpaid break (minutes)', 'n', 30], ['days', 'Days per week', 'i', 5], ['r', 'Hourly rate', 'm', 22, '', { opt: 1 }]],
    [['Hours per day', 'if(eh<sh,eh+24-sh,eh-sh)-br/60', 'f', 'h', { dp: 2 }], ['Hours per week', 'o1*days', 'f', 'h', { dp: 2 }], ['Weekly pay', 'o2*r', 'm'], ['Monthly pay', 'o3*52/12', 'm']]);

  F('pto-accrual-calculator', 'PTO Accrual Calculator', 'tax-salary/hr-benefits', 'How much paid time off you earn each pay period and by year end.', 'Accrual per period = annual PTO hours ÷ pay periods.',
    [['days', 'PTO days per year', 'n', 15], ['hpd', 'Hours per day', 'n', 8], ['pp', 'Pay periods per year', 's', 26, [[52, 'Weekly'], [26, 'Biweekly'], [24, 'Semi-monthly'], [12, 'Monthly']]], ['used', 'Hours already used', 'n', 0, '', { opt: 1 }]],
    [['Accrual per pay period', 'days*hpd/pp', 'f', 'h', { dp: 2 }], ['Annual PTO hours', 'days*hpd', 'f', 'h', { dp: 1 }], ['Hours remaining', 'max(0,days*hpd-used)', 'f', 'h', { dp: 1 }], ['Days remaining', 'o3/hpd', 'f', 'days', { dp: 1 }]]);

  F('holiday-pay-calculator', 'Holiday Pay Calculator', 'tax-salary/hr-benefits', 'Pay for working on a public holiday.', 'Holiday pay = hours × hourly rate × multiplier.',
    [['r', 'Hourly rate', 'm', 20, ''], ['h', 'Hours worked', 'n', 8], ['m', 'Holiday multiplier', 's', 1.5, [[1, '1x (normal)'], [1.5, '1.5x'], [2, '2x'], [2.5, '2.5x']]], ['paid', 'Also paid for the day off', 'c', 0, '']],
    [['Holiday pay', 'r*h*m+paid*r*h', 'm'], ['Extra over normal pay', 'r*h*(m-1)+paid*r*h', 'm']]);

  F('leave-encashment-calculator-india', 'Leave Encashment Calculator (India)', 'tax-salary/hr-benefits', 'Money you get for unused earned leave, with tax-free limit on retirement.', 'Encashment = (basic + DA) ÷ 30 × leave days. Tax-free up to ₹25 lakh at retirement.',
    [['b', 'Monthly basic + DA', 'm', 60000, '', { local: { IN: 60000 } }], ['d', 'Leave days to encash', 'i', 90]],
    [['Leave encashment', 'b/30*d', 'm'], ['Per day', 'b/30', 'm'], ['Tax-free portion at retirement', 'min(o1,2500000)', 'm']]);

  F('notice-period-buyout-calculator', 'Notice Period Buyout Calculator', 'tax-salary/hr-benefits', 'Cost of buying out your notice period or the pay due for it.', 'Buyout = monthly gross ÷ 30 × days of notice not served.',
    [['sal', 'Monthly gross salary', 'm', 5000, '', { local: { IN: 80000 } }], ['np', 'Notice period (days)', 'i', 60], ['served', 'Days already served', 'i', 15]],
    [['Buyout amount', 'sal/30*max(0,np-served)', 'm'], ['Days to buy out', 'max(0,np-served)', 'i'], ['Per day', 'sal/30', 'm']]);

  F('severance-pay-calculator', 'Severance Pay Calculator', 'tax-salary/hr-benefits', 'Estimate severance from years of service and weekly pay.', 'Severance = weekly pay × weeks per year of service × years.',
    [['w', 'Weekly pay', 'm', 1400, ''], ['y', 'Years of service', 'n', 6], ['wk', 'Weeks per year of service', 'n', 2, '', { help: 'Common company policy is 1–2 weeks per year.' }], ['pn', 'Pay in lieu of notice (weeks)', 'n', 0, '', { opt: 1 }]],
    [['Severance pay', 'w*wk*y+w*pn', 'm'], ['Equivalent in months', 'o1/w/4.345', 'f', 'months', { dp: 1 }]]);

  F('esi-calculator-india', 'ESI Contribution Calculator (India)', 'tax-salary/hr-benefits', 'Employee State Insurance contribution for employee and employer.', 'Employee 0.75% and employer 3.25% of gross wages (wage ceiling ₹21,000/month).',
    [['g', 'Monthly gross wages', 'm', 20000, '', { local: { IN: 20000 } }]],
    [['Eligible?', 'g-21000', 'b', '', { bands: [[0.0001, 'Yes — ESI applies'], [Infinity, 'No — above ₹21,000']] }], ['Employee share (0.75%)', 'if(g<=21000,g*0.0075,0)', 'm'], ['Employer share (3.25%)', 'if(g<=21000,g*0.0325,0)', 'm'], ['Total ESI', 'o2+o3', 'm']]);

  CW.setCur(['us-federal-income-tax-calculator', 'us-tax-bracket-calculator', 'self-employment-tax-calculator', 'quarterly-estimated-tax-calculator', 'federal-tax-refund-calculator', 'estate-tax-calculator', 'gift-tax-calculator', 'bonus-tax-calculator', 'state-income-tax-calculator'], 'USD');
  CW.setCur(['uk-stamp-duty-calculator', 'uk-student-loan-repayment-calculator', 'uk-inheritance-tax-calculator'], 'GBP');
  CW.setCur(['canada-income-tax-calculator'], 'CAD');
  CW.setCur(['australia-income-tax-calculator'], 'AUD');
  CW.setCur(['capital-gains-tax-india-calculator', 'tds-calculator-india', 'advance-tax-calculator-india', 'gst-late-fee-calculator-india', 'presumptive-tax-44ada-calculator', 'section-80c-calculator', 'crypto-tax-india-calculator', 'ctc-to-in-hand-salary-calculator', 'leave-encashment-calculator-india', 'esi-calculator-india'], 'INR', 'IN');
})(window.CW);
