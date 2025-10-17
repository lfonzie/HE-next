// engine/chem/solubility.ts - Produto de solubilidade e precipitação
import { ChemicalSpecies, Solution, SolubilityProduct } from '../../types/chem';
import { DeterministicRNG } from '../core/rng';

export class SolubilityEngine {
  private rng: DeterministicRNG;

  constructor(rng: DeterministicRNG) {
    this.rng = rng;
  }

  /**
   * Calcula o produto iônico (Q) de uma solução
   */
  static calculateIonicProduct(
    solution: Solution,
    compound: string
  ): number {
    // Tabela de produtos de solubilidade (Ksp)
    const kspTable: Record<string, SolubilityProduct> = {
      'AgCl': {
        compound: 'AgCl',
        Ksp: 1.8e-10,
        solubility_molL: 1.3e-5,
        ions: ['Ag+', 'Cl-']
      },
      'AgBr': {
        compound: 'AgBr',
        Ksp: 5.0e-13,
        solubility_molL: 7.1e-7,
        ions: ['Ag+', 'Br-']
      },
      'AgI': {
        compound: 'AgI',
        Ksp: 8.3e-17,
        solubility_molL: 9.1e-9,
        ions: ['Ag+', 'I-']
      },
      'CaCO3': {
        compound: 'CaCO3',
        Ksp: 3.4e-9,
        solubility_molL: 5.8e-5,
        ions: ['Ca2+', 'CO3^2-']
      },
      'BaSO4': {
        compound: 'BaSO4',
        Ksp: 1.1e-10,
        solubility_molL: 1.0e-5,
        ions: ['Ba2+', 'SO4^2-']
      },
      'PbCl2': {
        compound: 'PbCl2',
        Ksp: 1.7e-5,
        solubility_molL: 1.6e-2,
        ions: ['Pb2+', 'Cl-']
      },
      'Mg(OH)2': {
        compound: 'Mg(OH)2',
        Ksp: 5.6e-12,
        solubility_molL: 1.1e-4,
        ions: ['Mg2+', 'OH-']
      }
    };

    const solubilityData = kspTable[compound];
    if (!solubilityData) {
      throw new Error(`Produto de solubilidade não encontrado para ${compound}`);
    }

    const volumeL = solution.volume_mL / 1000;
    let ionicProduct = 1;

    for (const ion of solubilityData.ions) {
      const species = solution.species.find(s => s.formula === ion);
      if (species) {
        const concentration = species.mol / volumeL;
        ionicProduct *= concentration;
      } else {
        ionicProduct *= 0; // Íon não presente
      }
    }

    return ionicProduct;
  }

  /**
   * Determina se ocorrerá precipitação
   */
  static willPrecipitate(
    solution: Solution,
    compound: string
  ): boolean {
    const ionicProduct = this.calculateIonicProduct(solution, compound);
    
    // Tabela de Ksp (simplificada)
    const kspValues: Record<string, number> = {
      'AgCl': 1.8e-10,
      'AgBr': 5.0e-13,
      'AgI': 8.3e-17,
      'CaCO3': 3.4e-9,
      'BaSO4': 1.1e-10,
      'PbCl2': 1.7e-5,
      'Mg(OH)2': 5.6e-12
    };

    const Ksp = kspValues[compound];
    if (!Ksp) {
      throw new Error(`Ksp não encontrado para ${compound}`);
    }

    return ionicProduct > Ksp;
  }

  /**
   * Calcula a solubilidade molar de um composto
   */
  static calculateMolarSolubility(
    compound: string,
    temperature: number = 25
  ): number {
    const kspValues: Record<string, number> = {
      'AgCl': 1.8e-10,
      'AgBr': 5.0e-13,
      'AgI': 8.3e-17,
      'CaCO3': 3.4e-9,
      'BaSO4': 1.1e-10,
      'PbCl2': 1.7e-5,
      'Mg(OH)2': 5.6e-12
    };

    const Ksp = kspValues[compound];
    if (!Ksp) {
      throw new Error(`Ksp não encontrado para ${compound}`);
    }

    // Para compostos do tipo AB (1:1)
    if (['AgCl', 'AgBr', 'AgI', 'CaCO3', 'BaSO4'].includes(compound)) {
      return Math.sqrt(Ksp);
    }
    
    // Para compostos do tipo AB2 (1:2)
    if (['PbCl2'].includes(compound)) {
      return Math.cbrt(Ksp / 4);
    }
    
    // Para compostos do tipo AB2 (1:2) - hidróxidos
    if (['Mg(OH)2'].includes(compound)) {
      return Math.cbrt(Ksp / 4);
    }

    throw new Error(`Fórmula de solubilidade não implementada para ${compound}`);
  }

  /**
   * Simula a adição de um reagente e verifica precipitação
   */
  simulatePrecipitation(
    solution: Solution,
    addedReagent: ChemicalSpecies,
    compound: string
  ): {
    willPrecipitate: boolean;
    precipitateAmount: number;
    finalConcentrations: Record<string, number>;
  } {
    // Criar nova solução com o reagente adicionado
    const newSolution: Solution = {
      ...solution,
      species: [...solution.species, addedReagent]
    };

    const willPrecipitate = SolubilityEngine.willPrecipitate(newSolution, compound);
    let precipitateAmount = 0;
    const finalConcentrations: Record<string, number> = {};

    if (willPrecipitate) {
      // Calcular quanto precipitará
      const volumeL = solution.volume_mL / 1000;
      const solubility = SolubilityEngine.calculateMolarSolubility(compound);
      
      // Simplificação: assumir que precipita até atingir a solubilidade
      precipitateAmount = Math.max(0, addedReagent.mol - solubility * volumeL);
      
      // Ajustar concentrações finais
      for (const species of newSolution.species) {
        const concentration = species.mol / volumeL;
        finalConcentrations[species.formula] = Math.max(0, concentration - precipitateAmount / volumeL);
      }
    } else {
      // Sem precipitação, concentrações inalteradas
      const volumeL = solution.volume_mL / 1000;
      for (const species of newSolution.species) {
        finalConcentrations[species.formula] = species.mol / volumeL;
      }
    }

    return {
      willPrecipitate,
      precipitateAmount: this.rng.measurementNoise(precipitateAmount, 0.05),
      finalConcentrations
    };
  }

  /**
   * Calcula o efeito do íon comum na solubilidade
   */
  static calculateCommonIonEffect(
    compound: string,
    commonIonConcentration: number
  ): number {
    const kspValues: Record<string, number> = {
      'AgCl': 1.8e-10,
      'AgBr': 5.0e-13,
      'AgI': 8.3e-17,
      'CaCO3': 3.4e-9,
      'BaSO4': 1.1e-10,
      'PbCl2': 1.7e-5,
      'Mg(OH)2': 5.6e-12
    };

    const Ksp = kspValues[compound];
    if (!Ksp) {
      throw new Error(`Ksp não encontrado para ${compound}`);
    }

    // Para compostos AB com íon comum
    if (['AgCl', 'AgBr', 'AgI', 'CaCO3', 'BaSO4'].includes(compound)) {
      return Ksp / commonIonConcentration;
    }

    throw new Error(`Efeito do íon comum não implementado para ${compound}`);
  }

  /**
   * Calcula a solubilidade em diferentes temperaturas
   */
  static calculateTemperatureEffect(
    compound: string,
    temperature1: number,
    temperature2: number,
    solubility1: number
  ): number {
    // Simplificação: assumir que a solubilidade aumenta com a temperatura
    // Em casos reais, isso varia por composto
    const temperatureFactor = Math.exp(0.01 * (temperature2 - temperature1));
    return solubility1 * temperatureFactor;
  }

  /**
   * Simula a formação de cristais
   */
  simulateCrystalFormation(
    solution: Solution,
    compound: string,
    coolingRate: number = 1 // °C/min
  ): {
    crystalSize: number;
    crystalCount: number;
    formationTime: number;
  } {
    const solubility = SolubilityEngine.calculateMolarSolubility(compound);
    const currentConcentration = SolubilityEngine.calculateIonicProduct(solution, compound);
    
    if (currentConcentration <= solubility) {
      return {
        crystalSize: 0,
        crystalCount: 0,
        formationTime: 0
      };
    }

    // Simular formação de cristais baseada na supersaturação
    const supersaturation = currentConcentration / solubility;
    const crystalSize = this.rng.range(0.1, 2.0) * supersaturation; // mm
    const crystalCount = this.rng.int(10, 100) * supersaturation;
    const formationTime = this.rng.range(5, 30); // minutos

    return {
      crystalSize: this.rng.measurementNoise(crystalSize, 0.1),
      crystalCount: Math.round(crystalCount),
      formationTime: this.rng.measurementNoise(formationTime, 0.5)
    };
  }
}
