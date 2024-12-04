import React, { useState, useEffect } from "react";

function UserLocation() {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);
//   const [api, setapi] = useState(c7f9cc9dcebc47aba2c968e98472549f)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    const successHandler = (position) => {
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
      fetchAddress(latitude, longitude);
    };

    const errorHandler = (error) => {
      let errorMessage;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "User denied the request for Geolocation.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable.";
          break;
        case error.TIMEOUT:
          errorMessage = "The request to get user location timed out.";
          break;
        default:
          errorMessage = "An unknown error occurred.";
          break;
      }
      setError(errorMessage);
    };

    navigator.geolocation.getCurrentPosition(successHandler, errorHandler);
  }, []);

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=c7f9cc9dcebc47aba2c968e98472549f`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        setAddress(data.results[0].formatted);
      } else {
        setAddress("Address not found");
      }
    } catch (err) {
      setError("Failed to fetch address");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>User Location</h2>
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          <p>Latitude: {location.latitude || "Fetching..."}</p>
          <p>Longitude: {location.longitude || "Fetching..."}</p>
          <p>Address: {address || "Fetching address..."}</p>
          {location.latitude && location.longitude && (
            <a
              href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: "10px",
                padding: "10px 15px",
                backgroundColor: "#007bff",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "5px",
              }}
            >
              Open in Google Maps
            </a>
          )}
        </>
      )}
    </div>
  );
}

export default UserLocation;
