'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LoadingProvider } from '@/components/ui/loading';
import AdminTelemetryWrapper from '@/components/admin/AdminTelemetryWrapper';
import { SuperAdminGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Building2,
  Users,
  MessageSquare,
  Bot,
  FileText,
  Zap,
  Code,
  Target,
  Database,
  Settings,
  Menu,
  X,
  ChevronRight,
  Shield
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuperAdminGuard>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SuperAdminGuard>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3, category: 'main' },
    { href: '/admin/schools', label: 'Escolas', icon: Building2, category: 'management' },
    { href: '/admin/users', label: 'Usuários', icon: Users, category: 'management' },
    { href: '/admin/conversations', label: 'Conversas', icon: MessageSquare, category: 'management' },
    { href: '/admin/models', label: 'Modelos', icon: Bot, category: 'ai' },
    { href: '/admin/prompts', label: 'Prompts', icon: FileText, category: 'ai' },
    { href: '/admin/system-prompts', label: 'Prompts Sistema', icon: Zap, category: 'ai' },
    { href: '/admin/system-prompts-editor', label: 'Editor Prompts', icon: Code, category: 'ai' },
    { href: '/admin/enem', label: 'ENEM Admin', icon: Target, category: 'features' },
    { href: '/admin/database-stats', label: 'Estatísticas DB', icon: Database, category: 'system' },
    { href: '/admin/system-info', label: 'Sistema', icon: Settings, category: 'system' }
  ];

  const categories = {
    main: { label: 'Principal', items: navItems.filter(item => item.category === 'main') },
    management: { label: 'Gestão', items: navItems.filter(item => item.category === 'management') },
    ai: { label: 'IA & Prompts', items: navItems.filter(item => item.category === 'ai') },
    features: { label: 'Funcionalidades', items: navItems.filter(item => item.category === 'features') },
    system: { label: 'Sistema', items: navItems.filter(item => item.category === 'system') }
  };

  return (
    <LoadingProvider>
      <AdminTelemetryWrapper pageName="admin-layout">
        <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-72 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <div className="space-y-6">
              {Object.entries(categories).map(([categoryKey, category]) => (
                <div key={categoryKey}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {category.label}
                  </h3>
                  <ul className="space-y-1">
                    {category.items.map(item => {
                      const IconComponent = item.icon;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              pathname === item.href
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <IconComponent className="w-4 h-4 mr-3" />
                            {item.label}
                            {pathname === item.href && (
                              <ChevronRight className="w-4 h-4 ml-auto" />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm">
          <div className="flex h-16 items-center px-4 border-b">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
          </div>
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <div className="space-y-6">
              {Object.entries(categories).map(([categoryKey, category]) => (
                <div key={categoryKey}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {category.label}
                  </h3>
                  <ul className="space-y-1">
                    {category.items.map(item => {
                      const IconComponent = item.icon;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              pathname === item.href
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <IconComponent className="w-4 h-4 mr-3" />
                            {item.label}
                            {pathname === item.href && (
                              <ChevronRight className="w-4 h-4 ml-auto" />
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
            <span className="sr-only">Abrir sidebar</span>
          </Button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Badge variant="outline" className="text-xs">
                {new Date().toLocaleDateString('pt-BR')}
              </Badge>
              <div className="text-xs text-gray-500">
                {new Date().toLocaleTimeString('pt-BR')}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
        </div>
      </AdminTelemetryWrapper>
    </LoadingProvider>
  );
}
