"use client";

import React, { Component, ReactNode } from "react";
import { HeartCrack, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Custom fallback UI — uses default card if omitted */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Replace with your monitoring service (Sentry, Datadog, etc.) in production
    console.error("[ErrorBoundary] Caught:", error.message, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--app-bg)" }}>
          <div className="text-center max-w-sm">
            <HeartCrack size={40} className="mx-auto mb-4" style={{ color: "var(--app-text-faint)" }} />
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--app-text)" }}>
              Something went wrong
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--app-text-muted)" }}>
              An unexpected error occurred. Please refresh and try again.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: "var(--app-accent)", color: "var(--app-accent-fg)" }}
            >
              <RefreshCcw size={14} />
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
