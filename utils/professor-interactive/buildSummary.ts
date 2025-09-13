interface LessonStep {
  type: 'explanation' | 'question' | 'example' | 'feedback';
  content: string;
  question?: string;
}

interface LessonSummary {
  keyPoints: string[];
  performance: {
    accuracy: number;
    timeSpent: number;
    totalQuestions: number;
    correctAnswers: number;
  };
  recommendations: string[];
}

export function buildSummary(
  steps: LessonStep[], 
  performance: {
    accuracy: number;
    timeSpent: number;
    totalQuestions: number;
    correctAnswers: number;
  }
): LessonSummary {
  // Extract key points from explanation steps
  const keyPoints = steps
    .filter(step => step.type === 'explanation')
    .map(step => step.content)
    .slice(0, 5); // Limit to 5 key points for clarity
  
  // Generate recommendations based on performance
  const recommendations: string[] = [];
  
  if (performance.accuracy >= 80) {
    recommendations.push('Excelente desempenho! Continue praticando para manter o nível.');
    recommendations.push('Considere explorar tópicos mais avançados relacionados ao tema.');
  } else if (performance.accuracy >= 60) {
    recommendations.push('Bom desempenho! Revise os conceitos que ainda não dominou completamente.');
    recommendations.push('Pratique mais exercícios similares para consolidar o aprendizado.');
  } else {
    recommendations.push('Recomendamos revisar o conteúdo antes de prosseguir.');
    recommendations.push('Considere estudar os conceitos básicos novamente.');
  }
  
  // Add time-based recommendations
  if (performance.timeSpent < 300) { // Less than 5 minutes
    recommendations.push('Você completou rapidamente! Considere revisar o conteúdo com mais calma.');
  } else if (performance.timeSpent > 1800) { // More than 30 minutes
    recommendations.push('Você levou tempo para completar. Isso é normal para conteúdos complexos.');
  }
  
  return {
    keyPoints,
    performance,
    recommendations
  };
}

export function generateSummaryText(summary: LessonSummary): string {
  const { keyPoints, performance, recommendations } = summary;
  
  let summaryText = `## Resumo da Aula\n\n`;
  
  if (keyPoints.length > 0) {
    summaryText += `### Pontos Principais:\n`;
    keyPoints.forEach((point, index) => {
      summaryText += `${index + 1}. ${point}\n`;
    });
    summaryText += `\n`;
  }
  
  summaryText += `### Seu Desempenho:\n`;
  summaryText += `- Precisão: ${performance.accuracy}%\n`;
  summaryText += `- Tempo gasto: ${Math.floor(performance.timeSpent / 60)} minutos\n`;
  summaryText += `- Questões corretas: ${performance.correctAnswers}/${performance.totalQuestions}\n\n`;
  
  if (recommendations.length > 0) {
    summaryText += `### Recomendações:\n`;
    recommendations.forEach((rec, index) => {
      summaryText += `${index + 1}. ${rec}\n`;
    });
  }
  
  return summaryText;
}
