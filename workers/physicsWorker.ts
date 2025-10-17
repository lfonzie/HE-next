// workers/physicsWorker.ts
// Web Worker para cálculos físicos pesados

interface PhysicsWorkerMessage {
  type: string;
  data: any;
  id?: string;
}

interface PhysicsWorkerResponse {
  type: string;
  data: any;
  id?: string;
  error?: string;
}

// Funções de cálculo físico
class PhysicsCalculator {
  // Cálculo de movimento pendular
  static calculatePendulum(params: {
    length: number;
    gravity: number;
    angle: number;
    time: number;
  }) {
    const { length, gravity, angle, time } = params;
    
    // Período do pêndulo
    const period = 2 * Math.PI * Math.sqrt(length / gravity);
    
    // Frequência angular
    const angularFrequency = Math.sqrt(gravity / length);
    
    // Posição angular em função do tempo
    const angularPosition = angle * Math.cos(angularFrequency * time);
    
    // Velocidade angular
    const angularVelocity = -angle * angularFrequency * Math.sin(angularFrequency * time);
    
    // Aceleração angular
    const angularAcceleration = -angle * angularFrequency * angularFrequency * Math.cos(angularFrequency * time);
    
    // Energia cinética
    const kineticEnergy = 0.5 * angularVelocity * angularVelocity * length;
    
    // Energia potencial
    const potentialEnergy = gravity * length * (1 - Math.cos(angularPosition));
    
    // Energia total
    const totalEnergy = kineticEnergy + potentialEnergy;
    
    return {
      period,
      angularFrequency,
      angularPosition,
      angularVelocity,
      angularAcceleration,
      kineticEnergy,
      potentialEnergy,
      totalEnergy,
      maxVelocity: Math.sqrt(2 * gravity * length * (1 - Math.cos(angle))),
      maxAcceleration: gravity * Math.sin(angle)
    };
  }
  
  // Cálculo de bola saltitante
  static calculateBouncingBall(params: {
    initialHeight: number;
    restitution: number;
    gravity: number;
    airResistance: number;
    time: number;
  }) {
    const { initialHeight, restitution, gravity, airResistance, time } = params;
    
    // Velocidade inicial de impacto
    const impactVelocity = Math.sqrt(2 * gravity * initialHeight);
    
    // Altura após primeiro quique
    const bounceHeight = initialHeight * Math.pow(restitution, 2);
    
    // Tempo até parar (aproximação)
    const timeToStop = (2 * impactVelocity) / (gravity * (1 - restitution));
    
    // Número total de quiques até parar
    const totalBounces = Math.floor(Math.log(0.01) / Math.log(restitution));
    
    // Altura final
    const finalHeight = initialHeight * Math.pow(restitution, totalBounces);
    
    // Simulação de movimento com resistência do ar
    let currentHeight = initialHeight;
    let currentVelocity = 0;
    let currentTime = 0;
    const dt = 0.01; // Passo de tempo
    
    const trajectory = [];
    
    while (currentTime < time && currentHeight > 0.01) {
      // Aplicar gravidade
      currentVelocity += gravity * dt;
      
      // Aplicar resistência do ar
      currentVelocity *= (1 - airResistance * dt);
      
      // Atualizar posição
      currentHeight -= currentVelocity * dt;
      
      // Verificar colisão com o chão
      if (currentHeight <= 0) {
        currentHeight = 0;
        currentVelocity *= -restitution; // Inverter e reduzir velocidade
      }
      
      trajectory.push({
        time: currentTime,
        height: currentHeight,
        velocity: currentVelocity
      });
      
      currentTime += dt;
    }
    
    return {
      impactVelocity,
      bounceHeight,
      timeToStop,
      totalBounces,
      finalHeight,
      trajectory,
      maxHeight: initialHeight,
      currentHeight: trajectory[trajectory.length - 1]?.height || 0,
      currentVelocity: trajectory[trajectory.length - 1]?.velocity || 0
    };
  }
  
  // Cálculo de ondas
  static calculateWave(params: {
    amplitude: number;
    frequency: number;
    wavelength: number;
    phase: number;
    time: number;
    position: number;
  }) {
    const { amplitude, frequency, wavelength, phase, time, position } = params;
    
    // Número de onda
    const waveNumber = 2 * Math.PI / wavelength;
    
    // Frequência angular
    const angularFrequency = 2 * Math.PI * frequency;
    
    // Equação da onda
    const displacement = amplitude * Math.sin(waveNumber * position - angularFrequency * time + phase);
    
    // Velocidade da onda
    const waveVelocity = frequency * wavelength;
    
    // Energia da onda
    const waveEnergy = 0.5 * amplitude * amplitude * angularFrequency * angularFrequency;
    
    return {
      displacement,
      waveNumber,
      angularFrequency,
      waveVelocity,
      waveEnergy,
      amplitude,
      frequency,
      wavelength,
      phase
    };
  }
  
  // Cálculo de circuitos elétricos
  static calculateCircuit(params: {
    voltage: number;
    resistance: number;
    capacitance?: number;
    inductance?: number;
    frequency?: number;
  }) {
    const { voltage, resistance, capacitance, inductance, frequency } = params;
    
    // Corrente em circuito DC
    const current = voltage / resistance;
    
    // Potência dissipada
    const power = voltage * current;
    
    let result: any = {
      voltage,
      resistance,
      current,
      power
    };
    
    // Se há capacitância e frequência (circuito AC)
    if (capacitance && frequency) {
      const angularFrequency = 2 * Math.PI * frequency;
      const capacitiveReactance = 1 / (angularFrequency * capacitance);
      const impedance = Math.sqrt(resistance * resistance + capacitiveReactance * capacitiveReactance);
      
      result = {
        ...result,
        capacitance,
        frequency,
        capacitiveReactance,
        impedance,
        currentAC: voltage / impedance,
        phaseAngle: Math.atan(-capacitiveReactance / resistance)
      };
    }
    
    // Se há indutância e frequência (circuito AC)
    if (inductance && frequency) {
      const angularFrequency = 2 * Math.PI * frequency;
      const inductiveReactance = angularFrequency * inductance;
      const impedance = Math.sqrt(resistance * resistance + inductiveReactance * inductiveReactance);
      
      result = {
        ...result,
        inductance,
        inductiveReactance,
        impedance: result.impedance || impedance,
        currentAC: voltage / impedance,
        phaseAngle: Math.atan(inductiveReactance / resistance)
      };
    }
    
    return result;
  }
  
  // Cálculo de reações químicas
  static calculateChemicalReaction(params: {
    reactants: Array<{ formula: string; concentration: number; volume: number }>;
    temperature: number;
    pressure: number;
    time: number;
  }) {
    const { reactants, temperature, pressure, time } = params;
    
    // Constante de velocidade (aproximação)
    const rateConstant = Math.exp(-1000 / (temperature + 273.15));
    
    // Concentração inicial total
    const totalConcentration = reactants.reduce((sum, r) => sum + r.concentration, 0);
    
    // Velocidade da reação
    const reactionRate = rateConstant * totalConcentration;
    
    // Concentração após tempo t
    const finalConcentration = totalConcentration * Math.exp(-reactionRate * time);
    
    // Conversão percentual
    const conversion = ((totalConcentration - finalConcentration) / totalConcentration) * 100;
    
    // Energia de ativação (aproximação)
    const activationEnergy = 1000; // J/mol
    
    // Efeito da temperatura na velocidade
    const temperatureEffect = Math.exp(-activationEnergy / (8.314 * (temperature + 273.15)));
    
    return {
      rateConstant,
      reactionRate,
      finalConcentration,
      conversion,
      activationEnergy,
      temperatureEffect,
      totalConcentration,
      reactants: reactants.length,
      temperature,
      pressure,
      time
    };
  }
}

// Listener principal do worker
self.onmessage = function(e: MessageEvent<PhysicsWorkerMessage>) {
  const { type, data, id } = e.data;
  
  try {
    let result: any;
    
    switch (type) {
      case 'PENDULUM_CALCULATION':
        result = PhysicsCalculator.calculatePendulum(data);
        break;
        
      case 'BOUNCING_BALL_CALCULATION':
        result = PhysicsCalculator.calculateBouncingBall(data);
        break;
        
      case 'WAVE_CALCULATION':
        result = PhysicsCalculator.calculateWave(data);
        break;
        
      case 'CIRCUIT_CALCULATION':
        result = PhysicsCalculator.calculateCircuit(data);
        break;
        
      case 'CHEMICAL_REACTION_CALCULATION':
        result = PhysicsCalculator.calculateChemicalReaction(data);
        break;
        
      case 'BATCH_CALCULATIONS':
        // Processar múltiplos cálculos
        result = data.calculations.map((calc: any) => {
          switch (calc.type) {
            case 'pendulum':
              return PhysicsCalculator.calculatePendulum(calc.params);
            case 'bouncing_ball':
              return PhysicsCalculator.calculateBouncingBall(calc.params);
            case 'wave':
              return PhysicsCalculator.calculateWave(calc.params);
            case 'circuit':
              return PhysicsCalculator.calculateCircuit(calc.params);
            case 'chemical_reaction':
              return PhysicsCalculator.calculateChemicalReaction(calc.params);
            default:
              throw new Error(`Unknown calculation type: ${calc.type}`);
          }
        });
        break;
        
      default:
        throw new Error(`Unknown calculation type: ${type}`);
    }
    
    const response: PhysicsWorkerResponse = {
      type: `${type}_RESULT`,
      data: result,
      id
    };
    
    self.postMessage(response);
    
  } catch (error) {
    const errorResponse: PhysicsWorkerResponse = {
      type: `${type}_ERROR`,
      error: error instanceof Error ? error.message : 'Unknown error',
      id
    };
    
    self.postMessage(errorResponse);
  }
};

// Função para simulação em tempo real
function simulateRealTime(params: any, callback: (result: any) => void, interval = 16) {
  let time = 0;
  const maxTime = params.maxTime || 10;
  
  const simulation = setInterval(() => {
    if (time >= maxTime) {
      clearInterval(simulation);
      return;
    }
    
    const currentParams = { ...params, time };
    let result: any;
    
    switch (params.type) {
      case 'pendulum':
        result = PhysicsCalculator.calculatePendulum(currentParams);
        break;
      case 'bouncing_ball':
        result = PhysicsCalculator.calculateBouncingBall(currentParams);
        break;
      case 'wave':
        result = PhysicsCalculator.calculateWave(currentParams);
        break;
      default:
        clearInterval(simulation);
        return;
    }
    
    callback(result);
    time += interval / 1000; // Converter para segundos
  }, interval);
  
  return simulation;
}

// Exportar para uso em outros workers
if (typeof self !== 'undefined') {
  (self as any).PhysicsCalculator = PhysicsCalculator;
  (self as any).simulateRealTime = simulateRealTime;
}
