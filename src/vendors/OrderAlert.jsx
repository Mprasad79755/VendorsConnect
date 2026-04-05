import React, { useEffect, useState, useRef } from "react";
import { collection, onSnapshot, doc, updateDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { playAlertLoop, stopAlertLoop } from "../utils/audio";
import { FaMapMarkerAlt, FaClock, FaCheck, FaTimes, FaBell } from "react-icons/fa";
import "./styles/OrderAlert.css";

const OrderAlert = ({ isOnline }) => {
  const { currentUser } = useAuth();
  const [activeAlert, setActiveAlert] = useState(null);
  const dismissTimerRef = useRef(null);
  const seenIdsRef = useRef(new Set());

  useEffect(() => {
    if (!currentUser || !isOnline) return;

    const q = query(
      collection(db, "visitRequests"),
      where("vendorId", "==", currentUser.uid),
      orderBy("timeRequested", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = { id: change.doc.id, ...change.doc.data() };
          // Only alert for new, unaccepted, non-declined orders we haven't shown yet
          if (!data.accepted && !data.declined && !seenIdsRef.current.has(data.id)) {
            seenIdsRef.current.add(data.id);
            triggerAlert(data);
          }
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser, isOnline]);

  // Stop sound and clear timer when going offline
  useEffect(() => {
    if (!isOnline) {
      stopAlertLoop();
      setActiveAlert(null);
      clearTimeout(dismissTimerRef.current);
    }
  }, [isOnline]);

  const triggerAlert = (order) => {
    setActiveAlert(order);
    playAlertLoop();

    // Auto-dismiss after 60 seconds
    clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      dismissAlert(order.id, "timeout");
    }, 60000);
  };

  const dismissAlert = async (orderId, reason) => {
    stopAlertLoop();
    clearTimeout(dismissTimerRef.current);
    setActiveAlert(null);

    if (reason === "timeout") return;

    try {
      await updateDoc(doc(db, "visitRequests", orderId), {
        accepted: reason === "accept",
        declined: reason === "decline",
        respondedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Error updating order status:", e);
    }
  };

  if (!activeAlert) return null;

  const timeAgo = (isoTime) => {
    const diff = Math.floor((Date.now() - new Date(isoTime)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  return (
    <div className="order-alert-overlay">
      <div className="order-alert-sheet">
        {/* Pulsing bell icon */}
        <div className="alert-bell">
          <FaBell />
        </div>
        <div className="alert-badge" style={{ background: activeAlert.type === 'order' ? '#f08c00' : '#43a047' }}>
          {activeAlert.type === 'order' ? '🎁 New Delivery Order' : '🚶 New Visit Request'}
        </div>
        <h2 className="alert-title">
          {activeAlert.type === 'order' ? `${activeAlert.items?.length || 0} Items requested` : 'Customer Nearby'}
        </h2>

        <div className="alert-detail">
          <div className="alert-detail-row">
            <FaMapMarkerAlt className="detail-icon" />
            <div>
              <span className="detail-label">Location</span>
              <span className="detail-value">{activeAlert.address || "Address not provided"}</span>
            </div>
          </div>
          <div className="alert-detail-row">
            <FaClock className="detail-icon" />
            <div>
              <span className="detail-label">Requested</span>
              <span className="detail-value">{timeAgo(activeAlert.timeRequested)}</span>
            </div>
          </div>
        </div>

        <div className="alert-timer-bar">
          <div className="alert-timer-fill" />
        </div>
        <p className="alert-timer-text">Auto-dismisses in 60s</p>

        <div className="alert-actions">
          <button
            className="alert-btn-decline"
            onClick={() => dismissAlert(activeAlert.id, "decline")}
          >
            <FaTimes /> Decline
          </button>
          <button
            className="alert-btn-accept"
            onClick={() => dismissAlert(activeAlert.id, "accept")}
          >
            <FaCheck /> Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderAlert;
