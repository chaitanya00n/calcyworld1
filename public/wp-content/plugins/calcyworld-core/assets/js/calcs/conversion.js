/* Calcyworld — Unit converters (every page shares one converter engine) */
(function (CW) {
  'use strict';
  function C(id, title, group, from, to, desc, formula, extra) {
    var d = { id: id, title: title, sec: 'conversion', sub: 'Unit Converters', type: 'converter', group: group, from: from, to: to, desc: desc, formula: formula, inputs: [] };
    if (extra) for (var k in extra) d[k] = extra[k];
    return d;
  }
  CW.register([
    C('length-converter', 'Length Converter', 'length', 'cm', 'in', 'Convert between millimetres, centimetres, metres, kilometres, inches, feet, yards and miles.', '1 inch = 2.54 cm exactly; 1 foot = 0.3048 m; 1 mile = 1.609344 km.', { pop: 1 }),
    C('weight-converter', 'Weight Converter (Mass)', 'weight', 'kg', 'lb', 'Convert kilograms, grams, pounds, ounces, stones, tonnes, carats and tolas.', '1 pound = 0.45359237 kg exactly; 1 kg ≈ 2.20462 lb.', { pop: 1 }),
    C('temperature-converter', 'Temperature Converter', 'temperature', 'c', 'f', 'Convert between Celsius, Fahrenheit, Kelvin and Rankine.', '°F = °C × 9/5 + 32; K = °C + 273.15.', { pop: 1, value: 37 }),
    C('area-converter', 'Area Converter', 'area', 'm2', 'ft2', 'Convert square metres, square feet, acres, hectares — and Indian land units like guntha, cent, bigha, marla and kanal.', '1 m² = 10.7639 ft²; 1 acre = 4,046.86 m²; 1 hectare = 10,000 m². Bigha varies by state — the Rajasthan value is used.', { pop: 1 }),
    C('volume-converter', 'Volume Converter', 'volume', 'l', 'gal', 'Convert litres, millilitres, cubic metres, US and UK gallons, cups, quarts, pints and fluid ounces.', '1 US gallon = 3.785411784 L; 1 UK gallon = 4.54609 L.'),
    C('speed-converter', 'Speed Converter', 'speed', 'kmh', 'mph', 'Convert km/h, mph, m/s, knots, feet per second and Mach.', '1 mph = 1.609344 km/h; 1 knot = 1.852 km/h.'),
    C('time-unit-converter', 'Time Unit Converter', 'time', 'h', 'min', 'Convert seconds, minutes, hours, days, weeks, months and years.', '1 day = 86,400 s; 1 year (Julian) = 365.25 days.'),
    C('data-storage-converter', 'Data Storage Converter (MB, GB, TB)', 'data', 'GB', 'MB', 'Convert bits, bytes, KB, MB, GB, TB and binary units KiB, MiB, GiB, TiB.', 'Decimal: 1 GB = 1,000 MB. Binary: 1 GiB = 1,024 MiB.'),
    C('pressure-converter', 'Pressure Converter', 'pressure', 'psi', 'bar', 'Convert PSI, bar, pascals, kPa, atmospheres and mmHg — for tyres, weather and engineering.', '1 bar = 100 kPa ≈ 14.5038 psi; 1 atm = 101.325 kPa.'),
    C('energy-converter', 'Energy Converter', 'energy', 'kcal', 'kj', 'Convert joules, calories, kilocalories, kWh, BTU and electronvolts.', '1 kcal = 4.184 kJ; 1 kWh = 3.6 MJ.'),
    C('power-converter', 'Power Converter (Watts, HP, BTU/h)', 'power', 'kw', 'hp', 'Convert watts, kilowatts, horsepower, metric horsepower, BTU per hour and tons of refrigeration.', '1 hp (mechanical) = 745.7 W; 1 ton of refrigeration = 3.517 kW.'),
    C('angle-converter', 'Angle Converter', 'angle', 'deg', 'rad', 'Convert degrees, radians, gradians, turns, arcminutes and arcseconds.', '180° = π radians.'),
    C('fuel-economy-converter', 'Fuel Economy Converter', 'fuel', 'kml', 'mpg', 'Convert km/L, L/100 km and miles per gallon (US and UK).', 'L/100 km = 100 ÷ km/L; 1 US mpg = 0.4251 km/L.'),
    C('cm-to-inches', 'CM to Inches Converter', 'length', 'cm', 'in', 'Convert centimetres to inches instantly, with a full conversion table.', 'inches = cm ÷ 2.54.', { pop: 1, value: 30 }),
    C('inches-to-cm', 'Inches to CM Converter', 'length', 'in', 'cm', 'Convert inches to centimetres instantly.', 'cm = inches × 2.54.', { value: 12 }),
    C('feet-to-meters', 'Feet to Meters Converter', 'length', 'ft', 'm', 'Convert feet to metres (and back) instantly.', 'metres = feet × 0.3048.', { value: 10 }),
    C('km-to-miles', 'KM to Miles Converter', 'length', 'km', 'mi', 'Convert kilometres to miles instantly.', 'miles = km ÷ 1.609344.', { pop: 1, value: 10 }),
    C('miles-to-km', 'Miles to KM Converter', 'length', 'mi', 'km', 'Convert miles to kilometres instantly.', 'km = miles × 1.609344.', { value: 10 }),
    C('kg-to-lbs', 'KG to LBS Converter', 'weight', 'kg', 'lb', 'Convert kilograms to pounds instantly.', 'lb = kg ÷ 0.45359237 ≈ kg × 2.20462.', { pop: 1, value: 70 }),
    C('lbs-to-kg', 'LBS to KG Converter', 'weight', 'lb', 'kg', 'Convert pounds to kilograms instantly.', 'kg = lb × 0.45359237.', { value: 150 }),
    C('celsius-to-fahrenheit', 'Celsius to Fahrenheit Converter', 'temperature', 'c', 'f', 'Convert °C to °F instantly.', '°F = °C × 9/5 + 32.', { pop: 1, value: 25 }),
    C('fahrenheit-to-celsius', 'Fahrenheit to Celsius Converter', 'temperature', 'f', 'c', 'Convert °F to °C instantly.', '°C = (°F − 32) × 5/9.', { value: 98.6 }),
    C('acres-to-hectares', 'Acres to Hectares Converter', 'area', 'ac', 'ha', 'Convert acres to hectares and other land units.', 'hectares = acres × 0.404686.', { value: 1 }),
    C('sq-ft-to-sq-m', 'Square Feet to Square Meters Converter', 'area', 'ft2', 'm2', 'Convert square feet to square metres instantly.', 'm² = ft² × 0.09290304.', { value: 1000 }),
    C('liters-to-gallons', 'Liters to Gallons Converter', 'volume', 'l', 'gal', 'Convert litres to US gallons (and UK gallons).', 'US gallons = litres ÷ 3.785411784.', { value: 10 }),
    {
      id: 'height-converter', title: 'Height Converter (Feet & Inches ↔ CM)', sec: 'conversion', sub: 'Unit Converters', pop: 1,
      desc: 'Convert height between feet and inches and centimetres or metres.',
      formula: 'cm = (feet × 12 + inches) × 2.54.',
      inputs: [{ k: 'm', l: 'Convert', t: 'seg', v: 'fi', o: [['fi', 'ft + in → cm'], ['cm', 'cm → ft + in']] }, { k: 'ft', l: 'Feet', t: 'int', v: 5, show: function (x) { return x.m === 'fi'; } },
        { k: 'in', l: 'Inches', t: 'number', v: 9, opt: 1, show: function (x) { return x.m === 'fi'; } }, { k: 'cm', l: 'Centimetres', t: 'number', v: 175, show: function (x) { return x.m === 'cm'; } }],
      calc: function (v) { if (v.m === 'fi') { var c = (v.ft * 12 + v.in) * 2.54; return { results: [{ l: 'Height', v: c, f: 'fixed', dp: 1, u: 'cm', main: true }, { l: 'Metres', v: c / 100, f: 'fixed', dp: 3 }] }; }
        var t = v.cm / 2.54, f = Math.floor(t / 12), i = t - f * 12; if (i > 11.95) { f++; i = 0; }
        return { results: [{ l: 'Height', v: f + ' ft ' + CW.fmt.num(i, 1) + ' in', f: 'text', main: true }, { l: 'Total inches', v: t, f: 'fixed', dp: 1 }] }; }
    }
  ]);
})(window.CW);
