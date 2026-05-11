import { Button } from "@cloudflare/kumo/components/button";
import { Component, type ErrorInfo, type ReactNode } from "react";

import { ErrorState } from "../ui/ErrorState";

type Props = {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
};

type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, info);
  }

  reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(error, this.reset);
    }

    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col gap-4">
          <ErrorState error={error} />
          <Button
            type="button"
            variant="primary"
            onClick={this.reset}
            className="rounded-sm"
          >
            Spróbuj ponownie
          </Button>
        </div>
      </div>
    );
  }
}

export function RouteErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 py-8">
      <ErrorState error={error} />
      <div>
        <Button
          type="button"
          variant="primary"
          onClick={reset}
          className="rounded-sm"
        >
          Spróbuj ponownie
        </Button>
      </div>
    </div>
  );
}
