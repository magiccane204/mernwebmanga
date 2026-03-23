import { BrowserRouter as Router, Link, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './Home';
import Search from './Search';
import About from './About';
import LoginPage from './LoginPage';
import SignUp from './SignUp';
import Otp from './Otp';
import MainAppContent from './MainAppContent';
import './App.css';

const API = "https://mernwebmanga.onrender.com";

function App() {
  const [pdfs, setPdfs] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [authMode, setAuthMode] = useState('login');

  // ✅ Restore session
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');

    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
      setUserEmail(email || '');
    }
  }, []);

  // ✅ FIXED PDF FETCH
  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const token = localStorage.getItem("userToken");

        const res = await fetch(`${API}/api/pdfs`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setPdfs(data);

      } catch (error) {
        console.error("Failed to fetch PDFs:", error);
        setPdfs([]);
      }
    };

    if (isLoggedIn) {
      fetchPdfs();
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole('');
    setUserEmail('');
    setAuthMode('login');
  };

  // 🔐 AUTH SCREENS
  if (!isLoggedIn) {
    return (
      <div className="app-container">
        {authMode === 'login' && (
          <LoginPage 
            setMode={setAuthMode}
            setLoggedIn={setIsLoggedIn}
            setUserRole={setUserRole}
            setUserEmail={setUserEmail}
          />
        )}
        {authMode === 'signup' && <SignUp setMode={setAuthMode} />}
        {authMode === 'otp' && (
          <Otp 
            setMode={setAuthMode}
            setLoggedIn={setIsLoggedIn}
            setUserRole={setUserRole}
            setUserEmail={setUserEmail}
          />
        )}
      </div>
    );
  }

  // 🌐 MAIN APP
  return (
    <Router>
      <div className="app-container">

        <nav>
          <Link to="/">Home</Link>
          <Link to="/search">Search</Link>
          <Link to="/about">About</Link>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
            <span style={{ color: '#15aee1', fontWeight: 'bold' }}>
              {userRole}
            </span>
            {userEmail && <span style={{ color: '#666' }}>({userEmail})</span>}

            <button onClick={handleLogout} className="nav-style-btn">
              Logout
            </button>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<MainAppContent pdfs={pdfs} setPdfs={setPdfs} userRole={userRole} />} />
          <Route path="/search" element={<Search pdfs={pdfs} userRole={userRole} />} />
          <Route path="/about" element={<About userRole={userRole} />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;
