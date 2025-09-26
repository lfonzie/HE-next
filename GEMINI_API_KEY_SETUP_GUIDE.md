# 🔧 Configuração da Chave Gemini API - Guia Completo

## ❌ **Problema Identificado**
```
Erro ao conectar: Error: GEMINI_API_KEY não configurada
```

## ✅ **Solução**

### **1. Verificar Arquivo .env.local**
O arquivo `.env.local` já contém a chave Gemini, mas precisa da variável específica para o frontend:

```bash
# Já existe no .env.local:
GEMINI_API_KEY=AIzaSyD1SDmMlsj3fLhY-a5rFT5xhcVUqYxBwXg

# Adicionada para o frontend:
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyD1SDmMlsj3fLhY-a5rFT5xhcVUqYxBwXg
```

### **2. Reiniciar Servidor de Desenvolvimento**
```bash
# Parar o servidor atual (Ctrl+C)
# Depois executar:
npm run dev
# ou
yarn dev
```

### **3. Verificar Configuração**
Após reiniciar, acesse:
```
http://localhost:3000/test-live-audio-aulas
```

## 🔍 **Verificação Manual**

### **No Console do Navegador:**
```javascript
// Verificar se a variável está disponível
console.log(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
// Deve mostrar: AIzaSyD1SDmMlsj3fLhY-a5rFT5xhcVUqYxBwXg
```

### **No Terminal:**
```bash
# Verificar se a variável está no arquivo
grep "NEXT_PUBLIC_GEMINI_API_KEY" .env.local
```

## 🎯 **Teste da Funcionalidade**

### **1. Acesse a Página de Teste**
```
http://localhost:3000/test-live-audio-aulas
```

### **2. Teste a Conexão**
1. Clique em **"Conectar"**
2. Aguarde o status mudar para **"Conectado"**
3. Digite um texto de teste
4. Clique em **"Falar"**
5. O áudio deve ser reproduzido em tempo real

### **3. Teste nas Aulas**
1. Acesse qualquer aula em `/aulas`
2. O sistema deve usar automaticamente o `LiveAudioStreamPlayer`
3. Clique em **"Conectar"** e depois **"Falar"**

## 🚨 **Possíveis Problemas**

### **1. Variável Não Carregada**
```bash
# Solução: Reiniciar servidor
pkill -f "next dev"
npm run dev
```

### **2. Chave Inválida**
```bash
# Verificar se a chave está correta
echo $NEXT_PUBLIC_GEMINI_API_KEY
```

### **3. Cache do Navegador**
```bash
# Limpar cache e recarregar página
Ctrl+Shift+R (Chrome/Firefox)
```

## 📋 **Checklist de Configuração**

- [ ] ✅ Arquivo `.env.local` existe
- [ ] ✅ `GEMINI_API_KEY` está configurada
- [ ] ✅ `NEXT_PUBLIC_GEMINI_API_KEY` foi adicionada
- [ ] ✅ Servidor foi reiniciado
- [ ] ✅ Página de teste carrega sem erros
- [ ] ✅ Botão "Conectar" funciona
- [ ] ✅ Status muda para "Conectado"
- [ ] ✅ Botão "Falar" reproduz áudio

## 🎉 **Resultado Esperado**

Após a configuração correta:
1. **Conexão bem-sucedida** com Gemini Live API
2. **Streaming de áudio** em tempo real
3. **Visualização de áudio** funcionando
4. **Latência mínima** (~100ms)
5. **Qualidade nativa** de áudio

## 🔧 **Configuração Alternativa**

Se ainda houver problemas, você pode usar a chave diretamente no código:

```typescript
// Em LiveAudioStreamPlayer.tsx (temporário)
const API_KEY = "AIzaSyD1SDmMlsj3fLhY-a5rFT5xhcVUqYxBwXg";

// Substituir:
if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY não configurada');
}

// Por:
if (!API_KEY) {
  throw new Error('GEMINI_API_KEY não configurada');
}
```

## 📞 **Suporte**

Se o problema persistir:
1. Verifique se a chave Gemini está ativa
2. Confirme se o modelo `gemini-2.5-flash-preview-native-audio-dialog` está disponível
3. Teste com uma nova chave API se necessário

