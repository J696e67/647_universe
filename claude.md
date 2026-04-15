# CLAUDE.md — 神农堂 (Shennong Hall) v2

## Project Overview

Browser-based 3D science inquiry game. Players explore a world using five senses, die from unknown causes, and investigate their own deaths across multiple lives. Nested inside 647号宇宙, a PBC (periodic boundary condition) space.

No tutorials. No hints. No scores. Learning emerges from interaction.
Full design spec: see GDD.md.

## Tech Stack
- Three.js for 3D rendering
- Web Audio API for procedural audio
- Claude Sonnet 4.6 (Anthropic API) for Tombstone AI dialogue
- Vanilla HTML/CSS/JS, no frameworks
- Single index.html entry point

## File Structure
```
/
├── index.html              # Entry point
├── GDD.md                  # Game Design Document v1.1
├── config.local.js         # Local API key (gitignored)
├── css/
│   └── style.css           # UI overlay styles
├── js/
│   ├── main.js             # Game init, render loop
│   ├── world.js            # 647 outer world (terrain, sky, house, tombstone)
│   ├── maze.js             # Inner maze generation with PBC
│   ├── rooms.js            # Room definitions and hazard placement
│   ├── player.js           # Player controller, movement, first-person camera
│   ├── senses.js           # Five-sense interaction system
│   ├── substances.js       # Substance definitions, properties, residue tracking
│   ├── surfaces.js         # Surface contamination state management
│   ├── effects.js          # Delayed effects, symptoms, death triggers
│   ├── notebook.js         # Persistent cross-life notebook + CER Board
│   ├── characters.js       # Character lifecycle, death, respawn
│   ├── tombstone.js        # AI dialogue interface (Claude Sonnet + offline fallback)
│   ├── equipment.js        # Requestable equipment system
│   ├── leaderboard.js      # Knowledge claim tracking (14 claims, 6 tiers)
│   ├── sky.js              # Sun/moon/star cycle (real star catalog, 39.9°N)
│   ├── antistuck.js        # Anti-stuck system
│   └── audio.js            # Procedural audio
└── assets/                 # Minimal geometric assets
```

## Core Data Structures

### Substance
```javascript
{
  id: "kcn",
  name: "White Powder",
  visual: { shape: "sphere", color: 0xffffff, size: 0.05 },
  properties: {
    smell: { description: "Bitter almond scent", detectDistance: 1.0 },
    taste: { lethal: true, delay: 0, description: "Intensely bitter" },
    touch: { residue: true, residueId: "kcn_residue" },
    look: { description: "Fine white crystalline powder" }
  },
  facts: {
    name: "Potassium Cyanide (KCN)",
    lethality: "1-3 mg/kg body weight",
    mechanism: "Inhibits cytochrome c oxidase, blocks cellular respiration"
  }
}
```

### Surface
```javascript
{
  id: "room1_doorhandle",
  type: "doorhandle",
  position: [x, y, z],
  contamination: [
    { substanceId: "kcn_residue", depositedBy: "Alice", timestamp: 45.2 }
  ]
}
```

### Character
```javascript
{
  id: "char_002",
  name: "Tylor",
  alive: true,
  hp: 100,
  handContamination: [],    // what's on their hands right now
  activeEffects: [],        // pending delayed effects
  interactions: [],         // log of all actions
  equipment: []             // gloves, mask, candle, geiger counter, etc.
}
```

### Notebook Entry (system-generated)
```javascript
{
  characterName: "Alice",
  timestamp: 45.2,
  action: "touch",
  target: "White Powder",
  location: "Room 1 - Table",
  result: "Hands now contaminated with residue"
}
```

### CER Entry (player-authored)
```javascript
{
  id: "cer_001",
  claim: "White powder is lethal",
  evidence: "Alice tasted white powder and collapsed (Death Record #1)",
  reasoning: "Tasting the powder was Alice's last action before death...",
  validated: false,         // true when both evidence gate and articulation gate satisfied
  tier: 1
}
```

### Notebook (Persistent)
```javascript
{
  entries: [...],           // system-generated interaction log, all characters
  deaths: [
    { characterName: "Alice", timestamp: 120.5, location: "Room 1",
      causeId: "kcn_direct", lastActions: ["touched White Powder", "tasted White Powder"] }
  ],
  cerEntries: [],           // player-authored CER Board entries
  validatedClaims: [],      // ids of validated knowledge claims
  tombstoneDialogue: [],    // full dialogue history
  totalCharacters: 2,
  currentCharacter: "Tylor",
  // Evidence tracking
  observedBerryStages: {},  // berryId → Set of observed decay stages
  skyObservations: [],      // [{timestamp, pitch}] — sky-looking events
  dayNightCycles: 0,        // full cycles experienced
  pbcCrossed: false,        // has player crossed world boundary
  thermometerLocations: []  // ["above", "below"]
}
```

## Interaction System (Five Senses)

### Automatic Senses
- **Vision**: Render objects in scene. Player sees everything in view frustum.
- **Hearing**: Ambient audio per room. Some rooms have specific sounds (humming, dripping).
- **Smell**: When player enters a room or approaches a substance with smell property, show text overlay. Trigger distance configurable per substance.

### Active Senses (Player-Initiated)
Player looks at an object and gets radial action menu:
- **Look**: detailed visual description
- **Listen**: auditory inspection
- **Smell** (close): closer olfactory inspection
- **Touch**: transfers residue if applicable, triggers contact effects
- **Taste**: checks hand contamination FIRST, then substance properties

### Residue Chain Logic
```
Player touches Substance A (residue: true)
  → Player.handContamination.push(A.residueId)
  → Log to Notebook

Player touches Surface B
  → Surface B.contamination.push(A.residueId)
  → Log to Notebook

Next Character touches Surface B
  → Next Character.handContamination.push(A.residueId)
  → NOT shown to player — cross-contamination is hidden

Next Character tastes anything
  → Check handContamination first
  → If lethal residue on hands → trigger death
  → Death cause in records: "Died after tasting [item]"
  → Actual cause hidden: cross-contamination
```

## Knowledge Claim System (14 Claims, 6 Tiers)

Every claim requires two gates simultaneously:
- **Evidence Gate**: Sufficient in-game observations logged
- **Articulation Gate**: Player expresses the claim to Tombstone demonstrating understanding

Articulation is evaluated holistically by Claude Sonnet — NOT by keyword matching.

| Tier | # | Claim | Evidence Gate | Articulation Gate |
|------|---|-------|--------------|-------------------|
| 1 | 1 | White powder is lethal | ≥1 KCN death record | Causal link between powder and death |
| 1 | 3 | Red berry is non-toxic (when uncontaminated) | Ate berry clean-handed + survived | Safety claim + specifies condition |
| 2 | 2 | White powder is KCN | Smelled KCN + died from KCN | Identifies substance via sensory+chemistry |
| 3 | 4 | Berry undergoes stage-based decay | Looked at berry at ≥2 decay stages | Describes sequence, not just "it changed" |
| 3 | 8 | Sun/moon/stars move at different speeds | ≥2 day-night cycles + sky observations | Distinguishes speeds of specific bodies |
| 4 | 5 | Temperature affects berry decay rate | Looked at berry above + below ground | Links temperature to decay speed |
| 4 | 6 | White powder causes cross-contamination | Cross-contamination pattern in death records | Identifies contact transfer as mechanism |
| 4 | 7 | Above/below ground temperatures differ | Thermometer used in both locations | States temperature difference as measurable fact |
| 5 | 9 | Celestial bodies share a rotation axis | ≥2 day-night cycles | Identifies common rotational center |
| 5 | 10 | World has PBC | Crossed boundary ≥1 time | Describes looping topology |
| 5 | 11 | World is flat | Traveled significant distance | Articulates difference from spherical geometry |
| 6 | 12 | Night sky matches real constellations | Night sky visible | Names specific constellations |
| 6 | 13 | World is in northern hemisphere | Observed night sky | Identifies Polaris or N-hemisphere patterns |
| 6 | 14 | World is at ~40°N latitude | External (player's astronomy knowledge) | States latitude with reasoning |

## AI Tombstone System

### Role
The Tombstone's sole purpose is **question formulation** — helping players transform reactions into investigable questions. It does NOT trigger knowledge achievements. That is the CER Board's role.

### Question Classification Framework
Internal to system prompt — player never sees type labels.

**TYPE 1 — Fact-Based Question**: "What is this white powder?"
→ Redirect toward process: "What observations could help you figure that out?"

**TYPE 2 — Comment or Observation**: "That berry killed Alice."
→ Push toward inquiry: "It did. What do you think made it lethal?"

**TYPE 3 — Question Referencing In-Game Entities**: "Does the white powder react with the berry?"
→ Help sharpen: "How would you test that? What would you expect to see if it does?"

**TYPE 4 — Philosophical or Existential**: "Why do we keep dying?"
→ Honor without aggressive redirect: "That's worth sitting with. But while you're here — is there something specific about this world you want to understand?"

**TYPE 5 — Opinion Expressed as Question**: "Isn't it obvious the powder is poison?"
→ Surface assumption: "What makes you sure? Have you tested it directly?"

**TYPE 6 — Well-Formed Investigable Question**: "If I mix the white powder with water, will it still smell like almonds?"
→ Affirm and step back: "That sounds like something you can find out. Go try it."

### Dialogue Constraints
- **Brevity**: 2–3 sentences maximum
- **Tone**: Calm, slightly enigmatic, never condescending
- **No answers**: Never reveals facts about Universe 647's mechanics
- **No classification labels**: Never announces "This is a TYPE 3 question"
- **Death context**: References specific Death Record observations
- **Conversation limit**: 5–7 exchanges per visit
- **Language**: Matches player's language

### Equipment Request Flow
```
Player: "I need gloves"
Tombstone: "What do you want to protect against?"
Player: "I think there's something on the surfaces"
Tombstone: [EQUIP: gloves] "Here are gloves. What will you test first?"
→ equipment.js grants gloves; strips [EQUIP:...] from display
```

### Technical Implementation
- **Model**: claude-sonnet-4-6
- **Production**: Frontend JS → Cloudflare Workers proxy → Anthropic API
- **Local dev**: Direct browser call with `config.local.js` (gitignored), `IS_LOCAL` detection
- **Fallback chain**: Ollama (phi3:mini) → rule-based offline responses
- **Context injected**: Last 20 notebook entries + all death records + current character

## Delayed Effects System
```javascript
{
  effectId: "kcn_ingestion",
  character: "Alice",
  trigger: "taste",
  delay: 0,         // seconds; 0 = immediate
  lethal: true,
  deathMessage: "Alice collapsed."
}
```

## Berry Decay System

Berries decay through 5 stages driven by a Q10 temperature model:
- Stage 0 FRESH (0–360s), Stage 1 OVERRIPE (360–720s), Stage 2 FERMENTING (720–1080s),
  Stage 3 ROTTING (1080–1440s), Stage 4 DECAYED (1440s+)
- Above ground: 26°C (faster decay). Underground: 10°C (slower decay)
- Rate = Q10 ^ ((T - T_ref) / 10), Q10 = 2, T_ref = 20°C
- Color, scale, stem color, smell distance all interpolate between stages
- Berry contamination: picking up KCN residue on hands then touching a berry deposits residue on the berry

## Room Definitions

### Room 1 — Chemistry Table
Contains: KCN (white powder, cone shape), Red Berry (sphere with stem + decay system), Door Handle (contamination surface)

### Room 2 — Ventilation Room
Contains: Ceiling vent, drainage grate. No interactive substances (environment-only room).

## 647号宇宙 Outer World

- **Terrain**: Flat wheat field, 200×200 unit world with PBC wrapping
- **Sky**: Real star catalog (92 named stars, 39.9°N observer), constellation lines, realistic sun/moon paths
- **House**: Interior with table + book. Ceiling lamp. Connects to maze entrance.
- **Tombstone**: Circular ring structure at PBC boundary seam. Reverse-perspective scaling. Dialogue activates at <5m.
- **Death gravestones**: Clustered around AI tombstone (radius 19), glow in cause color
- **Maze entrance**: Depression with 4 glowing pillars

## UI

- **HUD**: Character name (top left), Notebook button (top right), Language toggle, Crosshair
- **Radial action menu**: 5 sense buttons arranged in circle around crosshair target
- **Tombstone chat**: Bottom overlay, active within 5m of tombstone
- **Death screen**: Fade to black → "[Name] collapsed." → "A new explorer arrives."
- **Notebook overlay**: System log + CER Board tabs, filter by character, deaths in red

## Important Constraints
- NO tutorial text, help screens, or objective markers
- NO health bars, damage numbers, or RPG mechanics
- Death messages are neutral ("Alice collapsed"), not dramatic
- System notebook entries record facts, not interpretations — player CER entries contain interpretations
- Tombstone never answers questions about Universe 647's mechanics
- Tombstone goal = question formulation only; CER Board = knowledge articulation
- All science must be accurate — real chemistry, real physics, real toxicology
- Articulation quality evaluated by Claude Sonnet holistically, not keyword matching
