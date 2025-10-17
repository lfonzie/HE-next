/**
 * Function Calling Implementation for Virtual Lab
 * Implementa funções específicas do laboratório para interação com Gemini Live API
 */

export interface LabFunctionCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface LabFunctionResponse {
  id: string;
  response: any;
  success: boolean;
  error?: string;
}

export interface MeasurementData {
  instrument: string;
  value: number;
  unit: string;
  timestamp: number;
  experimentId?: string;
}

export interface CalculationData {
  formula: string;
  variables: Record<string, number>;
  result: number;
  units?: string;
}

export interface ExperimentStep {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  completed: boolean;
  timestamp?: number;
}

export class LabFunctionHandler {
  private measurements: MeasurementData[] = [];
  private calculations: CalculationData[] = [];
  private experimentSteps: ExperimentStep[] = [];

  // Função para registrar medições
  async handleTakeMeasurement(call: LabFunctionCall): Promise<LabFunctionResponse> {
    try {
      const { instrument, value, unit, experimentId } = call.args;

      if (!instrument || value === undefined || !unit) {
        return {
          id: call.id,
          response: { error: 'Parâmetros obrigatórios: instrument, value, unit' },
          success: false,
          error: 'Parâmetros inválidos'
        };
      }

      const measurement: MeasurementData = {
        instrument,
        value: Number(value),
        unit,
        timestamp: Date.now(),
        experimentId
      };

      this.measurements.push(measurement);

      return {
        id: call.id,
        response: {
          success: true,
          measurement,
          message: `Medição registrada: ${value} ${unit} usando ${instrument}`
        },
        success: true
      };
    } catch (error) {
      return {
        id: call.id,
        response: { error: 'Erro ao registrar medição' },
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Função para cálculos científicos
  async handleCalculateFormula(call: LabFunctionCall): Promise<LabFunctionResponse> {
    try {
      const { formula, variables, units } = call.args;

      if (!formula || !variables) {
        return {
          id: call.id,
          response: { error: 'Parâmetros obrigatórios: formula, variables' },
          success: false,
          error: 'Parâmetros inválidos'
        };
      }

      const result = this.performCalculation(formula, variables);
      
      const calculation: CalculationData = {
        formula,
        variables,
        result,
        units
      };

      this.calculations.push(calculation);

      return {
        id: call.id,
        response: {
          success: true,
          calculation,
          result,
          message: `${formula} = ${result}${units ? ' ' + units : ''}`
        },
        success: true
      };
    } catch (error) {
      return {
        id: call.id,
        response: { error: 'Erro ao executar cálculo' },
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Função para orientação de experimentos
  async handleProvideGuidance(call: LabFunctionCall): Promise<LabFunctionResponse> {
    try {
      const { step, instructions, experimentId } = call.args;

      if (!step || !instructions || !Array.isArray(instructions)) {
        return {
          id: call.id,
          response: { error: 'Parâmetros obrigatórios: step, instructions (array)' },
          success: false,
          error: 'Parâmetros inválidos'
        };
      }

      const experimentStep: ExperimentStep = {
        id: Date.now().toString(),
        name: step,
        description: instructions.join(' '),
        instructions,
        completed: false,
        timestamp: Date.now()
      };

      this.experimentSteps.push(experimentStep);

      return {
        id: call.id,
        response: {
          success: true,
          step: experimentStep,
          message: `Orientação fornecida para: ${step}`
        },
        success: true
      };
    } catch (error) {
      return {
        id: call.id,
        response: { error: 'Erro ao fornecer orientação' },
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Função para análise de dados
  async handleAnalyzeData(call: LabFunctionCall): Promise<LabFunctionResponse> {
    try {
      const { dataType, parameters } = call.args;

      if (!dataType) {
        return {
          id: call.id,
          response: { error: 'Parâmetro obrigatório: dataType' },
          success: false,
          error: 'Parâmetros inválidos'
        };
      }

      let analysis: any = {};

      switch (dataType) {
        case 'measurements':
          analysis = this.analyzeMeasurements(parameters);
          break;
        case 'calculations':
          analysis = this.analyzeCalculations(parameters);
          break;
        case 'experiment_progress':
          analysis = this.analyzeExperimentProgress(parameters);
          break;
        default:
          return {
            id: call.id,
            response: { error: 'Tipo de análise não suportado' },
            success: false,
            error: 'Tipo de análise inválido'
          };
      }

      return {
        id: call.id,
        response: {
          success: true,
          analysis,
          message: `Análise de ${dataType} concluída`
        },
        success: true
      };
    } catch (error) {
      return {
        id: call.id,
        response: { error: 'Erro na análise de dados' },
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Função para validação de resultados
  async handleValidateResults(call: LabFunctionCall): Promise<LabFunctionResponse> {
    try {
      const { expectedValues, actualValues, tolerance } = call.args;

      if (!expectedValues || !actualValues) {
        return {
          id: call.id,
          response: { error: 'Parâmetros obrigatórios: expectedValues, actualValues' },
          success: false,
          error: 'Parâmetros inválidos'
        };
      }

      const validation = this.validateValues(expectedValues, actualValues, tolerance || 0.1);

      return {
        id: call.id,
        response: {
          success: true,
          validation,
          message: validation.passed ? 'Validação aprovada' : 'Validação reprovada'
        },
        success: true
      };
    } catch (error) {
      return {
        id: call.id,
        response: { error: 'Erro na validação' },
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Métodos auxiliares
  private performCalculation(formula: string, variables: Record<string, number>): number {
    const formulaLower = formula.toLowerCase().replace(/\s+/g, '');

    switch (formulaLower) {
      // Química
      case 'ph':
        return -Math.log10(variables.concentration || 0.001);
      
      case 'poh':
        return 14 - (-Math.log10(variables.concentration || 0.001));
      
      case 'concentration':
        return variables.moles / (variables.volume / 1000);
      
      case 'moles':
        return variables.concentration * (variables.volume / 1000);
      
      case 'molarity':
        return variables.moles / (variables.volume / 1000);
      
      case 'molality':
        return variables.moles / (variables.mass / 1000);
      
      case 'dilution':
        return (variables.c1 * variables.v1) / variables.v2;
      
      case 'arrhenius':
        return variables.a * Math.exp(-variables.ea / (variables.r * variables.t));
      
      // Física
      case 'ohms_law':
        return variables.voltage / variables.resistance;
      
      case 'power':
        return variables.voltage * variables.current;
      
      case 'power_resistance':
        return Math.pow(variables.current, 2) * variables.resistance;
      
      case 'kinetic_energy':
        return 0.5 * variables.mass * Math.pow(variables.velocity, 2);
      
      case 'potential_energy':
        return variables.mass * variables.gravity * variables.height;
      
      case 'force':
        return variables.mass * variables.acceleration;
      
      case 'work':
        return variables.force * variables.distance;
      
      case 'momentum':
        return variables.mass * variables.velocity;
      
      // Matemática
      case 'quadratic':
        const a = variables.a || 1;
        const b = variables.b || 0;
        const c = variables.c || 0;
        const discriminant = Math.pow(b, 2) - 4 * a * c;
        return discriminant >= 0 ? (-b + Math.sqrt(discriminant)) / (2 * a) : 0;
      
      case 'logarithm':
        return Math.log(variables.value) / Math.log(variables.base || Math.E);
      
      case 'exponential':
        return Math.pow(variables.base || Math.E, variables.exponent);
      
      default:
        throw new Error(`Fórmula não reconhecida: ${formula}`);
    }
  }

  private analyzeMeasurements(parameters: any) {
    const relevantMeasurements = this.measurements.filter(m => 
      !parameters.instrument || m.instrument === parameters.instrument
    );

    if (relevantMeasurements.length === 0) {
      return { message: 'Nenhuma medição encontrada' };
    }

    const values = relevantMeasurements.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const average = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const variance = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    return {
      count: relevantMeasurements.length,
      average,
      min,
      max,
      standardDeviation,
      variance,
      measurements: relevantMeasurements
    };
  }

  private analyzeCalculations(parameters: any) {
    const relevantCalculations = this.calculations.filter(c => 
      !parameters.formula || c.formula === parameters.formula
    );

    if (relevantCalculations.length === 0) {
      return { message: 'Nenhum cálculo encontrado' };
    }

    const results = relevantCalculations.map(c => c.result);
    const sum = results.reduce((a, b) => a + b, 0);
    const average = sum / results.length;

    return {
      count: relevantCalculations.length,
      average,
      calculations: relevantCalculations
    };
  }

  private analyzeExperimentProgress(parameters: any) {
    const totalSteps = this.experimentSteps.length;
    const completedSteps = this.experimentSteps.filter(s => s.completed).length;
    const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    return {
      totalSteps,
      completedSteps,
      progressPercentage,
      steps: this.experimentSteps
    };
  }

  private validateValues(expected: Record<string, number>, actual: Record<string, number>, tolerance: number) {
    const validations: Record<string, boolean> = {};
    let passed = true;

    for (const key in expected) {
      if (actual[key] !== undefined) {
        const expectedValue = expected[key];
        const actualValue = actual[key];
        const difference = Math.abs(expectedValue - actualValue);
        const isValid = difference <= tolerance;
        
        validations[key] = isValid;
        if (!isValid) passed = false;
      }
    }

    return {
      passed,
      validations,
      tolerance,
      expected,
      actual
    };
  }

  // Métodos para acesso aos dados
  getMeasurements(): MeasurementData[] {
    return [...this.measurements];
  }

  getCalculations(): CalculationData[] {
    return [...this.calculations];
  }

  getExperimentSteps(): ExperimentStep[] {
    return [...this.experimentSteps];
  }

  clearData(): void {
    this.measurements = [];
    this.calculations = [];
    this.experimentSteps = [];
  }

  // Método principal para processar function calls
  async processFunctionCall(call: LabFunctionCall): Promise<LabFunctionResponse> {
    switch (call.name) {
      case 'take_measurement':
        return this.handleTakeMeasurement(call);
      case 'calculate_formula':
        return this.handleCalculateFormula(call);
      case 'provide_guidance':
        return this.handleProvideGuidance(call);
      case 'analyze_data':
        return this.handleAnalyzeData(call);
      case 'validate_results':
        return this.handleValidateResults(call);
      default:
        return {
          id: call.id,
          response: { error: `Função não reconhecida: ${call.name}` },
          success: false,
          error: 'Função não implementada'
        };
    }
  }
}

// Instância singleton
let labFunctionHandler: LabFunctionHandler | null = null;

export function getLabFunctionHandler(): LabFunctionHandler {
  if (!labFunctionHandler) {
    labFunctionHandler = new LabFunctionHandler();
  }
  return labFunctionHandler;
}
