"use client"

import React from "react";
import { ModuleId } from "@/lib/modules";
import { MathText } from "@/components/ui/MathRenderer";

interface MessageRendererProps {
  content: string;
  moduleId?: ModuleId | null;
  structured?: boolean;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ 
  content, 
  moduleId, 
  structured = false 
}) => {
  // Processar conteúdo markdown e LaTeX
  const processContent = (text: string) => {
    // Converter LaTeX para HTML
    let processedText = text
      // Headings
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-5 mb-3 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4 text-gray-900">$1</h1>')
      // LaTeX
      .replace(/\$\$(.*?)\$\$/g, '<div class="math-display">$$$1$$</div>')
      .replace(/\$(.*?)\$/g, '<span class="math-inline">$$$1$$</span>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code class="inline-code bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="code-block bg-gray-100 p-3 rounded-lg overflow-x-auto"><code class="text-sm font-mono">$1</code></pre>')
      // Lists
      .replace(/^\- (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^\* (.*$)/gm, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
      // Line breaks
      .replace(/\n/g, '<br>');

    return processedText;
  };

  return (
    <div className="message-renderer">
      <div className="prose prose-sm max-w-none">
        <MathText text={content} />
      </div>
    </div>
  );
};
