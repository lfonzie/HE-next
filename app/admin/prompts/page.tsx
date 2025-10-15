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
  maxCompletionTokens?: number | null;
  tone: string | null;
  type: 'system' | 'school';
  school: string | null;
  created_at: Date;
  updated_at?: Date;
}

interface PromptFormData {
  module: string;
  text: string;
  description: string;
  isActive: boolean;
  temperature: number;
  maxTokens: number;
  maxCompletionTokens: number;
  tone: string;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [formData, setFormData] = useState<PromptFormData>({
    module: '',
    text: '',
    description: '',
    isActive: true,
    temperature: 7,
    maxTokens: 1000,
    maxCompletionTokens: 800,
    tone: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/admin/prompts', {
        headers: {
          'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'dev-token'
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

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'dev-token'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create prompt');
      }

      const newPrompt = await response.json();
      setPrompts([newPrompt, ...prompts]);
      setShowCreateForm(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prompt');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingPrompt) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/prompts/${editingPrompt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'dev-token'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update prompt');
      }

      const updatedPrompt = await response.json();
      setPrompts(prompts.map(p => p.id === editingPrompt.id ? updatedPrompt : p));
      setEditingPrompt(null);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update prompt');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este prompt?')) return;

    try {
      const response = await fetch(`/api/admin/prompts/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'dev-token'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete prompt');
      }

      setPrompts(prompts.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompt');
    }
  };

  const resetForm = () => {
    setFormData({
      module: '',
      text: '',
      description: '',
      isActive: true,
      temperature: 7,
      maxTokens: 1000,
      maxCompletionTokens: 800,
      tone: ''
    });
  };

  const startEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      module: prompt.module,
      text: prompt.text,
      description: prompt.description || '',
      isActive: prompt.isActive,
      temperature: prompt.temperature || 7,
      maxTokens: prompt.maxTokens || 1000,
      maxCompletionTokens: prompt.maxCompletionTokens || 800,
      tone: prompt.tone || ''
    });
  };

  const cancelEdit = () => {
    setEditingPrompt(null);
    setShowCreateForm(false);
    resetForm();
  };

  const getModuleColor = (module: string) => {
    switch (module.toLowerCase()) {
      case 'professor':
        return 'bg-blue-100 text-blue-800';
      case 'ti':
        return 'bg-purple-100 text-purple-800';
      case 'secretaria':
        return 'bg-green-100 text-green-800';
      case 'financeiro':
        return 'bg-yellow-100 text-yellow-800';
      case 'rh':
        return 'bg-pink-100 text-pink-800';
      case 'atendimento':
        return 'bg-indigo-100 text-indigo-800';
      case 'coordenacao':
        return 'bg-red-100 text-red-800';
      case 'social-media':
        return 'bg-cyan-100 text-cyan-800';
      case 'bem-estar':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando prompts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prompts do Sistema</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie prompts globais do sistema e prompts personalizados por escola
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          + Novo Prompt
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingPrompt) && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingPrompt ? 'Editar Prompt' : 'Criar Novo Prompt'}
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Módulo *
              </label>
              <input
                type="text"
                value={formData.module}
                onChange={(e) => setFormData({...formData, module: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ex: professor, ti, secretaria"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Descrição do prompt"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Temperatura
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.temperature / 10}
                onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value) * 10})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Tokens
              </label>
              <input
                type="number"
                value={formData.maxTokens}
                onChange={(e) => setFormData({...formData, maxTokens: parseInt(e.target.value)})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Max Completion Tokens
              </label>
              <input
                type="number"
                value={formData.maxCompletionTokens}
                onChange={(e) => setFormData({...formData, maxCompletionTokens: parseInt(e.target.value)})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tom
              </label>
              <input
                type="text"
                value={formData.tone}
                onChange={(e) => setFormData({...formData, tone: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="ex: motivacional, técnico, empático"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">
              Conteúdo do Prompt *
            </label>
            <textarea
              rows={8}
              value={formData.text}
              onChange={(e) => setFormData({...formData, text: e.target.value})}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Digite o conteúdo do prompt aqui..."
            />
          </div>

          <div className="mt-6 flex items-center">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Prompt ativo
            </label>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={cancelEdit}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={editingPrompt ? handleUpdate : handleCreate}
              disabled={saving || !formData.module || !formData.text}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium"
            >
              {saving ? 'Salvando...' : (editingPrompt ? 'Atualizar' : 'Criar')}
            </button>
          </div>
        </div>
      )}

      {/* Prompts List */}
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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEdit(prompt)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(prompt.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Deletar
                      </button>
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
                    {prompt.updated_at && (
                      <span className="ml-2">
                        | Atualizado em: {new Date(prompt.updated_at).toLocaleDateString('pt-BR')}
                      </span>
                    )}
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