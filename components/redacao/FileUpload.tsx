'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  Camera, 
  Image as ImageIcon, 
  X, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useNotifications } from '@/components/providers/NotificationProvider'
import { CameraCapture } from './CameraCapture'

interface FileUploadProps {
  onTextExtracted: (text: string, wordCount: number) => void
  onFileProcessed: (fileName: string, fileSize: number) => void
}

interface ProcessedFile {
  fileName: string
  fileSize: number
  wordCount: number
  text: string
}

export function FileUpload({ onTextExtracted, onFileProcessed }: FileUploadProps) {
  const { addNotification } = useNotifications()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedFile, setProcessedFile] = useState<ProcessedFile | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [showCameraCapture, setShowCameraCapture] = useState(false)

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return

    // Validar tipo de arquivo
    const allowedTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'image/jpeg',
      'image/png',
      'image/webp'
    ]

    if (!allowedTypes.includes(file.type)) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Tipo de arquivo não suportado. Use DOC, DOCX, TXT, MD ou imagens.'
      })
      return
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Arquivo muito grande. Máximo 10MB.'
      })
      return
    }

    setIsProcessing(true)
    addNotification({
      type: 'info',
      title: 'Processando',
      message: 'Extraindo texto do arquivo...'
    })

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/redacao/process-file', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao processar arquivo')
      }

      const result = await response.json()
      
      setProcessedFile({
        fileName: result.fileName,
        fileSize: result.fileSize,
        wordCount: result.wordCount,
        text: result.text
      })

      onTextExtracted(result.text, result.wordCount)
      onFileProcessed(result.fileName, result.fileSize)

      addNotification({
        type: 'success',
        title: 'Sucesso',
        message: `Texto extraído com sucesso! ${result.wordCount} palavras encontradas.`
      })

    } catch (error) {
      console.error('Erro ao processar arquivo:', error)
      addNotification({
        type: 'error',
        title: 'Erro',
        message: error instanceof Error ? error.message : 'Falha ao processar arquivo'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [addNotification, onTextExtracted, onFileProcessed])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleCameraInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const clearProcessedFile = () => {
    setProcessedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />
      case 'txt':
      case 'md':
        return <FileText className="h-5 w-5 text-gray-500" />
      default:
        return <ImageIcon className="h-5 w-5 text-green-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Upload de Arquivo ou Foto
        </CardTitle>
        <CardDescription>
          Envie um arquivo (PDF, DOC, DOCX, TXT, MD) ou tire uma foto da sua redação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Área de Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Escolher Arquivo</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowCameraCapture(true)}
                disabled={isProcessing}
                className="flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>Tirar Foto</span>
              </Button>
            </div>
            
            <p className="text-sm text-gray-500">
              Arraste um arquivo aqui ou clique nos botões acima
            </p>
            
            <div className="text-xs text-gray-400 space-y-1">
              <p><strong>Formatos suportados:</strong> DOC, DOCX, TXT, MD, JPG, PNG, WEBP</p>
              <p><strong>Tamanho máximo:</strong> 10MB</p>
            </div>
          </div>
        </div>

        {/* Inputs ocultos */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".doc,.docx,.txt,.md,.jpg,.jpeg,.png,.webp"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraInputChange}
          className="hidden"
        />

        {/* Status de processamento */}
        {isProcessing && (
          <div className="flex items-center justify-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-blue-600">Processando arquivo...</span>
          </div>
        )}

        {/* Arquivo processado */}
        {processedFile && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    {getFileIcon(processedFile.fileName)}
                    <span className="font-medium text-green-800 dark:text-green-200">
                      {processedFile.fileName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-green-700 dark:text-green-300">
                    <span>{formatFileSize(processedFile.fileSize)}</span>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      {processedFile.wordCount} palavras
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearProcessedFile}
                className="text-green-600 hover:text-green-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Modal de captura de foto */}
      {showCameraCapture && (
        <CameraCapture
          onImageCaptured={handleFileSelect}
          onClose={() => setShowCameraCapture(false)}
        />
      )}
    </Card>
  )
}
