/**
 * Advanced Accessibility Features
 * Enhanced screen reader support, ARIA improvements, and inclusive design patterns
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  Keyboard, 
  MousePointer,
  Settings,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

export interface AccessibilitySettings {
  // Visual
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  
  // Audio
  screenReader: boolean;
  audioDescriptions: boolean;
  soundEffects: boolean;
  speechRate: number;
  speechVolume: number;
  
  // Navigation
  keyboardNavigation: boolean;
  focusIndicator: boolean;
  skipLinks: boolean;
  tabOrder: 'logical' | 'visual';
  
  // Cognitive
  readingMode: boolean;
  simplifiedLanguage: boolean;
  progressIndicators: boolean;
  errorPrevention: boolean;
  
  // Motor
  largeTargets: boolean;
  gestureReduction: boolean;
  voiceControl: boolean;
  switchControl: boolean;
}

export interface ScreenReaderAnnouncement {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
  timestamp: number;
  persistent?: boolean;
}

export interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: any) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  announceProgress: (current: number, total: number) => void;
  announceError: (message: string) => void;
  announceSuccess: (message: string) => void;
  isScreenReaderActive: boolean;
  announcements: ScreenReaderAnnouncement[];
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  fontSize: 16,
  lineHeight: 1.5,
  letterSpacing: 0,
  
  screenReader: false,
  audioDescriptions: false,
  soundEffects: false,
  speechRate: 1.0,
  speechVolume: 0.8,
  
  keyboardNavigation: true,
  focusIndicator: true,
  skipLinks: true,
  tabOrder: 'logical',
  
  readingMode: false,
  simplifiedLanguage: false,
  progressIndicators: true,
  errorPrevention: true,
  
  largeTargets: false,
  gestureReduction: false,
  voiceControl: false,
  switchControl: false
};

// Screen Reader Hook
export function useScreenReader(options: { priority?: 'polite' | 'assertive'; timeout?: number } = {}) {
  const { priority = 'polite', timeout = 1000 } = options;
  const announcementRef = useRef<HTMLDivElement>(null);
  const [announcements, setAnnouncements] = useState<ScreenReaderAnnouncement[]>([]);

  useEffect(() => {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
    announcementRef.current = liveRegion;

    return () => {
      if (document.body.contains(liveRegion)) {
        document.body.removeChild(liveRegion);
      }
    };
  }, [priority]);

  const announce = useCallback((message: string, announcementPriority: 'polite' | 'assertive' = priority) => {
    const announcement: ScreenReaderAnnouncement = {
      id: Date.now().toString(),
      message,
      priority: announcementPriority,
      timestamp: Date.now()
    };

    setAnnouncements(prev => [...prev.slice(-9), announcement]); // Keep last 10

    if (announcementRef.current) {
      announcementRef.current.textContent = message;
      
      // Clear after timeout to allow re-announcement
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, timeout);
    }
  }, [priority, timeout]);

  const announceProgress = useCallback((current: number, total: number) => {
    const percentage = Math.round((current / total) * 100);
    announce(`Progress: ${current} of ${total} completed (${percentage}%)`);
  }, [announce]);

  const announceError = useCallback((message: string) => {
    announce(`Error: ${message}`, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`);
  }, [announce]);

  return {
    announce,
    announceProgress,
    announceError,
    announceSuccess,
    announcements
  };
}

// Accessibility Context Provider
export const AccessibilityContext = React.createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibility-settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }
    return defaultSettings;
  });

  const screenReader = useScreenReader();

  useEffect(() => {
    // Apply accessibility settings to the document
    applyAccessibilitySettings(settings);
    
    // Save to localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const announce = useCallback((message: string, priority?: 'polite' | 'assertive') => {
    screenReader.announce(message, priority);
  }, [screenReader]);

  const announceProgress = useCallback((current: number, total: number) => {
    screenReader.announceProgress(current, total);
  }, [screenReader]);

  const announceError = useCallback((message: string) => {
    screenReader.announceError(message);
  }, [screenReader]);

  const announceSuccess = useCallback((message: string) => {
    screenReader.announceSuccess(message);
  }, [screenReader]);

  const contextValue: AccessibilityContextType = {
    settings,
    updateSetting,
    announce,
    announceProgress,
    announceError,
    announceSuccess,
    isScreenReaderActive: settings.screenReader,
    announcements: screenReader.announcements
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}

// Hook to use accessibility context
export function useAccessibility() {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

// Apply accessibility settings to document
function applyAccessibilitySettings(settings: AccessibilitySettings) {
  const root = document.documentElement;
  
  // Visual settings
  root.classList.toggle('high-contrast', settings.highContrast);
  root.classList.toggle('large-text', settings.largeText);
  root.classList.toggle('reduced-motion', settings.reducedMotion);
  root.classList.toggle('reading-mode', settings.readingMode);
  root.classList.toggle('large-targets', settings.largeTargets);
  
  // CSS custom properties
  root.style.setProperty('--font-size-base', `${settings.fontSize}px`);
  root.style.setProperty('--line-height-base', settings.lineHeight.toString());
  root.style.setProperty('--letter-spacing-base', `${settings.letterSpacing}px`);
  
  // Focus indicators
  if (settings.focusIndicator) {
    root.classList.add('focus-indicators');
  } else {
    root.classList.remove('focus-indicators');
  }
}

// Advanced Accessibility Panel Component
export function AdvancedAccessibilityPanel({ className = '' }: { className?: string }) {
  const { settings, updateSetting, announce, announcements } = useAccessibility();
  const [activeTab, setActiveTab] = useState<'visual' | 'audio' | 'navigation' | 'cognitive' | 'motor'>('visual');

  const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
    updateSetting(key, value);
    announce(`Setting ${key} changed to ${value}`);
  };

  const resetToDefaults = () => {
    Object.entries(defaultSettings).forEach(([key, value]) => {
      updateSetting(key as keyof AccessibilitySettings, value);
    });
    announce('Accessibility settings reset to defaults');
  };

  const tabs = [
    { id: 'visual', label: 'Visual', icon: Eye },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'navigation', label: 'Navigation', icon: Keyboard },
    { id: 'cognitive', label: 'Cognitive', icon: Settings },
    { id: 'motor', label: 'Motor', icon: MousePointer }
  ] as const;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Accessibility Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {tabs.map(tab => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            {activeTab === 'visual' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-contrast">High Contrast</Label>
                    <Switch
                      id="high-contrast"
                      checked={settings.highContrast}
                      onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="large-text">Large Text</Label>
                    <Switch
                      id="large-text"
                      checked={settings.largeText}
                      onCheckedChange={(checked) => handleSettingChange('largeText', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduced-motion">Reduced Motion</Label>
                    <Switch
                      id="reduced-motion"
                      checked={settings.reducedMotion}
                      onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reading-mode">Reading Mode</Label>
                    <Switch
                      id="reading-mode"
                      checked={settings.readingMode}
                      onCheckedChange={(checked) => handleSettingChange('readingMode', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="font-size">Font Size: {settings.fontSize}px</Label>
                  <Slider
                    id="font-size"
                    min={12}
                    max={24}
                    step={1}
                    value={[settings.fontSize]}
                    onValueChange={([value]) => handleSettingChange('fontSize', value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="line-height">Line Height: {settings.lineHeight}</Label>
                  <Slider
                    id="line-height"
                    min={1.2}
                    max={2.0}
                    step={0.1}
                    value={[settings.lineHeight]}
                    onValueChange={([value]) => handleSettingChange('lineHeight', value)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="screen-reader">Screen Reader</Label>
                    <Switch
                      id="screen-reader"
                      checked={settings.screenReader}
                      onCheckedChange={(checked) => handleSettingChange('screenReader', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="audio-desc">Audio Descriptions</Label>
                    <Switch
                      id="audio-desc"
                      checked={settings.audioDescriptions}
                      onCheckedChange={(checked) => handleSettingChange('audioDescriptions', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-effects">Sound Effects</Label>
                    <Switch
                      id="sound-effects"
                      checked={settings.soundEffects}
                      onCheckedChange={(checked) => handleSettingChange('soundEffects', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="speech-rate">Speech Rate: {settings.speechRate}x</Label>
                  <Slider
                    id="speech-rate"
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={[settings.speechRate]}
                    onValueChange={([value]) => handleSettingChange('speechRate', value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="speech-volume">Speech Volume: {Math.round(settings.speechVolume * 100)}%</Label>
                  <Slider
                    id="speech-volume"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[settings.speechVolume]}
                    onValueChange={([value]) => handleSettingChange('speechVolume', value)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'navigation' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="keyboard-nav">Keyboard Navigation</Label>
                    <Switch
                      id="keyboard-nav"
                      checked={settings.keyboardNavigation}
                      onCheckedChange={(checked) => handleSettingChange('keyboardNavigation', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="focus-indicator">Focus Indicators</Label>
                    <Switch
                      id="focus-indicator"
                      checked={settings.focusIndicator}
                      onCheckedChange={(checked) => handleSettingChange('focusIndicator', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="skip-links">Skip Links</Label>
                    <Switch
                      id="skip-links"
                      checked={settings.skipLinks}
                      onCheckedChange={(checked) => handleSettingChange('skipLinks', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tab-order">Tab Order</Label>
                  <select
                    id="tab-order"
                    value={settings.tabOrder}
                    onChange={(e) => handleSettingChange('tabOrder', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="logical">Logical Order</option>
                    <option value="visual">Visual Order</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'cognitive' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="simplified-lang">Simplified Language</Label>
                    <Switch
                      id="simplified-lang"
                      checked={settings.simplifiedLanguage}
                      onCheckedChange={(checked) => handleSettingChange('simplifiedLanguage', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="progress-indicators">Progress Indicators</Label>
                    <Switch
                      id="progress-indicators"
                      checked={settings.progressIndicators}
                      onCheckedChange={(checked) => handleSettingChange('progressIndicators', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="error-prevention">Error Prevention</Label>
                    <Switch
                      id="error-prevention"
                      checked={settings.errorPrevention}
                      onCheckedChange={(checked) => handleSettingChange('errorPrevention', checked)}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'motor' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="large-targets">Large Targets</Label>
                    <Switch
                      id="large-targets"
                      checked={settings.largeTargets}
                      onCheckedChange={(checked) => handleSettingChange('largeTargets', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="gesture-reduction">Gesture Reduction</Label>
                    <Switch
                      id="gesture-reduction"
                      checked={settings.gestureReduction}
                      onCheckedChange={(checked) => handleSettingChange('gestureReduction', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="voice-control">Voice Control</Label>
                    <Switch
                      id="voice-control"
                      checked={settings.voiceControl}
                      onCheckedChange={(checked) => handleSettingChange('voiceControl', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="switch-control">Switch Control</Label>
                    <Switch
                      id="switch-control"
                      checked={settings.switchControl}
                      onCheckedChange={(checked) => handleSettingChange('switchControl', checked)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Screen Reader Announcements */}
      {settings.screenReader && announcements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {announcements.slice(-5).map(announcement => (
                <div
                  key={announcement.id}
                  className={`p-2 rounded text-sm flex items-center gap-2 ${
                    announcement.priority === 'assertive' 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {announcement.priority === 'assertive' ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                  <span>{announcement.message}</span>
                  <span className="text-xs opacity-60 ml-auto">
                    {new Date(announcement.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Enhanced Progress Component with Accessibility
export function AccessibleProgress({ 
  current, 
  total, 
  label = 'Progress',
  className = '' 
}: { 
  current: number; 
  total: number; 
  label?: string;
  className?: string;
}) {
  const { announceProgress, settings } = useAccessibility();
  const percentage = Math.round((current / total) * 100);

  useEffect(() => {
    if (settings.screenReader) {
      announceProgress(current, total);
    }
  }, [current, total, announceProgress, settings.screenReader]);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-600">{percentage}%</span>
      </div>
      
      <div 
        role="progressbar" 
        aria-valuenow={current} 
        aria-valuemin={0} 
        aria-valuemax={total}
        aria-label={`${label}: ${current} of ${total} completed`}
        className="w-full bg-gray-200 rounded-full h-2"
      >
        <div 
          className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${
            settings.reducedMotion ? 'transition-none' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {settings.progressIndicators && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>{current}</span>
          <span>{total}</span>
        </div>
      )}
    </div>
  );
}

// Skip Links Component
export function SkipLinks({ links }: { links: Array<{ href: string; label: string }> }) {
  const { settings } = useAccessibility();

  if (!settings.skipLinks) return null;

  return (
    <div className="sr-only focus-within:not-sr-only">
      <div className="absolute top-0 left-0 z-50 bg-white border border-gray-300 rounded-b-lg shadow-lg">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className="block px-4 py-2 text-sm hover:bg-gray-100 focus:bg-blue-100 focus:outline-none"
          >
            Skip to {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

