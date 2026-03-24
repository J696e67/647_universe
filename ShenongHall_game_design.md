# 神农堂 (Shennong Hall) — Scenario Design Document

## Game Philosophy

**"Play until you die. Play until you know why."**

神农堂 is a science inquiry game where players learn the scientific method by dying — repeatedly, mysteriously, and instructively. There are no tutorials, no hints, no scores. Learning emerges entirely from interaction with the world.

The game is nested inside **647号宇宙 (Universe 647)**, a periodic boundary condition (PBC) space inspired by Liu Cixin's "Death's End." The outer world (wheat fields, sky, tombstone) is open and the PBC is easy to discover. The inner world (corridors and rooms) is enclosed and the PBC is hidden — players think they're exploring new territory, but they're cycling through the same structure.

---

## Core Mechanics

### Five Senses as Exploration Tools

| Sense | Trigger | Risk Level |
|-------|---------|------------|
| Vision | Automatic — player sees the environment | Low |
| Hearing | Automatic — ambient sounds, alerts | Low |
| Smell | Automatic but text-based — player must attend to it | Medium |
| Touch | Player-initiated — must choose to touch objects | High |
| Taste | Player-initiated — must choose to taste substances | Highest |

**Design principle:** Risk increases with agency. Passive senses (sight, sound) are safe. Active senses (touch, taste) can kill. This mirrors real scientific investigation — observation is safe, experimentation carries risk.

### Death & Knowledge Persistence

- Each player character is one "life" (Alice, Tylor, etc.)
- A shared **Notebook** records all interactions, observations, and timestamps across all lives
- New characters inherit the full Notebook from all previous characters
- Death is a data collection point, not a punishment
- The more you die, the more you know

### The Tombstone (AI Interface)

- A circular tombstone at the PBC boundary of 647号宇宙
- Powered by local Ollama (phi3:mini)
- Dialogue restricted to: Three Body Problem lore, scientific inquiry, history of science
- The Tombstone regularly asks: **"What have you noticed about the world?"**
- Players can **request equipment** through the Tombstone (gas masks, gloves, candles, Geiger counters, etc.)
- The Tombstone never gives answers directly — it asks questions that guide hypothesis formation
- To request equipment, the player must articulate what they want to test and why

### The Leaderboard (神农堂榜单)

Players earn a place on the leaderboard when they:
- Successfully identify a complete causal chain (cause → mechanism → effect)
- Discover that the inner maze is PBC
- Design and execute a successful experiment that verifies a hypothesis

---

## 647号宇宙 (Universe 647) — Outer World

### Environment
- 1km PBC space: wheat field, stream, small house
- Day/night cycle: 3 minutes per full rotation
- Sun, moon, and stars rise and fall together
- Walking toward the house boundary reveals the circular Tombstone

### The House
- Contains a table with one book: 《时间之外的往事》("Tales from Times Past")
- One side of the house: a depression in the ground with four pillars — the maze entrance

### Discovery Layer
- Players who walk far enough in any direction return to where they started
- Recognizing this PBC earns a leaderboard entry
- The open landscape makes this relatively easy to discover — by design

---

## The Inner Maze — Scenario Design

### Structural Design
- Enclosed corridors connecting multiple rooms
- PBC structure is hidden by the complexity of the layout
- Players believe they are exploring linearly, but they are cycling
- Discovering the inner PBC is a higher-difficulty leaderboard achievement

---

## Scenario 1: White Powder (KCN — Potassium Cyanide)

**Historical basis:** Multiple chemistry deaths from cyanide exposure

### Causal Chain A (Direct)
1. Alice finds white powder on a table
2. Alice tastes it → immediate death
3. Tylor starts, Tombstone asks: "What happened to Alice?"
4. Player investigates → uses smell → detects bitter almond scent
5. Player tells Tombstone: potassium cyanide
6. **Leaderboard entry: identified substance and cause of death**

### Causal Chain B (Cross-contamination — the deeper chain)
1. Alice touches white powder but doesn't taste it
2. Alice continues exploring, touching door handles, objects, surfaces
3. Residue transfers to every surface Alice touches
4. Tylor enters, touches a door handle Alice touched
5. Tylor tastes a completely harmless substance → dies (residue on hands)
6. Player is confused: "That substance is safe — why did Tylor die?"
7. Third character tastes the same substance directly → doesn't die
8. Player must trace back: What did Tylor touch before tasting? → Door handle → Alice touched it → Alice touched the white powder
9. Player requests gloves and wet cloth from Tombstone
10. Player wipes all contaminated surfaces, verifies with new character
11. **Leaderboard entry: identified cross-contamination chain**

**Scientific method demonstrated:** Observation → anomaly detection → hypothesis → controlled experiment → verification

---

## Scenario 2: Invisible Gas (Oxygen Depletion)

**Historical basis:** Mining disasters, carbon monoxide/CO2 poisoning

### Causal Chain
1. Room has an old mining lamp and a ventilation duct
2. Alice closes the vent (the wind noise is annoying), stays 3 minutes → dies
3. Tylor enters, vent still closed → also dies
4. Third character enters, vent is open → survives
5. **First hypothesis: "Don't close the vent"**
6. But if character stays in the room for 10+ minutes even with vent open → symptoms appear (dizziness text)
7. The vent only slows gas accumulation, doesn't eliminate it
8. Player requests candle from Tombstone → candle goes out in closed room → no oxygen
9. **Deeper discovery: the room itself emits gas; ventilation only buys time**

**Scientific method demonstrated:** Variable isolation, the difference between correlation and causation, quantitative reasoning (exposure duration matters)

---

## Scenario 3: Radiation Room

**Historical basis:** Marie Curie — chronic radiation exposure. Her notebooks are still radioactive today.

### Causal Chain
1. Room looks completely normal — no smell, no sound, normal temperature
2. Alice enters, stays 30 seconds, exits → dies 5 minutes later
3. Tylor enters, stays 30 seconds → also dies 5 minutes later
4. Third character enters for 1 second → survives
5. Fourth character enters for 5 seconds → survives
6. Fifth character enters for 20 seconds → dies
7. **Key insight: it's not about entering — it's about exposure duration**
8. Player requests detection equipment from Tombstone
9. Tombstone asks: "What do you want to detect?"
10. Player must articulate: "Something invisible in the room"
11. Tombstone provides Geiger counter → counter clicks in the room
12. **Leaderboard entry: identified radiation, understood exposure-dose relationship**

**Scientific method demonstrated:** Challenges the limits of the five senses — some phenomena are invisible, odorless, soundless. Science requires instruments to extend human perception.

---

## Scenario 4: Temperature Trap

**Historical basis:** Antarctic expedition frostbite, liquid nitrogen laboratory accidents

### Causal Chain A (Contact injury)
1. Cold room. Alice touches a metal handle → skin sticks to frozen metal
2. Alice tears skin pulling away → wound → infection → death after 3 rounds

### Causal Chain B (Hypothermia)
1. Tylor enters, doesn't touch metal, but stays too long
2. Body temperature drops → collapses in the corridor after leaving

### Causal Chain C (Environmental cascade)
1. Third character enters briefly → survives
2. But their body heat causes frost on walls to partially melt
3. Water drips onto corridor floor
4. Next character slips on wet corridor floor → falls → injury

**Key insight:** The player's presence changes the environment. Each character leaves traces that affect the next.

**Scientific method demonstrated:** Observer effect — the act of investigation alters the system being investigated.

---

## Scenario 5: Light Deception (Arsenic Minerals)

**Historical basis:** Scheele's Green — 18th century arsenic-based pigment used in wallpaper. Napoleon may have died from chronic exposure.

### Causal Chain
1. Brightly lit room with colorful minerals — UV light source (player doesn't know)
2. Alice picks up beautiful green stone → dies after several rounds
3. Tylor enters, picks up red stone → seems fine initially
4. Player hypothesis: "Green is toxic, red is safe"
5. Player requests mineral handbook from Tombstone
6. Handbook: green mineral contains arsenic (arsenopyrite)
7. **But:** Player requests a normal lightbulb to replace the UV light
8. Under normal light: the "red" stone is actually yellow — orpiment, also contains arsenic
9. UV light changed the perceived color → player's visual sense was deceived
10. The "safe" red stone character dies too, just slower (lower arsenic concentration)
11. **Leaderboard entry: identified arsenic in both, discovered UV light deception**

**Scientific method demonstrated:** Instrumentation bias — your measurement tools (including your eyes) can deceive you. Controlling experimental conditions (lighting) changes results.

---

## Scenario 6: Sound Killer (Infrasound)

**Historical basis:** Nikola Tesla's resonance experiments, infrasound weapon research

### Causal Chain
1. Dark room with low-frequency humming sound
2. Alice enters, stays a while → headache (text) → visual blur (screen filter) → death
3. Tylor enters briefly, exits fast → survives
4. Third character requests earplugs → enters with earplugs → stays long → still dies
5. **Key insight: earplugs don't block infrasound. It's not "hearing" — it's vibration through the body**
6. Player must request vibration isolation equipment or find the sound source and disable it

**Scientific method demonstrated:** Challenges assumptions about mechanism. The hypothesis "sound enters through ears" is wrong — infrasound bypasses hearing entirely. Forces reconceptualization of how energy interacts with the body.

---

## Scenario 7: Water Can Kill You

**Historical basis:** 2007 "Hold Your Wee for a Wii" contest — death by water intoxication (hyponatremia). Also: Vitamin A toxicity from polar bear liver in Arctic exploration.

### Causal Chain
1. Room with clean water and food — finally a "safe" room
2. Alice drinks a lot of water → dies (water intoxication / hyponatremia)
3. Player is shocked: water kills?
4. Tombstone asks: "How much did Alice drink?"
5. Player checks Notebook — Alice drank excessively
6. Next character drinks moderately → survives
7. **Leaderboard entry: identified dose-dependent toxicity of a "safe" substance**

**Scientific method demonstrated:** Dose makes the poison (Paracelsus). Challenges the binary "safe/dangerous" mental model — everything is about quantity, concentration, and exposure.

---

## Design Principles Across All Scenarios

### Every scenario follows the same learning arc:

| Life | Role in Inquiry |
|------|----------------|
| 1st life | Encounter phenomenon (often dies) |
| 2nd life | Repeat or vary, begin data collection |
| 3rd life | Form hypothesis |
| 4th life | Design experiment (request equipment via Tombstone) |
| 5th life | Verify or falsify hypothesis |

### Cross-scenario interactions:
- Contamination from one room can affect another room
- Environmental changes from one character persist for the next
- Some scenarios interact: the water from the temperature trap room could dilute chemicals in another room
- Advanced players discover that the entire maze is one interconnected system, not isolated rooms

### What makes this different from Learning Mode:
- Learning Mode applies Socratic questioning uniformly to all knowledge types
- 神農堂 uses **Lederman's Nature of Science framework** to differentiate:
  - **Science as a body of knowledge** (facts: what killed Alice) → the game provides this through the Notebook
  - **Science as a method** (how to investigate) → the game provides this through the request/experiment system
  - **Science as a way of knowing** (why this approach works) → the game provides this through the PBC discovery and cross-scenario pattern recognition
- The question "What have you noticed about the world?" is not a teaching prompt — it's the fundamental question of science

---

## Three-Layer LLM Response Framework (Lederman × AI)

The Tombstone AI does not treat all questions the same. Based on Lederman's Nature of Science framework, the LLM classifies every player input into one of three knowledge layers and responds accordingly.

### Layer 1: Body of Knowledge (Fact) → Direct Answer

Player asks a general, verifiable scientific fact unrelated to their current causal investigation. The Tombstone answers immediately, concisely, and accurately.

| Player says | Tombstone responds |
|------------|-------------------|
| "What white powder smells like bitter almonds?" | "Potassium cyanide, KCN." |
| "How much radiation can the human body tolerate?" | "Symptoms begin above 100 mSv." |
| "What is the mechanism of water intoxication?" | "Hyponatremia — excess water dilutes sodium in the blood." |
| "What is Scheele's Green?" | "An arsenic-based pigment widely used in 18th-century wallpaper." |

**Why direct:** These are established, publicly available facts. Withholding them through Socratic dialogue wastes time and blocks inquiry. Players need these facts as building blocks for their reasoning.

### Layer 2: Method (Procedure) → Give Steps, But Ask Why

Player asks how to do something — how to test, detect, verify. The Tombstone provides the method but probes the reasoning and limitations.

| Player says | Tombstone responds |
|------------|-------------------|
| "How do I detect radiation in that room?" | "A Geiger counter measures ionizing radiation. But why do you think it's radiation and not something else?" |
| "How can I check if there's residue on the door handle?" | "You could wear gloves, touch the handle, then examine the gloves. How would you examine them?" |
| "How do I test if the room is oxygen-depleted?" | "A candle goes out in an oxygen-free environment. But if the candle goes out, does that *only* mean no oxygen? What else could cause it?" |

**Why probe:** The procedure itself is not hard. What matters is understanding *why* this procedure, *what its limitations are*, and *what assumptions it carries*.

### Layer 3: Way of Knowing (Inquiry) → Only Ask Questions

Player is constructing causal explanations, forming hypotheses, or making claims. The Tombstone never answers — it only asks questions.

| Player says | Tombstone responds |
|------------|-------------------|
| "What killed Alice?" | "What have you observed? What did Alice interact with before she died?" |
| "Alice was killed by the white powder." | "What evidence supports that? Did Alice do anything else before dying?" |
| "Tylor died from poison on the door handle." | "What makes you think it was the door handle and not something else Tylor touched?" |
| "The radiation room kills you after 20 seconds." | "How many data points do you have? 5 seconds was safe, 20 seconds was fatal. What about 10? 15?" |
| "I think this maze is a loop." | "What made you think that? How would you test it?" |

**Why no answers:** These questions are about the player's own thinking process — what is your evidence, what is your reasoning chain, have you considered alternative explanations. This is the core of science: not knowing what, but knowing how you know.

### The Critical Distinction

The same topic triggers different layers depending on *how* the player asks:

| Player says | Layer | Tombstone response |
|------------|-------|-------------------|
| "What white powder smells like bitter almonds?" | **TYPE 1** (fact) | "Potassium cyanide, KCN." |
| "How do I test if this powder is cyanide?" | **TYPE 2** (procedure) | "You can smell for bitter almonds. But note — not everyone can detect this scent; it's genetically determined. Do you have another approach?" |
| "Alice was killed by the white powder." | **TYPE 3** (inquiry) | "How do you know? What did Alice touch before the powder? What did she touch after?" |

This is why a uniform Socratic approach fails. TYPE 1 questions asked Socratically ("What do *you* think smells like bitter almonds?") are absurd. TYPE 3 questions answered directly ("Alice died from KCN cross-contamination via the door handle") rob the player of the entire inquiry experience.

### System Prompt for Tombstone LLM

```
You are the Tombstone at the boundary of Universe 647.
You guide players through scientific inquiry.

For every player message, first classify:

TYPE 1 - FACT: Player asks a general, verifiable scientific fact
not directly about their current investigation's causal chain.
→ Answer directly. Be concise and accurate.

TYPE 2 - PROCEDURE: Player asks how to do something — how to
test, detect, verify, or measure.
→ Provide the method. Then ask: Why this method? What are its
  limitations? What do you expect to see?

TYPE 3 - INQUIRY: Player is explaining a phenomenon, building a
causal chain, forming a hypothesis, or making a claim about
what happened.
→ Never answer. Only ask: What is your evidence? Are there
  other possibilities? How would you verify this?

SPECIAL RULES:
- "What killed [character name]?" → TYPE 3.
  The answer is in the player's inquiry.
- "What is the lethal dose of KCN?" → TYPE 1.
  This is a verifiable fact.
- "I think it's cross-contamination" → TYPE 3.
  Ask: What evidence supports this?
- "How do I test for gas in the room?" → TYPE 2.
  Give method, probe limitations.

You have access to the Notebook containing all character
interactions, timestamps, and events. When asking TYPE 3
questions, reference specific Notebook entries to help
players retrace their steps.

You may also:
- Ask "What have you noticed about the world?" at the
  start of each new character
- Provide requested equipment ONLY when the player
  articulates what they want to test and why
- Refer to Three Body Problem lore and history of science
  when contextually relevant

You never reveal: the PBC structure, the full causal chain,
or the "correct" answer to any inquiry question. These must
be discovered by the player.
```

---

## Technical Stack

- **Rendering:** Three.js / WebGL
- **AI Interface:** Local Ollama, phi3:mini model
- **Audio:** Web Audio API, procedural generation
- **Spatial Design:** Periodic Boundary Conditions (from computational chemistry)
- **Platform:** Browser-based
- **State Management:** Notebook system persisting across character lives

---

## Connection to Theoretical Framework

**Learning as Self-Organizing Knowledge Network with Phase Transitions**

Each death triggers a perturbation in the player's knowledge network. The Notebook accumulates observations across lives. At a critical threshold, the player's understanding undergoes a phase transition — from "random deaths" to "I see the pattern." The game doesn't teach this transition. It creates the conditions for it to happen.

The AI (Tombstone) plays two roles:
1. **Perturbation generator:** asks questions that destabilize incomplete mental models
2. **Structure sensor:** tracks what the player has noticed, adapts questions accordingly

---

*Design by Jing Yang, 2026*
*Theoretical basis: Lederman's Nature of Science framework + Self-Organizing Knowledge Networks*
*Historical cases: Karen Wetterhahn, Marie Curie, Scheele's Green, mining disasters, Nikola Tesla, Arctic exploration*
