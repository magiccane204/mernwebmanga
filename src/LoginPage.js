import { useState } from "react";
import axios from "axios";
import "./Auth.css";

const API = "https://mernwebmanga.vercel.app";

function LoginPage({ setMode, setLoggedIn, setUserRole, setUserEmail }) {
  const [selectedRole, setSelectedRole] = useState("reader");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const saveLogin = (role, email, token) => {
    localStorage.setItem("userToken", token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userEmail", email);

    setUserRole(role);
    setUserEmail(email);
    setLoggedIn(true);
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API}/login`, { email, password });

      if (res.data.token) {
        saveLogin(res.data.user.role, email, res.data.token);
      }
    } catch (err) {
      setError("Login failed");
    }
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError("");

    if (role === "reader") {
      saveLogin("reader", "", `local-${Date.now()}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="avatar"></div>

        <h1 className="title">
          Welcome to <span>MangaVerse</span>
        </h1>
        <p className="subtitle">Sign in to continue</p>

        <div className="roles">
          <button onClick={() => handleRoleChange("admin")} className={selectedRole==="admin"?"active":""}>👑 Admin</button>
          <button onClick={() => handleRoleChange("creator")} className={selectedRole==="creator"?"active":""}>✍️ Creator</button>
          <button onClick={() => handleRoleChange("reader")} className={selectedRole==="reader"?"active":""}>📖 Reader</button>
        </div>

        {selectedRole !== "reader" && (
          <>
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="login-btn" onClick={handleLogin}>
              Login
            </button>
          </>
        )}

        {selectedRole === "reader" && (
          <div className="reader-box">
            <h3>Reader Access</h3>
            <p>You can view all comics freely</p>
          </div>
        )}

        {error && <p className="error">{error}</p>}

        <p className="signup" onClick={() => setMode("signup")}>
          Sign Up
        </p>

      </div>
    </div>
  );
}

export default LoginPage;
