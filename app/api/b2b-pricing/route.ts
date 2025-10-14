import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { B2BPricingSystem } from "@/lib/b2b-pricing-system";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const studentCount = searchParams.get('studentCount');

    switch (action) {
      case 'plans':
        // Obter todos os planos
        const plans = B2BPricingSystem.getPricingPlans();
        return NextResponse.json({ plans });

      case 'calculate':
        // Calcular melhor plano para número de alunos
        if (!studentCount) {
          return NextResponse.json({ error: 'studentCount is required' }, { status: 400 });
        }
        
        const calculations = B2BPricingSystem.calculateBestPlan(parseInt(studentCount));
        const customPricing = B2BPricingSystem.calculateCustomPricing(parseInt(studentCount));
        
        return NextResponse.json({ 
          calculations,
          customPricing,
          studentCount: parseInt(studentCount)
        });

      case 'subscription':
        // Obter assinatura de uma escola
        const schoolId = searchParams.get('schoolId');
        if (!schoolId) {
          return NextResponse.json({ error: 'schoolId is required' }, { status: 400 });
        }
        
        const subscription = await B2BPricingSystem.getSchoolSubscription(schoolId);
        return NextResponse.json({ subscription });

      case 'stats':
        // Obter estatísticas de assinaturas
        const stats = await B2BPricingSystem.getSubscriptionStats();
        return NextResponse.json({ stats });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Erro na API de pricing B2B:', error);
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
    const { action, schoolId, planId, studentCount, billingCycle } = body;

    switch (action) {
      case 'create_subscription':
        if (!schoolId || !planId || !studentCount || !billingCycle) {
          return NextResponse.json({ 
            error: 'schoolId, planId, studentCount, and billingCycle are required' 
          }, { status: 400 });
        }

        const subscription = await B2BPricingSystem.createSchoolSubscription(
          schoolId,
          planId,
          studentCount,
          billingCycle
        );

        return NextResponse.json({ 
          success: true, 
          subscription,
          message: 'Assinatura criada com sucesso!'
        });

      case 'update_subscription':
        const { subscriptionId, updates } = body;
        if (!subscriptionId) {
          return NextResponse.json({ 
            error: 'subscriptionId is required' 
          }, { status: 400 });
        }

        const updatedSubscription = await B2BPricingSystem.updateSchoolSubscription(
          subscriptionId,
          updates
        );

        return NextResponse.json({ 
          success: true, 
          subscription: updatedSubscription,
          message: 'Assinatura atualizada com sucesso!'
        });

      case 'cancel_subscription':
        const { cancelSubscriptionId } = body;
        if (!cancelSubscriptionId) {
          return NextResponse.json({ 
            error: 'subscriptionId is required' 
          }, { status: 400 });
        }

        await B2BPricingSystem.cancelSchoolSubscription(cancelSubscriptionId);

        return NextResponse.json({ 
          success: true, 
          message: 'Assinatura cancelada com sucesso!'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Erro ao processar pricing B2B:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}
