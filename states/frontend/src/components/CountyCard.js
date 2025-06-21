// Purpose: Displays a single county card with its name and form counts when you are on the dashboard page
// Key Features:
// Shows county name and form counts
// Provides a clickable card that opens county details

import React from 'react';

const CountyCard = ({ county, onCardClick }) => {
  // Calculate counts (you'll get this from your API)
  const assignedForms = county.forms?.length || 0;
  const pendingForms = county.forms?.filter(form => form.status === 'pending').length || 0;

  return (
    <div 
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        padding: '1.5rem',
        background: '#F9FAFB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
      onClick={() => onCardClick(county)}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}>
      
      {/* County Name */}
      <div>
        <h3 style={{ 
          margin: '0 0 1rem 0',
          color: '#111827',
          fontSize: '1.25rem',
          fontWeight: '600'
        }}>{county.name}</h3>
      </div>

      {/* Stats */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem'
        }}>
          <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>Assigned Forms:</span>
          <span style={{ 
            color: '#111827', 
            fontSize: '0.875rem', 
            fontWeight: '600' 
          }}>{assignedForms}</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>Pending Forms:</span>
          <span style={{ 
            color: '#F59E0B', 
            fontSize: '0.875rem', 
            fontWeight: '600' 
          }}>{pendingForms}</span>
        </div>
      </div>

      {/* Click indicator */}
      <div style={{
        marginTop: '1rem',
        textAlign: 'center',
        color: '#4F46E5',
        fontSize: '0.75rem',
        fontWeight: '500'
      }}>
        Click to view details →
      </div>
    </div>
  );
};

export default CountyCard;