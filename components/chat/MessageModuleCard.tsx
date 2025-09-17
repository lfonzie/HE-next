'use client'

import React from 'react'
import { getModuleIcon } from '@/lib/moduleIcons'
import { getModuleColors } from '@/lib/moduleColors'
import { getIconMapping } from '@/lib/iconMapping'

interface MessageModuleCardProps {
  module: string
  className?: string
}

export function MessageModuleCard({ module, className = '' }: MessageModuleCardProps) {
  // Use centralized icon mapping instead of local mapping
  const iconMapping = getIconMapping(module);
  
  const Icon = getModuleIcon(iconMapping.iconKey)
  const moduleColors = getModuleColors(module)

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${className}`}
         style={{
           background: moduleColors.primary,
           borderColor: moduleColors.border,
           color: moduleColors.text,
           boxShadow: moduleColors.shadow
         }}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <div className="flex flex-col">
        <span className="font-medium leading-tight">{iconMapping.name}</span>
        <span className="text-xs opacity-75 leading-tight">Módulo {iconMapping.name}</span>
      </div>
    </div>
  )
}
