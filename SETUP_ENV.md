# 🔧 Configuração de Variáveis de Ambiente

## 📋 Variáveis Obrigatórias

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# Database (OBRIGATÓRIO)
DATABASE_URL="postgresql://username:password@localhost:5432/hubedu_db"

# NextAuth.js (OBRIGATÓRIO)
NEXTAUTH_SECRET="sua-chave-secreta-minimo-32-caracteres-aqui"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (OBRIGATÓRIO)
OPENAI_API_KEY="sk-sua-chave-openai-aqui"
```

## 🔐 Como Obter as Chaves

### 1. **NEXTAUTH_SECRET**
```bash
# Gerar uma chave segura (32+ caracteres)
openssl rand -base64 32
```

### 2. **DATABASE_URL**
- **Desenvolvimento**: Use PostgreSQL local ou Docker
- **Produção**: Use Neon, Supabase ou Railway

### 3. **OPENAI_API_KEY**
1. Acesse [platform.openai.com](https://platform.openai.com)
2. Crie uma conta
3. Vá em "API Keys"
4. Crie uma nova chave
5. Copie a chave (começa com `sk-`)

## 🚨 Problemas Comuns

### **Erro 401 Unauthorized**
- ✅ Verifique se `NEXTAUTH_SECRET` está configurado
- ✅ Verifique se `NEXTAUTH_URL` está correto
- ✅ Reinicie o servidor após alterar variáveis

### **Erro de Conexão com Banco**
- ✅ Verifique se `DATABASE_URL` está correto
- ✅ Execute `npx prisma db push`
- ✅ Execute `npx prisma db seed`

### **Erro de OpenAI**
- ✅ Verifique se `OPENAI_API_KEY` está correto
- ✅ Verifique se a chave tem créditos disponíveis

## 🧪 Teste de Configuração

```bash
# 1. Verificar variáveis
echo $DATABASE_URL
echo $NEXTAUTH_SECRET
echo $OPENAI_API_KEY

# 2. Testar banco
npx prisma db pull

# 3. Testar OpenAI
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

## 🔄 Após Configurar

```bash
# 1. Reiniciar servidor
npm run dev

# 2. Testar login
# Acesse http://localhost:3000/login
# Tente fazer login com credenciais válidas
```

