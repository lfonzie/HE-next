import { useEffect, useRef, useState, useCallback } from 'react';

// Accessibility utilities
export class AccessibilityUtils {
  // Generate unique IDs for ARIA relationships
  static generateId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Announce messages to screen readers
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  // Focus management
  static focusElement(element: HTMLElement | null): void {
    if (element) {
      element.focus();
    }
  }

  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }

  // Skip link functionality
  static createSkipLink(targetId: string, text: string = 'Skip to main content'): HTMLElement {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 1000;
      border-radius: 4px;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    return skipLink;
  }

  // High contrast mode detection
  static isHighContrastMode(): boolean {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(prefers-contrast: high)').matches ||
           window.matchMedia('(prefers-contrast: more)').matches;
  }

  // Reduced motion detection
  static prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Color scheme detection
  static prefersDarkMode(): boolean {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // Screen reader detection (basic)
  static isScreenReaderActive(): boolean {
    if (typeof window === 'undefined') return false;
    
    return window.navigator.userAgent.includes('NVDA') ||
           window.navigator.userAgent.includes('JAWS') ||
           window.navigator.userAgent.includes('VoiceOver');
  }
}

// Custom hooks for accessibility
export function useAccessibility() {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);

  useEffect(() => {
    const updateAccessibilityPreferences = () => {
      setIsHighContrast(AccessibilityUtils.isHighContrastMode());
      setPrefersReducedMotion(AccessibilityUtils.prefersReducedMotion());
      setPrefersDarkMode(AccessibilityUtils.prefersDarkMode());
      setIsScreenReaderActive(AccessibilityUtils.isScreenReaderActive());
    };

    updateAccessibilityPreferences();

    // Listen for changes
    const mediaQueries = [
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-contrast: more)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
    ];

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', updateAccessibilityPreferences);
    });

    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', updateAccessibilityPreferences);
      });
    };
  }, []);

  const announce = useCallback((message: string, priority?: 'polite' | 'assertive') => {
    AccessibilityUtils.announce(message, priority);
  }, []);

  const generateId = useCallback((prefix: string) => {
    return AccessibilityUtils.generateId(prefix);
  }, []);

  return {
    isHighContrast,
    prefersReducedMotion,
    prefersDarkMode,
    isScreenReaderActive,
    announce,
    generateId,
  };
}

// Focus management hook
export function useFocusManagement() {
  const focusHistory = useRef<HTMLElement[]>([]);
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      focusHistory.current.push(activeElement);
      setFocusedElement(activeElement);
    }
  }, []);

  const restoreFocus = useCallback(() => {
    const lastFocused = focusHistory.current.pop();
    if (lastFocused) {
      AccessibilityUtils.focusElement(lastFocused);
      setFocusedElement(lastFocused);
    }
  }, []);

  const focusElement = useCallback((element: HTMLElement | null) => {
    AccessibilityUtils.focusElement(element);
    setFocusedElement(element);
  }, []);

  return {
    focusedElement,
    saveFocus,
    restoreFocus,
    focusElement,
  };
}

// Keyboard navigation hook
export function useKeyboardNavigation(
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void,
  onEnter?: () => void,
  onEscape?: () => void,
  onSpace?: () => void,
  onTab?: () => void
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onArrowRight?.();
        break;
      case 'Enter':
        event.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
      case ' ':
        event.preventDefault();
        onSpace?.();
        break;
      case 'Tab':
        onTab?.();
        break;
    }
  }, [onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onEnter, onEscape, onSpace, onTab]);

  return { handleKeyDown };
}

// Screen reader announcements hook
export function useScreenReaderAnnouncements() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    AccessibilityUtils.announce(message, priority);
  }, []);

  const announceError = useCallback((message: string) => {
    announce(message, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    announce(message, 'polite');
  }, [announce]);

  const announceProgress = useCallback((current: number, total: number, label: string) => {
    const percentage = Math.round((current / total) * 100);
    announce(`${label}: ${current} de ${total} (${percentage}%)`, 'polite');
  }, [announce]);

  return {
    announce,
    announceError,
    announceSuccess,
    announceProgress,
  };
}

// ARIA live region hook
export function useAriaLiveRegion() {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const id = AccessibilityUtils.generateId('announcement');
    setAnnouncements(prev => [...prev, `${priority}:${message}`]);
    
    // Clear after announcement
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => !a.includes(message)));
    }, 1000);
  }, []);

  return {
    announcements,
    announce,
  };
}

// Form accessibility hook
export function useFormAccessibility() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const markFieldTouched = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  }, []);

  const getFieldAriaDescribedBy = useCallback((fieldName: string) => {
    const hasError = errors[fieldName];
    const isTouched = touched[fieldName];
    
    if (hasError && isTouched) {
      return `${fieldName}-error`;
    }
    return undefined;
  }, [errors, touched]);

  const getFieldAriaInvalid = useCallback((fieldName: string) => {
    const hasError = errors[fieldName];
    const isTouched = touched[fieldName];
    
    return hasError && isTouched;
  }, [errors, touched]);

  return {
    errors,
    touched,
    setFieldError,
    clearFieldError,
    markFieldTouched,
    getFieldAriaDescribedBy,
    getFieldAriaInvalid,
  };
}

// Progress accessibility hook
export function useProgressAccessibility(
  current: number,
  total: number,
  label: string = 'Progresso'
) {
  const percentage = Math.round((current / total) * 100);
  const progressId = AccessibilityUtils.generateId('progress');
  const labelId = AccessibilityUtils.generateId('progress-label');

  const announce = useCallback((message: string) => {
    AccessibilityUtils.announce(message, 'polite');
  }, []);

  useEffect(() => {
    if (current > 0) {
      announce(`${label}: ${current} de ${total} (${percentage}%)`);
    }
  }, [current, total, percentage, label, announce]);

  return {
    progressId,
    labelId,
    percentage,
    ariaValueNow: current,
    ariaValueMax: total,
    ariaLabel: `${label}: ${current} de ${total}`,
  };
}

// Modal accessibility hook
export function useModalAccessibility(isOpen: boolean) {
  const modalId = AccessibilityUtils.generateId('modal');
  const titleId = AccessibilityUtils.generateId('modal-title');
  const descriptionId = AccessibilityUtils.generateId('modal-description');

  useEffect(() => {
    if (isOpen) {
      // Save current focus
      const activeElement = document.activeElement as HTMLElement;
      
      // Focus the modal
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.focus();
      }

      // Trap focus
      const cleanup = AccessibilityUtils.trapFocus(modal!);

      return () => {
        cleanup();
        // Restore focus
        if (activeElement) {
          activeElement.focus();
        }
      };
    }
  }, [isOpen, modalId]);

  return {
    modalId,
    titleId,
    descriptionId,
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': titleId,
    'aria-describedby': descriptionId,
  };
}

// List accessibility hook
export function useListAccessibility(
  items: any[],
  label: string = 'Lista'
) {
  const listId = AccessibilityUtils.generateId('list');
  const labelId = AccessibilityUtils.generateId('list-label');

  return {
    listId,
    labelId,
    role: 'list',
    'aria-label': label,
    'aria-labelledby': labelId,
  };
}

// Button accessibility hook
export function useButtonAccessibility(
  label: string,
  description?: string,
  isPressed?: boolean,
  isExpanded?: boolean
) {
  const buttonId = AccessibilityUtils.generateId('button');
  const descriptionId = description ? AccessibilityUtils.generateId('button-description') : undefined;

  return {
    buttonId,
    descriptionId,
    'aria-label': label,
    'aria-describedby': descriptionId,
    'aria-pressed': isPressed,
    'aria-expanded': isExpanded,
  };
}
