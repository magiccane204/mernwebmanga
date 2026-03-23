import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "https://mernwebmanga.onrender.com";

function Otp({ setMode, setLoggedIn, setUserRole, setUserEmail }) {
  const [otp, setOtp] = useState("");
  const email = localStorage.getItem("pendingLoginEmail");
  const pendingRole = localStorage.getItem("pendingLoginRole");

  const handleVerify = async () => {
    if (otp.length !== 6) {
      alert("Please enter the 6-digit OTP.");
      return;
    }

    try {
      const res = await axios.post(`${API}/verify-otp`, {
        email,
        otp,
      });

      // Use the role from the server response (which should match pendingRole)
      const finalRole = res.data.role || pendingRole || "reader";
      
      // Save login data
      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("userRole", finalRole);
      localStorage.setItem("userEmail", res.data.user.email);
      localStorage.removeItem("pendingLoginEmail");
      localStorage.removeItem("pendingLoginRole");
      
      // Update state
      setUserRole(finalRole);
      setUserEmail(res.data.user.email);
      setLoggedIn(true);
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  // Redirect if email isn't set
  useEffect(() => {
    if (!email) {
      setMode("login");
    }
  }, [email, setMode]);

  return (
    <div className="OB">
      <h1>OTP Verification</h1>
      <p style={{color: '#333'}}>
        We've sent a 6-digit code to <strong style={{color: '#f77f0f'}}>{email}</strong>.
        (Check server console for hardcoded OTP)
      </p>
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value.substring(0, 6))}
        maxLength="6"
        style={{textAlign: "center"}}
      />

      <button
        className="button"
        onClick={handleVerify}
        style={{ backgroundColor: "#f77f0f", color: "#ffffff", marginTop: "15px", boxShadow: "0 12px 35px #f77f0f40" }}
      >
        Verify OTP
      </button>
      
      <p style={{ marginTop: "10px", cursor: "pointer", color: "blue" }} onClick={() => setMode("login")}>
        Go back to Login
      </p>
    </div>
  );
}

export default Otp;
