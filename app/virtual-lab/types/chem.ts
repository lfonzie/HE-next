// types/chem.ts - Tipos específicos de química
export interface ChemicalSpecies {
  formula: string;        // ex.: "HCl", "NaOH", "H2O", "Na+", "Cl-"
  mol: number;
  charge?: number;        // para íons
  phase?: 'solid' | 'liquid' | 'gas' | 'aqueous';
}

export interface Solution {
  volume_mL: number;
  temperature_C: number;
  species: ChemicalSpecies[];
  ionic_strength?: number;
  pH?: number;
  pOH?: number;
  density_gmL?: number;
}

export interface Reaction {
  id: string;
  equation: string;         // balanceada, ex.: "HCl + NaOH -> NaCl + H2O"
  reactants: ChemicalSpecies[];
  products: ChemicalSpecies[];
  stoichiometry: Record<string, number>; // coeficientes estequiométricos
  K?: number;               // constante de equilíbrio
  k?: number;               // constante cinética base
  Ea_kJmol?: number;        // energia de ativação
  order?: number | Record<string, number>; // ordem global ou por espécie
  yield_realistic?: number; // 0..1 para simular perdas
  conditions?: { 
    T_C?: [number, number]; 
    catalyst?: string[];
    pH_range?: [number, number];
  };
  enthalpy_kJmol?: number;  // ΔH da reação
}

export interface AcidBaseSystem {
  acid: {
    formula: string;
    Ka: number;
    pKa: number;
  };
  base: {
    formula: string;
    Kb: number;
    pKb: number;
  };
  conjugate: {
    acid: string;
    base: string;
  };
}

export interface BufferSolution {
  weak_acid: ChemicalSpecies;
  conjugate_base: ChemicalSpecies;
  pH_target: number;
  capacity: number;
}

export interface Indicator {
  name: string;
  formula: string;
  pH_range: [number, number];
  color_acid: string;
  color_base: string;
  transition_point: number;
}

export interface SolubilityProduct {
  compound: string;
  Ksp: number;
  solubility_molL: number;
  ions: string[];
}

export interface KineticData {
  reaction_id: string;
  temperature_C: number;
  rate_constant: number;
  half_life_s: number;
  order: number;
  activation_energy_kJmol: number;
}

export interface TitrationData {
  volume_added_mL: number;
  pH: number;
  equivalence_point?: boolean;
  indicator_color?: string;
}

export interface MixingRule {
  volume_final: number;
  temperature_final: number;
  species_final: ChemicalSpecies[];
  heat_evolved_J?: number;
}
