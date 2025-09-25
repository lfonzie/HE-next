import { RedacaoNotifications } from '@/components/redacao/RedacaoNotifications'
import { LoadingProvider } from '@/components/ui/loading'
import { NotificationProvider } from '@/components/providers/NotificationProvider'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { ModernHeader } from '@/components/layout/ModernHeader'

export default function RedacaoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <LoadingProvider>
          <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
            {/* Header */}
            <ModernHeader showNavigation={true} showUserProfile={true} />
            
            {/* Main content with header padding */}
            <main className="pt-20">
              {children}
            </main>
            <RedacaoNotifications />
          </div>
        </LoadingProvider>
      </NotificationProvider>
    </SessionProvider>
  )
}
