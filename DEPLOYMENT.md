# 🚀 Guia de Deploy - HubEdu.ai

## 📋 Pré-requisitos

- Conta no Vercel (gratuita)
- Conta no Neon/Supabase para PostgreSQL (gratuita)
- Conta na OpenAI para API Key
- Conta no Google Cloud (opcional, para OAuth)

## 🗄️ 1. Configurar Banco de Dados

### Opção A: Neon (Recomendado)
1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a connection string
5. Formato: `postgresql://username:password@host:port/database`

### Opção B: Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Vá em Settings > Database
5. Copie a connection string

## 🔑 2. Configurar OpenAI

1. Acesse [platform.openai.com](https://platform.openai.com)
2. Crie uma conta
3. Vá em API Keys
4. Crie uma nova chave
5. Copie a chave (começa com `sk-`)

## 🔐 3. Configurar OAuth (Opcional)

### Google OAuth
1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto
3. Ative a Google+ API
4. Crie credenciais OAuth 2.0
5. Adicione domínios autorizados
6. Copie Client ID e Client Secret

### GitHub OAuth
1. Acesse GitHub Settings > Developer settings
2. Crie um novo OAuth App
3. Adicione callback URL: `https://seu-dominio.vercel.app/api/auth/callback/github`
4. Copie Client ID e Client Secret

## 🚀 4. Deploy no Vercel

### Método 1: Deploy via GitHub
1. Faça push do código para GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Conecte sua conta GitHub
4. Importe o repositório
5. Configure as variáveis de ambiente
6. Deploy automático

### Método 2: Deploy via Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Configurar variáveis de ambiente
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add OPENAI_API_KEY
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
```

## ⚙️ 5. Variáveis de Ambiente no Vercel

Configure as seguintes variáveis no painel do Vercel:

```bash
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_SECRET=seu-secret-super-seguro-aqui
NEXTAUTH_URL=https://seu-dominio.vercel.app
OPENAI_API_KEY=sk-sua-chave-openai-aqui
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
GITHUB_CLIENT_ID=seu-github-client-id
GITHUB_CLIENT_SECRET=seu-github-client-secret
```

## 🗄️ 6. Configurar Banco de Dados em Produção

### Executar Migrations
```bash
# Via Vercel CLI
vercel env pull .env.local
npx prisma db push

# Ou via script personalizado
npx prisma db push --schema=./prisma/schema.prisma
```

### Popular Banco com Dados Iniciais
```bash
npx prisma db seed
```

## 🔧 7. Scripts de Deploy Personalizados

Crie um arquivo `vercel.json` na raiz do projeto:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## 📊 8. Monitoramento e Analytics

### Vercel Analytics
1. Ative Vercel Analytics no painel
2. Configure métricas de performance
3. Monitore Core Web Vitals

### Logs e Debugging
```bash
# Ver logs em tempo real
vercel logs

# Ver logs de uma função específica
vercel logs --function=api/chat
```

## 🔒 9. Segurança em Produção

### Rate Limiting
Configure rate limiting nas API routes:

```typescript
// lib/rate-limit.ts
import { NextRequest } from 'next/server'

const rateLimitMap = new Map()

export function rateLimit(limit: number = 10, window: number = 60) {
  return (req: NextRequest) => {
    const ip = req.ip || 'anonymous'
    const now = Date.now()
    const windowStart = now - window * 1000
    
    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, [])
    }
    
    const requests = rateLimitMap.get(ip).filter((time: number) => time > windowStart)
    
    if (requests.length >= limit) {
      return new Response('Rate limit exceeded', { status: 429 })
    }
    
    requests.push(now)
    rateLimitMap.set(ip, requests)
    
    return null
  }
}
```

### CORS Configuration
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXTAUTH_URL || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}
```

## 🚨 10. Troubleshooting

### Problemas Comuns

#### Erro de Conexão com Banco
```bash
# Verificar connection string
echo $DATABASE_URL

# Testar conexão
npx prisma db pull
```

#### Erro de Autenticação
```bash
# Verificar NEXTAUTH_SECRET
# Deve ter pelo menos 32 caracteres
openssl rand -base64 32
```

#### Erro de OpenAI API
```bash
# Verificar API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

### Logs de Debug
```bash
# Habilitar logs detalhados
DEBUG=* npm run dev

# Logs específicos do Prisma
DEBUG=prisma:* npm run dev
```

## 📈 11. Otimizações de Performance

### Database Connection Pooling
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Caching
```typescript
// lib/cache.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export { redis }
```

## 🔄 12. CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npx prisma generate
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📞 13. Suporte

### Recursos Úteis
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação NextAuth.js](https://next-auth.js.org)
- [Documentação OpenAI](https://platform.openai.com/docs)

### Comunidade
- Discord: [Servidor da Comunidade]
- GitHub Issues: [Reportar problemas]
- Stack Overflow: Tag `hubedu-ai`

---

**🎉 Parabéns! Seu HubEdu.ai está no ar!**

Para dúvidas sobre deploy, consulte a documentação ou entre em contato com o suporte.

