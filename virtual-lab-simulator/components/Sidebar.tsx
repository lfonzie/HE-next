import React from 'react';
import { Experiment, ExperimentID } from '../types';
import { FlaskIcon } from './icons/FlaskIcon';

interface SidebarProps {
  experiments: Experiment[];
  activeExperimentId: ExperimentID;
  onSelectExperiment: (id: ExperimentID) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ experiments, activeExperimentId, onSelectExperiment }) => {
  return (
    <aside className="w-16 sm:w-64 bg-black/20 backdrop-blur-lg border-r border-white/10 p-2 sm:p-4 flex flex-col space-y-2 shrink-0">
      <h1 className="text-xl sm:text-2xl font-bold text-cyan-300 pb-4 border-b border-white/10 hidden sm:block">
        Laboratório Virtual
      </h1>
       <div className="w-full text-center sm:hidden pb-4 border-b border-white/10">
         <FlaskIcon className="w-8 h-8 text-cyan-300 mx-auto" />
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
                  className={`w-full flex items-center justify-center sm:justify-start space-x-3 p-3 my-1 rounded-lg text-left text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 relative ${
                    isActive
                      ? 'bg-cyan-400/20 text-cyan-200'
                      : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-cyan-400 rounded-r-full hidden sm:block"></div>}
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
