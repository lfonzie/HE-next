"use client"

import React from 'react'
import { OrchestratorAction } from '@/types'
import { Button } from '@/components/ui/button'

interface ActionsRendererProps {
  actions?: OrchestratorAction[]
}

export function ActionsRenderer({ actions }: ActionsRendererProps) {
  if (!actions || actions.length === 0) return null
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map((act, idx) => {
        if (act.type === 'cta') {
          return (
            <Button key={idx} variant="secondary" size="sm" data-module={act.module}>
              {act.label}
            </Button>
          )
        }
        if (act.type === 'link') {
          return (
            <a key={idx} href={act.href} target="_blank" rel="noreferrer" className="text-sm underline text-blue-600">
              {act.label}
            </a>
          )
        }
        return null
      })}
    </div>
  )
}

export default ActionsRenderer


