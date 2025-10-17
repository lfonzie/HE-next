// engine/chem/stoichiometry.ts - Cálculos estequiométricos
import { ChemicalSpecies, Reaction, Solution } from '../../types/chem';
import { PHYSICAL_CONSTANTS } from '../core/units';

export class StoichiometryEngine {
  /**
   * Calcula a quantidade de produto formado baseada no reagente limitante
   */
  static calculateLimitingReagent(
    reaction: Reaction,
    reactants: ChemicalSpecies[]
  ): {
    limitingReagent: string;
    theoreticalYield: number;
    actualYield: number;
    percentYield: number;
  } {
    const stoichiometry = reaction.stoichiometry;
    let limitingReagent = '';
    let minMoles = Infinity;

    // Encontrar o reagente limitante
    for (const reactant of reactants) {
      const requiredMoles = stoichiometry[reactant.formula] || 0;
      if (requiredMoles > 0) {
        const availableMoles = reactant.mol;
        const possibleMoles = availableMoles / requiredMoles;
        
        if (possibleMoles < minMoles) {
          minMoles = possibleMoles;
          limitingReagent = reactant.formula;
        }
      }
    }

    // Calcular rendimento teórico
    const theoreticalYield = minMoles * (reaction.yield_realistic || 1.0);
    
    // Calcular rendimento real (simulado com pequena variação)
    const actualYield = theoreticalYield * (reaction.yield_realistic || 0.95);
    
    const percentYield = (actualYield / theoreticalYield) * 100;

    return {
      limitingReagent,
      theoreticalYield,
      actualYield,
      percentYield
    };
  }

  /**
   * Balanceia uma equação química simples
   */
  static balanceEquation(equation: string): string {
    // Implementação simplificada - em produção seria mais robusta
    const parts = equation.split('->');
    if (parts.length !== 2) {
      throw new Error('Equação deve conter exatamente um ->');
    }

    const reactants = parts[0].trim().split('+').map(r => r.trim());
    const products = parts[1].trim().split('+').map(p => p.trim());

    // Para equações simples como HCl + NaOH -> NaCl + H2O
    // Assumimos que já estão balanceadas
    return equation;
  }

  /**
   * Calcula a concentração molar de uma solução
   */
  static calculateMolarity(solution: Solution): number {
    const totalMoles = solution.species.reduce((sum, species) => sum + species.mol, 0);
    const volumeL = solution.volume_mL / 1000;
    return totalMoles / volumeL;
  }

  /**
   * Calcula a diluição usando M1V1 = M2V2
   */
  static calculateDilution(
    initialMolarity: number,
    initialVolume: number,
    finalVolume: number
  ): number {
    return (initialMolarity * initialVolume) / finalVolume;
  }

  /**
   * Calcula a massa molar de um composto (simplificado)
   */
  static calculateMolarMass(formula: string): number {
    // Tabela simplificada de massas molares (g/mol)
    const atomicMasses: Record<string, number> = {
      'H': 1.008,
      'C': 12.011,
      'N': 14.007,
      'O': 15.999,
      'Na': 22.990,
      'Mg': 24.305,
      'Al': 26.982,
      'Si': 28.085,
      'P': 30.974,
      'S': 32.065,
      'Cl': 35.453,
      'K': 39.098,
      'Ca': 40.078,
      'Fe': 55.845,
      'Cu': 63.546,
      'Zn': 65.38,
      'Ag': 107.868,
      'I': 126.904,
      'Ba': 137.327,
      'Pb': 207.2
    };

    let molarMass = 0;
    let i = 0;
    
    while (i < formula.length) {
      let element = '';
      let count = 1;
      
      // Extrair símbolo do elemento
      if (i + 1 < formula.length && /[a-z]/.test(formula[i + 1])) {
        element = formula[i] + formula[i + 1];
        i += 2;
      } else {
        element = formula[i];
        i += 1;
      }
      
      // Extrair número (se houver)
      let numStr = '';
      while (i < formula.length && /\d/.test(formula[i])) {
        numStr += formula[i];
        i++;
      }
      
      if (numStr) {
        count = parseInt(numStr);
      }
      
      const atomicMass = atomicMasses[element];
      if (atomicMass) {
        molarMass += atomicMass * count;
      } else {
        console.warn(`Massa atômica não encontrada para ${element}`);
      }
    }
    
    return molarMass;
  }

  /**
   * Converte massa para mols
   */
  static massToMoles(mass: number, formula: string): number {
    const molarMass = this.calculateMolarMass(formula);
    return mass / molarMass;
  }

  /**
   * Converte mols para massa
   */
  static molesToMass(moles: number, formula: string): number {
    const molarMass = this.calculateMolarMass(formula);
    return moles * molarMass;
  }

  /**
   * Calcula a densidade de uma solução
   */
  static calculateDensity(solution: Solution): number {
    const totalMass = solution.species.reduce((sum, species) => {
      const molarMass = this.calculateMolarMass(species.formula);
      return sum + (species.mol * molarMass);
    }, 0);
    
    const volumeL = solution.volume_mL / 1000;
    return totalMass / volumeL; // g/L
  }
}
