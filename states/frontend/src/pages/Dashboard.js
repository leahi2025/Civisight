// Purpose: Main dashboard page that displays all counties and their forms
// Key Features:
// Fetches and displays county data from the API
// Allows users to click on a county to view its details
// Provides a button to create a new global form
// Includes due date for forms and reminder email functionality
// NEW: Allows creation of new counties with a + button

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Header from '../components/Header';
import CountyCard from '../components/CountyCard';
import CountyDetail from '../components/CountyDetail';
import FormCreationModal from '../components/FormCreationModal';
import CountyCreationModal from '../components/CountyCreationModal';

const Dashboard = () => {
  const [counties, setCounties] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGlobalForm, setShowGlobalForm] = useState(false);
  const [showCountyForm, setShowCountyForm] = useState(false);
  const [showCountyCreation, setShowCountyCreation] = useState(false);
  const [selectedCountyForForm, setSelectedCountyForForm] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [selectedCountiesForForm, setSelectedCountiesForForm] = useState([]);
  const [creatingForm, setCreatingForm] = useState(false);
  const [creatingCounty, setCreatingCounty] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);

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
  
  const handleCreateCounty = () => {
    setShowCountyCreation(true);
  };

  const handleCountyCreationSubmit = async (countyData) => {
    setCreatingCounty(true);
    try {
      console.log('Creating county with data:', countyData);
      // The backend will automatically add the state agency
      const response = await api.counties.create(countyData);
      console.log('County creation response:', response);
      
      setShowCountyCreation(false);
      fetchCounties(); // Refresh the counties list
      alert('County created successfully!');
    } catch (err) {
      console.error('County creation error:', err);
      alert('Failed to create county: ' + err.message);
    } finally {
      setCreatingCounty(false);
    }
  };

  const handleGlobalFormSubmit = async (e) => {
    e.preventDefault();
    setCreatingForm(true);
    try {
      await api.post('forms/', {
        name: formTitle,
        description: formDescription,
        finish_by: formDueDate,
        counties: selectedCountiesForForm,
      });
      resetFormState();
      fetchCounties();
    } catch (err) {
      alert('Failed to create form: ' + err.message);
    } finally {
      setCreatingForm(false);
    }
  };

  const handleCreateCountyForm = (county) => {
    setSelectedCountyForForm(county);
    setShowCountyForm(true);
  };

  const handleCountyFormSubmit = async (e) => {
    e.preventDefault();
    setCreatingForm(true);
    try {
      await api.post('forms/', {
        name: formTitle,
        description: formDescription,
        finish_by: formDueDate,
        counties: [selectedCountyForForm.id],
      });
      resetCountyFormState();
      fetchCounties();
    } catch (err) {
      alert('Failed to create form: ' + err.message);
    } finally {
      setCreatingForm(false);
    }
  };

  const handleSendReminders = async (formId, userEmails) => {
    setSendingReminders(true);
    try {
      await api.post(`forms/${formId}/remind/`, {
        user_emails: userEmails
      });
      alert('Reminder emails sent successfully!');
    } catch (err) {
      alert('Failed to send reminder emails: ' + err.message);
    } finally {
      setSendingReminders(false);
    }
  };

  const resetFormState = () => {
    setFormTitle('');
    setFormDescription('');
    setFormDueDate('');
    setSelectedCountiesForForm([]);
    setShowGlobalForm(false);
  };

  const resetCountyFormState = () => {
    setFormTitle('');
    setFormDescription('');
    setFormDueDate('');
    setSelectedCountyForForm(null);
    setShowCountyForm(false);
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
      
      {/* Global Form Creation Modal */}
      <FormCreationModal
        isOpen={showGlobalForm}
        onClose={resetFormState}
        onSubmit={handleGlobalFormSubmit}
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        formDescription={formDescription}
        setFormDescription={setFormDescription}
        formDueDate={formDueDate}
        setFormDueDate={setFormDueDate}
        selectedCountiesForForm={selectedCountiesForForm}
        setSelectedCountiesForForm={setSelectedCountiesForForm}
        counties={counties}
        creatingForm={creatingForm}
        title="Create Global Form"
      />

      {/* County Form Creation Modal */}
      <FormCreationModal
        isOpen={showCountyForm}
        onClose={resetCountyFormState}
        onSubmit={handleCountyFormSubmit}
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        formDescription={formDescription}
        setFormDescription={setFormDescription}
        formDueDate={formDueDate}
        setFormDueDate={setFormDueDate}
        selectedCountiesForForm={selectedCountyForForm ? [selectedCountyForForm.id] : []}
        setSelectedCountiesForForm={() => {}}
        counties={counties}
        creatingForm={creatingForm}
        title={`Create Form for ${selectedCountyForForm?.name || 'County'}`}
        disableCountySelection={true}
      />

      {/* County Creation Modal */}
      <CountyCreationModal
        isOpen={showCountyCreation}
        onClose={() => setShowCountyCreation(false)}
        onSubmit={handleCountyCreationSubmit}
        creatingCounty={creatingCounty}
        title="Add New County"
      />

      {/* Main Content */}
      {selectedCounty ? (
        <CountyDetail 
          county={selectedCounty}
          onBack={handleBack}
          onCreateForm={handleCreateCountyForm}
          onSendReminders={handleSendReminders}
          sendingReminders={sendingReminders}
        />
      ) : (
        <main style={{ padding: '2rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '1.5rem',
            position: 'relative'
          }}>
            {counties.map(county => (
              <CountyCard 
                key={county.id} 
                county={county}
                onCardClick={handleCountyClick}
              />
            ))}
            
            {/* Add County Button */}
            <div 
              onClick={handleCreateCounty}
              style={{
                background: 'white',
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                border: '2px dashed #D1D5DB',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '150px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3B82F6';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#D1D5DB';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
              }}
            >
              <div style={{
                background: '#3B82F6',
                color: 'white',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                marginBottom: '1rem'
              }}>
                +
              </div>
              <p style={{
                color: '#6B7280',
                fontSize: '0.875rem',
                textAlign: 'center',
                margin: 0
              }}>
                Add New County
              </p>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Dashboard;