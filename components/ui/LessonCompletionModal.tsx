'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Printer, 
  RotateCcw, 
  Plus, 
  X, 
  Trophy, 
  Clock, 
  Star,
  CheckCircle 
} from 'lucide-react'
import { toast } from 'sonner'

interface LessonCompletionModalProps {
  isOpen: boolean
  onClose: () => void
  onRestart: () => void
  onNewLesson: () => void
  lessonData: {
    title: string
    totalPoints: number
    totalTimeSpent: number
    stageResults: Array<{
      stageIndex: number
      result: any
      timeSpent: number
      pointsEarned: number
    }>
  }
}

export default function LessonCompletionModal({
  isOpen,
  onClose,
  onRestart,
  onNewLesson,
  lessonData
}: LessonCompletionModalProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      // Create a printable version of the lesson
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        const printContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${lessonData.title} - Resumo da Aula</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px; 
                  line-height: 1.6;
                  color: #333;
                }
                .header { 
                  text-align: center; 
                  border-bottom: 2px solid #3b82f6; 
                  padding-bottom: 20px; 
                  margin-bottom: 30px;
                }
                .stats { 
                  display: flex; 
                  justify-content: space-around; 
                  margin: 20px 0; 
                  padding: 20px; 
                  background: #f8fafc; 
                  border-radius: 8px;
                }
                .stat-item { 
                  text-align: center; 
                }
                .stat-value { 
                  font-size: 24px; 
                  font-weight: bold; 
                  color: #3b82f6; 
                }
                .stat-label { 
                  font-size: 14px; 
                  color: #666; 
                }
                .completion-message {
                  text-align: center;
                  padding: 30px;
                  background: #f0f9ff;
                  border-radius: 8px;
                  margin: 20px 0;
                }
                .footer {
                  margin-top: 40px;
                  text-align: center;
                  font-size: 12px;
                  color: #666;
                  border-top: 1px solid #e5e7eb;
                  padding-top: 20px;
                }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${lessonData.title}</h1>
                <p>Resumo da Aula Concluída</p>
              </div>
              
              <div class="completion-message">
                <h2>🎉 Parabéns! Aula Concluída com Sucesso!</h2>
                <p>Você completou todos os exercícios e atividades desta aula.</p>
              </div>
              
              <div class="stats">
                <div class="stat-item">
                  <div class="stat-value">${lessonData.totalPoints}</div>
                  <div class="stat-label">Pontos Conquistados</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${Math.floor(lessonData.totalTimeSpent / 60000)}min</div>
                  <div class="stat-label">Tempo Gasto</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">${lessonData.stageResults.length}</div>
                  <div class="stat-label">Etapas Completadas</div>
                </div>
              </div>
              
              <div class="footer">
                <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
                <p>HubEdu.ia - Sistema de Ensino Inteligente</p>
              </div>
            </body>
          </html>
        `
        
        printWindow.document.write(printContent)
        printWindow.document.close()
        
        // Wait for content to load, then print
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 500)
        
        toast.success('Impressão iniciada!')
      }
    } catch (error) {
      console.error('Erro ao imprimir:', error)
      toast.error('Erro ao preparar impressão')
    } finally {
      setIsPrinting(false)
    }
  }

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-md mx-auto">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-2xl font-bold text-green-800 mb-2">
                      🎉 Aula Concluída!
                    </CardTitle>
                    <p className="text-gray-600 text-sm">
                      {lessonData.title}
                    </p>
                  </div>
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {lessonData.totalPoints}
                    </div>
                    <div className="text-xs text-gray-600">Pontos</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {formatTime(lessonData.totalTimeSpent)}
                    </div>
                    <div className="text-xs text-gray-600">Tempo</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <CheckCircle className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      {lessonData.stageResults.length}
                    </div>
                    <div className="text-xs text-gray-600">Etapas</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handlePrint}
                    disabled={isPrinting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    {isPrinting ? 'Preparando...' : 'Imprimir Resumo'}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      onRestart()
                      onClose()
                    }}
                    variant="outline"
                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Refazer Aula
                  </Button>
                  
                  <Button
                    onClick={() => {
                      onNewLesson()
                      onClose()
                    }}
                    variant="outline"
                    className="w-full border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Aula
                  </Button>
                </div>

                {/* Completion Message */}
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700">
                    Parabéns pelo seu desempenho! Continue assim para alcançar seus objetivos educacionais.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}



