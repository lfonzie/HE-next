import { Metadata } from 'next'
import OptimizedGeminiLiveChat from '@/components/gemini-live/OptimizedGeminiLiveChat'

export const metadata: Metadata = {
  title: 'Gemini Live Chat Otimizado | HE-next',
  description: 'Chat de IA com respostas por áudio usando Gemini 2.5 Flash TTS otimizado',
}

export default function OptimizedGeminiLivePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <OptimizedGeminiLiveChat />
    </div>
  )
}
