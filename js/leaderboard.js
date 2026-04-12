'use strict';

// ===================== LEADERBOARD / DISCOVERY SYSTEM =====================
var DISCOVERIES = [
  {
    id: 'kcn_direct',
    descKey: 'discovery.kcn',
    condition: function() {
      return G.notebook.tombstoneDialogue.some(function(d) {
        var dl = d.toLowerCase();
        return dl.indexOf('cyanide') !== -1 || dl.indexOf('kcn') !== -1 ||
               dl.indexOf('氰化钾') !== -1 || dl.indexOf('氰化物') !== -1;
      });
    }
  },
  {
    id: 'cross_contamination',
    descKey: 'discovery.cross',
    condition: function() {
      return G.notebook.tombstoneDialogue.some(function(d) {
        var dl = d.toLowerCase();
        return dl.indexOf('residue') !== -1 || dl.indexOf('contamination') !== -1 ||
               dl.indexOf('cross') !== -1 || dl.indexOf('残留') !== -1 ||
               dl.indexOf('交叉') !== -1 || dl.indexOf('污染') !== -1;
      });
    }
  },
  {
    id: 'pbc_outer',
    descKey: 'discovery.pbc_outer',
    condition: function() {
      return G.notebook.tombstoneDialogue.some(function(d) {
        var dl = d.toLowerCase();
        return dl.indexOf('loop') !== -1 || dl.indexOf('cycle') !== -1 ||
               dl.indexOf('boundary') !== -1 || dl.indexOf('periodic') !== -1 ||
               dl.indexOf('循环') !== -1 || dl.indexOf('边界') !== -1 ||
               dl.indexOf('回到原点') !== -1 || dl.indexOf('回到了') !== -1;
      });
    }
  },
  {
    id: 'pbc_inner',
    descKey: 'discovery.pbc_inner',
    condition: function() {
      return G.notebook.tombstoneDialogue.some(function(d) {
        var dl = d.toLowerCase();
        return (dl.indexOf('maze') !== -1 || dl.indexOf('迷宫') !== -1) &&
               (dl.indexOf('loop') !== -1 || dl.indexOf('repeat') !== -1 ||
                dl.indexOf('循环') !== -1 || dl.indexOf('重复') !== -1 ||
                dl.indexOf('回到') !== -1);
      });
    }
  }
];

function initLeaderboard() {
  G.discoveredIds = [];
  // Load from localStorage if available
  try {
    var saved = localStorage.getItem('shennong_discoveries');
    if (saved) G.discoveredIds = JSON.parse(saved);
  } catch(e) {}
}

function checkLeaderboardConditions() {
  for (var i = 0; i < DISCOVERIES.length; i++) {
    var disc = DISCOVERIES[i];
    if (G.discoveredIds.indexOf(disc.id) === -1 && disc.condition()) {
      G.discoveredIds.push(disc.id);
      G.notebook.discoveries.push({
        id: disc.id,
        description: L(disc.descKey),
        timestamp: G.gameTime,
        characterName: G.currentCharacter ? G.currentCharacter.name : 'Unknown'
      });
      // Save to localStorage
      try { localStorage.setItem('shennong_discoveries', JSON.stringify(G.discoveredIds)); } catch(e) {}
      // Show notification
      showDiscoveryNotification(L(disc.descKey));
    }
  }
}

function showDiscoveryNotification(text) {
  var el = document.createElement('div');
  el.className = 'lb-discovery';
  el.textContent = L('discovery.prefix') + text;
  document.body.appendChild(el);
  setTimeout(function() { el.style.opacity = '1'; }, 100);
  setTimeout(function() {
    el.style.opacity = '0';
    setTimeout(function() { document.body.removeChild(el); }, 2000);
  }, 5000);
}

function showLeaderboard() {
  var overlay = document.getElementById('leaderboard-overlay');
  var content = document.getElementById('leaderboard-content');
  content.innerHTML = '';

  for (var i = 0; i < DISCOVERIES.length; i++) {
    var disc = DISCOVERIES[i];
    var discovered = G.discoveredIds.indexOf(disc.id) !== -1;
    var el = document.createElement('div');
    el.className = 'lb-entry';

    var desc = L(disc.descKey);
    if (discovered) {
      var detail = G.notebook.discoveries.find(function(d) { return d.id === disc.id; });
      el.innerHTML = '<span class="lb-check">\u2713</span>' + desc +
        (detail ? '<br><span style="color:#666;font-size:0.8em">' + L('leaderboard.discovered_by') +
        detail.characterName + ' @ ' + formatTime(detail.timestamp) + '</span>' : '');
    } else {
      el.innerHTML = '<span class="lb-pending">\u25CB</span><span style="color:#555">' + desc + '</span>';
    }
    content.appendChild(el);
  }

  // Stats
  var stats = document.createElement('div');
  stats.style.marginTop = '20px';
  stats.style.paddingTop = '12px';
  stats.style.borderTop = '1px solid rgba(255,255,255,0.1)';
  stats.style.color = '#777';
  stats.style.fontSize = '0.85em';
  stats.innerHTML = L('leaderboard.total_chars') + G.notebook.totalCharacters + '<br>' +
    L('leaderboard.total_deaths') + G.notebook.deaths.length + '<br>' +
    L('leaderboard.discoveries') + G.discoveredIds.length + '/' + DISCOVERIES.length;
  content.appendChild(stats);

  overlay.classList.add('active');
}
