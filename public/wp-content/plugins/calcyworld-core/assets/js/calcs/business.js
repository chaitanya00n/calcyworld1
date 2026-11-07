/* Calcyworld — Business, commerce, creators, currency & crypto */
(function (CW) {
  'use strict';
  var r = function (l, v, f, x) { var o = { l: l, v: v, f: f || 'money' }; if (x) for (var k in x) o[k] = x[k]; return o; };
  var M = function (l, v, f, x) { x = x || {}; x.main = true; return r(l, v, f, x); };

  var curNames = (function () { try { return new Intl.DisplayNames(['en'], { type: 'currency' }); } catch (e) { return null; } })();
  function currencyOptions() {
    var rates = (CW.cfg.rates && CW.cfg.rates.rates) || {}, keys = Object.keys(rates);
    if (!keys.length) keys = CW.countries.map(function (c) { return c.cur; });
    var seen = {}; keys = keys.filter(function (k) { if (seen[k]) return false; seen[k] = 1; return true; }).sort();
    return keys.map(function (k) { var n = curNames ? curNames.of(k) : k; return [k, k + ' — ' + (n || k)]; });
  }
  var COINS = [['bitcoin', 'Bitcoin (BTC)'], ['ethereum', 'Ethereum (ETH)'], ['tether', 'Tether (USDT)'], ['binancecoin', 'BNB'], ['solana', 'Solana (SOL)'],
    ['ripple', 'XRP'], ['usd-coin', 'USD Coin (USDC)'], ['cardano', 'Cardano (ADA)'], ['dogecoin', 'Dogecoin (DOGE)'], ['tron', 'TRON (TRX)'],
    ['polkadot', 'Polkadot (DOT)'], ['litecoin', 'Litecoin (LTC)'], ['chainlink', 'Chainlink (LINK)'], ['avalanche-2', 'Avalanche (AVAX)'], ['shiba-inu', 'Shiba Inu (SHIB)']];

  CW.register([
  {
    id: 'currency-converter', title: 'Currency Converter', sec: 'business', sub: 'Crypto & Currency', pop: 1,
    desc: 'Convert between 160+ world currencies with exchange rates that update automatically every day.',
    formula: 'Converted amount = amount ÷ rate(from) × rate(to), with both rates quoted against the US dollar.',
    faq: [['How often are rates updated?', 'Rates refresh automatically from a reference data feed, usually daily. The time of the last update is shown under the result.'],
      ['Is this the rate my bank will give me?', 'No. These are mid-market reference rates. Banks and money transfer services add a margin or fee, so the rate you receive is usually a little worse.']],
    inputs: [{ k: 'a', l: 'Amount', t: 'number', v: 100 }, { k: 'f', l: 'From', t: 'select', v: function (c) { return c.cur === 'USD' ? 'EUR' : 'USD'; }, o: currencyOptions },
      { k: 't', l: 'To', t: 'select', v: function (c) { return c.cur; }, o: currencyOptions }],
    calc: function (v) {
      var x = CW.convert(v.a, v.f, v.t), one = CW.convert(1, v.f, v.t), back = CW.convert(1, v.t, v.f);
      if (x === null) return { error: 'Live rates are not available right now. Please try again shortly.' };
      var ts = CW.cfg.rates && CW.cfg.rates.time ? new Date(CW.cfg.rates.time * 1000) : null;
      var quick = [1, 10, 100, 1000, 10000].map(function (n) { return [CW.fmt.money(n, v.f), CW.fmt.money(n * one, v.t, 2)]; });
      return { results: [M(CW.fmt.money(v.a, v.f, 2) + ' =', x, 'money2', { cur: v.t, words: false }), r('1 ' + v.f, one, 'num', { u: v.t, dp: 6 }), r('1 ' + v.t, back, 'num', { u: v.f, dp: 6 })],
        table: { open: true, title: 'Quick conversions', head: [v.f, v.t], fmt: ['text', 'text'], rows: quick },
        note: 'Mid-market reference rate' + (ts ? ', updated ' + ts.toLocaleString(CW.locale()) : '') + '. ' + (CW.cfg.ratesCredit || '') };
    }
  },
  {
    id: 'crypto-converter', title: 'Crypto Converter', sec: 'business', sub: 'Crypto & Currency', pop: 1,
    desc: 'Convert Bitcoin, Ethereum and other top cryptocurrencies into your local currency at automatically updated prices.',
    formula: 'Value = coins × coin price in USD ÷ USD rate of your currency.',
    inputs: [{ k: 'a', l: 'Amount of coin', t: 'number', v: 1 }, { k: 'c', l: 'Coin', t: 'select', v: 'bitcoin', o: COINS }, { k: 't', l: 'Currency', t: 'select', v: function (c) { return c.cur; }, o: currencyOptions }],
    calc: function (v) {
      var p = CW.cfg.crypto && CW.cfg.crypto[v.c] && CW.cfg.crypto[v.c].usd;
      if (!p) return { error: 'Live crypto prices are not available right now.' };
      var usd = v.a * p, x = CW.convert(usd, 'USD', v.t);
      return { results: [M('Value', x, 'money2', { cur: v.t, words: false }), r('Price per coin', CW.convert(p, 'USD', v.t), 'money2', { cur: v.t }), r('Value in USD', usd, 'money2', { cur: 'USD' })],
        note: 'Crypto prices move every second; this price refreshes automatically several times a day.' };
    }
  },
  {
    id: 'crypto-profit-calculator', title: 'Crypto Profit Calculator', sec: 'business', sub: 'Crypto & Currency',
    desc: 'Calculate profit or loss on a crypto trade after buy and sell fees.',
    formula: 'Profit = (sell price × coins − sell fee) − (buy price × coins + buy fee).',
    inputs: [{ k: 'inv', l: 'Amount invested', t: 'money', v: 1000 }, { k: 'bp', l: 'Buy price per coin', t: 'money', v: 50000 }, { k: 'sp', l: 'Sell price per coin', t: 'money', v: 60000 }, { k: 'fee', l: 'Fees (each side)', t: 'percent', v: 0.1 }],
    calc: function (v) { var coins = v.inv * (1 - v.fee / 100) / v.bp, out = coins * v.sp * (1 - v.fee / 100);
      return { results: [M('Profit / loss', out - v.inv), r('Return', (out - v.inv) / v.inv * 100, 'pct'), r('Coins bought', coins, 'num', { dp: 8 }), r('Sale value', out)] }; }
  },
  {
    id: 'profit-margin-calculator', title: 'Profit Margin Calculator', sec: 'business', sub: 'Business & Accounting', pop: 1,
    desc: 'Find gross profit, profit margin and markup from cost and selling price.',
    formula: 'Profit = revenue − cost. Margin = profit ÷ revenue × 100. Markup = profit ÷ cost × 100.',
    inputs: [{ k: 'c', l: 'Cost', t: 'money', v: 60 }, { k: 'p', l: 'Selling price (revenue)', t: 'money', v: 100 }],
    calc: function (v) { var pr = v.p - v.c; return { results: [M('Profit margin', pr / v.p * 100, 'pct'), r('Gross profit', pr), r('Markup', pr / v.c * 100, 'pct')] }; }
  },
  {
    id: 'markup-calculator', title: 'Markup Calculator', sec: 'business', sub: 'Business & Accounting', pop: 1,
    desc: 'Set a selling price from cost and markup %, and see the resulting profit margin.',
    formula: 'Price = cost × (1 + markup %). Margin = (price − cost) ÷ price.',
    inputs: [{ k: 'c', l: 'Cost', t: 'money', v: 50 }, { k: 'm', l: 'Markup', t: 'percent', v: 40 }],
    calc: function (v) { var p = v.c * (1 + v.m / 100); return { results: [M('Selling price', p), r('Profit', p - v.c), r('Profit margin', (p - v.c) / p * 100, 'pct')] }; }
  },
  {
    id: 'break-even-calculator', title: 'Break-Even Calculator', sec: 'business', sub: 'Business & Accounting', pop: 1,
    desc: 'Find how many units you must sell — and how much revenue you need — to cover your costs.',
    formula: 'Break-even units = fixed costs ÷ (price per unit − variable cost per unit).',
    inputs: [{ k: 'f', l: 'Fixed costs (per month)', t: 'money', v: 10000 }, { k: 'p', l: 'Price per unit', t: 'money', v: 50 }, { k: 'vc', l: 'Variable cost per unit', t: 'money', v: 30 }],
    calc: function (v) { var cm = v.p - v.vc; if (cm <= 0) return { error: 'Price must be higher than the variable cost per unit.' };
      var u = v.f / cm; return { results: [M('Break-even units', Math.ceil(u), 'int'), r('Break-even revenue', Math.ceil(u) * v.p), r('Contribution margin per unit', cm), r('Contribution margin ratio', cm / v.p * 100, 'pct')] }; }
  },
  {
    id: 'commission-calculator', title: 'Commission Calculator', sec: 'business', sub: 'Business & Accounting',
    desc: 'Calculate sales commission on a deal, plus total earnings with a base salary.',
    formula: 'Commission = sale amount × commission rate ÷ 100.',
    inputs: [{ k: 's', l: 'Sale amount', t: 'money', v: 25000 }, { k: 'c', l: 'Commission rate', t: 'percent', v: 5 }, { k: 'b', l: 'Base pay (optional)', t: 'money', v: 0, opt: 1 }],
    calc: function (v) { var c = v.s * v.c / 100; return { results: [M('Commission', c), r('Total earnings', c + v.b)] }; }
  },
  {
    id: 'ecommerce-profit-calculator', title: 'E-commerce Seller Profit Calculator', sec: 'business', sub: 'E-Commerce & Seller Tools', pop: 1,
    desc: 'Work out your real profit per order on Amazon, Flipkart, Meesho, Shopify, Etsy or eBay after commission, fees, shipping, ads and tax.',
    formula: 'Profit = selling price − tax in price − product cost − commission − fixed fee − payment fee − shipping − ad cost per order.',
    faq: [['Where do I find the marketplace fees?', 'Each marketplace publishes a fee or rate card in its seller centre. Fees vary by category and change, so enter the current rates for your category.']],
    inputs: [{ k: 'sp', l: 'Selling price (incl. tax)', t: 'money', v: 40, local: { IN: 999 } }, { k: 'cost', l: 'Product cost', t: 'money', v: 15, local: { IN: 350 } },
      { k: 'com', l: 'Marketplace commission', t: 'percent', v: 15 }, { k: 'fix', l: 'Fixed / closing fee per order', t: 'money', v: 1, local: { IN: 20 }, opt: 1 },
      { k: 'pg', l: 'Payment / gateway fee', t: 'percent', v: 2, opt: 1 }, { k: 'ship', l: 'Shipping per order', t: 'money', v: 5, local: { IN: 70 }, opt: 1 },
      { k: 'ads', l: 'Ad cost per order', t: 'money', v: 3, local: { IN: 60 }, opt: 1 }, { k: 'tax', l: 'GST / VAT in selling price', t: 'percent', v: function (c) { return c.country.code === 'IN' ? 5 : 0; }, opt: 1 }],
    calc: function (v) {
      var taxAmt = v.sp - v.sp / (1 + v.tax / 100), fees = v.sp * v.com / 100 + v.fix + v.sp * v.pg / 100;
      var profit = v.sp - taxAmt - v.cost - fees - v.ship - v.ads;
      return { results: [M('Profit per order', profit), r('Profit margin', profit / v.sp * 100, 'pct'), r('Return on product cost', profit / v.cost * 100, 'pct'), r('Marketplace fees', fees), r('Tax in price', taxAmt)],
        chart: { type: 'donut', f: 'money', data: [{ l: 'Product cost', v: v.cost }, { l: 'Fees', v: fees }, { l: 'Shipping + ads', v: v.ship + v.ads }, { l: 'Tax', v: taxAmt }, { l: 'Profit', v: Math.max(0, profit) }] },
        badge: profit < 0 ? { t: 'Loss-making at this price', tone: 'warn' } : null };
    }
  },
  {
    id: 'roas-calculator', title: 'ROAS & Ad Metrics Calculator', sec: 'business', sub: 'Marketing & Advertising',
    desc: 'Calculate ROAS, CPM, CPC, CTR, CPA and conversion rate from your ad spend and campaign results.',
    formula: 'ROAS = revenue ÷ spend. CPM = spend ÷ impressions × 1000. CPC = spend ÷ clicks. CTR = clicks ÷ impressions. CPA = spend ÷ conversions.',
    inputs: [{ k: 's', l: 'Ad spend', t: 'money', v: 1000 }, { k: 'rev', l: 'Revenue from ads', t: 'money', v: 3500, opt: 1 }, { k: 'imp', l: 'Impressions', t: 'int', v: 100000 },
      { k: 'cl', l: 'Clicks', t: 'int', v: 1500 }, { k: 'cv', l: 'Conversions', t: 'int', v: 60 }],
    calc: function (v) { return { results: [M('ROAS', v.rev / v.s, 'num', { dp: 2, u: '×' }), r('CPM', v.s / v.imp * 1000, 'money2'), r('CPC', v.s / v.cl, 'money2'), r('CTR', v.cl / v.imp * 100, 'pct'),
      r('Cost per acquisition', v.s / v.cv, 'money2'), r('Conversion rate', v.cv / v.cl * 100, 'pct'), r('Profit after ad cost', v.rev - v.s)] }; }
  },
  {
    id: 'burn-rate-runway-calculator', title: 'Burn Rate & Runway Calculator', sec: 'business', sub: 'Startup & SaaS Metrics',
    desc: 'Find your startup’s net monthly burn and how many months of runway your cash gives you.',
    formula: 'Net burn = monthly expenses − monthly revenue. Runway = cash ÷ net burn.',
    inputs: [{ k: 'cash', l: 'Cash in bank', t: 'money', v: 500000 }, { k: 'exp', l: 'Monthly expenses', t: 'money', v: 60000 }, { k: 'rev', l: 'Monthly revenue', t: 'money', v: 15000, opt: 1 }],
    calc: function (v) { var b = v.exp - v.rev; if (b <= 0) return { results: [M('Net burn', b), r('Runway', 'Profitable — no burn', 'text')] };
      var m = v.cash / b, d = new Date(); d.setMonth(d.getMonth() + Math.floor(m));
      return { results: [M('Runway', m, 'num', { dp: 1, u: 'months' }), r('Net monthly burn', b), r('Cash runs out around', d, 'date')], badge: m < 6 ? { t: 'Under 6 months — start fundraising or cut costs', tone: 'warn' } : m < 12 ? { t: '6–12 months', tone: 'mid' } : { t: '12+ months of runway', tone: 'ok' } }; }
  },
  {
    id: 'ltv-cac-calculator', title: 'LTV to CAC Calculator', sec: 'business', sub: 'Startup & SaaS Metrics',
    desc: 'Calculate customer lifetime value, the LTV:CAC ratio and the CAC payback period for a subscription business.',
    formula: 'LTV = ARPU × gross margin ÷ monthly churn. Payback = CAC ÷ (ARPU × gross margin).',
    inputs: [{ k: 'arpu', l: 'Average revenue per customer (monthly)', t: 'money', v: 50 }, { k: 'gm', l: 'Gross margin', t: 'percent', v: 80 }, { k: 'ch', l: 'Monthly churn', t: 'percent', v: 3 }, { k: 'cac', l: 'Customer acquisition cost', t: 'money', v: 400 }],
    calc: function (v) { var gp = v.arpu * v.gm / 100, ltv = gp / (v.ch / 100), ratio = ltv / v.cac;
      return { results: [M('LTV : CAC', ratio, 'num', { dp: 2, u: ': 1' }), r('Customer lifetime value', ltv), r('CAC payback', v.cac / gp, 'num', { dp: 1, u: 'months' }), r('Average lifetime', 1 / (v.ch / 100), 'num', { dp: 1, u: 'months' })],
        badge: ratio >= 3 ? { t: 'Healthy (3:1 or better)', tone: 'ok' } : ratio >= 1 ? { t: 'Below the 3:1 benchmark', tone: 'mid' } : { t: 'Losing money on each customer', tone: 'warn' } }; }
  },
  {
    id: 'churn-rate-calculator', title: 'Churn Rate Calculator', sec: 'business', sub: 'Startup & SaaS Metrics',
    desc: 'Calculate customer churn and retention rates for a period.',
    formula: 'Churn rate = customers lost ÷ customers at start × 100.',
    inputs: [{ k: 's', l: 'Customers at start', t: 'int', v: 1000 }, { k: 'l', l: 'Customers lost', t: 'int', v: 40 }, { k: 'n', l: 'New customers', t: 'int', v: 90, opt: 1 }],
    calc: function (v) { var c = v.l / v.s * 100; return { results: [M('Churn rate', c, 'pct'), r('Retention rate', 100 - c, 'pct'), r('Customers at end', v.s - v.l + v.n, 'int'), r('Net growth', (v.n - v.l) / v.s * 100, 'pct')] }; }
  },
  {
    id: 'freelance-rate-calculator', title: 'Freelance Hourly Rate Calculator', sec: 'business', sub: 'Creator, Freelance & Gig Economy',
    desc: 'Work out the hourly rate you need to charge as a freelancer to hit your income goal after expenses, tax and time off.',
    formula: 'Rate = (target income + expenses) ÷ (1 − tax rate) ÷ billable hours per year.',
    inputs: [{ k: 'inc', l: 'Target take-home income (yearly)', t: 'money', v: 60000, local: { IN: 1200000 } }, { k: 'exp', l: 'Business expenses (yearly)', t: 'money', v: 6000, local: { IN: 100000 } },
      { k: 'tax', l: 'Tax rate', t: 'percent', v: 25 }, { k: 'hw', l: 'Billable hours per week', t: 'number', v: 25 }, { k: 'off', l: 'Weeks off per year', t: 'number', v: 6 }],
    calc: function (v) { var hrs = v.hw * (52 - v.off), need = (v.inc + v.exp) / (1 - v.tax / 100), rate = need / hrs;
      return { results: [M('Minimum hourly rate', rate), r('Day rate (8 h)', rate * 8), r('Revenue needed', need), r('Billable hours per year', hrs, 'int')] }; }
  },
  {
    id: 'youtube-earnings-calculator', title: 'YouTube Earnings Calculator', sec: 'business', sub: 'Creator, Freelance & Gig Economy', pop: 1,
    desc: 'Estimate how much a YouTube channel can earn from ads based on views and RPM.',
    formula: 'Earnings = views ÷ 1000 × RPM. RPM is what you actually receive per 1,000 views after YouTube’s share.',
    faq: [['What is a typical YouTube RPM?', 'It varies widely by audience country and niche — often under $1 for some regions and $3–$10+ for finance, tech and business audiences in the US, UK and similar markets.']],
    inputs: [{ k: 'v', l: 'Daily views', t: 'int', v: 10000 }, { k: 'rpm', l: 'RPM (earnings per 1,000 views)', t: 'money', v: 2, local: { IN: 40 } }, { k: 'mon', l: 'Monetized views', t: 'percent', v: 60 }],
    calc: function (v) { var d = v.v * v.mon / 100 / 1000 * v.rpm;
      return { results: [M('Estimated monthly earnings', d * 30), r('Per day', d), r('Per year', d * 365)], note: 'Estimates only — actual earnings depend on audience location, niche, season and ad demand.' }; }
  },
  {
    id: 'instagram-earnings-calculator', title: 'Instagram Earnings Calculator', sec: 'business', sub: 'Creator, Freelance & Gig Economy',
    desc: 'Estimate what you could charge per sponsored Instagram post from your followers and engagement rate.',
    formula: 'Estimated post price ≈ engaged followers × rate per engagement. Engaged followers = followers × engagement rate.',
    inputs: [{ k: 'f', l: 'Followers', t: 'int', v: 50000 }, { k: 'er', l: 'Engagement rate', t: 'percent', v: 3 }, { k: 'cpe', l: 'Rate per engagement', t: 'money', v: 0.12, local: { IN: 3 } }],
    calc: function (v) { var eng = v.f * v.er / 100, p = eng * v.cpe;
      return { results: [M('Estimated price per post', p), r('Range', CW.fmt.money(p * 0.7) + ' – ' + CW.fmt.money(p * 1.4), 'text'), r('Engaged followers per post', eng, 'int'), r('Story (approx.)', p * 0.4)], note: 'Brand deals vary a lot by niche, audience country and content quality; use this as a starting point.' }; }
  },
  {
    id: 'rental-yield-calculator', title: 'Rental Yield Calculator', sec: 'business', sub: 'Real Estate & Property', pop: 1,
    desc: 'Calculate gross and net rental yield on a property from rent, expenses and price.',
    formula: 'Gross yield = annual rent ÷ property value × 100. Net yield = (annual rent − annual costs) ÷ property value × 100.',
    inputs: [{ k: 'val', l: 'Property price', t: 'money', v: 300000, local: { IN: 8000000 } }, { k: 'rent', l: 'Monthly rent', t: 'money', v: 1500, local: { IN: 25000 } },
      { k: 'cost', l: 'Annual costs (maintenance, tax, insurance)', t: 'money', v: 3000, local: { IN: 40000 }, opt: 1 }, { k: 'vac', l: 'Vacancy', t: 'percent', v: 5, opt: 1 }],
    calc: function (v) { var a = v.rent * 12 * (1 - v.vac / 100);
      return { results: [M('Net rental yield', (a - v.cost) / v.val * 100, 'pct'), r('Gross rental yield', v.rent * 12 / v.val * 100, 'pct'), r('Annual net income', a - v.cost), r('Price-to-rent ratio', v.val / (v.rent * 12), 'num', { dp: 1 })] }; }
  },
  {
    id: 'cap-rate-calculator', title: 'Cap Rate Calculator', sec: 'business', sub: 'Real Estate & Property',
    desc: 'Calculate the capitalization rate of an investment property from its net operating income.',
    formula: 'Cap rate = net operating income ÷ property value × 100.',
    inputs: [{ k: 'noi', l: 'Net operating income (yearly)', t: 'money', v: 24000 }, { k: 'val', l: 'Property value', t: 'money', v: 400000 }],
    calc: function (v) { return { results: [M('Cap rate', v.noi / v.val * 100, 'pct')] }; }
  },
  {
    id: 'stock-profit-calculator', title: 'Stock Profit Calculator', sec: 'finance', sub: 'Investment & Stock Market',
    desc: 'Calculate profit or loss and percentage return on a share trade, including brokerage and charges.',
    formula: 'Profit = (sell price − buy price) × quantity − charges.',
    inputs: [{ k: 'b', l: 'Buy price', t: 'money', v: 100 }, { k: 's', l: 'Sell price', t: 'money', v: 125 }, { k: 'q', l: 'Quantity', t: 'int', v: 50 }, { k: 'c', l: 'Total charges', t: 'money', v: 10, opt: 1 }],
    calc: function (v) { var p = (v.s - v.b) * v.q - v.c; return { results: [M('Net profit / loss', p), r('Return', p / (v.b * v.q) * 100, 'pct'), r('Invested', v.b * v.q), r('Sale value', v.s * v.q)] }; }
  },
  {
    id: 'average-stock-price-calculator', title: 'Average Stock Price Calculator', sec: 'finance', sub: 'Investment & Stock Market',
    desc: 'Find your average buy price across multiple purchases (cost averaging), and your profit at today’s price.',
    formula: 'Average price = Σ(quantity × price) ÷ Σ quantity.',
    inputs: [{ k: 'rows', l: 'Purchases', t: 'rows', add: 'Add purchase', cols: [{ l: 'Quantity', t: 'number' }, { l: 'Price', t: 'number' }], v: [[10, 120], [15, 95], [20, 80]] },
      { k: 'cur', l: 'Current price (optional)', t: 'money', v: 100, opt: 1 }],
    calc: function (v) { var q = 0, c = 0; v.rows.forEach(function (x) { if (!isNaN(x[0]) && !isNaN(x[1])) { q += x[0]; c += x[0] * x[1]; } });
      if (!q) return { error: 'Add at least one purchase.' }; var avg = c / q, val = q * v.cur;
      return { results: [M('Average buy price', avg, 'money2'), r('Total shares', q, 'num'), r('Total invested', c), r('Current value', v.cur ? val : NaN), r('Profit / loss', v.cur ? val - c : NaN)] }; }
  },
  {
    id: 'dividend-yield-calculator', title: 'Dividend Yield Calculator', sec: 'finance', sub: 'Investment & Stock Market',
    desc: 'Calculate dividend yield and the yearly income from your shareholding.',
    formula: 'Dividend yield = annual dividend per share ÷ share price × 100.',
    inputs: [{ k: 'd', l: 'Annual dividend per share', t: 'money', v: 3 }, { k: 'p', l: 'Share price', t: 'money', v: 75 }, { k: 'q', l: 'Shares owned', t: 'int', v: 100, opt: 1 }],
    calc: function (v) { return { results: [M('Dividend yield', v.d / v.p * 100, 'pct'), r('Yearly dividend income', v.d * v.q), r('Monthly (average)', v.d * v.q / 12)] }; }
  }
  ]);
})(window.CW);
