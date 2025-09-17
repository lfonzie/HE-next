'use client'

import React from 'react'
import { getModuleIcon } from '@/lib/moduleIcons'
import { getModuleColors } from '@/lib/moduleColors'

interface MessageModuleCardProps {
  module: string
  className?: string
}

export function MessageModuleCard({ module, className = '' }: MessageModuleCardProps) {
  // Mapeamento de módulos para nomes e descrições
  const moduleInfo: Record<string, { name: string; description: string; iconKey: string }> = {
    'professor': { 
      name: 'Professor', 
      description: 'Assistente de estudos focado no aluno',
      iconKey: 'professor'
    },
    'aula-expandida': { 
      name: 'Aula Expandida', 
      description: 'Aulas interativas e gamificadas',
      iconKey: 'aula-expandida'
    },
    'enem-interativo': { 
      name: 'ENEM Interativo', 
      description: 'Simulador ENEM com IA',
      iconKey: 'enem-interativo'
    },
    'ti': { 
      name: 'TI', 
      description: 'Suporte técnico educacional',
      iconKey: 'ti'
    },
    'rh': { 
      name: 'RH', 
      description: 'Recursos humanos',
      iconKey: 'rh'
    },
    'financeiro': { 
      name: 'Financeiro', 
      description: 'Controle financeiro escolar',
      iconKey: 'financeiro'
    },
    'coordenacao': { 
      name: 'Coordenação', 
      description: 'Gestão pedagógica',
      iconKey: 'coordenacao'
    },
    'atendimento': { 
      name: 'Atendimento', 
      description: 'Suporte multicanal',
      iconKey: 'atendimento'
    },
    'bem-estar': { 
      name: 'Bem-Estar', 
      description: 'Suporte socioemocional',
      iconKey: 'bem-estar'
    },
    'social-media': { 
      name: 'Social Media', 
      description: 'Comunicação digital',
      iconKey: 'social-media'
    },
    'secretaria': { 
      name: 'Secretaria', 
      description: 'Documentos e matrículas',
      iconKey: 'secretaria'
    }
  }

  const info = moduleInfo[module] || {
    name: module,
    description: 'Módulo não identificado',
    iconKey: 'atendimento'
  }

  const Icon = getModuleIcon(info.iconKey)
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
        <span className="font-medium leading-tight">{info.name}</span>
        <span className="text-xs opacity-75 leading-tight">{info.description}</span>
      </div>
    </div>
  )
}
