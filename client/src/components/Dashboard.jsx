import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Calendar, Users, Bell } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        // Fallback if no user object in storage
        setUser({ name: 'Student', role: 'student' });
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="dashboard-brand">Smart Campus</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Welcome, <strong>{user.name}</strong> ({user.role})</span>
          <button onClick={handleLogout} className="btn-logout" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <BookOpen size={32} color="#818cf8" style={{ marginBottom: '1rem' }} />
          <h3>Academic Records</h3>
          <p>View your grades, transcripts, and course history in one centralized location.</p>
        </div>

        <div className="dashboard-card">
          <Calendar size={32} color="#34d399" style={{ marginBottom: '1rem' }} />
          <h3>Class Schedule</h3>
          <p>Access your upcoming classes, assignments, and exam dates for the semester.</p>
        </div>

        <div className="dashboard-card">
          <Users size={32} color="#fbbf24" style={{ marginBottom: '1rem' }} />
          <h3>Campus Community</h3>
          <p>Connect with peers, join clubs, and discover campus events tailored to you.</p>
        </div>

        <div className="dashboard-card">
          <Bell size={32} color="#f472b6" style={{ marginBottom: '1rem' }} />
          <h3>Notifications</h3>
          <p>Stay updated with important announcements from faculty and administration.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
