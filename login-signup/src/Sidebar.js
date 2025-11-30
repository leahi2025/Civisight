import React from 'react';
import { useNavigate } from 'react-router-dom';
// We also import the styles here so the sidebar is styled
import './styles.css'; 

// Note: You may want to pass the 'active' item as a prop
// instead of hardcoding 'Dashboard' as active.
// For now, this matches your original code.
function Sidebar() {
  const navigate = useNavigate();
  const menuItems = [
    { icon: '📊', label: 'Dashboard', active: true, to: '/county-dashboard' },
    { icon: '👤', label: 'Account', to: '/account' },
    { icon: '📈', label: 'Insights' },
    { icon: '⚙️', label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div className="logo">Civisight</div>
      <nav className="nav-menu">
        {menuItems.map((item) => (
          <div
            key={item.label}
            className={`nav-item ${item.active ? 'active' : ''}`}
            onClick={() => item.to && navigate(item.to)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' && item.to) navigate(item.to); }}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </div>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;