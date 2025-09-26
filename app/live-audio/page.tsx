import { Metadata } from 'next'
import LiveAudioVisualizer from '@/components/live-audio/LiveAudioVisualizer'

export const metadata: Metadata = {
  title: 'Live Audio Visualizer | HE-next',
  description: 'Experiência de chat de voz em tempo real com visualizações 3D que reagem à sua conversa com IA',
}

export default function LiveAudioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <LiveAudioVisualizer />
    </div>
  )
}
