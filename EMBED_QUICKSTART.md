# 🚀 Guia Rápido - Embed Modules

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Configurar Variáveis de Ambiente

Adicione ao arquivo `.env.local` (ou configure no Render):

```bash
# Domínio da escola autorizada
EMBED_ALLOWED_DOMAINS="colegioose.com.br,www.colegioose.com.br"

# Desenvolvimento: permitir todos
EMBED_ALLOW_ALL_DEV="true"
```

### 2️⃣ Código HTML para Incorporar

**Opção A: ENEM**
```html
<iframe 
  src="https://hubedu.ia.br/embed/enem"
  width="100%"
  height="800px"
  frameborder="0"
></iframe>
```

**Opção B: Redação**
```html
<iframe 
  src="https://hubedu.ia.br/embed/redacao"
  width="100%"
  height="800px"
  frameborder="0"
></iframe>
```

### 3️⃣ Testar Localmente

1. **Iniciar o servidor Next.js:**
   ```bash
   npm run dev
   ```

2. **Abrir página de teste:**
   ```
   http://localhost:3000/embed-test.html
   ```

   Ou criar seu próprio teste HTML e servir com:
   ```bash
   python3 -m http.server 8000
   ```

## 📋 URLs Disponíveis

| Tipo | URL | Auth? | Uso |
|------|-----|-------|-----|
| **Embed ENEM** | `/embed/enem` | ❌ Não | Para incorporação em iframe |
| **Embed Redação** | `/embed/redacao` | ❌ Não | Para incorporação em iframe |
| **ENEM (Direto)** | `/enem` | ✅ Sim | Acesso direto em hubedu.ia.br |
| **Redação (Direto)** | `/redacao` | ✅ Sim | Acesso direto em hubedu.ia.br |

**⚠️ IMPORTANTE:**
- **Para incorporar em iframe**: Use `/embed/enem` ou `/embed/redacao` (sem autenticação)
- **Para acesso direto**: Use `/enem` ou `/redacao` (requer login em hubedu.ia.br)

## 🔧 Configurações Importantes

### Para Produção (Render)

```bash
# Variáveis de ambiente necessárias
EMBED_ALLOWED_DOMAINS="colegioose.com.br,www.colegioose.com.br"
EMBED_ALLOW_ALL_DEV="false"
```

### Para Desenvolvimento

```bash
# Variáveis de ambiente para dev
EMBED_ALLOWED_DOMAINS="localhost,127.0.0.1"
EMBED_ALLOW_ALL_DEV="true"
```

## ✅ Checklist de Implementação

- [x] Criar páginas embed (`/app/embed/enem` e `/app/embed/redacao`)
- [x] Criar validador de domínios (`/lib/embed-validator.ts`)
- [x] Criar wrapper de embed (`/components/embed/EmbedWrapper.tsx`)
- [x] Criar layout específico (`/app/embed/layout.tsx`)
- [x] Configurar middleware para headers CORS
- [x] Adicionar variáveis de ambiente
- [x] Criar documentação completa
- [x] Criar página de teste HTML

## 🧪 Testando

### Teste 1: Verificar Páginas Embed (sem auth)
```
✅ Acessar: http://localhost:3000/embed/enem
✅ Acessar: http://localhost:3000/embed/redacao
✅ Deve carregar SEM necessidade de login
✅ Verificar console para logs de debug
```

### Teste 1.1: Verificar Páginas Principais (com auth)
```
✅ Acessar: http://localhost:3000/enem
✅ Acessar: http://localhost:3000/redacao
✅ Deve REDIRECIONAR para /login (requer autenticação)
```

### Teste 2: Verificar em Iframe
```
✅ Usar página de teste: http://localhost:3000/embed-test.html
✅ Alternar entre módulos ENEM e Redação
✅ Verificar responsividade
```

### Teste 3: Verificar Restrição de Domínio
```
✅ Em produção, apenas domínios autorizados podem incorporar
✅ Console mostrará logs de acesso autorizado/negado
✅ Headers CORS configurados corretamente
```

## 📱 Responsividade

Os módulos são **totalmente responsivos**:
- ✅ Desktop (1920x1080+)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667+)

## 🎨 Exemplo Estilizado

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .embed-frame {
      width: 100%;
      max-width: 1400px;
      margin: 40px auto;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      border-radius: 12px;
      overflow: hidden;
    }
    
    .embed-frame iframe {
      width: 100%;
      height: 800px;
      border: none;
      display: block;
    }
  </style>
</head>
<body>
  <div class="embed-frame">
    <iframe src="https://hubedu.ia.br/embed/enem"></iframe>
  </div>
</body>
</html>
```

## 🔒 Segurança

### O que está protegido:
- ✅ Validação de domínio de origem
- ✅ Headers CORS apropriados
- ✅ Sem exposição de dados sensíveis
- ✅ Token opcional para validação extra

### O que NÃO requer:
- ❌ Login de usuário
- ❌ Autenticação
- ❌ Cookies de sessão

## 📞 Suporte

- **Documentação Completa**: Ver `EMBED_MODULES.md`
- **Teste Local**: Acessar `/embed-test.html`
- **Logs de Debug**: Ativar `DEBUG_MIDDLEWARE=true`

## 🎯 Próximos Passos

1. ✅ Configurar variáveis de ambiente
2. ✅ Testar localmente
3. ✅ Adicionar domínio da escola aos autorizados
4. ✅ Deploy para produção (Render)
5. ✅ Incorporar no site da escola
6. ✅ Testar em produção

---

**Pronto!** 🎉 Os módulos embed estão configurados e prontos para uso.

