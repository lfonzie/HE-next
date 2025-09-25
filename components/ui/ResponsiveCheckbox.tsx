import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ResponsiveCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  description?: string;
  className?: string;
}

const ResponsiveCheckbox: React.FC<ResponsiveCheckboxProps> = ({
  label,
  error,
  description,
  className = '',
  ...props
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-start gap-3">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            className={cn(
              'peer h-5 w-5 min-h-5 min-w-5 rounded border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              'peer-checked:bg-primary peer-checked:border-primary'
            )}
            {...props}
          />
          <Check className="absolute h-3 w-3 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
        </div>
        <div className="flex-1 min-w-0">
          {label && (
            <label className="type-body font-medium text-foreground cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="type-small text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {error && (
        <p className="type-small text-destructive">{error}</p>
      )}
    </div>
  );
};

export default ResponsiveCheckbox;
