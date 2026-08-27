import { PROOF } from './spec';

export function mountHud(root: HTMLElement) {
  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML = `
    <div class="hud-top-left"><span>POSITION</span><strong>${PROOF.hud.position}</strong></div>
    <div class="hud-top-right"><span>LAP</span><strong>${PROOF.hud.lap}</strong></div>
    <div class="hud-speed"><span>SPEED</span><strong>${PROOF.hud.speed.toLocaleString()}</strong><em>KM/H</em></div>
    <div class="hud-bars">
      <label>ENERGY <b>${PROOF.hud.energy}%</b><i><u style="width:${PROOF.hud.energy}%"></u></i></label>
      <label>SHIELD <b>${PROOF.hud.shield}%</b><i><u style="width:${PROOF.hud.shield}%"></u></i></label>
    </div>`;
  root.appendChild(hud);
}
