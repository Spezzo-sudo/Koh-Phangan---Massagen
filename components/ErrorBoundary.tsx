import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
        if (this.props.fallback) {
            return this.props.fallback;
        }

        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center bg-gray-50">
                <div className="bg-red-100 p-4 rounded-full text-red-500 mb-4">
                    <AlertTriangle size={40} />
                </div>
                <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
                <p className="text-gray-600 mb-6 max-w-md">
                    We apologize for the inconvenience. The application encountered an unexpected error.
                </p>
                
                {this.state.error && (
                    <pre className="bg-gray-100 p-4 rounded text-xs text-left w-full max-w-md overflow-x-auto mb-6 text-red-800 border border-red-200">
                        {this.state.error.toString()}
                    </pre>
                )}

                <button 
                    onClick={() => window.location.reload()}
                    className="bg-brand-teal text-white px-6 py-3 rounded-full font-medium hover:bg-brand-dark transition-colors flex items-center gap-2"
                >
                    <RefreshCw size={18} /> Reload Application
                </button>
            </div>
        );
    }

    return this.props.children;
  }
}