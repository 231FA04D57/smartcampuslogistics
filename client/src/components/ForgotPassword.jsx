import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { API_URL } from '../config';

const ForgotPassword = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isPhoneNumber = (value) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(value.replace(/[^\d]/g, ''));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = emailOrPhone.toLowerCase().trim();
    
    if (!isPhoneNumber(trimmedInput) && !/^2[a-zA-Z0-9]{9}@/.test(trimmedInput)) {
      setError('Please enter a valid college email or 10-digit phone number.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await axios.post(`${API_URL}/api/reset/forgot`, { emailOrPhone: trimmedInput });
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
            <p>Enter your college email or phone number to receive a password reset link.</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div style={{ padding: '1rem', background: '#d1fae5', color: '#059669', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #34d399' }}>{message}</div>}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="emailOrPhone">College Email or Phone Number</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="text"
                  id="emailOrPhone"
                  name="emailOrPhone"
                  className="form-input"
                  placeholder="20X1A05B1@college.edu or 9876543210"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
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
