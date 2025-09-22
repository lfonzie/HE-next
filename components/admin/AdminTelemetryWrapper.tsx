'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { createAdminSpan } from '@/lib/admin-telemetry';

interface AdminTelemetryWrapperProps {
  children: React.ReactNode;
  pageName: string;
}

export default function AdminTelemetryWrapper({ children, pageName }: AdminTelemetryWrapperProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Create a span for page load
    const span = createAdminSpan('admin.page.load', {
      'admin.page': pageName,
      'admin.path': pathname,
      'admin.component': 'admin-panel',
    });

    // Record page load time
    const startTime = Date.now();
    
    // Simulate page load completion
    const timer = setTimeout(() => {
      const duration = Date.now() - startTime;
      span.setAttributes({
        'admin.page.load_duration_ms': duration,
      });
      span.end();
    }, 100);

    return () => {
      clearTimeout(timer);
      span.end();
    };
  }, [pathname, pageName]);

  return <>{children}</>;
}
