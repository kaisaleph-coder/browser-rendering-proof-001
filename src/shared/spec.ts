export type RendererId = 'playcanvas' | 'babylon' | 'three';
export type QualityId = 'q0' | 'q1' | 'q2';
export type CaptureId = 'chase' | 'beauty' | 'speed' | 'shield' | 'hud';

export const PROOF = {
  segmentLengthM: 420,
  trackWidthM: 11.5,
  bankDeg: { start: 18, end: 32 },
  landmarkHeightM: 58,
  hero: { x: 0, y: 1.55, z: 18 },
  opponents: [
    { x: -2.8, y: 1.48, z: 36 },
    { x: 3.1, y: 1.52, z: 54 }
  ],
  wetZoneLengthM: 82,
  hud: { speed: 1248, position: '03/08', lap: '2/5', energy: 78, shield: 92 }
} as const;

export const QUALITY = {
  q0: { internalScale: 0.75, skylineBlocks: 45, particles: 350, shadowSize: 1024, bloom: false, distortion: false },
  q1: { internalScale: 0.85, skylineBlocks: 90, particles: 900, shadowSize: 2048, bloom: true, distortion: true },
  q2: { internalScale: 1.0, skylineBlocks: 180, particles: 2200, shadowSize: 4096, bloom: true, distortion: true }
} as const;

export const CAPTURES: Record<CaptureId, { position: [number, number, number]; target: [number, number, number]; fov: number }> = {
  chase:  { position: [0, 4.8, -9.5], target: [0, 1.5, 28], fov: 68 },
  beauty: { position: [14, 8.2, 8], target: [0, 1.6, 23], fov: 48 },
  speed:  { position: [0, 3.9, -12], target: [0, 1.4, 42], fov: 82 },
  shield: { position: [7, 4.6, 6], target: [0, 1.5, 20], fov: 58 },
  hud:    { position: [0, 4.8, -9.5], target: [0, 1.5, 28], fov: 68 }
};

export function queryState() {
  const p = new URLSearchParams(location.search);
  const renderer = (p.get('renderer') ?? 'babylon') as RendererId;
  const quality = (p.get('quality') ?? 'q1') as QualityId;
  const capture = (p.get('capture') ?? 'chase') as CaptureId;
  return { renderer, quality, capture };
}
