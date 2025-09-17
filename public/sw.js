// Service Worker para HubEdu.ia
// Cache do app shell para carregamento instantâneo

const CACHE_NAME = 'hubedu-v6';
const STATIC_CACHE = 'hubedu-static-v4';
const DYNAMIC_CACHE = 'hubedu-dynamic-v4';

// Recursos essenciais para cache imediato
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/browserconfig.xml',
  '/favicon.ico',
  '/favicon.svg'
];

// Instalação do SW
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Cacheando recursos estáticos');
        // Cache individualmente para evitar falhas em recursos não encontrados
        return Promise.allSettled(
          STATIC_ASSETS.map(asset => 
            cache.add(asset).catch(err => {
              console.warn(`[SW] Não foi possível cachear ${asset}:`, err);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('[SW] Instalação concluída');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Erro na instalação:', error);
        // Mesmo com erro, continua a instalação
        return self.skipWaiting();
      })
  );
});

// Ativação do SW
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Limpar todos os caches antigos (v5 e anteriores)
            if (cacheName.includes('hubedu-v5') || cacheName.includes('hubedu-v4') || cacheName.includes('hubedu-v3') || 
                (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)) {
              console.log('[SW] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Ativação concluída');
        return self.clients.claim();
      })
  );
});

// Interceptação de requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Em desenvolvimento, não interceptar NENHUM request
  if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
    return;
  }
  
  // Ignorar requests que não devem ser interceptados
  if (shouldIgnoreRequest(request)) {
    return;
  }
  
  // Para desenvolvimento, usar Network First para evitar problemas de cache
  if (request.method === 'GET') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Se a resposta é válida, cacheia e retorna
          if (response.status === 200) {
            const responseClone = response.clone();
            
            // Cacheia recursos estáticos
            if (isStaticAsset(request.url)) {
              caches.open(STATIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                })
                .catch((error) => {
                  console.warn('[SW] Erro ao cachear recurso estático:', error);
                });
            }
            // Cacheia outros recursos dinamicamente
            else if (isCacheable(request)) {
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                })
                .catch((error) => {
                  console.warn('[SW] Erro ao cachear recurso dinâmico:', error);
                });
            }
          }
          
          return response;
        })
        .catch((error) => {
          // Silenciar erros de fetch em desenvolvimento
          if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
            console.warn('[SW] Erro de rede em desenvolvimento, tentando cache:', request.url);
          } else {
            console.error('[SW] Erro no fetch, tentando cache:', error);
          }
          
          // Se falhou na rede, tenta o cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[SW] Servindo do cache:', request.url);
                return cachedResponse;
              }
              
              // Fallback para página principal se for navegação
              if (request.mode === 'navigate') {
                return caches.match('/index.html');
              }
              
              // Em desenvolvimento, não falhar completamente
              if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
                return new Response('Recurso não encontrado', { status: 404 });
              }
              
              throw error;
            });
        })
    );
  }
});

// Verifica se o request deve ser ignorado pelo SW
function shouldIgnoreRequest(request) {
  const url = new URL(request.url);
  
  // Ignorar requests de WebSocket
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return true;
  }
  
  // Ignorar requests de API em desenvolvimento
  if (url.pathname.startsWith('/api/') && (url.hostname === '127.0.0.1' || url.hostname === 'localhost')) {
    return true;
  }
  
  // Ignorar requests de hot reload do Vite
  if (url.pathname.includes('__vite') || url.pathname.includes('@vite')) {
    return true;
  }
  
  // Ignorar requests de source maps
  if (url.pathname.endsWith('.map')) {
    return true;
  }
  
  return false;
}

// Verifica se é um recurso estático
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.includes(asset)) ||
         url.includes('/icons/') ||
         url.includes('/_next/static/') ||
         url.includes('.css') ||
         url.includes('.js') ||
         url.includes('.svg') ||
         url.includes('.png') ||
         url.includes('.ico') ||
         url.includes('.woff') ||
         url.includes('.woff2');
}

// Verifica se o recurso deve ser cacheado
function isCacheable(request) {
  const url = new URL(request.url);
  
  // Não cacheia requests de API ou recursos externos
  if (url.pathname.startsWith('/api/') ||
      url.hostname !== location.hostname ||
      request.method !== 'GET') {
    return false;
  }
  
  return true;
}

// Limpeza periódica do cache dinâmico
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return cache.keys().then((keys) => {
            // Remove entradas antigas (mantém as 50 mais recentes)
            if (keys.length > 50) {
              const keysToDelete = keys.slice(0, keys.length - 50);
              return Promise.all(
                keysToDelete.map(key => cache.delete(key))
              );
            }
          });
        })
    );
  }
});
