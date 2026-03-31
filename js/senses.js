'use strict';

// ===================== RAYCASTER & INTERACTION =====================
var senseRaycaster = new THREE.Raycaster();
senseRaycaster.far = 5.0;
var currentTarget = null;
var actionMenuVisible = false;

function updateSenses() {
  if (!G.inMaze || !G.alive) { hideActionMenu(); return; }

  // Cast ray from camera
  var dir = new THREE.Vector3(0, 0, -1);
  dir.applyQuaternion(G.cam.quaternion);
  senseRaycaster.set(G.cam.position, dir);

  var intersects = senseRaycaster.intersectObjects(G.interactables);
  if (intersects.length > 0) {
    var hit = intersects[0].object;
    if (hit.userData.interactable) {
      if (currentTarget !== hit) {
        currentTarget = hit;
        showActionMenu(hit);
      }
      return;
    }
  }
  // No target
  if (currentTarget) {
    currentTarget = null;
    hideActionMenu();
  }
}

function showActionMenu(obj) {
  var menu = document.getElementById('action-menu');
  menu.innerHTML = '';
  var actions = getAvailableActions(obj);
  for (var i = 0; i < actions.length; i++) {
    var btn = document.createElement('button');
    btn.textContent = actions[i].label;
    btn.dataset.action = actions[i].action;
    btn.addEventListener('click', (function(action, target) {
      return function(e) {
        e.stopPropagation();
        performAction(action, target);
      };
    })(actions[i].action, obj));
    menu.appendChild(btn);
  }
  menu.classList.add('active');
  actionMenuVisible = true;
}

function hideActionMenu() {
  var menu = document.getElementById('action-menu');
  menu.classList.remove('active');
  actionMenuVisible = false;
}

function getAvailableActions(obj) {
  var actions = [];
  actions.push({ label: 'Examine', action: 'examine' });
  actions.push({ label: 'Touch', action: 'touch' });

  if (obj.userData.type === 'substance') {
    var sub = getSubstance(obj.userData.substanceId);
    if (sub && sub.properties.taste) {
      actions.push({ label: 'Taste', action: 'taste' });
    }
    if (sub && sub.properties.smell) {
      actions.push({ label: 'Smell', action: 'smell' });
    }
  }
  return actions;
}

// ===================== PERFORM ACTIONS =====================
function performAction(action, obj) {
  if (!G.alive) return;
  var char = G.currentCharacter;
  var name = obj.userData.name;
  var room = obj.userData.room || 'Unknown';

  if (action === 'examine') doExamine(obj, char, name, room);
  else if (action === 'touch') doTouch(obj, char, name, room);
  else if (action === 'taste') doTaste(obj, char, name, room);
  else if (action === 'smell') doSmell(obj, char, name, room);
}

function doExamine(obj, char, name, room) {
  var text = '';
  if (obj.userData.type === 'substance') {
    var sub = getSubstance(obj.userData.substanceId);
    text = sub ? sub.properties.look.description : 'Nothing remarkable.';
  } else if (obj.userData.type === 'surface') {
    text = 'A metal ' + name.toLowerCase() + '. It looks ordinary.';
  }
  showMsg(text);
  addNotebookEntry('examine', name, room, text);
}

function doTouch(obj, char, name, room) {
  var hasGloves = G.equipment.indexOf('gloves') !== -1;
  var result = '';

  if (obj.userData.type === 'substance') {
    var sub = getSubstance(obj.userData.substanceId);
    if (sub && sub.properties.touch) {
      result = sub.properties.touch.description;
      if (sub.properties.touch.residue && !hasGloves) {
        // Add contamination to character's hands
        if (char.handContamination.indexOf(sub.properties.touch.residueId) === -1) {
          char.handContamination.push(sub.properties.touch.residueId);
        }
        result += hasGloves ? '' : '';
      }
      if (hasGloves) {
        result = 'You touch it with gloved hands. ' + result;
      }
    }
  } else if (obj.userData.type === 'surface') {
    var surfaceId = obj.userData.surfaceId;
    if (hasGloves) {
      result = 'You touch the ' + name.toLowerCase() + ' with gloved hands.';
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
      result = 'You touch the ' + name.toLowerCase() + '.';
      // Note: the player does NOT know they picked up residue
      if (char.handContamination.length > 0 && surfContam.length > 0) {
        // Secret: contamination transferred but not shown
      }
    }
  }
  showMsg(result);
  addNotebookEntry('touch', name, room, result);
}

function doTaste(obj, char, name, room) {
  // CHECK HAND CONTAMINATION FIRST — this is the core mechanic
  var handContam = char.handContamination;
  var result = '';

  if (handContam.length > 0) {
    // Player has residue on hands — check for lethal residue
    for (var i = 0; i < handContam.length; i++) {
      var residueSub = getSubstance(handContam[i]);
      if (residueSub && residueSub.properties.taste && residueSub.properties.taste.lethal) {
        // Lethal cross-contamination!
        if (obj.userData.type === 'substance') {
          var actualSub = getSubstance(obj.userData.substanceId);
          result = actualSub ? actualSub.properties.taste.description : 'You taste it.';
        } else {
          result = 'You taste it.';
        }
        showMsg(result);
        addNotebookEntry('taste', name, room, result);
        // Trigger death with delay
        triggerEffect({
          effectId: 'cross_contamination_death',
          character: char.name,
          trigger: 'taste',
          delay: residueSub.properties.taste.delay || 2,
          symptoms: residueSub.properties.taste.delay > 0 ? [
            { time: 1, type: 'text', msg: 'A strange taste lingers...' }
          ] : [],
          lethal: true,
          deathMessage: char.name + ' collapsed.'
        });
        return;
      }
    }
  }

  // No lethal hand contamination — proceed with substance taste
  if (obj.userData.type === 'substance') {
    var sub = getSubstance(obj.userData.substanceId);
    if (sub && sub.properties.taste) {
      result = sub.properties.taste.description;
      showMsg(result);
      addNotebookEntry('taste', name, room, result);

      if (sub.properties.taste.lethal) {
        triggerEffect({
          effectId: sub.id + '_ingestion',
          character: char.name,
          trigger: 'taste',
          delay: sub.properties.taste.delay || 0,
          symptoms: [],
          lethal: true,
          deathMessage: char.name + ' collapsed.'
        });
      }
      return;
    }
  }

  result = 'You taste it. Nothing notable.';
  showMsg(result);
  addNotebookEntry('taste', name, room, result);
}

function doSmell(obj, char, name, room) {
  var result = '';
  if (obj.userData.type === 'substance') {
    var sub = getSubstance(obj.userData.substanceId);
    if (sub && sub.properties.smellClose) {
      result = sub.properties.smellClose.description;
    } else if (sub && sub.properties.smell) {
      result = sub.properties.smell.description;
    } else {
      result = 'No particular smell.';
    }
  }
  showMsg(result);
  addNotebookEntry('smell', name, room, result);
}

// ===================== AUTOMATIC SMELL (Proximity) =====================
var lastSmellAlert = {};

function updateSmellProximity() {
  if (!G.inMaze || !G.alive) return;

  for (var i = 0; i < G.interactables.length; i++) {
    var obj = G.interactables[i];
    if (obj.userData.type !== 'substance') continue;
    var sub = getSubstance(obj.userData.substanceId);
    if (!sub || !sub.properties.smell) continue;

    var pos = obj.position;
    var dx = G.mpx - pos.x; dx -= G.MSIZE * Math.round(dx / G.MSIZE);
    var dz = G.mpz - pos.z; dz -= G.MSIZE * Math.round(dz / G.MSIZE);
    var dist = Math.sqrt(dx*dx + dz*dz);

    if (dist < sub.properties.smell.detectDistance) {
      var key = sub.id + '_' + G.currentCharacter.name;
      var now = G.gameTime;
      if (!lastSmellAlert[key] || now - lastSmellAlert[key] > 30) {
        lastSmellAlert[key] = now;
        showSmellMsg(sub.properties.smell.description);
        addNotebookEntry('smell (auto)', sub.name, obj.userData.room || 'Unknown', sub.properties.smell.description);
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
