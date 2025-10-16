import { useEffect, useCallback, useRef } from 'react';

// Analytics configuration
interface AnalyticsConfig {
  amplitudeApiKey?: string;
  googleAnalyticsId?: string;
  enableWebVitals?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableErrorTracking?: boolean;
  enableUserTracking?: boolean;
  debug?: boolean;
}

// Event types
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
  sessionId?: string;
}

// Web Vitals types
interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  delta: number;
  id: string;
  navigationType: string;
}

// Analytics class
class AnalyticsService {
  private config: AnalyticsConfig;
  private sessionId: string;
  private userId?: string;
  private isInitialized = false;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initialize(): void {
    if (this.isInitialized) return;

    try {
      // Initialize Amplitude
      if (this.config.amplitudeApiKey && typeof window !== 'undefined') {
        this.initializeAmplitude();
      }

      // Initialize Google Analytics
      if (this.config.googleAnalyticsId && typeof window !== 'undefined') {
        this.initializeGoogleAnalytics();
      }

      // Initialize Web Vitals
      if (this.config.enableWebVitals) {
        this.initializeWebVitals();
      }

      this.isInitialized = true;
      this.log('Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  private initializeAmplitude(): void {
    if (typeof window === 'undefined') return;

    // Load Amplitude script
    const script = document.createElement('script');
    script.src = 'https://cdn.amplitude.com/libs/amplitude-8.21.0-min.gz.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.amplitude) {
        window.amplitude.init(this.config.amplitudeApiKey!, {
          saveEvents: true,
          includeUtm: true,
          includeReferrer: true,
          includeGclid: true,
          includeFbclid: true,
        });
        this.log('Amplitude initialized');
      }
    };
  }

  private initializeGoogleAnalytics(): void {
    if (typeof window === 'undefined') return;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalyticsId}`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.gtag) {
        window.gtag('config', this.config.googleAnalyticsId!, {
          page_title: document.title,
          page_location: window.location.href,
        });
        this.log('Google Analytics initialized');
      }
    };
  }

  private initializeWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Load Web Vitals library
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(this.handleWebVital.bind(this));
      getFID(this.handleWebVital.bind(this));
      getFCP(this.handleWebVital.bind(this));
      getLCP(this.handleWebVital.bind(this));
      getTTFB(this.handleWebVital.bind(this));
    }).catch(error => {
      console.error('Failed to load Web Vitals:', error);
    });
  }

  private handleWebVital(metric: WebVitalsMetric): void {
    this.track('web_vital', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_id: metric.id,
      navigation_type: metric.navigationType,
    });
  }

  setUserId(userId: string): void {
    this.userId = userId;
    
    if (window.amplitude) {
      window.amplitude.setUserId(userId);
    }
    
    if (window.gtag) {
      window.gtag('config', this.config.googleAnalyticsId!, {
        user_id: userId,
      });
    }
  }

  track(eventName: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        session_id: this.sessionId,
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      },
      userId: this.userId,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    // Send to Amplitude
    if (window.amplitude) {
      window.amplitude.logEvent(eventName, event.properties);
    }

    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', eventName, event.properties);
    }

    // Send to custom analytics endpoint
    this.sendToCustomEndpoint(event);

    this.log(`Event tracked: ${eventName}`, event.properties);
  }

  private async sendToCustomEndpoint(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  trackPageView(pageName?: string, pageUrl?: string): void {
    const url = pageUrl || (typeof window !== 'undefined' ? window.location.href : '');
    const title = pageName || (typeof window !== 'undefined' ? document.title : '');

    this.track('page_view', {
      page_name: title,
      page_url: url,
      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
    });

    // Google Analytics page view
    if (window.gtag) {
      window.gtag('config', this.config.googleAnalyticsId!, {
        page_title: title,
        page_location: url,
      });
    }
  }

  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      error_name: error.name,
      ...context,
    });
  }

  trackPerformance(metricName: string, value: number, context?: Record<string, any>): void {
    this.track('performance', {
      metric_name: metricName,
      metric_value: value,
      ...context,
    });
  }

  trackUserAction(action: string, target?: string, context?: Record<string, any>): void {
    this.track('user_action', {
      action,
      target,
      ...context,
    });
  }

  private log(message: string, data?: any): void {
    if (this.config.debug) {
      console.log(`[Analytics] ${message}`, data);
    }
  }
}

// Global analytics instance
let analyticsInstance: AnalyticsService | null = null;

// Initialize analytics
export function initializeAnalytics(config: AnalyticsConfig): AnalyticsService {
  if (analyticsInstance) {
    return analyticsInstance;
  }

  analyticsInstance = new AnalyticsService(config);
  return analyticsInstance;
}

// Get analytics instance
export function getAnalytics(): AnalyticsService | null {
  return analyticsInstance;
}

// React hooks for analytics
export function useAnalytics() {
  const analytics = getAnalytics();
  
  if (!analytics) {
    throw new Error('Analytics not initialized. Call initializeAnalytics() first.');
  }

  return analytics;
}

export function useTrackEvent() {
  const analytics = useAnalytics();
  
  return useCallback((eventName: string, properties?: Record<string, any>) => {
    analytics.track(eventName, properties);
  }, [analytics]);
}

export function useTrackPageView() {
  const analytics = useAnalytics();
  
  return useCallback((pageName?: string, pageUrl?: string) => {
    analytics.trackPageView(pageName, pageUrl);
  }, [analytics]);
}

export function useTrackError() {
  const analytics = useAnalytics();
  
  return useCallback((error: Error, context?: Record<string, any>) => {
    analytics.trackError(error, context);
  }, [analytics]);
}

export function useTrackPerformance() {
  const analytics = useAnalytics();
  
  return useCallback((metricName: string, value: number, context?: Record<string, any>) => {
    analytics.trackPerformance(metricName, value, context);
  }, [analytics]);
}

export function useTrackUserAction() {
  const analytics = useAnalytics();
  
  return useCallback((action: string, target?: string, context?: Record<string, any>) => {
    analytics.trackUserAction(action, target, context);
  }, [analytics]);
}

// Performance monitoring hook
export function usePerformanceMonitoring(componentName: string) {
  const analytics = useAnalytics();
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    mountTime.current = performance.now();
    renderStartTime.current = performance.now();

    return () => {
      const unmountTime = performance.now();
      const totalTime = unmountTime - mountTime.current;
      
      analytics.trackPerformance('component_lifetime', totalTime, {
        component_name: componentName,
      });
    };
  }, [analytics, componentName]);

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    
    analytics.trackPerformance('component_render_time', renderTime, {
      component_name: componentName,
    });
  });

  const trackInteraction = useCallback((interactionType: string, details?: Record<string, any>) => {
    analytics.trackUserAction(interactionType, componentName, details);
  }, [analytics, componentName]);

  return { trackInteraction };
}

// Error boundary hook
export function useErrorTracking() {
  const analytics = useAnalytics();
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      analytics.trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'javascript_error',
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [analytics]);
}

// Focus tracking hook
export function useFocusTracking() {
  const analytics = useAnalytics();
  const focusStartTime = useRef<number>(0);
  const totalFocusTime = useRef<number>(0);

  useEffect(() => {
    const handleFocus = () => {
      focusStartTime.current = Date.now();
      analytics.trackUserAction('focus', 'page');
    };

    const handleBlur = () => {
      if (focusStartTime.current > 0) {
        const focusDuration = Date.now() - focusStartTime.current;
        totalFocusTime.current += focusDuration;
        
        analytics.trackPerformance('focus_duration', focusDuration);
        analytics.trackUserAction('blur', 'page', {
          focus_duration: focusDuration,
          total_focus_time: totalFocusTime.current,
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [analytics]);
}

// Audio playback tracking hook
export function useAudioTracking() {
  const analytics = useAnalytics();
  
  const trackPlayback = useCallback((action: string, details?: Record<string, any>) => {
    analytics.track('audio_playback', {
      action,
      timestamp: Date.now(),
      ...details,
    });
  }, [analytics]);

  const trackPlaybackUpdate = useCallback((currentTime: number, duration: number, details?: Record<string, any>) => {
    analytics.track('audio_playback_update', {
      current_time: currentTime,
      duration,
      progress_percentage: duration > 0 ? (currentTime / duration) * 100 : 0,
      ...details,
    });
  }, [analytics]);

  return { trackPlayback, trackPlaybackUpdate };
}

// Declare global types
declare global {
  interface Window {
    amplitude?: any;
    gtag?: (...args: any[]) => void;
  }
}
