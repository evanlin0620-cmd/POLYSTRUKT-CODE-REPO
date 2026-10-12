import React, { Component, ErrorInfo, ReactNode } from 'react';
import { 
  AlertTriangle, 
  RotateCcw, 
  RefreshCw, 
  Download, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  ShieldAlert, 
  LifeBuoy,
  Cpu,
  Database
} from 'lucide-react';
import { errorLoggingService, ErrorLogEvent } from '../services/errorLoggingService';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorEventId: string | null;
  isExpanded: boolean;
  copied: boolean;
  resetAttempts: number;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorEventId: null,
    isExpanded: false,
    copied: false,
    resetAttempts: 0,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const event = errorLoggingService.logError(
      error,
      { componentStack: errorInfo.componentStack || undefined },
      { boundary: 'GlobalErrorBoundary' }
    );

    this.setState({
      errorInfo,
      errorEventId: event.id,
    });
  }

  public handleReset = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorEventId: null,
      resetAttempts: prevState.resetAttempts + 1,
    }));
  };

  public handleHardRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public handleClearCorruptedCacheAndReload = () => {
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
      // Clear autosave draft keys if corrupted
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('polystrukt_autosave_draft');
        localStorage.removeItem('polystrukt_workspace_state');
      }
    } catch {
      // Ignore
    }
    this.handleHardRefresh();
  };

  public handleCopyDetails = () => {
    const { error, errorInfo, errorEventId } = this.state;
    const payload = `=== PolyStrukt CAD Studio Runtime Crash Report ===
Error ID: ${errorEventId || 'N/A'}
Timestamp: ${new Date().toISOString()}
Error: ${error?.name}: ${error?.message}

--- Stack Trace ---
${error?.stack || 'No stack trace available'}

--- Component Hierarchy ---
${errorInfo?.componentStack || 'No component stack available'}
`;

    navigator.clipboard.writeText(payload).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    });
  };

  public handleDownloadReport = () => {
    const report = errorLoggingService.exportDiagnosticsReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polystrukt-crash-report-${this.state.errorEventId || Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      const { error, errorInfo, errorEventId, isExpanded, copied } = this.state;

      return (
        <div 
          id="global-error-boundary"
          className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full max-w-2xl bg-zinc-900/90 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl p-6 sm:p-8 relative z-10 flex flex-col gap-6">
            
            {/* Header / Severity Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
                      Exception Intercepted
                    </span>
                    {errorEventId && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
                        {errorEventId}
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                    Application Runtime Error
                  </h1>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-zinc-500 bg-zinc-950/80 px-2.5 py-1 rounded-lg border border-white/5">
                <Cpu size={12} className="text-indigo-400" />
                <span>Auto-Logged</span>
              </div>
            </div>

            {/* Error Message Card */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-200">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-300 mb-1">
                <AlertTriangle size={14} />
                <span>{error?.name || 'Error'}</span>
              </div>
              <p className="text-xs sm:text-sm font-mono text-zinc-200 break-words leading-relaxed select-text">
                {error?.message || 'An unexpected runtime anomaly interrupted the component pipeline.'}
              </p>
            </div>

            {/* Primary & Secondary Action Cluster */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                id="btn-error-recover"
                onClick={this.handleReset}
                className="flex-1 h-11 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>Recover Component State</span>
              </button>

              <button
                id="btn-error-refresh"
                onClick={this.handleHardRefresh}
                className="h-11 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-white/10 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={15} />
                <span>Reload Application</span>
              </button>
            </div>

            {/* Diagnostic Utility Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  id="btn-error-copy"
                  onClick={this.handleCopyDetails}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 border border-white/5 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Copy stack trace and error payload to clipboard"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Details'}</span>
                </button>

                <button
                  id="btn-error-download"
                  onClick={this.handleDownloadReport}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 border border-white/5 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Export JSON crash diagnostic package"
                >
                  <Download size={13} />
                  <span>Download Report</span>
                </button>
              </div>

              <button
                id="btn-error-toggle-stack"
                onClick={() => this.setState({ isExpanded: !isExpanded })}
                className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                <span>{isExpanded ? 'Hide Stack' : 'Inspect Stack'}</span>
                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            {/* Expandable Stack Trace View */}
            {isExpanded && (
              <div className="mt-1 p-3.5 rounded-xl bg-zinc-950 border border-white/10 text-left font-mono text-[11px] leading-relaxed text-zinc-400 overflow-x-auto max-h-60 select-text">
                <div className="text-zinc-300 font-bold mb-2 flex items-center gap-2">
                  <Terminal size={13} className="text-indigo-400" />
                  <span>Stack Trace Details</span>
                </div>
                <pre className="text-rose-300/90 whitespace-pre-wrap">
                  {error?.stack || 'No JavaScript call stack available.'}
                </pre>
                {errorInfo?.componentStack && (
                  <>
                    <div className="text-zinc-300 font-bold mt-3 mb-1">Component Hierarchy:</div>
                    <pre className="text-zinc-500 whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}

            {/* Footer recovery hint */}
            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Database size={12} className="text-emerald-400" />
                <span>Auto-saved workspace geometry is preserved in local cache.</span>
              </span>
              <button
                onClick={this.handleClearCorruptedCacheAndReload}
                className="text-zinc-500 hover:text-rose-400 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Reset session buffer
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
