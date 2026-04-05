import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { FaMotorcycle, FaStar, FaMapMarkerAlt, FaWalking, FaPhoneAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { playCustomerSound } from "../utils/customerAudio";
import { serverTimestamp, addDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import LocationPicker from "./LocationPicker";

// Harversine distance formula to calculate distance in KM
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

const VendorList = ({ userLocation, selectedCategory = "All" }) => {
  const { currentUser } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(null); // Track WHICH vendor is being requested
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [pendingVendor, setPendingVendor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Only show ONLINE vendors on the main list
    const q = query(
      collection(db, "vendors"),
      where("isOnline", "==", true)
    );

    const unsub = onSnapshot(q, (snap) => {
      let filtered = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Calculate distance for each vendor
      if (userLocation) {
        filtered = filtered.map(v => ({
          ...v,
          distance: v.location 
            ? calculateDistance(userLocation.latitude, userLocation.longitude, v.location.latitude, v.location.longitude)
            : "N/A"
        }));
        
        // Sort by closest distance
        filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      }

      // Filter by category if one is selected
      if (selectedCategory && selectedCategory !== "All") {
        filtered = filtered.filter(v => 
          (v.businessType && v.businessType.toLowerCase() === selectedCategory.toLowerCase()) ||
          (v.category && v.category.toLowerCase() === selectedCategory.toLowerCase())
        );
      }

      setVendors(filtered);
      setLoading(false);
    });

    return () => unsub();
  }, [userLocation, selectedCategory]);

  const handleVisit = (vendorId) => {
    playCustomerSound("pop");
    navigate(`/user/vendor-profile/${vendorId}`);
  };

  const handleRequestVisit = (vendorId, businessName) => {
    if (!currentUser) return toast.info("Please login to request a visit.");
    setPendingVendor({ id: vendorId, name: businessName });
    setShowLocationPicker(true);
    playCustomerSound("pop");
  };

  const handleConfirmLocation = async ({ position, address }) => {
    if (!pendingVendor) return;
    const { id, name } = pendingVendor;
    
    setShowLocationPicker(false);
    setRequestLoading(id);

    try {
      await addDoc(collection(db, "visitRequests"), {
        vendorId: id,
        customerId: currentUser.uid,
        customerName: currentUser.displayName || "Customer",
        customerPhone: currentUser.phoneNumber || "No Phone",
        address: address, // Precise address from geocoder
        location: { latitude: position[0], longitude: position[1] },
        timeRequested: serverTimestamp(),
        accepted: false,
        declined: false,
        visited: false,
        cancelled: false,
        type: "visit"
      });
      playCustomerSound("success");
      toast.success(`Visit requested to ${name}! 🔔`);
    } catch (e) {
      toast.error("Request failed. Please try again.");
    } finally {
      setRequestLoading(null);
      setPendingVendor(null);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-muted">Searching for vendors...</div>;
  }

  if (vendors.length === 0) {
    return (
      <div className="p-4 text-center text-muted">
        <p>No active vendors found nearby.</p>
      </div>
    );
  }

  return (
    <div className="vendor-grid">
      {vendors.map((vendor) => (
        <div key={vendor.id} className="vendor-premium-card" onClick={() => handleVisit(vendor.id)}>
          <div className="card-img-wrapper">
            <img 
              src={vendor.coverImage || "https://images.unsplash.com/photo-1488459711612-42da6adb635b?auto=format&fit=crop&q=80&w=400"} 
              alt={vendor.businessName} 
            />
            <div className="live-badge">
              <div className="live-dot" /> LIVE
            </div>
            {vendor.distance !== "N/A" && (
              <div className="dist-badge">
                <FaMotorcycle size={12} style={{ marginRight: '4px' }} />
                {vendor.distance} km
              </div>
            )}
          </div>
          
          <div className="card-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 className="text-truncate" style={{ maxWidth: '160px' }}>
                  {vendor.businessName || vendor.storeName || "Vendor Store"}
                </h3>
                <span className="category">
                  {vendor.businessType || vendor.category || "General Store"}
                </span>
              </div>
              <div className="rating-box">
                <FaStar color="#ff9100" size={14} /> 4.2
              </div>
            </div>

            <div className="card-footer">
              <div className="card-actions-row">
                <button 
                  className="btn-action-icon call" 
                  onClick={(e) => { e.stopPropagation(); window.open(`tel:${vendor.phone || ''}`); }}
                  title="Call Vendor"
                >
                  <FaPhoneAlt />
                </button>
                <button 
                  className="btn-action-icon visit" 
                  onClick={(e) => { e.stopPropagation(); handleRequestVisit(vendor.id, vendor.businessName); }}
                  disabled={requestLoading === vendor.id}
                  title="Request Visit"
                >
                  <FaWalking />
                </button>
                <button className="btn-visit" onClick={(e) => { e.stopPropagation(); handleVisit(vendor.id); }}>
                  Visit Shop
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

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

export default VendorList;
