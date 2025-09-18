/**
 * API Compression and Optimization System
 * Provides intelligent compression, caching, and response optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const deflate = promisify(zlib.deflate);
const brotliCompress = promisify(zlib.brotliCompress);

export interface CompressionConfig {
  enabled: boolean;
  threshold: number; // Minimum size in bytes to compress
  algorithms: CompressionAlgorithm[];
  cacheEnabled: boolean;
  cacheTTL: number; // Time to live in seconds
}

export interface CompressionAlgorithm {
  name: 'gzip' | 'deflate' | 'brotli';
  priority: number; // Lower number = higher priority
  minSize: number; // Minimum size to use this algorithm
  maxSize?: number; // Maximum size to use this algorithm
}

export interface CompressionStats {
  totalRequests: number;
  compressedRequests: number;
  compressionRatio: number;
  averageCompressionTime: number;
  algorithmUsage: Record<string, number>;
  cacheHits: number;
  cacheMisses: number;
}

const defaultConfig: CompressionConfig = {
  enabled: true,
  threshold: 1024, // 1KB
  algorithms: [
    { name: 'brotli', priority: 1, minSize: 1024 },
    { name: 'gzip', priority: 2, minSize: 512 },
    { name: 'deflate', priority: 3, minSize: 256 }
  ],
  cacheEnabled: true,
  cacheTTL: 3600 // 1 hour
};

class CompressionManager {
  private config: CompressionConfig;
  private stats: CompressionStats;
  private compressionCache: Map<string, CompressedResponse> = new Map();

  constructor(config: Partial<CompressionConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.stats = {
      totalRequests: 0,
      compressedRequests: 0,
      compressionRatio: 0,
      averageCompressionTime: 0,
      algorithmUsage: {},
      cacheHits: 0,
      cacheMisses: 0
    };

    // Cleanup cache periodically
    if (this.config.cacheEnabled) {
      setInterval(() => this.cleanupCache(), 60000); // Every minute
    }
  }

  async compressResponse(
    response: NextResponse,
    request: NextRequest
  ): Promise<NextResponse> {
    if (!this.config.enabled) {
      return response;
    }

    this.stats.totalRequests++;

    const acceptEncoding = request.headers.get('accept-encoding') || '';
    const contentLength = response.headers.get('content-length');
    const responseSize = contentLength ? parseInt(contentLength) : 0;

    // Check if response should be compressed
    if (responseSize < this.config.threshold) {
      return response;
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(response, acceptEncoding);
    if (this.config.cacheEnabled) {
      const cached = this.compressionCache.get(cacheKey);
      if (cached && !this.isCacheExpired(cached)) {
        this.stats.cacheHits++;
        return this.createCompressedResponse(cached);
      }
      this.stats.cacheMisses++;
    }

    // Determine best compression algorithm
    const algorithm = this.selectAlgorithm(acceptEncoding, responseSize);
    if (!algorithm) {
      return response;
    }

    const startTime = Date.now();

    try {
      // Get response body
      const body = await response.text();
      const bodyBuffer = Buffer.from(body, 'utf8');

      // Compress based on algorithm
      let compressed: Buffer;
      let encoding: string;

      switch (algorithm.name) {
        case 'brotli':
          compressed = await brotliCompress(bodyBuffer);
          encoding = 'br';
          break;
        case 'gzip':
          compressed = await gzip(bodyBuffer);
          encoding = 'gzip';
          break;
        case 'deflate':
          compressed = await deflate(bodyBuffer);
          encoding = 'deflate';
          break;
        default:
          return response;
      }

      const compressionTime = Date.now() - startTime;
      const compressionRatio = compressed.length / bodyBuffer.length;

      // Update stats
      this.stats.compressedRequests++;
      this.stats.compressionRatio = 
        (this.stats.compressionRatio * (this.stats.compressedRequests - 1) + compressionRatio) / 
        this.stats.compressedRequests;
      this.stats.averageCompressionTime = 
        (this.stats.averageCompressionTime * (this.stats.compressedRequests - 1) + compressionTime) / 
        this.stats.compressedRequests;
      this.stats.algorithmUsage[algorithm.name] = 
        (this.stats.algorithmUsage[algorithm.name] || 0) + 1;

      // Cache the compressed response
      if (this.config.cacheEnabled) {
        const compressedResponse: CompressedResponse = {
          data: compressed,
          encoding,
          originalSize: bodyBuffer.length,
          compressedSize: compressed.length,
          timestamp: Date.now(),
          algorithm: algorithm.name
        };
        this.compressionCache.set(cacheKey, compressedResponse);
      }

      // Create new response with compressed body
      const compressedResponse = new NextResponse(compressed, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'content-encoding': encoding,
          'content-length': compressed.length.toString(),
          'x-compression-ratio': compressionRatio.toFixed(2),
          'x-compression-algorithm': algorithm.name,
          'x-compression-time': compressionTime.toString()
        }
      });

      return compressedResponse;

    } catch (error) {
      console.error('Compression failed:', error);
      return response;
    }
  }

  private selectAlgorithm(acceptEncoding: string, responseSize: number): CompressionAlgorithm | null {
    // Sort algorithms by priority
    const sortedAlgorithms = [...this.config.algorithms].sort((a, b) => a.priority - b.priority);

    for (const algorithm of sortedAlgorithms) {
      // Check if client supports this algorithm
      if (!this.clientSupportsAlgorithm(acceptEncoding, algorithm.name)) {
        continue;
      }

      // Check size constraints
      if (responseSize < algorithm.minSize) {
        continue;
      }

      if (algorithm.maxSize && responseSize > algorithm.maxSize) {
        continue;
      }

      return algorithm;
    }

    return null;
  }

  private clientSupportsAlgorithm(acceptEncoding: string, algorithm: string): boolean {
    const supportedEncodings = acceptEncoding.toLowerCase().split(',').map(e => e.trim());
    
    switch (algorithm) {
      case 'brotli':
        return supportedEncodings.includes('br');
      case 'gzip':
        return supportedEncodings.includes('gzip');
      case 'deflate':
        return supportedEncodings.includes('deflate');
      default:
        return false;
    }
  }

  private generateCacheKey(response: NextResponse, acceptEncoding: string): string {
    const url = response.headers.get('x-request-url') || '';
    const contentType = response.headers.get('content-type') || '';
    const contentLength = response.headers.get('content-length') || '';
    
    return `${url}:${contentType}:${contentLength}:${acceptEncoding}`;
  }

  private isCacheExpired(cached: CompressedResponse): boolean {
    const age = Date.now() - cached.timestamp;
    return age > this.config.cacheTTL * 1000;
  }

  private createCompressedResponse(cached: CompressedResponse): NextResponse {
    return new NextResponse(cached.data, {
      headers: {
        'content-encoding': cached.encoding,
        'content-length': cached.compressedSize.toString(),
        'x-compression-ratio': (cached.compressedSize / cached.originalSize).toFixed(2),
        'x-compression-algorithm': cached.algorithm,
        'x-cache': 'HIT'
      }
    });
  }

  private cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, cached] of this.compressionCache.entries()) {
      if (this.isCacheExpired(cached)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.compressionCache.delete(key));
  }

  getStats(): CompressionStats {
    return { ...this.stats };
  }

  updateConfig(newConfig: Partial<CompressionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  clearCache(): void {
    this.compressionCache.clear();
  }
}

interface CompressedResponse {
  data: Buffer;
  encoding: string;
  originalSize: number;
  compressedSize: number;
  timestamp: number;
  algorithm: string;
}

// Singleton instance
export const compressionManager = new CompressionManager();

// Middleware function for Next.js
export function withCompression(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config?: Partial<CompressionConfig>
) {
  if (config) {
    compressionManager.updateConfig(config);
  }

  return async (request: NextRequest): Promise<NextResponse> => {
    const response = await handler(request);
    return await compressionManager.compressResponse(response, request);
  };
}

// Response caching utilities
export class ResponseCache {
  private cache: Map<string, CachedResponse> = new Map();
  private config: { ttl: number; maxSize: number };

  constructor(config: { ttl?: number; maxSize?: number } = {}) {
    this.config = {
      ttl: config.ttl || 300, // 5 minutes default
      maxSize: config.maxSize || 100 // 100 responses default
    };
  }

  async get(key: string): Promise<NextResponse | null> {
    const cached = this.cache.get(key);
    if (!cached || this.isExpired(cached)) {
      this.cache.delete(key);
      return null;
    }

    return this.recreateResponse(cached);
  }

  async set(key: string, response: NextResponse): Promise<void> {
    // Clean up expired entries
    this.cleanup();

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    const cached: CachedResponse = {
      body: await response.text(),
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      timestamp: Date.now()
    };

    this.cache.set(key, cached);
  }

  private isExpired(cached: CachedResponse): boolean {
    return Date.now() - cached.timestamp > this.config.ttl * 1000;
  }

  private recreateResponse(cached: CachedResponse): NextResponse {
    const response = new NextResponse(cached.body, {
      status: cached.status,
      statusText: cached.statusText
    });

    // Restore headers
    Object.entries(cached.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  private cleanup(): void {
    const expiredKeys: string[] = [];
    for (const [key, cached] of this.cache.entries()) {
      if (this.isExpired(cached)) {
        expiredKeys.push(key);
      }
    }
    expiredKeys.forEach(key => this.cache.delete(key));
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

interface CachedResponse {
  body: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  timestamp: number;
}

// API route optimization utilities
export function optimizeApiRoute(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    compression?: Partial<CompressionConfig>;
    caching?: { ttl?: number; maxSize?: number };
    rateLimit?: { requests: number; window: number };
  } = {}
) {
  const responseCache = new ResponseCache(options.caching);
  const rateLimiter = new Map<string, { count: number; resetTime: number }>();

  return async (request: NextRequest): Promise<NextResponse> => {
    const url = new URL(request.url);
    const cacheKey = `${request.method}:${url.pathname}:${url.search}`;

    // Rate limiting
    if (options.rateLimit) {
      const clientId = request.headers.get('x-forwarded-for') || 'unknown';
      const now = Date.now();
      const windowStart = now - options.rateLimit.window * 1000;

      const clientData = rateLimiter.get(clientId);
      if (clientData && clientData.resetTime > now) {
        if (clientData.count >= options.rateLimit.requests) {
          return new NextResponse('Rate limit exceeded', { status: 429 });
        }
        clientData.count++;
      } else {
        rateLimiter.set(clientId, { count: 1, resetTime: now + options.rateLimit.window * 1000 });
      }

      // Cleanup expired rate limit entries
      for (const [id, data] of rateLimiter.entries()) {
        if (data.resetTime <= now) {
          rateLimiter.delete(id);
        }
      }
    }

    // Check cache first
    const cachedResponse = await responseCache.get(cacheKey);
    if (cachedResponse) {
      cachedResponse.headers.set('x-cache', 'HIT');
      return cachedResponse;
    }

    // Execute handler
    const response = await handler(request);

    // Cache successful responses
    if (response.status >= 200 && response.status < 300) {
      await responseCache.set(cacheKey, response.clone());
      response.headers.set('x-cache', 'MISS');
    }

    // Apply compression
    if (options.compression) {
      return await compressionManager.compressResponse(response, request);
    }

    return response;
  };
}

// Utility functions
export function generateCacheKey(request: NextRequest): string {
  const url = new URL(request.url);
  const method = request.method;
  const headers = Object.fromEntries(request.headers.entries());
  
  // Include relevant headers in cache key
  const relevantHeaders = ['authorization', 'accept', 'accept-language'];
  const headerString = relevantHeaders
    .map(h => `${h}:${headers[h] || ''}`)
    .join('|');

  return `${method}:${url.pathname}:${url.search}:${headerString}`;
}

export function shouldCache(request: NextRequest): boolean {
  const method = request.method;
  const url = new URL(request.url);
  
  // Only cache GET requests
  if (method !== 'GET') {
    return false;
  }

  // Don't cache certain paths
  const noCachePaths = ['/api/auth/', '/api/admin/', '/api/upload/'];
  if (noCachePaths.some(path => url.pathname.startsWith(path))) {
    return false;
  }

  return true;
}

// Export singleton instances
export const responseCache = new ResponseCache();
export { compressionManager as default };

