import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { FaMapMarkerAlt, FaCheck, FaTimes, FaLocationArrow } from "react-icons/fa";
import { toast } from "react-toastify";
import "./location-picker.css";

const LocationPicker = ({ onConfirm, onCancel, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition || [12.9716, 77.5946]);
  const [address, setAddress] = useState("Fetching address...");
  const [resolving, setResolving] = useState(false);

  // Reverse geocoding using Nominatim (OSM)
  const resolveAddress = async (lat, lng) => {
    setResolving(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      setAddress(data.display_name || "Unknown Location");
    } catch (e) {
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setResolving(false);
    }
  };

  useEffect(() => {
    resolveAddress(position[0], position[1]);
  }, [position]);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });

    return (
      <Marker 
        position={position} 
        draggable={true} 
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const pos = marker.getLatLng();
            setPosition([pos.lat, pos.lng]);
          }
        }}
      />
    );
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  };

  return (
    <div className="location-picker-overlay">
      <div className="location-picker-card animated slide-up">
        <div className="picker-header">
          <h3>Confirm Delivery Location</h3>
          <p>Drag the pin to your exact doorstep</p>
        </div>

        <div className="picker-map-container">
          <MapContainer center={position} zoom={16} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker />
          </MapContainer>
          <button className="current-loc-btn" onClick={getUserLocation}>
            <FaLocationArrow />
          </button>
        </div>

        <div className="picker-footer">
          <div className="resolved-address">
            <FaMapMarkerAlt className="icon" />
            <div className="address-text">
              <label>Delivery To:</label>
              <p>{resolving ? "Locating..." : address}</p>
            </div>
          </div>

          <div className="picker-actions">
            <button className="btn-cancel-loc" onClick={onCancel}>
              <FaTimes /> Cancel
            </button>
            <button className="btn-confirm-loc" onClick={() => onConfirm({ position, address })}>
              <FaCheck /> Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
