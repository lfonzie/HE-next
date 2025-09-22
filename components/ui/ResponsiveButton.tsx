import { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

export function ResponsiveButton({ 
  children, 
  className, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  ...props
}: ResponsiveButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const sizeClasses = {
    sm: "min-h-9 min-w-9 px-3 py-2 type-small",
    md: "min-h-11 min-w-11 px-4 py-3 type-body",
    lg: "min-h-12 min-w-12 px-6 py-4 type-body-lg"
  };
  
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-95",
    ghost: "hover:bg-accent hover:text-accent-foreground active:scale-95",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95"
  };

  return (
    <button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}

// Componente de exemplo para demonstrar o uso
export function ExampleButtons() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="type-h2 font-bold">Botões Responsivos</h2>
        <p className="type-body-lg text-muted-foreground max-w-[65ch] mx-auto">
          Botões com tap targets adequados (mínimo 44x44px) e diferentes variantes e tamanhos.
        </p>
      </div>

      <div className="space-y-6">
        {/* Variantes */}
        <div className="space-y-4">
          <h3 className="type-h4 font-semibold">Variantes</h3>
          <div className="flex flex-wrap gap-4">
            <ResponsiveButton variant="primary">Primário</ResponsiveButton>
            <ResponsiveButton variant="secondary">Secundário</ResponsiveButton>
            <ResponsiveButton variant="outline">Outline</ResponsiveButton>
            <ResponsiveButton variant="ghost">Ghost</ResponsiveButton>
            <ResponsiveButton variant="destructive">Destrutivo</ResponsiveButton>
          </div>
        </div>

        {/* Tamanhos */}
        <div className="space-y-4">
          <h3 className="type-h4 font-semibold">Tamanhos</h3>
          <div className="flex flex-wrap items-center gap-4">
            <ResponsiveButton size="sm">Pequeno</ResponsiveButton>
            <ResponsiveButton size="md">Médio</ResponsiveButton>
            <ResponsiveButton size="lg">Grande</ResponsiveButton>
          </div>
        </div>

        {/* Estados */}
        <div className="space-y-4">
          <h3 className="type-h4 font-semibold">Estados</h3>
          <div className="flex flex-wrap gap-4">
            <ResponsiveButton>Normal</ResponsiveButton>
            <ResponsiveButton loading>Carregando</ResponsiveButton>
            <ResponsiveButton disabled>Desabilitado</ResponsiveButton>
            <ResponsiveButton fullWidth>Largura Completa</ResponsiveButton>
          </div>
        </div>
      </div>
    </div>
  );
}
