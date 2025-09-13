# 🎓 Professor Interactive Module

Este módulo foi completamente migrado e refatorado do projeto antigo HubEdu para o novo app Next.js HE-next.

## 📁 Estrutura de Arquivos

```
components/professor-interactive/
├── chat/
│   ├── ProfessorInteractiveContent.tsx          # Componente original
│   └── ProfessorInteractiveContent-fixed.tsx     # Versão corrigida
├── lesson/
│   ├── LessonHeader.tsx                         # Cabeçalho da aula
│   ├── LessonProgress.tsx                       # Barra de progresso
│   ├── LessonLoadingScreen.tsx                  # Tela de loading
│   ├── LessonStats.tsx                          # Estatísticas
│   ├── LessonNavigation.tsx                     # Navegação
│   └── RefactoredLessonModule.tsx              # Módulo principal refatorado
├── quiz/
│   ├── QuestionCard.tsx                         # Card de questão básico
│   └── EnhancedQuestionCard.tsx                 # Card melhorado com feedback
├── hooks/
│   ├── useLessonState.ts                        # Hook de estado da aula
│   ├── useLessonLoading.ts                      # Hook de loading
│   └── useLessonGeneration.ts                   # Hook de geração de aulas
├── services/
│   └── lessonGenerationService.ts              # Serviço de geração
└── README.md                                    # Esta documentação

utils/professor-interactive/
├── subjectDetection.ts                          # Detecção de matéria
├── buildSlides.ts                              # Construção de slides
├── buildSummary.ts                             # Geração de resumos
├── classifySubject.ts                          # Classificação de matéria
└── finalLineBySubject.ts                       # Mensagens finais por matéria
```

## 🚀 Como Usar

### 1. Importar o Componente Principal (Recomendado)

```tsx
import RefactoredLessonModule from '@/components/professor-interactive/lesson/RefactoredLessonModule';

function MyPage() {
  return (
    <RefactoredLessonModule 
      initialQuery="Como funciona a fotossíntese?"
    />
  );
}
```

### 2. Usar Componentes Individuais

```tsx
import LessonHeader from '@/components/professor-interactive/lesson/LessonHeader';
import QuestionCard from '@/components/professor-interactive/quiz/QuestionCard';

function CustomLesson() {
  return (
    <div>
      <LessonHeader 
        title="Minha Aula"
        subject="Matemática"
        totalSteps={5}
        currentStep={2}
        timeSpent={300}
        score={85}
        achievements={[]}
      />
      <QuestionCard
        question="Qual é a resposta?"
        options={["A", "B", "C", "D"]}
        correctOption={0}
        onAnswer={(selected, isCorrect) => console.log(selected, isCorrect)}
      />
    </div>
  );
}
```

### 2. Usar a Página de Demo

Acesse `/professor-interactive-demo` para testar o módulo completo.

### 3. Integrar com API

O módulo usa a API `/api/module-professor-interactive` para gerar aulas interativas.

## 🔧 Configuração

### Variáveis de Ambiente

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Dependências Necessárias

- React 18+
- Next.js 14+
- TypeScript 4.9+
- Tailwind CSS
- Lucide React (ícones)

## 📊 Funcionalidades

- ✅ **Geração de Aulas Interativas** - Cria aulas sequenciais com OpenAI
- ✅ **Sistema de Quiz** - Questões de múltipla escolha
- ✅ **Detecção de Assunto** - Classificação automática de disciplinas
- ✅ **Sistema de Confiança** - Threshold de 45% para exibir aulas
- ✅ **Layout Fullscreen** - Modo de tela cheia
- ✅ **Sistema de Estatísticas** - Métricas de performance
- ✅ **Print/PDF Support** - Suporte a impressão
- ✅ **Responsividade** - Adaptável para mobile

## 🎨 Estilos

Os estilos estão em `styles/professor-interactive/`:

- `module-professor-fullscreen.css` - Estilos para fullscreen
- `index.css` - Estilos principais do módulo

## 🧪 Testes

Arquivos de teste estão em `public/test-professor-interactive/`:

- `test-professor-interactive-auth.html` - Teste de autenticação
- Outros arquivos de teste específicos

## 📚 Documentação

Documentação completa está em `docs/professor-interactive/`:

- `PROFESSOR_INTERACTIVE_ENHANCEMENTS.md` - Melhorias implementadas
- `MODULE_PROFESSOR_REFACTORING_SUMMARY.md` - Resumo da refatoração

## 🔄 Migração do Projeto Antigo

Este módulo foi migrado do projeto HubEdu.ai_ com as seguintes adaptações:

1. **Estrutura de Diretórios** - Adaptada para Next.js 14
2. **Imports** - Atualizados para usar `@/` alias
3. **API Routes** - Convertidas para App Router
4. **Estilos** - Integrados com Tailwind CSS
5. **Componentes** - Otimizados para React 18

## 🚨 Notas Importantes

- O módulo requer autenticação JWT para funcionar
- A API OpenAI deve estar configurada corretamente
- Os estilos CSS devem ser importados no layout principal
- O sistema de confiança está configurado para 45% de threshold

## 🎯 Próximos Passos

1. **Testes** - Implementar testes unitários
2. **Otimização** - Melhorar performance
3. **Acessibilidade** - Adicionar suporte a screen readers
4. **Mobile** - Otimizar para dispositivos móveis
5. **Analytics** - Implementar métricas de uso

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação em `docs/professor-interactive/` ou abra uma issue no repositório.

