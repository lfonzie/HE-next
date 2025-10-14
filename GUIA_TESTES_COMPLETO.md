# 🧪 Guia Completo de Testes - HubEdu.ia

## 🚀 Como Executar os Testes

### 1. **Preparação do Ambiente**

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas configurações

# 3. Executar migração do banco
npx prisma generate
npx prisma db push

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

### 2. **Testes Automatizados**

#### **Teste de Banco de Dados**
```bash
# Testar se todas as tabelas foram criadas
node test-database.cjs
```

#### **Teste de Rate Limiting B2C**
```bash
# Testar sistema de limitação de mensagens
node test-rate-limiting.cjs
```

#### **Teste de Certificados**
```bash
# Testar sistema de certificados
node test-certificates.cjs
```

#### **Teste de Pricing B2B**
```bash
# Testar sistema de pricing
node test-b2b-pricing.cjs
```

#### **Teste de Integração Completa**
```bash
# Testar todos os sistemas integrados
node test-complete-integration.cjs
```

## 🌐 Testes Manuais via Interface

### **1. Teste do Rate Limiting B2C**

#### **Passo 1: Acessar o Chat**
1. Abra `http://localhost:3000`
2. Faça login com usuário B2C (role: 'FREE' ou 'STUDENT')
3. Vá para o chat principal

#### **Passo 2: Testar Limite de Mensagens**
1. Envie mensagens consecutivas no chat
2. Após 100 mensagens, deve aparecer erro 429
3. Verifique no console do navegador:
   ```javascript
   // Abra DevTools (F12) e execute:
   console.log('Testando rate limiting...')
   ```

#### **Passo 3: Verificar no Banco**
```sql
-- Conectar ao banco e executar:
SELECT * FROM daily_message_usage WHERE user_id = 'seu-user-id';
SELECT * FROM message_usage_log WHERE user_id = 'seu-user-id';
```

### **2. Teste do Sistema de Certificados**

#### **Passo 1: Concluir uma Aula**
1. Acesse `http://localhost:3000/aulas`
2. Gere uma nova aula
3. Complete a aula (responda o quiz)

#### **Passo 2: Verificar Certificado**
1. Acesse `http://localhost:3000/api/certificates`
2. Deve retornar certificados emitidos
3. Verifique no banco:
   ```sql
   SELECT * FROM certificates WHERE user_id = 'seu-user-id';
   SELECT * FROM lesson_completions WHERE user_id = 'seu-user-id';
   ```

### **3. Teste do Pricing B2B**

#### **Passo 1: Acessar Calculadora**
1. Vá para `http://localhost:3000/pricing` (se existir)
2. Ou teste via API: `http://localhost:3000/api/b2b-pricing?action=plans`

#### **Passo 2: Testar Cálculos**
```bash
# Testar diferentes números de alunos
curl "http://localhost:3000/api/b2b-pricing?action=calculate&studentCount=100"
curl "http://localhost:3000/api/b2b-pricing?action=calculate&studentCount=500"
curl "http://localhost:3000/api/b2b-pricing?action=calculate&studentCount=1000"
```

#### **Passo 3: Criar Assinatura de Teste**
```bash
curl -X POST "http://localhost:3000/api/b2b-pricing" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_subscription",
    "schoolId": "escola-teste-id",
    "planId": "growth",
    "studentCount": 300,
    "billingCycle": "monthly"
  }'
```

### **4. Teste do Simulador ENEM**

#### **Passo 1: Acessar Simulador**
1. Vá para `http://localhost:3000/enem`
2. Escolha um modo (rápido, oficial, por área)

#### **Passo 2: Executar Simulado**
1. Responda algumas questões
2. Finalize o simulado
3. Verifique estatísticas e explicações

#### **Passo 3: Verificar no Banco**
```sql
SELECT * FROM enem_sessions WHERE user_id = 'seu-user-id';
SELECT * FROM enem_answers WHERE session_id = 'sua-sessao-id';
```

### **5. Teste da Correção de Redação**

#### **Passo 1: Acessar Redação**
1. Vá para `http://localhost:3000/redacao`
2. Escolha um tema

#### **Passo 2: Escrever e Corrigir**
1. Digite uma redação
2. Clique em "Corrigir"
3. Verifique feedback detalhado

#### **Passo 3: Verificar no Banco**
```sql
SELECT * FROM redacao_corrections WHERE user_id = 'seu-user-id';
```

## 🔧 Testes de API Diretos

### **1. Teste de Rate Limiting**
```bash
# Simular múltiplas mensagens
for i in {1..105}; do
  curl -X POST "http://localhost:3000/api/chat/unified" \
    -H "Content-Type: application/json" \
    -d '{
      "provider": "openai",
      "model": "gpt-4o-mini",
      "input": "Teste de mensagem ' $i '",
      "module": "chat"
    }'
  echo "Mensagem $i enviada"
done
```

### **2. Teste de Certificados**
```bash
# Verificar certificados do usuário
curl "http://localhost:3000/api/certificates" \
  -H "Authorization: Bearer seu-token"

# Emitir certificado manualmente
curl -X POST "http://localhost:3000/api/certificates" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu-token" \
  -d '{
    "action": "lesson_completed",
    "module": "aulas",
    "metadata": {
      "lessonId": "test-lesson-id",
      "title": "Aula de Teste"
    }
  }'
```

### **3. Teste de Pricing B2B**
```bash
# Obter planos
curl "http://localhost:3000/api/b2b-pricing?action=plans"

# Calcular preço para 300 alunos
curl "http://localhost:3000/api/b2b-pricing?action=calculate&studentCount=300"

# Obter estatísticas
curl "http://localhost:3000/api/b2b-pricing?action=stats"
```

## 📊 Monitoramento em Tempo Real

### **1. Logs do Servidor**
```bash
# Acompanhar logs em tempo real
npm run dev
# Ou se usando PM2:
pm2 logs hubedu-ia
```

### **2. Logs do Banco**
```sql
-- Verificar uso de mensagens em tempo real
SELECT 
  u.email,
  dmu.date,
  dmu.message_count,
  dmu.module
FROM daily_message_usage dmu
JOIN "User" u ON dmu.user_id = u.id
WHERE dmu.date = CURRENT_DATE
ORDER BY dmu.message_count DESC;

-- Verificar certificados emitidos hoje
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

### **3. Métricas de Performance**
```bash
# Verificar uso de CPU e memória
htop

# Verificar conexões de banco
psql -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"

# Verificar logs de erro
tail -f logs/error.log
```

## 🐛 Debugging e Troubleshooting

### **1. Problemas Comuns**

#### **Rate Limiting não funciona**
```bash
# Verificar se tabelas existem
npx prisma studio
# Ou via SQL:
\dt daily_message_usage
\dt message_usage_log
```

#### **Certificados não são emitidos**
```bash
# Verificar logs de erro
grep -i "certificate" logs/error.log

# Testar manualmente
node -e "
const { CertificateSystem } = require('./lib/certificate-system');
CertificateSystem.checkAndIssueCertificate('user-id', 'aulas', 'lesson_completed');
"
```

#### **Pricing não calcula**
```bash
# Verificar se API está funcionando
curl -v "http://localhost:3000/api/b2b-pricing?action=plans"

# Verificar logs
grep -i "pricing" logs/error.log
```

### **2. Reset de Dados de Teste**
```sql
-- Limpar dados de teste
DELETE FROM daily_message_usage WHERE user_id LIKE 'teste-%';
DELETE FROM message_usage_log WHERE user_id LIKE 'teste-%';
DELETE FROM certificates WHERE user_id LIKE 'teste-%';
DELETE FROM lesson_completions WHERE user_id LIKE 'teste-%';
DELETE FROM school_subscriptions WHERE school_id LIKE 'teste-%';
DELETE FROM "School" WHERE name LIKE 'Teste%';
DELETE FROM "User" WHERE email LIKE 'teste-%';
```

## ✅ Checklist de Testes

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

## 🎯 Próximos Passos

1. **Executar todos os testes automatizados**
2. **Testar manualmente cada funcionalidade**
3. **Verificar performance e logs**
4. **Corrigir bugs encontrados**
5. **Preparar para lançamento**

---

**Dica**: Mantenha este guia atualizado conforme novas funcionalidades são implementadas!
