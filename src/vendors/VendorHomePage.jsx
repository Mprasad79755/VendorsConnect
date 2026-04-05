import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, doc, onSnapshot, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './styles/VendorHomePage.css';
import VendorHeader from './Header';
import VendorLiveMap from './VendorLiveMap';
import {
  FaBoxOpen, FaShoppingBag, FaUserCircle, FaArrowRight,
  FaChartLine, FaCheckCircle, FaFlask, FaWallet,
  FaRoute, FaMapMarkerAlt
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';

const VendorHome = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState({ productCount: 0, pendingCount: 0, acceptedCount: 0 });
  const [testLoading, setTestLoading] = useState(false);
  const [activeOrders, setActiveOrders] = useState([]); // currently accepted & not visited

  // Sync isOnline from Firestore
  useEffect(() => {
    if (!currentUser) return;
    const vendorRef = doc(db, "vendors", currentUser.uid);
    const unsub = onSnapshot(vendorRef, (snap) => {
      if (snap.exists()) setIsOnline(!!snap.data().isOnline);
    });
    return () => unsub();
  }, [currentUser]);

  // Detect all accepted & unvisited orders (the "active deliveries")
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "visitRequests"),
      where("vendorId", "==", currentUser.uid),
      where("accepted", "==", true),
      where("visited", "==", false),
      where("cancelled", "==", false)
    );
    const unsub = onSnapshot(q, (snap) => {
      const active = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setActiveOrders(active);
    });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) fetchStats();
  }, [currentUser]);

  const fetchStats = async () => {
    try {
      const [prodSnap, visitSnap] = await Promise.all([
        getDocs(query(collection(db, "products"), where("userId", "==", currentUser.uid))),
        getDocs(query(collection(db, "visitRequests"), where("vendorId", "==", currentUser.uid))),
      ]);
      const visits = visitSnap.docs.map(d => d.data());
      setStats({
        productCount: prodSnap.size,
        pendingCount: visits.filter(v => !v.accepted && !v.declined && !v.cancelled).length,
        acceptedCount: visits.filter(v => v.accepted).length,
      });
    } catch (e) {
      console.error("Stats fetch error:", e);
    }
  };

  const triggerDummyOrder = async () => {
    if (!currentUser) return;
    setTestLoading(true);
    try {
      // Simulate a random location near the vendor (approx 100-500m)
      const latOffset = (Math.random() - 0.5) * 0.01;
      const lngOffset = (Math.random() - 0.5) * 0.01;
      
      // Get current vendor location if available, otherwise use default
      let baseLat = 12.9716;
      let baseLng = 77.5946;
      const vendorSnap = await getDocs(query(collection(db, "vendors"), where("uid", "==", currentUser.uid)));
      if (!vendorSnap.empty) {
        const loc = vendorSnap.docs[0].data().location;
        if (loc) {
          baseLat = loc.latitude;
          baseLng = loc.longitude;
        }
      }

      await addDoc(collection(db, 'visitRequests'), {
        vendorId: currentUser.uid,
        address: `${Math.floor(Math.random() * 100)}, MG Road, Bengaluru`,
        timeRequested: new Date().toISOString(),
        accepted: false,
        declined: false,
        visited: false,
        cancelled: false,
        location: {
          latitude: baseLat + latOffset,
          longitude: baseLng + lngOffset
        }
      });
    } catch (e) {
      console.error('Test order failed:', e);
    } finally {
      setTestLoading(false);
    }
  };

  const markVisited = async (orderId, type) => {
    try {
      if (type === 'delivery') playCustomerSound("success");
      await updateDoc(doc(db, "visitRequests", orderId), { 
        visited: true,
        status: 'delivered' 
      });
      toast.success(type === 'delivery' ? "Delivered! Great work 🎉" : "Marked as visited!");
    } catch {
      toast.error("Failed to update.");
    }
  };

  if (!currentUser) {
    return (
      <div className="no-access">
        <FaUserCircle size={50} color="#ccc" />
        <p>You are not allowed to view this page.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const quickActions = [
    { title: 'Products', icon: <FaBoxOpen />, route: '/vendor/manage-products', desc: 'Manage your catalog' },
    { title: 'Orders', icon: <FaShoppingBag />, route: '/vendor/order-request', desc: 'View visit requests' },
    { title: 'Earnings', icon: <FaWallet />, route: '/vendor/earnings', desc: 'View history & revenue' },
    { title: 'Profile', icon: <FaUserCircle />, route: '/vendor/profile', desc: 'Edit business info' },
  ];

  const statItems = [
    { label: 'Products', value: stats.productCount, icon: <FaChartLine />, color: '#56ab2f' },
    { label: 'Pending', value: stats.pendingCount, icon: <FaShoppingBag />, color: '#e67700' },
    { label: 'Accepted', value: stats.acceptedCount, icon: <FaCheckCircle />, color: '#228be6' },
  ];

  return (
    <div className="partner-dashboard">
      <VendorHeader />
      <ToastContainer position="top-center" autoClose={2500} />

      <div className="dashboard-body">

        {/* ── Active Orders List (Swiggy-style pinned deliveries) ── */}
        {activeOrders.length > 0 && (
          <div className="active-orders-container">
            <div className="section-title">
              <span>🚚 Active Deliveries ({activeOrders.length})</span>
            </div>
            <div className="active-orders-list">
              {activeOrders.map((order) => (
                <div key={order.id} className="active-order-card">
                  <div className="ao-header">
                    <div className="ao-pulse" />
                    <span className="ao-label">Active Delivery</span>
                  </div>
                  <div className="ao-address">
                    <FaMapMarkerAlt className="ao-pin" />
                    <p>{order.address}</p>
                  </div>
                  <div className="ao-actions">
                    <a
                      href={order.location ? `https://google.com/maps?q=${order.location.latitude},${order.location.longitude}` : `https://google.com/maps?q=${encodeURIComponent(order.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ao-btn ao-btn-nav"
                    >
                      <FaRoute /> Navigate
                    </a>
                    <button className="ao-btn ao-btn-done" onClick={() => markVisited(order.id, order.type)}>
                      <FaCheckCircle /> Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Banner */}
        <div className={`status-banner ${isOnline ? 'status-online' : 'status-offline'}`}>
          <div className="status-indicator">
            {isOnline
              ? <><span className="status-pulse" /> You are LIVE — accepting orders</>
              : <>📴 You are offline — toggle Online to start</>
            }
          </div>
        </div>

        {/* Test Order Button */}
        {isOnline && (
          <button className="test-order-btn" onClick={triggerDummyOrder} disabled={testLoading}>
            <FaFlask size={13} />
            {testLoading ? 'Sending...' : 'Simulate Incoming Order'}
          </button>
        )}

        {/* Live Map */}
        <div className="map-section">
          <div className="section-title">
            <span>📍 Your Live Location</span>
            {isOnline && <span className="section-badge">Tracking</span>}
          </div>
          <VendorLiveMap 
            isOnline={isOnline} 
            vendorName={currentUser.displayName || 'My Shop'} 
            activeOrders={activeOrders}
          />
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          {statItems.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon-box" style={{ color: s.color, background: `${s.color}15` }}>
                {s.icon}
              </div>
              <span className="stat-num">{s.value}</span>
              <span className="stat-lbl">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="section-title" style={{ marginBottom: '14px' }}>
          <span>Quick Actions</span>
        </div>
        <div className="quick-actions">
          {quickActions.map((item, i) => (
            <div key={i} className="action-card" onClick={() => navigate(item.route)}>
              <div className="action-icon">{item.icon}</div>
              <div className="action-info">
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </div>
              <FaArrowRight className="action-arrow" size={14} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default VendorHome;
