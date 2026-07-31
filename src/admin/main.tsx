// ============================================
// Admin Panel Entry Point
// ============================================

import { StrictMode, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AdminApp from './AdminApp';
import '@/index.css';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: '#fff', background: '#000', minHeight: '100vh' }}>
          <h2 style={{ color: '#E50914', marginBottom: 12 }}>Admin Panel Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 14, color: '#ccc' }}>
            {this.state.error.message}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: '#888', marginTop: 12 }}>
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = createRoot(document.getElementById('admin-root')!);
root.render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AdminApp />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
