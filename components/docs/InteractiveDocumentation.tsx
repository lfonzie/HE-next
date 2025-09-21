/**
 * Interactive Documentation System
 * Provides embedded diagrams, live examples, and interactive code snippets
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Code, 
  Eye, 
  Download, 
  Share2, 
  BookOpen, 
  Zap,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw
} from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import tomorrow from 'react-syntax-highlighter/dist/styles/tomorrow';

export interface DiagramData {
  id: string;
  type: 'flowchart' | 'sequence' | 'class' | 'state' | 'network' | 'custom';
  title: string;
  description: string;
  data: any;
  interactive?: boolean;
  editable?: boolean;
}

export interface CodeExample {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  runnable?: boolean;
  output?: string;
  dependencies?: string[];
}

export interface DocumentationSection {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'diagram' | 'code' | 'interactive';
  data?: DiagramData | CodeExample;
  children?: DocumentationSection[];
}

export interface InteractiveDocumentationProps {
  sections: DocumentationSection[];
  title: string;
  description?: string;
  version?: string;
  lastUpdated?: string;
  className?: string;
}

export function InteractiveDocumentation({
  sections,
  title,
  description,
  version,
  lastUpdated,
  className = ''
}: InteractiveDocumentationProps) {
  const [activeSection, setActiveSection] = useState<string>(sections[0]?.id || '');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [fullscreenDiagram, setFullscreenDiagram] = useState<string | null>(null);

  const handleSectionToggle = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const renderSection = (section: DocumentationSection, level: number = 0) => {
    const isExpanded = expandedSections.has(section.id);
    const hasChildren = section.children && section.children.length > 0;

    return (
      <div key={section.id} className={`${level > 0 ? 'ml-4' : ''}`}>
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveSection(section.id)}
            className={`text-left justify-start flex-1 ${
              activeSection === section.id ? 'bg-blue-50 text-blue-700' : ''
            }`}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {section.title}
          </Button>
          
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSectionToggle(section.id)}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {activeSection === section.id && (
          <Card className="mb-4">
            <CardContent className="pt-4">
              {renderSectionContent(section)}
            </CardContent>
          </Card>
        )}

        {hasChildren && isExpanded && (
          <div className="space-y-2">
            {section.children!.map(child => renderSection(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderSectionContent = (section: DocumentationSection) => {
    switch (section.type) {
      case 'text':
        return (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: section.content }} />
          </div>
        );

      case 'diagram':
        return section.data ? (
          <DiagramRenderer 
            diagram={section.data as DiagramData}
            onFullscreen={() => setFullscreenDiagram(section.data!.id)}
          />
        ) : null;

      case 'code':
        return section.data ? (
          <CodeExampleRenderer 
            example={section.data as CodeExample}
            onCopy={copyToClipboard}
            copiedId={copiedCode}
          />
        ) : null;

      case 'interactive':
        return section.data ? (
          <InteractiveExampleRenderer 
            example={section.data as CodeExample}
          />
        ) : null;

      default:
        return <div>{section.content}</div>;
    }
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="text-lg text-gray-600 mt-2">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {version && (
              <Badge variant="outline">v{version}</Badge>
            )}
            {lastUpdated && (
              <Badge variant="secondary">
                Updated {new Date(lastUpdated).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {sections.map(section => renderSection(section))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {sections.find(s => s.id === activeSection) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {sections.find(s => s.id === activeSection)?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderSectionContent(sections.find(s => s.id === activeSection)!)}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Fullscreen Diagram Modal */}
      {fullscreenDiagram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Diagram View</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFullscreenDiagram(null)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              {sections
                .flatMap(s => [s, ...(s.children || [])])
                .find(s => s.data?.id === fullscreenDiagram)?.data && (
                <DiagramRenderer 
                  diagram={sections
                    .flatMap(s => [s, ...(s.children || [])])
                    .find(s => s.data?.id === fullscreenDiagram)!.data as DiagramData}
                  fullscreen
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Diagram Renderer Component
function DiagramRenderer({ 
  diagram, 
  onFullscreen, 
  fullscreen = false 
}: { 
  diagram: DiagramData; 
  onFullscreen?: () => void;
  fullscreen?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && diagram.data) {
      renderDiagram(canvasRef.current, diagram);
    }
  }, [diagram]);

  const renderDiagram = (canvas: HTMLCanvasElement, diagramData: DiagramData) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Basic diagram rendering based on type
    switch (diagramData.type) {
      case 'flowchart':
        renderFlowchart(ctx, diagramData.data, canvas.width, canvas.height);
        break;
      case 'sequence':
        renderSequenceDiagram(ctx, diagramData.data, canvas.width, canvas.height);
        break;
      case 'network':
        renderNetworkDiagram(ctx, diagramData.data, canvas.width, canvas.height);
        break;
      default:
        renderGenericDiagram(ctx, diagramData.data, canvas.width, canvas.height);
    }
  };

  const renderFlowchart = (ctx: CanvasRenderingContext2D, data: any, width: number, height: number) => {
    // Simple flowchart rendering
    ctx.strokeStyle = '#3b82f6';
    ctx.fillStyle = '#dbeafe';
    ctx.lineWidth = 2;

    const nodes = data.nodes || [];
    const edges = data.edges || [];

    // Draw nodes
    nodes.forEach((node: any, index: number) => {
      const x = (width / (nodes.length + 1)) * (index + 1);
      const y = height / 2;
      
      ctx.fillRect(x - 40, y - 20, 80, 40);
      ctx.strokeRect(x - 40, y - 20, 80, 40);
      
      ctx.fillStyle = '#1f2937';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label || `Node ${index + 1}`, x, y + 5);
      ctx.fillStyle = '#dbeafe';
    });

    // Draw edges
    edges.forEach((edge: any) => {
      const fromNode = nodes[edge.from];
      const toNode = nodes[edge.to];
      if (fromNode && toNode) {
        const fromX = (width / (nodes.length + 1)) * (edge.from + 1);
        const toX = (width / (nodes.length + 1)) * (edge.to + 1);
        const y = height / 2;
        
        ctx.beginPath();
        ctx.moveTo(fromX + 40, y);
        ctx.lineTo(toX - 40, y);
        ctx.stroke();
        
        // Arrow
        ctx.beginPath();
        ctx.moveTo(toX - 40, y);
        ctx.lineTo(toX - 50, y - 5);
        ctx.lineTo(toX - 50, y + 5);
        ctx.closePath();
        ctx.fill();
      }
    });
  };

  const renderSequenceDiagram = (ctx: CanvasRenderingContext2D, data: any, width: number, height: number) => {
    // Simple sequence diagram rendering
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;

    const participants = data.participants || ['A', 'B', 'C'];
    const messages = data.messages || [];

    const participantWidth = width / participants.length;
    const startY = 50;
    const messageSpacing = 40;

    // Draw participants
    participants.forEach((participant: string, index: number) => {
      const x = participantWidth * index + participantWidth / 2;
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, height - 50);
      ctx.stroke();
      
      ctx.fillStyle = '#1f2937';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(participant, x, startY - 10);
    });

    // Draw messages
    messages.forEach((message: any, index: number) => {
      const y = startY + (index + 1) * messageSpacing;
      const fromX = participantWidth * message.from + participantWidth / 2;
      const toX = participantWidth * message.to + participantWidth / 2;
      
      ctx.beginPath();
      ctx.moveTo(fromX, y);
      ctx.lineTo(toX, y);
      ctx.stroke();
      
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(message.text || `Message ${index + 1}`, (fromX + toX) / 2, y - 5);
    });
  };

  const renderNetworkDiagram = (ctx: CanvasRenderingContext2D, data: any, width: number, height: number) => {
    // Simple network diagram rendering
    ctx.strokeStyle = '#3b82f6';
    ctx.fillStyle = '#dbeafe';
    ctx.lineWidth = 2;

    const nodes = data.nodes || [];
    const connections = data.connections || [];

    // Draw nodes
    nodes.forEach((node: any, index: number) => {
      const angle = (2 * Math.PI * index) / nodes.length;
      const x = width / 2 + Math.cos(angle) * (width / 3);
      const y = height / 2 + Math.sin(angle) * (height / 3);
      
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label || `N${index + 1}`, x, y + 4);
      ctx.fillStyle = '#dbeafe';
    });

    // Draw connections
    connections.forEach((conn: any) => {
      const fromNode = nodes[conn.from];
      const toNode = nodes[conn.to];
      if (fromNode && toNode) {
        const fromAngle = (2 * Math.PI * conn.from) / nodes.length;
        const toAngle = (2 * Math.PI * conn.to) / nodes.length;
        const fromX = width / 2 + Math.cos(fromAngle) * (width / 3);
        const fromY = height / 2 + Math.sin(fromAngle) * (height / 3);
        const toX = width / 2 + Math.cos(toAngle) * (width / 3);
        const toY = height / 2 + Math.sin(toAngle) * (height / 3);
        
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
      }
    });
  };

  const renderGenericDiagram = (ctx: CanvasRenderingContext2D, data: any, width: number, height: number) => {
    // Generic diagram rendering
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#1f2937';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Diagram Preview', width / 2, height / 2);
    ctx.fillText('Interactive rendering coming soon', width / 2, height / 2 + 30);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{diagram.title}</h3>
          <p className="text-sm text-gray-600">{diagram.description}</p>
        </div>
        {onFullscreen && !fullscreen && (
          <Button variant="outline" size="sm" onClick={onFullscreen}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        )}
      </div>
      
      <div className="border rounded-lg p-4 bg-gray-50">
        <canvas
          ref={canvasRef}
          width={fullscreen ? 800 : 600}
          height={fullscreen ? 600 : 400}
          className="max-w-full h-auto border rounded"
        />
      </div>
      
      {diagram.interactive && (
        <div className="flex gap-2">
          <Badge variant="outline">Interactive</Badge>
          {diagram.editable && <Badge variant="outline">Editable</Badge>}
        </div>
      )}
    </div>
  );
}

// Code Example Renderer Component
function CodeExampleRenderer({ 
  example, 
  onCopy, 
  copiedId 
}: { 
  example: CodeExample; 
  onCopy: (code: string, id: string) => void;
  copiedId: string | null;
}) {
  const [showOutput, setShowOutput] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{example.title}</h3>
          <p className="text-sm text-gray-600">{example.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopy(example.code, example.id)}
          >
            {copiedId === example.id ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copiedId === example.id ? 'Copied!' : 'Copy'}
          </Button>
          {example.runnable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOutput(!showOutput)}
            >
              <Play className="h-4 w-4 mr-2" />
              {showOutput ? 'Hide' : 'Run'}
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <SyntaxHighlighter
          language={example.language}
          style={tomorrow}
          customStyle={{
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.5'
          }}
        >
          {example.code}
        </SyntaxHighlighter>
      </div>

      {example.dependencies && example.dependencies.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Dependencies:</h4>
          <div className="flex flex-wrap gap-2">
            {example.dependencies.map((dep, index) => (
              <Badge key={index} variant="secondary">{dep}</Badge>
            ))}
          </div>
        </div>
      )}

      {showOutput && example.output && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium mb-2">Output:</h4>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {example.output}
          </pre>
        </div>
      )}
    </div>
  );
}

// Interactive Example Renderer Component
function InteractiveExampleRenderer({ example }: { example: CodeExample }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    try {
      // Simulate code execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOutput(`Executed: ${input || example.code}`);
    } catch (error) {
      setOutput(`Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{example.title}</h3>
        <p className="text-sm text-gray-600">{example.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Input:</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your input here..."
            className="w-full h-32 p-3 border rounded-lg resize-none"
          />
          <Button onClick={runCode} disabled={isRunning} className="w-full">
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Code
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Output:</label>
          <div className="w-full h-32 p-3 border rounded-lg bg-gray-50 overflow-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {output || 'Output will appear here...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

