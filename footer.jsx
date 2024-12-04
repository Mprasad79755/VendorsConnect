import React, { useState } from 'react';
import './footer.css'; // Add your custom styles in a separate CSS file for better management
import Header from '../components/header';

const Footer = () => {
    return (
      <footer className="footer">
        <Header></Header>
        <div className="footer-icon">
          <i className="fas fa-home"></i>
          <span>Home</span>
        </div>
        <div className="footer-icon">
          <i className="fas fa-shopping-cart"></i>
          <span>Cart</span>
        </div>
        <div className="footer-icon">
          <i className="fas fa-credit-card"></i>
          <span>Payment</span>
        </div>
        <div className="footer-icon">
          <i className="fas fa-chalkboard-teacher"></i>
          <span>Category</span>
        </div>
      </footer>
    );
  };
  export default Footer;