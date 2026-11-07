/* Calcyworld — Computing, internet, AI & photography tools */
(function (CW) {
  'use strict';
  var r = function (l, v, f, x) { var o = { l: l, v: v, f: f || 'num' }; if (x) for (var k in x) o[k] = x[k]; return o; };
  var M = function (l, v, f, x) { x = x || {}; x.main = true; return r(l, v, f, x); };
  function ipToInt(s) { var p = String(s).trim().split('.'); if (p.length !== 4) return null; var n = 0; for (var i = 0; i < 4; i++) { var x = +p[i]; if (!/^\d+$/.test(p[i]) || x > 255) return null; n = n * 256 + x; } return n; }
  function intToIp(n) { return [n >>> 24 & 255, n >>> 16 & 255, n >>> 8 & 255, n & 255].join('.'); }
  function tokens(t) { var words = (t.match(/\S+/g) || []).length, chars = t.length; return Math.round((chars / 4 + words * 4 / 3) / 2); }

  CW.register([
  {
    id: 'ai-token-counter', title: 'AI Token Counter (GPT, Claude, Gemini)', sec: 'technology', sub: 'AI & LLM Tools', pop: 1,
    desc: 'Paste a prompt or document to estimate how many AI tokens it uses, how much of a context window it fills, and what it costs to send.',
    formula: 'For English text, 1 token ≈ 4 characters ≈ ¾ of a word. The estimate averages both rules; exact counts depend on each model’s tokenizer.',
    inputs: [{ k: 't', l: 'Your text', t: 'textarea', rows: 8, wide: 1, v: '', ph: 'Paste your prompt, document or code…' }, { k: 'ctx', l: 'Context window', t: 'select', v: '200000', o: [['8192', '8K'], ['32768', '32K'], ['128000', '128K'], ['200000', '200K'], ['1000000', '1M']] },
      { k: 'p', l: 'Input price per 1M tokens', t: 'money', v: 3, local: {} }],
    calc: function (v) { var n = tokens(v.t || ''); return { results: [M('Estimated tokens', n, 'int'), r('Words', ((v.t || '').match(/\S+/g) || []).length, 'int'), r('Characters', (v.t || '').length, 'int'), r('Context used', n / +v.ctx * 100, 'pct'), r('Input cost', n / 1e6 * v.p, 'money2')] }; }
  },
  {
    id: 'ai-api-cost-calculator', title: 'AI API Cost Calculator (LLM Pricing)', sec: 'technology', sub: 'AI & LLM Tools', pop: 1,
    desc: 'Estimate the cost per request, per day and per month of using any LLM API, including prompt caching and batch discounts.',
    formula: 'Cost per request = input tokens × input price + output tokens × output price (prices per 1M tokens). Cached input is billed at the cached rate.',
    faq: [['Where do I get current model prices?', 'From your provider’s official pricing page. AI prices change often, so the price fields here are editable — enter the current input and output price for the model you use.']],
    inputs: [{ k: 'in', l: 'Input tokens per request', t: 'int', v: 2000 }, { k: 'out', l: 'Output tokens per request', t: 'int', v: 500 }, { k: 'rq', l: 'Requests per day', t: 'int', v: 1000 },
      { k: 'pi', l: 'Input price (per 1M tokens)', t: 'money', v: 3, local: {} }, { k: 'po', l: 'Output price (per 1M tokens)', t: 'money', v: 15, local: {} },
      { k: 'cache', l: 'Share of input from cache', t: 'percent', v: 0, opt: 1 }, { k: 'cp', l: 'Cached input price vs normal', t: 'percent', v: 10, opt: 1 }, { k: 'batch', l: 'Batch discount', t: 'percent', v: 0, opt: 1 }],
    calc: function (v) { var inC = v.in * (1 - v.cache / 100) * v.pi / 1e6 + v.in * v.cache / 100 * v.pi * v.cp / 100 / 1e6, outC = v.out * v.po / 1e6, per = (inC + outC) * (1 - v.batch / 100);
      return { results: [M('Monthly cost', per * v.rq * 30, 'money'), r('Per request', per, 'money2', { dp: 6 }), r('Per day', per * v.rq, 'money'), r('Per 1,000 requests', per * 1000, 'money'), r('Tokens per month', (v.in + v.out) * v.rq * 30, 'int')],
        chart: { type: 'donut', f: 'money2', data: [{ l: 'Input', v: inC * v.rq * 30 }, { l: 'Output', v: outC * v.rq * 30 }] }, note: 'Prices are entered by you — check your provider’s current price list.' }; }
  },
  {
    id: 'ip-subnet-calculator', title: 'IP Subnet Calculator', sec: 'technology', sub: 'Computing & Internet',
    desc: 'Calculate the network address, broadcast, usable host range, subnet mask and wildcard for any IPv4 address and CIDR prefix.',
    formula: 'Mask = 32 − prefix zeros. Network = IP AND mask. Broadcast = network OR NOT mask. Usable hosts = 2^(32 − prefix) − 2.',
    inputs: [{ k: 'ip', l: 'IP address', t: 'text', v: '192.168.1.130' }, { k: 'cidr', l: 'Prefix (CIDR)', t: 'select', v: '24', o: Array.from({ length: 32 }, function (_, i) { return [String(32 - i), '/' + (32 - i)]; }) }],
    calc: function (v) { var ip = ipToInt(v.ip); if (ip === null) return { error: 'Enter a valid IPv4 address, e.g. 10.0.0.1' };
      var p = +v.cidr, mask = p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0, net = (ip & mask) >>> 0, bc = (net | ~mask) >>> 0, hosts = p >= 31 ? Math.pow(2, 32 - p) : Math.pow(2, 32 - p) - 2;
      return { results: [M('Network', intToIp(net) + '/' + p, 'text'), r('Subnet mask', intToIp(mask), 'text'), r('Wildcard mask', intToIp(~mask >>> 0), 'text'), r('Broadcast', intToIp(bc), 'text'),
        r('Usable host range', p >= 31 ? intToIp(net) + ' – ' + intToIp(bc) : intToIp(net + 1) + ' – ' + intToIp(bc - 1), 'text'), r('Usable hosts', hosts, 'int'), r('IP class', ip >>> 24 < 128 ? 'A' : ip >>> 24 < 192 ? 'B' : ip >>> 24 < 224 ? 'C' : 'D/E', 'text')] }; }
  },
  {
    id: 'download-time-calculator', title: 'Download Time Calculator', sec: 'technology', sub: 'Computing & Internet',
    desc: 'Estimate how long a file takes to download or upload at a given internet speed.',
    formula: 'Time = file size (bits) ÷ speed (bits per second). 1 byte = 8 bits.',
    inputs: [{ k: 's', l: 'File size', t: 'number', v: 5 }, { k: 'su', l: 'Size unit', t: 'select', v: '1e9', o: [['1e6', 'MB'], ['1e9', 'GB'], ['1e12', 'TB']] },
      { k: 'b', l: 'Internet speed', t: 'number', v: 100 }, { k: 'bu', l: 'Speed unit', t: 'select', v: '1e6', o: [['1e3', 'Kbps'], ['1e6', 'Mbps'], ['1e9', 'Gbps']] }, { k: 'eff', l: 'Real-world efficiency', t: 'percent', v: 90 }],
    calc: function (v) { var sec = v.s * +v.su * 8 / (v.b * +v.bu * v.eff / 100), h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = Math.round(sec % 60);
      return { results: [M('Download time', (h ? h + ' h ' : '') + (m ? m + ' min ' : '') + s + ' s', 'text'), r('Total seconds', sec, 'num', { dp: 1 })] }; }
  },
  {
    id: 'aspect-ratio-calculator', title: 'Aspect Ratio Calculator', sec: 'technology', sub: 'Photography & Video',
    desc: 'Find the aspect ratio of any resolution, or calculate a missing width or height while keeping the ratio.',
    formula: 'Ratio = width : height ÷ GCD. New height = new width × original height ÷ original width.',
    inputs: [{ k: 'w', l: 'Width', t: 'int', v: 1920, u: 'px' }, { k: 'h', l: 'Height', t: 'int', v: 1080, u: 'px' }, { k: 'nw', l: 'New width (optional)', t: 'int', v: 1280, u: 'px', opt: 1 }],
    calc: function (v) { var g = CW.mathx ? CW.mathx.gcd(v.w, v.h) : 1;
      return { results: [M('Aspect ratio', (v.w / g) + ' : ' + (v.h / g), 'text'), r('Decimal', v.w / v.h, 'num', { dp: 4 }), r('New height for new width', v.nw ? Math.round(v.nw * v.h / v.w) : NaN, 'int', { u: 'px' }), r('Megapixels', v.w * v.h / 1e6, 'num', { dp: 2 })] }; }
  },
  {
    id: 'color-converter', title: 'Color Converter (HEX, RGB, HSL)', sec: 'technology', sub: 'Computing & Internet',
    desc: 'Convert colours between HEX, RGB and HSL, with a live preview and contrast check against black and white text.',
    formula: 'HEX is base-16 RGB. HSL is derived from the max and min RGB channels. Contrast uses the WCAG relative luminance formula.',
    inputs: [{ k: 'c', l: 'Colour (HEX like #2F6FED or rgb(47,111,237))', t: 'text', v: '#0B6E4F' }],
    calc: function (v) {
      var s = String(v.c || '').trim(), m, R, G, B;
      if ((m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s))) { var h = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1]; R = parseInt(h.slice(0, 2), 16); G = parseInt(h.slice(2, 4), 16); B = parseInt(h.slice(4, 6), 16); }
      else if ((m = /rgba?\((\d+)\D+(\d+)\D+(\d+)/i.exec(s))) { R = +m[1]; G = +m[2]; B = +m[3]; } else return { error: 'Enter a HEX or rgb() colour.' };
      var r1 = R / 255, g1 = G / 255, b1 = B / 255, mx = Math.max(r1, g1, b1), mn = Math.min(r1, g1, b1), l = (mx + mn) / 2, d = mx - mn, hh = 0, ss = 0;
      if (d) { ss = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); hh = mx === r1 ? (g1 - b1) / d + (g1 < b1 ? 6 : 0) : mx === g1 ? (b1 - r1) / d + 2 : (r1 - g1) / d + 4; hh *= 60; }
      var lin = function (c) { return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }, L = 0.2126 * lin(r1) + 0.7152 * lin(g1) + 0.0722 * lin(b1);
      var hex = '#' + [R, G, B].map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join('').toUpperCase();
      return { results: [M('HEX', hex, 'text'), r('RGB', 'rgb(' + R + ', ' + G + ', ' + B + ')', 'text'), r('HSL', 'hsl(' + Math.round(hh) + ', ' + Math.round(ss * 100) + '%, ' + Math.round(l * 100) + '%)', 'text'),
        r('Contrast with white', 1.05 / (L + 0.05), 'fixed', { dp: 2, u: ': 1' }), r('Contrast with black', (L + 0.05) / 0.05, 'fixed', { dp: 2, u: ': 1' })],
        html: '<div class="cw-swatch" style="background:' + hex + '"><span style="color:#fff">Aa White</span><span style="color:#000">Aa Black</span></div>' }; }
  },
  {
    id: 'password-generator', title: 'Password Generator', sec: 'fun', sub: 'Fun & Random Tools', pop: 1,
    desc: 'Create strong, random passwords in your browser — nothing is sent anywhere. See the strength in bits of entropy.',
    formula: 'Entropy (bits) = length × log₂(character set size). 80+ bits is very strong.',
    inputs: [{ k: 'n', l: 'Length', t: 'int', v: 16, slider: [6, 64, 1] }, { k: 'up', l: 'Uppercase (A–Z)', t: 'check', v: true }, { k: 'lo', l: 'Lowercase (a–z)', t: 'check', v: true },
      { k: 'di', l: 'Numbers (0–9)', t: 'check', v: true }, { k: 'sy', l: 'Symbols (!@#…)', t: 'check', v: true }, { k: 'amb', l: 'Avoid look-alikes (0 O l 1)', t: 'check', v: false }],
    calc: function (v) { var set = (v.up ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '') + (v.lo ? 'abcdefghijklmnopqrstuvwxyz' : '') + (v.di ? '0123456789' : '') + (v.sy ? '!@#$%^&*()-_=+[]{};:,.?/' : '');
      if (v.amb) set = set.replace(/[0Ol1I]/g, ''); if (!set) return { error: 'Choose at least one character type.' };
      var n = Math.max(4, Math.min(128, Math.round(v.n))), a = new Uint32Array(n); crypto.getRandomValues(a); var pw = Array.from(a, function (x) { return set[x % set.length]; }).join('');
      var bits = n * Math.log2(set.length);
      return { results: [M('Password', pw, 'text'), r('Strength', bits < 40 ? 'Weak' : bits < 60 ? 'Fair' : bits < 80 ? 'Strong' : 'Very strong', 'text', { hl: 1 }), r('Entropy', bits, 'int', { u: 'bits' })], note: 'Generated locally with crypto.getRandomValues. Change any option or press Reset for a new one.' }; }
  }
  ]);
})(window.CW);
