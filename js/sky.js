'use strict';

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
  G.scene.add(new THREE.Mesh(geo, mat));
}

// ===================== STARS =====================
function createStars() {
  var n = 600;
  var pos = new Float32Array(n * 3);
  for (var i = 0; i < n; i++) {
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(0.2 + Math.random() * 0.8);
    var r = 170;
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.cos(phi);
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, fog: false, transparent: true, opacity: 0 });
  G.starsMesh = new THREE.Points(geo, mat);
  G.scene.add(G.starsMesh);
}

// ===================== SUN & MOON =====================
function createCelestial() {
  var sunGeo = new THREE.SphereGeometry(4, 8, 8);
  var sunMat = new THREE.MeshBasicMaterial({ color: 0xFFDD44, fog: false });
  G.sunMesh = new THREE.Mesh(sunGeo, sunMat);
  G.scene.add(G.sunMesh);

  var moonGeo = new THREE.SphereGeometry(2.5, 8, 8);
  var moonMat = new THREE.MeshBasicMaterial({ color: 0xCCCCDD, fog: false });
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
}

// ===================== DAY / NIGHT CYCLE =====================
function updateDayNight(elapsed) {
  var phase = (elapsed % G.CYCLE) / G.CYCLE;
  var angle = phase * Math.PI * 2;
  var sunH = Math.sin(angle);
  var sunDist = 150;

  // Sun position
  G.sunLight.position.set(Math.cos(angle) * sunDist, Math.max(sunH * sunDist, 5), 30);

  // Day/sunset factors
  var day = smoothstep(-0.15, 0.3, sunH);
  var sunset = Math.exp(-Math.pow(sunH * 5, 2)) * (sunH > -0.3 ? 1 : 0);

  // Light intensity
  G.sunLight.intensity = day * 0.7 + 0.08;
  G.ambLight.intensity = day * 0.3 + 0.12;

  // Sun color
  G.sunLight.color.setHSL(0.08 + day * 0.04, 0.25 + sunset * 0.5, 0.7 + day * 0.25);

  // Sky colors
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

  // Stars
  G.starsMesh.material.opacity = Math.max(0, (1 - day) * 1.2 - 0.1);
  G.starsMesh.rotation.z = angle;

  // Sun mesh
  G.sunMesh.position.set(Math.cos(angle) * sunDist, sunH * sunDist, 30);
  G.sunMesh.visible = sunH > -0.05;
  G.sunMesh.material.color.setHSL(0.12, 0.9 - day * 0.5, 0.6 + day * 0.3);

  // Moon mesh
  G.moonMesh.position.set(-Math.cos(angle) * sunDist, -sunH * sunDist, -30);
  G.moonMesh.visible = sunH < 0.15;
}
