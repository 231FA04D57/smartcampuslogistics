import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle, ArrowLeft, MapPin, Award } from 'lucide-react';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      alert("You must be logged in to sell an item.");
      navigate('/login');
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

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.salePrice && !formData.rentPrice) {
      alert("Please provide at least a Sale Price or a Rent Price.");
      setLoading(false);
      return;
    }

    // Build new listing object
    const newListing = {
      id: Date.now(),
      name: formData.title,
      description: formData.description,
      salePrice: formData.salePrice ? parseInt(formData.salePrice) : null,
      rentPrice: formData.rentPrice ? parseInt(formData.rentPrice) : null,
      category: formData.category,
      location: formData.location,
      rating: 5.0,
      image: imageData || '/images/drafter.png',
      seller: sellerName,
    };

    // Save to localStorage under 'userListings'
    const existing = JSON.parse(localStorage.getItem('userListings') || '[]');
    existing.push(newListing);
    localStorage.setItem('userListings', JSON.stringify(existing));

    // Add loyalty points: 50 points per listing
    const pointsKey = `loyaltyPoints_${userEmail}`;
    const currentPoints = parseInt(localStorage.getItem(pointsKey) || '0');
    const earned = 50;
    localStorage.setItem(pointsKey, (currentPoints + earned).toString());
    setPointsEarned(earned);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2500);
    }, 1000);
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
            <input type="file" id="imageUpload" style={{ display: 'none' }} accept="image/*" onChange={handleImageChange} required />
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
    </div>
  );
};

export default SellItem;
