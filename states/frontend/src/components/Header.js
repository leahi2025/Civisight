// Purpose: Main navigation header that appears on every page
// Key Features:
// Displays state agency name on the left
// "Create Global Form" button on the right
// Uses the indigo color scheme (#4F46E5)

import React from 'react';

const Header = ({ onCreateGlobalForm }) => {
  return (
    <header style={{ 
      background: '#FFFFFF', 
      padding: '1.5rem 2rem', 
      borderBottom: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      {/* Left side - State Agency Name */}
      <div>
        <h1 style={{ 
          margin: 0, 
          color: '#4F46E5',
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}>Associate of County Commissioners of Georgia</h1>
      </div>

      {/* Right side - Create Global Form Button */}
      <button
        style={{
          background: '#4F46E5',
          color: '#FFFFFF',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
        onClick={onCreateGlobalForm}
        onMouseEnter={e => e.target.style.background = '#4338CA'}
        onMouseLeave={e => e.target.style.background = '#4F46E5'}
      >
        Create Global Form
      </button>
    </header>
  );
};

export default Header;