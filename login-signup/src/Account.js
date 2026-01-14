import React, { useEffect, useState } from 'react';
import axios from './api';
import Sidebar from './Sidebar';
import './styles.css';

function Account() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios.get('/api/account/me/')
      .then(res => { if (mounted) setData(res.data); })
      .catch(err => { if (mounted) setError('Failed to load account info'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header"><h1>Account</h1></header>
        <div className="content-area"><div className="status-message">Loading...</div></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header"><h1>Account</h1></header>
        <div className="content-area"><div className="error-message">{error}</div></div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <h1>Account</h1>
          <div className="user-profile"><span className="avatar">U</span></div>
        </header>
        <div className="content-area">
          <div className="county-card" style={{maxWidth: 520}}>
            <h3>My Account</h3>
            <div className="county-state"><strong>Email:</strong> {data?.email}</div>
            <div className="county-state"><strong>Role:</strong> {data?.user_type}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;
