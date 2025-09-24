import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
}

export function ResponsiveCard({ 
  children, 
  className, 
  variant = 'default',
  padding = 'md' 
}: ResponsiveCardProps) {
  const baseClasses = "rounded-2xl transition-all duration-300";
  
  const variantClasses = {
    default: "bg-card border border-border shadow-sm hover:shadow-md",
    elevated: "bg-card border border-border shadow-md hover:shadow-lg",
    outlined: "bg-card border-2 border-border hover:border-primary/50"
  };
  
  const paddingClasses = {
    sm: "p-2 sm:p-3",
    md: "p-3 sm:p-4",
    lg: "p-4 sm:p-5"
  };

  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
}

// Componente de exemplo para demonstrar o uso
export function ExampleCard() {
  return (
    <ResponsiveCard variant="elevated" padding="md" className="hover:scale-[1.02]">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold">
            🎯
          </div>
          <div>
            <h3 className="type-h4 font-semibold">Título do Card</h3>
            <p className="type-small text-muted-foreground">Subtítulo descritivo</p>
          </div>
        </div>
        
        <p className="type-body text-muted-foreground">
          Este é um exemplo de card responsivo que demonstra o uso das classes de tipografia fluida 
          e espaçamento adaptativo.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button className="min-h-11 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium type-body hover:bg-primary/90 transition-colors">
            Ação Principal
          </button>
          <button className="min-h-11 px-4 py-2 border border-border text-foreground rounded-lg font-medium type-body hover:bg-accent transition-colors">
            Ação Secundária
          </button>
        </div>
      </div>
    </ResponsiveCard>
  );
}
