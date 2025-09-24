import { Metadata } from 'next'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { MessageSquare, Clock, Users, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Secretaria | HubEdu.ia',
  description: 'Informações sobre vagas, matrícula, bolsas, horários e documentos necessários'
}

const secretariaFeatures = [
  {
    icon: Users,
    title: 'Consultas de Vagas',
    description: 'Verificação de disponibilidade por série e período'
  },
  {
    icon: FileText,
    title: 'Documentação',
    description: 'Lista completa de documentos necessários para matrícula'
  },
  {
    icon: Clock,
    title: 'Horários',
    description: 'Funcionamento da secretaria e atendimento'
  },
  {
    icon: MessageSquare,
    title: 'Calendário',
    description: 'Datas importantes e eventos escolares'
  }
]

export default function SecretariaPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Secretaria Virtual
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Sua assistente virtual para informações sobre vagas, matrícula, 
          documentos e calendário escolar. Sempre pronta para ajudar! 😊
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {secretariaFeatures.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div key={index} className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
              <Icon className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Chat com a Secretaria
          </h2>
          <p className="text-gray-600">
            Faça suas perguntas sobre vagas, matrícula, documentos ou qualquer 
            informação administrativa. Nossa assistente virtual está aqui para ajudar!
          </p>
        </div>
        
        <div className="p-6">
          <ChatInterface 
            module="secretaria"
            systemPrompt="secretaria"
            placeholder="Ex: Quais documentos preciso para matrícula? Há vagas para o 6º ano?"
          />
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          ℹ️ Informações Importantes
        </h3>
        <ul className="text-blue-800 space-y-2">
          <li>• Todas as informações são baseadas nos dados oficiais da escola</li>
          <li>• Para confirmações específicas, sempre consulte a secretaria presencial</li>
          <li>• Documentos podem variar conforme a série e situação do aluno</li>
          <li>• Vagas são atualizadas em tempo real conforme disponibilidade</li>
        </ul>
      </div>
    </div>
  )
}
