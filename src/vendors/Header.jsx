import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, updateDoc, getDoc, collection, query, where, onSnapshot, updateDoc as firestoreUpdate } from "firebase/firestore";
import { db } from "../firebase";
import "./styles/VendorHeader.css";
import { Link } from "react-router-dom";
import { FaPowerOff, FaWifi, FaBell, FaMapMarkerAlt, FaClock, FaCheck, FaTimes } from "react-icons/fa";
import { playStatusSound, playAlertLoop, stopAlertLoop } from "../utils/audio";

const VendorHeader = () => {
  const { currentUser } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [watcherId, setWatcherId] = useState(null);

  // Order alert state (global — persists across all pages)
  const [activeAlert, setActiveAlert] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const seenIdsRef = useRef(new Set());
  const dismissTimerRef = useRef(null);

  // ── Location helpers ───────────────────────────────────────
  const updateLocation = async (latitude, longitude) => {
    try {
      await updateDoc(doc(db, "vendors", currentUser.uid), {
        location: { latitude, longitude },
      });
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const startLocationWatcher = () => {
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation(latitude, longitude);
      },
      (error) => console.error("Error watching location:", error),
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    setWatcherId(id);
  };

  const stopLocationWatcher = () => {
    if (watcherId !== null) {
      navigator.geolocation.clearWatch(watcherId);
      setWatcherId(null);
    }
  };

  // ── Online toggle ─────────────────────────────────────────
  const toggleOnlineStatus = async () => {
    if (!currentUser) return;
    setLoading(true);
    playStatusSound("click");

    if (!isOnline) {
      try {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await updateDoc(doc(db, "vendors", currentUser.uid), {
              isOnline: true,
              location: { latitude, longitude },
            });
            setIsOnline(true);
            startLocationWatcher();
            playStatusSound("online");
            setLoading(false);
          },
          () => {
            alert("Please enable location services to go online.");
            setLoading(false);
          }
        );
      } catch {
        setLoading(false);
      }
    } else {
      try {
        await updateDoc(doc(db, "vendors", currentUser.uid), {
          isOnline: false,
          location: null,
        });
        setIsOnline(false);
        stopLocationWatcher();
        stopAlertLoop();
        setActiveAlert(null);
        playStatusSound("offline");
        setLoading(false);
      } catch {
        setLoading(false);
      }
    }
  };

  // ── Restore online status on mount ───────────────────────
  useEffect(() => {
    if (!currentUser) return;
    const restore = async () => {
      try {
        const snap = await getDoc(doc(db, "vendors", currentUser.uid));
        if (snap.exists() && snap.data().isOnline) {
          setIsOnline(true);
          startLocationWatcher();
        }
      } catch (e) {
        console.error("Failed to restore online status:", e);
      }
    };
    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Cleanup watcher on unmount
  useEffect(() => {
    return () => {
      if (watcherId !== null) navigator.geolocation.clearWatch(watcherId);
    };
  }, [watcherId]);

  // ── Global real-time order listener ──────────────────────
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "visitRequests"),
      where("vendorId", "==", currentUser.uid),
      where("accepted", "==", false),
      where("declined", "==", false)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      // Update pending count (orders not yet accepted/declined/cancelled)
      const pending = snapshot.docs.filter(
        (d) => !d.data().cancelled && !d.data().visited
      );
      setPendingCount(pending.length);

      // Trigger alert for new arriving docs
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = { id: change.doc.id, ...change.doc.data() };
          if (!seenIdsRef.current.has(data.id)) {
            seenIdsRef.current.add(data.id);
            // Only alert if vendor is online
            setIsOnline((online) => {
              if (online) triggerAlert(data);
              return online;
            });
          }
        }
      });
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const triggerAlert = (order) => {
    setActiveAlert(order);
    playAlertLoop();
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
      console.error("Error updating order:", e);
    }
  };

  const timeAgo = (t) => {
    const diff = Math.floor((Date.now() - new Date(t)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  return (
    <>
      <header className="vendor-header fixed-top shadow-sm">
        <div className="container d-flex justify-content-between align-items-center">
          <Link to="/vendor/dashboard" className="vendor-title" style={{ textDecoration: "none" }}>
            VendorGo
          </Link>

          {/* Pending orders badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {pendingCount > 0 && (
              <div className="pending-badge">
                <FaBell size={14} />
                <span>{pendingCount}</span>
              </div>
            )}

            <button
              className={`btn-toggle ${isOnline ? "online" : "offline"}`}
              onClick={toggleOnlineStatus}
              disabled={loading}
            >
              {loading ? (
                <span>Updating...</span>
              ) : isOnline ? (
                <>
                  <div className="pulse-dot"></div>
                  <span>Online</span>
                  <FaWifi size={14} />
                </>
              ) : (
                <>
                  <FaPowerOff size={14} />
                  <span>Go Online</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Global Order Alert Bottom Sheet ── */}
      {activeAlert && (
        <div className="order-alert-overlay">
          <div className="order-alert-sheet">
            <div className="alert-bell"><FaBell /></div>
            <div className="alert-badge">New Order!</div>
            <h2 className="alert-title">Customer Nearby</h2>

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
              <button className="alert-btn-decline" onClick={() => dismissAlert(activeAlert.id, "decline")}>
                <FaTimes /> Decline
              </button>
              <button className="alert-btn-accept" onClick={() => dismissAlert(activeAlert.id, "accept")}>
                <FaCheck /> Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VendorHeader;
