// Purpose: Displays an existing form with its title, description, and status when you click on the create global/county form button
// Key Features:
// Shows form title, description, and status
// Status is color-coded based on completion status

import React from 'react';
import './StyleComponents.css';

const FormCard = ({ form }) => {
  return (
    <div className="formCard">
      <h3 className="formCardTitle">{form.title}</h3>
      <p className="formCardDescription">{form.description}</p>
      <span className={`formCardStatus ${form.status === 'completed' ? '' : 'pending'}`}>
        {form.status}
      </span>
    </div>
  );
};

export default FormCard;