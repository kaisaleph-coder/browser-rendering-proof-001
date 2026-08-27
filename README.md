# Browser Rendering Proof 001

Controlled three-renderer browser bake-off for the browser-first anti-gravity racing project.

## Purpose

This repository implements the same 420 m proof scene in:

- Babylon.js
- PlayCanvas
- Three.js WebGPURenderer

The goal is to measure visual fidelity, frame-time stability, renderer maturity, and browser fallback behavior before selecting the authoritative runtime renderer.

## Current status

`PROOF_CANDIDATE` — implementation scaffold is present. Runtime measurements must be produced on a premium desktop browser with working WebGPU/WebGL2 and normal package/network access.

No renderer is locked until measured proof is complete.

## Local setup

Requirements:

- Node.js 22+
- current stable Chrome or Edge
- discrete or strong integrated GPU
- WebGPU enabled and available

Install and build:

```bash
npm install
npm run build
```

Interactive development:

```bash
npm run dev
```

Open one branch directly, for example:

```text
http://localhost:5173/?renderer=babylon&quality=q1&capture=chase
```

Renderer values:

- `babylon`
- `playcanvas`
- `three`

Quality values:

- `q0`
- `q1`
- `q2`

Capture values:

- `chase`
- `beauty`
- `speed`
- `shield`
- `hud`

## Automated bake-off

After a successful build:

```bash
npm run bench
```

The runner launches the preview build, renders all 45 renderer/quality/capture combinations, waits for the shared benchmark harness, samples for eight seconds, and writes:

- `screenshots/*.png`
- `bench-results/*.json`
- `bench-results/all.json`

Do not commit fabricated or estimated benchmark outputs.

## Proof scene

- 420 m banked race segment
- one hero craft + two opponents
- 11.5 m track width
- 18°–32° banked sweep
- 58 m landmark
- barriers + emissive signage
- skyline massing
- 82 m wet/reflective zone
- transparent canopies
- PBR material families
- propulsion emissives
- shield shell
- atmosphere/fog
- browser-native HUD

## Quality tiers

- `Q0` — baseline
- `Q1` — premium core
- `Q2` — stress

## Governing documents

- `EXECUTION_SPEC.md`
- `RENDERING_PROOF_001_REPORT.md`
- `PROVEN_UNPROVEN_VISUAL_FEATURE_REGISTER.md`

The proof must be executed unchanged across all renderer branches before an authoritative renderer selection is made.
