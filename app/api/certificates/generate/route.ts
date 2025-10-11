import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Função para gerar ID único do certificado
function generateCertificateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `CERT-${timestamp}-${random}`.toUpperCase();
}

// Função para calcular estatísticas do quiz
function calculateQuizStats(quizResults: any) {
  let totalQuestions = 0;
  let correctAnswers = 0;
  let totalTimeSpent = 0;

  Object.values(quizResults).forEach((result: any) => {
    if (result && typeof result === 'object') {
      totalQuestions++;
      if (result.isCorrect) correctAnswers++;
      totalTimeSpent += result.timeSpent || 0;
    }
  });

  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  return {
    totalQuestions,
    correctAnswers,
    accuracy: Math.round(accuracy * 100) / 100,
    totalTimeSpent
  };
}

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      lessonId, 
      lessonTitle, 
      durationMinutes, 
      quizResults = {} 
    } = await request.json();

    if (!userId || !lessonId || !lessonTitle) {
      return NextResponse.json(
        { error: 'userId, lessonId e lessonTitle são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se já existe certificado para esta aula
    const existingCertificate = await prisma.lesson_certificates.findFirst({
      where: {
        user_id: userId,
        lesson_id: lessonId
      }
    });

    if (existingCertificate) {
      return NextResponse.json({
        success: true,
        certificate: {
          id: existingCertificate.id,
          uniqueId: existingCertificate.unique_id,
          lessonTitle: existingCertificate.lesson_title,
          completionDate: existingCertificate.completion_date,
          durationMinutes: existingCertificate.duration_minutes,
          totalQuestions: existingCertificate.total_questions,
          correctAnswers: existingCertificate.correct_answers,
          accuracyPercent: existingCertificate.accuracy_percent,
          quizResults: existingCertificate.quiz_results,
          certificateData: existingCertificate.certificate_data
        },
        message: 'Certificado já existe para esta aula'
      });
    }

    // Calcular estatísticas do quiz
    const stats = calculateQuizStats(quizResults);

    // Gerar dados do certificado
    const uniqueId = generateCertificateId();
    const completionDate = new Date();
    
    const certificateData = {
      certificateId: uniqueId,
      issuedDate: completionDate.toISOString(),
      issuedTime: completionDate.toLocaleTimeString('pt-BR'),
      issuedDateFormatted: completionDate.toLocaleDateString('pt-BR'),
      studentId: userId,
      lessonId: lessonId,
      lessonTitle: lessonTitle,
      duration: `${durationMinutes} minutos`,
      performance: {
        totalQuestions: stats.totalQuestions,
        correctAnswers: stats.correctAnswers,
        accuracy: `${stats.accuracy}%`,
        grade: stats.accuracy >= 80 ? 'Excelente' : 
               stats.accuracy >= 60 ? 'Bom' : 
               stats.accuracy >= 40 ? 'Regular' : 'Precisa melhorar'
      },
      metadata: {
        generatedAt: completionDate.toISOString(),
        version: '1.0',
        type: 'lesson_completion'
      }
    };

    // Criar certificado no banco
    const certificate = await prisma.lesson_certificates.create({
      data: {
        user_id: userId,
        lesson_id: lessonId,
        lesson_title: lessonTitle,
        completion_date: completionDate,
        duration_minutes: durationMinutes,
        total_questions: stats.totalQuestions,
        correct_answers: stats.correctAnswers,
        accuracy_percent: stats.accuracy,
        quiz_results: quizResults,
        certificate_data: certificateData,
        unique_id: uniqueId
      }
    });

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.id,
        uniqueId: certificate.unique_id,
        lessonTitle: certificate.lesson_title,
        completionDate: certificate.completion_date,
        durationMinutes: certificate.duration_minutes,
        totalQuestions: certificate.total_questions,
        correctAnswers: certificate.correct_answers,
        accuracyPercent: certificate.accuracy_percent,
        quizResults: certificate.quiz_results,
        certificateData: certificate.certificate_data
      },
      message: 'Certificado gerado com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao gerar certificado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const certificateId = searchParams.get('certificateId');

    if (!userId && !certificateId) {
      return NextResponse.json(
        { error: 'userId ou certificateId é obrigatório' },
        { status: 400 }
      );
    }

    const whereClause: any = {};
    if (certificateId) {
      whereClause.unique_id = certificateId;
    } else if (userId) {
      whereClause.user_id = userId;
    }

    const certificates = await prisma.lesson_certificates.findMany({
      where: whereClause,
      orderBy: { completion_date: 'desc' }
    });

    return NextResponse.json({
      success: true,
      certificates: certificates.map(cert => ({
        id: cert.id,
        uniqueId: cert.unique_id,
        lessonId: cert.lesson_id,
        lessonTitle: cert.lesson_title,
        completionDate: cert.completion_date,
        durationMinutes: cert.duration_minutes,
        totalQuestions: cert.total_questions,
        correctAnswers: cert.correct_answers,
        accuracyPercent: cert.accuracy_percent,
        quizResults: cert.quiz_results,
        certificateData: cert.certificate_data,
        createdAt: cert.created_at
      }))
    });

  } catch (error: any) {
    console.error('Erro ao buscar certificados:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}
