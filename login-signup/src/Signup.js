import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "./logo.png";
import { useNavigate } from "react-router-dom";
import axios from './api';
import "./styles.css"; // Make sure you import this for shared styling

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    role: "0",
    name: ""
  });
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm({...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      return setError("Passwords must match");
    }

    try {
      const res = await axios.post("/api/signup/", form);
      navigate("/login");

    } catch (err) {
      if (err.response) {
        // your Django view should return JSON like { error: "…" }
        setError(err.response.data.error || "Signup failed");
        // if you want to push it into location.state, you can still do:
        navigate("/signup", { state: { error: err.response.data.error } });
      } else {
        setError("Network error");
      }
    }
  }

  

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Logo" className="logo-img" />
        <h2>Create your account</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          <div style={{ display: "flex", gap: "10px" }}>
            <input name="username" value={form.username} onChange={handleChange} type="text" placeholder="Name"/>
          </div>

          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" />
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />
          <input name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="Confirm Password" />

          {/* Dropdown styled like input */}
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="styled-input"
          >
            <option value="0">State Official</option>
            <option value="1">County Official</option>
          </select>

          {/* Divider line */}
          <hr style={{ width: "100%", border: "1px solid #ddd", margin: "15px 0" }} />

          {/* Conditional Label */}
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            type="text"
            className="styled-input"
            placeholder={`Enter your ${form.role === "0" ? "state" : "county"} name`}
          />

          <button type="submit" className="sign-in-button">Sign up</button>

          <p className="signup-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

        </form>
        
        

        
      </div>
    </div>
  );
}

export default Signup;
