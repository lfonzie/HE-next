import { NextRequest, NextResponse } from 'next/server';
import { SQLInsightsEngine } from '@/lib/analytics/sql-insights';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const insightsEngine = new SQLInsightsEngine();

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const insightId = url.searchParams.get('id');
    const category = url.searchParams.get('category');
    const execute = url.searchParams.get('execute') === 'true';

    if (insightId) {
      if (execute) {
        const result = await insightsEngine.executeInsight(insightId);
        return NextResponse.json({
          success: true,
          result
        });
      } else {
        const insight = await insightsEngine.getInsightById(insightId);
        if (!insight) {
          return NextResponse.json(
            { error: 'Insight not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          insight
        });
      }
    }

    if (category) {
      const insights = await insightsEngine.getInsightsByCategory(category);
      return NextResponse.json({
        success: true,
        insights
      });
    }

    // Retornar todos os insights
    const insights = await insightsEngine.getAllInsights();
    return NextResponse.json({
      success: true,
      insights
    });

  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, insightId, insight, updates } = body;

    switch (action) {
      case 'execute_all':
        const results = await insightsEngine.executeAllInsights();
        return NextResponse.json({
          success: true,
          results,
          count: results.length
        });

      case 'execute':
        if (!insightId) {
          return NextResponse.json(
            { error: 'insightId is required for execute action' },
            { status: 400 }
          );
        }
        const result = await insightsEngine.executeInsight(insightId);
        return NextResponse.json({
          success: true,
          result
        });

      case 'create':
        if (!insight) {
          return NextResponse.json(
            { error: 'insight data is required for create action' },
            { status: 400 }
          );
        }
        const newInsight = await insightsEngine.createCustomInsight(insight);
        return NextResponse.json({
          success: true,
          insight: newInsight
        });

      case 'update':
        if (!insightId || !updates) {
          return NextResponse.json(
            { error: 'insightId and updates are required for update action' },
            { status: 400 }
          );
        }
        const updatedInsight = await insightsEngine.updateInsight(insightId, updates);
        if (!updatedInsight) {
          return NextResponse.json(
            { error: 'Insight not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          insight: updatedInsight
        });

      case 'delete':
        if (!insightId) {
          return NextResponse.json(
            { error: 'insightId is required for delete action' },
            { status: 400 }
          );
        }
        const deleted = await insightsEngine.deleteInsight(insightId);
        if (!deleted) {
          return NextResponse.json(
            { error: 'Insight not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          message: 'Insight deleted successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error processing insights request:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
