import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, Banknote, ArrowLeft, CheckCircle } from 'lucide-react';

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  const handlePayment = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      localStorage.removeItem('cart'); // Clear cart after successful payment
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }, 2000);
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', background: '#fff', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <CheckCircle size={72} color="#10b981" style={{ marginBottom: '1rem', margin: '0 auto' }} />
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'Outfit, sans-serif', marginBottom: '0.5rem' }}>Payment Successful!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Your order has been placed and the seller has been notified.</p>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Redirecting to storefront...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 5%' }}>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem', fontSize: '1rem' }}>
        <ArrowLeft size={20} /> Back to Store
      </button>

      <h1 style={{ fontSize: '2.5rem', fontFamily: 'Outfit, sans-serif', marginBottom: '2rem' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        {/* Payment Form */}
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontFamily: 'Outfit, sans-serif' }}>Payment Details</h2>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div 
              onClick={() => setPaymentMethod('card')}
              style={{ flex: 1, padding: '1rem', border: `2px solid ${paymentMethod === 'card' ? '#4f46e5' : '#e2e8f0'}`, borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: paymentMethod === 'card' ? '#eff6ff' : '#fff' }}
            >
              <CreditCard size={24} color={paymentMethod === 'card' ? '#4f46e5' : '#64748b'} />
              <span style={{ fontWeight: '500', color: paymentMethod === 'card' ? '#1e293b' : '#64748b' }}>Card</span>
            </div>
            <div 
              onClick={() => setPaymentMethod('upi')}
              style={{ flex: 1, padding: '1rem', border: `2px solid ${paymentMethod === 'upi' ? '#4f46e5' : '#e2e8f0'}`, borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: paymentMethod === 'upi' ? '#eff6ff' : '#fff' }}
            >
              <Wallet size={24} color={paymentMethod === 'upi' ? '#4f46e5' : '#64748b'} />
              <span style={{ fontWeight: '500', color: paymentMethod === 'upi' ? '#1e293b' : '#64748b' }}>UPI</span>
            </div>
            <div 
              onClick={() => setPaymentMethod('cod')}
              style={{ flex: 1, padding: '1rem', border: `2px solid ${paymentMethod === 'cod' ? '#4f46e5' : '#e2e8f0'}`, borderRadius: '12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: paymentMethod === 'cod' ? '#eff6ff' : '#fff' }}
            >
              <Banknote size={24} color={paymentMethod === 'cod' ? '#4f46e5' : '#64748b'} />
              <span style={{ fontWeight: '500', color: paymentMethod === 'cod' ? '#1e293b' : '#64748b' }}>Cash</span>
            </div>
          </div>

          <form onSubmit={handlePayment}>
            {paymentMethod === 'card' && (
              <>
                <div className="form-group">
                  <label>Card Number</label>
                  <input type="text" className="form-input" placeholder="0000 0000 0000 0000" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="text" className="form-input" placeholder="MM/YY" required />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input type="password" className="form-input" placeholder="123" required />
                  </div>
                </div>
              </>
            )}
            
            {paymentMethod === 'upi' && (
              <div className="form-group">
                <label>UPI ID</label>
                <input type="text" className="form-input" placeholder="username@upi" required />
              </div>
            )}

            {paymentMethod === 'cod' && (
              <p style={{ color: '#64748b', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                You will pay ₹{cartTotal} in cash to the seller at the time of pickup on campus.
              </p>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }} disabled={loading || cart.length === 0}>
              {loading ? 'Processing...' : `Pay ₹${cartTotal}`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'Outfit, sans-serif' }}>Order Summary</h2>
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
            {cart.length === 0 ? (
              <p style={{ color: '#64748b' }}>Your cart is empty.</p>
            ) : (
              cart.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{item.name}</h4>
                      <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Pickup: {item.location}</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: '600' }}>₹{item.price}</span>
                </div>
              ))
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '800', borderTop: '2px solid #e2e8f0', paddingTop: '1rem' }}>
            <span>Total</span>
            <span>₹{cartTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
