import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShoppingBag, Package, Award, User, Mail, Phone, FileText, AlertCircle, Edit2, Home } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        
        // Fetch updated user data from MongoDB
        const fetchUserData = async () => {
          try {
            const response = await axios.get(`${API_URL}/api/auth/profile`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            let currentUser = parsedUser;
            if (response.data && response.data.user) {
              // Update state and localStorage with fresh data from MongoDB
              localStorage.setItem('user', JSON.stringify(response.data.user));
              currentUser = response.data.user;
            }
            setUser(currentUser);
            setEditData(currentUser);

            // Get loyalty points
            const pointsKey = `loyaltyPoints_${currentUser.email}`;
            const points = parseInt(localStorage.getItem(pointsKey) || '0');
            setLoyaltyPoints(points);
          } catch (error) {
            console.error('Error fetching user data:', error);
            // Fallback to localStorage data if API fails
            setUser(parsedUser);
            setEditData(parsedUser);

            const pointsKey = `loyaltyPoints_${parsedUser.email}`;
            const points = parseInt(localStorage.getItem(pointsKey) || '0');
            setLoyaltyPoints(points);
          }

          // Fetch user listings from backend
          try {
            const listingsResponse = await axios.get(`${API_URL}/api/products/user`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            setUserListings(listingsResponse.data);
          } catch (err) {
            console.error('Error fetching user listings:', err);
            setUserListings([]);
          }
        };

        fetchUserData();
      } else {
        setUser({ name: 'Student', role: 'student' });
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    try {
      setSaveLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`${API_URL}/api/auth/update-profile`, {
        name: editData.name,
        phone: editData.phone,
        alternateEmail: editData.alternateEmail
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        // Update localStorage with the new user data
        const updatedUser = {
          ...user,
          ...response.data.user
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditData(updatedUser);
        setEditMode(false);
        setSaveMessage('Profile updated successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage('Failed to update profile. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleGiveItem = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/products/${productId}/deliver`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data) {
        setUserListings(userListings.map(item => (item._id === productId || item.id === productId) ? { ...item, isDelivered: true } : item));
      }
    } catch (error) {
      console.error('Error marking item as delivered:', error);
      alert('Failed to mark item as delivered');
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <nav className="dashboard-nav" style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <button onClick={() => navigate('/')} className="btn-back" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#e0e7ff', color: '#4f46e5', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
            <Home size={16} />
            Back to Home
          </button>
          <div className="dashboard-brand" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>CampusLogistics</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#64748b' }}>Welcome, <strong>{user.name}</strong></span>
          <button onClick={handleLogout} className="btn-logout" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Sidebar */}
        <div style={{ width: '250px', background: 'white', borderRight: '1px solid #e2e8f0', padding: '2rem 1.5rem', minHeight: 'calc(100vh - 70px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '0.75rem 1rem',
                textAlign: 'left',
                border: 'none',
                background: activeTab === 'profile' ? '#e0e7ff' : 'transparent',
                color: activeTab === 'profile' ? '#4f46e5' : '#64748b',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.95rem'
              }}
            >
              <User size={18} /> Profile
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              style={{
                padding: '0.75rem 1rem',
                textAlign: 'left',
                border: 'none',
                background: activeTab === 'listings' ? '#e0e7ff' : 'transparent',
                color: activeTab === 'listings' ? '#4f46e5' : '#64748b',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.95rem'
              }}
            >
              <ShoppingBag size={18} /> My Listings
            </button>
            <button
              onClick={() => setActiveTab('loyalty')}
              style={{
                padding: '0.75rem 1rem',
                textAlign: 'left',
                border: 'none',
                background: activeTab === 'loyalty' ? '#e0e7ff' : 'transparent',
                color: activeTab === 'loyalty' ? '#4f46e5' : '#64748b',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontSize: '0.95rem'
              }}
            >
              <Award size={18} /> Loyalty Points
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '2rem' }}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: '#1e293b' }}>My Profile</h1>
                <button
                  onClick={() => setEditMode(!editMode)}
                  style={{
                    background: editMode ? '#ef4444' : '#4f46e5',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.95rem'
                  }}
                >
                  <Edit2 size={16} />
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Full Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem' }}
                    />
                  ) : (
                    <p style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: '500' }}>{user.name}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Role</label>
                  <p style={{ fontSize: '1.1rem', color: '#1e293b', fontWeight: '500', textTransform: 'capitalize' }}>{user.role}</p>
                </div>

                {/* Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={16} /> College Email
                  </label>
                  <p style={{ fontSize: '1rem', color: '#1e293b' }}>{user.email}</p>
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Phone size={16} /> Phone Number
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem' }}
                    />
                  ) : (
                    <p style={{ fontSize: '1rem', color: '#1e293b' }}>{user.phone || 'Not provided'}</p>
                  )}
                </div>

                {/* Alternate Email */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={16} /> Alternate Email
                  </label>
                  {editMode ? (
                    <input
                      type="email"
                      value={editData.alternateEmail || ''}
                      onChange={(e) => setEditData({ ...editData, alternateEmail: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem' }}
                      placeholder="your.email@example.com"
                    />
                  ) : (
                    <p style={{ fontSize: '1rem', color: '#1e293b' }}>{user.alternateEmail || 'Not provided'}</p>
                  )}
                </div>
              </div>

              {editMode && (
                <>
                  {saveMessage && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: saveMessage.includes('Failed') ? '#fef2f2' : '#f0fdf4',
                      color: saveMessage.includes('Failed') ? '#dc2626' : '#16a34a',
                      border: `1px solid ${saveMessage.includes('Failed') ? '#fecaca' : '#bbf7d0'}`,
                      fontSize: '0.9rem'
                    }}>
                      {saveMessage}
                    </div>
                  )}
                  <button
                    onClick={handleSaveProfile}
                    disabled={saveLoading}
                    style={{
                      marginTop: '1.5rem',
                      background: saveLoading ? '#94a3b8' : '#10b981',
                      color: 'white',
                      padding: '0.75rem 2rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: saveLoading ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500',
                      opacity: saveLoading ? 0.7 : 1
                    }}
                  >
                    {saveLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Listings Tab */}
          {activeTab === 'listings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: '#1e293b' }}>My Listings</h1>
                <button
                  onClick={() => navigate('/sell')}
                  style={{
                    background: '#4f46e5',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}
                >
                  + Add New Listing
                </button>
              </div>

              {userListings.length === 0 ? (
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '3rem',
                  textAlign: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <Package size={48} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
                  <p style={{ color: '#64748b', marginBottom: '1rem' }}>You haven't listed any items yet.</p>
                  <button
                    onClick={() => navigate('/sell')}
                    style={{
                      background: '#4f46e5',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    List Your First Item
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {userListings.map((item) => (
                    <div key={item.id} style={{
                      background: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s',
                      position: 'relative'
                    }}>
                      {item.status && item.status !== 'available' && (
                         <div style={{ position: 'absolute', top: '10px', right: '10px', background: item.status === 'rented' ? '#f59e0b' : '#ef4444', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                           {item.status === 'rented' ? 'Rented Out' : 'Sold'}
                         </div>
                      )}
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '180px', objectFit: 'cover', opacity: item.status !== 'available' ? 0.7 : 1 }} />
                      <div style={{ padding: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>{item.name}</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>{item.description.substring(0, 60)}...</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                          {item.salePrice && <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500' }}>Sale: ₹{item.salePrice}</span>}
                          {item.rentPrice && <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500' }}>Rent: ₹{item.rentPrice}/day</span>}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>📍 {item.location}</p>
                        {item.status && item.status !== 'available' && (
                          <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                            {item.isDelivered ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#16a34a', fontSize: '0.9rem', fontWeight: '500' }}>
                                <Award size={16} /> Product Delivered
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleGiveItem(item._id || item.id)}
                                style={{ width: '100%', padding: '0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', transition: 'background 0.2s' }}
                              >
                                Give Item
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loyalty Points Tab */}
          {activeTab === 'loyalty' && (
            <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ textAlign: 'center', paddingBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
                <Award size={64} style={{ color: '#f59e0b', margin: '0 auto 1rem' }} />
                <h1 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '0.5rem' }}>{loyaltyPoints} Points</h1>
                <p style={{ color: '#64748b' }}>You've earned these loyalty points by listing items on CampusLogistics</p>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={20} /> How to Earn Points
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.75rem' }}>
                  <li style={{ padding: '0.75rem', background: '#fef3c7', borderLeft: '4px solid #f59e0b', borderRadius: '4px', color: '#92400e' }}>
                    ✓ +50 points for each item you list
                  </li>
                  <li style={{ padding: '0.75rem', background: '#e0e7ff', borderLeft: '4px solid #4f46e5', borderRadius: '4px', color: '#3730a3' }}>
                    ✓ Bonus points for highly rated items
                  </li>
                </ul>
              </div>

              <div style={{ marginTop: '2rem', padding: '1rem', background: '#e0f2fe', borderRadius: '8px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: '1rem', color: '#0c4a6e' }}>
                <AlertCircle size={24} />
                <p>Start listing items today to earn more loyalty points!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
