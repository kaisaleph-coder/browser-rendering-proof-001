import * as THREE from 'three/webgpu';
import { CAPTURES, PROOF, QUALITY, type CaptureId, type QualityId, type RendererId } from '../shared/spec';
import { FrameSampler, exposeMetrics, type ProofMetrics } from '../shared/benchmark';

export async function run(root: HTMLElement, state: { renderer: RendererId; quality: QualityId; capture: CaptureId }) {
  const q = QUALITY[state.quality];
  const renderer = new THREE.WebGPURenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(devicePixelRatio * q.internalScale);
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x050607, 1);
  root.prepend(renderer.domElement);
  await renderer.init();

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x171d20, 0.006);
  const c = CAPTURES[state.capture];
  const camera = new THREE.PerspectiveCamera(c.fov, innerWidth / innerHeight, 0.05, 1200);
  camera.position.set(...c.position);
  camera.lookAt(...c.target);

  scene.add(new THREE.HemisphereLight(0xa7c6d4, 0x080a0b, 1.1));
  const sun = new THREE.DirectionalLight(0xfff2d6, 4.0); sun.position.set(40, 80, -20); scene.add(sun);

  const trackMat = mat(0x1d2022, 0.12, 0.76);
  const wetMat = mat(0x111519, 0.42, 0.18);
  const barrierMat = mat(0x292c2e, 0.65, 0.32);
  const hullMat = mat(0xadb2b2, 0.78, 0.24);
  const darkMat = mat(0x0b0f13, 0.58, 0.22);
  const accentMat = mat(0xf09808, 0.45, 0.3);
  const glowMat = new THREE.MeshStandardMaterial({ color: 0x153c55, emissive: 0x31aaff, emissiveIntensity: 8, roughness: .24, metalness: .3 });
  const shieldMat = new THREE.MeshBasicMaterial({ color: 0x29a9ff, transparent: true, opacity: .14, blending: THREE.AdditiveBlending, depthWrite: false });

  const track = meshBox(PROOF.trackWidthM, .55, PROOF.segmentLengthM, trackMat); track.position.z = PROOF.segmentLengthM*.5; track.rotation.z = -24*Math.PI/180; scene.add(track);
  const wet = meshBox(PROOF.trackWidthM*.98,.03,PROOF.wetZoneLengthM,wetMat); wet.position.set(0,.32,105); wet.rotation.z=track.rotation.z; scene.add(wet);
  for (let z=0;z<PROOF.segmentLengthM;z+=14) for (const x of [-PROOF.trackWidthM*.58,PROOF.trackWidthM*.58]) { const b=meshBox(.3,1.2,9,barrierMat); b.position.set(x,.72,z); scene.add(b); }

  const landmark = new THREE.Mesh(new THREE.CylinderGeometry(5.5,12,PROOF.landmarkHeightM,12),darkMat); landmark.position.set(-38,PROOF.landmarkHeightM/2,135); scene.add(landmark);
  for(let i=0;i<q.skylineBlocks;i++){const h=10+(i%11)*3.2;const b=meshBox(5+(i%4)*2,h,5+(i%3)*3,darkMat);b.position.set((i%2?1:-1)*(28+(i%13)*7),h/2-2,50+(i*17)%360);scene.add(b);}

  craft(scene,'hero',PROOF.hero,hullMat,darkMat,accentMat,glowMat,shieldMat,state.capture==='shield');
  craft(scene,'op1',PROOF.opponents[0],mat(0x56100b,.62,.3),darkMat,accentMat,glowMat,shieldMat,false);
  craft(scene,'op2',PROOF.opponents[1],mat(0x0c3a24,.45,.35),darkMat,accentMat,glowMat,shieldMat,false);

  const rainGeo = new THREE.BufferGeometry();
  const count = q.particles;
  const arr = new Float32Array(count*3);
  for(let i=0;i<count;i++){arr[i*3]=(Math.random()-.5)*80;arr[i*3+1]=Math.random()*30;arr[i*3+2]=Math.random()*220;}
  rainGeo.setAttribute('position',new THREE.BufferAttribute(arr,3));
  const rain = new THREE.Points(rainGeo,new THREE.PointsMaterial({color:0xcad7dc,size:.03,transparent:true,opacity:.28}));scene.add(rain);

  const sampler=new FrameSampler();
  let metrics:ProofMetrics={renderer:'three',quality:state.quality,capture:state.capture,samples:0,avgFrameMs:null,p99FrameMs:null,avgCpuCallbackMs:null,drawCalls:null,triangles:null,gpuMs:null,textureMemoryBytes:null,shaderCompileNotes:[]};
  renderer.setAnimationLoop(()=>{const t0=performance.now();renderer.render(scene,camera);sampler.sample(performance.now()-t0);const info:any=(renderer as any).info;metrics=sampler.finish({renderer:'three',quality:state.quality,capture:state.capture,drawCalls:info?.render?.calls??null,triangles:info?.render?.triangles??null,gpuMs:null,textureMemoryBytes:null,shaderCompileNotes:[]});});
  exposeMetrics(()=>metrics);
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
}

function mat(color:number,metalness:number,roughness:number){return new THREE.MeshStandardMaterial({color,metalness,roughness});}
function meshBox(w:number,h:number,d:number,m:any){return new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);}
function craft(scene:THREE.Scene,name:string,pos:{x:number;y:number;z:number},hull:any,dark:any,accent:any,glow:any,shield:any,shieldOn:boolean){const root=new THREE.Group();root.name=name;root.position.set(pos.x,pos.y,pos.z);scene.add(root);const body=meshBox(4.2,.75,8.8,hull);root.add(body);const nose=meshBox(2.6,.55,4,hull);nose.position.z=5.4;nose.scale.z=.55;root.add(nose);for(const side of [-1,1]){const wing=meshBox(2.2,.24,5.7,dark);wing.position.set(side*2.9,-.08,.5);root.add(wing);const fin=meshBox(.25,.55,3,accent);fin.position.set(side*3.7,.15,-.3);root.add(fin);const jet=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,2.6,16),glow);jet.rotation.x=Math.PI/2;jet.position.set(side*1.25,0,-5.4);root.add(jet);}const canopy=new THREE.Mesh(new THREE.SphereGeometry(1.05,16,12),new THREE.MeshPhysicalMaterial({color:0x0b1d28,roughness:.08,metalness:.05,transparent:true,opacity:.35,transmission:.5,thickness:.25}));canopy.scale.set(1.15,.45,1.6);canopy.position.set(0,.65,.8);root.add(canopy);if(shieldOn){const s=new THREE.Mesh(new THREE.SphereGeometry(4.6,24,18),shield);s.scale.set(1.25,.42,1.25);root.add(s);}return root;}
