import { LoadingCard } from '@/components/ui/loading'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <LoadingCard 
        message="Carregando página..."
        variant="ring"
        size="lg"
        showProgress={false}
      />
    </div>
  )
}
