'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TIInteractive } from '@/components/ti-interactive/TIInteractive';

export default function DemoSimplePage() {
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Novas Funcionalidades - HubEdu.ai
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Teste das funcionalidades migradas (Versão Simplificada)
          </p>
        </div>

        {/* Troubleshooting Test */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🔧 Sistema de Troubleshooting Interativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Teste o sistema de resolução passo-a-passo de problemas de TI com dicas em tempo real.
              </p>
              
              <Button 
                onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                className="mb-4"
              >
                {showTroubleshooting ? 'Ocultar' : 'Testar Troubleshooting'}
              </Button>
              
              {showTroubleshooting && (
                <div className="border rounded-lg p-4 bg-white">
                  <TIInteractive initialQuestion="Meu computador está muito lento" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Status */}
        <Card>
          <CardHeader>
            <CardTitle>📡 Status das APIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">🔧 TI Hints</h3>
                <code className="text-sm bg-gray-100 p-2 rounded block">
                  POST /api/ti/hint
                </code>
                <p className="text-sm text-gray-600 mt-2">
                  Dicas em tempo real para troubleshooting
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">🏆 Achievements</h3>
                <code className="text-sm bg-gray-100 p-2 rounded block">
                  GET/POST /api/achievements
                </code>
                <p className="text-sm text-gray-600 mt-2">
                  Sistema de conquistas e gamificação
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">📊 Analytics</h3>
                <code className="text-sm bg-gray-100 p-2 rounded block">
                  GET /api/analytics
                </code>
                <p className="text-sm text-gray-600 mt-2">
                  Métricas e estatísticas de uso
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links para páginas completas */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🔗 Links de Acesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Página completa:</strong> <a href="/demo" className="text-blue-600 hover:underline">http://localhost:3000/demo</a></p>
              <p><strong>Troubleshooting:</strong> <a href="/demo?tab=ti" className="text-blue-600 hover:underline">http://localhost:3000/demo?tab=ti</a></p>
              <p><strong>Conquistas:</strong> <a href="/demo?tab=achievements" className="text-blue-600 hover:underline">http://localhost:3000/demo?tab=achievements</a></p>
              <p><strong>Analytics:</strong> <a href="/demo?tab=analytics" className="text-blue-600 hover:underline">http://localhost:3000/demo?tab=analytics</a></p>
              <p><strong>Dashboard Analytics:</strong> <a href="/analytics" className="text-blue-600 hover:underline">http://localhost:3000/analytics</a></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
