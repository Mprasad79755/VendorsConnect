import React, { useContext, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext"; // Context for vendorId
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth"; // Firebase Auth import
import { auth } from "../firebase"; // Firebase authentication import

const VendorProfilePage = () => {
  const { currentUser } = useAuth(); // Get currentUser from context
  const vendorId = currentUser?.uid; // Ensure we access the correct field from currentUser

  const [vendorData, setVendorData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) {
      toast.error("No vendor ID found!");
      setLoading(false);
      return;
    }

    const fetchVendorData = async () => {
      try {
        const vendorDoc = await getDoc(doc(db, "vendors", vendorId));
        if (vendorDoc.exists()) {
          setVendorData(vendorDoc.data());
          setFormData(vendorDoc.data()); // Pre-fill form data with current vendor data
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

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "vendors", vendorId), formData);
      setVendorData(formData); // Update the displayed data
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <ToastContainer position="top-center" autoClose={3000} />
      {vendorData ? (
        <div className="card shadow-sm" style={{ borderRadius: '15px' }}>
          <div className="card-header bg-light text-dark" style={{ borderRadius: '15px 15px 0 0' }}>
            <h3 className="card-title">Vendor Profile</h3>
          </div>
          <div className="card-body">
            <div className="profile-info">
              <p><strong>Name:</strong> {vendorData.name}</p>
              <p><strong>Email:</strong> {vendorData.email}</p>
              <p><strong>Phone:</strong> {vendorData.phone}</p>
              <p><strong>Type:</strong> {vendorData.type}</p>
              {vendorData.type === "Fixed Vendor" && (
                <>
                  <p><strong>Shop Name:</strong> {vendorData.shopName}</p>
                  <p><strong>Timings:</strong> {vendorData.timings}</p>
                </>
              )}
              <p><strong>Additional Details:</strong> {vendorData.additionalDetails}</p>
              <div className="d-flex justify-content-between mt-4">
                <button
                  className="btn btn-primary w-48"
                  style={{
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    padding: '12px',
                  }}
                  onClick={handleEditClick}
                >
                  Edit Profile
                </button>
                <button
                  className="btn btn-danger w-48"
                  style={{
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    padding: '12px',
                  }}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p>Vendor data not available.</p>
        </div>
      )}

      {isEditing && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Profile</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsEditing(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="Roaming Vendor">Roaming Vendor</option>
                      <option value="Fixed Vendor">Fixed Vendor</option>
                    </select>
                  </div>
                  {formData.type === "Fixed Vendor" && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Shop Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="shopName"
                          value={formData.shopName}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Timings</label>
                        <input
                          type="text"
                          className="form-control"
                          name="timings"
                          value={formData.timings}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Additional Details</label>
                    <textarea
                      className="form-control"
                      name="additionalDetails"
                      value={formData.additionalDetails}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Button */}
      <Link
        to="/settings"
        className="btn btn-light rounded-circle shadow-lg position-fixed bottom-6 right-6 p-4"
        style={{
          fontWeight: "bold",
          fontSize: "16px",
          zIndex: "10",
        }}
      >
        Settings
      </Link>

      {/* Contact Button */}
      <Link
        to="/contact"
        className="btn btn-light rounded-circle shadow-lg position-fixed bottom-6 left-6 p-4"
        style={{
          fontWeight: "bold",
          fontSize: "16px",
          zIndex: "10",
        }}
      >
        Contact
      </Link>
    </div>
  );
};

export default VendorProfilePage;
