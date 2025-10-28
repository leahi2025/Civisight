import React, { useEffect, useState } from 'react';
import { fetchCounties } from './api';
import './styles.css';

function CountyDashboard() {
  const [counties, setCounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // We expect the frontend to have the user's state stored in localStorage under 'userState'
  // This is an assumption because the current login/signup flow doesn't persist user profile info.
  // If your backend returns user info on signin, you can store the state there and read it here.
  const userState = localStorage.getItem('userState');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    // prefer using helper; fall back to axios.get
    const fetcher = () => fetchCounties().then(data => data).catch(err => { throw err; });

    fetcher()
      .then(data => {
        if (!isMounted) return;
        // if the API returns an object with results, attempt to use it
        const list = Array.isArray(data) ? data : data.results || [];
        const filtered = userState ? list.filter(c => String(c.state) === String(userState) || c.state === userState) : list;
        setCounties(filtered);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load counties');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [userState]);

  return (
    <div style={{ padding: 20 }}>
      <h1>County Dashboard</h1>

      {loading && <p>Loading counties...</p>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {counties.map(county => (
            <div key={county.id} className="login-box" style={{ textAlign: 'left' }}>
              <h3 style={{ marginTop: 0 }}>{county.name}</h3>
              <div><strong>ID:</strong> {county.id}</div>
              <div><strong>State:</strong> {county.state}</div>
              {county.forms && county.forms.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <strong>Forms:</strong>
                  <ul>
                    {county.forms.map(f => (
                      <li key={f.id}>{f.form?.name || 'Form ' + f.id} — {f.status}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          {counties.length === 0 && <div style={{ color: '#666' }}>No counties found for your state.</div>}
        </div>
      )}
    </div>
  );
}

export default CountyDashboard;
