'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Save, Play, RotateCcw, Eye, Trash2, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import Editor from '@monaco-editor/react';

interface SystemPrompt {
  id: string;
  key: string;
  scope: string;
  model: string;
  status: 'draft' | 'active' | 'archived';
  version: number;
  json: any;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  key: string;
  scope: string;
  status: string;
}

const SCOPES = ['production', 'staging', 'development'] as const;
const STATUSES = ['draft', 'active', 'archived'] as const;

export default function AdminSystemPromptsPage() {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<SystemPrompt | null>(null);
  const [editorValue, setEditorValue] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({
    key: '',
    scope: 'production',
    status: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load prompts
  const loadPrompts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.key) params.set('key', filters.key);
      if (filters.scope) params.set('scope', filters.scope);
      if (filters.status) params.set('status', filters.status);

      const response = await fetch(`/api/system-prompts?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setPrompts(data.data);
      } else {
        toast.error('Erro ao carregar prompts');
      }
    } catch (error) {
      console.error('Error loading prompts:', error);
      toast.error('Erro ao carregar prompts');
    } finally {
      setLoading(false);
    }
  };

  // Load prompts when filters change
  useEffect(() => {
    loadPrompts();
  }, [filters]);

  // Update editor when prompt changes
  useEffect(() => {
    if (selectedPrompt) {
      setEditorValue(JSON.stringify(selectedPrompt.json, null, 2));
    } else {
      setEditorValue('');
    }
  }, [selectedPrompt]);

  // Filter prompts
  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      if (filters.key && !prompt.key.toLowerCase().includes(filters.key.toLowerCase())) {
        return false;
      }
      if (filters.scope && prompt.scope !== filters.scope) {
        return false;
      }
      if (filters.status && prompt.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [prompts, filters]);

  // Create new draft
  const createDraft = async () => {
    const key = prompt('Key do prompt (ex: professor.expanded_lesson.system)');
    if (!key) return;

    const template = {
      type: 'expanded_lesson',
      role: 'system',
      content: 'Escreva seu prompt aqui...',
      guardrails: [],
      examples: []
    };

    try {
      const response = await fetch('/api/system-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          scope: filters.scope || 'production',
          model: 'gpt-4o-mini',
          json: template,
          description: 'Novo prompt'
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Draft criado');
        loadPrompts();
        setSelectedPrompt(data.data);
      } else {
        toast.error(data.error || 'Erro ao criar draft');
      }
    } catch (error) {
      console.error('Error creating draft:', error);
      toast.error('Erro ao criar draft');
    }
  };

  // Save draft
  const saveDraft = async () => {
    if (!selectedPrompt) return;

    setSaving(true);
    try {
      const json = JSON.parse(editorValue);
      const response = await fetch(`/api/system-prompts/${selectedPrompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Draft atualizado');
        loadPrompts();
        setSelectedPrompt(data.data);
      } else {
        toast.error(data.error || 'Erro ao salvar');
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('JSON inválido');
      } else {
        console.error('Error saving draft:', error);
        toast.error('Erro ao salvar');
      }
    } finally {
      setSaving(false);
    }
  };

  // Publish prompt
  const publishPrompt = async () => {
    if (!selectedPrompt) return;

    try {
      const response = await fetch(`/api/system-prompts/${selectedPrompt.id}/publish`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Publicado!');
        loadPrompts();
        setSelectedPrompt(data.data);
      } else {
        toast.error(data.error || 'Erro ao publicar');
      }
    } catch (error) {
      console.error('Error publishing prompt:', error);
      toast.error('Erro ao publicar');
    }
  };

  // Preview prompt
  const previewPrompt = async () => {
    if (!selectedPrompt) return;

    try {
      const response = await fetch(`/api/system-prompts/${selectedPrompt.id}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: 'Exemplo de teste do preview.' })
      });

      const data = await response.json();
      if (data.success) {
        setPreviewData(data.data);
        setShowPreview(true);
      } else {
        toast.error(data.error || 'Erro ao fazer preview');
      }
    } catch (error) {
      console.error('Error previewing prompt:', error);
      toast.error('Erro ao fazer preview');
    }
  };

  // Delete prompt
  const deletePrompt = async () => {
    if (!selectedPrompt) return;
    if (!confirm('Tem certeza que deseja deletar este prompt?')) return;

    try {
      const response = await fetch(`/api/system-prompts/${selectedPrompt.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Prompt deletado');
        loadPrompts();
        setSelectedPrompt(null);
      } else {
        toast.error(data.error || 'Erro ao deletar');
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error('Erro ao deletar');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Draft</Badge>;
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800">Arquivado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              System Messages
            </h1>
            <p className="text-gray-600 mt-1">Gerencie prompts do sistema com versionamento</p>
          </div>
          <Button onClick={createDraft} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Draft
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder="Filtrar por key..."
                value={filters.key}
                onChange={(e) => setFilters(f => ({ ...f, key: e.target.value }))}
                className="max-w-sm"
              />
              <Select value={filters.scope} onValueChange={(v) => setFilters(f => ({ ...f, scope: v }))}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  {SCOPES.map(scope => (
                    <SelectItem key={scope} value={scope}>{scope}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-12 gap-6">
          {/* Prompts List */}
          <Card className="col-span-5">
            <CardHeader>
              <CardTitle>Prompts ({filteredPrompts.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[70vh] overflow-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : filteredPrompts.length === 0 ? (
                <div className="text-center text-gray-500 p-8">
                  Nenhum prompt encontrado
                </div>
              ) : (
                filteredPrompts.map(prompt => (
                  <button
                    key={prompt.id}
                    className={`w-full text-left border rounded-xl p-4 hover:bg-gray-50 transition-colors ${
                      selectedPrompt?.id === prompt.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{prompt.key}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          v{prompt.version} • {prompt.scope} • {prompt.model}
                        </div>
                        {prompt.description && (
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {prompt.description}
                          </div>
                        )}
                      </div>
                      <div className="ml-2">
                        {getStatusBadge(prompt.status)}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Editor */}
          <Card className="col-span-7">
            <CardHeader>
              <CardTitle>Editor JSON</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPrompt ? (
                <>
                  <div className="h-[55vh] border rounded-xl overflow-hidden">
                    <Editor
                      height="100%"
                      defaultLanguage="json"
                      value={editorValue}
                      onChange={(value) => setEditorValue(value ?? '')}
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        wordWrap: 'on',
                        automaticLayout: true
                      }}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={previewPrompt} disabled={!selectedPrompt}>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    {selectedPrompt.status === 'draft' && (
                      <>
                        <Button variant="outline" onClick={saveDraft} disabled={saving}>
                          {saving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Salvar Draft
                        </Button>
                        <Button onClick={publishPrompt}>
                          <Play className="w-4 h-4 mr-2" />
                          Publicar
                        </Button>
                      </>
                    )}
                    {selectedPrompt.status === 'draft' && (
                      <Button variant="destructive" onClick={deletePrompt}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deletar
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-[55vh] flex items-center justify-center text-gray-500">
                  Selecione um prompt para editar
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Modal */}
        {showPreview && previewData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <CardHeader>
                <CardTitle>Preview do Prompt</CardTitle>
              </CardHeader>
              <CardContent className="overflow-auto">
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(previewData, null, 2)}
                </pre>
                <div className="flex justify-end mt-4">
                  <Button onClick={() => setShowPreview(false)}>Fechar</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
