import { Metadata } from 'next'
import ChatDocsComponent from '@/components/chat-docs/ChatDocsComponent'

export const metadata: Metadata = {
  title: 'Chat com Documentos | HE-next',
  description: 'Converse com seus documentos usando IA. Faça perguntas e obtenha respostas baseadas no conteúdo.',
}

export default function ChatDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ChatDocsComponent />
    </div>
  )
}