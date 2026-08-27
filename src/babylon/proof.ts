import { Engine, WebGPUEngine, Scene, ArcRotateCamera, Vector3, HemisphericLight, DirectionalLight, Color3, Color4, MeshBuilder, PBRMaterial, StandardMaterial, GlowLayer, TransformNode } from '@babylonjs/core';
import { CAPTURES, PROOF, QUALITY, type CaptureId, type QualityId, type RendererId } from '../shared/spec';
import { FrameSampler, exposeMetrics, type ProofMetrics } from '../shared/benchmark';

export async function run(root: HTMLElement, state: { renderer: RendererId; quality: QualityId; capture: CaptureId }) {
  const canvas = document.createElement('canvas');
  root.prepend(canvas);
  const q = QUALITY[state.quality];
  canvas.width = Math.floor(innerWidth * devicePixelRatio * q.internalScale);
  canvas.height = Math.floor(innerHeight * devicePixelRatio * q.internalScale);

  let engine: Engine | WebGPUEngine;
  if ((navigator as any).gpu) {
    const webgpu = new WebGPUEngine(canvas, { antialias: true });
    await webgpu.initAsync();
    engine = webgpu;
  } else {
    engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
  }

  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.018, 0.022, 0.027, 1);
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.006;
  scene.fogColor = new Color3(0.09, 0.11, 0.12);

  const c = CAPTURES[state.capture];
  const camera = new ArcRotateCamera('cam', 0, 0, 1, new Vector3(...c.target), scene);
  camera.position = new Vector3(...c.position);
  camera.fov = c.fov * Math.PI / 180;
  camera.minZ = 0.05;
  camera.maxZ = 1200;
  scene.activeCamera = camera;

  const hemi = new HemisphericLight('fill', new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.55;
  const sun = new DirectionalLight('sun', new Vector3(-0.45, -0.8, 0.3), scene);
  sun.position = new Vector3(40, 80, -20);
  sun.intensity = 4.0;

  const trackMat = pbr(scene, 'track', new Color3(0.12, 0.13, 0.14), 0.1, 0.76);
  const wetMat = pbr(scene, 'wet', new Color3(0.08, 0.09, 0.1), 0.42, 0.18);
  const barrierMat = pbr(scene, 'barrier', new Color3(0.16, 0.17, 0.18), 0.65, 0.32);
  const hullMat = pbr(scene, 'hull', new Color3(0.68, 0.7, 0.7), 0.78, 0.24);
  const darkMat = pbr(scene, 'dark', new Color3(0.035, 0.045, 0.055), 0.58, 0.22);
  const accentMat = pbr(scene, 'accent', new Color3(0.94, 0.58, 0.03), 0.45, 0.3);
  const glowMat = new StandardMaterial('glow', scene); glowMat.emissiveColor = new Color3(0.15, 0.62, 1.0);
  const shieldMat = new StandardMaterial('shield', scene); shieldMat.alpha = 0.16; shieldMat.emissiveColor = new Color3(0.08, 0.55, 1.0); shieldMat.disableLighting = true;

  const track = MeshBuilder.CreateBox('track', { width: PROOF.trackWidthM, height: 0.55, depth: PROOF.segmentLengthM }, scene);
  track.position.z = PROOF.segmentLengthM * 0.5;
  track.material = trackMat;
  track.rotation.z = -24 * Math.PI / 180;

  const wet = MeshBuilder.CreateBox('wet', { width: PROOF.trackWidthM * 0.98, height: 0.03, depth: PROOF.wetZoneLengthM }, scene);
  wet.position.set(0, 0.32, 105); wet.material = wetMat; wet.rotation.z = track.rotation.z;

  for (let z = 0; z < PROOF.segmentLengthM; z += 14) {
    for (const x of [-PROOF.trackWidthM * 0.58, PROOF.trackWidthM * 0.58]) {
      const b = MeshBuilder.CreateBox(`b${x}-${z}`, { width: 0.3, height: 1.2, depth: 9 }, scene);
      b.position.set(x, 0.72, z); b.material = barrierMat;
    }
  }

  const landmark = MeshBuilder.CreateCylinder('landmark', { diameterTop: 11, diameterBottom: 24, height: PROOF.landmarkHeightM, tessellation: 12 }, scene);
  landmark.position.set(-38, PROOF.landmarkHeightM / 2, 135); landmark.material = darkMat;

  for (let i = 0; i < q.skylineBlocks; i++) {
    const h = 10 + (i % 11) * 3.2;
    const box = MeshBuilder.CreateBox(`sky${i}`, { width: 5 + (i % 4) * 2, height: h, depth: 5 + (i % 3) * 3 }, scene);
    box.position.set((i % 2 ? 1 : -1) * (28 + (i % 13) * 7), h / 2 - 2, 50 + (i * 17) % 360);
    box.material = darkMat;
  }

  const hero = craft(scene, 'hero', PROOF.hero, hullMat, darkMat, accentMat, glowMat, shieldMat, state.capture === 'shield');
  craft(scene, 'op1', PROOF.opponents[0], pbr(scene,'red',new Color3(.34,.06,.04),.62,.3), darkMat, accentMat, glowMat, shieldMat, false);
  craft(scene, 'op2', PROOF.opponents[1], pbr(scene,'green',new Color3(.05,.23,.14),.45,.35), darkMat, accentMat, glowMat, shieldMat, false);

  if (q.bloom) { const glow = new GlowLayer('glowLayer', scene, { blurKernelSize: 32 }); glow.intensity = 0.85; }

  const sampler = new FrameSampler();
  let metrics: ProofMetrics = {
    renderer: 'babylon', quality: state.quality, capture: state.capture,
    samples: 0, avgFrameMs: null, p99FrameMs: null, avgCpuCallbackMs: null,
    drawCalls: null, triangles: null, gpuMs: null, textureMemoryBytes: null, shaderCompileNotes: []
  };

  engine.runRenderLoop(() => {
    const t0 = performance.now();
    scene.render();
    sampler.sample(performance.now() - t0);
    const stats: any = (scene as any).getEngine?.()._drawCalls;
    metrics = sampler.finish({ renderer: 'babylon', quality: state.quality, capture: state.capture, drawCalls: typeof stats === 'number' ? stats : null, triangles: null, gpuMs: null, textureMemoryBytes: null, shaderCompileNotes: [] });
  });
  exposeMetrics(() => metrics);
  addEventListener('resize', () => engine.resize());
}

function pbr(scene: Scene, name: string, color: Color3, metallic: number, roughness: number) {
  const m = new PBRMaterial(name, scene); m.albedoColor = color; m.metallic = metallic; m.roughness = roughness; return m;
}

function craft(scene: Scene, name: string, pos: {x:number;y:number;z:number}, hull: any, dark: any, accent: any, glow: any, shield: any, shieldOn: boolean) {
  const root = new TransformNode(name, scene); root.position.set(pos.x, pos.y, pos.z);
  const body = MeshBuilder.CreateBox(`${name}-body`, { width: 4.2, height: 0.75, depth: 8.8 }, scene); body.parent = root; body.material = hull;
  const nose = MeshBuilder.CreateBox(`${name}-nose`, { width: 2.6, height: 0.55, depth: 4.0 }, scene); nose.parent = root; nose.position.z = 5.4; nose.scaling.z = 0.55; nose.material = hull;
  for (const side of [-1,1]) { const wing = MeshBuilder.CreateBox(`${name}-wing${side}`, { width: 2.2, height: 0.24, depth: 5.7 }, scene); wing.parent = root; wing.position.set(side * 2.9, -0.08, 0.5); wing.material = dark; const fin = MeshBuilder.CreateBox(`${name}-fin${side}`, { width: 0.25, height: 0.55, depth: 3 }, scene); fin.parent = root; fin.position.set(side * 3.7, 0.15, -0.3); fin.material = accent; }
  for (const side of [-1,1]) { const jet = MeshBuilder.CreateCylinder(`${name}-jet${side}`, { diameter: 0.7, height: 2.6, tessellation: 16 }, scene); jet.parent = root; jet.rotation.x = Math.PI/2; jet.position.set(side * 1.25, 0, -5.4); jet.material = glow; }
  const canopy = MeshBuilder.CreateSphere(`${name}-canopy`, { diameter: 2.1, segments: 16 }, scene); canopy.parent = root; canopy.scaling.set(1.15, 0.45, 1.6); canopy.position.set(0,0.65,0.8); const cm = new StandardMaterial(`${name}-canopy-mat`, scene); cm.alpha=.34; cm.diffuseColor=new Color3(.05,.08,.1); cm.specularColor=new Color3(.8,.9,1); canopy.material=cm;
  if (shieldOn) { const s = MeshBuilder.CreateSphere(`${name}-shield`, { diameter: 9.2, segments: 24 }, scene); s.parent = root; s.scaling.set(1.25,.42,1.25); s.material = shield; }
  return root;
}
