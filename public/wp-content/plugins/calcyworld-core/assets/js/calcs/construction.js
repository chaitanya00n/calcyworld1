/* Calcyworld — Construction, home, energy, EV & solar */
(function (CW) {
  'use strict';
  var r = function (l, v, f, x) { var o = { l: l, v: v, f: f || 'num' }; if (x) for (var k in x) o[k] = x[k]; return o; };
  var M = function (l, v, f, x) { x = x || {}; x.main = true; return r(l, v, f, x); };
  var U = { k: 'units', l: 'Units', t: 'seg', v: function (c) { return c.imperial ? 'ft' : 'm'; }, o: [['m', 'Metres'], ['ft', 'Feet']] };
  var lu = function (x) { return (x ? x.units === 'ft' : CW.imperial()) ? 'ft' : 'm'; };
  var toM = function (v, x) { return v.units === 'ft' ? x * 0.3048 : x; };

  CW.register([
  {
    id: 'concrete-calculator', title: 'Concrete Calculator', sec: 'construction', sub: 'Construction & Home Improvement', pop: 1,
    desc: 'Calculate the concrete volume for a slab, footing or column — with cement bags, sand and aggregate for your mix ratio.',
    formula: 'Wet volume = length × width × depth. Dry volume ≈ wet volume × 1.54. Cement = dry volume × cement share ÷ total ratio; one 50 kg bag ≈ 0.0347 m³.',
    inputs: [U, { k: 'shape', l: 'Shape', t: 'seg', v: 'slab', o: [['slab', 'Slab / footing'], ['col', 'Round column']] },
      { k: 'l', l: 'Length', t: 'number', v: function (c) { return c.imperial ? 10 : 3; }, u: lu, show: function (x) { return x.shape === 'slab'; } },
      { k: 'w', l: 'Width', t: 'number', v: function (c) { return c.imperial ? 10 : 3; }, u: lu, show: function (x) { return x.shape === 'slab'; } },
      { k: 'd', l: 'Depth / thickness', t: 'number', v: function (c) { return c.imperial ? 0.33 : 0.1; }, u: lu, show: function (x) { return x.shape === 'slab'; } },
      { k: 'dia', l: 'Diameter', t: 'number', v: function (c) { return c.imperial ? 1 : 0.3; }, u: lu, show: function (x) { return x.shape === 'col'; } },
      { k: 'h', l: 'Height', t: 'number', v: function (c) { return c.imperial ? 10 : 3; }, u: lu, show: function (x) { return x.shape === 'col'; } },
      { k: 'n', l: 'Quantity', t: 'int', v: 1 }, { k: 'mix', l: 'Mix', t: 'select', v: '1.5', o: [['1', 'M25 (1 : 1 : 2)'], ['1.5', 'M20 (1 : 1.5 : 3)'], ['2', 'M15 (1 : 2 : 4)'], ['3', 'M10 (1 : 3 : 6)']] },
      { k: 'waste', l: 'Wastage', t: 'percent', v: 5, opt: 1 }],
    calc: function (v) {
      var m3 = v.shape === 'slab' ? toM(v, v.l) * toM(v, v.w) * toM(v, v.d) : Math.PI * Math.pow(toM(v, v.dia) / 2, 2) * toM(v, v.h);
      m3 *= v.n * (1 + v.waste / 100);
      var s = +v.mix, tot = 1 + s + 2 * s, dry = m3 * 1.54, cem = dry / tot, bags = cem / 0.0347;
      return { results: [M('Concrete volume', m3, 'fixed', { dp: 3, u: 'm³' }), r('In cubic yards', m3 * 1.30795, 'fixed', { dp: 2, u: 'yd³' }), r('In cubic feet', m3 * 35.3147, 'fixed', { dp: 1, u: 'ft³' }),
        r('Cement (50 kg bags)', Math.ceil(bags), 'int', { hl: 1 }), r('Sand', dry * s / tot, 'fixed', { dp: 2, u: 'm³' }), r('Aggregate', dry * 2 * s / tot, 'fixed', { dp: 2, u: 'm³' }), r('Pre-mix bags (80 lb / 36 kg)', Math.ceil(m3 / 0.0170), 'int')] };
    }
  },
  {
    id: 'brick-calculator', title: 'Brick Calculator', sec: 'construction', sub: 'Construction & Home Improvement', pop: 1,
    desc: 'Estimate how many bricks and how much mortar (cement and sand) you need for a wall.',
    formula: 'Bricks = wall volume ÷ volume of one brick with mortar joints. Mortar ≈ wall volume − bricks’ own volume; dry mortar ≈ wet × 1.33.',
    inputs: [{ k: 'l', l: 'Wall length', t: 'number', v: 5, u: 'm' }, { k: 'h', l: 'Wall height', t: 'number', v: 3, u: 'm' },
      { k: 't', l: 'Wall thickness', t: 'select', v: '0.23', o: [['0.115', 'Half brick (4.5″ / 115 mm)'], ['0.23', 'Full brick (9″ / 230 mm)']] },
      { k: 'bs', l: 'Brick size', t: 'select', v: 'in', o: [['in', '190 × 90 × 90 mm (India standard)'], ['uk', '215 × 102.5 × 65 mm (UK)'], ['us', '194 × 92 × 57 mm (US modular)']] },
      { k: 'j', l: 'Mortar joint', t: 'number', v: 10, u: 'mm' }, { k: 'mix', l: 'Mortar mix (cement : sand)', t: 'select', v: '6', o: [['4', '1 : 4'], ['5', '1 : 5'], ['6', '1 : 6']] }, { k: 'waste', l: 'Wastage', t: 'percent', v: 5 }],
    calc: function (v) { var b = { in: [0.19, 0.09, 0.09], uk: [0.215, 0.1025, 0.065], us: [0.194, 0.092, 0.057] }[v.bs], j = v.j / 1000;
      var vol = v.l * v.h * +v.t, unit = (b[0] + j) * (b[1] + j) * (b[2] + j), n = vol / unit, mort = (vol - n * b[0] * b[1] * b[2]) * 1.33, cem = mort / (1 + +v.mix);
      return { results: [M('Bricks needed', Math.ceil(n * (1 + v.waste / 100)), 'int'), r('Wall volume', vol, 'fixed', { dp: 3, u: 'm³' }), r('Cement', Math.ceil(cem / 0.0347), 'int', { u: 'bags (50 kg)' }), r('Sand', cem * +v.mix, 'fixed', { dp: 3, u: 'm³' })] }; }
  },
  {
    id: 'paint-calculator', title: 'Paint Calculator', sec: 'construction', sub: 'Construction & Home Improvement', pop: 1,
    desc: 'Work out how much paint you need for a room — walls and ceiling — after doors and windows.',
    formula: 'Paintable area = wall perimeter × height (+ ceiling) − doors − windows. Paint = area × coats ÷ coverage per litre.',
    inputs: [U, { k: 'l', l: 'Room length', t: 'number', v: function (c) { return c.imperial ? 14 : 4.5; }, u: lu }, { k: 'w', l: 'Room width', t: 'number', v: function (c) { return c.imperial ? 12 : 3.5; }, u: lu },
      { k: 'h', l: 'Wall height', t: 'number', v: function (c) { return c.imperial ? 9 : 2.8; }, u: lu }, { k: 'doors', l: 'Doors', t: 'int', v: 1 }, { k: 'win', l: 'Windows', t: 'int', v: 2 },
      { k: 'ceil', l: 'Paint the ceiling too', t: 'check', v: false }, { k: 'coats', l: 'Coats', t: 'int', v: 2 }, { k: 'cov', l: 'Coverage per litre', t: 'number', v: 10, u: 'm²/L' }],
    calc: function (v) { var f = v.units === 'ft' ? 0.3048 : 1, L = v.l * f, W = v.w * f, H = v.h * f, area = 2 * (L + W) * H - v.doors * 1.9 - v.win * 1.5 + (v.ceil ? L * W : 0);
      var litres = Math.max(0, area) * v.coats / v.cov;
      return { results: [M('Paint needed', litres, 'fixed', { dp: 1, u: 'litres' }), r('In US gallons', litres / 3.785, 'fixed', { dp: 2 }), r('Paintable area', area, 'fixed', { dp: 1, u: 'm²' }), r('In square feet', area * 10.7639, 'int')], note: 'Doors are taken as 1.9 m² and windows as 1.5 m² each. Buy about 10% extra for touch-ups.' }; }
  },
  {
    id: 'tile-calculator', title: 'Tile & Flooring Calculator', sec: 'construction', sub: 'Construction & Home Improvement', pop: 1,
    desc: 'Find how many tiles (or flooring boxes) you need for a floor or wall, including cutting wastage.',
    formula: 'Tiles = area ÷ (tile length × tile width) × (1 + wastage).',
    inputs: [U, { k: 'l', l: 'Area length', t: 'number', v: function (c) { return c.imperial ? 12 : 4; }, u: lu }, { k: 'w', l: 'Area width', t: 'number', v: function (c) { return c.imperial ? 10 : 3; }, u: lu },
      { k: 'tl', l: 'Tile length', t: 'number', v: function (c) { return c.imperial ? 12 : 60; }, u: function (x) { return (x ? x.units === 'ft' : CW.imperial()) ? 'in' : 'cm'; } },
      { k: 'tw', l: 'Tile width', t: 'number', v: function (c) { return c.imperial ? 12 : 60; }, u: function (x) { return (x ? x.units === 'ft' : CW.imperial()) ? 'in' : 'cm'; } },
      { k: 'box', l: 'Tiles per box (optional)', t: 'int', v: 4, opt: 1 }, { k: 'waste', l: 'Wastage', t: 'percent', v: 10 }],
    calc: function (v) { var imp = v.units === 'ft', area = v.l * v.w * (imp ? 0.092903 : 1), tile = imp ? v.tl * v.tw * 0.00064516 : v.tl * v.tw / 1e4, n = Math.ceil(area / tile * (1 + v.waste / 100));
      return { results: [M('Tiles needed', n, 'int'), r('Boxes', v.box ? Math.ceil(n / v.box) : NaN, 'int'), r('Area', area, 'fixed', { dp: 2, u: 'm²' }), r('Area', area * 10.7639, 'fixed', { dp: 1, u: 'ft²' })] }; }
  },
  {
    id: 'square-footage-calculator', title: 'Square Footage & Area of Rooms Calculator', sec: 'construction', sub: 'Construction & Home Improvement', pop: 1,
    desc: 'Add up the area of several rooms in square feet and square metres — handy for flooring, rent and property listings.',
    formula: 'Area of each room = length × width; total = sum of rooms.',
    inputs: [U, { k: 'rows', l: 'Rooms', t: 'rows', add: 'Add room', cols: [{ l: 'Room', t: 'text' }, { l: 'Length', t: 'number' }, { l: 'Width', t: 'number' }], v: [['Living room', 16, 14], ['Bedroom', 12, 11], ['Kitchen', 10, 9]] }],
    calc: function (v) { var a = 0, rows = []; v.rows.forEach(function (x) { if (!isNaN(x[1]) && !isNaN(x[2])) { a += x[1] * x[2]; rows.push([x[0] || 'Room', x[1] * x[2]]); } });
      var m2 = v.units === 'ft' ? a * 0.09290304 : a;
      return { results: [M('Total area', v.units === 'ft' ? a : m2 * 10.7639, 'fixed', { dp: 1, u: 'sq ft' }), r('Square metres', m2, 'fixed', { dp: 2, u: 'm²' }), r('Square yards', m2 * 1.19599, 'fixed', { dp: 2 }), r('Acres', m2 / 4046.856, 'num', { dp: 5 })],
        table: { title: 'By room (' + (v.units === 'ft' ? 'sq ft' : 'm²') + ')', head: ['Room', 'Area'], fmt: ['text', 'fixed'], rows: rows } }; }
  },
  {
    id: 'water-tank-capacity-calculator', title: 'Water Tank Capacity Calculator', sec: 'construction', sub: 'Construction & Home Improvement',
    desc: 'Calculate the capacity of a rectangular or cylindrical water tank in litres and gallons.',
    formula: 'Rectangular: L × W × H. Cylinder: π × r² × H. 1 m³ = 1,000 litres.',
    inputs: [{ k: 's', l: 'Tank shape', t: 'seg', v: 'rect', o: [['rect', 'Rectangular'], ['cyl', 'Cylinder']] }, U,
      { k: 'l', l: 'Length', t: 'number', v: 2, u: lu, show: function (x) { return x.s === 'rect'; } }, { k: 'w', l: 'Width', t: 'number', v: 1.5, u: lu, show: function (x) { return x.s === 'rect'; } },
      { k: 'd', l: 'Diameter', t: 'number', v: 1.2, u: lu, show: function (x) { return x.s === 'cyl'; } }, { k: 'h', l: 'Height', t: 'number', v: 1.5, u: lu }],
    calc: function (v) { var m3 = v.s === 'rect' ? toM(v, v.l) * toM(v, v.w) * toM(v, v.h) : Math.PI * Math.pow(toM(v, v.d) / 2, 2) * toM(v, v.h);
      return { results: [M('Capacity', m3 * 1000, 'int', { u: 'litres' }), r('US gallons', m3 * 264.172, 'int'), r('UK gallons', m3 * 219.969, 'int'), r('Cubic metres', m3, 'fixed', { dp: 3 })] }; }
  },
  {
    id: 'solar-panel-calculator', title: 'Solar Panel Calculator (Size, Cost & Payback)', sec: 'construction', sub: 'Energy, Solar, EV & Ecology', pop: 1,
    desc: 'Find the rooftop solar system size you need from your electricity use, the number of panels, savings and payback period — with subsidies.',
    formula: 'System size (kW) = monthly units ÷ (30 × peak sun hours × 0.78 performance ratio). Payback = net cost ÷ yearly savings.',
    faq: [['How many units does a 1 kW solar system produce?', 'Roughly 3.5–5 units (kWh) a day depending on sunshine — about 110–150 units a month in most of India and southern Europe, less in cloudier regions.'],
      ['Is there a solar subsidy?', 'Many countries offer one. In India the PM Surya Ghar scheme gives a central subsidy for residential rooftop solar; enter the amount you are eligible for in the subsidy field.']],
    inputs: [{ k: 'u', l: 'Monthly electricity use', t: 'number', v: 400, u: 'kWh (units)' }, { k: 't', l: 'Electricity price', t: 'money', v: 0.18, local: { IN: 8 }, u: 'per kWh' },
      { k: 'sun', l: 'Peak sun hours per day', t: 'number', v: function (c) { return ['IN', 'AE', 'SA', 'EG', 'AU', 'MX', 'ZA', 'PK'].indexOf(c.country.code) > -1 ? 5 : c.imperial ? 4.5 : 3.8; } },
      { k: 'pw', l: 'Panel wattage', t: 'int', v: 550, u: 'W' }, { k: 'cost', l: 'Installed cost per kW', t: 'money', v: 2800, local: { IN: 55000 } }, { k: 'sub', l: 'Subsidy / incentive', t: 'money', v: 0, local: { IN: 78000 }, opt: 1 },
      { k: 'cover', l: 'Share of bill to cover', t: 'percent', v: 100 }],
    calc: function (v) { var kw = v.u * v.cover / 100 / (30 * v.sun * 0.78), panels = Math.ceil(kw * 1000 / v.pw), real = panels * v.pw / 1000, gen = real * v.sun * 0.78 * 365;
      var save = gen * v.t, gross = real * v.cost, net = Math.max(0, gross - v.sub), pb = net / save;
      return { results: [M('System size', real, 'fixed', { dp: 2, u: 'kW' }), r('Panels', panels, 'int', { u: '× ' + v.pw + ' W' }), r('Yearly generation', gen, 'int', { u: 'kWh' }), r('Yearly savings', save, 'money'),
        r('System cost', gross, 'money'), r('Cost after subsidy', net, 'money'), r('Payback period', pb, 'fixed', { dp: 1, u: 'years' }), r('25-year savings', save * 25 * 0.9 - net, 'money', { hl: 1 }), r('Roof area needed (approx.)', panels * 2.6, 'int', { u: 'm²' })],
        note: '25-year savings allow ~10% for panel degradation; tariff increases would raise savings further.' }; }
  },
  {
    id: 'electricity-bill-calculator', title: 'Electricity Bill & Appliance Usage Calculator', sec: 'construction', sub: 'Energy, Solar, EV & Ecology', pop: 1,
    desc: 'Estimate your monthly electricity units and bill from your appliances’ wattage and daily hours of use.',
    formula: 'Units (kWh) = watts × hours per day × quantity × days ÷ 1000. Bill = units × price per unit.',
    inputs: [{ k: 'rows', l: 'Appliances', t: 'rows', add: 'Add appliance', cols: [{ l: 'Appliance', t: 'text' }, { l: 'Watts', t: 'number' }, { l: 'Hours / day', t: 'number' }, { l: 'Qty', t: 'number', v: 1 }],
      v: [['Air conditioner (1.5 ton)', 1500, 6, 1], ['Refrigerator', 150, 24, 1], ['LED lights', 10, 6, 8], ['Ceiling fan', 75, 10, 3], ['TV', 100, 4, 1], ['Washing machine', 500, 1, 1]] },
      { k: 't', l: 'Price per unit (kWh)', t: 'money', v: 0.18, local: { IN: 7 } }, { k: 'days', l: 'Days', t: 'int', v: 30 }],
    calc: function (v) { var rows = [], tot = 0; v.rows.forEach(function (x) { if (isNaN(x[1]) || isNaN(x[2])) return; var u = x[1] * x[2] * (isNaN(x[3]) ? 1 : x[3]) * v.days / 1000; tot += u; rows.push([x[0] || 'Appliance', u, u * v.t]); });
      rows.sort(function (a, b) { return b[1] - a[1]; });
      return { results: [M('Estimated bill', tot * v.t, 'money'), r('Units used', tot, 'fixed', { dp: 1, u: 'kWh' }), r('Per day', tot / v.days * v.t, 'money')],
        chart: { type: 'donut', f: 'num', data: rows.slice(0, 5).map(function (x) { return { l: x[0], v: x[1] }; }) },
        table: { open: true, title: 'By appliance', head: ['Appliance', 'Units (kWh)', 'Cost'], fmt: ['text', 'fixed', 'money'], rows: rows }, note: 'Slab tariffs, fixed charges and taxes on your actual bill are not included.' }; }
  },
  {
    id: 'ev-charging-cost-calculator', title: 'EV Charging Cost Calculator', sec: 'construction', sub: 'Energy, Solar, EV & Ecology',
    desc: 'Calculate the cost and time to charge an electric vehicle, and the cost per km or mile.',
    formula: 'Energy = battery × (end % − start %) ÷ charger efficiency. Cost = energy × price per kWh. Time = energy ÷ charger power.',
    inputs: [{ k: 'b', l: 'Battery capacity', t: 'number', v: 60, u: 'kWh' }, { k: 's', l: 'Charge from', t: 'percent', v: 20 }, { k: 'e', l: 'Charge to', t: 'percent', v: 80 },
      { k: 'p', l: 'Electricity price', t: 'money', v: 0.18, local: { IN: 8 }, u: 'per kWh' }, { k: 'kw', l: 'Charger power', t: 'number', v: 7.2, u: 'kW' }, { k: 'eff', l: 'Charging efficiency', t: 'percent', v: 90 },
      { k: 'range', l: 'Vehicle efficiency', t: 'number', v: function (c) { return c.imperial ? 3.5 : 6; }, u: function () { return CW.imperial() ? 'mi/kWh' : 'km/kWh'; } }],
    calc: function (v) { var stored = v.b * (v.e - v.s) / 100, grid = stored / (v.eff / 100), cost = grid * v.p, t = grid / v.kw;
      return { results: [M('Charging cost', cost, 'money'), r('Energy from grid', grid, 'fixed', { dp: 1, u: 'kWh' }), r('Charging time', Math.floor(t) + ' h ' + Math.round(t % 1 * 60) + ' min', 'text'), r('Range added', stored * v.range, 'int', { u: CW.imperial() ? 'miles' : 'km' }), r('Cost per ' + (CW.imperial() ? 'mile' : 'km'), cost / (stored * v.range), 'money2')] }; }
  },
  {
    id: 'ev-vs-petrol-calculator', title: 'EV vs Petrol Car Savings Calculator', sec: 'construction', sub: 'Energy, Solar, EV & Ecology',
    desc: 'Compare running costs of an electric car with a petrol or diesel car and see your monthly and long-term savings.',
    formula: 'Fuel cost = distance ÷ mileage × fuel price. EV cost = distance ÷ efficiency × electricity price.',
    inputs: [{ k: 'd', l: 'Distance per month', t: 'number', v: function (c) { return c.imperial ? 1000 : 1500; }, u: function () { return CW.imperial() ? 'miles' : 'km'; } },
      { k: 'fp', l: 'Fuel price', t: 'money', v: function (c) { return c.imperial ? 3.5 : 1.5; }, local: { IN: 103, GB: 1.4 }, u: function () { return CW.imperial() ? 'per gal' : 'per L'; } },
      { k: 'fe', l: 'Car fuel efficiency', t: 'number', v: function (c) { return c.imperial ? 30 : 15; }, u: function () { return CW.imperial() ? 'mpg' : 'km/L'; } },
      { k: 'ep', l: 'Electricity price', t: 'money', v: 0.18, local: { IN: 8 }, u: 'per kWh' }, { k: 'ee', l: 'EV efficiency', t: 'number', v: function (c) { return c.imperial ? 3.5 : 6.5; }, u: function () { return CW.imperial() ? 'mi/kWh' : 'km/kWh'; } },
      { k: 'y', l: 'Years of ownership', t: 'int', v: 5 }, { k: 'extra', l: 'Extra price of the EV', t: 'money', v: 5000, local: { IN: 300000 }, opt: 1 }],
    calc: function (v) { var f = v.d / v.fe * v.fp, e = v.d / v.ee * v.ep, s = f - e, tot = s * 12 * v.y;
      return { results: [M('Monthly savings with EV', s, 'money'), r('Petrol / diesel cost per month', f, 'money'), r('EV charging cost per month', e, 'money'), r('Savings over ' + v.y + ' years', tot, 'money'),
        r('Net after EV price difference', tot - v.extra, 'money', { hl: 1 }), r('Break-even', s > 0 ? v.extra / s : NaN, 'fixed', { dp: 1, u: 'months' }), r('CO₂ avoided per year (approx.)', v.d * 12 / v.fe * 2.31 * (CW.imperial() ? 3.785 : 1) - v.d * 12 / v.ee * 0.7, 'int', { u: 'kg' })],
        chart: { type: 'bar', f: 'money', labels: ['Fuel car', 'EV'], series: [{ l: 'Monthly running cost', pts: [f, e] }] } }; }
  },
  {
    id: 'carbon-footprint-calculator', title: 'Carbon Footprint Calculator', sec: 'construction', sub: 'Energy, Solar, EV & Ecology',
    desc: 'Estimate your yearly carbon footprint from electricity, driving, flights, cooking gas and diet.',
    formula: 'Emissions = activity × emission factor (e.g. ~2.31 kg CO₂ per litre of petrol, ~0.15 kg per passenger-km flown, grid factor per kWh).',
    inputs: [{ k: 'el', l: 'Electricity per month', t: 'number', v: 250, u: 'kWh' }, { k: 'gf', l: 'Grid emission factor', t: 'number', v: function (c) { return c.country.code === 'IN' ? 0.71 : c.country.code === 'US' ? 0.37 : 0.3; }, u: 'kg CO₂/kWh' },
      { k: 'car', l: 'Car fuel per month', t: 'number', v: 40, u: 'litres' }, { k: 'fl', l: 'Flight hours per year', t: 'number', v: 10, u: 'hours' }, { k: 'lpg', l: 'Cooking gas (LPG) per year', t: 'number', v: 140, u: 'kg' },
      { k: 'diet', l: 'Diet', t: 'select', v: '1.7', o: [['1.0', 'Vegan'], ['1.4', 'Vegetarian'], ['1.7', 'Some meat'], ['2.5', 'Meat every day']] }],
    calc: function (v) { var e = v.el * 12 * v.gf / 1000, c = v.car * 12 * 2.31 / 1000, f = v.fl * 0.09, g = v.lpg * 2.98 / 1000, d = +v.diet, t = e + c + f + g + d;
      return { results: [M('Yearly footprint', t, 'fixed', { dp: 2, u: 'tonnes CO₂e' }), r('Electricity', e, 'fixed', { dp: 2, u: 't' }), r('Car', c, 'fixed', { dp: 2, u: 't' }), r('Flights', f, 'fixed', { dp: 2, u: 't' }), r('Cooking gas', g, 'fixed', { dp: 2, u: 't' }), r('Food', d, 'fixed', { dp: 2, u: 't' }), r('Trees to offset (approx.)', t * 1000 / 21, 'int')],
        chart: { type: 'donut', f: 'num', data: [{ l: 'Electricity', v: e }, { l: 'Car', v: c }, { l: 'Flights', v: f }, { l: 'Gas', v: g }, { l: 'Food', v: d }] } }; }
  }
  ]);
})(window.CW);
