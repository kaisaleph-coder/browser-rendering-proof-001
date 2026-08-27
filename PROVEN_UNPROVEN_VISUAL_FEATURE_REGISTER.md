# Proof 001 — Visual Feature Register

These classifications reflect implementation evidence available before the premium-runtime benchmark is completed.

| Feature | Classification | Evidence / qualification |
|---|---|---|
| Track-relative chase camera | REPRODUCIBLE | Implemented identically in all three branches. |
| Browser-native HUD | REPRODUCIBLE | Shared DOM/CSS implementation. |
| PBR craft hull/material differentiation | REPRODUCIBLE | Native material systems in all candidates. Runtime performance still requires measurement. |
| Transparent canopy | REPRODUCIBLE | Implemented on all branches; advanced refraction quality remains unmeasured. |
| Emissive infrastructure | REPRODUCIBLE | Native emissive materials. |
| Atmosphere/fog | REPRODUCIBLE | Native scene fog paths. |
| Wet/reflective track response | REPRODUCIBLE WITH MODIFICATION | Base PBR wetness is implemented; SSR/planar strategy requires runtime cost proof. |
| Propulsion core/glow | REPRODUCIBLE | Emissive engine elements implemented. |
| Propulsion plume/trail | NOT YET PROVEN | Renderer-specific production-quality trail still requires implementation/benchmarking. |
| Hover/field cue | REPRODUCIBLE WITH MODIFICATION | Geometric hover separation is present; richer field effect requires shader proof. |
| Shield effect | REPRODUCIBLE WITH MODIFICATION | Transparent shell implemented; production ripple/distortion is unproven. |
| Sparks/contact effect | NOT YET PROVEN | Particle budget defined; contact-event implementation still required. |
| Weather particle class | REPRODUCIBLE WITH MODIFICATION | Representative particle path exists; equivalent GPU-efficient paths must be normalized. |
| Bloom | REPRODUCIBLE WITH MODIFICATION | Renderer paths require normalization and cost measurement. |
| Controlled distortion | NOT YET PROVEN | Must be tested as bounded screen-space/custom shader cost. |
| Speed treatment | REPRODUCIBLE WITH MODIFICATION | FOV state is implemented; velocity/depth motion treatment requires runtime validation. |
| Dense skyline | REPRODUCIBLE WITH MODIFICATION | Density path implemented; production LOD/instancing/impostor mix requires measurement. |
| High-end A01 reflection/atmosphere density | NOT YET PROVEN | Aspirational only until live GPU evidence exists. |
| A02 microdetail / internal cutaway fidelity | NOT YET PROVEN | Requires later asset-level proof. |
| A03 HUD restraint / opponent framing | REPRODUCIBLE | Shared DOM HUD and fixed camera framing implemented. |
