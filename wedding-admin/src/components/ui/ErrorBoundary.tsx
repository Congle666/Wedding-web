import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 48, textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Đã xảy ra lỗi</p>
          <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 16 }}>
            {this.state.error?.message || 'Lỗi không xác định'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#8B1A1A', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 8, cursor: 'pointer' }}
          >
            Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
