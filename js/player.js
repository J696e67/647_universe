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
      } else if (!G.inMaze && pDist(G.px, G.pz, 0, 0) < 2.5 && !G._mazeEntranceLocked) {
        transitionToMaze();
      }
    }
    if (e.code === 'KeyN') {
      toggleNotebook();
    }
    // Sense action hotkeys 1-5: when the radial action menu is visible,
    // trigger the nth button. Lets desktop players act without breaking
    // pointer lock. Ignored while typing in the tombstone chat.
    if (/^Digit[1-9]$/.test(e.code)) {
      var ci = document.getElementById('chat-in');
      if (document.activeElement === ci) return;
      var menu = document.getElementById('action-menu');
      if (!menu || !menu.classList.contains('active')) return;
      var idx = parseInt(e.code.slice(5), 10) - 1;
      var btns = menu.querySelectorAll('button');
      if (idx >= 0 && idx < btns.length) {
        e.preventDefault();
        btns[idx].click();
      }
    }
    if (e.code === 'KeyR') {
      if (G.inMaze) {
        var lx = ((G.mpx + G.MHALF) % G.MSIZE + G.MSIZE) % G.MSIZE;
        var lz = ((G.mpz + G.MHALF) % G.MSIZE + G.MSIZE) % G.MSIZE;
        var col = Math.floor(lx / G.MCELL);
        var row = Math.floor(lz / G.MCELL);
        G.mpx = (col + 0.5) * G.MCELL - G.MHALF;
        G.mpz = (row + 0.5) * G.MCELL - G.MHALF;
      } else {
        G.px = G.HSE_X;
        G.pz = G.HSE_Z + 4;
      }
      showMsg(L('hint.reset'));
    }
  });
  document.addEventListener('keyup', function(e) { G.keys[e.code] = false; });

  // Pointer lock (desktop). When the player clicks canvas while in
  // sense-inspection mode (menu open, cursor visible), reset the menu
  // and re-lock. Button clicks do not reach this handler because the
  // menu buttons are outside the canvas DOM subtree.
  G.ren.domElement.addEventListener('click', function() {
    if (!('ontouchstart' in window) && !G.pointerLocked) {
      if (G._senseInspecting) {
        G._senseInspecting = false;
        G._senseDecel = null;
        if (typeof resetSenseInspection === 'function') resetSenseInspection();
      }
      G.ren.domElement.requestPointerLock();
    }
  });
  document.addEventListener('pointerlockchange', function() {
    G.pointerLocked = (document.pointerLockElement === G.ren.domElement);
    document.getElementById('crosshair').style.opacity = G.pointerLocked ? '1' : '0';
    // Restore saved camera angle on unlock (prevents the spurious-delta jump)
    if (!G.pointerLocked && G._savedYawPitch) {
      G.yaw = G._savedYawPitch.yaw;
      G.pitch = G._savedYawPitch.pitch;
      G._savedYawPitch = null;
    }
  });
  document.addEventListener('mousemove', function(e) {
    if (G.pointerLocked) {
      var sens = 0.002;
      // Smooth deceleration when a sense menu is appearing (250ms ease-out)
      if (G._senseDecel) {
        var t = Math.min((performance.now() - G._senseDecel.start) / G._senseDecel.duration, 1);
        sens *= (1 - t) * (1 - t);  // quadratic ease-out
      }
      G.yaw -= e.movementX * sens;
      G.pitch -= e.movementY * sens;
      G.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, G.pitch));
    }
  });

  // Mouse click interaction
  document.addEventListener('click', function() {
    if (G.pointerLocked && G.alive) tryInteract();
    if (!G.audioOn) initAudio();
  });

  // Touch — split screen: left 40% = movement, right 60% = camera + interact
  G.touch.moveId = null;  // track left-side touch
  G.touch.lookId = null;  // track right-side touch

  G.ren.domElement.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (!G.audioOn) initAudio();
    if (!G.hintShown) { G.hintShown = true; G.hintEl.style.opacity = '0'; }
    var boundary = window.innerWidth * 0.4;
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      if (t.clientX < boundary && G.touch.moveId === null) {
        // Left side — movement
        G.touch.moveId = t.identifier;
        G.touch.msx = G.touch.mcx = t.clientX;
        G.touch.msy = G.touch.mcy = t.clientY;
      } else if (G.touch.lookId === null) {
        // Right side — camera look
        G.touch.lookId = t.identifier;
        G.touch.lsx = G.touch.lcx = G.touch.llx = t.clientX;
        G.touch.lsy = G.touch.lcy = G.touch.lly = t.clientY;
        G.touch.lt0 = Date.now();
      }
    }
    G.touch.on = (G.touch.moveId !== null || G.touch.lookId !== null);
  }, { passive: false });

  G.ren.domElement.addEventListener('touchmove', function(e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      if (t.identifier === G.touch.moveId) {
        G.touch.mcx = t.clientX; G.touch.mcy = t.clientY;
      } else if (t.identifier === G.touch.lookId) {
        G.touch.lcx = t.clientX; G.touch.lcy = t.clientY;
      }
    }
  }, { passive: false });

  G.ren.domElement.addEventListener('touchend', function(e) {
    e.preventDefault();
    for (var i = 0; i < e.changedTouches.length; i++) {
      var t = e.changedTouches[i];
      if (t.identifier === G.touch.moveId) {
        G.touch.moveId = null;
      } else if (t.identifier === G.touch.lookId) {
        // Tap detection on right side → interact
        var dt = Date.now() - G.touch.lt0;
        var dx = Math.abs(G.touch.lcx - G.touch.lsx);
        var dy = Math.abs(G.touch.lcy - G.touch.lsy);
        if (dt < 400 && dx < 20 && dy < 20 && G.alive) tryInteract();
        G.touch.lookId = null;
      }
    }
    G.touch.on = (G.touch.moveId !== null || G.touch.lookId !== null);
  }, { passive: false });

  G.ren.domElement.addEventListener('touchcancel', function(e) {
    G.touch.moveId = null; G.touch.lookId = null; G.touch.on = false;
  }, { passive: false });

  // Show crosshair on mobile
  if ('ontouchstart' in window) {
    document.getElementById('crosshair').style.opacity = '1';
  }

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
  // Mobile: left-side touch = walk forward (blocked by action menu)
  if (G.touch.moveId !== null && !actionMenuVisible) {
    moveF = 1;
  }
  // Mobile: right-side touch = camera rotation (always allowed so user can look away to dismiss menu)
  if (G.touch.lookId !== null) {
    var tdx = G.touch.lcx - G.touch.llx;
    var tdy = G.touch.lcy - G.touch.lly;
    G.yaw -= tdx * 0.004;
    G.pitch -= tdy * 0.003;
    G.pitch = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, G.pitch));
    G.touch.llx = G.touch.lcx;
    G.touch.lly = G.touch.lcy;
  }

  var sinY = Math.sin(G.yaw), cosY = Math.cos(G.yaw);
  var nx = G.px + (-sinY * moveF + cosY * moveR) * G.SPD * dt;
  var nz = G.pz + (-cosY * moveF - sinY * moveR) * G.SPD * dt;

  if (!houseCollide(nx, G.pz)) G.px = nx;
  if (!houseCollide(G.px, nz)) G.pz = nz;

  // PBC wrapping
  var wrapped = false;
  if (G.px > G.HW) { G.px -= G.W; wrapped = true; }
  if (G.px < -G.HW) { G.px += G.W; wrapped = true; }
  if (G.pz > G.HW) { G.pz -= G.W; wrapped = true; }
  if (G.pz < -G.HW) { G.pz += G.W; wrapped = true; }
  if (wrapped && G.notebook) {
    G.notebook.pbcCrossed = true;
    if (typeof checkAndEnqueueGates === 'function') checkAndEnqueueGates();
  }

  // Camera
  var gy = groundH(G.px, G.pz);
  var bobAmt = (moveF !== 0 || moveR !== 0) ? 1 : 0;
  var bob = Math.sin(G.clk.getElapsedTime() * 7) * 0.025 * bobAmt;
  G.cam.position.set(G.px, gy + G.EYE + bob, G.pz);
  G.cam.rotation.order = 'YXZ';
  G.cam.rotation.y = G.yaw;
  G.cam.rotation.x = G.pitch;

  // Evidence: sky observation (pitch up, throttled to 30s)
  if (G.pitch > 0.5 && G.notebook) {
    if (!G._lastSkyObs) G._lastSkyObs = -9999;
    if (G.gameTime - G._lastSkyObs > 30) {
      G._lastSkyObs = G.gameTime;
      G.notebook.skyObservations.push({
        timestamp: G.gameTime,
        pitch: G.pitch,
        isNight: !!G._skyIsNight
      });
      if (typeof checkAndEnqueueGates === 'function') checkAndEnqueueGates();
    }
  }

  // Maze entrance hint (suppressed while entrance is softlocked by onboarding)
  if (pDist(G.px, G.pz, 0, 0) < 2.5 && !G._mazeEntranceLocked) {
    G.mazeHintEl.textContent = 'ontouchstart' in window ? L('hint.maze_enter.mobile') : L('hint.maze_enter.desktop');
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
  // Mobile: left-side touch = walk forward (blocked by action menu)
  if (G.touch.moveId !== null && !actionMenuVisible) {
    moveF = 1;
  }
  // Mobile: right-side touch = camera rotation (always allowed so user can look away to dismiss menu)
  if (G.touch.lookId !== null) {
    var tdx = G.touch.lcx - G.touch.llx;
    var tdy = G.touch.lcy - G.touch.lly;
    G.yaw -= tdx * 0.004;
    G.pitch -= tdy * 0.003;
    G.pitch = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, G.pitch));
    G.touch.llx = G.touch.lcx;
    G.touch.lly = G.touch.lcy;
  }
  var sinY = Math.sin(G.yaw), cosY = Math.cos(G.yaw);
  var nx = G.mpx + (-sinY * moveF + cosY * moveR) * G.SPD * dt;
  var nz = G.mpz + (-cosY * moveF - sinY * moveR) * G.SPD * dt;
  if (!mazeCollide(nx, G.mpz)) G.mpx = nx;
  if (!mazeCollide(G.mpx, nz)) G.mpz = nz;

  // Maze PBC
  var mwrapped = false;
  if (G.mpx > G.MHALF) { G.mpx -= G.MSIZE; mwrapped = true; }
  if (G.mpx < -G.MHALF) { G.mpx += G.MSIZE; mwrapped = true; }
  if (G.mpz > G.MHALF) { G.mpz -= G.MSIZE; mwrapped = true; }
  if (G.mpz < -G.MHALF) { G.mpz += G.MSIZE; mwrapped = true; }
  if (mwrapped && G.notebook) {
    G.notebook.pbcCrossed = true;
    if (typeof checkAndEnqueueGates === 'function') checkAndEnqueueGates();
  }

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
    G.mazeHintEl.textContent = 'ontouchstart' in window ? L('hint.maze_exit.mobile') : L('hint.maze_exit.desktop');
    G.mazeHintEl.style.opacity = '1';
  } else {
    G.mazeHintEl.style.opacity = '0';
  }
}

// ===================== BASIC INTERACTIONS =====================
function tryInteract() {
  // Maze entrance (outdoor) — blocked while softlocked by onboarding
  if (!G.inMaze && pDist(G.px, G.pz, 0, 0) < 2.5) {
    if (G._mazeEntranceLocked) return;
    transitionToMaze(); return;
  }
  // Maze exit
  if (G.inMaze && G.mazeExitReady && Math.sqrt((G.mpx-2)*(G.mpx-2)+(G.mpz-2)*(G.mpz-2)) < 3) {
    transitionToOutdoor(); return;
  }
  // Book & house objects — handled by senses raycaster now
  // Tombstone — focus chat
  if (!G.inMaze && G.tombPos && pDist(G.px, G.pz, G.tombPos.x, G.tombPos.z) < 5) {
    document.getElementById('chat-in').focus();
    return;
  }
  // Senses interaction (Phase 3)
  trySenseInteract();
}

// ===================== MAZE TRANSITIONS =====================
function transitionToMaze() {
  if (G.inMaze) return;
  if (G._mazeEntranceLocked) return;  // onboarding softlock
  if (G.mazeGateActive) return;
  // Layer B: check for repetitive death gate (only once per new death)
  var deathCount = G.notebook.deaths.length;
  if (deathCount >= 2 && deathCount !== G.mazeGateShownForDeathCount && checkRepetitiveDeath()) {
    G.mazeGateShownForDeathCount = deathCount;
    if (showMazeGate()) return;
  }
  G.fadeEl.style.opacity = '1';
  setTimeout(function() {
    G.savedOutdoorPos.x = G.px;
    G.savedOutdoorPos.z = G.pz;
    G.savedOutdoorPos.yaw = G.yaw;
    G.inMaze = true;
    G.mazeExitReady = false;
    G.mpx = 2; G.mpz = 2;

    G.scene.fog.near = 0.1; G.scene.fog.far = 18;
    G.scene.fog.color.set(0x1a1a1a);
    G.ren.setClearColor(0x1a1a1a);
    G.sunLight.intensity = 0;
    G.sunMesh.visible = false; G.moonMesh.visible = false;
    G.ambLight.color.set(0x404050); G.ambLight.intensity = 0.25;
    G.mazePlayerLight.intensity = 0.8;
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
    addNotebookEntry('enter', 'Maze', 'Maze Entrance', L('entered_maze'));

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

    addNotebookEntry('exit', 'Maze', 'Maze Entrance', L('exited_maze'));

    setTimeout(function() { G.fadeEl.style.opacity = '0'; }, 150);
  }, 500);
}
