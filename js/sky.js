'use strict';

// ===================== ASTRONOMICAL CONSTANTS =====================
// Observer at Beijing latitude (39.9°N)
var SKY_LAT = 39.9 * Math.PI / 180;
var SKY_COLAT = Math.PI / 2 - SKY_LAT;
var SKY_SUN_DECL = 15 * Math.PI / 180;            // Sun declination (~late spring)
var SKY_MOON_SYNODIC = 8;                          // Moon synodic period in game days
var SKY_MOON_INCL = 5.14 * Math.PI / 180;         // Moon orbital inclination
var SKY_CELEST_R = 170;                            // Star sphere radius
var SKY_SUN_DIST = 150;                            // Sun visual distance
var SKY_MOON_DIST = 145;                           // Moon visual distance

// Hour angle at sunrise: cos(HA) = -tan(lat)*tan(decl)
var SKY_HA_RISE = Math.acos(Math.max(-1, Math.min(1, -Math.tan(SKY_LAT) * Math.tan(SKY_SUN_DECL))));

// Reusable vectors to avoid per-frame allocation
var _sunPos = new THREE.Vector3();
var _moonPos = new THREE.Vector3();
var _sunDir = new THREE.Vector3();

// ===================== COORDINATE HELPERS =====================
function skyClamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Equatorial (hour angle, declination) → horizontal (altitude, azimuth)
function eqToHoriz(ha, decl) {
  var sinAlt = Math.sin(SKY_LAT) * Math.sin(decl) + Math.cos(SKY_LAT) * Math.cos(decl) * Math.cos(ha);
  var alt = Math.asin(skyClamp(sinAlt, -1, 1));
  var cosAlt = Math.cos(alt);
  var az = 0;
  if (cosAlt > 0.0001) {
    var cosAz = skyClamp((Math.sin(decl) - Math.sin(SKY_LAT) * sinAlt) / (Math.cos(SKY_LAT) * cosAlt), -1, 1);
    az = Math.acos(cosAz);
    if (Math.sin(ha) > 0) az = 2 * Math.PI - az;
  }
  return { alt: alt, az: az };
}

// Horizontal (alt, az) → world XYZ. Convention: +x=East, +z=North, +y=Up
// Azimuth: 0=North, clockwise
function horizToXYZ(alt, az, dist) {
  return new THREE.Vector3(
    dist * Math.cos(alt) * Math.sin(az),
    dist * Math.sin(alt),
    dist * Math.cos(alt) * Math.cos(az)
  );
}

// ===================== SKY DOME =====================
function createSky() {
  var geo = new THREE.SphereGeometry(180, 16, 12);
  var mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      topColor: { value: new THREE.Color(0.4, 0.65, 0.95) },
      botColor: { value: new THREE.Color(0.82, 0.72, 0.55) },
      offset: { value: 10.0 },
      exponent: { value: 0.6 }
    },
    vertexShader: [
      'varying vec3 vPos;',
      'void main() {',
      '  vPos = position;',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 topColor;',
      'uniform vec3 botColor;',
      'uniform float offset;',
      'uniform float exponent;',
      'varying vec3 vPos;',
      'void main() {',
      '  float h = normalize(vPos + vec3(0.0, offset, 0.0)).y;',
      '  float t = pow(max(h, 0.0), exponent);',
      '  gl_FragColor = vec4(mix(botColor, topColor, t), 1.0);',
      '}'
    ].join('\n')
  });
  G.skyUni = mat.uniforms;
  G.skyDomeMesh = new THREE.Mesh(geo, mat);
  G.scene.add(G.skyDomeMesh);
}

// ===================== REAL STAR CATALOG =====================
// [RA_hours, Dec_degrees, visual_magnitude, color_index]
// Color index: 0=blue-white(B/A), 1=white(F), 2=yellow(G), 3=orange(K), 4=red(M)
var STAR_COLORS = [
  [0.75, 0.85, 1.0],   // 0 blue-white
  [1.0, 1.0, 0.97],    // 1 white
  [1.0, 0.95, 0.80],   // 2 yellow
  [1.0, 0.80, 0.55],   // 3 orange
  [1.0, 0.55, 0.35]    // 4 red
];

var STAR_CAT = [
  // ===== Ursa Major (北斗七星) =====
  [11.062, 61.75, 1.79, 3],  // 0  Dubhe α
  [11.031, 56.38, 2.37, 1],  // 1  Merak β
  [11.897, 53.69, 2.44, 1],  // 2  Phecda γ
  [12.257, 57.03, 3.31, 1],  // 3  Megrez δ
  [12.900, 55.96, 1.77, 1],  // 4  Alioth ε
  [13.399, 54.93, 2.27, 1],  // 5  Mizar ζ
  [13.792, 49.31, 1.86, 0],  // 6  Alkaid η

  // ===== Ursa Minor (小熊座) =====
  [2.530, 89.26, 1.98, 2],   // 7  Polaris α
  [14.845, 74.16, 2.08, 3],  // 8  Kochab β
  [15.345, 71.83, 3.00, 1],  // 9  Pherkad γ
  [17.537, 86.59, 4.35, 1],  // 10 δ UMi
  [16.766, 82.04, 4.23, 2],  // 11 ε UMi
  [15.734, 77.79, 4.32, 1],  // 12 ζ UMi
  [16.292, 75.76, 4.95, 1],  // 13 η UMi

  // ===== Orion (猎户座) =====
  [5.919, 7.41, 0.50, 4],    // 14 Betelgeuse α
  [5.242, -8.20, 0.13, 0],   // 15 Rigel β
  [5.419, 6.35, 1.64, 0],    // 16 Bellatrix γ
  [5.533, -0.30, 2.23, 0],   // 17 Mintaka δ (belt)
  [5.603, -1.20, 1.69, 0],   // 18 Alnilam ε (belt)
  [5.679, -1.94, 1.77, 0],   // 19 Alnitak ζ (belt)
  [5.796, -9.67, 2.09, 0],   // 20 Saiph κ

  // ===== Cassiopeia (仙后座) =====
  [0.153, 59.15, 2.27, 1],   // 21 Caph β
  [0.675, 56.54, 2.23, 3],   // 22 Schedar α
  [0.945, 60.72, 2.47, 0],   // 23 γ Cas
  [1.430, 60.24, 2.68, 1],   // 24 Ruchbah δ
  [1.907, 63.67, 3.38, 0],   // 25 Segin ε

  // ===== Cygnus (天鹅座) =====
  [20.691, 45.28, 1.25, 1],  // 26 Deneb α
  [19.512, 27.96, 3.08, 3],  // 27 Albireo β
  [20.370, 40.26, 2.20, 2],  // 28 Sadr γ
  [20.770, 33.97, 2.48, 3],  // 29 ε Cyg
  [19.750, 45.13, 2.87, 0],  // 30 δ Cyg

  // ===== Leo (狮子座) =====
  [10.139, 11.97, 1.35, 0],  // 31 Regulus α
  [11.818, 14.57, 2.14, 1],  // 32 Denebola β
  [10.333, 19.84, 2.08, 3],  // 33 Algieba γ
  [11.235, 20.52, 2.56, 1],  // 34 Zosma δ
  [9.764, 23.77, 2.98, 2],   // 35 ε Leo
  [10.122, 16.76, 3.52, 1],  // 36 η Leo

  // ===== Gemini (双子座) =====
  [7.755, 28.03, 1.14, 3],   // 37 Pollux β
  [7.577, 31.89, 1.58, 1],   // 38 Castor α
  [6.629, 16.40, 1.93, 1],   // 39 Alhena γ
  [6.383, 22.51, 2.88, 4],   // 40 Tejat μ
  [6.732, 25.13, 2.98, 2],   // 41 Mebsuta ε
  [7.335, 21.98, 3.53, 1],   // 42 Wasat δ

  // ===== Taurus (金牛座) =====
  [4.599, 16.51, 0.85, 3],   // 43 Aldebaran α
  [5.438, 28.61, 1.65, 0],   // 44 Elnath β
  [5.627, 21.14, 3.00, 0],   // 45 ζ Tau
  [3.791, 24.11, 2.87, 0],   // 46 Alcyone (Pleiades)
  [4.330, 15.63, 3.53, 3],   // 47 θ2 Tau (Hyades)
  [4.477, 19.18, 3.65, 3],   // 48 ε Tau

  // ===== Scorpius (天蝎座) =====
  [16.490, -26.43, 0.96, 4], // 49 Antares α
  [16.005, -22.62, 2.32, 0], // 50 Dschubba δ
  [16.091, -19.81, 2.62, 0], // 51 Graffias β
  [16.353, -25.59, 2.89, 0], // 52 σ Sco
  [16.836, -34.29, 2.29, 3], // 53 ε Sco
  [17.560, -37.10, 1.63, 0], // 54 Shaula λ

  // ===== Lyra (天琴座) =====
  [18.616, 38.78, 0.03, 1],  // 55 Vega α
  [18.835, 33.36, 3.45, 0],  // 56 Sheliak β
  [18.982, 32.69, 3.24, 0],  // 57 Sulafat γ

  // ===== Aquila (天鹰座) =====
  [19.846, 8.87, 0.77, 1],   // 58 Altair α
  [19.771, 10.61, 2.72, 3],  // 59 Tarazed γ
  [19.922, 6.41, 3.71, 2],   // 60 Alshain β

  // ===== Bootes (牧夫座) =====
  [14.261, 19.18, -0.05, 3], // 61 Arcturus α
  [14.750, 27.07, 2.70, 3],  // 62 Izar ε
  [13.912, 18.40, 2.68, 2],  // 63 Muphrid η
  [14.535, 38.31, 3.03, 1],  // 64 Seginus γ
  [15.258, 33.31, 3.47, 2],  // 65 δ Boo

  // ===== Pegasus (飞马座 Great Square) =====
  [23.079, 15.21, 2.49, 0],  // 66 Markab α
  [23.063, 28.08, 2.42, 4],  // 67 Scheat β
  [0.220, 15.18, 2.84, 0],   // 68 Algenib γ

  // ===== Andromeda (仙女座) =====
  [0.140, 29.09, 2.06, 0],   // 69 Alpheratz α
  [1.162, 35.62, 2.06, 4],   // 70 Mirach β
  [2.065, 42.33, 2.17, 3],   // 71 Almach γ

  // ===== Draco (天龙座) =====
  [17.943, 51.49, 2.23, 3],  // 72 Eltanin γ
  [17.507, 52.30, 2.79, 2],  // 73 Rastaban β
  [16.400, 61.51, 2.74, 2],  // 74 η Dra
  [14.073, 64.38, 3.65, 1],  // 75 Thuban α
  [17.147, 65.71, 3.17, 0],  // 76 ζ Dra
  [15.415, 58.97, 3.29, 2],  // 77 χ Dra
  [12.558, 69.79, 3.83, 1],  // 78 κ Dra

  // ===== Individual bright stars =====
  [6.752, -16.72, -1.46, 1], // 79 Sirius α CMa
  [7.655, 5.22, 0.34, 2],    // 80 Procyon α CMi
  [5.278, 45.99, 0.08, 2],   // 81 Capella α Aur
  [13.420, -11.16, 0.97, 0], // 82 Spica α Vir
  [15.578, 26.71, 2.23, 1],  // 83 Alphecca α CrB
  [22.961, -29.62, 1.16, 1], // 84 Fomalhaut α PsA
  [3.405, 49.86, 1.79, 2],   // 85 Mirfak α Per
  [3.136, 40.96, 2.12, 0],   // 86 Algol β Per
  [5.995, 44.95, 2.69, 1],   // 87 Menkalinan β Aur
  [6.378, -17.96, 1.50, 0],  // 88 Mirzam β CMa
  [4.950, -5.91, 3.69, 0],   // 89 Orion Nebula region (θ1 Ori)
  [22.717, -0.32, 2.39, 2],  // 90 Sadalsuud β Aqr
  [1.628, -10.18, 2.04, 0],  // 91 Diphda β Cet
];

// Constellation line pairs (indices into STAR_CAT)
var CONST_LINES = [
  // Ursa Major (Big Dipper) — bowl + handle
  [0,1], [1,2], [2,3], [3,0], [3,4], [4,5], [5,6],
  // Ursa Minor (Little Dipper) — bowl + handle to Polaris
  [8,9], [9,13], [13,12], [12,8], [12,11], [11,10], [10,7],
  // Orion — shoulders, belt, feet
  [14,16], [14,19], [16,17], [17,18], [18,19], [19,20], [20,15], [15,17],
  // Cassiopeia (W)
  [21,22], [22,23], [23,24], [24,25],
  // Cygnus (Northern Cross)
  [26,28], [28,27], [30,28], [28,29],
  // Leo — sickle + triangle
  [35,33], [33,36], [36,31], [31,32], [32,34], [34,33],
  // Gemini
  [38,41], [41,40], [37,42], [42,39], [38,37],
  // Taurus (V from Aldebaran)
  [48,43], [43,47], [44,45],
  // Scorpius (hook)
  [51,50], [50,52], [52,49], [49,53], [53,54],
  // Lyra (triangle)
  [55,56], [56,57], [57,55],
  // Aquila
  [59,58], [58,60],
  // Bootes (kite)
  [61,62], [62,64], [64,65], [65,61], [61,63],
  // Great Square of Pegasus + Andromeda
  [66,67], [67,69], [69,68], [68,66], [69,70], [70,71],
  // Draco (winding)
  [72,73], [73,76], [76,74], [74,77], [77,75], [75,78],
  // Summer Triangle (Vega-Deneb-Altair)
  [55,26], [26,58], [58,55],
];

// ===================== STARS (Real catalog + background) =====================
function createStars() {
  var R = SKY_CELEST_R;
  var N_CAT = STAR_CAT.length;
  var N_BG = 800;
  var N_MW = 300;
  var N = N_CAT + N_BG + N_MW;

  var pos = new Float32Array(N * 3);
  var col = new Float32Array(N * 3);
  var siz = new Float32Array(N);

  // --- Catalog stars at real celestial positions ---
  for (var i = 0; i < N_CAT; i++) {
    var s = STAR_CAT[i];
    var ra = s[0] * Math.PI / 12;
    var dec = s[1] * Math.PI / 180;
    pos[i * 3]     = R * Math.cos(dec) * Math.cos(ra);
    pos[i * 3 + 1] = R * Math.sin(dec);
    pos[i * 3 + 2] = R * Math.cos(dec) * Math.sin(ra);

    // Magnitude → point size (brighter = bigger)
    siz[i] = Math.max(1.0, 4.0 - s[2] * 0.8);

    var c = STAR_COLORS[s[3]];
    col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
  }

  // --- Random dim background stars ---
  for (var i = N_CAT; i < N_CAT + N_BG; i++) {
    var phi = Math.random() * 2 * Math.PI;
    var cosTheta = Math.random() * 2 - 1;
    var sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
    pos[i * 3]     = R * sinTheta * Math.cos(phi);
    pos[i * 3 + 1] = R * cosTheta;
    pos[i * 3 + 2] = R * sinTheta * Math.sin(phi);

    siz[i] = 0.3 + Math.pow(Math.random(), 4) * 1.0;

    var temp = Math.random();
    if (temp < 0.12) {
      col[i*3] = 1.0; col[i*3+1] = 0.80; col[i*3+2] = 0.60;
    } else if (temp < 0.24) {
      col[i*3] = 0.70; col[i*3+1] = 0.82; col[i*3+2] = 1.0;
    } else {
      col[i*3] = 1.0; col[i*3+1] = 1.0; col[i*3+2] = 0.97;
    }
  }

  // --- Milky Way band ---
  var galIncl = 62.87 * Math.PI / 180;
  var galNode = 282.86 * Math.PI / 180;

  for (var i = N_CAT + N_BG; i < N; i++) {
    var glon = Math.random() * 2 * Math.PI;
    var glat = (Math.random() - 0.5) * 0.35;
    var cx2 = Math.cos(glat) * Math.cos(glon);
    var cy2 = Math.sin(glat);
    var cz2 = Math.cos(glat) * Math.sin(glon);
    var ry = cy2 * Math.cos(galIncl) - cz2 * Math.sin(galIncl);
    var rz = cy2 * Math.sin(galIncl) + cz2 * Math.cos(galIncl);
    var fx = cx2 * Math.cos(galNode) + rz * Math.sin(galNode);
    var fz = -cx2 * Math.sin(galNode) + rz * Math.cos(galNode);
    pos[i * 3]     = fx * R;
    pos[i * 3 + 1] = ry * R;
    pos[i * 3 + 2] = fz * R;
    siz[i] = 0.2 + Math.random() * 0.5;
    col[i*3] = 0.92; col[i*3+1] = 0.92; col[i*3+2] = 0.97;
  }

  // --- Star points geometry & shader ---
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(siz, 1));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));

  var starMat = new THREE.ShaderMaterial({
    uniforms: {
      uOpacity: { value: 0.0 },
      uScale: { value: Math.min(window.devicePixelRatio, 2) * 1.5 }
    },
    vertexShader: [
      'attribute float aSize;',
      'attribute vec3 aColor;',
      'varying vec3 vColor;',
      'varying float vWorldY;',
      'uniform float uScale;',
      'void main() {',
      '  vColor = aColor;',
      '  vec4 worldPos = modelMatrix * vec4(position, 1.0);',
      '  vWorldY = worldPos.y;',
      '  gl_PointSize = aSize * uScale;',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform float uOpacity;',
      'varying vec3 vColor;',
      'varying float vWorldY;',
      'void main() {',
      '  float d = length(gl_PointCoord - vec2(0.5));',
      '  if (d > 0.5) discard;',
      '  float glow = smoothstep(0.5, 0.05, d);',
      '  float horizFade = smoothstep(-3.0, 8.0, vWorldY);',
      '  gl_FragColor = vec4(vColor, uOpacity * glow * horizFade);',
      '}'
    ].join('\n'),
    transparent: true,
    depthWrite: false,
    fog: false
  });

  G.starsMesh = new THREE.Points(geo, starMat);

  // Wrap in group for celestial pole rotation
  G.starsGroup = new THREE.Group();
  G.starsGroup.add(G.starsMesh);
  G.scene.add(G.starsGroup);

  // Pre-compute tilt quaternion (co-latitude rotation around X-axis)
  G._skyTiltQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), SKY_COLAT);
  G._skySpinQ = new THREE.Quaternion();
}

// ===================== SUN & MOON =====================
function createCelestial() {
  // Sun — simple emissive sphere
  var sunGeo = new THREE.SphereGeometry(4, 8, 8);
  var sunMat = new THREE.MeshBasicMaterial({ color: 0xFFDD44, fog: false });
  G.sunMesh = new THREE.Mesh(sunGeo, sunMat);
  G.scene.add(G.sunMesh);

  // Moon — shader with sun-dependent illumination for phases
  var moonGeo = new THREE.SphereGeometry(2.5, 16, 12);
  var moonMat = new THREE.ShaderMaterial({
    uniforms: {
      uSunDir: { value: new THREE.Vector3(1, 0, 0) }
    },
    vertexShader: [
      'varying vec3 vWorldNormal;',
      'void main() {',
      '  vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);',
      '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uSunDir;',
      'varying vec3 vWorldNormal;',
      'void main() {',
      '  float illum = dot(normalize(vWorldNormal), normalize(uSunDir));',
      '  float lit = smoothstep(-0.04, 0.04, illum);',
      '  vec3 dark = vec3(0.04, 0.04, 0.06);',
      '  vec3 bright = vec3(0.82, 0.82, 0.88);',
      '  gl_FragColor = vec4(mix(dark, bright, lit), 1.0);',
      '}'
    ].join('\n'),
    fog: false
  });
  G.moonMesh = new THREE.Mesh(moonGeo, moonMat);
  G.scene.add(G.moonMesh);
}

// ===================== LIGHTING =====================
function setupLights() {
  G.sunLight = new THREE.DirectionalLight(0xffeedd, 0.8);
  G.sunLight.position.set(50, 80, 30);
  G.scene.add(G.sunLight);

  G.ambLight = new THREE.AmbientLight(0x6688aa, 0.35);
  G.scene.add(G.ambLight);

  // Moonlight — cool blue, intensity varies with phase & altitude
  G.moonLight = new THREE.DirectionalLight(0x8899bb, 0);
  G.scene.add(G.moonLight);
}

// ===================== DAY / NIGHT CYCLE =====================
function updateDayNight(elapsed) {
  var phase = (elapsed % G.CYCLE) / G.CYCLE;

  // Day/night cycle count (evidence for claims #8, #9)
  if (G.notebook) {
    var cycle = Math.floor(elapsed / G.CYCLE);
    if (cycle > (G.notebook.lastCycleMark || 0)) {
      G.notebook.dayNightCycles = cycle;
      G.notebook.lastCycleMark = cycle;
    }
    G._skyIsNight = phase > 0.5;
  }

  // ================================================================
  // SUN — realistic path at 39.9°N, declination 15° (late spring)
  // ================================================================
  var sunHA = phase * 2 * Math.PI - SKY_HA_RISE;
  var sunHoriz = eqToHoriz(sunHA, SKY_SUN_DECL);
  _sunPos.set(
    SKY_SUN_DIST * Math.cos(sunHoriz.alt) * Math.sin(sunHoriz.az),
    SKY_SUN_DIST * Math.sin(sunHoriz.alt),
    SKY_SUN_DIST * Math.cos(sunHoriz.alt) * Math.cos(sunHoriz.az)
  );
  var sunH = Math.sin(sunHoriz.alt);

  // Center all sky objects on camera so sky dome edge is never visible
  var cx = G.cam.position.x, cz = G.cam.position.z;

  G.skyDomeMesh.position.set(cx, 0, cz);

  G.sunLight.position.set(_sunPos.x + cx, _sunPos.y, _sunPos.z + cz);
  G.sunMesh.position.set(_sunPos.x + cx, _sunPos.y, _sunPos.z + cz);
  G.sunMesh.visible = sunHoriz.alt > -0.05;

  // ================================================================
  // MOON — separate orbit, synodic period = 8 game days
  // ================================================================
  var elongation = (elapsed / (SKY_MOON_SYNODIC * G.CYCLE)) * 2 * Math.PI;
  var moonHA = sunHA - elongation;
  var moonDecl = SKY_SUN_DECL + SKY_MOON_INCL * Math.sin(elongation);
  var moonHoriz = eqToHoriz(moonHA, moonDecl);
  _moonPos.set(
    SKY_MOON_DIST * Math.cos(moonHoriz.alt) * Math.sin(moonHoriz.az),
    SKY_MOON_DIST * Math.sin(moonHoriz.alt),
    SKY_MOON_DIST * Math.cos(moonHoriz.alt) * Math.cos(moonHoriz.az)
  );

  G.moonMesh.position.set(_moonPos.x + cx, _moonPos.y, _moonPos.z + cz);
  G.moonMesh.visible = moonHoriz.alt > -0.1;

  // Moon phase shader: sun direction from moon's perspective
  _sunDir.subVectors(_sunPos, _moonPos).normalize();
  G.moonMesh.material.uniforms.uSunDir.value.copy(_sunDir);

  // ================================================================
  // MOONLIGHT — intensity from phase and altitude
  // ================================================================
  var moonPhase = (1 - Math.cos(elongation)) / 2;
  var moonAltFactor = skyClamp(Math.sin(moonHoriz.alt), 0, 1);
  G.moonLight.intensity = moonPhase * moonAltFactor * 0.3;
  G.moonLight.position.set(_moonPos.x + cx, _moonPos.y, _moonPos.z + cz);

  // ================================================================
  // DAY / NIGHT FACTORS
  // ================================================================
  var day = smoothstep(-0.15, 0.3, sunH);
  var sunset = Math.exp(-Math.pow(sunH * 5, 2)) * (sunH > -0.3 ? 1 : 0);

  // Sun light intensity & color
  G.sunLight.intensity = day * 0.7 + 0.08;
  G.ambLight.intensity = day * 0.3 + 0.12;
  G.sunLight.color.setHSL(0.08 + day * 0.04, 0.25 + sunset * 0.5, 0.7 + day * 0.25);
  G.sunMesh.material.color.setHSL(0.12, 0.9 - day * 0.5, 0.6 + day * 0.3);

  // ================================================================
  // SKY COLORS
  // ================================================================
  var dayT = [0.40, 0.65, 0.95], dayB = [0.82, 0.72, 0.55];
  var nightT = [0.01, 0.01, 0.06], nightB = [0.03, 0.03, 0.10];
  var ssetT = [0.55, 0.25, 0.45], ssetB = [0.95, 0.55, 0.30];

  function lerp3(a, b, t) { return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t]; }

  var top = lerp3(nightT, dayT, day);
  var bot = lerp3(nightB, dayB, day);
  top = lerp3(top, ssetT, sunset * 0.5);
  bot = lerp3(bot, ssetB, sunset * 0.7);

  G.skyUni.topColor.value.setRGB(top[0], top[1], top[2]);
  G.skyUni.botColor.value.setRGB(bot[0], bot[1], bot[2]);
  G.scene.fog.color.setRGB(bot[0], bot[1], bot[2]);
  G.ren.setClearColor(G.scene.fog.color);

  // ================================================================
  // STARS & CONSTELLATION LINES — fade with daylight
  // ================================================================
  var starOp = Math.max(0, (1 - day) * 1.2 - 0.1);
  G.starsMesh.material.uniforms.uOpacity.value = starOp;

  // Sidereal rotation: stars rotate once per game day around the celestial pole
  var siderealAngle = phase * 2 * Math.PI;
  G._skySpinQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), siderealAngle);
  G.starsGroup.quaternion.multiplyQuaternions(G._skyTiltQ, G._skySpinQ);
  G.starsGroup.position.set(cx, 0, cz);
}
