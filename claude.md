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
│   ├── world.js            # 647 outer world (terrain, sky, house, tombstone, river)
│   ├── maze.js             # Inner maze generation with PBC
│   ├── rooms.js            # Room definitions and hazard placement
│   ├── player.js           # Player controller, movement, first-person camera
│   ├── senses.js           # Five-sense interaction system
│   ├── substances.js       # Substance definitions, properties, residue tracking
│   ├── surfaces.js         # Surface contamination state management
│   ├── effects.js          # Delayed effects, symptoms, death triggers
│   ├── notebook.js         # Persistent cross-life notebook (system log)
│   ├── cer.js              # CER Board: 14 claims, 3 scaffolded entries, holistic Claude evaluator
│   ├── characters.js       # Character lifecycle, death, respawn
│   ├── tombstone.js        # AI dialogue (Claude Sonnet, 6-TYPE framework + offline fallback)
│   ├── equipment.js        # Requestable equipment system
│   ├── leaderboard.js      # 14-claim × 6-tier knowledge display (driven by validatedClaims)
│   ├── sky.js              # Sun/moon/star cycle (real star catalog, 39.9°N)
│   ├── lang.js             # EN/ZH internationalization strings
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

### CER Entry (overview)

CER entries are dynamically enqueued by gate-watcher hooks scattered across `senses.js`, `effects.js`, `sky.js`, `player.js`. The contract is documented in detail under "CER Entry (system-enqueued, possibly player-edited)" further below — see that section for the full schema and design rules.

### Notebook (Persistent)
```javascript
{
  entries: [...],               // system-generated interaction log, all characters
  deaths: [
    { characterName: "Alice", timestamp: 120.5, location: "Room 1",
      causeId: "kcn_ingestion", lastActions: ["touched White Powder", "tasted White Powder"] }
  ],
  cerEntries: [],               // player-authored CER Board entries (3 scaffolded entries are revealed by event; their evidence text is assembled from real Death/Notebook records — never hardcoded names)
  validatedClaims: [],          // ids of validated knowledge claims (1..14)
  tombstoneDialogue: [],        // full dialogue history
  totalCharacters: 2,
  currentCharacter: "Tylor",
  // Evidence tracking for 14-claim gates
  observedBerryStages: {},      // berryUuid → { stages: [0,1,...] }
  skyObservations: [],          // [{timestamp, pitch, isNight}]
  dayNightCycles: 0,            // full cycles experienced
  lastCycleMark: 0,             // internal cycle counter
  pbcCrossed: false,            // player has crossed a world boundary
  thermometerLocations: [],     // ["above", "below"]
  berryCleanEatenSurvived: false,
  crossContaminationDeathSeen: false
}
```

### CER Entry (system-enqueued, possibly player-edited)
```javascript
{
  id: "cer_<timestamp>_<claimId>",
  claimId: 3,
  claim: "Red berry is non-toxic when uncontaminated",  // populated only on demo entry; "" otherwise
  evidence: "Alice ate the red berry in Room 1 with clean hands and survived (notebook entry t=0:30).",  // ALWAYS extracted from real notebook records — never hardcoded
  reasoning: "An explorer ate the red berry and survived...",  // populated only on demo entry; "" otherwise
  validated: false,
  tier: 1,
  isDemoEntry: true,            // true only for the very first entry ever enqueued in this save
  enqueuedAt: 31.2,             // gameTime when this entry was created
  gateMetAt: 30.5,              // gameTime when the underlying evidence gate was satisfied (used for tie-break)
  _feedback: null
}
```

**Critical CER design contract** (GDD §8.1 Foundational Principles):
1. **Evidence is always real** — extracted at enqueue time from `G.notebook.deaths` / `G.notebook.entries` / `observedBerryStages` / `skyObservations` / `thermometerLocations` etc. No hardcoded character names anywhere.
2. **One demo per save** — the very first entry enqueued is fully populated (claim + evidence + reasoning); all subsequent entries get evidence only.
3. **Demo reasoning is intentionally incomplete** — see GDD §8.3 for the 14 demo templates; each omits a key qualifier to invite later revision.
4. **Tie-break for demo position**: by `gateMetAt` ascending; same-timestamp ties by `claimId` ascending.
5. **Player-authored claim text** is matched to one of the 14 canonical claims by the holistic Claude grader (semantic, not keyword). Lexical `matchClaimId()` may be used as a first-pass shortlist but the LLM has the final word.

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
- **No answers**: Never reveals facts about Universe 647's mechanics (including TYPE 1 fact questions — Tombstone redirects, does NOT answer)
- **No classification labels**: Never announces "This is a TYPE 3 question"
- **Death context**: References specific Death Record observations
- **Conversation limit**: 5–7 exchanges per visit
- **Language**: Matches player's language
- **CER handoff**: When the player articulates a world-mechanics claim in dialogue, the Tombstone only tells them to record it on the CER Board. Articulation validation happens there, not here.

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
- **Local dev**: Direct browser call with `config.local.js` (gitignored), `IS_LOCAL` detection
- **Fallback chain**: Ollama (phi3:mini) → rule-based offline responses
- **Context injected**: Last 20 notebook entries + all death records + current character
- **CER articulation evaluator**: Separate Claude Sonnet call (cer.js `evaluateArticulationHolistic`) per submitted CER entry; returns JSON `{pass, note}` against per-claim rubric. Evidence gate is checked locally first; articulation is judged holistically.

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
- **House**: Interior with table + book + wall thermometer (reads 26°C above). Ceiling lamp. Connects to maze entrance.
- **Tombstone**: Circular ring structure at PBC boundary seam. Reverse-perspective scaling. Dialogue activates at <5m.
- **Death gravestones**: Clustered around AI tombstone (radius 19), glow in a color that encodes the CAUSATIVE AGENT (substance), not the delivery mechanism. Deaths from the same substance (e.g., both direct KCN ingestion and KCN cross-contamination) share one color; different agents (radiation, gas, etc.) get different colors. Mechanism is inferred by the player from the Death Record's `lastActions`, not from color.
- **Maze entrance**: Depression with 4 glowing pillars
- **River**: Stream whose color drifts from clear blue toward sickly yellow-green as cumulative surface contamination across the world rises (environmental health indicator)

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
