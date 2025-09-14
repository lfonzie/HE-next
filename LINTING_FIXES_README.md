# Scripts de Correção de Linting

Este conjunto de scripts foi criado para corrigir sistematicamente todos os problemas de linting identificados no projeto.

## 📋 Problemas Corrigidos

### 1. React Hooks Dependencies
- **Problema**: Funções que fazem as dependências de `useEffect` mudarem a cada render
- **Solução**: Envolver funções em `useCallback()` com dependências apropriadas
- **Arquivos afetados**: 
  - `admin-system-prompts/page.tsx` (loadPrompts)
  - `EnemPerformanceAnalysis.tsx` (analyzePerformance)
  - `EnemResults.tsx` (loadExplanations)
  - `EnhancedLessonModule.tsx` (handleSubmit)

### 2. Otimização de Arrays em useEffect
- **Problema**: Arrays que fazem dependências de `useEffect` mudarem a cada render
- **Solução**: Envolver arrays em `useMemo()` com dependências vazias
- **Arquivos afetados**: Todos os arquivos de apresentação (`apresentacao/*.tsx`)

### 3. Substituição de Tags `<img>` por `<Image>`
- **Problema**: Uso de `<img>` em vez de `<Image>` do Next.js
- **Solução**: Substituir todas as tags `<img>` por `<Image>` com imports apropriados
- **Arquivos afetados**: Todos os arquivos com imagens

### 4. Dependências Desnecessárias
- **Problema**: Dependências como `slides.length` e `slides` em hooks
- **Solução**: Remover dependências desnecessárias dos arrays de dependências

## 🚀 Como Usar

### Opção 1: Correção Completa (Recomendada)
```bash
./fix-all-linting.sh
```

### Opção 2: Correções Individuais

#### Corrigir apenas React Hooks:
```bash
node fix-hooks-only.js
```

#### Corrigir apenas imagens:
```bash
node fix-images-only.js
```

#### Corrigir tudo (hooks + imagens):
```bash
node fix-linting-issues.js
```

## 📁 Scripts Disponíveis

| Script | Descrição | Problemas Corrigidos |
|--------|-----------|---------------------|
| `fix-all-linting.sh` | Script principal | Todos os problemas |
| `fix-linting-issues.js` | Correção completa | Hooks + Imagens |
| `fix-hooks-only.js` | Apenas hooks | React Hooks |
| `fix-images-only.js` | Apenas imagens | Tags `<img>` |

## 🔍 Verificação

Após executar os scripts, verifique se os problemas foram corrigidos:

```bash
npm run lint
```

## 📊 Estatísticas dos Problemas Originais

- **Total de arquivos com problemas**: 16
- **Problemas de React Hooks**: 8
- **Problemas de imagens**: 25+
- **Problemas de dependências**: 4

## ⚠️ Importante

1. **Backup**: Os scripts modificam arquivos diretamente. Faça backup antes de executar
2. **Revisão**: Sempre revise as alterações antes de fazer commit
3. **Testes**: Execute testes após as correções para garantir que tudo funciona
4. **Dependências**: Os scripts adicionam imports necessários automaticamente

## 🛠️ Detalhes Técnicos

### Correções de Hooks
- `loadPrompts` → `useCallback(loadPrompts, [filters])`
- `analyzePerformance` → `useCallback(analyzePerformance, [questions, answers, timeSpent])`
- `loadExplanations` → `useCallback(loadExplanations, [])`
- `handleSubmit` → `useCallback(handleSubmit, [lesson])`
- `slides` → `useMemo(() => slides, [])`

### Correções de Imagens
- `<img src={...} alt={...} />` → `<Image src={...} alt={...} width={500} height={300} />`
- Adiciona `import Image from 'next/image'` automaticamente
- Preserva todos os atributos originais (className, style, loading, etc.)

### Imports Adicionados
- `useCallback` do React
- `useMemo` do React  
- `Image` do Next.js

## 🎯 Resultado Esperado

Após executar os scripts, você deve ver:
- ✅ Zero warnings de React Hooks
- ✅ Zero warnings de `<img>` tags
- ✅ Zero warnings de dependências desnecessárias
- ✅ Imports corretos adicionados automaticamente
