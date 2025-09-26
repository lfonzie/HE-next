import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { experimentId, parameters, action } = body;

    // Simulate different experiment actions
    switch (action) {
      case 'start':
        return NextResponse.json({
          success: true,
          data: {
            status: 'running',
            message: 'Simulation started successfully',
            timestamp: Date.now()
          }
        });

      case 'pause':
        return NextResponse.json({
          success: true,
          data: {
            status: 'paused',
            message: 'Simulation paused',
            timestamp: Date.now()
          }
        });

      case 'reset':
        return NextResponse.json({
          success: true,
          data: {
            status: 'stopped',
            message: 'Simulation reset',
            timestamp: Date.now()
          }
        });

      case 'update_parameters':
        return NextResponse.json({
          success: true,
          data: {
            status: 'updated',
            message: 'Parameters updated successfully',
            parameters,
            timestamp: Date.now()
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in simulation:', error);
    return NextResponse.json(
      { success: false, error: 'Simulation failed' },
      { status: 500 }
    );
  }
}
