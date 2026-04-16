# 神农堂 Shennong Tang — Game Design Document
Version: 1.1
Date: April 2026
Author: Jing

---

## 0. Terminology

These terms have a single fixed meaning across the whole document. If a later section mentions one of these words, it refers to the entity defined here — not to a new object.

- **Tombstone** — the AI Socratic interlocutor at the PBC boundary seam. §7.
- **Ring structure / Ring** — the ring-shaped visual form of the Tombstone (reverse perspective, torus geometry on a pedestal). Any mention of a "ring" in this document refers to the Tombstone's ring unless explicitly stated otherwise. §9.
- **River / Stream** — the flowing water body whose color reflects cumulative contamination across lives. Environmental health indicator. §3.3.
- **Horizon** — the visual vanishing line seen by the player in the outer world. Not an object; no geometry is attached to it.
- **PBC** — Periodic Boundary Conditions. The world (both outer and inner maze) wraps: walking far enough in any direction returns the player to the origin. §3.1.
- **Death Record** — a system-generated, immutable log of one explorer's death (character, timestamp, last actions, cause). §6.1.
- **CER Board** — the player-authored Claim–Evidence–Reasoning panel inside the Notebook. Where articulation happens. §8.1.
- **Claim** — one of the 14 discoverable knowledge claims about Universe 647. §3.2.
- **Evidence Gate / Articulation Gate** — the two checks every Claim must pass to be validated. §3.2.
- **Explorer** — one of the sequential characters the player inhabits. Each death yields a new Explorer. §6.2.

---

## 1. Overview

**Title**: 神农堂 Shennong Tang
**Subtitle**: Universe 647
**Tagline**: Play until you die. Play until you know why.
**Genre**: Serious Game — Scientific Inquiry Through Death
**Platform**: Browser-based (Three.js / WebGL), mobile-responsive
**Visual Style**: Low-Poly
**Target Audience**: Middle school–undergraduate learners; science educators; game-based learning researchers

---

## 2. Design Philosophy

The central premise of Shennong Tang is that the goal of gameplay is to generate knowledge about the world — specifically, Universe 647. Players do not receive knowledge; they produce it through observation, experimentation, failure, and iterative questioning.

Death is not punishment. Death is data. Every death generates a record — a sequence of sensory interactions, environmental conditions, and outcomes — that becomes the raw material for the next explorer's inquiry. The game operationalizes the full arc of scientific investigation: from naive exploration, through question formation, to hypothesis testing and knowledge construction.

Three design principles govern all mechanics:

- **Productive Failure as Core Mechanic** (Kapur): Learning occurs precisely because the player fails first, then reconstructs understanding from the failure.
- **Intrinsic Integration** (Habgood & Ainsworth, 2011): The learning content (scientific inquiry) is inseparable from the core game mechanic (survival through understanding), not layered on top of it.
- **Exploratory Learning Environment**: The world provides rich, ambiguous stimuli. The system does not tell players what to investigate — it creates conditions where investigation is the only viable strategy.

---

## 3. Universe 647

### 3.1 World Rules

Universe 647 is a bounded world governed by Periodic Boundary Conditions (PBC): walk far enough in any direction and you return to where you started. This is not immediately obvious. Discovering PBC is itself an inquiry task — players must notice environmental repetition, landmark recurrence, or spatial anomalies to infer the world's topology.

The world contains substances, organisms, and environmental systems that follow internally consistent but initially unknown rules. Some substances are toxic. Some are nutritive. Some interact with each other. The rules are discoverable through systematic sensory investigation.

### 3.2 Discoverable Knowledge of Universe 647

The game world contains 14 discoverable knowledge claims, organized by the cognitive operation required. A critical design axiom governs all 14: **experiencing an event ≠ understanding the event**. Dying does not mean knowing why you died. Seeing a berry change color does not mean understanding decay. Observation must be articulated to become knowledge.

Every knowledge claim requires two gates to be satisfied simultaneously:

- **Evidence Gate**: The player must have accumulated sufficient in-game observations (logged in Death Records or interaction history).
- **Articulation Gate**: The player must express the claim — via the CER Board or Tombstone dialogue — in a way that demonstrates understanding, not just experience. The AI Tombstone (Claude Sonnet) evaluates articulation quality holistically, not through keyword matching.

#### Tier 1 — Single Sensory Event

| # | Claim | Evidence Gate | Articulation Gate |
|---|-------|--------------|-------------------|
| 1 | White powder is lethal | ≥1 KCN-related death record | Player states causal link between powder and death |
| 3 | Red berry is non-toxic (when uncontaminated) | Tasted berry with clean hands + survived | Player claims safety AND specifies the condition (clean contact) |

#### Tier 2 — Cross-Sensory Integration

| # | Claim | Evidence Gate | Articulation Gate |
|---|-------|--------------|-------------------|
| 2 | White powder is potassium cyanide (KCN) | Smelled KCN (bitter almond) + died from KCN | Player identifies the substance by connecting sensory evidence to chemistry knowledge |

#### Tier 3 — Cross-Temporal Observation

| # | Claim | Evidence Gate | Articulation Gate |
|---|-------|--------------|-------------------|
| 4 | Red berry undergoes stage-based decay | Looked at same berry ≥2 times at different decay stages | Player describes a sequence of changes, not just "it changed" |
| 8 | Sun, moon, and stars move at different speeds | Experienced ≥2 full day-night cycles + multiple sky observations | Player distinguishes the speeds of specific celestial bodies |

#### Tier 4 — Controlled Variable Reasoning

| # | Claim | Evidence Gate | Articulation Gate |
|---|-------|--------------|-------------------|
| 5 | Temperature affects berry decay rate | Looked at berries in both above-ground and underground locations | Player links temperature difference to decay speed difference |
| 6 | White powder causes cross-contamination | Death records contain pattern: touched powder → touched berry → ate berry → died | Player identifies contact transfer as the mechanism, distinguishing from berry toxicity |
| 7 | Above-ground and underground temperatures differ | Touch/temperature readings in both locations | Player states the temperature difference as a measurable fact |

#### Tier 5 — Systematic Measurement

| # | Claim | Evidence Gate | Articulation Gate |
|---|-------|--------------|-------------------|
| 9 | Celestial bodies rotate around a shared axis | Experienced ≥2 full day-night cycles | Player identifies a common rotational center or axis |
| 10 | The world has Periodic Boundary Conditions | Crossed a world boundary ≥1 time (returned to origin) | Player describes the looping topology, not just "I ended up back here" |
| 11 | The world is flat (not spherical) | Traveled significant distance on surface | Player articulates observable differences from spherical geometry (e.g., no horizon curvature, no object disappearance bottom-first) |

#### Tier 6 — Cross-Domain Knowledge Transfer

| # | Claim | Evidence Gate | Articulation Gate |
|---|-------|--------------|-------------------|
| 12 | The night sky matches real-world constellations | Night sky visible during gameplay | Player names specific constellations (Orion, Big Dipper, Cassiopeia, etc.) |
| 13 | The world is in the northern hemisphere | Observed night sky | Player identifies Polaris or northern-hemisphere-specific star patterns |
| 14 | The world is at approximately 40°N latitude | Evidence gate is external (player brings astronomical knowledge) | Player states latitude with reasoning (e.g., Polaris elevation angle ≈ latitude) |

**Design note**: Not all 14 claims are expected from every player. Tiers 1–4 are the core inquiry space; Tier 5 rewards systematic thinkers; Tier 6 rewards cross-domain knowledge and is the deepest layer of discovery.

### 3.3 Atmosphere & Environment

- **Sky system**: Dynamic day-night cycle; dusk/dawn lighting as emotional anchors.
- **Ring structure (Tombstone)**: The AI Tombstone itself is a ring-shaped architectural form standing at the PBC boundary seam. Its reverse-perspective scaling makes it loom at a distance and shrink as the player approaches — ambiguous in function, inviting speculation. See §9.
- **River**: Functions as an environmental health indicator. Water quality, flow, color, and the organisms within it change in response to contamination events and player actions.
- **Structures**: Simple grey buildings serve as experiment stations containing interactive substances.

The atmospheric elements — the sky, the ring, the river, the sense of vast emptiness — are the experiential hook. They create the emotional gravity that makes players want to understand this world, not just survive it.

### 3.4 Contamination & Residue Mechanic

Player actions leave traces in the environment. Using a substance, spilling it, or combining materials in certain ways can contaminate nearby objects or alter environmental conditions. These residues persist across lives and create compounding complexity: later explorers inherit a world shaped by earlier actions, not just earlier data.

---

## 4. Core Gameplay Loop

```
Arrive → Explore → Interact (5 senses) → Observe outcomes → Die
    ↓
Death Record generated (full interaction sequence logged)
    ↓
New Explorer arrives → Finds Tombstone → Engages AI Tombstone dialogue
    ↓
AI Tombstone helps player transform raw reactions into Investigable Questions
    ↓
Player designs investigation → Tests hypothesis → Generates knowledge
    ↓
Player writes CER entry → Knowledge claim validated
    ↓
(Repeat — each cycle deeper, more systematic, more scientific)
```

The loop has two phases:

1. **Exploration Phase**: Sensory interaction with the world. High freedom, high risk. Likely ends in death for early-stage players.
2. **Inquiry Phase**: Post-death reflection mediated by the AI Tombstone and the Notebook. The player shifts from "what happened" to "why did it happen" to "how can I test that."

---

## 5. Five Senses Interaction System

When the player's crosshair targets an interactive object, five sensory commands appear:

| Command | Action | Example Output |
|---------|--------|----------------|
| Look | Visual inspection | "A bright red berry, approximately 1cm diameter. Smooth skin." |
| Smell | Olfactory assessment | "A distinct bitter almond scent." |
| Listen | Auditory check | "No sound." / "A faint fizzing." |
| Taste | Oral sampling | "Sweet and slightly tart. Juicy and fresh." — may trigger death |
| Touch | Tactile examination | "Powdery, fine grain. Slightly warm to the touch." |

Each interaction generates a text observation. The system never tells the player what to conclude — it only provides sensory data. The player must integrate across senses and across multiple objects to build understanding.

**Design constraint**: Observations are descriptive, not evaluative. The system says "bitter almond scent," not "this might be poisonous." The inference is the player's job.

---

## 6. Death & Inheritance

### 6.1 Death Event

When a player dies, the screen fades to black and displays: "[Name] collapsed."

A Death Record is generated containing:
- The explorer's name
- Complete interaction sequence (e.g., touch White Powder → smell Red Berry → taste Red Berry)
- Environmental conditions at time of death
- Duration of exploration
- Any notebook entries made before death

### 6.2 New Explorer Arrival

The system announces: "A new explorer arrives at Universe 647. [New Name]."

The new explorer inherits:
- All previous Death Records (accessible via Tombstones)
- The persistent Notebook (cross-life knowledge base)
- The altered environment (contamination/residue from prior explorers)

The new explorer does not inherit the previous player's hypotheses or conclusions — only raw data. Meaning-making must be reconstructed each time, though with progressively richer evidence.

---

## 7. AI Tombstone System

### 7.1 Purpose

The AI Tombstone is the game's core pedagogical mechanism. Its singular purpose is: **to help the player transform whatever they bring — a reaction, a comment, a guess, a complaint — into an investigable question.**

An investigable question is one that can be answered through systematic observation or experimentation within Universe 647. The bottleneck in scientific thinking is not methodology; it is question formulation. The Tombstone targets this bottleneck.

The Tombstone does NOT trigger knowledge achievements. That is the CER Board's role. The Tombstone only facilitates question formulation.

### 7.2 What the Tombstone Is Not

The Tombstone does not:
- Answer questions about Universe 647 (it does not know the answers)
- Teach science content directly
- Give hints about what to do next
- Praise or evaluate the player's intelligence
- Serve as an achievement trigger

It is a Socratic interlocutor whose only move is to help the player hear the difference between what they said and what they could investigate.

### 7.3 Question Classification Framework

**TYPE 1 — Fact-Based Question**
"What is this white powder?" → Redirect toward process: "What observations could help you figure that out?"

**TYPE 2 — Comment or Observation**
"That berry killed Alice." → Acknowledge and push toward inquiry: "It did. What do you think made it lethal?"

**TYPE 3 — Question Referencing In-Game Entities**
"Does the white powder react with the berry?" → Help sharpen it: "How would you test that? What would you expect to see if it does?"

**TYPE 4 — Philosophical or Existential Question**
"Why do we keep dying?" → Honor without redirecting aggressively: "That's worth sitting with. But while you're here — is there something specific about this world you want to understand?"

**TYPE 5 — Opinion Expressed as Question**
"Isn't it obvious the powder is poison?" → Surface the assumption: "What makes you sure? Have you tested it directly?"

**TYPE 6 — Well-Formed Investigable Question**
"If I mix the white powder with water, will it still smell like almonds?" → Affirm and step back: "That sounds like something you can find out. Go try it."

### 7.4 Dialogue Constraints

- **Brevity**: 2–3 sentences maximum per response
- **Tone**: Calm, slightly enigmatic, never condescending
- **No answers**: Never reveals facts about Universe 647's mechanics
- **Death context**: Has access to Death Records; can reference specific observations
- **Conversation limit**: 5–7 exchanges per Tombstone visit
- **Language**: Responds in the same language the player uses
- **No classification labels**: Never announces "This is a TYPE 3 question"

### 7.5 Equipment Request Flow

Equipment is granted only when the player articulates what they want to test and why.
```
Player: "I need gloves"
Tombstone: "What do you want to protect against?"
Player: "I think there's something on the surfaces"
Tombstone: "What evidence led you to that conclusion?"
Player: "Tylor died after touching a door handle that Alice touched"
Tombstone: "Interesting observation. Here are gloves. What will you test first?"
→ equipment.js adds "gloves" to character.equipment
```
The Tombstone signals equipment grants by appending `[EQUIP: item_name]` to its response (stripped from display).

### 7.6 Technical Implementation

- **Model**: Claude Sonnet (claude-sonnet-4-6) via Anthropic API
- **Architecture**: Frontend JS → Cloudflare Workers proxy → Anthropic API (production); direct browser call with config.local.js (local dev)
- **System prompt**: Tombstone persona + TYPE classification + Death Record context
- **Max tokens**: ~150 (enforces brevity)
- **Fallback**: Local Ollama (phi3:mini) → rule-based offline responses

---

## 8. Notebook & CER Board System

The Notebook is a persistent, cross-life document that the player maintains. Unlike Death Records (which are system-generated), the Notebook is player-authored. It survives across deaths and accumulates the player's evolving understanding.

The Notebook has two modes: free-form pages for personal observations, and CER Board pages structured as Claim–Evidence–Reasoning entries.

### 8.1 CER Board

The CER (Claim–Evidence–Reasoning) Board is the game's articulation mechanism. It is where observation becomes knowledge. The board is integrated into the Notebook — not a separate UI panel — so it feels like part of the player's research journal, not a classroom worksheet.

#### Foundational Principles

**(1) Evidence must be real.** Every Evidence field on every CER entry — including the demo entry — must be **extracted from this player's actual gameplay history** (Death Records, Notebook entries, sensory observation log). The game **never** fabricates evidence using placeholder names or events the player has not personally observed. The game's job is to *format* what the player has observed into the CER structure; the player's job is to *interpret* that evidence into a claim and reason about it.

**(2) One demo, then on your own.** The game shows ONE fully-populated CER entry across the entire save — the very first entry ever loaded. All subsequent entries are *evidence-only* — the player writes their own Claim and Reasoning. The single demo teaches the form of CER; productive failure does the rest.

**(3) Demo Reasoning is intentionally incomplete.** The reasoning shown in the demo entry is deliberately not bulletproof. Later observations may force the player to revise it (e.g., the demo for "Red berry is safe" omits the *clean hands* precondition; once cross-contamination is discovered, the player must return and amend). This trap is preserved regardless of which claim becomes the demo.

#### Entry Lifecycle

1. **Silent enqueue.** Whenever any of the 14 evidence gates is satisfied (whether through a death event or a non-fatal observation), a new entry is silently added to the CER Board. The board does NOT auto-open at this moment. The player may open the Notebook manually at any time to see and engage with pending entries.
2. **Death triggers auto-open.** Every player death — between the death screen and the new character's spawn — auto-opens the CER Board (see §12.3 Beat 6). The player engages or closes; only after closing does the new character spawn.
3. **First-ever entry is the demo.** Across the lifetime of a save, the very first entry ever enqueued receives full populate (Claim + Evidence + Reasoning). All subsequent entries receive only Evidence; Claim and Reasoning are blank.
4. **Tie-break for "first-ever".** If multiple gates are satisfied at the same death event (e.g., the player gathered evidence for claim 3 silently before dying from KCN), they are ordered by **the timestamp at which each gate became satisfied** — the gate satisfied earliest wins demo status. Simultaneous satisfactions tiebreak by ascending claim ID.

#### Per-Entry Field Composition

Every claim has four associated assets:

| Asset | Visibility | Use |
|-------|------------|-----|
| **Claim title** (one-line) | Visible only on the demo entry | Pre-fills the Claim field |
| **Evidence extraction recipe** | Always invisible | Reads `G.notebook.deaths` / `G.notebook.entries` and produces a real-data sentence |
| **Reasoning demo template** | Visible only on the demo entry | Pre-fills the Reasoning field. Intentionally incomplete |
| **Reasoning grading rubric** | Always invisible | Used by the holistic Claude grader (§8.2) to evaluate any submitted entry's reasoning |

The 14 reasoning demo templates and grading rubrics are listed in §8.3.

#### Player-Authored Claim Matching

When a player writes their own Claim text (entries beyond the demo), the system must determine which of the 14 canonical claims they are addressing. This is a **semantic matching** task — different phrasings expressing the same scientific claim are accepted. The Claude grader performs this matching holistically, not via keyword pattern matching. (For implementation efficiency, a lexical first-pass may shortlist candidates, but the final decision is the LLM's.)

#### Insufficient-Data Fallback

If the system cannot fill an entry's Evidence with real data (e.g., a cross-contamination death has occurred but no clean-handed berry survival exists yet to compose the contrast), the entry is enqueued with only the available evidence. The missing portion shows a transparent placeholder — for example: *"[no clean-berry survival record yet — keep playing to gather this evidence]"* — rather than fabricated text. The player may submit once they have completed the missing portion through gameplay.

#### Transition to Free Inquiry

After the demo and any number of evidence-only entries, the player may also create their own CER entries from scratch via a *+ New Claim* button. The Tombstone may invite this when a player articulates a claim in dialogue that is not already on the board: *"That's not in any record I've seen. Do you want to write it down?"*

### 8.3 Reasoning Demo Templates (per claim)

Each of the 14 claims has a *demo reasoning template* and a *grading rubric*. The demo template is shown verbatim only in the first-ever entry of a save (the demo entry); it is intentionally incomplete to invite later revision. The rubric is invisible to the player and used by the holistic grader.

| # | Claim | Demo Reasoning (intentionally incomplete) | What it omits / invites revising |
|---|-------|------------------------------------------|----------------------------------|
| 1 | White powder is lethal | Tasting the powder was the explorer's last action before death. The powder has a distinct bitter-almond scent, consistent with known toxic substances. Ingestion triggered a lethal reaction. | Doesn't quantify dose; doesn't differentiate ingestion-vs-skin-contact |
| 2 | White powder is potassium cyanide (KCN) | The powder has a strong bitter-almond odor — the signature olfactory marker of cyanide. Combined with its lethality, this identifies it as potassium cyanide (KCN). | Doesn't address other almond-smelling chemicals (benzaldehyde, mandelonitrile); doesn't quantify dose |
| 3 | Red berry is non-toxic when uncontaminated | An explorer ate the red berry and survived. Therefore the red berry is safe to eat. | **Omits the "clean hands" precondition** — invites revision once cross-contamination is discovered |
| 4 | Berry undergoes stage-based decay | I observed the same berry at multiple points in time. Its color, scale, and smell changed in a sequence of distinct phases — fresh → overripe → fermenting → rotting → decayed. The berry does not rot instantly; decay is staged. | Doesn't quantify time per stage; doesn't link decay rate to environment |
| 5 | Temperature affects berry decay rate | Berries above ground decayed visibly faster than berries underground. The above-ground area is warmer. This suggests temperature affects decay rate. | Doesn't reference Q10 or quantify the rate ratio; doesn't isolate temperature from other variables (light, moisture) |
| 6 | White powder causes cross-contamination | An explorer who never directly touched the powder ate the red berry and died. Earlier, a different explorer had touched the powder and then touched the same surface. Contact transferred residue from surface to skin to mouth. | Doesn't specify residue persistence time; doesn't differentiate contact transfer from airborne / waterborne mechanisms |
| 7 | Above-ground and underground temperatures differ | Thermometer readings: above ground 26°C, underground 10°C. The two regions differ by 16°C. | Doesn't speculate on cause (insulation, sun exposure); doesn't generalize to other depths |
| 8 | Sun, moon, and stars move at different speeds | Across two day-night cycles, the moon's position in the night sky shifted noticeably between cycles, while the sun's daily path stayed nearly identical. The stars rotated slowly relative to both. The three move at different speeds. | Doesn't quantify period ratios; doesn't recognize this as consistent with Earth-like rotation |
| 9 | Celestial bodies share a rotation axis | Across two day-night cycles, the sun, moon, and stars all appeared to rotate around a common direction in the sky. They share a rotational axis. | Doesn't identify the axis (Polaris); doesn't quantify tilt |
| 10 | The world has periodic boundary conditions | Walking far in one direction returned me to my starting area. The world's boundary is looped — walk far enough and you return. | Doesn't differentiate from a sphere (which also has this property) |
| 11 | The world is flat | I traveled a long distance without seeing horizon curvature; distant objects do not disappear bottom-first. The world is flat, not spherical. | Doesn't quantify how far without curvature; doesn't account for fog / visual range limits |
| 12 | Night sky matches real-world constellations | Several familiar constellations are visible in the night sky — their shapes match what is observed from Earth. The 647 universe uses real constellations. | Should name specific constellations; doesn't account for chance resemblance |
| 13 | World is in the northern hemisphere | Polaris is visible in the night sky and stays at a fixed position while other stars rotate around it. This is a northern-hemisphere pattern. | Doesn't quantify Polaris altitude |
| 14 | World is at approximately 40°N latitude | Polaris altitude approximately equals observer latitude. Polaris appears about 40° above the horizon. The world is at roughly 40°N latitude. | Doesn't account for measurement error; depends on player's astronomical knowledge |

**Rubric philosophy — minimal sufficient criterion.** The grading rubric for each claim (see `js/cer.js CLAIM_DEFS[i].rubric`) is the *minimum* a sound CER chain must meet — a valid logical inference from the evidence to the claim, matched to what is knowable within the scope of that claim's own evidence gate. The rubric **does not** demand the player anticipate refinements that require knowledge from other claims.

Example: claim 3 ("Red berry is non-toxic when uncontaminated") passes on a simple inference from clean-handed survival — "an explorer ate the berry and survived; therefore it is non-toxic." The clean-handed qualifier is the *territory of claim 6* (cross-contamination); the player naturally revisits claim 3 and refines their reasoning only after they have discovered claim 6. That revision is a voluntary cognitive move, not a grader-enforced requirement. The "deliberate trap" is in the player's own return to an earlier entry, not in the grader rejecting their initial submission.

Demo reasoning templates can be — and are — strictly *less* complete than the rubric requires. They are starting points, not finish lines.

### 8.4 Free-Form Notebook Pages

Beyond CER entries, the Notebook supports free-form pages for:
- Personal observations and sketches
- Tracking which substances have been tested and with what results
- Storing investigable questions generated through Tombstone dialogue
- Comparing data across multiple Death Records
- Recording measurements (sky observations, temperature readings, distances walked)

---

## 9. Reverse-Perspective Tombstone

The Tombstone's visual design uses reverse perspective — the object appears to rotate to face the viewer as they move around it. This creates an uncanny sense that the Tombstone is watching you.

The Tombstone sits on a circular pedestal (ring base). When the player approaches, the dialogue interface activates at the bottom of the screen.

---

## 10. Theoretical Framework

- **Exploratory Learning Environments**: The world provides stimuli; the learner provides structure.
- **Productive Failure** (Kapur, 2008; 2016): Failure precedes instruction. The game inverts the traditional explain-then-practice sequence.
- **Intrinsic Integration** (Habgood & Ainsworth, 2011, JLS): Game mechanics and learning objectives are structurally identical — understanding the world IS surviving the world.
- **Question Classification as LLM Scaffolding**: The AI Tombstone operationalizes Lederman's NOS (Nature of Science) framework by helping learners distinguish between different epistemic types of questions.
- **Learning as Self-Organizing Knowledge Network with Phase Transitions**: Over repeated death-inquiry cycles, the player's knowledge undergoes qualitative restructuring — from disconnected observations to networked understanding. The Notebook captures this transition.

---

## 11. Publication & Presentation Path

1. Informal playtesting (current stage)
2. Expert walkthrough with science educators
3. GSE 2026 Beijing — case presentation
4. IJSG — design paper (primary target)
5. IJAIED — higher-tier target if formal user study data becomes available

---

## 12. Onboarding Flow

*Draft — subject to revision after first playtest round.*

### 12.1 Rationale

The foundational constraint in §2 is: no tutorials, no hints, no scores; learning emerges from interaction. This constraint has a floor. If a new player cannot form a basic "what can I do here?" hypothesis within the first sixty seconds, they will quit before any productive failure occurs. Kapur's Productive Failure framework requires engagement, and engagement requires a minimum control fluency.

This section draws a principled line between three categories of scaffolding:

- **Control scaffolding** — what buttons do what. *Permitted*, one-shot, diegetic where possible.
- **Gameplay scaffolding** — what to do, what matters, where to go. *Forbidden*. The world teaches.
- **Strategy scaffolding** — what the right answer is. *Forbidden in both onboarding and the main loop*.

Onboarding uses environmental affordance (light, visible state changes, absence of geometry) as the primary signal. Text is minimal and appears only when an environmental cue cannot carry the load.

### 12.2 Design Tenets

1. **No gameplay instruction.** The onboarding never tells the player what to investigate, what to avoid, what the answer is, or where to go next.
2. **No time pause.** The world continues evolving. Onboarding happens inside the live game, not in a frozen tutorial state.
3. **Environment teaches.** A dark start scene with the house as the only bright source — walk toward the light is a reflex, not an instruction.
4. **Affordances reveal gradually.** The maze entrance is not a tutorial obstacle; it is simply not visible until the player has demonstrated sensory exploration.
5. **One strategic prompt, only.** *"外面有什么不一样的发生了" / "Something outside has changed."* is the single piece of textual guidance in the entire onboarding. It tells the player nothing about where to look or what to do — it only invites re-orientation.
6. **Strong beat on first death.** The sequence first death → first CER submission → first validated claim is the moment the player realizes *death generates knowledge*. This is the core pedagogical beat of the whole game. It is permitted to break immersion once.

### 12.3 Beat Sequence

#### Beat 0 — Act 1 / Act 2 Title Cards (5 s total)

- **Act 1**: 神农堂 / "死去才能知道为什么" (2.5 s)
- **Act 2**: 647 宇宙 / "你对这个世界了解多少？" (2.5 s)

Not skippable. At five seconds the cost of sitting through it is negligible, and the two-act framing establishes the emotional register before the simulation begins.

#### Beat 1 — Night Scene, House as Sole Light

Game starts at night (exact `TIME_OFFSET` tuned so the house's interior and door lamps are unambiguously the brightest features). The player's spawn position and yaw/pitch are unchanged from current values — the house falls naturally within the starting field of view.

The maze entrance is **softlocked**:
- The four corner pillars are unlit.
- The black "opening" plane is hidden.
- The `Press Space / Tap to enter` hint is suppressed even if the player stands on the entrance pad.
- `transitionToMaze()` returns early while `G.onboardingComplete === false`.

There is no visible cue that a maze exists. The player's only visible destination is the house.

#### Beat 2 — Walk to the House

No prompt appears for this. If the player remains idle within two metres of spawn for ten seconds, the existing control-tutorial string (`hint.desktop` / `hint.mobile`) is shown once and fades after five seconds. This is the control-tutorial exception permitted by Tenet 1 — it teaches button meanings only, not direction or purpose.

#### Beat 3 — Sense-Menu Prompt (inside the house)

Three seconds after the player enters the house interior (within 4 m of house centre), a single prompt fades in:

- **EN**: *"Aim the crosshair at an object, then try the five sense buttons."*
- **ZH**: *"准心对准物体，试试五个感官按钮。"*

It dismisses when the player completes any sense action, and otherwise fades after twelve seconds. It does not re-appear.

#### Beat 4 — Sensory Completion

The player must perform each of the five senses — **Look, Listen, Touch, Taste, Smell** — at least once during the session. The counted target may differ per sense: Look the book, Taste the berry, Smell the berry, etc. The house contents (book, red berry, thermometer) contain no lethal interactions, so every path through this beat is safe.

- Sense count is tracked once per sense-type, not per object. Repeated Looks do not advance progress.
- The count persists through any number of house re-entries in the same session. It resets only on *New Game*.

Each new sense completed raises the maze-entrance pillar intensity by 0.2 (0 → 0.2 → 0.4 → 0.6 → 0.8 → 1.0). This gives continuous environmental feedback — *the world is responding to what you do* — without any text.

#### Beat 5 — Release

When all five senses have been completed, in sequence:

1. The four pillars reach full brightness (1.0).
2. The black opening plane fades in over two seconds.
3. The maze-entrance hint is re-enabled, appearing when the player approaches the entrance.
4. Three seconds after Beat 5 activates, a single final prompt appears (fades after eight seconds):
   - **EN**: *"Something outside has changed."*
   - **ZH**: *"外面有什么不一样的发生了。"*
5. `G.onboardingComplete` is set to true and written to localStorage.

Onboarding is over. No further onboarding prompts appear in this session or any future session.

#### Beat 6 — Death-as-Reflection (every death)

*Technically this beat is part of the live game, not onboarding. It is described here because the first occurrence is the pedagogical culmination of the onboarding arc — and it repeats throughout the game.*

**Every** death triggers the same sequence. Between the death screen and the new character's spawn, the CER Board auto-opens with all entries currently loaded — including any newly enqueued by the just-completed death.

Sequence:

1. **Death screen** — `fade-to-black → "[Name] collapsed."` (existing behaviour, ~3 seconds).
2. **CER Board overlay opens** — the Notebook overlay slides in on the CER Board tab. Any entries newly enqueued by this death (or by silent gate satisfactions since last visit) are highlighted.
3. **Player engages or dismisses** — there is no time limit. The player may edit, submit, or close. The game does not advance until the player closes the overlay.
4. **New explorer spawns** — `"A new explorer arrives. <Name>"` appears, then the world fades back in.

The very first time this beat fires in a save, the first-enqueued entry is auto-populated as a demo (Claim + Evidence + Reasoning per §8.1). All other appearances of this beat show evidence-only entries for any new gates.

If the player submits an entry and the holistic grader returns `pass`:

- The Leaderboard auto-opens *one time only*, strictly gated on the transition `validatedClaims.length === 1`.
- A brief reveal animation marks the newly-validated claim.
- Auto-closes after six seconds, returning the player to the game.

This is the only time in the entire game that the Leaderboard opens automatically.

### 12.4 Gate-Driven Entry Enqueue

Every claim has an evidence gate (§3.2). The moment a gate becomes satisfied — through any combination of in-game observations — the corresponding entry is silently enqueued onto the CER Board. This applies uniformly to all 14 claims; there is no special case for any individual claim.

**Two phases**:

1. **Silent enqueue** (any time): The instant a gate satisfies, the system constructs an entry with Evidence extracted from real records (§8.1) and adds it to `G.notebook.cerEntries`. No UI surfaces. The player may open the Notebook at any time to discover the entry and engage with it.
2. **Death-triggered surfacing** (Beat 6, §12.3): On every death, the CER Board opens with all entries visible. New entries are visually highlighted.

**First-ever entry rule**: the very first entry enqueued across the entire save is the *demo*. It receives full Claim + Evidence + Reasoning populate (Reasoning from the per-claim demo template, intentionally incomplete). All subsequent entries receive Evidence only.

**Tie-break**: if multiple gates satisfy at the same instant, the demo position goes to the gate whose underlying observation occurred earliest in playtime. Within identical timestamps, ascending claim ID.

**No hardcoded placeholder names** — never. All Evidence text is composed from `G.notebook.deaths` / `G.notebook.entries` / `G.notebook.observedBerryStages` / etc. as appropriate per claim.

**Hidden-tier auto-enqueue suppressed.** Only claims in `LEADERBOARD_VISIBLE_TIERS` (tiers 1 and 2) are auto-enqueued onto the CER Board when their gates satisfy. Tier 3 (PBC, sky, latitude, etc.) gates still operate internally — but the player must discover and articulate those claims themselves via the *+ New Claim* button. Their presence is never hinted at on either the CER Board or the leaderboard until the player validates one.

Before any trigger has fired, the CER tab shows only:

- **EN**: *"No claims yet. Play, die, come back."*
- **ZH**: *"还没有主张。去玩，去死，再回来。"*

A revealed entry persists for the lifetime of that save.

### 12.5 State Machine

```
G.onboarding = {
  stage: 'act1' | 'act2' | 'walk' | 'house' | 'senses' | 'released' | 'done',
  sensesCompleted: { look: false, listen: false, touch: false, taste: false, smell: false },
  walkHintShown: false,
  houseHintShown: false,
  completeTimestamp: null
}
```

`G.onboardingComplete` is derived from `stage === 'done'` and mirrored to localStorage key `647_onboarding_complete`. *New Game* clears this flag so the flow replays from the top.

### 12.6 Edge Cases

1. **Player leaves the house before completing five senses.** Maze remains softlocked. Player roams the outer world; `antistuck.js` Layer A nudges apply normally. Returning to the house resumes sense tracking.
2. **Player completes five senses but does not approach the maze.** Pillars stay lit. World continues ambiently. No further prompts.
3. **Player repeats one sense many times.** Only one instance per sense-type counts. Pillar brightness does not advance.
4. **Player opens the Notebook before any death.** Empty CER tab, single gray caption shown. No scaffolded entries visible.
5. **Player closes the auto-opened CER entry without submitting.** The entry remains under the CER tab; the player may submit later. Subsequent deaths of the same `causeId` do not re-trigger the auto-open — Beat 6 is one-shot.
6. **Player submits and the holistic grader fails them.** Entry receives feedback. The Leaderboard does **not** auto-open. Player may edit and resubmit. Leaderboard auto-open is strictly gated on the first transition `validatedClaims.length === 1`.
7. **Second session.** Save restores with `onboardingComplete === true`. No prompts, maze visible from start, game resumes in its normal running state.

### 12.7 Lines Not to Cross

The onboarding **may**:

- Reveal what WASD and the crosshair do.
- Reveal that the sense buttons exist and can be clicked.
- Reveal, through environmental change, that the maze entrance exists.

The onboarding **must not**:

- Tell the player that the powder is dangerous.
- Tell the player that death generates knowledge.
- Tell the player to visit the maze.
- Explain what the CER Board is for.
- Reveal any of the fourteen Claims or their rubrics.
- Suggest a hypothesis.

The distinguishing principle is: *where to put your hands* is permissible; *what to think* is not.

### 12.8 Tuning Parameters

To calibrate in the first playtest round:

- `TIME_OFFSET` at spawn — verify the house is unambiguously the brightest feature. Shift toward midnight if dusk is too bright.
- Beat 3 (sense-menu prompt) delay — currently 3 s. Verify it arrives *after* the player has oriented themselves inside, not during entry.
- Beat 2 idle-nudge threshold — currently 10 s. Verify it does not appear for players who are looking around without moving.
- Pillar progressive-brightness steps — currently 0.2 each. Verify each step is legible from inside the house through a window, not only up close.
- Beat 6 auto-open delay — currently 2 s after respawn. Verify the player has settled into the new character's view.
- Leaderboard auto-close — currently 6 s. Verify long enough to read, short enough not to feel like a modal trap.

### 12.9 Telemetry Hooks

For IJSG evidence, the following ten timestamps are logged per session, forming the onboarding funnel:

1. `onboarding_start` — first frame of Act 1.
2. `first_movement` — first WASD or touch input.
3. `house_entered` — first frame within house bounds.
4. `sense_first_N` — first use of each of the five senses (5 events).
5. `onboarding_complete` — fifth sense completed.
6. `first_death` — `triggerDeath` fires for character 1.
7. `cer_auto_opened` — Beat 6 auto-reveal occurs.
8. `cer_first_submit` — first Submit click.
9. `first_validation` — first claim marked validated.
10. `leaderboard_auto_opened` — Leaderboard auto-open fires.

Drop-off between any two consecutive events is the single most useful datum for the methodology section of an IJSG paper.

### 12.10 Relationship to Existing Systems

- `antistuck.js` Layer A (idle nudges) remains active throughout onboarding. No changes needed; the existing strings are compatible and non-redundant with the onboarding prompts.
- `antistuck.js` Layer B (maze gate for repetitive deaths) is inactive during onboarding — the maze is softlocked, so repetitive death in the maze cannot occur. Activates normally post-onboarding.
- The Tombstone is fully functional throughout onboarding. A player who wanders to it before completing five senses may engage dialogue as usual; the Tombstone has no onboarding-specific behaviour.
- Save/load: `G.onboarding` is serialised as part of the save payload. The localStorage key `647_onboarding_complete` is separate, so a corrupted save does not force the player back through onboarding.

---

## 13. Open Design Questions

1. **Player agency beyond observation**: How can players shape Universe 647 using acquired knowledge, not just observe it?
2. **Multi-substance interaction complexity**: How many substances and interaction rules are needed for the inquiry space to feel rich without becoming intractable?
3. **Tombstone conversation memory**: Should the Tombstone remember prior conversations across multiple deaths, or reset each time? Persistent memory risks making it too helpful; full reset risks repetitiveness.
4. **Multiplayer inheritance**: If multiple players explore simultaneously, how do their Death Records and environmental modifications compose?
5. **Assessment integration**: How to capture evidence of inquiry skill development without breaking immersion?
