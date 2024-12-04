import React, { useState } from "react";
import VendorTypeButtons from "./VendorTypeButtons";
import VendorList from "./VendorList";
import ProductList from "./ProductList";
import Header from "./Header";
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
      <br /><br /><br /><br /><br /><br /><br />

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
        <p className="mt-2" style={{ fontSize: "1rem", fontWeight:"bolder", color:"white", fontSize:"19px"}}>
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
          background: "linear-gradient(to bottom, #f8f9fa, #e0f7fa)",
          overflowY: "auto",
          maxHeight: "60vh",
        }}
      >
        <h2
          className="fw-bold text-center mb-3"
          style={{
            color: "transparent",
            backgroundImage: "linear-gradient(90deg, #ff7e5f, #feb47b)",
            WebkitBackgroundClip: "text",
          }}
        >
          Choose Vendor Type
        </h2>

        <VendorTypeButtons onSelection={handleSelection} />

        {selectedType === "roaming" && (
          <div className="mt-4">
            <h3 className="text-dark mb-3">Roaming Vendors</h3>
            <ProductList type="roaming" />
            <VendorList type="roaming" />
          </div>
        )}

        {selectedType === "fixed" && (
          <div className="mt-4">
            <h3 className="text-dark mb-3">Fixed Location Vendors</h3>
            <ProductList type="fixed" />
            <VendorList type="fixed" />
          </div>
        )}
      </div>
      <br /><br /><br /><br /><br /><br />
    </>
  );
};

export default UserDashboard;
