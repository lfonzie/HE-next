import { Metadata } from 'next'
import { SystemPromptsEditor } from '@/components/admin/SystemPromptsEditor'

export const metadata: Metadata = {
  title: 'Editor de System Prompts | HubEdu.ia Admin',
  description: 'Editor avançado para gerenciamento de todos os system prompts do sistema'
}

export default function SystemPromptsEditorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Editor de System Prompts
        </h1>
        <p className="text-gray-600 max-w-3xl">
          Editor avançado para gerenciar todos os system prompts do sistema. 
          Acesso restrito a super administradores.
        </p>
      </div>

      <SystemPromptsEditor />
    </div>
  )
}
