import React from 'react';
import { AlertTriangle, RefreshCw, Sparkles, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("FUTUREVIEW Caught Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen bg-[#080B10] text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="w-full max-w-xl bg-slate-900/95 border border-rose-500/30 rounded-3xl p-8 shadow-2xl shadow-rose-950/40 backdrop-blur-xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> FUTUREVIEW Self-Healing Layer
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              Spatial Component Interrupted
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              A temporary runtime error occurred during spatial rendering. The state can be safely restored without data loss.
            </p>

            <div className="my-4 p-3 rounded-xl bg-slate-950/80 border border-white/5 text-left text-xs font-mono text-rose-300 overflow-x-auto max-h-32">
              {this.state.error?.toString() || "Unknown Component Error"}
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/50 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload & Restore Safe State
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
