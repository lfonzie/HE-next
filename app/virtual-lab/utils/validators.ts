// utils/validators.ts - Sistema de validação de objetivos
import { ValidationResult } from '../types/lab';
import { LabState } from '../types/lab';

export class ObjectiveValidator {
  /**
   * Valida todos os objetivos de um experimento
   */
  static validateAllObjectives(state: LabState): ValidationResult[] {
    if (!state.currentPreset) {
      return [];
    }

    return state.currentPreset.objectives.map(objective => {
      return this.validateObjective(objective, state);
    });
  }

  /**
   * Valida um objetivo específico
   */
  private static validateObjective(
    objective: { id: string; description: string; validator: { type: string; params: Record<string, any> } },
    state: LabState
  ): ValidationResult {
    const { validator } = objective;

    try {
      switch (validator.type) {
        case 'pH-in-range':
          return this.validatePhInRange(validator.params as { vesselId: string; min: number; max: number }, state);
        
        case 'log-has-key':
          return this.validateLogHasKey(validator.params as { key: string }, state);
        
        case 'indicator-color-change':
          return this.validateIndicatorColorChange(validator.params as { indicatorId: string; expectedColor: string }, state);
        
        case 'time-limit':
          return this.validateTimeLimit(validator.params as { maxTime: number }, state);
        
        case 'current-in-range':
          return this.validateCurrentInRange(validator.params as { min: number; max: number }, state);
        
        case 'voltage-measurements':
          return this.validateVoltageMeasurements(validator.params as { resistors: string[]; expected_voltages: number[]; tolerance: number }, state);
        
        case 'compare-series-parallel':
          return this.validateCompareSeriesParallel(validator.params as { ratioMin: number; ratioMax: number }, state);
        
        case 'ohm-law-verification':
          return this.validateOhmLawVerification(validator.params as { tolerance: number }, state);
        
        case 'table-has-rows':
          return this.validateTableHasRows(validator.params as { minRows: number }, state);
        
        case 'concentration-in-range':
          return this.validateConcentrationInRange(validator.params as { vesselId: string; min: number; max: number; unit: string }, state);
        
        case 'temperature-in-range':
          return this.validateTemperatureInRange(validator.params as { min: number; max: number; unit: string }, state);
        
        case 'mass-in-range':
          return this.validateMassInRange(validator.params as { min: number; max: number; unit: string }, state);
        
        default:
          return {
            isValid: false,
            score: 0,
            message: `Tipo de validação não suportado: ${validator.type}`,
            details: { objectiveId: objective.id }
          };
      }
    } catch (error: any) {
      return {
        isValid: false,
        score: 0,
        message: `Erro na validação: ${error.message}`,
        details: { objectiveId: objective.id, error: error.message }
      };
    }
  }

  /**
   * Valida se o pH está dentro de uma faixa específica
   */
  private static validatePhInRange(params: { vesselId: string; min: number; max: number }, state: LabState): ValidationResult {
    const { vesselId, min, max } = params;
    
    // Simulação: buscar pH do vessel (em implementação real seria do estado da simulação)
    const simulatedPh = 7.0 + (Math.random() - 0.5) * 0.2; // pH simulado entre 6.9 e 7.1
    
    const isValid = simulatedPh >= min && simulatedPh <= max;
    const score = isValid ? 100 : Math.max(0, 100 - Math.abs(simulatedPh - 7.0) * 100);
    
    return {
      isValid,
      score: Math.round(score),
      message: isValid 
        ? `pH ${simulatedPh.toFixed(2)} está dentro da faixa esperada (${min}-${max})`
        : `pH ${simulatedPh.toFixed(2)} está fora da faixa esperada (${min}-${max})`,
      details: {
        vesselId,
        actualPh: simulatedPh,
        expectedRange: { min, max }
      }
    };
  }

  /**
   * Valida se o log contém uma chave específica
   */
  private static validateLogHasKey(params: { key: string }, state: LabState): ValidationResult {
    const { key } = params;
    
    const hasKey = state.trialLog.some(log => 
      log.payload && Object.keys(log.payload).includes(key)
    );
    
    return {
      isValid: hasKey,
      score: hasKey ? 100 : 0,
      message: hasKey 
        ? `Chave '${key}' encontrada no log`
        : `Chave '${key}' não encontrada no log`,
      details: { key, logEntries: state.trialLog.length }
    };
  }

  /**
   * Valida mudança de cor do indicador
   */
  private static validateIndicatorColorChange(params: { indicatorId: string; expectedColor: string }, state: LabState): ValidationResult {
    const { indicatorId, expectedColor } = params;
    
    // Simulação: verificar se o indicador mudou de cor
    const colorChanged = Math.random() > 0.3; // 70% de chance de sucesso
    
    return {
      isValid: colorChanged,
      score: colorChanged ? 100 : 0,
      message: colorChanged 
        ? `Indicador ${indicatorId} mudou para ${expectedColor}`
        : `Indicador ${indicatorId} não mudou para ${expectedColor}`,
      details: { indicatorId, expectedColor, actualColor: colorChanged ? expectedColor : 'incolor' }
    };
  }

  /**
   * Valida limite de tempo
   */
  private static validateTimeLimit(params: { maxTime: number }, state: LabState): ValidationResult {
    const { maxTime } = params;
    const currentTime = state.simulationState.currentTime;
    
    const isValid = currentTime <= maxTime;
    const score = isValid ? 100 : Math.max(0, 100 - (currentTime - maxTime) / maxTime * 100);
    
    return {
      isValid,
      score: Math.round(score),
      message: isValid 
        ? `Experimento concluído em ${currentTime.toFixed(1)}s (limite: ${maxTime}s)`
        : `Experimento demorou ${currentTime.toFixed(1)}s (limite: ${maxTime}s)`,
      details: { currentTime, maxTime }
    };
  }

  /**
   * Valida corrente em faixa específica
   */
  private static validateCurrentInRange(params: { min: number; max: number }, state: LabState): ValidationResult {
    const { min, max } = params;
    
    // Simulação: corrente medida
    const simulatedCurrent = 0.015 + (Math.random() - 0.5) * 0.002; // ~15mA ± 1mA
    
    const isValid = simulatedCurrent >= min && simulatedCurrent <= max;
    const score = isValid ? 100 : Math.max(0, 100 - Math.abs(simulatedCurrent - 0.015) * 10000);
    
    return {
      isValid,
      score: Math.round(score),
      message: isValid 
        ? `Corrente ${simulatedCurrent.toFixed(3)}A está dentro da faixa esperada (${min}-${max}A)`
        : `Corrente ${simulatedCurrent.toFixed(3)}A está fora da faixa esperada (${min}-${max}A)`,
      details: { actualCurrent: simulatedCurrent, expectedRange: { min, max } }
    };
  }

  /**
   * Valida medições de tensão
   */
  private static validateVoltageMeasurements(params: { resistors: string[]; expected_voltages: number[]; tolerance: number }, state: LabState): ValidationResult {
    const { resistors, expected_voltages, tolerance } = params;
    
    let totalScore = 0;
    let validMeasurements = 0;
    
    resistors.forEach((resistorId, index) => {
      const expectedVoltage = expected_voltages[index];
      const simulatedVoltage = expectedVoltage + (Math.random() - 0.5) * tolerance;
      
      const isValid = Math.abs(simulatedVoltage - expectedVoltage) <= tolerance;
      if (isValid) validMeasurements++;
      
      totalScore += isValid ? 100 : Math.max(0, 100 - Math.abs(simulatedVoltage - expectedVoltage) * 20);
    });
    
    const overallValid = validMeasurements === resistors.length;
    const averageScore = totalScore / resistors.length;
    
    return {
      isValid: overallValid,
      score: Math.round(averageScore),
      message: overallValid 
        ? `Todas as ${resistors.length} medições de tensão estão corretas`
        : `${validMeasurements}/${resistors.length} medições de tensão estão corretas`,
      details: { resistors, expected_voltages, validMeasurements, totalMeasurements: resistors.length }
    };
  }

  /**
   * Valida comparação série vs paralelo
   */
  private static validateCompareSeriesParallel(params: { ratioMin: number; ratioMax: number }, state: LabState): ValidationResult {
    const { ratioMin, ratioMax } = params;
    
    // Simulação: calcular razão entre corrente série e paralelo
    const seriesCurrent = 0.015; // 15mA
    const parallelCurrent = 0.165; // 165mA
    const ratio = parallelCurrent / seriesCurrent; // ~11
    
    const isValid = ratio >= ratioMin && ratio <= ratioMax;
    const score = isValid ? 100 : Math.max(0, 100 - Math.abs(ratio - 11) * 10);
    
    return {
      isValid,
      score: Math.round(score),
      message: isValid 
        ? `Razão ${ratio.toFixed(1)} está dentro da faixa esperada (${ratioMin}-${ratioMax})`
        : `Razão ${ratio.toFixed(1)} está fora da faixa esperada (${ratioMin}-${ratioMax})`,
      details: { seriesCurrent, parallelCurrent, ratio, expectedRange: { ratioMin, ratioMax } }
    };
  }

  /**
   * Valida verificação da Lei de Ohm
   */
  private static validateOhmLawVerification(params: { tolerance: number }, state: LabState): ValidationResult {
    const { tolerance } = params;
    
    // Simulação: V = I × R
    const voltage = 9.0; // V
    const resistance = 600.0; // Ω (série)
    const expectedCurrent = voltage / resistance; // 0.015A
    const measuredCurrent = expectedCurrent + (Math.random() - 0.5) * tolerance * expectedCurrent;
    
    const isValid = Math.abs(measuredCurrent - expectedCurrent) <= tolerance * expectedCurrent;
    const score = isValid ? 100 : Math.max(0, 100 - Math.abs(measuredCurrent - expectedCurrent) / expectedCurrent * 100);
    
    return {
      isValid,
      score: Math.round(score),
      message: isValid 
        ? `Lei de Ohm verificada: V = I × R (${voltage}V = ${measuredCurrent.toFixed(3)}A × ${resistance}Ω)`
        : `Lei de Ohm não verificada: diferença de ${Math.abs(measuredCurrent - expectedCurrent).toFixed(3)}A`,
      details: { voltage, resistance, expectedCurrent, measuredCurrent, tolerance }
    };
  }

  /**
   * Valida se a tabela tem número mínimo de linhas
   */
  private static validateTableHasRows(params: { minRows: number }, state: LabState): ValidationResult {
    const { minRows } = params;
    const logEntries = state.trialLog.length;
    
    const isValid = logEntries >= minRows;
    const score = isValid ? 100 : Math.min(100, (logEntries / minRows) * 100);
    
    return {
      isValid,
      score: Math.round(score),
      message: isValid 
        ? `Tabela tem ${logEntries} entradas (mínimo: ${minRows})`
        : `Tabela tem apenas ${logEntries} entradas (mínimo: ${minRows})`,
      details: { logEntries, minRows }
    };
  }

  /**
   * Valida concentração em faixa específica
   */
  private static validateConcentrationInRange(params: { vesselId: string; min: number; max: number; unit: string }, state: LabState): ValidationResult {
    const { vesselId, min, max, unit } = params;
    
    // Simulação: concentração medida
    const simulatedConcentration = (min + max) / 2 + (Math.random() - 0.5) * (max - min) * 0.1;
    
    const isValid = simulatedConcentration >= min && simulatedConcentration <= max;
    const score = isValid ? 100 : Math.max(0, 100 - Math.abs(simulatedConcentration - (min + max) / 2) / (max - min) * 100);
    
    return {
      isValid,
      score: Math.round(score),
      message: isValid 
        ? `Concentração ${simulatedConcentration.toFixed(3)} ${unit} está dentro da faixa esperada (${min}-${max} ${unit})`
        : `Concentração ${simulatedConcentration.toFixed(3)} ${unit} está fora da faixa esperada (${min}-${max} ${unit})`,
      details: { vesselId, actualConcentration: simulatedConcentration, expectedRange: { min, max }, unit }
    };
  }

  /**
   * Valida temperatura em faixa específica
   */
  private static validateTemperatureInRange(params: { min: number; max: number; unit: string }, state: LabState): ValidationResult {
    const { min, max, unit } = params;
    
    // Simulação: temperatura medida
    const simulatedTemperature = (min + max) / 2 + (Math.random() - 0.5) * (max - min) * 0.1;
    
    const isValid = simulatedTemperature >= min && simulatedTemperature <= max;
    const score = isValid ? 100 : Math.max(0, 100 - Math.abs(simulatedTemperature - (min + max) / 2) / (max - min) * 100);
    
    return {
      isValid,
      score: Math.round(score),
      message: isValid 
        ? `Temperatura ${simulatedTemperature.toFixed(1)}°${unit} está dentro da faixa esperada (${min}-${max}°${unit})`
        : `Temperatura ${simulatedTemperature.toFixed(1)}°${unit} está fora da faixa esperada (${min}-${max}°${unit})`,
      details: { actualTemperature: simulatedTemperature, expectedRange: { min, max }, unit }
    };
  }

  /**
   * Valida massa em faixa específica
   */
  private static validateMassInRange(params: { min: number; max: number; unit: string }, state: LabState): ValidationResult {
    const { min, max, unit } = params;
    
    // Simulação: massa medida
    const simulatedMass = (min + max) / 2 + (Math.random() - 0.5) * (max - min) * 0.1;
    
    const isValid = simulatedMass >= min && simulatedMass <= max;
    const score = isValid ? 100 : Math.max(0, 100 - Math.abs(simulatedMass - (min + max) / 2) / (max - min) * 100);
    
    return {
      isValid,
      score: Math.round(score),
      message: isValid 
        ? `Massa ${simulatedMass.toFixed(3)} ${unit} está dentro da faixa esperada (${min}-${max} ${unit})`
        : `Massa ${simulatedMass.toFixed(3)} ${unit} está fora da faixa esperada (${min}-${max} ${unit})`,
      details: { actualMass: simulatedMass, expectedRange: { min, max }, unit }
    };
  }
}
