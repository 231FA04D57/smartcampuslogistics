import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Lock, ArrowRight } from 'lucide-react';
import { API_URL } from '../config';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post(`${API_URL}/api/reset/${token}`, { password });
      setMessage(res.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-form-wrapper" style={{ marginTop: '4rem' }}>
          <div className="auth-header">
            <h1>Reset Password</h1>
            <p>Enter your new password below to regain access.</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div style={{ padding: '1rem', background: '#d1fae5', color: '#059669', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #34d399' }}>{message} Redirecting to login...</div>}

          {!message && (
            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type="password"
                    id="confirmPassword"
                    className="form-input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
                <ArrowRight size={20} />
              </button>
            </form>
          )}
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

export default ResetPassword;
