# Browser Rendering Proof 001 — Execution Specification

Status: PROOF_CANDIDATE IMPLEMENTATION; runtime benchmark not yet completed on a premium GPU host.

## Identical Scene Contract
- Segment: 420 m
- Track: 11.5 m nominal width; sweeping bank rising from 18° to 32°
- Hero craft: one procedural high-detail proxy at x0 / y1.55 / z18
- Opponents: two procedural craft at fixed transforms
- Landmark: 58 m architectural mass at fixed transform
- Barriers/signage: repeated fixed-spacing safety barrier and emissive race signage system
- Distant world: renderer-local geometry generated from one density scalar
- Wet zone: 82 m reflective apex/sweep section
- Canopy: transparent high-value surface on all craft
- Materials: metallic/rough PBR families for hull, track, barrier, landmark; clear/transparent canopy
- Lighting: one primary directional key + hemispheric/ambient fill + emissive practicals
- Atmosphere: exponential fog
- Effects: propulsion emissives, shield shell, weather particles, bloom where renderer path permits; distortion hook reserved for Q1/Q2 implementation
- Camera: identical capture-state position/target/FOV values across renderers
- HUD: identical DOM/CSS overlay showing speed, position, lap, energy and shield

## Quality Tiers
- Q0: 0.75 internal scale, 45 skyline blocks, 350 weather particles, 1024 shadow target, no optional bloom/distortion
- Q1: 0.85 internal scale, 90 skyline blocks, 900 weather particles, 2048 shadow target, bloom/distortion enabled where implemented
- Q2: 1.0 internal scale, 180 skyline blocks, 2200 weather particles, 4096 shadow target, stress reflection/effect settings

## Required Capture States
- chase
- beauty
- speed
- shield
- hud

## Benchmark Window
- warm-up / shader compile explicitly recorded when API exposes it
- 8 s sampling after load in automated harness
- frame delta samples + CPU callback duration
- renderer draw/triangle counters where available
- GPU timestamp only if actually exposed and trustworthy; otherwise unavailable
- texture memory is an implementation estimate based only on loaded proof assets, never browser process memory
