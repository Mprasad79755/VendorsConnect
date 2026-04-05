import { playCustomerSound } from "../utils/customerAudio";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import "./success-feedback.css";
import { useState, useEffect } from "react";
import { FaCheckCircle, FaStar } from "react-icons/fa";

const SuccessFeedback = ({ type, orderId, onHome, onClose }) => {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    playCustomerSound("success");
    createConfetti();
  }, []);

  const handleRating = async (val) => {
    setRating(val);
    setSubmitted(true);
    if (orderId) {
      try {
        await updateDoc(doc(db, "visitRequests", orderId), { rating: val });
      } catch (e) { console.error(e); }
    }
  };

  const createConfetti = () => {
    const container = document.getElementById("confetti-container");
    if (!container) return;
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement("div");
      particle.className = "confetti-particle";
      particle.style.left = Math.random() * 100 + "vw";
      particle.style.backgroundColor = ["#43a047", "#66bb6a", "#a8e063", "#ffd700", "#ff7043"][Math.floor(Math.random() * 5)];
      particle.style.animationDelay = Math.random() * 3 + "s";
      particle.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(particle);
    }
  };

  return (
    <div className="success-overlay">
      <div id="confetti-container" className="confetti-wrapper"></div>
      <div className="success-modal animated zoom-in">
        <div className="success-icon-wrapper">
          <FaCheckCircle className="main-icon" />
          <div className="pulse-ring"></div>
        </div>

        <h2 className="success-title">Success!</h2>
        <p className="success-msg">
          {type === 'delivery'
            ? "Your neighborhood order has been delivered successfully. Enjoy your products!"
            : "The vendor visit was successful. Thank you for using VendorsConnect!"}
        </p>

        <div className="rating-box">
          <p>{submitted ? "Thanks for rating!" : "Rate your experience"}</p>
          <div className="stars">
            {[1, 2, 3, 4, 5].map(s => (
              <FaStar
                key={s}
                className={`star-icon ${rating >= s ? 'active' : ''}`}
                onClick={() => !submitted && handleRating(s)}
              />
            ))}
          </div>
        </div>

        <div className="success-actions">
          <button className="btn-success-home" onClick={onHome}>
            Back to Marketplace
          </button>
          <button className="btn-success-details" onClick={onClose}>
            View Order Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessFeedback;
