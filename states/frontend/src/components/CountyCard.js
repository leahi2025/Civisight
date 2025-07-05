// Purpose: Displays a single county card with its name and form counts when you are on the dashboard page
// Key Features:
// Shows county name and form counts
// Provides a clickable card that opens county details

import React from 'react';
import './StyleComponents.css';

const CountyCard = ({ county, onCardClick }) => {
  return (
    <div 
      className="countyCard"
      onClick={() => onCardClick(county)}
    >
      <h3 className="countyCardTitle">{county.name} County</h3>
      
      <div className="countyCardStats">
        <div className="countyCardStat">
          <span className="countyCardStatNumber">
            {county.forms ? county.forms.length : 0}
          </span>
          <span className="countyCardStatLabel">Forms</span>
        </div>
      </div>
    </div>
  );
};

export default CountyCard;