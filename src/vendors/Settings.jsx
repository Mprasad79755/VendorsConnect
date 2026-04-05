import React from "react";
import { FaUser, FaBell, FaShieldAlt, FaQuestionCircle, FaAngleRight } from "react-icons/fa";
import VendorHeader from "./Header";

const Settings = () => {
  const sections = [
    { title: "Account", icon: <FaUser />, desc: "Update your profile and account info" },
    { title: "Notifications", icon: <FaBell />, desc: "Manage your alert preferences" },
    { title: "Privacy & Security", icon: <FaShieldAlt />, desc: "Password and security settings" },
    { title: "Help & Support", icon: <FaQuestionCircle />, desc: "Get help with your account" },
  ];

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh" }}>
      <VendorHeader />
      <div className="container" style={{ maxWidth: "600px", paddingTop: "100px", paddingBottom: "40px" }}>
        <h2 style={{ fontWeight: "700", marginBottom: "30px", color: "#333" }}>Settings</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {sections.map((section, index) => (
            <div
              key={index}
              style={{
                background: "white",
                borderRadius: "15px",
                padding: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                cursor: "pointer",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "12px",
                  background: "#f0faf0",
                  color: "#56ab2f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem"
                }}>
                  {section.icon}
                </div>
                <div>
                  <h5 style={{ margin: 0, fontSize: "1rem", fontWeight: "600" }}>{section.title}</h5>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#777" }}>{section.desc}</p>
                </div>
              </div>
              <FaAngleRight color="#ccc" />
            </div>
          ))}
        </div>

        <div style={{ marginTop: "40px", padding: "20px", background: "#fff0f0", borderRadius: "15px", border: "1px solid #ffebeb" }}>
          <h5 style={{ color: "#ff4b2b", fontSize: "1rem", fontWeight: "600" }}>Danger Zone</h5>
          <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "15px" }}>Permanently delete your account and all associated data.</p>
          <button style={{
            background: "#ff4b2b",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "10px",
            fontWeight: "600",
            fontSize: "0.9rem"
          }}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
