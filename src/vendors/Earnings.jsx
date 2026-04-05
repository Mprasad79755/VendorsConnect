import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "./styles/Earnings.css";
import { 
  FaWallet, FaCheckCircle, FaTimesCircle, FaHourglassHalf, 
  FaChartBar, FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt 
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Earnings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    visited: 0,
    declined: 0,
    cancelled: 0,
    acceptanceRate: 0,
    estimatedEarnings: 0
  });

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "visitRequests"),
      where("vendorId", "==", currentUser.uid),
      orderBy("timeRequested", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const allOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(allOrders);

      // Calculate Stats
      const total = allOrders.length;
      const accepted = allOrders.filter(o => o.accepted).length;
      const visited = allOrders.filter(o => o.visited).length;
      const declined = allOrders.filter(o => o.declined).length;
      const cancelled = allOrders.filter(o => o.cancelled).length;
      
      // Assume a flat rate per visited order for "Earnings" (e.g. ₹50)
      // Or just show total accepted count as a proxy for business volume
      const estimatedEarnings = visited * 50; 

      const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

      setStats({
        total,
        accepted,
        visited,
        declined,
        cancelled,
        acceptanceRate,
        estimatedEarnings
      });
      setLoading(false);
    }, (error) => {
      console.error("Error fetching earnings data:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusBadge = (order) => {
    if (order.cancelled) return <span className="badge cancelled">Cancelled</span>;
    if (order.visited) return <span className="badge visited">Completed</span>;
    if (order.declined) return <span className="badge declined">Declined</span>;
    if (order.accepted) return <span className="badge accepted">Accepted</span>;
    return <span className="badge pending">Pending</span>;
  };

  return (
    <div className="earnings-container">
      <div className="earnings-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <h1>Earnings & History</h1>
      </div>

      <div className="earnings-summary">
        <div className="earnings-card main-card">
          <div className="earnings-icon">
            <FaWallet />
          </div>
          <div className="earnings-info">
            <span className="label">Estimated Revenue</span>
            <span className="amount">₹{stats.estimatedEarnings}</span>
            <span className="subtext">Based on {stats.visited} completed visits</span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-mini-card">
            <span className="stat-val">{stats.acceptanceRate}%</span>
            <span className="stat-lab">Acceptance</span>
          </div>
          <div className="stat-mini-card">
            <span className="stat-val">{stats.total}</span>
            <span className="stat-lab">Total Leads</span>
          </div>
          <div className="stat-mini-card">
            <span className="stat-val">{stats.visited}</span>
            <span className="stat-lab">Deliveries</span>
          </div>
        </div>
      </div>

      <div className="history-section">
        <div className="section-title">
          <FaCalendarAlt /> Recent Activity
        </div>

        {loading ? (
          <div className="loader">Loading history...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <FaHourglassHalf size={40} />
            <p>No order history yet.</p>
          </div>
        ) : (
          <div className="history-list">
            {orders.map(order => (
              <div key={order.id} className="history-item">
                <div className="item-top">
                  <span className="item-date">{formatDate(order.timeRequested)}</span>
                  {getStatusBadge(order)}
                </div>
                <div className="item-body">
                  <FaMapMarkerAlt className="icon" />
                  <p className="address">{order.address}</p>
                </div>
                {order.respondedAt && (
                  <div className="item-footer">
                    Responded: {formatDate(order.respondedAt)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Earnings;
