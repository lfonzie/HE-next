# 🚀 Deploy no Render - HubEdu.ai + ENEM API

## 📋 Comandos para o Render

### Build Command
```bash
npm ci && npm run build
```

### Start Command
```bash
npm start
```

## 🔧 Configuração no Render

### 1. Serviço Principal (HubEdu.ai)

**Configurações:**
- **Runtime**: Node.js
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Plan**: Starter (ou superior)

**Variáveis de Ambiente:**
```env
NODE_ENV=production
NEXTAUTH_SECRET=<gerar-secret-seguro>
NEXTAUTH_URL=https://seu-app.onrender.com
DATABASE_URL=<url-do-banco-postgres>
OPENAI_API_KEY=<sua-chave-openai>
GOOGLE_CLIENT_ID=<seu-google-client-id>
GOOGLE_CLIENT_SECRET=<seu-google-client-secret>
GITHUB_CLIENT_ID=<seu-github-client-id>
GITHUB_CLIENT_SECRET=<seu-github-client-secret>
ENEM_API_URL=https://seu-enem-api.onrender.com
```

### 2. Serviço ENEM API

**Configurações:**
- **Runtime**: Node.js
- **Build Command**: `cd enem-api-main && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build`
- **Start Command**: `cd enem-api-main && npm start`
- **Plan**: Starter (ou superior)

**Variáveis de Ambiente:**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=<url-do-banco-enem>
NEXTAUTH_SECRET=<gerar-secret-seguro>
NEXTAUTH_URL=https://seu-enem-api.onrender.com
```

### 3. Banco de Dados PostgreSQL

**Configurações:**
- **Plan**: Starter (ou superior)
- **Database Name**: `hubedu_production`
- **User**: `hubedu_user`

## 📊 Scripts Disponíveis

### Desenvolvimento Local
```bash
# Iniciar ambos os serviços
npm run dev

# Iniciar apenas HubEdu.ai
npm run dev:turbo

# Iniciar com script completo
npm run dev:all
```

### Produção
```bash
# Build completo
npm run build

# Build apenas HubEdu.ai
npm run build:hubedu

# Build apenas ENEM API
npm run build:enem

# Start completo
npm start

# Start apenas HubEdu.ai
npm run start:hubedu

# Start apenas ENEM API
npm run start:enem
```

## 🔄 Fluxo de Deploy

1. **Push para GitHub**
2. **Render detecta mudanças**
3. **Executa Build Command**
4. **Executa Start Command**
5. **Aplicação fica disponível**

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Build falha**
   - Verificar se todas as dependências estão no package.json
   - Verificar se as variáveis de ambiente estão configuradas

2. **Start falha**
   - Verificar se o banco de dados está acessível
   - Verificar se as portas estão configuradas corretamente

3. **ENEM API não conecta**
   - Verificar se a URL da ENEM API está correta
   - Verificar se ambos os serviços estão rodando

### Logs
```bash
# Ver logs do Render
# Acesse o dashboard do Render > Seu Serviço > Logs
```

## 📝 Notas Importantes

- O Render usa **concurrently** para rodar ambos os serviços
- A ENEM API roda na porta **3001** internamente
- O HubEdu.ai roda na porta **3000** (padrão do Render)
- Ambos os serviços compartilham o mesmo processo Node.js
- Use **PostgreSQL** para produção (não SQLite)

## 🔗 URLs de Produção

- **HubEdu.ai**: `https://seu-app.onrender.com`
- **ENEM API**: `https://seu-enem-api.onrender.com`
- **Health Check**: `https://seu-app.onrender.com/api/health`
