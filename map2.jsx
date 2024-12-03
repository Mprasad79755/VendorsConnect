import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom hook to handle resizing
const ResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize(); // Recalculate map size on render
  }, [map]);
  return null;
};

function UserLocation() {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);
  const [vendors, setVendors] = useState([
    { name: "Vendor 1", latitude: 12.9716, longitude: 77.5946 },
    { name: "Vendor 2", latitude: 12.9611, longitude: 77.6387 },
  ]);

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
            <div style={{ marginTop: "20px", height: "500px", width: "100%" }}>
              <h3>Map</h3>
              <MapContainer
                center={[location.latitude, location.longitude]}
                zoom={25}
                style={{ height: "100%", width: "100%" }}
              >
                <ResizeHandler />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {/* Customer Marker */}
                <Marker position={[location.latitude, location.longitude]}>
                  <Popup>You are here</Popup>
                </Marker>
                {/* Vendor Markers */}
                {vendors.map((vendor, index) => (
                  <Marker key={index} position={[vendor.latitude, vendor.longitude]}>
                    <Popup>{vendor.name}</Popup>
                  </Marker>
                ))}
                {/* Draw path between customer and vendors */}
                {vendors.map((vendor, index) => (
                  <Polyline
                    key={index}
                    positions={[
                      [location.latitude, location.longitude],
                      [vendor.latitude, vendor.longitude],
                    ]}
                    color="blue"
                  />
                ))}
              </MapContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default UserLocation;
