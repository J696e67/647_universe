'use strict';

// ===================== CER BOARD — 14 CLAIMS × 6 TIERS =====================
// Claim IDs correspond to GDD §3.2 / CLAUDE.md knowledge-claim table.
// Each claim has an evidence-gate predicate and a short articulation rubric
// used by the holistic Claude evaluator.

var CLAIM_DEFS = [
  { id: 1,  tier: 1, titleKey: 'claim.1.title',
    evidence: function(n) { return n.deaths.some(function(d){ return d.causeId === 'kcn_ingestion'; }); },
    rubric: 'Player states a causal link between the white powder and a death. A survival claim or vague wording fails.' },
  { id: 3,  tier: 1, titleKey: 'claim.3.title',
    evidence: function(n) { return n.berryCleanEatenSurvived === true; },
    rubric: 'Player claims the red berry is safe AND specifies that safety depends on the berry being uncontaminated / clean-handed.' },
  { id: 2,  tier: 2, titleKey: 'claim.2.title',
    evidence: function(n) {
      var smelled = n.entries.some(function(e){ return (e.action.indexOf('smell') !== -1) && /powder|白色|粉末|kcn/i.test(e.target+e.result); });
      var died    = n.deaths.some(function(d){ return d.causeId === 'kcn_ingestion'; });
      return smelled && died;
    },
    rubric: 'Player identifies the white powder as potassium cyanide (KCN) by linking the bitter-almond smell to chemistry knowledge. Simply saying "poison" is not enough.' },
  { id: 4,  tier: 3, titleKey: 'claim.4.title',
    evidence: function(n) {
      for (var k in n.observedBerryStages) {
        if (n.observedBerryStages[k].stages && n.observedBerryStages[k].stages.length >= 2) return true;
      }
      return false;
    },
    rubric: 'Player describes the berry as passing through a sequence of distinct stages (fresh → overripe → rotting, etc.), not just "it changed".' },
  { id: 8,  tier: 3, titleKey: 'claim.8.title',
    evidence: function(n) { return n.dayNightCycles >= 2 && n.skyObservations.length >= 3; },
    rubric: 'Player distinguishes the relative speeds of specific celestial bodies (sun vs moon vs stars). Generic "things in the sky move" fails.' },
  { id: 5,  tier: 4, titleKey: 'claim.5.title',
    evidence: function(n) { return n.thermometerLocations.indexOf('above') !== -1 && n.thermometerLocations.indexOf('below') !== -1; },
    rubric: 'Player links the temperature difference between above- and below-ground to a difference in berry decay rate.' },
  { id: 6,  tier: 4, titleKey: 'claim.6.title',
    evidence: function(n) { return n.crossContaminationDeathSeen === true; },
    rubric: 'Player identifies contact transfer (residue on hands/surfaces) as the mechanism behind a death where the victim did not touch the powder directly.' },
  { id: 7,  tier: 4, titleKey: 'claim.7.title',
    evidence: function(n) { return n.thermometerLocations.indexOf('above') !== -1 && n.thermometerLocations.indexOf('below') !== -1; },
    rubric: 'Player states that above-ground and underground temperatures differ as a measurable fact, with specific values or direction (warmer/cooler).' },
  { id: 9,  tier: 5, titleKey: 'claim.9.title',
    evidence: function(n) { return n.dayNightCycles >= 2; },
    rubric: 'Player identifies a common rotational axis or center shared by sun/moon/stars.' },
  { id: 10, tier: 5, titleKey: 'claim.10.title',
    evidence: function(n) { return n.pbcCrossed === true; },
    rubric: 'Player describes the world\'s looping topology (walk far enough in one direction and return) — not merely "I ended up back here".' },
  { id: 11, tier: 5, titleKey: 'claim.11.title',
    evidence: function(n) { return n.pbcCrossed === true; },
    rubric: 'Player articulates that the world is flat, citing an observation inconsistent with a sphere (no horizon curvature, no disappearance bottom-first, PBC wrap).' },
  { id: 12, tier: 6, titleKey: 'claim.12.title',
    evidence: function(n) { return n.skyObservations.some(function(s){ return s.isNight; }); },
    rubric: 'Player names at least one specific real-world constellation visible in the night sky (Orion, Big Dipper, Cassiopeia, etc.).' },
  { id: 13, tier: 6, titleKey: 'claim.13.title',
    evidence: function(n) { return n.skyObservations.some(function(s){ return s.isNight; }); },
    rubric: 'Player identifies that the world is in the northern hemisphere — cites Polaris or a northern-only constellation.' },
  { id: 14, tier: 6, titleKey: 'claim.14.title',
    evidence: function(n) { return true; },  // external knowledge gate
    rubric: 'Player states an approximate latitude (~40°N) with reasoning, e.g. the altitude of Polaris ≈ observer latitude.' }
];

function getClaimDef(id) {
  for (var i = 0; i < CLAIM_DEFS.length; i++) if (CLAIM_DEFS[i].id === id) return CLAIM_DEFS[i];
  return null;
}

function evidenceGateMet(claimId) {
  var d = getClaimDef(claimId);
  return d ? !!d.evidence(G.notebook) : false;
}

// ===================== SCAFFOLDED ONBOARDING =====================
// GDD §8.1 — three entries at decreasing levels of completeness.
// Entries are NOT seeded up-front (that would dump three mysterious
// rows into the notebook on first open). Instead each entry is
// revealed when its triggering in-world event fires — see GDD §12.4.

function _seedDef(claimId) {
  if (claimId === 1) return {
    id: 'cer_seed_1', claimId: 1, tier: 1,
    claim: L('cer.seed.1.claim'),
    evidence: L('cer.seed.1.evidence'),
    reasoning: L('cer.seed.1.reasoning')
  };
  if (claimId === 3) return {
    id: 'cer_seed_2', claimId: 3, tier: 1,
    claim: L('cer.seed.2.claim'),
    evidence: L('cer.seed.2.evidence'),
    reasoning: ''
  };
  if (claimId === 6) return {
    id: 'cer_seed_3', claimId: 6, tier: 4,
    claim: '',
    evidence: L('cer.seed.3.evidence'),
    reasoning: ''
  };
  return null;
}

// Reveal one scaffolded entry on event trigger. Idempotent — if the
// entry for that claimId already exists, return it without duplicating.
function revealScaffoldedCerEntry(claimId) {
  if (!G.notebook.cerEntries) G.notebook.cerEntries = [];
  for (var i = 0; i < G.notebook.cerEntries.length; i++) {
    var e = G.notebook.cerEntries[i];
    if (e.scaffolded && e.claimId === claimId) return e;
  }
  var seed = _seedDef(claimId);
  if (!seed) return null;
  seed.validated = false;
  seed.scaffolded = true;
  G.notebook.cerEntries.push(seed);
  return seed;
}

// Back-compat helper: seed all three at once. Kept for tests and for
// any dev hook that wants the old behavior. NOT called by initNotebook.
function seedScaffoldedCerEntries() {
  revealScaffoldedCerEntry(1);
  revealScaffoldedCerEntry(3);
  revealScaffoldedCerEntry(6);
}

// Map a cause-of-death to its scaffolded claim id.
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

  var entries = G.notebook.cerEntries || [];
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
  if (!entry.claim || !entry.evidence || !entry.reasoning) {
    entry._feedback = L('cer.incomplete');
    renderNotebook();
    return;
  }
  // Determine claim id if not set
  if (!entry.claimId) {
    entry.claimId = matchClaimId(entry.claim + ' ' + entry.reasoning);
  }
  if (!entry.claimId) {
    entry._feedback = L('cer.no_match');
    renderNotebook();
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

// Beat 6 (GDD §12.3): one-shot auto-open of the CER Board on the first
// death of a save, 2s after respawn. Called from effects.js triggerDeath
// respawn callback.
function maybeTriggerBeat6(causeId) {
  if (G.notebook._beat6Fired) return;
  G.notebook._beat6Fired = true;
  var claimId = scaffoldedClaimForCause(causeId);
  if (claimId) revealScaffoldedCerEntry(claimId);
  setTimeout(function() {
    var btn = document.getElementById('notebook-btn');
    if (btn) {
      btn.classList.add('pulse');
      setTimeout(function() { btn.classList.remove('pulse'); }, 3000);
    }
    NOTEBOOK_MODE = 'cer';
    var overlay = document.getElementById('notebook-overlay');
    if (overlay && !overlay.classList.contains('active')) {
      renderNotebook();
      overlay.classList.add('active');
    } else {
      renderNotebook();
    }
    // Highlight submit on the newly-revealed scaffolded entry
    setTimeout(function() {
      var cards = document.querySelectorAll('.cer-card');
      for (var i = 0; i < cards.length; i++) {
        if (!cards[i].classList.contains('validated')) {
          var btns = cards[i].querySelectorAll('.cer-actions button');
          if (btns.length >= 2) btns[btns.length - 1].classList.add('pulse-highlight');
          break;
        }
      }
    }, 200);
  }, 2000);
}
