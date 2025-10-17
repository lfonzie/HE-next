// engine/core/rng.ts - Gerador de números aleatórios determinístico
export class DeterministicRNG {
  private seed: number;
  private state: number;

  constructor(seed: number = 42) {
    this.seed = seed;
    this.state = seed;
  }

  // Mulberry32 PRNG - rápido e determinístico
  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Gera número aleatório entre min e max
  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  // Gera número inteiro aleatório entre min e max (inclusive)
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  // Gera valor com distribuição normal (Box-Muller)
  normal(mean: number = 0, stdDev: number = 1): number {
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + stdDev * z0;
  }

  // Gera valor com distribuição gaussiana para ruído de medição
  measurementNoise(trueValue: number, precision: number = 0.01): number {
    return trueValue + this.normal(0, precision * trueValue);
  }

  // Reseta o gerador para o seed original
  reset(): void {
    this.state = this.seed;
  }

  // Define novo seed
  setSeed(newSeed: number): void {
    this.seed = newSeed;
    this.state = newSeed;
  }

  // Retorna o seed atual
  getSeed(): number {
    return this.seed;
  }
}

// Instância global do RNG
export const globalRNG = new DeterministicRNG(42);
