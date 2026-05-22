import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null, errorInfo: null };
    }
  
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
  
    componentDidCatch(error, errorInfo) {
      console.error("Uncaught error:", error, errorInfo);
      this.setState({ errorInfo });
    }
  
    render() {
      if (this.state.hasError) {
        return (
          <div style={{ padding: '20px', color: '#fff', backgroundColor: '#111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1>Algo salió mal. 😟</h1>
            <p>Por favor recarga la página.</p>
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px', padding: '10px', background: '#333', borderRadius: '5px' }}>
              {this.state.error && this.state.error.toString()}
              <br />
            </details>
            <button 
                onClick={() => window.location.reload()} 
                style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#CCFF00', color: '#000', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
                Recargar
            </button>
          </div>
        );
      }
  
      return this.props.children; 
    }
  }

export default ErrorBoundary;
