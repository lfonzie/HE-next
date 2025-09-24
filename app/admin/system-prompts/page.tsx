import { Metadata } from 'next'
import { InstitutionalPromptsAdmin } from '@/components/admin/InstitutionalPromptsAdmin'

export const metadata: Metadata = {
  title: 'Prompts Institucionais | HubEdu.ia Admin',
  description: 'Gerenciamento de prompts institucionais por escola e módulo'
}

export default function SystemPromptsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Prompts Institucionais
        </h1>
        <p className="text-gray-600 max-w-3xl">
          Configure os prompts institucionais para cada escola e módulo de comunicação. 
          Cada escola terá sua própria persona e informações específicas.
        </p>
      </div>

      <InstitutionalPromptsAdmin />
    </div>
  )
}