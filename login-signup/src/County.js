import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCountyById } from './api'; 
import Sidebar from './Sidebar'; // <-- Import the shared Sidebar
import './styles.css'; // <-- Import the styles

/**
 * This component fetches and displays details for a single county,
 * now with the full dashboard layout.
 */
function County() {
  const { id } = useParams();

  const [county, setCounty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCounty = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchCountyById(id);
        setCounty(data);
      } catch (err) {
        console.error("Error fetching county:", err);
        setError('Failed to load county details. You may not have permission to view this county.');
      } finally {
        setLoading(false);
      }
    };

    fetchCounty();
  }, [id]);

  // --- Render Logic ---
  // We build the main layout first, then render content inside
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <h1>{county ? county.name : 'County Details'}</h1>
          <div className="user-profile">
            <span className="avatar">👤</span>
          </div>
        </header>

        <div className="content-area">
          {/* Place the loading/error/content logic here */}
          {loading && <p className="status-message">Loading county details...</p>}
          
          {error && <div className="error-message">{error}</div>}

          {!loading && !error && !county && (
            <div className="empty-state">No county data found.</div>
          )}

          {/* This is the success state. We use 'county-card' for styling. */}
          {!loading && !error && county && (
            <div className="county-card">
              <h3>{county.name}</h3>
              
              <div className="county-state">
                  <span>📍</span> {county.state || 'N/A'}
              </div>
          
              {county.forms && county.forms.length > 0 ? (
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
              ) : (
                <p className="status-message">No forms found for this county.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default County;