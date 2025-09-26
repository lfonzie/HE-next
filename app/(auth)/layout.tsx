import { ReactNode } from 'react'
import { LoadingProvider } from '@/components/ui/loading'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <LoadingProvider>
      <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] transition-theme">
        {children}
      </div>
    </LoadingProvider>
  )
}
