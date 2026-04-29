import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, Star, PlusCircle, X, Trash2, MapPin, Map, Award, Shield, Package, Zap, Calendar } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const defaultProducts = [
  {
    id: 1,
    name: 'Professional Mini Drafter',
    category: 'Engineering',
    salePrice: 450,
    rentPrice: 30,
    rating: 4.8,
    image: '/images/drafter.png',
    description: 'High-precision mini drafter for technical drawing and architecture students.',
    location: 'Engineering Block A',
    seller: 'Campus Store',
    uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
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
    uploadDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
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
    uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
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
    uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 5,
    name: 'Dell XPS 13 Laptop (Used)',
    category: 'Electronics',
    salePrice: 45000,
    rentPrice: 1500,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=2000&auto=format&fit=crop',
    description: 'High performance laptop perfect for coding and engineering software. Mint condition.',
    location: 'Tech Club Room',
    seller: 'Campus Store',
    uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
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
    uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
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
    uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
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

// Helper function to format upload date
function formatUploadDate(date) {
  if (!date) return 'Recently Added';
  
  const now = new Date();
  const diffTime = Math.abs(now - new Date(date));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

// Helper function to check product availability
function getProductStatus(product, inventory) {
  const productKey = `${product.id}_${product.seller}`;
  const status = inventory[productKey];
  
  if (!status) return { available: true, status: null };
  
  if (status.status === 'sold') {
    return { available: false, status: 'sold', message: 'Sold Out' };
  }
  
  if (status.status === 'rented') {
    const endDate = new Date(status.rentalEndDate);
    const now = new Date();
    if (now < endDate) {
      const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      return { available: false, status: 'rented', message: `Rented for ${daysLeft} more day${daysLeft !== 1 ? 's' : ''}` };
    } else {
      return { available: true, status: null };
    }
  }
  
  return { available: true, status: null };
}

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
  const [inventory, setInventory] = useState({});
  const navigate = useNavigate();

  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    const products = allProducts.filter(product => {
      const { available } = getProductStatus(product, inventory);
      return available;
    });
    return products;
  }, [allProducts, inventory]);

  // Function to refresh products from database
  const refreshProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      
      const productsData = Array.isArray(response.data) ? response.data : 
                          (response.data && Array.isArray(response.data.data) ? response.data.data : []);
                          
      const dbProducts = productsData.map(product => ({
        ...product,
        id: product._id || product.id,
        seller: product.seller || (product.sellerId && product.sellerId.name) || 'Campus Store',
        price: product.salePrice || product.price,
      }));
      
      console.log('Refreshing products from database:', dbProducts.length, 'items found');
      
      const dbProductIds = new Set(dbProducts.map(p => p.id));
      const filteredDefaults = defaultProducts.filter(p => !dbProductIds.has(p.id));
      
      // dbProducts first
      setAllProducts([...dbProducts, ...filteredDefaults]);
    } catch (error) {
      console.error('Error fetching products from database:', error);
      const userListings = JSON.parse(localStorage.getItem('userListings') || '[]');
      
      const ulProductIds = new Set(userListings.map(p => p.id));
      const filteredDefaults = defaultProducts.filter(p => !ulProductIds.has(p.id));
      
      setAllProducts([...userListings, ...filteredDefaults]);
    }
  };

  useEffect(() => {
    // Load cart
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    // Load inventory
    const savedInventory = localStorage.getItem('productInventory');
    if (savedInventory) setInventory(JSON.parse(savedInventory));

    // Load products from database
    refreshProducts();

    // Check auth
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    let userEmail = 'guest';
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setIsLoggedIn(true);
      setUserName(parsedUser.name || 'Student');
      setUserRole(parsedUser.role || 'student');
      userEmail = parsedUser.email;
    }

    // Load loyalty points
    const pts = parseInt(localStorage.getItem(`loyaltyPoints_${userEmail}`) || '0');
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

    // Listen for storage changes to detect new products
    const handleStorageChange = (e) => {
      if (e.key === 'productsUpdated') {
        console.log('Storage change detected for products');
        refreshProducts();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const intervalId = setInterval(() => {
      refreshProducts();
    }, 10000); // Check every 10 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUserName('');
    setLoyaltyPoints(0);
  };

  const handleAddToCart = (product, type = 'sale') => {
    if (isLoggedIn && product.seller === userName) {
      alert('❌ You cannot add your own listed item to the cart.');
      return;
    }

    const existingInCart = cart.find(item => item.id === product.id);
    
    if (existingInCart && existingInCart.listingType !== type) {
      alert(`⚠️ This product is already in your cart.`);
      return;
    }

    const sPrice = product.salePrice || product.price;
    const rPrice = product.rentPrice;

    const cartItem = {
      ...product,
      cartId: `${product.id}-${type}-${Date.now()}`,
      listingType: type,
      price: type === 'rent' ? rPrice : sPrice
    };

    const newCart = [...cart, cartItem];
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

  return (
    <div className="store-container">
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
            {isLoggedIn && (
              <>
                <Link to="/dashboard" className="btn-sell" style={{ background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0', marginLeft: '0.5rem' }}>
                  📊 Dashboard
                </Link>
                <Link to="/orders" className="btn-sell" style={{ background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0', marginLeft: '0.5rem' }}>
                  <Package size={18} />
                  My Orders
                </Link>
              </>
            )}
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
                      <div className="cart-item-price" style={{ marginTop: '0.25rem' }}>₹{item.price}{item.listingType === 'rent' ? '/day' : ''}</div>
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

      <header className="hero-section" style={{
        backgroundImage: 'url("/images/hero-background.svg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.8) 0%, rgba(147, 51, 234, 0.8) 100%)',
          zIndex: 0
        }}></div>
        <div className="hero-content" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: '600', marginBottom: '2rem' }}>
            <MapPin size={16} /> Verified: Vignan University, Vadlamudi
          </div>
          <h1>Everything You Need For Campus Life</h1>
          <p>Get premium quality engineering tools, lab equipment, and sports gear. Buy and sell directly with your peers.</p>
          <button className="btn-hero" onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}>Shop Now</button>
        </div>
      </header>

      <main className="main-content">
        <div className="promo-section">
          <div className="promo-content">
            <h3>Want to see your stuff here?</h3>
            <p>Make some extra cash by selling items in your community. Go on, it's quick and easy.</p>
            <Link to="/sell" className="btn-start-selling">
              <Zap size={20} />
              Start Selling
            </Link>
          </div>
          <div className="promo-visual">
            <div className="promo-icon">📦</div>
          </div>
        </div>

        <div className="section-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Trending Products</h2>
            <button 
              onClick={refreshProducts}
              style={{
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              🔄 Refresh Items
            </button>
          </div>
          <div className="header-line"></div>
          {allProducts.length > defaultProducts.length && (
            <div style={{ 
              background: '#e0f2fe', 
              color: '#0c4a6e', 
              padding: '0.5rem 1rem', 
              borderRadius: '6px', 
              fontSize: '0.85rem',
              marginTop: '0.5rem'
            }}>
              Showing {allProducts.length - defaultProducts.length} user-added items + {defaultProducts.length} default items
            </div>
          )}
        </div>
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#64748b' }}>
              <Package size={48} style={{ margin: '0 auto 1rem' }} />
              <p>No products available at the moment.</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const productStatus = getProductStatus(product, inventory);
              return (
                <div key={product.id} className={`product-card ${!productStatus.available ? 'unavailable' : ''}`} style={{ opacity: !productStatus.available ? 0.6 : 1, pointerEvents: !productStatus.available ? 'none' : 'auto' }}>
                  <div className="card-image-wrapper">
                    <img src={product.image} alt={product.name} className="product-image" />
                    <div className="category-badge" style={{ background: (product.rentPrice && !product.salePrice && !product.price) ? '#f59e0b' : '', color: (product.rentPrice && !product.salePrice && !product.price) ? '#fff' : '' }}>
                      {(product.rentPrice && !product.salePrice && !product.price) ? `${product.category} (Rent)` : product.category}
                    </div>
                    {!productStatus.available && (
                      <div className={`product-status-badge ${productStatus.status === 'rented' ? 'status-rented' : 'status-sold'}`}>
                        {productStatus.message}
                        {productStatus.status === 'rented' && (
                          <div className="status-countdown" style={{ marginTop: '0.25rem', fontSize: '0.65rem' }}>
                            Returns soon
                          </div>
                        )}
                      </div>
                    )}
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
                    <div className="card-footer" style={{ flexDirection: 'column', gap: '0.75rem', alignItems: 'stretch' }}>
                      <div className="product-upload-date">
                        <Calendar size={12} style={{ marginRight: '0.25rem', display: 'inline' }} />
                        Uploaded {formatUploadDate(product.uploadDate)}
                      </div>
                      
                      {(product.salePrice || product.price) && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="product-price">₹{product.salePrice || product.price}</span>
                          {isLoggedIn && product.seller === userName ? (
                            <div style={{ padding: '0.5rem 1rem', background: '#f3f4f6', color: '#6b7280', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                              Your Item
                            </div>
                          ) : (
                            <button
                              className="btn-add-cart"
                              onClick={() => handleAddToCart(product, 'sale')}
                              style={{
                                padding: '0.5rem 1rem',
                                background: addedItems[product.id] ? '#10b981' : '',
                                color: addedItems[product.id] ? '#fff' : '',
                                borderColor: addedItems[product.id] ? '#10b981' : ''
                              }}
                            >
                              {addedItems[product.id] ? 'Added!' : 'Buy'}
                            </button>
                          )}
                        </div>
                      )}
                      {product.rentPrice && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: (product.salePrice || product.price) ? '0.75rem' : '0', borderTop: (product.salePrice || product.price) ? '1px dashed #e2e8f0' : 'none' }}>
                          <span className="product-price">₹{product.rentPrice}<span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>/day</span></span>
                          {isLoggedIn && product.seller === userName ? (
                            <div style={{ padding: '0.5rem 1rem', background: '#f3f4f6', color: '#6b7280', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '500' }}>
                              Your Item
                            </div>
                          ) : (
                            <button
                              className="btn-add-cart"
                              onClick={() => handleAddToCart(product, 'rent')}
                              style={{
                                padding: '0.5rem 1rem',
                                background: addedItems[product.id] ? '#10b981' : '#fef3c7',
                                color: addedItems[product.id] ? '#fff' : '#d97706',
                                borderColor: addedItems[product.id] ? '#10b981' : '#fcd34d'
                              }}
                            >
                              {addedItems[product.id] ? 'Added!' : 'Rent'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default Storefront;
