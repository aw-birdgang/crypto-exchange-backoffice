// 프론트엔드 분석 및 모니터링 유틸리티

export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  customData?: Record<string, any>;
  timestamp: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private performanceMetrics: PerformanceMetric[] = [];

  // 이벤트 추적
  trackEvent(event: Omit<AnalyticsEvent, 'timestamp'>): void {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.events.push(analyticsEvent);
    
    // 개발 환경에서 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', analyticsEvent);
    }

    // 실제 운영 환경에서는 외부 분석 서비스로 전송
    this.sendToAnalytics(analyticsEvent);
  }

  // 페이지 뷰 추적
  trackPageView(page: string, title?: string): void {
    this.trackEvent({
      name: 'page_view',
      category: 'navigation',
      action: 'view',
      label: page,
      customData: {
        page_title: title || document.title,
        url: window.location.href,
        referrer: document.referrer,
      },
    });
  }

  // 사용자 액션 추적
  trackUserAction(action: string, element?: string, value?: any): void {
    this.trackEvent({
      name: 'user_action',
      category: 'interaction',
      action,
      label: element,
      value: typeof value === 'number' ? value : undefined,
      customData: {
        element,
        value: typeof value !== 'number' ? value : undefined,
      },
    });
  }

  // 에러 추적
  trackError(error: Error, context?: string): void {
    this.trackEvent({
      name: 'error',
      category: 'error',
      action: 'occurred',
      label: context,
      customData: {
        error_message: error.message,
        error_stack: error.stack,
        context,
        url: window.location.href,
        user_agent: navigator.userAgent,
      },
    });
  }

  // 성능 메트릭 수집
  trackPerformance(name: string, value: number, unit: string = 'ms'): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
    };

    this.performanceMetrics.push(metric);

    // 개발 환경에서 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('⚡ Performance Metric:', metric);
    }

    // 성능 임계값 체크
    this.checkPerformanceThreshold(metric);
  }

  // 페이지 로드 시간 측정
  measurePageLoadTime(): void {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.loadEventStart);
        this.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        this.trackPerformance('first_paint', navigation.responseEnd - navigation.requestStart);
      }
    });
  }

  // API 호출 시간 측정
  measureApiCall(url: string, startTime: number, endTime: number, success: boolean): void {
    const duration = endTime - startTime;
    
    this.trackPerformance('api_call_duration', duration);
    
    this.trackEvent({
      name: 'api_call',
      category: 'network',
      action: success ? 'success' : 'error',
      label: url,
      value: duration,
      customData: {
        url,
        success,
        duration,
      },
    });
  }

  // 메모리 사용량 추적
  trackMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      this.trackPerformance('memory_used', memory.usedJSHeapSize, 'bytes');
      this.trackPerformance('memory_total', memory.totalJSHeapSize, 'bytes');
      this.trackPerformance('memory_limit', memory.jsHeapSizeLimit, 'bytes');
    }
  }

  // 사용자 세션 추적
  trackSession(): void {
    const sessionId = this.getOrCreateSessionId();
    
    this.trackEvent({
      name: 'session_start',
      category: 'session',
      action: 'start',
      customData: {
        session_id: sessionId,
        start_time: Date.now(),
      },
    });

    // 페이지 언로드 시 세션 종료 추적
    window.addEventListener('beforeunload', () => {
      this.trackEvent({
        name: 'session_end',
        category: 'session',
        action: 'end',
        customData: {
          session_id: sessionId,
          end_time: Date.now(),
        },
      });
    });
  }

  // 성능 임계값 체크
  private checkPerformanceThreshold(metric: PerformanceMetric): void {
    const thresholds: Record<string, number> = {
      'page_load_time': 3000, // 3초
      'api_call_duration': 5000, // 5초
      'memory_used': 50 * 1024 * 1024, // 50MB
    };

    const threshold = thresholds[metric.name];
    if (threshold && metric.value > threshold) {
      this.trackEvent({
        name: 'performance_warning',
        category: 'performance',
        action: 'threshold_exceeded',
        label: metric.name,
        value: metric.value,
        customData: {
          metric_name: metric.name,
          metric_value: metric.value,
          threshold,
        },
      });
    }
  }

  // 외부 분석 서비스로 전송 (실제 구현에서는 Google Analytics, Mixpanel 등 사용)
  private sendToAnalytics(event: AnalyticsEvent): void {
    // 여기에 실제 분석 서비스 연동 코드 추가
    // 예: gtag('event', event.name, { ... });
  }

  // 세션 ID 생성 또는 가져오기
  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // 이벤트 내보내기 (디버깅용)
  exportEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  // 성능 메트릭 내보내기 (디버깅용)
  exportPerformanceMetrics(): PerformanceMetric[] {
    return [...this.performanceMetrics];
  }
}

export const analytics = new AnalyticsService();
