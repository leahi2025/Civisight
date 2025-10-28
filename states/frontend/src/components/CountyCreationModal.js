// Purpose: Modal component for creating new counties
// Key Features:
// Form for creating new counties with name, email, and phone
// State agency is automatically set based on logged-in user
// Validation and error handling
// Responsive design with proper styling
// Matches the existing color scheme

import React, { useState } from 'react';

const CountyCreationModal = ({
  isOpen,
  onClose,
  onSubmit,
  creatingCounty,
  title = "Add New County"
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'County name is required';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Submit form data without state - backend will handle it
      await onSubmit(formData);
      // Reset form on successful submission
      setFormData({
        name: '',
        email: '',
        phone: ''
      });
      setErrors({});
    } catch (err) {
      // Handle submission error
      console.error('Failed to create county:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '2rem',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            color: '#111827',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: 0
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6B7280'
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          background: '#F0F9FF',
          border: '1px solid #BAE6FD',
          borderRadius: '6px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <p style={{
            color: '#0369A1',
            fontSize: '0.875rem',
            margin: 0,
            fontWeight: '500'
          }}>
            🏛️ This county will be associated with your state agency
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              County Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: errors.name ? '1px solid #DC2626' : '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
              placeholder="Enter county name"
            />
            {errors.name && (
              <p style={{
                color: '#DC2626',
                fontSize: '0.75rem',
                marginTop: '0.25rem'
              }}>
                {errors.name}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: errors.email ? '1px solid #DC2626' : '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
              placeholder="Enter county email address"
            />
            {errors.email && (
              <p style={{
                color: '#DC2626',
                fontSize: '0.75rem',
                marginTop: '0.25rem'
              }}>
                {errors.email}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: errors.phone ? '1px solid #DC2626' : '1px solid #D1D5DB',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
              placeholder="Enter county phone number"
            />
            {errors.phone && (
              <p style={{
                color: '#DC2626',
                fontSize: '0.75rem',
                marginTop: '0.25rem'
              }}>
                {errors.phone}
              </p>
            )}
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#F3F4F6',
                color: '#374151',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingCounty}
              style={{
                background: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                opacity: creatingCounty ? 0.6 : 1
              }}
            >
              {creatingCounty ? 'Creating...' : 'Create County'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CountyCreationModal;