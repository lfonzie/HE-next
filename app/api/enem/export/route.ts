import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { EnemExportService, ExportOptions } from '@/lib/enem-export';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { session_id, format = 'PDF', options = {} } = body;

    if (!session_id) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    const exportOptions: ExportOptions = {
      format: format.toUpperCase() as 'PDF' | 'CSV' | 'JSON',
      includeAnswers: options.includeAnswers !== false,
      includeExplanations: options.includeExplanations !== false,
      includeStatistics: options.includeStatistics !== false,
      includeSimilarQuestions: options.includeSimilarQuestions !== false
    };

    const exportService = new EnemExportService();
    const exportData = await exportService.exportSession(session_id, exportOptions);

    // Set appropriate headers based on format
    const headers: Record<string, string> = {
      'Content-Type': 'application/octet-stream'
    };

    if (exportOptions.format === 'PDF') {
      headers['Content-Type'] = 'application/pdf';
      headers['Content-Disposition'] = `attachment; filename="enem-session-${session_id}.pdf"`;
    } else if (exportOptions.format === 'CSV') {
      headers['Content-Type'] = 'text/csv';
      headers['Content-Disposition'] = `attachment; filename="enem-session-${session_id}.csv"`;
    } else if (exportOptions.format === 'JSON') {
      headers['Content-Type'] = 'application/json';
      headers['Content-Disposition'] = `attachment; filename="enem-session-${session_id}.json"`;
    }

    await exportService.cleanup();

    return new NextResponse(exportData as BodyInit, { headers });

  } catch (error) {
    console.error('Error exporting ENEM session:', error);
    return NextResponse.json({ 
      error: 'Failed to export session',
      success: false 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const format = searchParams.get('format') || 'PDF';

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
    }

    const exportOptions: ExportOptions = {
      format: format.toUpperCase() as 'PDF' | 'CSV' | 'JSON',
      includeAnswers: true,
      includeExplanations: true,
      includeStatistics: true,
      includeSimilarQuestions: true
    };

    const exportService = new EnemExportService();
    const exportData = await exportService.exportSession(sessionId, exportOptions);

    // Set appropriate headers
    const headers: Record<string, string> = {};
    
    if (exportOptions.format === 'PDF') {
      headers['Content-Type'] = 'application/pdf';
      headers['Content-Disposition'] = `attachment; filename="enem-session-${sessionId}.pdf"`;
    } else if (exportOptions.format === 'CSV') {
      headers['Content-Type'] = 'text/csv';
      headers['Content-Disposition'] = `attachment; filename="enem-session-${sessionId}.csv"`;
    } else if (exportOptions.format === 'JSON') {
      headers['Content-Type'] = 'application/json';
      headers['Content-Disposition'] = `attachment; filename="enem-session-${sessionId}.json"`;
    }

    await exportService.cleanup();

    return new NextResponse(exportData as BodyInit, { headers });

  } catch (error) {
    console.error('Error exporting ENEM session:', error);
    return NextResponse.json({ 
      error: 'Failed to export session',
      success: false 
    }, { status: 500 });
  }
}
