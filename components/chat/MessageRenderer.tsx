"use client"

import React from "react";

interface MessageRendererProps {
  content: string;
  moduleId?: string | null;
  structured?: boolean;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ 
  content
}) => {
  // Versão ultra simplificada que apenas renderiza texto puro
  const lines = content.split('\n');

  return (
    <div className="message-renderer">
      <div className="prose prose-sm max-w-none">
        {lines.map((line, index) => (
          <div key={index} className="mb-1">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};
