import { NextRequest, NextResponse } from 'next/server';
import { getExperimentById } from '@/components/virtual-lab-simulator/services/experimentData';
import { ExperimentID } from '@/components/virtual-lab-simulator/types/experiment';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const experimentId = params.id as ExperimentID;
    const experiment = getExperimentById(experimentId);

    if (!experiment) {
      return NextResponse.json(
        { success: false, error: 'Experiment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: experiment
    });
  } catch (error) {
    console.error('Error fetching experiment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch experiment' },
      { status: 500 }
    );
  }
}
