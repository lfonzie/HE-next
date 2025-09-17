'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface LessonInfo {
  title: string;
  subject: string;
  lessonId: string;
  currentStep: number;
  totalSteps: number;
}

interface LessonContextType {
  lessonInfo: LessonInfo | null;
  setLessonInfo: (info: LessonInfo | null) => void;
  updateLessonProgress: (currentStep: number, totalSteps?: number) => void;
}

const LessonContext = createContext<LessonContextType | undefined>(undefined);

export function LessonProvider({ children }: { children: ReactNode }) {
  const [lessonInfo, setLessonInfo] = useState<LessonInfo | null>(null);

  const updateLessonProgress = useCallback((currentStep: number, totalSteps?: number) => {
    setLessonInfo(prevInfo => {
      if (prevInfo) {
        return {
          ...prevInfo,
          currentStep,
          totalSteps: totalSteps || prevInfo.totalSteps
        };
      }
      return prevInfo;
    });
  }, []);

  return (
    <LessonContext.Provider value={{ lessonInfo, setLessonInfo, updateLessonProgress }}>
      {children}
    </LessonContext.Provider>
  );
}

export function useLesson() {
  const context = useContext(LessonContext);
  if (context === undefined) {
    throw new Error('useLesson must be used within a LessonProvider');
  }
  return context;
}
