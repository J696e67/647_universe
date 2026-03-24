'use strict';

// ===================== ASTRONOMICAL CONSTANTS =====================
// Observer at 60°N latitude
var SKY_LAT = 60 * Math.PI / 180;
var SKY_COLAT = Math.PI / 2 - SKY_LAT;           // 30° co-latitude
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

// ===================== STARS (Full celestial sphere, 60°N) =====================
function createStars() {
  var N_BASE = 1200;   // Uniform across full sphere
  var N_MW = 400;       // Extra density for Milky Way band
  var N = N_BASE + N_MW;
  var R = SKY_CELEST_R;

  var pos = new Float32Array(N * 3);
  var col = new Float32Array(N * 3);
  var siz = new Float32Array(N);

  // --- Uniform distribution on full celestial sphere ---
  for (var i = 0; i < N_BASE; i++) {
    var phi = Math.random() * 2 * Math.PI;
    var cosTheta = Math.random() * 2 - 1;
    var sinTheta = Math.sqrt(1 - cosTheta * cosTheta);
    // Celestial coords: Y = toward North Celestial Pole
    pos[i * 3]     = R * sinTheta * Math.cos(phi);
    pos[i * 3 + 1] = R * cosTheta;
    pos[i * 3 + 2] = R * sinTheta * Math.sin(phi);

    // Brightness: power-law distribution (many dim, few bright)
    siz[i] = 0.4 + Math.pow(Math.random(), 3) * 1.8;

    // Star color temperature variety
    var temp = Math.random();
    if (temp < 0.12) {
      // Warm (K/M type, orange-red)
      col[i * 3] = 1.0; col[i * 3 + 1] = 0.80; col[i * 3 + 2] = 0.60;
    } else if (temp < 0.24) {
      // Cool (B/A type, blue-white)
      col[i * 3] = 0.70; col[i * 3 + 1] = 0.82; col[i * 3 + 2] = 1.0;
    } else {
      // White (F/G type)
      col[i * 3] = 1.0; col[i * 3 + 1] = 1.0; col[i * 3 + 2] = 0.97;
    }
  }

  // --- Milky Way band (galactic plane approximation) ---
  // Galactic plane inclined ~63° to celestial equator, ascending node at RA ~283°
  var galIncl = 62.87 * Math.PI / 180;
  var galNode = 282.86 * Math.PI / 180;

  for (var i = N_BASE; i < N; i++) {
    // Generate near the galactic equator (narrow band in galactic latitude)
    var glon = Math.random() * 2 * Math.PI;
    var glat = (Math.random() - 0.5) * 0.35;  // ±10° band
    var cx = Math.cos(glat) * Math.cos(glon);
    var cy = Math.sin(glat);
    var cz = Math.cos(glat) * Math.sin(glon);

    // Rotate by galactic inclination around X-axis
    var ry = cy * Math.cos(galIncl) - cz * Math.sin(galIncl);
    var rz = cy * Math.sin(galIncl) + cz * Math.cos(galIncl);

    // Rotate by ascending node around Y-axis
    var fx = cx * Math.cos(galNode) + rz * Math.sin(galNode);
    var fz = -cx * Math.sin(galNode) + rz * Math.cos(galNode);

    pos[i * 3]     = fx * R;
    pos[i * 3 + 1] = ry * R;
    pos[i * 3 + 2] = fz * R;

    siz[i] = 0.2 + Math.random() * 0.5;
    col[i * 3] = 0.92; col[i * 3 + 1] = 0.92; col[i * 3 + 2] = 0.97;
  }

  // --- Geometry & Shader ---
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

  // ================================================================
  // SUN — realistic path at 60°N, declination 15° (late spring)
  // ================================================================
  var sunHA = phase * 2 * Math.PI - SKY_HA_RISE;
  var sunHoriz = eqToHoriz(sunHA, SKY_SUN_DECL);
  _sunPos.set(
    SKY_SUN_DIST * Math.cos(sunHoriz.alt) * Math.sin(sunHoriz.az),
    SKY_SUN_DIST * Math.sin(sunHoriz.alt),
    SKY_SUN_DIST * Math.cos(sunHoriz.alt) * Math.cos(sunHoriz.az)
  );
  var sunH = Math.sin(sunHoriz.alt);  // normalized sun height [-1, 1]

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

  // Moon phase shader: sun direction from moon's perspective (relative vectors, offset cancels)
  _sunDir.subVectors(_sunPos, _moonPos).normalize();
  G.moonMesh.material.uniforms.uSunDir.value.copy(_sunDir);

  // ================================================================
  // MOONLIGHT — intensity from phase and altitude
  // ================================================================
  var moonPhase = (1 - Math.cos(elongation)) / 2;  // 0=new, 1=full
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
  // STARS — fade with daylight, rotate around celestial pole
  // ================================================================
  G.starsMesh.material.uniforms.uOpacity.value = Math.max(0, (1 - day) * 1.2 - 0.1);

  // Sidereal rotation: stars rotate once per game day around the celestial pole
  // Celestial pole at 60° altitude toward north (after tilt)
  var siderealAngle = phase * 2 * Math.PI;
  G._skySpinQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), siderealAngle);
  G.starsGroup.quaternion.multiplyQuaternions(G._skyTiltQ, G._skySpinQ);
  G.starsGroup.position.set(cx, 0, cz);
}
