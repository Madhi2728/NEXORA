import { Component } from "react";

// Catches render/lifecycle crashes in a route's subtree so a thrown error
// shows a readable message instead of a blank white page.
export default class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("Route render error:", error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-xl border border-slate-700 bg-slate-900 p-6 text-slate-200">
          <h1 className="text-lg font-bold text-slate-100">Something went wrong on this page</h1>
          <p className="mt-2 text-sm text-slate-400">
            The page hit an error while rendering. This is usually a temporary data problem.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-rose-300">
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              Reload
            </button>
            <a
              href="/login"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500"
            >
              Back to sign in
            </a>
          </div>
        </div>
      </div>
    );
  }
}
