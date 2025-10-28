// Purpose: Displays detailed information about a specific county when you click on a county card
// Key Features:
// Shows county name and assigned forms
// Provides a button to create a new county-specific form
// Includes reminder email functionality for incomplete forms

import React from 'react';
import './StyleComponents.css';

const CountyDetail = ({ county, onBack, onCreateForm, onSendReminders, sendingReminders }) => {
  const handleSendReminders = (formId) => {
    if (county.email) {
      onSendReminders(formId, [county.email]);
    } else {
      alert('No email found for this county.');
    }
    // TODO: add reminder email functionality for incomplete users
    // if (form.incomplete_user_ids && form.incomplete_user_ids.length > 0) {
    //   onSendReminders(form.id, form.incomplete_user_ids);
    // } else {
    //   alert('No incomplete users found for this form.');
    // }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return 'No due date set';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="countyDetail">
      {/* Back button and header */}
      <div className="countyDetailHeader">
        <button 
          onClick={onBack}
          className="countyDetailBackButton"
        >
          ← Back to Counties
        </button>
        
        <button 
          onClick={() => onCreateForm(county)}
          className="countyDetailCreateButton"
        >
          Create County Form
        </button>
      </div>

      {/* County name */}
      <h2 className="countyDetailTitle">{county.name} County</h2>

      {/* Forms list */}
      <div>
        <h3 className="countyDetailSectionTitle">Assigned Forms</h3>
        
        {county.forms && county.forms.length > 0 ? (
  <div>
    {county.forms.map(countyForm => (
      <div key={countyForm.id} className="countyDetailFormCard">
        <div className="countyDetailFormHeader">
          <h4 className="countyDetailFormTitle">{countyForm.form.name}</h4>
          <span className={`countyDetailFormStatus ${countyForm.form.is_completed ? '' : 'pending'}`}>
            {countyForm.form.is_completed ? 'Completed' : 'Pending'}
          </span>
        </div>
        
        <div className="countyDetailFormMeta">
          <span className="countyDetailFormDueDate">
            Due: {formatDueDate(countyForm.form.finish_by)}
          </span>
        </div>

        {/* Add Send Reminder Button */}
        <div className="countyDetailFormActions">
          {!countyForm.form.is_completed && (
            <button
              onClick={() => handleSendReminders(countyForm.form.id)}
              disabled={sendingReminders}
              className="countyDetailFormButton primary"
            >
              {sendingReminders ? 'Sending...' : 'Send Reminder'}
            </button>
          )}
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="countyDetailEmpty">
    No forms assigned to this county yet.
  </div>
)}
      </div>
    </div>
  );
};

export default CountyDetail;