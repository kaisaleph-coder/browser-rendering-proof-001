import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

const renderers=['babylon','playcanvas','three'];
const qualities=['q0','q1','q2'];
const captures=['chase','beauty','speed','shield','hud'];
const base=process.env.PROOF_URL || 'http://127.0.0.1:4173';
const launchServer=!process.env.PROOF_URL;
let server;

if(launchServer){server=spawn(process.platform==='win32'?'npm.cmd':'npm',['run','preview','--','--host','127.0.0.1'],{stdio:'inherit'});await waitFor(`${base}/`,30000);}
await mkdir('screenshots',{recursive:true});await mkdir('bench-results',{recursive:true});

const browser=await chromium.launch({headless:false});
const page=await browser.newPage({viewport:{width:2560,height:1440}});
const results=[];

for(const renderer of renderers){for(const quality of qualities){for(const capture of captures){
  const url=`${base}/?renderer=${renderer}&quality=${quality}&capture=${capture}`;
  console.log('RUN',url);
  await page.goto(url,{waitUntil:'networkidle',timeout:60000});
  await page.waitForFunction(()=>window.__PROOF_READY__===true,{timeout:30000});
  await page.waitForTimeout(8000);
  const metrics=await page.evaluate(()=>window.__PROOF_METRICS__?.() ?? null);
  const name=`${renderer}-${quality}-${capture}`;
  await page.screenshot({path:`screenshots/${name}.png`,fullPage:false});
  await writeFile(`bench-results/${name}.json`,JSON.stringify(metrics,null,2));
  results.push(metrics);
}}}

await writeFile('bench-results/all.json',JSON.stringify(results,null,2));
await browser.close();
if(server)server.kill('SIGTERM');

async function waitFor(url,timeout){const start=Date.now();while(Date.now()-start<timeout){try{const r=await fetch(url);if(r.ok)return;}catch{}await new Promise(r=>setTimeout(r,400));}throw new Error(`Timed out waiting for ${url}`);}
