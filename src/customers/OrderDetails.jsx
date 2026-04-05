import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { FaArrowLeft, FaPhone, FaMapMarkerAlt, FaClock, FaTimes, FaTruck, FaShoppingBag, FaCheckCircle, FaChevronRight } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import L from "leaflet";
import { playCustomerSound } from "../utils/customerAudio";
import SuccessFeedback from "./SuccessFeedback";
import "./order-details.css";

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

const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, 15); }, [center, map]);
  return null;
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [vendorLiveLocation, setVendorLiveLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastStatus, setLastStatus] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    const unsub = onSnapshot(doc(db, "visitRequests", orderId), async (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setOrder(data);

        // Trigger success once when status becomes delivered
        if (data.status === 'delivered' && lastStatus !== 'delivered') {
          setShowSuccess(true);
        }
        setLastStatus(data.status);

        // Fetch vendor details once
        if (!vendor && data.vendorId) {
          const vSnap = await getDoc(doc(db, "vendors", data.vendorId));
          if (vSnap.exists()) setVendor(vSnap.data());
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [orderId, lastStatus]);

  const handleCancelOrder = async () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await updateDoc(doc(db, "visitRequests", orderId), {
          cancelled: true,
          status: 'cancelled',
          cancelledBy: 'user'
        });
        playCustomerSound("cancel");
        toast.error("Order cancelled.");
      } catch (e) {
        toast.error("Failed to cancel.");
      }
    }
  };

  // Track Vendor Movement
  useEffect(() => {
    if (!order || order.visited || order.cancelled) return;

    const unsub = onSnapshot(doc(db, "vendors", order.vendorId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.location) {
          setVendorLiveLocation([data.location.latitude, data.location.longitude]);
        }
      }
    });

    return () => unsub();
  }, [order?.vendorId]);

  if (loading) return <div className="loading-screen">Loading order details...</div>;
  if (!order) return <div className="error-screen">Order not found.</div>;

  const getStatusStep = () => {
    if (order.visited) return 4;
    if (order.status === 'shipped') return 3;
    if (order.status === 'packing') return 2;
    if (order.accepted) return 1;
    return 0;
  };

  const isCancelled = order.status === 'cancelled' || order.cancelled;
  const cancelledBy = order.cancelledBy || 'system';

  const steps = [
    { label: "Placed", icon: <FaClock /> },
    { label: "Accepted", icon: <FaCheckCircle /> },
    { label: "Packing", icon: <FaShoppingBag /> },
    { label: "Out for Delivery", icon: <FaTruck /> },
    { label: isCancelled ? "Cancelled" : "Delivered", icon: isCancelled ? <FaTimes /> : <FaCheckCircle /> }
  ];

  return (
    <div className={`order-details-page ${isCancelled ? 'state-cancelled' : ''}`}>
      <div className="order-details-header">
        <button className="back-btn-details" onClick={() => navigate('/user/track')}>
          <FaArrowLeft />
        </button>
        <div className="header-info">
          <h2>Order #{order.id.slice(-6).toUpperCase()}</h2>
          <p>{isCancelled ? `Order Cancelled by ${cancelledBy}` : (order.type === 'delivery' ? 'Delivery Order' : 'Visit Request')}</p>
        </div>
        <button className="support-btn-dummy" onClick={() => toast.info("Support will contact you soon!")}>
          Help
        </button>
      </div>

      <div className="container-details">
        {/* Progress Tracker */}
        <div className="status-timeline-card shadow-sm">
          <div className="timeline-steps">
            {steps.map((step, i) => {
              const isActive = (isCancelled && i === 4) || (!isCancelled && getStatusStep() >= i);
              return (
                <div key={i} className={`timeline-step ${isActive ? 'active' : ''} ${isCancelled && i === 4 ? 'cancelled' : ''}`}>
                  <div className="step-icon-circle">{step.icon}</div>
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
          <div className="timeline-line">
            {!isCancelled && (
              <div className="timeline-line-fill" style={{ width: `${(getStatusStep() / (steps.length - 1)) * 100}%` }} />
            )}
            {isCancelled && <div className="timeline-line-fill cancel-line" />}
          </div>
        </div>

        {/* Live Map Tracking */}
        {!isCancelled && !order.visited && (
          <div className="tracking-map-card shadow-sm">
            <MapContainer center={vendorLiveLocation || [12.9716, 77.5946]} zoom={15} style={{ height: "300px", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {vendorLiveLocation && (
                <Marker position={vendorLiveLocation} icon={vendorIcon}>
                  <Popup>Vendor is on the move!</Popup>
                </Marker>
              )}
              {order.location && (
                <Marker position={[order.location.latitude, order.location.longitude]} icon={userIcon}>
                  <Popup>Your Delivery Point</Popup>
                </Marker>
              )}
              {vendorLiveLocation && <ChangeView center={vendorLiveLocation} />}
            </MapContainer>
          </div>
        )}

        {/* Vendor & Order Details */}
        <div className="details-grid">
          <div className="vendor-info-card shadow-sm">
            <div className="vendor-profile-mini">
              <img src={vendor?.profileImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200"} alt="Vendor" />
              <div className="vendor-meta">
                <h3>{vendor?.businessName || "Your Vendor"}</h3>
                <p>{vendor?.businessType || "Neighborhood Store"}</p>
              </div>
              <a href={`tel:${vendor?.mobile || vendor?.phone || "000"}`} className="call-vendor-btn">
                <FaPhone />
              </a>
            </div>
            <div className="delivery-address-box">
              <FaMapMarkerAlt className="icon" />
              <div>
                <label>Delivering To</label>
                <p>{order.address}</p>
              </div>
            </div>

            {/* User Cancellation Action */}
            {!isCancelled && !order.visited && order.status !== 'shipped' && (
              <button className="cancel-order-large-btn" onClick={handleCancelOrder}>
                Cancel Order
              </button>
            )}
          </div>

          {order.type === 'delivery' && (
            <div className="order-items-card shadow-sm">
              <h3>Order Summary</h3>
              <div className="items-list">
                {order.items?.map((item, i) => (
                  <div key={i} className="detail-item-row">
                    <span>{item.quantity}x {item.productName}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="total-divider" />
              <div className="total-row-details">
                <span>Grand Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSuccess && (
        <SuccessFeedback
          type={order.type}
          orderId={orderId}
          onHome={() => navigate('/user/dashboard')}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

export default OrderDetails;
