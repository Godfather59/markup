import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
                    <div className="max-w-lg w-full bg-slate-800 rounded-lg p-6 shadow-xl border border-red-500/50">
                        <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h2>
                        <p className="text-slate-300 mb-4">An error occurred while rendering the application.</p>
                        <div className="bg-slate-950 p-4 rounded overflow-auto max-h-60 mb-6">
                            <code className="text-sm font-mono text-red-400">
                                {this.state.error?.toString()}
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
