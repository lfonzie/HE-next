"use client"

import { ModuleType } from '@/types'
import { getModuleConfig } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ModuleSelectorProps {
  selectedModule: ModuleType
  onModuleChange: (module: ModuleType) => void
}

const modules: ModuleType[] = [
  'professor',
  'ti',
  'secretaria',
  'financeiro',
  'rh',
  'atendimento',
  'coordenacao',
  'social-media',
  'bem-estar'
]

export function ModuleSelector({ selectedModule, onModuleChange }: ModuleSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Escolha um módulo especializado:</h3>
        <p className="text-sm text-muted-foreground">
          Cada módulo tem uma IA treinada especificamente para sua área de atuação.
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {modules.map((module) => {
          const config = getModuleConfig(module)
          const isSelected = selectedModule === module
          
          return (
            <Card 
              key={module}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => onModuleChange(module)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{config.icon}</div>
                <h4 className="font-medium text-sm mb-1">{config.name}</h4>
                <p className="text-xs text-muted-foreground">{config.description}</p>
                {isSelected && (
                  <Badge variant="default" className="mt-2 text-xs">
                    Selecionado
                  </Badge>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
