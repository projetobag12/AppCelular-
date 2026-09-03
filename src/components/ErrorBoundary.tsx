import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by boundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0D12] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#141820] border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Falha Temporária na Inicialização</h2>
              <p className="text-xs text-slate-400 mt-1">
                Os dados do sistema foram sincronizados recentemente. Clique abaixo para recarregar com segurança.
              </p>
            </div>
            {this.state.error?.message && (
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 text-left overflow-auto max-h-24">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar Painel
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
