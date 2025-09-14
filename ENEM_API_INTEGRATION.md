# Integração API ENEM.dev

## Resumo

Implementação completa da integração com a API enem.dev para fornecer questões reais do ENEM no simulador do HubEdu.

## Arquivos Criados/Modificados

### Novos Arquivos
- `lib/enem-api.ts` - Cliente da API enem.dev com fallback inteligente
- `app/api/enem/real-questions/route.ts` - Endpoint para questões reais
- `app/api/enem/exams/route.ts` - Endpoint para listar provas
- `components/ui/switch.tsx` - Componente Switch do Radix UI

### Arquivos Modificados
- `app/api/enem/questions/route.ts` - Integração com API real + fallback
- `hooks/useEnem.ts` - Novo método `loadRealQuestions`
- `components/enem/EnemSetup.tsx` - Interface para escolher tipo de questões
- `components/enem/EnemSimulator.tsx` - Suporte a questões reais
- `app/(dashboard)/simulador/page.tsx` - Configuração atualizada

## Funcionalidades Implementadas

### 1. Cliente API ENEM.dev (`lib/enem-api.ts`)
- ✅ Rate limiting (1 req/segundo)
- ✅ Verificação de disponibilidade da API
- ✅ Fallback automático quando API indisponível
- ✅ Tratamento robusto de erros
- ✅ Mapeamento de áreas do conhecimento
- ✅ Suporte a filtros (ano, área, tipo)

### 2. Novos Endpoints API
- ✅ `GET/POST /api/enem/real-questions` - Questões reais com filtros
- ✅ `GET /api/enem/exams` - Lista provas disponíveis
- ✅ Integração no endpoint existente `/api/enem/questions`

### 3. Interface do Usuário
- ✅ Toggle para escolher entre questões reais/IA
- ✅ Seleção de ano específico (2009-2023)
- ✅ Feedback visual sobre fonte das questões
- ✅ Indicador de fallback quando API indisponível

### 4. Sistema de Fallback
1. **Primeiro**: Tenta API enem.dev (questões reais)
2. **Segundo**: Busca questões do banco de dados local
3. **Terceiro**: Gera questões com IA
4. **Sempre**: Garante que o simulador funcione

## Estrutura de Dados

### EnemQuestion (API enem.dev)
```typescript
interface EnemQuestion {
  id: string
  examId: string
  year: number
  type: 'PPL' | 'REAPLICAÇÃO' | 'DIGITAL' | 'REGULAR'
  area: string
  subject: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  topics?: string[]
  competencies?: string[]
  difficulty?: 'Fácil' | 'Médio' | 'Difícil'
}
```

### Áreas Suportadas
- **Linguagens, Códigos e suas Tecnologias**
- **Matemática e suas Tecnologias**
- **Ciências da Natureza e suas Tecnologias**
- **Ciências Humanas e suas Tecnologias**

## Como Usar

### No Simulador
1. Acesse `/simulador`
2. Configure área, número de questões e duração
3. **Novo**: Escolha entre "Questões Reais" ou "Questões IA"
4. **Novo**: Se questões reais, opcionalmente selecione um ano específico
5. Inicie o simulado

### Programaticamente
```typescript
import { enemApi } from '@/lib/enem-api'

// Verificar disponibilidade
const isAvailable = await enemApi.checkApiAvailability()

// Buscar questões
const questions = await enemApi.getRandomQuestions('matematica', 20)

// Buscar por ano específico
const questions2022 = await enemApi.getQuestionsByYear(2022, 15)
```

## Tratamento de Erros

### Scenarios de Fallback
1. **API indisponível**: Usa questões do banco + IA
2. **Rate limit excedido**: Aguarda e tenta novamente
3. **Erro de rede**: Fallback para banco local
4. **Questões insuficientes**: Complementa com IA

### Logs e Monitoramento
- ✅ Console logs detalhados
- ✅ Indicadores visuais para o usuário
- ✅ Status da API em tempo real

## Limitações Conhecidas

1. **API enem.dev**: Atualmente indisponível (404)
   - Implementamos fallback completo
   - Sistema funciona normalmente com IA

2. **Rate Limiting**: 1 requisição por segundo
   - Implementado delay automático
   - Não afeta experiência do usuário

3. **Questões Limitadas**: Depende do catálogo da API
   - Fallback garante sempre ter questões
   - IA complementa quando necessário

## Próximos Passos

1. **Monitorar API enem.dev**: Verificar quando voltar online
2. **Cache Local**: Implementar cache de questões reais
3. **Banco de Dados**: Expandir questões locais
4. **Analytics**: Tracking de uso de questões reais vs IA

## Configuração

### Variáveis de Ambiente
Nenhuma configuração adicional necessária. A integração funciona out-of-the-box.

### Dependências
- `@radix-ui/react-switch` - Para componente Switch
- Fetch API nativo - Para requisições HTTP

## Status Final

✅ **Implementação Completa**
- Sistema robusto com múltiplos fallbacks
- Interface intuitiva para escolha de fonte
- Compatibilidade total com sistema existente
- Pronto para produção mesmo com API indisponível
