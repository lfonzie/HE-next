"use client"

import React from 'react';
import Chat from "@/app/(dashboard)/chat/page";

interface ChatWrapperProps {
  mode?: string;
  maxMessages?: number;
  onLimitReached?: () => void;
}

export default function ChatWrapper({ mode, maxMessages, onLimitReached }: ChatWrapperProps) {
  return <Chat />;
}
