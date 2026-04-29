import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Clock, CheckCircle, Truck, XCircle, AlertCircle, Calendar } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [rentalCountdowns, setRentalCountdowns] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    const userEmail = user ? user.email : 'guest';
    const savedOrders = JSON.parse(localStorage.getItem(`userOrders_${userEmail}`) || '[]');
    // Sort orders by date descending
    savedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    setOrders(savedOrders);
    
    // Update rental countdowns
    updateRentalCountdowns(savedOrders);
  }, []);

  // Set up interval to update countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => {
        updateRentalCountdowns(prevOrders);
        return prevOrders;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const updateRentalCountdowns = (orders) => {
    const countdowns = {};
    orders.forEach((order, idx) => {
      order.items.forEach((item, itemIdx) => {
        if (item.listingType === 'rent' && item.rentalEndDate) {
          const endDate = new Date(item.rentalEndDate);
          const now = new Date();
          const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
          const hoursLeft = Math.ceil((endDate - now) / (1000 * 60 * 60));
          countdowns[`${idx}_${itemIdx}`] = { daysLeft, hoursLeft, endDate };
        }
      });
    });
    setRentalCountdowns(countdowns);
  };

  const getStatusBadge = (status, order) => {
    switch (status) {
      case 'Active Rental':
        return <span style={{ background: '#dbeafe', color: '#1e40af', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={14} /> Active Rental</span>;
      case 'Pending':
        return <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> Pending</span>;
      case 'Shipped':
        return <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Truck size={14} /> Shipped</span>;
      case 'Completed':
        return <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={14} /> Completed</span>;
      case 'Cancelled':
        return <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><XCircle size={14} /> Cancelled</span>;
      default:
        return <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '600' }}>{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '2rem 5%' }}>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '2rem', fontSize: '1rem' }}>
        <ArrowLeft size={20} /> Back to Store
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '12px' }}>
          <Package size={32} color="#4f46e5" />
        </div>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontFamily: 'Outfit, sans-serif' }}>My Orders</h1>
          <p style={{ color: '#64748b' }}>Track and manage your recent purchases and rentals.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {orders.length === 0 ? (
          <div style={{ background: '#fff', padding: '4rem 2rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <Package size={64} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '1.5rem', color: '#475569', marginBottom: '0.5rem' }}>No orders yet</h2>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>When you buy or rent items, they will appear here.</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Start Shopping</button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <div style={{ background: '#f1f5f9', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Order Placed</div>
                    <div style={{ fontWeight: '500', color: '#1e293b' }}>{formatDate(order.date)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Total</div>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>₹{order.total}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Order ID</div>
                    <div style={{ fontWeight: '500', color: '#1e293b' }}>{order.id}</div>
                  </div>
                </div>
                <div>
                  {getStatusBadge(order.status, order)}
                </div>
              </div>

              <div style={{ padding: '1.5rem' }}>
                {order.items.map((item, index) => {
                  const countdownKey = `${orders.indexOf(order)}_${index}`;
                  const countdown = rentalCountdowns[countdownKey];
                  
                  return (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: index !== order.items.length - 1 ? '1.5rem' : '0', paddingBottom: index !== order.items.length - 1 ? '1.5rem' : '0', borderBottom: index !== order.items.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                      <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                        <img src={item.image} alt={item.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: '#0f172a' }}>{item.name}</h3>
                          <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Seller: {item.seller}</div>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'inline-block', background: item.listingType === 'rent' ? '#fef3c7' : '#f1f5f9', color: item.listingType === 'rent' ? '#d97706' : '#64748b', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                              {item.listingType === 'rent' ? 'Rental' : 'Purchase'}
                            </div>
                          </div>
                          
                          {item.listingType === 'rent' && item.rentalDays && (
                            <div style={{ background: '#eff6ff', border: '1px solid #cffafe', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: '#0369a1', fontWeight: '500' }}>
                              <Calendar size={14} style={{ display: 'inline', marginRight: '0.4rem' }} />
                              {item.rentalDays} day{item.rentalDays !== 1 ? 's' : ''} rental
                              {countdown && countdown.daysLeft > 0 ? (
                                <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#0ea5e9' }}>
                                  ⏱️ {countdown.daysLeft} day{countdown.daysLeft !== 1 ? 's' : ''} remaining
                                </div>
                              ) : countdown && countdown.daysLeft === 0 ? (
                                <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#f59e0b' }}>
                                  ⚠️ Due for return today
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '100px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a' }}>₹{item.price}{item.listingType === 'rent' ? '/day' : ''}</div>
                        {item.listingType === 'rent' && item.rentalDays && (
                          <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>× {item.rentalDays}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
