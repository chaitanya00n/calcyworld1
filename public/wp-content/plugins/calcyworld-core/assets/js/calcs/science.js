/* Calcyworld — Physics, chemistry, biology, electrical */
(function (CW) {
  'use strict';
  var r = function (l, v, f, x) { var o = { l: l, v: v, f: f || 'num' }; if (x) for (var k in x) o[k] = x[k]; return o; };
  var M = function (l, v, f, x) { x = x || {}; x.main = true; return r(l, v, f, x); };
  var sig = function (x) { return Math.abs(x) >= 1e6 || (Math.abs(x) < 1e-3 && x !== 0) ? x.toExponential(4) : CW.fmt.num(x, 6); };

  /* Standard atomic weights (IUPAC, abridged to 4–5 significant figures). */
  var AW = { H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948,
    K: 39.098, Ca: 40.078, Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996, Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38, Ga: 69.723, Ge: 72.630, As: 74.922, Se: 78.971, Br: 79.904, Kr: 83.798,
    Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224, Nb: 92.906, Mo: 95.95, Tc: 98, Ru: 101.07, Rh: 102.91, Pd: 106.42, Ag: 107.87, Cd: 112.41, In: 114.82, Sn: 118.71, Sb: 121.76, Te: 127.60, I: 126.90, Xe: 131.29,
    Cs: 132.91, Ba: 137.33, La: 138.91, Ce: 140.12, Pr: 140.91, Nd: 144.24, Pm: 145, Sm: 150.36, Eu: 151.96, Gd: 157.25, Tb: 158.93, Dy: 162.50, Ho: 164.93, Er: 167.26, Tm: 168.93, Yb: 173.05, Lu: 174.97,
    Hf: 178.49, Ta: 180.95, W: 183.84, Re: 186.21, Os: 190.23, Ir: 192.22, Pt: 195.08, Au: 196.97, Hg: 200.59, Tl: 204.38, Pb: 207.2, Bi: 208.98, Po: 209, At: 210, Rn: 222, Fr: 223, Ra: 226, Ac: 227, Th: 232.04, Pa: 231.04, U: 238.03,
    Np: 237, Pu: 244, Am: 243, Cm: 247, Bk: 247, Cf: 251, Es: 252, Fm: 257, Md: 258, No: 259, Lr: 266 };
  function parseFormula(f) {
    var i = 0, s = String(f || '').replace(/\s/g, '').replace(/[·•*]/g, '.');
    function group() { var counts = {};
      while (i < s.length && s[i] !== ')' && s[i] !== ']') {
        if (s[i] === '(' || s[i] === '[') { i++; var g = group(); i++; var n = num(); Object.keys(g).forEach(function (k) { counts[k] = (counts[k] || 0) + g[k] * n; }); }
        else if (s[i] === '.') { i++; var mult = num(); var rest = group(); Object.keys(rest).forEach(function (k) { counts[k] = (counts[k] || 0) + rest[k] * mult; }); }
        else { var m = /^[A-Z][a-z]?/.exec(s.slice(i)); if (!m || !AW[m[0]]) throw new Error('Unknown element near “' + s.slice(i, i + 3) + '”'); i += m[0].length; var c = num(); counts[m[0]] = (counts[m[0]] || 0) + c; }
      } return counts; }
    function num() { var m = /^\d+/.exec(s.slice(i)); if (!m) return 1; i += m[0].length; return +m[0]; }
    var out = group(); if (i < s.length) throw new Error('Check the brackets in your formula.'); return out;
  }

  CW.register([
  {
    id: 'ohms-law-calculator', title: 'Ohm’s Law Calculator', sec: 'science', sub: 'Electrical & Electronics', pop: 1,
    desc: 'Enter any two of voltage, current, resistance and power to calculate the other two.',
    formula: 'V = I × R; P = V × I = I²R = V² ÷ R.',
    inputs: [{ k: 'V', l: 'Voltage (V)', t: 'number', v: 12, opt: 1 }, { k: 'I', l: 'Current (A)', t: 'number', v: 2, opt: 1 }, { k: 'R', l: 'Resistance (Ω)', t: 'number', v: '', opt: 1 }, { k: 'P', l: 'Power (W)', t: 'number', v: '', opt: 1 }],
    calc: function (v) { var V = v.V || 0, I = v.I || 0, R = v.R || 0, P = v.P || 0, n = [V, I, R, P].filter(Boolean).length;
      if (n < 2) return { error: 'Enter any two values.' };
      if (V && I) { R = V / I; P = V * I; } else if (V && R) { I = V / R; P = V * I; } else if (V && P) { I = P / V; R = V / I; } else if (I && R) { V = I * R; P = V * I; } else if (I && P) { V = P / I; R = V / I; } else { V = Math.sqrt(P * R); I = V / R; }
      return { results: [M('Voltage', V, 'num', { dp: 6, u: 'V' }), r('Current', I, 'num', { dp: 6, u: 'A' }), r('Resistance', R, 'num', { dp: 6, u: 'Ω' }), r('Power', P, 'num', { dp: 6, u: 'W' })], note: 'Leave the two values you want to find empty.' }; }
  },
  {
    id: 'electrical-power-calculator', title: 'Watts, Amps, Volts & kVA Calculator', sec: 'science', sub: 'Electrical & Electronics',
    desc: 'Convert between watts, amps, volts and kVA for single-phase and three-phase AC or DC circuits.',
    formula: 'DC: P = V × I. Single-phase AC: P = V × I × PF. Three-phase: P = √3 × V(line) × I × PF. kVA = V × I (× √3) ÷ 1000.',
    inputs: [{ k: 'ph', l: 'Supply', t: 'seg', v: '1', o: [['dc', 'DC'], ['1', 'Single-phase AC'], ['3', 'Three-phase AC']] }, { k: 'V', l: 'Voltage', t: 'number', v: function (c) { return c.country.code === 'US' ? 120 : 230; }, u: 'V' },
      { k: 'I', l: 'Current', t: 'number', v: 10, u: 'A' }, { k: 'pf', l: 'Power factor', t: 'number', v: 0.9, show: function (x) { return x.ph !== 'dc'; } }],
    calc: function (v) { var k = v.ph === '3' ? Math.sqrt(3) : 1, pf = v.ph === 'dc' ? 1 : v.pf, va = v.V * v.I * k, w = va * pf;
      return { results: [M('Real power', w, 'num', { dp: 2, u: 'W' }), r('Kilowatts', w / 1000, 'num', { dp: 4, u: 'kW' }), r('Apparent power', va / 1000, 'num', { dp: 4, u: 'kVA' }), r('Horsepower', w / 745.699872, 'num', { dp: 3, u: 'hp' })] }; }
  },
  {
    id: 'speed-distance-time-calculator', title: 'Speed, Distance & Time Calculator', sec: 'science', sub: 'Physics', pop: 1,
    desc: 'Solve for speed, distance or time — enter the other two.',
    formula: 'Speed = distance ÷ time; distance = speed × time; time = distance ÷ speed.',
    inputs: [{ k: 'f', l: 'Find', t: 'seg', v: 's', o: [['s', 'Speed'], ['d', 'Distance'], ['t', 'Time']] }, { k: 'd', l: 'Distance (km)', t: 'number', v: 120, show: function (x) { return x.f !== 'd'; } },
      { k: 's', l: 'Speed (km/h)', t: 'number', v: 60, show: function (x) { return x.f !== 's'; } }, { k: 't', l: 'Time (hours)', t: 'number', v: 2, show: function (x) { return x.f !== 't'; } }],
    calc: function (v) { if (v.f === 's') return { results: [M('Speed', v.d / v.t, 'num', { dp: 4, u: 'km/h' }), r('In mph', v.d / v.t / 1.609344, 'num', { dp: 4 }), r('In m/s', v.d / v.t / 3.6, 'num', { dp: 4 })] };
      if (v.f === 'd') return { results: [M('Distance', v.s * v.t, 'num', { dp: 4, u: 'km' }), r('In miles', v.s * v.t / 1.609344, 'num', { dp: 4 })] };
      var t = v.d / v.s; return { results: [M('Time', Math.floor(t) + ' h ' + Math.round(t % 1 * 60) + ' min', 'text'), r('Decimal hours', t, 'num', { dp: 4 })] }; }
  },
  {
    id: 'kinetic-energy-calculator', title: 'Kinetic & Potential Energy Calculator', sec: 'science', sub: 'Physics',
    desc: 'Calculate kinetic energy from mass and speed, and gravitational potential energy from height.',
    formula: 'KE = ½ m v². PE = m g h (g = 9.80665 m/s²).',
    inputs: [{ k: 'm', l: 'Mass', t: 'number', v: 1000, u: 'kg' }, { k: 'v', l: 'Speed', t: 'number', v: 20, u: 'm/s' }, { k: 'h', l: 'Height', t: 'number', v: 10, u: 'm', opt: 1 }],
    calc: function (v) { var ke = 0.5 * v.m * v.v * v.v, pe = v.m * 9.80665 * v.h;
      return { results: [M('Kinetic energy', ke, 'num', { dp: 2, u: 'J' }), r('Potential energy', pe, 'num', { dp: 2, u: 'J' }), r('Total mechanical energy', ke + pe, 'num', { dp: 2, u: 'J' }), r('Kinetic energy (kWh)', ke / 3.6e6, 'num', { dp: 6 })] }; }
  },
  {
    id: 'force-calculator', title: 'Force Calculator (F = ma)', sec: 'science', sub: 'Physics',
    desc: 'Use Newton’s second law to find force, mass or acceleration.',
    formula: 'F = m × a.',
    inputs: [{ k: 'f', l: 'Find', t: 'seg', v: 'F', o: [['F', 'Force'], ['m', 'Mass'], ['a', 'Acceleration']] }, { k: 'F', l: 'Force (N)', t: 'number', v: 100, show: function (x) { return x.f !== 'F'; } },
      { k: 'm', l: 'Mass (kg)', t: 'number', v: 10, show: function (x) { return x.f !== 'm'; } }, { k: 'a', l: 'Acceleration (m/s²)', t: 'number', v: 9.80665, show: function (x) { return x.f !== 'a'; } }],
    calc: function (v) { return { results: [v.f === 'F' ? M('Force', v.m * v.a, 'num', { dp: 4, u: 'N' }) : v.f === 'm' ? M('Mass', v.F / v.a, 'num', { dp: 4, u: 'kg' }) : M('Acceleration', v.F / v.m, 'num', { dp: 4, u: 'm/s²' })] }; }
  },
  {
    id: 'density-calculator', title: 'Density, Mass & Volume Calculator', sec: 'science', sub: 'Physics',
    desc: 'Find density, mass or volume when you know the other two.',
    formula: 'ρ = m ÷ V.',
    inputs: [{ k: 'f', l: 'Find', t: 'seg', v: 'd', o: [['d', 'Density'], ['m', 'Mass'], ['V', 'Volume']] }, { k: 'm', l: 'Mass (kg)', t: 'number', v: 2, show: function (x) { return x.f !== 'm'; } },
      { k: 'V', l: 'Volume (m³)', t: 'number', v: 0.001, show: function (x) { return x.f !== 'V'; } }, { k: 'd', l: 'Density (kg/m³)', t: 'number', v: 1000, show: function (x) { return x.f !== 'd'; } }],
    calc: function (v) { if (v.f === 'd') { var d = v.m / v.V; return { results: [M('Density', d, 'num', { dp: 4, u: 'kg/m³' }), r('In g/cm³', d / 1000, 'num', { dp: 6 })] }; }
      return { results: [v.f === 'm' ? M('Mass', v.d * v.V, 'num', { dp: 6, u: 'kg' }) : M('Volume', v.m / v.d, 'num', { dp: 8, u: 'm³' })] }; }
  },
  {
    id: 'projectile-motion-calculator', title: 'Projectile Motion Calculator', sec: 'science', sub: 'Physics',
    desc: 'Find the range, maximum height and flight time of a projectile from launch speed, angle and height.',
    formula: 'vx = v cos θ, vy = v sin θ. Flight time t = (vy + √(vy² + 2gh)) ÷ g. Range = vx × t. Max height = h + vy² ÷ 2g.',
    inputs: [{ k: 'v', l: 'Launch speed', t: 'number', v: 25, u: 'm/s' }, { k: 'a', l: 'Launch angle', t: 'number', v: 45, u: '°' }, { k: 'h', l: 'Launch height', t: 'number', v: 0, u: 'm', opt: 1 }],
    calc: function (v) { var g = 9.80665, th = v.a * Math.PI / 180, vx = v.v * Math.cos(th), vy = v.v * Math.sin(th), t = (vy + Math.sqrt(vy * vy + 2 * g * v.h)) / g;
      return { results: [M('Range', vx * t, 'num', { dp: 3, u: 'm' }), r('Maximum height', v.h + vy * vy / (2 * g), 'num', { dp: 3, u: 'm' }), r('Time of flight', t, 'num', { dp: 3, u: 's' }), r('Impact speed', Math.hypot(vx, vy - g * t), 'num', { dp: 3, u: 'm/s' })] }; }
  },
  {
    id: 'wavelength-frequency-calculator', title: 'Wavelength & Frequency Calculator', sec: 'science', sub: 'Physics',
    desc: 'Convert between wavelength and frequency for light, radio and sound waves, with photon energy.',
    formula: 'λ = v ÷ f. Photon energy E = h × f.',
    inputs: [{ k: 'm', l: 'Wave', t: 'seg', v: 'em', o: [['em', 'Light / radio (c)'], ['snd', 'Sound in air (343 m/s)']] }, { k: 'f', l: 'Frequency', t: 'number', v: 100, u: 'MHz' }],
    calc: function (v) { var c = v.m === 'em' ? 299792458 : 343, hz = v.f * 1e6, l = c / hz;
      return { results: [M('Wavelength', sig(l), 'text', { u: 'm' }), r('Period', sig(1 / hz), 'text', { u: 's' }), r('Photon energy', v.m === 'em' ? sig(6.62607015e-34 * hz / 1.602176634e-19) : '—', 'text', { u: 'eV' })] }; }
  },
  {
    id: 'half-life-calculator', title: 'Half-Life Calculator', sec: 'science', sub: 'Physics',
    desc: 'Calculate how much of a radioactive substance (or drug) remains after a given time, from its half-life.',
    formula: 'N(t) = N₀ × (½)^(t ÷ t½).',
    inputs: [{ k: 'n', l: 'Starting amount', t: 'number', v: 100 }, { k: 'h', l: 'Half-life', t: 'number', v: 5730 }, { k: 't', l: 'Time elapsed (same unit)', t: 'number', v: 10000 }],
    calc: function (v) { var left = v.n * Math.pow(0.5, v.t / v.h);
      return { results: [M('Amount remaining', left, 'num', { dp: 6 }), r('Fraction remaining', left / v.n * 100, 'pct', { dp: 4 }), r('Half-lives passed', v.t / v.h, 'num', { dp: 4 }), r('Decay constant λ', Math.LN2 / v.h, 'num', { dp: 8 })] }; }
  },
  {
    id: 'molar-mass-calculator', title: 'Molar Mass Calculator', sec: 'science', sub: 'Chemistry', pop: 1,
    desc: 'Type a chemical formula to get its molar mass and percentage composition by element. Brackets and hydrates are supported.',
    formula: 'Molar mass = Σ (number of atoms × atomic weight) using IUPAC standard atomic weights.',
    inputs: [{ k: 'f', l: 'Chemical formula (e.g. H2SO4, Ca(OH)2, CuSO4.5H2O)', t: 'text', v: 'C6H12O6' }],
    calc: function (v) { var c = parseFormula(v.f), tot = 0; Object.keys(c).forEach(function (k) { tot += AW[k] * c[k]; }); if (!tot) return { error: 'Type a chemical formula.' };
      return { results: [M('Molar mass', tot, 'fixed', { dp: 3, u: 'g/mol' })], table: { open: true, title: 'Composition', head: ['Element', 'Atoms', 'Mass (g/mol)', 'Mass %'], fmt: ['text', 'num', 'fixed', 'pct'], rows: Object.keys(c).map(function (k) { return [k, c[k], AW[k] * c[k], AW[k] * c[k] / tot * 100]; }) } }; }
  },
  {
    id: 'molarity-calculator', title: 'Molarity Calculator', sec: 'science', sub: 'Chemistry',
    desc: 'Calculate molarity, or the mass of solute needed to make a solution of a given concentration.',
    formula: 'Molarity (mol/L) = mass ÷ (molar mass × volume in L).',
    inputs: [{ k: 'f', l: 'Find', t: 'seg', v: 'mass', o: [['mass', 'Mass needed'], ['M', 'Molarity']] }, { k: 'mm', l: 'Molar mass', t: 'number', v: 58.44, u: 'g/mol' },
      { k: 'V', l: 'Volume', t: 'number', v: 500, u: 'mL' }, { k: 'M', l: 'Concentration', t: 'number', v: 0.5, u: 'mol/L', show: function (x) { return x.f === 'mass'; } }, { k: 'g', l: 'Mass of solute', t: 'number', v: 14.61, u: 'g', show: function (x) { return x.f === 'M'; } }],
    calc: function (v) { var L = v.V / 1000; return v.f === 'mass' ? { results: [M('Mass of solute', v.M * L * v.mm, 'num', { dp: 4, u: 'g' }), r('Moles', v.M * L, 'num', { dp: 6, u: 'mol' })] } : { results: [M('Molarity', v.g / v.mm / L, 'num', { dp: 6, u: 'mol/L' }), r('Moles', v.g / v.mm, 'num', { dp: 6, u: 'mol' })] }; }
  },
  {
    id: 'dilution-calculator', title: 'Dilution Calculator (C1V1 = C2V2)', sec: 'science', sub: 'Chemistry',
    desc: 'Work out how much stock solution and diluent you need to reach a target concentration.',
    formula: 'C₁V₁ = C₂V₂, so V₁ = C₂V₂ ÷ C₁.',
    inputs: [{ k: 'c1', l: 'Stock concentration (C₁)', t: 'number', v: 10 }, { k: 'c2', l: 'Final concentration (C₂)', t: 'number', v: 1 }, { k: 'v2', l: 'Final volume (V₂)', t: 'number', v: 100, u: 'mL' }],
    calc: function (v) { if (v.c2 > v.c1) return { error: 'The final concentration cannot be higher than the stock.' }; var v1 = v.c2 * v.v2 / v.c1;
      return { results: [M('Stock volume (V₁)', v1, 'num', { dp: 4, u: 'mL' }), r('Diluent to add', v.v2 - v1, 'num', { dp: 4, u: 'mL' }), r('Dilution factor', v.c1 / v.c2, 'num', { dp: 4, u: '×' })] }; }
  },
  {
    id: 'ph-calculator', title: 'pH Calculator', sec: 'science', sub: 'Chemistry',
    desc: 'Convert between pH, pOH, [H⁺] and [OH⁻] at 25 °C.',
    formula: 'pH = −log₁₀[H⁺]; pOH = 14 − pH; [OH⁻] = 10^(−pOH).',
    inputs: [{ k: 'k', l: 'I know the', t: 'select', v: 'h', o: [['h', '[H⁺] (mol/L)'], ['oh', '[OH⁻] (mol/L)'], ['ph', 'pH'], ['poh', 'pOH']] }, { k: 'x', l: 'Value', t: 'number', v: 0.001 }],
    calc: function (v) { var ph = v.k === 'h' ? -Math.log10(v.x) : v.k === 'oh' ? 14 + Math.log10(v.x) : v.k === 'ph' ? v.x : 14 - v.x;
      return { results: [M('pH', ph, 'fixed', { dp: 3 }), r('pOH', 14 - ph, 'fixed', { dp: 3 }), r('[H⁺]', sig(Math.pow(10, -ph)), 'text', { u: 'mol/L' }), r('[OH⁻]', sig(Math.pow(10, ph - 14)), 'text', { u: 'mol/L' }), r('Nature', ph < 7 ? 'Acidic' : ph > 7 ? 'Basic (alkaline)' : 'Neutral', 'text')] }; }
  },
  {
    id: 'ideal-gas-law-calculator', title: 'Ideal Gas Law Calculator', sec: 'science', sub: 'Chemistry',
    desc: 'Solve PV = nRT for pressure, volume, moles or temperature.',
    formula: 'PV = nRT, with R = 8.314 J/(mol·K).',
    inputs: [{ k: 'f', l: 'Find', t: 'seg', v: 'P', o: [['P', 'Pressure'], ['V', 'Volume'], ['n', 'Moles'], ['T', 'Temperature']] },
      { k: 'P', l: 'Pressure (kPa)', t: 'number', v: 101.325, show: function (x) { return x.f !== 'P'; } }, { k: 'V', l: 'Volume (L)', t: 'number', v: 22.414, show: function (x) { return x.f !== 'V'; } },
      { k: 'n', l: 'Moles', t: 'number', v: 1, show: function (x) { return x.f !== 'n'; } }, { k: 'T', l: 'Temperature (K)', t: 'number', v: 273.15, show: function (x) { return x.f !== 'T'; } }],
    calc: function (v) { var R = 8.314462618;
      switch (v.f) { case 'P': return { results: [M('Pressure', v.n * R * v.T / v.V, 'num', { dp: 4, u: 'kPa' })] }; case 'V': return { results: [M('Volume', v.n * R * v.T / v.P, 'num', { dp: 4, u: 'L' })] };
        case 'n': return { results: [M('Moles', v.P * v.V / (R * v.T), 'num', { dp: 6, u: 'mol' })] }; default: return { results: [M('Temperature', v.P * v.V / (v.n * R), 'num', { dp: 3, u: 'K' }), r('In °C', v.P * v.V / (v.n * R) - 273.15, 'num', { dp: 3 })] }; } }
  },
  {
    id: 'punnett-square-calculator', title: 'Punnett Square Calculator', sec: 'science', sub: 'Biology & Lab',
    desc: 'Predict offspring genotypes and phenotypes for a single-gene (monohybrid) cross.',
    formula: 'Each parent passes one allele; all four combinations are equally likely (25% each).',
    inputs: [{ k: 'a', l: 'Parent 1 genotype', t: 'select', v: 'Aa', o: ['AA', 'Aa', 'aa'] }, { k: 'b', l: 'Parent 2 genotype', t: 'select', v: 'Aa', o: ['AA', 'Aa', 'aa'] }],
    calc: function (v) { var c = {}; v.a.split('').forEach(function (x) { v.b.split('').forEach(function (y) { var g = [x, y].sort().join(''); c[g] = (c[g] || 0) + 25; }); });
      var dom = (c.AA || 0) + (c.Aa || 0);
      return { results: [M('Dominant trait', dom, 'pct', { dp: 0 }), r('Recessive trait', 100 - dom, 'pct', { dp: 0 })], table: { open: true, title: 'Genotypes', head: ['Genotype', 'Chance'], fmt: ['text', 'pct'], rows: Object.keys(c).map(function (k) { return [k, c[k]]; }) } }; }
  }
  ]);
})(window.CW);
