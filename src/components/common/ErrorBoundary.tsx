import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[200px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="text-red-500 text-xl mr-3">⚠️</div>
              <h2 className="text-lg font-semibold text-red-800">
                Something went wrong
              </h2>
            </div>
            
            <p className="text-sm text-red-700 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Reload Page
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer text-red-600 hover:text-red-800">
                  Show Error Details
                </summary>
                <pre className="mt-2 p-2 bg-red-100 rounded text-red-800 overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;