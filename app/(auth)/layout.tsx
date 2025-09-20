import { ReactNode } from 'react'
import { LoadingProvider } from '@/components/ui/loading'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <LoadingProvider>
      <div className="min-h-screen">
        {children}
      </div>
    </LoadingProvider>
  )
}
