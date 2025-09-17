"use client";

import React from 'react';
import ProgressiveLessonComponent from './ProgressiveLessonComponent';

interface HubEduLessonModuleProps {
  initialQuery?: string;
  onLessonComplete?: () => void;
  className?: string;
}

export default function HubEduLessonModule({ 
  initialQuery = "", 
  onLessonComplete,
  className = ""
}: HubEduLessonModuleProps) {
  // Usar o novo componente progressivo
  return (
    <ProgressiveLessonComponent
      initialQuery={initialQuery}
      onLessonComplete={onLessonComplete}
      className={className}
    />
  );
}