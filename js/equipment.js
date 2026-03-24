'use strict';

// ===================== EQUIPMENT SYSTEM =====================
var EQUIPMENT_DEFS = {
  gloves: {
    id: 'gloves',
    name: 'Gloves',
    description: 'Latex gloves. Prevent direct skin contact.',
    effect: 'Blocks residue transfer when touching objects.'
  },
  'gas mask': {
    id: 'gas_mask',
    name: 'Gas Mask',
    description: 'Respirator mask. Filters airborne substances.',
    effect: 'Blocks inhalation effects.'
  },
  candle: {
    id: 'candle',
    name: 'Candle',
    description: 'A simple candle. Flame requires oxygen.',
    effect: 'Goes out in oxygen-depleted environments.'
  },
  'geiger counter': {
    id: 'geiger_counter',
    name: 'Geiger Counter',
    description: 'Radiation detection device.',
    effect: 'Clicks near radioactive sources.'
  },
  'wet cloth': {
    id: 'wet_cloth',
    name: 'Wet Cloth',
    description: 'A damp cloth for wiping surfaces.',
    effect: 'Can clean contamination from surfaces.'
  },
  'magnifying glass': {
    id: 'magnifying_glass',
    name: 'Magnifying Glass',
    description: 'For close examination.',
    effect: 'Reveals microscopic details.'
  },
  thermometer: {
    id: 'thermometer',
    name: 'Thermometer',
    description: 'Measures temperature.',
    effect: 'Shows ambient temperature in current area.'
  }
};

function grantEquipment(itemName) {
  var normalized = itemName.toLowerCase().trim();

  // Try exact match first, then partial match
  var def = EQUIPMENT_DEFS[normalized];
  if (!def) {
    for (var key in EQUIPMENT_DEFS) {
      if (normalized.indexOf(key) !== -1 || key.indexOf(normalized) !== -1) {
        def = EQUIPMENT_DEFS[key]; normalized = key; break;
      }
    }
  }
  if (!def) return;

  if (G.equipment.indexOf(normalized) === -1) {
    G.equipment.push(normalized);
    if (G.currentCharacter) {
      G.currentCharacter.equipment.push(normalized);
    }
    showMsg('Received: ' + def.name + '\n' + def.effect, 5000);
    addNotebookEntry('received equipment', def.name, 'Tombstone', def.effect);

    // Special: wet cloth can clean surfaces
    if (normalized === 'wet cloth') {
      showMsg('Received: ' + def.name + '\nUse it to wipe contaminated surfaces.', 5000);
    }
  }
}

// Check if player has specific equipment
function hasEquipment(itemName) {
  return G.equipment.indexOf(itemName.toLowerCase()) !== -1;
}
