import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function ResponsiveContainer({ 
  children, 
  className, 
  size = 'lg',
  padding = 'md'
}: ResponsiveContainerProps) {
  const sizeClasses = {
    xs: 'container-fluid-xs',
    sm: 'container-fluid-sm', 
    md: 'container-fluid-md',
    lg: 'container-fluid-lg',
    xl: 'container-fluid-xl',
    '2xl': 'container-fluid-2xl'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12'
  };

  return (
    <div className={cn(
      'mx-auto',
      sizeClasses[size],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

// Componente de exemplo para demonstrar o uso
export function ExampleContainer() {
  return (
    <div className="space-y-12 py-8">
      <ResponsiveContainer size="md" padding="md">
        <div className="text-center space-y-6">
          <h1 className="type-h1 font-bold">Container Responsivo</h1>
          <p className="type-body-lg text-muted-foreground max-w-[65ch] mx-auto">
            Este container se adapta automaticamente ao tamanho da tela, 
            mantendo margens adequadas e largura máxima otimizada.
          </p>
        </div>
      </ResponsiveContainer>

      <ResponsiveContainer size="lg" padding="md">
        <div className="bg-muted/50 rounded-2xl p-6 sm:p-8">
          <h2 className="type-h3 font-semibold mb-4">Conteúdo do Container</h2>
          <p className="type-body text-muted-foreground">
            Este é um exemplo de como usar o container responsivo com diferentes tamanhos e padding.
            O conteúdo se adapta automaticamente ao espaço disponível.
          </p>
        </div>
      </ResponsiveContainer>
    </div>
  );
}
