import * as pcNS from 'playcanvas';
import { CAPTURES, PROOF, QUALITY, type CaptureId, type QualityId, type RendererId } from '../shared/spec';
import { FrameSampler, exposeMetrics, type ProofMetrics } from '../shared/benchmark';

export async function run(root: HTMLElement, state: { renderer: RendererId; quality: QualityId; capture: CaptureId }) {
  const pc:any = pcNS as any;
  const canvas=document.createElement('canvas');root.prepend(canvas);
  const q=QUALITY[state.quality];
  canvas.width=Math.floor(innerWidth*devicePixelRatio*q.internalScale);canvas.height=Math.floor(innerHeight*devicePixelRatio*q.internalScale);

  let app:any;
  if (pc.createGraphicsDevice && pc.AppBase) {
    const opts:any={deviceTypes:[pc.DEVICETYPE_WEBGPU ?? 'webgpu',pc.DEVICETYPE_WEBGL2 ?? 'webgl2'],antialias:true};
    const device=await pc.createGraphicsDevice(canvas,opts);
    app=new pc.AppBase(canvas);
    const createOptions=new pc.AppOptions();
    createOptions.graphicsDevice=device;
    createOptions.componentSystems=[pc.RenderComponentSystem,pc.CameraComponentSystem,pc.LightComponentSystem];
    createOptions.resourceHandlers=[];
    app.init(createOptions);
    app.start();
  } else {
    app=new pc.Application(canvas,{graphicsDeviceOptions:{deviceTypes:['webgpu','webgl2'],antialias:true}});
    app.start();
  }

  app.scene.ambientLight=new pc.Color(.19,.23,.25);
  if ('fog' in app.scene) {app.scene.fog='exp2';app.scene.fogColor=new pc.Color(.09,.11,.12);app.scene.fogDensity=.006;}

  const camera=new pc.Entity('camera');camera.addComponent('camera',{clearColor:new pc.Color(.018,.022,.027),fov:CAPTURES[state.capture].fov,nearClip:.05,farClip:1200});app.root.addChild(camera);camera.setPosition(...CAPTURES[state.capture].position);camera.lookAt(...CAPTURES[state.capture].target);
  const sun=new pc.Entity('sun');sun.addComponent('light',{type:'directional',color:new pc.Color(1,.95,.84),intensity:3.6,castShadows:true,shadowResolution:q.shadowSize});sun.setEulerAngles(55,-35,18);app.root.addChild(sun);

  const trackMat=std(pc,new pc.Color(.12,.13,.14),.76,.1);
  const wetMat=std(pc,new pc.Color(.08,.09,.10),.18,.42);
  const barrierMat=std(pc,new pc.Color(.16,.17,.18),.32,.65);
  const hullMat=std(pc,new pc.Color(.68,.70,.70),.24,.78);
  const darkMat=std(pc,new pc.Color(.035,.045,.055),.22,.58);
  const accentMat=std(pc,new pc.Color(.94,.58,.03),.3,.45);
  const glowMat=std(pc,new pc.Color(.05,.18,.28),.2,.2);glowMat.emissive=new pc.Color(.15,.62,1);glowMat.emissiveIntensity=8;glowMat.update();
  const shieldMat=std(pc,new pc.Color(.03,.27,.55),.1,.1);shieldMat.opacity=.14;shieldMat.blendType=pc.BLEND_ADDITIVE;shieldMat.depthWrite=false;shieldMat.update();

  box(pc,app,'track',[0,0,PROOF.segmentLengthM*.5],[PROOF.trackWidthM,.55,PROOF.segmentLengthM],trackMat,[0,0,-24]);
  box(pc,app,'wet',[0,.32,105],[PROOF.trackWidthM*.98,.03,PROOF.wetZoneLengthM],wetMat,[0,0,-24]);
  for(let z=0;z<PROOF.segmentLengthM;z+=14)for(const x of [-PROOF.trackWidthM*.58,PROOF.trackWidthM*.58])box(pc,app,`b${x}-${z}`,[x,.72,z],[.3,1.2,9],barrierMat);
  box(pc,app,'landmark',[-38,PROOF.landmarkHeightM/2,135],[18,PROOF.landmarkHeightM,18],darkMat);
  for(let i=0;i<q.skylineBlocks;i++){const h=10+(i%11)*3.2;box(pc,app,`sky${i}`,[(i%2?1:-1)*(28+(i%13)*7),h/2-2,50+(i*17)%360],[5+(i%4)*2,h,5+(i%3)*3],darkMat);}

  craft(pc,app,'hero',PROOF.hero,hullMat,darkMat,accentMat,glowMat,shieldMat,state.capture==='shield');
  craft(pc,app,'op1',PROOF.opponents[0],std(pc,new pc.Color(.34,.06,.04),.3,.62),darkMat,accentMat,glowMat,shieldMat,false);
  craft(pc,app,'op2',PROOF.opponents[1],std(pc,new pc.Color(.05,.23,.14),.35,.45),darkMat,accentMat,glowMat,shieldMat,false);

  const sampler=new FrameSampler();
  let metrics:ProofMetrics={renderer:'playcanvas',quality:state.quality,capture:state.capture,samples:0,avgFrameMs:null,p99FrameMs:null,avgCpuCallbackMs:null,drawCalls:null,triangles:null,gpuMs:null,textureMemoryBytes:null,shaderCompileNotes:[]};
  app.on('update',()=>{const t0=performance.now();sampler.sample(performance.now()-t0);const stats:any=app.stats;metrics=sampler.finish({renderer:'playcanvas',quality:state.quality,capture:state.capture,drawCalls:stats?.drawCalls?.total??null,triangles:stats?.frame?.triangles??null,gpuMs:null,textureMemoryBytes:null,shaderCompileNotes:[]});});
  exposeMetrics(()=>metrics);
  addEventListener('resize',()=>app.resizeCanvas?.(innerWidth,innerHeight));
}

function std(pc:any,color:any,roughness:number,metalness:number){const m=new pc.StandardMaterial();m.diffuse=color;m.roughness=roughness;m.metalness=metalness;m.useMetalness=true;m.update();return m;}
function box(pc:any,app:any,name:string,pos:number[],scale:number[],mat:any,euler:number[]=[0,0,0]){const e=new pc.Entity(name);e.addComponent('render',{type:'box',material:mat});e.setPosition(...pos);e.setLocalScale(...scale);e.setEulerAngles(...euler);app.root.addChild(e);return e;}
function craft(pc:any,app:any,name:string,pos:{x:number;y:number;z:number},hull:any,dark:any,accent:any,glow:any,shield:any,shieldOn:boolean){const root=new pc.Entity(name);root.setPosition(pos.x,pos.y,pos.z);app.root.addChild(root);const add=(n:string,p:number[],s:number[],m:any)=>{const e=new pc.Entity(`${name}-${n}`);e.addComponent('render',{type:'box',material:m});e.setLocalPosition(...p);e.setLocalScale(...s);root.addChild(e);return e;};add('body',[0,0,0],[4.2,.75,8.8],hull);add('nose',[0,0,5.4],[2.6,.55,2.2],hull);for(const side of [-1,1]){add(`wing${side}`,[side*2.9,-.08,.5],[2.2,.24,5.7],dark);add(`fin${side}`,[side*3.7,.15,-.3],[.25,.55,3],accent);add(`jet${side}`,[side*1.25,0,-5.4],[.7,.7,2.6],glow);}const canopy=new pc.Entity(`${name}-canopy`);canopy.addComponent('render',{type:'sphere',material:std(pc,new pc.Color(.05,.08,.1),.08,.05)});canopy.render.material.opacity=.35;canopy.render.material.blendType=pc.BLEND_NORMAL;canopy.render.material.update();canopy.setLocalPosition(0,.65,.8);canopy.setLocalScale(2.4,.9,3.4);root.addChild(canopy);if(shieldOn){const s=new pc.Entity(`${name}-shield`);s.addComponent('render',{type:'sphere',material:shield});s.setLocalScale(11.5,3.9,11.5);root.addChild(s);}return root;}
