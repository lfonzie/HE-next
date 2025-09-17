'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  MessageSquare, 
  Wrench, 
  Trophy, 
  BarChart3, 
  BookOpen,
  Settings,
  Sparkles,
  Users
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Início',
    href: '/',
    icon: Home,
  },
  {
    name: 'Aulas Interativas',
    href: '/aulas',
    icon: BookOpen,
    badge: 'NOVO',
  },
  {
    name: 'Gerar Aula',
    href: '/aulas/generate',
    icon: Sparkles,
    badge: 'IA',
  },
  {
    name: 'Chat',
    href: '/chat',
    icon: MessageSquare,
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    badge: 'NOVO',
  },
  {
    name: 'Professor',
    href: '/professor-interactive',
    icon: Users,
  },
  {
    name: 'Troubleshooting',
    href: '/demo?tab=ti',
    icon: Wrench,
  },
];

export function NavigationMenu() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-2">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href || 
          (item.href.startsWith('/demo') && pathname.startsWith('/demo'));
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.name}</span>
            {item.badge && (
              <span className="ml-auto px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

