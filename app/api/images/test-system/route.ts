// app/api/images/test-system/route.ts - Image system testing endpoint
import { NextRequest, NextResponse } from 'next/server';

// Prevent prerendering of this API route

// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';


import { imageTestingUtils } from '@/lib/image-testing-utils';


import { imageCacheManager } from '@/lib/image-cache-manager';



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType, options = {} } = body;

    switch (testType) {
      case 'single':
        const { query, subject, forceRefresh } = options;
        const singleResult = await imageTestingUtils.runSingleTest(query, subject, forceRefresh);
        return NextResponse.json({ success: true, result: singleResult });

      case 'suite':
        const { suiteName } = options;
        const suiteResults = await imageTestingUtils.runTestSuite(suiteName);
        return NextResponse.json({ success: true, results: suiteResults });

      case 'all-suites':
        const allResults = await imageTestingUtils.runAllTests();
        return NextResponse.json({ success: true, results: allResults });

      case 'cache':
        const cacheResults = await imageTestingUtils.testCacheFunctionality();
        return NextResponse.json({ success: true, results: cacheResults });

      case 'diverse-themes':
        const diverseResults = await imageTestingUtils.testDiverseThemes();
        return NextResponse.json({ success: true, results: diverseResults });

      case 'hardcoded-check':
        const hardcodedResults = await imageTestingUtils.testForHardcodedImages();
        return NextResponse.json({ success: true, results: hardcodedResults });

      case 'full-report':
        const allTests = await imageTestingUtils.runAllTests();
        const allResultsFlat = Object.values(allTests).flat();
        const report = imageTestingUtils.generateTestReport(allResultsFlat);
        return NextResponse.json({ success: true, report });

      default:
        return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Image system test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'cache-stats':
        const cacheStats = imageCacheManager.getCacheStats();
        return NextResponse.json({ success: true, stats: cacheStats });

      case 'cache-health':
        const cacheHealth = imageCacheManager.isCacheHealthy();
        const recommendations = imageCacheManager.getCacheRecommendations();
        return NextResponse.json({ 
          success: true, 
          healthy: cacheHealth, 
          recommendations 
        });

      case 'available-suites':
        const suites = [
          'Education Basics',
          'Advanced Topics', 
          'Edge Cases'
        ];
        return NextResponse.json({ success: true, suites });

      case 'test-quick':
        // Quick test to verify system is working
        const quickResult = await imageTestingUtils.runSingleTest('education', 'educacao');
        return NextResponse.json({ 
          success: true, 
          quickTest: quickResult,
          systemStatus: quickResult.success ? 'healthy' : 'issues'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Image system status check failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
