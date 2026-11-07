/* Calcyworld — physics */
(function (CW) {
  'use strict';
  var F = CW.F, C = CW.C, M = CW.M, R = CW.Rr, SV = CW.solve, r = CW.R, rm = CW.RM, rt = CW.RT;
  var N = function (x, d) { return CW.fmt.num(x, d === undefined ? 6 : d); };
  var P = 'science/physics', D2R = Math.PI / 180;
  var O = function (l, e, u, dp) { return [l, e, 'n', u || '', { dp: dp === undefined ? 6 : dp }]; };
  var GRAV = [['gp', 'Gravity of', 's', 3, CW.planetOpts(true)], ['gc', 'Custom gravity (m/s²)', 'n', 9.80665, '', { show: 'gp==99' }]];
  var gOf = function (v) { var p = CW.planet(v.gp); return +v.gp === 99 ? v.gc : (p ? p.g : 9.80665); };

  /* ---------- Mechanics ---------- */
  SV('velocity-calculator', 'Speed, Distance & Time Calculator', P, 'Find speed, distance or time from the other two.', 'speed = distance ÷ time.',
    [['v', 'Speed', 'm/s', 20, function (v) { return v.d / v.t; }], ['d', 'Distance', 'm', 500, function (v) { return v.v * v.t; }], ['t', 'Time', 's', 25, function (v) { return v.d / v.v; }]],
    { pop: 1, more: function (v) { return [r('Speed in km/h', v.v * 3.6, 4, 'km/h'), r('Speed in mph', v.v * 2.236936, 4, 'mph')]; } });
  SV('acceleration-calculator', 'Acceleration Calculator', P, 'Acceleration from change in velocity over time.', 'a = (v − u) ÷ t.',
    [['a', 'Acceleration', 'm/s²', 2.5, function (v) { return (v.vf - v.u) / v.t; }], ['u', 'Initial velocity', 'm/s', 0, function (v) { return v.vf - v.a * v.t; }], ['vf', 'Final velocity', 'm/s', 25, function (v) { return v.u + v.a * v.t; }], ['t', 'Time', 's', 10, function (v) { return (v.vf - v.u) / v.a; }]],
    { more: function (v) { return [r('Distance covered', v.u * v.t + 0.5 * v.a * v.t * v.t, 4, 'm'), r('Acceleration in g', v.a / 9.80665, 4, 'g')]; } });
  C('kinematics-calculator', 'Kinematic Equations (SUVAT) Calculator', P, 'Solve constant-acceleration motion from any three known values.', 'v = u + at · s = ut + ½at² · v² = u² + 2as.',
    [['m', 'You know', 's', 1, [[1, 'u, a, t'], [2, 'u, v, t'], [3, 'u, v, a'], [4, 'u, a, s'], [5, 'u, v, s']]], ['u', 'Initial velocity (u)', 'n', 5, 'm/s'], ['a', 'Acceleration (a)', 'n', 2, 'm/s²', { show: 'if(m==2,0,if(m==5,0,1))' }],
      ['vf', 'Final velocity (v)', 'n', 15, 'm/s', { show: 'if(m==1,0,if(m==4,0,1))' }], ['t', 'Time (t)', 'n', 5, 's', { show: 'm<3' }], ['s', 'Displacement (s)', 'n', 50, 'm', { show: 'm>3' }]],
    function (v) { var m = +v.m, u = v.u, a = v.a, vf = v.vf, t = v.t, s = v.s;
      if (m === 1) { vf = u + a * t; s = u * t + 0.5 * a * t * t; } else if (m === 2) { a = (vf - u) / t; s = (u + vf) * t / 2; } else if (m === 3) { t = (vf - u) / a; s = (vf * vf - u * u) / (2 * a); }
      else if (m === 4) { var q = u * u + 2 * a * s; if (q < 0) return { error: 'These values are not physically possible.' }; vf = Math.sqrt(q); t = a ? (vf - u) / a : s / u; } else { a = (vf * vf - u * u) / (2 * s); t = 2 * s / (u + vf); }
      if (![u, a, vf, t, s].every(isFinite)) return { error: 'These values do not give a valid answer.' };
      return { results: [rm('Displacement (s)', s, 5, 'm'), r('Final velocity (v)', vf, 5, 'm/s'), r('Acceleration (a)', a, 5, 'm/s²'), r('Time (t)', t, 5, 's'), r('Initial velocity (u)', u, 5, 'm/s')] }; });
  SV('newtons-second-law-calculator', "Newton's Second Law (F = ma) Calculator", P, 'Force, mass or acceleration.', 'F = m × a.',
    [['fo', 'Force', 'N', 100, function (v) { return v.ms * v.a; }], ['ms', 'Mass', 'kg', 20, function (v) { return v.fo / v.a; }], ['a', 'Acceleration', 'm/s²', 5, function (v) { return v.fo / v.ms; }]], { pop: 1 });
  SV('momentum-calculator', 'Momentum Calculator', P, 'Momentum, mass or velocity.', 'p = m × v.',
    [['p', 'Momentum', 'kg·m/s', 1500, function (v) { return v.ms * v.v; }], ['ms', 'Mass', 'kg', 1000, function (v) { return v.p / v.v; }], ['v', 'Velocity', 'm/s', 1.5, function (v) { return v.p / v.ms; }]]);
  SV('impulse-calculator', 'Impulse Calculator', P, 'Impulse, force or contact time.', 'J = F × Δt = Δp.',
    [['j', 'Impulse', 'N·s', 40, function (v) { return v.fo * v.dt; }], ['fo', 'Average force', 'N', 800, function (v) { return v.j / v.dt; }], ['dt', 'Contact time', 's', 0.05, function (v) { return v.j / v.fo; }]]);
  SV('kinetic-energy-calculator', 'Kinetic Energy Calculator', P, 'Kinetic energy, mass or speed.', 'KE = ½ m v².',
    [['ke', 'Kinetic energy', 'J', 250000, function (v) { return 0.5 * v.ms * v.v * v.v; }], ['ms', 'Mass', 'kg', 1000, function (v) { return 2 * v.ke / (v.v * v.v); }], ['v', 'Speed', 'm/s', 22.36, function (v) { return Math.sqrt(2 * v.ke / v.ms); }]],
    { pop: 1, more: function (v) { return [r('Energy in kWh', v.ke / 3.6e6, 8, 'kWh'), r('Energy in kcal', v.ke / 4184, 4, 'kcal')]; } });
  SV('potential-energy-calculator', 'Gravitational Potential Energy Calculator', P, 'Potential energy, mass or height.', 'PE = m g h.',
    [['pe', 'Potential energy', 'J', 4903.3, function (v) { return v.ms * v.g * v.h; }], ['ms', 'Mass', 'kg', 50, function (v) { return v.pe / (v.g * v.h); }], ['h', 'Height', 'm', 10, function (v) { return v.pe / (v.ms * v.g); }]],
    { pre: [['g', 'Gravity (g)', 'n', 9.80665, 'm/s²']] });
  F('work-calculator', 'Work Done Calculator', P, 'Work done by a force over a distance, with power.', 'W = F × d × cos θ.',
    [['fo', 'Force', 'n', 50, 'N'], ['d', 'Distance', 'n', 12, 'm'], ['th', 'Angle between force and motion', 'n', 0, '°'], ['t', 'Time taken (optional)', 'n', 8, 's']],
    [O('Work done', 'fo*d*cos(th*pi/180)', 'J'), O('Power', 'if(t>0,o1/t,0)', 'W'), O('Work in kJ', 'o1/1000', 'kJ')]);
  SV('power-physics-calculator', 'Power, Work & Time Calculator', P, 'Power, work or time.', 'P = W ÷ t.',
    [['pw', 'Power', 'W', 250, function (v) { return v.w / v.t; }], ['w', 'Work / energy', 'J', 5000, function (v) { return v.pw * v.t; }], ['t', 'Time', 's', 20, function (v) { return v.w / v.pw; }]],
    { more: function (v) { return [r('Power in horsepower', v.pw / 745.6999, 5, 'hp')]; } });
  C('projectile-motion-calculator', 'Projectile Motion Calculator', P, 'Range, height and flight time of a launched object.', 'Range = v cos θ × t · H = (v sin θ)² ÷ 2g.',
    [['v0', 'Launch speed', 'n', 25, 'm/s'], ['th', 'Launch angle', 'n', 45, '°'], ['h0', 'Launch height', 'n', 0, 'm']].concat(GRAV),
    function (v) { var g = gOf(v), vx = v.v0 * Math.cos(v.th * D2R), vy = v.v0 * Math.sin(v.th * D2R), h0 = v.h0; if (!(g > 0) || !(v.v0 >= 0) || h0 < 0) return { error: 'Speed, height and gravity must be positive.' }; var t = (vy + Math.sqrt(vy * vy + 2 * g * h0)) / g, rng = vx * t, hm = h0 + (vy > 0 ? vy * vy / (2 * g) : 0), pts = [], n = 50;
      for (var i = 0; i <= n; i++) { var tt = t * i / n; pts.push([vx * tt, Math.max(0, h0 + vy * tt - 0.5 * g * tt * tt)]); }
      return { results: [rm('Range', rng, 4, 'm'), r('Maximum height', hm, 4, 'm'), r('Flight time', t, 4, 's'), r('Impact speed', Math.hypot(vx, vy - g * t), 4, 'm/s'), r('Time to peak', vy > 0 ? vy / g : 0, 4, 's')], chart: { type: 'scatter', title: 'Trajectory (distance vs height, m)', series: [{ l: 'Path', pts: pts, line: true }], f: 'num' } }; }, { pop: 1 });
  C('free-fall-calculator', 'Free Fall Calculator', P, 'Fall time, final speed and drop height (ignoring air resistance).', 'h = ½ g t² · v = g t.',
    [['k', 'You know', 'g', 1, [[1, 'Height'], [2, 'Time'], [3, 'Final speed']]], ['x', 'Value', 'n', 45, 'm / s / m/s']].concat(GRAV),
    function (v) { var g = gOf(v), h, t, vf; if (!(g > 0) || !(v.x > 0)) return { error: 'Enter a positive value and gravity.' }; if (+v.k === 1) { h = v.x; t = Math.sqrt(2 * h / g); vf = g * t; } else if (+v.k === 2) { t = v.x; h = 0.5 * g * t * t; vf = g * t; } else { vf = v.x; t = vf / g; h = vf * vf / (2 * g); }
      return { results: [rm('Fall time', t, 4, 's'), r('Drop height', h, 4, 'm'), r('Final speed', vf, 4, 'm/s'), r('Final speed in km/h', vf * 3.6, 3, 'km/h')], chart: { type: 'line', title: 'Distance fallen over time', labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (i) { return N(t * i / 10, 2) + 's'; }), series: [{ l: 'Distance (m)', pts: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (i) { var tt = t * i / 10; return 0.5 * g * tt * tt; }) }], f: 'num' } }; });
  SV('centripetal-force-calculator', 'Centripetal Force Calculator', P, 'Force needed to keep an object moving in a circle.', 'F = m v² ÷ r.',
    [['fo', 'Centripetal force', 'N', 750, function (v) { return v.ms * v.v * v.v / v.rd; }], ['ms', 'Mass', 'kg', 1200, function (v) { return v.fo * v.rd / (v.v * v.v); }], ['v', 'Speed', 'm/s', 12.5, function (v) { return Math.sqrt(v.fo * v.rd / v.ms); }], ['rd', 'Radius', 'm', 250, function (v) { return v.ms * v.v * v.v / v.fo; }]]);
  SV('gravitational-force-calculator', "Newton's Law of Gravitation Calculator", P, 'Gravitational attraction between two masses.', 'F = G m₁ m₂ ÷ r².',
    [['fo', 'Force', 'N', 3.54e22, function (v) { return 6.6743e-11 * v.m1 * v.m2 / (v.rd * v.rd); }], ['m1', 'Mass 1', 'kg', 5.972e24, function (v) { return v.fo * v.rd * v.rd / (6.6743e-11 * v.m2); }], ['m2', 'Mass 2', 'kg', 7.342e22, function (v) { return v.fo * v.rd * v.rd / (6.6743e-11 * v.m1); }], ['rd', 'Distance (centre to centre)', 'm', 3.844e8, function (v) { return Math.sqrt(6.6743e-11 * v.m1 * v.m2 / v.fo); }]]);
  SV('pendulum-calculator', 'Pendulum Period Calculator', P, 'Period of a simple pendulum.', 'T = 2π √(L ÷ g).',
    [['tp', 'Period', 's', 2.006, function (v) { return 2 * Math.PI * Math.sqrt(v.l / v.g); }], ['l', 'Length', 'm', 1, function (v) { return v.g * Math.pow(v.tp / (2 * Math.PI), 2); }], ['g', 'Gravity', 'm/s²', 9.80665, function (v) { return 4 * Math.PI * Math.PI * v.l / (v.tp * v.tp); }]],
    { more: function (v) { return [r('Frequency', 1 / v.tp, 5, 'Hz'), r('Swings per minute', 60 / v.tp, 3)]; } });
  SV('hookes-law-calculator', "Hooke's Law & Spring Energy Calculator", P, 'Spring force, stiffness or extension.', 'F = k x · E = ½ k x².',
    [['fo', 'Force', 'N', 50, function (v) { return v.k * v.x; }], ['k', 'Spring constant', 'N/m', 250, function (v) { return v.fo / v.x; }], ['x', 'Extension', 'm', 0.2, function (v) { return v.fo / v.k; }]],
    { more: function (v) { return [r('Stored energy', 0.5 * v.k * v.x * v.x, 5, 'J')]; } });
  F('friction-calculator', 'Friction Force Calculator', P, 'Friction force and whether an object slides on a slope.', 'F = μ N · N = m g cos θ.',
    [['ms', 'Mass', 'n', 20, 'kg'], ['mu', 'Coefficient of friction (μ)', 'n', 0.4], ['th', 'Surface angle', 'n', 0, '°']],
    [O('Friction force', 'mu*ms*9.80665*cos(th*pi/180)', 'N'), O('Normal force', 'ms*9.80665*cos(th*pi/180)', 'N'), O('Force pulling down the slope', 'ms*9.80665*sin(th*pi/180)', 'N'), ['Will it slide?', 'tan(th*pi/180)-mu', 'b', '', { bands: [[0, 'No — friction holds it'], [Infinity, 'Yes — it slides']] }]]);
  F('inclined-plane-calculator', 'Inclined Plane Calculator', P, 'Acceleration, time and speed of an object sliding down a slope.', 'a = g (sin θ − μ cos θ).',
    [['th', 'Slope angle', 'n', 30, '°'], ['mu', 'Friction coefficient (μ)', 'n', 0.1], ['l', 'Length of the slope', 'n', 5, 'm']],
    [O('Acceleration', 'max(0,9.80665*(sin(th*pi/180)-mu*cos(th*pi/180)))', 'm/s²'), O('Time to slide down', 'if(o1>0,sqrt(2*l/o1),0)', 's'), O('Speed at the bottom', 'sqrt(2*o1*l)', 'm/s'), O('Height of the slope', 'l*sin(th*pi/180)', 'm')]);
  SV('torque-calculator', 'Torque Calculator', P, 'Torque, force or lever arm.', 'τ = r × F × sin θ.',
    [['tq', 'Torque', 'N·m', 60, function (v) { return v.rd * v.fo * Math.sin(v.th * D2R); }], ['fo', 'Force', 'N', 120, function (v) { return v.tq / (v.rd * Math.sin(v.th * D2R)); }], ['rd', 'Lever arm', 'm', 0.5, function (v) { return v.tq / (v.fo * Math.sin(v.th * D2R)); }]],
    { pre: [['th', 'Angle between force and lever', 'n', 90, '°']], more: function (v) { return [r('Torque in lb·ft', v.tq * 0.737562, 4, 'lb·ft')]; } });
  C('moment-of-inertia-calculator', 'Moment of Inertia Calculator', P, 'Moment of inertia of common rotating shapes.', 'I = k m r² (k depends on the shape).',
    [['sh', 'Shape', 's', 1, [[1, 'Solid cylinder / disk'], [2, 'Hollow cylinder / ring'], [3, 'Solid sphere'], [4, 'Hollow sphere'], [5, 'Thin rod about centre'], [6, 'Thin rod about one end'], [7, 'Rectangular plate about centre']]], ['ms', 'Mass', 'n', 5, 'kg'], ['a', 'Radius / length / side a', 'n', 0.3, 'm'], ['b', 'Side b (plate only)', 'n', 0.2, 'm', { show: 'sh==7' }]],
    function (v) { var sh = +v.sh, k = [0, 1 / 2, 1, 2 / 5, 2 / 3, 1 / 12, 1 / 3][sh], I = sh === 7 ? v.ms * (v.a * v.a + v.b * v.b) / 12 : k * v.ms * v.a * v.a; return { results: [rm('Moment of inertia', I, 6, 'kg·m²'), r('Radius of gyration', Math.sqrt(I / v.ms), 5, 'm')] }; });
  F('angular-velocity-calculator', 'Angular Velocity & RPM Calculator', P, 'Convert between RPM, rad/s, frequency and linear speed.', 'ω = 2π f = 2π × rpm ÷ 60.',
    [['rpm', 'Rotational speed', 'n', 1500, 'rpm'], ['rd', 'Radius (for linear speed)', 'n', 0.25, 'm']],
    [O('Angular velocity', 'rpm*2*pi/60', 'rad/s'), O('Frequency', 'rpm/60', 'Hz'), O('Period', '60/rpm', 's'), O('Linear speed at the radius', 'o1*rd', 'm/s'), O('Centripetal acceleration', 'o1^2*rd', 'm/s²')]);
  F('terminal-velocity-calculator', 'Terminal Velocity Calculator', P, 'Maximum falling speed when drag balances weight.', 'v = √(2 m g ÷ (ρ A Cd)).',
    [['ms', 'Mass', 'n', 80, 'kg'], ['a', 'Cross-section area', 'n', 0.7, 'm²'], ['cd', 'Drag coefficient', 'n', 1], ['rho', 'Air density', 'n', 1.225, 'kg/m³']],
    [O('Terminal velocity', 'sqrt(2*ms*9.80665/(rho*a*cd))', 'm/s'), O('In km/h', 'o1*3.6', 'km/h'), O('In mph', 'o1*2.236936', 'mph')]);
  F('drag-force-calculator', 'Drag Force Calculator', P, 'Air or fluid resistance on a moving object.', 'F = ½ ρ v² Cd A.',
    [['v', 'Speed', 'n', 30, 'm/s'], ['cd', 'Drag coefficient', 'n', 0.3], ['a', 'Frontal area', 'n', 2.2, 'm²'], ['rho', 'Fluid density', 'n', 1.225, 'kg/m³']],
    [O('Drag force', '0.5*rho*v^2*cd*a', 'N'), O('Power to overcome drag', 'o1*v', 'W'), O('Power in kW', 'o2/1000', 'kW', 3)]);
  C('collision-calculator', 'Collision Calculator (Elastic & Inelastic)', P, 'Velocities after two bodies collide in one dimension.', 'Momentum is always conserved.',
    [['m1', 'Mass 1', 'n', 2, 'kg'], ['v1', 'Velocity 1', 'n', 5, 'm/s'], ['m2', 'Mass 2', 'n', 3, 'kg'], ['v2', 'Velocity 2', 'n', -1, 'm/s'], ['ty', 'Collision', 'g', 1, [[1, 'Elastic'], [2, 'Perfectly inelastic']]]],
    function (v) { var m1 = v.m1, m2 = v.m2, M_ = m1 + m2; if (!(m1 > 0) || !(m2 > 0)) return { error: 'Masses must be positive.' }; var u1, u2; if (+v.ty === 1) { u1 = ((m1 - m2) * v.v1 + 2 * m2 * v.v2) / M_; u2 = ((m2 - m1) * v.v2 + 2 * m1 * v.v1) / M_; } else { u1 = u2 = (m1 * v.v1 + m2 * v.v2) / M_; }
      var ke0 = 0.5 * m1 * v.v1 * v.v1 + 0.5 * m2 * v.v2 * v.v2, ke1 = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2; return { results: [rm('Velocity 1 after', u1, 5, 'm/s'), r('Velocity 2 after', u2, 5, 'm/s'), r('Total momentum', m1 * v.v1 + m2 * v.v2, 5, 'kg·m/s'), r('Kinetic energy before', ke0, 5, 'J'), r('Kinetic energy after', ke1, 5, 'J'), r('Energy lost', ke0 - ke1, 5, 'J')] }; });
  C('center-of-mass-calculator', 'Center of Mass Calculator', P, 'Centre of mass of several point masses.', 'x̄ = Σ mᵢxᵢ ÷ Σ mᵢ.',
    [['d', 'Mass, x and y (one body per line)', 'ta', '2 0 0\n3 4 0\n5 2 6', { rows: 5 }]],
    function (v) { var rows = CW.stat.rows(v.d).filter(function (q) { return q.length >= 2; }); if (rows.length < 2) return { error: 'Enter at least 2 bodies as "mass x y".' }; var mt = 0, sx = 0, sy = 0; rows.forEach(function (q) { mt += q[0]; sx += q[0] * q[1]; sy += q[0] * (q[2] || 0); }); if (!(mt > 0)) return { error: 'Total mass must be positive.' };
      return { results: [rm('Centre of mass x', sx / mt, 5), r('Centre of mass y', sy / mt, 5), r('Total mass', mt, 5)] }; });

  /* ---------- Fluids, heat & gases ---------- */
  SV('density-calculator', 'Density Calculator', P, 'Density, mass or volume.', 'ρ = m ÷ V.',
    [['rho', 'Density', 'kg/m³', 7850, function (v) { return v.ms / v.vol; }], ['ms', 'Mass', 'kg', 15.7, function (v) { return v.rho * v.vol; }], ['vol', 'Volume', 'm³', 0.002, function (v) { return v.ms / v.rho; }]],
    { pop: 1, more: function (v) { return [r('Density in g/cm³', v.rho / 1000, 6, 'g/cm³'), r('Density in lb/ft³', v.rho * 0.0624280, 4, 'lb/ft³')]; } });
  SV('pressure-physics-calculator', 'Pressure Calculator (Force ÷ Area)', P, 'Pressure, force or area.', 'P = F ÷ A.',
    [['p', 'Pressure', 'Pa', 100000, function (v) { return v.fo / v.a; }], ['fo', 'Force', 'N', 1000, function (v) { return v.p * v.a; }], ['a', 'Area', 'm²', 0.01, function (v) { return v.fo / v.p; }]],
    { more: function (v) { return [r('Pressure in psi', v.p * 0.000145038, 5, 'psi'), r('Pressure in bar', v.p / 1e5, 6, 'bar'), r('Pressure in atm', v.p / 101325, 6, 'atm')]; } });
  F('hydrostatic-pressure-calculator', 'Hydrostatic Pressure Calculator', P, 'Pressure at a depth in a fluid.', 'P = P₀ + ρ g h.',
    [['rho', 'Fluid density', 'n', 1000, 'kg/m³'], ['h', 'Depth', 'n', 10, 'm'], ['p0', 'Surface pressure', 'n', 101325, 'Pa']],
    [O('Absolute pressure', 'p0+rho*9.80665*h', 'Pa'), O('Gauge pressure', 'rho*9.80665*h', 'Pa'), O('Absolute pressure in atm', 'o1/101325', 'atm', 4), O('Absolute pressure in psi', 'o1*0.000145038', 'psi', 3)]);
  C('buoyancy-calculator', "Buoyancy (Archimedes' Principle) Calculator", P, 'Buoyant force and whether an object floats.', 'F_b = ρ_fluid × g × V_displaced.',
    [['fl', 'Fluid', 's', 1000, [[1000, 'Fresh water (1000)'], [1025, 'Seawater (1025)'], [920, 'Oil (920)'], [13534, 'Mercury (13,534)'], [1.225, 'Air (1.225)']]], ['ms', 'Object mass', 'n', 0.8, 'kg'], ['vol', 'Object volume', 'n', 0.001, 'm³']],
    function (v) { var rho = +v.fl, w = v.ms * 9.80665, vol = v.vol; if (!(vol > 0) || !(v.ms > 0)) return { error: 'Mass and volume must be positive.' }; var fb = rho * 9.80665 * vol, dens = v.ms / vol, frac = Math.min(1, dens / rho);
      return { results: [rm('Maximum buoyant force', fb, 5, 'N'), r('Weight of the object', w, 5, 'N'), r('Object density', dens, 4, 'kg/m³'), R('Result', dens < rho ? 'Floats — ' + N(frac * 100, 1) + '% of the volume is submerged' : dens === rho ? 'Neutrally buoyant' : 'Sinks', 'text'), r('Net force (up is positive)', fb - w, 5, 'N')] }; });
  SV('specific-heat-calculator', 'Specific Heat & Heat Energy Calculator', P, 'Heat needed to change the temperature of a substance.', 'Q = m c ΔT.',
    [['q', 'Heat energy', 'J', 83600, function (v) { return v.ms * v.c * v.dT; }], ['ms', 'Mass', 'kg', 1, function (v) { return v.q / (v.c * v.dT); }], ['c', 'Specific heat', 'J/(kg·K)', 4180, function (v) { return v.q / (v.ms * v.dT); }], ['dT', 'Temperature change', 'K', 20, function (v) { return v.q / (v.ms * v.c); }]],
    { more: function (v) { return [r('Heat in kcal', v.q / 4184, 5, 'kcal'), r('Heat in kWh', v.q / 3.6e6, 8, 'kWh')]; }, note: 'Water: 4180 · Aluminium: 900 · Iron: 450 · Copper: 385 · Air: 1005 J/(kg·K).' });
  SV('heat-conduction-calculator', 'Heat Conduction Calculator (Fourier)', P, 'Rate of heat flow through a wall or slab.', 'Q/t = k A ΔT ÷ d.',
    [['qt', 'Heat flow rate', 'W', 480, function (v) { return v.k * v.a * v.dT / v.d; }], ['k', 'Thermal conductivity', 'W/(m·K)', 0.8, function (v) { return v.qt * v.d / (v.a * v.dT); }], ['a', 'Area', 'm²', 10, function (v) { return v.qt * v.d / (v.k * v.dT); }], ['dT', 'Temperature difference', 'K', 20, function (v) { return v.qt * v.d / (v.k * v.a); }], ['d', 'Thickness', 'm', 0.2, function (v) { return v.k * v.a * v.dT / v.qt; }]],
    { more: function (v) { return [r('R-value (SI)', v.d / v.k, 5, 'm²·K/W'), r('Energy per day', v.qt * 24 / 1000, 4, 'kWh')]; } });
  C('ideal-gas-law-calculator', 'Ideal Gas Law Calculator', P, 'Pressure, volume, moles or temperature of an ideal gas.', 'PV = nRT.',
    [['f', 'Find', 's', 1, [[1, 'Pressure'], [2, 'Volume'], [3, 'Moles'], [4, 'Temperature']]], ['p', 'Pressure', 'n', 101.325, 'kPa', { show: 'f>1' }], ['vo', 'Volume', 'n', 22.414, 'L', { show: 'if(f==2,0,1)' }], ['n', 'Amount', 'n', 1, 'mol', { show: 'if(f==3,0,1)' }], ['t', 'Temperature', 'n', 273.15, 'K', { show: 'f<4' }]],
    function (v) { var R_ = 8.314462618, f = +v.f, x, lab, u; if (f === 1) { x = v.n * R_ * v.t / v.vo; lab = 'Pressure'; u = 'kPa'; } else if (f === 2) { x = v.n * R_ * v.t / v.p; lab = 'Volume'; u = 'L'; } else if (f === 3) { x = v.p * v.vo / (R_ * v.t); lab = 'Amount'; u = 'mol'; } else { x = v.p * v.vo / (v.n * R_); lab = 'Temperature'; u = 'K'; }
      if (!isFinite(x)) return { error: 'These values do not give a valid answer.' }; var res = [rm(lab, x, 6, u)]; if (f === 4) res.push(r('Temperature in °C', x - 273.15, 4, '°C')); if (f === 1) res.push(r('Pressure in atm', x / 101.325, 5, 'atm'), r('Pressure in psi', x * 0.145038, 4, 'psi')); return { results: res }; });
  SV('boyles-law-calculator', "Boyle's Law Calculator", P, 'Pressure–volume relationship at constant temperature.', 'P₁V₁ = P₂V₂.',
    [['p1', 'Initial pressure P₁', 'kPa', 100, function (v) { return v.p2 * v.v2 / v.v1; }], ['v1', 'Initial volume V₁', 'L', 10, function (v) { return v.p2 * v.v2 / v.p1; }], ['p2', 'Final pressure P₂', 'kPa', 250, function (v) { return v.p1 * v.v1 / v.v2; }], ['v2', 'Final volume V₂', 'L', 4, function (v) { return v.p1 * v.v1 / v.p2; }]]);
  SV('charles-law-calculator', "Charles's Law Calculator", P, 'Volume–temperature relationship at constant pressure.', 'V₁ ÷ T₁ = V₂ ÷ T₂.',
    [['v1', 'Initial volume V₁', 'L', 5, function (v) { return v.v2 * v.t1 / v.t2; }], ['t1', 'Initial temperature T₁', 'K', 300, function (v) { return v.v1 * v.t2 / v.v2; }], ['v2', 'Final volume V₂', 'L', 6.5, function (v) { return v.v1 * v.t2 / v.t1; }], ['t2', 'Final temperature T₂', 'K', 390, function (v) { return v.t1 * v.v2 / v.v1; }]],
    { note: 'Use kelvin: K = °C + 273.15.' });
  SV('gay-lussac-law-calculator', "Gay-Lussac's Law Calculator", P, 'Pressure–temperature relationship at constant volume.', 'P₁ ÷ T₁ = P₂ ÷ T₂.',
    [['p1', 'Initial pressure P₁', 'kPa', 200, function (v) { return v.p2 * v.t1 / v.t2; }], ['t1', 'Initial temperature T₁', 'K', 290, function (v) { return v.p1 * v.t2 / v.p2; }], ['p2', 'Final pressure P₂', 'kPa', 240, function (v) { return v.p1 * v.t2 / v.t1; }], ['t2', 'Final temperature T₂', 'K', 348, function (v) { return v.t1 * v.p2 / v.p1; }]],
    { note: 'Use kelvin: K = °C + 273.15.' });
  SV('combined-gas-law-calculator', 'Combined Gas Law Calculator', P, 'Pressure, volume and temperature changes together.', 'P₁V₁ ÷ T₁ = P₂V₂ ÷ T₂.',
    [['p1', 'P₁', 'kPa', 100, function (v) { return v.p2 * v.v2 * v.t1 / (v.v1 * v.t2); }], ['v1', 'V₁', 'L', 10, function (v) { return v.p2 * v.v2 * v.t1 / (v.p1 * v.t2); }], ['t1', 'T₁', 'K', 300, function (v) { return v.p1 * v.v1 * v.t2 / (v.p2 * v.v2); }], ['p2', 'P₂', 'kPa', 150, function (v) { return v.p1 * v.v1 * v.t2 / (v.v2 * v.t1); }], ['v2', 'V₂', 'L', 8, function (v) { return v.p1 * v.v1 * v.t2 / (v.p2 * v.t1); }], ['t2', 'T₂', 'K', 360, function (v) { return v.p2 * v.v2 * v.t1 / (v.p1 * v.v1); }]]);
  F('gas-density-calculator', 'Gas Density Calculator', P, 'Density of an ideal gas at a given pressure and temperature.', 'ρ = P M ÷ (R T).',
    [['p', 'Pressure', 'n', 101.325, 'kPa'], ['t', 'Temperature', 'n', 20, '°C'], ['mm', 'Molar mass', 'n', 28.97, 'g/mol']],
    [O('Density', 'p*1000*mm/1000/(8.314462618*(t+273.15))', 'kg/m³'), O('Density in g/L', 'o1', 'g/L'), O('Molar volume', '8.314462618*(t+273.15)/p', 'L/mol', 4)], { note: 'Default molar mass 28.97 g/mol is dry air.' });

  /* ---------- Waves, light & modern ---------- */
  SV('wavelength-frequency-calculator', 'Wavelength & Frequency Calculator', P, 'Wavelength, frequency or wave speed.', 'v = f × λ.',
    [['f', 'Frequency', 'Hz', 100000000, function (v) { return v.v / v.wl; }], ['wl', 'Wavelength', 'm', 2.998, function (v) { return v.v / v.f; }], ['v', 'Wave speed', 'm/s', 299792458, function (v) { return v.f * v.wl; }]], { note: 'Light in a vacuum: 299,792,458 m/s · sound in air: ~343 m/s.' });
  F('doppler-effect-calculator', 'Doppler Effect Calculator', P, 'Observed frequency when a source or observer is moving.', "f' = f (v + vₒ) ÷ (v − vₛ).",
    [['f', 'Source frequency', 'n', 440, 'Hz'], ['v', 'Speed of sound', 'n', 343, 'm/s'], ['vo', 'Observer speed towards source', 'n', 0, 'm/s'], ['vs', 'Source speed towards observer', 'n', 30, 'm/s']],
    [O('Observed frequency', 'f*(v+vo)/(v-vs)', 'Hz'), O('Change in frequency', 'o1-f', 'Hz'), O('Wavelength heard', 'v/o1', 'm', 4)], { note: 'Use negative speeds when moving apart.' });
  F('speed-of-sound-calculator', 'Speed of Sound Calculator', P, 'Speed of sound in air at a given temperature.', 'v ≈ 331.3 √(1 + T ÷ 273.15).',
    [['t', 'Air temperature', 'n', 20, '°C']],
    [O('Speed of sound', '331.3*sqrt(1+t/273.15)', 'm/s', 3), O('In km/h', 'o1*3.6', 'km/h', 2), O('In mph', 'o1*2.236936', 'mph', 2)]);
  F('snells-law-calculator', "Snell's Law Calculator", P, 'Refraction angle and critical angle between two media.', 'n₁ sin θ₁ = n₂ sin θ₂.',
    [['n1', 'Refractive index n₁', 'n', 1], ['n2', 'Refractive index n₂', 'n', 1.5], ['a1', 'Angle of incidence', 'n', 40, '°']],
    [['Refraction angle θ₂', 'if(n1*sin(a1*pi/180)/n2>1,0,asin(n1*sin(a1*pi/180)/n2)*180/pi)', 'n', '°', { dp: 4 }], ['Total internal reflection?', 'n1*sin(a1*pi/180)/n2-1', 'b', '', { bands: [[0, 'No — light refracts'], [Infinity, 'Yes — all light reflects']] }], ['Critical angle', 'if(n1>n2,asin(n2/n1)*180/pi,0)', 'n', '°', { dp: 4, sub: 'only when n₁ > n₂' }]], { note: 'Water ≈ 1.33 · glass ≈ 1.5 · diamond ≈ 2.42.' });
  SV('thin-lens-equation-calculator', 'Thin Lens & Mirror Equation Calculator', P, 'Focal length, object distance or image distance.', '1 ÷ f = 1 ÷ dₒ + 1 ÷ dᵢ.',
    [['f', 'Focal length', 'cm', 10, function (v) { return 1 / (1 / v.do_ + 1 / v.di); }], ['do_', 'Object distance', 'cm', 30, function (v) { return 1 / (1 / v.f - 1 / v.di); }], ['di', 'Image distance', 'cm', 15, function (v) { return 1 / (1 / v.f - 1 / v.do_); }]],
    { more: function (v) { return [r('Magnification', -v.di / v.do_, 4), rt('Image', v.di > 0 ? 'Real and ' + (-v.di / v.do_ < 0 ? 'inverted' : 'upright') : 'Virtual and upright')]; } });
  C('photon-energy-calculator', 'Photon Energy Calculator', P, 'Energy, wavelength and frequency of a photon.', 'E = h f = h c ÷ λ.',
    [['k', 'You know', 's', 1, [[1, 'Wavelength (nm)'], [2, 'Frequency (THz)'], [3, 'Energy (eV)']]], ['x', 'Value', 'n', 550]],
    function (v) { var h = 6.62607015e-34, c = 299792458, eV = 1.602176634e-19, wl, f, E; if (!(v.x > 0)) return { error: 'Enter a positive value.' }; if (+v.k === 1) { wl = v.x * 1e-9; f = c / wl; E = h * f; } else if (+v.k === 2) { f = v.x * 1e12; wl = c / f; E = h * f; } else { E = v.x * eV; f = E / h; wl = c / f; }
      return { results: [rm('Photon energy', E / eV, 6, 'eV'), r('Energy in joules', E, 6, 'J'), r('Wavelength', wl * 1e9, 6, 'nm'), r('Frequency', f / 1e12, 6, 'THz'), R('Band', wl < 1e-8 ? 'X-ray / UV' : wl < 3.8e-7 ? 'Ultraviolet' : wl < 7.5e-7 ? 'Visible light' : wl < 1e-3 ? 'Infrared' : 'Microwave / radio', 'text')].map(function (q) { return q; }) }; });
  C('de-broglie-wavelength-calculator', 'de Broglie Wavelength Calculator', P, 'Wavelength of a moving particle.', 'λ = h ÷ (m v).',
    [['pt', 'Particle', 's', 1, [[1, 'Electron'], [2, 'Proton'], [3, 'Neutron'], [4, 'Custom mass']]], ['ms', 'Mass (custom)', 'n', 1e-27, 'kg', { show: 'pt==4' }], ['v', 'Speed', 'n', 1000000, 'm/s']],
    function (v) { var mm = [0, 9.1093837e-31, 1.67262192e-27, 1.67492750e-27][+v.pt] || v.ms; if (!(v.v > 0) || !(mm > 0)) return { error: 'Speed and mass must be positive.' }; var wl = 6.62607015e-34 / (mm * v.v); return { results: [rm('de Broglie wavelength', wl, 6, 'm'), r('In nanometres', wl * 1e9, 6, 'nm'), r('In ångströms', wl * 1e10, 6, 'Å'), r('Momentum', mm * v.v, 6, 'kg·m/s')] }; });
  F('time-dilation-calculator', 'Time Dilation & Lorentz Factor Calculator', P, 'Special relativity: time dilation and length contraction.', 'γ = 1 ÷ √(1 − v²/c²).',
    [['v', 'Speed as % of light speed', 'n', 80, '%'], ['t', 'Proper time (your clock)', 'n', 10, 'years'], ['l', 'Proper length', 'n', 100, 'm']],
    [['Lorentz factor γ', '1/sqrt(1-(v/100)^2)', 'n', '', { dp: 6 }], ['Time for a stationary observer', 't*o1', 'n', 'years', { dp: 5 }], ['Length seen by observer', 'l/o1', 'n', 'm', { dp: 5 }], ['Speed', 'v/100*299792.458', 'n', 'km/s', { dp: 1 }]]);
  C('mass-energy-calculator', 'Mass–Energy (E = mc²) Calculator', P, 'Energy equivalent of a mass, or mass equivalent of energy.', 'E = m c².',
    [['k', 'You know', 'g', 1, [[1, 'Mass (kg)'], [2, 'Energy (J)']]], ['x', 'Value', 'n', 1]],
    function (v) { var c2 = 299792458 * 299792458, E = +v.k === 1 ? v.x * c2 : v.x, m = +v.k === 1 ? v.x : v.x / c2; if (!(v.x > 0)) return { error: 'Enter a positive value.' };
      return { results: [rm('Energy', E, 6, 'J'), r('Mass', m, 6, 'kg'), r('Energy in kWh', E / 3.6e6, 6, 'kWh'), r('TNT equivalent', E / 4.184e9, 6, 'tonnes'), r('Hiroshima bombs (~63 TJ)', E / 6.3e13, 5)] }; });
  C('radioactive-decay-calculator', 'Radioactive Decay Calculator', P, 'Remaining amount, decay constant and activity over time.', 'N = N₀ (½)^(t ÷ T½).',
    [['n0', 'Initial amount', 'n', 100, 'g'], ['th', 'Half-life', 'n', 5730, 'years'], ['t', 'Time elapsed', 'n', 10000, 'years']],
    function (v) { if (!(v.th > 0) || v.t < 0) return { error: 'Half-life must be positive and time ≥ 0.' }; var lam = Math.LN2 / v.th, n = v.n0 * Math.pow(0.5, v.t / v.th), lab = [], pts = []; for (var i = 0; i <= 10; i++) { var tt = Math.max(v.t, v.th * 4) * i / 10; lab.push(N(tt, 2)); pts.push(v.n0 * Math.pow(0.5, tt / v.th)); }
      return { results: [rm('Amount remaining', n, 6, 'g'), r('Fraction remaining', n / v.n0 * 100, 4, '%'), r('Decayed', v.n0 - n, 6), r('Decay constant (λ)', lam, 8, 'per unit time'), r('Half-lives elapsed', v.t / v.th, 4), r('Mean lifetime', 1 / lam, 4)], chart: { type: 'line', title: 'Amount over time', labels: lab, series: [{ l: 'Remaining', pts: pts }], f: 'num' } }; });
  SV('coulombs-law-calculator', "Coulomb's Law Calculator", P, 'Electric force between two charges.', 'F = k q₁ q₂ ÷ r².',
    [['fo', 'Force', 'N', 8.99, function (v) { return 8.9875517923e9 * v.q1 * v.q2 / (v.rd * v.rd); }], ['q1', 'Charge 1', 'C', 1e-5, function (v) { return v.fo * v.rd * v.rd / (8.9875517923e9 * v.q2); }], ['q2', 'Charge 2', 'C', 1e-5, function (v) { return v.fo * v.rd * v.rd / (8.9875517923e9 * v.q1); }], ['rd', 'Distance', 'm', 0.317, function (v) { return Math.sqrt(8.9875517923e9 * v.q1 * v.q2 / v.fo); }]],
    { note: 'Positive force = repulsion, negative = attraction.' });

  /* ---------- Weather ---------- */
  F('wind-chill-calculator', 'Wind Chill Calculator', P, 'How cold it feels with the wind.', 'WC = 13.12 + 0.6215T − 11.37V^0.16 + 0.3965T·V^0.16.',
    [['t', 'Air temperature', 'n', -5, '°C'], ['w', 'Wind speed', 'n', 25, 'km/h']],
    [['Feels like', 'if(w<4.8,t,if(t>10,t,13.12+0.6215*t-11.37*w^0.16+0.3965*t*w^0.16))', 'n', '°C', { dp: 1 }], ['In °F', 'o1*9/5+32', 'n', '°F', { dp: 1 }], ['Difference', 'o1-t', 'n', '°C', { dp: 1 }]], { note: 'Valid for air temperatures up to 10 °C and winds above 4.8 km/h.' });
  F('heat-index-calculator', 'Heat Index Calculator', P, 'How hot it feels with humidity.', 'Rothfusz regression (US National Weather Service).',
    [['t', 'Air temperature', 'n', 34, '°C'], ['rh', 'Relative humidity', 'n', 65, '%']],
    [['Feels like', '((-42.379+2.04901523*(t*9/5+32)+10.14333127*rh-0.22475541*(t*9/5+32)*rh-0.00683783*(t*9/5+32)^2-0.05481717*rh^2+0.00122874*(t*9/5+32)^2*rh+0.00085282*(t*9/5+32)*rh^2-0.00000199*(t*9/5+32)^2*rh^2)-32)*5/9', 'n', '°C', { dp: 1 }], ['In °F', 'o1*9/5+32', 'n', '°F', { dp: 1 }], ['Risk level', 'o1', 'b', '', { bands: [[27, 'Comfortable'], [32, 'Caution — fatigue possible'], [41, 'Extreme caution — heat cramps likely'], [54, 'Danger — heat exhaustion likely'], [Infinity, 'Extreme danger — heat stroke']] }]], { note: 'The regression is designed for temperatures above about 27 °C and humidity above 40%.' });
  F('dew-point-calculator', 'Dew Point Calculator', P, 'Temperature at which air becomes saturated.', 'Magnus formula: Td = c·γ ÷ (b − γ).',
    [['t', 'Air temperature', 'n', 28, '°C'], ['rh', 'Relative humidity', 'n', 60, '%']],
    [['Dew point', '243.12*(ln(rh/100)+17.62*t/(243.12+t))/(17.62-(ln(rh/100)+17.62*t/(243.12+t)))', 'n', '°C', { dp: 1 }], ['In °F', 'o1*9/5+32', 'n', '°F', { dp: 1 }], ['Comfort', 'o1', 'b', '', { bands: [[10, 'Dry and comfortable'], [16, 'Pleasant'], [20, 'Slightly humid'], [24, 'Muggy'], [Infinity, 'Oppressive']] }]]);
})(window.CW);
