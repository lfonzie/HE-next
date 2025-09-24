"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CertificateComponent } from '@/components/certificates/CertificateComponent';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

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

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const certificateId = params.id as string;
        
        const response = await fetch(`/api/certificates/generate?certificateId=${certificateId}`);
        const data = await response.json();

        if (data.success && data.certificates.length > 0) {
          const cert = data.certificates[0];
          setCertificateData(cert.certificateData);
        } else {
          setError('Certificado não encontrado');
        }
      } catch (err) {
        console.error('Erro ao carregar certificado:', err);
        setError('Erro ao carregar certificado');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [params.id]);

  const handleDownload = () => {
    // Implementação de download do certificado
    const element = document.getElementById('certificate-content');
    if (element) {
      const printWindow = window.open('', '_blank');
      printWindow?.document.write(`
        <html>
          <head>
            <title>Certificado - ${certificateData?.lessonTitle}</title>
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
              }
              .certificate-container {
                background: white;
                border-radius: 15px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                padding: 40px;
                max-width: 800px;
                margin: 0 auto;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px;
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
              }
              .trophy { 
                font-size: 60px; 
                color: #fbbf24; 
                margin-bottom: 15px;
              }
              .title { 
                color: #1e40af; 
                font-size: 28px; 
                font-weight: bold; 
                margin-bottom: 10px;
              }
              .subtitle { 
                color: #6b7280; 
                font-size: 16px; 
              }
              .lesson-title { 
                font-size: 24px; 
                font-weight: 600; 
                color: #1f2937; 
                text-align: center; 
                margin: 30px 0;
              }
              .performance { 
                background: #f8fafc; 
                border-radius: 10px; 
                padding: 25px; 
                margin: 25px 0;
              }
              .performance-title { 
                font-size: 20px; 
                font-weight: 600; 
                text-align: center; 
                margin-bottom: 20px; 
                color: #374151;
              }
              .stats-grid { 
                display: grid; 
                grid-template-columns: repeat(4, 1fr); 
                gap: 20px; 
                margin-bottom: 20px;
              }
              .stat { 
                text-align: center; 
                padding: 15px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .stat-icon { 
                font-size: 24px; 
                margin-bottom: 8px; 
              }
              .stat-value { 
                font-size: 24px; 
                font-weight: bold; 
                margin-bottom: 5px;
              }
              .stat-label { 
                font-size: 12px; 
                color: #6b7280; 
              }
              .grade { 
                text-align: center; 
                margin-top: 15px;
              }
              .grade-badge { 
                display: inline-block; 
                padding: 8px 20px; 
                border-radius: 20px; 
                font-weight: 600; 
                font-size: 16px;
              }
              .grade-excellent { background: #dcfce7; color: #166534; }
              .grade-good { background: #dbeafe; color: #1e40af; }
              .grade-regular { background: #fef3c7; color: #92400e; }
              .grade-poor { background: #fee2e2; color: #991b1b; }
              .info { 
                background: #f3f4f6; 
                border-radius: 8px; 
                padding: 20px; 
                margin: 25px 0;
              }
              .info-grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 20px; 
                font-size: 14px;
              }
              .info-label { 
                font-weight: 600; 
                color: #374151; 
                margin-bottom: 5px;
              }
              .info-value { 
                color: #6b7280; 
              }
              .certificate-id { 
                font-family: monospace; 
                background: #e5e7eb; 
                padding: 4px 8px; 
                border-radius: 4px; 
                font-size: 12px;
              }
              .footer { 
                text-align: center; 
                margin-top: 30px; 
                padding-top: 20px; 
                border-top: 1px solid #e5e7eb; 
                font-size: 12px; 
                color: #9ca3af;
              }
            </style>
          </head>
          <body>
            <div class="certificate-container">
              <div class="header">
                <div class="trophy">🏆</div>
                <div class="title">Certificado de Conclusão</div>
                <div class="subtitle">Este certificado comprova a conclusão da aula</div>
              </div>
              
              <div class="lesson-title">${certificateData?.lessonTitle}</div>
              
              <div class="performance">
                <div class="performance-title">Desempenho na Aula</div>
                <div class="stats-grid">
                  <div class="stat">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-value">${certificateData?.performance.correctAnswers}</div>
                    <div class="stat-label">Acertos</div>
                  </div>
                  <div class="stat">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${certificateData?.performance.totalQuestions}</div>
                    <div class="stat-label">Total</div>
                  </div>
                  <div class="stat">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-value">${certificateData?.performance.accuracy}</div>
                    <div class="stat-label">Aproveitamento</div>
                  </div>
                  <div class="stat">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-value">${certificateData?.duration}</div>
                    <div class="stat-label">Duração</div>
                  </div>
                </div>
                <div class="grade">
                  <span class="grade-badge grade-${certificateData?.performance.grade.toLowerCase().replace(' ', '-')}">
                    ${certificateData?.performance.grade}
                  </span>
                </div>
              </div>
              
              <div class="info">
                <div class="info-grid">
                  <div>
                    <div class="info-label">Data de Conclusão:</div>
                    <div class="info-value">${certificateData?.issuedDateFormatted} às ${certificateData?.issuedTime}</div>
                  </div>
                  <div>
                    <div class="info-label">ID do Certificado:</div>
                    <div class="info-value">
                      <span class="certificate-id">${certificateData?.certificateId}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="footer">
                Certificado gerado automaticamente pelo sistema de ensino<br>
                Válido e verificável através do ID único
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow?.document.close();
      printWindow?.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando certificado...</p>
        </div>
      </div>
    );
  }

  if (error || !certificateData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Certificado não encontrado</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => router.push('/aulas')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Aulas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button 
            onClick={() => router.push('/aulas')}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Aulas
          </Button>
        </div>
        
        <CertificateComponent 
          certificateData={certificateData}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
}
