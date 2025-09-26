
import React from 'react';
import { Experiment } from '../types';
import { Card } from './ui/Card';

interface ExperimentViewProps {
  experiment: Experiment;
}

export const ExperimentView: React.FC<ExperimentViewProps> = ({ experiment }) => {
  const ExperimentComponent = experiment.component;
  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in">
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">{experiment.name}</h2>
        <p className="text-slate-400 mt-1 max-w-2xl">{experiment.description}</p>
      </div>
      <Card className="flex-1 flex flex-col min-h-0">
        <ExperimentComponent />
      </Card>
    </div>
  );
};
