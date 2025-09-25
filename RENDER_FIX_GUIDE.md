# 🚀 Guia de Correção - Deploy Render HubEdu.ia

## ✅ Problemas Identificados e Soluções

### 1. **Erro de Imagens SVG** ✅ CORRIGIDO
- **Problema**: `dangerouslyAllowSVG is disabled`
- **Solução**: Habilitado no `next.config.js`
- **Status**: ✅ Corrigido localmente

### 2. **Erro 401 - Authentication Failed** ⚠️ PRECISA CORREÇÃO NO RENDER
- **Problema**: `NEXTAUTH_URL` incorreto no Render
- **Solução**: Atualizar variável no Render Dashboard

### 3. **Erro de Conexão com Banco** ⚠️ PRECISA CORREÇÃO NO RENDER
- **Problema**: `DATABASE_URL` incorreto ou banco inativo
- **Solução**: Verificar e atualizar no Render Dashboard

## 🔧 Ações Necessárias no Render Dashboard

### 1. **Atualizar NEXTAUTH_URL**
```bash
# Valor atual (incorreto):
NEXTAUTH_URL=http://localhost:3000

# Valor correto para Render:
NEXTAUTH_URL=https://hubedu-ai-bz5i.onrender.com
```

### 2. **Verificar DATABASE_URL**
```bash
# Formato correto para Neon:
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 3. **Gerar Nova Chave NEXTAUTH_SECRET**
```bash
# Execute localmente para gerar nova chave:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 📋 Checklist de Correção no Render

### Passo 1: Acessar Render Dashboard
1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Encontre o serviço `hubedu.ia`
3. Vá em "Environment"

### Passo 2: Atualizar Variáveis
- [ ] `NEXTAUTH_URL=https://hubedu-ai-bz5i.onrender.com`
- [ ] `DATABASE_URL` (verificar se está correto)
- [ ] `DIRECT_URL` (mesmo valor do DATABASE_URL)
- [ ] `NEXTAUTH_SECRET` (gerar nova chave se necessário)

### Passo 3: Fazer Novo Deploy
- [ ] Salvar variáveis de ambiente
- [ ] Trigger manual deploy
- [ ] Aguardar build completar
- [ ] Testar login

## 🧪 Testes Pós-Correção

### 1. **Teste de Health Check**
```bash
curl https://hubedu-ai-bz5i.onrender.com/api/health
```

### 2. **Teste de Login**
1. Acesse https://hubedu-ai-bz5i.onrender.com/login
2. Tente fazer login com credenciais válidas
3. Verifique se não há erro 401

### 3. **Teste de Banco de Dados**
- Login deve funcionar sem erro de conexão
- Usuários devem ser encontrados no banco

## 🚨 Troubleshooting Adicional

### Se ainda houver erro 401:
1. Verifique se `NEXTAUTH_SECRET` tem pelo menos 32 caracteres
2. Verifique se `NEXTAUTH_URL` corresponde exatamente à URL do Render
3. Aguarde alguns minutos após alterar variáveis

### Se ainda houver erro de banco:
1. Verifique se o banco Neon está ativo
2. Teste a conexão localmente com a mesma URL
3. Verifique se a URL inclui `?sslmode=require`

### Se ainda houver erro de SVG:
1. ✅ Já corrigido no código
2. Faça novo deploy para aplicar as mudanças

## 📊 Status Atual

- ✅ **Código local**: Funcionando perfeitamente
- ✅ **Banco local**: Conexão OK (3 usuários encontrados)
- ✅ **Autenticação local**: Funcionando
- ✅ **Imagens SVG**: Corrigido no código
- ⚠️ **Render**: Precisa atualizar variáveis de ambiente

## 🎯 Próximo Passo

**AÇÃO IMEDIATA**: Atualizar as variáveis de ambiente no Render Dashboard conforme especificado acima.
