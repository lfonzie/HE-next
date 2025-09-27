
import React from 'react';

export enum ExperimentID {
  COLOR_MIXING = 'color-mixing',
  PENDULUM = 'pendulum',
  BOUNCING_BALL = 'bouncing-ball',
  CHEMISTRY_LAB = 'chemistry-lab',
}

export interface Experiment {
  id: ExperimentID;
  name: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  component: React.FC;
}