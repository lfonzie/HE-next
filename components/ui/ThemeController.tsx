'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// CORREÇÃO: Permitir tema escuro em todas as páginas
// Removido o bloqueio que impedia o tema escuro de funcionar

export function ThemeController() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Log para debug
    console.log('🎨 ThemeController - Página atual:', pathname);
    console.log('🎨 ThemeController - Classes HTML:', document.documentElement.className);
    
    // CORREÇÃO: Não forçar tema claro em nenhuma página
    // O tema será controlado apenas pelo ThemeProvider e useTheme hook
    // Isso permite que o tema escuro funcione em todas as páginas
    
  }, [pathname]);
  
  return null;
}
