'use client';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  school: string;
  created_at: Date;
  totalConversations: number;
  totalTokensUsed: number;
  lastActivity: Date;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'dev-token'}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando usuários...</div>
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800';
      case 'TEACHER':
        return 'bg-blue-100 text-blue-800';
      case 'STAFF':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerenciamento de usuários cadastrados no sistema
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Lista de Usuários ({users.length})
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Informações detalhadas sobre cada usuário cadastrado
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name || 'Nome não informado'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {user.school}
                      </p>
                      <p className="text-sm text-gray-500">
                        Cadastrado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Conversas
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user.totalConversations}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Tokens Usados
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user.totalTokensUsed.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Última Atividade
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(user.lastActivity).toLocaleDateString('pt-BR')}
                    </dd>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
