# 🔧 CORREÇÃO: Login com Google e Redirecionamento de Domínio

## Problema Identificado

1. **Google OAuth não configurado**: O sistema não tinha `GoogleProvider` configurado no NextAuth.js
2. **NEXTAUTH_URL incorreto**: Estava usando domínio onrender.com em vez de hubedu.ia.br
3. **Redirecionamento incorreto**: Após login, redirecionava para domínio errado

## ✅ Correções Implementadas

### 1. Configuração do Google OAuth
- ✅ Adicionado `GoogleProvider` ao arquivo `lib/auth.ts`
- ✅ Configurado callback para criar usuários automaticamente via Google OAuth
- ✅ Integração com banco de dados para usuários Google

### 2. Correção de Redirecionamento
- ✅ Adicionado callback `redirect` para forçar uso do domínio correto
- ✅ Configuração para sempre redirecionar para `hubedu.ia.br`

### 3. Arquivos Criados/Modificados
- ✅ `lib/auth.ts` - Adicionado Google OAuth
- ✅ `env.production.example` - Template com configurações corretas
- ✅ `scripts/fix-render-env.sh` - Script para verificar configurações

## 🚀 Próximos Passos para Correção no Render

### 1. Configurar Variáveis de Ambiente no Render

Acesse o painel do Render e configure estas variáveis:

```bash
NEXTAUTH_URL=https://hubedu.ia.br
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
NEXTAUTH_SECRET=seu-secret-key-forte
```

### 2. Configurar Google OAuth Console

No Google Cloud Console, configure:

**Authorized redirect URIs:**
- `https://hubedu.ia.br/api/auth/callback/google`
- `https://hubedu.ia.br/api/auth/signin/google`

**Authorized JavaScript origins:**
- `https://hubedu.ia.br`

### 3. Verificar Configurações

Execute o script de verificação:
```bash
./scripts/fix-render-env.sh
```

### 4. Reiniciar Serviço

Após configurar as variáveis, reinicie o serviço no Render.

## 🔍 Verificação dos Logs

Após as correções, os logs devem mostrar:
- ✅ Redirecionamentos para `hubedu.ia.br`
- ✅ Chamadas para `/api/auth/callback/google`
- ✅ Criação de sessão bem-sucedida

## ⚠️ Importante

- **NUNCA** use domínio onrender.com em produção
- **SEMPRE** use `hubedu.ia.br` para todas as URLs
- **VERIFIQUE** se as variáveis de ambiente estão corretas antes de fazer deploy

## 🐛 Troubleshooting

Se ainda houver problemas:

1. **Verificar logs do Render** para erros de autenticação
2. **Testar Google OAuth** em ambiente de desenvolvimento primeiro
3. **Verificar se o banco de dados** está acessível
4. **Confirmar se as variáveis** estão sendo carregadas corretamente

## 📞 Suporte

Se precisar de ajuda adicional, verifique:
- Logs do Render
- Console do navegador
- Network tab para ver requisições de autenticação
