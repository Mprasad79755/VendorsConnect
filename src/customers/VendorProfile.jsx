import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { playCustomerSound } from "../utils/customerAudio";
import { toast, ToastContainer } from "react-toastify";
import { FaArrowLeft, FaMapMarkerAlt, FaWalking, FaStore, FaPhoneAlt, FaStar, FaPlus, FaShoppingCart } from "react-icons/fa";
import LocationPicker from "./LocationPicker";
import "./vendor-profile.css";

const VendorProfile = () => {
  const { vendorId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Fetch user location for visit request
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => console.warn("Location denied. Requests will use default location.")
      );
    }

    // Fetch Vendor Info
    const fetchVendor = async () => {
      try {
        const docRef = doc(db, "vendors", vendorId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVendor({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error("Vendor not found.");
        }
      } catch (e) {
        console.error(e);
      }
    };

    // Fetch Products
    const q = query(collection(db, "products"), where("userId", "==", vendorId));
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    fetchVendor();
    return () => unsub();
  }, [vendorId]);

  const handleRequestVisitClick = () => {
    if (!currentUser) return toast.info("Please login to request a visit.");
    setShowLocationPicker(true);
    playCustomerSound("pop");
  };

  const handleConfirmLocation = async ({ position, address }) => {
    setShowLocationPicker(false);
    setRequestLoading(true);

    try {
      await addDoc(collection(db, "visitRequests"), {
        vendorId: vendorId,
        customerId: currentUser.uid,
        customerName: currentUser.displayName || "Customer",
        customerPhone: currentUser.phoneNumber || "No Phone",
        address: address, // High-fidelity address
        location: { latitude: position[0], longitude: position[1] },
        timeRequested: serverTimestamp(),
        accepted: false,
        declined: false,
        visited: false,
        cancelled: false,
        type: "visit"
      });
      playCustomerSound("success");
      toast.success("Visit requested! The vendor will be notified. 🔔");
    } catch (e) {
      toast.error("Request failed. Please try again.");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    playCustomerSound("chime");
    const cart = JSON.parse(localStorage.getItem('userCart') || '[]');
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1, vendorId: vendorId });
    }
    localStorage.setItem('userCart', JSON.stringify(cart));
    toast.success(`${product.productName} added to basket!`);
  };

  if (loading || !vendor) {
    return <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-success" role="status" />
    </div>;
  }

  return (
    <div className="vendor-profile-wrapper">
      <ToastContainer position="top-center" autoClose={3000} />
      
      {/* ── Hero Banner ── */}
      <div className="profile-hero">
        <button className="back-btn-pill" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <img 
          src={vendor.coverImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200"} 
          className="cover-img" 
          alt="Cover" 
        />
        <div className="profile-overlay">
          <div className="vendor-id-card">
            <img 
              src={vendor.profileImage || "https://ui-avatars.com/api/?name=" + (vendor.businessName || "V") + "&background=random"} 
              className="vendor-avatar" 
              alt="Profile" 
            />
            <div className="vendor-info">
              <h1>{vendor.businessName || "Vendor Shop"}</h1>
              <div className="status-row">
                <div className="live-indicator">
                  <div className="live-dot" /> LIVE
                </div>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaStar color="#ff9100" /> 4.8 (120+)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Grid ── */}
      <div className="action-grid">
        <button className="action-btn primary" onClick={handleRequestVisitClick} disabled={requestLoading}>
          <FaWalking className="btn-icon" />
          <span className="btn-label">{requestLoading ? "Requesting..." : "Book a Visit"}</span>
        </button>
        <button className="action-btn" onClick={() => window.open(`tel:${vendor.phone || ''}`)}>
          <FaPhoneAlt className="btn-icon" color="#43a047" />
          <span className="btn-label">Call Vendor</span>
        </button>
      </div>

      <div className="profile-content">
        {/* About Section */}
        <div className="content-section">
          <h2>About this Vendor</h2>
          <p className="bio-text">
            {vendor.bio || `${vendor.businessName} specializes in fresh ${vendor.category || 'products'} delivered right to your neighborhood. Dedicated to quality and service.`}
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <div style={{ fontSize: '0.8rem', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaMapMarkerAlt /> {vendor.locationName || "Nearby"}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaStore /> {vendor.businessType || "Fixed"}
            </div>
          </div>
        </div>

        {/* Product Section */}
        <div className="content-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>Fresh Products</h2>
            <span style={{ fontSize: '0.8rem', color: '#43a047', fontWeight: 700 }}>In Stock Only</span>
          </div>
          
          <div className="profile-prod-grid">
            {products.length > 0 ? products.map((prod) => (
              <div key={prod.id} className={`prod-item ${!prod.inStock ? 'out-of-stock' : ''}`}>
                <img src={prod.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200"} className="prod-thumb" alt="Product" />
                <div className="prod-details">
                  <h4>{prod.productName}</h4>
                  <div className="prod-price">₹{prod.price} <small style={{ fontSize: '0.6rem', color: '#999' }}>/ {prod.unit}</small></div>
                </div>
                <button className="btn-add-mini" onClick={() => handleAddToCart(prod)}>
                  <FaPlus />
                </button>
              </div>
            )) : (
              <p className="text-center text-muted">No products listed by this vendor yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart Button (Simplified) */}
      <button 
        className="btn btn-success rounded-pill shadow-lg"
        style={{ position: 'fixed', bottom: '85px', right: '20px', zIndex: 1000, padding: '12px 24px', fontWeight: 800 }}
        onClick={() => navigate('/user/cart')}
      >
        <FaShoppingCart style={{ marginRight: '8px' }} /> View Basket
      </button>

      {showLocationPicker && (
        <LocationPicker 
          initialPosition={userLocation ? [userLocation.latitude, userLocation.longitude] : [12.9716, 77.5946]}
          onConfirm={handleConfirmLocation}
          onCancel={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  );
};

export default VendorProfile;
