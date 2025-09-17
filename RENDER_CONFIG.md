# 🚀 Configuração para Deploy no Render

## 📋 Comandos para o Render Dashboard

### Build Command
```bash
npm ci && npm run build
```

### Start Command
```bash
npm start
```

## 🔧 Configuração Detalhada

### 1. Serviço Principal (HubEdu.ai)

**Configurações no Render:**
- **Runtime**: Node.js
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Plan**: Starter (ou superior)
- **Auto-Deploy**: Yes

**Variáveis de Ambiente Obrigatórias:**
```env
NODE_ENV=production
NEXTAUTH_SECRET=<gerar-secret-seguro>
NEXTAUTH_URL=https://seu-app.onrender.com
DATABASE_URL=<url-do-banco-postgres>
OPENAI_API_KEY=<sua-chave-openai>
ENEM_API_URL=https://seu-enem-api.onrender.com
```

**Variáveis de Ambiente Opcionais:**
```env
GOOGLE_CLIENT_ID=<seu-google-client-id>
GOOGLE_CLIENT_SECRET=<seu-google-client-secret>
GITHUB_CLIENT_ID=<seu-github-client-id>
GITHUB_CLIENT_SECRET=<seu-github-client-secret>
```

### 2. Serviço ENEM API (Separado)

**Configurações no Render:**
- **Runtime**: Node.js
- **Build Command**: `cd enem-api-main && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build`
- **Start Command**: `cd enem-api-main && npm start`
- **Plan**: Starter (ou superior)
- **Auto-Deploy**: Yes

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

## 🚀 Processo de Deploy

### Opção 1: Deploy Único (Recomendado)
1. **Criar serviço no Render**
2. **Conectar repositório GitHub**
3. **Configurar Build Command**: `npm ci && npm run build`
4. **Configurar Start Command**: `npm start`
5. **Configurar variáveis de ambiente**
6. **Deploy**

### Opção 2: Deploy Separado
1. **Criar serviço principal** (HubEdu.ai)
2. **Criar serviço ENEM API** (separado)
3. **Configurar cada um com seus respectivos comandos**
4. **Configurar variáveis de ambiente**
5. **Deploy ambos**

## 📊 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev          # Ambos os serviços
npm run dev:turbo    # Apenas HubEdu.ai
npm run dev:all      # Script completo
```

### Produção
```bash
npm run build        # Build completo
npm run start        # Start completo
npm run build:hubedu # Build apenas HubEdu.ai
npm run build:enem   # Build apenas ENEM API
npm run start:hubedu # Start apenas HubEdu.ai
npm run start:enem   # Start apenas ENEM API
```

## 🔄 Fluxo de Deploy Automático

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
   - Verificar se o banco de dados está acessível

2. **Start falha**
   - Verificar se o banco de dados está acessível
   - Verificar se as portas estão configuradas corretamente
   - Verificar logs do Render

3. **ENEM API não conecta**
   - Verificar se a URL da ENEM API está correta
   - Verificar se ambos os serviços estão rodando
   - Verificar se as variáveis de ambiente estão corretas

### Logs
- Acesse o dashboard do Render > Seu Serviço > Logs
- Use `tail -f` para acompanhar logs em tempo real

## 📝 Notas Importantes

- O Render usa **concurrently** para rodar ambos os serviços
- A ENEM API roda na porta **3001** internamente
- O HubEdu.ai roda na porta **3000** (padrão do Render)
- Ambos os serviços compartilham o mesmo processo Node.js
- Use **PostgreSQL** para produção (não SQLite)
- O Render pode demorar alguns minutos para fazer o deploy

## 🔗 URLs de Produção

- **HubEdu.ai**: `https://seu-app.onrender.com`
- **ENEM API**: `https://seu-enem-api.onrender.com`
- **Health Check**: `https://seu-app.onrender.com/api/health`

## 🎯 Resumo dos Comandos

**Para o Render Dashboard:**
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`

**Para desenvolvimento local:**
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Start**: `npm start`
