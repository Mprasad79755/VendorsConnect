import React, { useState } from "react";
import VendorTypeButtons from "./VendorTypeButtons";
import VendorList from "./VendorList";
import ProductList from "./ProductList";
import Header from "./Header";
import { Link } from "react-router-dom";
import "./dashboard.css";
import { FaTruck, FaStore, FaMapMarkedAlt, FaHandHoldingUsd, FaShoppingCart, FaLeaf } from "react-icons/fa";

const UserDashboard = () => {
  const [selectedType, setSelectedType] = useState(null);

  const handleSelection = (type) => {
    setSelectedType(type);
  };

  return (
    <>
      <Header />
      {/* Hero Section */}
      <br /><br /><br /><br /><br /><br /><br /><br /><br />
      <br /><br /><br /><br /><br /><br /><br /> <br /> <br />

      <div
        className="hero-section d-flex flex-column align-items-center justify-content-center"
        style={{
          background: "linear-gradient(to bottom, #43a047, #66bb6a)",
          color: "white",
          padding: "40px 20px",
          textAlign: "center",
        }}
      >
        <h1 className="fw-bold" style={{ fontSize: "1.8rem" }}>
          Welcome to <span style={{ color: "#fff176" }}>VendorGo</span>
        </h1>
        <p className="mt-2" style={{ fontSize: "1rem", fontWeight:"bolder", color:"white", fontSize:"19px" }}>
          Explore fresh products, local vendors, and unbeatable deals.
        </p>
        <div className="hero-icons d-flex justify-content-center gap-3 mt-4">
          <div className="hero-icon-box">
            <FaLeaf className="hero-icon" />
            <p>Fresh Products</p>
          </div>
          <div className="hero-icon-box">
            <FaMapMarkedAlt className="hero-icon" />
            <p>Nearby Vendors</p>
          </div>
          <div className="hero-icon-box">
            <FaShoppingCart className="hero-icon" />
            <p>Easy Shopping</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section p-3 text-center">
        <div className="row g-3">
          <div className="col-6">
            <div className="feature-item">
              <FaTruck className="icon-feature" />
              <p className="fw-bold mt-2">Home Delivery</p>
            </div>
          </div>
          <div className="col-6">
            <div className="feature-item">
              <FaStore className="icon-feature" />
              <p className="fw-bold mt-2">Nearby Stores</p>
            </div>
          </div>
          <div className="col-6">
            <div className="feature-item">
              <FaHandHoldingUsd className="icon-feature" />
              <p className="fw-bold mt-2">Best Prices</p>
            </div>
          </div>
          <div className="col-6">
            <div className="feature-item">
              <FaShoppingCart className="icon-feature" />
              <p className="fw-bold mt-2">Secure Payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Type Selection Section */}
      <div
        className="vendor-section p-3"
        style={{
          background: "linear-gradient(to bottom, #fff8e1, #ffecb3)", // Warm yellow tones
          overflowY: "auto",
          maxHeight: "60vh",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow for a modern feel
        }}
      >
        <h2
          className="fw-bold text-center mb-3"
          style={{
            color: "transparent",
            backgroundImage: "linear-gradient(90deg, #ff8a80, #ff5252)", // Bold red-orange gradient
            WebkitBackgroundClip: "text",
          }}
        >
          Discover Vendors that Match Your Needs!
        </h2>
        <p
          className="text-center mb-4"
          style={{
            color: "#5d4037", // Earthy brown for contrast
            fontStyle: "italic",
            fontSize: "0.9rem",
          }}
        >
          Whether you're chasing fresh deals on the go or want a quick stop for essentials, we've got you covered!
        </p>

        <VendorTypeButtons onSelection={handleSelection} />

<br /><br />
<div className="d-flex justify-content-center gap-3">
      <Link
        to="/user/class"
        className="btn btn-lg btn-gradient shadow-lg"
        style={{
          background: "linear-gradient(90deg, #6a11cb, #2575fc)",
          color: "#fff",
          width: "180px",
          height: "60px",
          borderRadius: "12px",
        }}
      >
        Classes
      </Link>
      </div>


        {selectedType === "roaming" && (
          <div className="mt-4">
            <h3
              className="text-dark mb-3"
              style={{
                color: "#3e2723", // Deep brown
                fontWeight: "bold",
              }}
            >
              Roaming Vendors: Fresh Finds On the Move
            </h3>
            <p
              className="text-muted"
              style={{
                fontSize: "0.85rem",
              }}
            >
              Vendors cruising around with fresh fruits, veggies, and essentials. Perfect for doorstep convenience!
            </p>
            <ProductList type="roaming" />
            <VendorList type="roaming" />
            {/* Add button at the bottom of roaming vendors section */}
            <div className="text-center mt-4">
              <button className="classes btn btn-primary">Explore More Roaming Vendors</button>
            </div>
          </div>
        )}

        {selectedType === "fixed" && (
          <div className="mt-4">
            <h3
              className="text-dark mb-3"
              style={{
                color: "#3e2723", // Deep brown
                fontWeight: "bold",
              }}
            >
              Fixed Vendors: Your Neighborhood Essentials
            </h3>
            <p
              className="text-muted"
              style={{
                fontSize: "0.85rem",
              }}
            >
              Reliable spots with everything you need, just around the corner. Drop by anytime!
            </p>
            <ProductList type="fixed" />
            <VendorList type="fixed" />
            {/* Add button at the bottom of fixed vendors section */}
            <div className="text-center mt-4">
              <button className="classes btn btn-primary">Explore More Fixed Vendors</button>
            </div>
          </div>
        )}

        
      </div>

      <br /><br /><br /><br /><br /><br />
    </>
  );
};

export default UserDashboard;
