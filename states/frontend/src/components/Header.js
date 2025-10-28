// Purpose: Main navigation header that appears on every page
// Key Features:
// Displays state agency name on the left
// "Create Global Form" button on the right
// Uses the indigo color scheme (#4F46E5)

import React from 'react';
import './StyleComponents.css';

const Header = ({ onCreateGlobalForm }) => {
  return (
    <header className="header">
      <h1 className="headerTitle">Civisight</h1>
      <button 
        onClick={onCreateGlobalForm}
        className="headerButton"
      >
        Create Global Form
      </button>
    </header>
  );
};

export default Header;