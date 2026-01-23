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
  const [completedFile, setCompletedFile] = useState(null); // File to upload when marking complete
  const [showCompleteModal, setShowCompleteModal] = useState(false); // Modal for file upload

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
    setCompletedFile(null); // Reset file when selecting a new form
    setShowCompleteModal(false);
  };

  const handleMarkComplete = async (countyFormId, fileToUpload = null) => {
    try {
      setUpdatingStatus(true);
      
      // Use FormData if there's a file to upload
      if (fileToUpload) {
        const formData = new FormData();
        formData.append('status', 'completed');
        formData.append('completed_file', fileToUpload);
        await axios.patch(`/api/forms/county-forms/${countyFormId}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.patch(`/api/forms/county-forms/${countyFormId}/`, { status: 'completed' });
      }
      
      // Refresh county details and selected form from latest state
      const data = await fetchCountyById(id);
      setCounty(data);
      const updated = data?.forms?.find((f) => f.id === countyFormId);
      if (updated) setSelectedForm(updated);
      setShowCompleteModal(false);
      setCompletedFile(null);
      alert('Form marked as complete!' + (fileToUpload ? ' Your submission has been uploaded.' : ''));
    } catch (err) {
      console.error('Failed to mark form complete', err);
      alert('Failed to mark form complete: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCompletedFile(e.target.files[0]);
    }
  };

  const openCompleteModal = () => {
    setShowCompleteModal(true);
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
    setCompletedFile(null);
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
                          <div className="county-status-actions">
                            {status === 'completed' && f.completed_file_url && (
                              <a
                                className="btn btn-small btn-outline"
                                href={`${axios.defaults.baseURL}/api/forms/county-forms/${f.id}/completed-file/`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{ textDecoration: 'none' }}
                              >
                                View File
                              </a>
                            )}
                            {userRole === 'state' && status !== 'completed' && (
                              <button
                                className="btn btn-small btn-outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendReminders(f.form?.id);
                                }}
                                disabled={sendingReminders}
                              >
                                {sendingReminders ? '...' : 'Remind'}
                              </button>
                            )}
                          </div>
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
                      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {selectedForm.status?.toLowerCase() !== 'completed' && (
                          <button
                            className="btn"
                            disabled={updatingStatus}
                            onClick={openCompleteModal}
                          >
                            {updatingStatus ? 'Marking…' : 'Mark Complete'}
                          </button>
                        )}
                        {selectedForm.completed_file_url && (
                          <a
                            className="btn"
                            href={`${axios.defaults.baseURL}/api/forms/county-forms/${selectedForm.id}/completed-file/`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ background: '#10b981', textDecoration: 'none' }}
                          >
                            View Submitted File
                          </a>
                        )}
                        <button className="btn" style={{ background: '#6b7280' }} onClick={() => setSelectedForm(null)}>
                          Close
                        </button>
                      </div>

                      {/* Mark Complete Modal */}
                      {showCompleteModal && (
                        <div style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1000
                        }} onClick={closeCompleteModal}>
                          <div 
                            className="county-card" 
                            style={{ 
                              maxWidth: 480, 
                              width: '90%',
                              margin: 0,
                              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <h3 style={{ marginTop: 0 }}>Mark Form as Complete</h3>
                            <p style={{ color: '#6b7280', fontSize: 14 }}>
                              Upload the completed form (optional). This will be sent to state officials for review.
                            </p>
                            
                            <div style={{ marginBottom: 16 }}>
                              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                Attach Completed Form (PDF)
                              </label>
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileChange}
                                style={{ fontSize: 14 }}
                              />
                              {completedFile && (
                                <div style={{ marginTop: 8, fontSize: 13, color: '#059669' }}>
                                  ✓ Selected: {completedFile.name}
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button 
                                className="btn" 
                                style={{ background: '#6b7280' }}
                                onClick={closeCompleteModal}
                                disabled={updatingStatus}
                              >
                                Cancel
                              </button>
                              <button
                                className="btn"
                                onClick={() => handleMarkComplete(selectedForm.id, completedFile)}
                                disabled={updatingStatus}
                              >
                                {updatingStatus ? 'Submitting...' : (completedFile ? 'Submit & Mark Complete' : 'Mark Complete Without File')}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
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