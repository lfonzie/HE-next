import { Metadata } from 'next'
import { ModuleCard } from '@/components/modules/ModuleCard'
import { MessageSquare, DollarSign, Users, Settings } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Comunicação Institucional | HubEdu.ia',
  description: 'Módulos de comunicação para secretaria, financeiro, coordenação e RH interno'
}

const communicationModules = [
  {
    title: 'Secretaria',
    description: 'Informações sobre vagas, matrícula, bolsas, horários, calendário escolar e documentos necessários',
    icon: MessageSquare,
    href: '/comunicacao/secretaria',
    features: [
      'Consultas sobre vagas disponíveis',
      'Informações de matrícula',
      'Calendário escolar',
      'Documentos necessários',
      'Horários de funcionamento'
    ],
    color: 'blue'
  },
  {
    title: 'Financeiro',
    description: 'Informações sobre valores de mensalidade, material, descontos e formas de pagamento',
    icon: DollarSign,
    href: '/comunicacao/financeiro',
    features: [
      'Valores de mensalidade',
      'Descontos disponíveis',
      'Formas de pagamento',
      'Materiais escolares',
      'Integração com ERP'
    ],
    color: 'green'
  },
  {
    title: 'Coordenação Pedagógica',
    description: 'Apoio para dúvidas sobre programas pedagógicos e regras institucionais',
    icon: Users,
    href: '/comunicacao/coordenacao',
    features: [
      'Programas (Integral, Bilíngue, LIV, CODE)',
      'Regras institucionais',
      'Uniforme e agenda',
      'Calendário pedagógico',
      'Orientações acadêmicas'
    ],
    color: 'purple'
  },
  {
    title: 'RH / Equipe Interna',
    description: 'FAQ sobre folha de pagamento, comunicação interna e processos administrativos',
    icon: Settings,
    href: '/comunicacao/rh',
    features: [
      'Folha de pagamento',
      'Comunicação interna',
      'Processos administrativos',
      'Políticas da empresa',
      'Benefícios e direitos'
    ],
    color: 'orange'
  }
]

export default function ComunicacaoPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Comunicação Institucional
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Módulos especializados para comunicação clara e eficiente entre escola, 
          famílias e equipe interna. Cada módulo possui persona institucional específica.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {communicationModules.map((module) => (
          <ModuleCard key={module.href} {...module} />
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 Como Funciona
        </h3>
        <ul className="text-blue-800 space-y-2">
          <li>• Cada módulo possui um <strong>system prompt institucional</strong> específico da escola</li>
          <li>• Persona amigável com nome próprio (ex: "Maria Clara")</li>
          <li>• Tom acolhedor e objetivo, sempre com emojis para WhatsApp</li>
          <li>• Disclaimer automático para informações que precisam de confirmação</li>
          <li>• Integração com sistemas existentes (ERP) apenas como consulta</li>
        </ul>
      </div>
    </div>
  )
}
