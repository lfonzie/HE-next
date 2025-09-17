'use client';
import { useEffect, useState } from 'react';

interface School {
  id: string;
  name: string;
  domain: string;
  plan: string;
  city: string | null;
  state: string | null;
  created_at: Date;
  totalUsers: number;
  totalPrompts: number;
  activePrompts: number;
  totalTokensUsed: number;
  avgResponseTime: number;
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch('/api/admin/schools', {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'dev-token'}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch schools');
        }
        
        const data = await response.json();
        setSchools(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando escolas...</div>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Escolas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerenciamento de escolas cadastradas no sistema
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Lista de Escolas ({schools.length})
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Informações detalhadas sobre cada escola cadastrada
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {schools.map((school) => (
            <li key={school.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {school.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {school.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {school.domain}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {school.plan}
                      </p>
                      <p className="text-sm text-gray-500">
                        {school.city && school.state ? `${school.city}, ${school.state}` : 'Localização não informada'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Usuários
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {school.totalUsers}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Prompts Ativos
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {school.activePrompts} / {school.totalPrompts}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Tokens Usados
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {school.totalTokensUsed.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Tempo Médio
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {school.avgResponseTime}ms
                    </dd>
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    Cadastrada em: {new Date(school.created_at).toLocaleDateString('pt-BR')}
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
