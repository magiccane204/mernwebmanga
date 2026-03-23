import { useState } from "react";
import axios from "axios";

const API = "https://mernwebmanga.vercel.app/";

function LoginPage({ setMode, setLoggedIn, setUserRole, setUserEmail }) {
  const [selectedRole, setSelectedRole] = useState("reader");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
    setError("");

    if (!email || !password) {
      setError("Enter email and password");
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

    if (role === "reader") {
      // Reader auto login
      saveLogin("reader", "", `local-${Date.now()}`);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>

      <div>
        <button onClick={() => handleRoleChange("admin")}>Admin</button>
        <button onClick={() => handleRoleChange("creator")}>Creator</button>
        <button onClick={() => handleRoleChange("reader")}>Reader</button>
      </div>

      {selectedRole !== "reader" && (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleLogin} disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </button>
        </>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p onClick={() => setMode("signup")}>Sign Up</p>
    </div>
  );
}

export default LoginPage;
