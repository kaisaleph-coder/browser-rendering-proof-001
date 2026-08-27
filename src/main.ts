import './styles.css';
import { mountHud } from './shared/hud';
import { queryState } from './shared/spec';

const root = document.querySelector<HTMLElement>('#app')!;
const state = queryState();
mountHud(root);
const label = document.createElement('div');
label.className = 'proof-label';
label.textContent = `${state.renderer.toUpperCase()} · ${state.quality.toUpperCase()} · ${state.capture.toUpperCase()}`;
root.appendChild(label);

async function boot() {
  if (state.renderer === 'playcanvas') {
    const m = await import('./playcanvas/proof');
    return m.run(root, state);
  }
  if (state.renderer === 'three') {
    const m = await import('./three-webgpu/proof');
    return m.run(root, state);
  }
  const m = await import('./babylon/proof');
  return m.run(root, state);
}

boot().catch((err) => {
  console.error(err);
  root.innerHTML += `<div class="error"><div><strong>Renderer failed to initialize.</strong><br>${String(err?.stack || err)}</div></div>`;
});
