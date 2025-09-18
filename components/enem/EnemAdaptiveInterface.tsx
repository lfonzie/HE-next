'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Sun,
  Moon,
  Monitor,
  Type,
  Contrast,
  Focus,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  Settings,
  Palette,
  Accessibility,
  Zap,
  Shield,
  Heart
} from 'lucide-react'
import { useEnemConfig } from '@/contexts/EnemConfigContext'
import { useToast } from '@/hooks/use-toast'

interface EnemAdaptiveInterfaceProps {
  className?: string
}

export function EnemAdaptiveInterface({ className = '' }: EnemAdaptiveInterfaceProps) {
  const { config, updateConfig, preferences, updatePreferences } = useEnemConfig()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'appearance' | 'accessibility' | 'focus' | 'notifications'>('appearance')
  const { toast } = useToast()

  // Theme management
  const handleThemeChange = useCallback((theme: 'light' | 'dark' | 'auto') => {
    updateConfig({ theme })
    toast({
      title: '🎨 Tema alterado',
      description: `Tema ${theme === 'auto' ? 'automático' : theme} aplicado com sucesso!`,
    })
  }, [updateConfig, toast])

  // Font size management
  const handleFontSizeChange = useCallback((size: 'small' | 'medium' | 'large') => {
    updateConfig({ fontSize: size })
    toast({
      title: '📝 Tamanho da fonte alterado',
      description: `Fonte ${size} aplicada com sucesso!`,
    })
  }, [updateConfig, toast])

  // Contrast management
  const handleContrastChange = useCallback((contrast: 'normal' | 'high') => {
    updateConfig({ contrast })
    toast({
      title: '🔍 Contraste alterado',
      description: `Contraste ${contrast} aplicado com sucesso!`,
    })
  }, [updateConfig, toast])

  // Focus mode management
  const handleFocusModeToggle = useCallback((enabled: boolean) => {
    updateConfig({ focusMode: enabled })
    toast({
      title: enabled ? '🎯 Modo foco ativado' : '🎯 Modo foco desativado',
      description: enabled 
        ? 'Distrações foram reduzidas para melhor concentração'
        : 'Interface completa restaurada',
    })
  }, [updateConfig, toast])

  // Sound effects management
  const handleSoundEffectsToggle = useCallback((enabled: boolean) => {
    updatePreferences({ enableSoundEffects: enabled })
    toast({
      title: enabled ? '🔊 Efeitos sonoros ativados' : '🔇 Efeitos sonoros desativados',
      description: enabled 
        ? 'Efeitos sonoros foram habilitados'
        : 'Efeitos sonoros foram desabilitados',
    })
  }, [updatePreferences, toast])

  // Notifications management
  const handleNotificationsToggle = useCallback((enabled: boolean) => {
    updatePreferences({ enableNotifications: enabled })
    toast({
      title: enabled ? '🔔 Notificações ativadas' : '🔕 Notificações desativadas',
      description: enabled 
        ? 'Notificações foram habilitadas'
        : 'Notificações foram desabilitadas',
    })
  }, [updatePreferences, toast])

  // Apply focus mode styles
  useEffect(() => {
    if (config.focusMode) {
      document.body.classList.add('focus-mode')
      // Hide distracting elements
      const distractingElements = document.querySelectorAll('.distracting-element')
      distractingElements.forEach(el => {
        (el as HTMLElement).style.display = 'none'
      })
    } else {
      document.body.classList.remove('focus-mode')
      // Show all elements
      const distractingElements = document.querySelectorAll('.distracting-element')
      distractingElements.forEach(el => {
        (el as HTMLElement).style.display = ''
      })
    }
  }, [config.focusMode])

  // Render appearance tab
  const renderAppearanceTab = () => (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Tema</h3>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={config.theme === 'light' ? 'default' : 'outline'}
            onClick={() => handleThemeChange('light')}
            className="flex items-center gap-2"
          >
            <Sun className="h-4 w-4" />
            Claro
          </Button>
          <Button
            variant={config.theme === 'dark' ? 'default' : 'outline'}
            onClick={() => handleThemeChange('dark')}
            className="flex items-center gap-2"
          >
            <Moon className="h-4 w-4" />
            Escuro
          </Button>
          <Button
            variant={config.theme === 'auto' ? 'default' : 'outline'}
            onClick={() => handleThemeChange('auto')}
            className="flex items-center gap-2"
          >
            <Monitor className="h-4 w-4" />
            Automático
          </Button>
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Tamanho da Fonte</h3>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={config.fontSize === 'small' ? 'default' : 'outline'}
            onClick={() => handleFontSizeChange('small')}
            className="text-sm"
          >
            Pequena
          </Button>
          <Button
            variant={config.fontSize === 'medium' ? 'default' : 'outline'}
            onClick={() => handleFontSizeChange('medium')}
            className="text-base"
          >
            Média
          </Button>
          <Button
            variant={config.fontSize === 'large' ? 'default' : 'outline'}
            onClick={() => handleFontSizeChange('large')}
            className="text-lg"
          >
            Grande
          </Button>
        </div>
      </div>

      {/* Contrast */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Contraste</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={config.contrast === 'normal' ? 'default' : 'outline'}
            onClick={() => handleContrastChange('normal')}
            className="flex items-center gap-2"
          >
            <Contrast className="h-4 w-4" />
            Normal
          </Button>
          <Button
            variant={config.contrast === 'high' ? 'default' : 'outline'}
            onClick={() => handleContrastChange('high')}
            className="flex items-center gap-2"
          >
            <Contrast className="h-4 w-4" />
            Alto
          </Button>
        </div>
      </div>

      {/* Color Palette Preview */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Paleta de Cores</h3>
        <div className="grid grid-cols-5 gap-2">
          {['blue', 'green', 'purple', 'orange', 'red'].map(color => (
            <div
              key={color}
              className={`w-12 h-12 rounded-lg cursor-pointer border-2 ${
                config.theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
              }`}
              style={{ backgroundColor: `var(--color-${color}-500)` }}
              onClick={() => {
                // This would update the color palette
                toast({
                  title: '🎨 Paleta de cores',
                  description: `Paleta ${color} será implementada em breve!`,
                })
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )

  // Render accessibility tab
  const renderAccessibilityTab = () => (
    <div className="space-y-6">
      {/* Keyboard Navigation */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Navegação por Teclado</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Atalhos de teclado para navegação rápida
            </p>
          </div>
          <Switch
            checked={preferences.enableKeyboardShortcuts}
            onCheckedChange={(checked) => updatePreferences({ enableKeyboardShortcuts: checked })}
          />
        </div>
      </div>

      {/* Screen Reader Support */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Suporte a Leitores de Tela</h3>
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>✅ Suporte completo:</strong> Todas as questões e alternativas são 
            compatíveis com leitores de tela como NVDA, JAWS e VoiceOver.
          </p>
        </div>
      </div>

      {/* High Contrast Mode */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Modo Alto Contraste</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Aumenta o contraste para melhor visibilidade
            </p>
          </div>
          <Switch
            checked={config.contrast === 'high'}
            onCheckedChange={(checked) => handleContrastChange(checked ? 'high' : 'normal')}
          />
        </div>
      </div>

      {/* Reduced Motion */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Movimento Reduzido</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Reduz animações para usuários sensíveis ao movimento
            </p>
          </div>
          <Switch
            checked={preferences.enableReducedMotion || false}
            onCheckedChange={(checked) => updatePreferences({ enableReducedMotion: checked })}
          />
        </div>
      </div>

      {/* Accessibility Features */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Recursos de Acessibilidade</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Accessibility className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">ARIA Labels</p>
              <p className="text-sm text-gray-600">Rótulos descritivos para todos os elementos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Focus className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Indicadores de Foco</p>
              <p className="text-sm text-gray-600">Indicadores visuais claros para navegação</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Type className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Texto Alternativo</p>
              <p className="text-sm text-gray-600">Descrições para todas as imagens</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render focus tab
  const renderFocusTab = () => (
    <div className="space-y-6">
      {/* Focus Mode */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Modo Foco</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Remove distrações para melhor concentração
            </p>
          </div>
          <Switch
            checked={config.focusMode}
            onCheckedChange={handleFocusModeToggle}
          />
        </div>
      </div>

      {/* Distraction Blocking */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Bloqueio de Distrações</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ocultar elementos não essenciais</p>
            </div>
            <Switch
              checked={config.focusMode}
              onCheckedChange={handleFocusModeToggle}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Modo zen (apenas questão atual)</p>
            </div>
            <Switch
              checked={false}
              onCheckedChange={() => {
                toast({
                  title: '🧘 Modo Zen',
                  description: 'Modo zen será implementado em breve!',
                })
              }}
            />
          </div>
        </div>
      </div>

      {/* Timer Integration */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Integração com Timer</h3>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>🎯 Foco Inteligente:</strong> O timer se adapta automaticamente 
            ao modo foco, reduzindo notificações e distrações.
          </p>
        </div>
      </div>

      {/* Break Reminders */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Lembretes de Pausa</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Lembretes automáticos para pausas regulares
            </p>
          </div>
          <Switch
            checked={preferences.enableBreakReminders || false}
            onCheckedChange={(checked) => updatePreferences({ enableBreakReminders: checked })}
          />
        </div>
      </div>
    </div>
  )

  // Render notifications tab
  const renderNotificationsTab = () => (
    <div className="space-y-6">
      {/* Sound Effects */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Efeitos Sonoros</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Sons para ações e notificações
            </p>
          </div>
          <Switch
            checked={preferences.enableSoundEffects}
            onCheckedChange={handleSoundEffectsToggle}
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Notificações do sistema
            </p>
          </div>
          <Switch
            checked={preferences.enableNotifications}
            onCheckedChange={handleNotificationsToggle}
          />
        </div>
      </div>

      {/* Progress Notifications */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Notificações de Progresso</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Marcos de progresso (25%, 50%, 75%)</p>
            </div>
            <Switch
              checked={preferences.enableProgressNotifications || false}
              onCheckedChange={(checked) => updatePreferences({ enableProgressNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avisos de tempo restante</p>
            </div>
            <Switch
              checked={preferences.enableTimeWarnings || false}
              onCheckedChange={(checked) => updatePreferences({ enableTimeWarnings: checked })}
            />
          </div>
        </div>
      </div>

      {/* Notification Preview */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Visualização</h3>
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Exemplo de Notificação</p>
              <p className="text-sm text-blue-800">Você completou 50% do simulado!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`relative ${className}`}>
      {/* Settings Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <Settings className="h-4 w-4 mr-2" />
        Configurações
      </Button>

      {/* Settings Panel */}
      {isOpen && (
        <Card className="fixed bottom-16 right-4 w-96 max-h-[80vh] overflow-y-auto z-40 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Interface Adaptativa
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={activeTab === 'appearance' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('appearance')}
                className="flex-1"
              >
                <Palette className="h-4 w-4 mr-1" />
                Aparência
              </Button>
              <Button
                variant={activeTab === 'accessibility' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('accessibility')}
                className="flex-1"
              >
                <Accessibility className="h-4 w-4 mr-1" />
                Acessibilidade
              </Button>
              <Button
                variant={activeTab === 'focus' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('focus')}
                className="flex-1"
              >
                <Focus className="h-4 w-4 mr-1" />
                Foco
              </Button>
              <Button
                variant={activeTab === 'notifications' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('notifications')}
                className="flex-1"
              >
                <Bell className="h-4 w-4 mr-1" />
                Notificações
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {activeTab === 'appearance' && renderAppearanceTab()}
            {activeTab === 'accessibility' && renderAccessibilityTab()}
            {activeTab === 'focus' && renderFocusTab()}
            {activeTab === 'notifications' && renderNotificationsTab()}
          </CardContent>
        </Card>
      )}

      {/* Focus Mode Overlay */}
      {config.focusMode && (
        <div className="fixed inset-0 bg-black bg-opacity-20 z-30 pointer-events-none" />
      )}
    </div>
  )
}

