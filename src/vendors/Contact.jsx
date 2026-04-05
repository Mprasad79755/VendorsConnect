import React, { useState } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";
import VendorHeader from "./Header";
import { toast, ToastContainer } from "react-toastify";

const Contact = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Support ticket created! We'll be in touch soon.");
      setLoading(false);
      e.target.reset();
    }, 1500);
  };

  const contactOptions = [
    { label: "Phone", value: "+91 7975580881", icon: <FaPhone /> },
    { label: "Email", value: "support@vendorgo.in", icon: <FaEnvelope /> },
    { label: "Location", value: "Bengaluru KA", icon: <FaMapMarkerAlt /> },
  ];

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      <VendorHeader />
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="container" style={{ maxWidth: "800px", paddingTop: "100px", paddingBottom: "40px" }}>
        <h2 style={{ fontWeight: "700", marginBottom: "10px", color: "#333", textAlign: "center" }}>Get in Touch</h2>
        <p style={{ textAlign: "center", color: "#777", marginBottom: "40px" }}>Need help with your vendor account? Our team is here to help.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>
          {contactOptions.map((option, index) => (
            <div
              key={index}
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "25px",
                textAlign: "center",
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                border: "1px solid #eee"
              }}
            >
              <div style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "#f0faf0",
                color: "#56ab2f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                margin: "0 auto 15px"
              }}>
                {option.icon}
              </div>
              <h5 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "5px" }}>{option.label}</h5>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#777" }}>{option.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background: "white", borderRadius: "25px", padding: "40px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", border: "1px solid #eee" }}>
          <h4 style={{ fontWeight: "700", marginBottom: "25px", color: "#333" }}>Send us a Message</h4>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: "600", color: "#555" }}>Name</label>
                <input
                  type="text"
                  required
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #eee", background: "#f8f9fa" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: "600", color: "#555" }}>Email</label>
                <input
                  type="email"
                  required
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #eee", background: "#f8f9fa" }}
                />
              </div>
            </div>
            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: "600", color: "#555" }}>Message</label>
              <textarea
                required
                rows="5"
                style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #eee", background: "#f8f9fa" }}
              />
            </div>
            <button
              disabled={loading}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #a8e063, #56ab2f)",
                color: "white",
                border: "none",
                padding: "15px",
                borderRadius: "12px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                cursor: "pointer"
              }}
            >
              {loading ? "Sending..." : <><FaPaperPlane /> Submit Ticket</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
