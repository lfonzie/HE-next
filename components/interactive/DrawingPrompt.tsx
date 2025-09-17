'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Palette, Eraser, Undo, Download, Upload, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface DrawingPromptProps {
  prompt: string
  onSubmit: (drawingData: string) => void
  timeLimit?: number
  allowUpload?: boolean
  showColorPicker?: boolean
  brushSizes?: number[]
}

export default function DrawingPrompt({
  prompt,
  onSubmit,
  timeLimit = 0,
  allowUpload = true,
  showColorPicker = true,
  brushSizes = [2, 5, 10, 15]
}: DrawingPromptProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [currentBrushSize, setCurrentBrushSize] = useState(5)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [isCompleted, setIsCompleted] = useState(false)
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'
  ]

  // Timer effect
  useEffect(() => {
    if (timeLimit > 0 && !isCompleted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeLimit, isCompleted])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 800
    canvas.height = 600

    // Set initial styles
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = currentColor
    ctx.lineWidth = currentBrushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Save initial state
    saveToHistory()
  }, [])

  const saveToHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const newHistory = drawingHistory.slice(0, historyIndex + 1)
    newHistory.push(imageData)
    setDrawingHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCompleted) return
    
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isCompleted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    saveToHistory()
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas || isCompleted) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveToHistory()
  }

  const undo = () => {
    if (historyIndex <= 0 || isCompleted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setHistoryIndex(prev => prev - 1)
    const imageData = drawingHistory[historyIndex - 1]
    ctx.putImageData(imageData, 0, 0)
  }

  const downloadDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'drawing.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || isCompleted) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Clear canvas
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw uploaded image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        saveToHistory()
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (isCompleted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const drawingData = canvas.toDataURL()
    setIsCompleted(true)
    onSubmit(drawingData)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Atividade de Desenho
          </CardTitle>
          {timeLimit > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span>{formatTime(timeLeft)}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prompt */}
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">{prompt}</h3>
          <p className="text-gray-600">Use as ferramentas abaixo para criar seu desenho</p>
        </div>

        {/* Tools */}
        <div className="flex flex-wrap items-center gap-4 justify-center">
          {/* Color Picker */}
          {showColorPicker && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Cor:</span>
              <div className="flex gap-1">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setCurrentColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      currentColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    disabled={isCompleted}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Brush Size */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Pincel:</span>
            <div className="flex gap-1">
              {brushSizes.map(size => (
                <button
                  key={size}
                  onClick={() => setCurrentBrushSize(size)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs ${
                    currentBrushSize === size ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  disabled={isCompleted}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={undo}
              disabled={historyIndex <= 0 || isCompleted}
              variant="outline"
              size="sm"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              onClick={clearCanvas}
              disabled={isCompleted}
              variant="outline"
              size="sm"
            >
              <Eraser className="h-4 w-4" />
            </Button>
            <Button
              onClick={downloadDrawing}
              disabled={isCompleted}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4" />
            </Button>
            {allowUpload && (
              <label className="cursor-pointer">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  disabled={isCompleted}
                >
                  <span>
                    <Upload className="h-4 w-4" />
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex justify-center">
          <motion.canvas
            ref={canvasRef}
            className="border-2 border-gray-300 rounded-lg cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{
              backgroundColor: '#ffffff',
              cursor: isCompleted ? 'not-allowed' : 'crosshair'
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={isCompleted}
            size="lg"
            className="min-w-32"
          >
            {isCompleted ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Concluído
              </>
            ) : (
              'Enviar Desenho'
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-gray-600">
          <p>💡 Dica: Use diferentes cores e tamanhos de pincel para criar um desenho detalhado</p>
        </div>
      </CardContent>
    </Card>
  )
}
