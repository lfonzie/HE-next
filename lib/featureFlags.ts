import { useEffect, useState, useCallback, createContext, useContext, ReactNode } from 'react';

// Feature flag types
interface FeatureFlag {
  key: string;
  value: boolean | string | number;
  variation?: string;
  reason?: string;
  version?: number;
}

interface FeatureFlags {
  [key: string]: FeatureFlag;
}

// LaunchDarkly configuration
interface LaunchDarklyConfig {
  clientSideId: string;
  user?: {
    key: string;
    name?: string;
    email?: string;
    custom?: Record<string, any>;
  };
  options?: {
    streaming?: boolean;
    pollingInterval?: number;
    offline?: boolean;
  };
}

// Feature flag context
interface FeatureFlagContextType {
  flags: FeatureFlags;
  loading: boolean;
  error: string | null;
  getFlag: (key: string, defaultValue?: any) => any;
  isEnabled: (key: string) => boolean;
  getStringFlag: (key: string, defaultValue?: string) => string;
  getNumberFlag: (key: string, defaultValue?: number) => number;
  refreshFlags: () => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

// LaunchDarkly client (mock implementation)
class LaunchDarklyClient {
  private config: LaunchDarklyConfig;
  private flags: FeatureFlags = {};
  private listeners: Array<(flags: FeatureFlags) => void> = [];
  private isInitialized = false;

  constructor(config: LaunchDarklyConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // In a real implementation, this would connect to LaunchDarkly
      // For now, we'll use a mock implementation
      await this.loadFlags();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize LaunchDarkly:', error);
      throw error;
    }
  }

  private async loadFlags(): Promise<void> {
    // Mock flags for development
    const mockFlags: FeatureFlags = {
      'ai-powered-induction': {
        key: 'ai-powered-induction',
        value: true,
        variation: 'enabled',
        reason: 'default',
        version: 1,
      },
      'ar-vr-integration': {
        key: 'ar-vr-integration',
        value: false,
        variation: 'disabled',
        reason: 'default',
        version: 1,
      },
      'blockchain-certificates': {
        key: 'blockchain-certificates',
        value: true,
        variation: 'enabled',
        reason: 'default',
        version: 1,
      },
      'community-forums': {
        key: 'community-forums',
        value: true,
        variation: 'enabled',
        reason: 'default',
        version: 1,
      },
      'pretest-skips': {
        key: 'pretest-skips',
        value: false,
        variation: 'disabled',
        reason: 'default',
        version: 1,
      },
      'advanced-analytics': {
        key: 'advanced-analytics',
        value: true,
        variation: 'enabled',
        reason: 'default',
        version: 1,
      },
      'offline-mode': {
        key: 'offline-mode',
        value: true,
        variation: 'enabled',
        reason: 'default',
        version: 1,
      },
      'voice-engine-fallback': {
        key: 'voice-engine-fallback',
        value: true,
        variation: 'enabled',
        reason: 'default',
        version: 1,
      },
    };

    this.flags = mockFlags;
    this.notifyListeners();
  }

  getFlag(key: string, defaultValue?: any): any {
    const flag = this.flags[key];
    return flag ? flag.value : defaultValue;
  }

  isEnabled(key: string): boolean {
    const flag = this.flags[key];
    return flag ? Boolean(flag.value) : false;
  }

  getStringFlag(key: string, defaultValue?: string): string {
    const flag = this.flags[key];
    return flag ? String(flag.value) : (defaultValue || '');
  }

  getNumberFlag(key: string, defaultValue?: number): number {
    const flag = this.flags[key];
    return flag ? Number(flag.value) : (defaultValue || 0);
  }

  getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }

  addListener(listener: (flags: FeatureFlags) => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: (flags: FeatureFlags) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.flags));
  }

  async refresh(): Promise<void> {
    await this.loadFlags();
  }
}

// Global LaunchDarkly client instance
let launchDarklyClient: LaunchDarklyClient | null = null;

// Initialize LaunchDarkly
export function initializeLaunchDarkly(config: LaunchDarklyConfig): LaunchDarklyClient {
  if (launchDarklyClient) {
    return launchDarklyClient;
  }

  launchDarklyClient = new LaunchDarklyClient(config);
  return launchDarklyClient;
}

// Get LaunchDarkly client
export function getLaunchDarklyClient(): LaunchDarklyClient | null {
  return launchDarklyClient;
}

// Feature flag provider component
interface FeatureFlagProviderProps {
  children: ReactNode;
  config: LaunchDarklyConfig;
}

export function FeatureFlagProvider({ children, config }: FeatureFlagProviderProps) {
  const [flags, setFlags] = useState<FeatureFlags>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const client = useCallback(() => {
    if (!launchDarklyClient) {
      launchDarklyClient = new LaunchDarklyClient(config);
    }
    return launchDarklyClient;
  }, [config]);

  useEffect(() => {
    const initializeClient = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const ldClient = client();
        await ldClient.initialize();
        
        setFlags(ldClient.getAllFlags());
        
        // Listen for flag changes
        ldClient.addListener((newFlags) => {
          setFlags(newFlags);
        });
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize feature flags');
        console.error('Feature flag initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeClient();
  }, [client]);

  const getFlag = useCallback((key: string, defaultValue?: any) => {
    return client().getFlag(key, defaultValue);
  }, [client]);

  const isEnabled = useCallback((key: string) => {
    return client().isEnabled(key);
  }, [client]);

  const getStringFlag = useCallback((key: string, defaultValue?: string) => {
    return client().getStringFlag(key, defaultValue);
  }, [client]);

  const getNumberFlag = useCallback((key: string, defaultValue?: number) => {
    return client().getNumberFlag(key, defaultValue);
  }, [client]);

  const refreshFlags = useCallback(async () => {
    try {
      await client().refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh flags');
    }
  }, [client]);

  const value: FeatureFlagContextType = {
    flags,
    loading,
    error,
    getFlag,
    isEnabled,
    getStringFlag,
    getNumberFlag,
    refreshFlags,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

// Hook to use feature flags
export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
}

// Hook for specific feature flag
export function useFeatureFlag(key: string, defaultValue?: any) {
  const { getFlag, loading, error } = useFeatureFlags();
  
  return {
    value: getFlag(key, defaultValue),
    loading,
    error,
  };
}

// Hook for boolean feature flags
export function useFeatureFlagEnabled(key: string) {
  const { isEnabled, loading, error } = useFeatureFlags();
  
  return {
    enabled: isEnabled(key),
    loading,
    error,
  };
}

// Hook for string feature flags
export function useStringFeatureFlag(key: string, defaultValue?: string) {
  const { getStringFlag, loading, error } = useFeatureFlags();
  
  return {
    value: getStringFlag(key, defaultValue),
    loading,
    error,
  };
}

// Hook for number feature flags
export function useNumberFeatureFlag(key: string, defaultValue?: number) {
  const { getNumberFlag, loading, error } = useFeatureFlags();
  
  return {
    value: getNumberFlag(key, defaultValue),
    loading,
    error,
  };
}

// A/B testing hook
export function useABTest(testKey: string, variants: string[] = ['control', 'treatment']) {
  const { getStringFlag, loading, error } = useFeatureFlags();
  
  const variant = getStringFlag(testKey, 'control');
  const isControl = variant === 'control';
  const isTreatment = variant === 'treatment';
  
  return {
    variant,
    isControl,
    isTreatment,
    loading,
    error,
  };
}

// Conditional rendering component
interface FeatureFlagGateProps {
  flag: string;
  fallback?: ReactNode;
  children: ReactNode;
  enabled?: boolean;
}

export function FeatureFlagGate({ flag, fallback = null, children, enabled = true }: FeatureFlagGateProps) {
  const { isEnabled, loading } = useFeatureFlags();
  
  if (loading) {
    return <>{fallback}</>;
  }
  
  const flagEnabled = isEnabled(flag);
  
  if (flagEnabled === enabled) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

// Feature flag wrapper for components
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  flagKey: string,
  fallbackComponent?: React.ComponentType<P>
) {
  return function FeatureFlaggedComponent(props: P) {
    const { isEnabled, loading } = useFeatureFlags();
    
    if (loading) {
      return fallbackComponent ? <fallbackComponent {...props} /> : null;
    }
    
    if (isEnabled(flagKey)) {
      return <Component {...props} />;
    }
    
    return fallbackComponent ? <fallbackComponent {...props} /> : null;
  };
}

// Utility functions
export function createFeatureFlagConfig(userId?: string): LaunchDarklyConfig {
  return {
    clientSideId: process.env.NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_ID || 'mock-client-id',
    user: userId ? {
      key: userId,
      name: `User ${userId}`,
    } : undefined,
    options: {
      streaming: true,
      pollingInterval: 30000, // 30 seconds
      offline: false,
    },
  };
}

// Predefined feature flag keys
export const FEATURE_FLAGS = {
  AI_POWERED_INDUCTION: 'ai-powered-induction',
  AR_VR_INTEGRATION: 'ar-vr-integration',
  BLOCKCHAIN_CERTIFICATES: 'blockchain-certificates',
  COMMUNITY_FORUMS: 'community-forums',
  PRETEST_SKIPS: 'pretest-skips',
  ADVANCED_ANALYTICS: 'advanced-analytics',
  OFFLINE_MODE: 'offline-mode',
  VOICE_ENGINE_FALLBACK: 'voice-engine-fallback',
  PERSONALIZATION_ENGINE: 'personalization-engine',
  REAL_TIME_COLLABORATION: 'real-time-collaboration',
  ADVANCED_GAMIFICATION: 'advanced-gamification',
  ACCESSIBILITY_ENHANCEMENTS: 'accessibility-enhancements',
} as const;
