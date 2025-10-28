// Purpose: Main application component that renders the Dashboard component
// Key Features:
// Sets the background color and font family for the entire app
// Renders the Dashboard component

import React from 'react';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <div className="App" style={{ 
      background: '#F9FAFB',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <Dashboard />
    </div>
  );
}

export default App;