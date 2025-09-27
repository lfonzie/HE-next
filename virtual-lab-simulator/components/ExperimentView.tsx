
import React from 'react';
import { Experiment } from '../types';
import { Card } from './ui/Card';

interface ExperimentViewProps {
  experiment: Experiment;
}

export const ExperimentView: React.FC<ExperimentViewProps> = ({ experiment }) => {
  const ExperimentComponent = experiment.component;
  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">{experiment.name}</h2>
        <p className="text-slate-400 mt-1">{experiment.description}</p>
      </div>
      <Card className="flex-1 flex flex-col">
        <ExperimentComponent />
      </Card>
    </div>
  );
};
