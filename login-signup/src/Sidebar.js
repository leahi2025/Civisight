import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from './api';
// We also import the styles here so the sidebar is styled
import './styles.css'; 

// Note: You may want to pass the 'active' item as a prop
// instead of hardcoding 'Dashboard' as active.
// For now, this matches your original code.
function Sidebar() {
  const navigate = useNavigate();
  const menuItems = [
    { label: 'Dashboard', to: '/county-dashboard' },
    { label: 'Insights', to: '/forms-insights' },
    { label: 'Account', to: '/account' },
  ];
  const handleSignOut = async () => {
    try {
      await axios.post('/api/signout/');
    } catch (err) {
      // ignore errors; proceed to client-side redirect
    } finally {
      // navigate to login and reload app state
      navigate('/login');
      // optional: force a reload to clear any client state
      try { window.location.reload(); } catch (e) {}
    }
  };

  return (
    <div className="sidebar">
      <div className="logo">Civisight</div>
      <nav className="nav-menu">
        {menuItems.map((item) => (
          <div
            key={item.label}
            className="nav-item"
            onClick={() => item.to && navigate(item.to)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' && item.to) navigate(item.to); }}
          >
            {item.label}
          </div>
        ))}
      </nav>

      <div className="nav-footer">
        <div
          className="nav-item signout"
          onClick={handleSignOut}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSignOut(); }}
        >
          Sign out
        </div>
      </div>
    </div>
  );
}

export default Sidebar;