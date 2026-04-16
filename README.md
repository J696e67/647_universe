# 神农堂 — Shennong Hall · Universe 647

A browser-based 3D serious game for scientific inquiry learning.
**Play until you die. Play until you know why.**

## What it is

You are an explorer in Universe 647 — a bounded world with periodic boundary conditions, governed by internally consistent but initially unknown rules. You investigate the world through five senses. Some things kill you. Death is not punishment; death is data. Each death generates a record that becomes raw material for the next explorer's investigation.

The game operationalizes the full arc of scientific inquiry: from naive exploration, through question formulation (mediated by an AI Tombstone powered by Claude Sonnet), to hypothesis testing and knowledge construction (via a structured Claim–Evidence–Reasoning Board with holistic AI grading).

## Live demo

- Public version (Tombstone in offline fallback): https://j696e67.github.io/647_universe/
- Expert walkthrough version (full Claude AI): by invitation

## Tech

Three.js · Vanilla HTML/CSS/JS · Web Audio API · Anthropic Claude Sonnet 4.6 · No frameworks · Single-file entry (`index.html`)

## Run locally

```sh
python3 server.py        # serves on http://localhost:9090
```

For full Claude AI features, create `config.local.js` (gitignored):

```js
var LOCAL_CONFIG = { ANTHROPIC_API_KEY: 'sk-ant-...' };
```

## Tests

```sh
node tests/run.js          # 141 unit assertions
node tests/integration.js  # 68 assertions across 11 scenarios
```

## Documentation

- [`GDD.md`](GDD.md) — full Game Design Document v1.1, including theoretical framework and onboarding flow
- [`CLAUDE.md`](CLAUDE.md) — codebase architecture and data structures
- [`docs/expert_walkthrough_protocol.md`](docs/expert_walkthrough_protocol.md) — research protocol for design validation

## Status

Active prototype targeting IJSG (International Journal of Serious Games) submission. Built by Jing Yang in collaboration with Claude (Anthropic).

## License

Research prototype — all rights reserved pending publication.
