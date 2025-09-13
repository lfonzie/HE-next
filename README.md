# 🚀 HubEdu.ai - Plataforma Educacional Completa

**HubEdu.ai** é uma plataforma educacional completa com IA conversacional, simulador ENEM e 8 módulos especializados, construída com Next.js 15.

## ✨ Funcionalidades Principais

### 💬 Sistema de Chat Inteligente
- **Streaming em tempo real** com Server-Sent Events
- **8 módulos especializados** com detecção automática
- **Upload de arquivos** e imagens
- **Histórico persistente** de conversas
- **Sistema de votação** em mensagens

### 📚 Simulador ENEM Completo
- **Simulados personalizáveis** por área
- **Timer inteligente** com pausa
- **Banco de questões** da API oficial ENEM
- **Explicações por IA** para cada questão
- **Relatórios de desempenho**

### 🎓 8 Módulos Especializados
1. **Professor**: Assistente de estudos
2. **TI**: Suporte técnico educacional
3. **Secretaria**: Gestão administrativa
4. **Financeiro**: Controle financeiro
5. **RH**: Recursos humanos
6. **Atendimento**: Suporte multicanal
7. **Coordenação**: Gestão pedagógica
8. **Social Media**: Comunicação digital
9. **Bem-Estar**: Suporte socioemocional

## 🛠️ Tecnologias

### Frontend
- **Next.js 15** com App Router
- **React 18** com TypeScript
- **Tailwind CSS** + Shadcn/ui
- **Framer Motion** para animações
- **React Hook Form** + Zod validation
- **TanStack Query** para estado servidor

### Backend
- **Next.js API Routes** (Serverless)
- **Prisma ORM** com PostgreSQL
- **NextAuth.js** para autenticação
- **OpenAI SDK** para IA
- **Socket.io** para tempo real

### Database
- **PostgreSQL** (Neon/PlanetScale)
- **Prisma** como ORM
- **Redis** para cache (Upstash)

## 🚀 Instalação e Configuração

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
```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hubedu"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Redis (optional)
REDIS_URL="redis://localhost:6379"
```

### 4. Configure o banco de dados
```bash
# Execute as migrações do Prisma
npx prisma db push

# Popule o banco com dados iniciais
npm run db:seed
```

### 5. Execute o projeto
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação.

## 📁 Estrutura do Projeto

```
hubedu-nextjs/
├── app/                          # App Router (Next.js 15)
│   ├── (auth)/                   # Route Groups
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/             # Dashboard Routes
│   │   ├── chat/page.tsx
│   │   ├── simulador/page.tsx
│   │   └── layout.tsx
│   ├── api/                      # API Routes
│   │   ├── chat/route.ts
│   │   ├── enem/route.ts
│   │   ├── auth/route.ts
│   │   └── webhook/route.ts
│   ├── globals.css
│   ├── layout.tsx                # Root Layout
│   └── page.tsx                  # Home Page
├── components/                   # Componentes Reutilizáveis
│   ├── ui/                       # Shadcn/ui Components
│   ├── chat/                     # Chat Components
│   ├── enem/                     # ENEM Components
│   ├── modules/                  # Module Components
│   └── layout/                   # Layout Components
├── lib/                          # Utilities & Config
│   ├── db.ts                     # Database Config
│   ├── auth.ts                   # Auth Config
│   ├── openai.ts                 # OpenAI Config
│   └── utils.ts                  # Utilities
├── hooks/                        # Custom Hooks
├── types/                        # TypeScript Types
├── prisma/                       # Database Schema
├── middleware.ts                 # Next.js Middleware
├── next.config.js               # Next.js Config
├── tailwind.config.js           # Tailwind Config
└── package.json
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm run start

# Linting
npm run lint

# Database
npm run db:push      # Aplicar mudanças no schema
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Popular banco com dados iniciais
```

## 🎯 Como Usar

### 1. Criar uma Conta
- Acesse `/register` para criar uma nova conta
- Ou use login com Google

### 2. Chat Inteligente
- Acesse `/chat` para conversar com a IA
- Escolha um dos 8 módulos especializados
- Digite sua pergunta e receba respostas em tempo real

### 3. Simulador ENEM
- Acesse `/simulador` para fazer simulados
- Configure área, número de questões e duração
- Responda as questões e veja seu desempenho

### 4. Módulos Especializados
- **Professor**: Dúvidas pedagógicas e metodologias
- **TI**: Suporte técnico e ferramentas educacionais
- **Secretaria**: Processos administrativos
- **Financeiro**: Gestão financeira educacional
- **RH**: Recursos humanos e desenvolvimento
- **Atendimento**: Estratégias de atendimento
- **Coordenação**: Gestão pedagógica
- **Social Media**: Comunicação digital
- **Bem-Estar**: Saúde mental e socioemocional

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras Plataformas
- **Railway**: Para PostgreSQL
- **Upstash**: Para Redis
- **Cloudinary**: Para upload de imagens

## 📊 Features Implementadas

### ✅ Core Features
- [x] Next.js 15 com App Router
- [x] Autenticação com NextAuth.js
- [x] Database com Prisma + PostgreSQL
- [x] Chat com streaming em tempo real
- [x] 8 módulos especializados
- [x] Simulador ENEM completo
- [x] Sistema de quotas
- [x] Analytics e métricas
- [x] Upload de arquivos
- [x] Responsive design
- [x] Dark/Light mode
- [x] PWA support

### ✅ Advanced Features
- [x] Socket.io para tempo real
- [x] Redis para cache
- [x] Rate limiting
- [x] Error boundaries
- [x] SEO otimizado
- [x] Performance monitoring
- [x] A/B testing ready
- [x] Multi-tenant support

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Email**: suporte@hubedu.ai
- **Documentação**: [docs.hubedu.ai](https://docs.hubedu.ai)
- **Issues**: [GitHub Issues](https://github.com/hubedu/issues)

---

**HubEdu.ai** - Transformando a educação com IA 🚀