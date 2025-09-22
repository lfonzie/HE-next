import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  required?: boolean;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  placeholder?: string;
  className?: string;
}

const ResponsiveSelect: React.FC<ResponsiveSelectProps> = ({
  label,
  error,
  required = false,
  options,
  placeholder = 'Selecione uma opção',
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="type-body font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <select
        className={cn(
          'flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 type-body ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="type-small text-destructive">{error}</p>
      )}
    </div>
  );
};

export default ResponsiveSelect;
