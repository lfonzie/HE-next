import { Metadata } from 'next'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { DollarSign, CreditCard, Percent, Calculator, Receipt } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Financeiro | HubEdu.ia',
  description: 'Informações sobre valores, descontos, formas de pagamento e materiais escolares'
}

const financeiroFeatures = [
  {
    icon: DollarSign,
    title: 'Valores',
    description: 'Mensalidades por série e período'
  },
  {
    icon: Percent,
    title: 'Descontos',
    description: 'Bolsa família, irmãos, pagamento à vista'
  },
  {
    icon: CreditCard,
    title: 'Pagamento',
    description: 'Formas de pagamento aceitas'
  },
  {
    icon: Calculator,
    title: 'Simulador',
    description: 'Calcule valores com descontos'
  },
  {
    icon: Receipt,
    title: 'Materiais',
    description: 'Lista de materiais escolares'
  }
]

export default function FinanceiroPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Financeiro Virtual
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Sua assistente financeira para informações sobre valores, descontos, 
          formas de pagamento e materiais escolares. 💰
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {financeiroFeatures.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div key={index} className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
              <Icon className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Chat Financeiro
          </h2>
          <p className="text-gray-600">
            Tire suas dúvidas sobre valores, descontos, formas de pagamento 
            ou qualquer questão financeira. Sempre destacamos os descontos já aplicados!
          </p>
        </div>
        
        <div className="p-6">
          <ChatInterface 
            module="financeiro"
            systemPrompt="financeiro"
            placeholder="Ex: Qual o valor da mensalidade do 6º ano? Que descontos posso ter?"
          />
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          💡 Dicas Financeiras
        </h3>
        <ul className="text-green-800 space-y-2">
          <li>• Pagamento à vista oferece desconto adicional</li>
          <li>• Famílias com múltiplos filhos têm desconto progressivo</li>
          <li>• Bolsa família e outros benefícios sociais são aplicados automaticamente</li>
          <li>• Materiais escolares podem ser parcelados em até 12x</li>
          <li>• Integração com ERP para consulta de débitos em tempo real</li>
        </ul>
      </div>
    </div>
  )
}
