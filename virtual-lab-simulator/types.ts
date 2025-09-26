import React from 'react';

export enum ExperimentID {
  CHEMICAL_REACTION = 'chemical-reaction',
  PENDULUM = 'pendulum',
  BOUNCING_BALL = 'bouncing-ball',
}

export interface Experiment {
  id: ExperimentID;
  name: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  component: React.FC;
}