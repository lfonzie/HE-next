# Configuração do Google Gemini para Sugestões Inteligentes

## Visão Geral

O sistema de sugestões inteligentes usa o Google Gemini para gerar sugestões dinâmicas e variadas a cada carregamento da página `/aulas`.

## Configuração

### 1. Obter Chave da API

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada

### 2. Configurar Variável de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Google Gemini Configuration (qualquer uma das opções abaixo)
GOOGLE_GEMINI_API_KEY="sua_chave_aqui"
# OU
GEMINI_API_KEY="sua_chave_aqui"
# OU
GOOGLE_GENERATIVE_AI_API_KEY="sua_chave_aqui"
```

### 3. Reiniciar o Servidor

Após configurar a chave, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Funcionamento

### Com Chave da API Configurada
- ✅ Gera sugestões únicas usando IA
- ✅ Tópicos diversificados e atuais
- ✅ Adaptados para estudantes brasileiros
- ✅ Cache de 1 hora para performance

### Sem Chave da API
- ✅ Usa sugestões pré-definidas embaralhadas
- ✅ Funciona normalmente
- ✅ Sugestões variadas a cada carregamento

## Estrutura das Sugestões

Cada sugestão contém:
- `text`: Tópico específico da aula
- `category`: Matéria/disciplina
- `level`: Nível educacional (6º ano ao Ensino Médio)

## Exemplos de Sugestões Geradas

- "Como a inteligência artificial está mudando o mundo do trabalho?"
- "A matemática por trás dos algoritmos do Instagram"
- "Por que alguns países são mais ricos que outros?"
- "Como funciona a vacinação e por que é importante?"
- "A física dos esportes: por que alguns atletas são mais rápidos?"

## Troubleshooting

### Erro 500 na API
- Verifique se a chave da API está configurada corretamente
- Confirme se o arquivo `.env.local` está na raiz do projeto
- Reinicie o servidor após configurar a chave

### Sugestões não mudam
- Use o botão de refresh na interface
- Limpe o cache do navegador
- Verifique se não há cache local válido

### Fallback Ativo
- Se aparecer "Usando sugestões de fallback", a API do Gemini não está funcionando
- O sistema continuará funcionando com sugestões pré-definidas
- Verifique a configuração da chave da API

## Arquivos Relacionados

- `app/api/suggestions/route.ts` - API principal com Gemini
- `app/api/suggestions-simple/route.ts` - API de fallback
- `hooks/useDynamicSuggestions.ts` - Hook para buscar sugestões
- `app/aulas/page.tsx` - Interface das sugestões
