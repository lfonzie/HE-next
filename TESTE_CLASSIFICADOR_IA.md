# 🧪 TESTE DO CLASSIFICADOR IA

## 🚀 INICIE O SERVIDOR

```bash
npm run dev
```

---

## ✅ CASOS DE TESTE

### 1️⃣ **Módulo TI** (antes falhava!)

Digite no chat:
```
classroom nao abre
```

**✅ Esperado:**
- Log: `🎯 [AI-CLASSIFIER] Classified as: ti`
- Resposta: Triagem com 7 perguntas sobre o problema

---

### 2️⃣ **Módulo Social Media**

Digite no chat:
```
post sobre visita ao zoo
```

**✅ Esperado:**
- Log: `🎯 [AI-CLASSIFIER] Classified as: social_media`
- Resposta: Perguntar 5 parâmetros antes de gerar

---

### 3️⃣ **Módulo TI (outras variações)**

Teste essas frases:
```
google drive não carrega
app trava
erro no sistema
impressora não funciona
projetor não liga
```

**✅ Esperado:** Todas devem detectar `module: ti`

---

### 4️⃣ **Módulo Financeiro**

```
como pagar o boleto
mensalidade atrasada
valor da matrícula
```

**✅ Esperado:** `module: financeiro`

---

### 5️⃣ **Módulo Bem-Estar**

```
estou me sentindo ansioso
me sinto triste hoje
problema emocional
```

**✅ Esperado:** `module: bem_estar`

---

### 6️⃣ **Módulo Professor (padrão)**

```
como resolver equação do segundo grau
dúvida sobre fotossíntese
```

**✅ Esperado:** `module: professor`

---

## 🔍 VERIFICAR LOGS

### No Console do Navegador (F12):

**✅ Sucesso (usando IA):**
```
🎯 [AI-CLASSIFIER] Classified as: ti (Suporte Técnico)
✅ [SYSTEM-PROMPT] Loaded from system-message.json for module: ti
```

**✅ Sucesso (usando cache):**
```
🎯 [AI-CLASSIFIER] Cache hit for: "classroom nao abre"
```

**⚠️ Fallback (se API falhar):**
```
❌ [AI-CLASSIFIER] API error, using fallback
🔄 [AI-CLASSIFIER] Falling back to regex classifier
```

---

## 🎯 TESTE AVANÇADO

### Cache

1. Digite: `classroom nao abre`
2. Aguarde resposta
3. Digite novamente: `classroom nao abre`
4. **Esperado:** Segunda vez deve usar cache (instantâneo)

### Módulos Ambíguos

Digite:
```
quero fazer post sobre problema no computador
```

**Teste:** Veja se a IA escolhe `social_media` (pelo "post") ou `ti` (pelo "problema no computador")

---

## 🐛 TROUBLESHOOTING

### Problema: Sempre usa fallback

**Solução:** Verifique se `XAI_API_KEY` está configurada:
```bash
# .env.local
XAI_API_KEY=xai-...
```

### Problema: Demora muito para classificar

**Solução:** Primeira classificação pode demorar ~500ms (IA). Segunda é instantânea (cache).

### Problema: Detecta módulo errado

**Solução:** 
1. Limpe o cache (reinicie o servidor)
2. Verifique a descrição do módulo em `system-message.json`
3. Teste com mensagem mais específica

---

## ✅ CHECKLIST COMPLETO

- [ ] Servidor iniciado (`npm run dev`)
- [ ] "classroom nao abre" → detecta `ti` ✅
- [ ] "post sobre zoo" → detecta `social_media` ✅
- [ ] Cache funciona (segunda mensagem é instantânea) ✅
- [ ] Fallback funciona (se API falhar) ✅
- [ ] Logs aparecem no console do navegador ✅

---

## 🎉 TUDO FUNCIONANDO?

Se todos os testes passaram:
✅ **Classificador IA implementado com sucesso!**

Agora o sistema detecta automaticamente o módulo correto para qualquer mensagem! 🚀

