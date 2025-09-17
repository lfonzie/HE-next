'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useEnemSimulationStore } from '@/lib/stores/enem-simulation-store';
import { useEnemConfigStore } from '@/lib/stores/enem-config-store';
import { useEnemUIStore } from '@/lib/stores/enem-ui-store';
import { batchProcessor } from '@/lib/batch/enem-batch-processor';
import { BatchRequest, BatchProgress } from '@/lib/batch/enem-batch-processor';
import { Question } from '@/lib/stores/enem-simulation-store';

export function useEnemBatch() {
  const {
    examId,
    questions,
    progress,
    batchInfo,
    loadBatch,
    setBatchGenerating,
    setBatchProgress,
    setBatchError,
    getCurrentQuestion
  } = useEnemSimulationStore();

  const { config } = useEnemConfigStore();
  const { setLoading, clearLoading, showErrorToast } = useEnemUIStore();

  const [isInitialized, setIsInitialized] = useState(false);
  const preloadTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize batch processing
  const initializeBatch = useCallback(async () => {
    if (!examId || isInitialized) return;

    try {
      setLoading({ isLoading: true, loadingMessage: 'Inicializando simulado...' });

      const batchRequest: BatchRequest = {
        examId,
        area: config.area,
        mode: config.mode,
        totalQuestions: config.total_questions,
        config: {
          years: config.years,
          difficulty: config.difficulty,
          skill_tags: config.skill_tags
        }
      };

      // Load first batch immediately
      const firstBatch = await batchProcessor.processBatch(
        batchRequest,
        0,
        (progress) => {
          setBatchGenerating(0, progress.isGenerating);
          setBatchProgress(0, progress.progress);
          if (progress.error) {
            setBatchError(0, progress.error);
          }
        }
      );

      loadBatch(firstBatch, 0);
      setIsInitialized(true);
      clearLoading();

      // Preload second batch
      setTimeout(() => {
        preloadNextBatch(batchRequest, 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to initialize batch:', error);
      showErrorToast('Erro na Inicialização', 'Falha ao carregar o simulado');
      clearLoading();
    }
  }, [examId, config, isInitialized]);

  // Preload next batch
  const preloadNextBatch = useCallback(async (batchRequest: BatchRequest, batchNumber: number) => {
    try {
      await batchProcessor.processBatch(
        batchRequest,
        batchNumber,
        (progress) => {
          setBatchGenerating(batchNumber, progress.isGenerating);
          setBatchProgress(batchNumber, progress.progress);
          if (progress.error) {
            setBatchError(batchNumber, progress.error);
          }
        }
      );
    } catch (error) {
      console.warn(`Failed to preload batch ${batchNumber}:`, error);
    }
  }, []);

  // Load specific batch
  const loadSpecificBatch = useCallback(async (batchNumber: number) => {
    if (!examId) return;

    const batchRequest: BatchRequest = {
      examId,
      area: config.area,
      mode: config.mode,
      totalQuestions: config.total_questions,
      config: {
        years: config.years,
        difficulty: config.difficulty,
        skill_tags: config.skill_tags
      }
    };

    try {
      setBatchGenerating(batchNumber, true);
      
      const batchQuestions = await batchProcessor.processBatch(
        batchRequest,
        batchNumber,
        (progress) => {
          setBatchGenerating(batchNumber, progress.isGenerating);
          setBatchProgress(batchNumber, progress.progress);
          if (progress.error) {
            setBatchError(batchNumber, progress.error);
          }
        }
      );

      loadBatch(batchQuestions, batchNumber);
    } catch (error) {
      console.error(`Failed to load batch ${batchNumber}:`, error);
      showErrorToast('Erro no Carregamento', `Falha ao carregar lote ${batchNumber + 1}`);
      setBatchError(batchNumber, error instanceof Error ? error.message : 'Unknown error');
    }
  }, [examId, config]);

  // Proactive loading based on user progress
  const handleUserProgress = useCallback(() => {
    if (!examId || !isInitialized) return;

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    const currentIndex = progress.currentQuestionIndex;
    const batchSize = 3;
    const currentBatch = Math.floor(currentIndex / batchSize);
    const nextBatch = currentBatch + 1;
    const totalBatches = Math.ceil(config.total_questions / batchSize);

    // Clear existing timeout
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }

    // Preload next batch when user is 2 questions away from the end of current batch
    if (nextBatch < totalBatches && currentIndex >= (currentBatch * batchSize) + 1) {
      preloadTimeoutRef.current = setTimeout(() => {
        const batchRequest: BatchRequest = {
          examId,
          area: config.area,
          mode: config.mode,
          totalQuestions: config.total_questions,
          config: {
            years: config.years,
            difficulty: config.difficulty,
            skill_tags: config.skill_tags
          }
        };

        preloadNextBatch(batchRequest, nextBatch);
      }, 500); // Small delay to avoid interrupting user interaction
    }
  }, [examId, isInitialized, progress.currentQuestionIndex, config]);

  // Check if batch is available
  const isBatchAvailable = useCallback((batchNumber: number) => {
    const batchSize = 3;
    const startIndex = batchNumber * batchSize;
    const endIndex = Math.min(startIndex + batchSize, config.total_questions);
    
    return questions.slice(startIndex, endIndex).every(q => q !== undefined);
  }, [questions, config.total_questions]);

  // Get batch status
  const getBatchStatus = useCallback((batchNumber: number) => {
    return {
      isGenerating: batchInfo.isGenerating && batchInfo.batchNumber === batchNumber,
      progress: batchInfo.batchNumber === batchNumber ? batchInfo.progress : 0,
      error: batchInfo.batchNumber === batchNumber ? batchInfo.error : undefined,
      isAvailable: isBatchAvailable(batchNumber)
    };
  }, [batchInfo, isBatchAvailable]);

  // Cancel batch processing
  const cancelBatch = useCallback((batchNumber: number) => {
    if (examId) {
      batchProcessor.cancelBatch(examId, batchNumber);
    }
  }, [examId]);

  // Cancel all batches
  const cancelAllBatches = useCallback(() => {
    if (examId) {
      batchProcessor.cancelAllBatches(examId);
    }
  }, [examId]);

  // Get processing status
  const getProcessingStatus = useCallback(() => {
    if (!examId) return [];
    return batchProcessor.getProcessingStatus(examId);
  }, [examId]);

  // Initialize on mount
  useEffect(() => {
    if (examId && !isInitialized) {
      initializeBatch();
    }
  }, [examId, initializeBatch, isInitialized]);

  // Handle user progress changes
  useEffect(() => {
    handleUserProgress();
  }, [handleUserProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
      cancelAllBatches();
    };
  }, [cancelAllBatches]);

  return {
    // State
    isInitialized,
    batchInfo,
    
    // Actions
    initializeBatch,
    loadSpecificBatch,
    preloadNextBatch,
    
    // Utilities
    isBatchAvailable,
    getBatchStatus,
    getProcessingStatus,
    
    // Control
    cancelBatch,
    cancelAllBatches
  };
}
