// Purpose: Modal component for creating new forms (global or county-specific)
// Key Features:
// Reusable form creation modal
// Handles form submission
// Supports multiple county selection or single county (disabled)
// Includes due date field

import React from 'react';
import './StyleComponents.css';

const FormCreationModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formTitle, 
  setFormTitle, 
  formDescription, 
  setFormDescription, 
  formDueDate,
  setFormDueDate,
  selectedCountiesForForm, 
  setSelectedCountiesForForm, 
  counties, 
  creatingForm,
  title = "Create Global Form",
  disableCountySelection = false
}) => {
  if (!isOpen) return null;

  const handleCountySelect = (e) => {
    const options = Array.from(e.target.selectedOptions);
    setSelectedCountiesForForm(options.map(opt => opt.value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className="formCreationModalOverlay">
      <form onSubmit={handleSubmit} className="formCreationModalForm">
        <h2 className="formCreationModalTitle">{title}</h2>
        
        <div className="formCreationModalGroup">
          <label className="formCreationModalLabel">Title</label>
          <input
            type="text"
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
            required
            className="formCreationModalInput"
          />
        </div>
        
        <div className="formCreationModalGroup">
          <label className="formCreationModalLabel">Description</label>
          <textarea
            value={formDescription}
            onChange={e => setFormDescription(e.target.value)}
            required
            className="formCreationModalInput"
          />
        </div>

        <div className="formCreationModalGroup">
          <label className="formCreationModalLabel">Due Date</label>
          <input
            type="datetime-local"
            value={formDueDate}
            onChange={e => setFormDueDate(e.target.value)}
            required
            className="formCreationModalInput"
          />
        </div>
        
        {!disableCountySelection && (
          <div className="formCreationModalGroup">
            <label className="formCreationModalLabel">Assign to Counties</label>
            <select
              multiple
              value={selectedCountiesForForm}
              onChange={handleCountySelect}
              className="formCreationModalSelect"
            >
              {counties.map(county => (
                <option key={county.id} value={county.id}>{county.name}</option>
              ))}
            </select>
            <div className="formCreationModalHelpText">
              Hold Ctrl (Windows) or Cmd (Mac) to select multiple counties.
            </div>
          </div>
        )}
        
        <div className="formCreationModalButtonGroup">
          <button
            type="button"
            onClick={onClose}
            className="formCreationModalButton secondary"
            disabled={creatingForm}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="formCreationModalButton primary"
            disabled={creatingForm}
          >
            {creatingForm ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormCreationModal;