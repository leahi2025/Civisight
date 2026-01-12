import React, { useEffect, useState } from 'react';
import { fetchCounties } from './api';
import './styles.css';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';


function CountyDashboard() {
  const [counties, setCounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const userState = localStorage.getItem('userState');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const fetcher = () => fetchCounties().then(data => data).catch(err => { throw err; });

    fetcher()
      .then(data => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : data.results || [];
        const filtered = userState ? list.filter(c => String(c.state) === String(userState) || c.state === userState) : list;
        setCounties(filtered);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load counties');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [userState]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleCounties = !normalizedQuery
    ? counties
    : counties.filter(c =>
        (c.name || '').toLowerCase().includes(normalizedQuery) ||
        (String(c.state) || '').toLowerCase().includes(normalizedQuery)
      );

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <h1>County Dashboard</h1>
          <div className="user-profile">
            <span className="avatar">👤</span>
          </div>
        </header>

        <div className="content-area">
          <div className="search-row">
            <input
              className="search-input"
              type="text"
              placeholder="Search counties by name or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {loading && <p className="status-message">Loading counties...</p>}
          {error && <div className="error-message">{error}</div>}

          {!loading && !error && (
            <div className="counties-grid">
              {visibleCounties.map(county => (
                <Link to={`/county/${county.id}`} key={county.id} className="county-link">
                  <div key={county.id} className="county-card">
                    <h3>
                      <span>📍</span>
                      {county.name}
                    </h3>
                    <div className="county-state">
                      <span>📍</span> {county.state}
                    </div>
                    {county.forms && county.forms.length > 0 && (
                      <div className="forms-section">
                        <strong>Form Completion Status</strong>
                        <ul className="forms-list">
                          {county.forms.map(f => {
                            const status = f.status.toLowerCase();
                            const statusClass = `status-${status.replace(' ', '-')}`;
                            return (
                              <li key={f.id}>
                                <span className="form-name">{f.form?.name || 'Form ' + f.id}</span>
                                <span className={`form-status ${statusClass}`}>{status}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
              {visibleCounties.length === 0 && 
                <div className="empty-state">No counties found for your state.</div>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CountyDashboard;
