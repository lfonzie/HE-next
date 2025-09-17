'use client';

import React from 'react';

interface MathRendererProps {
  content: string;
  inline?: boolean;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ 
  content, 
  inline = false, 
  className = '' 
}) => {
  // Função completa para converter LaTeX para Unicode
  const latexToUnicode = (text: string): string => {
    return text
      // Frações
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1⁄$2')
      .replace(/\\frac\s*([^\s]+)\s*([^\s]+)/g, '$1⁄$2')
      // Raízes
      .replace(/\\sqrt\{([^}]+)\}/g, '√$1')
      .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1√$2')
      // Potências e subscritos
      .replace(/\^(\d+)/g, '^$1')
      .replace(/\^([a-zA-Z])/g, '^$1')
      .replace(/_(\d+)/g, '_$1')
      .replace(/_([a-zA-Z])/g, '_$1')
      // Símbolos matemáticos básicos
      .replace(/\\pm/g, '±')
      .replace(/\\mp/g, '∓')
      .replace(/\\times/g, '×')
      .replace(/\\cdot/g, '·')
      .replace(/\\div/g, '÷')
      .replace(/\\neq/g, '≠')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥')
      .replace(/\\approx/g, '≈')
      .replace(/\\infty/g, '∞')
      .replace(/\\sum/g, '∑')
      .replace(/\\int/g, '∫')
      .replace(/\\lim/g, 'lim')
      // Letras gregas
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\delta/g, 'δ')
      .replace(/\\epsilon/g, 'ε')
      .replace(/\\zeta/g, 'ζ')
      .replace(/\\eta/g, 'η')
      .replace(/\\theta/g, 'θ')
      .replace(/\\iota/g, 'ι')
      .replace(/\\kappa/g, 'κ')
      .replace(/\\lambda/g, 'λ')
      .replace(/\\mu/g, 'μ')
      .replace(/\\nu/g, 'ν')
      .replace(/\\xi/g, 'ξ')
      .replace(/\\pi/g, 'π')
      .replace(/\\rho/g, 'ρ')
      .replace(/\\sigma/g, 'σ')
      .replace(/\\tau/g, 'τ')
      .replace(/\\upsilon/g, 'υ')
      .replace(/\\phi/g, 'φ')
      .replace(/\\chi/g, 'χ')
      .replace(/\\psi/g, 'ψ')
      .replace(/\\omega/g, 'ω')
      // Derivadas
      .replace(/\\partial/g, '∂')
      .replace(/\\nabla/g, '∇')
      // Conjuntos
      .replace(/\\in/g, '∈')
      .replace(/\\notin/g, '∉')
      .replace(/\\subset/g, '⊂')
      .replace(/\\supset/g, '⊃')
      .replace(/\\cup/g, '∪')
      .replace(/\\cap/g, '∩')
      .replace(/\\emptyset/g, '∅')
      .replace(/\\mathbb\{R\}/g, 'ℝ')
      .replace(/\\mathbb\{N\}/g, 'ℕ')
      .replace(/\\mathbb\{Z\}/g, 'ℤ')
      .replace(/\\mathbb\{Q\}/g, 'ℚ')
      .replace(/\\mathbb\{C\}/g, 'ℂ')
      // Lógica
      .replace(/\\land/g, '∧')
      .replace(/\\lor/g, '∨')
      .replace(/\\neg/g, '¬')
      .replace(/\\implies/g, '⇒')
      .replace(/\\iff/g, '⇔')
      // Outros símbolos
      .replace(/\\rightarrow/g, '→')
      .replace(/\\leftarrow/g, '←')
      .replace(/\\leftrightarrow/g, '↔')
      .replace(/\\uparrow/g, '↑')
      .replace(/\\downarrow/g, '↓')
      // Parênteses, colchetes e chaves
      .replace(/\\left\(/g, '(')
      .replace(/\\right\)/g, ')')
      .replace(/\\left\[/g, '[')
      .replace(/\\right\]/g, ']')
      .replace(/\\left\{/g, '{')
      .replace(/\\right\}/g, '}')
      // Limpar espaços extras
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const unicodeContent = latexToUnicode(content);
  
  return (
    <span 
      className={`${inline ? 'math-inline' : 'math-block'} ${className}`}
    >
      {unicodeContent}
    </span>
  );
};

// Componente para processar texto com expressões matemáticas misturadas
interface MathTextProps {
  text: string;
  className?: string;
}

// Função para processar markdown básico
const processMarkdown = (text: string): string => {
  return text
    // Headings
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-5 mb-3 text-gray-900">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-4 text-gray-900">$1</h1>')
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
};

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  // Regex para encontrar expressões matemáticas
  const mathRegex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mathRegex.exec(text)) !== null) {
    // Adicionar texto antes da expressão matemática
    if (match.index > lastIndex) {
      const textContent = text.slice(lastIndex, match.index);
      parts.push({
        type: 'text',
        content: processMarkdown(textContent)
      });
    }

    // Determinar se é expressão inline ($...$) ou block ($$...$$)
    const isBlock = match[1] !== undefined;
    const mathContent = isBlock ? match[1] : match[2];

    parts.push({
      type: 'math',
      content: mathContent,
      inline: !isBlock
    });

    lastIndex = match.index + match[0].length;
  }

  // Adicionar texto restante
  if (lastIndex < text.length) {
    const textContent = text.slice(lastIndex);
    parts.push({
      type: 'text',
      content: processMarkdown(textContent)
    });
  }

  return (
    <div className={className}>
      <span dangerouslySetInnerHTML={{ __html: processMarkdown(text) }} />
    </div>
  );
};



export default MathRenderer;