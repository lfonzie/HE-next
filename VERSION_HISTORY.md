# Histórico de Versões - HubEdu.ai

## Versão 0.0.1 - Pré-Produção (Next.js)
**Tag:** v0.0.1
**Nota:** Versão de pré-produção migrada do desenvolvimento anterior em React Vite (600+ commits em 3 semanas)

### Commits da Versão 0.0.1:
- `7ea56af` - Initial commit: HubEdu.ai - Educational AI platform with Next.js, Prisma, and OpenAI integration
- `aebc414` - Update README and add Prisma seed file
- `2f2de31` - Update project with latest changes and new features

---

## Versão 0.0.2 - Configuração Inicial Pré-Produção
**Commits:** 4-6

### Commits:
- `c8f4fc4` - Remove ThemeToggle references and update Navigation component
- `ab902b2` - Fix JSON syntax error in package.json
- `71549ac` - Configure dev script to run both HubEdu and ENEM API servers concurrently

---

## Versão 0.0.3 - Preparação para Deploy Pré-Produção
**Commits:** 7-9

### Commits:
- `39691ae` - Fix dev script: remove reference to non-existent enem-api-main directory
- `3e7fb9a` - Add enem-api-main directory and restore concurrent dev script
- `562a392` - feat: configure Render build and start commands for HubEdu + ENEM API integration

---

## Versão 0.0.4 - Correções de Build e Deploy
**Commits:** 10-15

### Commits:
- `cb21441` - fix: update build scripts to use npm install instead of npm ci to resolve lock file sync issues
- `68c4342` - fix: remove directUrl from Prisma schema to resolve DATABASE_URL_UNPOOLED error
- `52ca840` - fix: use prisma db push instead of migrate deploy for existing database
- `2824d10` - fix: resolve TypeScript errors and update ENEM API build script
- `2763b9a` - fix: add --accept-data-loss flag to prisma db push commands
- `8473315` - fix: resolve Prisma schema conflicts by using separate tables for ENEM API

---

## Versão 0.0.5 - Resolução de Conflitos de Build
**Commits:** 16-21

### Commits:
- `f18c2a4` - fix: add missing prisma generate command in render-build.sh
- `43ee64e` - fix: exclude enem-api-main from main tsconfig to prevent build conflicts
- `e3c8fa6` - fix: resolve TypeScript and build errors for deployment
- `9026ca7` - fix: resolve all deployment issues for Render
- `260242b` - fix: resolve routes-manifest.json ENOENT error and improve development experience
- `3bbaffc` - Fix TypeScript error for conv.title in useChat.ts and optimize Next.js config

---

## Versão 0.0.6 - Configuração de Deploy Render
**Commits:** 22-27

### Commits:
- `508d25c` - Fix ENEM API deployment: separate services with improved logging
- `4aceac7` - Update render.yaml to match existing service name
- `8f3bfd6` - Update render.yaml to use shared database for both services
- `a2b4a9e` - Fix Professor Interactive slide navigation - allow progression beyond slide 1
- `0ab7d32` - Fix deployment issues: resolve Prisma version mismatch and module resolution errors
- `52d57cc` - Fix TypeScript build error: Update @types/node to v22.7.5 for Node.js 22.16.0 compatibility

---

## Versão 0.0.7 - Correções de Porta e Configuração
**Commits:** 28-33

### Commits:
- `4469dc0` - Fix port conflict: Set ENEM API to use port 11000 in render-start.sh
- `8f5759b` - Fix Render deployment issues: .next directory, lockfiles, and port configuration
- `d773b1a` - Fix npm ci error by syncing package-lock.json and ensure ENEM API uses port 11000
- `2904559` - Add deployment fix summary documentation
- `9d18bf8` - Add intelligent module router with catalog, API route, and frontend hook
- `17576c3` - Remove test-router.js file (not needed for production)

---

## Versão 0.0.8 - Sistema de Health Checks
**Commits:** 34-39

### Commits:
- `8fb4fbb` - Add render.yaml and health checks for HubEdu and ENEM API
- `68a5974` - Remove ENEM API local and integrate enem.dev public API with gpt-4o-mini fallback
- `47966be` - Fix ENEM API integration: improve filtering and fallback handling
- `6831244` - feat: Implement comprehensive health check system for Render deployment
- `f3719c3` - fix: Resolve professor interactive slide navigation and image optimization issues
- `d753aa2` - Update render-start.sh script

---

## Versão 0.0.9 - Sistema de Aulas Interativas
**Commits:** 40-45

### Commits:
- `6cb508b` - Fix React object rendering error in RefactoredLessonModule
- `237aa8c` - feat: Implement HubEdu Interactive Lesson Pipeline System
- `094895d` - Fix ESLint and TypeScript errors for successful build
- `a845576` - 🔧 Fix health check endpoint and Unsplash API for deployment
- `57914ee` - Fix Render health check deployment issue
- `9bf9a9a` - 🚀 Implement ENEM Simulator Architecture with Progressive Loading

---

## Versão 0.0.10 - Simplificação e Documentação
**Commits:** 46-51

### Commits:
- `5bfe4d5` - 🔧 Simplify Health Checks - App Only
- `b21e510` - 📋 Add comprehensive deployment check-up report
- `e437850` - Add health check endpoint for Render deployment
- `b39675d` - Add ENEM API health check endpoint
- `c144a5c` - Synchronize package-lock.json with package.json
- `c3f0e05` - Fix Render deployment: Resolve peer dependency conflicts

---

## Versão 0.0.11 - Framework de Testes e Melhorias ENEM
**Commits:** 52-57

### Commits:
- `08cbd74` - feat: Implement comprehensive testing framework
- `8be255e` - docs: Add sanitized environment configuration files
- `a36f900` - feat: Complete ENEM simulator improvements and route migration
- `f036ef1` - fix: Update @types/jspdf to valid version 2.0.0
- `4aaad89` - fix: Corrigir componentes de chat e resolver problema de renderização
- `875e506` - feat: Atualizar configuração para deploy no Render

---

## Versão 0.0.12 - Correções de Build e Melhorias de UI
**Commits:** 58-63

### Commits:
- `54f9238` - fix: Corrigir erros de build para deploy no Render
- `0814b9d` - feat: improve homepage with enhanced animations and fix hydration issues
- `2b09cc1` - fix: Corrigir formatação markdown em todos os componentes Answer
- `5fc335f` - feat: Major improvements to chat system, ENEM simulator, and lesson modules
- `daf9137` - feat: Implement Google Gemini with memory support
- `47fe4a4` - feat: implement tier-based AI model chip system

---

## Versão 0.0.13 - Melhorias de Chat e Autenticação
**Commits:** 64-69

### Commits:
- `aa01d4e` - Update chat, ENEM simulator, and lesson components with improvements
- `fc5648b` - fix: resolve authentication and database connection issues
- `bb7c819` - feat: implement Unicode support for messages
- `8513cff` - fix: Corrigir problema do botão 'Iniciar Aula' após gerar aula
- `c187ad0` - fix: Corrigir validação dupla que mostrava aviso mesmo com descrição
- `36bd87e` - fix: Corrigir geração e início de aulas - usar API real

---

## Versão 0.0.14 - Debug e Correções de Aulas
**Commits:** 70-75

### Commits:
- `5f5114e` - debug: Adicionar logs para investigar problema de carregamento de aulas
- `9056662` - fix: Corrigir parsing de JSON na API generate-lesson
- `b4cc5a4` - Fix aulas navigation, ENEM console loop, and progressive lesson improvements
- `62a7b2f` - feat: implementar sistema de chips para identificar modelo usado nas mensagens
- `41433a2` - fix: remover descrição desnecessária dos chips de modelo
- `1239d2b` - fix: integrar classificação de complexidade via API de IA

---

## Versão 0.0.15 - Configuração Final de Modelos IA
**Commits:** 76-81

### Commits:
- `e5d7b17` - feat: configurar roteamento final com Gemini/GPT-4o-mini/GPT-5
- `f198874` - feat: implementar melhorias de UX e correções de bugs
- `445311f` - feat: replace gpt-5 with gpt-5-chat-latest across all configurations
- `e1d0d64` - feat: Padronizar modelos de IA para usar apenas GPT-4o-mini, GPT-5-chat-latest e Gemini 2.0 Flash Exp
- `445975d` - feat: tornar sugestões de tópicos mais curtas e diretas
- `535d89c` - fix: corrigir problemas de qualidade do conteúdo e queries de imagem

---

## Versão 0.0.16 - Correções de Sistema e Loading
**Commits:** 82-87

### Commits:
- `fd4daba` - fix: corrigir chave da OpenAI e melhorar sistema de loading
- `de16920` - fix: corrigir erro de chaves duplicadas no React
- `1ef7a21` - feat: Implementação completa do sistema educacional aprimorado
- `b6c217f` - feat: análise do módulo de aulas interativas para implementação de melhorias baseadas na metodologia Curipod
- `7195a8d` - feat: implementação completa da metodologia Curipod aprimorada
- `6f186aa` - feat: distribuição de conteúdo em mais slides para melhor digestão

---

## Versão 0.0.17 - Sistema de Aulas Aprimorado
**Commits:** 88-93

### Commits:
- `0437dfe` - fix: resolve module resolution and context provider issues
- `6502937` - Fix database configuration and environment variables
- `c0702b8` - feat: implementar melhorias completas no sistema de aulas
- `292f962` - feat: Implementar Sistema de Aulas Aprimorado com todas as funcionalidades solicitadas
- `e5004ef` - Refine toast context and tighten NextAuth logging
- `610fb75` - Harden render deployment configuration and fix case-sensitive imports

---

## Versão 0.0.18 - Code Review e Correções de Sessão
**Commits:** 94-99

### Commits:
- `955658c` - Merge pull request #1 from lfonzie/codex/conduct-comprehensive-next.js-code-review
- `5612b75` - fix: resolve login session persistence issues
- `b14139b` - fix: corrigir erro 'options.map is not a function' no ImprovedQuizComponent
- `0ca0a69` - fix: melhorar queries de imagem e layout dos slides
- `591e28c` - feat: Implement Freepik Stock Content API integration
- `01371f0` - fix: corrigir layout de aulas e implementar navegação por teclado

---

## Versão 0.0.19 - Correções Finais de Deploy
**Commits:** 100-105

### Commits:
- `cf92999` - Fix build configuration for Render deployment
- `1f17a27` - Merge remote changes and resolve conflicts
- `8bec4bc` - Final build fixes for Render deployment
- `4dda84a` - Fix missing dependencies for Render deployment
- `8bcf8b0` - feat: Implementar funcionalidades de upload e OCR para redação ENEM
- `2442f2d` - fix: resolve build prerendering issues for API routes

---

## Versão 0.0.20 - Melhorias Finais de UI e Funcionalidades
**Commits:** 106-108

### Commits:
- `1bf4d00` - feat: aplicar padrão de cores da home em todas as páginas principais
- `16eab5d` - feat: add token usage logging per conversation and module
- `2d7f688` - fix: implementar correções cirúrgicas na classificação de módulos

---

## Resumo das Versões

- **v0.0.1**: Release inicial (3 commits)
- **v0.0.2**: Configuração inicial (3 commits)
- **v0.0.3**: Preparação para deploy (3 commits)
- **v0.0.4**: Correções de build (6 commits)
- **v0.0.5**: Resolução de conflitos (6 commits)
- **v0.0.6**: Configuração Render (6 commits)
- **v0.0.7**: Correções de porta (6 commits)
- **v0.0.8**: Health checks (6 commits)
- **v0.0.9**: Sistema de aulas (6 commits)
- **v0.0.10**: Simplificação (6 commits)
- **v0.0.11**: Framework de testes (6 commits)
- **v0.0.12**: Melhorias de UI (6 commits)
- **v0.0.13**: Melhorias de chat (6 commits)
- **v0.0.14**: Debug e aulas (6 commits)
- **v0.0.15**: Configuração IA (6 commits)
- **v0.0.16**: Correções de sistema (6 commits)
- **v0.0.17**: Sistema aprimorado (6 commits)
- **v0.0.18**: Code review (6 commits)
- **v0.0.19**: Correções finais (6 commits)
- **v0.0.20**: Melhorias finais (3 commits)

**Total:** 108 commits organizados em 20 versões patch (0.0.1 a 0.0.20)

### Próxima Versão Recomendada
Considerando que estamos em pré-produção e todo o desenvolvimento realizado, seria apropriado criar:

- **v0.1.0** - Primeira versão beta/RC (Release Candidate) para testes finais
- **v1.0.0** - Primeira versão de produção estável

### Contexto do Desenvolvimento
- **Fase 1**: Desenvolvimento inicial em React Vite (600+ commits em 3 semanas)
- **Fase 2**: Migração para Next.js e pré-produção (108 commits atuais - v0.0.1 a v0.0.20)
- **Fase 3**: Produção (próximas versões)
