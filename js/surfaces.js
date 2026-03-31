'use strict';

// ===================== SURFACE STATE MANAGEMENT =====================
// G.surfaceStates[surfaceId] = { contamination: [{ substanceId, depositedBy, timestamp }] }

function initSurfaces() {
  G.surfaceStates = {
    room1_doorhandle: { contamination: [] }
  };
}

function contaminateSurface(surfaceId, substanceId, characterName) {
  if (!G.surfaceStates[surfaceId]) {
    G.surfaceStates[surfaceId] = { contamination: [] };
  }
  // Check if already contaminated with this substance
  var existing = G.surfaceStates[surfaceId].contamination.find(function(c) {
    return c.substanceId === substanceId;
  });
  if (!existing) {
    G.surfaceStates[surfaceId].contamination.push({
      substanceId: substanceId,
      depositedBy: characterName,
      timestamp: G.gameTime
    });
    saveGame();
  }
}

function getSurfaceContamination(surfaceId) {
  if (!G.surfaceStates[surfaceId]) return [];
  return G.surfaceStates[surfaceId].contamination;
}

function cleanSurface(surfaceId) {
  if (G.surfaceStates[surfaceId]) {
    G.surfaceStates[surfaceId].contamination = [];
  }
}

function cleanAllSurfaces() {
  for (var id in G.surfaceStates) {
    G.surfaceStates[id].contamination = [];
  }
}
