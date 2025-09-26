import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ExperimentView } from './components/ExperimentView';
import { Experiment, ExperimentID } from './types';
import { ChemicalReactionLab } from './components/experiments/ChemicalReactionLab';
import { PendulumLab } from './components/experiments/PendulumLab';
import { BouncingBallLab } from './components/experiments/BouncingBallLab';
import { FlaskIcon } from './components/icons/FlaskIcon';
import { PendulumIcon } from './components/icons/PendulumIcon';
import { BallIcon } from './components/icons/BallIcon';

const App: React.FC = () => {
  const experiments: Experiment[] = useMemo(() => [
    {
      id: ExperimentID.CHEMICAL_REACTION,
      name: 'Reação Química',
      description: 'Misture compostos químicos e veja a IA prever o resultado, com explicações científicas e efeitos visuais.',
      icon: FlaskIcon,
      component: ChemicalReactionLab,
    },
    {
      id: ExperimentID.PENDULUM,
      name: 'Movimento Pendular',
      description: 'Observe o movimento harmônico simples. Ajuste o comprimento e o ângulo para ver como isso afeta o período.',
      icon: PendulumIcon,
      component: PendulumLab,
    },
    {
      id: ExperimentID.BOUNCING_BALL,
      name: 'Bola Saltitante',
      description: 'Explore gravidade e elasticidade. Ajuste o coeficiente de restituição e observe o comportamento da bola.',
      icon: BallIcon,
      component: BouncingBallLab,
    },
  ], []);

  const [activeExperimentId, setActiveExperimentId] = useState<ExperimentID>(experiments[0].id);

  const activeExperiment = experiments.find(e => e.id === activeExperimentId) || experiments[0];

  return (
    <div className="flex h-screen font-sans antialiased overflow-hidden">
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
