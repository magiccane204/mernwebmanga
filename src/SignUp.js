import { useState } from 'react';
import axios from 'axios';

const API = "https://mernwebmanga.onrender.com";

function SignUp({ setMode }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [company, setCompany] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const getPasswordStrength = (pwd) => {
        if (!pwd) return { strength: 0, label: '', color: '' };
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/\d/.test(pwd)) strength++;
        if (/[@$!%*?&]/.test(pwd)) strength++;

        const levels = [
            { strength: 0, label: 'Very Weak', color: '#ff4444' },
            { strength: 1, label: 'Weak', color: '#ff8800' },
            { strength: 2, label: 'Fair', color: '#ffbb00' },
            { strength: 3, label: 'Good', color: '#88cc00' },
            { strength: 4, label: 'Strong', color: '#00cc44' },
            { strength: 5, label: 'Very Strong', color: '#00aa00' }
        ];
        return levels[Math.min(strength, 5)];
    };

    const validateForm = () => {
        const errors = {};
        
        if (!username || username.length < 3) {
            errors.username = 'Username must be at least 3 characters long';
        }
        
        if (!email || !validateEmail(email)) {
            errors.email = 'Please enter a valid email address';
        }
        
        if (!password || !validatePassword(password)) {
            errors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
        }
        
        if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        
        if (!company) {
            errors.company = 'Please select a company';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSignup = async () => {
        setError('');
        
        if (!validateForm()) {
            setError('Please fix the errors below');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API}/register`, {
                name: username,
                email,
                password,
                company
            });
            setMode('login');
        } catch (err) {
            setError(err.response?.data?.message || "Signup failed. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = getPasswordStrength(password);

    return (
        <div className="auth-container">
            <div className="auth-card signup-card">
                <div className="auth-header">
                    <div className="avatar-container">
                        <img src="/user.png" alt="user logo" className="auth-avatar" />
                    </div>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join MangaVerse today</p>
                </div>

                {error && (
                    <div className="error-message">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

                <div className="auth-form">
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            className={`auth-input ${validationErrors.username ? 'error' : ''}`}
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (validationErrors.username) {
                                    setValidationErrors({ ...validationErrors, username: '' });
                                }
                            }}
                            disabled={loading}
                        />
                        {validationErrors.username && (
                            <span className="field-error">{validationErrors.username}</span>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className={`auth-input ${validationErrors.email ? 'error' : ''}`}
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (validationErrors.email) {
                                    setValidationErrors({ ...validationErrors, email: '' });
                                }
                            }}
                            disabled={loading}
                        />
                        {validationErrors.email && (
                            <span className="field-error">{validationErrors.email}</span>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className={`auth-input ${validationErrors.password ? 'error' : ''}`}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (validationErrors.password) {
                                        setValidationErrors({ ...validationErrors, password: '' });
                                    }
                                }}
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
                        {password && (
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div
                                        className="strength-fill"
                                        style={{
                                            width: `${(passwordStrength.strength / 5) * 100}%`,
                                            backgroundColor: passwordStrength.color
                                        }}
                                    />
                                </div>
                                <span className="strength-label" style={{ color: passwordStrength.color }}>
                                    {passwordStrength.label}
                                </span>
                            </div>
                        )}
                        {validationErrors.password && (
                            <span className="field-error">{validationErrors.password}</span>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                className={`auth-input ${validationErrors.confirmPassword ? 'error' : ''}`}
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (validationErrors.confirmPassword) {
                                        setValidationErrors({ ...validationErrors, confirmPassword: '' });
                                    }
                                }}
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                        {confirmPassword && password === confirmPassword && (
                            <span className="field-success">✓ Passwords match</span>
                        )}
                        {validationErrors.confirmPassword && (
                            <span className="field-error">{validationErrors.confirmPassword}</span>
                        )}
                    </div>

                    <div className="input-group">
                        <label htmlFor="company">Company</label>
                        <select
                            id="company"
                            className={`auth-select ${validationErrors.company ? 'error' : ''}`}
                            value={company}
                            onChange={(e) => {
                                setCompany(e.target.value);
                                if (validationErrors.company) {
                                    setValidationErrors({ ...validationErrors, company: '' });
                                }
                            }}
                            disabled={loading}
                        >
                            <option disabled hidden value="">Choose Your Company</option>
                            <option>Koenigsegg</option>
                            <option>Tesla</option>
                            <option>Mercedes</option>
                            <option>Google</option>
                            <option>Microsoft</option>
                            <option>IBM</option>
                            <option>OpenAI</option>
                            <option>Apple</option>
                            <option>Oppo</option>
                        </select>
                        {validationErrors.company && (
                            <span className="field-error">{validationErrors.company}</span>
                        )}
                    </div>

                    <button
                        className="auth-button primary"
                        onClick={handleSignup}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                Creating account...
                            </>
                        ) : (
                            'Sign Up'
                        )}
                    </button>
                </div>

                <div className="auth-footer">
                    <p>
                        Already have an account?{" "}
                        <span
                            className="auth-link"
                            onClick={() => setMode('login')}
                        >
                            Login
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
