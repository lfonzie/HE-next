// components/providers/QuotaProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface QuotaContextType {
  quota: {
    used: number;
    limit: number;
  };
  maxQuota: number;
  isLoading: boolean;
  error: string | null;
  decrementQuota: () => void;
  resetQuota: () => void;
  isLimitReached: boolean;
  consumeQuota: () => void;
}

const QuotaContext = createContext<QuotaContextType | undefined>(undefined);

export function QuotaProvider({ children }: { children: React.ReactNode }) {
  const [quotaState, setQuotaState] = useState({ used: 0, limit: Infinity }); // No limit
  const [maxQuota] = useState(Infinity);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const decrementQuota = () => {
    // No-op since there's no limit
  };

  const resetQuota = () => {
    setQuotaState({ used: 0, limit: Infinity });
  };

  const consumeQuota = () => {
    setQuotaState(prev => ({ ...prev, used: prev.used + 1 }));
  };

  const isLimitReached = quotaState.used >= quotaState.limit;

  const value: QuotaContextType = {
    quota: quotaState,
    maxQuota,
    isLoading,
    error,
    decrementQuota,
    resetQuota,
    isLimitReached,
    consumeQuota,
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