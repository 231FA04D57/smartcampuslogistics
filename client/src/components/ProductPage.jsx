import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, ShoppingCart, Calendar, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const defaultProducts = [
  { id: 1, name: 'Professional Mini Drafter', category: 'Engineering', salePrice: 450, rentPrice: 30, rating: 4.8, image: '/images/drafter.png', description: 'High-precision mini drafter for technical drawing and architecture students.', location: 'Engineering Block A', seller: 'Campus Store', uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  { id: 2, name: 'Casio fx-991EX Scientific Calculator', category: 'Electronics', price: 1200, salePrice: 1200, rating: 4.9, image: '/images/calculator.png', description: 'Advanced scientific calculator with high-resolution LCD and 552 functions.', location: 'Main Library', seller: 'Campus Store', uploadDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
  { id: 3, name: 'Premium White Lab Coat', category: 'Apparel', price: 650, salePrice: 650, rating: 4.6, image: '/images/labcoat.png', description: '100% cotton, stain-resistant lab coat with deep pockets for medical and chemistry labs.', location: 'Chemistry Lab Area', seller: 'Campus Store', uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: 4, name: 'Wilson Basketball & Tennis Gear', category: 'Sports', price: 1800, salePrice: 1800, rating: 4.7, image: '/images/sports.png', description: 'High-quality sports equipment for campus tournaments and physical education.', location: 'Sports Complex', seller: 'Campus Store', uploadDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
  { id: 5, name: 'Dell XPS 13 Laptop (Used)', category: 'Electronics', salePrice: 45000, rentPrice: 1500, rating: 4.8, image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=2000&auto=format&fit=crop', description: 'High performance laptop perfect for coding and engineering software. Mint condition.', location: 'Tech Club Room', seller: 'Campus Store', uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: 6, name: 'Engineering Drawing Board', category: 'Engineering', price: 850, salePrice: 850, rating: 4.5, image: '/images/drawing_board.png', description: 'Smooth wooden drawing board with integrated T-square groove for architectural drafts.', location: 'Hostel Block C', seller: 'Campus Store', uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  { id: 7, name: 'First Year Textbook Bundle', category: 'Books', price: 3200, salePrice: 3200, rating: 4.8, image: 'https://images.unsplash.com/photo-1513258496099-481620d4ce8d?q=80&w=2070&auto=format&fit=crop', description: 'Essential textbooks for first-year engineering: Mathematics, Physics, and Programming.', location: 'Cafeteria', seller: 'Campus Store', uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
];

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [cart, setCart] = useState([]);
  const [addedItems, setAddedItems] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUserName(JSON.parse(userData).name || 'Student');
    }

    // Load cart
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    const fetchProduct = async () => {
      setLoading(true);
      try {
        // First check if it's a default product (id length < 10)
        if (id.length <= 10) {
          const p = defaultProducts.find(p => p.id.toString() === id);
          if (p) {
            setProduct({ ...p, images: [p.image] });
            return;
          }
        }

        let p = null;

        // Try to fetch by ID
        try {
          const response = await axios.get(`${API_URL}/api/products/${id}`);
          p = response.data;
        } catch (apiError) {
          console.warn('Direct fetch by ID failed, trying full list fallback:', apiError);
          // Fallback: Fetch all products and find it
          try {
            const allRes = await axios.get(`${API_URL}/api/products`);
            const allProducts = Array.isArray(allRes.data) ? allRes.data : 
                               (allRes.data && Array.isArray(allRes.data.data) ? allRes.data.data : []);
            p = allProducts.find(item => item._id === id || item.id === id);
          } catch (listError) {
            console.error('List fallback also failed', listError);
          }
        }

        if (p) {
          setProduct({
            ...p,
            id: p._id || p.id,
            seller: p.seller || (p.sellerId && p.sellerId.name) || 'Campus Store',
            price: p.salePrice || p.price
          });
          return;
        }

        // Final fallback to local storage
        const userListings = JSON.parse(localStorage.getItem('userListings') || '[]');
        const localP = userListings.find(item => item.id?.toString() === id || item._id === id);
        if (localP) {
           setProduct({ ...localP, images: localP.images || [localP.image] });
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = (type = 'sale') => {
    if (!product) return;
    
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
    setAddedItems({ ...addedItems, [type]: true });
    setTimeout(() => setAddedItems(prev => ({ ...prev, [type]: false })), 2000);
    
    // Dispatch event to update navbar cart
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'cartUpdated',
      newValue: 'true'
    }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert('Please login to leave a review');
      return navigate('/login');
    }
    if (!reviewForm.comment.trim()) {
      alert('Please write a review comment');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/products/${id}/reviews`, reviewForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProduct(prev => ({
        ...prev,
        rating: response.data.rating,
        reviews: [...(prev.reviews || []), response.data.review]
      }));
      setReviewForm({ rating: 5, comment: '' });
      alert('Review added successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to add review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (!product) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <h2>Product not found</h2>
      <Link to="/" className="btn-primary" style={{ marginTop: '1rem' }}>Return to Store</Link>
    </div>;
  }

  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const reviews = product.reviews || [];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem', fontSize: '1rem' }}>
          <ArrowLeft size={20} /> Back
        </button>

        <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Left: Images */}
          <div style={{ padding: '2rem' }}>
            <div style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <img src={allImages[selectedImage]} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {allImages.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedImage(idx)}
                    style={{ 
                      width: '80px', height: '80px', borderRadius: '8px', cursor: 'pointer',
                      border: selectedImage === idx ? '2px solid #4f46e5' : '2px solid transparent',
                      overflow: 'hidden', background: '#f1f5f9'
                    }}
                  >
                    <img src={img} alt={`${product.name} ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div style={{ padding: '2rem 2rem 2rem 0' }}>
            <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: '#e0e7ff', color: '#4f46e5', borderRadius: '999px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1rem' }}>
              {product.category}
            </div>
            <h1 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>{product.name}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={18} fill="#fbbf24" color="#fbbf24" />
                <span style={{ fontWeight: '600', color: '#1e293b' }}>{product.rating}</span>
                <span>({reviews.length} reviews)</span>
              </div>
              <span>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={18} /> {product.location}
              </div>
            </div>

            <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: '1.6', marginBottom: '2rem' }}>
              {product.description}
            </p>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ color: '#64748b' }}>Seller: <strong style={{ color: '#1e293b' }}>{product.seller}</strong></span>
                <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={16} /> Listed: {new Date(product.uploadDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {(product.salePrice || product.price) && (
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>Buy Price</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '1rem' }}>₹{product.salePrice || product.price}</div>
                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: addedItems['sale'] ? '#059669' : '#10b981' }}
                    onClick={() => handleAddToCart('sale')}
                  >
                    <ShoppingCart size={20} /> {addedItems['sale'] ? 'Added to Cart!' : 'Add to Cart (Buy)'}
                  </button>
                </div>
              )}

              {product.rentPrice && (
                <div style={{ flex: 1, borderLeft: (product.salePrice || product.price) ? '1px solid #e2e8f0' : 'none', paddingLeft: (product.salePrice || product.price) ? '1rem' : '0' }}>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>Rent Price</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '1rem' }}>₹{product.rentPrice}<span style={{ fontSize: '1rem', color: '#64748b' }}>/day</span></div>
                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: addedItems['rent'] ? '#d97706' : '#f59e0b' }}
                    onClick={() => handleAddToCart('rent')}
                  >
                    <ShoppingCart size={20} /> {addedItems['rent'] ? 'Added to Cart!' : 'Add to Cart (Rent)'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ marginTop: '3rem', background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'Outfit, sans-serif', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={24} color="#4f46e5" /> Customer Reviews
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
            {/* Write a review */}
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Write a Review</h3>
              {!isLoggedIn ? (
                <div style={{ background: '#f1f5f9', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ marginBottom: '1rem', color: '#64748b' }}>Please login to share your experience.</p>
                  <Link to="/login" className="btn-primary" style={{ display: 'inline-block' }}>Login</Link>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Rating</label>
                    <select 
                      value={reviewForm.rating} 
                      onChange={e => setReviewForm({...reviewForm, rating: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Terrible</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569' }}>Your Review</label>
                    <textarea 
                      value={reviewForm.comment}
                      onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                      rows="4" 
                      placeholder="What did you like or dislike?"
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical' }}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn-primary" disabled={isSubmittingReview}>
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>

            {/* List Reviews */}
            <div>
              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
                  <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p>No reviews yet. Be the first to review this item!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {reviews.map((rev, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong style={{ color: '#1e293b' }}>{rev.userName}</strong>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{new Date(rev.date).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < rev.rating ? "#fbbf24" : "#e2e8f0"} color={i < rev.rating ? "#fbbf24" : "#e2e8f0"} />
                        ))}
                      </div>
                      <p style={{ color: '#475569', margin: 0, lineHeight: '1.5' }}>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductPage;
