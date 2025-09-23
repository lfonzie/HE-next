'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Upload, PenTool, CheckCircle, AlertCircle, Loader2, Award, Download, Copy, Star, Target, BookOpen } from 'lucide-react';

interface RedacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface CompetencyScore {
  competency: string;
  score: number;
  maxScore: number;
  feedback: string;
  suggestions: string[];
}

interface RedacaoEvaluation {
  id: string;
  text: string;
  totalScore: number;
  competencies: CompetencyScore[];
  overallFeedback: string;
  suggestions: string[];
  createdAt: Date;
  wordCount: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export function RedacaoModal({ isOpen, onClose, className = '' }: RedacaoModalProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'upload' | 'history'>('write');
  const [essayText, setEssayText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<RedacaoEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('write');
      setEssayText('');
      setEvaluation(null);
      setError(null);
      setUploadedFile(null);
    }
  }, [isOpen]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // Simulate file reading
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setEssayText(text);
      };
      reader.readAsText(file);
    }
  };

  const evaluateEssay = async () => {
    if (!essayText.trim()) {
      setError('Por favor, escreva ou envie uma redação para avaliação');
      return;
    }

    setIsEvaluating(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockEvaluation: RedacaoEvaluation = {
        id: `eval-${Date.now()}`,
        text: essayText,
        totalScore: 850,
        wordCount: essayText.split(/\s+/).length,
        grade: 'B',
        competencies: [
          {
            competency: 'Domínio da escrita formal',
            score: 160,
            maxScore: 200,
            feedback: 'Bom domínio da norma padrão, com poucos desvios gramaticais.',
            suggestions: ['Revisar concordância verbal', 'Atenção à pontuação']
          },
          {
            competency: 'Compreensão do tema',
            score: 180,
            maxScore: 200,
            feedback: 'Excelente compreensão e desenvolvimento do tema proposto.',
            suggestions: ['Manter o foco no tema', 'Evitar tangentes']
          },
          {
            competency: 'Argumentação',
            score: 160,
            maxScore: 200,
            feedback: 'Argumentos bem estruturados e convincentes.',
            suggestions: ['Adicionar mais exemplos', 'Fortalecer contra-argumentos']
          },
          {
            competency: 'Coerência e coesão',
            score: 170,
            maxScore: 200,
            feedback: 'Texto bem articulado e coerente.',
            suggestions: ['Melhorar conectivos', 'Revisar progressão textual']
          },
          {
            competency: 'Proposta de intervenção',
            score: 180,
            maxScore: 200,
            feedback: 'Proposta clara e viável para o problema.',
            suggestions: ['Detalhar mais a proposta', 'Incluir agentes específicos']
          }
        ],
        overallFeedback: 'Redação bem estruturada com argumentos sólidos. Pontos de melhoria incluem maior atenção aos aspectos gramaticais e desenvolvimento mais detalhado da proposta de intervenção.',
        suggestions: [
          'Revisar concordância verbal e nominal',
          'Adicionar mais exemplos concretos',
          'Melhorar conectivos entre parágrafos',
          'Detalhar melhor a proposta de intervenção'
        ],
        createdAt: new Date()
      };

      setEvaluation(mockEvaluation);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao avaliar redação');
    } finally {
      setIsEvaluating(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 900) return 'text-green-600';
    if (score >= 800) return 'text-blue-600';
    if (score >= 700) return 'text-yellow-600';
    if (score >= 600) return 'text-orange-600';
    return 'text-red-600';
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const downloadEvaluation = () => {
    if (!evaluation) return;

    const content = `
AVALIAÇÃO DE REDAÇÃO - ENEM
Data: ${evaluation.createdAt.toLocaleDateString('pt-BR')}
Nota: ${evaluation.totalScore} pontos
Conceito: ${evaluation.grade}

COMPETÊNCIAS AVALIADAS:
${evaluation.competencies.map(comp => `
${comp.competency}: ${comp.score}/${comp.maxScore} pontos
Feedback: ${comp.feedback}
Sugestões: ${comp.suggestions.join(', ')}
`).join('\n')}

FEEDBACK GERAL:
${evaluation.overallFeedback}

SUGESTÕES DE MELHORIA:
${evaluation.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}

REDAÇÃO:
${evaluation.text}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `avaliacao-redacao-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-500 to-violet-600 rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Correção de Redação</h2>
              <p className="text-sm opacity-90">Avalie sua redação com critérios oficiais do ENEM</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('write')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'write' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <PenTool className="w-4 h-4 inline mr-2" />
                Escrever
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'upload' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Enviar Arquivo
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'history' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Histórico
              </button>
            </div>

            {/* Word Count */}
            {essayText && (
              <div className="mt-6 p-3 bg-white rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-2">Estatísticas</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Palavras: {essayText.split(/\s+/).length}</div>
                  <div>Caracteres: {essayText.length}</div>
                  <div>Parágrafos: {essayText.split('\n\n').length}</div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'write' && (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Escreva sua redação</h3>
                  <p className="text-gray-600 text-sm">
                    Digite sua redação diretamente no editor abaixo. A avaliação seguirá os critérios oficiais do ENEM.
                  </p>
                </div>

                <div className="mb-6">
                  <textarea
                    value={essayText}
                    onChange={(e) => setEssayText(e.target.value)}
                    placeholder="Digite sua redação aqui..."
                    className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm leading-relaxed"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={evaluateEssay}
                    disabled={!essayText.trim() || isEvaluating}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                  >
                    {isEvaluating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {isEvaluating ? 'Avaliando...' : 'Avaliar Redação'}
                  </button>
                  
                  <button
                    onClick={() => setEssayText('')}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Limpar
                  </button>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'upload' && (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Enviar arquivo</h3>
                  <p className="text-gray-600 text-sm">
                    Envie um arquivo de texto (.txt, .doc, .docx) com sua redação para avaliação.
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="mb-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-purple-600 font-medium hover:text-purple-700">
                        Clique para selecionar um arquivo
                      </span>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".txt,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-gray-500 text-sm mt-2">
                      ou arraste e solte aqui
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Formatos aceitos: TXT, DOC, DOCX (máx. 10MB)
                  </p>
                </div>

                {uploadedFile && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-700">
                        Arquivo carregado: {uploadedFile.name}
                      </span>
                    </div>
                  </div>
                )}

                {essayText && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Pré-visualização:</h4>
                    <div className="p-4 bg-gray-50 rounded-lg max-h-40 overflow-y-auto text-sm">
                      {essayText.substring(0, 500)}
                      {essayText.length > 500 && '...'}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={evaluateEssay}
                    disabled={!essayText.trim() || isEvaluating}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                  >
                    {isEvaluating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {isEvaluating ? 'Avaliando...' : 'Avaliar Redação'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Avaliações</h3>
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma avaliação realizada ainda</p>
                  <p className="text-sm">Avalie uma redação para ver seu histórico aqui</p>
                </div>
              </div>
            )}

            {/* Evaluation Results */}
            {evaluation && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Resultado da Avaliação</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(evaluation.text)}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copiar
                      </button>
                      <button
                        onClick={downloadEvaluation}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Baixar
                      </button>
                    </div>
                  </div>

                  {/* Score Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-white rounded-lg border">
                      <div className={`text-3xl font-bold ${getScoreColor(evaluation.totalScore)}`}>
                        {evaluation.totalScore}
                      </div>
                      <div className="text-sm text-gray-600">Pontos totais</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                      <div className={`text-3xl font-bold ${getGradeColor(evaluation.grade).split(' ')[0]}`}>
                        {evaluation.grade}
                      </div>
                      <div className="text-sm text-gray-600">Conceito</div>
                    </div>
                    <div className="p-4 bg-white rounded-lg border">
                      <div className="text-3xl font-bold text-gray-900">
                        {evaluation.wordCount}
                      </div>
                      <div className="text-sm text-gray-600">Palavras</div>
                    </div>
                  </div>

                  {/* Competencies */}
                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-gray-900">Competências Avaliadas</h4>
                    {evaluation.competencies.map((comp, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900">{comp.competency}</h5>
                          <div className="text-lg font-bold text-gray-900">
                            {comp.score}/{comp.maxScore}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(comp.score / comp.maxScore) * 100}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{comp.feedback}</p>
                        <div className="text-xs text-gray-500">
                          <strong>Sugestões:</strong> {comp.suggestions.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overall Feedback */}
                  <div className="p-4 bg-white rounded-lg border mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Feedback Geral</h4>
                    <p className="text-gray-700">{evaluation.overallFeedback}</p>
                  </div>

                  {/* Suggestions */}
                  <div className="p-4 bg-blue-50 rounded-lg border">
                    <h4 className="font-semibold text-blue-900 mb-2">Sugestões de Melhoria</h4>
                    <ul className="text-blue-800 space-y-1">
                      {evaluation.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Star className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
