import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, ArrowLeft, MapPin, Award } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const SellItem = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    salePrice: '',
    rentPrice: '',
    category: 'Engineering',
    location: ''
  });
  const [image, setImage] = useState(null);
  const [imageData, setImageData] = useState(null); // base64 for storing
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const navigate = useNavigate();

  const [userListings, setUserListings] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      alert("You must be logged in to sell an item.");
      navigate('/login');
    } else {
      const user = JSON.parse(userData);
      
      // Fetch user listings from database
      const fetchUserListings = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/products/user`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          setUserListings(response.data);
        } catch (error) {
          console.error('Error fetching user listings:', error);
          // Fallback to empty array if API fails
          setUserListings([]);
        }
      };

      // Get loyalty points
      const pointsKey = `loyaltyPoints_${user.email}`;
      const points = parseInt(localStorage.getItem(pointsKey) || '0');
      setLoyaltyPoints(points);

      // Fetch updated user data from MongoDB
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.data && response.data.user) {
            // Update localStorage with fresh data from MongoDB
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to localStorage data if API fails
        }
      };

      fetchUserListings();
      fetchUserData();
    }
  }, [navigate]);

  // Get current user
  const userData = localStorage.getItem('user');
  const currentUser = userData ? JSON.parse(userData) : null;
  const sellerName = currentUser ? currentUser.name : 'Anonymous';
  const userEmail = currentUser ? currentUser.email : 'guest';

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setImage(previewUrl);

      // Convert to base64 for localStorage storage
      const reader = new FileReader();
      reader.onloadend = () => setImageData(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.salePrice && !formData.rentPrice) {
      alert("Please provide at least a Sale Price or a Rent Price.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('salePrice', formData.salePrice || '');
      formDataToSend.append('rentPrice', formData.rentPrice || '');
      formDataToSend.append('category', formData.category);
      formDataToSend.append('location', formData.location);
      
      // If we have image data as base64, convert it to a blob
      if (imageData && imageData.startsWith('data:image/')) {
        const response = await fetch(imageData);
        const blob = await response.blob();
        formDataToSend.append('image', blob, 'product.jpg');
      }

      const response = await axios.post(`${API_URL}/api/products`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        // Add loyalty points: 50 points per listing
        const pointsKey = `loyaltyPoints_${userEmail}`;
        const currentPoints = parseInt(localStorage.getItem(pointsKey) || '0');
        const earned = 50;
        localStorage.setItem(pointsKey, (currentPoints + earned).toString());
        setPointsEarned(earned);

        // Refresh user listings count
        setUserListings(prev => [...prev, response.data.product]);

        // Dispatch storage event to notify other components
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'productsUpdated',
          newValue: 'true'
        }));

        setTimeout(() => {
          setLoading(false);
          setSuccess(true);
          setTimeout(() => navigate('/'), 2500);
        }, 1000);
      }
    } catch (error) {
      console.error('Error creating product:', error);
      const errorMsg = error.response?.data?.message || 'Failed to list item. Please try again.';
      alert(`Error: ${errorMsg}`);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <CheckCircle size={72} color="#10b981" style={{ marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem' }}>Item Listed Successfully!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Your item is now live on the CampusLogistics marketplace.</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: '#fef3c7', border: '1px solid #fcd34d', color: '#92400e', padding: '1rem 2rem', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '700', fontFamily: 'Outfit, sans-serif' }}>
            <Award size={28} color="#f59e0b" />
            You earned <span style={{ color: '#d97706', fontSize: '1.5rem' }}>+{pointsEarned}</span> Loyalty Points!
          </div>
          <p style={{ color: '#94a3b8', marginTop: '1.5rem', fontSize: '0.9rem' }}>Redirecting to storefront...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', display: 'flex', gap: '2rem' }}>
        
        {/* Left Sidebar - Dashboard */}
        <aside style={{ width: '300px', background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content', position: 'sticky', top: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1e293b' }}>📊 Your Dashboard</h3>
            
            {/* User Profile Card */}
            <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👤</div>
              <h4 style={{ margin: '0.5rem 0', fontSize: '1.1rem', fontWeight: 'bold' }}>{currentUser?.name}</h4>
              <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: '0.25rem 0' }}>{currentUser?.email}</p>
              <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: '0.25rem 0' }}>📱 {currentUser?.phone}</p>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '8px', padding: '0.5rem', marginTop: '1rem', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                {currentUser?.role}
              </div>
            </div>

            {/* Stats Cards */}
            <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid #fcd34d' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⭐</span>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#92400e', margin: '0' }}>Loyalty Points</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706', margin: '0' }}>{loyaltyPoints}</p>
                </div>
              </div>
            </div>

            <div style={{ background: '#dbeafe', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid #93c5fd' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🛍️</span>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#1e40af', margin: '0' }}>Items Listed</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e40af', margin: '0' }}>{userListings.length}</p>
                </div>
              </div>
            </div>

            <div style={{ background: '#dcfce7', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid #86efac' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>💰</span>
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#166534', margin: '0' }}>Earning Potential</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a', margin: '0' }}>+50 pts</p>
                </div>
              </div>
            </div>

            {/* Recent Listings */}
            {userListings.length > 0 && (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b', paddingBottom: '0.75rem', borderBottom: '2px solid #e2e8f0' }}>Recent Listings</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {userListings.slice(-3).reverse().map(item => (
                    <div key={item.id} style={{ background: '#f1f5f9', borderRadius: '8px', padding: '0.75rem', borderLeft: '3px solid #4f46e5' }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b', margin: '0 0 0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0' }}>₹{item.salePrice || item.rentPrice}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userListings.length === 0 && (
              <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                <p style={{ fontSize: '0.9rem' }}>No items listed yet</p>
                <p style={{ fontSize: '0.75rem' }}>This will be your first one!</p>
              </div>
            )}
          </div>
        </aside>

        {/* Right Content - Form */}
        <main style={{ flex: 1 }}>
          <div className="sell-container">
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem', fontSize: '1rem' }}>
              <ArrowLeft size={20} /> Back to Store
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Sell Your Item</h1>
                <p style={{ color: '#64748b' }}>Listing as: <strong>{sellerName}</strong></p>
              </div>
              <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', padding: '0.75rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Award size={22} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Earn on Listing</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#d97706', fontFamily: 'Outfit, sans-serif' }}>+50 Points</div>
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit}>
          <div className="image-upload-box">
            <input type="file" id="imageUpload" style={{ display: 'none' }} accept="image/*" onChange={handleImageChange} />
            <label htmlFor="imageUpload" style={{ cursor: 'pointer', display: 'block' }}>
              {image ? (
                <img src={image} alt="Preview" style={{ maxHeight: '220px', borderRadius: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }} />
              ) : (
                <>
                  <UploadCloud size={48} className="upload-icon" />
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Upload Product Photo</h3>
                  <p style={{ color: '#94a3b8' }}>Click to browse or drag and drop</p>
                </>
              )}
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="title">Item Name</label>
            <input type="text" id="title" name="title" className="form-input" placeholder="e.g. Scientific Calculator Casio" value={formData.title} onChange={onChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" className="form-input" rows="3" placeholder="Describe the condition, age, and any accessories included." value={formData.description} onChange={onChange} required style={{ resize: 'vertical' }}></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Campus Pickup Location</label>
            <div className="input-wrapper">
              <MapPin className="input-icon" size={20} />
              <input type="text" id="location" name="location" className="form-input" placeholder="e.g. Main Library, Hostel Block C, Cafeteria" value={formData.location} onChange={onChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '1.25rem' }}>
            <div className="form-group">
              <label htmlFor="salePrice">Sale Price (₹)</label>
              <input type="number" id="salePrice" name="salePrice" className="form-input" placeholder="Optional" value={formData.salePrice} onChange={onChange} min="1" />
            </div>

            <div className="form-group">
              <label htmlFor="rentPrice">Rent Price (₹/day)</label>
              <input type="number" id="rentPrice" name="rentPrice" className="form-input" placeholder="Optional" value={formData.rentPrice} onChange={onChange} min="1" />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select id="category" name="category" className="form-input" value={formData.category} onChange={onChange}>
                <option value="Engineering">Engineering</option>
                <option value="Electronics">Electronics</option>
                <option value="Apparel">Apparel</option>
                <option value="Sports">Sports</option>
                <option value="Books">Books</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '1rem' }} disabled={loading}>
            {loading ? 'Listing item...' : 'List Item & Earn 50 Points'}
          </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SellItem;
