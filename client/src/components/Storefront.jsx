import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, Star, PlusCircle, X, Trash2, MapPin, Map, Award, Shield } from 'lucide-react';

const defaultProducts = [
  {
    id: 1,
    name: 'Professional Mini Drafter',
    category: 'Engineering',
    price: 450,
    rating: 4.8,
    image: '/images/drafter.png',
    description: 'High-precision mini drafter for technical drawing and architecture students.',
    location: 'Engineering Block A',
    seller: 'Campus Store',
  },
  {
    id: 2,
    name: 'Casio fx-991EX Scientific Calculator',
    category: 'Electronics',
    price: 1200,
    rating: 4.9,
    image: '/images/calculator.png',
    description: 'Advanced scientific calculator with high-resolution LCD and 552 functions.',
    location: 'Main Library',
    seller: 'Campus Store',
  },
  {
    id: 3,
    name: 'Premium White Lab Coat',
    category: 'Apparel',
    price: 650,
    rating: 4.6,
    image: '/images/labcoat.png',
    description: '100% cotton, stain-resistant lab coat with deep pockets for medical and chemistry labs.',
    location: 'Chemistry Lab Area',
    seller: 'Campus Store',
  },
  {
    id: 4,
    name: 'Wilson Basketball & Tennis Gear',
    category: 'Sports',
    price: 1800,
    rating: 4.7,
    image: '/images/sports.png',
    description: 'High-quality sports equipment for campus tournaments and physical education.',
    location: 'Sports Complex',
    seller: 'Campus Store',
  },
  {
    id: 5,
    name: 'Arduino Uno Starter Kit',
    category: 'Electronics',
    price: 2500,
    rating: 4.9,
    image: '/images/arduino.png',
    description: 'Complete Arduino starter kit including breadboard, jumper wires, sensors, and LEDs.',
    location: 'Tech Club Room',
    seller: 'Campus Store',
  },
  {
    id: 6,
    name: 'Engineering Drawing Board',
    category: 'Engineering',
    price: 850,
    rating: 4.5,
    image: '/images/drawing_board.png',
    description: 'Smooth wooden drawing board with integrated T-square groove for architectural drafts.',
    location: 'Hostel Block C',
    seller: 'Campus Store',
  },
  {
    id: 7,
    name: 'First Year Textbook Bundle',
    category: 'Books',
    price: 3200,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1513258496099-481620d4ce8d?q=80&w=2070&auto=format&fit=crop',
    description: 'Essential textbooks for first-year engineering: Mathematics, Physics, and Programming.',
    location: 'Cafeteria',
    seller: 'Campus Store',
  }
];

// Vignan University Vadlamudi coordinates
const CAMPUS_COORDS = { lat: 16.233, lng: 80.551 };
const MAX_RADIUS_KM = 5;

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function deg2rad(deg) { return deg * (Math.PI/180); }

const Storefront = () => {
  const [allProducts, setAllProducts] = useState(defaultProducts);
  const [cart, setCart] = useState([]);
  const [addedItems, setAddedItems] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [locationStatus, setLocationStatus] = useState('checking');
  const navigate = useNavigate();

  useEffect(() => {
    // Load cart
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    // Load user listings and merge
    const userListings = JSON.parse(localStorage.getItem('userListings') || '[]');
    if (userListings.length > 0) {
      setAllProducts([...defaultProducts, ...userListings]);
    }

    // Check auth
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      const user = JSON.parse(userData);
      setIsLoggedIn(true);
      setUserName(user.name || 'Student');
      setUserRole(user.role || 'student');
    }

    // Load loyalty points
    const pts = parseInt(localStorage.getItem('loyaltyPoints') || '0');
    setLoyaltyPoints(pts);

    // Check Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const dist = getDistanceFromLatLonInKm(CAMPUS_COORDS.lat, CAMPUS_COORDS.lng, position.coords.latitude, position.coords.longitude);
          setLocationStatus(dist <= MAX_RADIUS_KM ? 'allowed' : 'denied_distance');
        },
        () => setLocationStatus('denied_permission')
      );
    } else {
      setLocationStatus('denied_permission');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserName('');
    setLoyaltyPoints(0);
  };

  const handleAddToCart = (product) => {
    const newCart = [...cart, product];
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    setAddedItems({ ...addedItems, [product.id]: true });
    setTimeout(() => setAddedItems(prev => ({ ...prev, [product.id]: false })), 2000);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  // --- LOCATION BLOCKED SCREENS ---
  if (locationStatus === 'checking') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <Map size={48} color="#4f46e5" style={{ marginBottom: '1rem', animation: 'pulse 2s infinite' }} />
        <h2 style={{ fontFamily: 'Outfit, sans-serif' }}>Verifying Campus Location...</h2>
        <p style={{ color: '#64748b' }}>Please allow location access to browse products.</p>
        <style>{`@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } 100% { transform: scale(1); opacity: 1; } }`}</style>
      </div>
    );
  }

  if (locationStatus === 'denied_permission' || locationStatus === 'denied_distance') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '2rem', textAlign: 'center' }}>
        <MapPin size={64} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', marginBottom: '1rem' }}>
          {locationStatus === 'denied_distance' ? 'Out of Bounds' : 'Location Access Required'}
        </h2>
        <p style={{ color: '#64748b', maxWidth: '500px', fontSize: '1.1rem', marginBottom: '2rem' }}>
          {locationStatus === 'denied_distance'
            ? 'Products are not available in this location. You must be inside Vignan University, Vadlamudi campus to access CampusLogistics.'
            : 'You must grant location permissions so we can verify you are within the Vignan University campus bounds.'}
        </p>
        <button className="btn-primary" style={{ padding: '0.75rem 2rem' }} onClick={() => setLocationStatus('allowed')}>[Dev Override: Enter Anyway]</button>
      </div>
    );
  }

  // --- STOREFRONT ---
  return (
    <div className="store-container">
      {/* Navbar */}
      <nav className="store-nav">
        <div className="nav-left">
          <Menu className="icon-menu" size={28} />
          <Link to="/" className="store-brand">CampusLogistics</Link>
        </div>
        <div className="nav-center">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input type="text" placeholder="Search for drafters, calculators, lab coats..." />
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-links" style={{ alignItems: 'center' }}>
            <Link to="/sell" className="btn-sell">
              <PlusCircle size={18} />
              Sell Item
            </Link>
            {userRole === 'admin' && (
              <Link to="/admin" className="btn-sell" style={{ background: '#4f46e5', marginLeft: '0.5rem' }}>
                <Shield size={18} />
                Admin Panel
              </Link>
            )}
          </div>

          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '1.5rem' }}>
              <div className="loyalty-badge">
                <Award size={16} color="#f59e0b" />
                <span>{loyaltyPoints} pts</span>
              </div>
              <div className="user-greeting">
                👋 Hi, <strong>{userName}</strong>
              </div>
              <button onClick={handleLogout} className="btn-logout-nav">Logout</button>
            </div>
          ) : (
            <div className="nav-links" style={{ marginLeft: '1.5rem' }}>
              <Link to="/login" className="btn-nav btn-login">Login</Link>
              <Link to="/signup" className="btn-nav btn-signup">Sign Up</Link>
            </div>
          )}
          
          <div className="cart-icon-wrapper" style={{ marginLeft: '1.5rem' }} onClick={() => setIsCartOpen(true)}>
            <ShoppingCart size={24} />
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </div>
        </div>
      </nav>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Your Cart</h2>
              <button className="btn-close" onClick={() => setIsCartOpen(false)}><X size={24} /></button>
            </div>
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingCart size={48} color="#cbd5e1" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-item-image" />
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                        <MapPin size={11} /> {item.location}
                      </div>
                      <div className="cart-item-price" style={{ marginTop: '0.25rem' }}>₹{item.price}</div>
                    </div>
                    <button className="btn-remove" onClick={() => removeFromCart(index)}><Trash2 size={18} /></button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  <span>₹{cartTotal}</span>
                </div>
                <button className="btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }} onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero */}
      <header className="hero-section">
        <div className="hero-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: '600', marginBottom: '2rem' }}>
            <MapPin size={16} /> Verified: Vignan University, Vadlamudi
          </div>
          <h1>Everything You Need For Campus Life</h1>
          <p>Get premium quality engineering tools, lab equipment, and sports gear. Buy and sell directly with your peers.</p>
          <button className="btn-hero" onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}>Shop Now</button>
        </div>
      </header>

      {/* Products Grid */}
      <main className="main-content">
        <div className="section-header">
          <h2>Trending Products</h2>
          <div className="header-line"></div>
        </div>
        <div className="products-grid">
          {allProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="card-image-wrapper">
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="category-badge">{product.category}</div>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div className="rating">
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <span>{product.rating}</span>
                  </div>
                  <div className="seller-tag">
                    {product.seller === 'Campus Store' ? '🏬' : '🎓'} {product.seller}
                  </div>
                </div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: '500' }}>
                  <MapPin size={14} color="#4f46e5" />
                  Pickup: {product.location}
                </div>
                <div className="card-footer">
                  <span className="product-price">₹{product.price}</span>
                  <button
                    className="btn-add-cart"
                    onClick={() => handleAddToCart(product)}
                    style={{
                      background: addedItems[product.id] ? '#10b981' : '',
                      color: addedItems[product.id] ? '#fff' : '',
                      borderColor: addedItems[product.id] ? '#10b981' : ''
                    }}
                  >
                    {addedItems[product.id] ? 'Added!' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Storefront;
