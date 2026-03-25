import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
          <AlertTriangle className="w-10 h-10 text-destructive" />
          <h2 className="text-lg font-display font-semibold">发生了意外错误</h2>
          <pre className="text-xs text-muted-foreground bg-secondary rounded-lg p-4 max-w-lg overflow-auto max-h-32">
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            重新加载
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
