"use client"

import { create } from 'zustand'

type ConversationState = {
  lastUsedModel?: string
  setLastUsedModel: (model?: string) => void
}

export const useConversation = create<ConversationState>((set) => ({
  lastUsedModel: undefined,
  setLastUsedModel: (model) => set({ lastUsedModel: model }),
}))
