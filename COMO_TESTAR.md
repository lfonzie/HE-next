# 🧪 COMO TESTAR O HUBEDU.IA

## 🚀 **TESTE RÁPIDO (Recomendado)**

```bash
# 1. Teste básico do sistema
node teste-rapido.cjs

# 2. Teste completo (servidor + sistema + APIs)
node teste-tudo.cjs
```

## 📋 **TESTES MANUAIS**

### **1. Teste do Rate Limiting B2C**
1. Acesse `http://localhost:3000`
2. Faça login com usuário B2C
3. Envie 100+ mensagens no chat
4. Deve aparecer erro 429 após limite

### **2. Teste do Sistema de Certificados**
1. Acesse `http://localhost:3000/aulas`
2. Gere e complete uma aula
3. Verifique se certificado foi emitido
4. Acesse `http://localhost:3000/api/certificates`

### **3. Teste do Pricing B2B**
1. Acesse `http://localhost:3000/api/b2b-pricing?action=plans`
2. Teste cálculo: `?action=calculate&studentCount=300`
3. Verifique se preços estão corretos

### **4. Teste do Simulador ENEM**
1. Acesse `http://localhost:3000/enem`
2. Execute um simulado rápido
3. Verifique estatísticas e explicações

### **5. Teste da Correção de Redação**
1. Acesse `http://localhost:3000/redacao`
2. Escreva uma redação
3. Clique em "Corrigir"
4. Verifique feedback detalhado

## 🔧 **TESTES DE DESENVOLVIMENTO**

### **Iniciar Servidor**
```bash
npm run dev
```

### **Verificar Banco**
```bash
npx prisma studio
```

### **Testar APIs Individualmente**
```bash
# Rate limiting
curl -X POST "http://localhost:3000/api/chat/unified" \
  -H "Content-Type: application/json" \
  -d '{"provider":"openai","model":"gpt-4o-mini","input":"teste","module":"chat"}'

# Certificados
curl "http://localhost:3000/api/certificates"

# Pricing B2B
curl "http://localhost:3000/api/b2b-pricing?action=plans"
```

## ✅ **CHECKLIST DE TESTES**

### **Funcionalidades Críticas**
- [ ] Rate limiting B2C (100 msgs/dia)
- [ ] Sistema de certificados
- [ ] Pricing B2B automático
- [ ] Simulador ENEM
- [ ] Correção de redação
- [ ] Chat com 8 módulos
- [ ] Sistema multi-tenant

### **Integrações**
- [ ] Banco de dados
- [ ] APIs externas
- [ ] Autenticação
- [ ] Streaming de respostas
- [ ] Cache de IA

### **Performance**
- [ ] Tempo de resposta < 2s
- [ ] Uso de memória < 500MB
- [ ] Conexões de banco < 10
- [ ] Cache hit rate > 80%

## 🐛 **TROUBLESHOOTING**

### **Problemas Comuns**

#### **Rate Limiting não funciona**
```bash
# Verificar tabelas
npx prisma studio
# Ou executar:
node teste-rapido.cjs
```

#### **Certificados não são emitidos**
```bash
# Verificar logs
grep -i "certificate" logs/error.log
# Testar manualmente
curl -X POST "http://localhost:3000/api/certificates" \
  -H "Content-Type: application/json" \
  -d '{"action":"lesson_completed","module":"aulas"}'
```

#### **Pricing não calcula**
```bash
# Verificar API
curl "http://localhost:3000/api/b2b-pricing?action=plans"
# Verificar logs
grep -i "pricing" logs/error.log
```

#### **Servidor não inicia**
```bash
# Verificar dependências
npm install
# Verificar banco
npx prisma generate
npx prisma db push
# Verificar variáveis
cat .env.local
```

## 📊 **MONITORAMENTO**

### **Logs em Tempo Real**
```bash
# Logs do servidor
npm run dev
# Ou se usando PM2:
pm2 logs hubedu-ia
```

### **Métricas do Banco**
```sql
-- Verificar uso de mensagens
SELECT 
  u.email,
  dmu.date,
  dmu.message_count
FROM daily_message_usage dmu
JOIN "User" u ON dmu.user_id = u.id
WHERE dmu.date = CURRENT_DATE
ORDER BY dmu.message_count DESC;

-- Verificar certificados emitidos
SELECT 
  u.email,
  c.title,
  c.type,
  c.issued_at
FROM certificates c
JOIN "User" u ON c.user_id = u.id
WHERE DATE(c.issued_at) = CURRENT_DATE
ORDER BY c.issued_at DESC;
```

## 🎯 **RESULTADOS ESPERADOS**

### **Teste Rápido**
```
✅ Banco conectado
✅ Tabela daily_message_usage: OK
✅ Tabela message_usage_log: OK
✅ Tabela certificates: OK
✅ Tabela lesson_completions: OK
✅ Tabela school_subscriptions: OK
✅ Tabela School: OK
✅ Criação de usuário: OK
✅ Rate limiting: OK
✅ Sistema de certificados: OK
✅ Pricing B2B: OK
🎉 TESTE RÁPIDO CONCLUÍDO COM SUCESSO!
```

### **Teste de APIs**
```
✅ Obter planos: OK (200)
✅ Calcular preço para 300 alunos: OK (200)
✅ Obter estatísticas: OK (200)
✅ Obter questões ENEM: OK (200)
✅ Obter temas de redação: OK (200)
🎯 TESTE DE APIs CONCLUÍDO!
```

## 🚀 **PRÓXIMOS PASSOS**

1. **Execute os testes automatizados**
2. **Teste manualmente cada funcionalidade**
3. **Verifique performance e logs**
4. **Corrija bugs encontrados**
5. **Prepare para lançamento**

---

**Dica**: Mantenha este guia atualizado conforme novas funcionalidades são implementadas!
