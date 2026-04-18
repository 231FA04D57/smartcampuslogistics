import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, Trash2, Edit, Shield, ArrowLeft } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if admin is logged in
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchData(token);
  }, [navigate]);

  const fetchData = async (token) => {
    setLoading(true);
    try {
      // Fetch users from backend
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const usersData = await res.json();
      setUsers(usersData);

      // Fetch listings from localStorage (since they are currently stored there)
      const storedListings = JSON.parse(localStorage.getItem('userListings') || '[]');
      setListings(storedListings);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (email === 'admin') {
      alert('Cannot delete the main admin account');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });

      if (!res.ok) throw new Error('Failed to delete user');

      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRoleChange = async (id, email, currentRole) => {
    if (email === 'admin') {
      alert('Cannot change the role of the main admin account');
      return;
    }

    const newRole = prompt('Enter new role (student, faculty, admin):', currentRole);
    if (!newRole || !['student', 'faculty', 'admin'].includes(newRole)) {
      alert('Invalid role. Please enter student, faculty, or admin.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!res.ok) throw new Error('Failed to update role');

      const updatedUser = await res.json();
      setUsers(users.map(u => (u._id === id ? updatedUser : u)));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteListing = (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    const updatedListings = listings.filter(item => item.id !== id);
    setListings(updatedListings);
    localStorage.setItem('userListings', JSON.stringify(updatedListings));
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 5%' }}>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '1rem' }}>
        <ArrowLeft size={20} /> Back to Store
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Shield size={36} color="#4f46e5" />
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'Outfit, sans-serif' }}>Admin Dashboard</h1>
      </div>

      {error && <div style={{ padding: '1rem', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('users')}
          style={{ padding: '0.75rem 1.5rem', background: activeTab === 'users' ? '#4f46e5' : '#e2e8f0', color: activeTab === 'users' ? '#fff' : '#475569', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600' }}
        >
          <Users size={18} /> Manage Users
        </button>
        <button 
          onClick={() => setActiveTab('listings')}
          style={{ padding: '0.75rem 1.5rem', background: activeTab === 'listings' ? '#4f46e5' : '#e2e8f0', color: activeTab === 'listings' ? '#fff' : '#475569', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: '600' }}
        >
          <Package size={18} /> Manage User Listings
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        {activeTab === 'users' ? (
          <div>
            <h2 style={{ marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>Registered Users</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '1rem 0.5rem' }}>Name</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Email</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Role</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Joined</th>
                    <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>{user.name}</td>
                      <td style={{ padding: '1rem 0.5rem', color: '#64748b' }}>{user.email}</td>
                      <td style={{ padding: '1rem 0.5rem' }}>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '600', background: user.role === 'admin' ? '#dbeafe' : '#f1f5f9', color: user.role === 'admin' ? '#2563eb' : '#475569' }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 0.5rem', color: '#64748b' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <button onClick={() => handleRoleChange(user._id, user.email, user.role)} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', marginRight: '1rem' }} title="Change Role">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDeleteUser(user._id, user.email)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete User">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>User Submitted Listings</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '1rem 0.5rem' }}>Item</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Price</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Category</th>
                    <th style={{ padding: '1rem 0.5rem' }}>Seller</th>
                    <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem 0.5rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                        {item.name}
                      </td>
                      <td style={{ padding: '1rem 0.5rem' }}>₹{item.price}</td>
                      <td style={{ padding: '1rem 0.5rem', color: '#64748b' }}>{item.category}</td>
                      <td style={{ padding: '1rem 0.5rem', color: '#64748b' }}>{item.seller}</td>
                      <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                        <button onClick={() => handleDeleteListing(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete Listing">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {listings.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No user listings found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
