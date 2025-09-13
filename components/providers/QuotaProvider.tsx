// components/providers/QuotaProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface QuotaContextType {
  quota: number;
  maxQuota: number;
  isLoading: boolean;
  error: string | null;
  decrementQuota: () => void;
  resetQuota: () => void;
}

const QuotaContext = createContext<QuotaContextType | undefined>(undefined);

export function QuotaProvider({ children }: { children: React.ReactNode }) {
  const [quota, setQuota] = useState(Infinity); // No limit
  const [maxQuota] = useState(Infinity);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decrementQuota = () => {
    // No-op since there's no limit
  };

  const resetQuota = () => {
    // No-op since there's no limit
  };

  const value: QuotaContextType = {
    quota,
    maxQuota,
    isLoading,
    error,
    decrementQuota,
    resetQuota,
  };

  return (
    <QuotaContext.Provider value={value}>
      {children}
    </QuotaContext.Provider>
  );
}

export function useQuota() {
  const context = useContext(QuotaContext);
  if (context === undefined) {
    throw new Error('useQuota must be used within a QuotaProvider');
  }
  return context;
}