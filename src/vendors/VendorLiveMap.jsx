import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { FaMapMarkerAlt, FaWifi, FaCrosshairs } from "react-icons/fa";
import "leaflet/dist/leaflet.css";
import "./styles/VendorLiveMap.css";

// Fix Leaflet default icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom green vendor icon
const vendorIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      background: linear-gradient(135deg, #a8e063, #56ab2f);
      width: 44px; height: 44px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(86,171,47,0.5);
    ">
      <div style="
        transform: rotate(45deg);
        display: flex; align-items: center; justify-content: center;
        width: 100%; height: 100%;
        font-size: 20px;
      ">🛒</div>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -48],
});

// Custom blue customer icon
const customerIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      background: linear-gradient(135deg, #4facfe, #00f2fe);
      width: 36px; height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(79,172,254,0.5);
    ">
      <div style="
        transform: rotate(45deg);
        display: flex; align-items: center; justify-content: center;
        width: 100%; height: 100%;
        font-size: 16px;
      ">📍</div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -40],
});

// Component to fly to new location on update
const MapFlyTo = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 17, { animate: true, duration: 1.2 });
    }
  }, [position]);
  return null;
};

const VendorLiveMap = ({ isOnline, vendorName, activeOrders = [] }) => {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const watcherRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    // Get initial position immediately
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(Math.round(pos.coords.accuracy));
      },
      () => {},
      { enableHighAccuracy: true }
    );

    // Watch for live updates
    watcherRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setAccuracy(Math.round(pos.coords.accuracy));
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => {
      if (watcherRef.current) {
        navigator.geolocation.clearWatch(watcherRef.current);
      }
    };
  }, []);

  const defaultCenter = position || [12.9716, 77.5946]; // Bengaluru fallback

  return (
    <div className="vendor-map-wrapper">
      {/* Live indicator badge */}
      <div className={`map-status-badge ${isOnline ? "badge-online" : "badge-offline"}`}>
        {isOnline ? (
          <><span className="live-dot" /> Live Tracking</>
        ) : (
          <><FaWifi style={{ opacity: 0.5 }} /> Offline — Map Paused</>
        )}
      </div>

      {/* Accuracy chip */}
      {isOnline && accuracy && (
        <div className="map-accuracy-chip">
          <FaCrosshairs size={10} /> ±{accuracy}m
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={16}
        zoomControl={false}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />

        {position && (
          <>
            <MapFlyTo position={position} />
            <Marker position={position} icon={vendorIcon}>
              <Popup>
                <div style={{ textAlign: "center", fontFamily: "Poppins, sans-serif" }}>
                  <strong>{vendorName || "You are here"}</strong><br />
                  <small style={{ color: "#56ab2f" }}>
                    {isOnline ? "🟢 Online & Visible" : "🔴 Offline"}
                  </small>
                </div>
              </Popup>
            </Marker>

            {/* Render Active Order Markers */}
            {activeOrders.map((order) => (
              order.location && (
                <Marker 
                  key={order.id} 
                  position={[order.location.latitude, order.location.longitude]} 
                  icon={customerIcon}
                >
                  <Popup>
                    <div style={{ textAlign: "center", fontFamily: "Poppins, sans-serif" }}>
                      <strong>Customer Order</strong><br />
                      <small>{order.address}</small><br />
                      <button 
                        style={{ 
                          marginTop: '8px', 
                          padding: '4px 8px', 
                          background: '#4facfe', 
                          border: 'none', 
                          borderRadius: '4px', 
                          color: 'white', 
                          fontSize: '10px',
                          cursor: 'pointer'
                        }}
                        onClick={() => window.open(`https://google.com/maps?q=${order.location.latitude},${order.location.longitude}`)}
                      >
                        Navigate
                      </button>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}
          </>
        )}

        {!position && (
          <div className="map-loading">
            <FaMapMarkerAlt size={30} color="#56ab2f" />
            <p>Fetching your location...</p>
          </div>
        )}
      </MapContainer>

      {/* Offline overlay */}
      {!isOnline && (
        <div className="map-offline-overlay">
          <div className="offline-card">
            <div className="offline-icon">📍</div>
            <h3>You're Offline</h3>
            <p>Go Online to become visible to customers and start receiving orders.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorLiveMap;
