import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './styles/VendorHomePage.css';
import VendorHeader from './Header';

const VendorHome = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="no-access">
        <p>You are not allowed to view this page.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    );
  }

  const menuItems = [
    { title: 'Manage Products', icon: 'fas fa-boxes', route: '/vendor/manage-products' },
    { title: 'Order Requests', icon: 'fas fa-shopping-bag', route: '/vendor/orders' },
    { title: 'Profile Settings', icon: 'fas fa-user-cog', route: '/vendor/profile' },
  ];

  return (
    <>
    <VendorHeader/>
    <div className="vendor-home">
      <header className="vendor-header">
        <h1>Welcome, {currentUser.displayName || 'Vendor'}!</h1>
      </header>
      <div className="menu-grid">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="menu-item"
            onClick={() => navigate(item.route)}
          >
            <i className={`${item.icon} menu-icon`}></i>
            <p>{item.title}</p>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default VendorHome;
