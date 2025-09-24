# HubEdu.ia - Módulo Suporte TI

Sistema inteligente de suporte técnico com chat guiado e automações para ambiente educacional.

## 🎯 Objetivo

Reduzir chamados de TI guiando o usuário por passos interativos que a IA personaliza em tempo real, com escalação automática quando necessário.

## 🏗️ Arquitetura

### Stack Tecnológica
- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Vercel AI SDK
- **Banco de Dados**: PostgreSQL (Neon), Prisma ORM
- **IA**: OpenAI GPT-4o-mini com streaming
- **Playbooks**: YAML/JSON com DSL customizado

### Componentes Principais

1. **Playbook DSL** (`app/ti/lib/playbook.ts`)
   - Parser YAML para playbooks estruturados
   - Classificação automática de problemas
   - Gerenciamento de fluxo de passos

2. **Session Manager** (`app/ti/lib/session-manager.ts`)
   - Gerenciamento de sessões TI
   - Execução de passos e ações
   - Escalação automática

3. **TI Tools** (`app/api/ti/tools.ts`)
   - Ferramentas de diagnóstico (ping, USB, tinta, etc.)
   - Integração com sistema operacional
   - Simulação para ambientes de teste

4. **API Routes**
   - `/api/ti/assist` - Chat principal com streaming
   - `/api/ti/ticket` - Criação e gerenciamento de tickets
   - `/api/ti/hint` - Dicas contextuais (legado)

5. **UI Components**
   - `GuidedChat` - Interface principal do chat
   - `TiSupportPage` - Página de demonstração

## 📋 Playbooks Disponíveis

### 1. Impressora (`printer.yaml`)
- Verificação de energia e conexão
- Diagnóstico USB vs Rede
- Teste de drivers e firmware
- Verificação de tinta e fila
- Escalação por prioridade

### 2. Wi-Fi (`wifi.yaml`)
- Verificação de sinal e distância
- Teste de senha e conectividade
- Diagnóstico de roteador
- Otimização de largura de banda
- Verificação de provedor

### 3. Software (`software.yaml`)
- Verificação de permissões
- Diagnóstico de dependências
- Teste de antivírus
- Atualizações e reinstalação
- Análise de requisitos

## 🚀 Como Usar

### 1. Acesso à Interface
```
http://localhost:3000/ti
```

### 2. Fluxo de Uso
1. **Descreva o problema** - Usuário informa o que está acontecendo
2. **Classificação automática** - IA identifica o tipo de problema
3. **Playbook carregado** - Sistema carrega o playbook apropriado
4. **Passos guiados** - Usuário executa ações sugeridas
5. **Resolução ou escalação** - Problema resolvido ou ticket criado

### 3. Exemplo de Uso
```typescript
// Inicializar sessão
const sessionManager = new TiSessionManager(sessionId, userId)
await sessionManager.initialize("Minha impressora não imprime", "HP 3635")

// Executar passo
const result = await sessionManager.executeStep('check_power', 'yes')
```

## 🛠️ Desenvolvimento

### Estrutura de Arquivos
```
app/ti/
├── lib/
│   ├── playbook.ts          # Parser e classificador
│   └── session-manager.ts   # Gerenciador de sessões
├── components/
│   └── GuidedChat.tsx       # Interface principal
├── playbooks/
│   ├── printer.yaml         # Playbook impressora
│   ├── wifi.yaml           # Playbook Wi-Fi
│   └── software.yaml       # Playbook software
└── page.tsx                # Página de demonstração

app/api/ti/
├── assist/route.ts          # Chat principal
├── ticket/route.ts         # Gerenciamento tickets
└── tools.ts                # Ferramentas diagnóstico
```

### Adicionando Novo Playbook

1. **Criar arquivo YAML** em `app/ti/playbooks/`
```yaml
issue: novo_problema
metadata:
  title: "Título do Problema"
  tags: ["tag1", "tag2"]
entry:
  say: "Mensagem inicial"
  checklist: [step1, step2]
steps:
  step1:
    title: "Primeiro Passo"
    ask: "Pergunta para o usuário?"
    on_yes: { next: step2 }
    on_no: { next: escalate }
```

2. **Atualizar classificador** em `playbook.ts`
```typescript
const keywords = {
  // ... existing
  novo_problema: ['palavra1', 'palavra2']
}
```

3. **Testar playbook**
```bash
npm run test:ti-support
```

### Adicionando Nova Ferramenta

1. **Definir ferramenta** em `app/api/ti/tools.ts`
```typescript
novaFerramenta: {
  description: 'Descrição da ferramenta',
  parameters: z.object({ param: z.string() }),
  execute: async ({ param }) => {
    // Implementação
    return { result: 'success' }
  }
}
```

2. **Usar no playbook**
```yaml
actions:
  - tool: novaFerramenta
    args: { param: "valor" }
```

## 🧪 Testes

### Teste Manual
```bash
# Executar testes
node test-ti-support.js

# Testar interface
npm run dev
# Acessar http://localhost:3000/ti
```

### Teste de API
```bash
# Testar chat
curl -X POST http://localhost:3000/api/ti/assist \
  -H "Content-Type: application/json" \
  -d '{"message": "Minha impressora não imprime"}'

# Testar ticket
curl -X POST http://localhost:3000/api/ti/ticket \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test", "summary": "Teste", "details": "Detalhes"}'
```

## 📊 Banco de Dados

### Modelos Prisma
```prisma
model TiSession {
  id           String   @id @default(cuid())
  userId       String
  status       String   @default("active")
  issueType    String?
  deviceLabel  String?
  steps        TiStep[]
  transcript   Json?
  resolution   String?
}

model TiStep {
  id         String   @id @default(cuid())
  sessionId  String
  key        String
  title      String
  status     String   @default("pending")
  notes      String?
  evidenceUrl String?
}

model TiTicket {
  id          String   @id @default(cuid())
  sessionId   String
  priority    String   @default("P3")
  summary     String
  details     String
  assignedTo  String?
  externalRef String?
}
```

### Migração
```bash
npx prisma db push
```

## 🔧 Configuração

### Variáveis de Ambiente
```env
# OpenAI (obrigatório)
OPENAI_API_KEY=sk-...

# Banco de dados (já configurado)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
```

### Dependências
```bash
npm install js-yaml @types/js-yaml
```

## 📈 Métricas e Monitoramento

### KPIs Sugeridos
- Taxa de resolução sem escalação
- Tempo médio de resolução
- Passos mais eficazes por playbook
- Tipos de problema mais comuns
- Satisfação do usuário

### Logs
- Todas as interações são logadas em `TiSession.transcript`
- Ferramentas executadas são registradas
- Escalações geram tickets automaticamente

## 🚀 Roadmap

### Próximas Funcionalidades
- [ ] Agente desktop (Electron) para ações locais
- [ ] Integração com sistemas de chamados externos
- [ ] Métricas avançadas e dashboards
- [ ] Internacionalização
- [ ] Glossário visual com fotos
- [ ] Playbooks para hardware específico
- [ ] Integração com Active Directory
- [ ] Notificações push para escalações

### Melhorias Técnicas
- [ ] Cache de playbooks
- [ ] Rate limiting nas APIs
- [ ] Validação de entrada mais robusta
- [ ] Testes automatizados completos
- [ ] Documentação de API
- [ ] Monitoramento de performance

## 🤝 Contribuição

1. Fork do repositório
2. Criar branch para feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit das mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para branch (`git push origin feature/nova-funcionalidade`)
5. Criar Pull Request

## 📄 Licença

Este projeto faz parte do HubEdu.ia e está sob a mesma licença do projeto principal.

---

**Desenvolvido para HubEdu.ia** - Plataforma Educacional Inteligente
