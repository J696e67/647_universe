'use strict';

// ===================== GLOBAL STATE =====================
var G = window.G = {
  // Language
  lang: 'zh',

  // Three.js core
  scene: null, cam: null, ren: null, clk: null,
  dummy: new THREE.Object3D(),

  // World constants
  W: 200, HW: 100,
  EYE: 1.6, SPD: 5.25,
  CYCLE: 180,
  FOG_NEAR: 1, FOG_FAR: 65,

  // World positions
  HSE_X: -15, HSE_Z: -10,
  STR_X: 20,
  TMB_X: 99, TMB_Z: 0,
  WATER_Y: -0.25,

  // Temperature (°C) — affects berry decay rate
  TEMP_ABOVE: 26,   // above ground (house, outdoor)
  TEMP_BELOW: 10,   // underground (maze)
  DECAY_REF_TEMP: 20, // reference temperature for Q10 model
  DECAY_Q10: 2,       // rate doubles per 10°C increase

  // Maze constants
  MCOLS: 16, MROWS: 16, MCELL: 4,
  MAZE_Y: -50, MAZE_WALL_H: 3.0,
  MSIZE: 64, MHALF: 32,

  // Player state
  px: 0, pz: 8, yaw: 1.83, pitch: 0.05,
  // TIME_OFFSET controls the initial time-of-day at spawn (seconds into
  // the CYCLE). 100 ≈ sun at ~5° altitude (golden hour, just about to
  // set). Player watches sunset unfold as they walk toward the house;
  // by the time they arrive the house lamps are the brightest feature.
  TIME_OFFSET: 100,
  inMaze: false,
  mpx: 0, mpz: 0,
  savedOutdoorPos: { x: 0, z: 0, yaw: 0 },

  // Input state
  keys: {},
  touch: { on: false, moveId: null, lookId: null,
    msx: 0, msy: 0, mcx: 0, mcy: 0,
    lsx: 0, lsy: 0, lcx: 0, lcy: 0, llx: 0, lly: 0, lt0: 0 },
  pointerLocked: false,

  // Sky refs
  sunLight: null, ambLight: null, moonLight: null, skyUni: null, skyDomeMesh: null,
  starsMesh: null, starsGroup: null, sunMesh: null, moonMesh: null,
  _skyTiltQ: null, _skySpinQ: null,

  // World refs
  wheatMesh: null, wheatData: [],
  waterGeo1: null, waterGeo2: null,
  bookPos: null, tombPos: null,
  houseWallSegs: [], tombRings: [], tombGroups: [],

  // Maze refs
  mazeH: [], mazeV: [],
  mazeMesh: null, mazeFloor: null, mazeCeiling: null, mazePanels: null,
  mazeLights: [], mazePlayerLight: null,
  mazeExitReady: false, mazeSeed: 647,

  // Audio refs
  actx: null, audioOn: false,
  windGain: null, streamGain: null,
  mazeHumNodes: [],

  // UI state
  txtTimer: null, hintShown: false,
  fadeEl: null, mazeHintEl: null, hintEl: null,

  // Game state
  gameTime: 0,
  paused: false,

  // Character state (Phase 4)
  characterNames: ['Amara','Bodhi','Catalina','Deshi','Emre','Femi','Gael','Hana','Idris','Juno','Kavi','Lior','Maren','Nico','Olena','Priya','Quinn','Reza','Sora','Tala','Umi','Vega','Wren','Xiu','Yael','Zara'],
  characterIndex: 0,
  currentCharacter: null,
  alive: true,

  // Notebook (Phase 4)
  notebook: { entries: [], deaths: [], discoveries: [], totalCharacters: 0, currentCharacter: null, tombstoneDialogue: [] },

  // Substances & Surfaces (Phase 3)
  interactables: [],
  berries: [],
  surfaceStates: {},

  // Effects (Phase 4)
  activeEffects: [],

  // Equipment (Phase 5)
  equipment: [],

  // Tombstone
  tombChatInited: false,
  tombGreetingShown: false,

  // Room objects (Phase 2)
  roomMeshes: [],
  roomLights: [],

  // Leaderboard (Phase 6)
  discoveredIds: [],

  // Death gravestones along PBC boundary
  deathGravestones: [],

  // Start
  start: function() {
    init();
  }
};

// ===================== UTILITIES =====================
function smoothstep(a, b, x) {
  var t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function pDist(x1, z1, x2, z2) {
  var dx = x1 - x2, dz = z1 - z2;
  dx -= G.W * Math.round(dx / G.W);
  dz -= G.W * Math.round(dz / G.W);
  return Math.sqrt(dx * dx + dz * dz);
}

function showMsg(text, duration) {
  var el = document.getElementById('text');
  el.innerHTML = text.replace(/\n/g, '<br>');
  el.style.opacity = '1';
  clearTimeout(G.txtTimer);
  G.txtTimer = setTimeout(function() { el.style.opacity = '0'; }, duration || 6000);
}

function showSmellMsg(text) {
  var el = document.getElementById('text');
  el.innerHTML = text.replace(/\n/g, '<br>');
  el.style.opacity = '1';
  clearTimeout(G.txtTimer);
  G.txtTimer = setTimeout(function() { el.style.opacity = '0'; }, 4000);
}

// ===================== INIT =====================
function init() {
  // Scene
  G.scene = new THREE.Scene();
  G.scene.fog = new THREE.Fog(0xc9a060, G.FOG_NEAR, G.FOG_FAR);

  // Camera
  G.cam = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 250);

  // Renderer
  G.ren = new THREE.WebGLRenderer({ antialias: false });
  G.ren.setSize(window.innerWidth, window.innerHeight);
  G.ren.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  G.ren.setClearColor(0xc9a060);
  document.body.appendChild(G.ren.domElement);

  // Clock
  G.clk = new THREE.Clock();

  // Language — load saved preference
  try { var sl = localStorage.getItem('647_lang'); if (sl) G.lang = sl; } catch(e) {}
  refreshLanguage();

  // Language toggle button
  document.getElementById('lang-btn').addEventListener('click', function(e) {
    e.stopPropagation(); toggleLang();
  });

  // DOM refs
  G.fadeEl = document.getElementById('fade');
  G.mazeHintEl = document.getElementById('maze-hint');
  G.hintEl = document.getElementById('hint');

  // Build world (Phase 1)
  createTerrain();
  createSky();
  createStars();
  createCelestial();
  setupLights();
  createWheat();
  createTrees();
  createStream();
  createHouse();
  createTombstone();
  createEntrance();

  // Build maze (Phase 2)
  generateMaze();
  buildMazeGeometry();
  createMazeLights();
  createRooms();

  // Init substances (Phase 3)
  initSubstances();
  buildBerryDecay();
  initSurfaces();

  // Init characters (Phase 4)
  initCharacters();
  initNotebook();

  // Restore saved game state (overrides fresh init)
  if (loadGame()) {
    var savedName = G.notebook.currentCharacter || G.characterNames[G.characterIndex] || 'Explorer';
    G.currentCharacter.name = savedName;
    G.notebook.currentCharacter = savedName;
    document.getElementById('char-name').textContent = savedName;

    // Restore hand contamination
    if (G._pendingHandContamination && G.currentCharacter) {
      G.currentCharacter.handContamination = G._pendingHandContamination;
    }
    delete G._pendingHandContamination;
  }

  // Init tombstone (Phase 5)
  initTombstoneChat();

  // Init leaderboard (Phase 6)
  initLeaderboard();

  // Init anti-stuck
  initAntiStuck();

  // Init onboarding state machine (GDD §12). Must happen AFTER loadGame
  // so saved `onboardingComplete` flag is honored.
  initOnboarding();

  // Init death gravestones from any existing deaths
  initDeathGravestones();

  // Controls
  setupControls();

  // Loading screen
  var loadEl = document.getElementById('loading');
  setTimeout(function() {
    loadEl.style.opacity = '0';
    setTimeout(function() {
      loadEl.style.display = 'none';
      // Restore maze state if saved mid-maze
      if (G._pendingMazeRestore) {
        delete G._pendingMazeRestore;
        G.inMaze = true;
        G.mazeExitReady = false;
        G.mpx = 2; G.mpz = 2;
        G.scene.fog.near = 0.1; G.scene.fog.far = 18;
        G.scene.fog.color.set(0x1a1a1a);
        G.ren.setClearColor(0x1a1a1a);
        G.sunLight.intensity = 0;
        G.sunMesh.visible = false; G.moonMesh.visible = false;
        G.ambLight.color.set(0x404050); G.ambLight.intensity = 0.25;
        G.mazePlayerLight.intensity = 0.8;
        for (var mi = 0; mi < G.mazeLights.length; mi++) G.mazeLights[mi].intensity = G.mazeLights[mi].userData.baseIntensity;
        for (var mj = 0; mj < G.roomLights.length; mj++) G.roomLights[mj].intensity = G.roomLights[mj].userData.baseIntensity || 0.5;
        G.cam.position.set(G.mpx, G.MAZE_Y + G.EYE, G.mpz);
        if (G.audioOn) {
          G.windGain.gain.setTargetAtTime(0, G.actx.currentTime, 0.1);
          G.streamGain.gain.setTargetAtTime(0, G.actx.currentTime, 0.1);
        }
        initMazeAudio();
      }
      // Title cards (GDD §12.3 Beat 0)
      // Act 1: 神农堂 / 死去才能知道为什么          (2.5s)
      // Act 2: 647 宇宙 / 你对这个世界了解多少？     (2.5s)
      // Returning players (onboardingComplete === true) skip both.
      var titleEl = document.getElementById('title');
      var subEl = document.getElementById('subtitle');
      titleEl.style.transition = 'opacity 0.6s';
      subEl.style.transition = 'opacity 0.6s';

      function showGameHud() {
        titleEl.style.display = 'none';
        subEl.style.display = 'none';
        document.getElementById('char-name').style.opacity = '1';
        document.getElementById('notebook-btn').style.opacity = '1';
        document.getElementById('lang-btn').style.opacity = '1';
        document.getElementById('crosshair').style.opacity = '1';
        if (typeof onboardingEnterWalkStage === 'function') onboardingEnterWalkStage();
      }

      if (G.onboardingComplete) {
        // Returning player: skip both acts
        showGameHud();
      } else {
        // Act 1
        titleEl.textContent = L('loading.title');
        subEl.textContent = L('act1.subtitle');
        titleEl.style.opacity = '1';
        subEl.style.opacity = '1';
        setTimeout(function() {
          titleEl.style.opacity = '0';
          subEl.style.opacity = '0';
        }, 2500);
        // Act 2
        setTimeout(function() {
          titleEl.textContent = L('game.title');
          subEl.textContent = L('act2.subtitle');
          titleEl.style.opacity = '1';
          subEl.style.opacity = '1';
        }, 3100);
        setTimeout(function() {
          titleEl.style.opacity = '0';
          subEl.style.opacity = '0';
        }, 5600);
        setTimeout(showGameHud, 6200);
      }
    }, 1500);
  }, 500);

  // Start loop
  animate();
}

// ===================== MAIN LOOP =====================
function animate() {
  requestAnimationFrame(animate);
  if (G.paused) return;

  var dt = Math.min(G.clk.getDelta(), 0.1);
  var t = G.clk.getElapsedTime();
  G.gameTime = t;

  // Update effects (Phase 4)
  if (G.alive) updateEffects(dt);

  updateBerryDecay();
  if (G.alive) {
    updateSenses();
    updateSmellProximity();
  }
  if (G.inMaze) {
    updatePlayerMaze(dt);
    updateMaze(t);
  } else {
    updatePlayer(dt);
    updateDayNight(t + G.TIME_OFFSET);
    updateWheat(t);
    updateWater(t);
    updateAudio();
    updateTombstoneRing(t);
    updateRiverState();
    updateTombstoneChat();
    updateGravestones();
    updateNudge(dt);
    if (typeof updateOnboarding === 'function') updateOnboarding(t, dt);
  }

  // Auto-save every 30 seconds
  if (!G._lastAutoSave) G._lastAutoSave = 0;
  if (t - G._lastAutoSave > 30) {
    G._lastAutoSave = t;
    saveGame();
  }

  G.ren.render(G.scene, G.cam);
}
