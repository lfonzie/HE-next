/**
 * Interactive Documentation Page
 * Showcases the technical documentation system with embedded diagrams and live examples
 */

'use client';

import React from 'react';
import { InteractiveDocumentation, DocumentationSection } from '@/components/docs/InteractiveDocumentation';

const documentationSections: DocumentationSection[] = [
  {
    id: 'overview',
    title: 'System Overview',
    content: `
      <h2>HE-Next Educational Platform</h2>
      <p>The HE-Next platform is a comprehensive educational system designed to provide interactive learning experiences through AI-powered content generation and advanced caching mechanisms.</p>
      
      <h3>Key Features</h3>
      <ul>
        <li><strong>AI-Powered Lesson Generation:</strong> Automated creation of educational content using GPT-4</li>
        <li><strong>Persistent Caching:</strong> IndexedDB-based offline storage for seamless learning</li>
        <li><strong>Interactive Components:</strong> Quizzes, drawings, and collaborative tools</li>
        <li><strong>Accessibility:</strong> Advanced screen reader support and ARIA compliance</li>
        <li><strong>API Optimization:</strong> Compression and intelligent caching strategies</li>
      </ul>
    `,
    type: 'text'
  },
  {
    id: 'architecture',
    title: 'System Architecture',
    content: 'The system follows a modern microservices architecture with React frontend and Node.js backend.',
    type: 'diagram',
    data: {
      id: 'arch-diagram',
      type: 'flowchart',
      title: 'System Architecture Flow',
      description: 'High-level overview of the system components and their interactions',
      data: {
        nodes: [
          { id: 0, label: 'Frontend (React)' },
          { id: 1, label: 'API Gateway' },
          { id: 2, label: 'Lesson Service' },
          { id: 3, label: 'Cache Layer' },
          { id: 4, label: 'Database' },
          { id: 5, label: 'AI Service' }
        ],
        edges: [
          { from: 0, to: 1 },
          { from: 1, to: 2 },
          { from: 2, to: 3 },
          { from: 2, to: 4 },
          { from: 2, to: 5 }
        ]
      },
      interactive: true
    }
  },
  {
    id: 'cache-system',
    title: 'Cache System',
    content: 'The caching system provides offline access and performance optimization.',
    type: 'diagram',
    data: {
      id: 'cache-diagram',
      type: 'sequence',
      title: 'Cache Flow Sequence',
      description: 'Sequence diagram showing cache interaction patterns',
      data: {
        participants: ['Client', 'Cache', 'API', 'Database'],
        messages: [
          { from: 0, to: 1, text: 'Request Data' },
          { from: 1, to: 0, text: 'Check Cache' },
          { from: 1, to: 2, text: 'Cache Miss' },
          { from: 2, to: 3, text: 'Query DB' },
          { from: 3, to: 2, text: 'Return Data' },
          { from: 2, to: 1, text: 'Store in Cache' },
          { from: 1, to: 0, text: 'Return Data' }
        ]
      },
      interactive: true
    },
    children: [
      {
        id: 'cache-implementation',
        title: 'Cache Implementation',
        content: 'Technical details of the IndexedDB cache implementation.',
        type: 'code',
        data: {
          id: 'cache-code',
          title: 'IndexedDB Cache Class',
          description: 'Core implementation of the persistent cache system',
          language: 'typescript',
          code: `export class IndexedDBCache {
  private db: IDBDatabase | null = null;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      dbName: 'he-next-cache',
      version: 1,
      maxSize: 100, // 100MB
      defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
      compressionThreshold: 1024, // 1KB
      ...config
    };
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('lessons')) {
          const lessonStore = db.createObjectStore('lessons', { keyPath: 'key' });
          lessonStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async set<T>(storeName: string, key: string, data: T, ttl?: number): Promise<void> {
    await this.initialize();

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      version: '1.0.0',
      metadata: {
        size: this.calculateSize(data),
        compressed: this.shouldCompress(data)
      }
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ key, ...entry });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}`,
          runnable: true,
          dependencies: ['IndexedDB', 'TypeScript']
        }
      }
    ]
  },
  {
    id: 'api-optimization',
    title: 'API Optimization',
    content: 'Advanced API optimization techniques including compression and caching.',
    type: 'diagram',
    data: {
      id: 'api-diagram',
      type: 'network',
      title: 'API Optimization Network',
      description: 'Network diagram showing API optimization strategies',
      data: {
        nodes: [
          { id: 0, label: 'Client' },
          { id: 1, label: 'CDN' },
          { id: 2, label: 'Load Balancer' },
          { id: 3, label: 'API Server 1' },
          { id: 4, label: 'API Server 2' },
          { id: 5, label: 'Cache Layer' },
          { id: 6, label: 'Database' }
        ],
        connections: [
          { from: 0, to: 1 },
          { from: 1, to: 2 },
          { from: 2, to: 3 },
          { from: 2, to: 4 },
          { from: 3, to: 5 },
          { from: 4, to: 5 },
          { from: 5, to: 6 }
        ]
      },
      interactive: true
    },
    children: [
      {
        id: 'compression-example',
        title: 'Response Compression',
        content: 'Example of implementing response compression in the API.',
        type: 'code',
        data: {
          id: 'compression-code',
          title: 'API Response Compression',
          description: 'Middleware for compressing API responses',
          language: 'javascript',
          code: `import compression from 'compression';
import { NextRequest, NextResponse } from 'next/server';

export function withCompression(handler) {
  return async (request: NextRequest) => {
    const response = await handler(request);
    
    // Check if client supports compression
    const acceptEncoding = request.headers.get('accept-encoding') || '';
    const supportsGzip = acceptEncoding.includes('gzip');
    const supportsBrotli = acceptEncoding.includes('br');
    
    if (supportsBrotli) {
      // Use Brotli compression for better ratio
      const compressed = await compressBrotli(response.body);
      return new NextResponse(compressed, {
        ...response,
        headers: {
          ...response.headers,
          'content-encoding': 'br',
          'content-length': compressed.length.toString()
        }
      });
    } else if (supportsGzip) {
      // Fallback to Gzip
      const compressed = await compressGzip(response.body);
      return new NextResponse(compressed, {
        ...response,
        headers: {
          ...response.headers,
          'content-encoding': 'gzip',
          'content-length': compressed.length.toString()
        }
      });
    }
    
    return response;
  };
}

async function compressBrotli(data: string): Promise<Buffer> {
  const { compress } = await import('brotli');
  return Buffer.from(compress(Buffer.from(data)));
}

async function compressGzip(data: string): Promise<Buffer> {
  const { gzip } = await import('zlib');
  return new Promise((resolve, reject) => {
    gzip(Buffer.from(data), (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}`,
          runnable: true,
          dependencies: ['compression', 'brotli', 'zlib']
        }
      }
    ]
  },
  {
    id: 'accessibility',
    title: 'Accessibility Features',
    content: 'Advanced accessibility features for inclusive learning experiences.',
    type: 'text',
    children: [
      {
        id: 'screen-reader',
        title: 'Screen Reader Support',
        content: 'Implementation of advanced screen reader compatibility.',
        type: 'code',
        data: {
          id: 'screen-reader-code',
          title: 'Screen Reader Integration',
          description: 'React hook for screen reader announcements',
          language: 'typescript',
          code: `import { useEffect, useRef } from 'react';

export interface ScreenReaderOptions {
  priority?: 'polite' | 'assertive';
  timeout?: number;
}

export function useScreenReader(options: ScreenReaderOptions = {}) {
  const { priority = 'polite', timeout = 1000 } = options;
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
    announcementRef.current = liveRegion;

    return () => {
      document.body.removeChild(liveRegion);
    };
  }, [priority]);

  const announce = (message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
      
      // Clear after timeout to allow re-announcement
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, timeout);
    }
  };

  const announceProgress = (current: number, total: number) => {
    const percentage = Math.round((current / total) * 100);
    announce(\`Progress: \${current} of \${total} completed (\${percentage}%)\`);
  };

  const announceError = (message: string) => {
    announce(\`Error: \${message}\`);
  };

  const announceSuccess = (message: string) => {
    announce(\`Success: \${message}\`);
  };

  return {
    announce,
    announceProgress,
    announceError,
    announceSuccess
  };
}

// Usage in components
export function LessonProgress({ current, total }: { current: number; total: number }) {
  const { announceProgress } = useScreenReader();

  useEffect(() => {
    announceProgress(current, total);
  }, [current, total, announceProgress]);

  return (
    <div 
      role="progressbar" 
      aria-valuenow={current} 
      aria-valuemin={0} 
      aria-valuemax={total}
      aria-label={\`Lesson progress: \${current} of \${total} slides\`}
    >
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: \`\${(current / total) * 100}%\` }}
        />
      </div>
    </div>
  );
}`,
          runnable: true,
          dependencies: ['React', 'TypeScript']
        }
      }
    ]
  },
  {
    id: 'template-system',
    title: 'Template System',
    content: 'Reusable lesson template system for consistent content creation.',
    type: 'interactive',
    data: {
      id: 'template-interactive',
      title: 'Template Builder',
      description: 'Interactive template creation tool',
      language: 'typescript',
      code: `// Template system implementation
export interface LessonTemplate {
  id: string;
  name: string;
  description: string;
  structure: TemplateSection[];
  metadata: TemplateMetadata;
}

export interface TemplateSection {
  id: string;
  type: 'content' | 'quiz' | 'interactive' | 'assessment';
  title: string;
  required: boolean;
  order: number;
  config: Record<string, any>;
}

export class TemplateBuilder {
  private template: Partial<LessonTemplate> = {};

  setName(name: string): TemplateBuilder {
    this.template.name = name;
    return this;
  }

  setDescription(description: string): TemplateBuilder {
    this.template.description = description;
    return this;
  }

  addSection(section: TemplateSection): TemplateBuilder {
    if (!this.template.structure) {
      this.template.structure = [];
    }
    this.template.structure.push(section);
    return this;
  }

  build(): LessonTemplate {
    return {
      id: generateId(),
      name: this.template.name || 'Untitled Template',
      description: this.template.description || '',
      structure: this.template.structure || [],
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        author: 'System'
      }
    };
  }
}

// Usage example
const template = new TemplateBuilder()
  .setName('Science Lesson Template')
  .setDescription('Standard template for science lessons')
  .addSection({
    id: 'intro',
    type: 'content',
    title: 'Introduction',
    required: true,
    order: 1,
    config: { duration: 5, slides: 2 }
  })
  .addSection({
    id: 'quiz',
    type: 'quiz',
    title: 'Knowledge Check',
    required: true,
    order: 2,
    config: { questions: 5, timeLimit: 10 }
  })
  .build();`,
      runnable: true,
      dependencies: ['TypeScript']
    }
  }
];

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <InteractiveDocumentation
        sections={documentationSections}
        title="HE-Next Technical Documentation"
        description="Comprehensive technical documentation for the HE-Next educational platform, featuring interactive diagrams, live code examples, and detailed implementation guides."
        version="2.0.0"
        lastUpdated="2024-01-15"
        className="py-8"
      />
    </div>
  );
}

