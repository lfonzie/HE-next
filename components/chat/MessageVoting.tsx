"use client"

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface MessageVotingProps {
  conversationId: string;
  messageIndex: number;
  className?: string;
}

export const MessageVoting: React.FC<MessageVotingProps> = ({
  conversationId,
  messageIndex,
  className = ""
}) => {
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (vote === voteType || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/chat/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          messageIndex,
          vote: voteType
        })
      });

      if (response.ok) {
        setVote(voteType);
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`message-voting flex items-center gap-1 ${className}`}>
      <button
        onClick={() => handleVote('up')}
        disabled={isSubmitting}
        className={`p-1 rounded transition-colors ${
          vote === 'up' 
            ? 'text-green-600 bg-green-100' 
            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
        }`}
        title="Útil"
      >
        <ThumbsUp className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => handleVote('down')}
        disabled={isSubmitting}
        className={`p-1 rounded transition-colors ${
          vote === 'down' 
            ? 'text-red-600 bg-red-100' 
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
        }`}
        title="Não útil"
      >
        <ThumbsDown className="w-4 h-4" />
      </button>
    </div>
  );
};
