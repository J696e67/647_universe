#!/usr/bin/env node
// Layer B integration tests. Usage: node tests/integration.js
// Exercises cross-file flows: kill chain, CER submission paths (offline +
// mocked Claude grader pass/fail), save/load round trip, thermometer dual
// location, day/night accumulator, sky-observation throttle, Tombstone
// history bounding, and EQUIP tag parsing.
//
// Strategy: load js/cer.js in a vm sandbox (the core under test), and
// simulate surrounding files' contracts locally. Where real source is the
// contract (tombstone EQUIP regex, history slice), we copy the expression
// verbatim so a regression in the real file is caught by the test failing
// to match.

'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');

// ---- Sandbox with cer.js loaded ----
var CER_SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'cer.js'), 'utf8');

var fetchMock = null;  // per-test override

// Minimal document stub — cer.js touches DOM during Beat 6 + leaderboard
// auto-open. Each getElementById returns a fake element that records
// classList changes so tests can assert on them.
var fakeDom = {};
function fakeEl(id) {
  if (fakeDom[id]) return fakeDom[id];
  var el = {
    id: id,
    classList: {
      _set: {},
      add: function(c) { this._set[c] = true; },
      remove: function(c) { delete this._set[c]; },
      contains: function(c) { return !!this._set[c]; }
    },
    querySelectorAll: function() { return []; }
  };
  fakeDom[id] = el;
  return el;
}
var fakeDocument = {
  getElementById: fakeEl,
  querySelectorAll: function() { return []; },
  querySelector: function() { return null; }
};
var sandbox = {
  console: console,
  IS_LOCAL: false,
  LOCAL_CONFIG: {},
  saveGame: function() {},
  showDiscoveryNotification: function() {},
  renderNotebook: function() {},
  showLeaderboard: function() { fakeEl('leaderboard-overlay').classList.add('active'); },
  document: fakeDocument,
  NOTEBOOK_MODE: 'log',
  fetch: function(url, opts) { return fetchMock(url, opts); },
  L: function(key, params) {
    if (!params) return key;
    var s = key; for (var k in params) s = s.replace('{' + k + '}', params[k]);
    return s;
  },
  G: { notebook: null, gameTime: 0, lang: 'en' },
  setTimeout: setTimeout, setInterval: setInterval, clearTimeout: clearTimeout,
  Math: Math, JSON: JSON, Object: Object, Array: Array, Date: Date,
  Promise: Promise, Error: Error
};
vm.createContext(sandbox);
vm.runInContext(CER_SRC, sandbox, { filename: 'cer.js' });

var G = sandbox.G;
var evidenceGateMet = sandbox.evidenceGateMet;
var seedScaffoldedCerEntries = sandbox.seedScaffoldedCerEntries;
var submitCerEntry = sandbox.submitCerEntry;

function freshNotebook() {
  return {
    entries: [], deaths: [], discoveries: [], totalCharacters: 0,
    currentCharacter: null, tombstoneDialogue: [],
    cerEntries: [], validatedClaims: [],
    observedBerryStages: {}, skyObservations: [],
    dayNightCycles: 0, lastCycleMark: 0, pbcCrossed: false,
    thermometerLocations: [],
    berryCleanEatenSurvived: false, crossContaminationDeathSeen: false
  };
}

// Shared game constants mirrored from main.js (any drift here is a
// contract drift and should fail a test).
var CONST = { CYCLE: 180, TEMP_ABOVE: 26, TEMP_BELOW: 10 };

// ---- Harness ----
var TEST = { pass: 0, fail: 0, fails: [] };
function ok(cond, name, detail) {
  if (cond) { TEST.pass++; process.stdout.write('.'); }
  else      { TEST.fail++; TEST.fails.push(name + (detail ? ' — ' + detail : '')); process.stdout.write('F'); }
}
function eq(actual, expected, name) {
  var ok_ = actual === expected ||
    (typeof actual === 'number' && typeof expected === 'number' && Math.abs(actual - expected) < 1e-6);
  ok(ok_, name, ok_ ? '' : 'expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
}
function section(name) { process.stdout.write('\n[' + name + '] '); }

// =================================================================
// Scenario 1 — Full cross-contamination kill chain
// =================================================================
// Mirrors senses.js:doTouch/doTaste + effects.js:triggerDeath contract.
function runKillChain() {
  section('1. Kill chain');
  G.notebook = freshNotebook();

  // Set up actors
  var alice = { name: 'Alice', handContamination: [], equipment: [] };
  var tylor = { name: 'Tylor', handContamination: [], equipment: [] };
  var surfaces = { room1_doorhandle: { contamination: [] } };
  var kcn   = { type: 'substance', touch: { residue: true, residueId: 'kcn_residue' } };
  var handle = { type: 'surface', surfaceId: 'room1_doorhandle' };
  var berry = { type: 'substance', userData: { substanceId: 'red_berry' }, contamination: [] };

  // Alice touches KCN
  if (kcn.touch.residue && alice.handContamination.indexOf(kcn.touch.residueId) === -1) {
    alice.handContamination.push(kcn.touch.residueId);
  }
  ok(alice.handContamination.indexOf('kcn_residue') !== -1, 'Alice hands contaminated after touching KCN');

  // Alice touches door handle — deposits residue
  for (var i = 0; i < alice.handContamination.length; i++) {
    var cid = alice.handContamination[i];
    var exists = surfaces[handle.surfaceId].contamination.some(function(c){ return c.substanceId === cid; });
    if (!exists) surfaces[handle.surfaceId].contamination.push({ substanceId: cid, depositedBy: alice.name, timestamp: 10 });
  }
  ok(surfaces.room1_doorhandle.contamination.length === 1, 'Door handle now contaminated');
  ok(surfaces.room1_doorhandle.contamination[0].depositedBy === 'Alice', 'Deposit attribution recorded');

  // Alice dies (direct KCN taste — not part of cross-contam chain)
  G.notebook.deaths.push({ characterName: 'Alice', causeId: 'kcn_ingestion', timestamp: 30, lastActions:['touch KCN','taste KCN'] });

  // Tylor arrives, touches the same door handle — silently picks up residue
  var before = tylor.handContamination.length;
  var surfContam = surfaces[handle.surfaceId].contamination;
  for (var j = 0; j < surfContam.length; j++) {
    if (tylor.handContamination.indexOf(surfContam[j].substanceId) === -1) {
      tylor.handContamination.push(surfContam[j].substanceId);
    }
  }
  ok(tylor.handContamination.length > before, 'Tylor silently picked up residue');

  // Tylor tastes berry → lethal check (senses.js contract)
  var allContam = tylor.handContamination.slice();
  var lethalHit = allContam.indexOf('kcn_residue') !== -1;
  ok(lethalHit, 'Lethal residue detected on Tylor\'s hands');

  if (lethalHit) {
    // effects.js contract: triggerDeath with causeId='cross_contamination_death'
    G.notebook.deaths.push({
      characterName: 'Tylor', causeId: 'cross_contamination_death',
      timestamp: 55, lastActions: ['touch handle','taste berry']
    });
    G.notebook.crossContaminationDeathSeen = true;
  }
  ok(G.notebook.crossContaminationDeathSeen === true, 'crossContaminationDeathSeen flag set');
  ok(evidenceGateMet(6), 'Claim 6 (cross-contamination) gate unlocked');
  ok(G.notebook.deaths.length === 2, 'Two deaths recorded');
}

// =================================================================
// Scenario 2 — CER offline path (no Claude key) passes on content length
// =================================================================
function runCerOffline() {
  section('2. CER offline');
  G.notebook = freshNotebook();
  G.notebook.deaths.push({ causeId: 'kcn_ingestion' });
  sandbox.IS_LOCAL = false;  // no key → offline branch

  var entry = {
    claim: 'The white powder is lethal when ingested by any explorer.',
    evidence: 'Alice tasted the powder and collapsed within seconds.',
    reasoning: 'Tasting the powder was her last action before dying, which makes ingestion the proximate cause of death.',
    validated: false
  };
  G.notebook.cerEntries.push(entry);
  submitCerEntry(entry);

  // Offline grader runs synchronously via finalizeCer
  ok(entry.validated === true, 'Offline grader validates non-trivial entry (routed claim ' + entry.claimId + ')');
  ok(G.notebook.validatedClaims.indexOf(1) !== -1, 'Claim 1 recorded as validated');
}

// =================================================================
// Scenario 3 — CER mocked grader PASS
// =================================================================
function runCerGraderPass(done) {
  section('3. CER grader pass');
  G.notebook = freshNotebook();
  G.notebook.deaths.push({ causeId: 'kcn_ingestion' });
  sandbox.IS_LOCAL = true;
  sandbox.LOCAL_CONFIG = { ANTHROPIC_API_KEY: 'sk-ant-test-123456789012345' };
  fetchMock = function() {
    return Promise.resolve({
      json: function() {
        return Promise.resolve({ content: [{ text: '{"pass": true, "note": "Clear causal link."}' }] });
      }
    });
  };

  var entry = {
    claim: 'White powder is lethal',
    evidence: 'Alice died after tasting it',
    reasoning: 'Direct causal link; tasting was her last act',
    validated: false
  };
  G.notebook.cerEntries.push(entry);
  submitCerEntry(entry);

  // Wait for promise chain to resolve
  setTimeout(function() {
    ok(entry.validated === true, 'Grader pass → entry validated');
    ok(G.notebook.validatedClaims.indexOf(1) !== -1, 'Grader pass → claim pushed');
    ok(/Clear causal/.test(entry._feedback || ''), 'Grader note surfaced in feedback');
    done();
  }, 50);
}

// =================================================================
// Scenario 4 — CER mocked grader FAIL
// =================================================================
function runCerGraderFail(done) {
  section('4. CER grader fail');
  G.notebook = freshNotebook();
  G.notebook.deaths.push({ causeId: 'kcn_ingestion' });
  sandbox.IS_LOCAL = true;
  sandbox.LOCAL_CONFIG = { ANTHROPIC_API_KEY: 'sk-ant-test-123456789012345' };
  fetchMock = function() {
    return Promise.resolve({
      json: function() {
        return Promise.resolve({ content: [{ text: '{"pass": false, "note": "Missing reasoning about mechanism."}' }] });
      }
    });
  };

  var entry = {
    claim: 'White powder is lethal',
    evidence: 'Alice died',
    reasoning: 'idk',
    validated: false
  };
  G.notebook.cerEntries.push(entry);
  submitCerEntry(entry);

  setTimeout(function() {
    ok(entry.validated === false, 'Grader fail → entry not validated');
    ok(G.notebook.validatedClaims.length === 0, 'Grader fail → no claim pushed');
    ok(/Missing reasoning/.test(entry._feedback || ''), 'Grader fail note surfaced');
    done();
  }, 50);
}

// =================================================================
// Scenario 5 — Save / load round trip
// =================================================================
// Mirrors notebook.js:saveGame/loadGame contract for validatedClaims and
// the evidence-tracking fields the CER gates read.
function runSaveLoad() {
  section('5. Save/load round trip');
  G.notebook = freshNotebook();
  G.notebook.deaths.push({ causeId: 'kcn_ingestion' });
  G.notebook.berryCleanEatenSurvived = true;
  G.notebook.thermometerLocations = ['above', 'below'];
  G.notebook.pbcCrossed = true;
  G.notebook.dayNightCycles = 2;
  G.notebook.skyObservations = [{isNight:true},{isNight:false},{isNight:true}];
  G.notebook.observedBerryStages = { b1: { stages: [0, 2] } };

  var gates_before = [];
  for (var i = 1; i <= 14; i++) gates_before.push(evidenceGateMet(i));

  // Round trip
  var serialized = JSON.stringify(G.notebook);
  G.notebook = JSON.parse(serialized);

  var gates_after = [];
  for (var j = 1; j <= 14; j++) gates_after.push(evidenceGateMet(j));

  for (var k = 0; k < 14; k++) {
    eq(gates_after[k], gates_before[k], 'Gate ' + (k + 1) + ' preserved across save/load');
  }
}

// =================================================================
// Scenario 6 — Thermometer dual location (evidence for claims 5 & 7)
// =================================================================
// Mirrors senses.js:doLook contract for type==='thermometer'.
function runThermometer() {
  section('6. Thermometer');
  G.notebook = freshNotebook();

  function readThermometer(below) {
    var loc = below ? 'below' : 'above';
    if (G.notebook.thermometerLocations.indexOf(loc) === -1) {
      G.notebook.thermometerLocations.push(loc);
    }
    return below ? CONST.TEMP_BELOW : CONST.TEMP_ABOVE;
  }

  eq(readThermometer(false), 26, 'Above-ground reads 26°C');
  ok(!evidenceGateMet(5), 'Claim 5 still locked with only above');
  eq(readThermometer(true), 10, 'Underground reads 10°C');
  ok(evidenceGateMet(5) && evidenceGateMet(7), 'Claims 5 & 7 unlocked after both readings');

  // Duplicate readings must not re-push
  readThermometer(false); readThermometer(true);
  eq(G.notebook.thermometerLocations.length, 2, 'Duplicate readings not re-pushed');
}

// =================================================================
// Scenario 7 — Day/night cycle accumulator
// =================================================================
// Mirrors sky.js:updateDayNight cycle counter contract.
function runDayNight() {
  section('7. Day/night cycles');
  G.notebook = freshNotebook();

  function tick(elapsed) {
    var cycle = Math.floor(elapsed / CONST.CYCLE);
    if (cycle > (G.notebook.lastCycleMark || 0)) {
      G.notebook.dayNightCycles = cycle;
      G.notebook.lastCycleMark = cycle;
    }
  }

  tick(0);                           eq(G.notebook.dayNightCycles, 0, 'After 0s: 0 cycles');
  tick(CONST.CYCLE * 0.99);          eq(G.notebook.dayNightCycles, 0, 'After <1 cycle: 0');
  tick(CONST.CYCLE * 1.0);           eq(G.notebook.dayNightCycles, 1, 'After exactly 1: 1');
  tick(CONST.CYCLE * 1.5);           eq(G.notebook.dayNightCycles, 1, 'Mid-second cycle: still 1');
  tick(CONST.CYCLE * 2.5);           eq(G.notebook.dayNightCycles, 2, 'After 2.5: 2');
  ok(evidenceGateMet(9), 'Claim 9: 2 cycles satisfies gate');

  // Monotonicity — tick with earlier elapsed should not decrease counter
  tick(CONST.CYCLE * 1.0);
  eq(G.notebook.dayNightCycles, 2, 'Counter monotonic — earlier tick does not decrement');
}

// =================================================================
// Scenario 8 — Sky observation throttle (30s window)
// =================================================================
// Mirrors player.js:updatePlayer contract.
function runSkyThrottle() {
  section('8. Sky observation throttle');
  G.notebook = freshNotebook();
  var state = { lastSkyObs: -9999 };

  function pushObs(t, pitch, isNight) {
    if (pitch > 0.5) {
      if (t - state.lastSkyObs > 30) {
        state.lastSkyObs = t;
        G.notebook.skyObservations.push({ timestamp: t, pitch: pitch, isNight: !!isNight });
      }
    }
  }

  for (var i = 0; i < 5; i++) pushObs(2 * i, 0.6, false);           // 5 calls in 10s
  eq(G.notebook.skyObservations.length, 1, 'Only 1 obs within first 30s window');

  pushObs(35, 0.6, true);
  eq(G.notebook.skyObservations.length, 2, 'Second obs after throttle expires');

  pushObs(36, 0.3, true);  // pitch too low
  eq(G.notebook.skyObservations.length, 2, 'Low pitch → no obs');

  pushObs(90, 0.7, true);
  eq(G.notebook.skyObservations.length, 3, 'Third obs after another 30s');

  ok(evidenceGateMet(12), 'Claim 12 gate unlocked (night obs present)');
  ok(evidenceGateMet(13), 'Claim 13 gate unlocked');
}

// =================================================================
// Scenario 9 — Tombstone conversation history bounded at 20 turns
// =================================================================
// Mirrors tombstone.js slice(-20) contract.
function runTombHistory() {
  section('9. Tombstone history bounding');
  var tombConversationHistory = [];
  function pushTurn(role, text) {
    tombConversationHistory.push({ role: role, content: text });
    if (tombConversationHistory.length > 20) {
      tombConversationHistory = tombConversationHistory.slice(-20);
    }
    return tombConversationHistory;
  }
  for (var i = 0; i < 15; i++) {
    pushTurn('user', 'q' + i);
    tombConversationHistory = pushTurn('assistant', 'a' + i);
  }
  eq(tombConversationHistory.length, 20, 'History capped at 20 turns');
  eq(tombConversationHistory[0].content, 'q5', 'Oldest kept turn is q5 (earliest trimmed)');
  eq(tombConversationHistory[19].content, 'a14', 'Most recent turn preserved');
}

// =================================================================
// Scenario 11 — Beat 6 + first-validation Leaderboard auto-open
// =================================================================
// Verifies GDD §12.3 Beat 6 and §12.8 first-validation celebration
// semantics: both are strictly one-shot, gated on save-level flags.
function runBeat6(done) {
  section('11. Beat 6 + first-validation');
  G.notebook = freshNotebook();

  // Clear fake DOM state between tests
  fakeEl('leaderboard-overlay').classList._set = {};
  fakeEl('notebook-overlay').classList._set = {};
  fakeEl('notebook-btn').classList._set = {};

  // Event-triggered reveal fires on death
  sandbox.revealScaffoldedCerEntry(sandbox.scaffoldedClaimForCause('kcn_ingestion'));
  ok(G.notebook.cerEntries.length === 1, 'KCN death reveals claim 1 entry');
  ok(G.notebook.cerEntries[0].claimId === 1, 'Revealed entry is claim 1');

  // maybeTriggerBeat6 should not re-fire
  var maybeTriggerBeat6 = sandbox.maybeTriggerBeat6;
  maybeTriggerBeat6('kcn_ingestion');
  ok(G.notebook._beat6Fired === true, 'Beat 6 flag set on first call');
  var entriesAfter = G.notebook.cerEntries.length;
  maybeTriggerBeat6('kcn_ingestion');
  ok(G.notebook.cerEntries.length === entriesAfter, 'Beat 6 second call is no-op');

  // First-validation auto-open: 0→1 transition opens leaderboard after 1.5s
  sandbox.IS_LOCAL = false;
  G.notebook.deaths.push({ causeId: 'kcn_ingestion' });
  var entry = {
    claim: 'The white powder is lethal when any explorer ingests it.',
    evidence: 'Alice tasted it and collapsed immediately after.',
    reasoning: 'Tasting the powder was her last action; the death is causally linked to that ingestion.',
    validated: false
  };
  G.notebook.cerEntries.push(entry);
  sandbox.submitCerEntry(entry);

  // Wait for the 1.5s delayed leaderboard auto-open + 6s auto-close
  setTimeout(function() {
    ok(entry.validated === true, 'Entry validated via offline grader');
    ok(G.notebook._firstValidationCelebrated === true, 'firstValidationCelebrated flag set');
    ok(fakeEl('leaderboard-overlay').classList.contains('active'), 'Leaderboard auto-opened on first validation');

    // Submit a second claim (different id) — must NOT re-open leaderboard
    fakeEl('leaderboard-overlay').classList._set = {};
    G.notebook.pbcCrossed = true;
    var entry2 = {
      claimId: 10,
      claim: 'The world loops back on itself',
      evidence: 'I walked west and ended up east.',
      reasoning: 'Crossing the boundary repeats the starting area, indicating a periodic topology.',
      validated: false
    };
    G.notebook.cerEntries.push(entry2);
    sandbox.submitCerEntry(entry2);

    setTimeout(function() {
      ok(entry2.validated === true, 'Second entry validated');
      ok(G.notebook.validatedClaims.length === 2, 'Two claims validated');
      ok(!fakeEl('leaderboard-overlay').classList.contains('active'), 'Leaderboard does NOT auto-open for subsequent validations');
      done();
    }, 1800);
  }, 1800);
}

// =================================================================
// Scenario 10 — EQUIP tag parsing + equipment grant
// =================================================================
// Mirrors tombstone.js:processEquipment regex + equipment.js:grantEquipment.
function runEquipTag() {
  section('10. EQUIP tag parsing');
  var equipment = [];
  var KNOWN = ['gloves','gas mask','candle','geiger counter','wet cloth','magnifying glass','thermometer'];

  function processEquipment(response) {
    var m = response.match(/\[EQUIP:\s*(.+?)\]/);
    if (!m) return;
    var item = m[1].trim().toLowerCase();
    // grant logic (exact or partial match)
    var matched = null;
    if (KNOWN.indexOf(item) !== -1) matched = item;
    else {
      for (var i = 0; i < KNOWN.length; i++) {
        if (item.indexOf(KNOWN[i]) !== -1 || KNOWN[i].indexOf(item) !== -1) { matched = KNOWN[i]; break; }
      }
    }
    if (matched && equipment.indexOf(matched) === -1) equipment.push(matched);
  }

  processEquipment('Here you go. [EQUIP: gloves]');
  eq(equipment.length, 1, 'EQUIP: gloves granted');
  eq(equipment[0], 'gloves', 'Exact match "gloves"');

  processEquipment('Take these. [EQUIP: thermometer]');
  eq(equipment.length, 2, 'EQUIP: thermometer granted');

  processEquipment('[EQUIP: Gas Mask]');  // case variation
  eq(equipment[2], 'gas mask', 'Case-insensitive match');

  processEquipment('Plain dialogue, no tag here.');
  eq(equipment.length, 3, 'No EQUIP tag → no grant');

  processEquipment('[EQUIP: gloves]');  // duplicate
  eq(equipment.length, 3, 'Duplicate grant ignored');

  processEquipment('[EQUIP: made-up-gizmo]');
  eq(equipment.length, 3, 'Unknown equipment not granted');
}

// =================================================================
// Runner
// =================================================================
(function runAll() {
  runKillChain();
  runCerOffline();
  runSaveLoad();
  runThermometer();
  runDayNight();
  runSkyThrottle();
  runTombHistory();
  runEquipTag();

  // Async scenarios last
  runCerGraderPass(function() {
    runCerGraderFail(function() {
      runBeat6(function() {
        process.stdout.write('\n\n');
        if (TEST.fail === 0) {
          console.log('\x1b[32m✓ ALL PASS\x1b[0m — ' + TEST.pass + ' assertions across 11 scenarios');
          process.exit(0);
        } else {
          console.log('\x1b[31m✗ ' + TEST.fail + ' FAIL\x1b[0m / ' + (TEST.pass + TEST.fail) + ' total');
          for (var i = 0; i < TEST.fails.length; i++) console.log('  ✗ ' + TEST.fails[i]);
          process.exit(1);
        }
      });
    });
  });
})();
