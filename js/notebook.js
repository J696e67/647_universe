'use strict';

// ===================== NOTEBOOK SYSTEM =====================
function initNotebook() {
  G.notebook = {
    entries: [],
    deaths: [],
    discoveries: [],
    totalCharacters: 0,
    currentCharacter: null,
    tombstoneDialogue: []
  };
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
  var content = document.getElementById('notebook-content');
  var filters = document.getElementById('notebook-filters');

  // Build character filter buttons
  var chars = [];
  for (var i = 0; i < G.notebook.entries.length; i++) {
    var cn = G.notebook.entries[i].characterName;
    if (chars.indexOf(cn) === -1) chars.push(cn);
  }

  filters.innerHTML = '';
  var allBtn = document.createElement('button');
  allBtn.textContent = 'All';
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
  lbBtn.textContent = '🏆 Leaderboard';
  lbBtn.addEventListener('click', function() {
    document.getElementById('notebook-overlay').classList.remove('active');
    showLeaderboard();
  });
  filters.appendChild(lbBtn);

  // New Game button
  var newBtn = document.createElement('button');
  newBtn.textContent = 'New Game';
  newBtn.style.color = '#cc4444';
  newBtn.style.marginLeft = 'auto';
  newBtn.addEventListener('click', function() {
    if (confirm('Clear all progress and start a new game?')) {
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
    deathTitle.textContent = '— Deaths (' + G.notebook.deaths.length + ') —';
    deathSection.appendChild(deathTitle);

    for (var d = 0; d < G.notebook.deaths.length; d++) {
      var death = G.notebook.deaths[d];
      if (filterChar && death.characterName !== filterChar) continue;
      var dEl = document.createElement('div');
      dEl.className = 'nb-entry nb-death';
      dEl.innerHTML = '<span class="nb-char">' + death.characterName + '</span> — ' +
        death.message + ' <span class="nb-time">[' + formatTime(death.timestamp) + ', ' + death.location + ']</span>' +
        '<br><span style="color:#884444;font-size:0.85em">Last actions: ' + death.lastActions.join(' → ') + '</span>';
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
    content.innerHTML = '<div style="color:#555;text-align:center;padding:40px">No entries yet. Explore the maze and interact with objects.</div>';
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
      notebook:       G.notebook,
      surfaceStates:  G.surfaceStates,
      characterIndex: G.characterIndex,
      discoveredIds:  G.discoveredIds
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
    return true;
  } catch(e) { return false; }
}

function clearSave() {
  localStorage.removeItem('647_save');
}
