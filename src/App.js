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

function App() {
  const [pdfs, setPdfs] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'otp'

  // Check for existing login on component mount
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

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const res = await fetch("mongodb+srv://raj:Raj%40101105@cluster0.3swrnlq.mongodb.net/?appName=Cluster0");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setPdfs(data);
      } catch (error) {
        console.error('Failed to fetch PDFs:', error);
        // Set empty array as fallback
        setPdfs([]);
      }
    };
    fetchPdfs();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('pendingLoginEmail');
    localStorage.removeItem('pendingLoginRole');
    setIsLoggedIn(false);
    setUserRole('');
    setUserEmail('');
    setAuthMode('login');
  };

  // If not logged in, show authentication components
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
        {authMode === 'signup' && (
          <SignUp setMode={setAuthMode} />
        )}
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

  // If logged in, show main app
  return (
    <Router>
      <div className="app-container">
        {/* Navbar */}
        <nav>
          <Link to="/">Home</Link>
          <Link to="/search">Search</Link>
          <Link to="/about">About</Link>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#15aee1', fontWeight: 'bold' }}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
            {userEmail && <span style={{ color: '#666' }}>({userEmail})</span>}
            <button 
              onClick={handleLogout}
              style={{
                padding: '5px 10px',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Routes */}
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
