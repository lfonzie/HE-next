"use client"

import React, { memo } from "react"
import { Message as ChatMessageType } from "@/types"
import { ModuleId } from "@/lib/modules"
import { MessageHeader } from "./MessageHeader"
import { MessageContent } from "./MessageContent"
import { MessageActions } from "./MessageActions"
import { MessageMetadata } from "./MessageMetadata"

interface ChatMessageRefactoredProps {
  message: ChatMessageType
  isUser: boolean
  userInitials: string
  currentModuleId?: ModuleId | null
  conversationId: string
  messageIndex: number
  onVote?: (messageId: string, vote: 'up' | 'down') => void
  onCopy?: (content: string) => void
  onShare?: (message: ChatMessageType) => void
  onBookmark?: (messageId: string) => void
  onReport?: (messageId: string) => void
  onRegenerate?: (messageId: string) => void
  onExport?: (message: ChatMessageType) => void
  showMetadata?: boolean
  className?: string
}

export const ChatMessageRefactored = memo<ChatMessageRefactoredProps>(({
  message,
  isUser,
  userInitials,
  currentModuleId,
  conversationId,
  messageIndex,
  onVote,
  onCopy,
  onShare,
  onBookmark,
  onReport,
  onRegenerate,
  onExport,
  showMetadata = false,
  className = ''
}) => {
  return (
    <div className={`chat-message ${isUser ? 'user-message' : 'assistant-message'} ${className}`}>
      {/* Message Header */}
      <MessageHeader
        message={message}
        isUser={isUser}
        userInitials={userInitials}
        currentModuleId={currentModuleId}
        showTimestamp={true}
        showModule={true}
        showModel={true}
      />

      {/* Message Content */}
      <MessageContent
        message={message}
        currentModuleId={currentModuleId}
        className="mb-3"
      />

      {/* Message Actions */}
      <MessageActions
        message={message}
        conversationId={conversationId}
        messageIndex={messageIndex}
        onVote={onVote}
        onCopy={onCopy}
        onShare={onShare}
        onBookmark={onBookmark}
        onReport={onReport}
        onRegenerate={onRegenerate}
        onExport={onExport}
        className="mb-2"
      />

      {/* Message Metadata */}
      {showMetadata && (
        <MessageMetadata
          message={message}
          showDetails={false}
        />
      )}
    </div>
  )
})

ChatMessageRefactored.displayName = 'ChatMessageRefactored'


