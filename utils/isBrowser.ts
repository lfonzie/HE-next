/**
 * Utilitário para verificar se o código está rodando no browser
 * Evita erros de SSR quando acessamos APIs do browser
 */

export const isBrowser = typeof window !== 'undefined';

export const isServer = typeof window === 'undefined';

/**
 * Executa uma função apenas no browser
 * @param fn Função a ser executada apenas no browser
 * @param fallback Valor de fallback para o servidor (opcional)
 */
export function runInBrowser<T>(
  fn: () => T,
  fallback?: T
): T | undefined {
  if (isBrowser) {
    return fn();
  }
  return fallback;
}

/**
 * Hook para verificar se estamos no browser (para usar em componentes)
 */
export function useIsBrowser(): boolean {
  return isBrowser;
}

/**
 * Guard para APIs do browser
 */
export const browserGuards = {
  localStorage: isBrowser ? window.localStorage : null,
  sessionStorage: isBrowser ? window.sessionStorage : null,
  document: isBrowser ? document : null,
  window: isBrowser ? window : null,
  navigator: isBrowser ? navigator : null,
} as const;
