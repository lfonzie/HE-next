# Sidebar System - HubEdu.ai

Este sistema de sidebar foi criado para substituir o sidebar antigo do HubEdu TSX, oferecendo uma solução unificada com estados colapsado/expandido e responsividade completa.

## Componentes Disponíveis

### 1. SidebarProvider
Context provider que gerencia o estado global do sidebar.

```tsx
import { SidebarProvider } from '@/components/ui/sidebar'

<SidebarProvider defaultCollapsed={false}>
  {/* Seu conteúdo */}
</SidebarProvider>
```

### 2. Sidebar (Root)
Componente raiz do sidebar com responsividade automática.

```tsx
import { Sidebar } from '@/components/ui/sidebar'

<Sidebar className="custom-class">
  {/* Conteúdo do sidebar */}
</Sidebar>
```

### 3. SidebarHeader
Cabeçalho do sidebar com botão de colapsar.

```tsx
import { SidebarHeader } from '@/components/ui/sidebar'

<SidebarHeader>
  <h1>Título do Sidebar</h1>
</SidebarHeader>
```

### 4. SidebarContent
Área de conteúdo principal do sidebar.

```tsx
import { SidebarContent } from '@/components/ui/sidebar'

<SidebarContent>
  {/* Navegação e conteúdo */}
</SidebarContent>
```

### 5. SidebarFooter
Rodapé do sidebar.

```tsx
import { SidebarFooter } from '@/components/ui/sidebar'

<SidebarFooter>
  {/* Botões e informações do usuário */}
</SidebarFooter>
```

### 6. SidebarItem
Item individual de navegação.

```tsx
import { SidebarItem } from '@/components/ui/sidebar'

<SidebarItem 
  onClick={() => router.push('/chat')}
  active={pathname === '/chat'}
>
  <MessageSquare className="w-4 h-4 mr-3" />
  Chat
</SidebarItem>
```

### 7. SidebarGroup
Agrupamento de itens com título opcional.

```tsx
import { SidebarGroup } from '@/components/ui/sidebar'

<SidebarGroup title="Principal">
  {/* SidebarItems */}
</SidebarGroup>
```

### 8. SidebarSeparator
Separador visual entre seções.

```tsx
import { SidebarSeparator } from '@/components/ui/sidebar'

<SidebarSeparator />
```

### 9. SidebarTrigger
Botão para abrir sidebar em mobile.

```tsx
import { SidebarTrigger } from '@/components/ui/sidebar'

<SidebarTrigger />
```

## Componentes Especializados

### MainSidebar
Sidebar principal com navegação completa do sistema.

```tsx
import { MainSidebar } from '@/components/layout/MainSidebar'

<MainSidebar />
```

### ChatSidebar
Sidebar especializada para a página de chat.

```tsx
import { ChatSidebar } from '@/components/layout/ChatSidebar'

<ChatSidebar
  selectedModule={selectedModule}
  onSelectModule={handleSelectModule}
  onNewConversation={handleNewConversation}
  onClearHistory={handleClearHistory}
/>
```

## Hook useSidebar

Hook para acessar o estado do sidebar.

```tsx
import { useSidebar } from '@/components/ui/sidebar'

const MyComponent = () => {
  const { isCollapsed, toggleCollapsed, isMobileOpen, toggleMobileOpen } = useSidebar()
  
  return (
    <div>
      <p>Sidebar está colapsado: {isCollapsed ? 'Sim' : 'Não'}</p>
      <button onClick={toggleCollapsed}>Alternar</button>
    </div>
  )
}
```

## Estados do Sidebar

### Desktop
- **Expandido**: Largura de 256px (w-64)
- **Colapsado**: Largura de 64px (w-16)
- **Transição**: Animação suave de 300ms

### Mobile
- **Fechado**: Escondido fora da tela
- **Aberto**: Overlay com sidebar deslizante
- **Overlay**: Fundo escuro semi-transparente

## Funcionalidades

### ✅ Implementadas
- [x] Estado colapsado/expandido
- [x] Responsividade mobile/desktop
- [x] Context API para gerenciamento de estado
- [x] Animações suaves
- [x] Overlay mobile
- [x] Navegação hierárquica
- [x] Badges e indicadores
- [x] Perfil do usuário
- [x] Botão de logout
- [x] Navegação condicional (admin)
- [x] Componentes especializados

### 🎨 Customização
- Classes CSS personalizáveis
- Tema integrado com shadcn/ui
- Cores e espaçamentos consistentes
- Ícones Lucide React

## Exemplo de Uso Completo

```tsx
'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { MainSidebar, MobileSidebarTrigger } from '@/components/layout/MainSidebar'

export default function Layout({ children }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <div className="flex">
          <MainSidebar />
          
          <div className="flex-1 flex flex-col">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
              <MobileSidebarTrigger />
              <h1 className="text-lg font-semibold">HubEdu.ai</h1>
              <div className="w-8" />
            </div>

            {/* Page Content */}
            <div className="flex-1">
              {children}
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
```

## Migração do Sidebar Antigo

O novo sistema substitui completamente o sidebar antigo com as seguintes melhorias:

1. **Estado Unificado**: Um único contexto gerencia todos os estados
2. **Responsividade**: Funciona perfeitamente em mobile e desktop
3. **Acessibilidade**: Melhor suporte a navegação por teclado
4. **Performance**: Componentes otimizados com React.memo
5. **Flexibilidade**: Fácil customização e extensão
6. **Consistência**: Design system integrado

## Troubleshooting

### Sidebar não aparece
- Verifique se está dentro do `SidebarProvider`
- Confirme se as classes CSS estão sendo aplicadas

### Mobile não funciona
- Certifique-se de usar `SidebarTrigger` no header mobile
- Verifique se o overlay está sendo renderizado

### Estado não persiste
- O estado é local por sessão, não persiste entre reloads
- Para persistência, implemente localStorage no provider
