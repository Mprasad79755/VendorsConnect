import "./footer.css";
import { Link } from "react-router-dom";
import { FaHome, FaShoppingCart, FaUser, FaMapMarkedAlt, FaHistory, FaSearch } from "react-icons/fa";

const BottomNavbar = () => {
  return (
    <div className="bottom-navbar">
      {/* Menu Icons */}
      <Link to="/user/dashboard" style={{ textDecoration: "none" }} className="navbar-item">
        <FaHome className="icon" />
        <span className="menu-text">Home</span>
      </Link>

      <Link to="/user/track" style={{ textDecoration: "none" }} className="navbar-item">
        <FaHistory className="icon" />
        <span className="menu-text">Orders</span>
      </Link>

      {/* Floating Map Icon */}
      <Link to="/user/map" style={{ textDecoration: "none" }} className="floating-icon">
        <FaMapMarkedAlt className="icon-floating" />
      </Link>

      <Link to="/user/profile" style={{ textDecoration: "none" }} className="navbar-item">
        <FaUser className="icon" />
        <span className="menu-text">Profile</span>
      </Link>

      <Link to="/user/cart" style={{ textDecoration: "none" }} className="navbar-item">
        <FaShoppingCart className="icon" />
        <span className="menu-text">Cart</span>
      </Link>
    </div>
  );
};

export default BottomNavbar;
