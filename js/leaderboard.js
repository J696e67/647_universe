'use strict';

// ===================== LEADERBOARD — visible tiers + free-form =====================
// Renders two visible tiers (1 and 2) of canonical claims with locked /
// evidence-ready / validated states. Tier 3 is HIDDEN — its claims
// appear individually only after each is validated by the player. A
// third section ("Player Discoveries") shows free-form validated claims
// the player authored outside the 14 canonical ones.

function initLeaderboard() {
  if (!G.notebook.validatedClaims) G.notebook.validatedClaims = [];
  if (!G.notebook.freeFormValidatedClaims) G.notebook.freeFormValidatedClaims = [];
}

// No-op: retained for back-compat with tombstone.js dialogue callback.
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

function _renderClaimRow(def) {
  var validated    = G.notebook.validatedClaims.indexOf(def.id) !== -1;
  var evidenceReady = !validated && evidenceGateMet(def.id);
  var row = document.createElement('div');
  row.className = 'lb-entry';

  var mark = document.createElement('span');
  if (validated)         { mark.className = 'lb-check';   mark.textContent = '✓'; }
  else if (evidenceReady){ mark.className = 'lb-ready';   mark.textContent = '◐'; }
  else                   { mark.className = 'lb-pending'; mark.textContent = '○'; }
  row.appendChild(mark);

  var title = document.createElement('span');
  title.textContent = ' ' + L(def.titleKey);
  if (validated)          title.style.color = '#e0d4b8';
  else if (evidenceReady) title.style.color = '#c0a060';
  else                    title.style.color = '#555';
  row.appendChild(title);

  if (!validated) {
    var hint = document.createElement('div');
    hint.style.cssText = 'color:#666;font-size:0.75em;margin-left:20px;';
    hint.textContent = evidenceReady ? L('leaderboard.evidence_ready') : L('leaderboard.locked');
    row.appendChild(hint);
  }
  return row;
}

function showLeaderboard() {
  var overlay = document.getElementById('leaderboard-overlay');
  var content = document.getElementById('leaderboard-content');
  content.innerHTML = '';

  // Group canonical claims by tier
  var byTier = {};
  for (var i = 0; i < CLAIM_DEFS.length; i++) {
    var c = CLAIM_DEFS[i];
    if (!byTier[c.tier]) byTier[c.tier] = [];
    byTier[c.tier].push(c);
  }

  // Render visible tiers
  for (var ti = 0; ti < LEADERBOARD_VISIBLE_TIERS.length; ti++) {
    var tier = LEADERBOARD_VISIBLE_TIERS[ti];
    var claims = byTier[tier] || [];
    if (!claims.length) continue;

    var section = document.createElement('div');
    section.className = 'lb-tier';
    var header = document.createElement('div');
    header.className = 'lb-tier-header';
    header.textContent = L('leaderboard.tier') + ' ' + tier;
    section.appendChild(header);
    for (var ci = 0; ci < claims.length; ci++) {
      section.appendChild(_renderClaimRow(claims[ci]));
    }
    content.appendChild(section);
  }

  // Hidden tier — only render claims that have been individually validated
  var hiddenValidated = [];
  for (var hi = 0; hi < CLAIM_DEFS.length; hi++) {
    var hc = CLAIM_DEFS[hi];
    if (LEADERBOARD_VISIBLE_TIERS.indexOf(hc.tier) !== -1) continue;
    if (G.notebook.validatedClaims.indexOf(hc.id) !== -1) hiddenValidated.push(hc);
  }
  if (hiddenValidated.length > 0) {
    var dSection = document.createElement('div');
    dSection.className = 'lb-tier';
    var dHead = document.createElement('div');
    dHead.className = 'lb-tier-header';
    dHead.textContent = L('leaderboard.deeper');
    dSection.appendChild(dHead);
    for (var di = 0; di < hiddenValidated.length; di++) {
      dSection.appendChild(_renderClaimRow(hiddenValidated[di]));
    }
    content.appendChild(dSection);
  }

  // Free-form player discoveries — claims the player authored outside the 14
  var ff = G.notebook.freeFormValidatedClaims || [];
  if (ff.length > 0) {
    var ffSection = document.createElement('div');
    ffSection.className = 'lb-tier';
    var ffHead = document.createElement('div');
    ffHead.className = 'lb-tier-header';
    ffHead.textContent = L('leaderboard.player_discoveries');
    ffSection.appendChild(ffHead);
    for (var fi = 0; fi < ff.length; fi++) {
      var fRow = document.createElement('div');
      fRow.className = 'lb-entry';
      var fMark = document.createElement('span');
      fMark.className = 'lb-check';
      fMark.textContent = '✓';
      fRow.appendChild(fMark);
      var fTitle = document.createElement('span');
      fTitle.textContent = ' ' + ff[fi].claim;
      fTitle.style.color = '#e0d4b8';
      fRow.appendChild(fTitle);
      var fMeta = document.createElement('div');
      fMeta.style.cssText = 'color:#666;font-size:0.75em;margin-left:20px;';
      fMeta.textContent = (ff[fi].characterName || '') + ' @ ' + (ff[fi].timestamp ? formatTime(ff[fi].timestamp) : '—');
      fRow.appendChild(fMeta);
      ffSection.appendChild(fRow);
    }
    content.appendChild(ffSection);
  }

  // Stats footer — only count visible-tier canonical claims toward the ratio
  var visibleClaimCount = 0;
  var visibleValidated = 0;
  for (var vi = 0; vi < CLAIM_DEFS.length; vi++) {
    var vc = CLAIM_DEFS[vi];
    if (LEADERBOARD_VISIBLE_TIERS.indexOf(vc.tier) === -1) continue;
    visibleClaimCount++;
    if (G.notebook.validatedClaims.indexOf(vc.id) !== -1) visibleValidated++;
  }
  var stats = document.createElement('div');
  stats.style.cssText = 'margin-top:20px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1);color:#777;font-size:0.85em;';
  stats.innerHTML =
    L('leaderboard.total_chars')  + G.notebook.totalCharacters + '<br>' +
    L('leaderboard.total_deaths') + G.notebook.deaths.length   + '<br>' +
    L('leaderboard.discoveries')  + visibleValidated + '/' + visibleClaimCount;
  content.appendChild(stats);

  overlay.classList.add('active');
}
