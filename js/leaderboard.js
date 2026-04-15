'use strict';

// ===================== LEADERBOARD — 14 CLAIMS × 6 TIERS =====================
// Driven by G.notebook.validatedClaims (populated by cer.js holistic evaluator).
// Evidence-only claims (gate met, articulation pending) render as "evidence ready".

function initLeaderboard() {
  if (!G.notebook.validatedClaims) G.notebook.validatedClaims = [];
}

// Called from tombstone.js after each dialogue turn; kept as a no-op for
// compatibility but now only triggers render if the leaderboard is open.
function checkLeaderboardConditions() {
  var overlay = document.getElementById('leaderboard-overlay');
  if (overlay && overlay.classList.contains('active')) showLeaderboard();
}

function showDiscoveryNotification(text) {
  var el = document.createElement('div');
  el.className = 'lb-discovery';
  el.textContent = L('discovery.prefix') + text;
  document.body.appendChild(el);
  setTimeout(function() { el.style.opacity = '1'; }, 100);
  setTimeout(function() {
    el.style.opacity = '0';
    setTimeout(function() { if (el.parentNode) document.body.removeChild(el); }, 2000);
  }, 5000);
}

function showLeaderboard() {
  var overlay = document.getElementById('leaderboard-overlay');
  var content = document.getElementById('leaderboard-content');
  content.innerHTML = '';

  // Group claims by tier
  var byTier = {};
  for (var i = 0; i < CLAIM_DEFS.length; i++) {
    var c = CLAIM_DEFS[i];
    if (!byTier[c.tier]) byTier[c.tier] = [];
    byTier[c.tier].push(c);
  }

  var tiers = Object.keys(byTier).map(Number).sort();
  for (var ti = 0; ti < tiers.length; ti++) {
    var tier = tiers[ti];
    var section = document.createElement('div');
    section.className = 'lb-tier';

    var header = document.createElement('div');
    header.className = 'lb-tier-header';
    header.textContent = L('leaderboard.tier') + ' ' + tier;
    section.appendChild(header);

    var claims = byTier[tier];
    for (var ci = 0; ci < claims.length; ci++) {
      var def = claims[ci];
      var validated = G.notebook.validatedClaims.indexOf(def.id) !== -1;
      var evidenceReady = !validated && evidenceGateMet(def.id);

      var row = document.createElement('div');
      row.className = 'lb-entry';

      var mark = document.createElement('span');
      if (validated) { mark.className = 'lb-check'; mark.textContent = '✓'; }
      else if (evidenceReady) { mark.className = 'lb-ready'; mark.textContent = '◐'; }
      else { mark.className = 'lb-pending'; mark.textContent = '○'; }
      row.appendChild(mark);

      var title = document.createElement('span');
      title.textContent = ' ' + L(def.titleKey);
      if (validated) title.style.color = '#e0d4b8';
      else if (evidenceReady) title.style.color = '#c0a060';
      else title.style.color = '#555';
      row.appendChild(title);

      if (!validated) {
        var hint = document.createElement('div');
        hint.style.cssText = 'color:#666;font-size:0.75em;margin-left:20px;';
        hint.textContent = evidenceReady ? L('leaderboard.evidence_ready') : L('leaderboard.locked');
        row.appendChild(hint);
      }

      section.appendChild(row);
    }

    content.appendChild(section);
  }

  // Stats footer
  var stats = document.createElement('div');
  stats.style.cssText = 'margin-top:20px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1);color:#777;font-size:0.85em;';
  stats.innerHTML =
    L('leaderboard.total_chars')     + G.notebook.totalCharacters + '<br>' +
    L('leaderboard.total_deaths')    + G.notebook.deaths.length   + '<br>' +
    L('leaderboard.discoveries')     + G.notebook.validatedClaims.length + '/' + CLAIM_DEFS.length;
  content.appendChild(stats);

  overlay.classList.add('active');
}
