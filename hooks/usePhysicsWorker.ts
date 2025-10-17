// hooks/usePhysicsWorker.ts
import { useRef, useCallback, useEffect } from 'react';

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

interface UsePhysicsWorkerOptions {
  onMessage?: (response: PhysicsWorkerResponse) => void;
  onError?: (error: Error) => void;
  autoStart?: boolean;
}

export const usePhysicsWorker = (options: UsePhysicsWorkerOptions = {}) => {
  const workerRef = useRef<Worker | null>(null);
  const messageIdRef = useRef(0);
  const pendingMessages = useRef<Map<string, (response: PhysicsWorkerResponse) => void>>(new Map());

  // Inicializar worker
  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      try {
        workerRef.current = new Worker('/workers/physicsWorker.js');
        
        workerRef.current.onmessage = (e: MessageEvent<PhysicsWorkerResponse>) => {
          const response = e.data;
          
          if (response.id && pendingMessages.current.has(response.id)) {
            const callback = pendingMessages.current.get(response.id);
            if (callback) {
              callback(response);
              pendingMessages.current.delete(response.id);
            }
          }
          
          if (options.onMessage) {
            options.onMessage(response);
          }
        };
        
        workerRef.current.onerror = (error) => {
          console.error('Physics Worker Error:', error);
          if (options.onError) {
            options.onError(new Error('Physics worker error'));
          }
        };
        
      } catch (error) {
        console.error('Failed to create physics worker:', error);
        if (options.onError) {
          options.onError(error as Error);
        }
      }
    }
    
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [options]);

  // Função para enviar mensagem e aguardar resposta
  const sendMessage = useCallback((
    type: string, 
    data: any, 
    timeout = 5000
  ): Promise<PhysicsWorkerResponse> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'));
        return;
      }
      
      const id = `msg_${++messageIdRef.current}`;
      const message: PhysicsWorkerMessage = { type, data, id };
      
      // Configurar timeout
      const timeoutId = setTimeout(() => {
        pendingMessages.current.delete(id);
        reject(new Error('Worker message timeout'));
      }, timeout);
      
      // Configurar callback
      pendingMessages.current.set(id, (response) => {
        clearTimeout(timeoutId);
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
      
      // Enviar mensagem
      workerRef.current.postMessage(message);
    });
  }, []);

  // Cálculo de pêndulo
  const calculatePendulum = useCallback(async (params: {
    length: number;
    gravity: number;
    angle: number;
    time: number;
  }) => {
    const response = await sendMessage('PENDULUM_CALCULATION', params);
    return response.data;
  }, [sendMessage]);

  // Cálculo de bola saltitante
  const calculateBouncingBall = useCallback(async (params: {
    initialHeight: number;
    restitution: number;
    gravity: number;
    airResistance: number;
    time: number;
  }) => {
    const response = await sendMessage('BOUNCING_BALL_CALCULATION', params);
    return response.data;
  }, [sendMessage]);

  // Cálculo de ondas
  const calculateWave = useCallback(async (params: {
    amplitude: number;
    frequency: number;
    wavelength: number;
    phase: number;
    time: number;
    position: number;
  }) => {
    const response = await sendMessage('WAVE_CALCULATION', params);
    return response.data;
  }, [sendMessage]);

  // Cálculo de circuitos
  const calculateCircuit = useCallback(async (params: {
    voltage: number;
    resistance: number;
    capacitance?: number;
    inductance?: number;
    frequency?: number;
  }) => {
    const response = await sendMessage('CIRCUIT_CALCULATION', params);
    return response.data;
  }, [sendMessage]);

  // Cálculo de reações químicas
  const calculateChemicalReaction = useCallback(async (params: {
    reactants: Array<{ formula: string; concentration: number; volume: number }>;
    temperature: number;
    pressure: number;
    time: number;
  }) => {
    const response = await sendMessage('CHEMICAL_REACTION_CALCULATION', params);
    return response.data;
  }, [sendMessage]);

  // Cálculos em lote
  const calculateBatch = useCallback(async (calculations: Array<{
    type: string;
    params: any;
  }>) => {
    const response = await sendMessage('BATCH_CALCULATIONS', { calculations });
    return response.data;
  }, [sendMessage]);

  // Simulação em tempo real
  const simulateRealTime = useCallback((
    type: string,
    params: any,
    onUpdate: (result: any) => void,
    interval = 16
  ) => {
    if (!workerRef.current) {
      throw new Error('Worker not initialized');
    }
    
    let time = 0;
    const maxTime = params.maxTime || 10;
    
    const simulation = setInterval(async () => {
      if (time >= maxTime) {
        clearInterval(simulation);
        return;
      }
      
      try {
        const currentParams = { ...params, time };
        let result: any;
        
        switch (type) {
          case 'pendulum':
            result = await calculatePendulum(currentParams);
            break;
          case 'bouncing_ball':
            result = await calculateBouncingBall(currentParams);
            break;
          case 'wave':
            result = await calculateWave(currentParams);
            break;
          default:
            clearInterval(simulation);
            return;
        }
        
        onUpdate(result);
        time += interval / 1000;
        
      } catch (error) {
        console.error('Real-time simulation error:', error);
        clearInterval(simulation);
      }
    }, interval);
    
    return () => clearInterval(simulation);
  }, [calculatePendulum, calculateBouncingBall, calculateWave]);

  // Verificar se worker está disponível
  const isWorkerAvailable = useCallback(() => {
    return workerRef.current !== null;
  }, []);

  // Terminar worker
  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return {
    calculatePendulum,
    calculateBouncingBall,
    calculateWave,
    calculateCircuit,
    calculateChemicalReaction,
    calculateBatch,
    simulateRealTime,
    isWorkerAvailable,
    terminateWorker,
    sendMessage
  };
};

// Hook específico para pêndulo
export const usePendulumPhysics = () => {
  const worker = usePhysicsWorker();
  
  const calculatePendulumMotion = useCallback(async (params: {
    length: number;
    gravity: number;
    angle: number;
    time: number;
  }) => {
    return worker.calculatePendulum(params);
  }, [worker]);
  
  const simulatePendulumMotion = useCallback((
    params: any,
    onUpdate: (result: any) => void,
    interval = 16
  ) => {
    return worker.simulateRealTime('pendulum', params, onUpdate, interval);
  }, [worker]);
  
  return {
    calculatePendulumMotion,
    simulatePendulumMotion,
    isWorkerAvailable: worker.isWorkerAvailable
  };
};

// Hook específico para bola saltitante
export const useBouncingBallPhysics = () => {
  const worker = usePhysicsWorker();
  
  const calculateBouncingBallMotion = useCallback(async (params: {
    initialHeight: number;
    restitution: number;
    gravity: number;
    airResistance: number;
    time: number;
  }) => {
    return worker.calculateBouncingBall(params);
  }, [worker]);
  
  const simulateBouncingBallMotion = useCallback((
    params: any,
    onUpdate: (result: any) => void,
    interval = 16
  ) => {
    return worker.simulateRealTime('bouncing_ball', params, onUpdate, interval);
  }, [worker]);
  
  return {
    calculateBouncingBallMotion,
    simulateBouncingBallMotion,
    isWorkerAvailable: worker.isWorkerAvailable
  };
};

// Hook específico para ondas
export const useWavePhysics = () => {
  const worker = usePhysicsWorker();
  
  const calculateWaveMotion = useCallback(async (params: {
    amplitude: number;
    frequency: number;
    wavelength: number;
    phase: number;
    time: number;
    position: number;
  }) => {
    return worker.calculateWave(params);
  }, [worker]);
  
  const simulateWaveMotion = useCallback((
    params: any,
    onUpdate: (result: any) => void,
    interval = 16
  ) => {
    return worker.simulateRealTime('wave', params, onUpdate, interval);
  }, [worker]);
  
  return {
    calculateWaveMotion,
    simulateWaveMotion,
    isWorkerAvailable: worker.isWorkerAvailable
  };
};

// Hook específico para circuitos
export const useCircuitPhysics = () => {
  const worker = usePhysicsWorker();
  
  const calculateCircuitBehavior = useCallback(async (params: {
    voltage: number;
    resistance: number;
    capacitance?: number;
    inductance?: number;
    frequency?: number;
  }) => {
    return worker.calculateCircuit(params);
  }, [worker]);
  
  return {
    calculateCircuitBehavior,
    isWorkerAvailable: worker.isWorkerAvailable
  };
};

// Hook específico para reações químicas
export const useChemicalReactionPhysics = () => {
  const worker = usePhysicsWorker();
  
  const calculateReactionKinetics = useCallback(async (params: {
    reactants: Array<{ formula: string; concentration: number; volume: number }>;
    temperature: number;
    pressure: number;
    time: number;
  }) => {
    return worker.calculateChemicalReaction(params);
  }, [worker]);
  
  return {
    calculateReactionKinetics,
    isWorkerAvailable: worker.isWorkerAvailable
  };
};
