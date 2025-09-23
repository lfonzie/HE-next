import { RedacaoNotifications } from '@/components/redacao/RedacaoNotifications'
import { LoadingProvider } from '@/components/ui/loading'
import { NotificationProvider } from '@/components/providers/NotificationProvider'

export default function RedacaoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NotificationProvider>
      <LoadingProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <main>{children}</main>
          <RedacaoNotifications />
        </div>
      </LoadingProvider>
    </NotificationProvider>
  )
}
