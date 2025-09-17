'use client';

import { useCallback, useRef, useEffect } from 'react';

interface UseModuleNavigationOptions {
  onModuleChange?: (moduleId: string) => void;
  userRole?: string;
  schoolPlan?: string;
  enableAnalytics?: boolean;
}

interface ModuleAnalytics {
  moduleId: string;
  timestamp: number;
  userRole: string;
  schoolPlan: string;
  sessionDuration?: number;
}

// Available modules
const ALL_MODULES = [
  'professor',
  'aula-expandida', 
  'enem-interativo',
  'ti',
  'rh',
  'financeiro',
  'coordenacao',
  'atendimento',
  'wellbeing',
  'social-media',
  'secretaria'
];

export function useModuleNavigation(options: UseModuleNavigationOptions = {}) {
  const currentModuleRef = useRef<string>('');
  const isNavigatingRef = useRef<boolean>(false);
  const moduleStartTimeRef = useRef<number>(0);
  const analyticsDataRef = useRef<ModuleAnalytics[]>([]);

  // Function to track module analytics
  const trackModuleAnalytics = useCallback((moduleId: string, action: 'enter' | 'exit') => {
    if (!options.enableAnalytics) return;

    const now = Date.now();
    const userRole = options.userRole || 'STUDENT';
    const schoolPlan = options.schoolPlan || 'PROFESSOR';

    if (action === 'enter') {
      moduleStartTimeRef.current = now;
      
      const analyticsEntry: ModuleAnalytics = {
        moduleId,
        timestamp: now,
        userRole,
        schoolPlan
      };
      
      analyticsDataRef.current.push(analyticsEntry);
      
      // Save to localStorage for persistence
      try {
        const existingData = localStorage.getItem('moduleAnalytics');
        const parsedData = existingData ? JSON.parse(existingData) : [];
        parsedData.push(analyticsEntry);
        localStorage.setItem('moduleAnalytics', JSON.stringify(parsedData.slice(-100))); // Keep only last 100 records
      } catch (error) {
        console.warn('Analytics storage error:', error);
      }
      
    } else if (action === 'exit' && moduleStartTimeRef.current > 0) {
      const sessionDuration = now - moduleStartTimeRef.current;
      
      // Update last record with session duration
      if (analyticsDataRef.current.length > 0) {
        const lastEntry = analyticsDataRef.current[analyticsDataRef.current.length - 1];
        lastEntry.sessionDuration = sessionDuration;
      }
      
      moduleStartTimeRef.current = 0;
    }
  }, [options.enableAnalytics, options.userRole, options.schoolPlan]);

  // Function to get analytics insights
  const getModuleInsights = useCallback(() => {
    try {
      const existingData = localStorage.getItem('moduleAnalytics');
      if (!existingData) return null;

      const data: ModuleAnalytics[] = JSON.parse(existingData);
      
      // Calculate statistics
      const moduleUsage = data.reduce((acc, entry) => {
        acc[entry.moduleId] = (acc[entry.moduleId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalSessions = data.length;
      const avgSessionDuration = data
        .filter(entry => entry.sessionDuration)
        .reduce((sum, entry) => sum + (entry.sessionDuration || 0), 0) / 
        data.filter(entry => entry.sessionDuration).length;

      return {
        totalSessions,
        avgSessionDuration: Math.round(avgSessionDuration / 1000), // in seconds
        moduleUsage,
        mostUsedModule: Object.entries(moduleUsage)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
      };
    } catch (error) {
      console.warn('Error getting module insights:', error);
      return null;
    }
  }, []);

  // Function to clear analytics data
  const clearAnalytics = useCallback(() => {
    try {
      localStorage.removeItem('moduleAnalytics');
      analyticsDataRef.current = [];
    } catch (error) {
      console.warn('Error clearing analytics:', error);
    }
  }, []);

  // Safe function to select modules (without route navigation)
  const navigateToModule = useCallback((moduleId: string) => {
    // Check if already navigating to avoid loops
    if (isNavigatingRef.current) {
      console.warn('⚠️ useModuleNavigation: Selection already in progress, skipping...');
      return;
    }

    // Check if it's the same current module
    if (currentModuleRef.current === moduleId) {
      console.warn('⚠️ useModuleNavigation: Same module selected, skipping...');
      return;
    }

    try {
      isNavigatingRef.current = true;

      // Check if module is valid
      if (!ALL_MODULES.includes(moduleId)) {
        console.error(`❌ useModuleNavigation: Invalid module: ${moduleId}`);
        console.error(`❌ useModuleNavigation: Available modules:`, ALL_MODULES);
        return;
      }

      // Track exit from current module (if any)
      if (currentModuleRef.current && currentModuleRef.current !== moduleId) {
        trackModuleAnalytics(currentModuleRef.current, 'exit');
      }
      
      // Update current module reference first
      currentModuleRef.current = moduleId;
      
      // Notify module change - only once
      if (options.onModuleChange) {
        options.onModuleChange(moduleId);
      }

      // Track entry into new module
      trackModuleAnalytics(moduleId, 'enter');
      
    } catch (error) {
      console.error('❌ useModuleNavigation: Error during module selection:', error);
    } finally {
      // Reset selection flag immediately
      isNavigatingRef.current = false;
    }
  }, [options.onModuleChange, trackModuleAnalytics]);

  // Function to get available modules for user
  const getAvailableModulesForUser = useCallback(() => {
    // For now, return all modules - permissions can be added later
    return ALL_MODULES;
  }, []);

  // Effect for automatic cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Track exit from current module before cleanup
      if (currentModuleRef.current) {
        trackModuleAnalytics(currentModuleRef.current, 'exit');
      }
    };
  }, [trackModuleAnalytics]);

  return {
    navigateToModule,
    isNavigating: isNavigatingRef.current,
    currentModule: currentModuleRef.current,
    getAvailableModules: getAvailableModulesForUser,
    allModules: ALL_MODULES,
    trackModuleAnalytics,
    getModuleInsights,
    clearAnalytics
  };
}