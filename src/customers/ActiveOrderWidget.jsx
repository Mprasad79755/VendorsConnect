import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaTruck, FaClock, FaCheckCircle, FaChevronRight } from "react-icons/fa";
import { playCustomerSound } from "../utils/customerAudio";
import "./active-widget.css";

const ActiveOrderWidget = () => {
  const { currentUser } = useAuth();
  const [activeReq, setActiveReq] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "visitRequests"),
      where("customerId", "==", currentUser.uid),
      where("visited", "==", false),
      where("cancelled", "==", false),
      orderBy("timeRequested", "desc"),
      limit(1)
    );

    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const data = { id: snap.docs[0].id, ...snap.docs[0].data() };
        
        // Play sound if status changed to accepted
        if (activeReq && !activeReq.accepted && data.accepted) {
          playCustomerSound("success");
        }
        
        setActiveReq(data);
      } else {
        setActiveReq(null);
      }
    });

    return () => unsub();
  }, [currentUser, activeReq?.accepted]);

  if (!activeReq) return null;

  const getStatusText = () => {
    if (activeReq.accepted) return "Order Accepted & In Progress";
    return "Waiting for Vendor to Accept";
  };

  return (
    <div className="active-order-widget" onClick={() => navigate('/user/track')}>
      <div className="widget-content">
        <div className="widget-icon-box">
          {activeReq.accepted ? <FaTruck className="moving-truck" /> : <FaClock className="pulse-clock" />}
        </div>
        <div className="widget-text">
          <span className="widget-label">{activeReq.type === 'order' ? '🎁 Active Order' : '🚶 Visit Request'}</span>
          <p className="widget-status">{getStatusText()}</p>
        </div>
        <div className="widget-action">
          <span>Track</span>
          <FaChevronRight size={12} />
        </div>
      </div>
      <div className="widget-progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: activeReq.accepted ? '60%' : '20%' }} 
        />
      </div>
    </div>
  );
};

export default ActiveOrderWidget;
