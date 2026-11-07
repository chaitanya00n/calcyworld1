/* Calcyworld — chemistry & biology / lab */
(function (CW) {
  'use strict';
  var F = CW.F, C = CW.C, M = CW.M, R = CW.Rr, SV = CW.solve, r = CW.R, rm = CW.RM, rt = CW.RT, L = CW.list, chem = CW.chem;
  var N = function (x, d) { return CW.fmt.num(x, d === undefined ? 6 : d); };
  var CH = 'science/chemistry', BI = 'science/biology';
  var O = function (l, e, u, dp) { return [l, e, 'n', u || '', { dp: dp === undefined ? 6 : dp }]; };
  var SUBS = '₀₁₂₃₄₅₆₇₈₉';
  var sub = function (n) { return n === 1 ? '' : String(n).replace(/\d/g, function (d) { return SUBS.charAt(+d); }); };
  var parseF = function (txt) { try { var c = chem.parse(txt); return { cnt: c, mass: chem.mass(c) }; } catch (e) { return { err: e.message }; } };
  var formulaStr = function (cnt) { return chem.order(cnt).map(function (k) { return k + sub(cnt[k]); }).join(''); };

  /* ======================= CHEMISTRY ======================= */
  C('molar-mass-calculator', 'Molar Mass Calculator', CH, 'Molecular weight and composition of any chemical formula.', 'Molar mass = Σ (atomic mass × atoms of each element).',
    [['f', 'Chemical formula', 't', 'Ca(OH)2'], ['q', 'Sample mass (optional)', 'n', 10, 'g', { opt: 1 }]],
    function (v) { var p = parseF(v.f); if (p.err) return { error: p.err + ' — use capital letters for elements, e.g. Ca(OH)2, C6H12O6, CuSO4.5H2O' }; var keys = chem.order(p.cnt), mol = v.q > 0 ? v.q / p.mass : 0;
      return { results: [rm('Molar mass', p.mass, 4, 'g/mol'), R('Formula', formulaStr(p.cnt), 'text'), r('Total atoms', CW.stat.sum(keys.map(function (k) { return p.cnt[k]; })), 0), r('Moles in the sample', mol, 6, 'mol'), r('Molecules in the sample', mol * 6.02214076e23, 4)],
        table: { head: ['Element', 'Name', 'Atoms', 'Atomic mass', 'Mass %'], rows: keys.map(function (k) { return [k, chem.by[k].n, p.cnt[k], chem.by[k].m, chem.by[k].m * p.cnt[k] / p.mass * 100]; }), fmt: ['', '', 'int', 'num', 'pct'], title: 'Composition by element' },
        chart: { type: 'donut', data: keys.map(function (k) { return { l: chem.by[k].n, v: chem.by[k].m * p.cnt[k] }; }), f: 'num' } }; }, { pop: 1 });
  C('percent-composition-calculator', 'Percent Composition Calculator', CH, 'Mass percentage of each element in a compound.', '% of element = (atoms × atomic mass) ÷ molar mass × 100.',
    [['f', 'Chemical formula', 't', 'C6H12O6'], ['q', 'Sample mass', 'n', 50, 'g']],
    function (v) { var p = parseF(v.f); if (p.err) return { error: p.err }; var keys = chem.order(p.cnt);
      return { results: [rm('Molar mass', p.mass, 4, 'g/mol')].concat(keys.map(function (k) { var pc = chem.by[k].m * p.cnt[k] / p.mass; return R(chem.by[k].n + ' (' + k + ')', pc * 100, 'pct', { dp: 3, sub: N(pc * v.q, 4) + ' g in the sample' }); })), chart: { type: 'donut', data: keys.map(function (k) { return { l: k, v: chem.by[k].m * p.cnt[k] }; }), f: 'num' } }; });
  SV('molarity-calculator', 'Molarity Calculator', CH, 'Molarity, mass of solute, molar mass or volume.', 'M = mass ÷ (molar mass × volume).',
    [['mo', 'Molarity', 'mol/L', 0.5, function (v) { return v.ms / (v.mw * v.vl); }], ['ms', 'Mass of solute', 'g', 29.22, function (v) { return v.mo * v.mw * v.vl; }], ['mw', 'Molar mass', 'g/mol', 58.44, function (v) { return v.ms / (v.mo * v.vl); }], ['vl', 'Volume of solution', 'L', 1, function (v) { return v.ms / (v.mo * v.mw); }]],
    { pop: 1, more: function (v) { return [r('Moles of solute', v.mo * v.vl, 6, 'mol')]; } });
  SV('dilution-calculator', 'Dilution Calculator (C₁V₁ = C₂V₂)', CH, 'Find the volume or concentration needed for a dilution.', 'C₁ V₁ = C₂ V₂.',
    [['c1', 'Stock concentration C₁', 'M', 12, function (v) { return v.c2 * v.v2 / v.v1; }], ['v1', 'Stock volume V₁', 'mL', 25, function (v) { return v.c2 * v.v2 / v.c1; }], ['c2', 'Final concentration C₂', 'M', 1, function (v) { return v.c1 * v.v1 / v.v2; }], ['v2', 'Final volume V₂', 'mL', 300, function (v) { return v.c1 * v.v1 / v.c2; }]],
    { pop: 1, more: function (v) { return [r('Solvent to add', v.v2 - v.v1, 5, 'mL (same unit as V)'), r('Dilution factor', v.c1 / v.c2, 4, '×')]; } });
  SV('molality-calculator', 'Molality Calculator', CH, 'Moles of solute per kilogram of solvent.', 'm = n ÷ kg of solvent.',
    [['mm', 'Molality', 'mol/kg', 1.5, function (v) { return v.n / v.kg; }], ['n', 'Moles of solute', 'mol', 0.75, function (v) { return v.mm * v.kg; }], ['kg', 'Mass of solvent', 'kg', 0.5, function (v) { return v.n / v.mm; }]]);
  SV('normality-calculator', 'Normality Calculator', CH, 'Normality from molarity and equivalents.', 'N = M × n (equivalents per mole).',
    [['nn', 'Normality', 'N', 2, function (v) { return v.mo * v.eq; }], ['mo', 'Molarity', 'mol/L', 1, function (v) { return v.nn / v.eq; }], ['eq', 'Equivalents per mole', '', 2, function (v) { return v.nn / v.mo; }]], { note: 'H₂SO₄ has 2 equivalents per mole, HCl 1, H₃PO₄ 3.' });
  C('ppm-calculator', 'PPM (Parts Per Million) Calculator', CH, 'Concentration in ppm, ppb, mg/L and percent.', 'ppm = mg of solute ÷ kg of solution.',
    [['ms', 'Mass of solute', 'n', 25, 'mg'], ['sol', 'Solution amount', 'n', 1, 'L (or kg)']],
    function (v) { if (!(v.sol > 0) || v.ms < 0) return { error: 'Enter positive amounts.' }; var ppm = v.ms / v.sol; return { results: [rm('Concentration', ppm, 6, 'ppm'), r('In ppb', ppm * 1000, 4, 'ppb'), r('In mg/L (water)', ppm, 5), r('In percent', ppm / 10000, 8, '%'), r('In g/L', ppm / 1000, 8)] }; });
  F('percent-yield-calculator', 'Percent Yield Calculator', CH, 'Actual yield compared with the theoretical yield.', '% yield = actual ÷ theoretical × 100.',
    [['a', 'Actual yield', 'n', 8.4, 'g'], ['t', 'Theoretical yield', 'n', 10.5, 'g']],
    [['Percent yield', 'a/t*100', 'p', '', { dp: 2 }], O('Lost', 't-a', 'g', 4)]);
  F('mass-percent-calculator', 'Mass Percent Calculator', CH, 'Mass percentage of a solute in a solution.', 'Mass % = mass of solute ÷ mass of solution × 100.',
    [['s', 'Mass of solute', 'n', 15, 'g'], ['v', 'Mass of solvent', 'n', 235, 'g']],
    [['Mass percent', 's/(s+v)*100', 'p', '', { dp: 3 }], O('Mass of solution', 's+v', 'g', 4), O('Solvent percent', 'v/(s+v)*100', '%', 3)]);
  C('solution-preparation-calculator', 'Solution Preparation Calculator', CH, 'How much solute to weigh for a solution of given molarity and volume.', 'mass = M × molar mass × volume.',
    [['f', 'Chemical formula', 't', 'NaCl'], ['mo', 'Concentration wanted', 'n', 0.9, 'mol/L'], ['vl', 'Volume to prepare', 'n', 500, 'mL'], ['pu', 'Purity of the chemical', 'n', 99, '%']],
    function (v) { var p = parseF(v.f); if (p.err) return { error: p.err }; if (!(v.mo > 0) || !(v.vl > 0) || !(v.pu > 0)) return { error: 'Enter positive values.' }; var g = v.mo * p.mass * v.vl / 1000;
      return { results: [rm('Weigh out', g / (v.pu / 100), 5, 'g'), r('Pure solute', g, 5, 'g'), r('Molar mass', p.mass, 4, 'g/mol'), r('Moles needed', v.mo * v.vl / 1000, 6, 'mol')], note: 'Dissolve in a little solvent, then make up to the final volume in a volumetric flask.' }; });
  C('chemical-equation-balancer', 'Chemical Equation Balancer', CH, 'Balance any chemical equation automatically.', 'Atoms of every element must be equal on both sides.',
    [['eq', 'Equation', 't', 'Fe + O2 -> Fe2O3']],
    function (v) { var b; try { b = chem.balance(v.eq); } catch (e) { return { error: e.message }; }
      return { results: [M('Balanced equation', b.text, 'text')], table: { head: ['Species', 'Coefficient', 'Side'], rows: b.species.map(function (s, i) { return [chem.pretty(s), b.coef[i], i < b.left ? 'Reactant' : 'Product']; }), fmt: ['', 'int', ''], title: 'Coefficients' } }; }, { pop: 1 });
  C('empirical-formula-calculator', 'Empirical & Molecular Formula Calculator', CH, 'Empirical formula from percent composition (or masses).', 'Divide each amount by its atomic mass, then by the smallest result.',
    [['d', 'Element and percent/mass (one per line)', 'ta', 'C 40.0\nH 6.7\nO 53.3', { rows: 4 }], ['mm', 'Molar mass (optional, for molecular formula)', 'n', 180.16, 'g/mol', { opt: 1 }]],
    function (v) { var lines = String(v.d).trim().split(/\n|;/), els = []; for (var i = 0; i < lines.length; i++) { var m = /^\s*([A-Z][a-z]?)\s*[:=]?\s*([\d.]+)\s*%?\s*$/.exec(lines[i]); if (!m) return { error: 'Line ' + (i + 1) + ': write an element symbol and a number, e.g. C 40.0' }; if (!chem.by[m[1]]) return { error: 'Unknown element "' + m[1] + '".' }; els.push([m[1], parseFloat(m[2])]); }
      if (els.length < 2) return { error: 'Enter at least two elements.' }; var mol = els.map(function (e) { return e[1] / chem.by[e[0]].m; }), mn = Math.min.apply(null, mol), ratio = mol.map(function (x) { return x / mn; }), mult = 1, ok = false;
      for (var k = 1; k <= 8 && !ok; k++) { if (ratio.every(function (x) { return Math.abs(x * k - Math.round(x * k)) < 0.1; })) { mult = k; ok = true; } }
      var cnt = {}; els.forEach(function (e, i) { cnt[e[0]] = Math.max(1, Math.round(ratio[i] * mult)); }); var em = chem.mass(cnt), res = [M('Empirical formula', formulaStr(cnt), 'text'), R('Empirical formula mass', em, 'num', { dp: 3, u: 'g/mol' })];
      if (v.mm > 0) { var n = Math.round(v.mm / em); if (n >= 1) { var mc = {}; Object.keys(cnt).forEach(function (k2) { mc[k2] = cnt[k2] * n; }); res.push(R('Molecular formula', formulaStr(mc), 'text', { sub: 'empirical × ' + n })); } }
      return { results: res, table: { head: ['Element', 'Moles', 'Ratio', 'Whole number'], rows: els.map(function (e, i) { return [e[0], mol[i], ratio[i], cnt[e[0]]]; }), fmt: ['', 'num', 'num', 'int'], title: 'Working' } }; });
  C('limiting-reagent-calculator', 'Limiting Reagent Calculator', CH, 'Which reactant runs out first, and the theoretical yield.', 'Compare moles ÷ coefficient for each reactant.',
    [['m1', 'Reactant A — mass', 'n', 10, 'g'], ['w1', 'Reactant A — molar mass', 'n', 2.016, 'g/mol'], ['c1', 'Reactant A — coefficient', 'i', 2], ['m2', 'Reactant B — mass', 'n', 64, 'g'], ['w2', 'Reactant B — molar mass', 'n', 31.998, 'g/mol'], ['c2', 'Reactant B — coefficient', 'i', 1], ['wp', 'Product — molar mass', 'n', 18.015, 'g/mol'], ['cp', 'Product — coefficient', 'i', 2]],
    function (v) { if (![v.m1, v.w1, v.c1, v.m2, v.w2, v.c2, v.wp, v.cp].every(function (x) { return x > 0; })) return { error: 'All values must be positive.' }; var n1 = v.m1 / v.w1, n2 = v.m2 / v.w2, e1 = n1 / v.c1, e2 = n2 / v.c2, lim = e1 <= e2 ? 'A' : 'B', ext = Math.min(e1, e2);
      return { results: [M('Limiting reagent', 'Reactant ' + lim, 'text'), R('Theoretical yield of product', ext * v.cp * v.wp, 'num', { dp: 5, u: 'g' }), R('Moles of product', ext * v.cp, 'num', { dp: 6, u: 'mol' }), R('Excess reagent left', lim === 'A' ? (n2 - ext * v.c2) * v.w2 : (n1 - ext * v.c1) * v.w1, 'num', { dp: 5, u: 'g' }), R('Moles of A / B', N(n1, 5) + ' / ' + N(n2, 5), 'text')] }; });
  C('ph-calculator', 'pH Calculator', CH, 'pH, pOH, [H⁺] and [OH⁻] from any one value.', 'pH = −log₁₀[H⁺] · pH + pOH = 14.',
    [['k', 'You know', 's', 1, [[1, 'pH'], [2, 'pOH'], [3, '[H⁺] (mol/L)'], [4, '[OH⁻] (mol/L)']]], ['x', 'Value', 'n', 3.5]],
    function (v) { var ph, k = +v.k, x = v.x; if (k === 1) ph = x; else if (k === 2) ph = 14 - x; else if (x > 0) ph = k === 3 ? -Math.log10(x) : 14 + Math.log10(x); else return { error: 'A concentration must be above 0.' };
      if (!isFinite(ph)) return BAD(); var h = Math.pow(10, -ph); return { results: [rm('pH', ph, 4), r('pOH', 14 - ph, 4), r('[H⁺]', h, 6, 'mol/L'), r('[OH⁻]', Math.pow(10, -(14 - ph)), 6, 'mol/L'), R('Nature', ph < 6.95 ? 'Acidic' : ph > 7.05 ? 'Basic (alkaline)' : 'Neutral', 'text')] }; });
  function BAD() { return { error: 'Please check your inputs.' }; }
  SV('buffer-ph-calculator', 'Buffer pH Calculator (Henderson–Hasselbalch)', CH, 'pH of a buffer from pKa and the acid/base ratio.', 'pH = pKa + log₁₀([A⁻] ÷ [HA]).',
    [['ph', 'Buffer pH', '', 4.76, function (v) { return v.pk + Math.log10(v.ba / v.ha); }], ['pk', 'pKa', '', 4.76, function (v) { return v.ph - Math.log10(v.ba / v.ha); }], ['ba', 'Conjugate base [A⁻]', 'M', 0.1, function (v) { return v.ha * Math.pow(10, v.ph - v.pk); }], ['ha', 'Weak acid [HA]', 'M', 0.1, function (v) { return v.ba / Math.pow(10, v.ph - v.pk); }]]);
  SV('half-life-calculator', 'Half-Life Calculator', CH, 'Half-life, initial amount, remaining amount or time.', 'N = N₀ × (½)^(t ÷ T½).',
    [['n', 'Remaining amount N', '', 25, function (v) { return v.n0 * Math.pow(0.5, v.t / v.th); }], ['n0', 'Initial amount N₀', '', 100, function (v) { return v.n / Math.pow(0.5, v.t / v.th); }], ['th', 'Half-life T½', 'time', 10, function (v) { return v.t * Math.LN2 / Math.log(v.n0 / v.n); }], ['t', 'Elapsed time', 'time', 20, function (v) { return v.th * Math.log(v.n0 / v.n) / Math.LN2; }]],
    { more: function (v) { return [r('Decay constant', Math.LN2 / v.th, 8, 'per time unit'), r('Half-lives elapsed', v.t / v.th, 4)]; } });
  F('boiling-point-elevation-calculator', 'Boiling Point Elevation Calculator', CH, 'Rise in boiling point caused by a dissolved solute.', 'ΔTb = i × Kb × m.',
    [['kb', 'Solvent constant Kb', 'n', 0.512, '°C·kg/mol'], ['m', 'Molality', 'n', 1.5, 'mol/kg'], ['i', 'van ’t Hoff factor (i)', 'n', 2], ['tb', 'Pure solvent boiling point', 'n', 100, '°C']],
    [O('Boiling point elevation', 'i*kb*m', '°C', 4), O('New boiling point', 'tb+o1', '°C', 4)], { note: 'Kb: water 0.512 · ethanol 1.22 · benzene 2.53 · acetic acid 3.07.' });
  F('freezing-point-depression-calculator', 'Freezing Point Depression Calculator', CH, 'Drop in freezing point caused by a dissolved solute.', 'ΔTf = i × Kf × m.',
    [['kf', 'Solvent constant Kf', 'n', 1.86, '°C·kg/mol'], ['m', 'Molality', 'n', 2, 'mol/kg'], ['i', 'van ’t Hoff factor (i)', 'n', 2], ['tf', 'Pure solvent freezing point', 'n', 0, '°C']],
    [O('Freezing point depression', 'i*kf*m', '°C', 4), O('New freezing point', 'tf-o1', '°C', 4)], { note: 'Kf: water 1.86 · benzene 5.12 · acetic acid 3.90 · camphor 37.7.' });
  F('osmotic-pressure-calculator', 'Osmotic Pressure Calculator', CH, 'Osmotic pressure of a solution.', 'π = i M R T.',
    [['i', 'van ’t Hoff factor (i)', 'n', 1], ['mo', 'Molarity', 'n', 0.15, 'mol/L'], ['t', 'Temperature', 'n', 25, '°C']],
    [O('Osmotic pressure', 'i*mo*0.082057*(t+273.15)', 'atm', 5), O('In kPa', 'o1*101.325', 'kPa', 3), O('In mmHg', 'o1*760', 'mmHg', 2)]);
  C('arrhenius-equation-calculator', 'Arrhenius Equation Calculator', CH, 'Rate constant and activation energy.', 'k = A e^(−Eₐ ÷ RT).',
    [['m', 'Find', 'g', 1, [[1, 'Rate constant k'], [2, 'Activation energy']]], ['a', 'Pre-exponential factor A', 'n', 1e13, '', { show: 'm==1' }], ['ea', 'Activation energy', 'n', 75, 'kJ/mol', { show: 'm==1' }], ['t', 'Temperature', 'n', 298.15, 'K', { show: 'm==1' }],
      ['k1', 'Rate constant k₁', 'n', 0.0012, '', { show: 'm==2' }], ['t1', 'Temperature T₁', 'n', 300, 'K', { show: 'm==2' }], ['k2', 'Rate constant k₂', 'n', 0.0045, '', { show: 'm==2' }], ['t2', 'Temperature T₂', 'n', 320, 'K', { show: 'm==2' }]],
    function (v) { var R_ = 8.314462618; if (+v.m === 1) { var k = v.a * Math.exp(-v.ea * 1000 / (R_ * v.t)); return isFinite(k) ? { results: [rm('Rate constant k', k, 6, 's⁻¹'), r('Half-life (first order)', Math.LN2 / k, 5, 's')] } : BAD(); } var ea = R_ * Math.log(v.k2 / v.k1) / (1 / v.t1 - 1 / v.t2) / 1000; return isFinite(ea) ? { results: [rm('Activation energy', ea, 5, 'kJ/mol'), r('Rate increase', v.k2 / v.k1, 4, '×')] } : BAD(); });
  F('nernst-equation-calculator', 'Nernst Equation Calculator', CH, 'Cell potential under non-standard conditions.', 'E = E° − (RT ÷ nF) ln Q.',
    [['e0', 'Standard potential E°', 'n', 1.1, 'V'], ['n', 'Electrons transferred (n)', 'n', 2], ['q', 'Reaction quotient Q', 'n', 0.01], ['t', 'Temperature', 'n', 25, '°C']],
    [O('Cell potential E', 'e0-(8.314462618*(t+273.15)/(n*96485.33212))*ln(q)', 'V', 5), O('Correction term', 'o1-e0', 'V', 5), O('Equilibrium constant K', 'exp(n*96485.33212*e0/(8.314462618*(t+273.15)))', '', 4)]);
  SV('beer-lambert-law-calculator', 'Beer–Lambert Law Calculator', CH, 'Absorbance, concentration or path length.', 'A = ε × l × c.',
    [['ab', 'Absorbance A', '', 0.6, function (v) { return v.ep * v.l * v.c; }], ['ep', 'Molar absorptivity ε', 'L/(mol·cm)', 6220, function (v) { return v.ab / (v.l * v.c); }], ['l', 'Path length', 'cm', 1, function (v) { return v.ab / (v.ep * v.c); }], ['c', 'Concentration', 'mol/L', 0.0000965, function (v) { return v.ab / (v.ep * v.l); }]],
    { more: function (v) { return [r('Transmittance', Math.pow(10, -v.ab) * 100, 4, '%')]; } });
  SV('titration-calculator', 'Titration Calculator', CH, 'Unknown concentration or volume from an acid–base titration.', 'Mₐ Vₐ nₐ = M_b V_b n_b.',
    [['ma', 'Acid molarity Mₐ', 'M', 0.1, function (v) { return v.mb * v.vb * v.nb / (v.va * v.na); }], ['va', 'Acid volume Vₐ', 'mL', 25, function (v) { return v.mb * v.vb * v.nb / (v.ma * v.na); }], ['mb', 'Base molarity M_b', 'M', 0.1, function (v) { return v.ma * v.va * v.na / (v.vb * v.nb); }], ['vb', 'Base volume V_b', 'mL', 24.5, function (v) { return v.ma * v.va * v.na / (v.mb * v.nb); }]],
    { pre: [['na', 'H⁺ supplied per acid molecule', 'n', 1], ['nb', 'OH⁻ supplied per base molecule', 'n', 1]] });
  SV('mole-calculator', 'Mole Calculator (Mass ↔ Moles ↔ Particles)', CH, 'Convert between grams, moles and number of particles.', 'n = m ÷ M = N ÷ Nₐ.',
    [['n', 'Moles', 'mol', 2, function (v) { return v.m / v.mw; }], ['m', 'Mass', 'g', 36.03, function (v) { return v.n * v.mw; }], ['mw', 'Molar mass', 'g/mol', 18.015, function (v) { return v.m / v.n; }]],
    { pop: 1, more: function (v) { return [r('Particles (molecules / atoms)', v.n * 6.02214076e23, 4)]; } });
  C('average-atomic-mass-calculator', 'Average Atomic Mass Calculator', CH, 'Weighted atomic mass from isotope masses and abundances.', 'Average = Σ (isotope mass × abundance).',
    [['d', 'Isotope mass and abundance % (one per line)', 'ta', '34.96885 75.78\n36.96590 24.22', { rows: 4 }]],
    function (v) { var rows = CW.stat.rows(v.d).filter(function (q) { return q.length >= 2; }); if (rows.length < 2) return { error: 'Enter at least 2 isotopes as "mass abundance".' }; var tot = CW.stat.sum(rows.map(function (q) { return q[1]; })); if (!(tot > 0)) return BAD();
      return { results: [rm('Average atomic mass', CW.stat.sum(rows.map(function (q) { return q[0] * q[1]; })) / tot, 5, 'u'), r('Total abundance', tot, 4, '%')] }; });
  C('electron-configuration-calculator', 'Electron Configuration Calculator', CH, 'Electron configuration, valence electrons and unpaired electrons of any element.', 'Electrons fill subshells in the Aufbau order.',
    [['q', 'Element (symbol, name or atomic number)', 't', 'Fe']],
    function (v) { var el = findEl(v.q); if (!el) return { error: 'Element not found — try a symbol (Fe), a name (Iron) or a number (26).' }; var c = chem.config(el.z);
      return { results: [M('Configuration', c.short, 'text'), R('Full configuration', c.full, 'text'), R('Element', el.n + ' (' + el.s + '), Z = ' + el.z, 'text'), R('Electrons in the outer shell', c.valence, 'int'), R('Unpaired electrons', c.unpaired, 'int'), R('Atomic mass', el.m, 'num', { dp: 4, u: 'u' })] }; });
  function findEl(q) { q = String(q).trim(); if (!q) return null; if (/^\d+$/.test(q)) return chem.elements[+q - 1] || null; var low = q.toLowerCase(); for (var i = 0; i < chem.elements.length; i++) { var e = chem.elements[i]; if (e.s.toLowerCase() === low || e.n.toLowerCase() === low) return e; } if (low === 'aluminum') return chem.by.Al; if (low === 'cesium') return chem.by.Cs; if (low === 'sulphur') return chem.by.S; return null; }
  C('periodic-table-lookup', 'Periodic Table Element Lookup', CH, 'Find an element by symbol, name or atomic number.', 'Atomic number = number of protons.',
    [['q', 'Element (symbol, name or atomic number)', 't', 'Gold']],
    function (v) { var el = findEl(v.q); if (!el) return { error: 'Element not found — try a symbol (Au), a name (Gold) or a number (79).' }; var c = chem.config(el.z); var per = el.z <= 2 ? 1 : el.z <= 10 ? 2 : el.z <= 18 ? 3 : el.z <= 36 ? 4 : el.z <= 54 ? 5 : el.z <= 86 ? 6 : 7;
      return { results: [M(el.n, el.s, 'text'), R('Atomic number', el.z, 'int'), R('Atomic mass', el.m, 'num', { dp: 4, u: 'u' }), R('Period', per, 'int'), R('Electron configuration', c.short, 'text'), R('Outer-shell electrons', c.valence, 'int'), R('Neutrons (most common isotope, approx.)', Math.round(el.m) - el.z, 'int')] }; });

  /* ======================= BIOLOGY & LAB ======================= */
  var CODON = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG', BASES = 'TCAG';
  C('dna-sequence-tools-calculator', 'DNA Sequence Tools (GC%, Complement, Translation)', BI, 'GC content, melting temperature, reverse complement, RNA and protein translation.', 'GC% = (G + C) ÷ length.',
    [['s', 'DNA sequence (A, T, G, C)', 'ta', 'ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG', { rows: 3 }]],
    function (v) { var s = String(v.s).toUpperCase().replace(/[^A-Z]/g, ''); if (s.length < 3) return { error: 'Enter a DNA sequence of at least 3 bases.' }; if (/[^ATGC]/.test(s)) return { error: 'Use only A, T, G and C.' }; var n = s.length, cnt = { A: 0, T: 0, G: 0, C: 0 }; s.split('').forEach(function (b) { cnt[b]++; }); var gc = (cnt.G + cnt.C) / n;
      var comp = s.split('').map(function (b) { return { A: 'T', T: 'A', G: 'C', C: 'G' }[b]; }).join(''), rc = comp.split('').reverse().join(''), tm = n < 14 ? 2 * (cnt.A + cnt.T) + 4 * (cnt.G + cnt.C) : 64.9 + 41 * (cnt.G + cnt.C - 16.4) / n, prot = '';
      for (var i = 0; i + 3 <= n; i += 3) { var c = s.substr(i, 3); prot += CODON.charAt(BASES.indexOf(c.charAt(0)) * 16 + BASES.indexOf(c.charAt(1)) * 4 + BASES.indexOf(c.charAt(2))); }
      return { results: [M('GC content', gc * 100, 'pct', { dp: 2 }), r('Length', n, 0, 'bases'), r('Melting temperature (approx.)', tm, 1, '°C'), R('A / T / G / C', cnt.A + ' / ' + cnt.T + ' / ' + cnt.G + ' / ' + cnt.C, 'text'), R('Complement', comp, 'text'), R('Reverse complement', rc, 'text'), R('RNA (transcript)', s.replace(/T/g, 'U'), 'text'), R('Protein (frame 1)', prot, 'text')],
        chart: { type: 'donut', data: [{ l: 'A', v: cnt.A }, { l: 'T', v: cnt.T }, { l: 'G', v: cnt.G }, { l: 'C', v: cnt.C }], f: 'int' } }; }, { pop: 1 });
  F('dna-concentration-calculator', 'DNA / RNA Concentration Calculator (A260)', BI, 'Nucleic acid concentration from absorbance at 260 nm.', 'Concentration = A260 × dilution × factor (50 for dsDNA).',
    [['a', 'A260 reading', 'n', 0.45], ['dil', 'Dilution factor', 'n', 50], ['fct', 'Type', 's', 50, [[50, 'dsDNA (50 ng/µL)'], [40, 'RNA (40 ng/µL)'], [33, 'ssDNA (33 ng/µL)']]], ['vol', 'Sample volume', 'n', 40, 'µL']],
    [O('Concentration', 'a*dil*fct', 'ng/µL', 3), O('Total yield', 'o1*vol/1000', 'µg', 3)]);
  F('dna-copy-number-calculator', 'DNA Copy Number Calculator', BI, 'Number of DNA molecules from mass and length.', 'copies = (ng × 6.022×10²³) ÷ (length × 650 × 10⁹).',
    [['ng', 'Mass of DNA', 'n', 10, 'ng'], ['bp', 'Length of DNA', 'n', 5000, 'bp']],
    [['Copy number', 'ng*6.02214076e23/(bp*650*1e9)', 'n', 'copies', { dp: 0 }], O('Molarity per µL if in 1 µL', 'o1/6.02214076e23*1e6*1e12', 'pM', 3)]);
  SV('bacterial-growth-calculator', 'Bacterial Growth & Doubling Time Calculator', BI, 'Population after a time, or the doubling time.', 'N = N₀ × 2^(t ÷ tᵈ).',
    [['n', 'Final cell count N', 'cells', 1000000000, function (v) { return v.n0 * Math.pow(2, v.t / v.td); }], ['n0', 'Initial cell count N₀', 'cells', 1000000, function (v) { return v.n / Math.pow(2, v.t / v.td); }], ['td', 'Doubling time', 'min', 20, function (v) { return v.t * Math.LN2 / Math.log(v.n / v.n0); }], ['t', 'Time', 'min', 200, function (v) { return v.td * Math.log(v.n / v.n0) / Math.LN2; }]],
    { more: function (v) { return [r('Generations', v.t / v.td, 3), r('Growth rate (µ)', Math.LN2 / v.td, 5, 'per min')]; } });
  C('population-growth-calculator', 'Population Growth Calculator (Exponential & Logistic)', BI, 'Project a population with exponential or logistic growth.', 'N(t) = N₀ e^(rt) · logistic: K ÷ (1 + ((K − N₀) ÷ N₀) e^(−rt)).',
    [['n0', 'Starting population N₀', 'n', 1000], ['rt', 'Growth rate per period', 'p', 8], ['t', 'Number of periods', 'i', 20], ['md', 'Model', 'g', 1, [[1, 'Exponential'], [2, 'Logistic']]], ['k', 'Carrying capacity K', 'n', 10000, '', { show: 'md==2' }]],
    function (v) { var rr = Math.log(1 + v.rt / 100), t = Math.round(v.t); if (!(v.n0 > 0) || t < 1 || t > 400) return { error: 'Check the starting population and periods (1–400).' }; var f = function (x) { return +v.md === 1 ? v.n0 * Math.exp(rr * x) : v.k / (1 + ((v.k - v.n0) / v.n0) * Math.exp(-rr * x)); };
      if (+v.md === 2 && !(v.k > v.n0)) return { error: 'Carrying capacity must exceed the starting population.' }; var lab = [], pts = []; for (var i = 0; i <= t; i++) { lab.push(String(i)); pts.push(f(i)); }
      return { results: [rm('Population at the end', f(t), 5), r('Growth', f(t) - v.n0, 5), r('Doubling time', Math.LN2 / rr, 3, 'periods')], chart: { type: 'line', title: 'Population over time', labels: lab, series: [{ l: 'Population', pts: pts }], f: 'num' } }; });
  F('serial-dilution-calculator', 'Serial Dilution Calculator', BI, 'Concentration after each step of a serial dilution.', 'Final = start ÷ (dilution factor)^steps.',
    [['c0', 'Starting concentration', 'n', 1000, 'units/mL'], ['df', 'Dilution factor per step', 'n', 10], ['st', 'Number of steps', 'n', 6]],
    [O('Final concentration', 'c0/df^st', '', 8), O('Total dilution', 'df^st', '×', 0)], { seq: { n: 'st', head: ['Tube', 'Dilution', 'Concentration'], cols: [['i', 'int'], ['df^i', 'num'], ['c0/df^i', 'num']], title: 'Dilution series' } });
  F('cell-count-calculator', 'Cell Count (Hemocytometer) Calculator', BI, 'Cell concentration and viability from a hemocytometer count.', 'cells/mL = (count ÷ squares) × dilution × 10⁴.',
    [['c', 'Live cells counted', 'n', 186], ['sq', 'Large squares counted', 'n', 4], ['dil', 'Dilution factor', 'n', 2], ['dead', 'Dead cells counted', 'n', 14], ['vol', 'Total volume', 'n', 10, 'mL']],
    [['Cells per mL', 'c/sq*dil*10000', 'n', '/mL', { dp: 0 }], ['Total live cells', 'o1*vol', 'n', '', { dp: 0 }], ['Viability', 'c/(c+dead)*100', 'p', '', { dp: 1 }]]);
  F('centrifuge-rcf-calculator', 'Centrifuge RPM ↔ RCF (g-force) Calculator', BI, 'Convert between rpm and relative centrifugal force.', 'RCF = 1.118×10⁻⁵ × r × rpm².',
    [['rpm', 'Speed', 'n', 12000, 'rpm'], ['rd', 'Rotor radius', 'n', 8.4, 'cm'], ['g', 'Target force (for rpm needed)', 'n', 10000, '× g']],
    [O('Relative centrifugal force', '1.118e-5*rd*rpm^2', '× g', 1), O('RPM needed for the target', 'sqrt(g/(1.118e-5*rd))', 'rpm', 0)]);
  C('hardy-weinberg-calculator', 'Hardy–Weinberg Calculator', BI, 'Allele and genotype frequencies in a population at equilibrium.', 'p² + 2pq + q² = 1.',
    [['k', 'You know', 's', 1, [[1, 'Recessive phenotype frequency (q²)'], [2, 'Allele frequency p (dominant)'], [3, 'Allele frequency q (recessive)']]], ['x', 'Value (0–1)', 'n', 0.04], ['pop', 'Population size', 'i', 10000]],
    function (v) { var x = v.x, p, q; if (!(x >= 0 && x <= 1)) return { error: 'Enter a frequency between 0 and 1.' }; if (+v.k === 1) { q = Math.sqrt(x); p = 1 - q; } else if (+v.k === 2) { p = x; q = 1 - x; } else { q = x; p = 1 - x; }
      return { results: [rm('Dominant allele frequency (p)', p, 5), r('Recessive allele frequency (q)', q, 5), R('Homozygous dominant (p²)', p * p * 100, 'pct', { dp: 3, sub: N(p * p * v.pop, 1) + ' individuals' }), R('Heterozygous (2pq)', 2 * p * q * 100, 'pct', { dp: 3, sub: N(2 * p * q * v.pop, 1) + ' individuals' }), R('Homozygous recessive (q²)', q * q * 100, 'pct', { dp: 3, sub: N(q * q * v.pop, 1) + ' individuals' })], chart: { type: 'donut', data: [{ l: 'AA', v: p * p }, { l: 'Aa', v: 2 * p * q }, { l: 'aa', v: q * q }], f: 'num' } }; });
  C('punnett-square-calculator', 'Punnett Square Calculator', BI, 'Offspring genotypes and phenotype ratios for one to three genes.', 'Each parent passes one allele of every gene.',
    [['a', 'Parent 1 genotype', 't', 'AaBb'], ['b', 'Parent 2 genotype', 't', 'AaBb']],
    function (v) { var parse = function (s) { s = String(s).replace(/\s+/g, ''); if (s.length < 2 || s.length % 2 || s.length > 6) return null; var g = []; for (var i = 0; i < s.length; i += 2) { var x = s.charAt(i), y = s.charAt(i + 1); if (x.toLowerCase() !== y.toLowerCase() || !/[A-Za-z]/.test(x)) return null; g.push([x, y]); } return g; }, A = parse(v.a), B = parse(v.b);
      if (!A || !B || A.length !== B.length) return { error: 'Write genotypes like Aa, AaBb or AaBbCc (same genes in both parents).' }; if (A.some(function (g, i) { return g[0].toLowerCase() !== B[i][0].toLowerCase(); })) return { error: 'Both parents must use the same letters for each gene.' };
      var gam = function (G) { var out = ['']; G.forEach(function (g) { var nx = []; out.forEach(function (o) { nx.push(o + g[0]); if (g[1] !== g[0]) nx.push(o + g[1]); }); out = nx; }); return out; }, g1 = gam(A), g2 = gam(B), cnt = {}, ph = {}, total = g1.length * g2.length, n = A.length;
      var rowsG = g1.map(function (a) { return g2.map(function (b) {
        var s = '', phen = [];
        for (var i = 0; i < n; i++) { var x = a.charAt(i), y = b.charAt(i), pair = x === x.toUpperCase() ? x + y : (y === y.toUpperCase() ? y + x : x + y); s += pair; phen.push(pair.charAt(0) === pair.charAt(0).toUpperCase() ? pair.charAt(0) + '_' : pair); }
        cnt[s] = (cnt[s] || 0) + 1; var pk0 = phen.join(' '); ph[pk0] = (ph[pk0] || 0) + 1; return s; }); });
      var gk = Object.keys(cnt).sort(), pk = Object.keys(ph).sort(function (x, y) { return ph[y] - ph[x]; });
      return { results: [M('Possible offspring genotypes', gk.length, 'int'), R('Phenotype ratio', pk.map(function (k) { return ph[k]; }).join(' : '), 'text', { sub: pk.map(function (k) { return k + ' (' + ph[k] + ')'; }).join(' · ') }), R('Squares in the grid', total, 'int')],
        table: { head: ['Genotype', 'Count', 'Probability'], rows: gk.map(function (k) { return [k, cnt[k], cnt[k] / total * 100]; }), fmt: ['', 'int', 'pct'], title: 'Offspring genotypes' }, html: '<div class="cw-tscroll"><table class="cw-punnett"><thead><tr><th></th>' + g2.map(function (g) { return '<th>' + CW.esc(g) + '</th>'; }).join('') + '</tr></thead><tbody>' + rowsG.map(function (row, i) { return '<tr><th>' + CW.esc(g1[i]) + '</th>' + row.map(function (c) { return '<td>' + CW.esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' }; }, { pop: 1 });
  SV('michaelis-menten-calculator', 'Michaelis–Menten Enzyme Kinetics Calculator', BI, 'Reaction rate from substrate concentration, Vmax and Km.', 'v = Vmax [S] ÷ (Km + [S]).',
    [['v', 'Reaction rate v', '', 40, function (v) { return v.vm * v.s / (v.km + v.s); }], ['vm', 'Vmax', '', 100, function (v) { return v.v * (v.km + v.s) / v.s; }], ['km', 'Km', '', 5, function (v) { return v.s * (v.vm - v.v) / v.v; }], ['s', 'Substrate concentration [S]', '', 3.33, function (v) { return v.km * v.v / (v.vm - v.v); }]],
    { chart: function (v) { var lab = [], pts = [], mx = Math.max(v.s * 2, v.km * 6); for (var i = 0; i <= 20; i++) { var s = mx * i / 20; lab.push(N(s, 2)); pts.push(v.vm * s / (v.km + s)); } return { type: 'line', title: 'Rate vs substrate concentration', labels: lab, series: [{ l: 'Rate', pts: pts }], f: 'num' }; } });
  F('microscope-magnification-calculator', 'Microscope Magnification Calculator', BI, 'Total magnification, field of view and real size of an object.', 'Total magnification = objective × eyepiece.',
    [['ob', 'Objective lens', 'n', 40, '×'], ['ey', 'Eyepiece lens', 'n', 10, '×'], ['fn', 'Eyepiece field number', 'n', 20, 'mm'], ['im', 'Size of the object in the image (optional)', 'n', 5, 'mm']],
    [O('Total magnification', 'ob*ey', '×', 0), O('Field of view diameter', 'fn/ob*1000', 'µm', 1), O('Actual size of the object', 'im/o1*1000', 'µm', 2)]);
  C('pcr-master-mix-calculator', 'PCR Master Mix Calculator', BI, 'Reagent volumes for a PCR master mix with overage.', 'Total = per-reaction volume × (reactions + overage).',
    [['n', 'Number of reactions', 'i', 12], ['ov', 'Extra for pipetting loss', 'p', 10], ['d', 'Reagent and volume per reaction in µL (one per line)', 'ta', 'Buffer 2.5\ndNTPs 0.5\nForward primer 1\nReverse primer 1\nPolymerase 0.25\nWater 17.75', { rows: 6 }], ['tv', 'Reaction volume', 'n', 25, 'µL']],
    function (v) { var rows = String(v.d).trim().split(/\n/).map(function (l) { var m = /^(.*?)[\s:]+([\d.]+)\s*$/.exec(l.trim()); return m ? [m[1], parseFloat(m[2])] : null; }).filter(Boolean); if (!rows.length) return { error: 'Enter reagents as "name volume".' }; var k = v.n * (1 + v.ov / 100), per = CW.stat.sum(rows.map(function (q) { return q[1]; }));
      return { results: [rm('Volume per reaction (sum)', per, 4, 'µL'), r('Reactions prepared', k, 3), r('Total master mix', per * k, 4, 'µL'), r('Template to add per tube', Math.max(0, v.tv - per), 3, 'µL')], table: { head: ['Reagent', 'Per reaction (µL)', 'Master mix (µL)'], rows: rows.map(function (q) { return [q[0], q[1], q[1] * k]; }), fmt: ['', 'num', 'num'], title: 'Master mix' } }; });
  F('od600-cell-density-calculator', 'OD600 Cell Density Calculator', BI, 'Estimate bacterial cell density from optical density.', 'E. coli: OD600 of 1.0 ≈ 8×10⁸ cells/mL.',
    [['od', 'OD600 reading', 'n', 0.6], ['dil', 'Dilution factor', 'n', 1], ['k', 'Cells/mL at OD 1.0', 'n', 800000000]],
    [['Cells per mL', 'od*dil*k', 'n', '/mL', { dp: 0 }], O('Volume for 1×10⁹ cells', '1e9/o1', 'mL', 4)], { note: 'The conversion factor varies with species and spectrophotometer — calibrate with plate counts.' });
})(window.CW);
