import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios, { fetchCountyById } from './api'; 
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

  // Add Form UI state
  const [selectedForm, setSelectedForm] = useState(null); // CountyForm record selected
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchCounty = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchCountyById(id);
        setCounty(data);
        
        // Fetch user role to determine if they can send reminders
        try {
          const accountResponse = await axios.get('/api/account/me/');
          if (accountResponse.data && accountResponse.data.user_type) {
            setUserRole(accountResponse.data.user_type);
          }
        } catch (err) {
          console.error('Failed to fetch user role:', err);
        }
      } catch (err) {
        console.error("Error fetching county:", err);
        setError('Failed to load county details. You may not have permission to view this county.');
      } finally {
        setLoading(false);
      }
    };

    fetchCounty();
  }, [id]);


  const handleSelectForm = (cf) => {
    setSelectedForm(cf);
  };

  const handleMarkComplete = async (countyFormId) => {
    try {
      setUpdatingStatus(true);
      await axios.patch(`/api/forms/county-forms/${countyFormId}/`, { status: 'completed' });
      // Refresh county details and selected form from latest state
      const data = await fetchCountyById(id);
      setCounty(data);
      const updated = data?.forms?.find((f) => f.id === countyFormId);
      if (updated) setSelectedForm(updated);
    } catch (err) {
      console.error('Failed to mark form complete', err);
      alert('Failed to mark form complete');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendReminders = async (formId) => {
    if (!county || !county.id) {
      alert('County information not available');
      return;
    }
    
    setSendingReminders(true);
    try {
      const response = await axios.post(`/api/forms/${formId}/remind/`, {
        county_id: county.id
      });
      const message = response.data?.message || 'Reminder emails sent successfully!';
      const sentTo = response.data?.sent_to || [];
      if (sentTo.length > 0) {
        alert(`${message}\nEmails sent to: ${sentTo.join(', ')}`);
      } else {
        alert(message);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      alert('Failed to send reminder emails: ' + errorMsg);
    } finally {
      setSendingReminders(false);
    }
  };

  // --- Render Logic ---
  // We build the main layout first, then render content inside
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <h1>{county ? county.name : 'County Details'}</h1>
          <div className="user-profile">
            <span className="avatar">U</span>
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
                  <strong>State:</strong> {county.state || 'N/A'}
              </div>
          
              {county.forms && county.forms.length > 0 ? (
                <div className="forms-section">
                  <strong>Form Completion Status</strong>
                  <ul className="forms-list">
                    {county.forms.map(f => {
                      const status = f.status.toLowerCase();
                      const statusClass = `status-${status.replace(' ', '-')}`;
                      return (
                        <li
                          key={f.id}
                          className="form-list-item"
                          style={{ 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px'
                          }}
                        >
                          <div 
                            style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}
                            onClick={() => handleSelectForm(f)}
                          >
                            <span className="form-name">{f.form?.name || 'Form ' + f.id}</span>
                            <span className={`form-status ${statusClass}`}>{status}</span>
                          </div>
                          {userRole === 'state' && status !== 'completed' && (
                            <button
                              className="btn"
                              style={{ 
                                padding: '4px 12px',
                                fontSize: '12px',
                                minWidth: 'auto'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendReminders(f.form?.id);
                              }}
                              disabled={sendingReminders}
                            >
                              {sendingReminders ? '...' : 'Remind'}
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {selectedForm && (
                    <div className="county-card" style={{ marginTop: 16 }}>
                      <h4 style={{ marginTop: 0 }}>{selectedForm.form?.name || 'Selected Form'}</h4>
                      <div style={{ color: '#374151', fontSize: 14, marginBottom: 8 }}>
                        Status: <strong>{selectedForm.status}</strong>
                      </div>
                      {selectedForm.form?.id ? (
                        <div style={{ display: 'grid', gap: 8 }}>
                          <a
                            className="btn"
                            href={`${axios.defaults.baseURL}/api/forms/${selectedForm.form.id}/file/`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open Form
                          </a>
                          {(() => {
                            const key = selectedForm.form.url || '';
                            const base = key.split('?')[0];
                            return base.toLowerCase().endsWith('.pdf');
                          })() && (
                            <iframe
                              title="Form Preview"
                              src={`${axios.defaults.baseURL}/api/forms/${selectedForm.form.id}/file/`}
                              style={{ width: '100%', height: 480, border: '1px solid #e5e7eb', borderRadius: 8 }}
                            />
                          )}
                        </div>
                      ) : (
                        <div style={{ color: '#6b7280' }}>No URL available for this form.</div>
                      )}
                      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                        {selectedForm.status?.toLowerCase() !== 'completed' && (
                          <button
                            className="btn"
                            disabled={updatingStatus}
                            onClick={() => handleMarkComplete(selectedForm.id)}
                          >
                            {updatingStatus ? 'Marking…' : 'Mark Complete'}
                          </button>
                        )}
                        <button className="btn" style={{ background: '#6b7280' }} onClick={() => setSelectedForm(null)}>
                          Close
                        </button>
                      </div>
                    </div>
                  )}
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