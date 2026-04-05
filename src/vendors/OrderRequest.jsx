import React, { useEffect, useState, useMemo } from "react";
import { collection, getDocs, doc, updateDoc, orderBy, query, where, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { playCustomerSound } from "../utils/customerAudio";
import VendorHeader from "./Header";
import "./styles/OrderRequest.css";
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt, FaArrowLeft, FaCheckCircle, FaClock, FaRoute, FaCheck,
  FaTimes, FaSearch, FaSort, FaSortAmountDown, FaSortAmountUp, FaStar,
  FaBan, FaTrash, FaShoppingBag, FaFilter, FaSync, FaTruck
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";

// ── Status helpers ─────────────────────────────────────────
const getStatus = (r) => {
  if (r.declined) return "declined";
  if (r.cancelled) return "cancelled";
  if (r.visited) return "visited";
  if (r.status === "delivered") return "visited"; // reuse visited for history
  if (r.status === "shipped") return "shipped";
  if (r.status === "packing") return "packing";
  if (r.accepted) return "accepted";
  return "pending";
};

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "#e67700", bg: "#fff4e6", icon: <FaClock /> },
  accepted: { label: "Accepted", color: "#2f9e44", bg: "#ebfbee", icon: <FaCheckCircle /> },
  packing: { label: "Packing", color: "#be4bdb", bg: "#f8f0fc", icon: <FaShoppingBag /> },
  shipped: { label: "In Transit", color: "#15aabf", bg: "#e3fafc", icon: <FaTruck /> },
  visited: { label: "Delivered", color: "#1971c2", bg: "#e7f5ff", icon: <FaCheck /> },
  declined: { label: "Declined", color: "#c92a2a", bg: "#fff5f5", icon: <FaTimes /> },
  cancelled: { label: "Cancelled", color: "#868e96", bg: "#f1f3f5", icon: <FaBan /> },
};

const VisitRequests = () => {
  const { currentUser } = useAuth();
  const [visitRequests, setVisitRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first

  useEffect(() => {
    fetchVisitRequests();
  }, [currentUser]);

  const fetchVisitRequests = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, "visitRequests"),
        where("vendorId", "==", currentUser.uid),
        orderBy("timeRequested", "desc")
      );
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVisitRequests(fetched);
    } catch (error) {
      console.error("Error fetching visit requests:", error);
      toast.error("Failed to fetch requests.");
    } finally {
      setLoading(false);
    }
  };

  const updateRequest = async (requestId, fields, successMsg) => {
    try {
      await updateDoc(doc(db, "visitRequests", requestId), fields);
      toast.success(successMsg);
      setVisitRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, ...fields } : r))
      );
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Failed to update.");
    }
  };

  const deleteRequest = async (requestId) => {
    try {
      await deleteDoc(doc(db, "visitRequests", requestId));
      toast.success("Order deleted.");
      setVisitRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (error) {
      toast.error("Failed to delete.");
    }
  };

  // ── Stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const counts = { all: visitRequests.length, pending: 0, accepted: 0, visited: 0, declined: 0, cancelled: 0 };
    visitRequests.forEach((r) => { counts[getStatus(r)]++; });
    return counts;
  }, [visitRequests]);

  // ── Filtered & Sorted list ────────────────────────────────
  const displayed = useMemo(() => {
    let list = [...visitRequests];
    if (filterStatus !== "all") list = list.filter((r) => getStatus(r) === filterStatus);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((r) => (r.address || "").toLowerCase().includes(s));
    }
    list.sort((a, b) => {
      const aTime = a.timeRequested?.seconds ? a.timeRequested.toDate() : new Date(a.timeRequested);
      const bTime = b.timeRequested?.seconds ? b.timeRequested.toDate() : new Date(b.timeRequested);
      return sortOrder === "desc" ? bTime - aTime : aTime - bTime;
    });
    return list;
  }, [visitRequests, filterStatus, search, sortOrder]);

  const timeAgo = (t) => {
    if (!t) return "Just now";
    try {
      const date = t?.seconds ? t.toDate() : (t instanceof Date ? t : new Date(t));
      if (isNaN(date.getTime())) return "Just now";

      const diff = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diff < 60) return `${diff}s ago`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch (e) { return "Recent"; }
  };

  const navigate = useNavigate();

  return (
    <div className="or-page">
      <VendorHeader />
      <ToastContainer position="top-center" autoClose={2000} />

      <div className="or-container">
        {/* Header */}
        <div className="or-page-header">
          <div>
            <button className="back-btn" onClick={() => navigate(-1)}>
              <FaArrowLeft />
            </button>
            <h2 className="or-page-title">Order Requests</h2>
            <p className="or-page-sub">{stats.all} total requests</p>
          </div>
          <button className="or-refresh-btn" onClick={fetchVisitRequests} disabled={loading}>
            <FaSync className={loading ? "spin" : ""} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="or-stats-row">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              className={`or-stat-card ${filterStatus === key ? "or-stat-active" : ""}`}
              style={{ "--accent": cfg.color, "--accent-bg": cfg.bg }}
              onClick={() => setFilterStatus(filterStatus === key ? "all" : key)}
            >
              <span className="or-stat-icon">{cfg.icon}</span>
              <span className="or-stat-num">{stats[key]}</span>
              <span className="or-stat-lbl">{cfg.label}</span>
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="or-toolbar">
          <div className="or-search-wrap">
            <FaSearch className="or-search-icon" />
            <input
              className="or-search"
              placeholder="Search by address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="or-search-clear" onClick={() => setSearch("")}>
                <FaTimes size={12} />
              </button>
            )}
          </div>
          <button
            className="or-sort-btn"
            onClick={() => setSortOrder((s) => (s === "desc" ? "asc" : "desc"))}
            title={sortOrder === "desc" ? "Newest first" : "Oldest first"}
          >
            {sortOrder === "desc" ? <FaSortAmountDown /> : <FaSortAmountUp />}
          </button>
        </div>

        {/* Filter Pill (active filter label) */}
        {filterStatus !== "all" && (
          <div className="or-active-filter">
            <FaFilter size={10} />
            Showing: <strong>{STATUS_CONFIG[filterStatus].label}</strong>
            <button onClick={() => setFilterStatus("all")}><FaTimes size={10} /></button>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="or-loading">
            <div className="spinner-border text-success" role="status" />
            <p>Loading requests...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="or-empty">
            <FaShoppingBag size={44} />
            <p>{search || filterStatus !== "all" ? "No orders match your filters." : "No visit requests yet."}</p>
          </div>
        ) : (
          <div className="or-list">
            {displayed.map((req) => {
              const status = getStatus(req);
              const cfg = STATUS_CONFIG[status];
              const isPending = status === "pending";

              return (
                <div className="or-card" key={req.id}>
                  {/* Status stripe */}
                  <div className="or-stripe" style={{ background: cfg.color }} />

                  <div className="or-card-body">
                    {/* Top row */}
                    <div className="or-card-top">
                      <div className="or-address-block">
                        <div className="or-map-icon">
                          <FaMapMarkerAlt />
                        </div>
                        <div>
                          <p className="or-address">{req.address || "No address provided"}</p>
                          <p className="or-time">
                            <FaClock size={10} /> {timeAgo(req.timeRequested)} · {req.timeRequested?.seconds ? req.timeRequested.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : new Date(req.timeRequested).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          {status === 'cancelled' && (
                            <p className="or-cancelled-by-label">Cancelled by {req.cancelledBy || 'System'}</p>
                          )}
                          {req.rating && (
                            <div className="or-rating-display">
                              {[1, 2, 3, 4, 5].map(s => (
                                <FaStar key={s} color={s <= req.rating ? "#ffd700" : "#eee"} size={12} />
                              ))}
                              <span>({req.rating}/5)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="or-status-badge-wrapper">
                        <div
                          className="or-status-badge"
                          style={{ color: cfg.color, background: cfg.bg }}
                        >
                          {cfg.icon} {cfg.label}
                        </div>
                        <div className={`or-type-badge ${req.type === 'order' ? 'type-order' : 'type-visit'}`}>
                          {req.type === 'order' ? 'Order' : 'Visit'}
                        </div>
                      </div>
                    </div>

                    {/* Order Items Section */}
                    {req.type === 'order' && req.items && (
                      <div className="or-items-list-container">
                        <div className="or-items-header">Order Items</div>
                        <div className="or-items-grid">
                          {req.items.map((item, i) => (
                            <div key={i} className="or-mini-item">
                              <span className="or-mini-qty">{item.quantity}x</span>
                              <span className="or-mini-name">{item.productName}</span>
                              <span className="or-mini-price">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                          <div className="or-total-row">
                            <span>Total to collect:</span>
                            <strong>₹{req.total || 0}</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="or-card-actions">
                      {/* Directions always available */}
                      <a
                        href={req.location ? `https://google.com/maps?q=${req.location.latitude},${req.location.longitude}` : `https://google.com/maps?q=${encodeURIComponent(req.address || "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="or-btn or-btn-dir"
                      >
                        <FaRoute /> Directions
                      </a>

                      {/* Accept */}
                      {isPending && (
                        <button
                          className="or-btn or-btn-accept"
                          onClick={() => updateRequest(req.id, { accepted: true, status: 'accepted' }, "Order accepted!")}
                        >
                          <FaCheck /> Accept
                        </button>
                      )}

                      {/* Start Packing */}
                      {status === "accepted" && req.type === 'delivery' && (
                        <button
                          className="or-btn or-btn-visited"
                          style={{ background: '#be4bdb' }}
                          onClick={() => updateRequest(req.id, { status: "packing" }, "Started packing!")}
                        >
                          <FaShoppingBag /> Start Packing
                        </button>
                      )}

                      {/* Out for Delivery */}
                      {status === "packing" && (
                        <button
                          className="or-btn or-btn-visited"
                          style={{ background: '#15aabf' }}
                          onClick={() => updateRequest(req.id, { status: "shipped" }, "Out for delivery!")}
                        >
                          <FaTruck /> Handover to Delivery
                        </button>
                      )}

                      {/* Mark Delivered / Visited */}
                      {(status === "shipped" || (status === "accepted" && req.type === 'visit')) && (
                        <button
                          className="or-btn or-btn-visited"
                          onClick={() => {
                            if (req.type === 'delivery') playCustomerSound("success");
                            updateRequest(req.id, { visited: true, status: 'delivered' }, req.type === 'delivery' ? "Delivered!" : "Marked as visited!");
                          }}
                        >
                          <FaCheckCircle /> {req.type === 'delivery' ? "Mark Delivered" : "Mark Visited"}
                        </button>
                      )}

                      {/* Decline (pending only) */}
                      {isPending && (
                        <button
                          className="or-btn or-btn-decline"
                          onClick={() => updateRequest(req.id, { declined: true }, "Order declined.")}
                        >
                          <FaTimes /> Decline
                        </button>
                      )}

                      {/* Cancel (accepted only) */}
                      {(status === "accepted" || status === "packing") && (
                        <button
                          className="or-btn or-btn-cancel"
                          onClick={() => {
                            playCustomerSound("cancel");
                            updateRequest(req.id, { accepted: false, cancelled: true, status: 'cancelled', cancelledBy: 'vendor' }, "Order cancelled.");
                          }}
                        >
                          <FaBan /> Cancel
                        </button>
                      )}

                      {/* Delete (completed or declined/cancelled) */}
                      {(status === "visited" || status === "declined" || status === "cancelled") && (
                        <button
                          className="or-btn or-btn-delete"
                          onClick={() => deleteRequest(req.id)}
                        >
                          <FaTrash /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitRequests;
