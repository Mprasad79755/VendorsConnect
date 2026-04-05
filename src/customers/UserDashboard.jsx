import React, { useState, useEffect } from "react";
import Header from "./Header";
import VendorList from "./VendorList";
import ProductList from "./ProductList";
import { Link } from "react-router-dom";
import "./dashboard.css";
import { 
  FaSearch, FaUtensils, FaLeaf, FaShoppingBasket, 
  FaCookie, FaIceCream, FaRunning, FaHistory,
  FaArrowRight, FaHome, FaStore, FaShoppingCart, FaUser, FaMapMarkerAlt
} from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import { playCustomerSound } from "../utils/customerAudio";

const CATEGORIES = [
  { id: "All", label: "All", icon: <FaRunning /> },
  { id: "Fruits", label: "Fruits", icon: <FaLeaf /> },
  { id: "Vegetables", label: "Vegetables", icon: <FaShoppingBasket /> },
  { id: "Dairy", label: "Dairy", icon: <FaIceCream /> },
  { id: "Bakery", label: "Bakery", icon: <FaCookie /> },
  { id: "Grocery", label: "Grocery", icon: <FaUtensils /> },
];

const UserDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Get user geolocation for proximity sorting
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => console.warn("Location permission denied. Sorting by distance disabled.")
      );
    }
  }, []);

  const handleCategoryClick = (id) => {
    playCustomerSound("pop");
    setSelectedCategory(id);
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} />
      {/* ── Swiggy/Zomato Hero Section ── */}
      <div className="customer-hero">
        <h1 className="hero-title">Healthy & Fresh</h1>
        <p className="hero-subtitle">Discover nearby vendors delivering to your doorstep</p>
        
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search fruits, veggies, or shops..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── Category Scroller ── */}
      <div className="category-scroller">
        {CATEGORIES.map((cat) => (
          <div 
            key={cat.id} 
            className={`cat-chip ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat.id)}
          >
            <span style={{ marginRight: '8px' }}>{cat.icon}</span>
            {cat.label}
          </div>
        ))}
      </div>

      <div className="section-body">
        
        {/* ── Live Near You Section ── */}
        <div className="section-head">
          <h2>Live Near You</h2>
          <Link to="/user/map" className="view-all">View Map <FaMapMarkerAlt size={10} /></Link>
        </div>
        <VendorList 
          userLocation={userLocation} 
          selectedCategory={selectedCategory === "All" ? null : selectedCategory} 
        />

        <br /><br />

        {/* ── Fresh Products Section ── */}
        <div className="section-head">
          <h2>Explore Today's Fresh Picks</h2>
          <Link to="/user/buy" className="view-all">See All <FaArrowRight size={10} /></Link>
        </div>
        <ProductList selectedCategory={selectedCategory} />

      </div>
    </>
  );
};

export default UserDashboard;
