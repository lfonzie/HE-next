import { NextRequest, NextResponse } from 'next/server';
import { experiments } from '@/components/virtual-lab-simulator/services/experimentData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const tag = searchParams.get('tag');

    let filteredExperiments = experiments;

    if (category) {
      filteredExperiments = filteredExperiments.filter(exp => exp.category === category);
    }

    if (difficulty) {
      filteredExperiments = filteredExperiments.filter(exp => exp.difficulty === difficulty);
    }

    if (tag) {
      filteredExperiments = filteredExperiments.filter(exp => exp.tags.includes(tag));
    }

    return NextResponse.json({
      success: true,
      data: filteredExperiments,
      count: filteredExperiments.length
    });
  } catch (error) {
    console.error('Error fetching experiments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch experiments' },
      { status: 500 }
    );
  }
}
