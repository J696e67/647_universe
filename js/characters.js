'use strict';

// ===================== CHARACTER SYSTEM =====================
function initCharacters() {
  G.characterIndex = 0;
  G.notebook.totalCharacters = 0;
  spawnCharacter();
}

function spawnCharacter() {
  var name = G.characterNames[G.characterIndex] || ('Explorer ' + (G.characterIndex + 1));
  G.currentCharacter = {
    id: 'char_' + String(G.characterIndex + 1).padStart(3, '0'),
    name: name,
    alive: true,
    hp: 100,
    handContamination: [],
    activeEffects: [],
    interactions: [],
    equipment: []
  };
  G.alive = true;
  G.activeEffects = [];
  G.equipment = [];
  G.notebook.totalCharacters++;
  G.notebook.currentCharacter = name;

  // Update UI
  document.getElementById('char-name').textContent = name;

  // Reset tombstone greeting for new character
  G.tombGreetingShown = false;
}

function respawnCharacter() {
  G.characterIndex++;
  clearScreenFilters();

  // Reset position to outdoors
  if (G.inMaze) {
    G.inMaze = false;
    G.scene.fog.near = G.FOG_NEAR; G.scene.fog.far = G.FOG_FAR;
    G.mazePlayerLight.intensity = 0;
    for (var i = 0; i < G.mazeLights.length; i++) G.mazeLights[i].intensity = 0;
    for (var j = 0; j < G.roomLights.length; j++) G.roomLights[j].intensity = 0;
    if (G.audioOn) G.windGain.gain.setTargetAtTime(0.07, G.actx.currentTime, 0.3);
    stopMazeAudio();
  }

  // Spawn at house entrance
  G.px = G.HSE_X; G.pz = G.HSE_Z + 4;
  G.yaw = -0.3;
  var gy = groundH(G.px, G.pz);
  G.cam.position.set(G.px, gy + G.EYE, G.pz);

  saveGame();
  spawnCharacter();

  // Fade in
  G.fadeEl.style.opacity = '0';
}
