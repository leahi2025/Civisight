import React from 'react';
// We also import the styles here so the sidebar is styled
import './styles.css'; 

// Note: You may want to pass the 'active' item as a prop
// instead of hardcoding 'Dashboard' as active.
// For now, this matches your original code.
function Sidebar() {
  const menuItems = [
    { icon: '📊', label: 'Dashboard', active: true },
    { icon: '👤', label: 'Account' },
    { icon: '📈', label: 'Insights' },
    { icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div className="logo">Civisight</div>
      <nav className="nav-menu">
        {menuItems.map((item) => (
          <div key={item.label} className={`nav-item ${item.active ? 'active' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;