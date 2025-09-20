
// Prevent prerendering of this API route
export const dynamic = 'force-dynamic';

/**
 * Optimized API Route Example
 * Demonstrates compression, caching, and optimization features
 */

import { NextRequest, NextResponse } from 'next/server';


import { optimizeApiRoute } from '@/lib/api/compression';



// Example data - simulating a large response
const generateLargeResponse = (size: number = 10000) => {
  const data = {
    timestamp: new Date().toISOString(),
    data: Array.from({ length: size }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `This is a detailed description for item ${i} with lots of text to demonstrate compression effectiveness.`,
      metadata: {
        category: `Category ${i % 10}`,
        tags: [`tag${i % 5}`, `tag${(i + 1) % 5}`],
        score: Math.random() * 100,
        active: i % 3 === 0
      }
    })),
    summary: {
      total: size,
      active: Math.floor(size * 0.7),
      categories: 10,
      averageScore: 50.5
    }
  };

  return data;
};

// Basic handler without optimization
async function basicHandler(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const size = parseInt(url.searchParams.get('size') || '1000');
  
  const data = generateLargeResponse(size);
  
  return NextResponse.json(data, {
    headers: {
      'content-type': 'application/json',
      'x-response-size': size.toString(),
      'x-timestamp': new Date().toISOString()
    }
  });
}

// Optimized handler with compression and caching
export const GET = optimizeApiRoute(basicHandler, {
  compression: {
    enabled: true,
    threshold: 1024, // Compress responses larger than 1KB
    algorithms: [
      { name: 'brotli', priority: 1, minSize: 1024 },
      { name: 'gzip', priority: 2, minSize: 512 },
      { name: 'deflate', priority: 3, minSize: 256 }
    ],
    cacheEnabled: true,
    cacheTTL: 300 // 5 minutes
  },
  caching: {
    ttl: 300, // 5 minutes
    maxSize: 50 // Maximum 50 cached responses
  },
  rateLimit: {
    requests: 100, // 100 requests
    window: 60 // per minute
  }
});

// Alternative: Manual optimization example
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action, data } = body;

    let responseData: any;

    switch (action) {
      case 'process':
        // Simulate data processing
        responseData = {
          success: true,
          processed: data,
          timestamp: new Date().toISOString(),
          metadata: {
            processingTime: Math.random() * 100,
            itemsProcessed: Array.isArray(data) ? data.length : 1
          }
        };
        break;

      case 'analyze':
        // Simulate analysis
        responseData = {
          success: true,
          analysis: {
            sentiment: Math.random() > 0.5 ? 'positive' : 'negative',
            confidence: Math.random(),
            keywords: ['education', 'learning', 'technology'],
            summary: 'This is a sample analysis result with detailed information.'
          },
          timestamp: new Date().toISOString()
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const response = NextResponse.json(responseData, {
      headers: {
        'content-type': 'application/json',
        'x-processing-time': Date.now().toString(),
        'cache-control': 'no-cache' // Don't cache POST responses
      }
    });

    // Apply compression manually
    const { compressionManager } = await import('@/lib/api/compression');
    return await compressionManager.compressResponse(response, request);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function HEAD(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'x-service': 'optimized-api',
      'x-version': '1.0.0',
      'x-timestamp': new Date().toISOString()
    }
  });
}

