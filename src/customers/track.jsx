import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { FaClock, FaCheckCircle, FaTruck, FaMapMarkerAlt, FaWalking, FaChevronRight, FaArrowLeft, FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import "./track.css";

// ── Custom Markers ──────────────────────────────────────────
const userIcon = L.divIcon({
  className: "user-marker-tracking",
  html: `<div class="marker-dot user"></div>`,
  iconSize: [20, 20],
});

const vendorIcon = L.divIcon({
  className: "vendor-marker-tracking",
  html: `<div class="marker-dot vendor"><div class="pulse"></div></div>`,
  iconSize: [24, 24],
});

// ── Map Centering Component ─────────────────────────────────
const ChangeView = ({ center }) => {
  const map = useMap();
  if (center) map.setView(center, 15);
  return null;
};

const TrackingComponent = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [vendorLiveLocation, setVendorLiveLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Fetch Request History & Active Orders
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "visitRequests"),
      where("customerId", "==", currentUser.uid),
      orderBy("timeRequested", "desc")
    );

    const unsub = onSnapshot(q, async (snap) => {
      const fetched = await Promise.all(snap.docs.map(async (d) => {
        const data = { id: d.id, ...d.data() };
        if (!data.vendorName && data.vendorId) {
          const vDoc = await getDoc(doc(db, "vendors", data.vendorId));
          if (vDoc.exists()) data.vendorName = vDoc.data().businessName || vDoc.data().shopName;
        }
        return data;
      }));
      setRequests(fetched);
      if (fetched.length > 0 && !selectedReq) {
        // Auto-select the first active order if any
        const active = fetched.find(r => !r.visited && !r.cancelled);
        setSelectedReq(active || fetched[0]);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  // 2. Track Vendor Movement in real-time
  useEffect(() => {
    if (!selectedReq || selectedReq.visited || selectedReq.cancelled) {
        setVendorLiveLocation(null);
        return;
    }

    const unsub = onSnapshot(doc(db, "vendors", selectedReq.vendorId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.location) {
          setVendorLiveLocation([data.location.latitude, data.location.longitude]);
        }
      }
    });

    return () => unsub();
  }, [selectedReq?.vendorId, selectedReq?.id]);

  const getStatusInfo = (req) => {
    if (req.cancelled) return { label: "Cancelled", color: "#fa5252", icon: <FaCheckCircle /> };
    if (req.visited) return { label: "Completed", color: "#40c057", icon: <FaCheckCircle /> };
    if (req.accepted) return { label: "In Progress", color: "#228be6", icon: <FaTruck /> };
    return { label: "Pending", color: "#fab005", icon: <FaClock /> };
  };

  if (loading) return <div className="text-center p-5 mt-5">Fetching your requests...</div>;

  const activeRequests = requests.filter(r => !r.visited && !r.cancelled);
  const pastRequests = requests.filter(r => r.visited || r.cancelled);

  return (
    <div className="track-page-wrapper">
      <div className="track-header-premium">
        <button className="back-btn-simple" onClick={() => navigate('/user/dashboard')}>
          <FaArrowLeft />
        </button>
        <h1>Track Orders</h1>
        <p>Live status and order history</p>
      </div>

      <div className="track-content-flex">
        {/* ── Left Side: Interactive Map (Only for active selected) ── */}
        <div className="track-map-container shadow-sm">
          {selectedReq && !selectedReq.visited && !selectedReq.cancelled ? (
            <MapContainer center={vendorLiveLocation || [20.5937, 78.9629]} zoom={15} className="live-track-map">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {vendorLiveLocation && (
                <Marker position={vendorLiveLocation} icon={vendorIcon}>
                  <Popup>Vendor is here</Popup>
                </Marker>
              )}
              {selectedReq.location && (
                <Marker position={[selectedReq.location.latitude, selectedReq.location.longitude]} icon={userIcon}>
                  <Popup>Delivery Destination</Popup>
                </Marker>
              )}
              {vendorLiveLocation && <ChangeView center={vendorLiveLocation} />}
            </MapContainer>
          ) : (
            <div className="map-placeholder">
              <FaMapMarkerAlt size={40} color="#ddd" />
              <p>Select an active order to track live movement</p>
            </div>
          )}
        </div>

        {/* ── Right Side: Order List ── */}
        <div className="track-list-container">
          {/* Active Orders Section */}
          <div className="track-section">
            <h3 className="section-title">Active Orders</h3>
            {activeRequests.length > 0 ? activeRequests.map((req) => {
              const status = getStatusInfo(req);
              const isSelected = selectedReq?.id === req.id;
              return (
                <div 
                  key={req.id} 
                  className={`track-card-mini shadow-sm ${isSelected ? 'selected' : ''}`}
                  onClick={() => navigate(`/user/orders/${req.id}`)}
                >
                  <div className="card-top">
                    <span className="req-type">{req.type === 'order' ? '🎁 Order' : '🚶 Visit'}</span>
                    <div className="status-badge-mini" style={{ color: status.color, background: status.color + '15' }}>
                      {status.icon} {status.label}
                    </div>
                  </div>
                  <div className="card-mid">
                    <h4>{req.vendorName || "Vendor"}</h4>
                    <p>{req.address || "Live Location"}</p>
                  </div>
                  {isSelected && (
                    <div className="progress-mini">
                      <div className="progress-fill-mini" style={{ width: req.visited ? '100%' : req.accepted ? '50%' : '15%' }}></div>
                    </div>
                  )}
                </div>
              );
            }) : <p className="empty-text">No active orders</p>}
          </div>

          {/* Past Orders Section */}
          <div className="track-section mt-4">
            <h3 className="section-title"><FaHistory size={14} /> Order History</h3>
            {pastRequests.length > 0 ? pastRequests.map((req) => {
              const status = getStatusInfo(req);
              return (
                <div key={req.id} className="track-card-past" onClick={() => navigate(`/user/orders/${req.id}`)}>
                  <div className="past-info">
                    <h4>{req.vendorName || "Vendor"}</h4>
                    <p>{new Date(req.timeRequested?.seconds * 1000).toLocaleDateString()}</p>
                  </div>
                  <div className="past-status" style={{ color: status.color }}>
                    {status.label}
                  </div>
                </div>
              );
            }) : <p className="empty-text">No previous orders</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingComponent;
