# Decision Doc — Leaderboard Taxonomy
**Status**: Open (parked 2026-04-16)
**Owner**: Jing
**Context**: GDD §3.2 / §8.1 — how should the 神农榜 (knowledge leaderboard) organize the 14 canonical claims (and free-form player claims) for the player to read?

---

## The question

What is the right axis for grouping claims on the leaderboard?

Current implementation uses a **difficulty tier** model (Tier 1 / Tier 2 / Tier 3 hidden), which began as a 6-tier cognitive ladder (GDD §3.2) but was collapsed to 3 visibility-based buckets for the player UI.

The decision was paused after recognizing that **no single-axis taxonomy covers the inquiry space cleanly** — any choice forces some claims into the wrong home.

---

## Axes considered

### 1. By **object** (proposed by Jing this session)

```
关于红果         (#3 safe, #4 decay, #5 temp affects decay)
关于白色粉末     (#1 toxic, #2 KCN, #6 cross-contamination)
关于环境         (#7 temp differ, #10 PBC, #11 flat)
关于天空         (#8 speeds, #9 axis, #12 constellations, #13 N-hemi, #14 latitude)
玩家自创         (free-form validated)
```

**Pros**
- Matches scientist mental model (organize by domain, not by difficulty)
- Reads like a research notebook, not a game achievement list
- Scales naturally when new substances/systems are added

**Cons**
- Cross-object claims have no clean home: #5 (temp + berry), #6 (powder + berry + surface)
- "天空" as a category name pre-spoils the existence of an astronomy dimension
- #7 (above/below temp) is a "starter" claim but lives in environment — awkward placement
- Player must learn that "interactions" are tracked under "the agent" or some other tiebreaker rule

### 2. By **cognitive operation** (GDD §3.2 original 6-tier ladder, presented honestly)

```
单一感官观察     (Single Sensory Event)
跨感官整合       (Cross-Sensory Integration)
跨时间观察       (Cross-Temporal Observation)
控制变量推理     (Controlled-Variable Reasoning)
系统性测量       (Systematic Measurement)
跨域知识转移     (Cross-Domain Knowledge Transfer)
```

**Pros**
- This is the design's actual epistemic ladder — pedagogy made visible
- Each tier names a real cognitive move; not a difficulty number
- Aligns with GDD's productive-failure framework
- Cross-object claims (#5, #6) belong naturally to the higher tiers (controlled-variable / cross-temporal) — there's no "where does this go" problem

**Cons**
- Players may not have vocabulary for "controlled-variable reasoning" — labels sound academic
- Risk of looking like an SAT prep tool
- Difficulty signal still leaks ("higher tiers are harder")

### 3. By **scientific discipline** (chemistry / biology / astronomy / ...)

```
化学             (#1, #2, #6)
生物             (#3, #4, #5)
热力学           (#5, #7)
天文             (#8, #9, #12, #13, #14)
地理 / 拓扑      (#7, #10, #11)
```

**Pros**
- Familiar to anyone with high-school science
- Reads as legitimate scientific organization

**Cons**
- Same cross-cutting problem (#5 in two places, #7 in two places)
- Discipline labels carry baggage and may not match the game world

### 4. **Flat list + tags** (no enforced hierarchy)

```
[All claims, sortable / filterable]
Tags per claim: #berry  #powder  #temperature  #astronomy  #pbc  ...
Player picks the lens. No imposed structure.
```

**Pros**
- Most honest about the network nature of scientific knowledge
- Most aligned with GDD's "no scores, no objectives" philosophy
- Player constructs their own structure — meta-pedagogically perfect
- Free-form claims fit naturally without a special bucket

**Cons**
- Highest UX complexity (filters, sorting)
- May feel sparse / overwhelming without a default lens
- Loses the visual satisfaction of "category complete"

---

## The structural insight

Any **single-axis** taxonomy will fail somewhere — scientific knowledge is a network, not a tree. NGSS handles this with **Crosscutting Concepts** (Patterns, Cause & Effect, Systems, Scale) layered on top of disciplinary content. We do not need to solve the unsolved.

The question is not *which axis is correct*, but **which axis's failure mode is most acceptable** for our specific context (3-5 expert walkthroughs → IJSG paper → potential learner studies later).

---

## Probing questions for next decision pass

1. For the IJSG reader, which taxonomy most clearly **communicates the design's pedagogical intent**?
2. For the walkthrough expert, which one **least disrupts inquiry flow** while playing?
3. If forced to pick one and discard the others permanently — which loss would hurt most?
4. Could telemetry **a/b test** two taxonomies across walkthrough sessions and let data decide?

---

## What we're keeping for now

- **Status quo**: 3-tier visibility-based model (Tier 1 / 2 visible, Tier 3 hidden until each individually validated). Free-form section appears at bottom.
- This is good enough for first walkthrough sessions. Not the final answer.
- Internal `tier` field in `CLAIM_DEFS` retains the cognitive-operation meaning (option 2) — usable for analytics regardless of which UI taxonomy we ship.

---

## When to revisit

- After the first 1-2 expert walkthroughs (their think-aloud will reveal which mental model they imposed on the leaderboard).
- After Cloudflare deployment + telemetry comes online (we can quantify which categories players engage with).
- Before IJSG submission (the paper's methodology section needs a defensible choice with rationale).

---

## Files / sections this decision touches

- `js/cer.js` — `CLAIM_DEFS[].tier` and `LEADERBOARD_VISIBLE_TIERS`
- `js/leaderboard.js` — `showLeaderboard()` rendering loop
- `js/lang.js` — section header strings (`leaderboard.tier`, `leaderboard.deeper`, `leaderboard.player_discoveries`)
- `GDD.md` §3.2 (claim table) and §8.1 (CER Board) — narrative description of how claims are organized
- `CLAUDE.md` — Notebook data structure comment on `validatedClaims`

---

*This document is a parking lot, not a plan. Update it when something changes.*
