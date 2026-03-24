'use strict';

// ===================== SUBSTANCE DEFINITIONS =====================
var SUBSTANCES = {};

function initSubstances() {
  SUBSTANCES = {
    kcn: {
      id: 'kcn',
      name: 'White Powder',
      visual: { shape: 'sphere', color: 0xffffff, size: 0.05 },
      properties: {
        smell: { description: 'You detect a faint bitter almond scent.', detectDistance: 2.0 },
        taste: { lethal: true, delay: 0, description: 'Intensely bitter.' },
        touch: { residue: true, residueId: 'kcn_residue', description: 'Fine crystalline powder clings to your fingers.' },
        look: { description: 'Fine white crystalline powder. It catches the light slightly.' },
        smellClose: { description: 'A distinct bitter almond scent.' }
      },
      facts: {
        name: 'Potassium Cyanide (KCN)',
        lethality: '1-3 mg/kg body weight',
        mechanism: 'Inhibits cytochrome c oxidase, blocks cellular respiration'
      }
    },
    kcn_residue: {
      id: 'kcn_residue',
      name: 'Invisible Residue',
      invisible: true,
      properties: {
        taste: { lethal: true, delay: 2, description: '' },
        touch: { residue: true, residueId: 'kcn_residue', description: '' }
      }
    },
    red_berry: {
      id: 'red_berry',
      name: 'Red Berry',
      visual: { shape: 'sphere', color: 0xCC2222, size: 0.04 },
      properties: {
        smell: { description: 'A faint fruity aroma.', detectDistance: 0.5 },
        taste: { lethal: false, delay: 0, description: 'Sweet and slightly tart. Harmless.' },
        touch: { residue: false, description: 'Smooth, slightly yielding skin.' },
        look: { description: 'A small, round red berry with a thin stem. Appears ripe.' },
        smellClose: { description: 'Sweet, fruity aroma. Smells like a common berry.' }
      },
      facts: {
        name: 'Common Red Berry',
        lethality: 'Non-toxic',
        mechanism: 'N/A'
      }
    }
  };
}

function getSubstance(id) {
  return SUBSTANCES[id] || null;
}
