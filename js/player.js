'use strict';

// ===================== CONTROLS SETUP =====================
function setupControls() {
  // Keyboard
  document.addEventListener('keydown', function(e) {
    G.keys[e.code] = true;
    if (e.code === 'Escape') {
      var ci = document.getElementById('chat-in');
      if (document.activeElement === ci) ci.blur();
      // Close notebook
      document.getElementById('notebook-overlay').classList.remove('active');
      document.getElementById('leaderboard-overlay').classList.remove('active');
    }
    if (e.code === 'Space') {
      e.preventDefault();
      if (G.inMaze && G.mazeExitReady && Math.sqrt((G.mpx-2)*(G.mpx-2)+(G.mpz-2)*(G.mpz-2)) < 3) {
        transitionToOutdoor();
      } else if (!G.inMaze && pDist(G.px, G.pz, 0, 0) < 2.5) {
        transitionToMaze();
      }
    }
    if (e.code === 'KeyN') {
      toggleNotebook();
    }
  });
  document.addEventListener('keyup', function(e) { G.keys[e.code] = false; });

  // Pointer lock (desktop)
  G.ren.domElement.addEventListener('click', function() {
    if (!('ontouchstart' in window) && !G.pointerLocked) {
      G.ren.domElement.requestPointerLock();
    }
  });
  document.addEventListener('pointerlockchange', function() {
    G.pointerLocked = (document.pointerLockElement === G.ren.domElement);
    document.getElementById('crosshair').style.opacity = G.pointerLocked ? '1' : '0';
  });
  document.addEventListener('mousemove', function(e) {
    if (G.pointerLocked) {
      G.yaw -= e.movementX * 0.002;
      G.pitch -= e.movementY * 0.002;
      G.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, G.pitch));
    }
  });

  // Mouse click interaction
  document.addEventListener('click', function() {
    if (G.pointerLocked && G.alive) tryInteract();
    if (!G.audioOn) initAudio();
  });

  // Touch
  G.ren.domElement.addEventListener('touchstart', function(e) {
    e.preventDefault();
    var t = e.touches[0];
    G.touch.on = true;
    G.touch.sx = G.touch.cx = t.clientX;
    G.touch.sy = G.touch.cy = t.clientY;
    G.touch.t0 = Date.now();
    if (!G.audioOn) initAudio();
    if (!G.hintShown) { G.hintShown = true; G.hintEl.style.opacity = '0'; }
  }, { passive: false });

  G.ren.domElement.addEventListener('touchmove', function(e) {
    e.preventDefault();
    var t = e.touches[0];
    G.touch.cx = t.clientX; G.touch.cy = t.clientY;
  }, { passive: false });

  G.ren.domElement.addEventListener('touchend', function(e) {
    e.preventDefault();
    var dt = Date.now() - G.touch.t0;
    var dx = Math.abs(G.touch.cx - G.touch.sx);
    var dy = Math.abs(G.touch.cy - G.touch.sy);
    if (dt < 300 && dx < 15 && dy < 15 && G.alive) tryInteract();
    G.touch.on = false;
  }, { passive: false });

  // Chat input
  var chatIn = document.getElementById('chat-in');
  var chatBtn = document.getElementById('chat-send');
  chatIn.addEventListener('keydown', function(e) {
    var moveKeys = ['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Escape'];
    if (moveKeys.indexOf(e.code) === -1) e.stopPropagation();
    if (e.key === 'Enter') { sendTombstoneMsg(chatIn.value); chatIn.value = ''; }
    if (e.code === 'Escape') { chatIn.blur(); }
  });
  chatIn.addEventListener('keyup', function(e) {
    var moveKeys = ['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Escape'];
    if (moveKeys.indexOf(e.code) === -1) e.stopPropagation();
  });
  chatBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    sendTombstoneMsg(chatIn.value); chatIn.value = '';
    chatIn.focus();
  });

  // Notebook button
  document.getElementById('notebook-btn').addEventListener('click', function(e) {
    e.stopPropagation(); toggleNotebook();
  });
  document.getElementById('notebook-close').addEventListener('click', function() {
    document.getElementById('notebook-overlay').classList.remove('active');
  });
  document.getElementById('leaderboard-close').addEventListener('click', function() {
    document.getElementById('leaderboard-overlay').classList.remove('active');
  });

  // Resize
  window.addEventListener('resize', function() {
    G.cam.aspect = window.innerWidth / window.innerHeight;
    G.cam.updateProjectionMatrix();
    G.ren.setSize(window.innerWidth, window.innerHeight);
  });
}

// ===================== OUTDOOR PLAYER UPDATE =====================
function updatePlayer(dt) {
  if (!G.alive) return;
  var moveF = 0, moveR = 0;
  var inputFocused = document.activeElement === document.getElementById('chat-in');

  if (!inputFocused) {
    if (G.keys['KeyW'] || G.keys['ArrowUp']) moveF += 1;
    if (G.keys['KeyS'] || G.keys['ArrowDown']) moveF -= 1;
    if (G.keys['KeyA'] || G.keys['ArrowLeft']) moveR -= 1;
    if (G.keys['KeyD'] || G.keys['ArrowRight']) moveR += 1;
  }
  if (G.touch.on) {
    moveF = 1;
    var tdx = (G.touch.cx - G.touch.sx) / window.innerWidth;
    var tdy = (G.touch.cy - G.touch.sy) / window.innerHeight;
    G.yaw -= tdx * 3.0 * dt;
    G.pitch += tdy * 2.0 * dt;
    G.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, G.pitch));
  }

  var sinY = Math.sin(G.yaw), cosY = Math.cos(G.yaw);
  var nx = G.px + (-sinY * moveF + cosY * moveR) * G.SPD * dt;
  var nz = G.pz + (-cosY * moveF - sinY * moveR) * G.SPD * dt;

  if (!houseCollide(nx, G.pz)) G.px = nx;
  if (!houseCollide(G.px, nz)) G.pz = nz;

  // PBC wrapping
  if (G.px > G.HW) G.px -= G.W;
  if (G.px < -G.HW) G.px += G.W;
  if (G.pz > G.HW) G.pz -= G.W;
  if (G.pz < -G.HW) G.pz += G.W;

  // Camera
  var gy = groundH(G.px, G.pz);
  var bobAmt = (moveF !== 0 || moveR !== 0) ? 1 : 0;
  var bob = Math.sin(G.clk.getElapsedTime() * 7) * 0.025 * bobAmt;
  G.cam.position.set(G.px, gy + G.EYE + bob, G.pz);
  G.cam.rotation.order = 'YXZ';
  G.cam.rotation.y = G.yaw;
  G.cam.rotation.x = G.pitch;

  // Maze entrance hint
  if (pDist(G.px, G.pz, 0, 0) < 2.5) {
    G.mazeHintEl.textContent = 'ontouchstart' in window ? '轻点进入' : '按空格进入迷宫';
    G.mazeHintEl.style.opacity = '1';
  } else {
    G.mazeHintEl.style.opacity = '0';
  }
}

// ===================== MAZE PLAYER UPDATE =====================
function updatePlayerMaze(dt) {
  if (!G.alive) return;
  var moveF = 0, moveR = 0;
  var inputFocused = document.activeElement === document.getElementById('chat-in');
  if (!inputFocused) {
    if (G.keys['KeyW'] || G.keys['ArrowUp']) moveF += 1;
    if (G.keys['KeyS'] || G.keys['ArrowDown']) moveF -= 1;
    if (G.keys['KeyA'] || G.keys['ArrowLeft']) moveR -= 1;
    if (G.keys['KeyD'] || G.keys['ArrowRight']) moveR += 1;
  }
  if (G.touch.on) {
    moveF = 1;
    var tdx = (G.touch.cx - G.touch.sx) / window.innerWidth;
    var tdy = (G.touch.cy - G.touch.sy) / window.innerHeight;
    G.yaw -= tdx * 3.0 * dt;
    G.pitch += tdy * 2.0 * dt;
    G.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, G.pitch));
  }
  var sinY = Math.sin(G.yaw), cosY = Math.cos(G.yaw);
  var nx = G.mpx + (-sinY * moveF + cosY * moveR) * G.SPD * dt;
  var nz = G.mpz + (-cosY * moveF - sinY * moveR) * G.SPD * dt;
  if (!mazeCollide(nx, G.mpz)) G.mpx = nx;
  if (!mazeCollide(G.mpx, nz)) G.mpz = nz;

  // Maze PBC
  if (G.mpx > G.MHALF) G.mpx -= G.MSIZE;
  if (G.mpx < -G.MHALF) G.mpx += G.MSIZE;
  if (G.mpz > G.MHALF) G.mpz -= G.MSIZE;
  if (G.mpz < -G.MHALF) G.mpz += G.MSIZE;

  if (!G.mazeExitReady && Math.sqrt((G.mpx-2)*(G.mpx-2)+(G.mpz-2)*(G.mpz-2)) > 8) G.mazeExitReady = true;

  var bobAmt = (moveF !== 0 || moveR !== 0) ? 1 : 0;
  var bob = Math.sin(G.clk.getElapsedTime() * 7) * 0.025 * bobAmt;
  G.cam.position.set(G.mpx, G.MAZE_Y + G.EYE + bob, G.mpz);
  G.cam.rotation.order = 'YXZ';
  G.cam.rotation.y = G.yaw;
  G.cam.rotation.x = G.pitch;
  G.mazePlayerLight.position.set(G.mpx, G.MAZE_Y + G.MAZE_WALL_H - 0.3, G.mpz);

  // Exit hint
  var exitDist = Math.sqrt((G.mpx-2)*(G.mpx-2)+(G.mpz-2)*(G.mpz-2));
  if (G.mazeExitReady && exitDist < 3) {
    G.mazeHintEl.textContent = 'ontouchstart' in window ? '轻点离开' : '按空格离开迷宫';
    G.mazeHintEl.style.opacity = '1';
  } else {
    G.mazeHintEl.style.opacity = '0';
  }
}

// ===================== BASIC INTERACTIONS =====================
function tryInteract() {
  // Maze entrance (outdoor)
  if (!G.inMaze && pDist(G.px, G.pz, 0, 0) < 2.5) {
    transitionToMaze(); return;
  }
  // Maze exit
  if (G.inMaze && G.mazeExitReady && Math.sqrt((G.mpx-2)*(G.mpx-2)+(G.mpz-2)*(G.mpz-2)) < 3) {
    transitionToOutdoor(); return;
  }
  // Book
  if (!G.inMaze && G.bookPos && pDist(G.px, G.pz, G.bookPos.x, G.bookPos.z) < 2.5) {
    showMsg('我们度过的，都只是时间之外的往事。\n\n—— 《时间之外的往事》');
    return;
  }
  // Tombstone — focus chat
  if (!G.inMaze && G.tombPos && pDist(G.px, G.pz, G.tombPos.x, G.tombPos.z) < 5) {
    document.getElementById('chat-in').focus();
    return;
  }
  // Senses interaction (Phase 3) — in maze
  if (G.inMaze) {
    trySenseInteract();
  }
}

// ===================== MAZE TRANSITIONS =====================
function transitionToMaze() {
  if (G.inMaze) return;
  G.fadeEl.style.opacity = '1';
  setTimeout(function() {
    G.savedOutdoorPos.x = G.px;
    G.savedOutdoorPos.z = G.pz;
    G.savedOutdoorPos.yaw = G.yaw;
    G.inMaze = true;
    G.mazeExitReady = false;
    G.mpx = 2; G.mpz = 2;

    G.scene.fog.near = 0.1; G.scene.fog.far = 18;
    G.scene.fog.color.set(0x999966);
    G.ren.setClearColor(0x999966);
    G.sunLight.intensity = 0;
    G.sunMesh.visible = false; G.moonMesh.visible = false;
    G.ambLight.color.set(0xCCBB88); G.ambLight.intensity = 0.5;
    G.mazePlayerLight.intensity = 0.6;
    for (var i = 0; i < G.mazeLights.length; i++) G.mazeLights[i].intensity = G.mazeLights[i].userData.baseIntensity;
    // Show room lights
    for (var j = 0; j < G.roomLights.length; j++) G.roomLights[j].intensity = G.roomLights[j].userData.baseIntensity || 0.5;

    if (G.audioOn) {
      G.windGain.gain.setTargetAtTime(0, G.actx.currentTime, 0.1);
      G.streamGain.gain.setTargetAtTime(0, G.actx.currentTime, 0.1);
    }
    initMazeAudio();
    G.cam.position.set(2, G.MAZE_Y + G.EYE, 2);
    document.getElementById('text').style.opacity = '0';
    G.mazeHintEl.style.opacity = '0';

    // Log entry to notebook
    addNotebookEntry('enter', 'Maze', 'Maze Entrance', 'Entered the maze');

    setTimeout(function() { G.fadeEl.style.opacity = '0'; }, 150);
  }, 500);
}

function transitionToOutdoor() {
  if (!G.inMaze) return;
  G.fadeEl.style.opacity = '1';
  setTimeout(function() {
    G.inMaze = false;
    G.px = G.savedOutdoorPos.x; G.pz = G.savedOutdoorPos.z;
    G.yaw = G.savedOutdoorPos.yaw;
    G.scene.fog.near = G.FOG_NEAR; G.scene.fog.far = G.FOG_FAR;
    G.mazePlayerLight.intensity = 0;
    for (var i = 0; i < G.mazeLights.length; i++) G.mazeLights[i].intensity = 0;
    for (var j = 0; j < G.roomLights.length; j++) G.roomLights[j].intensity = 0;
    if (G.audioOn) G.windGain.gain.setTargetAtTime(0.07, G.actx.currentTime, 0.3);
    stopMazeAudio();
    var gy = groundH(G.px, G.pz);
    G.cam.position.set(G.px, gy + G.EYE, G.pz);
    G.mazeHintEl.style.opacity = '0';
    hideActionMenu();

    addNotebookEntry('exit', 'Maze', 'Maze Entrance', 'Exited the maze');

    setTimeout(function() { G.fadeEl.style.opacity = '0'; }, 150);
  }, 500);
}
