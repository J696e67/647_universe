# KICKOFF PROMPT — 神农堂 v2

Read CLAUDE_v2_shennong.md and 神农堂_Scenario_Design_Document.md before starting.

Build the game in 6 phases. Complete each phase fully and test before moving to the next.

---

## Phase 1: World Shell (647号宇宙)

Build the outer world. Player spawns at the house entrance.

1. Create index.html with Three.js imported from CDN
2. Flat terrain with wheat field (instanced mesh, simple blade geometry)
3. PBC wrapping on terrain (1000m logical space)
4. House at center: simple box geometry, door opening, table inside with book object
5. Sky system: sun, moon, stars rotating on 3-minute cycle, sky color gradient
6. First-person camera with WASD + mouse look (mobile: touch joystick + gyroscope)
7. Tombstone: circular geometry at PBC boundary seam, glowing material
8. Maze entrance: depression near house with 4 pillar markers

**Test:** Player can walk around wheat field, enter house, see sky cycle, find tombstone, find maze entrance. Walking far enough in any direction returns to house (PBC confirmed).

---

## Phase 2: Maze & Room System

Build the inner maze with PBC.

1. Corridor system: grid-based, first-person navigation
2. PBC on maze boundaries (seamless wrap, player doesn't notice)
3. Room 1: Chemistry Table Room (6x3x6)
   - Table (box geometry)
   - White powder on table (small white sphere)
   - Red berry on table (small red sphere)
   - Door handle (cylinder on wall)
4. Room 2: Ventilation Room (placeholder, empty for now)
5. Corridors connecting rooms with ambient lighting differences
6. Transition between outer world and maze (enter through maze entrance)

**Test:** Player can enter maze from outer world, navigate corridors, enter Room 1, see objects on table. Walking through maze long enough loops back (PBC). Can exit maze back to outer world.

---

## Phase 3: Five-Sense Interaction System

Build the core interaction mechanics.

1. Raycaster: player looks at object → highlight it
2. Action menu appears when looking at interactable object:
   - [Examine] — always available → shows visual description text
   - [Touch] — always available → triggers touch logic
   - [Taste] — only for ingestible items → triggers taste logic
   - [Smell] — for items with smell property → shows smell description
3. Automatic smell: entering a room or approaching a substance → text overlay
4. Automatic sound: per-room ambient audio (Web Audio API oscillator)
5. Substance data: implement KCN with full properties from CLAUDE.md
6. Touch → adds to handContamination array
7. Surface contamination: touching a surface after touching a substance → marks surface
8. Taste → checks handContamination FIRST, then substance properties

**Test:** Player can examine, touch, smell, taste the white powder. Touching it adds contamination. Touching door handle after transfers contamination to surface.

---

## Phase 4: Death, Notebook & Character Cycling

Build the consequence system.

1. Delayed effects engine:
   - Queue effects with timestamps
   - Process queue each frame
   - Symptoms: text overlay, screen filter (blur, darken)
   - Death: screen fade to black, death message
2. KCN taste → immediate death
3. KCN residue on hands + taste anything → death with short delay
4. KCN residue on surface → transfers to next character who touches it
5. Notebook: auto-log every interaction (character, timestamp, action, target, location)
6. Notebook: log deaths with last 5 actions
7. Notebook UI: overlay, scrollable, filterable by character
8. Character cycling: on death → fade to black → "A new explorer arrives" → new character name → spawn at house
9. New character inherits full Notebook
10. Character names from a preset list: Alice, Tylor, Mira, Kenji, Priya, Leo, Sofia...

**Test:** 
- Alice tastes white powder → dies immediately → Tylor spawns
- Alice touches powder → touches door handle → Tylor touches door handle → Tylor tastes red berry → Tylor dies (cross-contamination) → Mira spawns
- Notebook shows full history across all characters
- Each death logged with cause context

---

## Phase 5: Tombstone AI Dialogue

Connect the Tombstone to Ollama with three-layer framework.

1. Player approaches tombstone → dialogue box appears
2. Text input field + send button
3. Connect to local Ollama API (http://localhost:11434/api/generate)
4. System prompt from CLAUDE.md (three-layer classification)
5. Pass current Notebook as context (last 20 entries + all deaths)
6. Tombstone auto-greeting for new characters: "What have you noticed about the world?"
7. Equipment request flow:
   - Player requests item → Tombstone asks why
   - Player explains → Tombstone provides item
   - Item added to character.equipment
   - Equipment effects: gloves block residue transfer, gas mask blocks inhalation
8. Streaming response display (character by character)

**Test:**
- Ask "What white powder smells like bitter almonds?" → Direct answer (TYPE 1)
- Ask "How do I test if the door handle is contaminated?" → Method + probe (TYPE 2)  
- Say "Alice was killed by the white powder" → Questions only (TYPE 3)
- Request gloves → Tombstone asks why → Player explains → Gets gloves
- With gloves: touch powder → no contamination

---

## Phase 6: Leaderboard & Polish

1. Leaderboard system: track discoveries from CLAUDE.md conditions
2. Leaderboard UI: accessible from tombstone or Notebook
3. Discovery notification: subtle text when player achieves a discovery
4. Mobile responsive: touch controls, responsive UI layout
5. Performance optimization: instanced meshes, frustum culling
6. Loading screen with game title: 神农堂 / Shennong Hall
7. Tagline: "Play until you die. Play until you know why."

**Test:**
- Complete the full KCN direct chain → leaderboard entry
- Complete the cross-contamination chain → leaderboard entry
- Discover outer PBC → leaderboard entry
- Full playthrough on mobile browser

---

## Scenarios for Future Versions (DO NOT BUILD YET)

The Scenario Design Document contains 6 additional scenarios (Gas, Radiation, Temperature, Light, Sound, Water). These use the same systems built in Phases 3-5. When ready to add:
- Add new substance definitions to substances.js
- Add new room definitions to rooms.js
- Add new delayed effects to effects.js
- Add new equipment types to equipment.js
- Add new leaderboard conditions

The architecture from v2 should support all scenarios without structural changes.

---

## Run Checklist

Before declaring Phase complete:
- [ ] No console errors
- [ ] Works on Chrome, Firefox, Safari
- [ ] Works on mobile (iOS Safari, Android Chrome)
- [ ] Notebook persists correctly across deaths
- [ ] PBC wrapping is seamless (no pop, no flicker)
- [ ] Tombstone dialogue returns within 3 seconds
- [ ] All text is legible on both desktop and mobile
