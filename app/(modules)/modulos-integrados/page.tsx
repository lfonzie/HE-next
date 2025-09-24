import { Metadata } from 'next'
import { ModuleDemo } from '@/components/modules/ModuleDemo'

export const metadata: Metadata = {
  title: 'Módulos Integrados | HubEdu.ia',
  description: 'Demonstração dos módulos de comunicação institucional integrados ao sistema de chat'
}

export default function ModulosIntegradosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Módulos Integrados ao Chat
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Todos os módulos de comunicação institucional estão integrados ao sistema de chat existente. 
          Teste as funcionalidades diretamente no chat!
        </p>
      </div>

      <ModuleDemo />
    </div>
  )
}
