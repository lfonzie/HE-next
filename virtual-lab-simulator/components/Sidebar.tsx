import React from 'react';
import { Experiment, ExperimentID } from '../types';
// FIX: Import the FlaskIcon component to resolve the reference error.
import { FlaskIcon } from './icons/FlaskIcon';

interface SidebarProps {
  experiments: Experiment[];
  activeExperimentId: ExperimentID;
  onSelectExperiment: (id: ExperimentID) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ experiments, activeExperimentId, onSelectExperiment }) => {
  return (
    <aside className="w-16 sm:w-64 bg-slate-800/50 border-r border-slate-700 p-2 sm:p-4 flex flex-col space-y-2">
      <h1 className="text-xl sm:text-2xl font-bold text-cyan-400 pb-4 border-b border-slate-700 hidden sm:block">
        Virtual Lab
      </h1>
       <div className="w-full text-center sm:hidden pb-4 border-b border-slate-700">
         <FlaskIcon className="w-8 h-8 text-cyan-400 mx-auto" />
       </div>
      <nav className="flex-1">
        <ul>
          {experiments.map((exp) => {
            const Icon = exp.icon;
            const isActive = exp.id === activeExperimentId;
            return (
              <li key={exp.id}>
                <button
                  onClick={() => onSelectExperiment(exp.id)}
                  className={`w-full flex items-center justify-center sm:justify-start space-x-3 p-3 my-1 rounded-lg text-left text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-6 h-6 flex-shrink-0" />
                  <span className="hidden sm:inline">{exp.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};
