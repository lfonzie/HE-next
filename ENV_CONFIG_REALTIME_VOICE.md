# 🔧 Configuração de Variáveis de Ambiente - Chat de Voz em Tempo Real

## 📋 Variáveis Necessárias

Para o **Chat de Voz em Tempo Real** funcionar, você precisa configurar a API Key do Gemini no arquivo `.env.local`.

---

## ⚙️ Passo a Passo

### 1. **Obter a API Key do Gemini**

#### Opção A: Usar API Key Existente
Se você já tem uma chave do Gemini configurada no projeto, ela será usada automaticamente.

#### Opção B: Criar Nova API Key
1. Acesse: https://aistudio.google.com/app/apikey
2. Clique em **"Create API Key"**
3. Copie a chave gerada

### 2. **Configurar no .env.local**

Abra o arquivo `.env.local` na raiz do projeto e adicione:

```bash
# Gemini API Key (use uma das opções abaixo)

# Opção 1: Usando NEXT_PUBLIC_GEMINI_API_KEY
NEXT_PUBLIC_GEMINI_API_KEY="AIzaSyD1SDmMlsj3fLhY-a5rFT5xhcVUqYxBwXg"

# OU

# Opção 2: Usando NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY
NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY="AIzaSyD1SDmMlsj3fLhY-a5rFT5xhcVUqYxBwXg"
```

> ⚠️ **IMPORTANTE**: Use `NEXT_PUBLIC_` no início para que a chave seja acessível no frontend.

### 3. **Reiniciar o Servidor**

Após adicionar a variável, reinicie o servidor de desenvolvimento:

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
# ou
yarn dev
```

---

## ✅ Verificação

### Teste se está configurado corretamente:

1. Acesse: `http://localhost:3000/gemini-realtime-voice`
2. Clique em **"Iniciar Conversa"**
3. Se aparecer erro "GEMINI_API_KEY não configurada", revise os passos acima
4. Se conectar com sucesso, está tudo certo! ✅

---

## 🔐 Segurança

### ⚠️ Chaves Públicas no Frontend

Como esta é uma chave `NEXT_PUBLIC_*`, ela será exposta no frontend. Para ambientes de produção:

**Recomendações:**
1. Use **restrições de API Key** no Google Cloud Console
2. Limite por **domínio** (ex: `seudominio.com`)
3. Limite por **quotas** para evitar uso excessivo
4. Monitore o uso no [Google Cloud Console](https://console.cloud.google.com)

### Como Restringir a Chave

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Clique na sua API Key
3. Em "Application restrictions", selecione "HTTP referrers"
4. Adicione seu domínio: `https://seudominio.com/*`
5. Salve as mudanças

---

## 🌐 Variáveis Existentes no Projeto

O projeto já suporta múltiplas variações da chave Gemini:

```bash
# Servidor (backend)
GOOGLE_GEMINI_API_KEY=""
GEMINI_API_KEY=""
GOOGLE_GENERATIVE_AI_API_KEY=""

# Cliente (frontend) - Necessário para este chat
NEXT_PUBLIC_GEMINI_API_KEY=""
NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY=""
```

O chat de voz em tempo real usa as versões `NEXT_PUBLIC_*` pois roda no navegador.

---

## 🐛 Solução de Problemas

### Erro: "GEMINI_API_KEY não configurada"

**Causa**: Variável de ambiente não foi encontrada

**Solução**:
1. Verifique se adicionou ao `.env.local` (não `.env`)
2. Use `NEXT_PUBLIC_` no início da variável
3. Reinicie o servidor após adicionar
4. Confirme que o arquivo está na raiz do projeto

### Erro: "API key não válida"

**Causa**: Chave incorreta ou inativa

**Solução**:
1. Verifique se copiou a chave completa
2. Confirme que não há espaços extras
3. Gere uma nova chave se necessário
4. Verifique se a API do Gemini está habilitada

### Erro: "Quota exceeded"

**Causa**: Limite de uso da API atingido

**Solução**:
1. Aguarde reset da quota (geralmente diário)
2. Verifique limites em: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
3. Considere upgrade do plano se necessário

---

## 📝 Exemplo de .env.local Completo

```bash
# Database
DATABASE_URL="postgresql://localhost:5432/hubedu_dev"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Gemini API (Backend)
GOOGLE_GEMINI_API_KEY="sua-chave-aqui"
GEMINI_API_KEY="sua-chave-aqui"

# Gemini API (Frontend) - NECESSÁRIO PARA CHAT DE VOZ
NEXT_PUBLIC_GEMINI_API_KEY="sua-chave-aqui"

# Outras APIs...
OPENAI_API_KEY="..."
```

---

## 🎯 Onde a Chave é Usada

```typescript
// app/gemini-realtime-voice/page.tsx

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 
               process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY não configurada...');
}

const client = new GoogleGenAI({ apiKey });
```

---

## ✅ Checklist de Configuração

- [ ] API Key obtida do Google AI Studio
- [ ] Adicionada ao `.env.local` com prefixo `NEXT_PUBLIC_`
- [ ] Servidor reiniciado
- [ ] Teste realizado em `/gemini-realtime-voice`
- [ ] Conexão estabelecida com sucesso
- [ ] (Opcional) Restrições de segurança configuradas

---

## 🔗 Links Úteis

- **Obter API Key**: https://aistudio.google.com/app/apikey
- **Google Cloud Console**: https://console.cloud.google.com
- **Documentação Gemini**: https://ai.google.dev/gemini-api/docs
- **Gerenciar Quotas**: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

---

**Atualizado**: 08/10/2025  
**Versão**: 1.0.0

