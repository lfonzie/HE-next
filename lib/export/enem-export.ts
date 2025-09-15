import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Question, UserAnswer, SimulationStats } from '@/lib/stores/enem-simulation-store';
import { AssessmentResult } from '@/lib/assessment/enem-assessment';

export interface ExportOptions {
  format: 'pdf' | 'json' | 'csv';
  includeQuestions: boolean;
  includeAnswers: boolean;
  includeRationale: boolean;
  includeImages: boolean;
  includeStats: boolean;
  includeRecommendations: boolean;
  includeAssessment: boolean;
}

export interface ExportData {
  examInfo: {
    id: string;
    area: string;
    totalQuestions: number;
    completedAt: Date;
    duration: number;
  };
  questions: Question[];
  answers: UserAnswer[];
  stats: SimulationStats;
  assessment?: AssessmentResult;
}

export class EnemExportService {
  async exportToPDF(
    data: ExportData,
    options: ExportOptions,
    element?: HTMLElement
  ): Promise<Blob> {
    // Type assertion to ensure correct type
    const exportOptions = options as ExportOptions;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    pdf.setFontSize(20);
    pdf.text('Resultado do Simulado ENEM', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.text(`Área: ${data.examInfo.area}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Data: ${data.examInfo.completedAt.toLocaleDateString('pt-BR')}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Duração: ${this.formatDuration(data.examInfo.duration)}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Questões: ${data.examInfo.totalQuestions}`, 20, yPosition);
    yPosition += 15;

    // Overall Stats
    if (options.includeStats) {
      pdf.setFontSize(16);
      pdf.text('Desempenho Geral', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.text(`Precisão: ${data.stats.accuracy.toFixed(1)}%`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Corretas: ${data.stats.correctAnswers}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Incorretas: ${data.stats.incorrectAnswers}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Puladas: ${data.stats.skippedAnswers}`, 20, yPosition);
      yPosition += 15;
    }

    // Questions and Answers
    if (options.includeQuestions && options.includeAnswers) {
      pdf.setFontSize(16);
      pdf.text('Questões e Respostas', 20, yPosition);
      yPosition += 10;

      data.questions.forEach((question, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = 20;
        }

        const answer = data.answers.find(a => a.questionId === question.id);
        
        pdf.setFontSize(14);
        pdf.text(`Questão ${index + 1}`, 20, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        const questionText = this.wrapText(question.stem, pageWidth - 40);
        pdf.text(questionText, 20, yPosition);
        yPosition += questionText.length * 3;

        // Options
        const options = [
          `A) ${question.a}`,
          `B) ${question.b}`,
          `C) ${question.c}`,
          `D) ${question.d}`,
          `E) ${question.e}`
        ];

        options.forEach(option => {
          const optionText = this.wrapText(option, pageWidth - 40);
          pdf.text(optionText, 30, yPosition);
          yPosition += optionText.length * 2.5;
        });

        // Answer
        if (answer) {
          pdf.setFontSize(10);
          pdf.text(`Sua resposta: ${answer.answer}`, 20, yPosition);
          yPosition += 6;
          pdf.text(`Resposta correta: ${question.correct}`, 20, yPosition);
          yPosition += 6;
          
          if (answer.answer === question.correct) {
            pdf.setTextColor(0, 128, 0);
            pdf.text('✓ Correto', 20, yPosition);
          } else {
            pdf.setTextColor(255, 0, 0);
            pdf.text('✗ Incorreto', 20, yPosition);
          }
          pdf.setTextColor(0, 0, 0);
          yPosition += 6;
        } else {
          pdf.setTextColor(128, 128, 128);
          pdf.text('Não respondida', 20, yPosition);
          pdf.setTextColor(0, 0, 0);
          yPosition += 6;
        }

        // Rationale
        if (exportOptions.includeRationale && question.rationale) {
          pdf.setFontSize(9);
          pdf.text('Explicação:', 20, yPosition);
          yPosition += 5;
          const rationaleText = this.wrapText(question.rationale, pageWidth - 40);
          pdf.text(rationaleText, 20, yPosition);
          yPosition += rationaleText.length * 2;
        }

        yPosition += 10;
      });
    }

    // Recommendations
    if (options.includeRecommendations && data.assessment) {
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(16);
      pdf.text('Recomendações', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      data.assessment.recommendations.forEach((rec, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.text(`${index + 1}. ${rec.title}`, 20, yPosition);
        yPosition += 6;
        
        pdf.setFontSize(10);
        const descText = this.wrapText(rec.description, pageWidth - 40);
        pdf.text(descText, 20, yPosition);
        yPosition += descText.length * 2.5;

        if (rec.actionItems.length > 0) {
          pdf.text('Ações sugeridas:', 20, yPosition);
          yPosition += 5;
          
          rec.actionItems.forEach(item => {
            pdf.text(`• ${item}`, 25, yPosition);
            yPosition += 4;
          });
        }

        yPosition += 8;
      });
    }

    return pdf.output('blob');
  }

  async exportToJSON(data: ExportData, options: ExportOptions): Promise<Blob> {
    const exportData: any = {
      examInfo: data.examInfo,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    if (options.includeStats) {
      exportData.stats = data.stats;
    }

    if (options.includeAssessment && data.assessment) {
      exportData.assessment = data.assessment;
    }

    if (options.includeQuestions) {
      exportData.questions = data.questions.map(q => ({
        id: q.id,
        area: q.area,
        year: q.year,
        disciplina: q.disciplina,
        skill_tag: q.skill_tag,
        stem: q.stem,
        options: {
          a: q.a,
          b: q.b,
          c: q.c,
          d: q.d,
          e: q.e
        },
        correct: q.correct,
        difficulty: q.difficulty,
        source: q.source,
        ...(options.includeRationale && { rationale: q.rationale }),
        ...(options.includeImages && { image_url: q.image_url, image_alt: q.image_alt })
      }));
    }

    if (options.includeAnswers) {
      exportData.answers = data.answers.map(a => ({
        questionId: a.questionId,
        answer: a.answer,
        timestamp: a.timestamp.toISOString(),
        timeSpent: a.timeSpent
      }));
    }

    const jsonString = JSON.stringify(exportData, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  async exportToCSV(data: ExportData, options: ExportOptions): Promise<Blob> {
    const rows: string[] = [];
    
    // Header
    const headers = ['Questão', 'Área', 'Ano', 'Disciplina', 'Dificuldade', 'Sua Resposta', 'Resposta Correta', 'Status', 'Tempo Gasto'];
    if (options.includeRationale) {
      headers.push('Explicação');
    }
    rows.push(headers.join(','));

    // Data rows
    data.questions.forEach((question, index) => {
      const answer = data.answers.find(a => a.questionId === question.id);
      const row = [
        `Questão ${index + 1}`,
        question.area,
        question.year.toString(),
        question.disciplina,
        question.difficulty,
        answer?.answer || 'Não respondida',
        question.correct,
        answer?.answer === question.correct ? 'Correto' : 'Incorreto',
        answer?.timeSpent.toString() || '0'
      ];

      if (options.includeRationale) {
        row.push(question.rationale || '');
      }

      rows.push(row.map(cell => `"${cell}"`).join(','));
    });

    // Summary row
    rows.push('');
    rows.push('Resumo,Valor');
    rows.push(`Total de Questões,${data.examInfo.totalQuestions}`);
    rows.push(`Corretas,${data.stats.correctAnswers}`);
    rows.push(`Incorretas,${data.stats.incorrectAnswers}`);
    rows.push(`Puladas,${data.stats.skippedAnswers}`);
    rows.push(`Precisão,${data.stats.accuracy.toFixed(1)}%`);
    rows.push(`Tempo Total,${this.formatDuration(data.examInfo.duration)}`);

    const csvString = rows.join('\n');
    return new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  }

  async captureElementAsImage(element: HTMLElement): Promise<Blob> {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/png');
    });
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      // This is a simplified calculation - in a real implementation,
      // you'd want to measure the actual text width
      if (testLine.length * 2.5 > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}min ${secs}s`;
    }
    return `${minutes}min ${secs}s`;
  }
}

// Singleton instance
export const exportService = new EnemExportService();
