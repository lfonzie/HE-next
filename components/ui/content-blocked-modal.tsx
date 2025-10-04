'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, BookOpen } from 'lucide-react';

interface ContentBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  alternative?: string;
}

export function ContentBlockedModal({ 
  isOpen, 
  onClose, 
  reason = "Conteúdo não apropriado para ambiente educacional",
  alternative = "Tente reformular sua pergunta de forma mais educativa"
}: ContentBlockedModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Conteúdo Bloqueado
          </DialogTitle>
          <DialogDescription>
            Este conteúdo foi identificado como não apropriado para o ambiente educacional.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <Shield className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Motivo do bloqueio:
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {reason}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Sugestão educativa:
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {alternative}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Entendi
            </Button>
            <Button onClick={onClose}>
              Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}