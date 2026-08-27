# RENDERING PROOF 001 REPORT

Date: 2026-08-26 (America/New_York)
Status: `BLOCKED_AT_RUNTIME_MEASUREMENT` — implementation scaffold complete; controlled GPU bake-off not executable in the original container.

## Executive result
Browser Rendering Proof 001 is implemented as a single shared TypeScript/Vite repository with three renderer branches: PlayCanvas, Babylon.js and Three.js WebGPURenderer. The branches share scene dimensions, camera states, quality levels, HUD, benchmark data model and capture procedure.

The original execution environment could not complete a trustworthy bake-off because public npm resolution was unavailable and Chromium could not initialize a usable EGL/Vulkan GPU process. No benchmark numbers or screenshots were fabricated.

## Identical proof scene
See `EXECUTION_SPEC.md`.

The implementation fixes a 420 m race segment, 11.5 m track width, 18°–32° banked sweep, one hero craft, two opponents, one 58 m landmark, barriers/signage, skyline massing, wet zone, transparent canopies, PBR material families, emissive systems, atmosphere, shield shell and browser-native HUD.

## Quality tiers
Q0/Q1/Q2 are shared data, not renderer-specific artistic reinterpretations.

## Repository architecture
- `src/shared/spec.ts` — invariant scene/camera/quality contract
- `src/shared/benchmark.ts` — frame sampling and metric schema
- `src/shared/hud.ts` / `src/styles.css` — browser-native HUD
- `src/playcanvas/proof.ts`
- `src/babylon/proof.ts`
- `src/three-webgpu/proof.ts`
- `scripts/run-bench.mjs` — automated 1440p capture/measurement harness
- `screenshots/` — real browser captures only
- `bench-results/` — measured JSON only

## Current renderer priority
Qualitative execution order only:
1. Babylon.js
2. PlayCanvas
3. Three.js WebGPURenderer

This is not an authoritative renderer lock.

## Required next step
Run the repository on one premium desktop with current stable Chrome/Edge, a discrete GPU, WebGPU enabled, and normal npm/package access. Execute all Q0/Q1/Q2 branches and all five capture states using `npm run bench`, then populate the renderer matrix from measured output.

Do not begin canonical #06/#13/#35 calibration until Proof 001 passes and browser-verified primary anchors are subsequently approved.
