"use client"

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ text, className = "" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors ${className}`}
      title={copied ? "Copiado!" : "Copiar mensagem"}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" />
          Copiado
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          Copiar
        </>
      )}
    </button>
  );
};
