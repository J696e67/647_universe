#!/usr/bin/env node
// Headless Layer A runner. Usage: node tests/run.js
// Loads js/cer.js inside a minimal vm sandbox with stubbed globals, then
// runs the same assertion suite as tests/test.html. Exits 0 on pass, 1 on fail.

'use strict';
var fs = require('fs');
var path = require('path');
var vm = require('vm');

var CER_SRC = fs.readFileSync(path.join(__dirname, '..', 'js', 'cer.js'), 'utf8');

// ---- Build sandbox ----
var sandbox = {
  console: console,
  IS_LOCAL: false,
  LOCAL_CONFIG: {},
  saveGame: function() {},
  showDiscoveryNotification: function() {},
  renderNotebook: function() {},
  fetch: function() { return Promise.reject(new Error('no fetch in tests')); },
  L: function(key, params) {
    if (!params) return key;
    var s = key;
    for (var k in params) s = s.replace('{' + k + '}', params[k]);
    return s;
  },
  G: { notebook: null, gameTime: 0, lang: 'en' },
  setTimeout: setTimeout,
  Math: Math,
  JSON: JSON,
  Object: Object,
  Array: Array,
  Date: Date,
  Promise: Promise,
  Error: Error
};
vm.createContext(sandbox);
vm.runInContext(CER_SRC, sandbox, { filename: 'cer.js' });

// Convenience aliases on host
var G = sandbox.G;
var CLAIM_DEFS = sandbox.CLAIM_DEFS;
var evidenceGateMet = sandbox.evidenceGateMet;
var matchClaimId = sandbox.matchClaimId;
var seedScaffoldedCerEntries = sandbox.seedScaffoldedCerEntries;
var finalizeCer = sandbox.finalizeCer;
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

// Q10 math mirror (pure)
var G_DECAY_Q10 = 2, G_DECAY_REF_TEMP = 20;
function getDecayRate(temp) { return Math.pow(G_DECAY_Q10, (temp - G_DECAY_REF_TEMP) / 10); }

// ---- Harness ----
var TEST = { pass: 0, fail: 0, fails: [] };
function assert(cond, name, detail) {
  if (cond) { TEST.pass++; }
  else { TEST.fail++; TEST.fails.push(name + (detail ? '  — ' + detail : '')); }
}
function assertEq(actual, expected, name) {
  var ok = (actual === expected) ||
    (typeof actual === 'number' && typeof expected === 'number' && Math.abs(actual - expected) < 1e-6);
  assert(ok, name, ok ? '' : 'expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
}

// ---- Tests (mirror of test.html) ----

// Evidence gates
G.notebook = freshNotebook();
assert(!evidenceGateMet(1), 'Claim 1: no deaths → locked');
G.notebook.deaths.push({ causeId: 'kcn_ingestion' });
assert(evidenceGateMet(1), 'Claim 1: KCN death → unlocked');

G.notebook = freshNotebook();
assert(!evidenceGateMet(2), 'Claim 2: no smell+death → locked');
G.notebook.entries.push({ action: 'smell', target: 'White Powder', result: 'bitter almond', timestamp: 1, characterName: 'A', location: 'r1' });
assert(!evidenceGateMet(2), 'Claim 2: smell only → locked');
G.notebook.deaths.push({ causeId: 'kcn_ingestion' });
assert(evidenceGateMet(2), 'Claim 2: smell + KCN death → unlocked');

G.notebook = freshNotebook();
assert(!evidenceGateMet(3), 'Claim 3: no clean-berry survival → locked');
G.notebook.berryCleanEatenSurvived = true;
assert(evidenceGateMet(3), 'Claim 3: clean berry survived → unlocked');

G.notebook = freshNotebook();
assert(!evidenceGateMet(4), 'Claim 4: no berry obs → locked');
G.notebook.observedBerryStages['b1'] = { stages: [0] };
assert(!evidenceGateMet(4), 'Claim 4: one stage → locked');
G.notebook.observedBerryStages['b1'].stages.push(2);
assert(evidenceGateMet(4), 'Claim 4: two stages → unlocked');

G.notebook = freshNotebook();
assert(!evidenceGateMet(5), 'Claim 5: no thermometer → locked');
assert(!evidenceGateMet(7), 'Claim 7: no thermometer → locked');
G.notebook.thermometerLocations = ['above'];
assert(!evidenceGateMet(5), 'Claim 5: only above → locked');
G.notebook.thermometerLocations.push('below');
assert(evidenceGateMet(5), 'Claim 5: above+below → unlocked');
assert(evidenceGateMet(7), 'Claim 7: above+below → unlocked');

G.notebook = freshNotebook();
assert(!evidenceGateMet(6), 'Claim 6: no cross-contam death → locked');
G.notebook.crossContaminationDeathSeen = true;
assert(evidenceGateMet(6), 'Claim 6: cross-contam death → unlocked');

G.notebook = freshNotebook();
assert(!evidenceGateMet(8), 'Claim 8: no cycles/obs → locked');
G.notebook.dayNightCycles = 2;
assert(!evidenceGateMet(8), 'Claim 8: cycles but no obs → locked');
G.notebook.skyObservations = [{isNight:false},{isNight:true},{isNight:true}];
assert(evidenceGateMet(8), 'Claim 8: 2 cycles + 3 obs → unlocked');

G.notebook = freshNotebook();
G.notebook.dayNightCycles = 1;
assert(!evidenceGateMet(9), 'Claim 9: 1 cycle → locked');
G.notebook.dayNightCycles = 2;
assert(evidenceGateMet(9), 'Claim 9: 2 cycles → unlocked');

G.notebook = freshNotebook();
assert(!evidenceGateMet(10), 'Claim 10: pbc not crossed → locked');
assert(!evidenceGateMet(11), 'Claim 11: pbc not crossed → locked');
G.notebook.pbcCrossed = true;
assert(evidenceGateMet(10), 'Claim 10: pbc crossed → unlocked');
assert(evidenceGateMet(11), 'Claim 11: pbc crossed → unlocked');

G.notebook = freshNotebook();
assert(!evidenceGateMet(12), 'Claim 12: no night obs → locked');
assert(!evidenceGateMet(13), 'Claim 13: no night obs → locked');
G.notebook.skyObservations = [{isNight:false}];
assert(!evidenceGateMet(12), 'Claim 12: only day obs → locked');
G.notebook.skyObservations.push({isNight:true});
assert(evidenceGateMet(12), 'Claim 12: night obs → unlocked');
assert(evidenceGateMet(13), 'Claim 13: night obs → unlocked');

G.notebook = freshNotebook();
assert(evidenceGateMet(14), 'Claim 14: external gate → always ready');

// matchClaimId
assertEq(matchClaimId('the white powder is KCN'), 2, 'match: KCN → 2');
assertEq(matchClaimId('cross-contamination from the door handle'), 6, 'match: cross → 6');
assertEq(matchClaimId('berry is safe to eat'), 3, 'match: berry safe → 3');
assertEq(matchClaimId('the world loops back on itself'), 10, 'match: loop → 10');
assertEq(matchClaimId('the world is flat, no horizon curvature'), 11, 'match: flat → 11');
assertEq(matchClaimId('Orion is visible at night'), 12, 'match: Orion → 12');
assertEq(matchClaimId('this is the northern hemisphere'), 13, 'match: northern → 13');
assertEq(matchClaimId('latitude is 40°N'), 14, 'match: latitude → 14');
assertEq(matchClaimId('the berry passes through stages of decay'), 4, 'match: decay → 4');
assertEq(matchClaimId('temperature affects things'), 5, 'match: temp → 5');
assertEq(matchClaimId('the moon is faster than the stars'), 8, 'match: celestial → 8');
assertEq(matchClaimId('random gibberish about nothing'), null, 'match: gibberish → null');
assertEq(matchClaimId(''), null, 'match: empty → null');
assertEq(matchClaimId(null), null, 'match: null → null');
assertEq(matchClaimId('氰化钾'), 2, 'match zh: 氰化钾 → 2');
assertEq(matchClaimId('交叉污染'), 6, 'match zh: 交叉污染 → 6');
assertEq(matchClaimId('回到原点'), 10, 'match zh: 回到原点 → 10');

// Scaffolded seeds
G.notebook = freshNotebook();
seedScaffoldedCerEntries();
assertEq(G.notebook.cerEntries.length, 3, 'seeds: 3 entries');
var e1 = G.notebook.cerEntries[0], e2 = G.notebook.cerEntries[1], e3 = G.notebook.cerEntries[2];
assert(e1.claim && e1.evidence && e1.reasoning, 'seed 1 fully populated');
assert(e2.claim && e2.evidence && !e2.reasoning, 'seed 2 reasoning blank');
assert(!e3.claim && e3.evidence && !e3.reasoning, 'seed 3 only evidence');
assertEq(e1.claimId, 1, 'seed 1 → claim 1');
assertEq(e2.claimId, 3, 'seed 2 → claim 3');
assertEq(e3.claimId, 6, 'seed 3 → claim 6');
assert(e1.scaffolded && e2.scaffolded && e3.scaffolded, 'all seeds flagged');
seedScaffoldedCerEntries();
assertEq(G.notebook.cerEntries.length, 3, 'seeds idempotent');

// finalizeCer
G.notebook = freshNotebook();
G.notebook.deaths.push({ causeId: 'kcn_ingestion' });
var entry = { claimId: 1, claim: 'c', evidence: 'e', reasoning: 'r', validated: false, tier: 1 };
G.notebook.cerEntries.push(entry);
finalizeCer(entry, true, 'ok');
assert(entry.validated === true, 'pass: validated true');
assertEq(G.notebook.validatedClaims.length, 1, 'pass: +1 validated claim');
assertEq(G.notebook.validatedClaims[0], 1, 'pass: claim id=1');
var entry2 = { claimId: 1, claim: 'c', evidence: 'e', reasoning: 'r', validated: false, tier: 1 };
finalizeCer(entry2, true, 'ok');
assertEq(G.notebook.validatedClaims.length, 1, 'pass: dup not re-pushed');

G.notebook = freshNotebook();
var bad = { claimId: 1, claim: 'c', evidence: 'e', reasoning: 'r', validated: false, tier: 1 };
finalizeCer(bad, false, 'nope');
assert(bad.validated === false, 'fail: validated false');
assertEq(G.notebook.validatedClaims.length, 0, 'fail: no push');

// submitCerEntry guards
G.notebook = freshNotebook();
var missing = { claim: '', evidence: '', reasoning: '', validated: false };
G.notebook.cerEntries.push(missing);
submitCerEntry(missing);
assert(!missing.validated, 'guard: empty not validated');

var noMatch = { claim: 'asdf qwerty', evidence: 'zxcv', reasoning: 'hjkl', validated: false };
G.notebook.cerEntries.push(noMatch);
submitCerEntry(noMatch);
assert(!noMatch.validated, 'guard: unroutable not validated');

var noEvidence = { claim: 'the white powder is KCN', evidence: 'x', reasoning: 'y', validated: false, claimId: null };
G.notebook.cerEntries.push(noEvidence);
submitCerEntry(noEvidence);
assert(!noEvidence.validated, 'guard: gate unmet → not validated');

// Q10
assertEq(getDecayRate(20), 1.0, 'Q10 @20°C = 1');
assertEq(getDecayRate(30), 2.0, 'Q10 @30°C = 2');
assertEq(getDecayRate(10), 0.5, 'Q10 @10°C = 0.5');

// CLAIM_DEFS integrity
assertEq(CLAIM_DEFS.length, 14, '14 claims defined');
var tiers = {1:0,2:0,3:0,4:0,5:0,6:0};
var ids = {};
for (var i = 0; i < CLAIM_DEFS.length; i++) {
  var d = CLAIM_DEFS[i];
  assert(typeof d.id === 'number', 'claim has numeric id');
  assert(!ids[d.id], 'claim ' + d.id + ' id is unique');
  assert(typeof d.evidence === 'function', 'claim ' + d.id + ' has evidence fn');
  assert(typeof d.rubric === 'string' && d.rubric.length > 20, 'claim ' + d.id + ' has rubric');
  ids[d.id] = true;
  tiers[d.tier]++;
}
assertEq(tiers[1], 2, 'Tier 1 has 2 claims');
assertEq(tiers[2], 1, 'Tier 2 has 1 claim');
assertEq(tiers[3], 2, 'Tier 3 has 2 claims');
assertEq(tiers[4], 3, 'Tier 4 has 3 claims');
assertEq(tiers[5], 3, 'Tier 5 has 3 claims');
assertEq(tiers[6], 3, 'Tier 6 has 3 claims');

// ---- Report ----
if (TEST.fail === 0) {
  console.log('\x1b[32m✓ ALL PASS\x1b[0m — ' + TEST.pass + ' assertions');
  process.exit(0);
} else {
  console.log('\x1b[31m✗ ' + TEST.fail + ' FAIL\x1b[0m / ' + (TEST.pass + TEST.fail) + ' total');
  for (var i = 0; i < TEST.fails.length; i++) console.log('  ✗ ' + TEST.fails[i]);
  process.exit(1);
}
