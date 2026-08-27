# Browser Rendering Proof 001

Controlled three-renderer browser bake-off for the browser-first anti-gravity racing project.

## Purpose

This repository implements the same 420 m proof scene in:

- PlayCanvas
- Babylon.js
- Three.js WebGPURenderer

The goal is to measure visual fidelity, frame-time stability, renderer maturity, and browser fallback behavior before selecting the authoritative runtime renderer.

## Current status

`PROOF_CANDIDATE` — implementation scaffold is being populated. Runtime measurements must be produced on a premium desktop browser with working WebGPU/WebGL2 and package/network access.

No renderer is locked until measured proof is complete.

## Proof scene

- 420 m banked race segment
- one hero craft + two opponents
- 11.5 m track width
- 18°–32° banked sweep
- landmark + barriers + emissive signage
- skyline massing
- wet/reflective zone
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

## Required runtime outputs

- CPU frame timing
- GPU/render timing where available
- low-percentile frame behavior
- draw calls
- visible triangle count
- texture/memory estimate
- post-process cost
- effect cost
- load time
- shader compile/hitch behavior
- five comparable screenshots per renderer

The proof must be executed unchanged across all renderer branches before an authoritative selection is made.
