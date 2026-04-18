import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#1e293b', color: '#f8fafc', padding: '4rem 5% 2rem', marginTop: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        
        <div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>CampusLogistics</h2>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Your exclusive campus marketplace to buy, sell, and trade textbooks, electronics, and sports gear directly with your peers.
          </p>
          <div style={{ display: 'flex', gap: '1rem', fontWeight: 'bold' }}>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>FB</a>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>X</a>
            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>IG</a>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fff' }}>Quick Links</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.75rem' }}><Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link></li>
            <li style={{ marginBottom: '0.75rem' }}><Link to="/sell" style={{ color: '#94a3b8', textDecoration: 'none' }}>Sell an Item</Link></li>
            <li style={{ marginBottom: '0.75rem' }}><Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Login</Link></li>
            <li style={{ marginBottom: '0.75rem' }}><Link to="/signup" style={{ color: '#94a3b8', textDecoration: 'none' }}>Register</Link></li>
          </ul>
        </div>

        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#fff' }}>Contact Us</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', marginBottom: '1rem' }}>
              <MapPin size={18} color="#4f46e5" /> Vignan University, Vadlamudi
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', marginBottom: '1rem' }}>
              <Mail size={18} color="#4f46e5" /> support@campuslogistics.edu
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', marginBottom: '1rem' }}>
              <Phone size={18} color="#4f46e5" /> +91 98765 43210
            </li>
          </ul>
        </div>

      </div>
      
      <div style={{ borderTop: '1px solid #334155', paddingTop: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
        &copy; {new Date().getFullYear()} CampusLogistics. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
