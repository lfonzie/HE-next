"use client"

import React from "react";
import { useToast } from "@/hooks/use-toast";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 p-4 rounded-lg shadow-lg border max-w-sm ${
            toast.variant === "destructive"
              ? "bg-red-50 border-red-200 text-red-900"
              : "bg-white border-gray-200 text-gray-900"
          }`}
        >
          <div className="flex-shrink-0">
            {toast.variant === "destructive" ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            {toast.title && (
              <p className="font-medium text-sm">{toast.title}</p>
            )}
            {toast.description && (
              <p className="text-sm opacity-90 mt-1">{toast.description}</p>
            )}
          </div>
          
          <button
            onClick={() => dismiss(toast.id)}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}