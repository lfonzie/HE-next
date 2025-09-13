'use client';

import React from 'react';
import { MathText } from '@/components/ui/MathRenderer';

export default function TestMathPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Teste de Matemática com Unicode
        </h1>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Exemplo 1: Fórmula Quadrática
            </h3>
            <div className="prose prose-sm max-w-none">
              <MathText text="A fórmula quadrática é $x = (-b ± √(b² - 4ac))⁄(2a)$" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Exemplo 2: Integral
            </h3>
            <div className="prose prose-sm max-w-none">
              <MathText text="A integral definida: $$∫₀¹ x² dx = 1⁄3$$" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Exemplo 3: Derivada
            </h3>
            <div className="prose prose-sm max-w-none">
              <MathText text="A **derivada** de $f(x) = x²$ é $f'(x) = 2x$." />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Exemplo 4: Símbolos Matemáticos
            </h3>
            <div className="prose prose-sm max-w-none">
              <MathText text="Símbolos: $α$, $β$, $π$, $∞$, $∑$, $∫$" />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            Como usar no chat:
          </h2>
          <div className="text-blue-800 space-y-2">
            <p><strong>Expressões inline:</strong> Use $expressão$ para matemática inline</p>
            <p><strong>Expressões em bloco:</strong> Use $$expressão$$ para matemática centralizada</p>
            <p><strong>Exemplos:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>$x² + y² = z²$</li>
              <li>$$∫₀¹ x² dx$$</li>
              <li>$a⁄b$ para frações</li>
              <li>$√x$ para raízes</li>
              <li>$α, β, π$ para símbolos gregos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
