export interface ChemicalElement {
  symbol: string;
  name: string;
  atomicNumber: number;
  atomicMass: number;
  color: string;
  state: 'solid' | 'liquid' | 'gas';
  density: number;
}

export interface ChemicalCompound {
  formula: string;
  name: string;
  elements: {
    element: ChemicalElement;
    count: number;
  }[];
  color: string;
  state: 'solid' | 'liquid' | 'gas';
  solubility: number;
  pH?: number;
  properties: {
    [key: string]: any;
  };
}

export interface ChemicalReaction {
  id: string;
  name: string;
  reactants: {
    compound: ChemicalCompound;
    coefficient: number;
    state: 'solid' | 'liquid' | 'gas' | 'aqueous';
  }[];
  products: {
    compound: ChemicalCompound;
    coefficient: number;
    state: 'solid' | 'liquid' | 'gas' | 'aqueous';
  }[];
  type: 'synthesis' | 'decomposition' | 'single-replacement' | 'double-replacement' | 'combustion';
  enthalpy: number; // kJ/mol
  entropy: number; // J/(mol·K)
  equilibrium: number;
  conditions: {
    temperature: number;
    pressure: number;
    catalyst?: string;
  };
}

export interface ReactionState {
  reactants: {
    compound: ChemicalCompound;
    amount: number;
    concentration: number;
  }[];
  products: {
    compound: ChemicalCompound;
    amount: number;
    concentration: number;
  }[];
  progress: number; // 0-1
  rate: number;
  temperature: number;
  pressure: number;
  pH: number;
}

export interface ChemicalSolution {
  id: string;
  name: string;
  compounds: {
    compound: ChemicalCompound;
    concentration: number; // mol/L
    volume: number; // L
  }[];
  pH: number;
  color: string;
  temperature: number;
  density: number;
}

export interface ColorMixing {
  primaryColors: {
    red: number;
    green: number;
    blue: number;
  };
  secondaryColors: {
    cyan: number;
    magenta: number;
    yellow: number;
  };
  result: {
    rgb: {
      red: number;
      green: number;
      blue: number;
    };
    hsl: {
      hue: number;
      saturation: number;
      lightness: number;
    };
    hex: string;
  };
}

export interface ChemicalExperiment {
  id: string;
  name: string;
  description: string;
  reactions: ChemicalReaction[];
  solutions: ChemicalSolution[];
  equipment: string[];
  safety: {
    hazards: string[];
    precautions: string[];
    ppe: string[];
  };
  procedure: string[];
  observations: string[];
  results: any[];
}

export interface ChemistryParameters {
  temperature: number;
  pressure: number;
  volume: number;
  concentration: number;
  pH: number;
  time: number;
  stirring: boolean;
  heating: boolean;
}

export interface ChemistryMeasurement {
  type: 'concentration' | 'pH' | 'temperature' | 'pressure' | 'volume' | 'color';
  value: number;
  unit: string;
  timestamp: number;
  compound?: ChemicalCompound;
  accuracy: number;
  precision: number;
}
