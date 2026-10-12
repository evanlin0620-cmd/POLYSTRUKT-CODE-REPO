export interface ErrorLogEvent {
  id: string;
  timestamp: string;
  name: string;
  message: string;
  stack?: string;
  componentStack?: string;
  location: string;
  userAgent: string;
  context?: Record<string, any>;
  recovered?: boolean;
}

const STORAGE_KEY = 'polystrukt_error_telemetry_logs';
const MAX_LOCAL_LOGS = 50;

class ErrorLoggingService {
  private queue: ErrorLogEvent[] = [];

  constructor() {
    this.initGlobalListeners();
  }

  private initGlobalListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      const msg = String(event.message || '');
      // Ignore benign websocket, vite HMR, or resize observer loops
      if (
        msg.includes('ResizeObserver') ||
        msg.includes('failed to connect to websocket') ||
        msg.includes('WebSocket') ||
        msg.includes('websocket') ||
        msg.includes('[vite]')
      ) {
        return;
      }

      this.logError(
        event.error || new Error(event.message || 'Window Global Error'),
        { componentStack: `Line ${event.lineno}, Col ${event.colno} in ${event.filename}` },
        { source: 'window.onerror' }
      );
    });

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      const msg = reason instanceof Error ? reason.message : String(reason || '');
      // Ignore benign websocket, vite HMR, or resize observer loops
      if (
        msg.includes('ResizeObserver') ||
        msg.includes('failed to connect to websocket') ||
        msg.includes('WebSocket') ||
        msg.includes('websocket') ||
        msg.includes('[vite]')
      ) {
        return;
      }

      const error = reason instanceof Error ? reason : new Error(String(reason || 'Unhandled Promise Rejection'));
      
      this.logError(
        error,
        { componentStack: 'Async Promise Rejection' },
        { source: 'window.onunhandledrejection' }
      );
    });
  }

  public logError(
    error: Error | any,
    errorInfo?: { componentStack?: string },
    context?: Record<string, any>
  ): ErrorLogEvent {
    const errorEvent: ErrorLogEvent = {
      id: `ERR-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      name: error?.name || 'RuntimeError',
      message: error?.message || String(error || 'Unknown runtime error occurred'),
      stack: error?.stack || '',
      componentStack: errorInfo?.componentStack || '',
      location: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      context: {
        ...context,
        viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
        online: typeof navigator !== 'undefined' ? navigator.onLine : true,
      }
    };

    console.groupCollapsed(`%c🚨 [PolyStrukt Runtime Guard] %c${errorEvent.name}: ${errorEvent.message}`, 'color: #f43f5e; font-weight: bold;', 'color: #cbd5e1;');
    console.error(error);
    if (errorInfo?.componentStack) {
      console.info('%cComponent Stack:', 'color: #94a3b8; font-style: italic;', errorInfo.componentStack);
    }
    console.groupEnd();

    this.saveToLocalStorage(errorEvent);
    this.sendToServer(errorEvent);

    return errorEvent;
  }

  private saveToLocalStorage(event: ErrorLogEvent) {
    if (typeof localStorage === 'undefined') return;
    try {
      const existingRaw = localStorage.getItem(STORAGE_KEY);
      const logs: ErrorLogEvent[] = existingRaw ? JSON.parse(existingRaw) : [];
      logs.unshift(event);
      if (logs.length > MAX_LOCAL_LOGS) {
        logs.length = MAX_LOCAL_LOGS;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn('[Telemetry] Failed to persist error to localStorage:', e);
    }
  }

  private async sendToServer(event: ErrorLogEvent) {
    try {
      await fetch('/api/telemetry/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }).catch(() => {
        // Silently swallow network errors during telemetry delivery to prevent secondary cascades
      });
    } catch {
      // Ignore
    }
  }

  public getLocalErrors(): ErrorLogEvent[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public clearLocalErrors() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  public exportDiagnosticsReport(): string {
    const data = {
      exportedAt: new Date().toISOString(),
      app: 'PolyStrukt CAD Studio',
      system: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        language: typeof navigator !== 'undefined' ? navigator.language : '',
        screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '',
        online: typeof navigator !== 'undefined' ? navigator.onLine : false,
      },
      errors: this.getLocalErrors(),
    };
    return JSON.stringify(data, null, 2);
  }
}

export const errorLoggingService = new ErrorLoggingService();
