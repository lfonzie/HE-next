# Configuração de Deploy Render - Correções Aplicadas

## ✅ Problemas Corrigidos

### 1. **Imagens SVG**
- ✅ Habilitado `dangerouslyAllowSVG: true` no `next.config.js`
- ✅ Adicionado `contentSecurityPolicy` para segurança
- ✅ Configurado `remotePatterns` para imagens externas

### 2. **Configuração de Banco de Dados**
- ✅ Verificação de conexão com Neon PostgreSQL
- ✅ Validação de `DATABASE_URL` e `DIRECT_URL`
- ✅ Teste de queries básicas

### 3. **Variáveis de Ambiente Obrigatórias**
```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# NextAuth.js
NEXTAUTH_SECRET="sua-chave-secreta-minimo-32-caracteres-aqui"
NEXTAUTH_URL="https://hubedu-ai-bz5i.onrender.com"

# OpenAI
OPENAI_API_KEY="sk-sua-chave-openai-aqui"

# Google Gemini (opcional)
GOOGLE_GEMINI_API_KEY="sua-chave-gemini-aqui"
GOOGLE_GENERATIVE_AI_API_KEY="sua-chave-gemini-aqui"

# Outras APIs
PERPLEXITY_API_KEY="sua-chave-perplexity-aqui"
UNSPLASH_ACCESS_KEY="sua-chave-unsplash-aqui"
PIXABAY_API_KEY="sua-chave-pixabay-aqui"
```

## 🔧 Scripts de Verificação

### Verificar Configuração
```bash
node fix-render-deploy.js
```

### Gerar Nova Chave NextAuth
```bash
openssl rand -base64 32
```

### Testar Conexão com Banco
```bash
npx prisma db push
npx prisma db seed
```

## 🚨 Soluções para Erros Específicos

### Erro 401 - Authentication Failed
1. Verifique se `NEXTAUTH_SECRET` está configurado
2. Verifique se `NEXTAUTH_URL` corresponde à URL do Render
3. Reinicie o serviço após alterar variáveis

### Erro de Conexão com Banco
1. Verifique se `DATABASE_URL` está correto
2. Verifique se o banco Neon está ativo
3. Execute `npx prisma db push` para sincronizar schema
4. Verifique se a URL inclui `?sslmode=require`

### Erro de Imagens SVG
1. ✅ Já corrigido no `next.config.js`
2. Use `unoptimized` prop em componentes Image se necessário

## 📋 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas no Render
- [ ] `NEXTAUTH_SECRET` gerado e configurado
- [ ] `DATABASE_URL` válido e testado
- [ ] Build local funcionando (`npm run build`)
- [ ] Prisma Client gerado (`npx prisma generate`)
- [ ] Deploy automático habilitado
- [ ] Health check funcionando (`/api/health`)

## 🎯 Próximos Passos

1. Execute o script de verificação
2. Configure as variáveis no Render Dashboard
3. Faça um novo deploy
4. Teste o login e funcionalidades principais
5. Monitore os logs para erros adicionais

## 📞 Suporte

Se os problemas persistirem:
1. Verifique os logs do Render
2. Execute `node fix-render-deploy.js` localmente
3. Teste a conexão com banco separadamente
4. Verifique se todas as dependências estão instaladas
