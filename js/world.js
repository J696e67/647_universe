'use strict';

var TSIZE = 400, TSEG = 150;
var N_WHEAT = 2000, N_TREE = 18;

// ===================== TERRAIN HEIGHT =====================
function baseH(x, z) {
  var s = Math.PI * 2 / G.W;
  return 1.8 * Math.sin(s * x + 0.3) * Math.cos(s * z + 0.7)
       + 1.0 * Math.sin(2 * s * x + 1.1)
       + 0.7 * Math.cos(2 * s * z + 0.4)
       + 0.4 * Math.sin(3 * s * x + 2) * Math.cos(2 * s * z)
       + 0.2 * Math.cos(4 * s * x) * Math.sin(3 * s * z + 1);
}

function tH(x, z) {
  var h = baseH(x, z);
  // Stream depression
  var sd = ((x - G.STR_X) % G.W + G.W) % G.W;
  if (sd > G.HW) sd = G.W - sd;
  if (sd < 5) { var t = sd / 5; h = h * t * t + (-0.6) * (1 - t * t); }
  // Flatten around house
  var hx = x - G.HSE_X; hx -= G.W * Math.round(hx / G.W);
  var hz = z - G.HSE_Z; hz -= G.W * Math.round(hz / G.W);
  var hd = Math.sqrt(hx * hx + hz * hz);
  if (hd < 7) { var t2 = hd / 7; h = h * t2 * t2 + 0.3 * (1 - t2 * t2); }
  // Flatten around entrance
  var ex = x; ex -= G.W * Math.round(ex / G.W);
  var ez = z; ez -= G.W * Math.round(ez / G.W);
  var ed = Math.sqrt(ex * ex + ez * ez);
  if (ed < 5) { var t3 = ed / 5; h = h * t3 * t3; }
  return h;
}

function groundH(x, z) { return Math.max(tH(x, z), G.WATER_Y); }

// ===================== TERRAIN MESH =====================
function createTerrain() {
  var geo = new THREE.PlaneGeometry(TSIZE, TSIZE, TSEG, TSEG);
  geo.rotateX(-Math.PI / 2);
  var pos = geo.attributes.position.array;
  var n = pos.length / 3;
  var col = new Float32Array(n * 3);
  for (var i = 0; i < n; i++) {
    var x = pos[i*3], z = pos[i*3+2];
    pos[i*3+1] = tH(x, z);
    var hn = (pos[i*3+1] + 3) / 7;
    var r = 0.28 + hn * 0.12, g = 0.38 + hn * 0.15, b = 0.15 + hn * 0.05;
    var sd = ((x - G.STR_X) % G.W + G.W) % G.W;
    if (sd > G.HW) sd = G.W - sd;
    if (sd < 6) { var t = sd / 6; r = r*t+0.12*(1-t); g = g*t+0.28*(1-t); b = b*t+0.18*(1-t); }
    col[i*3] = r; col[i*3+1] = g; col[i*3+2] = b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  G.scene.add(new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true })));
}

// ===================== WHEAT FIELD =====================
function createWheat() {
  var geo = new THREE.PlaneGeometry(0.04, 0.7, 1, 3);
  geo.translate(0, 0.35, 0);
  var mat = new THREE.MeshLambertMaterial({ color: 0xDAA520, side: THREE.DoubleSide });
  G.wheatMesh = new THREE.InstancedMesh(geo, mat, N_WHEAT);
  var placed = 0;
  while (placed < N_WHEAT) {
    var x = -60 + Math.random() * 75;
    var z = -45 + Math.random() * 90;
    var dx = x - G.HSE_X, dz = z - G.HSE_Z;
    if (Math.sqrt(dx*dx+dz*dz) < 9) continue;
    if (Math.sqrt(x*x+z*z) < 5) continue;
    var sd = ((x - G.STR_X) % G.W + G.W) % G.W;
    if (sd > G.HW) sd = G.W - sd;
    if (sd < 4) continue;
    var y = tH(x, z);
    if (y < G.WATER_Y + 0.1) continue;
    var d = { x: x, y: y, z: z, ry: Math.random() * Math.PI, sy: 0.7 + Math.random() * 0.6 };
    G.wheatData.push(d);
    G.dummy.position.set(x, y, z);
    G.dummy.rotation.set(0, d.ry, 0);
    G.dummy.scale.set(1, d.sy, 1);
    G.dummy.updateMatrix();
    G.wheatMesh.setMatrixAt(placed, G.dummy.matrix);
    placed++;
  }
  G.wheatMesh.instanceMatrix.needsUpdate = true;
  G.scene.add(G.wheatMesh);
}

function updateWheat(t) {
  for (var i = 0; i < G.wheatData.length; i++) {
    var d = G.wheatData[i];
    var sway = Math.sin(t*1.5+d.x*0.3+d.z*0.5)*0.08 + Math.sin(t*0.8+d.x*0.7)*0.04;
    G.dummy.position.set(d.x, d.y, d.z);
    G.dummy.rotation.set(0, d.ry, sway);
    G.dummy.scale.set(1, d.sy, 1);
    G.dummy.updateMatrix();
    G.wheatMesh.setMatrixAt(i, G.dummy.matrix);
  }
  G.wheatMesh.instanceMatrix.needsUpdate = true;
}

// ===================== TREES =====================
function createTrees() {
  var trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 2.5, 6);
  trunkGeo.translate(0, 1.25, 0);
  var trunkMat = new THREE.MeshLambertMaterial({ color: 0x5C3A1E });
  var leafGeo = new THREE.SphereGeometry(1.3, 6, 5);
  leafGeo.translate(0, 3.2, 0);
  var leafMat = new THREE.MeshLambertMaterial({ color: 0x2D5A1E });
  var coneGeo = new THREE.ConeGeometry(1.2, 2.5, 6);
  coneGeo.translate(0, 3.8, 0);
  var coneMat = new THREE.MeshLambertMaterial({ color: 0x1E4A0E });

  for (var i = 0; i < N_TREE; i++) {
    var x, z, attempts = 0;
    do {
      x = -65 + Math.random() * 130; z = -65 + Math.random() * 130; attempts++;
      if (attempts > 100) break;
    } while (
      Math.sqrt((x-G.HSE_X)*(x-G.HSE_X)+(z-G.HSE_Z)*(z-G.HSE_Z)) < 10 ||
      (function(){ var s=((x-G.STR_X)%G.W+G.W)%G.W; if(s>G.HW) s=G.W-s; return s<5; })()
    );
    var y = tH(x, z);
    if (y < G.WATER_Y + 0.2) continue;
    var scale = 0.7 + Math.random() * 0.5;
    var trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(x, y, z); trunk.scale.set(scale, scale, scale);
    G.scene.add(trunk);
    if (i % 3 === 0) {
      var c = new THREE.Mesh(coneGeo, coneMat);
      c.position.set(x, y, z); c.scale.set(scale, scale*(0.8+Math.random()*0.4), scale);
      G.scene.add(c);
    } else {
      var l = new THREE.Mesh(leafGeo, leafMat);
      l.position.set(x, y, z); l.scale.set(scale*(0.8+Math.random()*0.4), scale, scale*(0.8+Math.random()*0.4));
      G.scene.add(l);
    }
  }
}

// ===================== STREAM =====================
function createStream() {
  var waterW = 5, waterL = G.W + 40;
  var mat = new THREE.MeshBasicMaterial({ color: 0x4499AA, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
  var geo1 = new THREE.PlaneGeometry(waterW, waterL, 4, 40);
  geo1.rotateX(-Math.PI / 2);
  var w1 = new THREE.Mesh(geo1, mat);
  w1.position.set(G.STR_X, G.WATER_Y, 0);
  G.scene.add(w1);
  var geo2 = new THREE.PlaneGeometry(waterW, waterL, 4, 40);
  geo2.rotateX(-Math.PI / 2);
  var w2 = new THREE.Mesh(geo2, mat.clone());
  w2.position.set(G.STR_X - G.W, G.WATER_Y, 0);
  G.scene.add(w2);
  G.waterGeo1 = geo1; G.waterGeo2 = geo2;
}

function updateWater(t) {
  function ripple(geo) {
    var pos = geo.attributes.position.array;
    for (var i = 0; i < pos.length; i += 3) {
      pos[i+1] = Math.sin(t*2+pos[i+2]*0.15)*0.04 + Math.sin(t*3.5+pos[i]*1.5)*0.02;
    }
    geo.attributes.position.needsUpdate = true;
  }
  ripple(G.waterGeo1); ripple(G.waterGeo2);
}

// ===================== HOUSE =====================
function createHouse() {
  var mx = G.HSE_X, mz = G.HSE_Z;
  var gy = tH(mx, mz);
  var ww = 5, wh = 2.8, wd = 5, wt = 0.12;
  var wallMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
  var roofMat = new THREE.MeshLambertMaterial({ color: 0x6B4226 });
  var floorMat = new THREE.MeshLambertMaterial({ color: 0x7B6B5A });

  function box(w, h, d, lx, ly, lz, m) {
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m || wallMat);
    mesh.position.set(mx+lx, gy+ly, mz+lz);
    G.scene.add(mesh); return mesh;
  }

  box(ww, wh, wt, 0, wh/2, -wd/2);
  box(wt, wh, wd, -ww/2, wh/2, 0);
  box(wt, wh, wd, ww/2, wh/2, 0);
  box(ww/2-0.5, wh, wt, -(ww/4+0.25), wh/2, wd/2);
  box(ww/2-0.5, wh, wt, ww/4+0.25, wh/2, wd/2);
  box(1.0, wh-2.0, wt, 0, wh-(wh-2)/2, wd/2);
  box(ww+0.6, 0.15, wd+0.6, 0, wh+0.075, 0, roofMat);
  box(ww, 0.08, wd, 0, 0.04, 0, floorMat);

  var fMat = new THREE.MeshLambertMaterial({ color: 0x9B7B5A });
  box(1.2, 0.72, 0.55, -0.8, 0.36, -1.7, fMat);
  box(0.42, 0.4, 0.42, -0.8, 0.2, -0.8, fMat);
  box(0.42, 0.5, 0.06, -0.8, 0.65, -0.59, fMat);

  var bMat = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
  box(0.22, 0.03, 0.16, -0.8, 0.735, -1.7, bMat);
  G.bookPos = new THREE.Vector3(mx-0.8, gy+0.735, mz-1.7);

  G.houseWallSegs = [
    { x1: mx-ww/2, z1: mz-wd/2-wt/2, x2: mx+ww/2, z2: mz-wd/2+wt/2 },
    { x1: mx-ww/2-wt/2, z1: mz-wd/2, x2: mx-ww/2+wt/2, z2: mz+wd/2 },
    { x1: mx+ww/2-wt/2, z1: mz-wd/2, x2: mx+ww/2+wt/2, z2: mz+wd/2 },
    { x1: mx-ww/2, z1: mz+wd/2-wt/2, x2: mx-0.5, z2: mz+wd/2+wt/2 },
    { x1: mx+0.5, z1: mz+wd/2-wt/2, x2: mx+ww/2, z2: mz+wd/2+wt/2 },
  ];
}

function houseCollide(x, z) {
  var pad = 0.35;
  for (var i = 0; i < G.houseWallSegs.length; i++) {
    var w = G.houseWallSegs[i];
    if (x > w.x1-pad && x < w.x2+pad && z > w.z1-pad && z < w.z2+pad) return true;
  }
  return false;
}

// ===================== TOMBSTONE (RING) =====================
function createTombstone() {
  var ringMat = new THREE.MeshLambertMaterial({ color: 0x8898A8 });
  var baseMat = new THREE.MeshLambertMaterial({ color: 0x607070 });
  var glowMat = new THREE.MeshBasicMaterial({ color: 0xAABBCC, transparent: true, opacity: 0.3 });

  function makeRing(sx, sz) {
    var sy = tH(sx, sz);
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 0.4, 8), baseMat);
    base.position.set(sx, sy+0.2, sz); G.scene.add(base);
    var pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 6), baseMat);
    pillar.position.set(sx, sy+0.9, sz); G.scene.add(pillar);
    var torus = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.07, 12, 36), ringMat);
    torus.position.set(sx, sy+2.0, sz);
    torus.userData.baseY = sy + 2.0;
    G.scene.add(torus);
    G.tombRings.push(torus);
    // Glow sphere
    var glow = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 8), glowMat);
    glow.position.set(sx, sy+2.0, sz); G.scene.add(glow);
  }

  makeRing(G.TMB_X, G.TMB_Z);
  makeRing(G.TMB_X - G.W, G.TMB_Z);
  G.tombPos = new THREE.Vector3(G.TMB_X, tH(G.TMB_X, G.TMB_Z)+1.0, G.TMB_Z);
}

function updateTombstoneRing(t) {
  for (var i = 0; i < G.tombRings.length; i++) {
    var ring = G.tombRings[i];
    ring.rotation.y = t * 0.3;
    ring.rotation.x = Math.sin(t * 0.5) * 0.12;
    ring.position.y = ring.userData.baseY + Math.sin(t * 0.7) * 0.08;
  }
}

// ===================== DEATH GRAVESTONES (PBC BOUNDARY RING) =====================
var CAUSE_COLORS = {
  'kcn_ingestion':             0x8844CC,
  'cross_contamination_death': 0xCC4444,
  'radiation_exposure':        0x44CC44,
  'gas_inhalation':            0x4488CC,
  'unknown':                   0x888888
};

var GRAVESTONE_RADIUS = 95;
var GRAVESTONE_ANGLE_START = 0.3;
var GRAVESTONE_ANGLE_STEP = 0.35;

function getCauseColor(causeId) {
  return CAUSE_COLORS[causeId] || CAUSE_COLORS['unknown'];
}

function pbcDuplicatePositions(gx, gz) {
  var xOff = (gx > 0) ? -G.W : G.W;
  var zOff = (gz > 0) ? -G.W : G.W;
  return [[0, 0], [xOff, 0], [0, zOff], [xOff, zOff]];
}

function createGravestoneTexture(deathRecord) {
  var canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 384;
  var ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 256, 384);

  // Character name
  ctx.fillStyle = '#e0d4b8';
  ctx.textAlign = 'center';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(deathRecord.characterName, 128, 50);

  // Divider
  ctx.strokeStyle = 'rgba(224, 212, 184, 0.4)';
  ctx.beginPath();
  ctx.moveTo(40, 70);
  ctx.lineTo(216, 70);
  ctx.stroke();

  // Location
  ctx.font = '18px sans-serif';
  ctx.fillStyle = '#aaa';
  var loc = deathRecord.location || '';
  if (loc.length > 24) loc = loc.substring(0, 22) + '...';
  ctx.fillText(loc, 128, 100);

  // Death message
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#cc8888';
  ctx.fillText(deathRecord.message || '', 128, 135);

  // Last actions (inquiry clues)
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#999';
  var y = 175;
  var actions = deathRecord.lastActions || [];
  for (var i = 0; i < Math.min(actions.length, 4); i++) {
    var text = actions[i];
    if (text.length > 28) text = text.substring(0, 26) + '...';
    ctx.fillText(text, 128, y);
    y += 22;
  }

  // Timestamp
  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#666';
  if (typeof formatTime === 'function') {
    ctx.fillText(formatTime(deathRecord.timestamp), 128, 350);
  }

  var tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createDeathGravestone(deathRecord) {
  var n = G.deathGravestones.length;

  // Dynamic step if many deaths
  var totalDeaths = G.notebook.deaths.length;
  var step = Math.min(GRAVESTONE_ANGLE_STEP, (2 * Math.PI - 0.6) / Math.max(totalDeaths, 1));
  var angle = GRAVESTONE_ANGLE_START + n * step;

  var gx = Math.cos(angle) * GRAVESTONE_RADIUS;
  var gz = Math.sin(angle) * GRAVESTONE_RADIUS;

  var causeColor = getCauseColor(deathRecord.causeId);

  // Slab geometry — pivot at base
  var slabGeo = new THREE.BoxGeometry(0.6, 0.9, 0.08);
  slabGeo.translate(0, 0.45, 0);
  var slabMat = new THREE.MeshLambertMaterial({ color: causeColor });

  // Text plane — local Z offset to sit on slab front face
  var textTex = createGravestoneTexture(deathRecord);
  var textMat = new THREE.MeshBasicMaterial({ map: textTex, transparent: true, depthWrite: false });
  var textGeo = new THREE.PlaneGeometry(0.54, 0.82);
  textGeo.translate(0, 0.45, 0.042);

  var groups = [];
  var offsets = pbcDuplicatePositions(gx, gz);

  for (var i = 0; i < offsets.length; i++) {
    var px = gx + offsets[i][0];
    var pz = gz + offsets[i][1];
    var py = tH(px, pz);

    // Group holds slab + text as children, so rotation/scale applies to both
    var group = new THREE.Group();
    group.position.set(px, py, pz);
    group.add(new THREE.Mesh(slabGeo, slabMat));
    group.add(new THREE.Mesh(textGeo, textMat));
    G.scene.add(group);
    groups.push(group);
  }

  G.deathGravestones.push({ groups: groups, death: deathRecord, baseX: gx, baseZ: gz });
}

function initDeathGravestones() {
  G.deathGravestones = [];
  for (var i = 0; i < G.notebook.deaths.length; i++) {
    createDeathGravestone(G.notebook.deaths[i]);
  }
}

// Reverse perspective (深水王子 effect): farther = larger, closer = smaller.
// D² scaling makes angular size grow linearly with distance.
// Billboard: always faces the player.
function updateGravestones() {
  if (G.deathGravestones.length === 0) return;

  for (var i = 0; i < G.deathGravestones.length; i++) {
    var gs = G.deathGravestones[i];

    // PBC-aware distance
    var dist = pDist(G.px, G.pz, gs.baseX, gs.baseZ);

    // D² reverse perspective: far = towering monolith, near = tiny marker
    var scale = Math.max(0.15, Math.min(12.0, dist * dist * 0.003));

    // Billboard: face toward player (PBC-aware direction)
    var dx = G.px - gs.baseX;
    var dz = G.pz - gs.baseZ;
    dx -= G.W * Math.round(dx / G.W);
    dz -= G.W * Math.round(dz / G.W);
    var faceAngle = Math.atan2(dx, dz);

    for (var j = 0; j < gs.groups.length; j++) {
      gs.groups[j].scale.set(scale, scale, scale);
      gs.groups[j].rotation.y = faceAngle;
    }

    // Proximity text overlay
    if (G.alive && dist < 3) {
      var d = gs.death;
      showMsg(d.characterName + ' — ' + d.message + '\n' + d.location + '\n' + (d.lastActions || []).join(' → '), 3000);
    }
  }
}

// ===================== MAZE ENTRANCE (OUTDOOR) =====================
function createEntrance() {
  var ey = tH(0, 0);
  var stoneMat = new THREE.MeshLambertMaterial({ color: 0x707070 });
  var pillarGeo = new THREE.CylinderGeometry(0.12, 0.18, 2, 6);
  var corners = [[-1.3,-1.3],[1.3,-1.3],[-1.3,1.3],[1.3,1.3]];
  for (var i = 0; i < 4; i++) {
    var p = new THREE.Mesh(pillarGeo, stoneMat);
    p.position.set(corners[i][0], ey+1, corners[i][1]);
    G.scene.add(p);
  }
  var plat = new THREE.Mesh(new THREE.BoxGeometry(3, 0.15, 3), stoneMat);
  plat.position.set(0, ey-0.08, 0); G.scene.add(plat);
  var opening = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 2.2).rotateX(-Math.PI/2),
    new THREE.MeshBasicMaterial({ color: 0x0a0a0a })
  );
  opening.position.set(0, ey+0.01, 0); G.scene.add(opening);
  var eLight = new THREE.PointLight(0xCCAA66, 0.4, 8);
  eLight.position.set(0, ey-0.5, 0); G.scene.add(eLight);
}
