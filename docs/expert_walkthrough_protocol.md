# Expert Walkthrough Protocol
**神农堂 Shennong Hall — Universe 647**
Version 1.0 · April 2026

---

## 1. Purpose

This protocol guides a structured expert walkthrough of 神农堂, a browser-based serious game for scientific inquiry learning. The walkthrough serves as **design validation** — it generates qualitative evidence about whether the game's core mechanics (death-as-data, five-sense interaction, CER Board, AI Tombstone) support the intended inquiry learning trajectory.

This is **not** a user study. Participants are domain experts providing professional judgment, not research subjects. No IRB approval is required.

The data produced by this protocol supports the methodology and results sections of a design paper targeting IJSG (International Journal of Serious Games).

---

## 2. Expert Selection

### Criteria

Recruit **3 experts** (minimum 2). Each expert should satisfy at least one of the following:

| Profile | Why they matter |
|---------|----------------|
| **Science education researcher** | Can evaluate whether the inquiry cycle (observation → question → hypothesis → test → claim) is faithfully operationalized in the gameplay loop |
| **Game-based learning designer/researcher** | Can evaluate intrinsic integration, productive failure mechanics, and whether the learning is inseparable from the gameplay |
| **Science teacher (5+ years)** | Can evaluate whether the 14-claim tier structure reflects realistic cognitive demands for the target audience (middle school–undergraduate) |

Ideal: at least one person from each of the first two profiles. The third can be any of the three.

### Recruitment

- Former academic collaborators, conference contacts, or professional network
- Compensation: acknowledgment in the paper (+ co-authorship if their contribution warrants it)
- Time commitment: ~60 minutes total (30 min play + 30 min interview)

### What to disclose at recruitment

> "I'm developing a browser-based science game for an IJSG submission. I'd like you to play it for 20–30 minutes and then discuss your experience. There are no right answers — I'm interested in your professional judgment on the design."

Do **not** disclose the 14-claim structure, the CER scaffolding design, or the Tombstone's classification framework before the walkthrough. These are features the expert should encounter and evaluate organically.

---

## 3. Setup

### Technical requirements

| Item | Requirement |
|------|-------------|
| Device | Desktop computer with Chrome/Firefox (preferred) or mobile phone with Safari/Chrome |
| URL | https://j696e67.github.io/647_universe/ (or localhost:9090 for local API) |
| Claude API | For full experience, the host must have `config.local.js` with a valid Anthropic API key. If using GitHub Pages, Tombstone falls back to offline mode — acceptable for the walkthrough but note this in the paper |
| Screen recording | OBS, QuickTime, or the device's built-in recorder. Capture both screen and audio (for think-aloud) |
| Audio | Microphone for think-aloud protocol |
| Observer | The researcher (you) present in the same room or on a video call |

### Pre-session checklist

- [ ] Clear browser localStorage for the game URL (fresh state)
- [ ] Verify game loads and runs without errors
- [ ] Start screen recording before the expert begins
- [ ] Prepare the observer notes template (§5)
- [ ] Print or have the post-walkthrough questions (§6) ready
- [ ] Test that the Tombstone responds (either Claude API or offline fallback)

---

## 4. Pre-Walkthrough Briefing (read aloud to expert)

> "This is a browser-based 3D game about scientific inquiry. You play as a series of explorers in a place called Universe 647. The game will not tell you what to do — there are no tutorials for gameplay, no scores, and no objectives on screen.
>
> I'd like you to **think aloud** as you play. Say whatever comes to mind: what you notice, what confuses you, what you're trying to do, what you think is happening, what frustrates you. There are no right answers.
>
> Please play for about **20–25 minutes**. I won't interrupt unless you ask for help with the controls. After you finish, I'll ask you some questions about your experience.
>
> **Controls**: [show appropriate control scheme for their device]
> - Desktop: click to start, WASD to walk, mouse to look, aim crosshair at objects to interact
> - Mobile: drag left to walk, drag right to look, tap to interact
>
> Ready? Go ahead and start."

### What NOT to say

- Do not explain what the white powder is or what it does
- Do not explain the CER Board or what it's for
- Do not explain the Tombstone's role
- Do not reveal the existence of 14 knowledge claims
- Do not say "you will die" — let them discover it
- Do not explain the maze or how to find it
- If they ask "what am I supposed to do?", reply: "Whatever you think makes sense."
- If they are stuck on controls for >2 minutes, you may offer the control reminder only

---

## 5. Walkthrough Procedure

### Duration

20–25 minutes of active play. The expert may stop earlier if they feel they've seen enough, or continue longer if engaged. Do not cut them off mid-inquiry.

### Observer role

**Silent observer**. Take timestamped notes on the template below. Do not guide, hint, or react visibly to the expert's choices. If they look at you for validation, say: "Keep going — I'm interested in whatever you do."

### Observer Notes Template

Record these timestamps and events as they happen:

```
Session: Expert [#] — [Name] — [Date]
Device: [Desktop/Mobile] — [Browser]
Tombstone mode: [Claude API / Offline fallback]

ONBOARDING
[ ] T=___  First movement
[ ] T=___  Entered house
[ ] T=___  First sense action used: ___________
[ ] T=___  All 5 senses completed (pillars lit)
[ ] T=___  Noticed "something outside has changed" prompt
[ ] T=___  Found and entered maze

FIRST LIFE
[ ] T=___  First interaction in maze: ___________
[ ] T=___  First death — cause: ___________
[ ] T=___  Think-aloud reaction to death: ___________

SECOND LIFE
[ ] T=___  New character name: ___________
[ ] T=___  Opened notebook (spontaneous / prompted by Beat 6)
[ ] T=___  Interacted with CER Board: ___________
[ ] T=___  Submitted CER entry: Y/N — result: ___________
[ ] T=___  Visited Tombstone: Y/N
[ ] T=___  Tombstone dialogue topic: ___________

SUBSEQUENT LIVES
[ ] T=___  Character ___: death cause ___________
[ ] T=___  Evidence of controlled-variable reasoning: ___________
[ ] T=___  Evidence of cross-contamination suspicion: ___________
[ ] T=___  Claims validated: ___________

NOTABLE MOMENTS
- T=___  ___________________________________________
- T=___  ___________________________________________
- T=___  ___________________________________________

THINK-ALOUD QUOTES (verbatim, timestamped)
- T=___  "___________________________________________"
- T=___  "___________________________________________"
- T=___  "___________________________________________"
- T=___  "___________________________________________"
```

### Expected phases (for observer reference only — do not impose)

| Phase | What typically happens | Design intent |
|-------|----------------------|---------------|
| 1. Onboarding | Expert explores house, uses 5 senses, discovers maze | Control fluency without gameplay instruction |
| 2. First death | Tastes KCN or triggers cross-contamination | Death as data — the moment the game's premise becomes clear |
| 3. Reflection | Opens notebook, sees CER entry, possibly visits Tombstone | Shift from "what happened" to "why did it happen" |
| 4. Second life | Tests hypotheses — eats berry with clean hands, avoids powder, or investigates door handle | Controlled-variable reasoning emerges |
| 5. Articulation | Writes or edits CER entries, submits claims | Knowledge externalized as claim-evidence-reasoning |

If an expert completes Phase 1–3 in their session, the walkthrough is sufficient. Phases 4–5 are bonus — they provide richer data but are not required.

---

## 6. Post-Walkthrough Interview (semi-structured)

Conduct immediately after play, while the experience is fresh. Record audio. Allow the expert to refer to the game (keep it open on screen).

### Block A — Open-ended experience (5 min)

1. **"Describe what you just experienced."**
   *(Let them talk freely. Don't prompt structure.)*

2. **"What did you find yourself trying to figure out?"**
   *(Probes whether inquiry behavior emerged organically.)*

3. **"Was there a moment where something clicked — where you understood what the game was about?"**
   *(Identifies the pedagogical turning point, if any.)*

### Block B — Death and inheritance (5 min)

4. **"How did you feel when your first character died?"**

5. **"When the second character arrived, did your approach change? How?"**
   *(Probes whether death-as-data was perceived as a learning mechanism.)*

6. **"Did you look at the death records or gravestones? What did you take away from them?"**

### Block C — CER Board and knowledge construction (5 min)

7. **"Did you interact with the CER Board (the Claim/Evidence/Reasoning panel)? What was that like?"**

8. **"Did the scaffolded entries (the pre-filled ones) help or hinder your understanding of what to do?"**

9. **"If you were a student using this, how would you feel about writing your own claims?"**

### Block D — Tombstone (5 min)

10. **"Did you talk to the Tombstone? What did it say?"**

11. **"Did the Tombstone help you think differently about anything?"**

12. **"Was it frustrating that it never gave you a direct answer?"**

### Block E — Professional judgment (5 min)

13. **"As someone who works in [science education / game-based learning / teaching], what does this game get right about inquiry?"**

14. **"What does it get wrong, or what's missing?"**

15. **"Would you use this with learners? Under what conditions?"**

16. **"How does this compare to other inquiry-based learning tools or games you've seen?"**

### Block F — Suggestions (3 min)

17. **"If you could change one thing about the game, what would it be?"**

18. **"Is there anything you expected to find in the game but didn't?"**

### Closing

> "Thank you. Your feedback will be cited in the paper. Would you like to be acknowledged by name, or would you prefer to remain anonymous?"

---

## 7. Data Collection Summary

Each expert session produces the following artifacts:

| Artifact | Format | Use in paper |
|----------|--------|-------------|
| Screen recording | Video file (MP4) | Supplementary material; screenshots for figures |
| Think-aloud transcript | Text | Verbatim quotes in Results; thematic analysis |
| Observer notes | Filled template from §5 | Gameplay path mapping; event timeline |
| Interview transcript | Text (from audio recording) | Thematic analysis in Results; direct quotes |
| CER entries produced | Extracted from game or screenshot | Figures showing knowledge construction artifacts |
| Claims validated | List of claim IDs validated during session | Evidence that the validation system is accessible |

---

## 8. Analysis Framework

### 8.1 Gameplay path mapping

For each expert, construct a timeline: `onboarding → first sense → first death → notebook open → CER interaction → Tombstone visit → second life actions → claims validated`. Compare across experts.

**Report in the paper**: a table or figure showing the sequence and timing of key events for each expert. Highlight convergences (most experts discovered X first) and divergences (Expert 2 never visited the Tombstone).

### 8.2 Thematic analysis of think-aloud and interview

Code the transcripts using these **a priori themes** derived from the design framework:

| Theme | Definition | Example quote |
|-------|-----------|---------------|
| **Productive failure** | Expert describes learning from death/failure as a positive mechanism | "When Alice died, I immediately wanted to know why" |
| **Inquiry behavior** | Expert spontaneously generates a hypothesis, test, or investigation plan | "I wonder if the door handle is contaminated" |
| **Intrinsic integration** | Expert notes that understanding the world IS the gameplay, not layered on top | "You can't progress without figuring out the science" |
| **Question formulation** | Expert shifts from reaction to investigable question, possibly mediated by Tombstone | "The Tombstone made me rethink my assumption" |
| **Knowledge articulation** | Expert engages with CER Board as a reasoning tool, not just a form | "Writing the reasoning forced me to think about whether my evidence was sufficient" |
| **Frustration / confusion** | Expert encounters a barrier that the design did not intend | "I didn't know the buttons existed" |
| **Design suggestion** | Expert proposes a concrete improvement | "The berry should change more visibly over time" |

Allow **emergent themes** to surface during coding. Two passes: first pass for a priori codes, second pass for anything that doesn't fit.

### 8.3 Design alignment assessment

For each design claim in the GDD (§2 Design Philosophy, §12 Onboarding), assess whether the expert walkthrough data supports or challenges it:

| Design claim | Supported? | Evidence |
|-------------|-----------|----------|
| "Death is data" is perceived as a learning mechanic, not punishment | ? | Expert quotes from Q4–Q5 |
| Onboarding teaches controls without teaching gameplay | ? | Observer notes on Phase 1 |
| CER scaffolding guides without dictating | ? | Expert response to Q8 |
| Tombstone promotes question formulation | ? | Expert response to Q10–Q12 |
| 14-claim tiers reflect increasing cognitive demand | ? | Claims reached vs. expert profile |

---

## 9. Reporting in the Paper

### Methodology section

> "Three experts in [science education / game-based learning] completed individual walkthrough sessions of the prototype. Each session consisted of 20–25 minutes of gameplay with concurrent think-aloud, followed by an 18-question semi-structured interview. Sessions were screen-recorded and transcribed. Observer notes captured timestamped gameplay events. Data were analyzed using thematic analysis with a priori codes derived from the design framework (Kapur, 2016; Habgood & Ainsworth, 2011), supplemented by emergent themes."

### Results section

Structure around the five a priori themes:
1. Evidence of productive failure perception
2. Evidence of spontaneous inquiry behavior
3. Evidence of intrinsic integration recognition
4. CER Board as knowledge construction tool
5. Tombstone as question-formulation scaffold

Each theme: 2–3 expert quotes + observer note evidence + design alignment assessment.

### Limitations (preempt reviewer objections)

- Small expert sample (N=3) — sufficient for design validation, not generalizable
- No learner data — cannot claim learning outcomes
- Offline Tombstone mode limits evaluation of the AI scaffolding quality
- Single-session walkthrough — does not capture long-term inquiry development across multiple sessions
- Expert behavior may not represent novice learner behavior

---

## 10. Timeline

| Week | Activity |
|------|----------|
| 1 | Recruit experts, schedule sessions |
| 2 | Conduct 3 walkthrough sessions |
| 3 | Transcribe recordings, fill analysis templates |
| 4 | Thematic coding + design alignment assessment |
| 5–6 | Draft paper |
| 7 | Expert review of draft (optional) |
| 8 | Submit to IJSG |

---

## Appendix A — Equipment Checklist

```
[ ] Laptop/phone charged
[ ] Browser cache cleared for game URL
[ ] config.local.js with valid API key (if using local server)
[ ] OBS / QuickTime / screen recorder ready
[ ] External microphone (or device mic confirmed working)
[ ] Printed observer notes template (1 per expert)
[ ] Printed interview questions (1 copy for interviewer)
[ ] Consent-to-record verbal confirmation (not IRB — just courtesy)
[ ] Water for expert
[ ] Timer / clock visible to observer
```

## Appendix B — Expert Information Sheet

Provide this one-pager to experts **after** the walkthrough (not before):

> **About 神农堂 (Shennong Hall)**
>
> 神农堂 is a browser-based serious game for scientific inquiry learning. Players explore Universe 647 — a world governed by internally consistent but initially unknown rules — through five-sense interaction. Death is not punishment; it is data. Each death generates a record that becomes raw material for the next explorer's investigation.
>
> The game operationalizes the full arc of scientific inquiry: from naive exploration, through question formulation (mediated by an AI Tombstone), to hypothesis testing and knowledge construction (via a Claim–Evidence–Reasoning Board). The design draws on Productive Failure (Kapur, 2016), Intrinsic Integration (Habgood & Ainsworth, 2011), and Exploratory Learning Environments.
>
> The game contains 14 discoverable knowledge claims organized in 6 tiers of increasing cognitive complexity, from single-sensory observation to cross-domain knowledge transfer.
>
> Your feedback will be used in a design paper submitted to the International Journal of Serious Games. Thank you for your time.
