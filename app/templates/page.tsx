/**
 * Template System Page
 * Showcases the reusable lesson template system
 */

'use client';

import React from 'react';
import { TemplateBuilder } from '@/components/templates/TemplateBuilder';
import { LessonTemplate } from '@/lib/templates/LessonTemplateSystem';

export default function TemplatesPage() {
  const handleTemplateCreated = (template: LessonTemplate) => {
    console.log('Template created:', template);
    // Here you could show a success message or redirect
  };

  const handleTemplateSelected = (template: LessonTemplate) => {
    console.log('Template selected:', template);
    // Here you could navigate to a lesson creation page with this template
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <TemplateBuilder
          onTemplateCreated={handleTemplateCreated}
          onTemplateSelected={handleTemplateSelected}
          className="max-w-7xl mx-auto"
        />
      </div>
    </div>
  );
}

