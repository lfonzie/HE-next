# Admin Panel - HubEdu

Um painel administrativo completo para gerenciar o sistema HubEdu, incluindo escolas, usuários, conversas, modelos de IA e prompts do sistema.

## 🚀 Funcionalidades

### 📊 Dashboard
- Estatísticas gerais do sistema
- Gráficos de uso com Recharts
- Métricas de tokens e custos
- Visão geral de todas as entidades

### 🏫 Gestão de Escolas
- Lista de todas as escolas cadastradas
- Informações detalhadas por escola
- Métricas de uso (tokens, usuários, prompts)
- Status dos planos e localização

### 👥 Gestão de Usuários
- Lista completa de usuários
- Informações de perfil e roles
- Estatísticas de atividade
- Histórico de conversas por usuário

### 💬 Histórico de Conversas
- Todas as conversas do sistema
- Filtros por módulo e escola
- Métricas de avaliação (upvotes/downvotes)
- Informações de tokens e modelos utilizados

### 🤖 Modelos de IA
- Configuração de modelos disponíveis
- Estatísticas de uso por modelo
- Custos e performance
- Status de disponibilidade

### 📝 Prompts do Sistema
- Prompts globais do sistema
- Prompts personalizados por escola
- Configurações de temperatura e tokens
- Status ativo/inativo

### ⚙️ Informações do Sistema
- Estatísticas do banco de dados
- Feature flags
- Logs de erros recentes
- Status de jobs e serviços

## 🛠️ Instalação e Configuração

### 1. Dependências
As dependências necessárias já estão instaladas no projeto:
- `recharts` - Para gráficos
- `@prisma/client` - Para acesso ao banco de dados
- `openai` - Para integração com OpenAI

### 2. Variáveis de Ambiente
Adicione as seguintes variáveis ao seu arquivo `.env.local`:

```bash
# Admin Panel Configuration
ADMIN_TOKEN="your-secure-admin-token-here"
NEXT_PUBLIC_ADMIN_TOKEN="your-secure-admin-token-here"
```

### 3. Configuração do Banco de Dados
O painel utiliza o schema Prisma existente. Certifique-se de que o banco está configurado e migrado:

```bash
npm run db:push
```

### 4. Autenticação
O painel requer usuários com role `ADMIN` ou `SUPER_ADMIN`. Configure um usuário administrador:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

## 🔐 Segurança

### Autenticação de API
- Todas as rotas `/api/admin/*` requerem token de autorização
- Token configurado via variável `ADMIN_TOKEN`
- Middleware protege rotas administrativas

### Autenticação de UI
- Interface requer login com NextAuth.js
- Apenas usuários com role `ADMIN` ou `SUPER_ADMIN` podem acessar
- Middleware redireciona usuários não autorizados

## 📁 Estrutura de Arquivos

```
app/
├── admin/                    # Interface do painel administrativo
│   ├── layout.tsx           # Layout com navegação
│   ├── page.tsx             # Dashboard principal
│   ├── schools/page.tsx     # Gestão de escolas
│   ├── users/page.tsx       # Gestão de usuários
│   ├── conversations/page.tsx # Histórico de conversas
│   ├── models/page.tsx      # Modelos de IA
│   ├── prompts/page.tsx     # Prompts do sistema
│   └── system-info/page.tsx # Informações do sistema
├── api/admin/               # APIs do painel administrativo
│   ├── stats/route.ts       # Estatísticas gerais
│   ├── schools/route.ts     # Dados das escolas
│   ├── users/route.ts       # Dados dos usuários
│   ├── conversations/route.ts # Dados das conversas
│   ├── models/route.ts      # Dados dos modelos
│   ├── prompts/route.ts     # Dados dos prompts
│   └── system-info/route.ts # Informações do sistema
lib/
└── admin-utils.ts          # Utilitários para o painel
```

## 🧪 Testando o Painel

### 1. Teste das APIs
Execute o script de teste incluído:

```bash
node test-admin-panel.js
```

### 2. Teste da Interface
1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse o painel em: `http://localhost:3000/admin`

3. Faça login com um usuário administrador

## 📊 Métricas Disponíveis

### Dashboard
- Total de escolas, usuários, conversas
- Total de modelos e prompts
- Total de aulas e questões ENEM
- Tokens utilizados e custos estimados
- Tempo médio de resposta

### Por Escola
- Número de usuários
- Prompts ativos vs total
- Tokens utilizados
- Tempo médio de resposta

### Por Usuário
- Número de conversas
- Tokens utilizados
- Última atividade
- Escola associada

### Por Modelo
- Número de conversas
- Tokens utilizados
- Tempo médio de resposta
- Custos de input/output

## 🎨 Interface

### Design System
- **Tailwind CSS** para estilização
- **Recharts** para visualizações
- **Responsive design** para mobile e desktop
- **Dark mode** suportado

### Componentes
- Cards de estatísticas
- Tabelas responsivas
- Gráficos interativos
- Badges de status
- Loading states

## 🔧 Customização

### Adicionando Novas Métricas
1. Atualize `lib/admin-utils.ts` com nova função
2. Crie nova rota em `app/api/admin/`
3. Adicione componente na interface
4. Atualize o dashboard principal

### Modificando Queries
As queries Prisma podem ser customizadas em `lib/admin-utils.ts` para:
- Adicionar filtros
- Modificar ordenação
- Incluir relacionamentos adicionais
- Otimizar performance

## 🚀 Deploy

### Variáveis de Produção
Configure as seguintes variáveis no ambiente de produção:

```bash
ADMIN_TOKEN="secure-production-token"
NEXT_PUBLIC_ADMIN_TOKEN="secure-production-token"
DATABASE_URL="your-production-database-url"
```

### Segurança em Produção
- Use tokens seguros e únicos
- Configure HTTPS
- Monitore logs de acesso
- Implemente rate limiting se necessário

## 📝 Logs e Monitoramento

### Logs Disponíveis
- Erros do sistema em `/admin/system-info`
- Jobs executados
- Feature flags ativas
- Estatísticas do banco de dados

### Métricas de Performance
- Tempo de resposta das APIs
- Uso de tokens por modelo
- Custos estimados
- Atividade dos usuários

## 🤝 Contribuição

Para contribuir com o painel administrativo:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste com `node test-admin-panel.js`
5. Submeta um pull request

## 📞 Suporte

Para dúvidas ou problemas:
- Verifique os logs em `/admin/system-info`
- Execute o script de teste
- Consulte a documentação do Prisma
- Abra uma issue no repositório

---

**Desenvolvido para HubEdu** 🎓
