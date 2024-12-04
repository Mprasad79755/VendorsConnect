import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore"; // Adjust the Firebase import path
// import "./RoamingVendorProfile.css"; // Add your custom styles if needed
import {db} from '../firebase'
import { useAuth } from "../contexts/AuthContext";


const RoamingVendorProfile = ({ vendor, userId }) => {
  const [requestMessage, setRequestMessage] = useState(""); // To show feedback to the user
  const { currentUser, userLoggedIn } = useAuth();
const uid = currentUser.uid;
  const handleRequestVisit = async () => {
    try {
      await addDoc(collection(db, "visitRequests"), {
        userId: uid, // User ID
        vendorId: vendor.id, // Vendor ID
        timeRequested: new Date().toISOString(), // Current time
        visited: false, // Initial status
      });
      setRequestMessage("Visit request sent successfully!");
    } catch (error) {
      console.error("Error sending visit request: ", error);
      setRequestMessage("Failed to send visit request. Please try again.");
    }
  };

  return (
    <div className="container mt-4">
      {/* Vendor Details */}
      <div
        className="card shadow-sm text-white"
        style={{
          background: "linear-gradient(to bottom, #00c6ff, #0072ff)",
          borderRadius: "15px",
        }}
      >
        <div className="card-body text-center">
          <h2 className="card-title">{vendor.shopName}</h2>
          <p><strong>Vendor Name:</strong> {vendor.name}</p>
          {/* <p><strong>Location:</strong> {vendor.location}</p> */}
          <p><strong>Timings:</strong> {vendor.timings}</p>
          <p><strong>Contact:</strong> {vendor.contact}</p>
          {vendor.currentLocation && (
            <>
              <p><strong>Latitude:</strong> {vendor.currentLocation.latitude}</p>
              <p><strong>Longitude:</strong> {vendor.currentLocation.longitude}</p>
            </>
          )}
          {/* Request Visit Button */}
          <button
            className="btn w-100 mt-3"
            style={{
              background: "linear-gradient(to right, #ff512f, #dd2476)",
              color: "#fff",
              borderRadius: "8px",
            }}
            onClick={handleRequestVisit}
          >
            Request to Visit
          </button>
          {requestMessage && <p className="mt-2">{requestMessage}</p>}
        </div>
      </div>

      {/* Vendor Products */}
      <h3 className="mt-4 text-center">Products</h3>
      <div className="d-flex overflow-auto" style={{ gap: "1rem", paddingBottom: "1rem" }}>
        {vendor.products && vendor.products.length > 0 ? (
          vendor.products.map((product, index) => (
            <div
              key={index}
              className="card shadow-sm"
              style={{
                minWidth: "250px",
                borderRadius: "15px",
                background: "linear-gradient(to bottom, #6a11cb, #2575fc)",
              }}
            >
              <div className="card-body text-white">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text"><strong>Price:</strong> ₹{product.price}</p>
                <p className="card-text">{product.description}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No products available.</p>
        )}
      </div>
    </div>
  );
};

export default RoamingVendorProfile;
