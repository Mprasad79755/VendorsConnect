import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore"; // Firebase imports
import { useNavigate } from "react-router-dom"; // For navigation
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

const RoamingVendorProfile = ({ vendor }) => {
  const [requestMessage, setRequestMessage] = useState(""); // To show feedback to the user
  const [products, setProducts] = useState([]); // State for vendor's products
  const [requestExists, setRequestExists] = useState(false); // State for existing request
  const { currentUser } = useAuth(); // Get the current user from context
  const navigate = useNavigate(); // React Router navigation hook

  // Fetch Vendor's Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("userId", "==", vendor.id) // Match vendor ID
        );
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProducts();
  }, [vendor.id]);

  // Check if a visit request already exists
  useEffect(() => {
    const checkRequestExists = async () => {
      if (!currentUser || !currentUser.uid) return;
      try {
        const q = query(
          collection(db, "visitRequests"),
          where("userId", "==", currentUser.uid),
          where("vendorId", "==", vendor.email)
        );
        const querySnapshot = await getDocs(q);
        setRequestExists(!querySnapshot.empty);
      } catch (error) {
        console.error("Error checking visit request: ", error);
      }
    };

    checkRequestExists();
  }, [currentUser, vendor.email]);

  // Handle Request Visit
  const handleRequestVisit = async () => {
    if (!currentUser || !currentUser.uid) {
      setRequestMessage("You must be logged in to send a request.");
      return;
    }

    try {
        // Get user's current location
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
  
          // Convert latitude and longitude to address using OpenCage Geocoding API
          const apiKey = "c7f9cc9dcebc47aba2c968e98472549f";
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`
          );
          const data = await response.json();
  
          if (data.results && data.results.length > 0) {
            const userAddress = data.results[0].formatted;
            
            // Add the visit request to the Firestore database
            await addDoc(collection(db, "visitRequests"), {
              userId: 125454546,
              vendorId: "vendor.email",
              timeRequested: new Date().toISOString(),
              visited: false,
              address: userAddress, // Only the address is added
            });
  
            setRequestMessage("Visit request sent successfully!");
          } else {
            setRequestMessage("Failed to fetch address. Try again.");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setRequestMessage("Unable to retrieve location. Please try again.");
        });
      } catch (error) {
        console.error("Error sending visit request:", error);
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
          <p>
            <strong>Vendor Name:</strong> {vendor.name}
          </p>
          <p>
            <strong>Timings:</strong> {vendor.timings}
          </p>
          <p>
            <strong>Contact:</strong> {vendor.phone}
          </p>
          {vendor.currentLocation && (
            <>
              <p>
                <strong>Latitude:</strong> {vendor.currentLocation.latitude}
              </p>
              <p>
                <strong>Longitude:</strong> {vendor.currentLocation.longitude}
              </p>
            </>
          )}
          {/* Request Visit Button */}
          {!requestExists ? (
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
          ) : (
            <button
              className="btn w-100 mt-3"
              style={{
                background: "linear-gradient(to right, #4caf50, #087f23)",
                color: "#fff",
                borderRadius: "8px",
              }}
              onClick={() =>
                navigate("/user/track", {
                  state: { vendorLocation: vendor.location },
                })
              }
            >
              Track Order
            </button>
          )}
          {requestMessage && <p className="mt-2">{requestMessage}</p>}
        </div>
      </div>

      {/* Vendor Products */}
      <h3 className="mt-4 text-center">Products</h3>
      <div className="d-flex overflow-auto" style={{ gap: "1rem", paddingBottom: "1rem" }}>
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="card shadow-sm"
              style={{
                minWidth: "250px",
                borderRadius: "15px",
                background: "linear-gradient(to bottom, #6a11cb, #2575fc)",
              }}
            >
              <div className="card-body text-white">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">
                  <strong>Price:</strong> ₹{product.price}
                </p>
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
