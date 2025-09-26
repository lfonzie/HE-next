'use client';

import { VirtualLabSimulator } from '@/components/virtual-lab-simulator/VirtualLabSimulator';
import { ExperimentID } from '@/components/virtual-lab-simulator/types/experiment';

export default function VirtualLabPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen">
        <VirtualLabSimulator 
          initialExperiment={ExperimentID.CHEMICAL_REACTION}
          showSidebar={true}
          enableFullscreen={true}
        />
      </div>
    </div>
  );
}
