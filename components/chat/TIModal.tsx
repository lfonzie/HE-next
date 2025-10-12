'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TIResolutionSteps } from './TIResolutionSteps';
import { Laptop, Wrench } from 'lucide-react';

interface TIModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  onStepComplete: (stepId: number, success?: boolean) => void;
  isLoading?: boolean;
}

export function TIModal({ isOpen, onClose, data, onStepComplete, isLoading }: TIModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Laptop className="text-white text-sm w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Resolução de Problemas Técnicos</h2>
              <p className="text-sm text-muted-foreground">Suporte técnico passo a passo</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {data && (
            <TIResolutionSteps
              data={data}
              onStepComplete={onStepComplete}
              isLoading={isLoading}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
