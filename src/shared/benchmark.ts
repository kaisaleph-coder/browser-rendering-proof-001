export interface ProofMetrics {
  renderer: string;
  quality: string;
  capture: string;
  samples: number;
  avgFrameMs: number | null;
  p99FrameMs: number | null;
  avgCpuCallbackMs: number | null;
  drawCalls: number | null;
  triangles: number | null;
  gpuMs: number | null;
  textureMemoryBytes: number | null;
  shaderCompileNotes: string[];
}

export class FrameSampler {
  private frames: number[] = [];
  private cpu: number[] = [];
  private last = performance.now();

  sample(cpuCallbackMs = 0) {
    const now = performance.now();
    this.frames.push(now - this.last);
    this.cpu.push(cpuCallbackMs);
    this.last = now;
  }

  finish(meta: Omit<ProofMetrics, 'samples' | 'avgFrameMs' | 'p99FrameMs' | 'avgCpuCallbackMs'>): ProofMetrics {
    const frames = this.frames.slice().sort((a, b) => a - b);
    const avg = this.frames.length ? this.frames.reduce((a, b) => a + b, 0) / this.frames.length : null;
    const p99 = frames.length ? frames[Math.min(frames.length - 1, Math.floor(frames.length * 0.99))] : null;
    const avgCpu = this.cpu.length ? this.cpu.reduce((a, b) => a + b, 0) / this.cpu.length : null;
    return { ...meta, samples: this.frames.length, avgFrameMs: avg, p99FrameMs: p99, avgCpuCallbackMs: avgCpu };
  }
}

export function exposeMetrics(getMetrics: () => ProofMetrics) {
  (window as any).__PROOF_METRICS__ = getMetrics;
  (window as any).__PROOF_READY__ = true;
}
