# 神农堂 Shennong Tang — Game Design Document
Version: 1.1
Date: April 2026
Author: Jing

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
- **Ring structure**: A massive ring-shaped architectural form visible on the horizon — ambiguous in function, inviting speculation.
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

**Scaffolded Onboarding: Three Pre-Populated Entries**

The game begins with three CER entries at decreasing levels of completeness. This teaches the CER format through use, not instruction.

**Entry #1 — Fully completed (demonstration)**

| | Content |
|---|---------|
| Claim | White powder is lethal |
| Evidence | Alice tasted white powder and collapsed (Death Record #1) |
| Reasoning | Tasting the powder was Alice's last action before death. The powder had a distinct bitter almond scent, consistent with known toxic substances. The causal link is: ingestion of the powder triggered a lethal reaction. |

**Entry #2 — Claim + Evidence provided, Reasoning blank**

| | Content |
|---|---------|
| Claim | Red berry is safe to eat |
| Evidence | Tylor ate the red berry with clean hands and survived (Death Record #2) |
| Reasoning | [Player fills in] |

This entry is a deliberate trap. Later, when cross-contamination (#6) is discovered, the player must return and revise this entry — the berry is safe only when uncontaminated. This revision experience teaches that scientific claims have boundary conditions.

**Entry #3 — Only Evidence provided, Claim and Reasoning blank**

| | Content |
|---|---------|
| Claim | [Player fills in] |
| Evidence | Tylor ate the red berry and survived. Bob touched white powder, then ate the red berry, and collapsed. |
| Reasoning | [Player fills in] |

This is the critical entry. The evidence is contradictory on its surface. The player must generate their own claim (cross-contamination) and their own reasoning. This is the full arc of scientific reasoning: from puzzling data to explanatory claim.

**Transition to Free Inquiry**

After the three scaffolded entries, the CER Board opens for player-authored entries. The transition is triggered when the player articulates a claim to the Tombstone that is not already on the board. The Tombstone responds: "That's not in any record I've seen. Do you want to write it down?"

### 8.2 Free-Form Notebook Pages

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

## 12. Open Design Questions

1. **Player agency beyond observation**: How can players shape Universe 647 using acquired knowledge, not just observe it?
2. **Multi-substance interaction complexity**: How many substances and interaction rules are needed for the inquiry space to feel rich without becoming intractable?
3. **Tombstone conversation memory**: Should the Tombstone remember prior conversations across multiple deaths, or reset each time? Persistent memory risks making it too helpful; full reset risks repetitiveness.
4. **Multiplayer inheritance**: If multiple players explore simultaneously, how do their Death Records and environmental modifications compose?
5. **Assessment integration**: How to capture evidence of inquiry skill development without breaking immersion?
