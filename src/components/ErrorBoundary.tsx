import { Component, type ErrorInfo, type ReactNode } from "react";
import { logAppError } from "../services/errorLogService";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    void logAppError("error", error.message, {
      source: "ErrorBoundary",
      componentStack: errorInfo.componentStack,
    });
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      message: undefined,
    });
    window.location.reload();
  };

  override render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-200">
            EasyCredit recovery mode
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">
            The app hit an unexpected error.
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            Your local data is still on this device. Reload the app to retry, and check the admin
            page later if you need to review recent errors.
          </p>
          {this.state.message ? (
            <p className="mt-4 rounded-2xl bg-black/20 p-3 text-sm text-slate-200">
              {this.state.message}
            </p>
          ) : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-2xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white"
            >
              Reload EasyCredit
            </button>
            <a
              href="mailto:dr.bennyt.09@gmail.com"
              className="rounded-2xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Email developer
            </a>
          </div>
        </div>
      </div>
    );
  }
}
