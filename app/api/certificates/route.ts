import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CertificateSystem } from "@/lib/certificate-system";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'certificates':
        // Obter certificados do usuário
        const certificates = await CertificateSystem.getUserCertificates(session.user.id);
        return NextResponse.json({ certificates });

      case 'progress':
        // Obter progresso do usuário
        const progress = await CertificateSystem.getUserProgress(session.user.id);
        return NextResponse.json({ progress });

      case 'stats':
        // Obter estatísticas gerais
        const stats = await getCertificateStats();
        return NextResponse.json({ stats });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Erro na API de certificados:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, module, metadata } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // Verificar e emitir certificado se necessário
    const certificate = await CertificateSystem.checkAndIssueCertificate(
      session.user.id,
      module || 'general',
      action,
      metadata
    );

    if (certificate) {
      return NextResponse.json({ 
        success: true, 
        certificate,
        message: `Parabéns! Você recebeu o certificado: ${certificate.title}`
      });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Continue estudando para ganhar certificados!'
    });

  } catch (error) {
    console.error('Erro ao processar certificado:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

// Função auxiliar para obter estatísticas
async function getCertificateStats() {
  try {
    const totalCertificates = await prisma.certificates.count();
    
    const certificatesByType = await prisma.certificates.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    });

    const recentCertificates = await prisma.certificates.findMany({
      take: 10,
      orderBy: {
        issued_at: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return {
      totalCertificates,
      certificatesByType: certificatesByType.map(item => ({
        type: item.type,
        count: item._count.id
      })),
      recentCertificates
    };

  } catch (error) {
    console.error('Erro ao obter estatísticas de certificados:', error);
    return {
      totalCertificates: 0,
      certificatesByType: [],
      recentCertificates: []
    };
  }
}
