// Purpose: Main dashboard page that displays all counties and their forms
// Key Features:
// Fetches and displays county data from the API
// Allows users to click on a county to view its details
// Provides a button to create a new global form

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import CountyCard from '../components/CountyCard';
import CountyDetail from '../components/CountyDetail';

const Dashboard = () => {
  const [counties, setCounties] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGlobalForm, setShowGlobalForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [selectedCountiesForForm, setSelectedCountiesForForm] = useState([]);
  const [creatingForm, setCreatingForm] = useState(false);

  useEffect(() => {
    fetchCounties();
  }, []);

  const fetchCounties = async () => {
    try {
      setLoading(true);
      const data = await api.get('counties/');
      if (data && Array.isArray(data.results)) {
        setCounties(data.results);
      } else if (Array.isArray(data)) {
        setCounties(data);
      } else {
        setCounties([]);
      }
    } catch (err) {
      setError(err.message);
      setCounties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCountyClick = (county) => {
    setSelectedCounty(county);
  };

  const handleBack = () => {
    setSelectedCounty(null);
  };

  const handleCreateGlobalForm = () => {
    setShowGlobalForm(true);
  };

  const handleGlobalFormSubmit = async (e) => {
    e.preventDefault();
    setCreatingForm(true);
    try {
      await api.post('forms/', {
        title: formTitle,
        description: formDescription,
        counties: selectedCountiesForForm,
      });
      setShowGlobalForm(false);
      setFormTitle('');
      setFormDescription('');
      setSelectedCountiesForForm([]);
      fetchCounties();
    } catch (err) {
      alert('Failed to create form: ' + err.message);
    } finally {
      setCreatingForm(false);
    }
  };

  const handleCountySelect = (e) => {
    const options = Array.from(e.target.selectedOptions);
    setSelectedCountiesForForm(options.map(opt => opt.value));
  };

  const handleCreateCountyForm = (county) => {
    // TODO: Implement county-specific form creation
    console.log('Create form for county:', county.name);
  };

  if (loading) return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>
      <Header onCreateGlobalForm={handleCreateGlobalForm} />
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: '#6B7280',
        fontSize: '1.125rem'
      }}>
        Loading counties...
      </div>
    </div>
  );

  if (error) return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>
      <Header onCreateGlobalForm={handleCreateGlobalForm} />
      <div style={{ 
        padding: '2rem', 
        color: '#DC2626',
        textAlign: 'center',
        fontSize: '1.125rem'
      }}>
        Error: {error}
      </div>
    </div>
  );

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>
      <Header onCreateGlobalForm={handleCreateGlobalForm} />
      {/* Global Form Modal */}
      {showGlobalForm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(31,41,55,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <form
            onSubmit={handleGlobalFormSubmit}
            style={{
              background: '#FFFFFF',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
              minWidth: '350px',
              maxWidth: '90vw'
            }}
          >
            <h2 style={{ color: '#4F46E5', marginBottom: '1rem' }}>Create Global Form</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#111827', fontWeight: 500 }}>Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  marginTop: '0.25rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#111827', fontWeight: 500 }}>Description</label>
              <textarea
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  marginTop: '0.25rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#111827', fontWeight: 500 }}>Assign to Counties</label>
              <select
                multiple
                value={selectedCountiesForForm}
                onChange={handleCountySelect}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  marginTop: '0.25rem',
                  minHeight: '80px'
                }}
              >
                {counties.map(county => (
                  <option key={county.id} value={county.id}>{county.name}</option>
                ))}
              </select>
              <div style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Hold Ctrl (Windows) or Cmd (Mac) to select multiple counties.
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setShowGlobalForm(false)}
                style={{
                  background: '#E5E7EB',
                  color: '#111827',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                disabled={creatingForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: '#4F46E5',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
                disabled={creatingForm}
              >
                {creatingForm ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content */}
      {selectedCounty ? (
        <CountyDetail 
          county={selectedCounty}
          onBack={handleBack}
          onCreateForm={handleCreateCountyForm}
        />
      ) : (
        <main style={{ padding: '2rem' }}>
          <h2 style={{
            color: '#111827',
            fontSize: '1.875rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem'
          }}>Counties</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {counties.map(county => (
              <CountyCard 
                key={county.id} 
                county={county}
                onCardClick={handleCountyClick}
              />
            ))}
          </div>
        </main>
      )}
    </div>
  );
};

export default Dashboard;