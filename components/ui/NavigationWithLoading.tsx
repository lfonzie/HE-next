'use client';

import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';
import { cn } from '@/lib/utils';

interface NavigationWithLoadingProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  message?: string;
  replace?: boolean;
  onClick?: () => void;
}

export default function NavigationWithLoading({
  href,
  children,
  className,
  message,
  replace = false,
  onClick
}: NavigationWithLoadingProps) {
  const { push, replace: replaceRoute } = useNavigationWithLoading();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (onClick) {
      onClick();
    }

    if (replace) {
      replaceRoute(href, message);
    } else {
      push(href, message);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={cn(className)}
    >
      {children}
    </a>
  );
}

