import { ReactNode } from 'react'
import { ModuleNavigation } from '@/components/modules/ModuleNavigation'

interface ModulesLayoutProps {
  children: ReactNode
}

export default function ModulesLayout({ children }: ModulesLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <ModuleNavigation />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
