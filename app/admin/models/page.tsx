'use client';
import { useEffect, useState } from 'react';

interface Model {
  id: string;
  name: string;
  available: boolean;
  isDefault: boolean;
  costPerInput: number | null;
  costPerOutput: number | null;
  totalConversations: number;
  totalTokensUsed: number;
  avgResponseTime: number;
  monthlyTokensUsed: number;
  estimatedMonthlyCost: number;
  created_at: Date;
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/admin/models', {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'dev-token'}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }
        
        const data = await response.json();
        setModels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando modelos...</div>
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

  const getModelProvider = (name: string) => {
    if (name.includes('gpt')) return 'OpenAI';
    if (name.includes('claude')) return 'Anthropic';
    if (name.includes('gemini')) return 'Google';
    if (name.includes('llama')) return 'Meta';
    return 'Outros';
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'OpenAI':
        return 'bg-green-100 text-green-800';
      case 'Anthropic':
        return 'bg-orange-100 text-orange-800';
      case 'Google':
        return 'bg-blue-100 text-blue-800';
      case 'Meta':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Modelos de IA</h1>
        <p className="mt-1 text-sm text-gray-500">
          Modelos de inteligência artificial disponíveis no sistema
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Lista de Modelos ({models.length})
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Informações detalhadas sobre cada modelo configurado
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {models.map((model) => {
            const provider = getModelProvider(model.name);
            return (
              <li key={model.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              🤖
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {model.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {provider}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProviderColor(provider)}`}>
                        {provider}
                      </span>
                      <div className="flex items-center space-x-2">
                        {model.isDefault && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Padrão
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          model.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {model.available ? 'Disponível' : 'Indisponível'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Conversas
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {model.totalConversations}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Tokens Usados
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {model.totalTokensUsed.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Tempo Médio
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {model.avgResponseTime}ms
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Custo Input
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {model.costPerInput ? `$${(model.costPerInput / 100).toFixed(2)}/1M tokens` : 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Custo Output
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {model.costPerOutput ? `$${(model.costPerOutput / 100).toFixed(2)}/1M tokens` : 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Tokens Este Mês
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {model.monthlyTokensUsed.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Custo Estimado
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-green-600">
                        ${model.estimatedMonthlyCost.toFixed(4)}
                      </dd>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Criado em: {new Date(model.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
