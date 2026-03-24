'use strict';

// ===================== ROOM DEFINITIONS =====================
// Room positions in maze coordinates (cell-based → world position)
// Cell [r,c] → world position: x = (c+0.5)*MCELL - MHALF, z = (r+0.5)*MCELL - MHALF

var ROOM_DEFS = [
  {
    id: 'room_1',
    name: 'Chemistry Table Room',
    cells: { r1: 4, c1: 4, r2: 5, c2: 5 },
    light: { color: 0xFFEECC, intensity: 0.5, range: 12 },
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

// ===================== CREATE ROOMS =====================
function createRooms() {
  for (var i = 0; i < ROOM_DEFS.length; i++) {
    var def = ROOM_DEFS[i];
    var center = roomCenter(def);
    var y = G.MAZE_Y;

    // Room light
    var light = new THREE.PointLight(def.light.color, 0, def.light.range);
    light.position.set(center.x, y + G.MAZE_WALL_H - 0.5, center.z);
    light.userData.baseIntensity = def.light.intensity;
    G.scene.add(light);
    G.roomLights.push(light);

    // Room-specific floor tint
    var floorGeo = new THREE.PlaneGeometry(
      (def.cells.c2 - def.cells.c1 + 1) * G.MCELL - 0.5,
      (def.cells.r2 - def.cells.r1 + 1) * G.MCELL - 0.5
    );
    floorGeo.rotateX(-Math.PI / 2);
    var floorColor = def.id === 'room_1' ? 0x5A5040 : 0x404A55;
    var floor = new THREE.Mesh(floorGeo, new THREE.MeshLambertMaterial({ color: floorColor }));
    floor.position.set(center.x, y + 0.01, center.z);
    G.scene.add(floor);
    G.roomMeshes.push(floor);

    if (def.id === 'room_1') createRoom1(center, y);
    if (def.id === 'room_2') createRoom2(center, y);
  }
}

// ===================== ROOM 1: Chemistry Table =====================
function createRoom1(center, y) {
  var cx = center.x, cz = center.z;
  var tableMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });

  // Table (1.5 x 0.8 x 0.8, centered)
  var tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.8), tableMat);
  tableTop.position.set(cx, y + 0.75, cz);
  G.scene.add(tableTop); G.roomMeshes.push(tableTop);

  // Table legs
  var legGeo = new THREE.BoxGeometry(0.06, 0.72, 0.06);
  var legMat = new THREE.MeshLambertMaterial({ color: 0x6B5335 });
  var legOffsets = [[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]];
  for (var i = 0; i < 4; i++) {
    var leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(cx + legOffsets[i][0], y + 0.36, cz + legOffsets[i][1]);
    G.scene.add(leg); G.roomMeshes.push(leg);
  }

  // White Powder (KCN) — small white sphere on table
  var kcnMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    new THREE.MeshLambertMaterial({ color: 0xffffff })
  );
  kcnMesh.position.set(cx - 0.2, y + 0.81, cz + 0.1);
  kcnMesh.userData.interactable = true;
  kcnMesh.userData.substanceId = 'kcn';
  kcnMesh.userData.type = 'substance';
  kcnMesh.userData.name = 'White Powder';
  kcnMesh.userData.room = 'Room 1 - Chemistry Table';
  G.scene.add(kcnMesh);
  G.interactables.push(kcnMesh);
  G.roomMeshes.push(kcnMesh);

  // A small pile effect — several tiny spheres around the main one
  for (var j = 0; j < 5; j++) {
    var grain = new THREE.Mesh(
      new THREE.SphereGeometry(0.015 + Math.random()*0.01, 4, 4),
      new THREE.MeshLambertMaterial({ color: 0xf8f8f0 })
    );
    grain.position.set(
      cx - 0.2 + (Math.random()-0.5)*0.08,
      y + 0.79,
      cz + 0.1 + (Math.random()-0.5)*0.08
    );
    G.scene.add(grain); G.roomMeshes.push(grain);
  }

  // Red Berry — small red sphere on table
  var berryMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    new THREE.MeshLambertMaterial({ color: 0xCC2222 })
  );
  berryMesh.position.set(cx + 0.3, y + 0.8, cz - 0.1);
  berryMesh.userData.interactable = true;
  berryMesh.userData.substanceId = 'red_berry';
  berryMesh.userData.type = 'substance';
  berryMesh.userData.name = 'Red Berry';
  berryMesh.userData.room = 'Room 1 - Chemistry Table';
  G.scene.add(berryMesh);
  G.interactables.push(berryMesh);
  G.roomMeshes.push(berryMesh);

  // Berry stem
  var stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 0.04, 4),
    new THREE.MeshLambertMaterial({ color: 0x336622 })
  );
  stem.position.set(cx + 0.3, y + 0.84, cz - 0.1);
  G.scene.add(stem); G.roomMeshes.push(stem);

  // Door handle — cylinder on the wall (south wall of room)
  var wallZ = (ROOM_DEFS[0].cells.r2 + 1) * G.MCELL - G.MHALF;
  var handleMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.15, 8),
    new THREE.MeshLambertMaterial({ color: 0xAAAAAA })
  );
  handleMesh.rotation.x = Math.PI / 2;
  handleMesh.position.set(cx - 1.5, y + 1.2, wallZ - 0.2);
  handleMesh.userData.interactable = true;
  handleMesh.userData.type = 'surface';
  handleMesh.userData.surfaceId = 'room1_doorhandle';
  handleMesh.userData.name = 'Door Handle';
  handleMesh.userData.room = 'Room 1 - Chemistry Table';
  G.scene.add(handleMesh);
  G.interactables.push(handleMesh);
  G.roomMeshes.push(handleMesh);

  // Handle plate
  var plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.2, 0.01),
    new THREE.MeshLambertMaterial({ color: 0x999999 })
  );
  plate.position.set(cx - 1.5, y + 1.2, wallZ - 0.1);
  G.scene.add(plate); G.roomMeshes.push(plate);
}

// ===================== ROOM 2: Ventilation Room (Placeholder) =====================
function createRoom2(center, y) {
  // Placeholder — empty room with a vent on the ceiling
  var cx = center.x, cz = center.z;

  var ventMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.05, 0.8),
    new THREE.MeshLambertMaterial({ color: 0x606060 })
  );
  ventMesh.position.set(cx, y + G.MAZE_WALL_H - 0.03, cz);
  G.scene.add(ventMesh); G.roomMeshes.push(ventMesh);

  // Vent grate lines
  for (var i = -3; i <= 3; i++) {
    var line = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.02, 0.02),
      new THREE.MeshLambertMaterial({ color: 0x505050 })
    );
    line.position.set(cx, y + G.MAZE_WALL_H - 0.01, cz + i * 0.1);
    G.scene.add(line); G.roomMeshes.push(line);
  }
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
