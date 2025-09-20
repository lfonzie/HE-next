import { RedacaoNotifications } from '@/components/redacao/RedacaoNotifications'
import { LoadingProvider } from '@/components/ui/loading'

export default function RedacaoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LoadingProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main>{children}</main>
        <RedacaoNotifications />
      </div>
    </LoadingProvider>
  )
}
