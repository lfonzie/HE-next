/**
 * Hook otimizado para sessão que evita chamadas duplicadas
 * Implementa cache e deduplicação de requisições de sessão
 */

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

// Cache global para sessão (evita múltiplas chamadas simultâneas)
let sessionCache: {
  data: any;
  timestamp: number;
  promise: Promise<any> | null;
} = {
  data: null,
  timestamp: 0,
  promise: null
};

const CACHE_DURATION = 5000; // 5 segundos de cache

/**
 * Hook otimizado que usa cache para evitar chamadas duplicadas de sessão
 */
export function useOptimizedSession() {
  const { data: session, status, update } = useSession();
  
  // Verificar se temos dados válidos no cache
  const cachedSession = useMemo(() => {
    const now = Date.now();
    
    // Se o cache é válido e temos dados, usar cache
    if (sessionCache.data && (now - sessionCache.timestamp) < CACHE_DURATION) {
      return sessionCache.data;
    }
    
    // Se temos dados de sessão válidos, atualizar cache
    if (session && status === 'authenticated') {
      sessionCache.data = session;
      sessionCache.timestamp = now;
      return session;
    }
    
    return session;
  }, [session, status]);
  
  return {
    data: cachedSession,
    status,
    update,
    // Indicador se estamos usando cache
    isCached: sessionCache.data && (Date.now() - sessionCache.timestamp) < CACHE_DURATION
  };
}

/**
 * Utilitário para limpar cache de sessão (útil para logout)
 */
export function clearSessionCache() {
  sessionCache = {
    data: null,
    timestamp: 0,
    promise: null
  };
}

/**
 * Hook para componentes que precisam de informações específicas da sessão
 * Evita re-renders desnecessários
 */
export function useSessionUser() {
  const { data: session, status } = useOptimizedSession();
  
  return useMemo(() => ({
    user: session?.user || null,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    userId: session?.user?.id || null,
    userRole: (session?.user as any)?.role || null,
    userEmail: session?.user?.email || null
  }), [session, status]);
}

/**
 * Hook para verificar permissões específicas
 */
export function useUserPermissions() {
  const { user, isAuthenticated, userRole } = useSessionUser();
  
  return useMemo(() => ({
    canCreateLessons: isAuthenticated && ['ADMIN', 'TEACHER'].includes(userRole),
    canAccessAdmin: isAuthenticated && userRole === 'ADMIN',
    canViewAnalytics: isAuthenticated && ['ADMIN', 'TEACHER'].includes(userRole),
    isStudent: isAuthenticated && userRole === 'STUDENT',
    isTeacher: isAuthenticated && userRole === 'TEACHER',
    isAdmin: isAuthenticated && userRole === 'ADMIN'
  }), [isAuthenticated, userRole]);
}

export default useOptimizedSession;
