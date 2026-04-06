'use strict';

// ===================== RAYCASTER & INTERACTION =====================
var senseRaycaster = new THREE.Raycaster();
senseRaycaster.far = 5.0;
var currentTarget = null;
var actionMenuVisible = false;

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
  if (obj.userData.type === 'book') {
    actions.push({ label: 'Read', action: 'read' });
    return actions;
  }
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
  else if (action === 'read') doRead(obj, char, name, room);
  else if (action === 'touch') doTouch(obj, char, name, room);
  else if (action === 'taste') doTaste(obj, char, name, room);
  else if (action === 'smell') doSmell(obj, char, name, room);
}

function doExamine(obj, char, name, room) {
  var text = '';
  if (obj.userData.type === 'substance') {
    var lp = getSenseProperty(obj, 'look');
    text = lp ? lp.description : 'Nothing remarkable.';
  } else if (obj.userData.type === 'book') {
    text = 'A thin, worn book with dark red cover. Title: 《时间之外的往事》';
  } else if (obj.userData.type === 'surface') {
    text = 'A metal ' + name.toLowerCase() + '. It looks ordinary.';
  }
  showMsg(text);
  addNotebookEntry('examine', name, room, text);
}

function doRead(obj, char, name, room) {
  var text = '我们度过的，都只是时间之外的往事。\n\n—— 《时间之外的往事》';
  showMsg(text);
  addNotebookEntry('read', name, room, text);
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
    var tasteProp = getSenseProperty(obj, 'taste');
    if (tasteProp) {
      result = tasteProp.description;
      showMsg(result);
      addNotebookEntry('taste', name, room, result);

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
    var sc = getSenseProperty(obj, 'smellClose');
    var sp = getSenseProperty(obj, 'smell');
    if (sc) {
      result = sc.description;
    } else if (sp) {
      result = sp.description;
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
