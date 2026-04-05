import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { db } from "../firebase"; // Import Firebase configuration
import { useMap } from "react-leaflet";
import { FaMapMarkerAlt, FaStore, FaWalking, FaChevronRight, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { onSnapshot, query, where, getDocs, collection } from "firebase/firestore";
import "./map-view.css";

// Function to calculate the distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const NearbyVendors = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Custom pulsing vendor icon
  const vendorIcon = L.divIcon({
    className: "custom-map-marker",
    html: `
      <div class="marker-pulse-wrapper">
        <div class="marker-pin-svg">
          <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </div>
        <div class="marker-pulse"></div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -40]
  });

  // User location icon
  const userIcon = L.divIcon({
    className: "user-map-marker",
    html: `<div class="user-ping"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  useEffect(() => {
    // 1. Get User Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 12.9716, lng: 77.5946 }) // Fallback Bengaluru
      );
    }

    // 2. Fetch LIVE Vendors (Firestore Snapshot)
    const q = query(
      collection(db, "vendors"),
      where("isOnline", "==", true)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVendors(data);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="map-page-wrapper">
      <div className="map-header-overlay">
        <div className="header-left">
          <button className="map-back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          <div className="map-header-title">
            <h3>Market Live</h3>
          </div>
        </div>
        <div className="header-right">
          <p className="vendor-status-pill">
            <span className="live-dot-mini" /> {vendors.length} Online
          </p>
        </div>
      </div>

      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={16}
        zoomControl={false}
        className="leaflet-full-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        {/* User Marker */}
        {userLocation && (
          <>
            <MapFlyTo position={userLocation} />
            <Marker position={userLocation} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>
          </>
        )}

        {/* Vendor Markers */}
        {vendors.map((v) => (
          v.location && (
            <Marker
              key={v.id}
              position={[v.location.latitude, v.location.longitude]}
              icon={vendorIcon}
            >
              <Popup className="premium-map-popup">
                <div className="shop-popup-card">
                  <img src={v.coverImage || "https://images.unsplash.com/photo-1488459711612-42da6adb635b?auto=format&fit=crop&q=80&w=200"} alt="Shop" />
                  <div className="popup-info">
                    <h4>{v.businessName || v.shopName}</h4>
                    <span className="popup-category">{v.businessType || "Store"}</span>
                    <button className="btn-go-profile" onClick={() => navigate(`/user/vendor-profile/${v.id}`)}>
                      Visit Shop <FaChevronRight size={10} />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {/* Floating Info Section */}
      <div className="map-bottom-drawer">
        <div className="drawer-handle" />
        <div className="drawer-content">
          <h4>Nearby Online Vendors</h4>
          <div className="drawer-scroll">
            {vendors.length > 0 ? vendors.map(v => (
              <div key={v.id} className="drawer-shop-item" onClick={() => navigate(`/user/vendor-profile/${v.id}`)}>
                <div className="item-img-box">
                  <img src={v.profileImage || "https://ui-avatars.com/api/?name=" + v.businessName + "&background=random"} alt="V" />
                </div>
                <div className="item-text">
                  <h5>{v.businessName}</h5>
                  <p>{v.locationName || "Nearby"}</p>
                </div>
                <FaArrowRight color="#43a047" />
              </div>
            )) : (
              <div className="empty-drawer-msg">
                <p>No vendors are online in your area right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



// Component to handle smooth zooming on user location
const MapFlyTo = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position?.lat && position?.lng) {
      map.flyTo([position.lat, position.lng], 16, {
        animate: true,
        duration: 1.5
      });
    }
  }, [position, map]);

  return null;
};



export default NearbyVendors;
