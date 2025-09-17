# Atualizando Projetos Existentes no Render

## 📋 Instruções para Projetos Existentes

Se você já tem projetos no Render com todas as variáveis de ambiente configuradas, siga estas instruções para atualizá-los:

### 1. **Atualizar HubEdu.ai (Projeto Existente)**

No dashboard do Render, vá para seu projeto HubEdu.ai existente e atualize:

#### **Build & Deploy:**
- **Build Command:** `npm install --prefer-offline --no-audit && npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `.` (raiz do repositório)

#### **Environment Variables:**
Adicione/atualize estas variáveis (mantenha as existentes):
```env
NODE_ENV=production
PORT=10000
ENEM_API_BASE=https://enem-api.onrender.com/v1
ENEM_FALLBACK_MODEL=gpt-4o-mini
NEXTAUTH_URL=https://seu-hubedu-app.onrender.com
```

#### **Health Check:**
- **Health Check Path:** `/api/health`

### 2. **Atualizar ENEM API (Projeto Existente)**

No dashboard do Render, vá para seu projeto ENEM API existente e atualize:

#### **Build & Deploy:**
- **Build Command:** `npm install --prefer-offline --no-audit && npx prisma generate && npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `enem-api-main`

#### **Environment Variables:**
Adicione/atualize estas variáveis (mantenha as existentes):
```env
NODE_ENV=production
PORT=11000
```

#### **Health Check:**
- **Health Check Path:** `/api/health`

### 3. **Configuração Manual (Alternativa ao render.yaml)**

Se preferir não usar o `render.yaml`, você pode atualizar manualmente:

1. **Acesse cada projeto no Render Dashboard**
2. **Vá em Settings → Build & Deploy**
3. **Atualize os comandos conforme acima**
4. **Vá em Settings → Environment**
5. **Adicione/atualize as variáveis de ambiente**
6. **Vá em Settings → Health Check**
7. **Configure o Health Check Path**

### 4. **Verificar URLs dos Projetos**

Após a atualização, você precisará:

1. **Obter a URL do ENEM API** (ex: `https://enem-api.onrender.com`)
2. **Atualizar a variável `ENEM_API_BASE`** no projeto HubEdu.ai:
   ```env
   ENEM_API_BASE=https://enem-api.onrender.com/v1
   ```
3. **Atualizar a variável `NEXTAUTH_URL`** no projeto HubEdu.ai:
   ```env
   NEXTAUTH_URL=https://seu-hubedu-app.onrender.com
   ```

### 5. **Deploy Manual**

Para fazer o deploy das atualizações:

1. **No projeto HubEdu.ai:** Clique em "Manual Deploy" → "Deploy latest commit"
2. **No projeto ENEM API:** Clique em "Manual Deploy" → "Deploy latest commit"

### 6. **Verificar Deploy**

Após o deploy, teste estes endpoints:

```bash
# Health checks
curl https://seu-hubedu-app.onrender.com/api/health
curl https://enem-api.onrender.com/api/health

# Teste de questões ENEM
curl "https://seu-hubedu-app.onrender.com/api/enem/questions?area=linguagens&limit=5"
```

### 7. **Logs e Monitoramento**

- **HubEdu.ai logs:** Dashboard → seu projeto → Logs
- **ENEM API logs:** Dashboard → seu projeto → Logs
- **Health checks:** Aparecerão automaticamente no dashboard

## 🔄 **Processo de Atualização**

1. ✅ **Commits já foram feitos** (render.yaml, health checks, etc.)
2. 🔄 **Atualize os projetos existentes** conforme instruções acima
3. 🚀 **Faça deploy manual** de ambos os projetos
4. ✅ **Teste os endpoints** para verificar funcionamento
5. 🔧 **Ajuste URLs** se necessário

## 📞 **Suporte**

Se encontrar problemas:
- Verifique os logs de build e deploy
- Confirme que todas as variáveis de ambiente estão corretas
- Teste os health checks primeiro
- Verifique se as URLs estão corretas
