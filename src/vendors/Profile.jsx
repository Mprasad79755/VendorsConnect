import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import { signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";
import { FaUser, FaArrowLeft, FaEnvelope, FaPhone, FaStore, FaClock, FaInfoCircle, FaSignOutAlt, FaEdit, FaCog, FaHeadset } from "react-icons/fa";

const VendorProfilePage = () => {
  const { currentUser } = useAuth();
  const vendorId = currentUser?.uid;
  const navigate = useNavigate();

  const [vendorData, setVendorData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }

    const fetchVendorData = async () => {
      try {
        const vendorDoc = await getDoc(doc(db, "vendors", vendorId));
        if (vendorDoc.exists()) {
          setVendorData(vendorDoc.data());
          setFormData(vendorDoc.data());
        } else {
          toast.error("Vendor profile not found.");
        }
      } catch (error) {
        toast.error("Error fetching profile: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [vendorId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await updateDoc(doc(db, "vendors", vendorId), formData);
      setVendorData(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Error updating profile: " + error.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      toast.error("Logout failed: " + error.message);
    }
  };

  const getInitials = (name) => {
    if (!name) return "V";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8f9fa", minHeight: "100vh", padding: "20px" }}>
      <ToastContainer position="top-center" autoClose={3000} />
      <br /><br /><br />

      <div className="container" style={{ maxWidth: "600px" }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        {vendorData ? (
          <>
            {/* Vendor Header Card */}
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
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                fontWeight: "bold",
                color: "#56ab2f",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
              }}>
                {getInitials(vendorData.name)}
              </div>
              <h2 style={{ margin: 0, fontWeight: "700" }}>{vendorData.name || "Vendor Name"}</h2>
              <div style={{
                display: "inline-block",
                background: "rgba(255,255,255,0.2)",
                padding: "3px 12px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                marginTop: "10px",
                fontWeight: "600"
              }}>
                {vendorData.type}
              </div>
            </div>

            {/* Vendor Details Card */}
            <div style={{
              background: "white",
              borderRadius: "0 0 20px 20px",
              padding: "30px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
            }}>
              <h5 style={{ fontWeight: "700", color: "#333", marginBottom: "20px", borderBottom: "2px solid #f0f0f0", paddingBottom: "10px" }}>
                Business Information
              </h5>

              <div style={{ marginBottom: "25px" }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ color: "#56ab2f", marginRight: "18px", fontSize: "1.2rem" }}><FaEnvelope /></div>
                  <div>
                    <small style={{ color: "#888", display: "block" }}>Business Email</small>
                    <span style={{ fontWeight: "600", color: "#333" }}>{vendorData.email}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                  <div style={{ color: "#56ab2f", marginRight: "18px", fontSize: "1.2rem" }}><FaPhone /></div>
                  <div>
                    <small style={{ color: "#888", display: "block" }}>Phone Number</small>
                    <span style={{ fontWeight: "600", color: "#333" }}>{vendorData.phone}</span>
                  </div>
                </div>

                {vendorData.type === "Fixed Vendor" && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                      <div style={{ color: "#56ab2f", marginRight: "18px", fontSize: "1.2rem" }}><FaStore /></div>
                      <div>
                        <small style={{ color: "#888", display: "block" }}>Shop Name</small>
                        <span style={{ fontWeight: "600", color: "#333" }}>{vendorData.shopName}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                      <div style={{ color: "#56ab2f", marginRight: "18px", fontSize: "1.2rem" }}><FaClock /></div>
                      <div>
                        <small style={{ color: "#888", display: "block" }}>Opening Timings</small>
                        <span style={{ fontWeight: "600", color: "#333" }}>{vendorData.timings}</span>
                      </div>
                    </div>
                  </>
                )}

                <div style={{ display: "flex", alignItems: "flex-start" }}>
                  <div style={{ color: "#56ab2f", marginRight: "18px", fontSize: "1.2rem", marginTop: "4px" }}><FaInfoCircle /></div>
                  <div>
                    <small style={{ color: "#888", display: "block" }}>Additional Details</small>
                    <span style={{ fontWeight: "500", color: "#555", fontSize: "0.95rem" }}>{vendorData.additionalDetails || "No additional info provided."}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <button
                  onClick={() => setIsEditing(true)}
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
                    gap: "8px"
                  }}
                >
                  <FaEdit /> Edit Profie
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
          </>
        ) : (
          <div className="text-center p-5 bg-white rounded-3 shadow-sm">
            <p>Vendor profile not found.</p>
            <Link to="/vendor-login" className="btn btn-success">Create Profile</Link>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div style={{ position: "fixed", bottom: "30px", right: "30px", display: "flex", flexDirection: "column", gap: "15px", zIndex: 1000 }}>
        <Link to="/settings" style={{
          width: "55px", height: "55px", borderRadius: "50%", background: "white", color: "#333",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem",
          boxShadow: "0 4px 15px rgba(0,0,0,0.15)", textDecoration: "none"
        }}>
          <FaCog />
        </Link>
        <Link to="/contact" style={{
          width: "55px", height: "55px", borderRadius: "50%", background: "#56ab2f", color: "white",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)", textDecoration: "none"
        }}>
          <FaHeadset />
        </Link>
      </div>

      {/* Edit Modal */}
      <Modal show={isEditing} onHide={() => setIsEditing(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: "none", padding: "20px 20px 0" }}>
          <Modal.Title style={{ fontWeight: "700", color: "#333" }}>Edit Business Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "20px" }}>
          <form>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: "600", fontSize: "0.9rem", color: "#555" }}>Full Name</label>
              <input type="text" className="form-control" name="name" value={formData?.name || ""} onChange={handleInputChange} style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#f8f9fa" }} />
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: "600", fontSize: "0.9rem", color: "#555" }}>Phone Number</label>
              <input type="text" className="form-control" name="phone" value={formData?.phone || ""} onChange={handleInputChange} style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#f8f9fa" }} />
            </div>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: "600", fontSize: "0.9rem", color: "#555" }}>Vendor Type</label>
              <select className="form-select" name="type" value={formData?.type || ""} onChange={handleInputChange} style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#f8f9fa" }}>
                <option value="Roaming Vendor">Roaming Vendor</option>
                <option value="Fixed Vendor">Fixed Vendor</option>
              </select>
            </div>
            {formData?.type === "Fixed Vendor" && (
              <>
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: "600", fontSize: "0.9rem", color: "#555" }}>Shop Name</label>
                  <input type="text" className="form-control" name="shopName" value={formData?.shopName || ""} onChange={handleInputChange} style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#f8f9fa" }} />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: "600", fontSize: "0.9rem", color: "#555" }}>Shop Timings</label>
                  <input type="text" className="form-control" name="timings" value={formData?.timings || ""} onChange={handleInputChange} style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#f8f9fa" }} />
                </div>
              </>
            )}
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: "600", fontSize: "0.9rem", color: "#555" }}>Additional Details</label>
              <textarea className="form-control" name="additionalDetails" value={formData?.additionalDetails || ""} onChange={handleInputChange} rows="3" style={{ padding: "12px", borderRadius: "10px", backgroundColor: "#f8f9fa" }}></textarea>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none", padding: "0 20px 20px" }}>
          <Button variant="light" onClick={() => setIsEditing(false)} style={{ borderRadius: "10px", padding: "10px 20px", fontWeight: "600" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveLoading}
            style={{ borderRadius: "10px", padding: "10px 25px", fontWeight: "600", background: "linear-gradient(135deg, #a8e063, #56ab2f)", border: "none" }}
          >
            {saveLoading ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VendorProfilePage;
