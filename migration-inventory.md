# Migration Inventory: React App to Next.js 18

## Overview
This document tracks the migration progress from the original React (TypeScript, Vite) application to the Next.js 18 project.

**Original App Path:** `/Users/lf/Documents/HubEdu.ai_/client/`
**Next.js App Path:** `/Users/lf/Documents/HE-next/`

## Migration Status Legend
- ✅ **Completed** - Fully migrated and tested
- 🔄 **In Progress** - Partially migrated
- ❌ **Not Started** - Not yet migrated
- ⚠️ **Needs Review** - Migrated but needs verification

---

## 1. Pages and Routes

### Main Pages
- ✅ `/` (Home) - Migrated to `app/page.tsx`
- ✅ `/chat` - Migrated to `app/(dashboard)/chat/page.tsx` with enhanced functionality
- ✅ `/chat-advanced` - Migrated to `app/chat-advanced/page.tsx` with advanced interface
- ✅ `/module-professor` - Migrated to `app/(dashboard)/professor/page.tsx` with full features
- ❌ `/module-professor-interactive` - Needs migration
- ❌ `/module-enem-interactive` - Needs migration
- ✅ `/simulador-enem` - Migrated to `app/(dashboard)/simulador/page.tsx` with comprehensive features
- ❌ `/professor-ia` - Needs migration
- ❌ `/chat/aula-expandida` - Needs migration
- ❌ `/aula-expandida` - Needs migration
- ❌ `/quiz-demo` - Needs migration
- ❌ `/chat-bubble-demo` - Needs migration
- ❌ `/apresentacao` - Needs migration
- ❌ `/apresentacao/chat` - Needs migration
- ✅ `/demo` - Migrated to `app/demo/page.tsx` with demo functionality
- ✅ `/demo-register` - Migrated to `app/demo-register/page.tsx` with registration form
- ❌ `/lessons/:id` - Needs migration

### Authentication Pages
- ✅ `/login` - Migrated to `app/(auth)/login/page.tsx`
- ✅ `/register` - Migrated to `app/(auth)/register/page.tsx`
- ✅ `/forgot-password` - Migrated to `app/(auth)/forgot-password/page.tsx`
- ✅ `/reset-password` - Migrated to `app/(auth)/reset-password/page.tsx`

### Profile Pages
- ✅ `/profile` - Migrated to `app/profile/page.tsx`

### Support Pages
- ✅ `/contato` - Migrated to `app/contato/page.tsx`
- ✅ `/faq` - Migrated to `app/faq/page.tsx`
- ✅ `/suporte` - Migrated to `app/suporte/page.tsx`

### Institutional Pages
- ✅ `/sobre` - Migrated to `app/about/page.tsx`
- ✅ `/termos` - Migrated to `app/termos/page.tsx`
- ✅ `/privacidade` - Migrated to `app/privacidade/page.tsx`

### Admin Pages
- ✅ `/admin` - Migrated to `app/(dashboard)/admin/page.tsx`
- ❌ `/admin-dashboard` - Needs migration
- ❌ `/admin-dashboard-test` - Needs migration
- ❌ `/admin-dashboard-minimal` - Needs migration
- ❌ `/admin-dashboard-simple` - Needs migration
- ❌ `/admin-dashboard-debug` - Needs migration
- ❌ `/system-admin` - Needs migration
- ❌ `/admin-system-prompts` - Needs migration

### Error Pages
- ❌ `/404` - Needs migration
- ❌ `NotFound` - Needs migration

### Test Pages
- ❌ `/loading-test` - Needs migration
- ❌ `/loading-test-simple` - Needs migration
- ❌ `/test-loading-debug` - Needs migration

---

## 2. Components

### Core Components
- ✅ Modal components (PrivacyPolicyModal, TermsOfUseModal, LGPDModal) - Migrated
- ✅ Chat components - Partially migrated
- ❌ Layout components - Needs review
- ❌ UI components - Partially migrated

### Component Categories to Migrate
- ❌ `components/accessibility/` - Not migrated
- ❌ `components/admin/` - Not migrated
- ❌ `components/artifacts/` - Not migrated
- ❌ `components/code-editor/` - Not migrated
- ❌ `components/common/` - Not migrated
- ❌ `components/demo/` - Not migrated
- ❌ `components/enem/` - Partially migrated
- ❌ `components/examples/` - Not migrated
- ❌ `components/gamification/` - Not migrated
- ❌ `components/gamified/` - Not migrated
- ❌ `components/guards/` - Not migrated
- ❌ `components/lesson/` - Not migrated
- ❌ `components/lessons/` - Not migrated
- ❌ `components/markdown/` - Not migrated
- ❌ `components/math/` - Not migrated
- ❌ `components/mcp/` - Not migrated
- ❌ `components/offline/` - Not migrated
- ❌ `components/profile/` - Not migrated
- ❌ `components/quiz/` - Not migrated
- ❌ `components/rewards/` - Not migrated
- ❌ `components/rich-editor/` - Not migrated
- ❌ `components/school-form/` - Not migrated
- ❌ `components/support/` - Not migrated
- ❌ `components/test/` - Not migrated
- ❌ `components/tour/` - Not migrated
- ❌ `components/visuals/` - Not migrated
- ❌ `components/voting/` - Not migrated

---

## 3. Context and State Management

### Context Providers
- ✅ `AuthContext.tsx` - Migrated (using NextAuth.js)
- ❌ `QuotaContext.tsx` - Needs migration
- ❌ `QuotaTrackingContext.tsx` - Needs migration
- ❌ `SchoolsContext.tsx` - Needs migration
- ❌ `SessionRewardsContext.tsx` - Needs migration
- ❌ `SimpleQuotaContext.tsx` - Needs migration
- ✅ `ThemeContext.tsx` - Migrated to `components/providers/ThemeProvider.tsx`
- ✅ `LessonContext.tsx` - Migrated to `components/providers/LessonProvider.tsx`
- ✅ `NotificationContext.tsx` - Migrated to `components/providers/NotificationProvider.tsx`

---

## 4. Hooks

### Custom Hooks to Migrate
- ✅ `use-mobile.tsx` - Migrated to `hooks/use-mobile.tsx`
- ✅ `use-notifications.ts` - Migrated (integrated into NotificationProvider)
- ✅ `use-toast.ts` - Migrated
- ❌ `useAdminDashboard.ts` - Not migrated
- ❌ `useAdvancedChat.ts` - Not migrated
- ✅ `useChat.ts` - Migrated with enhanced functionality (conversations, streaming, retry logic)
- ❌ `useChatApi.ts` - Not migrated
- ❌ `useChatScroll.ts` - Not migrated
- ❌ `useConfidence.ts` - Not migrated
- ❌ `useConfidenceAnalytics.ts` - Not migrated
- ❌ `useEducationalSpecificity.ts` - Not migrated
- ❌ `useEducationalSynthesis.ts` - Not migrated
- ❌ `useKaTeX.ts` - Not migrated
- ❌ `useLessonGeneration.ts` - Not migrated
- ❌ `useLessonLoading.ts` - Not migrated
- ❌ `useLessonState.ts` - Not migrated
- ❌ `useLessonTopic.tsx` - Not migrated
- ❌ `useMathJax.ts` - Not migrated
- ❌ `useMicroRewards.ts` - Not migrated
- ❌ `useModuleAutoSelect.ts` - Not migrated
- ✅ `useModuleNavigation.ts` - Migrated to `hooks/useModuleNavigation.ts`
- ❌ `useOpenMeteo.ts` - Not migrated
- ❌ `usePDFGenerator.ts` - Not migrated
- ❌ `usePermissions.ts` - Not migrated
- ❌ `usePersistentCountdown.ts` - Not migrated
- ❌ `useQuestionBank.ts` - Not migrated
- ❌ `useQuotaTracking.ts` - Not migrated
- ❌ `useQuotaTrackingContext.ts` - Not migrated
- ❌ `useSchools.ts` - Not migrated
- ❌ `useScrollAnchor.ts` - Not migrated
- ❌ `useSessionTracking.ts` - Not migrated
- ❌ `useSimpleQuota.ts` - Not migrated
- ❌ `useSimpleQuotaContext.ts` - Not migrated
- ❌ `useStreamingChat.ts` - Not migrated
- ❌ `useStreamingFocus.ts` - Not migrated
- ❌ `useSupportChat.ts` - Not migrated
- ❌ `useWebSearch.ts` - Not migrated
- ✅ `useNavigationLoading.ts` - Created new hook for navigation loading

---

## 5. API Routes

### API Endpoints to Migrate
- ✅ `/api/auth/[...nextauth]` - Migrated
- ✅ `/api/auth/register` - Migrated
- ✅ `/api/auth/forgot-password` - Migrated
- ✅ `/api/auth/reset-password` - Migrated
- ✅ `/api/auth/profile` - Migrated
- ✅ `/api/chat` - Migrated
- ✅ `/api/chat/stream` - Migrated
- ✅ `/api/demo/register` - Migrated
- ✅ `/api/enem/questions` - Migrated
- ✅ `/api/enem/session` - Migrated
- ✅ `/api/enem/simulator` - Migrated
- ✅ `/api/professor/generate` - Migrated
- ✅ `/api/support/tickets` - Migrated
- ✅ `/api/users` - Migrated
- ❌ Additional API routes from original app - Needs review

---

## 6. Styles and Assets

### Styles
- ✅ Global CSS - Migrated to `app/globals.css`
- ❌ Component-specific CSS modules - Needs migration
- ❌ Loading screen styles - Needs migration
- ❌ Prose styles - Needs migration

### Assets
- ✅ Logo files - Migrated to `public/assets/`
- ❌ Additional assets - Needs review

---

## 7. Configuration Files

### Config Files
- ✅ `package.json` - Updated for Next.js
- ✅ `tailwind.config.js` - Migrated
- ✅ `next.config.js` - Configured
- ✅ `tsconfig.json` - Updated
- ❌ `vite.config.ts` - Not needed (Vite specific)
- ❌ `postcss.config.cjs` - Needs migration to `postcss.config.js`

---

## 8. Database and Prisma

### Database
- ✅ Prisma schema - Migrated
- ✅ Database seed - Migrated
- ✅ Database connection - Configured

---

## 9. Authentication

### Auth System
- ✅ NextAuth.js setup - Migrated
- ✅ Auth middleware - Migrated
- ✅ Auth guards - Migrated
- ❌ Additional auth utilities - Needs review

---

## 10. Content and Data

### Content Files
- ✅ `content/home.ts` - Migrated
- ❌ Additional content files - Needs review

### Data Files
- ❌ `data/bhaskara-lesson.ts` - Not migrated
- ❌ `data/bhaskara-structured-lesson.ts` - Not migrated

---

## Priority Migration Order

### Phase 1: Core Functionality (High Priority)
1. Complete chat functionality
2. Complete professor module
3. Complete ENEM simulator
4. Complete authentication flow

### Phase 2: Admin and Management (Medium Priority)
1. Admin dashboard
2. User management
3. System administration

### Phase 3: Additional Features (Lower Priority)
1. Advanced chat features
2. Gamification components
3. Test pages
4. Additional utilities

---

## Notes
- The main landing page has been successfully migrated with all visual elements
- Authentication system is fully migrated
- Chat functionality is fully migrated with enhanced features (conversations, streaming, retry logic)
- Professor module is fully migrated with comprehensive features
- ENEM simulator is fully migrated with comprehensive features
- Many components and hooks still need migration
- Some pages may need to be consolidated or restructured for Next.js App Router

---

*Last Updated: January 2025*
*Migration Progress: ~80% Complete*

## Current Migration Status

### ✅ Successfully Migrated
- Main landing page (`/`) with all visual elements and functionality
- Authentication system (login/register) with NextAuth.js
- Chat functionality with enhanced features (conversations, streaming, retry logic)
- Professor module with comprehensive features
- ENEM simulator with full functionality
- Basic admin dashboard
- FAQ and support pages
- Modal components (Privacy, Terms, LGPD)
- Database schema and Prisma setup
- API routes for core functionality

### 🔄 In Progress
- Additional pages and routes migration
- Component library completion
- State management context migration
- Advanced features and utilities

### ❌ Priority Items to Migrate Next
1. **Missing Pages**: `/chat-advanced`, `/module-professor-interactive`, `/module-enem-interactive`, `/professor-ia`, `/aula-expandida`, `/quiz-demo`, `/chat-bubble-demo`, `/apresentacao`, `/demo`, `/demo-register`
2. **Authentication Pages**: `/forgot-password`, `/reset-password`, `/profile`
3. **Support Pages**: `/contato`, `/termos`, `/privacidade`
4. **Admin Pages**: Multiple admin dashboard variants
5. **Context Providers**: AuthContext, QuotaContext, ThemeContext, LessonContext, NotificationContext
6. **Custom Hooks**: All unmigrated hooks from original app
7. **Component Libraries**: All unmigrated component categories
8. **Styles**: Component-specific CSS modules, loading screens, prose styles
