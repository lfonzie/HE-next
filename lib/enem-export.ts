import { PrismaClient } from '@prisma/client';
import { EnemExportData, EnemSession, EnemResponse, EnemScore, EnemItem } from '@/types/enem';

const prisma = new PrismaClient();

export interface ExportOptions {
  format: 'PDF' | 'CSV' | 'JSON';
  includeAnswers: boolean;
  includeExplanations: boolean;
  includeStatistics: boolean;
  includeSimilarQuestions: boolean;
}

export class EnemExportService {
  /**
   * Export session data in specified format
   */
  async exportSession(sessionId: string, options: ExportOptions): Promise<Buffer | string> {
    const exportData = await this.gatherExportData(sessionId);
    
    switch (options.format) {
      case 'PDF':
        return this.exportToPDF(exportData, options);
      case 'CSV':
        return this.exportToCSV(exportData, options);
      case 'JSON':
        return this.exportToJSON(exportData, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Gather all data needed for export
   */
  private async gatherExportData(sessionId: string): Promise<EnemExportData> {
    // Get session
    const session = await prisma.enem_session.findUnique({
      where: { session_id: sessionId }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Get responses
    const responses = await prisma.enem_response.findMany({
      where: { session_id: sessionId }
    });

    // Get score
    const score = await prisma.enem_score.findUnique({
      where: { session_id: sessionId }
    });

    // Get items
    const itemIds = responses.map(r => r.item_id);
    const items = await prisma.enem_item.findMany({
      where: { item_id: { in: itemIds } }
    });

    return {
      session: this.mapPrismaToEnemSession(session),
      responses: responses.map(this.mapPrismaToEnemResponse),
      score: score ? this.mapPrismaToEnemScore(score) : {} as EnemScore,
      items: items.map(this.mapPrismaToEnemItem),
      metadata: {
        export_date: new Date().toISOString(),
        format_version: '1.0',
        user_id: session.user_id
      }
    };
  }

  /**
   * Export to PDF format
   */
  private async exportToPDF(data: EnemExportData, options: ExportOptions): Promise<Buffer> {
    try {
      // Dynamic import to avoid SSR issues
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Cover page
    doc.setFontSize(24);
    doc.text('Relatório de Simulado ENEM', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    doc.setFontSize(16);
    doc.text(`Sessão: ${data.session.session_id}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.text(`Data: ${new Date(data.session.start_time).toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.text(`Modo: ${data.session.mode}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Score summary
    if (data.score) {
      doc.setFontSize(18);
      doc.text('Resumo de Pontuação', 20, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.text(`Pontuação Total: ${data.score.total_score.toFixed(1)}`, 20, yPosition);
      yPosition += 10;

      doc.text(`Estimativa TRI: ${data.score.tri_estimated.score.toFixed(0)}`, 20, yPosition);
      yPosition += 10;

      doc.text(`Intervalo de Confiança: ${data.score.tri_estimated.confidence_interval.lower.toFixed(0)} - ${data.score.tri_estimated.confidence_interval.upper.toFixed(0)}`, 20, yPosition);
      yPosition += 15;

      // Area scores
      doc.text('Pontuações por Área:', 20, yPosition);
      yPosition += 10;

      for (const [area, areaScore] of Object.entries(data.score.area_scores)) {
        doc.text(`${area}: ${areaScore.percentage.toFixed(1)}% (${areaScore.correct}/${areaScore.total})`, 30, yPosition);
        yPosition += 8;
      }
    }

    // Add new page for detailed results
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(18);
    doc.text('Resultados Detalhados', 20, yPosition);
    yPosition += 15;

    // Questions and answers
    doc.setFontSize(12);
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      const response = data.responses.find(r => r.item_id === item.item_id);

      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(`Questão ${i + 1} (${item.area})`, 20, yPosition);
      yPosition += 8;

      // Truncate long text
      const truncatedText = item.text.length > 100 ? item.text.substring(0, 100) + '...' : item.text;
      doc.text(truncatedText, 20, yPosition);
      yPosition += 8;

      if (response) {
        const isCorrect = response.is_correct ? '✓' : '✗';
        doc.text(`Sua resposta: ${response.selected_answer} ${isCorrect}`, 20, yPosition);
        yPosition += 8;
        doc.text(`Resposta correta: ${item.correct_answer}`, 20, yPosition);
        yPosition += 8;
        doc.text(`Tempo: ${response.time_spent}s`, 20, yPosition);
        yPosition += 12;
      } else {
        yPosition += 8;
      }
    }

    // Statistics page
    if (options.includeStatistics && data.score) {
      doc.addPage();
      yPosition = 20;

      doc.setFontSize(18);
      doc.text('Estatísticas Detalhadas', 20, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.text(`Tempo total: ${data.score.stats.total_time_spent}s`, 20, yPosition);
      yPosition += 8;
      doc.text(`Tempo médio por questão: ${data.score.stats.average_time_per_question.toFixed(1)}s`, 20, yPosition);
      yPosition += 15;

      doc.text('Desempenho por Tópico:', 20, yPosition);
      yPosition += 8;

      for (const [topic, accuracy] of Object.entries(data.score.stats.accuracy_by_topic)) {
        doc.text(`${topic}: ${(accuracy * 100).toFixed(1)}%`, 30, yPosition);
        yPosition += 6;
      }
    }

      return Buffer.from(doc.output('arraybuffer'));
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export to CSV format
   */
  private async exportToCSV(data: EnemExportData, options: ExportOptions): Promise<string> {
    const csvLines: string[] = [];
    
    // Session info
    csvLines.push('Tipo,Valor');
    csvLines.push(`Session ID,${data.session.session_id}`);
    csvLines.push(`Modo,${data.session.mode}`);
    csvLines.push(`Áreas,"${data.session.area.join(', ')}"`);
    csvLines.push(`Data Início,${new Date(data.session.start_time).toISOString()}`);
    csvLines.push(`Data Fim,${data.session.end_time ? new Date(data.session.end_time).toISOString() : 'N/A'}`);
    csvLines.push(`Status,${data.session.status}`);
    csvLines.push('');

    // Score summary
    if (data.score) {
      csvLines.push('Métrica,Valor');
      csvLines.push(`Pontuação Total,${data.score.total_score.toFixed(1)}`);
      csvLines.push(`Estimativa TRI,${data.score.tri_estimated.score.toFixed(0)}`);
      csvLines.push(`TRI Inferior,${data.score.tri_estimated.confidence_interval.lower.toFixed(0)}`);
      csvLines.push(`TRI Superior,${data.score.tri_estimated.confidence_interval.upper.toFixed(0)}`);
      csvLines.push(`Tempo Total,${data.score.stats.total_time_spent}`);
      csvLines.push(`Tempo Médio por Questão,${data.score.stats.average_time_per_question.toFixed(1)}`);
      csvLines.push('');

      // Area scores
      csvLines.push('Área,Percentual,Corretas,Total');
      for (const [area, areaScore] of Object.entries(data.score.area_scores)) {
        csvLines.push(`${area},${areaScore.percentage.toFixed(1)},${areaScore.correct},${areaScore.total}`);
      }
      csvLines.push('');
    }

    // Detailed responses
    csvLines.push('Questão,Área,Tópico,Dificuldade,Sua Resposta,Resposta Correta,Correto,Tempo (s)');
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      const response = data.responses.find(r => r.item_id === item.item_id);
      
      const line = [
        i + 1,
        item.area,
        item.topic,
        item.estimated_difficulty,
        response?.selected_answer || 'N/A',
        item.correct_answer,
        response?.is_correct ? 'Sim' : 'Não',
        response?.time_spent || 0
      ].join(',');
      
      csvLines.push(line);
    }

    return csvLines.join('\n');
  }

  /**
   * Export to JSON format
   */
  private async exportToJSON(data: EnemExportData, options: ExportOptions): Promise<string> {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Generate refocus link for incorrect topics
   */
  async generateRefocusLink(sessionId: string): Promise<string> {
    const data = await this.gatherExportData(sessionId);
    
    if (!data.score) {
      throw new Error('No score data available');
    }

    // Find weak topics
    const weakTopics: string[] = [];
    for (const [topic, accuracy] of Object.entries(data.score.stats.accuracy_by_topic)) {
      if (accuracy < 0.5) {
        weakTopics.push(topic);
      }
    }

    // Generate refocus session configuration
    const refocusConfig = {
      mode: 'CUSTOM',
      areas: data.session.area,
      config: {
        num_questions: Math.min(20, weakTopics.length * 3),
        difficulty_distribution: { easy: 0, medium: 1, hard: 0 }, // Focus on medium difficulty
        topics: weakTopics
      }
    };

    // Create new session and return link
    const newSessionId = `refocus_${Date.now()}`;
    // In a real implementation, you would create a new session here
    
    return `/enem/${newSessionId}?refocus=true&topics=${weakTopics.join(',')}`;
  }

  /**
   * Map Prisma models to TypeScript interfaces
   */
  private mapPrismaToEnemSession(session: any): EnemSession {
    return {
      session_id: session.session_id,
      user_id: session.user_id,
      mode: session.mode,
      area: session.area,
      config: session.config,
      start_time: session.start_time,
      end_time: session.end_time,
      status: session.status
    };
  }

  private mapPrismaToEnemResponse(response: any): EnemResponse {
    return {
      response_id: response.response_id,
      session_id: response.session_id,
      item_id: response.item_id,
      selected_answer: response.selected_answer,
      time_spent: response.time_spent,
      is_correct: response.is_correct,
      timestamp: response.timestamp
    };
  }

  private mapPrismaToEnemScore(score: any): EnemScore {
    return {
      score_id: score.score_id,
      session_id: score.session_id,
      area_scores: score.area_scores,
      total_score: score.total_score,
      tri_estimated: score.tri_estimated,
      stats: score.stats
    };
  }

  private mapPrismaToEnemItem(item: any): EnemItem {
    return {
      item_id: item.item_id,
      year: item.year,
      area: item.area,
      text: item.text,
      alternatives: item.alternatives,
      correct_answer: item.correct_answer,
      topic: item.topic,
      estimated_difficulty: item.estimated_difficulty,
      asset_refs: item.asset_refs,
      content_hash: item.content_hash,
      dataset_version: item.dataset_version,
      metadata: item.metadata
    };
  }

  /**
   * Clean up connections
   */
  async cleanup(): Promise<void> {
    await prisma.$disconnect();
  }
}
