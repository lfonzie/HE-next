'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { 
  Loader2, 
  Plus, 
  Save, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  MessageSquare,
  School,
  Settings,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemPrompt {
  id: string;
  module: string;
  text: string;
  description: string | null;
  isActive: boolean;
  temperature: number | null;
  maxTokens: number | null;
  maxCompletionTokens: number | null;
  tone: string | null;
  type: 'system' | 'school';
  school: string | null;
  created_at: string;
  updated_at: string;
}

interface EditPromptData {
  text: string;
  description: string;
  isActive: boolean;
  temperature: number;
  maxTokens: number;
  maxCompletionTokens: number;
  tone: string;
}

export default function SystemPromptsPage() {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);
  const [editData, setEditData] = useState<EditPromptData>({
    text: '',
    description: '',
    isActive: true,
    temperature: 7,
    maxTokens: 1000,
    maxCompletionTokens: 800,
    tone: 'professional'
  });
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'system' | 'school'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPrompts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/prompts', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'dev-token'}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPrompts(data);
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prompts');
      toast.error('Erro ao carregar prompts do sistema');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleEdit = (prompt: SystemPrompt) => {
    setEditingPrompt(prompt);
    setEditData({
      text: prompt.text,
      description: prompt.description || '',
      isActive: prompt.isActive,
      temperature: prompt.temperature || 7,
      maxTokens: prompt.maxTokens || 1000,
      maxCompletionTokens: prompt.maxCompletionTokens || 800,
      tone: prompt.tone || 'professional'
    });
  };

  const handleSave = async () => {
    if (!editingPrompt) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/prompts/${editingPrompt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'dev-token'}`
        },
        body: JSON.stringify(editData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedPrompt = await response.json();
      
      // Update the prompts list
      setPrompts(prev => prev.map(p => p.id === editingPrompt.id ? updatedPrompt : p));
      
      setEditingPrompt(null);
      toast.success('Prompt atualizado com sucesso!');
    } catch (err) {
      console.error('Error updating prompt:', err);
      toast.error('Erro ao atualizar prompt');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (promptId: string) => {
    if (!confirm('Tem certeza que deseja excluir este prompt?')) return;

    try {
      const response = await fetch(`/api/admin/prompts/${promptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'dev-token'}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove from prompts list
      setPrompts(prev => prev.filter(p => p.id !== promptId));
      toast.success('Prompt excluído com sucesso!');
    } catch (err) {
      console.error('Error deleting prompt:', err);
      toast.error('Erro ao excluir prompt');
    }
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesType = filterType === 'all' || prompt.type === filterType;
    const matchesSearch = prompt.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (prompt.description && prompt.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading && prompts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando prompts do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8" />
            Gerenciamento de Prompts do Sistema
          </h1>
          <p className="text-muted-foreground mt-2">
            Edite e gerencie os prompts do sistema e das escolas
          </p>
        </div>
        <Button onClick={fetchPrompts} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar prompts: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="search">Buscar:</Label>
          <Input
            id="search"
            placeholder="Buscar por módulo, texto ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="filter">Tipo:</Label>
          <Select value={filterType} onValueChange={(value: 'all' | 'system' | 'school') => setFilterType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
              <SelectItem value="school">Escolas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Badge variant="outline">
          {filteredPrompts.length} de {prompts.length} prompts
        </Badge>
      </div>

      {/* Prompts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPrompts.map((prompt) => (
          <Card key={prompt.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {prompt.type === 'system' ? (
                      <Settings className="h-5 w-5 text-blue-500" />
                    ) : (
                      <School className="h-5 w-5 text-green-500" />
                    )}
                    {prompt.module}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={prompt.isActive ? 'default' : 'secondary'}>
                      {prompt.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="outline">
                      {prompt.type === 'system' ? 'Sistema' : 'Escola'}
                    </Badge>
                    {prompt.school && (
                      <Badge variant="outline" className="text-green-600">
                        {prompt.school}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(prompt)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(prompt.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prompt.description && (
                  <div>
                    <Label className="text-sm font-medium">Descrição:</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {prompt.description}
                    </p>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium">Prompt:</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {prompt.text}
                    </p>
                  </div>
                </div>

                {prompt.type === 'system' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">Temperatura:</Label>
                      <p>{prompt.temperature || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Max Tokens:</Label>
                      <p>{prompt.maxTokens || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Tone:</Label>
                      <p>{prompt.tone || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Atualizado:</Label>
                      <p>{formatDate(prompt.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrompts.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Nenhum prompt encontrado
          </h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros de busca
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {editingPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  Editar Prompt: {editingPrompt.module}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setEditingPrompt(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do prompt..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={editData.isActive}
                      onCheckedChange={(checked) => setEditData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="isActive">Ativo</Label>
                  </div>
                </div>

                {editingPrompt.type === 'system' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="temperature">Temperatura</Label>
                      <Input
                        id="temperature"
                        type="number"
                        min="0"
                        max="20"
                        value={editData.temperature}
                        onChange={(e) => setEditData(prev => ({ ...prev, temperature: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxTokens">Max Tokens</Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        value={editData.maxTokens}
                        onChange={(e) => setEditData(prev => ({ ...prev, maxTokens: Number(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxCompletionTokens">Max Completion Tokens</Label>
                      <Input
                        id="maxCompletionTokens"
                        type="number"
                        value={editData.maxCompletionTokens}
                        onChange={(e) => setEditData(prev => ({ ...prev, maxCompletionTokens: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                )}

                {editingPrompt.type === 'system' && (
                  <div>
                    <Label htmlFor="tone">Tom</Label>
                    <Select value={editData.tone} onValueChange={(value) => setEditData(prev => ({ ...prev, tone: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Profissional</SelectItem>
                        <SelectItem value="friendly">Amigável</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="academic">Acadêmico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="text">Texto do Prompt</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showPreview ? 'Ocultar Preview' : 'Mostrar Preview'}
                    </Button>
                  </div>
                  <Textarea
                    id="text"
                    value={editData.text}
                    onChange={(e) => setEditData(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Digite o texto do prompt..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                  {showPreview && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                      <Label className="text-sm font-medium mb-2 block">Preview:</Label>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {editData.text}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingPrompt(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


