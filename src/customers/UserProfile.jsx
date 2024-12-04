import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const Profile = () => {
  const { currentUser, userRole } = useAuth(); // Get currentUser and userRole from context
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phonenumber: "",
    password: "",
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

  // Fetch user details from Firestore
  const fetchUserDetails = async () => {
    try {
      const collection = userRole === "Vendor" ? "vendors" : "users";
      const userRef = doc(db, collection, currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setFormData(userSnap.data());
      } else {
        console.error("User not found in the database.");
      }
    } catch (error) {
      console.error("Error fetching user details:", error.message);
    }
  };

  // Fetch current location and set address
  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        const address = await fetchAddress(latitude, longitude);
        setFormData((prev) => ({ ...prev, address }));
      },
      (err) => {
        console.error("Error fetching location:", err.message);
        alert("Unable to fetch current location.");
      }
    );
  };

  // Fetch address from latitude and longitude
  const fetchAddress = async (latitude, longitude) => {
    try {
      const apiKey = "c7f9cc9dcebc47aba2c968e98472549f"; // Replace with your actual API key
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        return data.results[0].formatted;
      } else {
        return "Address not found";
      }
    } catch (error) {
      console.error("Error fetching address:", error.message);
      return "Address not available";
    }
  };

  // Open the edit modal
  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  // Handle input changes in the edit modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save updated user details to Firestore
  const saveUpdatedDetails = async () => {
    try {
      setLoading(true);
      const collection = userRole === "Vendor" ? "vendors" : "users";
      const userRef = doc(db, collection, currentUser.uid);
      await updateDoc(userRef, formData);
      setIsEditModalOpen(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error.message);
      alert("Failed to update profile. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully!");
      window.location.href = "/login"; // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <>
    <br /><br /><br />
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        color: "white",
      }}
    >
        <br />
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2 style={{ fontWeight: "bold" }}>My Profile</h2>
        <p style={{ fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.8)" }}>
          {userRole === "Vendor" ? "Vendor Account" : "User Account"}
        </p>
      </div>

      {/* Profile Info */}
      <div
        style={{
          background: "white",
          borderRadius: "10px",
          padding: "20px",
          color: "#333",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h4 style={{ fontWeight: "bold", marginBottom: "10px" }}>
          {formData.fullname || "User Name"}
        </h4>
        <p>Email: {formData.email || "Not Provided"}</p>
        <p>Phone: {formData.phonenumber || "Not Provided"}</p>
        <p>Address: {formData.address || "Fetching address..."}</p>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="primary"
            onClick={openEditModal}
            style={{
              background: "linear-gradient(90deg, #ff9966, #ff5e62)",
              border: "none",
            }}
          >
            Edit Profile
          </Button>
          <Button
            variant="danger"
            onClick={handleLogout}
            style={{
              background: "linear-gradient(90deg, #ff6a6a, #ff4747)",
              border: "none",
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={isEditModalOpen} onHide={() => setIsEditModalOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label htmlFor="fullname" className="form-label">
                Full Name
              </label>
              <input
                type="text"
                className="form-control"
                id="fullname"
                name="fullname"
                value={formData.fullname || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="phonenumber" className="form-label">
                Phone
              </label>
              <input
                type="text"
                className="form-control"
                id="phonenumber"
                name="phonenumber"
                value={formData.phonenumber || ""}
                onChange={handleInputChange}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setIsEditModalOpen(false)}
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={saveUpdatedDetails}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    </>
  );
};

export default Profile;
