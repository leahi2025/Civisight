import React, { useState } from "react";
import logo from "./logo.png"; 
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from './api';

function Login() {

  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm({...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
  // Send signin without attaching existing cookies/session to the request.
  // This avoids sending sessionid or other cookies before authentication.
      const response = await axios.post("/api/signin/", form);
      const role = response.data.role;
      if (role === "0") {
        navigate("/county-dashboard") // State officials go to dashboard
      } else {
        // County officials redirect to their specific county page
        const countyId = response.data.county_id;
        if (countyId) {
          navigate(`/county/${countyId}`);
        } else {
          navigate("/county"); // Fallback if no county_id
        }
      }
      
    
    } catch (err) {
      if (err.response) {
        // server returned 4xx/5xx
        const msg = err.response.data.error || "Sign-in failed";
        setError(msg);
        // optionally push into location.state so freshly loaded pages can read it
        navigate("/login", { state: { error: msg } });
      } else {
        // network error, timeout, etc.
        setError("Network error");
      }
    }
  }


  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <h2>Sign in to your account</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />
          <button type="submit" className="sign-in-button">Sign in</button>
          <p className="signup-text">
              Don’t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
        
      </div>
    </div>
  );
}

export default Login;
