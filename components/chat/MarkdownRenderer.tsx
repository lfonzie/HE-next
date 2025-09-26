"use client"

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { normalizeUnicode, processMessageForDisplay, convertMathToUnicode, forceConvertMathToUnicode } from "@/utils/unicode";
import { normalizeFormulas } from "@/lib/utils/latex-normalization";
import "highlight.js/styles/github.css";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isStreaming?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = "",
  isStreaming = false
}) => {
  // Para streaming, usar processamento mais simples e rápido
  if (isStreaming) {
    return (
      <div className={`markdown-content ${className}`}>
        <div className="text-gray-700 dark:text-gray-300 leading-normal whitespace-pre-line">
          {content}
        </div>
      </div>
    )
  }
  
  // Processar Unicode e normalizar conteúdo apenas quando não está streaming
  const processedContent = processMessageForDisplay(content);
  const latexNormalizedContent = normalizeFormulas(processedContent);
  const mathProcessedContent = forceConvertMathToUnicode(latexNormalizedContent);
  // Preservar quebras de linha duplas para separação de parágrafos
  const normalizedContent = mathProcessedContent.replace(/\n{3,}/g, '\n\n').trim();
  
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        skipHtml={false}
        allowElement={(element, index, parent) => {
          // Permitir todos os elementos por padrão
          return true;
        }}
        components={{
          // Headers
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mt-5 mb-3 text-gray-900 dark:text-gray-100">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold mt-3 mb-2 text-gray-900 dark:text-gray-100">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-semibold mt-2 mb-1 text-gray-900 dark:text-gray-100">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-xs font-semibold mt-2 mb-1 text-gray-900 dark:text-gray-100">
              {children}
            </h6>
          ),
          
          // Paragraphs - ajustado para reduzir espaçamento excessivo
          p: ({ children }) => (
            <p className="mb-2 text-gray-700 dark:text-gray-300 leading-normal whitespace-pre-line">
              {children}
            </p>
          ),
          
          // Bold and italic - sem quebra de linha
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 dark:text-gray-100 inline">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-800 dark:text-gray-200">
              {children}
            </em>
          ),
          
          // Code
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                  {children}
                </code>
              );
            }
            return (
              <code className={className}>
                {children}
              </code>
            );
          },
          
          // Code blocks
          pre: ({ children }) => (
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700 mb-4">
              {children}
            </pre>
          ),
          
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700 dark:text-gray-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="ml-2 text-gray-700 dark:text-gray-300">
              {children}
            </li>
          ),
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 italic">
              {children}
            </blockquote>
          ),
          
          // Links
          a: ({ children, href }) => (
            <a 
              href={href} 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50 dark:bg-gray-800">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
              {children}
            </td>
          ),
          
          // Horizontal rule
          hr: () => (
            <hr className="my-6 border-gray-200 dark:border-gray-700" />
          ),
          
          // Math (KaTeX)
          div: ({ children, className }) => {
            if (className?.includes('math')) {
              return (
                <div className="my-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
                  {children}
                </div>
              );
            }
            return <div className={className}>{children}</div>;
          },
          
          // Inline math
          span: ({ children, className }) => {
            if (className?.includes('math')) {
              return (
                <span className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm border border-gray-200 dark:border-gray-700">
                  {children}
                </span>
              );
            }
            return <span className={className}>{children}</span>;
          },
          
          // Quebras de linha
          br: () => (
            <br className="block" />
          )
        }}
      >
        {normalizedContent || ''}
      </ReactMarkdown>
      
      {/* Indicador de streaming */}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1"></span>
      )}
    </div>
  );
};

export default MarkdownRenderer;

