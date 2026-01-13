import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import axios from './api';
import Login from './Login';
import Signup from './Signup';
import County from './County';
import CountyDashboard from './CountyDashboard';
import Account from './Account';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default dynamic redirect route */}
        <Route path="/" element={<StartupRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/county-dashboard" element={<CountyDashboard />} />
        <Route path="/account" element={<Account />} />
        <Route path="/county/:id" element={<County />} />
      </Routes>
    </Router>
  );
}

function StartupRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    // Ask backend who we are. If not authenticated, go to /login.
    axios.get('/api/account/me/')
      .then(res => {
        if (!mounted) return;
        const data = res.data || {};
        const userType = data.user_type;
        // If county official, try to use returned county_id
        if (userType === 'county') {
          if (data.county_id) {
            navigate(`/county/${data.county_id}`, { replace: true });
          } else {
            // Fallback to account page
            navigate('/account', { replace: true });
          }
        } else if (userType === 'state') {
          navigate('/county-dashboard', { replace: true });
        } else {
          // Unknown role, send to account
          navigate('/account', { replace: true });
        }
      })
      .catch(() => {
        // not authenticated or error -> login
        if (mounted) navigate('/login', { replace: true });
      });

    return () => { mounted = false; };
  }, [navigate]);

  return null; // nothing visible; immediate redirect
}

export default App;
