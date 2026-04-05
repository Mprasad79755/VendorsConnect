import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSignOutAlt, FaEdit } from "react-icons/fa";

const Profile = () => {
  const { currentUser, userRole } = useAuth();
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phonenumber: "",
    address: "",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchUserDetails();
      fetchCurrentLocation();
    }
  }, [currentUser]);

  const fetchUserDetails = async () => {
    try {
      const collection = userRole === "Vendor" ? "vendors" : "users";
      const userRef = doc(db, collection, currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setFormData(userSnap.data());
      }
    } catch (error) {
      console.error("Error fetching user details:", error.message);
    }
  };

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        const address = await fetchAddress(latitude, longitude);
        setFormData((prev) => ({ ...prev, address }));
      },
      (err) => console.error("Error fetching location:", err.message)
    );
  };

  const fetchAddress = async (latitude, longitude) => {
    try {
      const apiKey = "c7f9cc9dcebc47aba2c968e98472549f";
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`
      );
      const data = await response.json();
      return data.results?.[0]?.formatted || "Address not found";
    } catch {
      return "Address not available";
    }
  };

  const openEditModal = () => setIsEditModalOpen(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveUpdatedDetails = async () => {
    try {
      setLoading(true);
      const collection = userRole === "Vendor" ? "vendors" : "users";
      const userRef = doc(db, collection, currentUser.uid);
      await updateDoc(userRef, formData);
      setIsEditModalOpen(false);
    } catch (error) {
      alert("Failed to update profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh", padding: "20px" }}>
      <br /><br /><br />
      <div className="container" style={{ maxWidth: "500px" }}>
        {/* Profile Header */}
        <div style={{
          background: "linear-gradient(135deg, #a8e063, #56ab2f)",
          borderRadius: "20px 20px 0 0",
          padding: "40px 20px",
          textAlign: "center",
          color: "white",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            width: "100px",
            height: "100px",
            backgroundColor: "white",
            margin: "0 auto 15px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: "#56ab2f",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
          }}>
            {getInitials(formData.fullname)}
          </div>
          <h2 style={{ margin: 0, fontWeight: "700" }}>{formData.fullname || "User Name"}</h2>
          <p style={{ opacity: 0.9, marginBottom: 0 }}>{userRole === "Vendor" ? "Vendor Account" : "Premium Member"}</p>
        </div>

        {/* Profile Details */}
        <div style={{
          background: "white",
          borderRadius: "0 0 20px 20px",
          padding: "30px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
        }}>
          <div style={{ marginBottom: "25px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ color: "#56ab2f", marginRight: "15px", fontSize: "1.2rem" }}><FaEnvelope /></div>
              <div>
                <small style={{ color: "#888", display: "block" }}>Email Address</small>
                <span style={{ fontWeight: "600", color: "#333" }}>{formData.email || "Not Provided"}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ color: "#56ab2f", marginRight: "15px", fontSize: "1.2rem" }}><FaPhone /></div>
              <div>
                <small style={{ color: "#888", display: "block" }}>Phone Number</small>
                <span style={{ fontWeight: "600", color: "#333" }}>{formData.phonenumber || "Not Provided"}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ color: "#56ab2f", marginRight: "15px", fontSize: "1.2rem" }}><FaMapMarkerAlt /></div>
              <div>
                <small style={{ color: "#888", display: "block" }}>Residential Address</small>
                <span style={{ fontWeight: "600", color: "#333", fontSize: "0.95rem" }}>{formData.address || "Fetching..."}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <button
              onClick={openEditModal}
              style={{
                background: "white",
                border: "2px solid #56ab2f",
                color: "#56ab2f",
                padding: "12px",
                borderRadius: "12px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.3s"
              }}
            >
              <FaEdit /> Edit
            </button>
            <button
              onClick={handleLogout}
              style={{
                background: "#ff4b2b",
                border: "none",
                color: "white",
                padding: "12px",
                borderRadius: "12px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={isEditModalOpen} onHide={() => setIsEditModalOpen(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: "none", padding: "20px 20px 0" }}>
          <Modal.Title style={{ fontWeight: "700", color: "#333" }}>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "20px" }}>
          <form>
            <div className="mb-4">
              <label className="form-label" style={{ fontWeight: "600", fontSize: "0.9rem", color: "#555" }}>Full Name</label>
              <input
                type="text"
                className="form-control"
                name="fullname"
                value={formData.fullname || ""}
                onChange={handleInputChange}
                style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#f8f9fa", border: "1px solid #eee" }}
              />
            </div>
            <div className="mb-4">
              <label className="form-label" style={{ fontWeight: "600", fontSize: "0.9rem", color: "#555" }}>Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                disabled
                value={formData.email || ""}
                onChange={handleInputChange}
                style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#f8f9fa", border: "1px solid #eee" }}
              />
            </div>
            <div className="mb-4">
              <label className="form-label" style={{ fontWeight: "600", fontSize: "0.9rem", color: "#555" }}>Phone Number</label>
              <input
                type="text"
                className="form-control"
                name="phonenumber"
                value={formData.phonenumber || ""}
                onChange={handleInputChange}
                style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#f8f9fa", border: "1px solid #eee" }}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none", padding: "0 20px 20px" }}>
          <Button variant="light" onClick={() => setIsEditModalOpen(false)} style={{ borderRadius: "10px", padding: "10px 20px", fontWeight: "600" }}>
            Cancel
          </Button>
          <Button
            onClick={saveUpdatedDetails}
            disabled={loading}
            style={{ borderRadius: "10px", padding: "10px 25px", fontWeight: "600", background: "linear-gradient(135deg, #a8e063, #56ab2f)", border: "none" }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
      <br /><br /><br /><br />
    </div>
  );
};

export default Profile;
