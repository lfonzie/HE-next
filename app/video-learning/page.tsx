import { Metadata } from 'next'
import VideoLearningApp from '@/components/video-learning/VideoLearningApp'

export const metadata: Metadata = {
  title: 'Vídeo para Aplicação de Aprendizado | HE-next',
  description: 'Transforme vídeos do YouTube em aplicações interativas de aprendizado usando IA',
}

export default function VideoLearningPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <VideoLearningApp />
    </div>
  )
}
