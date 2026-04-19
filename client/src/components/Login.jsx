import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { API_URL } from '../config';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const collegeRegex = /^2[a-zA-Z0-9]{9}@/;
    if (!collegeRegex.test(email) && email !== 'admin') {
      setError('Email must start with 2 and have exactly 10 characters before the @ symbol.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <button className="btn-back" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> Back to Store
        </button>
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in with your college email to continue to CampusLogistics</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="email">College Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="text"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="20X1A05B1@college.edu"
                  value={email}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
              <Link to="/forgot-password" style={{ color: '#4f46e5', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '500' }}>Forgot Password?</Link>
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Sign In'}
              <LogIn size={20} />
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link to="/signup" className="auth-link">Create one</Link>
          </div>
        </div>
      </div>
      <div className="auth-right login-bg">
        <div className="auth-overlay">
          <h2>Your Campus Marketplace</h2>
          <p>Buy, sell, and trade textbooks, electronics, and sports gear directly with your peers.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
