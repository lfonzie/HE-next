import { Metadata } from 'next'
import DictationComponent from '@/components/dictation/DictationComponent'

export const metadata: Metadata = {
  title: 'Ditado por Voz | HE-next',
  description: 'Transcreva e organize suas notas por voz usando IA. Fale naturalmente e veja o texto aparecer em tempo real.',
}

export default function DictationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DictationComponent />
    </div>
  )
}