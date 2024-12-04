import React from "react";
import { Link } from "react-router-dom";
import "./footer.css";
import { FaHome, FaShoppingCart, FaUser, FaMapMarkedAlt, FaShoppingBag } from "react-icons/fa";

const BottomNavbar = () => {
  return (
    <div className="bottom-navbar">
      {/* Menu Icons */}
      <Link to="/user/dashboard" style={{textDecoration:"none"}} className="navbar-item">
        <FaHome className="icon" />
        <span className="menu-text">Home</span>
      </Link>

      <Link to="/user/buy" style={{textDecoration:"none"}} className="navbar-item">
        <FaShoppingBag className="icon" />
        <span className="menu-text">Buy Now</span>
      </Link>

      {/* Floating Map Icon */}
      <Link to="/user/map" style={{textDecoration:"none"}} className="floating-icon">
        <FaMapMarkedAlt className="icon-floating" />
      </Link>

      <Link to="/user/profile" style={{textDecoration:"none"}} className="navbar-item">
        <FaUser className="icon" />
        <span className="menu-text">Profile</span>
      </Link>

      <Link to="/user/cart" style={{textDecoration:"none"}} className="navbar-item">
        <FaShoppingCart className="icon" />
        <span className="menu-text">Cart</span>
      </Link>
    </div>
  );
};

export default BottomNavbar;
