'use client';

import { FileText, Upload, PenTool, CheckCircle, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  onStartCorrection: (type: 'write' | 'upload') => void;
  className?: string;
}

export function RedacaoSuggestion({ onStartCorrection, className = '' }: Props) {
  const router = useRouter();

  const handleWriteEssay = () => {
    onStartCorrection('write');
    // Navigate to essay writing page
    router.push('/redacao?mode=write');
  };

  const handleUploadEssay = () => {
    onStartCorrection('upload');
    // Navigate to essay upload page
    router.push('/redacao?mode=upload');
  };

  return (
    <div
      className={`mt-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200 ${className}`}
      role="region"
      aria-label="Sugestão de Correção de Redação"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-medium text-purple-900 text-lg">Correção de Redação</h4>
          <p className="text-sm text-purple-700">
            Avalie sua redação com critérios oficiais do ENEM
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* Write Essay */}
        <button
          onClick={handleWriteEssay}
          className="p-4 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 group"
          aria-label="Escrever redação"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <PenTool className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-left">
              <h5 className="font-medium text-gray-900">Escrever Redação</h5>
              <p className="text-sm text-gray-600">Editor integrado</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-left">
            Escreva sua redação diretamente na plataforma
          </p>
        </button>

        {/* Upload Essay */}
        <button
          onClick={handleUploadEssay}
          className="p-4 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 group"
          aria-label="Enviar arquivo de redação"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Upload className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-left">
              <h5 className="font-medium text-gray-900">Enviar Arquivo</h5>
              <p className="text-sm text-gray-600">PDF, DOC, TXT</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-left">
            Envie um arquivo já escrito para correção
          </p>
        </button>
      </div>

      {/* ENEM Criteria */}
      <div className="bg-white/50 rounded-lg p-3 mb-4">
        <h5 className="font-medium text-purple-900 mb-2 text-sm">📝 Critérios de Correção ENEM:</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-purple-700">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
            <span>Competência 1: Domínio da escrita</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
            <span>Competência 2: Compreensão do tema</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
            <span>Competência 3: Argumentação</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
            <span>Competência 4: Coerência</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
            <span>Competência 5: Proposta de intervenção</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white/50 rounded-lg p-3">
        <h5 className="font-medium text-purple-900 mb-2 text-sm">✨ Recursos incluídos:</h5>
        <div className="grid grid-cols-2 gap-2 text-xs text-purple-700">
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
            <span>Correção automática</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
            <span>Feedback detalhado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
            <span>Temas oficiais ENEM</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
            <span>Sugestões de melhoria</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-3 pt-3 border-t border-purple-200">
        <div className="flex items-center justify-between text-xs text-purple-600">
          <span className="flex items-center gap-1">
            <Award className="w-3 h-3" />
            Nota máxima: 1000 pontos
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Critérios oficiais
          </span>
        </div>
      </div>
    </div>
  );
}
