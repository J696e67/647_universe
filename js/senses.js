'use strict';

// ===================== RAYCASTER & INTERACTION =====================
var senseRaycaster = new THREE.Raycaster();
senseRaycaster.far = 5.0;
var currentTarget = null;
var actionMenuVisible = false;
// When the player leaves inspection mode while still aiming at the same
// object, suppress reopening the menu until their aim moves elsewhere.
// Prevents a pointer-lock / menu flicker loop.
var _inspectionCooldownTarget = null;

function getSenseProperty(obj, key) {
  if (obj.userData.senseOverrides && obj.userData.senseOverrides[key])
    return obj.userData.senseOverrides[key];
  var sub = getSubstance(obj.userData.substanceId);
  return sub ? sub.properties[key] : null;
}

function updateSenses() {
  if (!G.alive) { hideActionMenu(); return; }

  // Cast ray from camera
  var dir = new THREE.Vector3(0, 0, -1);
  dir.applyQuaternion(G.cam.quaternion);
  senseRaycaster.set(G.cam.position, dir);

  var intersects = senseRaycaster.intersectObjects(G.interactables);
  if (intersects.length > 0) {
    var hit = intersects[0].object;
    if (hit.userData.interactable) {
      // Suppress reopening if this is the object the player just stopped inspecting
      if (_inspectionCooldownTarget === hit) return;
      if (currentTarget !== hit) {
        currentTarget = hit;
        showActionMenu(hit);
      }
      return;
    }
  }
  // Aim left the target — clear both the current target and any cooldown
  if (currentTarget) {
    currentTarget = null;
    hideActionMenu();
  }
  _inspectionCooldownTarget = null;
}

// Called by player.js when the user clicks off the menu (non-button)
// to re-engage the camera. Marks the current target as "cooled down"
// so it won't instantly re-open while the aim is still on it.
function resetSenseInspection() {
  _inspectionCooldownTarget = currentTarget;
  currentTarget = null;
  hideActionMenu();
}

function showActionMenu(obj) {
  var menu = document.getElementById('action-menu');
  menu.innerHTML = '';
  var actions = getAvailableActions(obj);
  var n = actions.length;
  var isMobile = 'ontouchstart' in window;
  var radius = isMobile ? 90 : 80;
  // Start from top (-90°), distribute evenly
  var startAngle = -Math.PI / 2;
  for (var i = 0; i < n; i++) {
    var btn = document.createElement('button');
    if (isMobile) {
      btn.textContent = actions[i].label;
    } else {
      // Desktop: prepend a subtle number hint for keyboard 1-5 hotkey
      btn.innerHTML = '<span class="kbd">' + (i + 1) + '</span>' + actions[i].label;
    }
    btn.dataset.action = actions[i].action;
    btn.addEventListener('click', (function(action, target) {
      return function(e) {
        e.stopPropagation();
        performAction(action, target);
      };
    })(actions[i].action, obj));
    var angle = startAngle + (2 * Math.PI / n) * i;
    btn.style.left = Math.round(Math.cos(angle) * radius) + 'px';
    btn.style.top = Math.round(Math.sin(angle) * radius) + 'px';
    menu.appendChild(btn);
  }
  menu.classList.add('active');
  actionMenuVisible = true;

  // Desktop: smoothly decelerate camera over 250ms, then release
  // pointer lock so the cursor can click buttons. Avoids the jarring
  // instant-stop when the menu appears.
  if (G.pointerLocked && !('ontouchstart' in window) && !G._senseDecel) {
    // Save the exact camera angle so we can restore it after pointer
    // lock exits — browsers fire a spurious mousemove with a large
    // delta on unlock that would otherwise jerk the camera.
    G._savedYawPitch = { yaw: G.yaw, pitch: G.pitch };
    G._senseDecel = { start: performance.now(), duration: 250 };
    setTimeout(function() {
      G._senseDecel = null;
      if (actionMenuVisible) {
        G._senseInspecting = true;
        // Restore angle right before unlock (belt)
        if (G._savedYawPitch) { G.yaw = G._savedYawPitch.yaw; G.pitch = G._savedYawPitch.pitch; }
        try { document.exitPointerLock(); } catch(e) {}
      } else {
        G._savedYawPitch = null;
      }
    }, 250);
  }
}

function hideActionMenu() {
  var menu = document.getElementById('action-menu');
  menu.classList.remove('active');
  actionMenuVisible = false;
}

function getAvailableActions(obj) {
  var actions = [];
  actions.push({ label: L('action.look'), action: 'look' });
  if (obj.userData.type === 'thermometer') {
    return actions;  // look-only: reads temperature
  }
  actions.push({ label: L('action.listen'), action: 'listen' });
  if (obj.userData.type === 'book') {
    actions.push({ label: L('action.read'), action: 'read' });
    return actions;
  }
  actions.push({ label: L('action.touch'), action: 'touch' });

  if (obj.userData.type === 'substance') {
    var sub = getSubstance(obj.userData.substanceId);
    if (sub && sub.properties.taste) {
      actions.push({ label: L('action.taste'), action: 'taste' });
    }
    if (sub && sub.properties.smell) {
      actions.push({ label: L('action.smell'), action: 'smell' });
    }
  }
  return actions;
}

// ===================== PERFORM ACTIONS =====================
function performAction(action, obj) {
  if (!G.alive) return;
  var char = G.currentCharacter;
  var name = obj.userData.nameKey ? L(obj.userData.nameKey) : obj.userData.name;
  var room = obj.userData.roomKey ? L(obj.userData.roomKey) : (obj.userData.room || 'Unknown');

  if (action === 'look') doLook(obj, char, name, room);
  else if (action === 'listen') doListen(obj, char, name, room);
  else if (action === 'read') doRead(obj, char, name, room);
  else if (action === 'touch') doTouch(obj, char, name, room);
  else if (action === 'taste') doTaste(obj, char, name, room);
  else if (action === 'smell') doSmell(obj, char, name, room);

  // Onboarding (GDD §12.3 Beat 4): count each sense once
  if (typeof onboardingSenseUsed === 'function') onboardingSenseUsed(action);
}

function doLook(obj, char, name, room) {
  var text = '';
  if (obj.userData.type === 'substance') {
    var lp = getSenseProperty(obj, 'look');
    text = lp ? lp.description : L('look.nothing');
  } else if (obj.userData.type === 'book') {
    text = L('look.book');
  } else if (obj.userData.type === 'surface') {
    text = L('look.surface', {name: name});
  } else if (obj.userData.type === 'thermometer') {
    var below = G.inMaze;
    var temp = below ? G.TEMP_BELOW : G.TEMP_ABOVE;
    var whereKey = below ? 'thermo.below' : 'thermo.above';
    text = L('thermo.read', {temp: temp, where: L(whereKey)});
    var loc = below ? 'below' : 'above';
    if (G.notebook.thermometerLocations.indexOf(loc) === -1) {
      G.notebook.thermometerLocations.push(loc);
    }
  }
  // Record berry decay stage observations (evidence for claim #4)
  if (obj.userData.isBerry) {
    var key = obj.uuid;
    if (!G.notebook.observedBerryStages[key]) {
      G.notebook.observedBerryStages[key] = { stages: [] };
    }
    var bucket = G.notebook.observedBerryStages[key].stages;
    if (bucket.indexOf(obj.userData.decayStage) === -1) bucket.push(obj.userData.decayStage);
  }
  showMsg(text);
  addNotebookEntry(L('action.look'), name, room, text);
}

function doListen(obj, char, name, room) {
  var text = '';
  if (obj.userData.type === 'substance') {
    var lp = getSenseProperty(obj, 'listen');
    text = lp ? lp.description : L('listen.silence');
  } else if (obj.userData.type === 'book') {
    text = L('listen.book');
  } else if (obj.userData.type === 'surface') {
    text = L('listen.surface');
  }
  showMsg(text);
  addNotebookEntry(L('action.listen'), name, room, text);
}

function doRead(obj, char, name, room) {
  var text = L('read.book');
  showMsg(text);
  addNotebookEntry(L('action.read'), name, room, text);
}

function doTouch(obj, char, name, room) {
  var hasGloves = G.equipment.indexOf('gloves') !== -1;
  var result = '';

  if (obj.userData.type === 'substance') {
    var tp = getSenseProperty(obj, 'touch');
    var sub = getSubstance(obj.userData.substanceId);
    if (tp) {
      result = tp.description;
      if (tp.residue && !hasGloves) {
        // Add contamination to character's hands
        if (char.handContamination.indexOf(tp.residueId) === -1) {
          char.handContamination.push(tp.residueId);
        }
      }
      if (hasGloves) {
        result = L('touch.gloved') + result;
      }
    }
    // Transfer hand contamination onto this object's surface (silently)
    if (!hasGloves && obj.userData.contamination) {
      for (var ci = 0; ci < char.handContamination.length; ci++) {
        var cid = char.handContamination[ci];
        if (obj.userData.contamination.indexOf(cid) === -1) {
          obj.userData.contamination.push(cid);
        }
      }
      // Pick up existing contamination from object (silently)
      for (var oi = 0; oi < obj.userData.contamination.length; oi++) {
        var oid = obj.userData.contamination[oi];
        if (char.handContamination.indexOf(oid) === -1) {
          char.handContamination.push(oid);
        }
      }
    }
  } else if (obj.userData.type === 'surface') {
    var surfaceId = obj.userData.surfaceId;
    if (hasGloves) {
      result = L('touch.surface_gloved', {name: name});
    } else {
      // Transfer hand contamination TO surface
      for (var i = 0; i < char.handContamination.length; i++) {
        contaminateSurface(surfaceId, char.handContamination[i], char.name);
      }
      // Transfer surface contamination TO hands (silently!)
      var surfContam = getSurfaceContamination(surfaceId);
      for (var j = 0; j < surfContam.length; j++) {
        if (char.handContamination.indexOf(surfContam[j].substanceId) === -1) {
          char.handContamination.push(surfContam[j].substanceId);
        }
      }
      result = L('touch.surface', {name: name});
      // Note: the player does NOT know they picked up residue
      if (char.handContamination.length > 0 && surfContam.length > 0) {
        // Secret: contamination transferred but not shown
      }
    }
  }
  showMsg(result);
  addNotebookEntry(L('action.touch'), name, room, result);
}

function doTaste(obj, char, name, room) {
  // Collect all contamination sources: hands + object surface
  var allContam = char.handContamination.slice();
  if (obj.userData.contamination) {
    for (var k = 0; k < obj.userData.contamination.length; k++) {
      if (allContam.indexOf(obj.userData.contamination[k]) === -1) {
        allContam.push(obj.userData.contamination[k]);
      }
    }
  }
  var result = '';

  if (allContam.length > 0) {
    // Check for lethal residue from hands or object surface
    for (var i = 0; i < allContam.length; i++) {
      var residueSub = getSubstance(allContam[i]);
      if (residueSub && residueSub.properties.taste && residueSub.properties.taste.lethal) {
        // Lethal cross-contamination!
        if (obj.userData.type === 'substance') {
          var actualSub = getSubstance(obj.userData.substanceId);
          result = actualSub ? actualSub.properties.taste.description : L('taste.fallback');
        } else {
          result = L('taste.fallback');
        }
        showMsg(result);
        addNotebookEntry(L('action.taste'), name, room, result);
        // Trigger death with delay
        triggerEffect({
          effectId: 'cross_contamination_death',
          character: char.name,
          trigger: 'taste',
          delay: residueSub.properties.taste.delay || 2,
          symptoms: residueSub.properties.taste.delay > 0 ? [
            { time: 1, type: 'text', msg: L('taste.strange') }
          ] : [],
          lethal: true,
          deathMessage: L('death.collapsed', {name: char.name})
        });
        return;
      }
    }
  }

  // No lethal hand contamination — proceed with substance taste
  if (obj.userData.type === 'substance') {
    var tasteProp = getSenseProperty(obj, 'taste');
    if (tasteProp) {
      result = tasteProp.description;
      showMsg(result);
      addNotebookEntry(L('action.taste'), name, room, result);

      // Evidence: berry tasted with clean hands & survived → claim #3
      if (obj.userData.isBerry && !tasteProp.lethal &&
          char.handContamination.length === 0 &&
          (!obj.userData.contamination || obj.userData.contamination.length === 0)) {
        var was = G.notebook.berryCleanEatenSurvived;
        G.notebook.berryCleanEatenSurvived = true;
        if (!was && typeof revealScaffoldedCerEntry === 'function') {
          revealScaffoldedCerEntry(3);
        }
      }

      // DECAYED berry → disintegrates, leave seed
      if (obj.userData.isBerry && obj.userData.decayStage >= 4) {
        currentTarget = null; hideActionMenu();
        removeBerry(obj);
      }

      if (tasteProp.lethal) {
        var sub = getSubstance(obj.userData.substanceId);
        triggerEffect({
          effectId: (sub ? sub.id : 'unknown') + '_ingestion',
          character: char.name,
          trigger: 'taste',
          delay: tasteProp.delay || 0,
          symptoms: [],
          lethal: true,
          deathMessage: L('death.collapsed', {name: char.name})
        });
      }
      return;
    }
  }

  result = L('taste.nothing');
  showMsg(result);
  addNotebookEntry(L('action.taste'), name, room, result);
}

function doSmell(obj, char, name, room) {
  var result = '';
  if (obj.userData.type === 'substance') {
    var sc = getSenseProperty(obj, 'smellClose');
    var sp = getSenseProperty(obj, 'smell');
    if (sc) {
      result = sc.description;
    } else if (sp) {
      result = sp.description;
    } else {
      result = L('smell.none');
    }
  }
  showMsg(result);
  addNotebookEntry(L('action.smell'), name, room, result);
}

// ===================== AUTOMATIC SMELL (Proximity) =====================
var lastSmellAlert = {};

function updateSmellProximity() {
  if (!G.alive) return;

  for (var i = 0; i < G.interactables.length; i++) {
    var obj = G.interactables[i];
    if (obj.userData.type !== 'substance') continue;
    var smellProp = getSenseProperty(obj, 'smell');
    if (!smellProp) continue;

    var pos = obj.position;
    var px = G.inMaze ? G.mpx : G.px;
    var pz = G.inMaze ? G.mpz : G.pz;
    var dx = px - pos.x; if (G.inMaze) dx -= G.MSIZE * Math.round(dx / G.MSIZE);
    var dz = pz - pos.z; if (G.inMaze) dz -= G.MSIZE * Math.round(dz / G.MSIZE);
    var dist = Math.sqrt(dx*dx + dz*dz);

    if (dist < smellProp.detectDistance) {
      var key = obj.uuid + '_' + G.currentCharacter.name;
      var now = G.gameTime;
      if (!lastSmellAlert[key] || now - lastSmellAlert[key] > 30) {
        lastSmellAlert[key] = now;
        showSmellMsg(smellProp.description);
        addNotebookEntry('smell (auto)', obj.userData.name, obj.userData.room || 'Unknown', smellProp.description);
      }
    }
  }
}

// ===================== SENSE INTERACTION FROM CLICK =====================
function trySenseInteract() {
  // If action menu is visible, don't do additional interaction
  // Actions are handled by button clicks
  if (!actionMenuVisible && currentTarget) {
    showActionMenu(currentTarget);
  }
}
