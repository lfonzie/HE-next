"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Eye, 
  Volume2, 
  MousePointer, 
  Keyboard, 
  Contrast,
  Type,
  Settings,
  CheckCircle,
  Info
} from 'lucide-react';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  screenReader: boolean;
  audioDescriptions: boolean;
  fontSize: number;
  focusIndicator: boolean;
}

interface EnemAccessibilityProps {
  onSettingsChange: (settings: AccessibilitySettings) => void;
  initialSettings?: Partial<AccessibilitySettings>;
}

export function EnemAccessibility({ onSettingsChange, initialSettings }: EnemAccessibilityProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    keyboardNavigation: true,
    screenReader: false,
    audioDescriptions: false,
    fontSize: 16,
    focusIndicator: true,
    ...initialSettings
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Apply accessibility settings to the document
    applyAccessibilitySettings(settings);
    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  const applyAccessibilitySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // High contrast
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text
    if (newSettings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Font size
    root.style.setProperty('--font-size-base', `${newSettings.fontSize}px`);
  };

  const handleSettingChange = (key: keyof AccessibilitySettings, value: boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetToDefaults = () => {
    setSettings({
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      keyboardNavigation: true,
      screenReader: false,
      audioDescriptions: false,
      fontSize: 16,
      focusIndicator: true
    });
  };

  return (
    <>
      {/* Accessibility Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700"
        aria-label="Configurações de Acessibilidade"
      >
        <Settings className="h-4 w-4 mr-2" />
        Acessibilidade
      </Button>

      {/* Accessibility Panel */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 z-50 w-80 max-h-96 overflow-y-auto bg-white shadow-lg border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5" />
              Configurações de Acessibilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Visual Settings */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Configurações Visuais
              </h4>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="text-sm">
                  Alto Contraste
                </Label>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="large-text" className="text-sm">
                  Texto Grande
                </Label>
                <Switch
                  id="large-text"
                  checked={settings.largeText}
                  onCheckedChange={(checked) => handleSettingChange('largeText', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">
                  Tamanho da Fonte: {settings.fontSize}px
                </Label>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={(value) => handleSettingChange('fontSize', value[0])}
                  max={24}
                  min={12}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="focus-indicator" className="text-sm">
                  Indicador de Foco
                </Label>
                <Switch
                  id="focus-indicator"
                  checked={settings.focusIndicator}
                  onCheckedChange={(checked) => handleSettingChange('focusIndicator', checked)}
                />
              </div>
            </div>

            {/* Motion Settings */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <MousePointer className="h-4 w-4" />
                Configurações de Movimento
              </h4>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion" className="text-sm">
                  Reduzir Movimento
                </Label>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
                />
              </div>
            </div>

            {/* Navigation Settings */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Navegação
              </h4>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="keyboard-nav" className="text-sm">
                  Navegação por Teclado
                </Label>
                <Switch
                  id="keyboard-nav"
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => handleSettingChange('keyboardNavigation', checked)}
                />
              </div>
            </div>

            {/* Audio Settings */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Configurações de Áudio
              </h4>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="screen-reader" className="text-sm">
                  Leitor de Tela
                </Label>
                <Switch
                  id="screen-reader"
                  checked={settings.screenReader}
                  onCheckedChange={(checked) => handleSettingChange('screenReader', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="audio-desc" className="text-sm">
                  Descrições de Áudio
                </Label>
                <Switch
                  id="audio-desc"
                  checked={settings.audioDescriptions}
                  onCheckedChange={(checked) => handleSettingChange('audioDescriptions', checked)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t">
              <Button 
                onClick={resetToDefaults} 
                variant="outline" 
                size="sm"
                className="flex-1"
              >
                Padrão
              </Button>
              <Button 
                onClick={() => setIsOpen(false)} 
                size="sm"
                className="flex-1"
              >
                Fechar
              </Button>
            </div>

            {/* Accessibility Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Atalhos de Teclado:</p>
                  <ul className="space-y-1">
                    <li>• 1-5: Selecionar alternativas A-E</li>
                    <li>• ← →: Navegar entre questões</li>
                    <li>• Tab: Navegar entre elementos</li>
                    <li>• Enter: Confirmar seleção</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

// CSS classes for accessibility features
export const accessibilityStyles = `
  .high-contrast {
    --background: #000000;
    --foreground: #ffffff;
    --primary: #ffffff;
    --primary-foreground: #000000;
    --secondary: #333333;
    --secondary-foreground: #ffffff;
    --border: #666666;
  }

  .large-text {
    --font-size-base: 18px;
    --font-size-sm: 16px;
    --font-size-lg: 20px;
    --font-size-xl: 24px;
  }

  .reduced-motion * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .focus-indicator:focus {
    outline: 3px solid #3b82f6;
    outline-offset: 2px;
  }

  .screen-reader-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;
