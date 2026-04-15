# CLAUDE.md — 神农堂 (Shennong Hall) v2

## Project Overview

Browser-based 3D science inquiry game. Players explore a world using five senses, die from unknown causes, and investigate their own deaths across multiple lives. Nested inside 647号宇宙, a PBC (periodic boundary condition) space.

No tutorials. No hints. No scores. Learning emerges from interaction.

## Tech Stack
- Three.js for 3D rendering
- Web Audio API for procedural audio
- Claude Sonnet (Anthropic API) for Tombstone AI dialogue, local Ollama as fallback
- Vanilla HTML/CSS/JS, no frameworks
- Single index.html entry point

## File Structure
```
/
├── index.html          # Entry point
├── css/
│   └── style.css       # UI overlay styles
├── js/
│   ├── main.js         # Game init, render loop
│   ├── world.js        # 647 outer world (terrain, sky, house, tombstone)
│   ├── maze.js         # Inner maze generation with PBC
│   ├── rooms.js        # Room definitions and hazard placement
│   ├── player.js       # Player controller, movement, first-person camera
│   ├── senses.js       # Five-sense interaction system
│   ├── substances.js   # Substance definitions, properties, residue tracking
│   ├── surfaces.js     # Surface contamination state management
│   ├── effects.js      # Delayed effects, symptoms, death triggers
│   ├── notebook.js     # Persistent cross-life notebook
│   ├── characters.js   # Character lifecycle, death, respawn
│   ├── tombstone.js    # AI dialogue interface (Claude API + Ollama fallback)
│   ├── equipment.js    # Requestable equipment system
│   ├── leaderboard.js  # Discovery tracking and leaderboard
│   ├── sky.js          # Sun/moon/star cycle
│   └── audio.js        # Procedural audio
├── assets/             # Minimal geometric assets
└── CLAUDE.md           # This file
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
  activeEffects: [],         // pending delayed effects
  interactions: [],          // log of all actions
  equipment: []              // gloves, mask, candle, geiger counter, etc.
}
```

### Notebook Entry
```javascript
{
  characterName: "Alice",
  timestamp: 45.2,
  action: "touch",
  target: "White Powder",
  location: "Room 1 - Table",
  result: "Hands now contaminated with residue",
  note: null  // auto-generated or player-written
}
```

### Notebook (Persistent)
```javascript
{
  entries: [...],           // all entries across all characters
  deaths: [
    { characterName: "Alice", timestamp: 120.5, location: "Room 1", 
      lastActions: ["touched White Powder", "tasted Red Berry"] }
  ],
  discoveries: [],          // leaderboard-qualifying insights
  totalCharacters: 2,
  currentCharacter: "Tylor"
}
```

## Interaction System (Five Senses)

### Automatic Senses
- **Vision**: Render objects in scene. Player sees everything in view frustum.
- **Hearing**: Ambient audio per room. Some rooms have specific sounds (humming, dripping).
- **Smell**: When player enters a room or approaches a substance with smell property, show text overlay: "You smell [description]". Trigger distance configurable per substance.

### Active Senses (Player-Initiated)
Player looks at an object and gets action menu:
- **Touch**: `[Touch]` — transfers residue if applicable, triggers contact effects
- **Taste**: `[Taste]` — checks hand contamination FIRST, then substance properties
- **Examine**: `[Examine]` — detailed visual description
- **Smell (close)**: `[Smell]` — closer inspection smell, may reveal more detail

### Residue Chain Logic
```
Player touches Substance A (has residue: true)
  → Player.handContamination.push(A.residueId)
  → Log to Notebook

Player touches Surface B
  → Surface B.contamination.push(A.residueId)
  → Log to Notebook

Next Character touches Surface B
  → Next Character.handContamination.push(A.residueId)
  → NOT logged as "picked up residue" — player doesn't know

Next Character tastes anything
  → Check handContamination first
  → If lethal residue on hands → trigger death with delay
  → Death cause in Notebook: "Died after tasting [item]"
  → Actual cause hidden: cross-contamination
```

## Delayed Effects System
```javascript
{
  effectId: "kcn_ingestion",
  character: "Alice",
  trigger: "taste",
  delay: 0,              // seconds (0 = immediate for KCN taste)
  symptoms: [],           // for delayed: [{time: 30, type: "text", msg: "dizzy"}]
  lethal: true,
  deathMessage: "Alice collapsed."
}

// Radiation example:
{
  effectId: "radiation_exposure",
  character: "Tylor",
  trigger: "room_duration",
  delay: 300,             // 5 minutes after leaving room
  symptoms: [
    { time: 60, type: "text", msg: "You feel nauseous." },
    { time: 180, type: "filter", effect: "blur" },
    { time: 300, type: "death" }
  ],
  lethal: true,
  exposureThreshold: 20   // seconds in room before effect triggers
}
```

## AI Tombstone System

### Purpose
The AI Tombstone is the game's core pedagogical mechanism. Its singular purpose is:
**to help the player transform whatever they bring — a reaction, a comment, a guess, a complaint — into an investigable question.**

An investigable question is one that can be answered through systematic observation or experimentation within Universe 647. Once a player has a well-formed investigable question, the rest of the scientific inquiry process — designing an experiment, collecting data, drawing conclusions — follows naturally. The bottleneck in scientific thinking is not methodology; it is question formulation. The Tombstone targets this bottleneck.

### What the Tombstone Is Not
The Tombstone does not:
- Answer questions about Universe 647 (it does not know the answers)
- Teach science content directly
- Give hints about what to do next
- Praise or evaluate the player's intelligence

It is a Socratic interlocutor whose only move is to help the player hear the difference between what they said and what they could investigate.

### Question Classification Framework
When a player speaks to the Tombstone, their input falls into one of several categories. The Tombstone's response strategy differs by category. The player does not see these labels — classification is internal to the system prompt.

**TYPE 1 — Fact-Based Question**
"What is this white powder?"
Already has the form of a question, but expects a factual answer the Tombstone cannot provide.
→ Redirect toward process: "What observations could help you figure that out?"

**TYPE 2 — Comment or Observation**
"That berry killed Alice."
Not a question at all.
→ Acknowledge and push toward inquiry: "It did. What do you think made it lethal?"

**TYPE 3 — Question Referencing In-Game Entities**
"Does the white powder react with the berry?"
Close to an investigable question.
→ Help sharpen it: "How would you test that? What would you expect to see if it does?"

**TYPE 4 — Philosophical or Existential Question**
"Why do we keep dying?"
Valid but not investigable within the game's empirical framework.
→ Honor without redirecting aggressively: "That's worth sitting with. But while you're here — is there something specific about this world you want to understand?"

**TYPE 5 — Opinion Expressed as Question**
"Isn't it obvious the powder is poison?"
Contains an assumption disguised as inquiry.
→ Surface the assumption: "What makes you sure? Have you tested it directly?"

**TYPE 6 — Well-Formed Investigable Question**
"If I mix the white powder with water, will it still smell like almonds?"
This is the target output.
→ Affirm and step back: "That sounds like something you can find out. Go try it."

### Dialogue Constraints
- **Brevity**: 2–3 sentences maximum per response
- **Tone**: Calm, slightly enigmatic, never condescending. Speaks as someone who has seen many explorers come and go
- **No answers**: Never reveals facts about Universe 647's mechanics
- **Death context**: Has access to the Notebook and Death Records; can reference specific observations (e.g., "Alice smelled something before she tasted it. Did you notice what?")
- **Conversation limit**: 5–7 exchanges per Tombstone visit to prevent over-reliance on dialogue vs. experimentation
- **Language**: Responds in the same language the player uses

### Technical Implementation

**Primary: Claude Sonnet via Anthropic API**
```
Architecture: Frontend JS → Cloudflare Workers proxy → Anthropic API
Model: claude-sonnet-4-20250514
System prompt: Tombstone persona + TYPE classification logic + Notebook context
Max tokens: ~150 (enforces brevity)
```

**Fallback 1: Local Ollama**
```
When: Anthropic API unreachable or player opts for offline play
Model: phi3:mini or similar local model
Endpoint: http://localhost:11434/api/generate
Limitation: Weaker classification accuracy, may break TYPE constraints
```

**Fallback 2: Rule-Based Offline Responses**
```
When: Both API and Ollama unavailable
Behavior: Keyword-matched responses from a curated pool
Limitation: No contextual reasoning, no Notebook reference
```

**Context Injection**
```javascript
// Injected into system prompt on each message:
// - Last 20 Notebook entries (actions, timestamps, locations)
// - All Death Records (character, cause, last actions)
// - Current character name and total character count
// - Current equipment list
```

### Equipment Request Flow
Equipment is granted only when the player articulates what they want to test and why.
```
Player: "I need gloves"
Tombstone: "What do you want to protect against?"
Player: "I think there's something on the surfaces"
Tombstone: "What evidence led you to that conclusion?"
Player: "Tylor died after touching a door handle that Alice touched"
Tombstone: "Interesting observation. Here are gloves. What will you test first?"
→ equipment.js adds "gloves" to character.equipment
→ When wearing gloves: touch actions no longer transfer residue
```
The Tombstone signals equipment grants by appending `[EQUIP: item_name]` to its response (stripped from display).

## Room Definitions (Scenario 1: White Powder)

### Room 1 — The Chemistry Table
```javascript
{
  id: "room_1",
  name: "Chemistry Table Room",
  dimensions: [6, 3, 6],
  objects: [
    { type: "table", position: [0, 0, 0] },
    { type: "substance", id: "kcn", position: [0, 1, 0.2] },
    { type: "substance", id: "red_berry", position: [0.5, 1, -0.1] },
    { type: "surface", id: "room1_doorhandle", position: [-3, 1.2, 0] }
  ],
  ambient: {
    light: 0.6,
    sound: null,
    smell: null  // KCN smell triggers on proximity
  }
}
```

## 647号宇宙 Outer World

### Terrain
- Flat wheat field, 1000m × 1000m logical space
- PBC wrapping: position.x = ((position.x % 1000) + 1000) % 1000
- Wheat: instanced mesh, procedural placement
- Ground: subtle texture, warm earth tone

### Sky System (already implemented)
- Sun, moon, stars on circular orbit
- 3-minute full day/night cycle
- Sky color gradient transitions

### Key Objects
- **House**: position [500, 0, 500] (center of PBC space)
  - Interior: table + book 《时间之外的往事》
  - One wall has door to maze entrance
- **Tombstone**: circular, positioned at PBC boundary seam
  - Glowing text interface when player approaches
  - Dialogue box overlay
- **Maze Entrance**: depression with 4 pillars, adjacent to house

### PBC Visual Cue
- When player walks far enough in any direction, they see the house again
- No invisible walls, no loading screens — seamless wrap

## Inner Maze

### Generation
- Grid-based corridor system
- PBC on maze boundaries (player exits left, enters right)
- Multiple rooms connected by corridors
- Rooms contain different scenarios (only Scenario 1 for v2)

### Layout (v2)
```
[Entrance] → [Corridor A] → [Room 1: Chemistry Table]
                           → [Corridor B] → [Room 2: Ventilation Room]
                           → [Corridor C] → [Room 1 again (PBC)]
```
Players who walk far enough through corridors return to rooms they've been in. The layout is designed so this is not immediately obvious.

## UI Overlay

### HUD (minimal)
- Current character name (top left)
- "Notebook" button (top right) → opens full notebook view
- Action menu (bottom center, contextual) → appears when looking at interactable
- Tombstone dialogue box (center, when near tombstone)

### Death Screen
- Screen fades to black
- Text: "[Character Name] has died."
- Brief pause
- Text: "A new explorer arrives at Universe 647."
- New character name displayed
- Fade in at house entrance

### Notebook View
- Scrollable log of all entries
- Filter by character name
- Deaths highlighted in red
- Search function

## Leaderboard Conditions (v2)

```javascript
const DISCOVERIES = [
  {
    id: "kcn_direct",
    description: "Identified KCN as cause of death by tasting",
    condition: (notebook) => {
      // Player told tombstone about KCN and bitter almond
      return notebook.tombstoneDialogue.some(d => 
        d.includes("cyanide") || d.includes("KCN") || d.includes("氰化钾")
      );
    }
  },
  {
    id: "cross_contamination",
    description: "Identified cross-contamination chain",
    condition: (notebook) => {
      // Player articulated: residue → surface → next character
      return notebook.tombstoneDialogue.some(d =>
        d.includes("residue") || d.includes("contamination") || 
        d.includes("残留") || d.includes("交叉")
      );
    }
  },
  {
    id: "pbc_outer",
    description: "Discovered Universe 647 is a PBC space",
    condition: (notebook) => {
      return notebook.tombstoneDialogue.some(d =>
        d.includes("loop") || d.includes("cycle") || d.includes("boundary") ||
        d.includes("循环") || d.includes("边界")
      );
    }
  },
  {
    id: "pbc_inner",
    description: "Discovered the inner maze is also PBC",
    condition: (notebook) => {
      return notebook.tombstoneDialogue.some(d =>
        (d.includes("maze") || d.includes("迷宫")) &&
        (d.includes("loop") || d.includes("repeat") || d.includes("循环"))
      );
    }
  }
];
```

## Performance Targets
- 60fps on modern mobile browsers
- < 5MB total asset size
- Claude API latency < 2s per response (via Cloudflare Workers)
- Ollama fallback latency < 3s per response (local)
- No external dependencies beyond Three.js CDN

## Build & Run
```bash
# Option A: With Claude API (recommended)
# Set ANTHROPIC_API_KEY in Cloudflare Workers environment
# Deploy worker, then serve the game
npx serve .

# Option B: With local Ollama (offline/development)
ollama run phi3:mini    # separate terminal
npx serve .

# Option C: Fully offline (rule-based fallback only)
npx serve .
```

## Important Constraints
- NO tutorial text, help screens, or objective markers
- NO health bars, damage numbers, or RPG mechanics
- Death messages are neutral ("Alice collapsed"), not dramatic
- The Notebook records facts, not interpretations
- Equipment does exactly what it should — gloves block residue, gas masks block inhalation, Geiger counters click near radiation
- The Tombstone never lies, never misleads, never answers questions about Universe 647's mechanics
- The Tombstone's goal is question formulation, not answer delivery — it transforms player input into investigable questions (see TYPE 1–6 classification)
- All science must be accurate — real chemistry, real physics, real toxicology
