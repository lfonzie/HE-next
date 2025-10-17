// engine/chem/acidbase.ts - Cálculos de ácido-base e pH
import { ChemicalSpecies, Solution, AcidBaseSystem, BufferSolution, Indicator } from '../../types/chem';
import { PHYSICAL_CONSTANTS } from '../core/units';
import { DeterministicRNG } from '../core/rng';

export class AcidBaseEngine {
  private rng: DeterministicRNG;

  constructor(rng: DeterministicRNG) {
    this.rng = rng;
  }

  /**
   * Calcula o pH de uma solução ácida forte
   */
  static calculateStrongAcidpH(concentration: number): number {
    // Para ácidos fortes: pH = -log[H+]
    const hPlusConcentration = concentration;
    return -Math.log10(hPlusConcentration);
  }

  /**
   * Calcula o pH de uma solução básica forte
   */
  static calculateStrongBasepH(concentration: number): number {
    // Para bases fortes: pOH = -log[OH-], pH = 14 - pOH
    const ohMinusConcentration = concentration;
    const pOH = -Math.log10(ohMinusConcentration);
    return 14 - pOH;
  }

  /**
   * Calcula o pH de um ácido fraco usando Ka
   */
  static calculateWeakAcidpH(concentration: number, Ka: number): number {
    // Para ácidos fracos: [H+] = sqrt(Ka * [HA])
    const hPlusConcentration = Math.sqrt(Ka * concentration);
    return -Math.log10(hPlusConcentration);
  }

  /**
   * Calcula o pH de uma base fraca usando Kb
   */
  static calculateWeakBasepH(concentration: number, Kb: number): number {
    // Para bases fracas: [OH-] = sqrt(Kb * [B])
    const ohMinusConcentration = Math.sqrt(Kb * concentration);
    const pOH = -Math.log10(ohMinusConcentration);
    return 14 - pOH;
  }

  /**
   * Calcula o pH de uma solução tampão usando Henderson-Hasselbalch
   */
  static calculateBufferpH(buffer: BufferSolution): number {
    const { weak_acid, conjugate_base, pH_target } = buffer;
    
    // pH = pKa + log([A-]/[HA])
    const acidConcentration = weak_acid.mol;
    const baseConcentration = conjugate_base.mol;
    
    // Assumindo pKa = 7 para simplificação
    const pKa = 7;
    const ratio = baseConcentration / acidConcentration;
    
    return pKa + Math.log10(ratio);
  }

  /**
   * Calcula o pH de uma solução após mistura
   */
  calculateMixedSolutionpH(solutions: Solution[]): number {
    let totalHPlus = 0;
    let totalOHMinus = 0;
    let totalVolume = 0;

    for (const solution of solutions) {
      const pH = this.calculateSolutionpH(solution);
      const hPlus = Math.pow(10, -pH);
      const ohMinus = Math.pow(10, -(14 - pH));
      
      totalHPlus += hPlus * solution.volume_mL;
      totalOHMinus += ohMinus * solution.volume_mL;
      totalVolume += solution.volume_mL;
    }

    const finalHPlus = totalHPlus / totalVolume;
    const finalOHMinus = totalOHMinus / totalVolume;

    // Determinar se a solução final é ácida ou básica
    if (finalHPlus > finalOHMinus) {
      return -Math.log10(finalHPlus);
    } else {
      const pOH = -Math.log10(finalOHMinus);
      return 14 - pOH;
    }
  }

  /**
   * Calcula o pH de uma solução individual
   */
  private calculateSolutionpH(solution: Solution): number {
    // Identificar espécies ácidas e básicas
    let acidConcentration = 0;
    let baseConcentration = 0;
    let strongAcidConcentration = 0;
    let strongBaseConcentration = 0;

    for (const species of solution.species) {
      const concentration = species.mol / (solution.volume_mL / 1000);
      
      // Ácidos fortes
      if (['HCl', 'HBr', 'HI', 'HNO3', 'H2SO4'].includes(species.formula)) {
        strongAcidConcentration += concentration;
      }
      // Bases fortes
      else if (['NaOH', 'KOH', 'Ca(OH)2', 'Ba(OH)2'].includes(species.formula)) {
        strongBaseConcentration += concentration;
      }
      // Ácidos fracos (simplificado)
      else if (species.formula.includes('H') && !species.formula.includes('OH')) {
        acidConcentration += concentration;
      }
      // Bases fracas (simplificado)
      else if (species.formula.includes('OH') || species.formula === 'NH3') {
        baseConcentration += concentration;
      }
    }

    // Calcular pH baseado no tipo dominante
    if (strongAcidConcentration > 0) {
      return AcidBaseEngine.calculateStrongAcidpH(strongAcidConcentration);
    } else if (strongBaseConcentration > 0) {
      return AcidBaseEngine.calculateStrongBasepH(strongBaseConcentration);
    } else if (acidConcentration > baseConcentration) {
      return AcidBaseEngine.calculateWeakAcidpH(acidConcentration, 1e-5); // Ka simplificado
    } else if (baseConcentration > acidConcentration) {
      return AcidBaseEngine.calculateWeakBasepH(baseConcentration, 1e-5); // Kb simplificado
    } else {
      return 7; // Neutro
    }
  }

  /**
   * Simula uma titulação ácido-base
   */
  simulateTitration(
    acidSolution: Solution,
    baseSolution: Solution,
    volumeAdded: number
  ): {
    pH: number;
    equivalencePoint: boolean;
    indicatorColor: string;
  } {
    // Calcular concentrações
    const acidConcentration = acidSolution.species.reduce((sum, s) => sum + s.mol, 0) / (acidSolution.volume_mL / 1000);
    const baseConcentration = baseSolution.species.reduce((sum, s) => sum + s.mol, 0) / (baseSolution.volume_mL / 1000);

    // Calcular pH após adição
    const totalVolume = acidSolution.volume_mL + volumeAdded;
    const molesAcid = acidConcentration * (acidSolution.volume_mL / 1000);
    const molesBase = baseConcentration * (volumeAdded / 1000);

    let pH: number;
    let equivalencePoint = false;

    if (molesAcid > molesBase) {
      // Ainda há ácido em excesso
      const excessAcid = molesAcid - molesBase;
      pH = AcidBaseEngine.calculateStrongAcidpH(excessAcid / (totalVolume / 1000));
    } else if (molesBase > molesAcid) {
      // Base em excesso
      const excessBase = molesBase - molesAcid;
      pH = AcidBaseEngine.calculateStrongBasepH(excessBase / (totalVolume / 1000));
    } else {
      // Ponto de equivalência
      pH = 7;
      equivalencePoint = true;
    }

    // Determinar cor do indicador
    const indicatorColor = this.getIndicatorColor(pH);

    return {
      pH: this.rng.measurementNoise(pH, 0.01), // Adicionar ruído de medição
      equivalencePoint,
      indicatorColor
    };
  }

  /**
   * Determina a cor do indicador baseada no pH
   */
  private getIndicatorColor(pH: number): string {
    // Fenolftaleína: incolor < 8.3, rosa > 8.3
    if (pH < 8.3) return 'incolor';
    if (pH > 10) return 'rosa intenso';
    return 'rosa claro';

    // Outros indicadores podem ser implementados aqui
  }

  /**
   * Calcula a capacidade tamponante
   */
  static calculateBufferCapacity(buffer: BufferSolution): number {
    const { weak_acid, conjugate_base } = buffer;
    const totalConcentration = weak_acid.mol + conjugate_base.mol;
    return totalConcentration * 0.1; // Capacidade simplificada
  }

  /**
   * Verifica se uma solução é tampão
   */
  static isBufferSolution(solution: Solution): boolean {
    let weakAcid = false;
    let conjugateBase = false;

    for (const species of solution.species) {
      // Verificação simplificada
      if (species.formula.includes('H') && !species.formula.includes('OH')) {
        weakAcid = true;
      }
      if (species.formula.includes('Na') || species.formula.includes('K')) {
        conjugateBase = true;
      }
    }

    return weakAcid && conjugateBase;
  }
}
