'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MODULE_CLASSIFICATION_PROMPT,
  VISUAL_CLASSIFICATION_PROMPT,
  TOPIC_EXTRACTION_PROMPT
} from '@/lib/system-prompts/classification'
import { 
  DEFAULT_SYSTEM_PROMPT,
  UNICODE_INSTRUCTIONS
} from '@/lib/system-prompts/common'
import { 
  TI_TROUBLESHOOTING_PROMPT,
  TI_HINT_PROMPT,
  TROUBLESHOOTING_STEPS_PROMPT
} from '@/lib/system-prompts/ti'
import { 
  LESSON_CREATION_PROMPT
} from '@/lib/system-prompts/lessons'
import { 
  STRUCTURED_LESSON_PROMPT
} from '@/lib/system-prompts/lessons-structured'
import { 
  PROFESSIONAL_PACING_LESSON_PROMPT
} from '@/lib/system-prompts/lessons-professional-pacing'
import { 
  HUBEDU_INTERACTIVE_BASE_PROMPT
} from '@/lib/system-prompts/hubedu-interactive'

interface PromptFile {
  id: string
  name: string
  category: string
  content: string
  description: string
  lastModified: string
  size: number
}

interface EditorProps {
  content: string
  onChange: (content: string) => void
  disabled?: boolean
}

// Componente de editor de texto avançado
function AdvancedTextEditor({ content, onChange, disabled = false }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [lineNumbers, setLineNumbers] = useState<string[]>([])
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })

  useEffect(() => {
    const lines = content.split('\n')
    const numbers = lines.map((_, index) => (index + 1).toString())
    setLineNumbers(numbers)
  }, [content])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    onChange(newContent)
    
    // Atualizar posição do cursor
    const textarea = e.target
    const cursorPos = textarea.selectionStart
    const textBeforeCursor = newContent.substring(0, cursorPos)
    const lines = textBeforeCursor.split('\n')
    const line = lines.length
    const column = lines[lines.length - 1].length + 1
    
    setCursorPosition({ line, column })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = e.target as HTMLTextAreaElement
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = content.substring(0, start) + '  ' + content.substring(end)
      onChange(newContent)
      
      // Restaurar posição do cursor
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  const insertText = (text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.substring(0, start) + text + content.substring(end)
    onChange(newContent)
    
    // Restaurar posição do cursor
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length
      textarea.focus()
    }, 0)
  }

  const formatText = () => {
    // Formatação básica do texto
    const formatted = content
      .replace(/\n\n\n+/g, '\n\n') // Remove linhas em branco excessivas
      .replace(/^\s+|\s+$/gm, '') // Remove espaços no início e fim das linhas
      .replace(/\n/g, '\n') // Garante quebras de linha consistentes
    
    onChange(formatted)
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => insertText('**')}
            disabled={disabled}
          >
            Bold
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => insertText('*')}
            disabled={disabled}
          >
            Italic
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => insertText('\n- ')}
            disabled={disabled}
          >
            List
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => insertText('\n1. ')}
            disabled={disabled}
          >
            Numbered
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => insertText('\n\n---\n')}
            disabled={disabled}
          >
            Divider
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={formatText}
            disabled={disabled}
          >
            Format
          </Button>
          <span className="text-sm text-gray-500">
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex">
        {/* Line numbers */}
        <div className="bg-gray-100 px-2 py-4 text-sm text-gray-500 font-mono select-none">
          {lineNumbers.map((num, index) => (
            <div key={index} className="h-5 leading-5">
              {num}
            </div>
          ))}
        </div>

        {/* Text area */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={`w-full h-96 p-4 border-0 resize-none focus:outline-none font-mono text-sm leading-5 ${
              disabled 
                ? 'bg-gray-50 cursor-not-allowed' 
                : 'bg-white'
            }`}
            placeholder="Digite o conteúdo do system prompt..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="bg-gray-50 border-t px-4 py-2 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>{content.length} caracteres</span>
          <span>{content.split('\n').length} linhas</span>
          <span>{content.split(' ').filter(word => word.length > 0).length} palavras</span>
        </div>
        <div>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  )
}

export function SystemPromptsEditor() {
  const [promptFiles, setPromptFiles] = useState<PromptFile[]>([])
  const [selectedFile, setSelectedFile] = useState<PromptFile | null>(null)
  const [editedContent, setEditedContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Carregar todos os prompts do sistema
  useEffect(() => {
    const loadPromptFiles = () => {
      const files: PromptFile[] = []

      // API Routes Prompts - Temporariamente desabilitado
      // API_ROUTE_KEYS.forEach(key => {
      //   files.push({
      //     id: `api-${key}`,
      //     name: `API Route: ${key}`,
      //     category: 'api-routes',
      //     content: API_ROUTE_SYSTEM_PROMPTS[key],
      //     description: `System prompt para rota de API: ${key}`,
      //     lastModified: new Date().toISOString(),
      //     size: API_ROUTE_SYSTEM_PROMPTS[key].length
      //   })
      // })

      // Module Prompts - Temporariamente desabilitado
      // MODULE_KEYS.forEach(key => {
      //   files.push({
      //     id: `module-${key}`,
      //     name: `Módulo: ${key}`,
      //     category: 'modules',
      //     content: MODULE_SYSTEM_PROMPTS[key],
      //     description: `System prompt para módulo: ${key}`,
      //     lastModified: new Date().toISOString(),
      //     size: MODULE_SYSTEM_PROMPTS[key].length
      //   })
      // })

      // Feature Prompts - Temporariamente desabilitado
      // FEATURE_KEYS.forEach(key => {
      //   files.push({
      //     id: `feature-${key}`,
      //     name: `Funcionalidade: ${key}`,
      //     category: 'features',
      //     content: FEATURE_SYSTEM_PROMPTS[key],
      //     description: `System prompt para funcionalidade: ${key}`,
      //     lastModified: new Date().toISOString(),
      //     size: FEATURE_SYSTEM_PROMPTS[key].length
      //   })
      // })

      // Specific Prompts - Temporariamente desabilitado
      const specificPrompts = [
        // {
        //   id: 'professor-interactive',
        //   name: 'Professor Interativo',
        //   category: 'specific',
        //   content: PROFESSOR_INTERACTIVE_PROMPT,
        //   description: 'Prompt para aulas interativas do professor',
        //   lastModified: new Date().toISOString(),
        //   size: PROFESSOR_INTERACTIVE_PROMPT.length
        // },
        // {
        //   id: 'enem-basic',
        //   name: 'ENEM Básico',
        //   category: 'specific',
        //   content: ENEM_SYSTEM_PROMPT,
        //   description: 'Prompt básico para questões ENEM',
        //   lastModified: new Date().toISOString(),
        //   size: ENEM_SYSTEM_PROMPT.length
        // },
        // {
        //   id: 'enem-enhanced',
        //   name: 'ENEM Avançado',
        //   category: 'specific',
        //   content: ENEM_SYSTEM_PROMPT_ENHANCED,
        //   description: 'Prompt avançado para questões ENEM',
        //   lastModified: new Date().toISOString(),
        //   size: ENEM_SYSTEM_PROMPT_ENHANCED.length
        // },
        // {
        //   id: 'support',
        //   name: 'Suporte',
        //   category: 'specific',
        //   content: SUPPORT_SYSTEM_PROMPT,
        //   description: 'Prompt para sistema de suporte',
        //   lastModified: new Date().toISOString(),
        //   size: SUPPORT_SYSTEM_PROMPT.length
        // },
        {
          id: 'module-classification',
          name: 'Classificação de Módulos',
          category: 'classification',
          content: MODULE_CLASSIFICATION_PROMPT,
          description: 'Prompt para classificação de módulos',
          lastModified: new Date().toISOString(),
          size: MODULE_CLASSIFICATION_PROMPT.length
        },
        {
          id: 'visual-classification',
          name: 'Classificação Visual',
          category: 'classification',
          content: VISUAL_CLASSIFICATION_PROMPT,
          description: 'Prompt para classificação visual',
          lastModified: new Date().toISOString(),
          size: VISUAL_CLASSIFICATION_PROMPT.length
        },
        {
          id: 'topic-extraction',
          name: 'Extração de Tópicos',
          category: 'classification',
          content: TOPIC_EXTRACTION_PROMPT,
          description: 'Prompt para extração de tópicos',
          lastModified: new Date().toISOString(),
          size: TOPIC_EXTRACTION_PROMPT.length
        },
        {
          id: 'default',
          name: 'Padrão',
          category: 'common',
          content: DEFAULT_SYSTEM_PROMPT,
          description: 'Prompt padrão do sistema',
          lastModified: new Date().toISOString(),
          size: DEFAULT_SYSTEM_PROMPT.length
        },
        {
          id: 'unicode-instructions',
          name: 'Instruções Unicode',
          category: 'common',
          content: UNICODE_INSTRUCTIONS,
          description: 'Instruções para uso de Unicode em matemática',
          lastModified: new Date().toISOString(),
          size: UNICODE_INSTRUCTIONS.length
        },
        {
          id: 'ti-troubleshooting',
          name: 'TI Troubleshooting',
          category: 'ti',
          content: TI_TROUBLESHOOTING_PROMPT,
          description: 'Prompt para troubleshooting TI',
          lastModified: new Date().toISOString(),
          size: TI_TROUBLESHOOTING_PROMPT.length
        },
        {
          id: 'ti-hint',
          name: 'TI Hint',
          category: 'ti',
          content: TI_HINT_PROMPT,
          description: 'Prompt para dicas TI',
          lastModified: new Date().toISOString(),
          size: TI_HINT_PROMPT.length
        },
        {
          id: 'troubleshooting-steps',
          name: 'Passos de Troubleshooting',
          category: 'ti',
          content: TROUBLESHOOTING_STEPS_PROMPT,
          description: 'Prompt para passos de troubleshooting',
          lastModified: new Date().toISOString(),
          size: TROUBLESHOOTING_STEPS_PROMPT.length
        },
        {
          id: 'lesson-creation',
          name: 'Criação de Lições',
          category: 'lessons',
          content: LESSON_CREATION_PROMPT,
          description: 'Prompt para criação de lições',
          lastModified: new Date().toISOString(),
          size: LESSON_CREATION_PROMPT.length
        },
        {
          id: 'lesson-structured',
          name: 'Lição Estruturada',
          category: 'lessons',
          content: STRUCTURED_LESSON_PROMPT,
          description: 'Prompt para lições estruturadas',
          lastModified: new Date().toISOString(),
          size: STRUCTURED_LESSON_PROMPT.length
        },
        {
          id: 'lesson-professional-pacing',
          name: 'Lição com Ritmo Profissional',
          category: 'lessons',
          content: PROFESSIONAL_PACING_LESSON_PROMPT,
          description: 'Prompt para lições com ritmo profissional',
          lastModified: new Date().toISOString(),
          size: PROFESSIONAL_PACING_LESSON_PROMPT.length
        },
        {
          id: 'hubedu-interactive',
          name: 'HubEdu Interativo',
          category: 'specific',
          content: HUBEDU_INTERACTIVE_BASE_PROMPT,
          description: 'Prompt para funcionalidades interativas do HubEdu',
          lastModified: new Date().toISOString(),
          size: HUBEDU_INTERACTIVE_BASE_PROMPT.length
        }
      ]

      files.push(...specificPrompts)
      setPromptFiles(files)
    }

    loadPromptFiles()
  }, [])

  const filteredFiles = promptFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [
    { value: 'all', label: 'Todos', count: promptFiles.length },
    { value: 'api-routes', label: 'Rotas de API', count: promptFiles.filter(f => f.category === 'api-routes').length },
    { value: 'modules', label: 'Módulos', count: promptFiles.filter(f => f.category === 'modules').length },
    { value: 'features', label: 'Funcionalidades', count: promptFiles.filter(f => f.category === 'features').length },
    { value: 'specific', label: 'Específicos', count: promptFiles.filter(f => f.category === 'specific').length },
    { value: 'classification', label: 'Classificação', count: promptFiles.filter(f => f.category === 'classification').length },
    { value: 'common', label: 'Comuns', count: promptFiles.filter(f => f.category === 'common').length },
    { value: 'ti', label: 'TI', count: promptFiles.filter(f => f.category === 'ti').length },
    { value: 'lessons', label: 'Lições', count: promptFiles.filter(f => f.category === 'lessons').length }
  ]

  const handleFileSelect = (file: PromptFile) => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('Você tem alterações não salvas. Deseja continuar sem salvar?')
      if (!confirmLeave) return
    }
    
    setSelectedFile(file)
    setEditedContent(file.content)
    setIsEditing(false)
    setHasUnsavedChanges(false)
  }

  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent)
    setHasUnsavedChanges(newContent !== selectedFile?.content)
  }

  const handleSave = () => {
    if (!selectedFile) return
    
    // Aqui você implementaria a lógica para salvar o prompt
    // Por enquanto, apenas atualizamos o estado local
    setPromptFiles(prev => prev.map(file => 
      file.id === selectedFile.id 
        ? { ...file, content: editedContent, lastModified: new Date().toISOString() }
        : file
    ))
    
    setSelectedFile(prev => prev ? { ...prev, content: editedContent, lastModified: new Date().toISOString() } : null)
    setIsEditing(false)
    setHasUnsavedChanges(false)
  }

  const handleCancel = () => {
    if (selectedFile) {
      setEditedContent(selectedFile.content)
    }
    setIsEditing(false)
    setHasUnsavedChanges(false)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar com lista de arquivos */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>System Prompts</CardTitle>
            <div className="space-y-4">
              {/* Filtros */}
              <div>
                <input
                  type="text"
                  placeholder="Buscar prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label} ({category.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredFiles.map(file => (
                <div
                  key={file.id}
                  onClick={() => handleFileSelect(file)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedFile?.id === file.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{file.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {file.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{file.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(file.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Editor principal */}
      <div className="lg:col-span-2">
        {selectedFile ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{selectedFile.name}</span>
                    {hasUnsavedChanges && (
                      <Badge variant="destructive" className="text-xs">
                        Não salvo
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{selectedFile.description}</p>
                </div>
                <div className="flex space-x-2">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                      Editar
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Informações do arquivo */}
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Categoria: <Badge variant="outline">{selectedFile.category}</Badge></span>
                  <span>Tamanho: {formatFileSize(selectedFile.size)}</span>
                  <span>Modificado: {new Date(selectedFile.lastModified).toLocaleString()}</span>
                </div>

                {/* Editor de texto avançado */}
                <AdvancedTextEditor
                  content={editedContent}
                  onChange={handleContentChange}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione um System Prompt
                </h3>
                <p className="text-gray-600">
                  Escolha um prompt da lista ao lado para visualizar e editar seu conteúdo.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}