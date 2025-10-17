// engine/chem/thermodynamics.ts - Motor de cálculo termodinâmico
export interface ThermodynamicData {
  formula: string;
  name: string;
  molarMass: number; // g/mol
  density?: number; // g/mL
  specificHeat: number; // J/(g·K)
  enthalpyFormation: number; // kJ/mol
  entropyFormation: number; // J/(mol·K)
  gibbsFormation: number; // kJ/mol
  heatCapacity: number; // J/(mol·K)
}

export interface ReactionThermodynamics {
  equation: string;
  enthalpyChange: number; // kJ/mol
  entropyChange: number; // J/(mol·K)
  gibbsChange: number; // kJ/mol
  equilibriumConstant: number;
  temperature: number; // K
}

export class ThermodynamicsEngine {
  private static thermodynamicDatabase: Map<string, ThermodynamicData> = new Map([
    // Água
    ['H2O', {
      formula: 'H2O',
      name: 'Água',
      molarMass: 18.015,
      density: 1.0,
      specificHeat: 4.184,
      enthalpyFormation: -285.8,
      entropyFormation: 69.9,
      gibbsFormation: -237.1,
      heatCapacity: 75.3
    }],
    
    // Ácidos
    ['HCl', {
      formula: 'HCl',
      name: 'Ácido clorídrico',
      molarMass: 36.46,
      density: 1.18,
      specificHeat: 3.47,
      enthalpyFormation: -92.3,
      entropyFormation: 186.8,
      gibbsFormation: -95.3,
      heatCapacity: 29.1
    }],
    
    ['H2SO4', {
      formula: 'H2SO4',
      name: 'Ácido sulfúrico',
      molarMass: 98.08,
      density: 1.84,
      specificHeat: 1.38,
      enthalpyFormation: -814.0,
      entropyFormation: 156.9,
      gibbsFormation: -690.0,
      heatCapacity: 138.1
    }],
    
    // Bases
    ['NaOH', {
      formula: 'NaOH',
      name: 'Hidróxido de sódio',
      molarMass: 40.00,
      density: 2.13,
      specificHeat: 1.45,
      enthalpyFormation: -425.6,
      entropyFormation: 64.4,
      gibbsFormation: -379.5,
      heatCapacity: 59.5
    }],
    
    ['KOH', {
      formula: 'KOH',
      name: 'Hidróxido de potássio',
      molarMass: 56.11,
      density: 2.04,
      specificHeat: 1.18,
      enthalpyFormation: -424.6,
      entropyFormation: 78.9,
      gibbsFormation: -380.7,
      heatCapacity: 64.9
    }],
    
    // Sais
    ['NaCl', {
      formula: 'NaCl',
      name: 'Cloreto de sódio',
      molarMass: 58.44,
      density: 2.16,
      specificHeat: 0.85,
      enthalpyFormation: -411.2,
      entropyFormation: 72.1,
      gibbsFormation: -384.1,
      heatCapacity: 50.5
    }],
    
    ['KCl', {
      formula: 'KCl',
      name: 'Cloreto de potássio',
      molarMass: 74.55,
      density: 1.98,
      specificHeat: 0.69,
      enthalpyFormation: -436.7,
      entropyFormation: 82.6,
      gibbsFormation: -409.1,
      heatCapacity: 51.3
    }]
  ]);

  /**
   * Calcula a entalpia de uma reação química
   */
  static calculateReactionEnthalpy(equation: string, temperature: number = 298.15): number {
    // Parse da equação química (simplificado)
    const reactants = this.parseEquation(equation).reactants;
    const products = this.parseEquation(equation).products;
    
    let enthalpyChange = 0;
    
    // Soma das entalpias de formação dos produtos
    products.forEach(product => {
      const data = this.thermodynamicDatabase.get(product.formula);
      if (data) {
        enthalpyChange += product.coefficient * data.enthalpyFormation;
      }
    });
    
    // Subtrai a soma das entalpias de formação dos reagentes
    reactants.forEach(reactant => {
      const data = this.thermodynamicDatabase.get(reactant.formula);
      if (data) {
        enthalpyChange -= reactant.coefficient * data.enthalpyFormation;
      }
    });
    
    return enthalpyChange;
  }

  /**
   * Calcula a entropia de uma reação química
   */
  static calculateReactionEntropy(equation: string, temperature: number = 298.15): number {
    const reactants = this.parseEquation(equation).reactants;
    const products = this.parseEquation(equation).products;
    
    let entropyChange = 0;
    
    products.forEach(product => {
      const data = this.thermodynamicDatabase.get(product.formula);
      if (data) {
        entropyChange += product.coefficient * data.entropyFormation;
      }
    });
    
    reactants.forEach(reactant => {
      const data = this.thermodynamicDatabase.get(reactant.formula);
      if (data) {
        entropyChange -= reactant.coefficient * data.entropyFormation;
      }
    });
    
    return entropyChange;
  }

  /**
   * Calcula a energia livre de Gibbs de uma reação
   */
  static calculateGibbsFreeEnergy(equation: string, temperature: number = 298.15): number {
    const enthalpy = this.calculateReactionEnthalpy(equation, temperature);
    const entropy = this.calculateReactionEntropy(equation, temperature);
    
    // ΔG = ΔH - TΔS
    return enthalpy - (temperature * entropy / 1000); // Convert J to kJ
  }

  /**
   * Calcula a constante de equilíbrio usando a energia livre de Gibbs
   */
  static calculateEquilibriumConstant(equation: string, temperature: number = 298.15): number {
    const gibbs = this.calculateGibbsFreeEnergy(equation, temperature);
    
    // K = e^(-ΔG/RT)
    const R = 8.314; // J/(mol·K)
    const exponent = -gibbs * 1000 / (R * temperature); // Convert kJ to J
    
    return Math.exp(exponent);
  }

  /**
   * Calcula o calor de reação (Q = n × ΔH)
   */
  static calculateHeatOfReaction(equation: string, moles: number, temperature: number = 298.15): number {
    const enthalpy = this.calculateReactionEnthalpy(equation, temperature);
    return moles * enthalpy;
  }

  /**
   * Calcula a variação de temperatura em uma reação
   */
  static calculateTemperatureChange(
    equation: string,
    moles: number,
    totalMass: number,
    specificHeat: number = 4.184,
    temperature: number = 298.15
  ): number {
    const heat = this.calculateHeatOfReaction(equation, moles, temperature);
    
    // Q = m × c × ΔT
    // ΔT = Q / (m × c)
    return heat / (totalMass * specificHeat);
  }

  /**
   * Calcula a capacidade calorífica de uma solução
   */
  static calculateSolutionHeatCapacity(components: Array<{
    formula: string;
    moles: number;
    mass: number;
  }>): number {
    let totalHeatCapacity = 0;
    let totalMass = 0;
    
    components.forEach(component => {
      const data = this.thermodynamicDatabase.get(component.formula);
      if (data) {
        totalHeatCapacity += component.mass * data.specificHeat;
        totalMass += component.mass;
      }
    });
    
    return totalMass > 0 ? totalHeatCapacity / totalMass : 4.184; // Default to water
  }

  /**
   * Verifica se uma reação é exotérmica ou endotérmica
   */
  static isExothermic(equation: string, temperature: number = 298.15): boolean {
    const enthalpy = this.calculateReactionEnthalpy(equation, temperature);
    return enthalpy < 0;
  }

  /**
   * Calcula a eficiência energética de uma reação
   */
  static calculateEnergyEfficiency(equation: string, actualYield: number, theoreticalYield: number): number {
    const enthalpy = this.calculateReactionEnthalpy(equation);
    const efficiency = (actualYield / theoreticalYield) * 100;
    
    // A eficiência energética é afetada pelo rendimento
    return efficiency;
  }

  /**
   * Parse simplificado de equação química
   */
  private static parseEquation(equation: string): {
    reactants: Array<{ formula: string; coefficient: number }>;
    products: Array<{ formula: string; coefficient: number }>;
  } {
    const [reactantsStr, productsStr] = equation.split('->').map(s => s.trim());
    
    const reactants = this.parseSide(reactantsStr);
    const products = this.parseSide(productsStr);
    
    return { reactants, products };
  }

  private static parseSide(side: string): Array<{ formula: string; coefficient: number }> {
    const compounds = side.split('+').map(s => s.trim());
    
    return compounds.map(compound => {
      const match = compound.match(/^(\d*)(.+)$/);
      if (match) {
        const coefficient = match[1] ? parseInt(match[1]) : 1;
        const formula = match[2];
        return { formula, coefficient };
      }
      return { formula: compound, coefficient: 1 };
    });
  }

  /**
   * Obtém dados termodinâmicos de uma substância
   */
  static getThermodynamicData(formula: string): ThermodynamicData | undefined {
    return this.thermodynamicDatabase.get(formula);
  }

  /**
   * Adiciona dados termodinâmicos de uma nova substância
   */
  static addThermodynamicData(data: ThermodynamicData): void {
    this.thermodynamicDatabase.set(data.formula, data);
  }

  /**
   * Lista todas as substâncias disponíveis
   */
  static getAllSubstances(): ThermodynamicData[] {
    return Array.from(this.thermodynamicDatabase.values());
  }

  /**
   * Calcula propriedades de uma solução
   */
  static calculateSolutionProperties(components: Array<{
    formula: string;
    moles: number;
    volume: number; // mL
  }>): {
    totalMoles: number;
    totalVolume: number;
    molarity: number;
    molality: number;
    density: number;
    specificHeat: number;
    heatCapacity: number;
  } {
    let totalMoles = 0;
    let totalMass = 0;
    let totalHeatCapacity = 0;
    
    components.forEach(component => {
      totalMoles += component.moles;
      
      const data = this.thermodynamicDatabase.get(component.formula);
      if (data) {
        const mass = component.moles * data.molarMass;
        totalMass += mass;
        totalHeatCapacity += mass * data.specificHeat;
      }
    });
    
    const totalVolume = components.reduce((sum, c) => sum + c.volume, 0);
    const molarity = totalMoles / (totalVolume / 1000); // Convert mL to L
    const molality = totalMoles / (totalMass / 1000); // Convert g to kg
    const density = totalMass / totalVolume;
    const specificHeat = totalMass > 0 ? totalHeatCapacity / totalMass : 4.184;
    const heatCapacity = totalHeatCapacity;
    
    return {
      totalMoles,
      totalVolume,
      molarity,
      molality,
      density,
      specificHeat,
      heatCapacity
    };
  }
}
