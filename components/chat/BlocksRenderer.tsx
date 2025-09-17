"use client"

import React from 'react'
import { OrchestratorBlock } from '@/types'

interface BlocksRendererProps {
  blocks?: OrchestratorBlock[]
}

export function BlocksRenderer({ blocks }: BlocksRendererProps) {
  if (!blocks || blocks.length === 0) return null

  return (
    <div className="mt-4 space-y-3">
      {blocks.map((block, idx) => {
        if (block.type === 'notice') {
          return (
            <div key={idx} className="p-3 rounded-md border border-amber-200 bg-amber-50">
              <div className="font-semibold text-amber-900">{block.title}</div>
              <div className="text-amber-800 text-sm mt-1">{block.body}</div>
            </div>
          )
        }
        if (block.type === 'lesson_interactive') {
          return (
            <div key={idx} className="p-3 rounded-md border border-blue-200 bg-blue-50">
              <div className="font-semibold text-blue-900">Aula Interativa</div>
              <div className="text-blue-800 text-sm mt-1">ID: {block.lesson_id}</div>
            </div>
          )
        }
        if (block.type === 'quiz') {
          return (
            <div key={idx} className="p-3 rounded-md border border-green-200 bg-green-50">
              <div className="font-semibold text-green-900">Quiz</div>
              <div className="text-green-800 text-sm mt-1">{(block.meta?.quantidade || block.questions.length)} questões</div>
            </div>
          )
        }
        if (block.type === 'media') {
          return (
            <div key={idx} className="p-3 rounded-md border border-indigo-200 bg-indigo-50">
              <div className="font-semibold text-indigo-900">Mídia</div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {block.items.slice(0, 4).map((item, i) => (
                  <a key={i} href={item.url} target="_blank" rel="noreferrer" className="text-xs underline text-indigo-700 truncate">
                    {item.title || item.url}
                  </a>
                ))}
              </div>
            </div>
          )
        }
        if (block.type === 'checklist') {
          return (
            <div key={idx} className="p-3 rounded-md border border-gray-200 bg-gray-50">
              <div className="font-semibold text-gray-900">Checklist</div>
              <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                {block.items.map((it, i) => (
                  <li key={i} className={it.done ? 'line-through text-gray-500' : ''}>{it.text}</li>
                ))}
              </ul>
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

export default BlocksRenderer


