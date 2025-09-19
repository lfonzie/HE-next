'use client';

import { useState, useEffect } from 'react';
import PWAManager from './PWAManager';

interface PWAManagerWrapperProps {
  onInstall?: () => void;
  onUpdate?: () => void;
}

export default function PWAManagerWrapper({ onInstall, onUpdate }: PWAManagerWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <PWAManager onInstall={onInstall} onUpdate={onUpdate} />;
}
