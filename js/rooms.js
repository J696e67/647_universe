'use strict';

// ===================== ROOM DEFINITIONS =====================
// Room positions in maze coordinates (cell-based → world position)
// Cell [r,c] → world position: x = (c+0.5)*MCELL - MHALF, z = (r+0.5)*MCELL - MHALF

var ROOM_DEFS = [
  {
    id: 'room_1',
    name: 'Chemistry Table Room',
    cells: { r1: 4, c1: 4, r2: 5, c2: 5 },
    light: { color: 0xeeeef5, intensity: 0.6, range: 12 },
    objects: []  // populated in createRooms()
  },
  {
    id: 'room_2',
    name: 'Ventilation Room',
    cells: { r1: 10, c1: 10, r2: 11, c2: 11 },
    light: { color: 0xCCDDFF, intensity: 0.4, range: 10 },
    objects: []
  }
];

// Convert cell range to world center
function roomCenter(def) {
  var cr = (def.cells.r1 + def.cells.r2 + 1) / 2;
  var cc = (def.cells.c1 + def.cells.c2 + 1) / 2;
  return {
    x: cc * G.MCELL - G.MHALF,
    z: cr * G.MCELL - G.MHALF
  };
}

// ===================== DOOR FRAME HELPER =====================
// Creates a closed metal door with frame and handle at a wall opening
function createDoorFrame(x, y, z, isHorizontal) {
  var frameMat = new THREE.MeshStandardMaterial({ color: 0x4a4a45, roughness: 0.6, metalness: 0.3 });
  var doorMat = new THREE.MeshStandardMaterial({ color: 0x606058, roughness: 0.6, metalness: 0.2 });
  var handleMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.3, metalness: 0.6 });

  var doorW = 1.4;   // opening width
  var doorH = 2.4;   // opening height
  var frameT = 0.06; // frame thickness
  var frameD = 0.50; // frame depth matches wall thickness

  var group = new THREE.Group();
  group.position.set(x, y, z);

  // Top frame bar
  var top = new THREE.Mesh(new THREE.BoxGeometry(doorW + frameT*2, frameT, frameD), frameMat);
  top.position.set(0, doorH + frameT/2, 0);
  group.add(top);

  // Left frame post
  var left = new THREE.Mesh(new THREE.BoxGeometry(frameT, doorH, frameD), frameMat);
  left.position.set(-doorW/2 - frameT/2, doorH/2, 0);
  group.add(left);

  // Right frame post
  var right = new THREE.Mesh(new THREE.BoxGeometry(frameT, doorH, frameD), frameMat);
  right.position.set(doorW/2 + frameT/2, doorH/2, 0);
  group.add(right);

  // Door panel — CLOSED (no rotation)
  var panel = new THREE.Mesh(new THREE.BoxGeometry(doorW - 0.04, doorH - 0.05, 0.05), doorMat);
  panel.position.set(0, doorH/2, 0);
  group.add(panel);

  // Small window on door
  var windowMat = new THREE.MeshStandardMaterial({
    color: 0x888880, emissive: 0xffe8c0, emissiveIntensity: 0.1,
    roughness: 0.3, metalness: 0.1
  });
  var doorWindow = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.16), windowMat);
  doorWindow.position.set(0, doorH * 0.72, 0.027);
  group.add(doorWindow);
  // Window back face
  var doorWindowBack = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.16), windowMat);
  doorWindowBack.position.set(0, doorH * 0.72, -0.027);
  doorWindowBack.rotation.y = Math.PI;
  group.add(doorWindowBack);

  // Door handle — right side, both faces
  var handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8);
  handleGeo.rotateZ(Math.PI / 2);

  // Front handle
  var handleFront = new THREE.Mesh(handleGeo, handleMat);
  handleFront.position.set(doorW/2 - 0.2, 1.1, 0.05);
  group.add(handleFront);

  // Front handle plate
  var plateFront = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.18, 0.01), handleMat
  );
  plateFront.position.set(doorW/2 - 0.2, 1.1, 0.035);
  group.add(plateFront);

  // Back handle
  var handleBack = new THREE.Mesh(handleGeo.clone(), handleMat);
  handleBack.position.set(doorW/2 - 0.2, 1.1, -0.05);
  group.add(handleBack);

  // Back handle plate
  var plateBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.18, 0.01), handleMat
  );
  plateBack.position.set(doorW/2 - 0.2, 1.1, -0.035);
  group.add(plateBack);

  if (!isHorizontal) {
    group.rotation.y = Math.PI / 2;
  }

  G.scene.add(group);
  G.roomMeshes.push(group);
}

// ===================== CREATE ROOMS =====================
function createRooms() {
  for (var i = 0; i < ROOM_DEFS.length; i++) {
    var def = ROOM_DEFS[i];
    var center = roomCenter(def);
    var y = G.MAZE_Y;

    // Room light — fluorescent panel
    var light = new THREE.PointLight(def.light.color, 0, def.light.range);
    light.position.set(center.x, y + G.MAZE_WALL_H - 0.5, center.z);
    light.userData.baseIntensity = def.light.intensity;
    G.scene.add(light);
    G.roomLights.push(light);

    // Room ceiling light panel (emissive)
    var roomPanelGeo = new THREE.BoxGeometry(1.2, 0.02, 0.25);
    var roomPanelMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: def.light.color === 0xCCDDFF ? 0xCCDDFF : 0xeeeef5,
      emissiveIntensity: 0.6,
      roughness: 0.3
    });
    var roomPanel = new THREE.Mesh(roomPanelGeo, roomPanelMat);
    roomPanel.position.set(center.x, y + G.MAZE_WALL_H - 0.01, center.z);
    G.scene.add(roomPanel);
    G.roomMeshes.push(roomPanel);

    // Room-specific floor tint
    var floorGeo = new THREE.PlaneGeometry(
      (def.cells.c2 - def.cells.c1 + 1) * G.MCELL - 0.5,
      (def.cells.r2 - def.cells.r1 + 1) * G.MCELL - 0.5
    );
    floorGeo.rotateX(-Math.PI / 2);
    var floorColor = def.id === 'room_1' ? 0x5A5040 : 0x404A55;
    var floor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({
      color: floorColor, roughness: 0.9, metalness: 0.05
    }));
    floor.position.set(center.x, y + 0.01, center.z);
    G.scene.add(floor);
    G.roomMeshes.push(floor);

    // Door frames at room entrances
    var rm = def.cells;
    // Top entrance (H-wall above room)
    var topZ = rm.r1 * G.MCELL - G.MHALF;
    createDoorFrame(rm.c1 * G.MCELL - G.MHALF + G.MCELL/2, y, topZ, true);
    // Bottom entrance (H-wall below room)
    var botZ = (rm.r2 + 1) * G.MCELL - G.MHALF;
    createDoorFrame(rm.c1 * G.MCELL - G.MHALF + G.MCELL/2, y, botZ, true);

    if (def.id === 'room_1') createRoom1(center, y);
    if (def.id === 'room_2') createRoom2(center, y);
  }
}

// ===================== ROOM 1: Chemistry Table =====================
function createRoom1(center, y) {
  var cx = center.x, cz = center.z;

  // Table — metal surface (institutional style)
  var tableMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.4, metalness: 0.6 });
  var tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.8), tableMat);
  tableTop.position.set(cx, y + 0.75, cz);
  G.scene.add(tableTop); G.roomMeshes.push(tableTop);

  // Table legs
  var legGeo = new THREE.BoxGeometry(0.06, 0.72, 0.06);
  var legMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.5, metalness: 0.5 });
  var legOffsets = [[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]];
  for (var i = 0; i < 4; i++) {
    var leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(cx + legOffsets[i][0], y + 0.36, cz + legOffsets[i][1]);
    G.scene.add(leg); G.roomMeshes.push(leg);
  }

  // White Powder (KCN) — cone shape (ShenongHall style)
  var kcnMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.04, 8),
    new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.9 })
  );
  kcnMesh.position.set(cx - 0.2, y + 0.8, cz + 0.1);
  kcnMesh.userData.interactable = true;
  kcnMesh.userData.substanceId = 'kcn';
  kcnMesh.userData.type = 'substance';
  kcnMesh.userData.nameKey = 'kcn.name';
  kcnMesh.userData.name = L('kcn.name');
  kcnMesh.userData.roomKey = 'obj.room1';
  kcnMesh.userData.room = L('obj.room1');
  G.scene.add(kcnMesh);
  G.interactables.push(kcnMesh);
  G.roomMeshes.push(kcnMesh);

  // Scatter grains
  for (var j = 0; j < 5; j++) {
    var grain = new THREE.Mesh(
      new THREE.SphereGeometry(0.015 + Math.random()*0.01, 4, 4),
      new THREE.MeshStandardMaterial({ color: 0xf0f0e8, roughness: 0.95 })
    );
    grain.position.set(
      cx - 0.2 + (Math.random()-0.5)*0.08,
      y + 0.79,
      cz + 0.1 + (Math.random()-0.5)*0.08
    );
    G.scene.add(grain); G.roomMeshes.push(grain);
  }

  // Red Berry
  var berryMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xCC2222, roughness: 0.6 })
  );
  berryMesh.position.set(cx + 0.3, y + 0.8, cz - 0.1);
  berryMesh.userData.interactable = true;
  berryMesh.userData.substanceId = 'red_berry';
  berryMesh.userData.type = 'substance';
  berryMesh.userData.nameKey = 'berry.name';
  berryMesh.userData.name = L('berry.name');
  berryMesh.userData.roomKey = 'obj.room1';
  berryMesh.userData.room = L('obj.room1');
  G.scene.add(berryMesh);
  G.interactables.push(berryMesh);
  G.roomMeshes.push(berryMesh);

  // Berry stem
  var stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 0.04, 4),
    new THREE.MeshStandardMaterial({ color: 0x336622, roughness: 0.8 })
  );
  stem.position.set(cx + 0.3, y + 0.84, cz - 0.1);
  G.scene.add(stem); G.roomMeshes.push(stem);
  initBerryDecay(berryMesh, stem);

  // Door handle — metal cylinder on the south wall
  var wallZ = (ROOM_DEFS[0].cells.r2 + 1) * G.MCELL - G.MHALF;
  var handleMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8),
    new THREE.MeshStandardMaterial({ color: 0xAAAAAA, roughness: 0.4, metalness: 0.5 })
  );
  handleMesh.rotation.x = Math.PI / 2;
  handleMesh.position.set(cx - 1.5, y + 1.2, wallZ - 0.2);
  handleMesh.userData.interactable = true;
  handleMesh.userData.type = 'surface';
  handleMesh.userData.surfaceId = 'room1_doorhandle';
  handleMesh.userData.nameKey = 'obj.doorhandle';
  handleMesh.userData.name = L('obj.doorhandle');
  handleMesh.userData.roomKey = 'obj.room1';
  handleMesh.userData.room = L('obj.room1');
  G.scene.add(handleMesh);
  G.interactables.push(handleMesh);
  G.roomMeshes.push(handleMesh);

  // Handle plate
  var plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.2, 0.01),
    new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.4, metalness: 0.4 })
  );
  plate.position.set(cx - 1.5, y + 1.2, wallZ - 0.1);
  G.scene.add(plate); G.roomMeshes.push(plate);

  // Drainage grate on floor (institutional detail)
  var grateMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6, metalness: 0.4 });
  var grate = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), grateMat);
  grate.rotation.x = -Math.PI / 2;
  grate.position.set(cx + 1.5, y + 0.015, cz + 1.5);
  G.scene.add(grate); G.roomMeshes.push(grate);
}

// ===================== ROOM 2: Ventilation Room =====================
function createRoom2(center, y) {
  var cx = center.x, cz = center.z;

  // Vent — dark metallic gray
  var ventMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.05, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x606060, roughness: 0.5, metalness: 0.4 })
  );
  ventMesh.position.set(cx, y + G.MAZE_WALL_H - 0.03, cz);
  G.scene.add(ventMesh); G.roomMeshes.push(ventMesh);

  // Vent grate lines
  for (var i = -3; i <= 3; i++) {
    var line = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.02, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x505050, roughness: 0.5, metalness: 0.3 })
    );
    line.position.set(cx, y + G.MAZE_WALL_H - 0.01, cz + i * 0.1);
    G.scene.add(line); G.roomMeshes.push(line);
  }

  // Drainage grate
  var grateMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6, metalness: 0.4 });
  var grate = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), grateMat);
  grate.rotation.x = -Math.PI / 2;
  grate.position.set(cx - 1.0, y + 0.015, cz + 1.0);
  G.scene.add(grate); G.roomMeshes.push(grate);
}

// ===================== ROOM DETECTION =====================
function getCurrentRoom() {
  if (!G.inMaze) return null;
  for (var i = 0; i < ROOM_DEFS.length; i++) {
    var def = ROOM_DEFS[i];
    var center = roomCenter(def);
    var halfW = ((def.cells.c2 - def.cells.c1 + 1) * G.MCELL) / 2;
    var halfH = ((def.cells.r2 - def.cells.r1 + 1) * G.MCELL) / 2;
    // Use periodic distance for each axis
    var dx = G.mpx - center.x; dx -= G.MSIZE * Math.round(dx / G.MSIZE);
    var dz = G.mpz - center.z; dz -= G.MSIZE * Math.round(dz / G.MSIZE);
    if (Math.abs(dx) < halfW && Math.abs(dz) < halfH) return def;
  }
  return null;
}
