/* Calcyworld — geometry, trigonometry & coordinate geometry */
(function (CW) {
  'use strict';
  var F = CW.F, C = CW.C, M = CW.M, R = CW.Rr, L = CW.list;
  var N = function (x, d) { return CW.fmt.num(x, d === undefined ? 6 : d); };
  var D2R = Math.PI / 180;
  var U = ' ';   // spacer so unit tiles read naturally
  var A = function (e, u) { return [e, 'n', u || '', { dp: 6 }]; };    // numeric output helper
  var O = function (l, e, u) { return [l, e, 'n', u || '', { dp: 6 }]; };

  /* ---------------- 2-D shapes ---------------- */
  F('square-calculator', 'Square Calculator', 'geometry/shapes', 'Area, perimeter and diagonal of a square.', 'A = s² · P = 4s · d = s√2.',
    [['s', 'Side length', 'n', 5]],
    [O('Area', 's^2'), O('Perimeter', '4*s'), O('Diagonal', 's*sqrt(2)'), O('Inradius', 's/2'), O('Circumradius', 's*sqrt(2)/2')], { pop: 1 });
  F('rectangle-calculator', 'Rectangle Calculator', 'geometry/shapes', 'Area, perimeter and diagonal of a rectangle.', 'A = l × w · P = 2(l + w) · d = √(l² + w²).',
    [['l', 'Length', 'n', 8], ['w', 'Width', 'n', 5]],
    [O('Area', 'l*w'), O('Perimeter', '2*(l+w)'), O('Diagonal', 'hypot(l,w)'), O('Angle between diagonals', '2*atan(w/l)*180/pi', '°')]);
  F('parallelogram-calculator', 'Parallelogram Calculator', 'geometry/shapes', 'Area and perimeter of a parallelogram.', 'A = base × height · P = 2(a + b).',
    [['b', 'Base', 'n', 10], ['h', 'Height', 'n', 6], ['s', 'Slanted side', 'n', 7]],
    [O('Area', 'b*h'), O('Perimeter', '2*(b+s)'), O('Acute angle', 'asin(min(1,h/s))*180/pi', '°')]);
  F('trapezoid-calculator', 'Trapezoid Calculator', 'geometry/shapes', 'Area, median and perimeter of a trapezoid (trapezium).', 'A = (a + b) ÷ 2 × h.',
    [['a', 'Base a', 'n', 10], ['b', 'Base b', 'n', 6], ['h', 'Height', 'n', 4], ['c', 'Leg c', 'n', 5, '', { opt: 1 }], ['d', 'Leg d', 'n', 5, '', { opt: 1 }]],
    [O('Area', '(a+b)/2*h'), O('Median', '(a+b)/2'), O('Perimeter', 'a+b+c+d')]);
  F('rhombus-calculator', 'Rhombus Calculator', 'geometry/shapes', 'Area, side and perimeter of a rhombus from its diagonals.', 'A = p × q ÷ 2 · side = √(p² + q²) ÷ 2.',
    [['p', 'Diagonal p', 'n', 12], ['q', 'Diagonal q', 'n', 16]],
    [O('Area', 'p*q/2'), O('Side', 'hypot(p,q)/2'), O('Perimeter', '2*hypot(p,q)'), O('Inradius', 'p*q/(2*hypot(p,q))')]);
  F('kite-calculator', 'Kite Calculator', 'geometry/shapes', 'Area and perimeter of a kite.', 'A = d₁ × d₂ ÷ 2 · P = 2(a + b).',
    [['d1', 'Diagonal 1', 'n', 14], ['d2', 'Diagonal 2', 'n', 10], ['a', 'Short side', 'n', 6], ['b', 'Long side', 'n', 9]],
    [O('Area', 'd1*d2/2'), O('Perimeter', '2*(a+b)')]);
  var poly = function (id, title, n) {
    F(id, title, 'geometry/shapes', 'Area, perimeter, apothem and angles of a regular ' + (n === 'n' ? 'polygon' : title.replace(' Calculator', '').toLowerCase()) + '.', 'A = n s² ÷ (4 tan(π/n)) · apothem = s ÷ (2 tan(π/n)).',
      (n === 'n' ? [['n', 'Number of sides', 'i', 6]] : []).concat([['s', 'Side length', 'n', 6]]),
      [O('Area', (n === 'n' ? 'n' : n) + '*s^2/(4*tan(pi/' + (n === 'n' ? 'n' : n) + '))'), O('Perimeter', (n === 'n' ? 'n' : n) + '*s'), O('Apothem', 's/(2*tan(pi/' + (n === 'n' ? 'n' : n) + '))'), O('Circumradius', 's/(2*sin(pi/' + (n === 'n' ? 'n' : n) + '))'), O('Interior angle', '(' + (n === 'n' ? 'n' : n) + '-2)*180/' + (n === 'n' ? 'n' : n), '°'), O('Diagonals', (n === 'n' ? 'n' : n) + '*(' + (n === 'n' ? 'n' : n) + '-3)/2')]);
  };
  poly('regular-polygon-calculator', 'Regular Polygon Calculator', 'n'); poly('pentagon-calculator', 'Pentagon Calculator', 5); poly('hexagon-calculator', 'Hexagon Calculator', 6); poly('octagon-calculator', 'Octagon Calculator', 8);
  F('ellipse-calculator', 'Ellipse Calculator', 'geometry/shapes', 'Area, perimeter and eccentricity of an ellipse.', 'A = πab · P ≈ π[3(a + b) − √((3a + b)(a + 3b))] (Ramanujan).',
    [['a', 'Semi-major axis (a)', 'n', 8], ['b', 'Semi-minor axis (b)', 'n', 5]],
    [O('Area', 'pi*a*b'), O('Perimeter (approx.)', 'pi*(3*(a+b)-sqrt((3*a+b)*(a+3*b)))'), O('Eccentricity', 'sqrt(abs(1-min(a,b)^2/max(a,b)^2))'), O('Focal distance', 'sqrt(abs(a^2-b^2))')]);
  F('circumference-calculator', 'Circumference Calculator', 'geometry/shapes', 'Circumference of a circle from its radius, diameter or area.', 'C = 2πr = πd.',
    [['m', 'You know the', 's', 1, [[1, 'Radius'], [2, 'Diameter'], [3, 'Area']]], ['v', 'Value', 'n', 7]],
    [O('Circumference', '2*pi*if(m==1,v,if(m==2,v/2,sqrt(v/pi)))'), O('Radius', 'if(m==1,v,if(m==2,v/2,sqrt(v/pi)))'), O('Diameter', 'o2*2'), O('Area', 'pi*o2^2')]);
  F('sector-calculator', 'Circle Sector & Arc Length Calculator', 'geometry/shapes', 'Arc length, sector area and chord for a given angle.', 'Arc = r θ · Sector area = ½ r² θ (θ in radians).',
    [['r', 'Radius', 'n', 10], ['a', 'Central angle', 'n', 60, '°']],
    [O('Arc length', 'r*a*pi/180'), O('Sector area', 'r^2*a*pi/360'), O('Chord length', '2*r*sin(a*pi/360)'), O('Segment area', 'r^2/2*(a*pi/180-sin(a*pi/180))')]);
  F('annulus-calculator', 'Annulus (Ring) Area Calculator', 'geometry/shapes', 'Area between two concentric circles.', 'A = π(R² − r²).',
    [['R', 'Outer radius', 'n', 10], ['r', 'Inner radius', 'n', 6]],
    [O('Area', 'pi*(R^2-r^2)'), O('Width of ring', 'R-r'), O('Outer circumference', '2*pi*R'), O('Inner circumference', '2*pi*r')]);

  /* ---------------- Triangles ---------------- */
  F('equilateral-triangle-calculator', 'Equilateral Triangle Calculator', 'geometry/triangles', 'Area, height, inradius and circumradius of an equilateral triangle.', 'A = (√3 ÷ 4) s² · h = (√3 ÷ 2) s.',
    [['s', 'Side', 'n', 8]],
    [O('Area', 'sqrt(3)/4*s^2'), O('Height', 'sqrt(3)/2*s'), O('Perimeter', '3*s'), O('Inradius', 's*sqrt(3)/6'), O('Circumradius', 's*sqrt(3)/3')]);
  F('isosceles-triangle-calculator', 'Isosceles Triangle Calculator', 'geometry/triangles', 'Area, height and angles of an isosceles triangle.', 'h = √(leg² − (base ÷ 2)²) · A = ½ × base × h.',
    [['b', 'Base', 'n', 8], ['l', 'Equal sides (legs)', 'n', 6]],
    [O('Height', 'sqrt(l^2-(b/2)^2)'), O('Area', 'b/2*o1'), O('Perimeter', 'b+2*l'), O('Base angles', 'acos(b/(2*l))*180/pi', '°'), O('Apex angle', '180-2*o4', '°')]);
  F('herons-formula-calculator', 'Triangle Area Calculator (Heron’s Formula)', 'geometry/triangles', 'Area, perimeter and angles of a triangle from its three sides.', 's = (a + b + c) ÷ 2 · A = √(s(s − a)(s − b)(s − c)).',
    [['a', 'Side a', 'n', 7], ['b', 'Side b', 'n', 8], ['c', 'Side c', 'n', 9]],
    [O('Area', 'sqrt(max(0,(a+b+c)/2*((a+b+c)/2-a)*((a+b+c)/2-b)*((a+b+c)/2-c)))'), O('Perimeter', 'a+b+c'), O('Angle A', 'acos(max(-1,min(1,(b^2+c^2-a^2)/(2*b*c))))*180/pi', '°'), O('Angle B', 'acos(max(-1,min(1,(a^2+c^2-b^2)/(2*a*c))))*180/pi', '°'), O('Angle C', '180-o3-o4', '°'), O('Inradius', 'o1/(o2/2)'), O('Circumradius', 'a*b*c/(4*o1)'), ['Valid triangle?', 'min(a+b-c,min(a+c-b,b+c-a))', 'b', '', { bands: [[0.0000001, 'No — breaks the triangle inequality'], [Infinity, 'Yes']] }]], { pop: 1 });
  F('triangle-angle-calculator', 'Triangle Angle Calculator', 'geometry/triangles', 'Find the third angle of a triangle and classify it.', 'The three angles add up to 180°.',
    [['a', 'Angle A', 'n', 50, '°'], ['b', 'Angle B', 'n', 65, '°']],
    [O('Angle C', '180-a-b', '°'), ['Type', 'max(a,max(b,180-a-b))', 'b', '', { bands: [[89.999, 'Acute triangle'], [90.001, 'Right triangle'], [Infinity, 'Obtuse triangle']] }]]);
  C('right-triangle-calculator', 'Right Triangle Calculator', 'geometry/triangles', 'Solve a right triangle from any two known values.', 'a² + b² = c² · sin A = a ÷ c.',
    [['m', 'You know', 's', 1, [[1, 'Legs a and b'], [2, 'Leg a and hypotenuse c'], [3, 'Leg a and angle A'], [4, 'Hypotenuse c and angle A']]], ['a', 'Leg a', 'n', 3, '', { show: 'm<4' }], ['b', 'Leg b', 'n', 4, '', { show: 'm==1' }], ['c', 'Hypotenuse c', 'n', 5, '', { show: 'if(m==2,1,m==4)' }], ['ang', 'Angle A', 'n', 36.87, '°', { show: 'm>=3' }]],
    function (v) { var a, b, c, A_; var m = +v.m;
      if (m === 1) { a = v.a; b = v.b; c = Math.hypot(a, b); A_ = Math.atan2(a, b); } else if (m === 2) { a = v.a; c = v.c; if (c <= a) return { error: 'The hypotenuse must be longer than the leg.' }; b = Math.sqrt(c * c - a * a); A_ = Math.asin(a / c); }
      else if (m === 3) { a = v.a; A_ = v.ang * D2R; b = a / Math.tan(A_); c = a / Math.sin(A_); } else { c = v.c; A_ = v.ang * D2R; a = c * Math.sin(A_); b = c * Math.cos(A_); }
      if (![a, b, c, A_].every(isFinite)) return { error: 'Please check your inputs.' };
      return { results: [M('Hypotenuse c', c, 'num', { dp: 6 }), R('Leg a', a, 'num', { dp: 6 }), R('Leg b', b, 'num', { dp: 6 }), R('Angle A', A_ / D2R, 'num', { dp: 4, u: '°' }), R('Angle B', 90 - A_ / D2R, 'num', { dp: 4, u: '°' }), R('Area', a * b / 2, 'num', { dp: 6 }), R('Perimeter', a + b + c, 'num', { dp: 6 })] }; }, { pop: 1 });
  C('law-of-sines-calculator', 'Law of Sines Calculator', 'geometry/triangles', 'Solve a triangle with two angles and a side (AAS / ASA), or SSA.', 'a ÷ sin A = b ÷ sin B = c ÷ sin C.',
    [['A', 'Angle A', 'n', 40, '°'], ['B', 'Angle B', 'n', 60, '°'], ['a', 'Side a (opposite A)', 'n', 10]],
    function (v) { var Cc = 180 - v.A - v.B; if (Cc <= 0 || v.A <= 0 || v.B <= 0) return { error: 'The two angles must add to less than 180°.' }; var k = v.a / Math.sin(v.A * D2R), b = k * Math.sin(v.B * D2R), c = k * Math.sin(Cc * D2R);
      return { results: [M('Side b', b, 'num', { dp: 6 }), R('Side c', c, 'num', { dp: 6 }), R('Angle C', Cc, 'num', { dp: 4, u: '°' }), R('Area', 0.5 * v.a * b * Math.sin(Cc * D2R), 'num', { dp: 6 }), R('Circumradius', k / 2, 'num', { dp: 6 })] }; });
  C('law-of-cosines-calculator', 'Law of Cosines Calculator', 'geometry/triangles', 'Solve a triangle from two sides and the included angle (SAS) or three sides (SSS).', 'c² = a² + b² − 2ab cos C.',
    [['m', 'You know', 'g', 1, [[1, 'SAS (2 sides + angle)'], [2, 'SSS (3 sides)']]], ['a', 'Side a', 'n', 7], ['b', 'Side b', 'n', 9], ['C', 'Included angle C', 'n', 50, '°', { show: 'm==1' }], ['c', 'Side c', 'n', 8, '', { show: 'm==2' }]],
    function (v) { var a = v.a, b = v.b, c, Ca; if (v.m == 1) { c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(v.C * D2R)); Ca = v.C; } else { c = v.c; var x = (a * a + b * b - c * c) / (2 * a * b); if (Math.abs(x) > 1) return { error: 'These sides cannot form a triangle.' }; Ca = Math.acos(x) / D2R; }
      var Aa = Math.acos(Math.max(-1, Math.min(1, (b * b + c * c - a * a) / (2 * b * c)))) / D2R, Bb = 180 - Aa - Ca;
      return { results: [M('Side c', c, 'num', { dp: 6 }), R('Angle A', Aa, 'num', { dp: 4, u: '°' }), R('Angle B', Bb, 'num', { dp: 4, u: '°' }), R('Angle C', Ca, 'num', { dp: 4, u: '°' }), R('Area', 0.5 * a * b * Math.sin(Ca * D2R), 'num', { dp: 6 })] }; });
  F('special-right-triangle-calculator', '30-60-90 & 45-45-90 Triangle Calculator', 'geometry/triangles', 'Side lengths of the two special right triangles.', '30-60-90: x, x√3, 2x · 45-45-90: x, x, x√2.',
    [['t', 'Triangle', 'g', 1, [[1, '30-60-90'], [2, '45-45-90']]], ['x', 'Shorter side (x)', 'n', 5]],
    [O('Side opposite 30° / 45°', 'x'), O('Other leg', 'if(t==1,x*sqrt(3),x)'), O('Hypotenuse', 'if(t==1,2*x,x*sqrt(2))'), O('Area', 'x*o2/2')]);
  F('triangle-inequality-checker', 'Triangle Inequality Checker', 'geometry/triangles', 'Check whether three lengths can form a triangle.', 'The sum of any two sides must exceed the third.',
    [['a', 'Side a', 'n', 3], ['b', 'Side b', 'n', 4], ['c', 'Side c', 'n', 8]],
    [['Can form a triangle?', 'min(a+b-c,min(a+c-b,b+c-a))', 'b', '', { bands: [[0.0000001, 'No'], [Infinity, 'Yes']] }], ['Longest side', 'max(a,max(b,c))', 'n', '', { dp: 4 }], ['Shortest possible 3rd side', 'abs(a-b)', 'n', '', { dp: 4, sub: 'between |a − b| and a + b' }]]);

  /* ---------------- Solids ---------------- */
  F('cube-calculator', 'Cube Calculator', 'geometry/solids', 'Volume, surface area and diagonal of a cube.', 'V = s³ · SA = 6s² · d = s√3.',
    [['s', 'Edge length', 'n', 4]],
    [O('Volume', 's^3'), O('Surface area', '6*s^2'), O('Space diagonal', 's*sqrt(3)'), O('Face diagonal', 's*sqrt(2)')]);
  F('rectangular-prism-calculator', 'Rectangular Prism (Cuboid) Calculator', 'geometry/solids', 'Volume, surface area and diagonal of a cuboid.', 'V = lwh · SA = 2(lw + lh + wh).',
    [['l', 'Length', 'n', 6], ['w', 'Width', 'n', 4], ['h', 'Height', 'n', 3]],
    [O('Volume', 'l*w*h'), O('Surface area', '2*(l*w+l*h+w*h)'), O('Space diagonal', 'sqrt(l^2+w^2+h^2)')]);
  F('sphere-calculator', 'Sphere Calculator', 'geometry/solids', 'Volume, surface area and circumference of a sphere.', 'V = 4⁄3 π r³ · SA = 4π r².',
    [['r', 'Radius', 'n', 5]],
    [O('Volume', '4/3*pi*r^3'), O('Surface area', '4*pi*r^2'), O('Great-circle circumference', '2*pi*r'), O('Diameter', '2*r')]);
  F('hemisphere-calculator', 'Hemisphere Calculator', 'geometry/solids', 'Volume and surface area of a half sphere.', 'V = 2⁄3 π r³ · SA = 3π r².',
    [['r', 'Radius', 'n', 5]],
    [O('Volume', '2/3*pi*r^3'), O('Curved surface', '2*pi*r^2'), O('Total surface area', '3*pi*r^2'), O('Base area', 'pi*r^2')]);
  F('cylinder-calculator', 'Cylinder Calculator', 'geometry/solids', 'Volume, lateral and total surface area of a cylinder.', 'V = π r² h · SA = 2π r (r + h).',
    [['r', 'Radius', 'n', 3], ['h', 'Height', 'n', 10]],
    [O('Volume', 'pi*r^2*h'), O('Lateral surface', '2*pi*r*h'), O('Total surface area', '2*pi*r*(r+h)'), O('Base area', 'pi*r^2')], { pop: 1 });
  F('cone-calculator', 'Cone Calculator', 'geometry/solids', 'Volume, slant height and surface area of a cone.', 'V = ⅓ π r² h · SA = π r (r + l), l = √(r² + h²).',
    [['r', 'Radius', 'n', 4], ['h', 'Height', 'n', 9]],
    [O('Volume', 'pi*r^2*h/3'), O('Slant height', 'sqrt(r^2+h^2)'), O('Lateral surface', 'pi*r*o2'), O('Total surface area', 'pi*r*(r+o2)')]);
  F('pyramid-calculator', 'Pyramid Calculator', 'geometry/solids', 'Volume and surface area of a square-based pyramid.', 'V = ⅓ base area × h.',
    [['a', 'Base side', 'n', 6], ['h', 'Height', 'n', 8]],
    [O('Volume', 'a^2*h/3'), O('Slant height', 'sqrt(h^2+(a/2)^2)'), O('Lateral surface', '2*a*o2'), O('Total surface area', 'a^2+2*a*o2')]);
  F('frustum-calculator', 'Frustum (Truncated Cone) Calculator', 'geometry/solids', 'Volume and surface area of a conical frustum.', 'V = πh (R² + Rr + r²) ÷ 3.',
    [['R', 'Large radius', 'n', 6], ['r', 'Small radius', 'n', 3], ['h', 'Height', 'n', 8]],
    [O('Volume', 'pi*h*(R^2+R*r+r^2)/3'), O('Slant height', 'sqrt(h^2+(R-r)^2)'), O('Lateral surface', 'pi*(R+r)*o2'), O('Total surface area', 'o3+pi*(R^2+r^2)')]);
  F('torus-calculator', 'Torus Calculator', 'geometry/solids', 'Volume and surface area of a torus (doughnut).', 'V = 2π² R r² · SA = 4π² R r.',
    [['R', 'Major radius (centre to tube)', 'n', 10], ['r', 'Tube radius', 'n', 3]],
    [O('Volume', '2*pi^2*R*r^2'), O('Surface area', '4*pi^2*R*r')]);
  F('ellipsoid-calculator', 'Ellipsoid Calculator', 'geometry/solids', 'Volume and approximate surface area of an ellipsoid.', 'V = 4⁄3 π abc.',
    [['a', 'Semi-axis a', 'n', 6], ['b', 'Semi-axis b', 'n', 4], ['c', 'Semi-axis c', 'n', 3]],
    [O('Volume', '4/3*pi*a*b*c'), O('Surface area (approx.)', '4*pi*(((a*b)^1.6+(a*c)^1.6+(b*c)^1.6)/3)^(1/1.6)')]);
  F('capsule-calculator', 'Capsule Calculator', 'geometry/solids', 'Volume and surface area of a capsule (cylinder with hemispherical ends).', 'V = π r² (4r ÷ 3 + h).',
    [['r', 'Radius', 'n', 3], ['h', 'Cylinder length', 'n', 8]],
    [O('Volume', 'pi*r^2*(4*r/3+h)'), O('Surface area', '2*pi*r*(2*r+h)'), O('Total length', 'h+2*r')]);
  F('triangular-prism-calculator', 'Triangular Prism Calculator', 'geometry/solids', 'Volume and surface area of a triangular prism.', 'V = base triangle area × length.',
    [['b', 'Triangle base', 'n', 6], ['ht', 'Triangle height', 'n', 4], ['s', 'Triangle side', 'n', 5], ['l', 'Prism length', 'n', 12]],
    [O('Volume', 'b*ht/2*l'), O('Surface area', 'b*ht+(b+2*s)*l')]);
  F('regular-polyhedra-calculator', 'Regular Polyhedron Calculator', 'geometry/solids', 'Volume and surface area of the five Platonic solids.', 'Volume and area formulas for each solid by edge length.',
    [['t', 'Solid', 's', 1, [[1, 'Tetrahedron'], [2, 'Cube'], [3, 'Octahedron'], [4, 'Dodecahedron'], [5, 'Icosahedron']]], ['a', 'Edge length', 'n', 5]],
    [O('Volume', 'a^3*if(t==1,sqrt(2)/12,if(t==2,1,if(t==3,sqrt(2)/3,if(t==4,(15+7*sqrt(5))/4,5*(3+sqrt(5))/12))))'), O('Surface area', 'a^2*if(t==1,sqrt(3),if(t==2,6,if(t==3,2*sqrt(3),if(t==4,3*sqrt(25+10*sqrt(5)),5*sqrt(3)))))'), ['Faces', 'if(t==1,4,if(t==2,6,if(t==3,8,if(t==4,12,20))))', 'i'], ['Vertices', 'if(t==1,4,if(t==2,8,if(t==3,6,if(t==4,20,12))))', 'i']]);
  F('spherical-cap-calculator', 'Spherical Cap Calculator', 'geometry/solids', 'Volume and surface area of a spherical cap.', 'V = π h² (3R − h) ÷ 3.',
    [['R', 'Sphere radius', 'n', 10], ['h', 'Cap height', 'n', 3]],
    [O('Volume', 'pi*h^2*(3*R-h)/3'), O('Curved surface', '2*pi*R*h'), O('Base radius', 'sqrt(h*(2*R-h))')]);

  /* ---------------- Coordinate geometry ---------------- */
  F('distance-formula-calculator', 'Distance Calculator (2D & 3D)', 'geometry/coordinates', 'Distance between two points, with midpoint and slope.', 'd = √((x₂ − x₁)² + (y₂ − y₁)² + (z₂ − z₁)²).',
    [['x1', 'x₁', 'n', 1], ['y1', 'y₁', 'n', 2], ['z1', 'z₁ (3D only)', 'n', 0, '', { opt: 1 }], ['x2', 'x₂', 'n', 7], ['y2', 'y₂', 'n', 10], ['z2', 'z₂ (3D only)', 'n', 0, '', { opt: 1 }]],
    [O('Distance', 'sqrt((x2-x1)^2+(y2-y1)^2+(z2-z1)^2)'), ['Midpoint', function (v) { return '(' + N((v.x1 + v.x2) / 2, 4) + ', ' + N((v.y1 + v.y2) / 2, 4) + (v.z1 || v.z2 ? ', ' + N((v.z1 + v.z2) / 2, 4) : '') + ')'; }, 't'], ['Slope (2D)', function (v) { return v.x2 === v.x1 ? 'Vertical line' : N((v.y2 - v.y1) / (v.x2 - v.x1), 6); }, 't']], { pop: 1 });
  F('midpoint-calculator', 'Midpoint Calculator', 'geometry/coordinates', 'The midpoint between two points.', 'M = ((x₁ + x₂) ÷ 2, (y₁ + y₂) ÷ 2).',
    [['x1', 'x₁', 'n', 2], ['y1', 'y₁', 'n', 3], ['x2', 'x₂', 'n', 8], ['y2', 'y₂', 'n', 11]],
    [O('Midpoint x', '(x1+x2)/2'), O('Midpoint y', '(y1+y2)/2'), O('Distance', 'hypot(x2-x1,y2-y1)')]);
  C('line-equation-calculator', 'Equation of a Line Calculator (Two Points)', 'geometry/coordinates', 'Slope-intercept, point-slope and standard form from two points.', 'm = (y₂ − y₁) ÷ (x₂ − x₁) · y = mx + b.',
    [['x1', 'x₁', 'n', 1], ['y1', 'y₁', 'n', 2], ['x2', 'x₂', 'n', 4], ['y2', 'y₂', 'n', 8]],
    function (v) { if (v.x1 === v.x2 && v.y1 === v.y2) return { error: 'The two points must be different.' }; if (v.x1 === v.x2) return { results: [M('Equation', 'x = ' + N(v.x1, 6), 'text'), R('Slope', 'Undefined (vertical)', 'text')] };
      var m = (v.y2 - v.y1) / (v.x2 - v.x1), b = v.y1 - m * v.x1; return { results: [M('y = mx + b', 'y = ' + N(m, 6) + 'x ' + (b < 0 ? '− ' : '+ ') + N(Math.abs(b), 6), 'text'), R('Slope (m)', m, 'num', { dp: 6 }), R('y-intercept (b)', b, 'num', { dp: 6 }), R('x-intercept', m ? -b / m : 'none', m ? 'num' : 'text', { dp: 6 }), R('Angle with x-axis', Math.atan(m) / D2R, 'num', { dp: 3, u: '°' }), R('Standard form', N(-m, 6) + 'x + y = ' + N(b, 6), 'text')] }; });
  C('polygon-area-calculator', 'Polygon Area Calculator (Coordinates)', 'geometry/coordinates', 'Area and perimeter of any polygon from its vertices (shoelace formula).', 'A = ½ |Σ (xᵢ yᵢ₊₁ − xᵢ₊₁ yᵢ)|.',
    [['pts', 'Vertices (x y — one per line, in order)', 'ta', '0 0\n6 0\n6 4\n3 7\n0 4', { rows: 6 }]],
    function (v) { var p = String(v.pts).trim().split(/\n|;/).map(L).filter(function (r) { return r.length >= 2; }); if (p.length < 3) return { error: 'Enter at least 3 vertices.' }; var s = 0, per = 0; for (var i = 0; i < p.length; i++) { var a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; per += Math.hypot(b[0] - a[0], b[1] - a[1]); }
      var cx = 0, cy = 0; for (var j = 0; j < p.length; j++) { var a2 = p[j], b2 = p[(j + 1) % p.length], cr = a2[0] * b2[1] - b2[0] * a2[1]; cx += (a2[0] + b2[0]) * cr; cy += (a2[1] + b2[1]) * cr; } var A_ = s / 2;
      return { results: [M('Area', Math.abs(A_), 'num', { dp: 6 }), R('Perimeter', per, 'num', { dp: 6 }), R('Vertices', p.length, 'int'), R('Centroid', '(' + N(cx / (6 * A_), 4) + ', ' + N(cy / (6 * A_), 4) + ')', 'text')] }; });
  F('triangle-area-coordinates-calculator', 'Triangle Area from Coordinates', 'geometry/coordinates', 'Area of a triangle given the coordinates of its three vertices.', 'A = ½ |x₁(y₂ − y₃) + x₂(y₃ − y₁) + x₃(y₁ − y₂)|.',
    [['x1', 'x₁', 'n', 0], ['y1', 'y₁', 'n', 0], ['x2', 'x₂', 'n', 6], ['y2', 'y₂', 'n', 0], ['x3', 'x₃', 'n', 2], ['y3', 'y₃', 'n', 5]],
    [O('Area', 'abs(x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2))/2'), O('Perimeter', 'hypot(x2-x1,y2-y1)+hypot(x3-x2,y3-y2)+hypot(x1-x3,y1-y3)'), O('Centroid x', '(x1+x2+x3)/3'), O('Centroid y', '(y1+y2+y3)/3')]);
  F('circle-equation-calculator', 'Equation of a Circle Calculator', 'geometry/coordinates', 'Circle equation, area and circumference from centre and radius.', '(x − h)² + (y − k)² = r².',
    [['h', 'Centre x (h)', 'n', 2], ['k', 'Centre y (k)', 'n', -3], ['r', 'Radius', 'n', 5]],
    [['Equation', function (v) { return '(x ' + (v.h < 0 ? '+ ' : '− ') + Math.abs(v.h) + ')² + (y ' + (v.k < 0 ? '+ ' : '− ') + Math.abs(v.k) + ')² = ' + N(v.r * v.r, 4); }, 't'], O('Area', 'pi*r^2'), O('Circumference', '2*pi*r'), ['General form', function (v) { return 'x² + y² ' + (-2 * v.h < 0 ? '− ' : '+ ') + Math.abs(2 * v.h) + 'x ' + (-2 * v.k < 0 ? '− ' : '+ ') + Math.abs(2 * v.k) + 'y ' + ((v.h * v.h + v.k * v.k - v.r * v.r) < 0 ? '− ' : '+ ') + Math.abs(v.h * v.h + v.k * v.k - v.r * v.r) + ' = 0'; }, 't']]);
  F('polar-cartesian-converter', 'Polar ↔ Cartesian Coordinates Converter', 'geometry/coordinates', 'Convert between (x, y) and (r, θ).', 'r = √(x² + y²) · θ = atan2(y, x) · x = r cos θ · y = r sin θ.',
    [['m', 'Convert', 'g', 1, [[1, 'Cartesian → polar'], [2, 'Polar → Cartesian']]], ['a', 'x  or  r', 'n', 3], ['b', 'y  or  θ (degrees)', 'n', 4]],
    [['r  or  x', 'if(m==1,hypot(a,b),a*cos(b*pi/180))', 'n', '', { dp: 6 }], ['θ (°)  or  y', 'if(m==1,atan2(b,a)*180/pi,a*sin(b*pi/180))', 'n', '', { dp: 6 }]]);
  F('distance-between-coordinates-calculator', 'Distance Between Coordinates (Latitude / Longitude)', 'geometry/coordinates', 'Great-circle distance between two latitude/longitude points.', 'Haversine formula on a sphere of radius 6,371 km.',
    [['la1', 'Latitude 1', 'n', 28.6139, '°'], ['lo1', 'Longitude 1', 'n', 77.209, '°'], ['la2', 'Latitude 2', 'n', 51.5074, '°'], ['lo2', 'Longitude 2', 'n', -0.1278, '°']],
    [['Distance', '2*6371*asin(sqrt(sin((la2-la1)*pi/360)^2+cos(la1*pi/180)*cos(la2*pi/180)*sin((lo2-lo1)*pi/360)^2))', 'n', 'km', { dp: 1 }], ['In miles', 'o1/1.609344', 'n', 'mi', { dp: 1 }], ['In nautical miles', 'o1/1.852', 'n', 'nmi', { dp: 1 }], ['Flight time (850 km/h)', 'o1/850', 'n', 'h', { dp: 1 }]],
    { pop: 1, note: 'Straight-line (as the crow flies) distance. Roads and flight paths are longer.' });

  /* ---------------- Trigonometry ---------------- */
  var ANG = [['u', 'Angle unit', 'g', 1, [[1, 'Degrees'], [2, 'Radians']]], ['a', 'Angle', 'n', 30]];
  var RAD = 'if(u==1,a*pi/180,a)';
  F('trigonometry-calculator', 'Trigonometry Calculator (Sin, Cos, Tan)', 'geometry/trig', 'All six trig functions for any angle in degrees or radians.', 'sin, cos, tan and their reciprocals csc, sec, cot.',
    ANG,
    [['sin', 'sin(' + RAD + ')', 'n', '', { dp: 8 }], ['cos', 'cos(' + RAD + ')', 'n', '', { dp: 8 }], ['tan', 'if(abs(cos(' + RAD + '))<0.0000000001,0,tan(' + RAD + '))', 'n', '', { dp: 8 }], ['csc', 'if(abs(sin(' + RAD + '))<0.0000000001,0,1/sin(' + RAD + '))', 'n', '', { dp: 8 }], ['sec', 'if(abs(cos(' + RAD + '))<0.0000000001,0,1/cos(' + RAD + '))', 'n', '', { dp: 8 }], ['cot', 'if(abs(sin(' + RAD + '))<0.0000000001,0,cos(' + RAD + ')/sin(' + RAD + '))', 'n', '', { dp: 8 }]], { pop: 1 });
  F('sin-calculator', 'Sine Calculator (sin θ)', 'geometry/trig', 'The sine of an angle in degrees or radians.', 'sin θ = opposite ÷ hypotenuse.', ANG,
    [['sin θ', 'sin(' + RAD + ')', 'n', '', { dp: 10 }], ['cosecant (1 ÷ sin θ)', 'if(abs(sin(' + RAD + '))<0.0000000001,0,1/sin(' + RAD + '))', 'n', '', { dp: 8 }], ['The same angle in the other unit', 'if(u==1,a*pi/180,a*180/pi)', 'n', '', { dp: 8 }]], { pop: 1 });
  F('cos-calculator', 'Cosine Calculator (cos θ)', 'geometry/trig', 'The cosine of an angle in degrees or radians.', 'cos θ = adjacent ÷ hypotenuse.', ANG,
    [['cos θ', 'cos(' + RAD + ')', 'n', '', { dp: 10 }], ['secant (1 ÷ cos θ)', 'if(abs(cos(' + RAD + '))<0.0000000001,0,1/cos(' + RAD + '))', 'n', '', { dp: 8 }], ['The same angle in the other unit', 'if(u==1,a*pi/180,a*180/pi)', 'n', '', { dp: 8 }]]);
  F('tan-calculator', 'Tangent Calculator (tan θ)', 'geometry/trig', 'The tangent of an angle in degrees or radians.', 'tan θ = opposite ÷ adjacent.', ANG,
    [['tan θ', 'if(abs(cos(' + RAD + '))<0.0000000001,0,tan(' + RAD + '))', 'n', '', { dp: 10 }], ['cotangent (1 ÷ tan θ)', 'if(abs(sin(' + RAD + '))<0.0000000001,0,cos(' + RAD + ')/sin(' + RAD + '))', 'n', '', { dp: 8 }], ['The same angle in the other unit', 'if(u==1,a*pi/180,a*180/pi)', 'n', '', { dp: 8 }]]);
  F('inverse-trig-calculator', 'Inverse Trigonometry Calculator (arcsin, arccos, arctan)', 'geometry/trig', 'Find the angle from a sine, cosine or tangent value.', 'θ = sin⁻¹(x), cos⁻¹(x), tan⁻¹(x).',
    [['x', 'Value', 'n', 0.5]],
    [['arcsin (°)', 'if(abs(x)<=1,asin(x)*180/pi,0)', 'n', '°', { dp: 6 }], ['arccos (°)', 'if(abs(x)<=1,acos(x)*180/pi,0)', 'n', '°', { dp: 6 }], ['arctan (°)', 'atan(x)*180/pi', 'n', '°', { dp: 6 }], ['arcsin (rad)', 'if(abs(x)<=1,asin(x),0)', 'n', 'rad', { dp: 6 }]]);
  F('unit-circle-calculator', 'Unit Circle Calculator', 'geometry/trig', 'Coordinates, quadrant and reference angle for any angle on the unit circle.', 'Point = (cos θ, sin θ).',
    [['a', 'Angle', 'n', 150, '°']],
    [['x = cos θ', 'cos(a*pi/180)', 'n', '', { dp: 8 }], ['y = sin θ', 'sin(a*pi/180)', 'n', '', { dp: 8 }], ['Quadrant', 'mod(a,360)', 'b', '', { bands: [[90, 'I'], [180, 'II'], [270, 'III'], [360, 'IV']] }], ['Reference angle', 'min(mod(a,180),180-mod(a,180))', 'n', '°', { dp: 4 }], ['In radians', 'a*pi/180', 'n', 'rad', { dp: 8 }]]);
  F('hyperbolic-functions-calculator', 'Hyperbolic Functions Calculator', 'geometry/trig', 'sinh, cosh, tanh and their inverses.', 'sinh x = (eˣ − e⁻ˣ) ÷ 2.',
    [['x', 'x', 'n', 1]],
    [['sinh x', 'sinh(x)', 'n', '', { dp: 10 }], ['cosh x', 'cosh(x)', 'n', '', { dp: 10 }], ['tanh x', 'tanh(x)', 'n', '', { dp: 10 }], ['arsinh x', 'ln(x+sqrt(x^2+1))', 'n', '', { dp: 10 }]]);
  F('angle-of-elevation-calculator', 'Angle of Elevation & Height Calculator', 'geometry/trig', 'Find the height of an object from distance and angle, or the angle from height.', 'height = distance × tan θ (+ eye level).',
    [['d', 'Distance to the object', 'n', 50, 'm'], ['a', 'Angle of elevation', 'n', 35, '°'], ['eh', 'Your eye height', 'n', 1.6, 'm', { opt: 1 }]],
    [['Object height', 'd*tan(a*pi/180)+eh', 'n', 'm', { dp: 2 }], ['Height above eye level', 'd*tan(a*pi/180)', 'n', 'm', { dp: 2 }], ['Line-of-sight distance', 'd/cos(a*pi/180)', 'n', 'm', { dp: 2 }]]);
  F('degrees-minutes-seconds-calculator', 'Degrees ↔ Decimal Degrees (DMS) Calculator', 'geometry/trig', 'Convert between degrees-minutes-seconds and decimal degrees.', 'Decimal = D + M ÷ 60 + S ÷ 3600.',
    [['d', 'Degrees', 'n', 28], ['m', 'Minutes', 'n', 36], ['s', 'Seconds', 'n', 50]],
    [['Decimal degrees', 'sign(d)*(abs(d)+m/60+s/3600)', 'n', '°', { dp: 8 }], ['Radians', 'o1*pi/180', 'n', 'rad', { dp: 8 }]]);
})(window.CW);
