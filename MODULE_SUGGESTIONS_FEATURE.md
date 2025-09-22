# Funcionalidade de Sugestões de Módulos

## Descrição
Implementação de sugestões randomizadas para cada módulo do chat. Quando o usuário clica em um módulo, são exibidas 3 sugestões aleatórias relacionadas àquele módulo específico.

## Arquivos Criados/Modificados

### 1. `/lib/module-suggestions.ts`
- **Função**: Contém todas as sugestões organizadas por módulo
- **Estrutura**: Cada módulo tem 6 sugestões diferentes
- **Funções principais**:
  - `getRandomSuggestions(moduleId, count)`: Retorna sugestões aleatórias
  - `getAllSuggestions(moduleId)`: Retorna todas as sugestões de um módulo

### 2. `/components/chat/ModuleSuggestions.tsx`
- **Função**: Componente dropdown horizontal compacto para exibir as sugestões
- **Características**:
  - Dropdown horizontal posicionado abaixo dos módulos
  - Cards clicáveis dispostos em linha horizontal
  - Scroll horizontal para sugestões longas
  - Badges de categoria para organização
  - Ícones e cores temáticas
  - Fechamento automático ao clicar fora

### 3. `/app/(dashboard)/chat/ChatComponent.tsx`
- **Modificações**:
  - Adicionado estado para controlar o modal de sugestões
  - Novo handler `handleModuleClick` para mostrar sugestões
  - Handler `handleSuggestionClick` para enviar sugestão como mensagem
  - Integração do componente `ModuleSuggestions`

## Como Funciona

1. **Clique no módulo**: Usuário clica em um dos botões de módulo na tela inicial do chat
2. **Geração de sugestões**: Sistema seleciona 3 sugestões aleatórias da lista de 6 disponíveis para aquele módulo
3. **Exibição do dropdown**: Dropdown horizontal compacto aparece logo abaixo dos módulos com as 3 sugestões em linha
4. **Seleção de sugestão**: Usuário clica em uma sugestão
5. **Envio automático**: A sugestão é enviada automaticamente como mensagem no chat
6. **Fechamento automático**: O dropdown fecha automaticamente ao clicar fora dele

## Módulos Disponíveis

- **Professor**: Sugestões sobre estudos, exercícios e aprendizado para alunos
- **Aula Expandida**: Sugestões sobre aulas interativas e gamificadas
- **ENEM Interativo**: Sugestões sobre simulados e questões
- **TI**: Sugestões sobre suporte técnico e configurações
- **RH**: Sugestões sobre gestão de pessoas
- **Financeiro**: Sugestões sobre controle financeiro
- **Coordenação**: Sugestões sobre gestão pedagógica
- **Atendimento**: Sugestões sobre suporte ao cliente
- **Bem-Estar**: Sugestões sobre saúde mental e bem-estar
- **Social Media**: Sugestões sobre marketing digital

## Características Técnicas

- **Randomização**: Sugestões são embaralhadas a cada clique
- **Responsividade**: Modal se adapta a diferentes tamanhos de tela
- **Acessibilidade**: Suporte a navegação por teclado
- **Performance**: Componentes otimizados com React.memo e useCallback
- **UX**: Animações suaves e feedback visual

## Exemplo de Uso

```typescript
// Obter sugestões aleatórias para o módulo Professor
const suggestions = getRandomSuggestions('PROFESSOR', 3);

// Exemplo de resultado:
[
  {
    id: 'prof-2',
    text: 'Sugira atividades práticas para ensinar frações',
    category: 'Atividades',
    icon: '🧮'
  },
  {
    id: 'prof-4',
    text: 'Estratégias para manter a atenção dos alunos',
    category: 'Gestão',
    icon: '👥'
  },
  {
    id: 'prof-5',
    text: 'Como usar tecnologia na sala de aula?',
    category: 'Tecnologia',
    icon: '💻'
  }
]
```
