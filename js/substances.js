'use strict';

// ===================== SUBSTANCE DEFINITIONS =====================
var SUBSTANCES = {};

function initSubstances() {
  SUBSTANCES = {
    kcn: {
      id: 'kcn',
      name: L('kcn.name'),
      visual: { shape: 'sphere', color: 0xffffff, size: 0.05 },
      properties: {
        smell: { description: L('kcn.smell'), detectDistance: 2.0 },
        taste: { lethal: true, delay: 0, description: L('kcn.taste') },
        touch: { residue: true, residueId: 'kcn_residue', description: L('kcn.touch') },
        look: { description: L('kcn.look') },
        listen: { description: L('kcn.listen') },
        smellClose: { description: L('kcn.smellClose') }
      },
      facts: {
        name: 'Potassium Cyanide (KCN)',
        lethality: '1-3 mg/kg body weight',
        mechanism: 'Inhibits cytochrome c oxidase, blocks cellular respiration'
      }
    },
    kcn_residue: {
      id: 'kcn_residue',
      name: 'Invisible Residue',
      invisible: true,
      properties: {
        taste: { lethal: true, delay: 2, description: '' },
        touch: { residue: true, residueId: 'kcn_residue', description: '' }
      }
    },
    red_berry: {
      id: 'red_berry',
      name: L('berry.name'),
      visual: { shape: 'sphere', color: 0xCC2222, size: 0.04 },
      properties: {
        smell: { description: L('berry.smell'), detectDistance: 0.5 },
        taste: { lethal: false, delay: 0, description: L('berry.taste') },
        touch: { residue: false, description: L('berry.touch') },
        look: { description: L('berry.look') },
        listen: { description: L('berry.listen') },
        smellClose: { description: L('berry.smellClose') }
      },
      facts: { name: 'Common Red Berry', lethality: 'Non-toxic', mechanism: 'N/A' }
    },
    berry_seed: {
      id: 'berry_seed',
      name: L('seed.name'),
      visual: { shape: 'sphere', color: 0x553322, size: 0.015 },
      properties: {
        smell: { description: L('seed.smell'), detectDistance: 0.3 },
        taste: { lethal: false, delay: 0, description: L('seed.taste') },
        touch: { residue: false, description: L('seed.touch') },
        look: { description: L('seed.look') },
        listen: { description: L('seed.listen') },
        smellClose: { description: L('seed.smellClose') }
      },
      facts: { name: 'Berry Seed', lethality: 'Non-toxic', mechanism: 'N/A' }
    }
  };
}

function getSubstance(id) {
  return SUBSTANCES[id] || null;
}

// ===================== BERRY DECAY SYSTEM =====================
var BERRY_DECAY = [];
function buildBerryDecay() {
  BERRY_DECAY = [
    { name:'FRESH', t0:0, t1:360, color:0xCC2222, scale:1.0, stemColor:0x336622, dist:0.5,
      look:L('decay.0.look'), listen:L('decay.0.listen'), smell:L('decay.0.smell'),
      smellClose:L('decay.0.smellClose'), taste:L('decay.0.taste'), touch:L('decay.0.touch') },
    { name:'OVERRIPE', t0:360, t1:720, color:0x991133, scale:0.95, stemColor:0x667722, dist:1.0,
      look:L('decay.1.look'), listen:L('decay.1.listen'), smell:L('decay.1.smell'),
      smellClose:L('decay.1.smellClose'), taste:L('decay.1.taste'), touch:L('decay.1.touch') },
    { name:'FERMENTING', t0:720, t1:1080, color:0x774422, scale:0.85, stemColor:0x998833, dist:1.8,
      look:L('decay.2.look'), listen:L('decay.2.listen'), smell:L('decay.2.smell'),
      smellClose:L('decay.2.smellClose'), taste:L('decay.2.taste'), touch:L('decay.2.touch') },
    { name:'ROTTING', t0:1080, t1:1440, color:0x332211, scale:0.65, stemColor:0x553311, dist:2.5,
      look:L('decay.3.look'), listen:L('decay.3.listen'), smell:L('decay.3.smell'),
      smellClose:L('decay.3.smellClose'), taste:L('decay.3.taste'), touch:L('decay.3.touch') },
    { name:'DECAYED', t0:1440, t1:Infinity, color:0x111111, scale:0.5, stemColor:0x221100, dist:3.0,
      look:L('decay.4.look'), listen:L('decay.4.listen'), smell:L('decay.4.smell'),
      smellClose:L('decay.4.smellClose'), taste:L('decay.4.taste'), touch:L('decay.4.touch') }
  ];
}

var _bc1 = new THREE.Color(), _bc2 = new THREE.Color();

function getBerryTemperature(mesh) {
  // Underground (maze) vs above ground — determined by Y position
  return mesh.position.y < G.MAZE_Y + G.MAZE_WALL_H ? G.TEMP_BELOW : G.TEMP_ABOVE;
}

function getDecayRate(temperature) {
  // Q10 model: rate = Q10 ^ ((T - T_ref) / 10)
  return Math.pow(G.DECAY_Q10, (temperature - G.DECAY_REF_TEMP) / 10);
}

function initBerryDecay(mesh, stemMesh) {
  mesh.userData.isBerry = true;
  mesh.userData.stemMesh = stemMesh;
  mesh.userData.decayStage = 0;
  mesh.userData.decayProgress = 0;       // accumulated decay units (temperature-adjusted)
  mesh.userData.lastDecayTime = G.gameTime;
  mesh.userData.contamination = [];      // residue deposited on berry surface
  mesh.userData.senseOverrides = {
    look: { description: BERRY_DECAY[0].look },
    listen: { description: BERRY_DECAY[0].listen },
    smell: { description: BERRY_DECAY[0].smell, detectDistance: BERRY_DECAY[0].dist },
    smellClose: { description: BERRY_DECAY[0].smellClose },
    taste: { lethal: false, delay: 0, description: BERRY_DECAY[0].taste },
    touch: { residue: false, description: BERRY_DECAY[0].touch }
  };
  G.berries.push(mesh);
}

function updateBerryDecay() {
  for (var i = 0; i < G.berries.length; i++) {
    var m = G.berries[i];
    if (!m.parent) continue; // removed from scene

    // Accumulate decay progress based on temperature
    var dt = G.gameTime - m.userData.lastDecayTime;
    m.userData.lastDecayTime = G.gameTime;
    if (dt > 0) {
      var temp = getBerryTemperature(m);
      var rate = getDecayRate(temp);
      m.userData.decayProgress += dt * rate;
    }

    var progress = m.userData.decayProgress;
    // find stage
    var si = 0;
    for (var j = BERRY_DECAY.length - 1; j >= 0; j--) {
      if (progress >= BERRY_DECAY[j].t0) { si = j; break; }
    }
    var stg = BERRY_DECAY[si];
    var nxt = BERRY_DECAY[Math.min(si + 1, BERRY_DECAY.length - 1)];
    var t = (stg.t1 === Infinity) ? 0 : Math.min((progress - stg.t0) / (stg.t1 - stg.t0), 1);

    // interpolate color
    _bc1.set(stg.color); _bc2.set(nxt.color);
    m.material.color.copy(_bc1).lerp(_bc2, t);
    // interpolate scale
    var s = stg.scale + (nxt.scale - stg.scale) * t;
    m.scale.setScalar(s);
    // stem color + scale
    if (m.userData.stemMesh) {
      _bc1.set(stg.stemColor); _bc2.set(nxt.stemColor);
      m.userData.stemMesh.material.color.copy(_bc1).lerp(_bc2, t);
      m.userData.stemMesh.scale.setScalar(s);
    }
    // update sense overrides on stage change
    if (si !== m.userData.decayStage) {
      m.userData.decayStage = si;
      var ov = m.userData.senseOverrides;
      ov.look.description = stg.look;
      ov.listen.description = stg.listen;
      ov.smell.description = stg.smell;
      ov.smell.detectDistance = stg.dist;
      ov.smellClose.description = stg.smellClose;
      ov.taste.description = stg.taste;
      ov.touch.description = stg.touch;
    }
    // interpolate smell distance
    var d = stg.dist + (nxt.dist - stg.dist) * t;
    m.userData.senseOverrides.smell.detectDistance = d;
  }
}

function removeBerry(mesh) {
  if (mesh.parent) G.scene.remove(mesh);
  if (mesh.userData.stemMesh && mesh.userData.stemMesh.parent) G.scene.remove(mesh.userData.stemMesh);
  var idx;
  idx = G.interactables.indexOf(mesh); if (idx !== -1) G.interactables.splice(idx, 1);
  idx = G.berries.indexOf(mesh); if (idx !== -1) G.berries.splice(idx, 1);
  if (G.roomMeshes) { idx = G.roomMeshes.indexOf(mesh); if (idx !== -1) G.roomMeshes.splice(idx, 1); }
  // spawn seed
  var seed = new THREE.Mesh(
    new THREE.SphereGeometry(0.015, 6, 6),
    new THREE.MeshStandardMaterial({ color: 0x553322, roughness: 0.8 })
  );
  seed.position.copy(mesh.position);
  seed.userData.interactable = true;
  seed.userData.substanceId = 'berry_seed';
  seed.userData.type = 'substance';
  seed.userData.nameKey = 'seed.name';
  seed.userData.name = L('seed.name');
  seed.userData.roomKey = mesh.userData.roomKey;
  seed.userData.room = mesh.userData.room;
  G.scene.add(seed);
  G.interactables.push(seed);
}
