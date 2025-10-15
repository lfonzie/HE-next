'use client';
import { useEffect, useState } from 'react';

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  school: string;
  module: string;
  subject: string | null;
  grade: string | null;
  model: string | null;
  tokenCount: number;
  messageCount: number;
  upvotes: number;
  downvotes: number;
  created_at: Date;
  updated_at: Date;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/admin/conversations', {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'dev-token'}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        
        const data = await response.json();
        setConversations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando conversas...</div>
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conversas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Histórico de conversas dos usuários com o sistema
        </p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Lista de Conversas ({conversations.length})
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Informações detalhadas sobre cada conversa registrada
          </p>
        </div>
        <ul className="divide-y divide-gray-200">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {conversation.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.userName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.userEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getModuleColor(conversation.module)}`}>
                      {conversation.module}
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {conversation.school}
                      </p>
                      <p className="text-sm text-gray-500">
                        {conversation.subject && conversation.grade 
                          ? `${conversation.subject} - ${conversation.grade}`
                          : conversation.subject || conversation.grade || 'Sem informações'
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Modelo
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {conversation.model || 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Mensagens
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {conversation.messageCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Tokens
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {conversation.tokenCount.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Avaliações
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className="text-green-600">↑{conversation.upvotes}</span>
                      <span className="mx-1">/</span>
                      <span className="text-red-600">↓{conversation.downvotes}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Criada em
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <div>{new Date(conversation.created_at).toLocaleDateString('pt-BR')}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(conversation.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
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
