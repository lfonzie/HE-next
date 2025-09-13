# 🚨 Troubleshooting - HubEdu.ai

## 🔧 Problemas Comuns e Soluções

### 1. **Erro 401 Unauthorized no Login**

#### **Sintomas:**
```
api/auth/callback/credentials:1 Failed to load resource: the server responded with a status of 401 (Unauthorized)
```

#### **Causas Possíveis:**
- ❌ `NEXTAUTH_SECRET` não configurado
- ❌ `NEXTAUTH_URL` incorreto
- ❌ Banco de dados não configurado
- ❌ Usuário não existe no banco

#### **Soluções:**

**1. Verificar Variáveis de Ambiente:**
```bash
# Verificar se as variáveis estão configuradas
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL
echo $DATABASE_URL
```

**2. Gerar NEXTAUTH_SECRET:**
```bash
# Gerar uma chave segura (32+ caracteres)
openssl rand -base64 32
```

**3. Configurar Banco de Dados:**
```bash
# Aplicar migrations
npx prisma db push

# Popular com dados iniciais
npx prisma db seed

# Criar usuário de teste
npm run create:test-user
```

**4. Testar Configuração:**
```bash
# Executar teste de autenticação
npm run test:auth
```

---

### 2. **Warning de Autocomplete**

#### **Sintomas:**
```
[DOM] Input elements should have autocomplete attributes (suggested: "current-password")
```

#### **Solução:**
✅ **JÁ CORRIGIDO!** Os campos de login e registro agora têm os atributos `autocomplete` corretos:
- `email` → `autocomplete="email"`
- `password` (login) → `autocomplete="current-password"`
- `password` (registro) → `autocomplete="new-password"`

---

### 3. **Erro de Conexão com Banco**

#### **Sintomas:**
```
Error: Can't reach database server
```

#### **Soluções:**

**1. Verificar DATABASE_URL:**
```bash
# Formato correto
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

**2. Testar Conexão:**
```bash
# Verificar se o banco está rodando
npx prisma db pull
```

**3. Configurar Banco Local:**
```bash
# Com Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# Ou usar serviço online (Neon, Supabase)
```

---

### 4. **Erro de OpenAI API**

#### **Sintomas:**
```
Error: Invalid API key
```

#### **Soluções:**

**1. Verificar API Key:**
```bash
# Testar API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

**2. Verificar Créditos:**
- Acesse [platform.openai.com](https://platform.openai.com)
- Verifique se há créditos disponíveis
- Adicione método de pagamento se necessário

---

### 5. **Fast Refresh Issues**

#### **Sintomas:**
```
[Fast Refresh] rebuilding
[Fast Refresh] done in 356ms
```

#### **Soluções:**
✅ **Normal!** Isso é apenas o hot reload funcionando. Não é um erro.

---

## 🧪 Scripts de Diagnóstico

### **Teste Completo de Configuração:**
```bash
# Executar todos os testes
npm run test:auth
npm run create:test-user
npm run dev
```

### **Verificar Logs:**
```bash
# Ver logs do servidor
npm run dev

# Em outro terminal, verificar logs do banco
npx prisma studio
```

---

## 🔄 Fluxo de Solução Completa

### **1. Configuração Inicial:**
```bash
# 1. Criar .env.local
cp .env.example .env.local
# Editar com suas chaves

# 2. Configurar banco
npx prisma db push
npx prisma db seed

# 3. Criar usuário de teste
npm run create:test-user

# 4. Testar configuração
npm run test:auth
```

### **2. Desenvolvimento:**
```bash
# Iniciar servidor
npm run dev

# Em outro terminal, abrir banco
npx prisma studio
```

### **3. Teste de Login:**
1. Acesse `http://localhost:3000/login`
2. Use as credenciais do usuário de teste
3. Verifique se o login funciona

---

## 📞 Suporte Adicional

### **Logs Úteis:**
- **Console do navegador**: F12 → Console
- **Terminal do servidor**: Logs do Next.js
- **Prisma Studio**: Interface visual do banco

### **Comandos de Debug:**
```bash
# Verificar variáveis de ambiente
env | grep -E "(DATABASE_URL|NEXTAUTH|OPENAI)"

# Testar conexão com banco
npx prisma db pull

# Verificar build
npm run build

# Verificar tipos
npx tsc --noEmit
```

---

## ✅ Checklist de Solução

- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ NEXTAUTH_SECRET com 32+ caracteres
- [ ] ✅ DATABASE_URL válido
- [ ] ✅ Banco de dados rodando
- [ ] ✅ Migrations aplicadas
- [ ] ✅ Dados iniciais carregados
- [ ] ✅ Usuário de teste criado
- [ ] ✅ Servidor iniciado sem erros
- [ ] ✅ Login funcionando

---

**🎉 Se todos os itens estão marcados, o HubEdu.ai deve estar funcionando perfeitamente!**

