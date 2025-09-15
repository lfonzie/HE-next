"use client"

import React from "react";
import { OrchestratorActions } from "./OrchestratorActions";
import { OrchestratorAction, OrchestratorBlock } from "@/types";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageRendererProps {
  content: string;
  moduleId?: string | null;
  structured?: boolean;
  blocks?: OrchestratorBlock[];
  actions?: OrchestratorAction[];
  onActionClick?: (action: OrchestratorAction) => void;
  onBlockClick?: (block: OrchestratorBlock) => void;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({ 
  content,
  blocks,
  actions,
  onActionClick,
  onBlockClick
}) => {

  return (
    <div className="message-renderer">
      <div className="prose prose-sm max-w-none">
        <MarkdownRenderer 
          content={content}
          className="text-gray-700 dark:text-gray-300"
        />
      </div>
      
      {/* Renderizar ações e blocos do orquestrador */}
      <OrchestratorActions
        actions={actions}
        blocks={blocks}
        onActionClick={onActionClick}
        onBlockClick={onBlockClick}
      />
    </div>
  );
};
