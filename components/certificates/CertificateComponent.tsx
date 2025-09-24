"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Share2, Trophy, Clock, Target, CheckCircle } from 'lucide-react';

interface CertificateData {
  certificateId: string;
  issuedDate: string;
  issuedTime: string;
  issuedDateFormatted: string;
  studentId: string;
  lessonId: string;
  lessonTitle: string;
  duration: string;
  performance: {
    totalQuestions: number;
    correctAnswers: number;
    accuracy: string;
    grade: string;
  };
  metadata: {
    generatedAt: string;
    version: string;
    type: string;
  };
}

interface CertificateProps {
  certificateData: CertificateData;
  onDownload?: () => void;
  onShare?: () => void;
  className?: string;
}

export function CertificateComponent({ 
  certificateData, 
  onDownload, 
  onShare, 
  className = "" 
}: CertificateProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Excelente': return 'bg-green-100 text-green-800 border-green-200';
      case 'Bom': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Regular': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Precisa melhorar': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Implementação padrão de download
      const element = document.getElementById('certificate-content');
      if (element) {
        const printWindow = window.open('', '_blank');
        printWindow?.document.write(`
          <html>
            <head>
              <title>Certificado - ${certificateData.lessonTitle}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .certificate { border: 3px solid #2563eb; padding: 30px; text-align: center; }
                .header { color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
                .content { margin: 20px 0; }
                .performance { display: flex; justify-content: space-around; margin: 20px 0; }
                .stat { text-align: center; }
                .footer { margin-top: 30px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `);
        printWindow?.document.close();
        printWindow?.print();
      }
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Implementação padrão de compartilhamento
      if (navigator.share) {
        navigator.share({
          title: `Certificado: ${certificateData.lessonTitle}`,
          text: `Concluí a aula "${certificateData.lessonTitle}" com ${certificateData.performance.accuracy} de aproveitamento!`,
          url: window.location.href
        });
      } else {
        // Fallback para copiar para clipboard
        navigator.clipboard.writeText(
          `Certificado: ${certificateData.lessonTitle}\n` +
          `Aproveitamento: ${certificateData.performance.accuracy}\n` +
          `Data: ${certificateData.issuedDateFormatted}\n` +
          `ID: ${certificateData.certificateId}`
        );
      }
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <Card id="certificate-content" className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-3xl font-bold text-blue-800 mb-2">
            Certificado de Conclusão
          </CardTitle>
          <p className="text-lg text-gray-600">
            Este certificado comprova a conclusão da aula
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informações da Aula */}
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              {certificateData.lessonTitle}
            </h3>
            <Badge variant="outline" className="text-sm">
              ID da Aula: {certificateData.lessonId}
            </Badge>
          </div>

          {/* Performance */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h4 className="text-xl font-semibold text-center mb-4 text-gray-700">
              Desempenho na Aula
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {certificateData.performance.correctAnswers}
                </div>
                <div className="text-sm text-gray-600">Acertos</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {certificateData.performance.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {certificateData.performance.accuracy}
                </div>
                <div className="text-sm text-gray-600">Aproveitamento</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {certificateData.duration}
                </div>
                <div className="text-sm text-gray-600">Duração</div>
              </div>
            </div>

            <div className="text-center">
              <Badge 
                className={`text-lg px-4 py-2 ${getGradeColor(certificateData.performance.grade)}`}
              >
                {certificateData.performance.grade}
              </Badge>
            </div>
          </div>

          {/* Informações do Certificado */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Data de Conclusão:</span>
                <br />
                {certificateData.issuedDateFormatted} às {certificateData.issuedTime}
              </div>
              <div>
                <span className="font-semibold text-gray-700">ID do Certificado:</span>
                <br />
                <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                  {certificateData.certificateId}
                </code>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-center gap-4 pt-4">
            <Button 
              onClick={handleDownload}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              Baixar Certificado
            </Button>
            <Button 
              onClick={handleShare}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
