/* Calcyworld — astronomy & space */
(function (CW) {
  'use strict';
  var F = CW.F, C = CW.C, M = CW.M, R = CW.Rr, SV = CW.solve, r = CW.R, rm = CW.RM, rt = CW.RT;
  var N = function (x, d) { return CW.fmt.num(x, d === undefined ? 6 : d); };
  var A = 'science/astronomy', G = 6.6743e-11, AU = 1.495978707e11, LY = 9.4607304725808e15, PC = 3.0856775814914e16, C0 = 299792458, MSUN = 1.98847e30, RSUN = 6.957e8, LSUN = 3.828e26, SIG = 5.670374419e-8;
  var O = function (l, e, u, dp) { return [l, e, 'n', u || '', { dp: dp === undefined ? 6 : dp }]; };
  var BODY = function (key) { return [[key || 'bd', 'Body', 's', 3, CW.planetOpts(true)], [(key || 'bd') + 'M', 'Mass (custom)', 'n', 5.972e24, 'kg', { show: (key || 'bd') + '==99' }], [(key || 'bd') + 'R', 'Radius (custom)', 'n', 6371, 'km', { show: (key || 'bd') + '==99' }]]; };
  var bodyOf = function (v, key) { key = key || 'bd'; var p = CW.planet(v[key]); return +v[key] === 99 ? { n: 'Custom body', M: v[key + 'M'], r: v[key + 'R'] * 1000, g: G * v[key + 'M'] / Math.pow(v[key + 'R'] * 1000, 2) } : p; };
  var hm = function (h) { if (!isFinite(h)) return '—'; h = ((h % 24) + 24) % 24; var m = Math.round(h * 60), hh = Math.floor(m / 60) % 24, mm = m % 60; return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm; };

  C('escape-velocity-calculator', 'Escape Velocity Calculator', A, 'Speed needed to escape the gravity of a planet, moon or star.', 'vₑ = √(2GM ÷ r).',
    BODY(),
    function (v) { var b = bodyOf(v); if (!b || !(b.M > 0) || !(b.r > 0)) return { error: 'Enter a positive mass and radius.' }; var ve = Math.sqrt(2 * G * b.M / b.r);
      return { results: [rm('Escape velocity', ve / 1000, 4, 'km/s'), r('In km/h', ve * 3.6, 1, 'km/h'), r('In mph', ve * 2.236936, 1, 'mph'), r('Orbital velocity (low orbit)', ve / Math.SQRT2 / 1000, 4, 'km/s'), r('Surface gravity', G * b.M / (b.r * b.r), 3, 'm/s²')] }; }, { pop: 1 });
  C('orbital-period-calculator', "Orbital Period & Speed Calculator (Kepler's 3rd Law)", A, 'Orbital period and speed for a given distance from a central body.', 'T = 2π √(a³ ÷ GM).',
    BODY('bd').map(function (x) { if (x[0] === 'bd') x[3] = 11; return x; }).concat([['a', 'Orbit radius (semi-major axis)', 'n', 1, ''], ['un', 'Unit', 'g', 1, [[1, 'AU'], [2, 'km'], [3, 'm']]]]),
    function (v) { var b = bodyOf(v); if (!b || !(b.M > 0)) return { error: 'Choose a central body.' }; var a = v.a * [0, AU, 1000, 1][+v.un]; if (!(a > 0)) return { error: 'The orbit radius must be positive.' }; var T = 2 * Math.PI * Math.sqrt(a * a * a / (G * b.M)), vo = Math.sqrt(G * b.M / a);
      return { results: [rm('Orbital period', T / 86400, 4, 'days'), r('In years', T / 31557600, 5, 'years'), r('In hours', T / 3600, 3, 'hours'), r('Orbital speed', vo / 1000, 4, 'km/s'), r('Orbit radius', a / 1000, 1, 'km')] }; });
  C('surface-gravity-calculator', 'Surface Gravity Calculator', A, 'Gravitational acceleration at the surface of a planet or star.', 'g = GM ÷ r².',
    BODY(),
    function (v) { var b = bodyOf(v); if (!b || !(b.M > 0) || !(b.r > 0)) return { error: 'Enter a positive mass and radius.' }; var g = G * b.M / (b.r * b.r); return { results: [rm('Surface gravity', g, 4, 'm/s²'), r('Relative to Earth', g / 9.80665, 4, 'g'), r('Density (mean)', b.M / (4 / 3 * Math.PI * Math.pow(b.r, 3)), 1, 'kg/m³')] }; });
  C('weight-on-planets-calculator', 'Weight on Other Planets Calculator', A, 'What you would weigh on every planet, the Moon and the Sun.', 'Weight on a planet = your mass × its surface gravity.',
    [['w', 'Your weight on Earth', 'n', 70, 'kg']],
    function (v) { if (!(v.w > 0)) return { error: 'Enter your weight.' }; var rows = CW.planets.map(function (p) { return [p.n, p.g, v.w * p.g / 9.80665]; });
      return { results: [M('On Mars', v.w * 3.71 / 9.80665, 'num', { dp: 2, u: 'kg' }), R('On the Moon', v.w * 1.62 / 9.80665, 'num', { dp: 2, u: 'kg' }), R('On Jupiter', v.w * 24.79 / 9.80665, 'num', { dp: 2, u: 'kg' }), R('Your mass (same everywhere)', v.w, 'num', { dp: 2, u: 'kg' })],
        table: { head: ['Body', 'Gravity (m/s²)', 'Your weight (kg-force)'], rows: rows, fmt: ['', 'num', 'num'], title: 'All bodies' }, chart: { type: 'bar', title: 'Weight on each body', labels: rows.map(function (q) { return q[0]; }), series: [{ l: 'Weight', pts: rows.map(function (q) { return q[2]; }) }], f: 'num' } }; });
  C('age-on-other-planets-calculator', 'Age on Other Planets Calculator', A, 'How old you would be on every planet.', 'Age on a planet = your age in Earth years × 365.256 ÷ its orbital period (days).',
    [['y', 'Your age in Earth years', 'n', 30]],
    function (v) { if (!(v.y > 0)) return { error: 'Enter your age.' }; var ps = CW.planets.filter(function (p) { return p.T > 0 && p.n !== 'Moon'; }), rows = ps.map(function (p) { return [p.n, p.T, v.y * 365.256 / p.T]; });
      return { results: [M('On Mars', v.y * 365.256 / 686.98, 'num', { dp: 2, u: 'years' }), R('On Mercury', v.y * 365.256 / 87.969, 'num', { dp: 2, u: 'years' }), R('On Jupiter', v.y * 365.256 / 4332.59, 'num', { dp: 3, u: 'years' }), R('Age in days', v.y * 365.256, 'num', { dp: 0, u: 'days' })], table: { head: ['Planet', 'Orbit (Earth days)', 'Your age'], rows: rows, fmt: ['', 'num', 'num'], title: 'Age on each planet' } }; });
  C('light-travel-time-calculator', 'Light Travel Time Calculator', A, 'How long light takes to cover a distance.', 't = d ÷ c.',
    [['d', 'Distance', 'n', 1, ''], ['un', 'Unit', 's', 1, [[1, 'Astronomical units (AU)'], [2, 'Light-years'], [3, 'Parsecs'], [4, 'Kilometres'], [5, 'Miles'], [6, 'Earth–Moon distances']]]],
    function (v) { var m = v.d * [0, AU, LY, PC, 1000, 1609.344, 3.844e8][+v.un]; if (!(m > 0)) return { error: 'Enter a positive distance.' }; var t = m / C0;
      return { results: [rm('Light travel time', t < 120 ? t : t < 7200 ? t / 60 : t < 172800 ? t / 3600 : t < 5.2e7 ? t / 86400 : t / 31557600, 4, t < 120 ? 'seconds' : t < 7200 ? 'minutes' : t < 172800 ? 'hours' : t < 5.2e7 ? 'days' : 'years'), r('In seconds', t, 4, 's'), r('In light-years', m / LY, 8, 'ly'), r('In kilometres', m / 1000, 2, 'km'), r('In AU', m / AU, 6, 'AU')] }; });
  C('schwarzschild-radius-calculator', 'Schwarzschild Radius (Black Hole) Calculator', A, 'Event-horizon radius of a black hole of a given mass.', 'rₛ = 2GM ÷ c².',
    [['m', 'Mass', 'n', 10], ['un', 'Unit', 'g', 1, [[1, 'Solar masses'], [2, 'Earth masses'], [3, 'kg']]]],
    function (v) { var m = v.m * [0, MSUN, 5.97237e24, 1][+v.un]; if (!(m > 0)) return { error: 'Enter a positive mass.' }; var rs = 2 * G * m / (C0 * C0);
      return { results: [rm('Schwarzschild radius', rs / 1000, 5, 'km'), r('In metres', rs, 4, 'm'), r('Diameter', rs * 2 / 1000, 5, 'km'), r('Mean density inside', m / (4 / 3 * Math.PI * Math.pow(rs, 3)), 3, 'kg/m³'), r('Hawking temperature', 6.169e-8 * MSUN / m, 4, 'K')] }; });
  F('hubble-law-calculator', "Hubble's Law Calculator", A, 'Recession speed of a galaxy from its distance.', 'v = H₀ × d.',
    [['d', 'Distance', 'n', 100, 'Mpc'], ['h', 'Hubble constant H₀', 'n', 70, 'km/s/Mpc']],
    [O('Recession velocity', 'h*d', 'km/s', 2), O('As a fraction of light speed', 'o1/299792.458*100', '%', 3), O('Redshift (approx.)', 'o1/299792.458', '', 5), O('Distance in light-years', 'd*3261563.8', 'ly', 0)], { note: 'H₀ ≈ 67–74 km/s/Mpc depending on the method. Valid for small redshifts.' });
  C('redshift-calculator', 'Redshift Calculator', A, 'Velocity and distance from a redshift.', 'z = (λ_observed − λ_emitted) ÷ λ_emitted.',
    [['z', 'Redshift (z)', 'n', 0.1], ['h', 'Hubble constant H₀', 'n', 70, 'km/s/Mpc']],
    function (v) { var z = v.z; if (!(z > -1)) return { error: 'z must be greater than −1.' }; var b = ((1 + z) * (1 + z) - 1) / ((1 + z) * (1 + z) + 1);
      return { results: [rm('Recession velocity (relativistic)', b * C0 / 1000, 1, 'km/s'), r('As % of light speed', b * 100, 3, '%'), r('Approx. distance (Hubble)', z * C0 / 1000 / v.h, 2, 'Mpc'), r('Light-travel distance', z * C0 / 1000 / v.h * 3.2615638, 1, 'million ly'), r('Wavelength stretch', 1 + z, 4, '×')] }; });
  F('stellar-luminosity-calculator', 'Stellar Luminosity & Black-Body Calculator', A, 'Luminosity and peak wavelength of a star from radius and temperature.', 'L = 4π R² σ T⁴ · λ_peak = b ÷ T.',
    [['r', 'Radius', 'n', 1, 'R☉'], ['t', 'Surface temperature', 'n', 5772, 'K']],
    [O('Luminosity', '4*pi*(r*6.957e8)^2*5.670374419e-8*t^4/3.828e26', 'L☉', 5), O('Luminosity in watts', 'o1*3.828e26', 'W', 4), O('Peak wavelength (Wien)', '2.897771955e-3/t*1e9', 'nm', 1), O('Surface flux', '5.670374419e-8*t^4/1e6', 'MW/m²', 3)]);
  F('parallax-distance-calculator', 'Parallax Distance Calculator', A, 'Distance to a star from its parallax angle.', 'd (parsecs) = 1 ÷ p (arcseconds).',
    [['p', 'Parallax angle', 'n', 0.768, 'arcsec']],
    [O('Distance', '1/p', 'parsecs', 4), O('Distance in light-years', '3.2615638/p', 'ly', 3), O('Distance in km', '3.0856775814914e13/p', 'km', 0)]);
  SV('distance-modulus-calculator', 'Distance Modulus Calculator (Apparent & Absolute Magnitude)', A, 'Apparent magnitude, absolute magnitude or distance.', 'm − M = 5 log₁₀(d ÷ 10 pc).',
    [['m', 'Apparent magnitude m', '', 0.03, function (v) { return v.am + 5 * Math.log10(v.d / 10); }], ['am', 'Absolute magnitude M', '', 0.6, function (v) { return v.m - 5 * Math.log10(v.d / 10); }], ['d', 'Distance', 'parsecs', 7.68, function (v) { return 10 * Math.pow(10, (v.m - v.am) / 5); }]],
    { more: function (v) { return [r('Distance in light-years', v.d * 3.2615638, 3, 'ly')]; } });
  F('magnitude-brightness-calculator', 'Magnitude Brightness Ratio Calculator', A, 'How many times brighter one star is than another.', 'Ratio = 100^(Δm ÷ 5) ≈ 2.512^Δm.',
    [['m1', 'Magnitude of the brighter star', 'n', 1], ['m2', 'Magnitude of the fainter star', 'n', 6]],
    [O('Brightness ratio', '100^((m2-m1)/5)', '×', 3), O('Magnitude difference', 'm2-m1', '', 3)]);
  F('star-lifetime-calculator', 'Star Lifetime Calculator', A, 'Rough main-sequence lifetime from stellar mass.', 't ≈ 10 billion years × (M ÷ M☉)^−2.5.',
    [['m', 'Stellar mass', 'n', 1.5, 'M☉']],
    [O('Main-sequence lifetime', '10*m^-2.5', 'billion years', 3), O('Luminosity (approx.)', 'm^3.5', 'L☉', 3)], { note: 'A rule of thumb for main-sequence stars between ~0.5 and 20 solar masses.' });
  F('habitable-zone-calculator', 'Habitable Zone Calculator', A, 'Distance range where liquid water could exist around a star.', 'Inner ≈ √(L ÷ 1.1) · Outer ≈ √(L ÷ 0.53) AU.',
    [['l', 'Star luminosity', 'n', 1, 'L☉']],
    [O('Inner edge', 'sqrt(l/1.1)', 'AU', 3), O('Outer edge', 'sqrt(l/0.53)', 'AU', 3), O('Zone width', 'o2-o1', 'AU', 3)]);
  C('moon-phase-calculator', 'Moon Phase Calculator', A, 'Moon phase, age and illumination for any date.', 'Synodic month = 29.53 days.',
    [['d', 'Date', 'd', 0]],
    function (v) { if (!(v.d instanceof Date)) return { error: 'Choose a date.' }; var jd = v.d.getTime() / 86400000 + 2440587.5 + 0.5, syn = 29.530588861, age = ((jd - 2451550.1) % syn + syn) % syn, ill = (1 - Math.cos(2 * Math.PI * age / syn)) / 2, f = age / syn;
      var name = f < 0.03 || f > 0.97 ? 'New Moon' : f < 0.22 ? 'Waxing Crescent' : f < 0.28 ? 'First Quarter' : f < 0.47 ? 'Waxing Gibbous' : f < 0.53 ? 'Full Moon' : f < 0.72 ? 'Waning Gibbous' : f < 0.78 ? 'Last Quarter' : 'Waning Crescent';
      var next = function (target) { var d = target - age; if (d < 0.5) d += syn; return d; }, fmtd = function (d) { return CW.fmt.date(v.d.getTime() + d * 86400000); };
      return { results: [M('Moon phase', name, 'text'), R('Illumination', ill * 100, 'pct', { dp: 1 }), R('Moon age', age, 'num', { dp: 1, u: 'days' }), R('Next full moon', fmtd(next(syn / 2)), 'text', { sub: 'in ' + N(next(syn / 2), 0) + ' days' }), R('Next new moon', fmtd(next(syn)), 'text', { sub: 'in ' + N(next(syn), 0) + ' days' })] }; });
  C('sunrise-sunset-calculator', 'Sunrise & Sunset Calculator', A, 'Sunrise, sunset, solar noon and day length for any place and date.', 'Solar position equations (NOAA).',
    [['la', 'Latitude (N positive)', 'n', 28.61, '°'], ['lo', 'Longitude (E positive)', 'n', 77.21, '°'], ['tz', 'Time zone (hours from UTC)', 'n', 5.5, 'h'], ['d', 'Date', 'd', 0]],
    function (v) { if (!(v.d instanceof Date)) return { error: 'Choose a date.' }; if (Math.abs(v.la) > 89 || Math.abs(v.lo) > 180) return { error: 'Latitude must be between −89° and 89°, longitude between −180° and 180°.' }; var rad = Math.PI / 180, start = new Date(v.d.getFullYear(), 0, 0), doy = Math.floor((v.d - start) / 86400000), gam = 2 * Math.PI / 365 * (doy - 1 + 0.5);
      var eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(gam) - 0.032077 * Math.sin(gam) - 0.014615 * Math.cos(2 * gam) - 0.040849 * Math.sin(2 * gam)), decl = 0.006918 - 0.399912 * Math.cos(gam) + 0.070257 * Math.sin(gam) - 0.006758 * Math.cos(2 * gam) + 0.000907 * Math.sin(2 * gam) - 0.002697 * Math.cos(3 * gam) + 0.00148 * Math.sin(3 * gam);
      var cosH = (Math.cos(90.833 * rad) / (Math.cos(v.la * rad) * Math.cos(decl)) - Math.tan(v.la * rad) * Math.tan(decl)); if (cosH > 1) return { results: [M('Polar night', 'The Sun does not rise on this date', 'text')] }; if (cosH < -1) return { results: [M('Midnight sun', 'The Sun does not set on this date', 'text')] };
      var ha = Math.acos(cosH) / rad, noon = (720 - 4 * v.lo - eqt) / 60 + v.tz, rise = noon - ha / 15, set = noon + ha / 15;
      return { results: [M('Sunrise', hm(rise), 'text'), R('Sunset', hm(set), 'text'), R('Solar noon', hm(noon), 'text'), R('Day length', Math.floor(2 * ha / 15) + ' h ' + Math.round((2 * ha / 15 % 1) * 60) + ' min', 'text'), R('Daylight', 2 * ha / 15 / 24 * 100, 'pct', { dp: 1 })] }; }, { pop: 1 });
  F('telescope-calculator', 'Telescope Magnification & F-Ratio Calculator', A, 'Magnification, f-ratio, field of view and limits of a telescope.', 'Magnification = telescope focal length ÷ eyepiece focal length.',
    [['d', 'Aperture', 'n', 130, 'mm'], ['fl', 'Telescope focal length', 'n', 650, 'mm'], ['ep', 'Eyepiece focal length', 'n', 10, 'mm'], ['afov', 'Eyepiece apparent field of view', 'n', 52, '°']],
    [O('Magnification', 'fl/ep', '×', 1), O('F-ratio', 'fl/d', 'f/', 2), O('True field of view', 'afov/o1', '°', 3), O('Exit pupil', 'd/o1', 'mm', 2), O('Maximum useful magnification', '2*d', '×', 0), O('Resolution (Dawes limit)', '116/d', 'arcsec', 2), O('Limiting magnitude', '2.7+5*log(d)', '', 1)]);
  F('angular-size-calculator', 'Angular Size Calculator', A, 'Apparent size of an object from its size and distance.', 'θ = 2 arctan(size ÷ 2 × distance).',
    [['s', 'Object size', 'n', 3474.8, 'km'], ['d', 'Distance', 'n', 384400, 'km']],
    [O('Angular size', '2*atan(s/(2*d))*180/pi', '°', 5), O('In arcminutes', 'o1*60', '′', 3), O('In arcseconds', 'o1*3600', '″', 1)], { note: 'Default values: the Moon seen from Earth.' });
  SV('rocket-equation-calculator', "Tsiolkovsky Rocket Equation Calculator", A, 'Delta-v, exhaust velocity or propellant mass of a rocket.', 'Δv = vₑ ln(m₀ ÷ m_f).',
    [['dv', 'Delta-v', 'm/s', 9400, function (v) { return v.ve * Math.log(v.m0 / v.mf); }], ['ve', 'Exhaust velocity', 'm/s', 3500, function (v) { return v.dv / Math.log(v.m0 / v.mf); }], ['m0', 'Initial mass (with fuel)', 'kg', 500000, function (v) { return v.mf * Math.exp(v.dv / v.ve); }], ['mf', 'Final mass (dry)', 'kg', 34000, function (v) { return v.m0 / Math.exp(v.dv / v.ve); }]],
    { more: function (v) { return [r('Propellant mass', v.m0 - v.mf, 5, 'kg'), r('Mass ratio', v.m0 / v.mf, 4), r('Specific impulse', v.ve / 9.80665, 2, 's')]; } });
})(window.CW);
