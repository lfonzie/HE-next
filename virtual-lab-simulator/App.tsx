
import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ExperimentView } from './components/ExperimentView';
import { Experiment, ExperimentID } from './types';
import { ColorMixingLab } from './components/experiments/ColorMixingLab';
import { PendulumLab } from './components/experiments/PendulumLab';
import { BouncingBallLab } from './components/experiments/BouncingBallLab';
import { ChemistryLab } from './components/experiments/ChemistryLab';
import { FlaskIcon } from './components/icons/FlaskIcon';
import { PendulumIcon } from './components/icons/PendulumIcon';
import { BallIcon } from './components/icons/BallIcon';
import { BeakerIcon } from './components/icons/BeakerIcon';

const App: React.FC = () => {
  const experiments: Experiment[] = useMemo(() => [
    {
      id: ExperimentID.COLOR_MIXING,
      name: 'Color Mixing',
      description: 'Mix red, green, and blue light to create different colors. Adjust the intensity of each color channel and observe the result.',
      icon: FlaskIcon,
      component: ColorMixingLab,
    },
    {
      id: ExperimentID.PENDULUM,
      name: 'Pendulum Motion',
      description: 'Observe the simple harmonic motion of a pendulum. Adjust its length and initial angle to see how it affects the period.',
      icon: PendulumIcon,
      component: PendulumLab,
    },
    {
      id: ExperimentID.BOUNCING_BALL,
      name: 'Bouncing Ball',
      description: 'Explore gravity and elasticity. Adjust the "bounciness" (coefficient of restitution) of the ball and watch how it behaves.',
      icon: BallIcon,
      component: BouncingBallLab,
    },
    {
      id: ExperimentID.CHEMISTRY_LAB,
      name: 'Chemistry Lab',
      description: 'Simulate chemical reactions by mixing reagents. This lab uses AI to predict outcomes, visualize effects, and explain the underlying chemistry.',
      icon: BeakerIcon,
      component: ChemistryLab,
    },
  ], []);

  const [activeExperimentId, setActiveExperimentId] = useState<ExperimentID>(experiments[0].id);

  const activeExperiment = experiments.find(e => e.id === activeExperimentId) || experiments[0];

  return (
    <div className="flex h-screen font-sans bg-slate-900 text-slate-200 overflow-hidden">
      <Sidebar
        experiments={experiments}
        activeExperimentId={activeExperimentId}
        onSelectExperiment={setActiveExperimentId}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <ExperimentView experiment={activeExperiment} key={activeExperiment.id} />
      </main>
    </div>
  );
};

export default App;