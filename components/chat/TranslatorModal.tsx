'use client';

import React, { useState, useEffect } from 'react';
import { X, Languages, Copy, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface TranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
  className?: string;
}

interface Language {
  code: string;
  name: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
];

export function TranslatorModal({ isOpen, onClose, initialText = '', className = '' }: TranslatorModalProps) {
  const [sourceText, setSourceText] = useState(initialText);
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialText) {
      setSourceText(initialText);
      translateText(initialText);
    }
  }, [isOpen, initialText]);

  const translateText = async (text: string) => {
    if (!text.trim()) {
      setTranslatedText('');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call - in real implementation, use Google Translate API or similar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock translation for demo purposes
      const mockTranslations: Record<string, string> = {
        'hello': 'olá',
        'world': 'mundo',
        'good morning': 'bom dia',
        'thank you': 'obrigado',
        'how are you': 'como você está',
        'olá': 'hello',
        'mundo': 'world',
        'bom dia': 'good morning',
        'obrigado': 'thank you',
        'como você está': 'how are you'
      };

      const lowerText = text.toLowerCase();
      const translation = mockTranslations[lowerText] || `[Tradução de: ${text}]`;
      
      setTranslatedText(translation);
      
      // Simulate language detection
      if (sourceLanguage === 'auto') {
        const detected = /[a-zA-Z]/.test(text) ? 'en' : 'pt';
        setDetectedLanguage(detected);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao traduzir');
    } finally {
      setIsLoading(false);
    }
  };

  const swapLanguages = () => {
    if (sourceLanguage === 'auto') return;
    
    const newSource = targetLanguage;
    const newTarget = sourceLanguage;
    
    setSourceLanguage(newSource);
    setTargetLanguage(newTarget);
    
    // Swap texts
    const newSourceText = translatedText;
    const newTranslatedText = sourceText;
    
    setSourceText(newSourceText);
    setTranslatedText(newTranslatedText);
  };

  const copyToClipboard = async (text: string, type: 'source' | 'target') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const getLanguageName = (code: string) => {
    if (code === 'auto') return 'Detectar idioma';
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string) => {
    if (code === 'auto') return '🔍';
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code)?.flag || '🌐';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-2xl w-full shadow-2xl ${className}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-500 to-blue-600 rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <Languages className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Tradutor</h2>
              <p className="text-sm opacity-90">Traduza textos entre diferentes idiomas</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Language Selection */}
          <div className="flex items-center gap-4 mb-6">
            {/* Source Language */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma de origem
              </label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="auto">🔍 Detectar idioma</option>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex items-end">
              <button
                onClick={swapLanguages}
                disabled={sourceLanguage === 'auto'}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Trocar idiomas"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {/* Target Language */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma de destino
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Detected Language */}
          {detectedLanguage && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-blue-700">
                  Idioma detectado: {getLanguageFlag(detectedLanguage)} {getLanguageName(detectedLanguage)}
                </span>
              </div>
            </div>
          )}

          {/* Translation Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source Text */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {getLanguageFlag(sourceLanguage)} {getLanguageName(sourceLanguage)}
                </label>
                {sourceText && (
                  <button
                    onClick={() => copyToClipboard(sourceText, 'source')}
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Copiar texto"
                  >
                    {copiedText === 'source' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              <textarea
                value={sourceText}
                onChange={(e) => {
                  setSourceText(e.target.value);
                  translateText(e.target.value);
                }}
                placeholder="Digite o texto para traduzir..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Translated Text */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {getLanguageFlag(targetLanguage)} {getLanguageName(targetLanguage)}
                </label>
                {translatedText && (
                  <button
                    onClick={() => copyToClipboard(translatedText, 'target')}
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Copiar tradução"
                  >
                    {copiedText === 'target' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              <div className="w-full h-32 p-3 border border-gray-300 rounded-lg bg-gray-50">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                ) : (
                  <div className="text-gray-900 whitespace-pre-wrap">
                    {translatedText || 'A tradução aparecerá aqui...'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex gap-2">
              <button
                onClick={() => setSourceText('')}
                className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Limpar
              </button>
              <button
                onClick={() => translateText(sourceText)}
                disabled={!sourceText.trim() || isLoading}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isLoading ? 'Traduzindo...' : 'Traduzir'}
              </button>
            </div>
          </div>

          {/* Translation Tips */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-1">Dicas para melhor tradução:</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Use frases completas para resultados mais precisos</li>
              <li>• Evite gírias e expressões idiomáticas</li>
              <li>• Para textos técnicos, seja específico no contexto</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
