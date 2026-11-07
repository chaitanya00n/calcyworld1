/* Calcyworld — converter pair pages (one SEO page per popular pair, both directions) */
(function (CW) {
  'use strict';
  var U = CW.UNITS;

  /* unit key -> [plural display word, url word] */
  var W = {
    length: { mm: ['Millimeters', 'mm'], cm: ['Centimeters', 'cm'], m: ['Meters', 'meters'], km: ['Kilometers', 'km'], in: ['Inches', 'inches'], ft: ['Feet', 'feet'], yd: ['Yards', 'yards'], mi: ['Miles', 'miles'], nmi: ['Nautical Miles', 'nautical-miles'], um: ['Micrometers', 'micrometers'], nm: ['Nanometers', 'nanometers'] },
    weight: { mg: ['Milligrams', 'mg'], g: ['Grams', 'grams'], kg: ['Kilograms', 'kg'], t: ['Tonnes', 'tonnes'], oz: ['Ounces', 'ounces'], lb: ['Pounds', 'pounds'], st: ['Stone', 'stone'], ton_us: ['US Tons', 'us-tons'], ton_uk: ['UK Tons', 'uk-tons'], ct: ['Carats', 'carats'], tola: ['Tola', 'tola'] },
    temperature: { c: ['Celsius', 'celsius'], f: ['Fahrenheit', 'fahrenheit'], k: ['Kelvin', 'kelvin'], r: ['Rankine', 'rankine'] },
    area: { mm2: ['Square Millimeters', 'sq-mm'], cm2: ['Square Centimeters', 'sq-cm'], m2: ['Square Meters', 'sq-meters'], km2: ['Square Kilometers', 'sq-km'], in2: ['Square Inches', 'sq-inches'], ft2: ['Square Feet', 'sq-feet'], yd2: ['Square Yards', 'sq-yards'], ac: ['Acres', 'acres'], ha: ['Hectares', 'hectares'], mi2: ['Square Miles', 'sq-miles'], guntha: ['Guntha', 'guntha'], cent: ['Cent', 'cent'], bigha: ['Bigha', 'bigha'], marla: ['Marla', 'marla'], kanal: ['Kanal', 'kanal'] },
    volume: { ml: ['Milliliters', 'ml'], l: ['Liters', 'liters'], m3: ['Cubic Meters', 'cubic-meters'], cm3: ['Cubic Centimeters', 'cubic-cm'], tsp: ['Teaspoons', 'teaspoons'], tbsp: ['Tablespoons', 'tablespoons'], floz: ['Fluid Ounces', 'fluid-ounces'], cup: ['Cups', 'cups'], pt: ['Pints', 'pints'], qt: ['Quarts', 'quarts'], gal: ['Gallons', 'gallons'], galuk: ['UK Gallons', 'uk-gallons'], ft3: ['Cubic Feet', 'cubic-feet'], in3: ['Cubic Inches', 'cubic-inches'], yd3: ['Cubic Yards', 'cubic-yards'], bbl: ['Barrels', 'barrels'] },
    speed: { mps: ['Meters per Second', 'mps'], kmh: ['km/h', 'kmh'], mph: ['mph', 'mph'], kn: ['Knots', 'knots'], fps: ['Feet per Second', 'fps'], mach: ['Mach', 'mach'] },
    time: { ms: ['Milliseconds', 'milliseconds'], s: ['Seconds', 'seconds'], min: ['Minutes', 'minutes'], h: ['Hours', 'hours'], d: ['Days', 'days'], wk: ['Weeks', 'weeks'], mo: ['Months', 'months'], yr: ['Years', 'years'], dec: ['Decades', 'decades'] },
    data: { b: ['Bits', 'bits'], B: ['Bytes', 'bytes'], KB: ['KB', 'kb'], MB: ['MB', 'mb'], GB: ['GB', 'gb'], TB: ['TB', 'tb'], PB: ['PB', 'pb'], KiB: ['KiB', 'kib'], MiB: ['MiB', 'mib'], GiB: ['GiB', 'gib'], TiB: ['TiB', 'tib'] },
    pressure: { pa: ['Pascals', 'pascals'], kpa: ['kPa', 'kpa'], bar: ['Bar', 'bar'], psi: ['PSI', 'psi'], atm: ['Atmospheres', 'atm'], mmhg: ['mmHg', 'mmhg'], inhg: ['inHg', 'inhg'] },
    energy: { j: ['Joules', 'joules'], kj: ['Kilojoules', 'kj'], cal: ['Calories', 'calories'], kcal: ['Kilocalories', 'kcal'], wh: ['Watt-hours', 'watt-hours'], kwh: ['kWh', 'kwh'], btu: ['BTU', 'btu'], ev: ['Electronvolts', 'ev'] },
    power: { w: ['Watts', 'watts'], kw: ['Kilowatts', 'kw'], mw: ['Megawatts', 'mw'], hp: ['Horsepower', 'hp'], ps: ['Metric Horsepower', 'ps'], btuh: ['BTU/h', 'btu-h'], ton: ['Tons of Refrigeration', 'tons-ac'] },
    angle: { deg: ['Degrees', 'degrees'], rad: ['Radians', 'radians'], grad: ['Gradians', 'gradians'], turn: ['Turns', 'turns'], arcmin: ['Arcminutes', 'arcminutes'], arcsec: ['Arcseconds', 'arcseconds'] },
    fuel: { kml: ['km/L', 'kmpl'], l100: ['L/100km', 'l-100km'], mpg: ['MPG (US)', 'mpg'], mpguk: ['MPG (UK)', 'mpg-uk'] },
    frequency: { hz: ['Hertz', 'hz'], khz: ['kHz', 'khz'], mhz: ['MHz', 'mhz'], ghz: ['GHz', 'ghz'], rpm: ['RPM', 'rpm'], bpm: ['BPM', 'bpm'], rads: ['Radians per Second', 'rad-s'] },
    force: { n: ['Newtons', 'newtons'], kn: ['Kilonewtons', 'kn'], lbf: ['Pound-force', 'lbf'], kgf: ['Kilogram-force', 'kgf'], ozf: ['Ounce-force', 'ozf'], dyn: ['Dynes', 'dynes'], tf: ['Tonne-force', 'tf'] },
    torque: { nm: ['Newton Meters', 'nm'], knm: ['kN·m', 'knm'], lbft: ['Pound-feet', 'lb-ft'], lbin: ['Pound-inches', 'lb-in'], kgfm: ['kgf·m', 'kgf-m'], ozin: ['Ounce-inches', 'oz-in'] },
    density: { kgm3: ['kg/m³', 'kg-m3'], gcm3: ['g/cm³', 'g-cm3'], kgl: ['kg/L', 'kg-l'], gml: ['g/mL', 'g-ml'], lbft3: ['lb/ft³', 'lb-ft3'], lbin3: ['lb/in³', 'lb-in3'], lbgal: ['lb/gal', 'lb-gal'], ozin3: ['oz/in³', 'oz-in3'] },
    flow: { lps: ['Liters per Second', 'lps'], lpm: ['Liters per Minute', 'lpm'], lph: ['Liters per Hour', 'lph'], m3s: ['m³/s', 'm3-s'], m3h: ['m³/h', 'm3-h'], gpm: ['Gallons per Minute', 'gpm'], cfm: ['CFM', 'cfm'], cfs: ['Cubic Feet per Second', 'cfs'], mls: ['mL/s', 'ml-s'] },
    datarate: { bps: ['bps', 'bps'], kbps: ['Kbps', 'kbps'], mbps: ['Mbps', 'mbps'], gbps: ['Gbps', 'gbps'], Bps: ['B/s', 'bytes-s'], KBps: ['KB/s', 'kb-s'], MBps: ['MB/s', 'mb-s'], GBps: ['GB/s', 'gb-s'] },
    cooking: { ml: ['Milliliters', 'ml'], l: ['Liters', 'liters'], tsp: ['Teaspoons', 'teaspoons'], tbsp: ['Tablespoons', 'tablespoons'], floz: ['Fluid Ounces', 'fl-oz'], cup: ['Cups', 'cups'], cupm: ['Metric Cups', 'metric-cups'], cupuk: ['UK Cups', 'uk-cups'], pt: ['Pints', 'pints'], qt: ['Quarts', 'quarts'], gal: ['Gallons', 'gallons'], tbspau: ['Australian Tablespoons', 'au-tablespoons'], dash: ['Dashes', 'dashes'] },
    shoe: { cm: ['Foot Length (cm)', 'cm'], eu: ['EU Shoe Size', 'eu'], ukm: ['UK Men’s Shoe Size', 'uk-men'], usm: ['US Men’s Shoe Size', 'us-men'], usw: ['US Women’s Shoe Size', 'us-women'], inch: ['Foot Length (inches)', 'inches'] },
    ring: { mm: ['Inner Diameter (mm)', 'mm'], circ: ['Circumference (mm)', 'circumference'], us: ['US Ring Size', 'us'], eu: ['EU Ring Size', 'eu'] }
  };
  var GROUP = { length: 'converters/length', weight: 'converters/weight', temperature: 'converters/temperature', area: 'converters/area', volume: 'converters/volume', speed: 'converters/speed', time: 'converters/time-units', data: 'converters/data-units', datarate: 'converters/data-units', pressure: 'converters/pressure-force', force: 'converters/pressure-force', torque: 'converters/pressure-force', energy: 'converters/energy-power', power: 'converters/energy-power', angle: 'converters/angle-frequency', frequency: 'converters/angle-frequency', fuel: 'converters/fuel-economy', density: 'converters/weight', flow: 'converters/volume', cooking: 'cooking/cook-measures', shoe: 'converters/sizes', ring: 'converters/sizes' };

  /* undirected pairs; each yields two pages (A to B and B to A) when the id is free */
  var PAIRS = {
    length: 'mm-cm mm-in mm-m cm-m cm-in cm-ft cm-mm m-ft m-in m-yd m-km m-mi km-mi km-ft km-nmi in-ft in-m ft-yd ft-mi yd-in mi-yd nmi-mi um-mm nm-um',
    weight: 'mg-g g-oz g-lb g-kg kg-lb kg-oz kg-st kg-t lb-oz lb-st lb-ton_us t-lb t-ton_us ton_us-kg ct-g tola-g tola-kg st-lb oz-kg',
    temperature: 'c-k f-k c-r',
    area: 'm2-ft2 m2-yd2 m2-ac m2-ha ft2-yd2 ft2-ac ac-ha ac-ft2 ha-ft2 km2-mi2 km2-ha km2-m2 mi2-ac in2-cm2 cm2-m2 ft2-in2 guntha-ft2 guntha-m2 guntha-ac cent-ft2 cent-m2 cent-ac bigha-ac bigha-m2 marla-ft2 kanal-marla kanal-ft2 yd2-ft2 ac-guntha ha-guntha',
    volume: 'l-gal l-ml l-m3 l-floz l-cup l-qt l-pt ml-floz ml-cup ml-tsp ml-tbsp gal-galuk gal-qt gal-pt gal-cup gal-floz ft3-l ft3-m3 m3-gal cup-floz cup-tbsp tbsp-tsp floz-tbsp bbl-l bbl-gal in3-cm3 cm3-ml yd3-m3 galuk-l',
    speed: 'kmh-mph kmh-mps kmh-kn mph-mps mph-kn mph-fps mps-fps mps-kn mach-kmh mach-mph',
    time: 's-min min-h h-d d-wk wk-mo mo-yr d-yr s-h min-d h-wk ms-s d-mo wk-yr h-yr h-s min-ms',
    data: 'b-B B-KB KB-MB MB-GB GB-TB TB-PB KB-B MB-B GB-B KiB-MiB MiB-GiB GiB-TiB GB-GiB MB-MiB TB-TiB KB-KiB MB-KB GB-KB TB-MB',
    pressure: 'psi-bar psi-kpa psi-pa psi-atm psi-mmhg bar-kpa bar-atm bar-pa atm-pa atm-mmhg kpa-pa inhg-kpa inhg-mmhg mmhg-pa mmhg-kpa',
    energy: 'j-kj j-cal kj-kcal cal-kcal kcal-j wh-kwh kwh-j kwh-kcal kwh-btu btu-j btu-kj btu-wh kj-kwh ev-j kcal-btu',
    power: 'w-kw kw-mw w-hp kw-hp hp-ps kw-ps w-btuh btuh-kw ton-kw ton-btuh hp-btuh',
    angle: 'deg-rad deg-grad deg-turn rad-turn deg-arcmin arcmin-arcsec deg-arcsec',
    fuel: 'kml-l100 kml-mpg l100-mpg mpg-mpguk',
    frequency: 'hz-khz khz-mhz mhz-ghz hz-rpm rpm-rads hz-rads hz-ghz',
    force: 'n-kn n-lbf n-kgf kn-lbf kgf-lbf n-dyn tf-kn',
    torque: 'nm-lbft nm-knm nm-lbin lbft-lbin nm-kgfm kgfm-lbft nm-ozin',
    density: 'kgm3-gcm3 kgm3-lbft3 gcm3-lbin3 gml-kgl kgl-lbgal gcm3-lbft3',
    flow: 'lps-lpm lpm-lph lpm-gpm m3h-lpm m3s-lps cfm-lps cfm-m3h gpm-lps lph-mls',
    datarate: 'bps-kbps kbps-mbps mbps-gbps mbps-MBps gbps-GBps kbps-KBps mbps-kbps',
    cooking: 'cup-ml cup-tbsp cup-tsp cup-floz tbsp-tsp tbsp-ml tsp-ml floz-ml pt-cup qt-cup qt-l gal-qt dash-tsp cupm-ml cupuk-ml tbspau-tsp tbspau-ml l-cup tbsp-cup',
    shoe: 'usm-eu usm-ukm usw-eu usm-usw cm-usm cm-eu inch-usm ukm-eu',
    ring: 'us-eu us-mm mm-circ'
  };
  var DONE = {};
  function base(g, k) { var x = U[g].u[k]; return x && x[1]; }
  function num(x) {
    if (!isFinite(x)) return '?';
    var a = Math.abs(x);
    if (a >= 1e6 || (a < 1e-4 && a > 0)) return x.toExponential(4).replace(/\.?0+e/, 'e');
    return String(+x.toPrecision(7));
  }
  function addPair(g, a, b) {
    var wa = W[g][a], wb = W[g][b]; if (!wa || !wb || !U[g].u[a] || !U[g].u[b]) return;
    var id = wa[1] + '-to-' + wb[1] + '-converter';
    var old = [wa[1] + '-to-' + wb[1], wa[1] + '-to-' + wb[1] + '-converter'];
    if (DONE[id] || CW.defs[old[0]] || CW.defs[old[1]]) return; DONE[id] = 1;
    var title = wa[0] + ' to ' + wb[0] + ' Converter', val = 1, formula;
    if (!U[g].special && base(g, a) && base(g, b)) {
      var ratio = base(g, a) / base(g, b);
      if (ratio < 0.002) val = 1000; else if (ratio < 0.05) val = 100; else if (ratio > 5e5) val = 1;
      formula = '1 ' + wa[0] + ' = ' + num(ratio) + ' ' + wb[0] + '.  1 ' + wb[0] + ' = ' + num(1 / ratio) + ' ' + wa[0] + '.';
    } else if (g === 'temperature') {
      val = a === 'f' ? 98.6 : 25; formula = 'Temperature scales use offsets as well as factors; the exact formula is applied automatically.';
    } else { formula = 'Conversion is applied between ' + wa[0] + ' and ' + wb[0] + ' using the standard definitions.'; }
    CW.register({
      id: id, title: title, g: GROUP[g], type: 'converter', group: g, from: a, to: b, value: val, inputs: [], faq: [],
      desc: 'Convert ' + wa[0].toLowerCase() + ' to ' + wb[0].toLowerCase() + ' instantly, with a quick reference table.', formula: formula
    });
  }
  Object.keys(PAIRS).forEach(function (g) {
    PAIRS[g].split(' ').forEach(function (p) { var s = p.split('-'); addPair(g, s[0], s[1]); addPair(g, s[1], s[0]); });
  });

  /* ---------- Currency pairs ---------- */
  var CUR = { USD: 'US Dollar', INR: 'Indian Rupee', EUR: 'Euro', GBP: 'British Pound', AED: 'UAE Dirham', SAR: 'Saudi Riyal', CAD: 'Canadian Dollar', AUD: 'Australian Dollar', SGD: 'Singapore Dollar', JPY: 'Japanese Yen', CNY: 'Chinese Yuan', PKR: 'Pakistani Rupee', BDT: 'Bangladeshi Taka', NPR: 'Nepalese Rupee', LKR: 'Sri Lankan Rupee', MXN: 'Mexican Peso', BRL: 'Brazilian Real', ZAR: 'South African Rand', NGN: 'Nigerian Naira', PHP: 'Philippine Peso', CHF: 'Swiss Franc', KRW: 'South Korean Won', TRY: 'Turkish Lira', IDR: 'Indonesian Rupiah', MYR: 'Malaysian Ringgit', THB: 'Thai Baht', VND: 'Vietnamese Dong', EGP: 'Egyptian Pound', QAR: 'Qatari Riyal', KWD: 'Kuwaiti Dinar', HKD: 'Hong Kong Dollar', NZD: 'New Zealand Dollar', SEK: 'Swedish Krona', NOK: 'Norwegian Krone', DKK: 'Danish Krone', PLN: 'Polish Zloty', RUB: 'Russian Ruble', KES: 'Kenyan Shilling', GHS: 'Ghanaian Cedi', ILS: 'Israeli Shekel', ARS: 'Argentine Peso', CLP: 'Chilean Peso', COP: 'Colombian Peso', UAH: 'Ukrainian Hryvnia', CZK: 'Czech Koruna', HUF: 'Hungarian Forint', OMR: 'Omani Rial', BHD: 'Bahraini Dinar', TWD: 'New Taiwan Dollar', MAD: 'Moroccan Dirham' };
  var CP = 'USD-INR EUR-INR GBP-INR AED-INR SAR-INR CAD-INR AUD-INR SGD-INR JPY-INR CNY-INR QAR-INR KWD-INR CHF-INR MYR-INR THB-INR NZD-INR OMR-INR BHD-INR HKD-INR ' +
    'USD-EUR USD-GBP USD-JPY USD-CAD USD-AUD USD-CNY USD-AED USD-SAR USD-PKR USD-BDT USD-NPR USD-LKR USD-MXN USD-BRL USD-ZAR USD-NGN USD-PHP USD-SGD USD-CHF USD-KRW USD-TRY USD-IDR USD-MYR USD-THB USD-VND USD-EGP USD-QAR USD-KWD USD-HKD USD-NZD USD-SEK USD-NOK USD-DKK USD-PLN USD-RUB USD-KES USD-GHS USD-ILS USD-ARS USD-CLP USD-COP USD-UAH USD-CZK USD-HUF USD-TWD USD-MAD ' +
    'EUR-USD EUR-GBP EUR-JPY EUR-CHF EUR-AUD EUR-CAD EUR-AED EUR-PLN EUR-TRY GBP-USD GBP-EUR GBP-JPY GBP-AUD GBP-CAD GBP-AED AUD-USD AUD-NZD AUD-JPY CAD-USD NZD-USD SGD-USD AED-USD AED-PKR AED-PHP SAR-PKR SAR-USD';
  CP.split(' ').forEach(function (p) {
    var s = p.split('-'), a = s[0], b = s[1];
    [[a, b], [b, a]].forEach(function (q) {
      var id = q[0].toLowerCase() + '-to-' + q[1].toLowerCase() + '-converter';
      if (CW.defs[id]) return;
      var n1 = CUR[q[0]] || q[0], n2 = CUR[q[1]] || q[1];
      CW.X(id, 'currency-converter', q[0] + ' to ' + q[1] + ' — ' + n1 + ' to ' + n2, 'converters/currency',
        'Convert ' + n1 + ' (' + q[0] + ') to ' + n2 + ' (' + q[1] + ') at an exchange rate that updates automatically.',
        { a: { v: 1 }, f: { v: q[0] }, t: { v: q[1] } });
    });
  });

  /* ---------- Crypto pairs ---------- */
  var CC = { bitcoin: ['Bitcoin', 'BTC', 'btc'], ethereum: ['Ethereum', 'ETH', 'eth'], tether: ['Tether', 'USDT', 'usdt'], binancecoin: ['BNB', 'BNB', 'bnb'], solana: ['Solana', 'SOL', 'sol'], ripple: ['XRP', 'XRP', 'xrp'], cardano: ['Cardano', 'ADA', 'ada'], dogecoin: ['Dogecoin', 'DOGE', 'doge'], litecoin: ['Litecoin', 'LTC', 'ltc'], 'shiba-inu': ['Shiba Inu', 'SHIB', 'shib'] };
  Object.keys(CC).forEach(function (coin) {
    ['USD', 'INR', 'EUR', 'GBP'].forEach(function (cur) {
      var id = CC[coin][2] + '-to-' + cur.toLowerCase() + '-converter';
      if (CW.defs[id]) return;
      CW.X(id, 'crypto-converter', CC[coin][1] + ' to ' + cur + ' — ' + CC[coin][0] + ' to ' + (CUR[cur] || cur), 'tech/crypto',
        'Convert ' + CC[coin][0] + ' (' + CC[coin][1] + ') to ' + (CUR[cur] || cur) + ' at automatically updated prices.', { a: { v: 1 }, c: { v: coin }, t: { v: cur } });
    });
  });
})(window.CW);
