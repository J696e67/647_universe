'use strict';

// ===================== CER BOARD — 14 CANONICAL CLAIMS =====================
// Three tiers — two visible on the leaderboard, one hidden.
//
//   Tier 1 (leaderboard, 4 claims):
//     3  Red berry is non-toxic
//     1  White powder is toxic
//     2  White powder is potassium cyanide
//     7  Above- and below-ground temperatures differ
//
//   Tier 2 (leaderboard, 3 claims):
//     4  Berry undergoes stage-based decay
//     5  Temperature affects berry decay rate
//     6  White powder causes cross-contamination
//
//   Tier 3 — HIDDEN on the leaderboard (7 claims). Evidence gates still
//   operate normally; CER Board still accepts these entries. But the
//   leaderboard does not list them until each is individually validated.
//   Players may also submit free-form claims outside these 14 — if the
//   Claude grader judges the CER logic sound, those appear too.
//
//     8  Sun, moon, stars move at different speeds
//     9  Celestial bodies share a rotation axis
//    10  World has periodic boundary conditions
//    11  World is flat
//    12  Night sky matches real constellations
//    13  World is in the northern hemisphere
//    14  World is at approximately 40°N latitude

var CLAIM_DEFS = [
  // ---- Tier 1 (visible on leaderboard) ----
  { id: 3,  tier: 1, titleKey: 'claim.3.title',
    evidence: function(n) { return n.berryCleanEatenSurvived === true; },
    // Minimal sufficient rubric — matches the scope of the evidence gate
    // (clean-handed survival). The refinement "only when uncontaminated"
    // is the territory of claim 6 (cross-contamination), not a requirement
    // on this rubric. Players naturally revisit claim 3 AFTER discovering
    // claim 6 — that's the pedagogical trap, not a grader rejection.
    rubric: 'Player claims the red berry is non-toxic to explorers who eat it, supported by evidence of an explorer surviving after eating it. A simple logically-sound inference from the evidence passes.' },
  { id: 1,  tier: 1, titleKey: 'claim.1.title',
    evidence: function(n) { return n.deaths.some(function(d){ return d.causeId === 'kcn_ingestion'; }); },
    rubric: 'Player states a causal link between the white powder and a death. A survival claim or vague wording fails.' },
  { id: 2,  tier: 1, titleKey: 'claim.2.title',
    evidence: function(n) {
      var smelled = n.entries.some(function(e){ return (e.action.indexOf('smell') !== -1) && /powder|白色|粉末|kcn/i.test(e.target+e.result); });
      var died    = n.deaths.some(function(d){ return d.causeId === 'kcn_ingestion'; });
      return smelled && died;
    },
    rubric: 'Player identifies the white powder as potassium cyanide (KCN) by linking the bitter-almond smell to chemistry knowledge. Simply saying "poison" is not enough.' },
  { id: 7,  tier: 1, titleKey: 'claim.7.title',
    evidence: function(n) { return n.thermometerLocations.indexOf('above') !== -1 && n.thermometerLocations.indexOf('below') !== -1; },
    rubric: 'Player states that above-ground and underground temperatures differ as a measurable fact, with specific values or direction (warmer/cooler).' },

  // ---- Tier 2 (visible on leaderboard) ----
  { id: 4,  tier: 2, titleKey: 'claim.4.title',
    evidence: function(n) {
      for (var k in n.observedBerryStages) {
        if (n.observedBerryStages[k].stages && n.observedBerryStages[k].stages.length >= 2) return true;
      }
      return false;
    },
    rubric: 'Player describes the berry as passing through a sequence of distinct stages (fresh → overripe → rotting, etc.), not just "it changed".' },
  { id: 5,  tier: 2, titleKey: 'claim.5.title',
    evidence: function(n) { return n.thermometerLocations.indexOf('above') !== -1 && n.thermometerLocations.indexOf('below') !== -1; },
    rubric: 'Player links the temperature difference between above- and below-ground to a difference in berry decay rate.' },
  { id: 6,  tier: 2, titleKey: 'claim.6.title',
    evidence: function(n) { return n.crossContaminationDeathSeen === true; },
    rubric: 'Player identifies contact transfer (residue on hands/surfaces) as the mechanism behind a death where the victim did not touch the powder directly.' },

  // ---- Tier 3 (HIDDEN on leaderboard until individually validated) ----
  { id: 8,  tier: 3, titleKey: 'claim.8.title',
    evidence: function(n) { return n.dayNightCycles >= 2 && n.skyObservations.length >= 3; },
    rubric: 'Player distinguishes the relative speeds of specific celestial bodies (sun vs moon vs stars). Generic "things in the sky move" fails.' },
  { id: 9,  tier: 3, titleKey: 'claim.9.title',
    evidence: function(n) { return n.dayNightCycles >= 2; },
    rubric: 'Player identifies a common rotational axis or center shared by sun/moon/stars.' },
  { id: 10, tier: 3, titleKey: 'claim.10.title',
    evidence: function(n) { return n.pbcCrossed === true; },
    rubric: 'Player describes the world\'s looping topology (walk far enough in one direction and return) — not merely "I ended up back here".' },
  { id: 11, tier: 3, titleKey: 'claim.11.title',
    evidence: function(n) { return n.pbcCrossed === true; },
    rubric: 'Player articulates that the world is flat, citing an observation inconsistent with a sphere (no horizon curvature, no disappearance bottom-first, PBC wrap).' },
  { id: 12, tier: 3, titleKey: 'claim.12.title',
    evidence: function(n) { return n.skyObservations.some(function(s){ return s.isNight; }); },
    rubric: 'Player names at least one specific real-world constellation visible in the night sky (Orion, Big Dipper, Cassiopeia, etc.).' },
  { id: 13, tier: 3, titleKey: 'claim.13.title',
    evidence: function(n) { return n.skyObservations.some(function(s){ return s.isNight; }); },
    rubric: 'Player identifies that the world is in the northern hemisphere — cites Polaris or a northern-only constellation.' },
  { id: 14, tier: 3, titleKey: 'claim.14.title',
    // External-knowledge claim — needs night-sky observation as precondition.
    evidence: function(n) { return n.skyObservations && n.skyObservations.some(function(o){ return o.isNight; }); },
    rubric: 'Player states an approximate latitude (~40°N) with reasoning, e.g. the altitude of Polaris ≈ observer latitude.' }
];

// Visible tiers on the leaderboard. Tier 3 is hidden; its claims appear
// individually only after each is validated. Free-form (non-canonical)
// validated claims appear in their own "Player Discoveries" section.
var LEADERBOARD_VISIBLE_TIERS = [1, 2];

function getClaimDef(id) {
  for (var i = 0; i < CLAIM_DEFS.length; i++) if (CLAIM_DEFS[i].id === id) return CLAIM_DEFS[i];
  return null;
}

function evidenceGateMet(claimId) {
  var d = getClaimDef(claimId);
  return d ? !!d.evidence(G.notebook) : false;
}

// ===================== EVIDENCE EXTRACTION (GDD §8.1) =====================
// Every claim's evidence text is composed from REAL records in G.notebook.
// No hardcoded character names. If insufficient data, return a transparent
// placeholder rather than fabricated text.

function _fmtTime(t) {
  if (typeof t !== 'number') return '?';
  var m = Math.floor(t / 60), s = Math.floor(t % 60);
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function _interpolate(template, vars) {
  var s = template;
  for (var k in vars) s = s.split('{' + k + '}').join(String(vars[k]));
  return s;
}

function _findDeath(causeId) {
  var d = G.notebook.deaths || [];
  for (var i = 0; i < d.length; i++) if (d[i].causeId === causeId) return { rec: d[i], index: i + 1 };
  return null;
}

function _findCleanBerrySurvival() {
  // Scan notebook.entries for a taste action on a berry by a character whose
  // hand contamination was empty at that moment. We don't store hand state
  // per entry, so we approximate: the berryCleanEatenSurvived flag is set
  // by senses.js when the conditions match. We return the most recent taste
  // action on Red Berry as the representative entry.
  var ents = G.notebook.entries || [];
  for (var i = ents.length - 1; i >= 0; i--) {
    var e = ents[i];
    if (e.action && e.action.indexOf('taste') !== -1 &&
        e.target && /berry|\u7EA2\u679C/i.test(e.target) &&
        e.result && !/lethal|collapse|\u5012\u4E0B|\u5947\u602A/i.test(e.result)) {
      return e;
    }
  }
  return null;
}

function _extractEvidence(claimId) {
  var n = G.notebook;
  switch (claimId) {
    case 1: { // KCN lethal
      var d = _findDeath('kcn_ingestion');
      if (!d) return L('evidence.unavailable');
      return _interpolate(L('evidence.death.kcn'), {
        name: d.rec.characterName, location: d.rec.location, n: d.index, ts: _fmtTime(d.rec.timestamp)
      });
    }
    case 2: { // KCN identified by smell + death
      var d2 = _findDeath('kcn_ingestion');
      var deathTxt = d2 ? _interpolate(L('evidence.death.kcn'),
        { name: d2.rec.characterName, location: d2.rec.location, n: d2.index, ts: _fmtTime(d2.rec.timestamp) })
        : L('evidence.placeholder.no_smell_kcn');
      // Find smell entry
      var smellTxt = L('evidence.placeholder.no_smell_kcn');
      var ents2 = n.entries || [];
      for (var i2 = 0; i2 < ents2.length; i2++) {
        var e2 = ents2[i2];
        if (e2.action && e2.action.indexOf('smell') !== -1 &&
            e2.target && /powder|\u7C89\u672B/i.test(e2.target)) {
          smellTxt = '(' + e2.characterName + ' ' + L('action.smell') + ': "' + e2.result + '" t=' + _fmtTime(e2.timestamp) + ')';
          break;
        }
      }
      return smellTxt + ' ' + deathTxt;
    }
    case 3: { // Berry safe
      var s = _findCleanBerrySurvival();
      if (!s) return L('evidence.unavailable');
      return _interpolate(L('evidence.berry_clean'), {
        name: s.characterName, location: s.location, ts: _fmtTime(s.timestamp)
      });
    }
    case 4: { // Berry decay stages
      var stagesAll = [];
      var earliest = Infinity, latest = 0;
      for (var k4 in n.observedBerryStages) {
        var arr = (n.observedBerryStages[k4] && n.observedBerryStages[k4].stages) || [];
        for (var j = 0; j < arr.length; j++) if (stagesAll.indexOf(arr[j]) === -1) stagesAll.push(arr[j]);
      }
      if (stagesAll.length < 2) return L('evidence.unavailable');
      stagesAll.sort();
      // Fall back: use the entries log time bracket
      var lookEnts = (n.entries || []).filter(function(e){ return e.action && e.action.indexOf('look') !== -1 && e.target && /berry|\u7EA2\u679C/i.test(e.target); });
      if (lookEnts.length) {
        earliest = lookEnts[0].timestamp;
        latest = lookEnts[lookEnts.length - 1].timestamp;
      }
      return _interpolate(L('evidence.berry_stages'), {
        stages: stagesAll.join(', '),
        fromTs: _fmtTime(earliest === Infinity ? 0 : earliest),
        toTs: _fmtTime(latest)
      });
    }
    case 5:
    case 7: { // Above- vs below-ground temperatures (claim 5 + 7 share evidence)
      var locs = n.thermometerLocations || [];
      if (locs.indexOf('above') === -1 || locs.indexOf('below') === -1) return L('evidence.unavailable');
      var aboveTs = '?', belowTs = '?';
      var thermoEnts = (n.entries || []).filter(function(e){ return e.target && /thermometer|\u6E29\u5EA6\u8BA1/i.test(e.target); });
      for (var ti = 0; ti < thermoEnts.length; ti++) {
        var te = thermoEnts[ti];
        if (/26/.test(te.result || '') && aboveTs === '?') aboveTs = _fmtTime(te.timestamp);
        if (/10/.test(te.result || '') && belowTs === '?') belowTs = _fmtTime(te.timestamp);
      }
      return _interpolate(L('evidence.thermo_dual'), { tsAbove: aboveTs, tsBelow: belowTs });
    }
    case 6: { // Cross-contamination
      var d6 = _findDeath('cross_contamination_death');
      if (!d6) return L('evidence.unavailable');
      var deathPart = _interpolate(L('evidence.death.cross'), {
        name: d6.rec.characterName, location: d6.rec.location, n: d6.index, ts: _fmtTime(d6.rec.timestamp)
      });
      // Optional: contrast with clean-berry survival
      var contrast = L('evidence.placeholder.no_clean_berry');
      var sb = _findCleanBerrySurvival();
      if (sb) {
        contrast = _interpolate(L('evidence.berry_clean'), {
          name: sb.characterName, location: sb.location, ts: _fmtTime(sb.timestamp)
        });
      }
      return contrast + ' ' + deathPart;
    }
    case 8:
    case 9: { // Celestial body speeds / shared rotation axis
      var obs = (n.skyObservations || []).length;
      if (n.dayNightCycles < 2) return L('evidence.unavailable');
      var lastObs = obs ? n.skyObservations[obs - 1].timestamp : 0;
      return _interpolate(L('evidence.cycles'), {
        cycles: n.dayNightCycles, obs: obs, ts: _fmtTime(lastObs)
      });
    }
    case 10:
    case 11: { // PBC / world is flat
      if (!n.pbcCrossed) return L('evidence.unavailable');
      // We don't store the exact PBC-crossed timestamp; approximate from entries
      return _interpolate(L('evidence.pbc'), { ts: _fmtTime(G.gameTime) });
    }
    case 12:
    case 13: { // Constellations / northern hemisphere
      var nightObs = (n.skyObservations || []).filter(function(o){ return o.isNight; });
      if (!nightObs.length) return L('evidence.unavailable');
      return _interpolate(L('evidence.night_sky'), {
        n: nightObs.length, ts: _fmtTime(nightObs[nightObs.length - 1].timestamp)
      });
    }
    case 14: { // Latitude — external knowledge
      return L('evidence.unavailable');
    }
  }
  return L('evidence.unavailable');
}

// ===================== ENQUEUE LOGIC (GDD §8.1, §12.4) =====================
// Whenever an evidence gate is satisfied, enqueue a CER entry. The very
// first entry ever enqueued in this save becomes the demo (full populate);
// all subsequent entries are evidence-only.

function _hasEntryForClaim(claimId) {
  var entries = G.notebook.cerEntries || [];
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].claimId === claimId) return true;
  }
  return false;
}

function _isFirstEverEntry() {
  // The first ever entry is the one created when cerEntries is empty AND
  // no entry has been demo-marked yet (in case someone deletes the demo).
  var entries = G.notebook.cerEntries || [];
  if (entries.length > 0) return false;
  return !G.notebook._demoEntryAssigned;
}

function enqueueCerEntry(claimId, gateMetAt) {
  if (!G.notebook.cerEntries) G.notebook.cerEntries = [];
  if (_hasEntryForClaim(claimId)) return null; // idempotent
  var def = getClaimDef(claimId);
  if (!def) return null;
  var demo = _isFirstEverEntry();
  var ts = (typeof gateMetAt === 'number') ? gateMetAt : G.gameTime;
  var entry = {
    id: 'cer_' + Math.floor(ts * 1000) + '_' + claimId,
    claimId: claimId,
    claim: demo ? L(def.titleKey) : '',
    evidence: _extractEvidence(claimId),
    reasoning: demo ? L('claim.' + claimId + '.demo_reasoning') : '',
    validated: false,
    tier: def.tier,
    isDemoEntry: demo,
    enqueuedAt: G.gameTime,
    gateMetAt: ts
  };
  G.notebook.cerEntries.push(entry);
  if (demo) G.notebook._demoEntryAssigned = true;
  if (typeof saveGame === 'function') saveGame();
  return entry;
}

// Scan visible-tier claims; enqueue any whose gate is met but not yet on
// the board. Hidden-tier (tier 3) claims are NOT auto-enqueued — players
// must discover and articulate them via the "+ New Claim" button. Their
// evidence gates still operate (used by the leaderboard once validated).
function checkAndEnqueueGates() {
  var queued = [];
  for (var i = 0; i < CLAIM_DEFS.length; i++) {
    var def = CLAIM_DEFS[i];
    if (LEADERBOARD_VISIBLE_TIERS.indexOf(def.tier) === -1) continue;
    if (_hasEntryForClaim(def.id)) continue;
    if (def.evidence(G.notebook)) {
      enqueueCerEntry(def.id, G.gameTime);
      queued.push(def.id);
    }
  }
  return queued;
}

// ===================== BACK-COMPAT SHIMS (for tests + transitional code) =====================
// Old code paths called revealScaffoldedCerEntry(claimId) and
// scaffoldedClaimForCause(causeId). Keep these working as thin wrappers so
// the test suite continues to pass while we migrate.

function revealScaffoldedCerEntry(claimId) {
  return enqueueCerEntry(claimId, G.gameTime);
}

function seedScaffoldedCerEntries() {
  enqueueCerEntry(1, 0);
  enqueueCerEntry(3, 0);
  enqueueCerEntry(6, 0);
}

function scaffoldedClaimForCause(causeId) {
  if (causeId === 'kcn_ingestion') return 1;
  if (causeId === 'cross_contamination_death') return 6;
  return null;
}

// ===================== CER BOARD UI =====================
function renderCerBoard() {
  var content = document.getElementById('notebook-content');
  var filters = document.getElementById('notebook-filters');

  filters.innerHTML = '';
  var logTab = document.createElement('button');
  logTab.textContent = L('notebook.log');
  logTab.addEventListener('click', function() { NOTEBOOK_MODE = 'log'; renderNotebook(); });
  filters.appendChild(logTab);

  var cerTab = document.createElement('button');
  cerTab.textContent = L('notebook.cer');
  cerTab.className = 'active';
  filters.appendChild(cerTab);

  var sep = document.createElement('span');
  sep.style.cssText = 'color:rgba(255,255,255,0.15);padding:0 4px;';
  sep.textContent = '|';
  filters.appendChild(sep);

  var addBtn = document.createElement('button');
  addBtn.textContent = L('cer.new');
  addBtn.addEventListener('click', function() { openCerEditor(null); });
  filters.appendChild(addBtn);

  var lbBtn = document.createElement('button');
  lbBtn.textContent = L('notebook.leaderboard');
  lbBtn.addEventListener('click', function() {
    document.getElementById('notebook-overlay').classList.remove('active');
    showLeaderboard();
  });
  filters.appendChild(lbBtn);

  content.innerHTML = '';

  var intro = document.createElement('div');
  intro.className = 'cer-intro';
  intro.textContent = L('cer.intro');
  content.appendChild(intro);

  // Filter out hidden-tier auto-enqueued entries that haven't been
  // engaged with. Player-authored entries (no enqueuedAt) and any
  // entry the player edited/validated remain visible.
  var entries = (G.notebook.cerEntries || []).filter(function(e) {
    if (!e.claimId) return true;                 // free-form: always show
    var def = getClaimDef(e.claimId);
    if (!def || def.tier !== 3) return true;     // visible tier: always show
    if (e.validated) return true;                // validated: always show
    if (e.claim || e.reasoning) return true;     // player engaged: keep
    if (!e.enqueuedAt) return true;              // not auto-enqueued: keep
    return false;                                // auto-enqueued tier 3, untouched: hide
  });
  if (entries.length === 0) {
    var empty = document.createElement('div');
    empty.style.cssText = 'color:#555;text-align:center;padding:40px;';
    empty.textContent = L('cer.no_claims');
    content.appendChild(empty);
    return;
  }

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var card = document.createElement('div');
    card.className = 'cer-card' + (e.validated ? ' validated' : '');

    var tierTag = document.createElement('span');
    tierTag.className = 'cer-tier';
    tierTag.textContent = 'T' + (e.tier || '?');
    card.appendChild(tierTag);

    if (e.validated) {
      var badge = document.createElement('span');
      badge.className = 'cer-validated';
      badge.textContent = '✓ ' + L('cer.validated');
      card.appendChild(badge);
    }

    card.appendChild(cerField(L('cer.claim'),     e.claim     || '—'));
    card.appendChild(cerField(L('cer.evidence'),  e.evidence  || '—'));
    card.appendChild(cerField(L('cer.reasoning'), e.reasoning || '—'));

    var actions = document.createElement('div');
    actions.className = 'cer-actions';
    var editBtn = document.createElement('button');
    editBtn.textContent = L('cer.edit');
    editBtn.addEventListener('click', (function(ent){ return function(){ openCerEditor(ent); }; })(e));
    actions.appendChild(editBtn);

    if (!e.validated) {
      var submitBtn = document.createElement('button');
      submitBtn.textContent = L('cer.submit');
      submitBtn.addEventListener('click', (function(ent){ return function(){ submitCerEntry(ent); }; })(e));
      actions.appendChild(submitBtn);
    }
    card.appendChild(actions);

    if (e._feedback) {
      var fb = document.createElement('div');
      fb.className = 'cer-feedback';
      fb.textContent = e._feedback;
      card.appendChild(fb);
    }

    content.appendChild(card);
  }
}

function cerField(label, text) {
  var wrap = document.createElement('div');
  wrap.className = 'cer-field';
  var lbl = document.createElement('div'); lbl.className = 'cer-label'; lbl.textContent = label;
  var val = document.createElement('div'); val.className = 'cer-value'; val.textContent = text;
  wrap.appendChild(lbl); wrap.appendChild(val);
  return wrap;
}

function openCerEditor(existing) {
  var overlay = document.createElement('div');
  overlay.id = 'cer-editor';
  overlay.innerHTML =
    '<div class="cer-editor-box">' +
      '<h3>' + (existing ? L('cer.editing') : L('cer.new')) + '</h3>' +
      '<label>' + L('cer.claim') + '</label>' +
      '<textarea id="cer-claim" rows="2"></textarea>' +
      '<label>' + L('cer.evidence') + '</label>' +
      '<textarea id="cer-evidence" rows="3"></textarea>' +
      '<label>' + L('cer.reasoning') + '</label>' +
      '<textarea id="cer-reasoning" rows="4"></textarea>' +
      '<div class="cer-editor-actions">' +
        '<button id="cer-cancel">' + L('cer.cancel') + '</button>' +
        '<button id="cer-save" class="primary">' + L('cer.save') + '</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);
  document.getElementById('cer-claim').value     = existing ? (existing.claim     || '') : '';
  document.getElementById('cer-evidence').value  = existing ? (existing.evidence  || '') : '';
  document.getElementById('cer-reasoning').value = existing ? (existing.reasoning || '') : '';

  document.getElementById('cer-cancel').addEventListener('click', function() {
    document.body.removeChild(overlay);
  });
  document.getElementById('cer-save').addEventListener('click', function() {
    var claim     = document.getElementById('cer-claim').value.trim();
    var evidence  = document.getElementById('cer-evidence').value.trim();
    var reasoning = document.getElementById('cer-reasoning').value.trim();
    if (existing) {
      existing.claim = claim; existing.evidence = evidence; existing.reasoning = reasoning;
    } else {
      G.notebook.cerEntries.push({
        id: 'cer_' + Date.now(),
        claimId: null,
        claim: claim, evidence: evidence, reasoning: reasoning,
        validated: false, tier: null, scaffolded: false
      });
    }
    saveGame();
    document.body.removeChild(overlay);
    renderNotebook();
  });
}

// ===================== HOLISTIC EVALUATOR =====================
// Submit a CER entry — call Claude Sonnet with a rubric-driven prompt.
// Returns via on-screen feedback whether the articulation passes.

function matchClaimId(text) {
  if (!text) return null;
  var t = text.toLowerCase();
  // Crude lexical hint — final decision is Claude's.
  if (/kcn|cyanide|氰化/.test(t))                           return 2;
  if (/cross.?contam|residue|交叉|污染|残留/.test(t))        return 6;
  if (/berry.*(safe|non.?toxic)|红果.*(安全|无毒)/.test(t))  return 3;
  if (/powder.*(lethal|poison|kill)|粉末.*(致命|毒|死)/.test(t)) return 1;
  if (/decay|stage|fresh|rot|腐|阶段/.test(t))               return 4;
  if (/temperature|warm|cool|q10|温度|温差/.test(t))          return 5;
  if (/underground|below|地下|低温/.test(t))                  return 7;
  if (/axis|rotation|pole|轴|极/.test(t))                    return 9;
  if (/pbc|periodic|loop|wrap|回到|循环|边界/.test(t))        return 10;
  if (/flat|horizon|平坦|球/.test(t))                        return 11;
  if (/orion|dipper|cassiopeia|polaris|猎户|北斗|仙后|北极星/.test(t)) return 12;
  if (/northern hemisphere|北半球/.test(t))                   return 13;
  if (/40.?n|latitude|纬度/.test(t))                         return 14;
  if (/speed|faster|slower|速度/.test(t) && /moon|star|sun|月|星|日/.test(t)) return 8;
  return null;
}

function submitCerEntry(entry) {
  // Trim before checking — pure whitespace must not pass the gate
  entry.claim     = (entry.claim     || '').trim();
  entry.evidence  = (entry.evidence  || '').trim();
  entry.reasoning = (entry.reasoning || '').trim();
  if (!entry.claim || !entry.evidence || !entry.reasoning) {
    entry._feedback = L('cer.incomplete');
    renderNotebook();
    return;
  }
  // Determine claim id via lexical shortlist
  if (!entry.claimId) {
    entry.claimId = matchClaimId(entry.claim + ' ' + entry.reasoning);
  }
  // Free-form path: player is making a non-canonical claim. Evaluate
  // logical soundness rather than rubric match.
  if (!entry.claimId) {
    entry._feedback = L('cer.evaluating');
    renderNotebook();
    evaluateFreeFormCer(entry);
    return;
  }
  var def = getClaimDef(entry.claimId);
  if (!def) { entry._feedback = L('cer.no_match'); renderNotebook(); return; }
  entry.tier = def.tier;

  if (!evidenceGateMet(entry.claimId)) {
    entry._feedback = L('cer.no_evidence');
    renderNotebook();
    return;
  }

  entry._feedback = L('cer.evaluating');
  renderNotebook();

  evaluateArticulationHolistic(entry, def);
}

function evaluateArticulationHolistic(entry, def) {
  var hasKey = (typeof IS_LOCAL !== 'undefined') && IS_LOCAL &&
               (typeof LOCAL_CONFIG !== 'undefined') && LOCAL_CONFIG.ANTHROPIC_API_KEY &&
               LOCAL_CONFIG.ANTHROPIC_API_KEY.indexOf('sk-ant-') === 0;

  if (!hasKey) {
    // Offline path — pass if text is non-trivial and evidence gate met.
    var wc = (entry.claim + entry.reasoning).split(/\s+/).length;
    finalizeCer(entry, wc >= 8, L('cer.offline_note'));
    return;
  }

  var prompt =
    'You are grading a student\'s scientific-reasoning entry in a discovery game.\n' +
    'The student has satisfied the EVIDENCE GATE by making the required in-world observations.\n' +
    'You only judge the ARTICULATION. Apply the rubric holistically — do NOT keyword match.\n\n' +
    'CLAIM TARGET: ' + L(def.titleKey) + '\n' +
    'RUBRIC: ' + def.rubric + '\n\n' +
    'STUDENT ENTRY:\n' +
    'Claim: '     + entry.claim     + '\n' +
    'Evidence: '  + entry.evidence  + '\n' +
    'Reasoning: ' + entry.reasoning + '\n\n' +
    'Respond with a JSON object on a single line: {"pass": true|false, "note": "one short sentence of feedback for the student"}\n' +
    'PASS only if the entry meets the rubric. Be strict but fair. Do not reveal game answers in your note.';

  fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': LOCAL_CONFIG.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      system: 'You are a terse, fair grader. Respond ONLY with a single JSON object. No prose before or after.',
      messages: [{ role: 'user', content: prompt }]
    })
  }).then(function(r) { return r.json(); }).then(function(data) {
    var text = (data && data.content && data.content[0] && data.content[0].text) || '';
    var m = text.match(/\{[\s\S]*\}/);
    var pass = false, note = L('cer.eval_unparseable');
    if (m) {
      try {
        var obj = JSON.parse(m[0]);
        pass = !!obj.pass;
        if (obj.note) note = obj.note;
      } catch(e) {}
    }
    finalizeCer(entry, pass, note);
  }).catch(function() {
    finalizeCer(entry, false, L('cer.eval_error'));
  });
}

// Free-form path: player submitted a claim outside the 14 canonical ones.
// Grader judges LOGICAL SOUNDNESS of the CER chain — does the evidence
// actually support the claim, and is the reasoning structurally valid?
// If pass: the entry joins G.notebook.freeFormValidatedClaims and
// appears in the leaderboard's "Player Discoveries" section.
function evaluateFreeFormCer(entry) {
  var hasKey = (typeof IS_LOCAL !== 'undefined') && IS_LOCAL &&
               (typeof LOCAL_CONFIG !== 'undefined') && LOCAL_CONFIG.ANTHROPIC_API_KEY &&
               LOCAL_CONFIG.ANTHROPIC_API_KEY.indexOf('sk-ant-') === 0;

  if (!hasKey) {
    var wc = (entry.claim + entry.reasoning).split(/\s+/).length;
    finalizeFreeFormCer(entry, wc >= 12, L('cer.offline_note'));
    return;
  }

  var prompt =
    'You are grading a free-form CER (Claim-Evidence-Reasoning) entry from a player in a science discovery game.\n' +
    'The player is making a claim NOT on the game\'s canonical list. Your job is to judge whether the CER chain is LOGICALLY SOUND.\n\n' +
    'Criteria:\n' +
    '1. Does the Evidence actually support the Claim (not merely describe an unrelated observation)?\n' +
    '2. Is the Reasoning a valid inferential step from Evidence to Claim?\n' +
    '3. Does the Claim reference something internally consistent with what could be observed in a game world?\n' +
    'You do NOT need to judge whether the claim is "true" in the real world — only whether the argument is coherent.\n\n' +
    'STUDENT ENTRY:\n' +
    'Claim: '     + entry.claim     + '\n' +
    'Evidence: '  + entry.evidence  + '\n' +
    'Reasoning: ' + entry.reasoning + '\n\n' +
    'Respond with a JSON object on a single line: {"pass": true|false, "note": "one short sentence of feedback"}\n' +
    'PASS only if all three criteria are met. Be strict about evidence-claim fit. Do not reveal game answers.';

  fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': LOCAL_CONFIG.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      system: 'You are a terse, fair grader of logical soundness. Respond ONLY with a single JSON object.',
      messages: [{ role: 'user', content: prompt }]
    })
  }).then(function(r) { return r.json(); }).then(function(data) {
    var text = (data && data.content && data.content[0] && data.content[0].text) || '';
    var m = text.match(/\{[\s\S]*\}/);
    var pass = false, note = L('cer.eval_unparseable');
    if (m) {
      try {
        var obj = JSON.parse(m[0]);
        pass = !!obj.pass;
        if (obj.note) note = obj.note;
      } catch(e) {}
    }
    finalizeFreeFormCer(entry, pass, note);
  }).catch(function() {
    finalizeFreeFormCer(entry, false, L('cer.eval_error'));
  });
}

function finalizeFreeFormCer(entry, pass, note) {
  entry._feedback = (pass ? '✓ ' : '✗ ') + note;
  if (pass) {
    entry.validated = true;
    if (!G.notebook.freeFormValidatedClaims) G.notebook.freeFormValidatedClaims = [];
    // Dedup by claim text
    var seen = false;
    for (var i = 0; i < G.notebook.freeFormValidatedClaims.length; i++) {
      if (G.notebook.freeFormValidatedClaims[i].claim === entry.claim) { seen = true; break; }
    }
    if (!seen) {
      G.notebook.freeFormValidatedClaims.push({
        claim: entry.claim,
        evidence: entry.evidence,
        reasoning: entry.reasoning,
        characterName: (G.currentCharacter && G.currentCharacter.name) || 'Unknown',
        timestamp: G.gameTime
      });
      showDiscoveryNotification(entry.claim);
    }
  }
  if (typeof saveGame === 'function') saveGame();
  renderNotebook();
}

function finalizeCer(entry, pass, note) {
  entry._feedback = (pass ? '✓ ' : '✗ ') + note;
  if (pass) {
    entry.validated = true;
    if (G.notebook.validatedClaims.indexOf(entry.claimId) === -1) {
      G.notebook.validatedClaims.push(entry.claimId);
      showDiscoveryNotification(L('claim.' + entry.claimId + '.title'));

      // GDD §12.3 Beat 6: first validation → auto-open Leaderboard once,
      // auto-close after 6s. Strictly gated on the 0→1 transition.
      if (G.notebook.validatedClaims.length === 1 && !G.notebook._firstValidationCelebrated) {
        G.notebook._firstValidationCelebrated = true;
        setTimeout(function() {
          var nb = document.getElementById('notebook-overlay');
          if (nb) nb.classList.remove('active');
          if (typeof showLeaderboard === 'function') showLeaderboard();
          setTimeout(function() {
            var lb = document.getElementById('leaderboard-overlay');
            if (lb) lb.classList.remove('active');
          }, 6000);
        }, 1500);
      }
    }
  }
  saveGame();
  renderNotebook();
}

// Death-triggered CER auto-open (GDD §12.3 Beat 6, redesigned).
// Every death triggers this. Called from effects.js triggerDeath after the
// death record is added but before respawn. Scans for newly-met gates,
// enqueues any new entries, and opens the CER board. The death sequence
// pauses respawn until the player closes the board.
function openCerBoardForDeath(onClose) {
  // Scan all gates and enqueue any newly satisfied
  checkAndEnqueueGates();

  var btn = document.getElementById('notebook-btn');
  if (btn) {
    btn.classList.add('pulse');
    setTimeout(function() { btn.classList.remove('pulse'); }, 3000);
  }
  NOTEBOOK_MODE = 'cer';
  var overlay = document.getElementById('notebook-overlay');
  if (!overlay) {
    if (typeof onClose === 'function') onClose();
    return;
  }
  renderNotebook();
  overlay.classList.add('active');

  // Watch for overlay being closed by ANY mechanism — close button, Esc,
  // leaderboard button, or programmatic. Fires onClose exactly once.
  var fired = false;
  function fireOnce() {
    if (fired) return;
    fired = true;
    if (observer) try { observer.disconnect(); } catch(e) {}
    if (typeof onClose === 'function') setTimeout(onClose, 200);
  }
  var observer = null;
  if (typeof MutationObserver === 'function') {
    observer = new MutationObserver(function() {
      if (!overlay.classList.contains('active')) fireOnce();
    });
    observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
  } else {
    // Fallback: poll every 250ms
    var poll = setInterval(function() {
      if (!overlay.classList.contains('active')) {
        clearInterval(poll);
        fireOnce();
      }
    }, 250);
  }

  // Highlight submit button on the most recent unvalidated entry
  setTimeout(function() {
    var cards = document.querySelectorAll('.cer-card');
    for (var i = cards.length - 1; i >= 0; i--) {
      if (!cards[i].classList.contains('validated')) {
        var btns = cards[i].querySelectorAll('.cer-actions button');
        if (btns.length >= 2) btns[btns.length - 1].classList.add('pulse-highlight');
        break;
      }
    }
  }, 200);
}

// Back-compat wrapper for older effects.js code paths.
function maybeTriggerBeat6(causeId) {
  openCerBoardForDeath(null);
}
