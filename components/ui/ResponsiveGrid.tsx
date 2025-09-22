import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function ResponsiveGrid({ 
  children, 
  className, 
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 'md'
}: ResponsiveGridProps) {
  const gapClasses = {
    xs: 'gap-2 sm:gap-3',
    sm: 'gap-3 sm:gap-4', 
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-12'
  };

  const gridCols = {
    default: `grid-cols-${cols.default}`,
    sm: cols.sm ? `sm:grid-cols-${cols.sm}` : '',
    md: cols.md ? `md:grid-cols-${cols.md}` : '',
    lg: cols.lg ? `lg:grid-cols-${cols.lg}` : '',
    xl: cols.xl ? `xl:grid-cols-${cols.xl}` : ''
  };

  return (
    <div className={cn(
      'grid',
      gridCols.default,
      gridCols.sm,
      gridCols.md,
      gridCols.lg,
      gridCols.xl,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

// Componente de exemplo para demonstrar o uso
export function ExampleGrid() {
  return (
    <div className="container-fluid-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="type-h2 font-bold">Grid Responsivo</h2>
          <p className="type-body-lg text-muted-foreground max-w-[65ch] mx-auto">
            Este grid se adapta automaticamente ao tamanho da tela, 
            mostrando 1 coluna no mobile, 2 no tablet e 3 no desktop.
          </p>
        </div>
        
        <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }} gap="md">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="type-h4 font-semibold">Item {i + 1}</h3>
                <p className="type-small text-muted-foreground">
                  Descrição do item que demonstra como o conteúdo se adapta ao espaço disponível.
                </p>
              </div>
            </div>
          ))}
        </ResponsiveGrid>
      </div>
    </div>
  );
}
