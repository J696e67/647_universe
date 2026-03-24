'use strict';

// ===================== DELAYED EFFECTS ENGINE =====================
// G.activeEffects = [{ effectId, character, trigger, delay, symptoms, lethal, deathMessage, startTime }]

function triggerEffect(effect) {
  effect.startTime = G.gameTime;
  effect.symptomsTriggered = {};
  G.activeEffects.push(effect);
}

function updateEffects(dt) {
  if (!G.alive || G.activeEffects.length === 0) return;

  var toRemove = [];
  for (var i = 0; i < G.activeEffects.length; i++) {
    var eff = G.activeEffects[i];
    var elapsed = G.gameTime - eff.startTime;

    // Process symptoms
    if (eff.symptoms) {
      for (var j = 0; j < eff.symptoms.length; j++) {
        var sym = eff.symptoms[j];
        if (elapsed >= sym.time && !eff.symptomsTriggered[j]) {
          eff.symptomsTriggered[j] = true;
          if (sym.type === 'text') {
            showMsg(sym.msg, 4000);
          } else if (sym.type === 'filter') {
            applyScreenFilter(sym.effect);
          }
        }
      }
    }

    // Check for death
    if (eff.lethal && elapsed >= eff.delay) {
      triggerDeath(eff.deathMessage);
      toRemove.push(i);
      break;
    }
  }

  // Clean up
  for (var k = toRemove.length - 1; k >= 0; k--) {
    G.activeEffects.splice(toRemove[k], 1);
  }
}

function applyScreenFilter(effect) {
  var canvas = G.ren.domElement;
  if (effect === 'blur') {
    canvas.style.filter = 'blur(2px)';
  } else if (effect === 'darken') {
    canvas.style.filter = 'brightness(0.5)';
  }
}

function clearScreenFilters() {
  G.ren.domElement.style.filter = 'none';
}

function triggerDeath(message) {
  G.alive = false;
  clearScreenFilters();
  hideActionMenu();

  // Log death
  var char = G.currentCharacter;
  var lastActions = [];
  var entries = G.notebook.entries;
  for (var i = entries.length - 1; i >= 0 && lastActions.length < 5; i--) {
    if (entries[i].characterName === char.name) {
      lastActions.unshift(entries[i].action + ' ' + entries[i].target);
    }
  }

  G.notebook.deaths.push({
    characterName: char.name,
    timestamp: G.gameTime,
    location: getCurrentRoom() ? getCurrentRoom().name : (G.inMaze ? 'Maze Corridor' : 'Outdoors'),
    lastActions: lastActions,
    message: message
  });

  addNotebookEntry('death', char.name, getCurrentRoom() ? getCurrentRoom().name : 'Unknown', message);

  // Death screen
  var deathScreen = document.getElementById('death-screen');
  var deathMsg = document.getElementById('death-msg');
  var deathNew = document.getElementById('death-new');

  deathMsg.textContent = message;
  deathMsg.style.opacity = '0';
  deathNew.style.opacity = '0';
  deathScreen.classList.add('active');

  setTimeout(function() { deathMsg.style.opacity = '1'; }, 500);

  var nextName = G.characterNames[G.characterIndex + 1] || 'Explorer ' + (G.characterIndex + 2);
  setTimeout(function() {
    deathNew.innerHTML = 'A new explorer arrives at Universe 647.<br><br><span style="font-size:1.2em;color:#e0d4b8">' + nextName + '</span>';
    deathNew.style.opacity = '1';
  }, 3000);

  setTimeout(function() {
    deathScreen.classList.remove('active');
    deathMsg.style.opacity = '0';
    deathNew.style.opacity = '0';
    respawnCharacter();
  }, 6000);
}
