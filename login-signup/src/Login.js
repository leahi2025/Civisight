import React from "react";
import logo from "./logo.png"; 
import { Link } from 'react-router-dom';

function Login() {
  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo">
          <img src={logo} alt="Logo" className="logo-img" />
        </div>
        <h2>Sign in to your account</h2>
        <input type="email" placeholder="Email address" />
        <input type="password" placeholder="Password" />
        <button className="sign-in-button">Sign in</button>
        <p className="signup-text">
            Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
