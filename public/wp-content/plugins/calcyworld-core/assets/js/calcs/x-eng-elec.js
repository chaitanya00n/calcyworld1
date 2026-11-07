/* Calcyworld — engineering: electrical & electronics */
(function (CW) {
  'use strict';
  var F = CW.F, C = CW.C, M = CW.M, R = CW.Rr, SV = CW.solve, r = CW.R, rm = CW.RM, rt = CW.RT, L = CW.list;
  var N = function (x, d) { return CW.fmt.num(x, d === undefined ? 6 : d); };
  var EL = 'engineering/electrical', EC = 'engineering/electronics';
  var O = function (l, e, u, dp) { return [l, e, 'n', u || '', { dp: dp === undefined ? 6 : dp }]; };
  var PH = ['ph', 'Supply', 'g', 2, [[1, 'DC'], [2, 'AC single-phase'], [3, 'AC three-phase']]];
  var PF = function (v) { return ['pf', 'Power factor', 'n', v || 0.9, '', { show: 'ph>1' }]; };
  var MULT = 'if(ph==3,sqrt(3),1)', PFE = 'if(ph==1,1,pf)';

  /* ---------- Ohm's law & power ---------- */
  C('ohms-law-calculator', "Ohm's Law Calculator", EL, 'Voltage, current, resistance and power from any two values.', 'V = I × R · P = V × I.',
    [['k', 'You know', 's', 1, [[1, 'Voltage and current'], [2, 'Voltage and resistance'], [3, 'Current and resistance'], [4, 'Power and voltage'], [5, 'Power and current'], [6, 'Power and resistance']]], ['a', 'First value', 'n', 12], ['b', 'Second value', 'n', 2]],
    function (v) { var k = +v.k, a = v.a, b = v.b, V, I, Rr_, P; if (!(a > 0) || !(b > 0)) return { error: 'Enter two positive values.' };
      if (k === 1) { V = a; I = b; Rr_ = V / I; P = V * I; } else if (k === 2) { V = a; Rr_ = b; I = V / Rr_; P = V * I; } else if (k === 3) { I = a; Rr_ = b; V = I * Rr_; P = V * I; } else if (k === 4) { P = a; V = b; I = P / V; Rr_ = V / I; } else if (k === 5) { P = a; I = b; V = P / I; Rr_ = V / I; } else { P = a; Rr_ = b; I = Math.sqrt(P / Rr_); V = I * Rr_; }
      return { results: [rm('Voltage', V, 5, 'V'), r('Current', I, 5, 'A'), r('Resistance', Rr_, 5, 'Ω'), r('Power', P, 5, 'W')] }; }, { pop: 1 });
  C('electrical-power-calculator', 'Electrical Power Calculator (DC, AC & 3-Phase)', EL, 'Real, apparent and reactive power from voltage, current and power factor.', 'P = V × I × PF (× √3 for three-phase).',
    [['ph', 'Supply', 'g', 2, [[1, 'DC'], [2, 'AC single-phase'], [3, 'AC three-phase']]], ['v', 'Voltage', 'n', 230, 'V'], ['i', 'Current', 'n', 10, 'A'], ['pf', 'Power factor', 'n', 0.85, '', { show: 'ph>1' }]],
    function (v) { var m = +v.ph === 3 ? Math.sqrt(3) : 1, pf = +v.ph === 1 ? 1 : v.pf; if (!(pf > 0 && pf <= 1)) return { error: 'Power factor must be between 0 and 1.' }; var S = v.v * v.i * m, P = S * pf, Q = Math.sqrt(Math.max(0, S * S - P * P));
      return { results: [rm('Real power', P, 5, 'W'), r('In kW', P / 1000, 5, 'kW'), r('Apparent power', S / 1000, 5, 'kVA'), r('Reactive power', Q / 1000, 5, 'kVAR'), r('Phase angle', Math.acos(pf) * 180 / Math.PI, 3, '°')] }; });
  F('amps-to-watts-calculator', 'Amps to Watts Calculator', EL, 'Convert current in amps to power in watts.', 'W = A × V (× PF, × √3 for three-phase).',
    [['i', 'Current', 'n', 10, 'A'], ['v', 'Voltage', 'n', 230, 'V'], PH, PF()], [O('Power', 'i*v*' + MULT + '*' + PFE, 'W', 3), O('In kW', 'o1/1000', 'kW', 5)], { pop: 1 });
  F('watts-to-amps-calculator', 'Watts to Amps Calculator', EL, 'Convert power in watts to current in amps.', 'A = W ÷ (V × PF).',
    [['w', 'Power', 'n', 2000, 'W'], ['v', 'Voltage', 'n', 230, 'V'], PH, PF()], [O('Current', 'w/(v*' + MULT + '*' + PFE + ')', 'A', 4)], { pop: 1 });
  F('amps-to-kw-calculator', 'Amps to kW Calculator', EL, 'Convert current in amps to power in kilowatts.', 'kW = A × V × PF ÷ 1000.',
    [['i', 'Current', 'n', 32, 'A'], ['v', 'Voltage', 'n', 415, 'V'], ['ph', 'Supply', 'g', 3, PH[4]], PF(0.85)], [O('Power', 'i*v*' + MULT + '*' + PFE + '/1000', 'kW', 4), O('Apparent power', 'i*v*' + MULT + '/1000', 'kVA', 4)]);
  F('kw-to-amps-calculator', 'kW to Amps Calculator', EL, 'Convert power in kilowatts to current in amps.', 'A = kW × 1000 ÷ (V × PF).',
    [['kw', 'Power', 'n', 15, 'kW'], ['v', 'Voltage', 'n', 415, 'V'], ['ph', 'Supply', 'g', 3, PH[4]], PF(0.85)], [O('Current', 'kw*1000/(v*' + MULT + '*' + PFE + ')', 'A', 3)], { pop: 1 });
  F('amps-to-kva-calculator', 'Amps to kVA Calculator', EL, 'Convert current in amps to apparent power in kVA.', 'kVA = A × V ÷ 1000 (× √3 for three-phase).',
    [['i', 'Current', 'n', 100, 'A'], ['v', 'Voltage', 'n', 415, 'V'], ['ph', 'Supply', 'g', 3, [[2, 'Single-phase'], [3, 'Three-phase']]]], [O('Apparent power', 'i*v*' + MULT + '/1000', 'kVA', 4)]);
  F('kva-to-amps-calculator', 'kVA to Amps Calculator', EL, 'Convert apparent power in kVA to current in amps.', 'A = kVA × 1000 ÷ V (÷ √3 for three-phase).',
    [['kva', 'Apparent power', 'n', 100, 'kVA'], ['v', 'Voltage', 'n', 415, 'V'], ['ph', 'Supply', 'g', 3, [[2, 'Single-phase'], [3, 'Three-phase']]]], [O('Current', 'kva*1000/(v*' + MULT + ')', 'A', 3)]);
  F('kva-to-kw-calculator', 'kVA to kW Calculator', EL, 'Convert apparent power to real power.', 'kW = kVA × power factor.',
    [['kva', 'Apparent power', 'n', 100, 'kVA'], ['pf', 'Power factor', 'n', 0.8]], [O('Real power', 'kva*pf', 'kW', 4), O('Reactive power', 'kva*sqrt(1-pf^2)', 'kVAR', 4)]);
  F('kw-to-kva-calculator', 'kW to kVA Calculator', EL, 'Convert real power to apparent power — useful for sizing generators.', 'kVA = kW ÷ power factor.',
    [['kw', 'Real power', 'n', 80, 'kW'], ['pf', 'Power factor', 'n', 0.8]], [O('Apparent power', 'kw/pf', 'kVA', 4), O('Reactive power', 'sqrt(o1^2-kw^2)', 'kVAR', 4)]);
  F('hp-to-amps-calculator', 'Motor HP to Amps Calculator', EL, 'Full-load current of an electric motor from horsepower.', 'A = HP × 746 ÷ (V × efficiency × PF).',
    [['hp', 'Motor power', 'n', 5, 'HP'], ['v', 'Voltage', 'n', 415, 'V'], ['ph', 'Supply', 'g', 3, [[2, 'Single-phase'], [3, 'Three-phase']]], ['ef', 'Efficiency', 'n', 88, '%'], ['pf', 'Power factor', 'n', 0.85]],
    [O('Full-load current', 'hp*746/(v*' + MULT + '*ef/100*pf)', 'A', 3), O('Input power', 'hp*0.746/(ef/100)', 'kW', 3)]);
  F('watts-to-volts-calculator', 'Watts to Volts Calculator', EL, 'Voltage from power and current.', 'V = W ÷ A (÷ PF).',
    [['w', 'Power', 'n', 1200, 'W'], ['i', 'Current', 'n', 5, 'A'], PH, PF()], [O('Voltage', 'w/(i*' + MULT + '*' + PFE + ')', 'V', 3)]);
  C('power-factor-calculator', 'Power Factor Calculator', EL, 'Power factor from real and apparent power, or from voltage and current.', 'PF = kW ÷ kVA = cos φ.',
    [['k', 'You know', 'g', 1, [[1, 'kW and kVA'], [2, 'kW, volts, amps (1-φ)']]], ['kw', 'Real power', 'n', 80, 'kW'], ['kva', 'Apparent power', 'n', 100, 'kVA', { show: 'k==1' }], ['v', 'Voltage', 'n', 230, 'V', { show: 'k==2' }], ['i', 'Current', 'n', 450, 'A', { show: 'k==2' }]],
    function (v) { var S = +v.k === 1 ? v.kva : v.v * v.i / 1000; if (!(S > 0) || !(v.kw > 0) || v.kw > S + 1e-9) return { error: 'Real power cannot exceed apparent power.' }; var pf = v.kw / S;
      return { results: [rm('Power factor', pf, 4), r('Phase angle', Math.acos(pf) * 180 / Math.PI, 3, '°'), r('Reactive power', Math.sqrt(S * S - v.kw * v.kw), 4, 'kVAR'), R('Rating', pf >= 0.95 ? 'Excellent' : pf >= 0.9 ? 'Good' : pf >= 0.8 ? 'Fair — consider correction' : 'Poor — penalties likely', 'text')] }; });
  F('power-factor-correction-calculator', 'Power Factor Correction (Capacitor Bank) Calculator', EL, 'Capacitor kVAR needed to raise the power factor.', 'Qc = P (tan φ₁ − tan φ₂).',
    [['p', 'Load', 'n', 100, 'kW'], ['p1', 'Present power factor', 'n', 0.72], ['p2', 'Target power factor', 'n', 0.95]],
    [O('Capacitor required', 'p*(tan(acos(p1))-tan(acos(p2)))', 'kVAR', 3), O('Apparent power before', 'p/p1', 'kVA', 3), O('Apparent power after', 'p/p2', 'kVA', 3), O('Current reduced by', '(1-p1/p2)*100', '%', 2)]);
  F('transformer-calculator', 'Transformer Calculator', EL, 'Turns ratio and currents of a transformer.', 'Vp ÷ Vs = Np ÷ Ns = Is ÷ Ip.',
    [['vp', 'Primary voltage', 'n', 11000, 'V'], ['vs', 'Secondary voltage', 'n', 415, 'V'], ['kva', 'Rating', 'n', 500, 'kVA'], ['ph', 'Supply', 'g', 3, [[2, 'Single-phase'], [3, 'Three-phase']]]],
    [O('Turns ratio', 'vp/vs', ': 1', 4), O('Primary current', 'kva*1000/(vp*' + MULT + ')', 'A', 3), O('Secondary current', 'kva*1000/(vs*' + MULT + ')', 'A', 3)]);
  C('conductor-resistance-calculator', 'Wire Resistance Calculator', EL, 'Resistance of a conductor from material, length and cross-section.', 'R = ρ × L ÷ A.',
    [['m', 'Material', 's', 1.724e-8, [[1.724e-8, 'Copper'], [2.82e-8, 'Aluminium'], [1.59e-8, 'Silver'], [2.44e-8, 'Gold'], [1.0e-7, 'Iron'], [5.6e-8, 'Tungsten'], [1.1e-6, 'Nichrome']]], ['l', 'Length', 'n', 100, 'm'], ['a', 'Cross-section area', 'n', 2.5, 'mm²'], ['i', 'Current (optional)', 'n', 10, 'A', { opt: 1 }]],
    function (v) { if (!(v.l > 0) || !(v.a > 0)) return { error: 'Length and area must be positive.' }; var Rr_ = +v.m * v.l / (v.a * 1e-6);
      return { results: [rm('Resistance', Rr_, 5, 'Ω'), r('Per metre', Rr_ / v.l * 1000, 4, 'mΩ/m'), r('Voltage drop at that current', Rr_ * v.i, 4, 'V'), r('Power lost as heat', Rr_ * v.i * v.i, 4, 'W')] }; });
  C('voltage-drop-calculator', 'Voltage Drop Calculator', EL, 'Voltage drop along a cable run.', 'Vd = 2 × I × L × ρ ÷ A (single-phase) · √3 × I × L × ρ ÷ A (three-phase).',
    [['m', 'Conductor', 's', 1.724e-8, [[1.724e-8, 'Copper'], [2.82e-8, 'Aluminium']]], ['i', 'Load current', 'n', 20, 'A'], ['l', 'One-way cable length', 'n', 30, 'm'], ['a', 'Cable size', 'n', 4, 'mm²'], ['v', 'Supply voltage', 'n', 230, 'V'], ['ph', 'Supply', 'g', 2, [[1, 'DC / single-phase'], [3, 'Three-phase']]]],
    function (v) { if (!(v.a > 0) || !(v.l > 0)) return { error: 'Length and cable size must be positive.' }; var k = +v.ph === 3 ? Math.sqrt(3) : 2, vd = k * v.i * v.l * +v.m / (v.a * 1e-6), pct = vd / v.v * 100;
      return { results: [rm('Voltage drop', vd, 4, 'V'), r('Percentage drop', pct, 3, '%'), r('Voltage at the load', v.v - vd, 4, 'V'), R('Within 3–5% limit?', pct <= 3 ? 'Yes — good' : pct <= 5 ? 'Acceptable (under 5%)' : 'No — use a bigger cable', 'text')] }; }, { pop: 1 });
  C('wire-size-calculator', 'Wire Size Calculator (for Voltage Drop)', EL, 'Smallest standard cable size for a current, length and allowed drop.', 'A = 2 ρ L I ÷ ΔVmax.',
    [['m', 'Conductor', 's', 1.724e-8, [[1.724e-8, 'Copper'], [2.82e-8, 'Aluminium']]], ['i', 'Load current', 'n', 25, 'A'], ['l', 'One-way cable length', 'n', 40, 'm'], ['v', 'Supply voltage', 'n', 230, 'V'], ['dp', 'Allowed voltage drop', 'n', 3, '%'], ['ph', 'Supply', 'g', 2, [[1, 'DC / single-phase'], [3, 'Three-phase']]]],
    function (v) { var k = +v.ph === 3 ? Math.sqrt(3) : 2, need = k * +v.m * v.l * v.i / (v.v * v.dp / 100) * 1e6, std = [0.5, 0.75, 1, 1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630], pick = null; for (var i = 0; i < std.length; i++) if (std[i] >= need) { pick = std[i]; break; }
      var dens = v.i / (pick || need); return { results: [rm('Minimum cable size', need, 3, 'mm²'), R('Next standard size', pick ? pick + ' mm²' : 'Larger than 630 mm² — use parallel cables', 'text'), r('Current density', dens, 3, 'A/mm²'), R('Heating check', dens <= 6 ? 'Within the usual limit (≤ 6 A/mm²)' : 'High — check the cable’s current rating', 'text')], note: 'Always confirm the cable’s current-carrying capacity (installation method, grouping, ambient temperature) with the local wiring code.' }; });
  C('awg-wire-gauge-calculator', 'AWG Wire Gauge Calculator', EL, 'Diameter, area and resistance of a wire from its AWG number — or the AWG from a diameter.', 'd = 0.127 mm × 92^((36 − AWG) ÷ 39).',
    [['k', 'You know', 'g', 1, [[1, 'AWG number'], [2, 'Diameter (mm)']]], ['x', 'Value', 'n', 12]],
    function (v) { var awg, d; if (+v.k === 1) { awg = v.x; d = 0.127 * Math.pow(92, (36 - awg) / 39); } else { d = v.x; if (!(d > 0)) return { error: 'Diameter must be positive.' }; awg = 36 - 39 * Math.log(d / 0.127) / Math.log(92); } if (!isFinite(d) || d <= 0 || awg < -5 || awg > 60) return { error: 'Enter an AWG between −3 and 56, or a sensible diameter.' };
      var A = Math.PI * d * d / 4; return { results: [rm('AWG', awg, 2), r('Diameter', d, 4, 'mm'), r('Cross-section', A, 4, 'mm²'), r('Resistance (copper)', 17.24 / A, 4, 'Ω/km'), r('Resistance per 1000 ft', 17.24 / A * 0.3048, 4, 'Ω'), r('Weight (copper)', A * 8.96, 3, 'kg/km')] }; });
  F('battery-capacity-converter', 'Battery Capacity Converter (mAh ↔ Wh ↔ Ah)', EL, 'Convert between mAh, Ah, Wh and kWh.', 'Wh = Ah × V.',
    [['mah', 'Capacity', 'n', 5000, 'mAh'], ['v', 'Battery voltage', 'n', 3.7, 'V']], [O('Capacity in Ah', 'mah/1000', 'Ah', 4), O('Energy', 'mah/1000*v', 'Wh', 4), O('Energy in kWh', 'o2/1000', 'kWh', 6)]);
  F('battery-life-calculator', 'Battery Life Calculator', EL, 'How long a battery lasts for a given load.', 'Runtime = capacity × voltage × usable % ÷ load.',
    [['c', 'Battery capacity', 'n', 100, 'Ah'], ['v', 'Battery voltage', 'n', 12, 'V'], ['w', 'Load', 'n', 120, 'W'], ['dod', 'Usable capacity (depth of discharge)', 'n', 80, '%'], ['ef', 'Inverter / system efficiency', 'n', 90, '%']],
    [O('Runtime', 'c*v*dod/100*ef/100/w', 'hours', 2), O('In minutes', 'o1*60', 'min', 0), O('Usable energy', 'c*v*dod/100/1000', 'kWh', 3), O('Load current', 'w/v', 'A', 2)], { pop: 1 });
  F('battery-charge-time-calculator', 'Battery Charge Time Calculator', EL, 'Hours to charge a battery from a given charger.', 'Time = capacity ÷ charging current ÷ efficiency.',
    [['c', 'Battery capacity', 'n', 100, 'Ah'], ['ch', 'Charging current', 'n', 10, 'A'], ['s', 'Starting charge', 'n', 20, '%'], ['ef', 'Charging efficiency', 'n', 85, '%']],
    [O('Charge time', 'c*(100-s)/100/ch/(ef/100)', 'hours', 2), O('Charge added', 'c*(100-s)/100', 'Ah', 2), O('Energy drawn from charger', 'o2*12/(ef/100)/1000', 'kWh (at 12 V)', 3)]);
  F('battery-bank-calculator', 'Battery Bank Calculator', EL, 'Batteries in series and parallel to reach a voltage and capacity.', 'Series adds voltage · parallel adds capacity.',
    [['vt', 'System voltage needed', 'n', 48, 'V'], ['ct', 'Capacity needed', 'n', 400, 'Ah'], ['vb', 'Battery voltage', 'n', 12, 'V'], ['cb', 'Battery capacity', 'n', 100, 'Ah']],
    [O('Batteries in series', 'ceil(vt/vb)', '', 0), O('Strings in parallel', 'ceil(ct/cb)', '', 0), O('Total batteries', 'o1*o2', '', 0), O('Bank capacity', 'o2*cb', 'Ah', 0), O('Bank energy', 'o1*vb*o2*cb/1000', 'kWh', 2)]);
  C('generator-size-calculator', 'Generator Size Calculator', EL, 'Generator rating needed for a list of appliances, including starting surge.', 'Size = (running watts + largest starting surge) ÷ power factor.',
    [['d', 'Appliance, running watts and extra starting watts (one per line)', 'ta', 'Fridge 150 600\nAC 1500 2500\nLights 200 0\nWater pump 750 1500\nTV 120 0', { rows: 6 }], ['pf', 'Power factor', 'n', 0.8], ['mg', 'Safety margin', 'n', 20, '%']],
    function (v) { var rows = String(v.d).trim().split(/\n/).map(function (l) { var m = /^(.*?)[\s:]+([\d.]+)(?:[\s:]+([\d.]+))?\s*$/.exec(l.trim()); return m ? [m[1], +m[2], +(m[3] || 0)] : null; }).filter(Boolean); if (!rows.length) return { error: 'Enter appliances as "name running-watts starting-watts".' };
      var run = CW.stat.sum(rows.map(function (q) { return q[1]; })), surge = Math.max.apply(null, rows.map(function (q) { return q[2]; })), peak = run + surge, kva = peak * (1 + v.mg / 100) / v.pf / 1000;
      return { results: [rm('Generator size needed', kva, 3, 'kVA'), r('In kW', kva * v.pf, 3, 'kW'), r('Running load', run, 0, 'W'), r('Peak load (with surge)', peak, 0, 'W')], table: { head: ['Appliance', 'Running W', 'Starting W'], rows: rows, fmt: ['', 'int', 'int'], title: 'Loads' } }; });
  F('ups-backup-time-calculator', 'UPS / Inverter Backup Time Calculator', EL, 'How long your UPS or inverter battery runs the load.', 'Backup time = battery Wh × efficiency × usable % ÷ load.',
    [['ah', 'Battery capacity', 'n', 150, 'Ah'], ['nb', 'Number of batteries', 'n', 1], ['v', 'Battery voltage', 'n', 12, 'V'], ['w', 'Load', 'n', 300, 'W'], ['ef', 'Inverter efficiency', 'n', 85, '%'], ['dod', 'Usable capacity', 'n', 50, '%']],
    [O('Backup time', 'ah*nb*v*ef/100*dod/100/w', 'hours', 2), O('In minutes', 'o1*60', 'min', 0), O('Battery energy', 'ah*nb*v/1000', 'kWh', 3)], { pop: 1 });
  F('motor-synchronous-speed-calculator', 'Motor Synchronous Speed & Slip Calculator', EL, 'Synchronous speed and slip of an AC induction motor.', 'Nₛ = 120 f ÷ P · slip = (Nₛ − N) ÷ Nₛ.',
    [['f', 'Supply frequency', 'n', 50, 'Hz'], ['p', 'Number of poles', 'n', 4], ['n', 'Actual shaft speed', 'n', 1440, 'rpm']],
    [O('Synchronous speed', '120*f/p', 'rpm', 0), O('Slip', '(o1-n)/o1*100', '%', 2), O('Slip speed', 'o1-n', 'rpm', 0)]);
  F('motor-torque-calculator', 'Motor Torque Calculator', EL, 'Shaft torque from motor power and speed.', 'T = 9550 × kW ÷ rpm.',
    [['p', 'Motor power', 'n', 7.5, 'kW'], ['n', 'Speed', 'n', 1440, 'rpm']], [O('Torque', '9549.3*p/n', 'N·m', 3), O('Torque in lb·ft', 'o1*0.737562', 'lb·ft', 3), O('Power in HP', 'p/0.7457', 'HP', 2)]);

  /* ---------- Resistor / capacitor / inductor networks ---------- */
  C('resistor-series-parallel-calculator', 'Resistor Series & Parallel Calculator', EL, 'Equivalent resistance of resistors in series and in parallel.', 'Series: ΣR · Parallel: 1 ÷ Σ(1 ÷ R).',
    [['d', 'Resistor values (Ω), separated by commas, spaces or new lines', 'ta', '100, 220, 330, 470', { rows: 3 }]],
    function (v) { var d = L(v.d).filter(function (x) { return x > 0; }); if (d.length < 2) return { error: 'Enter at least 2 positive values.' }; var s = CW.stat.sum(d), p = 1 / CW.stat.sum(d.map(function (x) { return 1 / x; }));
      return { results: [rm('Series resistance', s, 5, 'Ω'), r('Parallel resistance', p, 5, 'Ω'), r('Resistors', d.length, 0)] }; }, { pop: 1 });
  C('capacitor-series-parallel-calculator', 'Capacitor Series & Parallel Calculator', EL, 'Equivalent capacitance in series and parallel.', 'Parallel: ΣC · Series: 1 ÷ Σ(1 ÷ C).',
    [['d', 'Capacitor values (same unit), separated by commas or spaces', 'ta', '10, 22, 47', { rows: 2 }]],
    function (v) { var d = L(v.d).filter(function (x) { return x > 0; }); if (d.length < 2) return { error: 'Enter at least 2 positive values.' }; return { results: [rm('Parallel capacitance', CW.stat.sum(d), 5), r('Series capacitance', 1 / CW.stat.sum(d.map(function (x) { return 1 / x; })), 5)] }; });
  C('inductor-series-parallel-calculator', 'Inductor Series & Parallel Calculator', EL, 'Equivalent inductance in series and parallel.', 'Series: ΣL · Parallel: 1 ÷ Σ(1 ÷ L).',
    [['d', 'Inductor values (same unit), separated by commas or spaces', 'ta', '10, 22, 47', { rows: 2 }]],
    function (v) { var d = L(v.d).filter(function (x) { return x > 0; }); if (d.length < 2) return { error: 'Enter at least 2 positive values.' }; return { results: [rm('Series inductance', CW.stat.sum(d), 5), r('Parallel inductance', 1 / CW.stat.sum(d.map(function (x) { return 1 / x; })), 5)] }; });
  F('voltage-divider-calculator', 'Voltage Divider Calculator', EL, 'Output voltage of a two-resistor divider.', 'Vout = Vin × R2 ÷ (R1 + R2).',
    [['vin', 'Input voltage', 'n', 12, 'V'], ['r1', 'R1', 'n', 10000, 'Ω'], ['r2', 'R2', 'n', 4700, 'Ω']],
    [O('Output voltage', 'vin*r2/(r1+r2)', 'V', 4), O('Current', 'vin/(r1+r2)*1000', 'mA', 4), O('Power dissipated', 'vin^2/(r1+r2)*1000', 'mW', 3), O('Ratio', 'r2/(r1+r2)*100', '%', 2)]);

  /* ---------- ELECTRONICS ---------- */
  var E12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2], E24 = [1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1];
  var near = function (val, series, mode) { var dec = Math.floor(Math.log10(val)), best = null, bd = Infinity; for (var d = dec - 1; d <= dec + 1; d++) series.forEach(function (m) { var c = m * Math.pow(10, d), ok = mode === 'up' ? c >= val * 0.99999 : mode === 'down' ? c <= val * 1.00001 : true, df = Math.abs(Math.log(c / val)); if (ok && df < bd) { bd = df; best = c; } }); return best; };
  var E96 = []; for (var q = 0; q < 96; q++) E96.push(Math.round(Math.pow(10, q / 96) * 100) / 100);
  C('led-resistor-calculator', 'LED Resistor Calculator', EC, 'Series resistor needed to run an LED from a supply.', 'R = (Vsupply − Vforward) ÷ I.',
    [['vs', 'Supply voltage', 'n', 5, 'V'], ['vf', 'LED forward voltage', 'n', 2, 'V'], ['i', 'LED current', 'n', 20, 'mA'], ['n', 'LEDs in series', 'i', 1]],
    function (v) { var rr = (v.vs - v.n * v.vf) / (v.i / 1000); if (!(rr > 0)) return { error: 'The supply voltage must be higher than the total LED voltage.' }; var std = near(rr, E12, 'up');
      return { results: [rm('Resistor needed', rr, 4, 'Ω'), r('Nearest E12 value (safe side)', std, 4, 'Ω'), r('Resistor power', Math.pow(v.i / 1000, 2) * std, 4, 'W'), r('Actual LED current', (v.vs - v.n * v.vf) / std * 1000, 3, 'mA'), r('Total power drawn', v.vs * v.i / 1000, 4, 'W')] }; }, { pop: 1 });
  C('standard-resistor-value-finder', 'Standard Resistor Value Finder (E12 / E24 / E96)', EC, 'Nearest preferred resistor value to what you need.', 'Preferred values follow geometric E-series.',
    [['x', 'Resistance wanted', 'n', 3150, 'Ω']],
    function (v) { if (!(v.x > 0)) return { error: 'Enter a positive resistance.' }; var a = near(v.x, E12), b = near(v.x, E24), c = near(v.x, E96);
      return { results: [rm('Nearest E12 (±10%)', a, 4, 'Ω'), r('Nearest E24 (±5%)', b, 4, 'Ω'), r('Nearest E96 (±1%)', c, 4, 'Ω'), r('Error with E24', (b - v.x) / v.x * 100, 3, '%')] }; });
  var COL = [['Black', '#000'], ['Brown', '#8B4513'], ['Red', '#E02424'], ['Orange', '#F97316'], ['Yellow', '#EAB308'], ['Green', '#16A34A'], ['Blue', '#2563EB'], ['Violet', '#7C3AED'], ['Grey', '#6B7280'], ['White', '#F9FAFB']];
  var dig = COL.map(function (c, i) { return [i, c[0] + ' (' + i + ')']; });
  var MUL = [[0, 'Black ×1'], [1, 'Brown ×10'], [2, 'Red ×100'], [3, 'Orange ×1k'], [4, 'Yellow ×10k'], [5, 'Green ×100k'], [6, 'Blue ×1M'], [7, 'Violet ×10M'], [8, 'Grey ×100M'], [9, 'White ×1G'], [-1, 'Gold ×0.1'], [-2, 'Silver ×0.01']];
  var TOL = [[1, 'Brown ±1%'], [2, 'Red ±2%'], [0.5, 'Green ±0.5%'], [0.25, 'Blue ±0.25%'], [0.1, 'Violet ±0.1%'], [5, 'Gold ±5%'], [10, 'Silver ±10%']];
  C('resistor-color-code-calculator', 'Resistor Colour Code Calculator (4, 5 & 6 Band)', EC, 'Resistance value from the colour bands.', 'Value = (digits) × multiplier ± tolerance.',
    [['nb', 'Bands', 'g', 4, [[4, '4 bands'], [5, '5 bands']]], ['b1', 'Band 1', 's', 4, dig.slice(1)], ['b2', 'Band 2', 's', 7, dig], ['b3', 'Band 3 (digit)', 's', 0, dig, { show: 'nb==5' }], ['mu', 'Multiplier', 's', 2, MUL], ['tl', 'Tolerance', 's', 5, TOL]],
    function (v) { var nb = +v.nb, base = nb === 4 ? +v.b1 * 10 + +v.b2 : +v.b1 * 100 + +v.b2 * 10 + +v.b3, val = base * Math.pow(10, +v.mu), t = +v.tl; var fmt = val >= 1e6 ? N(val / 1e6, 4) + ' MΩ' : val >= 1e3 ? N(val / 1e3, 4) + ' kΩ' : N(val, 4) + ' Ω';
      var bands = [+v.b1, +v.b2].concat(nb === 5 ? [+v.b3] : []), sw = function (c) { return '<span style="display:inline-block;width:18px;height:46px;border-radius:3px;margin:0 3px;background:' + c + ';box-shadow:inset 0 0 0 1px rgba(0,0,0,.25)"></span>'; }, cm = { '-1': '#C9A227', '-2': '#C0C0C0' }, tc = { 1: '#8B4513', 2: '#E02424', 0.5: '#16A34A', 0.25: '#2563EB', 0.1: '#7C3AED', 5: '#C9A227', 10: '#C0C0C0' };
      var html = '<div style="padding:10px 4px;text-align:center">' + bands.map(function (b) { return sw(COL[b][1]); }).join('') + sw(+v.mu >= 0 ? COL[+v.mu][1] : cm[v.mu]) + '<span style="display:inline-block;width:14px"></span>' + sw(tc[t]) + '</div>';
      return { results: [rm('Resistance', val, 6, 'Ω'), R('Readable value', fmt, 'text'), R('Tolerance', '±' + t + '%', 'text'), R('Range', N(val * (1 - t / 100), 5) + ' – ' + N(val * (1 + t / 100), 5) + ' Ω', 'text')], html: html }; }, { pop: 1 });
  C('rc-time-constant-calculator', 'RC Time Constant Calculator', EC, 'Time constant and charging time of an RC circuit.', 'τ = R × C · V(t) = V₀(1 − e^(−t ÷ τ)).',
    [['r', 'Resistance', 'n', 10000, 'Ω'], ['c', 'Capacitance', 'n', 100, 'µF'], ['p', 'Charge level to reach', 'n', 95, '%']],
    function (v) { var tau = v.r * v.c * 1e-6; if (!(tau > 0) || !(v.p > 0 && v.p < 100)) return { error: 'Check the values (charge level between 0% and 100%).' }; var lab = [], pts = []; for (var i = 0; i <= 25; i++) { var t = 5 * tau * i / 25; lab.push(N(t, 3) + 's'); pts.push(100 * (1 - Math.exp(-t / tau))); }
      return { results: [rm('Time constant τ', tau, 6, 's'), r('Time to reach ' + N(v.p, 3) + '%', -tau * Math.log(1 - v.p / 100), 6, 's'), r('Time to 63.2% (1τ)', tau, 6, 's'), r('Time to 99.3% (5τ)', 5 * tau, 6, 's'), r('Cut-off frequency', 1 / (2 * Math.PI * tau), 4, 'Hz')], chart: { type: 'line', title: 'Capacitor charge (%)', labels: lab, series: [{ l: 'Charge', pts: pts }], f: 'num' } }; });
  F('rl-time-constant-calculator', 'RL Time Constant Calculator', EC, 'Time constant of an RL circuit.', 'τ = L ÷ R.',
    [['l', 'Inductance', 'n', 100, 'mH'], ['r', 'Resistance', 'n', 50, 'Ω']], [O('Time constant τ', 'l/1000/r', 's', 6), O('Time to 99.3% (5τ)', '5*o1', 's', 6), O('Cut-off frequency', 'r/(2*pi*l/1000)', 'Hz', 3)]);
  SV('lc-resonance-calculator', 'LC Resonant Frequency Calculator', EC, 'Resonant frequency, inductance or capacitance of an LC circuit.', 'f = 1 ÷ (2π √(LC)).',
    [['f', 'Resonant frequency', 'Hz', 503.29, function (v) { return 1 / (2 * Math.PI * Math.sqrt(v.l * v.c * 1e-12)); }], ['l', 'Inductance', 'mH', 100, function (v) { return 1e12 / (Math.pow(2 * Math.PI * v.f, 2) * v.c); }], ['c', 'Capacitance', 'nF', 1000, function (v) { return 1e12 / (Math.pow(2 * Math.PI * v.f, 2) * v.l); }]], { pop: 0 });
  F('reactance-calculator', 'Inductive & Capacitive Reactance Calculator', EC, 'Reactance of an inductor and a capacitor at a frequency.', 'X_L = 2πfL · X_C = 1 ÷ (2πfC).',
    [['f', 'Frequency', 'n', 1000, 'Hz'], ['l', 'Inductance', 'n', 10, 'mH'], ['c', 'Capacitance', 'n', 1, 'µF']],
    [O('Inductive reactance X_L', '2*pi*f*l/1000', 'Ω', 4), O('Capacitive reactance X_C', '1/(2*pi*f*c/1e6)', 'Ω', 4), O('Net reactance', 'o1-o2', 'Ω', 4)]);
  F('rlc-impedance-calculator', 'RLC Series Impedance Calculator', EC, 'Impedance, phase angle and resonance of a series RLC circuit.', 'Z = √(R² + (X_L − X_C)²).',
    [['r', 'Resistance', 'n', 100, 'Ω'], ['l', 'Inductance', 'n', 10, 'mH'], ['c', 'Capacitance', 'n', 1, 'µF'], ['f', 'Frequency', 'n', 1000, 'Hz']],
    [O('Impedance |Z|', 'sqrt(r^2+(2*pi*f*l/1000-1/(2*pi*f*c/1e6))^2)', 'Ω', 4), O('Phase angle', 'atan((2*pi*f*l/1000-1/(2*pi*f*c/1e6))/r)*180/pi', '°', 3), O('Resonant frequency', '1/(2*pi*sqrt(l/1000*c/1e6))', 'Hz', 2), O('Quality factor Q', 'sqrt(l/1000/(c/1e6))/r', '', 3)]);
  F('rc-filter-cutoff-calculator', 'RC Filter Cut-off Frequency Calculator', EC, 'Cut-off frequency of a low-pass or high-pass RC filter.', 'fc = 1 ÷ (2π R C).',
    [['r', 'Resistance', 'n', 1000, 'Ω'], ['c', 'Capacitance', 'n', 100, 'nF']], [O('Cut-off frequency', '1/(2*pi*r*c/1e9)', 'Hz', 3), O('Time constant', 'r*c/1e9', 's', 8), O('Roll-off', '-20', 'dB/decade', 0)]);
  C('555-timer-calculator', '555 Timer Calculator (Astable & Monostable)', EC, 'Frequency, duty cycle and pulse width of a 555 timer circuit.', 'Astable: f = 1.44 ÷ ((R1 + 2R2) C) · Monostable: T = 1.1 R C.',
    [['m', 'Mode', 'g', 1, [[1, 'Astable'], [2, 'Monostable']]], ['r1', 'R1', 'n', 1000, 'Ω'], ['r2', 'R2', 'n', 10000, 'Ω', { show: 'm==1' }], ['c', 'Capacitor', 'n', 10, 'µF']],
    function (v) { var c = v.c * 1e-6; if (+v.m === 2) { var T = 1.1 * v.r1 * c; return { results: [rm('Pulse width', T, 6, 's'), r('In milliseconds', T * 1000, 4, 'ms')] }; } var f = 1.44 / ((v.r1 + 2 * v.r2) * c), th = 0.693 * (v.r1 + v.r2) * c, tl = 0.693 * v.r2 * c;
      return { results: [rm('Frequency', f, 5, 'Hz'), r('Period', 1 / f, 6, 's'), r('Duty cycle', th / (th + tl) * 100, 3, '%'), r('High time', th, 6, 's'), r('Low time', tl, 6, 's')] }; });
  C('op-amp-gain-calculator', 'Op-Amp Gain Calculator', EC, 'Gain of inverting and non-inverting op-amp amplifiers.', 'Inverting: −Rf ÷ Rin · Non-inverting: 1 + Rf ÷ Rg.',
    [['m', 'Configuration', 'g', 1, [[1, 'Inverting'], [2, 'Non-inverting']]], ['rf', 'Feedback resistor Rf', 'n', 100000, 'Ω'], ['rg', 'Input / ground resistor', 'n', 10000, 'Ω'], ['vin', 'Input voltage', 'n', 0.5, 'V']],
    function (v) { var g = +v.m === 1 ? -v.rf / v.rg : 1 + v.rf / v.rg; return { results: [rm('Voltage gain', g, 5), r('Gain in dB', 20 * Math.log10(Math.abs(g)), 3, 'dB'), r('Output voltage', g * v.vin, 5, 'V'), r('Input impedance', +v.m === 1 ? v.rg : Infinity, 1, +v.m === 1 ? 'Ω' : '(very high)')] }; });
  C('decibel-calculator', 'Decibel (dB) Calculator', EC, 'Convert between decibels and power or voltage ratios.', 'dB = 10 log₁₀(P₂ ÷ P₁) = 20 log₁₀(V₂ ÷ V₁).',
    [['k', 'You know', 's', 1, [[1, 'Power ratio'], [2, 'Voltage ratio'], [3, 'Decibels (dB)']]], ['x', 'Value', 'n', 2]],
    function (v) { var db, k = +v.k; if (k === 3) db = v.x; else { if (!(v.x > 0)) return { error: 'The ratio must be positive.' }; db = (k === 1 ? 10 : 20) * Math.log10(v.x); } return { results: [rm('Decibels', db, 4, 'dB'), r('Power ratio', Math.pow(10, db / 10), 5, '×'), r('Voltage ratio', Math.pow(10, db / 20), 5, '×')] }; });
  F('adc-resolution-calculator', 'ADC Resolution Calculator', EC, 'Step size and number of levels of an analog-to-digital converter.', 'LSB = Vref ÷ 2ⁿ.',
    [['n', 'Resolution', 'n', 12, 'bits'], ['vref', 'Reference voltage', 'n', 3.3, 'V'], ['vin', 'Input voltage (optional)', 'n', 1.65, 'V']],
    [O('Number of levels', '2^n', '', 0), O('Step size (1 LSB)', 'vref/2^n*1000', 'mV', 4), O('Digital reading for the input', 'floor(vin/vref*2^n)', '', 0), O('Dynamic range', '6.02*n+1.76', 'dB', 2)]);
  C('pcb-trace-width-calculator', 'PCB Trace Width Calculator (IPC-2221)', EC, 'Copper trace width for a current and temperature rise.', 'A = (I ÷ (k ΔT^0.44))^(1 ÷ 0.725).',
    [['i', 'Current', 'n', 2, 'A'], ['dt', 'Allowed temperature rise', 'n', 10, '°C'], ['oz', 'Copper thickness', 's', 1, [[0.5, '0.5 oz (17.5 µm)'], [1, '1 oz (35 µm)'], [2, '2 oz (70 µm)']]], ['ly', 'Layer', 'g', 0.048, [[0.048, 'Outer'], [0.024, 'Inner']]]],
    function (v) { var A = Math.pow(v.i / (+v.ly * Math.pow(v.dt, 0.44)), 1 / 0.725), th = +v.oz * 1.378, w = A / th; return { results: [rm('Trace width', w * 0.0254, 3, 'mm'), r('In mils', w, 2, 'mil'), r('Cross-section', A, 2, 'mil²'), r('Copper thickness', th * 0.0254 * 1000, 1, 'µm')] }; });
  F('capacitor-energy-calculator', 'Capacitor Energy & Charge Calculator', EC, 'Energy and charge stored in a capacitor.', 'E = ½ C V² · Q = C V.',
    [['c', 'Capacitance', 'n', 1000, 'µF'], ['v', 'Voltage', 'n', 25, 'V']], [O('Stored energy', '0.5*c/1e6*v^2', 'J', 6), O('Charge', 'c/1e6*v', 'C', 6), O('Energy in mJ', 'o1*1000', 'mJ', 4)]);
  F('inductor-energy-calculator', 'Inductor Energy Calculator', EC, 'Energy stored in an inductor.', 'E = ½ L I².',
    [['l', 'Inductance', 'n', 10, 'mH'], ['i', 'Current', 'n', 2, 'A']], [O('Stored energy', '0.5*l/1000*i^2', 'J', 6), O('Energy in mJ', 'o1*1000', 'mJ', 4)]);
  F('parallel-plate-capacitor-calculator', 'Parallel Plate Capacitor Calculator', EC, 'Capacitance from plate area, gap and dielectric.', 'C = ε₀ εᵣ A ÷ d.',
    [['a', 'Plate area', 'n', 10, 'cm²'], ['d', 'Plate gap', 'n', 0.5, 'mm'], ['er', 'Relative permittivity εᵣ', 'n', 4.5]],
    [O('Capacitance', '8.8541878128e-12*er*a/1e4/(d/1000)*1e12', 'pF', 3), O('In nF', 'o1/1000', 'nF', 5)], { note: 'εᵣ: air 1 · paper 3.7 · glass 5–10 · ceramic 100+ · polyester 3.3.' });
  F('dipole-antenna-calculator', 'Dipole Antenna Length Calculator', EC, 'Half-wave dipole length for a frequency.', 'L = 468 ÷ f(MHz) feet.',
    [['f', 'Frequency', 'n', 145, 'MHz']], [O('Total length', '468/f/3.28084', 'm', 4), O('Each arm', 'o1/2', 'm', 4), O('Length in feet', '468/f', 'ft', 3), O('Wavelength', '299.792458/f', 'm', 4)]);
  F('vswr-calculator', 'VSWR & Return Loss Calculator', EC, 'Standing wave ratio from forward and reflected power.', 'VSWR = (1 + Γ) ÷ (1 − Γ), Γ = √(Pr ÷ Pf).',
    [['pf', 'Forward power', 'n', 100, 'W'], ['pr', 'Reflected power', 'n', 4, 'W']],
    [['VSWR', '(1+sqrt(pr/pf))/(1-sqrt(pr/pf))', 'n', ': 1', { dp: 3 }], O('Reflection coefficient Γ', 'sqrt(pr/pf)', '', 4), O('Return loss', '-20*log(sqrt(pr/pf))', 'dB', 2), O('Power delivered', '(1-pr/pf)*100', '%', 2)]);
})(window.CW);
