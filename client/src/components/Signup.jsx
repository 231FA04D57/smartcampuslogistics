import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User, GraduationCap, ChevronRight, ArrowLeft } from 'lucide-react';
import { API_URL } from '../config';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, role, otp } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const collegeRegex = /^2[a-zA-Z0-9]{9}@/;
    if (!collegeRegex.test(email)) {
      setError('Email must start with 2 and have exactly 10 characters before the @ symbol. (e.g. 20X1A05B1@college.edu)');
      return;
    }

    setLoading(true);
    setError('');
    
    if (!otpSent) {
      try {
        await axios.post(`${API_URL}/api/auth/send-otp`, { email });
        setOtpSent(true);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Error sending OTP');
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const res = await axios.post(`${API_URL}/api/auth/register`, formData);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/');
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid OTP or registration failed');
      } finally {
        setLoading(false);
      }
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
            <h1>Create Account</h1>
            <p>Join CampusLogistics using your college credentials</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">College Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="email"
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

            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
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
                    minLength="6"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="role">Role</label>
                <div className="input-wrapper select-wrapper">
                  <GraduationCap className="input-icon" />
                  <select
                    id="role"
                    name="role"
                    className="form-input"
                    value={role}
                    onChange={onChange}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {otpSent && (
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="otp">Enter 6-Digit OTP</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    className="form-input"
                    placeholder="123456"
                    value={otp}
                    onChange={onChange}
                    maxLength="6"
                    required
                  />
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>We sent an OTP to {email}</p>
              </div>
            )}

            <button type="submit" className="btn-primary auth-submit" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? 'Processing...' : (otpSent ? 'Verify & Create Account' : 'Send Verification OTP')}
              <ChevronRight size={20} />
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
          </div>
        </div>
      </div>
      <div className="auth-right signup-bg">
        <div className="auth-overlay">
          <h2>Join the Community</h2>
          <p>Get access to exclusive deals, easily sell your used items, and connect with other students.</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
