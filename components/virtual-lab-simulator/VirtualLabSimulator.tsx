'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { EnhancedExperimentView } from './components/EnhancedExperimentView';
import { Experiment, ExperimentID } from './types/experiment';
import { experiments } from './services/experimentData';

interface VirtualLabSimulatorProps {
  initialExperiment?: ExperimentID;
  showSidebar?: boolean;
  enableFullscreen?: boolean;
  onExperimentChange?: (experiment: Experiment) => void;
}

export const VirtualLabSimulator: React.FC<VirtualLabSimulatorProps> = ({
  initialExperiment = ExperimentID.CHEMICAL_REACTION,
  showSidebar = true,
  enableFullscreen = true,
  onExperimentChange
}) => {
  const [activeExperimentId, setActiveExperimentId] = useState<ExperimentID>(initialExperiment);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeExperiment = useMemo(() => {
    return experiments.find(exp => exp.id === activeExperimentId) || experiments[0];
  }, [activeExperimentId]);

  const handleExperimentChange = (experimentId: ExperimentID) => {
    setActiveExperimentId(experimentId);
    const experiment = experiments.find(exp => exp.id === experimentId);
    if (experiment && onExperimentChange) {
      onExperimentChange(experiment);
    }
  };

  const toggleFullscreen = () => {
    if (!enableFullscreen) return;
    
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className={`flex h-full font-sans antialiased overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''
    }`}>
      {showSidebar && (
        <Sidebar
          experiments={experiments}
          activeExperimentId={activeExperimentId}
          onSelectExperiment={handleExperimentChange}
        />
      )}
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <EnhancedExperimentView 
          experiment={activeExperiment} 
          key={activeExperiment.id}
        />
      </main>
    </div>
  );
};
