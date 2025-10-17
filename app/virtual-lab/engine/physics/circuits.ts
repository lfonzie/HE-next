// engine/physics/circuits.ts - Análise de circuitos elétricos
import { Circuit, CircuitElement, CircuitNode, CircuitAnalysis } from '../../types/physics';
import { DeterministicRNG } from '../core/rng';

export class CircuitEngine {
  private rng: DeterministicRNG;

  constructor(rng: DeterministicRNG) {
    this.rng = rng;
  }

  /**
   * Analisa um circuito DC usando análise nodal
   */
  analyzeCircuit(circuit: Circuit): CircuitAnalysis {
    const nodes = circuit.nodes;
    const elements = circuit.elements;
    
    // Criar matriz de condutância
    const n = nodes.length;
    const G = Array(n).fill(null).map(() => Array(n).fill(0));
    const I = Array(n).fill(0);

    // Preencher matriz de condutância
    for (const element of elements) {
      const node1Index = nodes.findIndex(n => n.id === element.n1);
      const node2Index = nodes.findIndex(n => n.id === element.n2);

      if (node1Index === -1 || node2Index === -1) {
        continue; // Pular elementos com nós inválidos
      }

      let conductance = 0;
      let currentSource = 0;

      switch (element.type) {
        case 'resistor':
          conductance = 1 / element.value;
          break;
        case 'voltageSource':
          // Converter fonte de tensão em fonte de corrente equivalente
          conductance = 1e6; // Resistência muito alta para simular fonte ideal
          currentSource = element.value * conductance;
          break;
        case 'currentSource':
          currentSource = element.value;
          break;
        case 'lamp':
          // Lâmpada como resistor não-linear (simplificado)
          conductance = 1 / element.value;
          break;
        case 'switch':
          if (element.properties?.closed) {
            conductance = 1e6; // Chave fechada = resistência muito baixa
          } else {
            conductance = 1e-12; // Chave aberta = resistência muito alta
          }
          break;
      }

      // Adicionar condutância à matriz
      if (node1Index !== node2Index) {
        G[node1Index][node2Index] -= conductance;
        G[node2Index][node1Index] -= conductance;
      }
      
      G[node1Index][node1Index] += conductance;
      G[node2Index][node2Index] += conductance;

      // Adicionar fonte de corrente
      if (currentSource !== 0) {
        I[node1Index] += currentSource;
        I[node2Index] -= currentSource;
      }
    }

    // Resolver sistema linear G * V = I
    const voltages = this.solveLinearSystem(G, I);

    // Calcular correntes e potências
    const nodeVoltages: Record<string, number> = {};
    const elementCurrents: Record<string, number> = {};
    const powerDissipated: Record<string, number> = {};

    // Mapear tensões dos nós
    for (let i = 0; i < nodes.length; i++) {
      nodeVoltages[nodes[i].id] = voltages[i];
    }

    // Calcular correntes dos elementos
    for (const element of elements) {
      const v1 = nodeVoltages[element.n1] || 0;
      const v2 = nodeVoltages[element.n2] || 0;
      const voltage = v1 - v2;

      let current = 0;
      let power = 0;

      switch (element.type) {
        case 'resistor':
        case 'lamp':
          current = voltage / element.value;
          power = voltage * current;
          break;
        case 'voltageSource':
          current = voltage / 1e6; // Resistência interna muito alta
          power = voltage * current;
          break;
        case 'currentSource':
          current = element.value;
          power = voltage * current;
          break;
        case 'switch':
          if (element.properties?.closed) {
            current = voltage / 1e6;
            power = voltage * current;
          } else {
            current = 0;
            power = 0;
          }
          break;
      }

      elementCurrents[element.id] = this.rng.measurementNoise(current, 0.01);
      powerDissipated[element.id] = this.rng.measurementNoise(power, 0.02);
    }

    const totalPower = Object.values(powerDissipated).reduce((sum, p) => sum + p, 0);

    return {
      node_voltages: nodeVoltages,
      element_currents: elementCurrents,
      power_dissipated: powerDissipated,
      total_power: this.rng.measurementNoise(totalPower, 0.01)
    };
  }

  /**
   * Resolve sistema linear usando eliminação gaussiana
   */
  private solveLinearSystem(matrix: number[][], vector: number[]): number[] {
    const n = matrix.length;
    const augmented = matrix.map((row, i) => [...row, vector[i]]);

    // Eliminação gaussiana
    for (let i = 0; i < n; i++) {
      // Encontrar pivô
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }

      // Trocar linhas
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      // Fazer todos os elementos abaixo do pivô zero
      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = i; j <= n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    // Substituição reversa
    const solution = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      solution[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        solution[i] -= augmented[i][j] * solution[j];
      }
      solution[i] /= augmented[i][i];
    }

    return solution;
  }

  /**
   * Calcula resistência equivalente para associações série e paralelo
   */
  static calculateEquivalentResistance(
    resistors: Array<{ value: number; connection: 'series' | 'parallel' }>
  ): number {
    let equivalentResistance = 0;

    for (const resistor of resistors) {
      if (resistor.connection === 'series') {
        equivalentResistance += resistor.value;
      } else if (resistor.connection === 'parallel') {
        if (equivalentResistance === 0) {
          equivalentResistance = resistor.value;
        } else {
          equivalentResistance = 1 / (1 / equivalentResistance + 1 / resistor.value);
        }
      }
    }

    return equivalentResistance;
  }

  /**
   * Simula o comportamento de uma lâmpada (resistência não-linear)
   */
  simulateLampBehavior(
    voltage: number,
    resistance: number,
    temperature: number = 25
  ): {
    current: number;
    power: number;
    brightness: number;
    temperature: number;
  } {
    // Resistência aumenta com a temperatura (efeito Joule)
    const temperatureCoefficient = 0.004; // por °C
    const resistanceAtTemp = resistance * (1 + temperatureCoefficient * (temperature - 25));
    
    const current = voltage / resistanceAtTemp;
    const power = voltage * current;
    
    // Brilho proporcional à potência (simplificado)
    const brightness = Math.min(100, (power / 10) * 100); // Máximo 100%
    
    // Temperatura aumenta com a potência dissipada
    const newTemperature = temperature + (power * 0.1); // °C por watt

    return {
      current: this.rng.measurementNoise(current, 0.01),
      power: this.rng.measurementNoise(power, 0.02),
      brightness: Math.round(brightness),
      temperature: this.rng.measurementNoise(newTemperature, 0.1)
    };
  }

  /**
   * Simula o comportamento de um capacitor em DC
   */
  simulateCapacitorBehavior(
    voltage: number,
    capacitance: number,
    time: number
  ): {
    charge: number;
    current: number;
    energy: number;
  } {
    // Em DC, capacitor carrega exponencialmente
    const timeConstant = capacitance * 1e6; // Assumindo resistência de 1MΩ
    const charge = capacitance * voltage * (1 - Math.exp(-time / timeConstant));
    const current = (capacitance * voltage / timeConstant) * Math.exp(-time / timeConstant);
    const energy = 0.5 * capacitance * voltage * voltage;

    return {
      charge: this.rng.measurementNoise(charge, 0.01),
      current: this.rng.measurementNoise(current, 0.02),
      energy: this.rng.measurementNoise(energy, 0.01)
    };
  }

  /**
   * Verifica se um circuito é válido
   */
  static validateCircuit(circuit: Circuit): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Verificar se todos os elementos referenciam nós válidos
    for (const element of circuit.elements) {
      const node1Exists = circuit.nodes.some(n => n.id === element.n1);
      const node2Exists = circuit.nodes.some(n => n.id === element.n2);

      if (!node1Exists) {
        errors.push(`Elemento ${element.id} referencia nó inexistente: ${element.n1}`);
      }
      if (!node2Exists) {
        errors.push(`Elemento ${element.id} referencia nó inexistente: ${element.n2}`);
      }
    }

    // Verificar se há pelo menos um nó de referência (terra)
    const hasGround = circuit.nodes.some(n => n.id === 'GND' || circuit.ground_node === n.id);
    if (!hasGround) {
      errors.push('Circuito deve ter pelo menos um nó de referência (GND)');
    }

    // Verificar se há pelo menos uma fonte
    const hasSource = circuit.elements.some(e => 
      e.type === 'voltageSource' || e.type === 'currentSource'
    );
    if (!hasSource) {
      errors.push('Circuito deve ter pelo menos uma fonte de tensão ou corrente');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calcula a potência total dissipada no circuito
   */
  static calculateTotalPower(analysis: CircuitAnalysis): number {
    return Object.values(analysis.power_dissipated).reduce((sum, power) => sum + power, 0);
  }

  /**
   * Simula medições de instrumentos
   */
  simulateInstrumentReadings(
    analysis: CircuitAnalysis,
    instrumentType: 'voltmeter' | 'ammeter' | 'ohmmeter'
  ): Record<string, number> {
    const readings: Record<string, number> = {};

    switch (instrumentType) {
      case 'voltmeter':
        for (const [nodeId, voltage] of Object.entries(analysis.node_voltages)) {
          readings[nodeId] = this.rng.measurementNoise(voltage, 0.001);
        }
        break;
      
      case 'ammeter':
        for (const [elementId, current] of Object.entries(analysis.element_currents)) {
          readings[elementId] = this.rng.measurementNoise(current, 0.001);
        }
        break;
      
      case 'ohmmeter':
        // Para ohmímetro, seria necessário desconectar a fonte
        // Simplificação: calcular resistência baseada em V/I
        for (const [elementId, current] of Object.entries(analysis.element_currents)) {
          const voltage = Object.values(analysis.node_voltages)[0] || 0;
          if (current !== 0) {
            readings[elementId] = this.rng.measurementNoise(voltage / current, 0.01);
          }
        }
        break;
    }

    return readings;
  }
}
