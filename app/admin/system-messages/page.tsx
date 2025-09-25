// app/admin/system-messages/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Save, RefreshCw, CheckCircle, AlertCircle, Search } from 'lucide-react'

interface SystemMessageConfig {
  name: string
  description: string
  system_prompt: string
  temperature: number
  max_tokens: number
  max_completion_tokens: number
  tone: string
  is_active: boolean
}

interface SystemMessagesConfig {
  chat_modules?: { [module: string]: SystemMessageConfig }
  classification?: { [module: string]: SystemMessageConfig }
  api_routes?: { [module: string]: SystemMessageConfig }
  interactive_lessons?: { [module: string]: SystemMessageConfig }
  specialized_features?: { [module: string]: SystemMessageConfig }
}

export default function SystemMessagesPage() {
  const [config, setConfig] = useState<SystemMessagesConfig>({})
  const [selectedModule, setSelectedModule] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Carregar configurações
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/system-messages')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      } else {
        throw new Error('Erro ao carregar configurações')
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' })
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/system-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' })
        // Recarregar cache
        await fetch('/api/admin/system-messages/reload', { method: 'POST' })
      } else {
        throw new Error('Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' })
    } finally {
      setSaving(false)
    }
  }

  const updateModule = (category: string, module: string, updates: Partial<SystemMessageConfig>) => {
    setConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof SystemMessagesConfig],
        [module]: {
          ...prev[category as keyof SystemMessagesConfig]?.[module],
          ...updates
        }
      }
    }))
  }

  const allModules = Object.keys(config).reduce((acc, category) => {
    const categoryConfig = config[category as keyof SystemMessagesConfig]
    if (categoryConfig) {
      Object.keys(categoryConfig).forEach(module => {
        acc.push({ category, module, config: categoryConfig[module] })
      })
    }
    return acc
  }, [] as Array<{ category: string, module: string, config: SystemMessageConfig }>)

  // Filtrar módulos por categoria
  const filteredModules = allModules.filter(({ category }) => {
    if (selectedCategory === 'all') return true
    return category === selectedCategory
  })

  // Filtrar módulos por busca
  const searchResults = filteredModules.filter(({ module, config: moduleConfig }) => {
    if (!searchValue) return true
    const searchLower = searchValue.toLowerCase()
    return (
      module.toLowerCase().includes(searchLower) ||
      moduleConfig?.name.toLowerCase().includes(searchLower) ||
      moduleConfig?.description.toLowerCase().includes(searchLower) ||
      moduleConfig?.tone.toLowerCase().includes(searchLower)
    )
  })

  // Obter categorias disponíveis
  const categories = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'chat_modules', label: 'Módulos de Chat' },
    { value: 'classification', label: 'Classificação' },
    { value: 'api_routes', label: 'Rotas de API' },
    { value: 'interactive_lessons', label: 'Aulas Interativas' },
    { value: 'specialized_features', label: 'Funcionalidades Especializadas' }
  ]

  // Obter módulo selecionado
  const getSelectedModuleConfig = () => {
    if (!selectedModule) return null
    const [category, module] = selectedModule.split('-')
    return config[category as keyof SystemMessagesConfig]?.[module]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Messages</h1>
          <p className="text-muted-foreground">
            Gerencie os prompts específicos para cada módulo do chat
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadConfig}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Recarregar
          </Button>
          <Button
            onClick={saveConfig}
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

      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Seletor de Módulo */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Módulo</CardTitle>
          <CardDescription>
            Escolha um módulo para editar seus prompts e configurações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtro por Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category-filter">Filtrar por Categoria</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campo de Busca */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar Módulos</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Digite para buscar módulos..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Seletor de Módulo */}
          <div className="space-y-2">
            <Label htmlFor="module-select">Selecionar Módulo</Label>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um módulo..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {searchResults.map(({ category, module, config: moduleConfig }) => (
                  <SelectItem key={`${category}-${module}`} value={`${category}-${module}`}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span className="font-medium">{moduleConfig?.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {moduleConfig?.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge 
                          variant={moduleConfig?.is_active ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {moduleConfig?.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{allModules.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {allModules.filter(({ config: moduleConfig }) => moduleConfig?.is_active).length}
              </div>
              <div className="text-sm text-muted-foreground">Ativos</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{searchResults.length}</div>
              <div className="text-sm text-muted-foreground">Filtrados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor de Módulo */}
      {selectedModule && (() => {
        const moduleConfig = getSelectedModuleConfig()
        
        if (!moduleConfig) return null
        
        const [category, module] = selectedModule.split('-')
        
        return (
          <Card>
            <CardHeader>
              <CardTitle>Editar: {moduleConfig.name}</CardTitle>
              <CardDescription>
                <div className="mb-2">{moduleConfig.description}</div>
                <Badge variant="outline">{category}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={moduleConfig.name}
                    onChange={(e) => updateModule(category, module, { name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tone">Tom</Label>
                  <Input
                    id="tone"
                    value={moduleConfig.tone}
                    onChange={(e) => updateModule(category, module, { tone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={moduleConfig.description}
                  onChange={(e) => updateModule(category, module, { description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="system_prompt">System Prompt</Label>
                <Textarea
                  id="system_prompt"
                  value={moduleConfig.system_prompt}
                  onChange={(e) => updateModule(category, module, { system_prompt: e.target.value })}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={moduleConfig.temperature}
                    onChange={(e) => updateModule(category, module, { temperature: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_tokens">Max Tokens</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    value={moduleConfig.max_tokens}
                    onChange={(e) => updateModule(category, module, { max_tokens: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_completion_tokens">Max Completion Tokens</Label>
                  <Input
                    id="max_completion_tokens"
                    type="number"
                    value={moduleConfig.max_completion_tokens}
                    onChange={(e) => updateModule(category, module, { max_completion_tokens: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={moduleConfig.is_active}
                  onCheckedChange={(checked) => updateModule(category, module, { is_active: checked })}
                />
                <Label htmlFor="is_active">Módulo ativo</Label>
              </div>
            </CardContent>
          </Card>
        )
      })()}
    </div>
  )
}
