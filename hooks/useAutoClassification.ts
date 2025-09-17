import { useCallback, useRef } from 'react';

interface ClassificationResult {
  module: string;
  confidence: number;
  rationale: string;
  needsImages: boolean;
}

// Simple in-memory cache to prevent duplicate classification calls
const classificationCache = new Map<string, ClassificationResult>();
const pendingRequests = new Map<string, Promise<ClassificationResult>>();

export function useAutoClassification() {
  const classifyMessage = useCallback(async (message: string): Promise<ClassificationResult> => {
    // Check cache first
    const cacheKey = message.trim().toLowerCase();
    if (classificationCache.has(cacheKey)) {
      return classificationCache.get(cacheKey)!;
    }

    // Check if request is already pending
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey)!;
    }

    // Create new request
    const requestPromise = (async () => {
      try {
        const response = await fetch('/api/classify/example', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userMessage: message }),
        });

        if (!response.ok) {
          throw new Error('Classification failed');
        }

        const data = await response.json();
        
        let result: ClassificationResult;
        if (data.success && data.classification) {
          result = {
            module: data.classification.module,
            confidence: data.classification.confidence,
            rationale: data.classification.rationale,
            needsImages: data.classification.needsImages || false
          };
        } else {
          // Fallback
          result = {
            module: 'ATENDIMENTO',
            confidence: 0.0,
            rationale: 'fallback',
            needsImages: false
          };
        }

        // Cache the result
        classificationCache.set(cacheKey, result);
        
        // Clean up pending request
        pendingRequests.delete(cacheKey);
        
        return result;
      } catch (error) {
        console.error('Auto-classification error:', error);
        
        const fallbackResult: ClassificationResult = {
          module: 'ATENDIMENTO',
          confidence: 0.0,
          rationale: 'error',
          needsImages: false
        };

        // Cache the fallback result too
        classificationCache.set(cacheKey, fallbackResult);
        
        // Clean up pending request
        pendingRequests.delete(cacheKey);
        
        return fallbackResult;
      }
    })();

    // Store pending request
    pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }, []);

  return { classifyMessage };
}
