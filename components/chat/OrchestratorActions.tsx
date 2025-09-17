"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { OrchestratorAction, OrchestratorBlock } from '@/types'
import { 
  BookOpen, 
  FileText, 
  Play, 
  ExternalLink, 
  CheckCircle, 
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react'

interface OrchestratorActionsProps {
  actions?: OrchestratorAction[]
  blocks?: OrchestratorBlock[]
  onActionClick?: (action: OrchestratorAction) => void
  onBlockClick?: (block: OrchestratorBlock) => void
}

export function OrchestratorActions({ 
  actions = [], 
  blocks = [], 
  onActionClick, 
  onBlockClick 
}: OrchestratorActionsProps) {
  if (actions.length === 0 && blocks.length === 0) {
    return null
  }

  const handleActionClick = (action: OrchestratorAction) => {
    if (onActionClick) {
      onActionClick(action)
    } else {
      // Default behavior - could trigger a message or navigation
      console.log('Action clicked:', action)
    }
  }

  const handleBlockClick = (block: OrchestratorBlock) => {
    if (onBlockClick) {
      onBlockClick(block)
    } else {
      console.log('Block clicked:', block)
    }
  }

  const getActionIcon = (action: OrchestratorAction) => {
    switch (action.type) {
      case 'cta':
        if (action.module.includes('enem')) return <FileText className="h-4 w-4" />
        if (action.module.includes('aula')) return <BookOpen className="h-4 w-4" />
        return <Play className="h-4 w-4" />
      case 'link':
        return <ExternalLink className="h-4 w-4" />
      default:
        return <Play className="h-4 w-4" />
    }
  }

  const getBlockIcon = (block: OrchestratorBlock) => {
    switch (block.type) {
      case 'lesson_interactive':
        return <BookOpen className="h-5 w-5 text-blue-600" />
      case 'quiz':
        return <FileText className="h-5 w-5 text-green-600" />
      case 'media':
        return <ImageIcon className="h-5 w-5 text-purple-600" />
      case 'notice':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'checklist':
        return <CheckCircle className="h-5 w-5 text-orange-600" />
      default:
        return <Play className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-3 mt-4">
      {/* Blocks */}
      {blocks.map((block, index) => (
        <Card key={`block-${index}`} className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {getBlockIcon(block)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-sm">
                    {block.type === 'lesson_interactive' && 'Aula Interativa'}
                    {block.type === 'quiz' && 'Simulado ENEM'}
                    {block.type === 'media' && 'Conteúdo Visual'}
                    {block.type === 'notice' && 'Informação'}
                    {block.type === 'checklist' && 'Lista de Tarefas'}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {block.type}
                  </Badge>
                </div>
                
                {block.type === 'lesson_interactive' && (
                  <div className="text-sm text-gray-600">
                    <p>Aula com {block.meta?.passos || 8} slides interativos</p>
                    {block.meta?.tema && <p>Tema: {block.meta.tema}</p>}
                    {block.meta?.disciplina && <p>Disciplina: {block.meta.disciplina}</p>}
                  </div>
                )}
                
                {block.type === 'quiz' && (
                  <div className="text-sm text-gray-600">
                    <p>Simulado com {block.meta?.quantidade || 5} questões</p>
                    {block.meta?.area && <p>Área: {block.meta.area}</p>}
                    {block.meta?.enhanced && <Badge variant="outline" className="text-xs">Interativo</Badge>}
                  </div>
                )}
                
                {block.type === 'media' && block.items && (
                  <div className="text-sm text-gray-600">
                    <p>{block.items.length} item(s) de mídia encontrado(s)</p>
                  </div>
                )}
                
                {block.type === 'notice' && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{block.title}</p>
                    <p>{block.body}</p>
                  </div>
                )}
                
                {block.type === 'checklist' && block.items && (
                  <div className="text-sm text-gray-600">
                    <p>{block.items.length} item(s) na lista</p>
                    <ul className="mt-1 space-y-1">
                      {block.items.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className={item.done ? 'text-green-600' : 'text-gray-400'}>
                            {item.done ? '✓' : '○'}
                          </span>
                          <span className={item.done ? 'line-through text-gray-500' : ''}>
                            {item.text}
                          </span>
                        </li>
                      ))}
                      {block.items.length > 3 && (
                        <li className="text-gray-500">... e mais {block.items.length - 3}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Ações disponíveis:</h4>
          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <Button
                key={`action-${index}`}
                variant="outline"
                size="sm"
                onClick={() => handleActionClick(action)}
                className="flex items-center gap-2"
              >
                {getActionIcon(action)}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
