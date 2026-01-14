import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios, { fetchCounties } from './api';
import Sidebar from './Sidebar';
import './styles.css';

function FormsInsights() {
  const [searchParams, setSearchParams] = useSearchParams();
  const formIdParam = searchParams.get('formId');
  
  const [counties, setCounties] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'due_date', 'status'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [filterCounty, setFilterCounty] = useState(''); // county id to filter by
  const [filterStatus, setFilterStatus] = useState(''); // 'completed', 'pending', or ''
  const [filterFormId, setFilterFormId] = useState(null); // specific form id to filter by
  const [showFilters, setShowFilters] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [sendingReminder, setSendingReminder] = useState(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [userType, setUserType] = useState(null); // 'state' or 'county'
  const [userCountyId, setUserCountyId] = useState(null); // county id if county user
  const [form, setForm] = useState({
    name: '',
    finish_by: '',
    notify_every: 7,
    url: '',
    counties: [],
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchForms = async () => {
    try {
      const res = await axios.get('/api/forms/');
      setForms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch forms', err);
    }
  };

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchCounties(),
      axios.get('/api/forms/'),
      axios.get('/api/account/me/')
    ]).then(([countiesData, formsRes, accountRes]) => {
      if (!mounted) return;
      setCounties(Array.isArray(countiesData) ? countiesData : []);
      const formsData = Array.isArray(formsRes.data) ? formsRes.data : [];
      setForms(formsData);
      
      // Set user type and county id if county user
      if (accountRes.data) {
        setUserType(accountRes.data.user_type || null);
        setUserCountyId(accountRes.data.county_id || null);
      }
      
      // Auto-filter to specific form if formId is in URL params
      if (formIdParam) {
        const targetForm = formsData.find(f => String(f.id) === String(formIdParam));
        if (targetForm) {
          // Set filter to show only this form
          setFilterFormId(formIdParam);
          setSelectedForm(targetForm);
        }
      }
      
      setLoading(false);
    }).catch(() => {
      if (!mounted) return;
      setError('Failed to load data');
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [formIdParam]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCountyToggle = (id) => {
    setForm(prev => {
      const setIds = new Set(prev.counties.map(String));
      const sId = String(id);
      if (setIds.has(sId)) {
        setIds.delete(sId);
      } else {
        setIds.add(sId);
      }
      return { ...prev, counties: Array.from(setIds) };
    });
  };

  const handleFile = (e) => {
    setFile(e.target.files && e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      if (form.finish_by) fd.append('finish_by', form.finish_by);
      fd.append('notify_every', form.notify_every);
      if (form.url) fd.append('url', form.url);
      if (file) fd.append('file', file);
      // append counties as repeated fields so DRF's getlist() or request.data handles them
      for (const c of form.counties) {
        fd.append('counties', c);
      }

      await axios.post('/api/forms/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // success: clear form and refresh forms list
      setForm({ name: '', finish_by: '', notify_every: 7, url: '', counties: [] });
      setFile(null);
      setShowCreateForm(false);
      fetchForms();
    } catch (err) {
      setError((err.response && (err.response.data.error || JSON.stringify(err.response.data))) || 'Failed to create form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormClick = (formItem) => {
    setSelectedForm(selectedForm?.id === formItem.id ? null : formItem);
    setReminderMessage('');
  };

  const sendReminder = async (formId, countyId, countyName) => {
    setSendingReminder(countyId);
    setReminderMessage('');
    try {
      const res = await axios.post(`/api/forms/${formId}/remind/`, { county_id: countyId });
      setReminderMessage(`Reminder sent to ${countyName}: ${res.data.message}`);
      setTimeout(() => setReminderMessage(''), 5000);
    } catch (err) {
      setReminderMessage(`Failed to send reminder to ${countyName}`);
    } finally {
      setSendingReminder(null);
    }
  };

  const sendReminderToAll = async (formItem) => {
    setSendingReminder('all');
    setReminderMessage('');
    const incompleteCounties = (formItem.county_statuses || []).filter(cs => cs.status !== 'completed');
    let sentCount = 0;
    for (const cs of incompleteCounties) {
      try {
        await axios.post(`/api/forms/${formItem.id}/remind/`, { county_id: cs.county_id });
        sentCount++;
      } catch (err) {
        console.error(`Failed to send to ${cs.county_name}`, err);
      }
    }
    setReminderMessage(`Sent reminders to ${sentCount} of ${incompleteCounties.length} counties`);
    setSendingReminder(null);
    setTimeout(() => setReminderMessage(''), 5000);
  };

  // Filter and sort forms
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const isCountyUser = userType === 'county';
  const filteredForms = (() => {
    let result = [...forms];

    // If specific form ID filter is set (from URL param), only show that form
    if (filterFormId) {
      result = result.filter(f => String(f.id) === String(filterFormId));
      return result; // Skip other filters when showing specific form
    }

    // If county user, filter to only show forms assigned to their county
    if (isCountyUser && userCountyId) {
      result = result.filter(f =>
        (f.county_statuses || []).some(cs => String(cs.county_id) === String(userCountyId))
      );
    }

    // Search filter
    if (normalizedQuery) {
      result = result.filter(f =>
        (f.name || '').toLowerCase().includes(normalizedQuery) ||
        (f.counties_details || []).some(c => (c.name || '').toLowerCase().includes(normalizedQuery))
      );
    }

    // County filter (only for state users)
    if (!isCountyUser && filterCounty) {
      result = result.filter(f =>
        (f.counties_details || []).some(c => String(c.id) === String(filterCounty))
      );
    }

    // Status filter
    if (filterStatus === 'completed') {
      result = result.filter(f => f.is_completed);
    } else if (filterStatus === 'pending') {
      result = result.filter(f => !f.is_completed);
    }

    // Sort the filtered forms
    result.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortBy === 'due_date') {
        const dateA = a.finish_by ? new Date(a.finish_by).getTime() : Infinity;
        const dateB = b.finish_by ? new Date(b.finish_by).getTime() : Infinity;
        comparison = dateA - dateB;
      } else if (sortBy === 'status') {
        // completed forms come after pending
        const statusA = a.is_completed ? 1 : 0;
        const statusB = b.is_completed ? 1 : 0;
        comparison = statusA - statusB;
      } else if (sortBy === 'progress') {
        const getProgress = (f) => {
          const statuses = f.county_statuses || [];
          if (statuses.length === 0) return 0;
          return statuses.filter(cs => cs.status === 'completed').length / statuses.length;
        };
        comparison = getProgress(a) - getProgress(b);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  })();

  // For county users, only count status filter; for state users, count both
  const activeFilterCount = isCountyUser 
    ? (filterStatus ? 1 : 0) 
    : (filterCounty ? 1 : 0) + (filterStatus ? 1 : 0);

  const clearFilters = () => {
    if (!isCountyUser) setFilterCounty('');
    setFilterStatus('');
  };

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  if (loading) return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">Loading insights...</div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <header className="dashboard-header">
          <h1>Forms & Insights</h1>
          <div className="user-profile">
            <span className="avatar">U</span>
          </div>
        </header>

        <div className="content-area">
          <div className="forms-toolbar">
            <div className="forms-toolbar-left">
              {!isCountyUser && (
                <button className="btn" onClick={() => setShowCreateForm(v => !v)}>
                  {showCreateForm ? 'Close' : '+ New Form'}
                </button>
              )}
              <h3 className="section-title" style={{ margin: 0 }}>
                {filterFormId ? `Viewing Form` : `All Forms`} ({filteredForms.length})
              </h3>
              {filterFormId && (
                <button 
                  className="btn btn-outline" 
                  onClick={() => {
                    setFilterFormId(null);
                    setSelectedForm(null);
                    setSearchParams({});
                  }}
                >
                  Show All Forms
                </button>
              )}
            </div>
            <div className="forms-toolbar-right">
              <div className="filter-container">
                <button
                  type="button"
                  onClick={() => setShowFilters(v => !v)}
                  className={`filter-btn ${activeFilterCount > 0 ? 'active' : ''}`}
                >
                  Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
                {showFilters && (
                  <div className="filter-dropdown">
                    {!isCountyUser && (
                      <div className="filter-section">
                        <label className="filter-label">County</label>
                        <select
                          value={filterCounty}
                          onChange={(e) => setFilterCounty(e.target.value)}
                          className="filter-select"
                        >
                          <option value="">All Counties</option>
                          {counties.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="filter-section">
                      <label className="filter-label">Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="filter-select"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    {activeFilterCount > 0 && (
                      <button type="button" className="filter-clear-btn" onClick={clearFilters}>
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="sort-select"
              >
                <option value="name">Name</option>
                <option value="due_date">Due</option>
                <option value="status">Status</option>
                <option value="progress">Progress</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="sort-order-btn"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                style={{ maxWidth: 160, height: 38, boxSizing: 'border-box' }}
              />
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          {showCreateForm && (
          <div className="create-form-section">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label className="form-label">Form name</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Enter form name" className="input-style" style={{ margin: 0 }} required />
              </div>

              <div className="form-grid-2">
                <div>
                  <label className="form-label">Finish by</label>
                  <input name="finish_by" type="datetime-local" value={form.finish_by} onChange={handleChange} className="input-style" style={{ margin: 0 }} />
                </div>
                <div>
                  <label className="form-label">Notify (days)</label>
                  <input name="notify_every" type="number" value={form.notify_every} onChange={handleChange} className="input-style" style={{ margin: 0 }} />
                </div>
              </div>

              <div className="form-row">
                <label className="form-label">File URL (optional)</label>
                <input name="url" value={form.url} onChange={handleChange} placeholder="https://..." className="input-style" style={{ margin: 0 }} />
              </div>

              <div className="form-row">
                <label className="form-label">Or upload file</label>
                <input type="file" onChange={handleFile} style={{ fontSize: 14 }} />
              </div>

              <div className="form-row">
                <label className="form-label" style={{ marginBottom: 8 }}>Assign to counties</label>
                <div className="counties-checkbox-grid">
                  {counties.map(c => (
                    <label key={c.id} className={`county-checkbox-label ${form.counties.includes(String(c.id)) || form.counties.includes(c.id) ? 'selected' : ''}`}>
                      <input type="checkbox" checked={form.counties.includes(String(c.id)) || form.counties.includes(c.id)} onChange={() => handleCountyToggle(c.id)} />
                      <span>{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <button type="submit" className="btn" disabled={submitting}>{submitting ? 'Creating...' : 'Create form'}</button>
              </div>
            </form>
          </div>
          )}

          {/* Forms List */}
          <div style={{ marginTop: 24 }}>
            {filteredForms.length === 0 ? (
              <div className="empty-state">No forms found</div>
            ) : (
              <div className="forms-grid">
                {filteredForms.map(f => {
                  const countyStatuses = f.county_statuses || [];
                  const completedCount = countyStatuses.filter(cs => cs.status === 'completed').length;
                  const totalCount = countyStatuses.length;
                  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                  const isExpanded = selectedForm?.id === f.id;

                  return (
                    <div key={f.id} className="form-card" onClick={() => handleFormClick(f)}>
                      <div className="form-card-header">
                        <h3 className="form-card-title">{f.name}</h3>
                        <div className="form-card-actions" onClick={e => e.stopPropagation()}>
                          <span className={`form-status status-${f.is_completed ? 'completed' : 'pending'}`}>
                            {f.is_completed ? 'Completed' : 'Pending'}
                          </span>
                          {f.resolved_url && (
                            <a href={f.resolved_url} target="_blank" rel="noopener noreferrer" className="btn btn-small btn-outline">
                              View
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="form-card-meta">
                        <strong>Due:</strong> {f.finish_by ? new Date(f.finish_by).toLocaleDateString() : 'No deadline'}
                      </div>
                      <div className="form-card-meta">
                        <strong>Progress:</strong> {completedCount} of {totalCount} counties
                      </div>
                      <div className="progress-bar-container">
                        <div 
                          className={`progress-bar-fill ${progressPercent === 100 ? 'complete' : 'in-progress'}`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="progress-text">{progressPercent}% complete</div>

                      {/* Expanded Detail View */}
                      {isExpanded && (
                        <div className="form-detail-section" onClick={e => e.stopPropagation()}>
                          {reminderMessage && (
                            <div className="reminder-message">{reminderMessage}</div>
                          )}
                          
                          <div className="form-detail-header">
                            <h4 className="form-detail-title">County Status</h4>
                            {countyStatuses.some(cs => cs.status !== 'completed') && (
                              <button
                                className="btn btn-small"
                                onClick={() => sendReminderToAll(f)}
                                disabled={sendingReminder === 'all'}
                              >
                                {sendingReminder === 'all' ? 'Sending...' : 'Remind All'}
                              </button>
                            )}
                          </div>

                          {countyStatuses.length === 0 ? (
                            <div className="form-card-meta">No counties assigned</div>
                          ) : (
                            <div className="county-status-list">
                              {countyStatuses.map(cs => (
                                <div key={cs.id} className="county-status-item">
                                  <div className="county-status-info">
                                    <span className="county-status-name">{cs.county_name}</span>
                                    <span className={`county-status-badge ${cs.status === 'completed' ? 'completed' : cs.status === 'in_progress' ? 'in-progress' : 'pending'}`}>
                                      {cs.status === 'completed' ? 'Completed' : cs.status === 'in_progress' ? 'In Progress' : 'Pending'}
                                    </span>
                                  </div>
                                  {cs.status !== 'completed' && (
                                    <button
                                      className="btn btn-small btn-outline"
                                      onClick={() => sendReminder(f.id, cs.county_id, cs.county_name)}
                                      disabled={sendingReminder === cs.county_id}
                                    >
                                      {sendingReminder === cs.county_id ? 'Sending...' : 'Remind'}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormsInsights;
