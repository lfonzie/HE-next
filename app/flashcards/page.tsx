import { Metadata } from 'next'
import FlashcardMaker from '@/components/flashcard-maker/FlashcardMaker'

export const metadata: Metadata = {
  title: 'Gerador de Flashcards | HE-next',
  description: 'Crie flashcards interativos usando IA para qualquer tópico de estudo',
}

export default function FlashcardMakerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <FlashcardMaker />
    </div>
  )
}
