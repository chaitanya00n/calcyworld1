/*!
 * Calcyworld Engine — renders any calculator definition into an accessible, live-updating widget.
 * Definition shape:
 *  { id, title, inputs:[{k,l,t,v,...}], calc:function(values, ctx){ return {results:[], table, chart, note} } }
 *  Input types: money | number | percent | int | select | seg | date | time | text | textarea | check | rows
 */
(function (root) {
  'use strict';
  var CW = root.CW = root.CW || {};
  CW.defs = CW.defs || {};
  CW.register = function (d) {
    if (Array.isArray(d)) { d.forEach(CW.register); return; }
    CW.defs[d.id] = d;
  };
  CW.resolve = function (id) {
    var d = CW.defs[id];
    if (!d) return null;
    if (d.extends) {
      var base = CW.resolve(d.extends);
      if (!base) return d;
      var merged = {};
      Object.keys(base).forEach(function (k) { merged[k] = base[k]; });
      Object.keys(d).forEach(function (k) { if (k !== 'extends') merged[k] = d[k]; });
      if (d.set) {
        merged.inputs = base.inputs.map(function (inp) {
          if (!d.set[inp.k]) return inp;
          var c = {}; Object.keys(inp).forEach(function (x) { c[x] = inp[x]; });
          Object.keys(d.set[inp.k]).forEach(function (x) { c[x] = d.set[inp.k][x]; });
          return c;
        });
      }
      return merged;
    }
    return d;
  };

  /* ===================== Units (for converters) ===================== */
  CW.UNITS = {
    length: { base: 'm', u: { mm: ['Millimetre', 0.001], cm: ['Centimetre', 0.01], m: ['Metre', 1], km: ['Kilometre', 1000], in: ['Inch', 0.0254],
      ft: ['Foot', 0.3048], yd: ['Yard', 0.9144], mi: ['Mile', 1609.344], nmi: ['Nautical mile', 1852], um: ['Micrometre', 1e-6], nm: ['Nanometre', 1e-9] } },
    weight: { base: 'kg', u: { mg: ['Milligram', 1e-6], g: ['Gram', 0.001], kg: ['Kilogram', 1], t: ['Tonne', 1000], oz: ['Ounce', 0.028349523125],
      lb: ['Pound', 0.45359237], st: ['Stone', 6.35029318], ton_us: ['US ton', 907.18474], ton_uk: ['UK ton', 1016.0469088], ct: ['Carat', 0.0002], tola: ['Tola', 0.0116638] } },
    temperature: { special: true, u: { c: ['Celsius'], f: ['Fahrenheit'], k: ['Kelvin'], r: ['Rankine'] } },
    area: { base: 'm2', u: { mm2: ['Square millimetre', 1e-6], cm2: ['Square centimetre', 1e-4], m2: ['Square metre', 1], km2: ['Square kilometre', 1e6],
      in2: ['Square inch', 0.00064516], ft2: ['Square foot', 0.09290304], yd2: ['Square yard', 0.83612736], ac: ['Acre', 4046.8564224], ha: ['Hectare', 10000],
      mi2: ['Square mile', 2589988.110336], guntha: ['Guntha', 101.17141056], cent: ['Cent', 40.468564224], bigha: ['Bigha (Rajasthan, approx.)', 2529.285264], marla: ['Marla', 25.29285264], kanal: ['Kanal', 505.857] } },
    volume: { base: 'l', u: { ml: ['Millilitre', 0.001], l: ['Litre', 1], m3: ['Cubic metre', 1000], cm3: ['Cubic centimetre', 0.001], tsp: ['Teaspoon (US)', 0.00492892],
      tbsp: ['Tablespoon (US)', 0.0147868], floz: ['Fluid ounce (US)', 0.0295735], cup: ['Cup (US)', 0.236588], pt: ['Pint (US)', 0.473176], qt: ['Quart (US)', 0.946353],
      gal: ['Gallon (US)', 3.785411784], galuk: ['Gallon (UK)', 4.54609], ft3: ['Cubic foot', 28.3168466], in3: ['Cubic inch', 0.016387064], yd3: ['Cubic yard', 764.554858], bbl: ['Oil barrel', 158.987294928] } },
    speed: { base: 'mps', u: { mps: ['Metres per second', 1], kmh: ['Kilometres per hour', 1 / 3.6], mph: ['Miles per hour', 0.44704], kn: ['Knot', 0.514444], fps: ['Feet per second', 0.3048], mach: ['Mach (sea level)', 340.29] } },
    time: { base: 's', u: { ms: ['Millisecond', 0.001], s: ['Second', 1], min: ['Minute', 60], h: ['Hour', 3600], d: ['Day', 86400], wk: ['Week', 604800],
      mo: ['Month (avg)', 2629746], yr: ['Year (365.25 d)', 31557600], dec: ['Decade', 315576000] } },
    data: { base: 'B', u: { b: ['Bit', 0.125], B: ['Byte', 1], KB: ['Kilobyte (1000)', 1e3], MB: ['Megabyte (1000²)', 1e6], GB: ['Gigabyte', 1e9], TB: ['Terabyte', 1e12], PB: ['Petabyte', 1e15],
      KiB: ['Kibibyte (1024)', 1024], MiB: ['Mebibyte', 1048576], GiB: ['Gibibyte', 1073741824], TiB: ['Tebibyte', 1099511627776] } },
    pressure: { base: 'pa', u: { pa: ['Pascal', 1], kpa: ['Kilopascal', 1000], bar: ['Bar', 1e5], psi: ['PSI', 6894.757293], atm: ['Atmosphere', 101325], mmhg: ['mmHg', 133.322387], inhg: ['inHg', 3386.389] } },
    energy: { base: 'j', u: { j: ['Joule', 1], kj: ['Kilojoule', 1000], cal: ['Calorie', 4.184], kcal: ['Kilocalorie', 4184], wh: ['Watt-hour', 3600], kwh: ['Kilowatt-hour', 3.6e6], btu: ['BTU', 1055.05585], ev: ['Electronvolt', 1.602176634e-19] } },
    power: { base: 'w', u: { w: ['Watt', 1], kw: ['Kilowatt', 1000], mw: ['Megawatt', 1e6], hp: ['Horsepower (mech.)', 745.699872], ps: ['Metric horsepower', 735.49875], btuh: ['BTU per hour', 0.29307107], ton: ['Ton of refrigeration', 3516.8528] } },
    angle: { base: 'rad', u: { deg: ['Degree', Math.PI / 180], rad: ['Radian', 1], grad: ['Gradian', Math.PI / 200], turn: ['Turn', 2 * Math.PI], arcmin: ['Arcminute', Math.PI / 10800], arcsec: ['Arcsecond', Math.PI / 648000] } },
    fuel: { special: true, u: { kml: ['Kilometres per litre'], l100: ['Litres per 100 km'], mpg: ['Miles per gallon (US)'], mpguk: ['Miles per gallon (UK)'] } },
    frequency: { base: 'hz', u: { hz: ['Hertz', 1], khz: ['Kilohertz', 1e3], mhz: ['Megahertz', 1e6], ghz: ['Gigahertz', 1e9], rpm: ['Revolutions per minute', 1 / 60], bpm: ['Beats per minute', 1 / 60], rads: ['Radians per second', 1 / (2 * Math.PI)] } },
    force: { base: 'n', u: { n: ['Newton', 1], kn: ['Kilonewton', 1000], lbf: ['Pound-force', 4.4482216153], kgf: ['Kilogram-force', 9.80665], ozf: ['Ounce-force', 0.2780138509], dyn: ['Dyne', 1e-5], tf: ['Tonne-force', 9806.65] } },
    torque: { base: 'nm', u: { nm: ['Newton-metre', 1], knm: ['Kilonewton-metre', 1000], lbft: ['Pound-foot', 1.3558179483], lbin: ['Pound-inch', 0.1129848290], kgfm: ['Kilogram-force metre', 9.80665], ozin: ['Ounce-inch', 0.0070615518] } },
    density: { base: 'kgm3', u: { kgm3: ['Kilogram per cubic metre', 1], gcm3: ['Gram per cubic centimetre', 1000], kgl: ['Kilogram per litre', 1000], gml: ['Gram per millilitre', 1000], lbft3: ['Pound per cubic foot', 16.01846337], lbin3: ['Pound per cubic inch', 27679.9047], lbgal: ['Pound per US gallon', 119.8264273], ozin3: ['Ounce per cubic inch', 1729.994] } },
    flow: { base: 'lps', u: { lps: ['Litre per second', 1], lpm: ['Litre per minute', 1 / 60], lph: ['Litre per hour', 1 / 3600], m3s: ['Cubic metre per second', 1000], m3h: ['Cubic metre per hour', 1000 / 3600], gpm: ['US gallon per minute', 0.0630901964], cfm: ['Cubic foot per minute', 0.4719474432], cfs: ['Cubic foot per second', 28.316846592], mls: ['Millilitre per second', 0.001] } },
    datarate: { base: 'bps', u: { bps: ['Bit per second', 1], kbps: ['Kilobit per second', 1e3], mbps: ['Megabit per second', 1e6], gbps: ['Gigabit per second', 1e9], Bps: ['Byte per second', 8], KBps: ['Kilobyte per second', 8e3], MBps: ['Megabyte per second', 8e6], GBps: ['Gigabyte per second', 8e9] } },
    cooking: { base: 'ml', u: { ml: ['Millilitre', 1], l: ['Litre', 1000], tsp: ['Teaspoon (US)', 4.92892159], tbsp: ['Tablespoon (US)', 14.78676478], floz: ['Fluid ounce (US)', 29.5735295625], cup: ['Cup (US)', 236.5882365], cupm: ['Cup (metric, 250 ml)', 250], cupuk: ['Cup (UK)', 284.130625], pt: ['Pint (US)', 473.176473], qt: ['Quart (US)', 946.352946], gal: ['Gallon (US)', 3785.411784], tbspau: ['Tablespoon (AU)', 20], dash: ['Dash', 0.616115] } },
    shoe: { special: true, u: { cm: ['Foot length (cm)'], eu: ['EU size'], ukm: ['UK size (men)'], usm: ['US size (men)'], usw: ['US size (women)'], inch: ['Foot length (inch)'] } },
    ring: { special: true, u: { mm: ['Inner diameter (mm)'], circ: ['Circumference (mm)'], us: ['US ring size'], eu: ['EU ring size (circumference)'] } }
  };
  function tempConv(v, f, t) {
    var c = f === 'c' ? v : f === 'f' ? (v - 32) * 5 / 9 : f === 'k' ? v - 273.15 : (v - 491.67) * 5 / 9;
    return t === 'c' ? c : t === 'f' ? c * 9 / 5 + 32 : t === 'k' ? c + 273.15 : (c + 273.15) * 9 / 5;
  }
  function fuelConv(v, f, t) {
    var kml = f === 'kml' ? v : f === 'l100' ? 100 / v : f === 'mpg' ? v * 0.425143707 : v * 0.354006189;
    return t === 'kml' ? kml : t === 'l100' ? 100 / kml : t === 'mpg' ? kml / 0.425143707 : kml / 0.354006189;
  }
  function shoeConv(v, f, t) {
    var cm = f === 'cm' ? v : f === 'inch' ? v * 2.54 : f === 'eu' ? (v - 2.25) / 1.5 : f === 'ukm' ? (v + 23) / 3 * 2.54 : f === 'usm' ? (v + 22) / 3 * 2.54 : (v + 20.5) / 3 * 2.54;
    var inch = cm / 2.54;
    return t === 'cm' ? cm : t === 'inch' ? inch : t === 'eu' ? cm * 1.5 + 2.25 : t === 'ukm' ? inch * 3 - 23 : t === 'usm' ? inch * 3 - 22 : inch * 3 - 20.5;
  }
  function ringConv(v, f, t) {
    var d = f === 'mm' ? v : f === 'circ' ? v / Math.PI : f === 'us' ? 11.63 + 0.8128 * v : v / Math.PI;
    return t === 'mm' ? d : t === 'circ' ? d * Math.PI : t === 'us' ? (d - 11.63) / 0.8128 : d * Math.PI;
  }
  CW.convertUnit = function (group, v, from, to) {
    var g = CW.UNITS[group];
    if (group === 'temperature') return tempConv(v, from, to);
    if (group === 'fuel') return fuelConv(v, from, to);
    if (group === 'shoe') return shoeConv(v, from, to);
    if (group === 'ring') return ringConv(v, from, to);
    return v * g.u[from][1] / g.u[to][1];
  };

  /* ========================== Mini charts ========================== */
  var COLORS = ['var(--cw-c1)', 'var(--cw-c2)', 'var(--cw-c3)', 'var(--cw-c4)', 'var(--cw-c5)'];
  function donut(data, fmtFn) {
    var total = data.reduce(function (a, d) { return a + Math.max(0, d.v); }, 0);
    if (!total) return '';
    var r = 52, c = 2 * Math.PI * r, off = 0, segs = '';
    data.forEach(function (d, i) {
      var frac = Math.max(0, d.v) / total, len = frac * c;
      segs += '<circle r="' + r + '" cx="70" cy="70" fill="none" stroke="' + (d.c || COLORS[i % 5]) + '" stroke-width="22" stroke-dasharray="' +
        len.toFixed(2) + ' ' + (c - len).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 70 70)"></circle>';
      off += len;
    });
    var legend = data.map(function (d, i) {
      return '<li><span class="cw-dot" style="background:' + (d.c || COLORS[i % 5]) + '"></span>' + CW.esc(d.l) +
        '<b>' + fmtFn(d.v) + '</b><em>' + CW.fmt.num(Math.max(0, d.v) / total * 100, 1) + '%</em></li>';
    }).join('');
    return '<div class="cw-chart cw-donut"><svg viewBox="0 0 140 140" role="img" aria-label="Breakdown chart">' + segs + '</svg><ul>' + legend + '</ul></div>';
  }
  function lineChart(series, labels, fmtFn, kind) {
    var W = 560, H = 220, P = { l: 8, r: 8, t: 12, b: 26 };
    var all = []; series.forEach(function (s) { all = all.concat(s.pts); });
    var max = Math.max.apply(null, all.concat([0])), min = Math.min.apply(null, all.concat([0]));
    if (max === min) max = min + 1;
    var n = labels.length, x = function (i) { return P.l + (n > 1 ? i / (n - 1) : 0.5) * (W - P.l - P.r); };
    var y = function (v) { return P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b); };
    var body = '';
    if (kind === 'bar') {
      var bw = (W - P.l - P.r) / n / (series.length + 0.6);
      series.forEach(function (s, si) {
        s.pts.forEach(function (v, i) {
          var cx = P.l + (i + 0.3) * (W - P.l - P.r) / n + si * bw;
          body += '<rect x="' + cx.toFixed(1) + '" y="' + y(Math.max(v, 0)).toFixed(1) + '" width="' + Math.max(1, bw - 2).toFixed(1) + '" height="' +
            Math.abs(y(v) - y(0)).toFixed(1) + '" rx="2" fill="' + (s.c || COLORS[si % 5]) + '"><title>' + CW.esc(labels[i] + ': ' + fmtFn(v)) + '</title></rect>';
        });
      });
    } else {
      series.forEach(function (s, si) {
        var d = s.pts.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
        var col = s.c || COLORS[si % 5];
        if (si === 0) body += '<path d="' + d + ' L' + x(n - 1).toFixed(1) + ' ' + y(min) + ' L' + x(0).toFixed(1) + ' ' + y(min) + ' Z" fill="' + col + '" opacity=".12"></path>';
        body += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"></path>';
      });
    }
    var ticks = '', step = Math.max(1, Math.ceil(n / 8));
    labels.forEach(function (l, i) {
      if (i % step === 0 || i === n - 1) ticks += '<text x="' + (kind === 'bar' ? P.l + (i + 0.5) * (W - P.l - P.r) / n : x(i)).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="' + (kind !== 'bar' && i === n - 1 && n > 2 ? 'end' : 'middle') + '">' + CW.esc(l) + '</text>';
    });
    var legend = series.length > 1 ? '<ul class="cw-legend">' + series.map(function (s, i) {
      return '<li><span class="cw-dot" style="background:' + (s.c || COLORS[i % 5]) + '"></span>' + CW.esc(s.l) + '</li>';
    }).join('') + '</ul>' : '';
    return '<div class="cw-chart cw-line"><svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Chart">' +
      '<line x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + y(0) + '" y2="' + y(0) + '" class="cw-axis"></line>' + body + '<g class="cw-ticks">' + ticks + '</g></svg>' + legend + '</div>';
  }


  /* Scatter / XY chart: series = [{l, pts:[[x,y],..], line:true|false}] — dots by default, a plain line when line:true (regression line, curves). */
  function niceTicks(lo, hi, n) {
    if (!isFinite(lo) || !isFinite(hi)) return [0, 1];
    if (hi === lo) { hi = lo + 1; }
    var span = hi - lo, step = Math.pow(10, Math.floor(Math.log(span / n) / Math.LN10)), err = span / n / step;
    step *= err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1;
    var a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step, t = [];
    for (var v = a; v <= b + step / 2; v += step) t.push(+v.toFixed(10));
    return t;
  }
  function scatterChart(series, fmtFn) {
    var W = 560, H = 280, P = { l: 44, r: 12, t: 12, b: 26 }, xs = [], ys = [];
    series.forEach(function (s) { s.pts.forEach(function (p) { if (isFinite(p[0]) && isFinite(p[1])) { xs.push(p[0]); ys.push(p[1]); } }); });
    if (!xs.length) return '';
    var xt = niceTicks(Math.min.apply(null, xs), Math.max.apply(null, xs), 6), yt = niceTicks(Math.min.apply(null, ys), Math.max.apply(null, ys), 5);
    var x0 = xt[0], x1 = xt[xt.length - 1], y0 = yt[0], y1 = yt[yt.length - 1];
    var X = function (v) { return P.l + (v - x0) / (x1 - x0) * (W - P.l - P.r); }, Y = function (v) { return P.t + (1 - (v - y0) / (y1 - y0)) * (H - P.t - P.b); };
    var grid = '', body = '';
    yt.forEach(function (v) { grid += '<line x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '" class="cw-grid-l"></line><text x="' + (P.l - 6) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end">' + CW.esc(fmtFn(v)) + '</text>'; });
    xt.forEach(function (v) { grid += '<text x="' + X(v).toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle">' + CW.esc(CW.fmt.num(v, 2)) + '</text>'; });
    series.forEach(function (s, si) {
      var col = s.c || COLORS[si % 5], pts = s.pts.filter(function (p) { return isFinite(p[0]) && isFinite(p[1]); });
      if (s.line) body += '<path d="' + pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join(' ') + '" fill="none" stroke="' + col + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"></path>';
      else pts.slice(0, 400).forEach(function (p) { body += '<circle cx="' + X(p[0]).toFixed(1) + '" cy="' + Y(p[1]).toFixed(1) + '" r="4.5" fill="' + col + '" fill-opacity=".8"><title>' + CW.esc(CW.fmt.num(p[0], 4) + ', ' + CW.fmt.num(p[1], 4)) + '</title></circle>'; });
    });
    var legend = series.length > 1 ? '<ul class="cw-legend">' + series.map(function (s, i) { return '<li><span class="cw-dot" style="background:' + (s.c || COLORS[i % 5]) + '"></span>' + CW.esc(s.l) + '</li>'; }).join('') + '</ul>' : '';
    return '<div class="cw-chart cw-line cw-xy"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Scatter chart">' + '<g class="cw-ticks">' + grid + '</g>' +
      '<line x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + Y(Math.max(y0, Math.min(0, y1))).toFixed(1) + '" y2="' + Y(Math.max(y0, Math.min(0, y1))).toFixed(1) + '" class="cw-axis"></line>' + body + '</svg>' + legend + '</div>';
  }

  /* ========================== Formatting ========================== */
  var FALIAS = { m: 'money', m2: 'money2', p: 'pct', n: 'num', i: 'int', f: 'fixed', t: 'text', d: 'date', b: 'text' };
  function fmtVal(v, f, r) {
    f = FALIAS[f] || f;
    switch (f) {
      case 'money': return CW.fmt.money(v, r && r.cur, r && r.dp !== undefined ? r.dp : undefined);
      case 'money2': return CW.fmt.money(v, r && r.cur, 2);
      case 'pct': return CW.fmt.pct(v, r && r.dp);
      case 'int': return CW.fmt.int(v);
      case 'fixed': return CW.fmt.fixed(v, r && r.dp !== undefined ? r.dp : 2);
      case 'date': return CW.fmt.date(v);
      case 'text': return CW.esc(v);
      case 'html': return v;
      default: return CW.fmt.num(v, r && r.dp);
    }
  }
  CW.fmtVal = fmtVal;

  /* ========================== Field rendering ========================== */
  function today(offsetDays) {
    var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + (offsetDays || 0));
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function defaultValue(inp, ctx) {
    var v = inp.v;
    if (typeof v === 'function') v = v(ctx);
    if (inp.t === 'money' && typeof v === 'number') {
      if (CW._cur) return v;
      var c = ctx.country.code;
      if (inp.local && inp.local[c] !== undefined) return inp.local[c];
      if (inp.base) { var cur = CW.currency(); if (inp.base === cur) return v; var cv = CW.convert(v, inp.base, cur); return cv == null ? v : CW.nice(cv); }
      return CW.localAmount(v);
    }
    if (inp.t === 'date' && (v === undefined || typeof v === 'number')) return today(v || 0);
    return v;
  }
  function fieldHTML(inp, val, uid) {
    var id = uid + '-' + inp.k, label = '<label for="' + id + '">' + CW.esc(inp.l) + (inp.help ? ' <span class="cw-help" title="' + CW.esc(inp.help) + '" tabindex="0" aria-label="' + CW.esc(inp.help) + '">?</span>' : '') + '</label>';
    var attrs = ' id="' + id + '" name="' + inp.k + '" data-k="' + inp.k + '"';
    var h = '';
    switch (inp.t) {
      case 'select':
        h = label + '<div class="cw-select"><select' + attrs + '>' + (typeof inp.o === 'function' ? inp.o() : inp.o).map(function (o) {
          var ov = Array.isArray(o) ? o[0] : o, ol = Array.isArray(o) ? o[1] : o;
          return '<option value="' + CW.esc(ov) + '"' + (String(ov) === String(val) ? ' selected' : '') + '>' + CW.esc(ol) + '</option>';
        }).join('') + '</select></div>';
        break;
      case 'seg':
        h = '<span class="cw-lbl" id="' + id + '-l">' + CW.esc(inp.l) + '</span><div class="cw-seg" role="radiogroup" aria-labelledby="' + id + '-l">' + inp.o.map(function (o, i) {
          var ov = Array.isArray(o) ? o[0] : o, ol = Array.isArray(o) ? o[1] : o;
          return '<label><input type="radio" name="' + uid + inp.k + '" data-k="' + inp.k + '" value="' + CW.esc(ov) + '"' + (String(ov) === String(val) ? ' checked' : '') + '><span>' + CW.esc(ol) + '</span></label>';
        }).join('') + '</div>';
        break;
      case 'check':
        h = '<label class="cw-check"><input type="checkbox"' + attrs + (val ? ' checked' : '') + '><span>' + CW.esc(inp.l) + '</span></label>';
        break;
      case 'textarea':
        h = label + '<textarea' + attrs + ' rows="' + (inp.rows || 4) + '" placeholder="' + CW.esc(inp.ph || '') + '">' + CW.esc(val || '') + '</textarea>';
        break;
      case 'date': h = label + '<input type="date"' + attrs + ' value="' + CW.esc(val) + '">'; break;
      case 'time': h = label + '<input type="time"' + attrs + ' step="' + (inp.step || 60) + '" value="' + CW.esc(val) + '">'; break;
      case 'text': h = label + '<input type="text"' + attrs + ' value="' + CW.esc(val) + '" placeholder="' + CW.esc(inp.ph || '') + '" autocomplete="off">'; break;
      case 'rows': h = '<span class="cw-lbl">' + CW.esc(inp.l) + '</span>' + rowsHTML(inp, val, uid); break;
      default: {
        var pre = inp.t === 'money' ? '<span class="cw-affix cw-pre" data-cur>' + CW.esc(CW.fmt.sym()) + '</span>' : (inp.pre ? '<span class="cw-affix cw-pre">' + CW.esc(inp.pre) + '</span>' : '');
        var suf = inp.t === 'percent' ? '<span class="cw-affix cw-suf">%</span>' : (inp.u ? '<span class="cw-affix cw-suf" data-u="' + inp.k + '">' + CW.esc(typeof inp.u === 'function' ? inp.u() : inp.u) + '</span>' : '');
        var shown = (val === '' || val === undefined || val === null) ? '' : (inp.t === 'money' ? CW.fmt.num(+val, 2) : String(val));
        h = label + '<div class="cw-input' + (pre ? ' has-pre' : '') + (suf ? ' has-suf' : '') + '">' + pre + '<input type="text" inputmode="decimal"' + attrs +
          ' value="' + CW.esc(shown) + '" autocomplete="off"' + (inp.ph ? ' placeholder="' + CW.esc(inp.ph) + '"' : '') + '>' + suf + '</div>';
        if (inp.slider) {
          h += '<input type="range" class="cw-range" tabindex="-1" aria-hidden="true" data-for="' + inp.k + '" min="' + inp.slider[0] + '" max="' + inp.slider[1] + '" step="' + (inp.slider[2] || 1) + '" value="' + (+val || 0) + '">';
        }
      }
    }
    return '<div class="cw-field cw-t-' + inp.t + (inp.wide ? ' cw-wide' : '') + '" data-field="' + inp.k + '">' + h + '</div>';
  }
  function rowsHTML(inp, rows, uid) {
    rows = rows || [];
    var head = '<tr>' + inp.cols.map(function (c) { return '<th scope="col">' + CW.esc(c.l) + '</th>'; }).join('') + '<th><span class="cw-sr">Remove</span></th></tr>';
    var body = rows.map(function (r, ri) { return rowHTML(inp, r, ri); }).join('');
    return '<div class="cw-rows" data-k="' + inp.k + '"><table><thead>' + head + '</thead><tbody>' + body + '</tbody></table>' +
      '<button type="button" class="cw-btn cw-add">+ ' + CW.esc(inp.add || 'Add row') + '</button></div>';
  }
  function rowHTML(inp, r, ri) {
    return '<tr>' + inp.cols.map(function (c, ci) {
      var v = r[ci] !== undefined ? r[ci] : (c.v !== undefined ? c.v : '');
      if (c.t === 'select') {
        return '<td><select data-c="' + ci + '" aria-label="' + CW.esc(c.l) + '">' + c.o.map(function (o) {
          var ov = Array.isArray(o) ? o[0] : o, ol = Array.isArray(o) ? o[1] : o;
          return '<option value="' + CW.esc(ov) + '"' + (String(ov) === String(v) ? ' selected' : '') + '>' + CW.esc(ol) + '</option>';
        }).join('') + '</select></td>';
      }
      return '<td><input type="text" ' + (c.t === 'text' ? '' : 'inputmode="decimal" ') + 'data-c="' + ci + '" aria-label="' + CW.esc(c.l) + '" value="' + CW.esc(v) + '"></td>';
    }).join('') + '<td><button type="button" class="cw-del" aria-label="Remove row">×</button></td></tr>';
  }

  /* ========================== Mount ========================== */
  var uidN = 0;
  CW.mount = function (el, id, extra) {
    var def = id === '__inline' ? extra : CW.resolve(id);
    if (!def) { el.innerHTML = '<p class="cw-error">Calculator not available.</p>'; return; }
    var app = { el: el, def: def, uid: 'cw' + (++uidN), touched: {}, tab: 'sum' };
    el.classList.add('cw-ready');
    if (def.type === 'converter') { mountConverter(app); return; }
    if (def.render) { def.render(el, ctxFor()); return; }
    build(app);
    CW.onCountry(function () { if (!el.isConnected) return; rebuild(app); });
    return app;
  };
  function ctxFor() {
    return {
      country: CW.country(), cur: CW.currency(), imperial: CW.imperial(), fmt: CW.fmt, money: function (v) { return CW.fmt.money(v); },
      preset: CW.preset, rate: CW.rate, convert: CW.convert, words: CW.wordsForCountry
    };
  }
  function urlValues() {
    var o = {}; try { new URLSearchParams(location.search).forEach(function (v, k) { o[k] = v; }); } catch (e) {} return o;
  }
  var T = function (k, d) { var K = 'e_' + k; return (CW.cfg && CW.cfg.i18n && CW.cfg.i18n[K]) || (CW.t && CW.t(K)) || d; };
  /* Labels inside every tool carry data-e so they can be re-translated when the visitor switches language. */
  var ED = { copy: 'Copy result', share: 'Share link', saveimg: 'Save image', print: 'Print / PDF', inputs: 'Inputs', reset: 'Reset', result: 'Result', seeall: 'Details',
    summary: 'Summary', details: 'Details', chart: 'Chart', schedule: 'Schedule', convert: 'Convert', value: 'Value', from: 'From', to: 'To', allconv: 'All conversions', typenum: 'Type a number to convert.', enter: 'Enter' };
  CW.relabel = function () {
    var els = document.querySelectorAll('.cw-calc [data-e]');
    for (var i = 0; i < els.length; i++) { var k = els[i].getAttribute('data-e'); els[i].textContent = T(k, ED[k]) + (els[i].getAttribute('data-es') || ''); }
  };
  var IC = {
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
    share: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    img: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 8"/>',
    print: '<path d="M7 9V3h10v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v7H7z"/>'
  };
  function actBtn(cls, ic, key, label) { return '<button type="button" class="cw-btn ' + cls + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + IC[ic] + '</svg><span data-e="' + key + '">' + T(key, label) + '</span></button>'; }
  function actionsHTML() {
    return actBtn('cw-copy', 'copy', 'copy', 'Copy result') + actBtn('cw-share', 'share', 'share', 'Share link') + actBtn('cw-img', 'img', 'saveimg', 'Save image') + actBtn('cw-print', 'print', 'print', 'Print / PDF');
  }
  // Brief "✓" on a button after it worked; the icon stays, only the label swaps.
  function flash(btn) { var l = btn.querySelector('span') || btn, o = l.getAttribute('data-o') || l.textContent; l.setAttribute('data-o', o); l.textContent = '✓'; setTimeout(function () { l.textContent = o; }, 1500); }
  function withCur(app, fn) { var p = CW._cur; CW._cur = (app && app.def && app.def.cur) || null; try { return fn(); } finally { CW._cur = p; } }
  function build(app, keep) { return withCur(app, function () { return buildInner(app, keep); }); }
  function buildInner(app, keep) {
    var def = app.def, ctx = ctxFor(), uq = keep ? {} : urlValues();
    app.values = {};
    def.inputs.forEach(function (inp) {
      var v;
      if (keep && app.touched[inp.k] && app.prev && app.prev[inp.k] !== undefined) v = app.prev[inp.k];
      else if (uq[inp.k] !== undefined && inp.t !== 'rows') v = uq[inp.k];
      else v = defaultValue(inp, ctx);
      if (inp.t === 'rows') v = (v || []).map(function (r) { return r.slice(); });
      app.values[inp.k] = v;
    });
    var form = def.inputs.map(function (inp) { return fieldHTML(inp, app.values[inp.k], app.uid); }).join('');
    app.el.innerHTML =
      '<div class="cw-ws' + (def.layout === 'stack' ? ' cw-stack' : '') + '">' +
        '<section class="cw-pane cw-in" aria-label="' + T('inputs', 'Inputs') + '">' +
          '<div class="cw-pane-h"><span class="cw-pane-t" data-e="inputs">' + T('inputs', 'Inputs') + '</span><button type="button" class="cw-reset" data-e="reset">' + T('reset', 'Reset') + '</button></div>' +
          '<form class="cw-form" novalidate onsubmit="return false">' + form + '</form>' +
        '</section>' +
        '<section class="cw-pane cw-rp" aria-label="' + T('result', 'Result') + '">' +
          '<div class="cw-tabs" role="tablist" hidden></div>' +
          '<div class="cw-out" aria-live="polite" aria-atomic="false"></div>' +
          '<div class="cw-actions">' + actionsHTML() + '</div>' +
        '</section>' +
      '</div>' +
      '<button type="button" class="cw-bar" hidden aria-label="' + T('result', 'Result') + '"><span class="cw-bar-l"></span><b class="cw-bar-v"></b><span class="cw-bar-go" data-e="seeall" data-es=" ↓">' + T('seeall', 'Details') + ' ↓</span></button>';
    app.form = app.el.querySelector('.cw-form');
    app.out = app.el.querySelector('.cw-out');
    app.tabs = app.el.querySelector('.cw-tabs');
    app.bar = app.el.querySelector('.cw-bar');
    bind(app);
    run(app);
  }
  function rebuild(app) { app.prev = readAll(app); build(app, true); }

  function readAll(app) {
    var v = {};
    app.def.inputs.forEach(function (inp) {
      if (inp.t === 'seg') {
        var c = app.form.querySelector('input[data-k="' + inp.k + '"]:checked'); v[inp.k] = c ? c.value : inp.v;
      } else if (inp.t === 'rows') {
        var rows = [];
        app.form.querySelectorAll('.cw-rows[data-k="' + inp.k + '"] tbody tr').forEach(function (tr) {
          var r = []; tr.querySelectorAll('[data-c]').forEach(function (f) { r[+f.getAttribute('data-c')] = f.value; }); rows.push(r);
        });
        v[inp.k] = rows;
      } else {
        var f = app.form.querySelector('[data-k="' + inp.k + '"]');
        if (!f) return;
        if (inp.t === 'check') v[inp.k] = f.checked;
        else v[inp.k] = f.value;
      }
    });
    return v;
  }
  function typed(app, raw) {
    var o = {}, missing = [];
    app.def.inputs.forEach(function (inp) {
      var r = raw[inp.k];
      if (['money', 'number', 'percent', 'int'].indexOf(inp.t) > -1) {
        var n = CW.parse(r);
        var visible = !inp.show || inp.show(raw);
        if (isNaN(n)) { if (visible && !inp.opt) missing.push(inp.l); n = inp.opt ? 0 : NaN; }
        o[inp.k] = n;
      } else if (inp.t === 'rows') {
        o[inp.k] = (r || []).map(function (row) {
          return row.map(function (cell, ci) { return inp.cols[ci].t === 'text' || inp.cols[ci].t === 'select' ? cell : CW.parse(cell); });
        });
      } else if (inp.t === 'date') {
        o[inp.k] = r ? new Date(r + 'T00:00:00') : null;
        if (!r && (!inp.show || inp.show(raw))) missing.push(inp.l);
      } else o[inp.k] = r;
    });
    return { v: o, missing: missing };
  }
  function applyShow(app, raw) {
    app.def.inputs.forEach(function (inp) {
      if (typeof inp.u === 'function') {
        var su = app.form.querySelector('[data-u="' + inp.k + '"]');
        if (su) su.textContent = inp.u(raw);
      }
      if (!inp.show) return;
      var f = app.form.querySelector('[data-field="' + inp.k + '"]');
      if (f) f.hidden = !inp.show(raw);
    });
  }
  var timer;
  function bind(app) {
    var schedule = function () { clearTimeout(timer); timer = setTimeout(function () { run(app); }, 70); };
    app.form.addEventListener('input', function (e) {
      var k = e.target.getAttribute('data-k') || e.target.getAttribute('data-for');
      if (k) app.touched[k] = true;
      if (e.target.classList.contains('cw-range')) {
        var t = app.form.querySelector('input[data-k="' + e.target.getAttribute('data-for') + '"]');
        var inp = app.def.inputs.filter(function (i) { return i.k === e.target.getAttribute('data-for'); })[0];
        t.value = inp && inp.t === 'money' ? CW.fmt.num(+e.target.value, 2) : e.target.value;
      } else if (e.target.getAttribute('data-k')) {
        var rg = app.form.querySelector('.cw-range[data-for="' + e.target.getAttribute('data-k') + '"]');
        if (rg) { var n = CW.parse(e.target.value); if (!isNaN(n)) rg.value = n; }
      }
      schedule();
    });
    app.form.addEventListener('change', schedule);
    app.form.addEventListener('focusout', function (e) {
      var k = e.target.getAttribute('data-k');
      var inp = app.def.inputs.filter(function (i) { return i.k === k; })[0];
      if (inp && inp.t === 'money') { var n = CW.parse(e.target.value); if (!isNaN(n)) e.target.value = CW.fmt.num(n, 2); }
    });
    app.form.addEventListener('click', function (e) {
      var rowsEl = e.target.closest('.cw-rows');
      if (!rowsEl) return;
      var inp = app.def.inputs.filter(function (i) { return i.k === rowsEl.getAttribute('data-k'); })[0];
      if (e.target.classList.contains('cw-add')) {
        var tb = rowsEl.querySelector('tbody'), tmp = document.createElement('tbody');
        tmp.innerHTML = rowHTML(inp, [], tb.children.length); tb.appendChild(tmp.firstChild);
        var first = tb.lastChild.querySelector('input,select'); if (first) first.focus();
        schedule();
      } else if (e.target.classList.contains('cw-del')) {
        e.target.closest('tr').remove(); schedule();
      }
    });
    app.tabs.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-tab]'); if (!b) return;
      app.tab = b.getAttribute('data-tab'); paint(app);
    });
    app.el.querySelector('.cw-reset').addEventListener('click', function () {
      app.touched = {}; try { history.replaceState(null, '', location.pathname); } catch (x) {} build(app, false);
    });
    if (app.bar) app.bar.addEventListener('click', function () { var r = app.el.querySelector('.cw-rp'); if (r) r.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    if ('IntersectionObserver' in window && app.bar) {
      var io = new IntersectionObserver(function (en) { app.resVisible = en[0].isIntersecting; app.bar.classList.toggle('is-off', app.resVisible); }, { threshold: 0.35 });
      io.observe(app.el.querySelector('.cw-rp'));
    }
    var actions = app.el.querySelector('.cw-actions');
    actions.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.classList.contains('cw-print')) { window.print(); }
      else if (b.classList.contains('cw-copy')) {
        var txt = Array.prototype.map.call(app.out.querySelectorAll('.cw-res-tile, .cw-main'), function (r) {
          var l = r.querySelector('.cw-res-l'), v = r.querySelector('.cw-res-v');
          return l && v ? l.textContent.trim() + ': ' + v.textContent.trim() : '';
        }).filter(Boolean).join('\n');
        copy(txt + '\n— ' + document.title + ' ' + location.origin + location.pathname, b);
      } else if (b.classList.contains('cw-share')) {
        var raw = readAll(app), q = new URLSearchParams();
        app.def.inputs.forEach(function (inp) { if (inp.t !== 'rows' && raw[inp.k] !== undefined && raw[inp.k] !== '') q.set(inp.k, inp.t === 'money' ? CW.parse(raw[inp.k]) : raw[inp.k]); });
        var url = location.origin + location.pathname + '?' + q.toString();
        if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) navigator.share({ title: document.title, url: url }).catch(function () {});
        else copy(url, b);
      } else if (b.classList.contains('cw-img')) { saveImage(app, b); }
    });
  }
  function copy(text, btn) {
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { flash(btn); }, function () {});
    else { var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); flash(btn); } catch (e) {} t.remove(); }
  }
  /* Save the headline numbers as a clean PNG card (no server, no library). */
  function saveImage(app, btn) { return withCur(app, function () { return saveImageInner(app, btn); }); }
  function saveImageInner(app, btn) {
    var rows = [];
    app.out.querySelectorAll('.cw-main, .cw-res-tile').forEach(function (r) {
      var l = r.querySelector('.cw-res-l'), v = r.querySelector('.cw-res-v');
      if (l && v) rows.push([l.textContent.trim(), v.textContent.trim().replace(/\s+/g, ' '), r.classList.contains('cw-main')]);
    });
    if (!rows.length) return;
    var W = 1000, pad = 56, lh = 74, H = pad * 2 + 130 + rows.length * lh + 50, F = 'system-ui,Segoe UI,Arial,sans-serif';
    var c = document.createElement('canvas'); c.width = W; c.height = Math.min(H, 2400);
    var x = c.getContext('2d');
    x.fillStyle = '#14162E'; x.fillRect(0, 0, W, c.height);
    x.fillStyle = '#6D5EF2'; x.fillRect(0, 0, W, 10);
    x.fillStyle = '#fff'; x.font = '700 40px ' + F; x.fillText(app.def.title || document.title.split(' – ')[0], pad, pad + 40);
    x.fillStyle = '#A9ADD0'; x.font = '500 24px ' + F; x.fillText(location.host + location.pathname, pad, pad + 82);
    var y = pad + 150;
    rows.forEach(function (r) {
      x.fillStyle = '#A9ADD0'; x.font = '500 24px ' + F; x.fillText(r[0], pad, y);
      x.fillStyle = r[2] ? '#C9C4FF' : '#fff'; x.font = (r[2] ? '800 44px ' : '700 32px ') + F; x.textAlign = 'right'; x.fillText(r[1], W - pad, y + (r[2] ? 4 : 2)); x.textAlign = 'left';
      x.strokeStyle = 'rgba(255,255,255,.12)'; x.beginPath(); x.moveTo(pad, y + 22); x.lineTo(W - pad, y + 22); x.stroke(); y += lh;
    });
    x.fillStyle = '#A9ADD0'; x.font = '500 22px ' + F; x.fillText('Calcyworld', pad, c.height - 28);
    var a = document.createElement('a'); a.download = (app.def.id || 'result') + '.png'; a.href = c.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove();
    flash(btn);
  }

  function run(app) { return withCur(app, function () { return runInner(app); }); }
  function runInner(app) {
    var raw = readAll(app);
    applyShow(app, raw);
    var tv = typed(app, raw);
    if (tv.missing.length) { app.parts = null; app.tabs.hidden = true; app.out.innerHTML = '<div class="cw-empty">' + T('enter', 'Enter') + ' ' + CW.esc(tv.missing.slice(0, 2).join(' & ')) + '</div>'; setBar(app, null); return; }
    var res;
    try { res = app.def.calc(tv.v, ctxFor()); }
    catch (err) { app.parts = null; app.tabs.hidden = true; app.out.innerHTML = '<div class="cw-empty cw-warn">' + CW.esc(err && err.message ? err.message : 'Please check your inputs.') + '</div>'; setBar(app, null); return; }
    if (!res || res.error) { app.parts = null; app.tabs.hidden = true; app.out.innerHTML = '<div class="cw-empty cw-warn">' + CW.esc(res && res.error ? res.error : 'Please check your inputs.') + '</div>'; setBar(app, null); return; }
    app.parts = renderResult(res);
    app.res = res;
    paint(app);
  }
  function setBar(app, main) {
    if (!app.bar) return;
    if (!main) { app.bar.hidden = true; return; }
    app.bar.hidden = false;
    app.bar.querySelector('.cw-bar-l').textContent = main.l;
    app.bar.querySelector('.cw-bar-v').textContent = main.v;
  }
  function paint(app) { return withCur(app, function () { return paintInner(app); }); }
  function paintInner(app) {
    var p = app.parts; if (!p) return;
    // Roomy screens (and phones, where the result is simply the rest of the page) show the graph right under the numbers;
    // only short laptop screens tuck it behind a tab so the answer never needs scrolling.
    var inl = !!p.chart;
    var tabs = [['sum', T('summary', 'Summary')]];
    if (p.chart && !inl) tabs.push(['chart', T('chart', 'Chart')]);
    if (p.table) tabs.push(['table', p.tableTitle || T('schedule', 'Schedule')]);
    if (!tabs.some(function (t) { return t[0] === app.tab; })) app.tab = 'sum';
    app.tabs.hidden = tabs.length < 2;
    app.tabs.innerHTML = tabs.map(function (t) {
      return '<button type="button" role="tab" data-tab="' + t[0] + '"' + (t[0] === 'sum' ? ' data-e="summary"' : t[0] === 'chart' ? ' data-e="chart"' : '') + ' aria-selected="' + (t[0] === app.tab ? 'true' : 'false') + '">' + CW.esc(t[1]) + '</button>';
    }).join('');
    app.out.innerHTML = app.tab === 'chart' ? '<div class="cw-card">' + p.chart + '</div>' : app.tab === 'table' ? '<div class="cw-card">' + p.table + '</div>' : (inl ? p.sum + '<div class="cw-card cw-sum-chart">' + p.chart + '</div>' : p.sum);
    app.out.setAttribute('data-tab', app.tab);
    setBar(app, p.main);
  }
  function renderResult(res) {
    var h = '', hero = '', rs = res.results || [], mainObj = null;
    var main = rs.filter(function (r) { return r.main; });
    var rest = rs.filter(function (r) { return !r.main; });
    main.forEach(function (r) {
      var val = fmtVal(r.v, r.f, r);
      if (!mainObj) mainObj = { l: r.l, v: String(val).replace(/<[^>]+>/g, '') + (r.u ? ' ' + r.u : '') };
      hero += '<div class="cw-main"><div class="cw-res-l">' + CW.esc(r.l) + '</div><div class="cw-res-v">' + val + (r.u ? ' <small>' + CW.esc(r.u) + '</small>' : '') + '</div>' +
        (r.f && r.f.indexOf('money') === 0 && r.words !== false && Math.abs(r.v) >= 1000 ? '<div class="cw-words">' + CW.esc(CW.wordsForCountry(r.v)) + '</div>' : '') +
        (r.sub ? '<div class="cw-res-sub">' + r.sub + '</div>' : '') + '</div>';
    });
    var badge = res.badge ? '<div class="cw-badge cw-b-' + (res.badge.tone || 'ok') + '">' + CW.esc(res.badge.t) + '</div>' : '';
    if (hero) h += '<div class="cw-hero">' + hero + badge + '</div>';
    if (rest.length) {
      h += '<div class="cw-card cw-details">' + (hero ? '<h3 class="cw-card-t" data-e="details">' + T('details', 'Details') + '</h3>' : '') + '<dl class="cw-grid">' + rest.map(function (r) {
        return '<div class="cw-res-tile' + (r.hl ? ' cw-hl' : '') + '"><dt class="cw-res-l">' + CW.esc(r.l) + '</dt><dd class="cw-res-v">' + fmtVal(r.v, r.f, r) + (r.u ? ' <small>' + CW.esc(r.u) + '</small>' : '') + '</dd></div>';
      }).join('') + '</dl>' + (hero ? '' : badge) + '</div>';
    } else if (!hero && badge) h += '<div class="cw-card">' + badge + '</div>';
    if (res.html) h += '<div class="cw-card cw-extra">' + res.html + '</div>';
    if (res.note) h += '<p class="cw-note">' + res.note + '</p>';
    var chart = '';
    if (res.chart) {
      var c = res.chart, ff = function (v) { return fmtVal(v, c.f || 'num'); };
      chart = c.type === 'donut' ? donut(c.data, ff) : c.type === 'scatter' ? scatterChart(c.series, ff) : lineChart(c.series, c.labels, ff, c.type);
      if (c.title) chart = '<div class="cw-chart-t">' + CW.esc(c.title) + '</div>' + chart;
    }
    var table = '', tableTitle = '';
    if (res.table && res.table.rows && res.table.rows.length) {
      var t = res.table, fm = t.fmt || [];
      tableTitle = t.title || '';
      table = '<div class="cw-tscroll"><table><thead><tr>' +
        t.head.map(function (x) { return '<th scope="col">' + CW.esc(x) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        t.rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td>' + (typeof c === 'number' ? fmtVal(c, fm[i] || 'num') : CW.esc(c)) + '</td>'; }).join('') + '</tr>'; }).join('') +
        '</tbody></table></div>';
    }
    // Small results keep the chart on the Summary tab too, so nothing important hides behind a tab.
    var sum = h;
    return { sum: sum, chart: chart, table: table, tableTitle: tableTitle, main: mainObj };
  }

  /* ========================== Converter widget ========================== */
  function mountConverter(app) { return withCur(app, function () { return mountConverterInner(app); }); }
  function mountConverterInner(app) {
    var def = app.def, g = CW.UNITS[def.group], keys = Object.keys(g.u), uid = app.uid;
    var imp = CW.imperial();
    var from = def.from || keys[0], to = def.to || keys[1];
    if (def.swapForImperial && imp) { var tt = from; from = to; to = tt; }
    var opts = function (sel) { return keys.map(function (k) { return '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + CW.esc(g.u[k][0]) + ' (' + k.replace(/_.*/, '') + ')</option>'; }).join(''); };
    var q = urlValues();
    app.el.innerHTML = '<div class="cw-ws cw-convws">' +
      '<section class="cw-pane cw-in"><div class="cw-pane-h"><span class="cw-pane-t" data-e="convert">' + T('convert', 'Convert') + '</span></div>' +
      '<div class="cw-conv">' +
      '<div class="cw-field"><label data-e="value" for="' + uid + 'v">' + T('value', 'Value') + '</label><div class="cw-input"><input id="' + uid + 'v" type="text" inputmode="decimal" value="' + CW.esc(q.v || def.value || 1) + '"></div></div>' +
      '<div class="cw-field"><label data-e="from" for="' + uid + 'f">' + T('from', 'From') + '</label><div class="cw-select"><select id="' + uid + 'f">' + opts(q.f && g.u[q.f] ? q.f : from) + '</select></div></div>' +
      '<button type="button" class="cw-swap" aria-label="Swap units">⇄</button>' +
      '<div class="cw-field"><label data-e="to" for="' + uid + 't">' + T('to', 'To') + '</label><div class="cw-select"><select id="' + uid + 't">' + opts(q.t && g.u[q.t] ? q.t : to) + '</select></div></div>' +
      '</div></section>' +
      '<section class="cw-pane cw-rp"><div class="cw-tabs" role="tablist" hidden></div><div class="cw-out" aria-live="polite"></div><div class="cw-actions">' + actionsHTML() + '</div></section></div>';
    var vEl = app.el.querySelector('#' + uid + 'v'), fEl = app.el.querySelector('#' + uid + 'f'), tEl = app.el.querySelector('#' + uid + 't'), out = app.el.querySelector('.cw-out');
    app.out = out; app.def.title = def.title;
    var go = function () {
      var v = CW.parse(vEl.value);
      if (isNaN(v)) { out.innerHTML = '<div class="cw-empty">' + T('typenum', 'Type a number to convert.') + '</div>'; return; }
      var r = CW.convertUnit(def.group, v, fEl.value, tEl.value);
      var fu = g.u[fEl.value][0], tu = g.u[tEl.value][0];
      var rows = keys.filter(function (k) { return k !== fEl.value; }).map(function (k) {
        return '<tr><td>' + CW.esc(g.u[k][0]) + '</td><td><b class="cw-res-v">' + CW.fmt.num(CW.convertUnit(def.group, v, fEl.value, k), 6) + '</b> <span class="cw-u">' + k.replace(/_.*/, '') + '</span></td></tr>';
      }).join('');
      var factor = g.special ? '' : '<p class="cw-note">1 ' + CW.esc(fu.toLowerCase()) + ' = ' + CW.fmt.num(CW.convertUnit(def.group, 1, fEl.value, tEl.value), 8) + ' ' + CW.esc(tu.toLowerCase()) + '</p>';
      out.innerHTML = '<div class="cw-hero"><div class="cw-main"><div class="cw-res-l">' + CW.fmt.num(v, 6) + ' ' + CW.esc(fu) + ' =</div><div class="cw-res-v">' + CW.fmt.num(r, 6) + ' <small>' + CW.esc(tu) + '</small></div></div></div>' +
        factor + '<div class="cw-card"><div class="cw-sub-t" data-e="allconv">' + T('allconv', 'All conversions') + '</div><div class="cw-tscroll cw-conv-table"><table><tbody>' + rows + '</tbody></table></div></div>';
    };
    app.el.addEventListener('input', go); app.el.addEventListener('change', go);
    app.el.querySelector('.cw-swap').addEventListener('click', function () { var a = fEl.value; fEl.value = tEl.value; tEl.value = a; go(); });
    var actions = app.el.querySelector('.cw-actions');
    actions.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.classList.contains('cw-print')) window.print();
      else if (b.classList.contains('cw-copy')) { var m = out.querySelector('.cw-main'); copy((m ? m.textContent.replace(/\s+/g, ' ').trim() : '') + ' — ' + location.href, b); }
      else if (b.classList.contains('cw-share')) { copy(location.origin + location.pathname + '?v=' + encodeURIComponent(vEl.value) + '&f=' + fEl.value + '&t=' + tEl.value, b); }
      else if (b.classList.contains('cw-img')) saveImage(app, b);
    });
    go();
  }

  /* ========================== Custom formula (built in WP admin) ========================== */
  CW.fromFormula = function (spec) {
    // spec: {inputs:[{k,l,t,v,u}], outputs:[{l,e,f,u}]}
    return {
      id: '__inline', inputs: spec.inputs,
      calc: function (v) {
        var vars = {}; Object.keys(v).forEach(function (k) { vars[k] = v[k]; });
        var results = spec.outputs.map(function (o, i) {
          var val = CW.evaluate(o.e, vars);
          vars['out' + (i + 1)] = val;
          if (o.k) vars[o.k] = val;
          return { l: o.l, v: val, f: o.f || 'num', u: o.u, main: i === 0 };
        });
        return { results: results };
      }
    };
  };

  /* ========================== Auto-mount ========================== */
  function autoMount() {
    document.querySelectorAll('[data-cw-calc]:not(.cw-ready)').forEach(function (el) {
      var id = el.getAttribute('data-cw-calc');
      if (id === 'custom') {
        try { CW.mount(el, '__inline', CW.fromFormula(JSON.parse(el.getAttribute('data-cw-spec')))); }
        catch (e) { el.innerHTML = '<p class="cw-error">This calculator’s formula needs attention.</p>'; }
      } else CW.mount(el, id);
      if (el.hasAttribute('data-cw-recent')) CW.addRecent({ t: el.getAttribute('data-cw-title') || document.title, u: location.pathname });
    });
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autoMount); else autoMount();
  }
  CW.autoMount = autoMount;
  CW._internals = { defaultValue: defaultValue, ctxFor: ctxFor, renderResult: renderResult };
})(typeof window !== 'undefined' ? window : globalThis);
