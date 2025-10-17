// engine/chem/kinetics.ts - Cinética química e equação de Arrhenius
import { Reaction, KineticData } from '../../types/chem';
import { PHYSICAL_CONSTANTS } from '../core/units';
import { DeterministicRNG } from '../core/rng';

export class KineticsEngine {
  private rng: DeterministicRNG;

  constructor(rng: DeterministicRNG) {
    this.rng = rng;
  }

  /**
   * Calcula a constante de velocidade usando a equação de Arrhenius
   * k = A * e^(-Ea/RT)
   */
  static calculateArrheniusRateConstant(
    temperature: number, // em Kelvin
    activationEnergy: number, // em kJ/mol
    preExponentialFactor: number = 1e12 // A em s⁻¹
  ): number {
    const T = temperature;
    const Ea = activationEnergy * 1000; // converter para J/mol
    const R = PHYSICAL_CONSTANTS.GAS_CONSTANT;
    
    return preExponentialFactor * Math.exp(-Ea / (R * T));
  }

  /**
   * Calcula o tempo de meia-vida para diferentes ordens de reação
   */
  static calculateHalfLife(
    rateConstant: number,
    initialConcentration: number,
    order: number
  ): number {
    switch (order) {
      case 0:
        // Ordem zero: t1/2 = [A]₀ / (2k)
        return initialConcentration / (2 * rateConstant);
      
      case 1:
        // Primeira ordem: t1/2 = ln(2) / k
        return Math.log(2) / rateConstant;
      
      case 2:
        // Segunda ordem: t1/2 = 1 / (k[A]₀)
        return 1 / (rateConstant * initialConcentration);
      
      default:
        throw new Error(`Ordem de reação ${order} não suportada`);
    }
  }

  /**
   * Calcula a concentração em função do tempo para diferentes ordens
   */
  static calculateConcentrationAtTime(
    initialConcentration: number,
    rateConstant: number,
    time: number,
    order: number
  ): number {
    switch (order) {
      case 0:
        // Ordem zero: [A] = [A]₀ - kt
        return Math.max(0, initialConcentration - rateConstant * time);
      
      case 1:
        // Primeira ordem: [A] = [A]₀ * e^(-kt)
        return initialConcentration * Math.exp(-rateConstant * time);
      
      case 2:
        // Segunda ordem: [A] = [A]₀ / (1 + k[A]₀t)
        return initialConcentration / (1 + rateConstant * initialConcentration * time);
      
      default:
        throw new Error(`Ordem de reação ${order} não suportada`);
    }
  }

  /**
   * Simula uma reação cinética em tempo real
   */
  simulateReaction(
    reaction: Reaction,
    initialConcentrations: Record<string, number>,
    temperature: number,
    timestep: number
  ): KineticData {
    const T = temperature + 273.15; // converter para Kelvin
    
    // Calcular constante de velocidade na temperatura atual
    const k = KineticsEngine.calculateArrheniusRateConstant(
      T,
      reaction.Ea_kJmol || 50, // kJ/mol padrão
      reaction.k || 1e-3 // s⁻¹ padrão
    );

    const order = typeof reaction.order === 'number' ? reaction.order : 1;
    const initialConcentration = initialConcentrations[reaction.reactants[0]?.formula] || 0.1;

    // Calcular tempo de meia-vida
    const halfLife = KineticsEngine.calculateHalfLife(k, initialConcentration, order);

    // Adicionar ruído realístico
    const noisyHalfLife = this.rng.measurementNoise(halfLife, 0.05);
    const noisyRateConstant = this.rng.measurementNoise(k, 0.02);

    return {
      reaction_id: reaction.id,
      temperature_C: temperature,
      rate_constant: noisyRateConstant,
      half_life_s: noisyHalfLife,
      order: order,
      activation_energy_kJmol: reaction.Ea_kJmol || 50
    };
  }

  /**
   * Calcula o efeito da temperatura na velocidade da reação
   */
  static calculateTemperatureEffect(
    rateConstant1: number,
    temperature1: number, // Kelvin
    temperature2: number, // Kelvin
    activationEnergy: number // kJ/mol
  ): number {
    const Ea = activationEnergy * 1000; // J/mol
    const R = PHYSICAL_CONSTANTS.GAS_CONSTANT;
    
    // k2/k1 = e^(Ea/R * (1/T1 - 1/T2))
    const ratio = Math.exp((Ea / R) * ((1 / temperature1) - (1 / temperature2)));
    
    return rateConstant1 * ratio;
  }

  /**
   * Calcula a energia de ativação a partir de dados de temperatura
   */
  static calculateActivationEnergy(
    rateConstants: number[],
    temperatures: number[] // Kelvin
  ): number {
    if (rateConstants.length !== temperatures.length || rateConstants.length < 2) {
      throw new Error('Pelo menos dois pontos são necessários');
    }

    // Usar regressão linear em ln(k) vs 1/T
    const n = rateConstants.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = 0; i < n; i++) {
      const x = 1 / temperatures[i]; // 1/T
      const y = Math.log(rateConstants[i]); // ln(k)
      
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }

    // Inclinação = -Ea/R
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const R = PHYSICAL_CONSTANTS.GAS_CONSTANT;
    
    return -slope * R / 1000; // converter para kJ/mol
  }

  /**
   * Simula o efeito de um catalisador
   */
  static calculateCatalystEffect(
    originalActivationEnergy: number,
    catalystReduction: number // redução percentual na energia de ativação
  ): number {
    return originalActivationEnergy * (1 - catalystReduction / 100);
  }

  /**
   * Calcula a velocidade da reação
   */
  static calculateReactionRate(
    rateConstant: number,
    concentrations: Record<string, number>,
    order: number | Record<string, number>
  ): number {
    if (typeof order === 'number') {
      // Ordem global
      const totalConcentration = Object.values(concentrations).reduce((sum, c) => sum + c, 0);
      return rateConstant * Math.pow(totalConcentration, order);
    } else {
      // Ordem por espécie
      let rate = rateConstant;
      for (const [species, concentration] of Object.entries(concentrations)) {
        const speciesOrder = order[species] || 0;
        rate *= Math.pow(concentration, speciesOrder);
      }
      return rate;
    }
  }

  /**
   * Simula a formação de produto ao longo do tempo
   */
  simulateProductFormation(
    reaction: Reaction,
    initialConcentrations: Record<string, number>,
    temperature: number,
    totalTime: number,
    timestep: number
  ): Array<{ time: number; concentration: number; rate: number }> {
    const data: Array<{ time: number; concentration: number; rate: number }> = [];
    const T = temperature + 273.15;
    
    const k = KineticsEngine.calculateArrheniusRateConstant(
      T,
      reaction.Ea_kJmol || 50,
      reaction.k || 1e-3
    );

    const order = typeof reaction.order === 'number' ? reaction.order : 1;
    const initialConcentration = initialConcentrations[reaction.reactants[0]?.formula] || 0.1;

    for (let time = 0; time <= totalTime; time += timestep) {
      const concentration = KineticsEngine.calculateConcentrationAtTime(
        initialConcentration,
        k,
        time,
        order
      );

      const rate = KineticsEngine.calculateReactionRate(
        k,
        { [reaction.reactants[0]?.formula || 'A']: concentration },
        order
      );

      data.push({
        time,
        concentration: this.rng.measurementNoise(concentration, 0.01),
        rate: this.rng.measurementNoise(rate, 0.02)
      });
    }

    return data;
  }
}
