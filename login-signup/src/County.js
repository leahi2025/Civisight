import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// Import your specific helper function from api.js
import { fetchCountyById } from './api'; 

/**
 * This component fetches and displays details for a single county.
 * It now uses the 'fetchCountyById' helper from api.js.
 */
function County() {
  const { id } = useParams();

  const [county, setCounty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCounty = async () => {
      setLoading(true);
      setError('');
      try {
        // --- THIS IS THE CHANGE ---
        // We now use your helper function.
        // It already handles the base URL, withCredentials,
        // and returns the 'data' property, so the code is simpler.
        const data = await fetchCountyById(id);
        
        setCounty(data);
      } catch (err) {
        console.error("Error fetching county:", err);
        setError('Failed to load county details. You may not have permission to view this county.');
      } finally {
        setLoading(false);
      }
    };

    fetchCounty();
  }, [id]);

  // --- Render Logic (No change) ---
  if (loading) {
    return <div className="p-4">Loading county details...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  if (!county) {
    return <div className="p-4">No county data found.</div>;
  }

  // --- Display County Details (No change) ---
  return (
    <div className="p-8 max-w-lg mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">{county.name}</h1>
      
      <div className="space-y-2">
        <p>
          <strong>State:</strong> {county.state || 'N/A'} 
        </p>
        {county.forms && county.forms.length > 0 && (
            <div className="forms-section">
            <strong>Form Completion Status</strong>
                <ul className="forms-list">
                    {county.forms.map(f => {
                        const status = f.status.toLowerCase();
                        const statusClass = `status-${status.replace(' ', '-')}`;
                        return (
                            <li key={f.id}>
                                <span className="form-name">{f.form?.name || 'Form ' + f.id}</span>
                                <span className={`form-status ${statusClass}`}>{status}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
}

export default County;

