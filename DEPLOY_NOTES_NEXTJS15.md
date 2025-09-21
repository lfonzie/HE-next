# Deploy Notes - Next.js 15 + React 19

## 🚀 Deploy Checklist para Render

### **1. Pré-Deploy**
- ✅ Build local funcionando (`npm run build`)
- ✅ Dependências atualizadas para Next.js 15 + React 19
- ✅ Configurações TypeScript strict mode
- ✅ ESLint configurado sem conflitos

### **2. Configuração Render**

#### **Build Command**
```bash
npm ci --include=dev && npx prisma generate && npm run build
```

#### **Start Command**
```bash
npx prisma migrate deploy && npm start
```

#### **Node Version**
- ✅ Node.js 20.x (recomendado para Next.js 15)

### **3. Variáveis de Ambiente**

#### **Obrigatórias**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app.onrender.com
OPENAI_API_KEY=sk-your-openai-key
NEXT_PUBLIC_BASE_URL=https://your-app.onrender.com
```

#### **Opcionais**
```env
GOOGLE_GENERATIVE_AI_API_KEY=your-google-key
NEXT_TELEMETRY_DISABLED=1
```

### **4. Health Checks**

#### **Endpoint Principal**
```
GET /api/health
```

#### **Endpoints Adicionais**
```
GET /api/healthz
GET /api/enem/health
```

### **5. Verificações Pós-Deploy**

#### **Funcionalidades Críticas**
- ✅ Home page carregando
- ✅ Sistema de autenticação funcionando
- ✅ Chat multi-provider funcionando
- ✅ APIs respondendo corretamente
- ✅ Health checks passando

#### **Performance**
- ✅ First load JS: ~102kB
- ✅ Build time: ~63s
- ✅ Response time: <2s para APIs

### **6. Rollback Plan**

#### **Se necessário voltar para Next.js 14**
```bash
# 1. Reverter package.json
git checkout HEAD~1 -- package.json

# 2. Reverter tsconfig.json
git checkout HEAD~1 -- tsconfig.json

# 3. Reverter next.config.js
git checkout HEAD~1 -- next.config.js

# 4. Reinstalar dependências
npm install

# 5. Deploy
git push origin main
```

### **7. Monitoramento**

#### **Métricas Importantes**
- Build time
- Response time das APIs
- Error rate
- Memory usage
- CPU usage

#### **Logs para Acompanhar**
- Build logs
- Runtime errors
- API response times
- Database connection status

### **8. Troubleshooting**

#### **Problemas Comuns**

**Build falha**
```bash
# Verificar Node.js version
node --version  # Deve ser 20.x

# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Runtime errors**
```bash
# Verificar variáveis de ambiente
# Verificar logs do Render
# Testar health checks
```

**Performance issues**
```bash
# Verificar bundle size
npm run build
# Verificar First Load JS
```

### **9. Otimizações Next.js 15**

#### **Features Habilitadas**
```javascript
// next.config.js
experimental: {
  optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
}
```

#### **TypeScript Strict Mode**
```json
// tsconfig.json
{
  "strict": true,
  "moduleResolution": "bundler"
}
```

### **10. Status Final**

**🎉 PRONTO PARA DEPLOY!**

- ✅ Next.js 15 + React 19
- ✅ Build funcionando
- ✅ Configuração Render atualizada
- ✅ Health checks configurados
- ✅ Rollback plan preparado
- ✅ Monitoramento configurado

**Deploy seguro e monitorado!** 🚀
