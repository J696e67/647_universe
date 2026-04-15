# Tests

Two headless test suites. Both run under plain Node (no jsdom, no
npm install).

```
node tests/run.js         # Layer A — 133 unit assertions
node tests/integration.js # Layer B — 58 assertions across 10 scenarios
```

Exit 0 on pass, 1 on fail.

## Layer A — `run.js` (unit)

Pure-logic tests for `js/cer.js` loaded in a Node `vm` sandbox with
stubbed globals. Covers: 14 claim evidence gates (locked / unlocked),
`matchClaimId` routing (EN + ZH), scaffolded onboarding entries,
`finalizeCer` pass/fail side-effects, `submitCerEntry` guard rails,
Q10 decay math, and `CLAIM_DEFS` structural integrity.

A browser-viewable twin lives at `tests/test.html` (same assertions,
rendered on-page for visual inspection).

## Layer B — `integration.js` (cross-file)

Exercises contracts that span multiple source files. Real `cer.js`
is loaded in the sandbox; Three.js / DOM-heavy files are simulated by
replaying their documented state-transition contracts locally, so a
drift in those contracts fails the corresponding test.

| # | Scenario | What it checks |
|---|----------|----------------|
| 1 | Full kill chain | Touch-KCN → touch-handle → 2nd character touches handle → taste berry → lethal residue detected → death with `cross_contamination_death` causeId → `crossContaminationDeathSeen` set → claim 6 unlocked |
| 2 | CER offline path | No Claude key → word-count heuristic validates a non-trivial entry against claim 1 |
| 3 | CER grader pass (mocked) | Stubbed `fetch` returns `{pass:true}` → entry validated, grader note surfaces in `_feedback` |
| 4 | CER grader fail (mocked) | Stubbed `fetch` returns `{pass:false}` → entry not validated, no claim pushed |
| 5 | Save/load round trip | 14 gate outcomes unchanged after JSON serialize + parse of `G.notebook` |
| 6 | Thermometer dual location | Above then below populate `thermometerLocations`; duplicates not re-pushed; claims 5 + 7 unlock |
| 7 | Day/night accumulator | Counter increments on cycle crossing, stays monotonic, satisfies claim 9 at 2 cycles |
| 8 | Sky observation throttle | 30 s throttle enforced; low pitch ignored; night observations unlock claims 12 + 13 |
| 9 | Tombstone history bounding | Rolling window of 20 turns preserved after 30 pushes |
| 10 | EQUIP tag parsing | Regex extracts item, case-insensitive, duplicates ignored, unknowns rejected |

## What these tests do NOT cover

- Three.js rendering / visual output
- Audio synthesis
- Real Claude API calls (mocked in scenarios 3 + 4)
- Full browser pointer-lock / touch input

For those, add a Layer C Playwright suite later.

## Updating tests

When adding a new claim, notebook field, or CER contract:

1. Update `js/cer.js` first.
2. Add a matching gate case to `tests/run.js` AND `tests/test.html`.
3. Add or extend an integration scenario in `tests/integration.js` if
   the change spans files (e.g. new evidence source in `senses.js` or
   `player.js`).
4. Re-run both suites before committing.
