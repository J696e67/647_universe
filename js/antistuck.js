'use strict';

// ===================== ANTI-STUCK SYSTEM =====================
// Layer A: Orientation nudges for new players spinning in place
// Layer B: Maze gate when player dies the same way twice

// --- Layer A: Orientation Phase ---
var _nudge = {
  triggered: false,
  stage: 0,
  timer: 0,
  yawAccum: 0,
  lastYaw: null,
  msgKeys: ['nudge.0', 'nudge.1', 'nudge.2'],
  delays: [60, 30, 30]  // seconds between each message
};

function initAntiStuck() {
  _nudge.triggered = false;
  _nudge.stage = 0;
  _nudge.timer = 0;
  _nudge.yawAccum = 0;
  _nudge.lastYaw = null;
  G.mazeGateActive = false;
  G.mazeGateShownForDeathCount = 0;  // tracks which death count the gate was last shown for
  G.mazeGateEl = document.getElementById('maze-gate');
}

function updateNudge(dt) {
  // Skip if already done, or player has entered maze/house/tombstone chat
  if (_nudge.triggered) return;
  if (G.inMaze) { _nudge.triggered = true; return; }
  if (G.notebook.entries.length > 0) { _nudge.triggered = true; return; }

  // Track yaw rotation accumulation
  if (_nudge.lastYaw !== null) {
    var dyaw = G.yaw - _nudge.lastYaw;
    // Normalize to [-PI, PI]
    while (dyaw > Math.PI) dyaw -= 2 * Math.PI;
    while (dyaw < -Math.PI) dyaw += 2 * Math.PI;
    _nudge.yawAccum += Math.abs(dyaw);
  }
  _nudge.lastYaw = G.yaw;

  // Check if player is near spawn
  var spawnDist = pDist(G.px, G.pz, 0, 8);
  var nearSpawn = spawnDist < 15;

  if (!nearSpawn) {
    // Player is exploring, reset and mark done
    _nudge.triggered = true;
    return;
  }

  _nudge.timer += dt;

  // Trigger conditions: near spawn + enough time passed for current stage
  if (_nudge.stage < _nudge.msgKeys.length && _nudge.timer >= _nudge.delays[_nudge.stage]) {
    showNudgeMsg(L(_nudge.msgKeys[_nudge.stage]));
    _nudge.timer = 0;
    _nudge.stage++;
    if (_nudge.stage >= _nudge.msgKeys.length) {
      _nudge.triggered = true;
    }
  }
}

function showNudgeMsg(text) {
  var el = document.getElementById('nudge-text');
  el.textContent = text;
  el.style.opacity = '1';
  setTimeout(function() { el.style.opacity = '0'; }, 5000);
}


// --- Layer B: Repetitive Death Gate ---

function checkRepetitiveDeath() {
  var deaths = G.notebook.deaths;
  if (deaths.length < 2) return false;

  var last = deaths[deaths.length - 1];
  var prev = deaths[deaths.length - 2];

  // Same cause?
  if (last.causeId !== prev.causeId) return false;

  // Similar action sequence? (>= 60% overlap in order)
  var overlap = 0;
  var maxLen = Math.max(last.lastActions.length, prev.lastActions.length);
  if (maxLen === 0) return false;

  for (var i = 0; i < Math.min(last.lastActions.length, prev.lastActions.length); i++) {
    if (last.lastActions[i] === prev.lastActions[i]) overlap++;
  }

  return (overlap / maxLen) >= 0.6;
}

function getGateQuestion() {
  var deaths = G.notebook.deaths;
  if (deaths.length < 2) return null;

  var last = deaths[deaths.length - 1];
  var causeId = last.causeId || '';

  // Pick question based on cause
  if (causeId === 'kcn_ingestion') {
    return L('gate.kcn');
  }
  if (causeId === 'cross_contamination_death') {
    return L('gate.cross');
  }

  var pool = [L('gate.generic.0'), L('gate.generic.1'), L('gate.generic.2')];
  return pool[Math.floor(Math.random() * pool.length)];
}

function showMazeGate() {
  var question = getGateQuestion();
  if (!question) return false;

  G.mazeGateActive = true;
  var el = G.mazeGateEl;
  var qEl = document.getElementById('gate-question');
  qEl.innerHTML = question.replace(/\n/g, '<br>');
  el.classList.add('active');

  // Auto-dismiss after 6 seconds, then enter maze
  G._gateTimer = setTimeout(function() {
    dismissMazeGate(true);
  }, 6000);

  return true;
}

function dismissMazeGate(enterMaze) {
  clearTimeout(G._gateTimer);
  G.mazeGateActive = false;
  G.mazeGateEl.classList.remove('active');
  if (enterMaze) {
    transitionToMaze();
  }
}
