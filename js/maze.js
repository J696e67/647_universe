'use strict';

// ===================== MAZE GENERATION =====================
function mazeRand() {
  G.mazeSeed = (G.mazeSeed * 1664525 + 1013904223) & 0x7FFFFFFF;
  return G.mazeSeed / 0x7FFFFFFF;
}

function removeWall(r, c, dir) {
  if (dir === 0) G.mazeH[(r - 1 + G.MROWS) % G.MROWS][c] = false;
  else if (dir === 1) G.mazeH[r][c] = false;
  else if (dir === 2) G.mazeV[r][c] = false;
  else G.mazeV[r][(c - 1 + G.MCOLS) % G.MCOLS] = false;
}

function generateMaze() {
  G.mazeSeed = 647;
  var r, c;
  for (r = 0; r < G.MROWS; r++) {
    G.mazeH[r] = []; G.mazeV[r] = [];
    for (c = 0; c < G.MCOLS; c++) { G.mazeH[r][c] = true; G.mazeV[r][c] = true; }
  }
  var visited = [];
  for (r = 0; r < G.MROWS; r++) {
    visited[r] = [];
    for (c = 0; c < G.MCOLS; c++) visited[r][c] = false;
  }
  var dirs = [{ dr:-1, dc:0 },{ dr:1, dc:0 },{ dr:0, dc:1 },{ dr:0, dc:-1 }];
  var stack = [{ r:0, c:0, lastDir:-1 }];
  visited[0][0] = true;
  while (stack.length > 0) {
    var cur = stack[stack.length - 1];
    var neighbors = [];
    for (var d = 0; d < 4; d++) {
      var nr = (cur.r + dirs[d].dr + G.MROWS) % G.MROWS;
      var nc = (cur.c + dirs[d].dc + G.MCOLS) % G.MCOLS;
      if (!visited[nr][nc]) neighbors.push({ d:d, r:nr, c:nc });
    }
    if (neighbors.length === 0) { stack.pop(); continue; }
    var sameDir = neighbors.filter(function(n){ return n.d === cur.lastDir; });
    var chosen;
    if (sameDir.length > 0 && mazeRand() < 0.7) chosen = sameDir[0];
    else chosen = neighbors[Math.floor(mazeRand() * neighbors.length)];
    removeWall(cur.r, cur.c, chosen.d);
    visited[chosen.r][chosen.c] = true;
    stack.push({ r:chosen.r, c:chosen.c, lastDir:chosen.d });
  }
  // Remove ~12% walls for open areas
  for (r = 0; r < G.MROWS; r++) {
    for (c = 0; c < G.MCOLS; c++) {
      if (G.mazeH[r][c] && mazeRand() < 0.12) G.mazeH[r][c] = false;
      if (G.mazeV[r][c] && mazeRand() < 0.12) G.mazeV[r][c] = false;
    }
  }
  // Clear room areas (remove all walls within room cells)
  clearRoomWalls();
}

// Clear walls for designated room areas
function clearRoomWalls() {
  // Room 1 (Chemistry Table): cells [4,4] to [5,5]
  var rooms = [
    { r1: 4, c1: 4, r2: 5, c2: 5 },  // Room 1
    { r1: 10, c1: 10, r2: 11, c2: 11 } // Room 2 (Ventilation)
  ];
  for (var ri = 0; ri < rooms.length; ri++) {
    var rm = rooms[ri];
    for (var r = rm.r1; r <= rm.r2; r++) {
      for (var c = rm.c1; c <= rm.c2; c++) {
        // Remove internal walls
        if (r < rm.r2) G.mazeH[r][c] = false;
        if (c < rm.c2) G.mazeV[r][c] = false;
      }
    }
    // Ensure at least one entrance on each side
    G.mazeH[rm.r1 - 1 >= 0 ? rm.r1 - 1 : G.MROWS - 1][rm.c1] = false; // top entrance
    G.mazeH[rm.r2][rm.c1] = false; // bottom entrance
  }
}

// ===================== MAZE GEOMETRY (ShenongHall style) =====================
function buildMazeGeometry() {
  var positions = [], norms = [], indices = [];
  var vc = 0;
  var wallW = 0.8;
  var hw = wallW / 2;
  var offsets = [
    [0,0],[G.MSIZE,0],[-G.MSIZE,0],[0,G.MSIZE],[0,-G.MSIZE],
    [G.MSIZE,G.MSIZE],[-G.MSIZE,G.MSIZE],[G.MSIZE,-G.MSIZE],[-G.MSIZE,-G.MSIZE]
  ];

  function addQuad(x0,y0,z0, x1,y1,z1, x2,y2,z2, x3,y3,z3, nx,ny,nz) {
    positions.push(x0,y0,z0, x1,y1,z1, x2,y2,z2, x3,y3,z3);
    norms.push(nx,ny,nz, nx,ny,nz, nx,ny,nz, nx,ny,nz);
    indices.push(vc,vc+2,vc+1, vc,vc+3,vc+2); vc += 4;
  }

  for (var ti = 0; ti < offsets.length; ti++) {
    var ox = offsets[ti][0], oz = offsets[ti][1];
    var y0 = G.MAZE_Y, y1 = G.MAZE_Y + G.MAZE_WALL_H;

    for (var r = 0; r < G.MROWS; r++) {
      for (var c = 0; c < G.MCOLS; c++) {

        // ── H-wall: 3 faces (south, north, top), no end caps ──
        if (G.mazeH[r][c]) {
          var hx0 = c*G.MCELL + hw - G.MHALF + ox;
          var hx1 = (c+1)*G.MCELL - hw - G.MHALF + ox;
          var hz  = (r+1)*G.MCELL - G.MHALF + oz;
          addQuad(hx0,y0,hz-hw, hx1,y0,hz-hw, hx1,y1,hz-hw, hx0,y1,hz-hw, 0,0,-1);
          addQuad(hx1,y0,hz+hw, hx0,y0,hz+hw, hx0,y1,hz+hw, hx1,y1,hz+hw, 0,0, 1);
          addQuad(hx0,y1,hz-hw, hx1,y1,hz-hw, hx1,y1,hz+hw, hx0,y1,hz+hw, 0,1, 0);
        }

        // ── V-wall: 3 faces (west, east, top), no end caps ──
        if (G.mazeV[r][c]) {
          var vx  = (c+1)*G.MCELL - G.MHALF + ox;
          var vz0 = r*G.MCELL + hw - G.MHALF + oz;
          var vz1 = (r+1)*G.MCELL - hw - G.MHALF + oz;
          addQuad(vx-hw,y0,vz1, vx-hw,y0,vz0, vx-hw,y1,vz0, vx-hw,y1,vz1, -1,0,0);
          addQuad(vx+hw,y0,vz0, vx+hw,y0,vz1, vx+hw,y1,vz1, vx+hw,y1,vz0,  1,0,0);
          addQuad(vx-hw,y1,vz0, vx+hw,y1,vz0, vx+hw,y1,vz1, vx-hw,y1,vz1,  0,1,0);
        }

        // ── Grid-point driven corner ──
        // Analyze intersection at bottom-right of cell (r,c).
        // 4 possible walls radiating from this point:
        var pCR = (c+1) % G.MCOLS, pRD = (r+1) % G.MROWS;
        var wL = G.mazeH[r][c];           // west
        var wR = G.mazeH[r][pCR];         // east
        var wU = G.mazeV[r][c];           // south (lower z)
        var wD = G.mazeV[pRD][c];         // north (higher z)
        if (!wL && !wR && !wU && !wD) continue;
        // All cases with ≥1 wall: render corner post.
        // Only faces toward open directions (no wall) are rendered.
        var px = (c+1)*G.MCELL - G.MHALF + ox;
        var pz = (r+1)*G.MCELL - G.MHALF + oz;
        if (!wU) addQuad(px-hw,y0,pz-hw, px+hw,y0,pz-hw, px+hw,y1,pz-hw, px-hw,y1,pz-hw, 0,0,-1);
        if (!wD) addQuad(px+hw,y0,pz+hw, px-hw,y0,pz+hw, px-hw,y1,pz+hw, px+hw,y1,pz+hw, 0,0, 1);
        if (!wL) addQuad(px-hw,y0,pz+hw, px-hw,y0,pz-hw, px-hw,y1,pz-hw, px-hw,y1,pz+hw, -1,0,0);
        if (!wR) addQuad(px+hw,y0,pz-hw, px+hw,y0,pz+hw, px+hw,y1,pz+hw, px+hw,y1,pz-hw,  1,0,0);
        addQuad(px-hw,y1,pz-hw, px+hw,y1,pz-hw, px+hw,y1,pz+hw, px-hw,y1,pz+hw, 0,1,0);

      }
    }
  }

  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
  geo.setIndex(indices);
  // ShenongHall wall material: warm gray-beige, matte
  G.mazeMesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: 0x8a8a85, roughness: 0.85, metalness: 0.05
  }));
  G.scene.add(G.mazeMesh);

  // Floor — dark gray-brown, very matte
  var floorGeo = new THREE.PlaneGeometry(200, 200, 20, 20);
  floorGeo.rotateX(-Math.PI / 2);
  var fc = new Float32Array(floorGeo.attributes.position.count * 3);
  for (var i = 0; i < fc.length; i += 3) {
    var s = 0.92 + Math.random() * 0.08;
    fc[i] = 0.35 * s; fc[i+1] = 0.35 * s; fc[i+2] = 0.33 * s;
  }
  floorGeo.setAttribute('color', new THREE.BufferAttribute(fc, 3));
  G.mazeFloor = new THREE.Mesh(floorGeo, new THREE.MeshStandardMaterial({
    vertexColors: true, roughness: 0.9, metalness: 0.05
  }));
  G.mazeFloor.position.y = G.MAZE_Y;
  G.scene.add(G.mazeFloor);

  // Ceiling — lighter gray, matte
  var ceilGeo = new THREE.PlaneGeometry(200, 200);
  ceilGeo.rotateX(Math.PI / 2);
  G.mazeCeiling = new THREE.Mesh(ceilGeo, new THREE.MeshStandardMaterial({
    color: 0x9a9a95, roughness: 0.8, metalness: 0.05
  }));
  G.mazeCeiling.position.y = G.MAZE_Y + G.MAZE_WALL_H;
  G.scene.add(G.mazeCeiling);
}

// ===================== MAZE LIGHTS (fluorescent style) =====================
function createMazeLights() {
  // Player light — pale blue-white fluorescent
  G.mazePlayerLight = new THREE.PointLight(0xeeeef5, 0, 15);
  G.mazePlayerLight.position.set(0, G.MAZE_Y + G.MAZE_WALL_H - 0.3, 0);
  G.scene.add(G.mazePlayerLight);

  // Fixed fluorescent lights at intersections
  for (var r = 1; r < G.MROWS; r += 3) {
    for (var c = 1; c < G.MCOLS; c += 3) {
      var lx = (c+0.5)*G.MCELL - G.MHALF;
      var lz = (r+0.5)*G.MCELL - G.MHALF;
      var fl = new THREE.PointLight(0xeeeef5, 0, 12);
      fl.position.set(lx, G.MAZE_Y + G.MAZE_WALL_H - 0.3, lz);
      fl.userData.baseIntensity = 0.5;
      fl.userData.offset = Math.random() * 100;
      G.scene.add(fl);
      G.mazeLights.push(fl);
    }
  }

  // Ceiling light panels — emissive fluorescent strips
  var panelGeo = new THREE.BoxGeometry(1.2, 0.02, 0.25);
  var panelMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xeeeef5,
    emissiveIntensity: 0.8,
    roughness: 0.3
  });
  G.mazePanels = new THREE.InstancedMesh(panelGeo, panelMat, G.mazeLights.length);
  var pd = new THREE.Object3D();
  for (var i = 0; i < G.mazeLights.length; i++) {
    pd.position.copy(G.mazeLights[i].position);
    pd.position.y = G.MAZE_Y + G.MAZE_WALL_H - 0.01;
    pd.updateMatrix();
    G.mazePanels.setMatrixAt(i, pd.matrix);
  }
  G.mazePanels.instanceMatrix.needsUpdate = true;
  G.scene.add(G.mazePanels);

  // Entrance marker
  var marker = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, 0.02, 12),
    new THREE.MeshStandardMaterial({ color: 0x557755, roughness: 0.7, metalness: 0.1 })
  );
  marker.position.set(2, G.MAZE_Y + 0.02, 2);
  G.scene.add(marker);

  // Entrance light pillar
  var pillarGeo = new THREE.CylinderGeometry(0.15, 0.35, G.MAZE_WALL_H, 12, 1, true);
  var pillarMat = new THREE.MeshBasicMaterial({
    color: 0x88ccaa, transparent: true, opacity: 0.18,
    side: THREE.DoubleSide, depthWrite: false
  });
  var pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.set(2, G.MAZE_Y + G.MAZE_WALL_H / 2, 2);
  G.scene.add(pillar);
  var pillarLight = new THREE.PointLight(0x88ccaa, 0.6, 8);
  pillarLight.position.set(2, G.MAZE_Y + 0.5, 2);
  G.scene.add(pillarLight);
}

// ===================== MAZE COLLISION =====================
function mazeCollide(x, z) {
  var pad = 0.55;
  var lx = ((x + G.MHALF) % G.MSIZE + G.MSIZE) % G.MSIZE;
  var lz = ((z + G.MHALF) % G.MSIZE + G.MSIZE) % G.MSIZE;
  var col = Math.floor(lx / G.MCELL);
  var row = Math.floor(lz / G.MCELL);
  var cx = lx - col * G.MCELL;
  var cz = lz - row * G.MCELL;
  if (G.mazeH[row][col] && cz > G.MCELL - pad) return true;
  if (G.mazeH[(row-1+G.MROWS)%G.MROWS][col] && cz < pad) return true;
  if (G.mazeV[row][col] && cx > G.MCELL - pad) return true;
  if (G.mazeV[row][(col-1+G.MCOLS)%G.MCOLS] && cx < pad) return true;
  return false;
}

// ===================== MAZE UPDATE =====================
function updateMaze(t) {
  // Fluorescent flicker
  for (var i = 0; i < G.mazeLights.length; i++) {
    var fl = G.mazeLights[i];
    if (fl.intensity > 0) {
      fl.intensity = fl.userData.baseIntensity
        + Math.sin(t*30 + fl.userData.offset)*0.025
        + Math.sin(t*47 + fl.userData.offset*2)*0.015
        + Math.random()*0.008;
    }
  }
}
