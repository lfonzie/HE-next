/**
 * Validador de Embed - Controla acesso aos módulos embed
 * Valida domínios autorizados e tokens de segurança
 */

export interface EmbedValidationResult {
  allowed: boolean;
  reason?: string;
  schoolDomain?: string;
}

/**
 * Valida se uma requisição pode acessar o embed
 */
export function validateEmbedAccess(headers: Headers): EmbedValidationResult {
  // Obter configurações de ambiente
  const allowedDomains = process.env.EMBED_ALLOWED_DOMAINS?.split(',').map(d => d.trim()) || [];
  const embedToken = process.env.EMBED_ACCESS_TOKEN;
  const allowAllInDev = process.env.NODE_ENV === 'development';

  // Em desenvolvimento, permitir todos se configurado
  if (allowAllInDev && process.env.EMBED_ALLOW_ALL_DEV === 'true') {
    console.log('🔓 [EMBED] Modo desenvolvimento - acesso permitido');
    return { allowed: true, reason: 'Development mode' };
  }

  // Obter origem da requisição
  const origin = headers.get('origin') || headers.get('referer') || '';
  const token = headers.get('x-embed-token');

  console.log('🔍 [EMBED] Validando acesso:', { origin, hasToken: !!token });

  // Se houver token configurado, validar primeiro
  if (embedToken && token === embedToken) {
    console.log('✅ [EMBED] Token válido - acesso permitido');
    return { allowed: true, reason: 'Valid token' };
  }

  // Se não houver domínios configurados e não houver token, bloquear
  if (allowedDomains.length === 0 && !embedToken) {
    console.log('⚠️ [EMBED] Nenhum domínio ou token configurado - bloqueando acesso');
    return { 
      allowed: false, 
      reason: 'No allowed domains or token configured' 
    };
  }

  // Validar domínio de origem
  if (allowedDomains.length > 0 && origin) {
    try {
      const originUrl = new URL(origin);
      const originDomain = originUrl.hostname;

      for (const allowedDomain of allowedDomains) {
        // Verificar correspondência exata ou subdomínio
        if (originDomain === allowedDomain || originDomain.endsWith(`.${allowedDomain}`)) {
          console.log(`✅ [EMBED] Domínio autorizado: ${originDomain}`);
          return { 
            allowed: true, 
            reason: 'Allowed domain', 
            schoolDomain: originDomain 
          };
        }
      }
    } catch (error) {
      console.error('❌ [EMBED] Erro ao validar origem:', error);
    }
  }

  console.log(`❌ [EMBED] Acesso negado para: ${origin}`);
  return { 
    allowed: false, 
    reason: 'Domain not allowed' 
  };
}

/**
 * Validação client-side (apenas informativa, não é segurança real)
 */
export function validateEmbedClient(): boolean {
  // Verificar se está em iframe
  const isInIframe = window !== window.parent;
  
  if (!isInIframe) {
    console.warn('⚠️ [EMBED] Página não está em iframe');
  }

  return isInIframe;
}

/**
 * Obter domínio pai do iframe (client-side)
 */
export function getParentDomain(): string | null {
  try {
    if (window !== window.parent) {
      return document.referrer ? new URL(document.referrer).hostname : null;
    }
  } catch (error) {
    // Cross-origin restrictions
    console.log('ℹ️ [EMBED] Não foi possível obter domínio pai (cross-origin)');
  }
  return null;
}

