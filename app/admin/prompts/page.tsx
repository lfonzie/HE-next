'use client';
import { useEffect, useState } from 'react';

interface Prompt {
  id: string;
  module: string;
  text: string;
  description: string | null;
  isActive: boolean;
  temperature: number | null;
  maxTokens: number | null;
  tone: string | null;
  type: 'system' | 'school';
  school: string | null;
  created_at: Date;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch('/api/admin/prompts', {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'dev-token'}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch prompts');
        }
        
        const data = await response.json();
        setPrompts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando prompts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Erro: {error}</div>
      </div>
    );
  }

  const getModuleColor = (module: string) => {
    switch (module.toLowerCase()) {
      case 'professor':
        return 'bg-blue-100 text-blue-800';
      case 'enem':
        return 'bg-red-100 text-red-800';
      case 'hubedu-interactive':
        return 'bg-green-100 text-green-800';
      case 'lessons':
        return 'bg-purple-100 text-purple-800';
      case 'support':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prompts do Sistema</h1>
        <p className="mt-1 text-sm text-gray-500">
          Prompts globais do sistema e prompts personalizados por escola
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Lista de Prompts ({prompts.length})
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Informações detalhadas sobre cada prompt configurado
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {prompts.map((prompt) => (
            <li key={prompt.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            📝
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {prompt.module}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {prompt.description || 'Sem descrição'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getModuleColor(prompt.module)}`}>
                      {prompt.module}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        prompt.type === 'system' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {prompt.type === 'system' ? 'Sistema' : 'Escola'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        prompt.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {prompt.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Conteúdo do Prompt
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    <pre className="whitespace-pre-wrap font-sans">
                      {truncateText(prompt.text, 200)}
                    </pre>
                  </dd>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Temperatura
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {prompt.temperature ? (prompt.temperature / 10).toFixed(1) : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Max Tokens
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {prompt.maxTokens || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Tom
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {prompt.tone || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Escola
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {prompt.school || 'Sistema'}
                    </dd>
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    Criado em: {new Date(prompt.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
