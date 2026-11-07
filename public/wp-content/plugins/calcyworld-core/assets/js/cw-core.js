/*!
 * Calcyworld Core — country, currency, number formatting, safe expression engine.
 * Loaded on every page. Exposes window.CW.
 */
(function (root) {
  'use strict';
  var CFG = root.CW_CONFIG || {};
  var CW = root.CW = root.CW || {};
  CW.cfg = CFG;

  /* ------------------------------------------------------------------ *
   * Countries: code|name|currency|locale(optional)|units(optional i=imperial)
   * ------------------------------------------------------------------ */
  var RAW = [
    'AF|Afghanistan|AFN','AL|Albania|ALL','DZ|Algeria|DZD','AD|Andorra|EUR','AO|Angola|AOA','AG|Antigua and Barbuda|XCD',
    'AR|Argentina|ARS|es-AR','AM|Armenia|AMD','AU|Australia|AUD','AT|Austria|EUR|de-AT','AZ|Azerbaijan|AZN','BS|Bahamas|BSD',
    'BH|Bahrain|BHD','BD|Bangladesh|BDT|en-BD','BB|Barbados|BBD','BY|Belarus|BYN','BE|Belgium|EUR|nl-BE','BZ|Belize|BZD',
    'BJ|Benin|XOF','BT|Bhutan|BTN|en-IN','BO|Bolivia|BOB|es-BO','BA|Bosnia and Herzegovina|BAM','BW|Botswana|BWP','BR|Brazil|BRL|pt-BR',
    'BN|Brunei|BND','BG|Bulgaria|BGN|bg-BG','BF|Burkina Faso|XOF','BI|Burundi|BIF','CV|Cabo Verde|CVE','KH|Cambodia|KHR',
    'CM|Cameroon|XAF','CA|Canada|CAD|en-CA','CF|Central African Republic|XAF','TD|Chad|XAF','CL|Chile|CLP|es-CL','CN|China|CNY|zh-CN',
    'CO|Colombia|COP|es-CO','KM|Comoros|KMF','CG|Congo|XAF','CD|DR Congo|CDF','CR|Costa Rica|CRC|es-CR','CI|Côte d’Ivoire|XOF',
    'HR|Croatia|EUR|hr-HR','CU|Cuba|CUP','CY|Cyprus|EUR','CZ|Czechia|CZK|cs-CZ','DK|Denmark|DKK|da-DK','DJ|Djibouti|DJF',
    'DM|Dominica|XCD','DO|Dominican Republic|DOP|es-DO','EC|Ecuador|USD|es-EC','EG|Egypt|EGP','SV|El Salvador|USD|es-SV',
    'GQ|Equatorial Guinea|XAF','ER|Eritrea|ERN','EE|Estonia|EUR|et-EE','SZ|Eswatini|SZL','ET|Ethiopia|ETB','FJ|Fiji|FJD',
    'FI|Finland|EUR|fi-FI','FR|France|EUR|fr-FR','GA|Gabon|XAF','GM|Gambia|GMD','GE|Georgia|GEL','DE|Germany|EUR|de-DE',
    'GH|Ghana|GHS','GR|Greece|EUR|el-GR','GD|Grenada|XCD','GT|Guatemala|GTQ|es-GT','GN|Guinea|GNF','GW|Guinea-Bissau|XOF',
    'GY|Guyana|GYD','HT|Haiti|HTG','HN|Honduras|HNL|es-HN','HK|Hong Kong|HKD|en-HK','HU|Hungary|HUF|hu-HU','IS|Iceland|ISK|is-IS',
    'IN|India|INR|en-IN','ID|Indonesia|IDR|id-ID','IR|Iran|IRR','IQ|Iraq|IQD','IE|Ireland|EUR|en-IE','IL|Israel|ILS|en-IL',
    'IT|Italy|EUR|it-IT','JM|Jamaica|JMD','JP|Japan|JPY|ja-JP','JO|Jordan|JOD','KZ|Kazakhstan|KZT','KE|Kenya|KES|en-KE',
    'KI|Kiribati|AUD','KW|Kuwait|KWD','KG|Kyrgyzstan|KGS','LA|Laos|LAK','LV|Latvia|EUR|lv-LV','LB|Lebanon|LBP','LS|Lesotho|LSL',
    'LR|Liberia|LRD|en-LR|i','LY|Libya|LYD','LI|Liechtenstein|CHF','LT|Lithuania|EUR|lt-LT','LU|Luxembourg|EUR|fr-LU',
    'MO|Macao|MOP','MG|Madagascar|MGA','MW|Malawi|MWK','MY|Malaysia|MYR|en-MY','MV|Maldives|MVR','ML|Mali|XOF','MT|Malta|EUR|en-MT',
    'MH|Marshall Islands|USD','MR|Mauritania|MRU','MU|Mauritius|MUR','MX|Mexico|MXN|es-MX','FM|Micronesia|USD','MD|Moldova|MDL',
    'MC|Monaco|EUR|fr-MC','MN|Mongolia|MNT','ME|Montenegro|EUR','MA|Morocco|MAD','MZ|Mozambique|MZN','MM|Myanmar|MMK|en-MM|i',
    'NA|Namibia|NAD','NR|Nauru|AUD','NP|Nepal|NPR|en-NP','NL|Netherlands|EUR|nl-NL','NZ|New Zealand|NZD|en-NZ','NI|Nicaragua|NIO|es-NI',
    'NE|Niger|XOF','NG|Nigeria|NGN|en-NG','KP|North Korea|KPW','MK|North Macedonia|MKD','NO|Norway|NOK|nb-NO','OM|Oman|OMR',
    'PK|Pakistan|PKR|en-PK','PW|Palau|USD','PS|Palestine|ILS','PA|Panama|PAB|es-PA','PG|Papua New Guinea|PGK','PY|Paraguay|PYG|es-PY',
    'PE|Peru|PEN|es-PE','PH|Philippines|PHP|en-PH','PL|Poland|PLN|pl-PL','PT|Portugal|EUR|pt-PT','PR|Puerto Rico|USD|en-US|i','QA|Qatar|QAR',
    'RO|Romania|RON|ro-RO','RU|Russia|RUB|ru-RU','RW|Rwanda|RWF','KN|Saint Kitts and Nevis|XCD','LC|Saint Lucia|XCD',
    'VC|Saint Vincent and the Grenadines|XCD','WS|Samoa|WST','SM|San Marino|EUR','ST|São Tomé and Príncipe|STN','SA|Saudi Arabia|SAR|en-SA',
    'SN|Senegal|XOF','RS|Serbia|RSD','SC|Seychelles|SCR','SL|Sierra Leone|SLE','SG|Singapore|SGD|en-SG','SK|Slovakia|EUR|sk-SK',
    'SI|Slovenia|EUR|sl-SI','SB|Solomon Islands|SBD','SO|Somalia|SOS','ZA|South Africa|ZAR|en-ZA','KR|South Korea|KRW|ko-KR',
    'SS|South Sudan|SSP','ES|Spain|EUR|es-ES','LK|Sri Lanka|LKR|en-LK','SD|Sudan|SDG','SR|Suriname|SRD','SE|Sweden|SEK|sv-SE',
    'CH|Switzerland|CHF|de-CH','SY|Syria|SYP','TW|Taiwan|TWD|zh-TW','TJ|Tajikistan|TJS','TZ|Tanzania|TZS','TH|Thailand|THB|th-TH',
    'TL|Timor-Leste|USD','TG|Togo|XOF','TO|Tonga|TOP','TT|Trinidad and Tobago|TTD','TN|Tunisia|TND','TR|Türkiye|TRY|tr-TR',
    'TM|Turkmenistan|TMT','TV|Tuvalu|AUD','UG|Uganda|UGX','UA|Ukraine|UAH|uk-UA','AE|United Arab Emirates|AED|en-AE',
    'GB|United Kingdom|GBP|en-GB','US|United States|USD|en-US|i','UY|Uruguay|UYU|es-UY','UZ|Uzbekistan|UZS','VU|Vanuatu|VUV',
    'VA|Vatican City|EUR','VE|Venezuela|VES|es-VE','VN|Vietnam|VND|vi-VN','YE|Yemen|YER','ZM|Zambia|ZMW','ZW|Zimbabwe|ZWG'
  ];
  var COUNTRIES = [], BY = {};
  RAW.forEach(function (r) {
    var p = r.split('|');
    var c = { code: p[0], name: p[1], cur: p[2], loc: p[3] || ('en-' + p[0]), imperial: p[4] === 'i' };
    COUNTRIES.push(c); BY[c.code] = c;
  });
  CW.countries = COUNTRIES;
  CW.countryBy = function (code) { return BY[(code || '').toUpperCase()] || null; };
  CW.flag = function (code) {
    return (code || '').toUpperCase().replace(/./g, function (ch) { return String.fromCodePoint(127397 + ch.charCodeAt(0)); });
  };

  /* Timezone -> country (covers every populated region's main zones). */
  var TZ = {
    'Asia/Kolkata':'IN','Asia/Calcutta':'IN','America/New_York':'US','America/Chicago':'US','America/Denver':'US','America/Phoenix':'US',
    'America/Los_Angeles':'US','America/Anchorage':'US','Pacific/Honolulu':'US','America/Detroit':'US','America/Indiana/Indianapolis':'US',
    'America/Boise':'US','America/Toronto':'CA','America/Vancouver':'CA','America/Edmonton':'CA','America/Winnipeg':'CA','America/Halifax':'CA',
    'America/St_Johns':'CA','America/Regina':'CA','Europe/London':'GB','Europe/Dublin':'IE','Europe/Paris':'FR','Europe/Berlin':'DE',
    'Europe/Madrid':'ES','Atlantic/Canary':'ES','Europe/Rome':'IT','Europe/Amsterdam':'NL','Europe/Brussels':'BE','Europe/Vienna':'AT',
    'Europe/Zurich':'CH','Europe/Stockholm':'SE','Europe/Oslo':'NO','Europe/Copenhagen':'DK','Europe/Helsinki':'FI','Europe/Warsaw':'PL',
    'Europe/Prague':'CZ','Europe/Bratislava':'SK','Europe/Budapest':'HU','Europe/Bucharest':'RO','Europe/Sofia':'BG','Europe/Athens':'GR',
    'Europe/Lisbon':'PT','Europe/Luxembourg':'LU','Europe/Tallinn':'EE','Europe/Riga':'LV','Europe/Vilnius':'LT','Europe/Zagreb':'HR',
    'Europe/Ljubljana':'SI','Europe/Belgrade':'RS','Europe/Kiev':'UA','Europe/Kyiv':'UA','Europe/Moscow':'RU','Europe/Istanbul':'TR',
    'Europe/Minsk':'BY','Europe/Chisinau':'MD','Europe/Malta':'MT','Asia/Nicosia':'CY','Atlantic/Reykjavik':'IS','Asia/Dubai':'AE',
    'Asia/Riyadh':'SA','Asia/Qatar':'QA','Asia/Kuwait':'KW','Asia/Bahrain':'BH','Asia/Muscat':'OM','Asia/Karachi':'PK','Asia/Dhaka':'BD',
    'Asia/Kathmandu':'NP','Asia/Katmandu':'NP','Asia/Colombo':'LK','Asia/Thimphu':'BT','Indian/Maldives':'MV','Asia/Kabul':'AF',
    'Asia/Tehran':'IR','Asia/Baghdad':'IQ','Asia/Jerusalem':'IL','Asia/Tel_Aviv':'IL','Asia/Amman':'JO','Asia/Beirut':'LB','Asia/Damascus':'SY',
    'Asia/Shanghai':'CN','Asia/Hong_Kong':'HK','Asia/Macau':'MO','Asia/Taipei':'TW','Asia/Tokyo':'JP','Asia/Seoul':'KR','Asia/Singapore':'SG',
    'Asia/Kuala_Lumpur':'MY','Asia/Bangkok':'TH','Asia/Jakarta':'ID','Asia/Makassar':'ID','Asia/Jayapura':'ID','Asia/Manila':'PH',
    'Asia/Ho_Chi_Minh':'VN','Asia/Saigon':'VN','Asia/Phnom_Penh':'KH','Asia/Vientiane':'LA','Asia/Yangon':'MM','Asia/Rangoon':'MM',
    'Asia/Almaty':'KZ','Asia/Tashkent':'UZ','Asia/Bishkek':'KG','Asia/Dushanbe':'TJ','Asia/Ashgabat':'TM','Asia/Baku':'AZ','Asia/Tbilisi':'GE',
    'Asia/Yerevan':'AM','Asia/Ulaanbaatar':'MN','Asia/Brunei':'BN','Asia/Dili':'TL','Australia/Sydney':'AU','Australia/Melbourne':'AU',
    'Australia/Brisbane':'AU','Australia/Perth':'AU','Australia/Adelaide':'AU','Australia/Hobart':'AU','Australia/Darwin':'AU',
    'Pacific/Auckland':'NZ','Pacific/Fiji':'FJ','Pacific/Port_Moresby':'PG','Africa/Cairo':'EG','Africa/Lagos':'NG','Africa/Johannesburg':'ZA',
    'Africa/Nairobi':'KE','Africa/Accra':'GH','Africa/Addis_Ababa':'ET','Africa/Casablanca':'MA','Africa/Algiers':'DZ','Africa/Tunis':'TN',
    'Africa/Kampala':'UG','Africa/Dar_es_Salaam':'TZ','Africa/Kigali':'RW','Africa/Lusaka':'ZM','Africa/Harare':'ZW','Africa/Maputo':'MZ',
    'Africa/Luanda':'AO','Africa/Dakar':'SN','Africa/Abidjan':'CI','Africa/Douala':'CM','Africa/Khartoum':'SD','Africa/Tripoli':'LY',
    'Africa/Windhoek':'NA','Africa/Gaborone':'BW','Indian/Mauritius':'MU','America/Mexico_City':'MX','America/Cancun':'MX','America/Tijuana':'MX',
    'America/Monterrey':'MX','America/Sao_Paulo':'BR','America/Manaus':'BR','America/Fortaleza':'BR','America/Argentina/Buenos_Aires':'AR',
    'America/Buenos_Aires':'AR','America/Santiago':'CL','America/Bogota':'CO','America/Lima':'PE','America/Caracas':'VE','America/Guayaquil':'EC',
    'America/La_Paz':'BO','America/Asuncion':'PY','America/Montevideo':'UY','America/Panama':'PA','America/Costa_Rica':'CR',
    'America/Guatemala':'GT','America/El_Salvador':'SV','America/Tegucigalpa':'HN','America/Managua':'NI','America/Havana':'CU',
    'America/Santo_Domingo':'DO','America/Port-au-Prince':'HT','America/Jamaica':'JM','America/Puerto_Rico':'PR','America/Port_of_Spain':'TT'
  };

  /* ---------------------------- storage ---------------------------- */
  CW.ls = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------------------------- detection -------------------------- */
  function detect() {
    var saved = CW.ls.get('cw_country', null);
    if (saved && BY[saved]) return saved;
    if (CFG.autoDetect !== false && CFG.autoDetect !== '0') {
      if (CFG.serverCountry && BY[CFG.serverCountry]) return CFG.serverCountry;
      try {
        var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (TZ[tz]) return TZ[tz];
      } catch (e) {}
      var langs = (navigator.languages || [navigator.language || '']);
      for (var i = 0; i < langs.length; i++) {
        var m = /[-_]([A-Za-z]{2})$/.exec(langs[i] || '');
        if (m && BY[m[1].toUpperCase()]) return m[1].toUpperCase();
      }
    }
    return (CFG.defaultCountry && BY[CFG.defaultCountry]) ? CFG.defaultCountry : 'US';
  }
  var current = detect();
  var listeners = [];
  CW.country = function () { return BY[current]; };
  CW.setCountry = function (code) {
    code = (code || '').toUpperCase();
    if (!BY[code] || code === current) return;
    current = code; CW.ls.set('cw_country', code);
    listeners.forEach(function (fn) { try { fn(BY[code]); } catch (e) {} });
    try { document.documentElement.setAttribute('data-country', code); } catch (e) {}
  };
  CW.onCountry = function (fn) { listeners.push(fn); };
  CW.locale = function () { return CW.country().loc; };
  CW._cur = null;   // set while a fixed-currency calculator (e.g. a UK-only tax tool) is building/rendering
  CW.currency = function () { return CW._cur || CW.country().cur; };
  CW.imperial = function () { return !!CW.country().imperial; };
  CW.preset = function (key, fallback) {
    var p = (CFG.presets || {})[current] || {};
    return p[key] !== undefined ? p[key] : fallback;
  };
  try { document.documentElement.setAttribute('data-country', current); } catch (e) {}

  /* ---------------------------- rates ------------------------------ */
  // CFG.rates = {base:'USD', rates:{INR:..}, time:unix}
  CW.rate = function (cur) {
    var r = CFG.rates && CFG.rates.rates; if (!r) return null;
    if (cur === (CFG.rates.base || 'USD')) return 1;
    return r[cur] || null;
  };
  CW.convert = function (amount, from, to) {
    var a = CW.rate(from), b = CW.rate(to);
    if (!a || !b) return null;
    return amount / a * b;
  };
  /* Round to a friendly figure (2 significant digits). */
  CW.nice = function (v) {
    if (!isFinite(v) || v === 0) return v;
    var mag = Math.pow(10, Math.floor(Math.log10(Math.abs(v))) - 1);
    return Math.round(v / mag) * mag;
  };
  /* Convert a USD default into the visitor's currency for sensible defaults. */
  CW.localAmount = function (usd) {
    var r = CW.rate(CW.currency());
    return r ? CW.nice(usd * r) : usd;
  };

  /* ---------------------------- formatting ------------------------- */
  var nfCache = {};
  function nf(opts) {
    var key = CW.locale() + JSON.stringify(opts);
    if (!nfCache[key]) {
      try { nfCache[key] = new Intl.NumberFormat(CW.locale(), opts); }
      catch (e) { nfCache[key] = new Intl.NumberFormat('en-US', opts); }
    }
    return nfCache[key];
  }
  function bad(v) { return v === null || v === undefined || typeof v === 'number' && !isFinite(v); }
  CW.fmt = {
    money: function (v, cur, dp) {
      if (bad(v)) return '—';
      cur = cur || CW.currency();
      var d = dp !== undefined ? dp : (Math.abs(v) >= 1000 ? 0 : 2);
      try { return nf({ style: 'currency', currency: cur, minimumFractionDigits: d, maximumFractionDigits: d }).format(v); }
      catch (e) { return cur + ' ' + CW.fmt.num(v, d); }
    },
    num: function (v, dp) {
      if (bad(v)) return '—';
      var d = dp === undefined ? (Math.abs(v) >= 100 ? 2 : 4) : dp;
      return nf({ maximumFractionDigits: d, minimumFractionDigits: 0 }).format(v);
    },
    fixed: function (v, dp) { if (bad(v)) return '—'; return nf({ minimumFractionDigits: dp, maximumFractionDigits: dp }).format(v); },
    int: function (v) { if (bad(v)) return '—'; return nf({ maximumFractionDigits: 0 }).format(Math.round(v)); },
    pct: function (v, dp) { if (bad(v)) return '—'; return CW.fmt.num(v, dp === undefined ? 2 : dp) + '%'; },
    date: function (d) {
      if (typeof d === 'number' && isFinite(d)) d = new Date(d);
      if (!(d instanceof Date) || isNaN(d)) return '—';
      try { return d.toLocaleDateString(CW.locale(), { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }); }
      catch (e) { return d.toDateString(); }
    },
    sym: function (cur) {
      cur = cur || CW.currency();
      try {
        var parts = nf({ style: 'currency', currency: cur }).formatToParts(0);
        for (var i = 0; i < parts.length; i++) if (parts[i].type === 'currency') return parts[i].value;
      } catch (e) {}
      return cur;
    },
    seps: function () {
      var parts = nf({}).formatToParts(12345.6), g = ',', d = '.';
      parts.forEach(function (p) { if (p.type === 'group') g = p.value; if (p.type === 'decimal') d = p.value; });
      return { group: g, decimal: d };
    }
  };
  /* Parse user-typed numbers in any locale ("1,23,456.7", "1.234,5", "12 500"). */
  CW.parse = function (s) {
    if (typeof s === 'number') return s;
    s = String(s || '').trim();
    if (!s) return NaN;
    s = s.replace(/[\s  ']/g, '').replace(/[^\d.,\-eE+]/g, '');
    var sep = CW.fmt.seps();
    var hasC = s.indexOf(',') > -1, hasD = s.indexOf('.') > -1;
    if (hasC && hasD) {
      if (s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\./g, '').replace(',', '.');
      else s = s.replace(/,/g, '');
    } else if (hasC) {
      var cnt = (s.match(/,/g) || []).length;
      if (sep.decimal === ',' && cnt === 1) s = s.replace(',', '.');
      else if (cnt === 1 && /,\d{1,2}$/.test(s)) s = s.replace(',', '.'); // "12,5" typed in a dot-decimal locale
      else s = s.replace(/,/g, '');
    } else if (hasD && sep.decimal === ',' && /^\-?\d{1,3}(\.\d{3})+$/.test(s)) {
      s = s.replace(/\./g, '');
    }
    var v = parseFloat(s);
    return isFinite(v) ? v : NaN;
  };

  /* ---------------------------- number to words ------------------- */
  var ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen',
    'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  var TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  function below1000(n) {
    var s = '';
    if (n >= 100) { s += ONES[Math.floor(n / 100)] + ' hundred'; n %= 100; if (n) s += ' '; }
    if (n >= 20) { s += TENS[Math.floor(n / 10)]; if (n % 10) s += '-' + ONES[n % 10]; }
    else if (n) s += ONES[n];
    return s;
  }
  CW.words = function (num, system) {
    num = Math.floor(Math.abs(num));
    if (!isFinite(num)) return '';
    if (num === 0) return 'zero';
    if (num > 999999999999999) return '';
    var out = [];
    if (system === 'indian') {
      var cr = Math.floor(num / 1e7); num %= 1e7;
      var lk = Math.floor(num / 1e5); num %= 1e5;
      var th = Math.floor(num / 1e3); num %= 1e3;
      if (cr) out.push((cr >= 1000 ? CW.words(cr, 'indian') : below1000(cr)) + ' crore');
      if (lk) out.push(below1000(lk) + ' lakh');
      if (th) out.push(below1000(th) + ' thousand');
      if (num) out.push(below1000(num));
    } else {
      var units = [[1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']];
      units.forEach(function (u) { var q = Math.floor(num / u[0]); if (q) { out.push(below1000(q) + ' ' + u[1]); num %= u[0]; } });
      if (num) out.push(below1000(num));
    }
    return out.join(' ');
  };
  CW.wordsForCountry = function (v) {
    var sys = ['IN', 'NP', 'BD', 'PK', 'LK', 'BT'].indexOf(CW.country().code) > -1 ? 'indian' : 'intl';
    var w = CW.words(Math.round(v), sys); // same rounding as the money figure shown above it
    return w ? w.charAt(0).toUpperCase() + w.slice(1) : '';
  };

  /* ---------------------------- safe expressions ------------------ *
   * Supports + - * / ^ % ! ( ) , numbers, variables and functions.
   * No eval / new Function — safe for formulas typed in WP admin.
   * ---------------------------------------------------------------- */
  var FN = {
    sin: 1, cos: 1, tan: 1, asin: 1, acos: 1, atan: 1, sinh: 1, cosh: 1, tanh: 1, sqrt: 1, cbrt: 1, abs: 1, exp: 1,
    ln: 1, log: 1, log2: 1, round: 1, floor: 1, ceil: 1, min: 2, max: 2, pow: 2, root: 2, logb: 2, if: 3, sign: 1,
    pmt: 3, fvs: 3, hypot: 2, mod: 2, gcd: 2, comb: 2, perm: 2, rad: 1, deg: 1, trunc: 1, ncdf: 1, erf: 1, atan2: 2, asinh: 1, acosh: 1, atanh: 1
  };
  function fact(n) {
    if (n < 0 || n !== Math.floor(n)) return gamma(n + 1);
    if (n > 170) return Infinity;
    var r = 1; for (var i = 2; i <= n; i++) r *= i; return r;
  }
  function gamma(z) {
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    z -= 1; var g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
      12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    var x = c[0]; for (var i = 1; i < g + 2; i++) x += c[i] / (z + i);
    var t = z + g + 0.5; return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }
  CW.factorial = fact;
  function erf(x) { var s = x < 0 ? -1 : 1; x = Math.abs(x); var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return s * y; }
  CW.erf = erf;
  function tokenize(src) {
    var t = [], i = 0, s = String(src).replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi').replace(/√/g, 'sqrt');
    while (i < s.length) {
      var ch = s[i];
      if (/\s/.test(ch)) { i++; continue; }
      var m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i));
      if (m) { t.push({ t: 'n', v: parseFloat(m[0]) }); i += m[0].length; continue; }
      m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(i));
      if (m) { t.push({ t: 'id', v: m[0] }); i += m[0].length; continue; }
      if ('+-*/^%!(),<>='.indexOf(ch) > -1) {
        if ((ch === '<' || ch === '>' || ch === '=' ) && s[i + 1] === '=') { t.push({ t: 'op', v: ch + '=' }); i += 2; continue; }
        t.push({ t: ch === '(' || ch === ')' ? ch : ch === ',' ? ',' : 'op', v: ch }); i++; continue;
      }
      throw new Error('Unexpected "' + ch + '"');
    }
    return t;
  }
  var PREC = { '<': 1, '>': 1, '<=': 1, '>=': 1, '==': 1, '+': 2, '-': 2, '*': 3, '/': 3, '%': 3, 'neg': 4, '^': 5, '!': 6 };
  var RIGHT = { '^': 1, 'neg': 1 };
  function toRPN(tokens) {
    var out = [], st = [], prev = null, argc = [];
    tokens.forEach(function (tk) {
      if (tk.t === 'n') out.push(tk);
      else if (tk.t === 'id') {
        if (FN[tk.v.toLowerCase()] !== undefined) st.push({ t: 'fn', v: tk.v.toLowerCase() });
        else out.push({ t: 'var', v: tk.v });
      } else if (tk.t === ',') {
        while (st.length && st[st.length - 1].t !== '(') out.push(st.pop());
        if (argc.length) argc[argc.length - 1]++;
      } else if (tk.t === 'op') {
        var op = tk.v;
        if (op === '-' && (!prev || prev.t === 'op' || prev.t === '(' || prev.t === ',')) op = 'neg';
        else if (op === '+' && (!prev || prev.t === 'op' || prev.t === '(' || prev.t === ',')) { prev = tk; return; }
        if (op === '!') { out.push({ t: 'op', v: '!' }); prev = { t: 'n' }; return; }
        while (op !== 'neg' && st.length) {   // a prefix minus has nothing to its left, so it never pops operators
          var top = st[st.length - 1];
          if (top.t === 'op' && (PREC[top.v] > PREC[op] || (PREC[top.v] === PREC[op] && !RIGHT[op]))) out.push(st.pop());
          else break;
        }
        st.push({ t: 'op', v: op });
      } else if (tk.t === '(') {
        st.push(tk);
        if (prev && prev.t === 'id' && FN[prev.v.toLowerCase()] !== undefined) argc.push(1);
        else argc.push(null);
      } else if (tk.t === ')') {
        while (st.length && st[st.length - 1].t !== '(') out.push(st.pop());
        if (!st.length) throw new Error('Mismatched brackets');
        st.pop();
        var n = argc.pop();
        if (st.length && st[st.length - 1].t === 'fn') { var f = st.pop(); f.argc = n || 1; out.push(f); }
      }
      prev = tk;
    });
    while (st.length) { var x = st.pop(); if (x.t === '(') throw new Error('Mismatched brackets'); out.push(x); }
    return out;
  }
  CW.evaluate = function (expr, vars, opt) {
    vars = vars || {}; opt = opt || {};
    var deg = opt.angle === 'deg';
    var toR = function (x) { return deg ? x * Math.PI / 180 : x; };
    var fromR = function (x) { return deg ? x * 180 / Math.PI : x; };
    var rpn = toRPN(tokenize(expr)), st = [];
    rpn.forEach(function (tk) {
      if (tk.t === 'n') st.push(tk.v);
      else if (tk.t === 'var') {
        var k = tk.v, kl = k.toLowerCase();
        if (Object.prototype.hasOwnProperty.call(vars, k)) st.push(+vars[k]);
        else if (kl === 'pi') st.push(Math.PI);
        else if (kl === 'e') st.push(Math.E);
        else if (kl === 'ans' && vars.ans !== undefined) st.push(+vars.ans);
        else throw new Error('Unknown name "' + k + '"');
      } else if (tk.t === 'op') {
        if (tk.v === 'neg') { st.push(-st.pop()); return; }
        if (tk.v === '!') { st.push(fact(st.pop())); return; }
        var b = st.pop(), a = st.pop();
        if (a === undefined || b === undefined) throw new Error('Incomplete expression');
        switch (tk.v) {
          case '+': st.push(a + b); break; case '-': st.push(a - b); break; case '*': st.push(a * b); break;
          case '/': st.push(a / b); break; case '%': st.push(a % b); break; case '^': st.push(Math.pow(a, b)); break;
          case '<': st.push(a < b ? 1 : 0); break; case '>': st.push(a > b ? 1 : 0); break;
          case '<=': st.push(a <= b ? 1 : 0); break; case '>=': st.push(a >= b ? 1 : 0); break; case '==': st.push(a === b ? 1 : 0); break;
        }
      } else if (tk.t === 'fn') {
        var args = st.splice(st.length - tk.argc, tk.argc), x = args[0], r;
        switch (tk.v) {
          case 'sin': r = Math.sin(toR(x)); break; case 'cos': r = Math.cos(toR(x)); break; case 'tan': r = Math.tan(toR(x)); break;
          case 'asin': r = fromR(Math.asin(x)); break; case 'acos': r = fromR(Math.acos(x)); break; case 'atan': r = fromR(Math.atan(x)); break;
          case 'sinh': r = Math.sinh(x); break; case 'cosh': r = Math.cosh(x); break; case 'tanh': r = Math.tanh(x); break;
          case 'sqrt': r = Math.sqrt(x); break; case 'cbrt': r = Math.cbrt(x); break; case 'abs': r = Math.abs(x); break;
          case 'exp': r = Math.exp(x); break; case 'ln': r = Math.log(x); break; case 'log': r = Math.log10(x); break;
          case 'log2': r = Math.log2(x); break; case 'sign': r = Math.sign(x); break;
          case 'round': r = args.length > 1 ? Math.round(x * Math.pow(10, args[1])) / Math.pow(10, args[1]) : Math.round(x); break;
          case 'floor': r = Math.floor(x); break; case 'ceil': r = Math.ceil(x); break;
          case 'min': r = Math.min.apply(null, args); break; case 'max': r = Math.max.apply(null, args); break;
          case 'pow': r = Math.pow(x, args[1]); break; case 'root': r = Math.pow(x, 1 / args[1]); break;
          case 'logb': r = Math.log(x) / Math.log(args[1]); break; case 'if': r = x ? args[1] : args[2]; break;
          case 'pmt': r = x === 0 ? args[2] / args[1] : args[2] * x / (1 - Math.pow(1 + x, -args[1])); break;
          case 'fvs': r = x === 0 ? args[2] * args[1] : args[2] * (Math.pow(1 + x, args[1]) - 1) / x; break;
          case 'hypot': r = Math.hypot(x, args[1]); break; case 'mod': r = ((x % args[1]) + args[1]) % args[1]; break;
          case 'gcd': r = (function (a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; })(x, args[1]); break;
          case 'comb': r = Math.round(fact(x) / (fact(args[1]) * fact(x - args[1]))); break;
          case 'perm': r = Math.round(fact(x) / fact(x - args[1])); break;
          case 'rad': r = x * Math.PI / 180; break; case 'deg': r = x * 180 / Math.PI; break; case 'trunc': r = Math.trunc(x); break;
          case 'atan2': r = fromR(Math.atan2(x, args[1])); break; case 'asinh': r = Math.asinh(x); break; case 'acosh': r = Math.acosh(x); break; case 'atanh': r = Math.atanh(x); break;
          case 'erf': r = erf(x); break; case 'ncdf': r = 0.5 * (1 + erf(x / Math.SQRT2)); break;
        }
        // Clean floating noise for trig of exact angles (sin(180°) -> 0)
        if (Math.abs(r) < 1e-14) r = 0;
        st.push(r);
      }
    });
    if (st.length !== 1) throw new Error('Incomplete expression');
    return st[0];
  };

  /* ---------------------------- recents ---------------------------- */
  CW.addRecent = function (item) {
    var list = CW.ls.get('cw_recent', []).filter(function (x) { return x.u !== item.u; });
    list.unshift(item); CW.ls.set('cw_recent', list.slice(0, 8));
  };
  CW.recents = function () { return CW.ls.get('cw_recent', []); };

  /* ---------------------------- UI language ------------------------ */
  CW.t = function (k) { var d = (CFG.i18n || {}); return d[k]; };

  /* ---------------------------- helpers ---------------------------- */
  CW.esc = function (s) {
    return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = CW;
})(typeof window !== 'undefined' ? window : globalThis);
