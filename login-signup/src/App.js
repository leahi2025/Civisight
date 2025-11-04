import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import County from './County';
import CountyDashboard from './CountyDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/county-dashboard" element={<CountyDashboard />} />
        <Route path="/county/:id" element={<County />} />
      </Routes>
    </Router>
  );
}

export default App;
