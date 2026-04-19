import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { API_URL } from '../config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await axios.post(`${API_URL}/api/reset/forgot`, { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <button className="btn-back" onClick={() => navigate('/login')}>
          <ArrowLeft size={20} /> Back to Login
        </button>
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h1>Forgot Password</h1>
            <p>Enter your college email address to receive a password reset link.</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div style={{ padding: '1rem', background: '#d1fae5', color: '#059669', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #34d399' }}>{message}</div>}

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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
      <div className="auth-right login-bg">
        <div className="auth-overlay">
          <h2>Secure Account Recovery</h2>
          <p>Get back to trading in the CampusLogistics marketplace safely.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
