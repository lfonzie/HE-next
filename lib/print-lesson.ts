import { printLessonImproved } from './print-lesson-improved'

/**
 * Função para imprimir uma aula completa
 * @param lessonData - Dados da aula a ser impressa
 */
export function printLesson(lessonData: {
  title: string
  objectives: string[]
  introduction: string
  stages: Array<{
    etapa: string
    type: string
    activity: any
    route: string
  }>
  summary?: string
  nextSteps?: string[]
  metadata?: {
    subject: string
    grade: string
    duration: string
    difficulty: string
    tags: string[]
  }
}) {
  // Usar a versão melhorada da função de impressão
  printLessonImproved(lessonData)
}