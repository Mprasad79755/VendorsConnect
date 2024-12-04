import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import "./header.css";
import { Link } from "react-router-dom";

const Header = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

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
      if (data.results.length > 0) {
        setLocation((prev) => ({
          ...prev,
          address: data.results[0].formatted,
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
        <FaMapMarkerAlt className="icon-location" />
        <span className="location-text">
          {error
            ? error
            : location?.address
            ? truncateText(location.address, 25)
            : "Fetching location..."}
        </span>
      </div>

      {/* Right - Profile Icon */}
      <Link to="/user/profile">
      <div className="profile-icon">
        <span className="initials">AB</span> {/* Placeholder for initials */}
      </div>
      </Link>
    </div>
  );
};

export default Header;
