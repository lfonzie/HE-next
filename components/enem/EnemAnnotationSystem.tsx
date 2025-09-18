'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MessageSquare,
  Highlighter,
  PenTool,
  Bookmark,
  Tag,
  Search,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit,
  Save,
  X,
  Plus,
  Eye,
  EyeOff,
  Star,
  Clock,
  User,
  Share2,
  Copy,
  Archive,
  Flag,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Target
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Annotation Types
type AnnotationType = 'note' | 'highlight' | 'drawing' | 'bookmark' | 'tag'

// Annotation Interface
interface Annotation {
  id: string
  type: AnnotationType
  content: string
  position?: {
    x: number
    y: number
    width?: number
    height?: number
  }
  questionId: string
  questionIndex: number
  timestamp: Date
  userId?: string
  tags: string[]
  isPrivate: boolean
  isShared: boolean
  color?: string
  priority: 'low' | 'medium' | 'high'
  category: 'study' | 'review' | 'doubt' | 'insight' | 'reminder'
}

// Drawing Tool Interface
interface DrawingTool {
  type: 'pen' | 'highlighter' | 'eraser' | 'text'
  color: string
  size: number
  opacity: number
}

export function EnemAnnotationSystem({
  questionId,
  questionIndex,
  className = ''
}: {
  questionId: string
  questionIndex: number
  className?: string
}) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [activeTab, setActiveTab] = useState<'notes' | 'highlights' | 'drawings' | 'bookmarks'>('notes')
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [newAnnotation, setNewAnnotation] = useState('')
  const [newTag, setNewTag] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showPrivateOnly, setShowPrivateOnly] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingTool, setDrawingTool] = useState<DrawingTool>({
    type: 'pen',
    color: '#000000',
    size: 2,
    opacity: 1
  })
  
  const { toast } = useToast()

  // Load annotations from localStorage
  useEffect(() => {
    const savedAnnotations = localStorage.getItem(`enem-annotations-${questionId}`)
    if (savedAnnotations) {
      try {
        const parsed = JSON.parse(savedAnnotations)
        setAnnotations(parsed.map((ann: any) => ({
          ...ann,
          timestamp: new Date(ann.timestamp)
        })))
      } catch (error) {
        console.error('Failed to load annotations:', error)
      }
    }
  }, [questionId])

  // Save annotations to localStorage
  const saveAnnotations = useCallback(() => {
    localStorage.setItem(`enem-annotations-${questionId}`, JSON.stringify(annotations))
  }, [annotations, questionId])

  useEffect(() => {
    saveAnnotations()
  }, [saveAnnotations])

  // Create new annotation
  const createAnnotation = useCallback((type: AnnotationType, content: string, options: Partial<Annotation> = {}) => {
    const annotation: Annotation = {
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      questionId,
      questionIndex,
      timestamp: new Date(),
      tags: [],
      isPrivate: false,
      isShared: false,
      priority: 'medium',
      category: 'study',
      ...options
    }
    
    setAnnotations(prev => [...prev, annotation])
    setNewAnnotation('')
    
    toast({
      title: '✅ Anotação criada',
      description: 'Sua anotação foi salva com sucesso!',
    })
  }, [questionId, questionIndex, toast])

  // Update annotation
  const updateAnnotation = useCallback((id: string, updates: Partial<Annotation>) => {
    setAnnotations(prev => prev.map(ann => 
      ann.id === id ? { ...ann, ...updates } : ann
    ))
    setIsEditing(null)
    setEditingContent('')
    
    toast({
      title: '✅ Anotação atualizada',
      description: 'Sua anotação foi atualizada com sucesso!',
    })
  }, [toast])

  // Delete annotation
  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id))
    
    toast({
      title: '🗑️ Anotação removida',
      description: 'A anotação foi removida com sucesso!',
    })
  }, [toast])

  // Add tag to annotation
  const addTag = useCallback((annotationId: string, tag: string) => {
    if (!tag.trim()) return
    
    setAnnotations(prev => prev.map(ann => 
      ann.id === annotationId 
        ? { ...ann, tags: [...ann.tags, tag.trim()] }
        : ann
    ))
    setNewTag('')
  }, [])

  // Remove tag from annotation
  const removeTag = useCallback((annotationId: string, tag: string) => {
    setAnnotations(prev => prev.map(ann => 
      ann.id === annotationId 
        ? { ...ann, tags: ann.tags.filter(t => t !== tag) }
        : ann
    ))
  }, [])

  // Filter annotations
  const filteredAnnotations = annotations.filter(ann => {
    const matchesSearch = !searchQuery || 
      ann.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = filterCategory === 'all' || ann.category === filterCategory
    const matchesPrivacy = !showPrivateOnly || ann.isPrivate
    
    return matchesSearch && matchesCategory && matchesPrivacy
  })

  // Drawing functions
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawingTool.type === 'eraser') return
    
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.strokeStyle = drawingTool.color
    ctx.lineWidth = drawingTool.size
    ctx.globalAlpha = drawingTool.opacity
    ctx.lineCap = 'round'
  }, [drawingTool])

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.lineTo(x, y)
    ctx.stroke()
  }, [isDrawing])

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return
    
    setIsDrawing(false)
    
    // Save drawing as annotation
    const canvas = canvasRef.current
    if (!canvas) return
    
    const dataURL = canvas.toDataURL()
    createAnnotation('drawing', dataURL, {
      category: 'study',
      priority: 'medium'
    })
    
    // Clear canvas
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [isDrawing, createAnnotation])

  // Export annotations
  const exportAnnotations = useCallback(() => {
    const exportData = {
      questionId,
      questionIndex,
      annotations: annotations.map(ann => ({
        ...ann,
        timestamp: ann.timestamp.toISOString()
      })),
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `enem-annotations-${questionId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: '📥 Anotações exportadas',
      description: 'Suas anotações foram salvas em arquivo JSON!',
    })
  }, [questionId, questionIndex, annotations, toast])

  // Import annotations
  const importAnnotations = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.annotations && Array.isArray(data.annotations)) {
          setAnnotations(prev => [...prev, ...data.annotations])
          toast({
            title: '📤 Anotações importadas',
            description: `${data.annotations.length} anotações foram importadas!`,
          })
        }
      } catch (error) {
        toast({
          title: '❌ Erro na importação',
          description: 'Arquivo inválido ou corrompido.',
          variant: 'destructive',
        })
      }
    }
    reader.readAsText(file)
  }, [toast])

  // Render notes tab
  const renderNotesTab = () => (
    <div className="space-y-4">
      {/* New Note Input */}
      <div className="space-y-2">
        <Textarea
          placeholder="Digite sua anotação aqui..."
          value={newAnnotation}
          onChange={(e) => setNewAnnotation(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">Todas as categorias</option>
              <option value="study">Estudo</option>
              <option value="review">Revisão</option>
              <option value="doubt">Dúvida</option>
              <option value="insight">Insight</option>
              <option value="reminder">Lembrete</option>
            </select>
          </div>
          <Button
            onClick={() => createAnnotation('note', newAnnotation, { category: filterCategory as any })}
            disabled={!newAnnotation.trim()}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {filteredAnnotations
          .filter(ann => ann.type === 'note')
          .map(annotation => (
            <Card key={annotation.id} className="shadow-sm">
              <CardContent className="pt-4">
                {isEditing === annotation.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Nova tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addTag(annotation.id, newTag)
                            }
                          }}
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => addTag(annotation.id, newTag)}
                          disabled={!newTag.trim()}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateAnnotation(annotation.id, { content: editingContent })}
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditing(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <p className="text-gray-800 flex-1">{annotation.content}</p>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setIsEditing(annotation.id)
                            setEditingContent(annotation.content)
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAnnotation(annotation.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {annotation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {annotation.tags.map(tag => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(annotation.id, tag)}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {annotation.timestamp.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            annotation.priority === 'high' ? 'border-red-300 text-red-700' :
                            annotation.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                            'border-green-300 text-green-700'
                          }`}
                        >
                          {annotation.priority}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {annotation.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )

  // Render highlights tab
  const renderHighlightsTab = () => (
    <div className="space-y-4">
      <div className="text-center text-gray-500 py-8">
        <Highlighter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Selecione texto na questão para criar destaques</p>
        <p className="text-sm">Os destaques serão salvos automaticamente</p>
      </div>
      
      {/* Highlights List */}
      <div className="space-y-3">
        {filteredAnnotations
          .filter(ann => ann.type === 'highlight')
          .map(annotation => (
            <Card key={annotation.id} className="shadow-sm">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="text-gray-800 flex-1">{annotation.content}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAnnotation(annotation.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {annotation.timestamp.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )

  // Render drawings tab
  const renderDrawingsTab = () => (
    <div className="space-y-4">
      {/* Drawing Tools */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium">Ferramentas:</span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={drawingTool.type === 'pen' ? 'default' : 'outline'}
            onClick={() => setDrawingTool(prev => ({ ...prev, type: 'pen' }))}
          >
            <PenTool className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={drawingTool.type === 'highlighter' ? 'default' : 'outline'}
            onClick={() => setDrawingTool(prev => ({ ...prev, type: 'highlighter' }))}
          >
            <Highlighter className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={drawingTool.type === 'eraser' ? 'default' : 'outline'}
            onClick={() => setDrawingTool(prev => ({ ...prev, type: 'eraser' }))}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm">Cor:</span>
          <input
            type="color"
            value={drawingTool.color}
            onChange={(e) => setDrawingTool(prev => ({ ...prev, color: e.target.value }))}
            className="w-8 h-8 rounded border"
          />
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm">Tamanho:</span>
          <input
            type="range"
            min="1"
            max="10"
            value={drawingTool.size}
            onChange={(e) => setDrawingTool(prev => ({ ...prev, size: parseInt(e.target.value) }))}
            className="w-20"
          />
        </div>
      </div>

      {/* Drawing Canvas */}
      <div className="border rounded-lg p-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border rounded cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>

      {/* Drawings List */}
      <div className="space-y-3">
        {filteredAnnotations
          .filter(ann => ann.type === 'drawing')
          .map(annotation => (
            <Card key={annotation.id} className="shadow-sm">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <img
                    src={annotation.content}
                    alt="Drawing"
                    className="max-w-full h-auto rounded border"
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{annotation.timestamp.toLocaleString()}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAnnotation(annotation.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )

  // Render bookmarks tab
  const renderBookmarksTab = () => (
    <div className="space-y-4">
      <div className="text-center text-gray-500 py-8">
        <Bookmark className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Use o botão de marcar para criar favoritos</p>
        <p className="text-sm">Os favoritos aparecerão aqui</p>
      </div>
      
      {/* Bookmarks List */}
      <div className="space-y-3">
        {filteredAnnotations
          .filter(ann => ann.type === 'bookmark')
          .map(annotation => (
            <Card key={annotation.id} className="shadow-sm">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="text-gray-800 flex-1">{annotation.content}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAnnotation(annotation.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {annotation.timestamp.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Sistema de Anotações
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportAnnotations}
              >
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={importAnnotations}
                className="hidden"
                id="import-annotations"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('import-annotations')?.click()}
              >
                <Upload className="h-4 w-4 mr-1" />
                Importar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filter */}
      <Card className="shadow-md">
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar anotações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showPrivateOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowPrivateOnly(!showPrivateOnly)}
              >
                {showPrivateOnly ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPrivateOnly ? 'Privadas' : 'Todas'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Notas
          </TabsTrigger>
          <TabsTrigger value="highlights" className="flex items-center gap-2">
            <Highlighter className="h-4 w-4" />
            Destaques
          </TabsTrigger>
          <TabsTrigger value="drawings" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            Desenhos
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Favoritos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="space-y-4">
          {renderNotesTab()}
        </TabsContent>

        <TabsContent value="highlights" className="space-y-4">
          {renderHighlightsTab()}
        </TabsContent>

        <TabsContent value="drawings" className="space-y-4">
          {renderDrawingsTab()}
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-4">
          {renderBookmarksTab()}
        </TabsContent>
      </Tabs>

      {/* Statistics */}
      <Card className="shadow-md">
        <CardContent className="pt-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {annotations.filter(ann => ann.type === 'note').length}
              </div>
              <div className="text-sm text-gray-600">Notas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {annotations.filter(ann => ann.type === 'highlight').length}
              </div>
              <div className="text-sm text-gray-600">Destaques</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {annotations.filter(ann => ann.type === 'drawing').length}
              </div>
              <div className="text-sm text-gray-600">Desenhos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {annotations.filter(ann => ann.type === 'bookmark').length}
              </div>
              <div className="text-sm text-gray-600">Favoritos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

