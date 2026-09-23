import { Component } from 'react';

// Keeps one broken section from blanking the whole page.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="crash">
        <div className="dialog">
          <span className="dialog-icon">🎈</span>
          <h3>Oops, a balloon popped</h3>
          <p>Something went wrong on this page. A refresh usually fixes it.</p>
          <div className="dialog-actions">
            <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>Refresh</button>
          </div>
        </div>
      </div>
    );
  }
}
