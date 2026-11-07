/* Calcyworld — periodic table data, formula parser, equation balancer, electron configurations */
(function (CW) {
  'use strict';
  var T = ('H Hydrogen 1.008|He Helium 4.0026|Li Lithium 6.94|Be Beryllium 9.0122|B Boron 10.81|C Carbon 12.011|N Nitrogen 14.007|O Oxygen 15.999|F Fluorine 18.998|Ne Neon 20.18|' +
    'Na Sodium 22.99|Mg Magnesium 24.305|Al Aluminium 26.982|Si Silicon 28.085|P Phosphorus 30.974|S Sulfur 32.06|Cl Chlorine 35.45|Ar Argon 39.948|K Potassium 39.098|Ca Calcium 40.078|' +
    'Sc Scandium 44.956|Ti Titanium 47.867|V Vanadium 50.942|Cr Chromium 51.996|Mn Manganese 54.938|Fe Iron 55.845|Co Cobalt 58.933|Ni Nickel 58.693|Cu Copper 63.546|Zn Zinc 65.38|' +
    'Ga Gallium 69.723|Ge Germanium 72.63|As Arsenic 74.922|Se Selenium 78.971|Br Bromine 79.904|Kr Krypton 83.798|Rb Rubidium 85.468|Sr Strontium 87.62|Y Yttrium 88.906|Zr Zirconium 91.224|' +
    'Nb Niobium 92.906|Mo Molybdenum 95.95|Tc Technetium 98|Ru Ruthenium 101.07|Rh Rhodium 102.91|Pd Palladium 106.42|Ag Silver 107.87|Cd Cadmium 112.41|In Indium 114.82|Sn Tin 118.71|' +
    'Sb Antimony 121.76|Te Tellurium 127.6|I Iodine 126.9|Xe Xenon 131.29|Cs Caesium 132.91|Ba Barium 137.33|La Lanthanum 138.91|Ce Cerium 140.12|Pr Praseodymium 140.91|Nd Neodymium 144.24|' +
    'Pm Promethium 145|Sm Samarium 150.36|Eu Europium 151.96|Gd Gadolinium 157.25|Tb Terbium 158.93|Dy Dysprosium 162.5|Ho Holmium 164.93|Er Erbium 167.26|Tm Thulium 168.93|Yb Ytterbium 173.05|' +
    'Lu Lutetium 174.97|Hf Hafnium 178.49|Ta Tantalum 180.95|W Tungsten 183.84|Re Rhenium 186.21|Os Osmium 190.23|Ir Iridium 192.22|Pt Platinum 195.08|Au Gold 196.97|Hg Mercury 200.59|' +
    'Tl Thallium 204.38|Pb Lead 207.2|Bi Bismuth 208.98|Po Polonium 209|At Astatine 210|Rn Radon 222|Fr Francium 223|Ra Radium 226|Ac Actinium 227|Th Thorium 232.04|' +
    'Pa Protactinium 231.04|U Uranium 238.03|Np Neptunium 237|Pu Plutonium 244|Am Americium 243|Cm Curium 247|Bk Berkelium 247|Cf Californium 251|Es Einsteinium 252|Fm Fermium 257|' +
    'Md Mendelevium 258|No Nobelium 259|Lr Lawrencium 266|Rf Rutherfordium 267|Db Dubnium 268|Sg Seaborgium 269|Bh Bohrium 270|Hs Hassium 277|Mt Meitnerium 278|Ds Darmstadtium 281|' +
    'Rg Roentgenium 282|Cn Copernicium 285|Nh Nihonium 286|Fl Flerovium 289|Mc Moscovium 290|Lv Livermorium 293|Ts Tennessine 294|Og Oganesson 294').split('|');
  var EL = T.map(function (s, i) { var p = s.split(' '); return { z: i + 1, s: p[0], n: p[1], m: parseFloat(p[2]) }; });
  var BY = {}; EL.forEach(function (e) { BY[e.s] = e; });
  var chem = CW.chem = { elements: EL, by: BY };

  /* "Ca(OH)2", "CuSO4.5H2O", "K4[Fe(CN)6]" -> { Ca:1, O:2, H:2 } */
  function group(s) {
    var i = 0, st = [{}];
    function num() { var m = /^\d+/.exec(s.slice(i)); if (m) { i += m[0].length; return +m[0]; } return 1; }
    function add(map, k, v) { map[k] = (map[k] || 0) + v; }
    while (i < s.length) {
      var ch = s.charAt(i);
      if (ch === '(' || ch === '[' || ch === '{') { st.push({}); i++; }
      else if (ch === ')' || ch === ']' || ch === '}') {
        if (st.length < 2) throw new Error('Unbalanced brackets');
        i++; var n = num(), top = st.pop(); Object.keys(top).forEach(function (k) { add(st[st.length - 1], k, top[k] * n); });
      } else if (/[A-Z]/.test(ch)) {
        var sym = ch; i++; if (/[a-z]/.test(s.charAt(i))) { sym += s.charAt(i); i++; }
        if (!BY[sym]) throw new Error('Unknown element "' + sym + '"');
        add(st[st.length - 1], sym, num());
      } else throw new Error('Unexpected "' + ch + '"');
    }
    if (st.length !== 1) throw new Error('Unbalanced brackets');
    return st[0];
  }
  chem.parse = function (f) {
    f = String(f == null ? '' : f).replace(/\s+/g, '').replace(/[·•*]/g, '.').replace(/[₀-₉]/g, function (c) { return String(c.charCodeAt(0) - 0x2080); });
    if (!f) throw new Error('Enter a formula');
    var tot = {};
    f.split('.').forEach(function (p) {
      var m = /^(\d+)?(.*)$/.exec(p), mult = m[1] ? +m[1] : 1, g = group(m[2]);
      Object.keys(g).forEach(function (k) { tot[k] = (tot[k] || 0) + g[k] * mult; });
    });
    return tot;
  };
  chem.mass = function (cnt) { var s = 0; Object.keys(cnt).forEach(function (k) { s += BY[k].m * cnt[k]; }); return s; };
  chem.pretty = function (f) { return String(f).replace(/(\d+)/g, function (d, x, off, str) { return off > 0 && /[A-Za-z)\]]/.test(str.charAt(off - 1)) ? d.replace(/\d/g, function (c) { return String.fromCharCode(0x2080 + +c); }) : d; }); };
  chem.order = function (cnt) { var ks = Object.keys(cnt); var hill = ks.indexOf('C') > -1; return ks.sort(function (a, b) { if (hill) { if (a === 'C') return -1; if (b === 'C') return 1; if (a === 'H') return -1; if (b === 'H') return 1; } return a < b ? -1 : a > b ? 1 : 0; }); };

  /* ---- equation balancer (rational Gaussian elimination) ---- */
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function fr(n, d) { d = d === undefined ? 1 : d; if (d < 0) { n = -n; d = -d; } var g = gcd(n, d); return [n / g, d / g]; }
  function fadd(a, b) { return fr(a[0] * b[1] + b[0] * a[1], a[1] * b[1]); }
  function fmul(a, b) { return fr(a[0] * b[0], a[1] * b[1]); }
  function fdiv(a, b) { return fr(a[0] * b[1], a[1] * b[0]); }
  chem.balance = function (eq) {
    var sides = String(eq).replace(/→|=>|⟶|⇒|->|=/g, '>').split('>');
    if (sides.length !== 2) throw new Error('Use an arrow or "=" between reactants and products, e.g. H2 + O2 -> H2O');
    var split = function (s) { return s.split('+').map(function (x) { return x.trim().replace(/^\d+\s*(?=[A-Z(\[])/, ''); }).filter(Boolean); };
    var L = split(sides[0]), Rr = split(sides[1]); if (!L.length || !Rr.length) throw new Error('Enter at least one reactant and one product');
    var sp = L.concat(Rr), cols = sp.length, cnt = sp.map(chem.parse), els = [];
    cnt.forEach(function (c) { Object.keys(c).forEach(function (k) { if (els.indexOf(k) < 0) els.push(k); }); });
    var A = els.map(function (e) { return cnt.map(function (c, j) { return fr((c[e] || 0) * (j < L.length ? 1 : -1)); }); });
    var piv = [], r = 0, i, j, k;
    for (j = 0; j < cols && r < A.length; j++) {
      var p = -1; for (i = r; i < A.length; i++) if (A[i][j][0] !== 0) { p = i; break; } if (p < 0) continue;
      var t = A[r]; A[r] = A[p]; A[p] = t; var pv = A[r][j]; A[r] = A[r].map(function (x) { return fdiv(x, pv); });
      for (i = 0; i < A.length; i++) if (i !== r && A[i][j][0] !== 0) { var f = A[i][j]; for (k = 0; k < cols; k++) A[i][k] = fadd(A[i][k], fmul(fr(-f[0], f[1]), A[r][k])); }
      piv.push(j); r++;
    }
    var free = []; for (j = 0; j < cols; j++) if (piv.indexOf(j) < 0) free.push(j);
    if (free.length === 0) throw new Error('This equation cannot be balanced — check the formulas');
    if (free.length > 1) throw new Error('This equation has more than one possible balance — split it into separate reactions');
    var x = new Array(cols), fv = free[0]; x[fv] = fr(1);
    piv.forEach(function (pc, row) { x[pc] = fr(-A[row][fv][0], A[row][fv][1]); });
    var lcm = 1; x.forEach(function (q) { lcm = lcm * q[1] / gcd(lcm, q[1]); });
    var co = x.map(function (q) { return q[0] * (lcm / q[1]); }), g0 = 0; co.forEach(function (c) { g0 = gcd(g0, c); }); co = co.map(function (c) { return c / g0; });
    if (co.some(function (c) { return c <= 0; })) throw new Error('This equation cannot be balanced with positive coefficients — check the formulas');
    var fmt = function (arr, off) { return arr.map(function (s, n) { var c = co[off + n]; return (c === 1 ? '' : c) + chem.pretty(s); }).join(' + '); };
    return { text: fmt(L, 0) + ' → ' + fmt(Rr, L.length), coef: co, species: sp, left: L.length };
  };

  /* ---- electron configuration ---- */
  var SUB = [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2], ['3d', 10], ['4p', 6], ['5s', 2], ['4d', 10], ['5p', 6], ['6s', 2], ['4f', 14], ['5d', 10], ['6p', 6], ['7s', 2], ['5f', 14], ['6d', 10], ['7p', 6]];
  var EXC = { 24: { '4s': 1, '3d': 5 }, 29: { '4s': 1, '3d': 10 }, 41: { '5s': 1, '4d': 4 }, 42: { '5s': 1, '4d': 5 }, 44: { '5s': 1, '4d': 7 }, 45: { '5s': 1, '4d': 8 }, 46: { '5s': 0, '4d': 10 }, 47: { '5s': 1, '4d': 10 },
    57: { '4f': 0, '5d': 1 }, 58: { '4f': 1, '5d': 1 }, 64: { '4f': 7, '5d': 1 }, 78: { '6s': 1, '5d': 9 }, 79: { '6s': 1, '5d': 10 }, 89: { '5f': 0, '6d': 1 }, 90: { '5f': 0, '6d': 2 }, 91: { '5f': 2, '6d': 1 }, 92: { '5f': 3, '6d': 1 }, 93: { '5f': 4, '6d': 1 }, 96: { '5f': 7, '6d': 1 }, 103: { '6d': 0, '7p': 1 } };
  var NOBLE = [[2, 'He'], [10, 'Ne'], [18, 'Ar'], [36, 'Kr'], [54, 'Xe'], [86, 'Rn']];
  chem.config = function (z) {
    var left = z, occ = {}, k; SUB.forEach(function (s) { var put = Math.min(left, s[1]); if (put > 0) occ[s[0]] = put; left -= put; });
    if (EXC[z]) for (k in EXC[z]) occ[k] = EXC[z][k];
    var list = Object.keys(occ).filter(function (s) { return occ[s] > 0; }).sort(function (a, b) { return (+a[0] - +b[0]) || ('spdf'.indexOf(a[1]) - 'spdf'.indexOf(b[1])); });
    var full = list.map(function (s) { return s + occ[s]; }).join(' '), ng = null; NOBLE.forEach(function (n) { if (n[0] < z) ng = n; });
    var short = full;
    if (ng) { var base = chem.config(ng[0]).occ, rest = list.filter(function (s) { return occ[s] !== base[s]; }); short = '[' + ng[1] + '] ' + rest.map(function (s) { return s + occ[s]; }).join(' '); }
    var maxN = Math.max.apply(null, list.map(function (s) { return +s[0]; })), val = 0, unp = 0;
    list.forEach(function (s) { if (+s[0] === maxN) val += occ[s]; var orb = { s: 1, p: 3, d: 5, f: 7 }[s[1]], e = occ[s]; unp += e <= orb ? e : 2 * orb - e; });
    return { full: full, short: short, occ: occ, valence: val, unpaired: unp, shells: maxN };
  };
})(window.CW);
