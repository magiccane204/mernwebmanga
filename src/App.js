import { useState } from "react";
import axios from "axios";

const API = "https://mernwebmanga.onrender.com";

function LoginPage({ setMode, setLoggedIn, setUserRole, setUserEmail }) {
  const [selectedRole, setSelectedRole] = useState("reader");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Save login
  const saveLogin = (role, email = "", token = `local-token-${Date.now()}`) => {
    localStorage.setItem("userToken", token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userEmail", email);

    setUserRole(role);
    setUserEmail(email);
    setLoggedIn(true);
  };

  // Reader quick login
  const quickRoleLogin = (role) => {
    saveLogin(role);
  };

  // ✅ FIXED LOGIN (NO OTP)
  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API}/login`, {
        email,
        password
      });

      if (res.data.token) {
        saveLogin(res.data.user.role, email, res.data.token);
      } else {
        setError("Login failed");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError("");

    setEmail("");
    setPassword("");

    if (role === "reader") {
      quickRoleLogin("reader");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card login-card">
        <div className="auth-header">
          <div className="avatar-container">
            <img src="/user.png" alt="profile pic" className="auth-avatar" />
          </div>
          <h1 className="auth-title">Welcome to MangaVerse</h1>
          <p className="auth-subtitle">Sign in to continue</p>
        </div>

        {/* Role Selection */}
        <div className="role-selector">
          <button
            onClick={() => handleRoleChange("admin")}
            className={`role-btn ${selectedRole === "admin" ? "active" : ""}`}
          >
            👑 Admin
          </button>

          <button
            onClick={() => handleRoleChange("creator")}
            className={`role-btn ${selectedRole === "creator" ? "active" : ""}`}
          >
            ✍️ Creator
          </button>

          <button
            onClick={() => handleRoleChange("reader")}
            className={`role-btn ${selectedRole === "reader" ? "active" : ""}`}
          >
            📖 Reader
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Admin + Creator LOGIN (SAME NOW) */}
        {(selectedRole === "admin" || selectedRole === "creator") && (
          <div className="auth-form">

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button
              className="auth-button primary"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        )}

        {/* Reader */}
        {selectedRole === "reader" && (
          <div className="reader-info">
            <div className="info-card">
              📚 Reader Access  
              <p>You can view all comics freely.</p>
              <p>You're already logged in as a Reader!</p>
            </div>
          </div>
        )}

        {/* Sign Up */}
        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <span
              className="auth-link"
              onClick={() => setMode("signup")}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
