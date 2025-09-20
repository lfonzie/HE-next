const CACHE_NAME = 'hubedu-v1.0.0';
const STATIC_CACHE_NAME = 'hubedu-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'hubedu-dynamic-v1.0.0';

// Recursos estáticos para cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png'
];

// APIs que devem ser cacheadas
const API_CACHE_PATTERNS = [
  /^\/api\/health/,
  /^\/api\/enem\/questions/,
  /^\/api\/aulas/,
  /^\/api\/chat/
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cacheando recursos estáticos');
        return Promise.allSettled(
          STATIC_ASSETS.map(asset => 
            cache.add(asset).catch(err => {
              console.warn(`Service Worker: Failed to cache ${asset}:`, err);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('Service Worker: Instalação concluída');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Erro na instalação', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Ativação concluída');
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  try {
    const url = new URL(request.url);

    // Ignora requisições não-HTTP
    if (!request.url.startsWith('http')) {
      return;
    }

    // Estratégia para diferentes tipos de recursos
    if (request.method === 'GET') {
      // Recursos estáticos - Cache First
      if (STATIC_ASSETS.includes(url.pathname) || 
          url.pathname.startsWith('/_next/static/') ||
          url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
        event.respondWith(cacheFirst(request));
      }
      // APIs - Network First com fallback
      else if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
        event.respondWith(networkFirst(request));
      }
      // Páginas HTML - Stale While Revalidate
      else if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(staleWhileRevalidate(request));
      }
      // Outros recursos - Network First
      else {
        event.respondWith(networkFirst(request));
      }
    }
  } catch (error) {
    console.error('Service Worker: Erro no fetch event:', error);
    // Let the browser handle the request normally
  }
});

// Estratégia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Check if the request URL is valid before attempting to fetch
    if (!request.url || request.url === 'about:blank' || request.url.startsWith('chrome-extension://')) {
      throw new Error('Invalid request URL');
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('Cache First: Erro ao buscar recurso', request.url, error.message);
    
    // For HTML requests, try to return a cached version of the main page
    if (request.headers.get('accept')?.includes('text/html')) {
      const fallbackResponse = await caches.match('/');
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }
    
    // Return a more graceful fallback instead of throwing
    return new Response('Recurso não disponível offline', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Estratégia Network First
async function networkFirst(request) {
  try {
    // Check if the request URL is valid before attempting to fetch
    if (!request.url || request.url === 'about:blank' || request.url.startsWith('chrome-extension://')) {
      throw new Error('Invalid request URL');
    }

    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Network First: Tentando cache', request.url, error.message);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback para páginas HTML
    if (request.headers.get('accept')?.includes('text/html')) {
      const fallbackResponse = await caches.match('/offline.html');
      if (fallbackResponse) {
        return fallbackResponse;
      }
      // If no offline page, try the main page
      const mainPageResponse = await caches.match('/');
      if (mainPageResponse) {
        return mainPageResponse;
      }
    }

    return new Response('Recurso não disponível offline', { status: 503 });
  }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Se a rede falhar, retorna cache ou página offline
    return cachedResponse || caches.match('/offline.html');
  });

  return cachedResponse || fetchPromise;
}

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sincronização em background', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sincroniza dados pendentes quando a conexão voltar
    console.log('Service Worker: Executando sincronização em background');
    
    // Aqui você pode implementar a sincronização de dados offline
    // Por exemplo, enviar respostas de exercícios salvos localmente
    
  } catch (error) {
    console.error('Service Worker: Erro na sincronização', error);
  }
}

// Notificações push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push recebido');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do HubEdu.ia',
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explorar',
        icon: '/icons/explore-96x96.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/close-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('HubEdu.ia', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Clique em notificação', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Apenas fecha a notificação
  } else {
    // Clique no corpo da notificação
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('Service Worker: Mensagem recebida', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Limpeza periódica do cache
setInterval(() => {
  caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > 50) { // Limita a 50 itens no cache dinâmico
        cache.delete(keys[0]);
      }
    });
  });
}, 60000); // Executa a cada minuto