// Purpose: Displays a single form with its title, description, and status when you click on the create global/county form button
// Key Features:
// Shows form title, description, and status
// Status is color-coded based on completion status

import React from 'react';

const FormCard = ({ form }) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '1rem',
      margin: '0.5rem',
      background: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 0.5rem 0' }}>{form.title}</h3>
      <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{form.description}</p>
      <span style={{
        background: form.status === 'completed' ? '#28a745' : '#ffc107',
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.875rem'
      }}>
        {form.status}
      </span>
    </div>
  );
};

export default FormCard;