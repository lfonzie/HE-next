import { RedacaoNotifications } from '@/components/redacao/RedacaoNotifications'

export default function RedacaoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main>{children}</main>
      <RedacaoNotifications />
    </div>
  )
}
