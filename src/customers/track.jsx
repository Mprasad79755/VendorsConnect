import React, { useEffect, useState } from "react";

const TrackingComponent = ({ vendorLocation }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Fetch user's current location using the Geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setErrorMessage("Unable to fetch your location. Please enable GPS.");
          console.error(error);
        }
      );
    } else {
      setErrorMessage("Geolocation is not supported by your browser.");
    }
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center">Track Order</h2>
      <div className="card shadow-sm mt-3 p-3">
        <h4>Your Location</h4>
        {userLocation ? (
          <p>
            <strong>Latitude:</strong> {userLocation.latitude}
            <br />
            <strong>Longitude:</strong> {userLocation.longitude}
          </p>
        ) : (
          <p>{errorMessage || "Fetching your location..."}</p>
        )}
      </div>

      <div className="card shadow-sm mt-3 p-3">
        <h4>Vendor's Location</h4>
        {vendorLocation ? (
          <p>
            <strong>Latitude:</strong> {vendorLocation.latitude}
            <br />
            <strong>Longitude:</strong> {vendorLocation.longitude}
          </p>
        ) : (
          <p>Vendor location not available.</p>
        )}
      </div>
    </div>
  );
};

export default TrackingComponent;
