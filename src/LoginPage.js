import { useState } from "react";
import axios from "axios";

const API = "https://mernwebmanga.vercel.app/";

function LoginPage({ setMode, setLoggedIn, setUserRole, setUserEmail }) {

  const [selectedRole, setSelectedRole] = useState("reader");
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [ui, setUI] = useState({
    loading: false,
    error: "",
    showPassword: false
  });

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateUI = (field, value) => {
    setUI(prev => ({ ...prev, [field]: value }));
  };

  const saveLogin = (role, email, token) => {
    localStorage.setItem("userToken", token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userEmail", email);

    setUserRole(role);
    setUserEmail(email);
    setLoggedIn(true);
  };

  const validate = () => {
    if (!form.email || !form.password) {
      updateUI("error", "Email and password required");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    updateUI("loading", true);
    updateUI("error", "");

    try {
      const res = await axios.post(`${API}/login`, {
        email: form.email,
        password: form.password
      });

      const { token, user } = res.data;

      if (!token || !user) {
        throw new Error("Invalid response from server");
      }

      saveLogin(user.role, form.email, token);

    } catch (err) {
      updateUI(
        "error",
        err.response?.data?.message || err.message || "Login failed"
      );
    } finally {
      updateUI("loading", false);
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    updateUI("error", "");
    setForm({ email: "", password: "" });

    if (role === "reader") {
      saveLogin("reader", "", "guest-token");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card login-card">

        <div className="auth-header">
          <div className="avatar-container">
            <img src="/user.png" alt="profile" className="auth-avatar" />
          </div>
          <h1 className="auth-title">Welcome to MangaVerse</h1>
          <p className="auth-subtitle">Sign in to continue</p>
        </div>

        {/* Role Selector */}
        <div className="role-selector">
          {["admin", "creator", "reader"].map(role => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className={`role-btn ${selectedRole === role ? "active" : ""}`}
            >
              {role === "admin" && "👑 Admin"}
              {role === "creator" && "✍️ Creator"}
              {role === "reader" && "📖 Reader"}
            </button>
          ))}
        </div>

        {/* Error */}
        {ui.error && (
          <div className="error-message">
            ⚠️ {ui.error}
          </div>
        )}

        {/* Admin / Creator */}
        {(selectedRole === "admin" || selectedRole === "creator") && (
          <div className="auth-form">

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateForm("email", e.target.value)}
                className="auth-input"
                disabled={ui.loading}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  type={ui.showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateForm("password", e.target.value)}
                  className="auth-input"
                  disabled={ui.loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => updateUI("showPassword", !ui.showPassword)}
                >
                  {ui.showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <button
              className="auth-button primary"
              onClick={handleLogin}
              disabled={ui.loading}
            >
              {ui.loading ? "Logging in..." : "Login"}
            </button>

          </div>
        )}

        {/* Reader */}
        {selectedRole === "reader" && (
          <div className="reader-info">
            <div className="info-card">
              📚 Reader Access
              <p>You can view all comics freely.</p>
              <p>You're already logged in!</p>
            </div>
          </div>
        )}

        {/* Footer */}
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
