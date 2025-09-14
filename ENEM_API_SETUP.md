# 🎓 ENEM API Integration Setup

Este documento explica como configurar e executar o HubEdu.ai junto com a ENEM API.

## 📋 Visão Geral

O projeto agora inclui uma integração completa com a **ENEM API** - uma API pública para consulta de provas e questões do ENEM. Ambos os servidores podem ser executados simultaneamente.

### 🌐 Servidores
- **HubEdu.ai**: `http://localhost:3000` (Aplicação principal)
- **ENEM API**: `http://localhost:3001` (API de questões do ENEM)

## 🚀 Início Rápido

### 1. Instalar Dependências
```bash
# Instalar dependências do projeto principal
npm install

# Instalar dependências da ENEM API
cd enem-api-main
npm install
cd ..
```

### 2. Configurar Ambiente
```bash
# Configurar variáveis de ambiente do HubEdu.ai
./setup-env.sh

# A ENEM API já tem seu .env configurado automaticamente
```

### 3. Executar Ambos os Servidores
```bash
# Opção 1: Executar ambos simultaneamente (RECOMENDADO)
npm run dev:all

# Opção 2: Executar individualmente
npm run dev          # HubEdu.ai na porta 3000
npm run enem:dev     # ENEM API na porta 3001
```

## 📜 Scripts Disponíveis

### Scripts Principais
- `npm run dev:all` - Executa ambos os servidores simultaneamente
- `npm run dev` - Executa apenas o HubEdu.ai
- `npm run setup` - Configuração inicial do projeto

### Scripts da ENEM API
- `npm run enem:dev` - Executa ENEM API em modo desenvolvimento
- `npm run enem:build` - Build da ENEM API
- `npm run enem:start` - Executa ENEM API em modo produção

## 🔧 Configuração Detalhada

### Variáveis de Ambiente

#### HubEdu.ai (.env.local)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/hubedu_db"
NEXTAUTH_SECRET="your-secret-key-here-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

#### ENEM API (.env)
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="enem-api-secret-key-change-in-production-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3001"
```

### Banco de Dados

#### HubEdu.ai
- Usa PostgreSQL (configurável)
- Executa migrations automaticamente
- Inclui seed de dados inicial

#### ENEM API
- Usa SQLite por padrão (`file:./dev.db`)
- Contém dados de provas e questões do ENEM
- Executa migrations automaticamente

## 🌐 Endpoints da ENEM API

### Principais Endpoints
- `GET /v1/exams` - Lista todos os exames disponíveis
- `GET /v1/exams/[year]` - Exames de um ano específico
- `GET /v1/exams/[year]/questions` - Questões de um ano específico
- `GET /v1/exams/[year]/questions/[index]` - Questão específica

### Exemplos de Uso
```bash
# Listar todos os exames
curl http://localhost:3001/v1/exams

# Questões do ENEM 2023
curl http://localhost:3001/v1/exams/2023/questions

# Questão específica (primeira questão de 2023)
curl http://localhost:3001/v1/exams/2023/questions/0
```

## 📊 Monitoramento

### Logs
- **HubEdu.ai**: `hubedu.log`
- **ENEM API**: `enem-api.log`

### Verificar Status
```bash
# Ver logs em tempo real
tail -f hubedu.log
tail -f enem-api.log

# Verificar portas em uso
lsof -i :3000  # HubEdu.ai
lsof -i :3001  # ENEM API
```

## 🛠️ Solução de Problemas

### Porta já em uso
O script `start-all.sh` detecta automaticamente portas em uso e oferece opções para:
- Parar o processo existente
- Escolher uma porta diferente
- Cancelar a execução

### Problemas de Banco de Dados
```bash
# Resetar banco da ENEM API
cd enem-api-main
npx prisma migrate reset
npx prisma generate

# Resetar banco do HubEdu.ai
npx prisma db push
npx prisma db seed
```

### Dependências
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# ENEM API
cd enem-api-main
rm -rf node_modules package-lock.json
npm install
```

## 🔗 Integração com HubEdu.ai

A ENEM API pode ser integrada ao HubEdu.ai para:
- Simulados do ENEM
- Questões de prática
- Análise de desempenho
- Conteúdo educacional personalizado

### Exemplo de Integração
```typescript
// Buscar questões do ENEM
const response = await fetch('http://localhost:3001/v1/exams/2023/questions');
const questions = await response.json();

// Usar no HubEdu.ai
const enemQuestions = questions.map(q => ({
  id: q.id,
  question: q.question,
  alternatives: q.alternatives,
  correctAnswer: q.correctAnswer,
  subject: q.subject
}));
```

## 📚 Documentação Adicional

- [ENEM API Docs](https://docs.enem.dev)
- [HubEdu.ai README](./README.md)
- [ENEM API Repository](https://github.com/yunger7/enem-api)

## 🎉 Pronto para Usar!

Agora você pode executar `npm run dev:all` para iniciar ambos os servidores e começar a desenvolver com acesso completo às questões do ENEM!
