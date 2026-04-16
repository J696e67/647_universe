'use strict';

// ===================== NOTEBOOK SYSTEM =====================
function initNotebook() {
  G.notebook = {
    entries: [],
    deaths: [],
    discoveries: [],
    totalCharacters: 0,
    currentCharacter: null,
    tombstoneDialogue: [],
    // CER Board (player-authored)
    cerEntries: [],
    validatedClaims: [],
    // Evidence tracking for 14-claim gates
    observedBerryStages: {},   // berryUuid → { stages: [0,1,...], clean: bool }
    skyObservations: [],       // [{timestamp, pitch, isNight}]
    dayNightCycles: 0,
    lastCycleMark: 0,
    pbcCrossed: false,
    thermometerLocations: [],  // 'above' | 'below'
    berryCleanEatenSurvived: false,
    crossContaminationDeathSeen: false
  };
  // Scaffolded CER entries are no longer seeded up-front. Each entry is
  // revealed only when its triggering in-world event fires — see
  // js/cer.js revealScaffoldedCerEntry() and GDD §12.4.
}

function addNotebookEntry(action, target, location, result) {
  var entry = {
    characterName: G.currentCharacter ? G.currentCharacter.name : 'Unknown',
    timestamp: G.gameTime,
    action: action,
    target: target,
    location: location,
    result: result,
    note: null
  };
  G.notebook.entries.push(entry);
  saveGame();
}

// ===================== NOTEBOOK UI =====================
var NOTEBOOK_MODE = 'log';  // 'log' | 'cer'

function toggleNotebook() {
  var overlay = document.getElementById('notebook-overlay');
  if (overlay.classList.contains('active')) {
    overlay.classList.remove('active');
  } else {
    renderNotebook();
    overlay.classList.add('active');
  }
}

function renderNotebook(filterChar) {
  if (NOTEBOOK_MODE === 'cer') { renderCerBoard(); return; }
  var content = document.getElementById('notebook-content');
  var filters = document.getElementById('notebook-filters');

  // Build character filter buttons
  var chars = [];
  for (var i = 0; i < G.notebook.entries.length; i++) {
    var cn = G.notebook.entries[i].characterName;
    if (chars.indexOf(cn) === -1) chars.push(cn);
  }

  filters.innerHTML = '';

  // Mode tabs: Log | CER Board
  var logTab = document.createElement('button');
  logTab.textContent = L('notebook.log');
  logTab.className = 'active';
  logTab.addEventListener('click', function() { NOTEBOOK_MODE = 'log'; renderNotebook(); });
  filters.appendChild(logTab);

  var cerTab = document.createElement('button');
  cerTab.textContent = L('notebook.cer');
  cerTab.addEventListener('click', function() { NOTEBOOK_MODE = 'cer'; renderNotebook(); });
  filters.appendChild(cerTab);

  var sep = document.createElement('span');
  sep.style.cssText = 'color:rgba(255,255,255,0.15);padding:0 4px;';
  sep.textContent = '|';
  filters.appendChild(sep);

  var allBtn = document.createElement('button');
  allBtn.textContent = L('notebook.all');
  allBtn.className = !filterChar ? 'active' : '';
  allBtn.addEventListener('click', function() { renderNotebook(); });
  filters.appendChild(allBtn);

  for (var j = 0; j < chars.length; j++) {
    var btn = document.createElement('button');
    btn.textContent = chars[j];
    btn.className = filterChar === chars[j] ? 'active' : '';
    btn.addEventListener('click', (function(c) { return function() { renderNotebook(c); }; })(chars[j]));
    filters.appendChild(btn);
  }

  // Leaderboard button
  var lbBtn = document.createElement('button');
  lbBtn.textContent = L('notebook.leaderboard');
  lbBtn.addEventListener('click', function() {
    document.getElementById('notebook-overlay').classList.remove('active');
    showLeaderboard();
  });
  filters.appendChild(lbBtn);

  // New Game button
  var newBtn = document.createElement('button');
  newBtn.textContent = L('notebook.newgame');
  newBtn.style.color = '#cc4444';
  newBtn.style.marginLeft = 'auto';
  newBtn.addEventListener('click', function() {
    if (confirm(L('notebook.confirm'))) {
      clearSave();
      location.reload();
    }
  });
  filters.appendChild(newBtn);

  // Build entries
  content.innerHTML = '';

  // Deaths summary
  if (G.notebook.deaths.length > 0) {
    var deathSection = document.createElement('div');
    deathSection.style.marginBottom = '16px';
    deathSection.style.paddingBottom = '12px';
    deathSection.style.borderBottom = '1px solid rgba(204,68,68,0.3)';
    var deathTitle = document.createElement('div');
    deathTitle.style.color = '#cc4444';
    deathTitle.style.marginBottom = '8px';
    deathTitle.textContent = L('notebook.deaths', {count: G.notebook.deaths.length});
    deathSection.appendChild(deathTitle);

    for (var d = 0; d < G.notebook.deaths.length; d++) {
      var death = G.notebook.deaths[d];
      if (filterChar && death.characterName !== filterChar) continue;
      var dEl = document.createElement('div');
      dEl.className = 'nb-entry nb-death';
      dEl.innerHTML = '<span class="nb-char">' + death.characterName + '</span> — ' +
        death.message + ' <span class="nb-time">[' + formatTime(death.timestamp) + ', ' + death.location + ']</span>' +
        '<br><span style="color:#884444;font-size:0.85em">' + L('notebook.lastactions') + death.lastActions.join(' \u2192 ') + '</span>';
      deathSection.appendChild(dEl);
    }
    content.appendChild(deathSection);
  }

  // All entries
  var entries = G.notebook.entries;
  for (var k = entries.length - 1; k >= 0; k--) {
    var e = entries[k];
    if (filterChar && e.characterName !== filterChar) continue;
    var el = document.createElement('div');
    el.className = 'nb-entry' + (e.action === 'death' ? ' nb-death' : '');
    el.innerHTML = '<span class="nb-time">[' + formatTime(e.timestamp) + ']</span> ' +
      '<span class="nb-char">' + e.characterName + '</span> ' +
      '<span class="nb-action">' + e.action + '</span> ' +
      '<strong>' + e.target + '</strong> ' +
      '<span style="color:#666">@' + e.location + '</span>' +
      '<br><span class="nb-result">' + e.result + '</span>';
    content.appendChild(el);
  }

  if (entries.length === 0) {
    content.innerHTML = '<div style="color:#555;text-align:center;padding:40px">' + L('notebook.empty') + '</div>';
  }
}

function formatTime(t) {
  var m = Math.floor(t / 60);
  var s = Math.floor(t % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}

// ===================== SAVE / LOAD =====================
function saveGame() {
  try {
    localStorage.setItem('647_save', JSON.stringify({
      // v1 fields
      notebook:       G.notebook,
      surfaceStates:  G.surfaceStates,
      characterIndex: G.characterIndex,
      discoveredIds:  G.discoveredIds,
      // v2: full game state
      version: 2,
      inMaze:   G.inMaze,
      px: G.px, pz: G.pz, yaw: G.yaw, pitch: G.pitch,
      mpx: G.mpx, mpz: G.mpz,
      equipment: G.equipment,
      handContamination: G.currentCharacter ? G.currentCharacter.handContamination : [],
      alive: G.alive,
      mazeGateShownForDeathCount: G.mazeGateShownForDeathCount || 0,
      tombChatInited: G.tombChatInited,
      tombGreetingShown: G.tombGreetingShown,
      onboarding: G.onboarding
    }));
  } catch(e) {}
}

function loadGame() {
  try {
    var raw = localStorage.getItem('647_save');
    if (!raw) return false;
    var data = JSON.parse(raw);
    if (data.notebook)       G.notebook       = data.notebook;
    if (data.surfaceStates)  G.surfaceStates  = data.surfaceStates;
    if (typeof data.characterIndex === 'number') G.characterIndex = data.characterIndex;
    if (data.discoveredIds)  G.discoveredIds  = data.discoveredIds;

    // Migrate older saves: ensure all fields the current code reads exist.
    // Without this, players loading a save from before a schema change see
    // crashes (indexOf on undefined) or broken evidence gates.
    migrateNotebookSchema();

    // v2 fields
    if (data.version >= 2) {
      if (typeof data.px === 'number') { G.px = data.px; G.pz = data.pz; }
      if (typeof data.yaw === 'number') { G.yaw = data.yaw; G.pitch = data.pitch || 0; }
      if (typeof data.mpx === 'number') { G.mpx = data.mpx; G.mpz = data.mpz; }
      if (data.equipment) G.equipment = data.equipment;
      if (typeof data.mazeGateShownForDeathCount === 'number') G.mazeGateShownForDeathCount = data.mazeGateShownForDeathCount;
      if (typeof data.tombChatInited === 'boolean') G.tombChatInited = data.tombChatInited;
      if (typeof data.tombGreetingShown === 'boolean') G.tombGreetingShown = data.tombGreetingShown;
      // Onboarding state — pending restore until initOnboarding() runs
      if (data.onboarding) G._pendingOnboarding = data.onboarding;

      // Restore character hand contamination
      G._pendingHandContamination = data.handContamination || [];

      // Restore maze state (deferred to after scene is ready)
      if (data.inMaze) G._pendingMazeRestore = true;
    }
    return true;
  } catch(e) { return false; }
}

function clearSave() {
  localStorage.removeItem('647_save');
  localStorage.removeItem('647_onboarding_complete');
  localStorage.removeItem('shennong_discoveries');
}

// Backfill any field the current G.notebook schema expects but an older
// save may not have. Called from loadGame() after restoring data.notebook.
function migrateNotebookSchema() {
  var n = G.notebook;
  if (!n) return;
  if (!Array.isArray(n.entries))            n.entries = [];
  if (!Array.isArray(n.deaths))             n.deaths = [];
  if (!Array.isArray(n.discoveries))        n.discoveries = [];
  if (!Array.isArray(n.tombstoneDialogue))  n.tombstoneDialogue = [];
  if (!Array.isArray(n.cerEntries))         n.cerEntries = [];
  if (!Array.isArray(n.validatedClaims))    n.validatedClaims = [];
  if (!Array.isArray(n.skyObservations))    n.skyObservations = [];
  if (!Array.isArray(n.thermometerLocations)) n.thermometerLocations = [];
  if (typeof n.observedBerryStages !== 'object' || !n.observedBerryStages) n.observedBerryStages = {};
  if (typeof n.dayNightCycles !== 'number') n.dayNightCycles = 0;
  if (typeof n.lastCycleMark !== 'number')  n.lastCycleMark = 0;
  if (typeof n.totalCharacters !== 'number') n.totalCharacters = 0;
  if (typeof n.pbcCrossed !== 'boolean')    n.pbcCrossed = false;
  if (typeof n.berryCleanEatenSurvived !== 'boolean') n.berryCleanEatenSurvived = false;
  if (typeof n.crossContaminationDeathSeen !== 'boolean') n.crossContaminationDeathSeen = false;
  if (typeof n._beat6Fired !== 'boolean')   n._beat6Fired = false;
  if (typeof n._firstValidationCelebrated !== 'boolean') n._firstValidationCelebrated = false;
}
