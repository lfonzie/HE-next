# 🔍 Debug do Live Audio - Logs Adicionados

## 🎯 **Problema Reportado**

- **❌ Sintoma**: "clico, ele inicia mas nada acontece"
- **❌ Comportamento**: Botão funciona, mas não há resposta da IA
- **❌ Possíveis causas**: Sessão não conectada, áudio não enviado, API key inválida

## 🔧 **Logs de Debug Adicionados**

### **1. Inicialização do Cliente**
```typescript
console.log('🔑 API Key encontrada:', apiKey ? 'Sim' : 'Não')
console.log('📦 Importando GoogleGenAI...')
console.log('✅ GoogleGenAI importado com sucesso')
console.log('✅ Cliente Gemini criado:', clientRef.current)
```

### **2. Conexão com Gemini Live**
```typescript
console.log('🔗 Tentando conectar com Gemini Live...', { model })
console.log('🔗 Gemini Live conectado com sucesso!')
console.log('✅ Sessão Gemini Live criada:', sessionRef.current)
```

### **3. Processamento de Áudio**
```typescript
console.log('🎤 Iniciando gravação...')
console.log('📡 Status: Solicitando acesso ao microfone...')
console.log('✅ Microfone autorizado:', mediaStream)
console.log('🎵 Enviando áudio PCM:', pcmData.length, 'samples')
console.log('🎤 Gravação iniciada com sucesso')
```

### **4. Resposta da IA**
```typescript
console.log('📨 Mensagem recebida do Gemini:', message)
console.log('🎵 Áudio recebido da IA:', audio.data.length, 'bytes')
console.log('🔊 Reproduzindo áudio da IA')
```

## 🎯 **Como Testar e Debug**

### **1. Abra o Console do Navegador**
- **Chrome/Edge**: F12 → Console
- **Firefox**: F12 → Console
- **Safari**: Cmd+Option+I → Console

### **2. Acesse a Página**
- **URL**: `http://localhost:3000/live-audio`
- **Aguarde**: Logs de inicialização

### **3. Verifique os Logs de Inicialização**
```
🔑 API Key encontrada: Sim/Não
📦 Importando GoogleGenAI...
✅ GoogleGenAI importado com sucesso
✅ Cliente Gemini criado: [objeto]
🔗 Tentando conectar com Gemini Live...
🔗 Gemini Live conectado com sucesso!
✅ Sessão Gemini Live criada: [objeto]
```

### **4. Teste a Gravação**
- **Clique**: Botão vermelho
- **Verifique**: Logs de gravação
- **Fale**: No microfone
- **Observe**: Logs de áudio

### **5. Logs Esperados Durante Gravação**
```
🎤 Iniciando gravação...
📡 Status: Solicitando acesso ao microfone...
✅ Microfone autorizado: [MediaStream]
🎵 Enviando áudio PCM: 256 samples
🎤 Gravação iniciada com sucesso
```

## 🚨 **Possíveis Problemas e Soluções**

### **❌ Problema 1: API Key não encontrada**
```
🔑 API Key encontrada: Não
```
**Solução**: Verificar variáveis de ambiente

### **❌ Problema 2: Erro ao importar GoogleGenAI**
```
❌ Erro ao conectar com Gemini: [erro]
```
**Solução**: Verificar se `@google/genai` está instalado

### **❌ Problema 3: Sessão não conectada**
```
⚠️ Sessão não conectada, não é possível enviar áudio
```
**Solução**: Verificar conexão com Gemini Live

### **❌ Problema 4: Microfone não autorizado**
```
❌ Erro: Permissão de microfone negada
```
**Solução**: Autorizar microfone no navegador

## 🎯 **Próximos Passos**

1. **Abra o console** do navegador
2. **Acesse** `localhost:3000/live-audio`
3. **Copie e cole** todos os logs que aparecem
4. **Clique** no botão vermelho
5. **Fale** no microfone
6. **Compartilhe** os logs para análise

## 📋 **Checklist de Debug**

- [ ] Console aberto
- [ ] Logs de inicialização aparecem
- [ ] API Key encontrada
- [ ] GoogleGenAI importado
- [ ] Cliente Gemini criado
- [ ] Sessão Gemini Live conectada
- [ ] Microfone autorizado
- [ ] Áudio sendo enviado
- [ ] Resposta da IA recebida

---

**🔍 COMPARTILHE OS LOGS DO CONSOLE PARA IDENTIFICAR O PROBLEMA! 🔍**
