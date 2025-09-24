# 🔧 CONFIGURAÇÃO NECESSÁRIA PARA TTS

Para usar o sistema de Text-to-Speech, você precisa configurar a chave da OpenAI:

## 1. Obter Chave da OpenAI
- Acesse: https://platform.openai.com/api-keys
- Crie uma nova chave API
- Copie a chave gerada

## 2. Configurar no Projeto
Crie um arquivo `.env.local` na raiz do projeto com:

```bash
# OpenAI Configuration para TTS
OPENAI_API_KEY="sua-chave-openai-aqui"

# Outras configurações necessárias
DATABASE_URL="postgresql://localhost:5432/hubedu_dev"
DIRECT_URL="postgresql://localhost:5432/hubedu_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
GOOGLE_GEMINI_API_KEY="your-gemini-api-key-here"
```

## 3. Reiniciar o Servidor
Após configurar, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

## 4. Testar o TTS
- Acesse `/test-tts` para testar
- Ou gere uma aula em `/aulas` - o TTS aparecerá automaticamente

## 💡 Dica
O sistema TTS usa a voz "alloy" da OpenAI por padrão, que é neutra e clara.
