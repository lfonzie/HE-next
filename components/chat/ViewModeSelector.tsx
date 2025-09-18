"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Focus, 
  Split, 
  Presentation, 
  Bug,
  Monitor,
  Smartphone,
  Tablet,
  Settings
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export type ViewMode = 
  | 'conversation' // Padrão
  | 'focused'      // Sem distrações
  | 'split'        // Duas conversas lado a lado
  | 'presentation' // Modo apresentação
  | 'debug'        // Informações técnicas

export type DeviceMode = 'desktop' | 'tablet' | 'mobile'

export interface ViewModeConfig {
  mode: ViewMode
  deviceMode: DeviceMode
  showSidebar: boolean
  showMetadata: boolean
  showTimestamps: boolean
  showModuleInfo: boolean
  showModelInfo: boolean
  enableAnimations: boolean
  enableSounds: boolean
  fontSize: 'small' | 'medium' | 'large'
  theme: 'light' | 'dark' | 'auto'
}

interface ViewModeSelectorProps {
  currentMode: ViewMode
  currentDeviceMode: DeviceMode
  config: ViewModeConfig
  onModeChange: (mode: ViewMode) => void
  onDeviceModeChange: (deviceMode: DeviceMode) => void
  onConfigChange: (config: Partial<ViewModeConfig>) => void
  className?: string
}

export function ViewModeSelector({
  currentMode,
  currentDeviceMode,
  config,
  onModeChange,
  onDeviceModeChange,
  onConfigChange,
  className = ''
}: ViewModeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const viewModes: Array<{
    mode: ViewMode
    label: string
    description: string
    icon: React.ReactNode
    shortcut?: string
  }> = [
    {
      mode: 'conversation',
      label: 'Conversa',
      description: 'Visualização padrão da conversa',
      icon: <MessageSquare className="w-4 h-4" />,
      shortcut: 'Ctrl+1'
    },
    {
      mode: 'focused',
      label: 'Focado',
      description: 'Modo sem distrações para concentração',
      icon: <Focus className="w-4 h-4" />,
      shortcut: 'Ctrl+2'
    },
    {
      mode: 'split',
      label: 'Dividido',
      description: 'Duas conversas lado a lado',
      icon: <Split className="w-4 h-4" />,
      shortcut: 'Ctrl+3'
    },
    {
      mode: 'presentation',
      label: 'Apresentação',
      description: 'Modo otimizado para apresentações',
      icon: <Presentation className="w-4 h-4" />,
      shortcut: 'Ctrl+4'
    },
    {
      mode: 'debug',
      label: 'Debug',
      description: 'Informações técnicas e debug',
      icon: <Bug className="w-4 h-4" />,
      shortcut: 'Ctrl+5'
    }
  ]

  const deviceModes: Array<{
    mode: DeviceMode
    label: string
    description: string
    icon: React.ReactNode
  }> = [
    {
      mode: 'desktop',
      label: 'Desktop',
      description: 'Otimizado para telas grandes',
      icon: <Monitor className="w-4 h-4" />
    },
    {
      mode: 'tablet',
      label: 'Tablet',
      description: 'Otimizado para tablets',
      icon: <Tablet className="w-4 h-4" />
    },
    {
      mode: 'mobile',
      label: 'Mobile',
      description: 'Otimizado para smartphones',
      icon: <Smartphone className="w-4 h-4" />
    }
  ]

  const currentViewMode = viewModes.find(mode => mode.mode === currentMode)
  const currentDevice = deviceModes.find(device => device.mode === currentDeviceMode)

  const handleModeSelect = (mode: ViewMode) => {
    onModeChange(mode)
    setIsOpen(false)
  }

  const handleDeviceSelect = (deviceMode: DeviceMode) => {
    onDeviceModeChange(deviceMode)
  }

  const handleConfigToggle = (key: keyof ViewModeConfig, value?: any) => {
    onConfigChange({
      [key]: value !== undefined ? value : !config[key]
    })
  }

  return (
    <TooltipProvider>
      <div className={`view-mode-selector flex items-center gap-2 ${className}`}>
        {/* Current mode display */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Modo:</span>
          <Badge variant="outline" className="flex items-center gap-1">
            {currentViewMode?.icon}
            {currentViewMode?.label}
          </Badge>
        </div>

        {/* Device mode selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {currentDevice?.icon}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {deviceModes.map((device) => (
              <DropdownMenuItem
                key={device.mode}
                onClick={() => handleDeviceSelect(device.mode)}
                className={currentDeviceMode === device.mode ? 'bg-blue-50' : ''}
              >
                <div className="flex items-center gap-2">
                  {device.icon}
                  <div>
                    <div className="text-sm font-medium">{device.label}</div>
                    <div className="text-xs text-gray-500">{device.description}</div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View mode selector */}
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              {currentViewMode?.icon}
              {currentViewMode?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {viewModes.map((mode) => (
              <DropdownMenuItem
                key={mode.mode}
                onClick={() => handleModeSelect(mode.mode)}
                className={currentMode === mode.mode ? 'bg-blue-50' : ''}
              >
                <div className="flex items-center gap-3 w-full">
                  {mode.icon}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{mode.label}</div>
                    <div className="text-xs text-gray-500">{mode.description}</div>
                  </div>
                  {mode.shortcut && (
                    <Badge variant="secondary" className="text-xs">
                      {mode.shortcut}
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            
            <DropdownMenuSeparator />
            
            {/* Quick settings */}
            <DropdownMenuItem onClick={() => handleConfigToggle('showSidebar')}>
              <div className="flex items-center justify-between w-full">
                <span className="text-sm">Mostrar barra lateral</span>
                <div className={`w-4 h-4 rounded border-2 ${
                  config.showSidebar ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                }`} />
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleConfigToggle('showMetadata')}>
              <div className="flex items-center justify-between w-full">
                <span className="text-sm">Mostrar metadados</span>
                <div className={`w-4 h-4 rounded border-2 ${
                  config.showMetadata ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                }`} />
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleConfigToggle('showTimestamps')}>
              <div className="flex items-center justify-between w-full">
                <span className="text-sm">Mostrar timestamps</span>
                <div className={`w-4 h-4 rounded border-2 ${
                  config.showTimestamps ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                }`} />
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => handleConfigToggle('enableAnimations')}>
              <div className="flex items-center justify-between w-full">
                <span className="text-sm">Animações</span>
                <div className={`w-4 h-4 rounded border-2 ${
                  config.enableAnimations ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                }`} />
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {/* Font size selector */}
            <DropdownMenuItem>
              <div className="flex items-center justify-between w-full">
                <span className="text-sm">Tamanho da fonte</span>
                <div className="flex items-center gap-1">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <Button
                      key={size}
                      variant={config.fontSize === size ? 'default' : 'ghost'}
                      size="sm"
                      className="h-6 w-6 p-0 text-xs"
                      onClick={() => handleConfigToggle('fontSize', size)}
                    >
                      {size === 'small' ? 'A' : size === 'medium' ? 'A' : 'A'}
                    </Button>
                  ))}
                </div>
              </div>
            </DropdownMenuItem>
            
            {/* Theme selector */}
            <DropdownMenuItem>
              <div className="flex items-center justify-between w-full">
                <span className="text-sm">Tema</span>
                <div className="flex items-center gap-1">
                  {(['light', 'dark', 'auto'] as const).map((theme) => (
                    <Button
                      key={theme}
                      variant={config.theme === theme ? 'default' : 'ghost'}
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleConfigToggle('theme', theme)}
                    >
                      {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '🔄'}
                    </Button>
                  ))}
                </div>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick access buttons */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleConfigToggle('showSidebar')}
                className={`h-8 w-8 p-0 ${
                  config.showSidebar ? 'text-blue-600 bg-blue-50' : 'text-gray-500'
                }`}
              >
                <Split className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {config.showSidebar ? 'Ocultar' : 'Mostrar'} barra lateral
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleConfigToggle('showMetadata')}
                className={`h-8 w-8 p-0 ${
                  config.showMetadata ? 'text-blue-600 bg-blue-50' : 'text-gray-500'
                }`}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {config.showMetadata ? 'Ocultar' : 'Mostrar'} metadados
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}


