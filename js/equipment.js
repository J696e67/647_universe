'use strict';

// ===================== EQUIPMENT SYSTEM =====================
var EQUIPMENT_DEFS = {
  gloves:           { id: 'gloves',           nameKey: 'equip.gloves',    descKey: 'equip.gloves.desc',    effectKey: 'equip.gloves.effect' },
  'gas mask':       { id: 'gas_mask',         nameKey: 'equip.gas_mask',  descKey: 'equip.gas_mask.desc',  effectKey: 'equip.gas_mask.effect' },
  candle:           { id: 'candle',           nameKey: 'equip.candle',    descKey: 'equip.candle.desc',    effectKey: 'equip.candle.effect' },
  'geiger counter': { id: 'geiger_counter',   nameKey: 'equip.geiger',    descKey: 'equip.geiger.desc',    effectKey: 'equip.geiger.effect' },
  'wet cloth':      { id: 'wet_cloth',        nameKey: 'equip.cloth',     descKey: 'equip.cloth.desc',     effectKey: 'equip.cloth.effect' },
  'magnifying glass':{ id: 'magnifying_glass', nameKey: 'equip.magnifier', descKey: 'equip.magnifier.desc', effectKey: 'equip.magnifier.effect' },
  thermometer:      { id: 'thermometer',      nameKey: 'equip.thermo',    descKey: 'equip.thermo.desc',    effectKey: 'equip.thermo.effect' }
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
    var eName = L(def.nameKey);
    var eEffect = L(def.effectKey);
    showMsg(L('equip.received', {name: eName, effect: eEffect}), 5000);
    addNotebookEntry('received equipment', eName, 'Tombstone', eEffect);
  }
}

// Check if player has specific equipment
function hasEquipment(itemName) {
  return G.equipment.indexOf(itemName.toLowerCase()) !== -1;
}
