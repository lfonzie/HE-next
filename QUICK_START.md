# 🚀 Quick Start - HubEdu.ai

## ⚡ Setup Rápido (5 minutos)

### 1. **Instalar Dependências**
```bash
npm install
```

### 2. **Configurar Variáveis de Ambiente**
Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Database (use Neon/Supabase para produção)
DATABASE_URL="postgresql://username:password@localhost:5432/hubedu_db"

# NextAuth.js (gere uma chave segura)
NEXTAUTH_SECRET="sua-chave-secreta-minimo-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (obtenha em platform.openai.com)
OPENAI_API_KEY="sk-sua-chave-openai-aqui"

# OAuth (opcional)
GOOGLE_CLIENT_ID="seu-google-client-id"
GOOGLE_CLIENT_SECRET="seu-google-client-secret"
```

### 3. **Configurar Banco de Dados**
```bash
# Executar migrations
npx prisma db push

# Popular com dados iniciais
npx prisma db seed
```

### 4. **Iniciar Desenvolvimento**
```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 🎯 Funcionalidades Principais

### 💬 **Chat Inteligente**
- **8 Módulos**: Professor, TI, Secretaria, Financeiro, RH, Atendimento, Coordenação, Social Media, Bem-Estar
- **Streaming em Tempo Real**: Respostas da IA transmitidas instantaneamente
- **Histórico Persistente**: Conversas salvas automaticamente

### 📚 **Simulador ENEM**
- **Questões Oficiais**: Banco de questões do ENEM
- **IA Generativa**: Criação automática de novas questões
- **Simulados Personalizáveis**: Escolha área, quantidade e duração
- **Timer Inteligente**: Controle de tempo com pausa/retomada

### 🏫 **Sistema Multi-tenant**
- **Suporte para Escolas**: Gestão completa de instituições
- **Usuários Hierárquicos**: Estudante, Professor, Admin
- **Analytics Detalhadas**: Métricas de uso e desempenho

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção

# Banco de Dados
npx prisma studio    # Interface visual do banco
npx prisma db push   # Aplicar mudanças no schema
npx prisma db seed   # Popular com dados iniciais
npx prisma generate  # Gerar cliente Prisma

# Deploy
vercel               # Deploy no Vercel
vercel env add       # Adicionar variáveis de ambiente
```

## 🗄️ Banco de Dados

### **Modelos Principais**
- **User**: Usuários do sistema
- **School**: Instituições educacionais
- **Conversation**: Histórico de conversas
- **SystemMessage**: Prompts específicos
- **EnemQuestion**: Banco de questões
- **EnemSession**: Sessões de simulados
- **Analytics**: Métricas de uso

### **Dados Iniciais**
O seed inclui:
- ✅ 8 system prompts específicos
- ✅ Questões de exemplo do ENEM
- ✅ Configurações padrão

## 🚀 Deploy Rápido

### **Vercel (Recomendado)**
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### **Outras Opções**
- Railway
- Netlify
- DigitalOcean App Platform

## 🔒 Segurança

- **Autenticação**: NextAuth.js com múltiplos provedores
- **Autorização**: Controle de acesso baseado em roles
- **Criptografia**: Senhas hasheadas com bcrypt
- **Rate Limiting**: Proteção contra spam
- **Validação**: Dados validados com Zod

## 📊 Analytics

O sistema coleta automaticamente:
- 📈 Número de mensagens por módulo
- ⏱️ Tempo de resposta da IA
- 😊 Satisfação dos usuários
- 🔢 Uso de tokens
- 📝 Questões respondidas
- ⏰ Tempo em simulados

## 🆘 Troubleshooting

### **Erro de Conexão com Banco**
```bash
# Verificar connection string
echo $DATABASE_URL

# Testar conexão
npx prisma db pull
```

### **Erro de Autenticação**
```bash
# Verificar NEXTAUTH_SECRET (mínimo 32 caracteres)
openssl rand -base64 32
```

### **Erro de OpenAI API**
```bash
# Verificar API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

## 📞 Suporte

- 📧 Email: suporte@hubedu.ai
- 💬 Discord: [Servidor da Comunidade]
- 🐛 Issues: [GitHub Issues]
- 📚 Docs: [Documentação Completa]

---

**🎉 HubEdu.ai está pronto para uso!**

Para dúvidas, consulte a documentação completa ou entre em contato com o suporte.

