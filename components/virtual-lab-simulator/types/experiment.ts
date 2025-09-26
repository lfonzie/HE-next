import React from 'react';

export enum ExperimentID {
  CHEMICAL_REACTION = 'chemical-reaction',
  PENDULUM = 'pendulum',
  BOUNCING_BALL = 'bouncing-ball',
  COLOR_MIXING = 'color-mixing',
}

export interface Experiment {
  id: ExperimentID;
  name: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  component: React.FC;
  category: 'chemistry' | 'physics' | 'optics';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // em minutos
  tags: string[];
}

export interface ExperimentParameters {
  [key: string]: number | string | boolean;
}

export interface ExperimentState {
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number;
  parameters: ExperimentParameters;
  results: any[];
  errors: string[];
}

export interface ExperimentResult {
  timestamp: number;
  data: any;
  observations: string[];
  measurements: Record<string, number>;
}

export interface ExperimentConfig {
  id: ExperimentID;
  name: string;
  parameters: {
    [key: string]: {
      type: 'number' | 'string' | 'boolean' | 'select';
      min?: number;
      max?: number;
      step?: number;
      options?: string[];
      default: any;
      label: string;
      description: string;
    };
  };
  outputs: {
    [key: string]: {
      type: 'graph' | 'table' | 'text' | 'image';
      label: string;
      description: string;
    };
  };
}
