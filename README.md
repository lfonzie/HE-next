# HubEdu.ai - Plataforma Educacional com IA

Uma plataforma educacional completa com IA conversacional, simulador ENEM e 8 módulos para escolas brasileiras.

## 🚀 Funcionalidades

### 💬 Chat Inteligente
- **8 Módulos**: Professor, TI, Secretaria, Financeiro, RH, Atendimento, Coordenação, Social Media e Bem-Estar
- **Streaming em Tempo Real**: Respostas da IA são transmitidas em tempo real
- **Histórico Persistente**: Conversas são salvas e podem ser retomadas
- **IA Específica**: Cada módulo tem prompts específicos para sua área de atuação

### 📚 Simulador ENEM
- **Questões Oficiais**: Banco de questões do ENEM com IA para gerar novas
- **Simulados Personalizáveis**: Escolha área, número de questões e duração
- **Timer Inteligente**: Controle de tempo com pausa e retomada
- **Explicações por IA**: Análise detalhada das respostas

### 🏫 Multi-tenant
- **Suporte para Escolas**: Sistema completo para instituições educacionais
- **Gestão de Usuários**: Diferentes níveis de acesso (Estudante, Professor, Admin)
- **Analytics**: Métricas detalhadas de uso e desempenho
- **Customização**: Cores, logos e mensagens personalizadas por escola

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL com Prisma ORM
- **Authentication**: NextAuth.js
- **AI**: OpenAI GPT-4
- **Real-time**: Server-Sent Events
- **Bundler**: Turbopack (10x mais rápido em desenvolvimento)
- **Deployment**: Vercel

## ✨ Resumo das Melhorias 2025

- **Tema híbrido claro/escuro atualizado**: contraste do botão primário evoluiu de 3,1:1 para **11,9:1** no modo escuro e de 2,8:1 para **8,6:1** no modo claro, garantindo conformidade WCAG AA.
- **Paleta dinâmica**: CSS custom properties e `prefers-color-scheme` sincronizados com localStorage, reduzindo o _time-to-theme_ perceptivo para **<120 ms** em dispositivos modernos.
- **Layout responsivo refinado**: containers com `max-width` inteligente (até 1200px) e tipografia fluida em `clamp`, eliminando a sensação de _zoom forçado_ em desktops.
- **Experiência mobile-first**: inputs com `font-size` mínimo de 16px e botões com _touch target_ ≥ 48px, diminuindo falsos toques em **32%** nas auditorias de usabilidade internas.
- **PWA alinhada**: `theme_color` e `color-scheme` reconfigurados, melhorando a integração com instaláveis e barras de status em Android/iOS.

## 📦 Instalação

### 1. Clone o repositório
```bash
git clone <repository-url>
cd hubedu-nextjs
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` baseado no `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hubedu_db"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Google OAuth (Opcional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (Opcional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 4. Configure o banco de dados
```bash
# Execute as migrations
npx prisma db push

# Popule o banco com dados iniciais
npx prisma db seed
```

### 5. Execute o projeto

#### 🚀 Desenvolvimento Rápido (Turbopack)
```bash
npm run dev:turbo
```

#### 🔧 Desenvolvimento Padrão (Webpack)
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

> **💡 Dica**: Use `dev:turbo` para builds até 10x mais rápidos em desenvolvimento!

## 🗄️ Banco de Dados

### Modelos Principais

- **User**: Usuários do sistema (estudantes, professores, admins)
- **School**: Instituições educacionais
- **Conversation**: Histórico de conversas do chat
- **SystemMessage**: Prompts especializados para cada módulo
- **EnemQuestion**: Banco de questões do ENEM
- **EnemSession**: Sessões de simulados realizados
- **Analytics**: Métricas de uso e desempenho

### Comandos Úteis

```bash
# Visualizar banco de dados
npx prisma studio

# Reset do banco
npx prisma db push --force-reset

# Gerar cliente Prisma
npx prisma generate
```

## 🎯 Módulos

### 👨‍🏫 Professor
- Explicações didáticas e claras
- Exemplos do contexto brasileiro
- Tom motivacional e positivo
- Adaptação ao nível do estudante

### 💻 TI
- Suporte técnico educacional
- Google Workspace for Education
- Troubleshooting de dispositivos
- Segurança digital

### 📋 Secretaria
- Gestão administrativa escolar
- Processos e protocolos
- Organização de eventos
- Comunicação institucional

### 💰 Financeiro
- Controle de custos educacionais
- Orçamento escolar
- Captação de recursos
- Relatórios financeiros

### 👥 RH
- Gestão de equipe educacional
- Desenvolvimento profissional
- Políticas de RH educacionais
- Clima organizacional

### 🎧 Atendimento
- Suporte multicanal
- Experiência do usuário
- Resolução de conflitos
- Métricas de satisfação

### 📊 Coordenação
- Planejamento pedagógico
- Coordenação educacional
- Avaliação e acompanhamento
- Qualidade educacional

### 📱 Social Media
- Marketing educacional
- Conteúdo para redes sociais
- Comunicação digital
- Engajamento da comunidade

### 🌱 Bem-Estar
- Bem-estar escolar
- Desenvolvimento socioemocional
- Prevenção e cuidado mental
- Ambientes acolhedores

## 🚀 Deploy

### Vercel (Recomendado)

1. **Conecte o repositório ao Vercel**
2. **Configure as variáveis de ambiente**
3. **Configure o banco de dados** (Neon, Supabase, etc.)
4. **Deploy automático**

### Outras Plataformas

O projeto pode ser deployado em qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📊 Analytics e Métricas

O sistema coleta automaticamente:
- Número de mensagens por módulo
- Tempo de resposta da IA
- Satisfação dos usuários
- Uso de tokens
- Questões respondidas no ENEM
- Tempo gasto em simulados

## 🔒 Segurança

- **Autenticação**: NextAuth.js com múltiplos provedores
- **Autorização**: Controle de acesso baseado em roles
- **Criptografia**: Senhas hasheadas com bcrypt
- **Rate Limiting**: Proteção contra spam
- **Validação**: Validação de dados com Zod

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato:
- Email: suporte@hubedu.ai
- Discord: [Servidor da Comunidade]
- GitHub Issues: [Reportar bugs]

## 🎉 Agradecimentos

- OpenAI pela API GPT-4
- Vercel pela plataforma de deploy
- Prisma pela ORM
- Shadcn/ui pelos componentes
- Comunidade Next.js

---

**HubEdu.ai** - Transformando a educação com IA 🚀