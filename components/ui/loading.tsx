"use client";

import React, { createContext, useContext, useMemo, useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

type LoadingKey = string;
type LoadingPhase = "idle" | "waiting" | "streaming" | "error" | "success";
type LoadingSize = "xs" | "sm" | "md" | "lg" | "xl";
type LoadingVariant = "spinner" | "dots" | "pulse" | "skeleton" | "bars" | "ring";
type LoadingPriority = "low" | "normal" | "high" | "critical";

interface LoadingState {
  key: LoadingKey;
  phase: LoadingPhase;
  message?: string;
  progress?: number;
  cancelable?: boolean;
  onCancel?: () => void;
  priority?: LoadingPriority;
  timeout?: number;
  startTime?: number;
  estimatedDuration?: number;
  metadata?: Record<string, any>;
}

interface LoadingContextType {
  start: (key?: LoadingKey, options?: LoadingOptions) => LoadingKey;
  update: (key: LoadingKey, updates: Partial<LoadingState>) => void;
  end: (key: LoadingKey, result?: "success" | "error") => void;
  cancel: (key?: LoadingKey) => void;
  isVisible: boolean;
  currentPhase: LoadingPhase;
  activeLoadings: LoadingState[];
  hasErrors: boolean;
  progress: number;
}

interface LoadingOptions {
  message?: string;
  cancelable?: boolean;
  onCancel?: () => void;
  priority?: LoadingPriority;
  timeout?: number;
  estimatedDuration?: number;
  showOverlay?: boolean;
  metadata?: Record<string, any>;
}

// ============================================================================
// CONTEXTO E PROVIDER
// ============================================================================

const LoadingContext = createContext<LoadingContextType | null>(null);

export const LoadingProvider: React.FC<{ 
  children: React.ReactNode;
  defaultTimeout?: number;
  maxConcurrentLoadings?: number;
}> = ({ 
  children, 
  defaultTimeout = 30000,
  maxConcurrentLoadings = 10 
}) => {
  const [loadings, setLoadings] = useState<Map<LoadingKey, LoadingState>>(new Map());
  const timeoutRefs = useRef<Map<LoadingKey, NodeJS.Timeout>>(new Map());

  const start = useCallback((key?: LoadingKey, options?: LoadingOptions) => {
    const loadingKey = key ?? `loading-${typeof window !== 'undefined' ? Date.now() : 0}-${typeof window !== 'undefined' ? Math.random().toString(36).substr(2, 9) : 'server'}`;
    
    if (loadings.size >= maxConcurrentLoadings) {
      console.warn(`Maximum concurrent loadings (${maxConcurrentLoadings}) reached.`);
    }

    const timeout = options?.timeout ?? defaultTimeout;
    
    setLoadings(prev => new Map(prev.set(loadingKey, {
      key: loadingKey,
      phase: "waiting",
      message: options?.message || "Carregando…",
      cancelable: options?.cancelable || false,
      onCancel: options?.onCancel,
      priority: options?.priority || "normal",
      timeout,
      startTime: typeof window !== 'undefined' ? Date.now() : 0,
      estimatedDuration: options?.estimatedDuration,
      metadata: options?.metadata || {}
    })));

    if (timeout > 0) {
      const timeoutId = setTimeout(() => {
        setLoadings(prev => {
          const current = prev.get(loadingKey);
          if (!current) return prev;
          
          const updated = new Map(prev);
          updated.set(loadingKey, { ...current, phase: "error", message: "Tempo limite excedido" });
          return updated;
        });
      }, timeout);
      
      timeoutRefs.current.set(loadingKey, timeoutId);
    }
    
    return loadingKey;
  }, [loadings.size, maxConcurrentLoadings, defaultTimeout]);

  const update = useCallback((key: LoadingKey, updates: Partial<LoadingState>) => {
    setLoadings(prev => {
      const current = prev.get(key);
      if (!current) return prev;
      
      const updated = new Map(prev);
      updated.set(key, { ...current, ...updates });
      return updated;
    });
  }, []);

  const end = useCallback((key: LoadingKey, result: "success" | "error" = "success") => {
    const timeoutId = timeoutRefs.current.get(key);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(key);
    }

    if (result !== "success") {
      update(key, { phase: result });
      
      setTimeout(() => {
        setLoadings(prev => {
          const updated = new Map(prev);
          updated.delete(key);
          return updated;
        });
      }, 2000);
    } else {
      setLoadings(prev => {
        const updated = new Map(prev);
        updated.delete(key);
        return updated;
      });
    }
  }, [update]);

  const cancel = useCallback((key?: LoadingKey) => {
    if (key) {
      const loading = loadings.get(key);
      loading?.onCancel?.();
      
      const timeoutId = timeoutRefs.current.get(key);
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutRefs.current.delete(key);
      }
      
      end(key);
    } else {
      loadings.forEach((loading, loadingKey) => {
        loading.onCancel?.();
        
        const timeoutId = timeoutRefs.current.get(loadingKey);
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutRefs.current.delete(loadingKey);
        }
      });
      setLoadings(new Map());
    }
  }, [loadings, end]);

  useEffect(() => {
    const currentTimeouts = timeoutRefs.current;
    return () => {
      currentTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
      currentTimeouts.clear();
    };
  }, []);

  const activeLoadings = Array.from(loadings.values()).sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
    return priorityOrder[b.priority || "normal"] - priorityOrder[a.priority || "normal"];
  });

  const isVisible = loadings.size > 0;
  const currentPhase = loadings.size > 0 ? activeLoadings[0].phase : "idle";
  const hasErrors = activeLoadings.some(l => l.phase === "error");
  
  const progress = useMemo(() => {
    const loadingsWithProgress = activeLoadings.filter(l => l.progress !== undefined);
    if (loadingsWithProgress.length === 0) return 0;
    
    const totalProgress = loadingsWithProgress.reduce((sum, l) => sum + (l.progress || 0), 0);
    return totalProgress / loadingsWithProgress.length;
  }, [activeLoadings]);

  const value = useMemo<LoadingContextType>(() => ({
    start,
    update,
    end,
    cancel,
    isVisible,
    currentPhase,
    activeLoadings,
    hasErrors,
    progress
  }), [start, update, end, cancel, isVisible, currentPhase, activeLoadings, hasErrors, progress]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlay />
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
};

// ============================================================================
// COMPONENTES DE LOADING
// ============================================================================

export const Spinner: React.FC<{ 
  size?: LoadingSize; 
  className?: string;
  variant?: LoadingVariant;
  color?: string;
}> = ({ size = "md", className, variant = "spinner", color }) => {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const colorClass = color ? `text-${color}` : "text-current";

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-current animate-bounce",
              size === "xs" ? "w-1 h-1" : 
              size === "sm" ? "w-1.5 h-1.5" : 
              size === "md" ? "w-2 h-2" : 
              size === "lg" ? "w-3 h-3" : "w-4 h-4",
              colorClass
            )}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn(
        "rounded-full bg-current animate-pulse",
        sizeClasses[size],
        colorClass,
        className
      )} />
    );
  }

  if (variant === "bars") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-current animate-pulse",
              size === "xs" ? "w-0.5 h-3" : 
              size === "sm" ? "w-1 h-4" : 
              size === "md" ? "w-1 h-6" : 
              size === "lg" ? "w-1.5 h-8" : "w-2 h-10",
              colorClass
            )}
            style={{ 
              animationDelay: `${i * 0.15}s`,
              animationDuration: "1.2s"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "ring") {
    return (
      <div className={cn(
        "animate-spin rounded-full border-4 border-current/20 border-t-current",
        sizeClasses[size],
        colorClass,
        className
      )} />
    );
  }

  return (
    <div className={cn(
      "animate-spin rounded-full border-2 border-current border-t-transparent",
      sizeClasses[size],
      colorClass,
      className
    )} />
  );
};

export const ProgressBar: React.FC<{
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  variant?: "default" | "success" | "error" | "warning";
  animated?: boolean;
  size?: "sm" | "md" | "lg";
}> = ({ 
  value, 
  max = 100, 
  className, 
  showPercentage = true,
  variant = "default",
  animated = false,
  size = "md"
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const variantClasses = {
    default: "bg-yellow-400",
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500"
  };

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn(
        "bg-gray-800 rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <div 
          className={cn(
            "rounded-full transition-all duration-500 ease-out",
            variantClasses[variant],
            animated && "animate-pulse"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-xs text-gray-400 mt-1 text-center">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

export const LoadingCard: React.FC<{
  message?: string;
  className?: string;
  showProgress?: boolean;
  progress?: number;
  variant?: LoadingVariant;
  size?: LoadingSize;
  estimatedTime?: number;
  onCancel?: () => void;
  phase?: LoadingPhase;
}> = ({ 
  message = "Carregando…", 
  className,
  showProgress = false,
  progress = 0,
  variant = "spinner",
  size = "lg",
  estimatedTime,
  onCancel,
  phase = "waiting"
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const phaseColors = {
    idle: "text-yellow-200/60",
    waiting: "text-yellow-300",
    streaming: "text-yellow-400",
    error: "text-red-300",
    success: "text-yellow-400"
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 bg-gray-800/90 rounded-lg border border-gray-700/50 shadow-sm",
      className
    )}>
      <Spinner size={size} variant={variant} className={cn("mb-4", phaseColors[phase])} />
      
      <p className={cn("font-medium mb-2", phaseColors[phase])}>{message}</p>
      
      {showProgress && (
        <div className="w-full max-w-xs mb-2">
          <ProgressBar 
            value={progress} 
            variant={phase === "error" ? "error" : "default"}
            animated={phase === "streaming"}
          />
        </div>
      )}

      <div className="text-xs text-yellow-200/70 space-y-1 text-center">
        <div>Tempo decorrido: {formatTime(elapsedTime)}</div>
        {estimatedTime && (
          <div>Tempo estimado: {formatTime(estimatedTime)}</div>
        )}
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-4 px-3 py-1 text-xs bg-red-600/80 text-yellow-100 border border-red-500/50 rounded hover:bg-red-700/80 transition-colors"
        >
          Cancelar
        </button>
      )}
    </div>
  );
};

export const LoadingOverlay: React.FC = () => {
  const { isVisible, activeLoadings, cancel, hasErrors } = useLoading();
  
  if (!isVisible || activeLoadings.length === 0) return null;

  const currentLoading = activeLoadings[0];
  const hasMultiple = activeLoadings.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl w-[min(90vw,400px)] text-center border border-gray-700/50">
        <div className="flex flex-col items-center gap-4">
          {hasErrors ? (
            <div className="text-red-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ) : (
            <Spinner size="xl" className="text-yellow-400" variant="ring" />
          )}

          <div className="space-y-2">
            <p className={cn(
              "text-sm font-medium",
              hasErrors ? "text-red-300" : "text-yellow-300"
            )}>
              {currentLoading.message}
            </p>
            
            {hasMultiple && (
              <p className="text-xs text-yellow-200/80">
                {activeLoadings.length - 1} outras operações em andamento
              </p>
            )}
          </div>

          {currentLoading.progress !== undefined && (
            <div className="w-full max-w-xs">
              <ProgressBar 
                value={currentLoading.progress}
                variant={hasErrors ? "error" : "default"}
                animated={currentLoading.phase === "streaming"}
              />
            </div>
          )}

          <div className="flex gap-2">
            {currentLoading.cancelable && (
              <button
                onClick={() => cancel(currentLoading.key)}
                className="px-4 py-2 text-sm bg-red-600/80 text-yellow-100 border border-red-500/50 rounded-md hover:bg-red-700/80 transition-colors"
              >
                Cancelar
              </button>
            )}
            
            {hasMultiple && (
              <button
                onClick={() => cancel()}
                className="px-4 py-2 text-sm bg-gray-600/80 text-yellow-100 border border-gray-500/50 rounded-md hover:bg-gray-700/80 transition-colors"
              >
                Cancelar Tudo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HOOKS
// ============================================================================

export const useLoadingState = (defaultOptions?: LoadingOptions) => {
  const { start, update, end } = useLoading();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const withLoading = useCallback(async <T,>(
    asyncFn: () => Promise<T>,
    options?: LoadingOptions
  ): Promise<T> => {
    const finalOptions = { ...defaultOptions, ...options };
    const key = start(undefined, finalOptions);
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      end(key, "success");
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      update(key, { 
        phase: "error", 
        message: error.message || "Erro inesperado" 
      });
      end(key, "error");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [start, update, end, defaultOptions]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { 
    loading, 
    error, 
    setLoading, 
    withLoading, 
    reset 
  };
};

export const useProgressLoading = () => {
  const { start, update, end } = useLoading();
  
  const startWithProgress = useCallback((
    key?: string,
    options?: LoadingOptions & { steps?: number; stepDuration?: number }
  ) => {
    const loadingKey = start(key, options);
    const steps = options?.steps || 10;
    const stepDuration = options?.stepDuration || 200;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = (currentStep / steps) * 100;
      
      update(loadingKey, { 
        progress,
        phase: progress < 100 ? "streaming" : "waiting"
      });
      
      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);
    
    return {
      key: loadingKey,
      complete: () => {
        clearInterval(interval);
        end(loadingKey, "success");
      },
      error: (message?: string) => {
        clearInterval(interval);
        update(loadingKey, { phase: "error", message: message || "Erro" });
        end(loadingKey, "error");
      }
    };
  }, [start, update, end]);
  
  return { startWithProgress };
};

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

export const Skeleton: React.FC<{ 
  className?: string;
  variant?: "default" | "circular" | "rectangular";
}> = ({ className, variant = "default" }) => {
  const variantClasses = {
    default: "rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-none"
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-gray-700",
        variantClasses[variant],
        className
      )}
    />
  );
};

export const ChatSkeleton: React.FC<{
  className?: string;
  messageCount?: number;
}> = ({ className, messageCount = 3 }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: messageCount }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-3/4" />
            {i === 0 && <Skeleton className="h-4 w-1/2" />}
          </div>
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{
  className?: string;
  showImage?: boolean;
  showActions?: boolean;
}> = ({ className, showImage = true, showActions = true }) => {
  return (
    <div className={cn("bg-gray-800 rounded-lg border border-gray-700 p-4 space-y-3", className)}>
      {showImage && <Skeleton className="h-32 w-full rounded-md" />}
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      {showActions && (
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTES ADICIONAIS
// ============================================================================

export const LoadingButton: React.FC<{
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}> = ({ 
  loading = false, 
  children, 
  className, 
  disabled,
  onClick,
  variant = "default",
  size = "md"
}) => {
  const variantClasses = {
    default: "bg-yellow-400 text-black hover:bg-yellow-500",
    outline: "border border-gray-600 bg-transparent hover:bg-gray-800",
    ghost: "hover:bg-gray-800"
  };

  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-lg"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <Spinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
};

export const LoadingInput: React.FC<{
  loading?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ 
  loading = false, 
  placeholder = "Digite algo...", 
  className, 
  disabled,
  value,
  onChange
}) => {
  return (
    <div className="relative">
      <input
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        placeholder={placeholder}
        disabled={disabled || loading}
        value={value}
        onChange={onChange}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Spinner size="sm" />
        </div>
      )}
    </div>
  );
};

export const useButtonLoading = () => {
  const [loading, setLoading] = useState(false);
  
  const withLoading = useCallback(async <T,>(
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    setLoading(true);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, setLoading, withLoading };
};

export const useInputLoading = () => {
  const [loading, setLoading] = useState(false);
  
  const withLoading = useCallback(async <T,>(
    asyncFn: () => Promise<T>
  ): Promise<T> => {
    setLoading(true);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, setLoading, withLoading };
};

// ============================================================================
// EXPORTS
// ============================================================================

const LoadingComponents = {
  LoadingProvider,
  useLoading,
  Spinner,
  LoadingCard,
  ProgressBar,
  useLoadingState,
  useProgressLoading,
  Skeleton,
  ChatSkeleton,
  CardSkeleton,
  LoadingButton,
  LoadingInput,
  useButtonLoading,
  useInputLoading
};

export default LoadingComponents;