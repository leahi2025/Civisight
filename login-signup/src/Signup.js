import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "./logo.png";
import "./styles.css"; // Make sure you import this for shared styling

function Signup() {
  const [accountType, setAccountType] = useState("State Agency");

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="Logo" className="logo-img" />
        <h2>Create your account</h2>

        <div style={{ display: "flex", gap: "10px" }}>
          <input type="text" placeholder="First Name" />
          <input type="text" placeholder="Last Name" />
        </div>

        <input type="email" placeholder="Email address" />
        <input type="password" placeholder="Password" />
        <input type="password" placeholder="Confirm Password" />

        {/* Dropdown styled like input */}
        <select
          className="styled-input"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
        >
          <option value="State Agency">State Agency</option>
          <option value="County">County</option>
        </select>

        {/* Divider line */}
        <hr style={{ width: "100%", border: "1px solid #ddd", margin: "15px 0" }} />

        {/* Conditional Label */}
        <input
          type="text"
          className="styled-input"
          placeholder={`Enter your ${accountType === "State Agency" ? "state agency" : "county"} name`}
        />

        <button className="sign-in-button">Sign up</button>

        <p className="signup-text">
          Already have an account? <Link to="/">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
