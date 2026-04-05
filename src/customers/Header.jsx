import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import "./header.css";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const { currentUser, userRole } = useAuth();

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        setLocation({ latitude, longitude });
        fetchAddress(latitude, longitude);
      },
      (err) => handleGeolocationError(err)
    );
  }, []);

  const handleGeolocationError = (err) => {
    const errorMessages = {
      1: "User denied the request for Geolocation.",
      2: "Location information is unavailable.",
      3: "The request to get user location timed out.",
    };
    setError(errorMessages[err.code] || "An unknown error occurred.");
  };

  const fetchAddress = async (latitude, longitude) => {
    try {
      const apiKey = "c7f9cc9dcebc47aba2c968e98472549f";
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const components = result.components;
        
        // Try to construct a meaningful but short address
        const address = result.formatted || 
                       components.road || 
                       components.suburb || 
                       components.city || 
                       "Current Location";

        setLocation((prev) => ({
          ...prev,
          address: address,
        }));
      } else {
        setError("Address not found.");
      }
    } catch {
      setError("Failed to fetch address.");
    }
  };

  const truncateText = (text, maxLength = 20) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <div className="top-navbar">
      {/* Left - User Location */}
      <div className="location-container">
        <div className="loc-dot-wrapper">
          <FaMapMarkerAlt className="icon-location" />
          <div className="loc-pulse" />
        </div>
        <div className="loc-text-group">
          <span className="loc-label">Your Location</span>
          <span className="location-text">
            {error
              ? error
              : location?.address
                ? truncateText(location.address, 30)
                : "Detecting location..."}
          </span>
        </div>
      </div>

      {/* Right - Profile Icon */}
      <Link to="/user/profile" style={{ textDecoration: 'none' }}>
        <div className="profile-wrapper">
          <div className="profile-icon">
            <span className="initials">
              {currentUser?.displayName ? currentUser.displayName[0] : "U"}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Header;
