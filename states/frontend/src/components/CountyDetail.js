// Purpose: Displays detailed information about a specific county when you click on a county card
// Key Features:
// Shows county name and assigned forms
// Provides a button to create a new county-specific form



import React from 'react';

const CountyDetail = ({ county, onBack, onCreateForm }) => {
  return (
    <div style={{ padding: '2rem' }}>
      {/* Back button and header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <button 
          onClick={onBack}
          style={{
            background: 'none',
            border: '1px solid #E5E7EB',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            color: '#6B7280',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}>
          ← Back to Counties
        </button>
        
        <button 
          onClick={() => onCreateForm(county)}
          style={{
            background: '#4F46E5',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
          Create County Form
        </button>
      </div>

      {/* County name */}
      <h2 style={{
        color: '#111827',
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem'
      }}>{county.name} County</h2>

      {/* Forms list */}
      <div>
        <h3 style={{
          color: '#111827',
          fontSize: '1.25rem',
          fontWeight: '600',
          marginBottom: '1rem'
        }}>Assigned Forms</h3>
        
        {county.forms && county.forms.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {county.forms.map(form => (
              <div key={form.id} style={{
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '1rem',
                background: '#FFFFFF'
              }}>
                <h4 style={{
                  margin: '0 0 0.5rem 0',
                  color: '#111827',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>{form.title}</h4>
                <p style={{
                  margin: '0 0 0.5rem 0',
                  color: '#6B7280',
                  fontSize: '0.875rem'
                }}>{form.description}</p>
                <span style={{
                  background: form.status === 'completed' ? '#10B981' : 
                             form.status === 'pending' ? '#F59E0B' : '#3B82F6',
                  color: '#FFFFFF',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {form.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#6B7280',
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '8px'
          }}>
            No forms assigned to this county yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default CountyDetail;