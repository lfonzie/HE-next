'use client'

import { useState } from 'react'
import SimpleTTSButton from '@/components/audio/SimpleTTSButton'

export default function TestTTSControlsPage() {
  const [text, setText] = useState('Este é um teste do sistema de áudio com controles avançados. Você pode pausar, ajustar a velocidade e o volume do áudio gerado.')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🎵 Teste dos Controles de Áudio TTS
          </h1>
          
          <div className="space-y-6">
            {/* Text Input */}
            <div>
              <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
                Texto para converter em áudio:
              </label>
              <textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Digite o texto que deseja converter em áudio..."
              />
            </div>

            {/* TTS Button with Controls */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🎤 Player de Áudio com Controles
              </h2>
              <SimpleTTSButton
                text={text}
                voice="Zephyr"
                className="w-full"
                onAudioStart={() => console.log('🎵 Áudio iniciado')}
                onAudioEnd={() => console.log('🔚 Áudio finalizado')}
              />
            </div>

            {/* Features List */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                ✨ Interface Compacta:
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <strong>Auto-play:</strong> Reproduz automaticamente quando o áudio estiver pronto
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <strong>Controles Compactos:</strong> Play/Pause, Reset, Progresso e Velocidade em uma linha
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <strong>Barra de Progresso:</strong> Visualização do progresso em tempo real
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <strong>Controle de Velocidade:</strong> Slider compacto de 0.5x a 2.0x
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <strong>Timer:</strong> Tempo atual / duração total
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <strong>Fallback Inteligente:</strong> Google TTS → OpenAI TTS se necessário
                </li>
              </ul>
            </div>

            {/* Technical Info */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                🔧 Informações Técnicas:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <strong>Provedor Principal:</strong> Google TTS WaveNet (pt-BR-Wavenet-C)
                </div>
                <div>
                  <strong>Provedor Fallback:</strong> OpenAI TTS (shimmer)
                </div>
                <div>
                  <strong>Formato de Áudio:</strong> MP3
                </div>
                <div>
                  <strong>Qualidade:</strong> Alta (WaveNet Neural)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
