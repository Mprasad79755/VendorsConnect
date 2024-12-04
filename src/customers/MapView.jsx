import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { db } from "../firebase"; // Import Firebase configuration
import { collection, getDocs } from "firebase/firestore";
import L from 'leaflet';
import { FaMapMarkerAlt } from 'react-icons/fa'; // Icon for user location

// Function to calculate the distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const NearbyVendors = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [nearbyVendors, setNearbyVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    }

    // Fetch vendors from Firestore
    const fetchVendors = async () => {
      try {
        const vendorSnapshot = await getDocs(collection(db, "vendors"));
        const vendorData = vendorSnapshot.docs.map(doc => doc.data());
        
        // Log vendor data to debug
        console.log('Vendor Data:', vendorData);

        setVendors(vendorData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vendors: ", error);
      }
    };

    fetchVendors();
  }, []);

  useEffect(() => {
    if (userLocation && vendors.length > 0) {
      // Filter out vendors with no valid location (null)
      const filteredVendors = vendors.filter((vendor) => {
        const { location } = vendor;
        if (location && location.latitude && location.longitude) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            location.latitude,
            location.longitude
          );
          return distance <= 5; // Show vendors within 5 km
        }
        return false; // Skip vendors with null or incomplete location
      });
      setNearbyVendors(filteredVendors);
    }
  }, [userLocation, vendors]);

  return (
    <div
      style={{
       position:"absolute",
       top:"60px",
       left:"0px",
       width:"100%"
      }}
    >
      <h2
        className="text-center fw-bold"
        style={{
          
        }}
      >
        Nearby Vendors
      </h2>
      {loading ? (
        <div className="text-center">Loading map...</div>
      ) : (
        <MapContainer
          center={userLocation || [51.505, -0.09]}
          zoom={50}
          scrollWheelZoom={false}
          style={{
            width: "100%",  // Full width
            height: "100vh", // Full viewport height
            position: "absolute",
            top:"30px"
          }}
        >
          {/* TileLayer for OpenStreetMap */}
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* User Location Marker */}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>
                <FaMapMarkerAlt size={20} /> You are here
              </Popup>
            </Marker>
          )}

          {/* Vendor Markers */}
          {nearbyVendors.map((vendor, index) => {
            const { location } = vendor;
            if (location && location.latitude && location.longitude) {
              return (
                <Marker
                  key={index}
                  position={{ lat: location.latitude, lng: location.longitude }}
                  icon={L.icon({
                    iconUrl: "https://upload.wikimedia.org/wikipedia/commons/5/56/Shopping_cart_icon.svg", // Custom cart icon
                    iconSize: [30, 30], // Size of the icon
                    iconAnchor: [15, 30], // Position the icon correctly
                    popupAnchor: [0, -30] // Position the popup
                  })}
                >
                  <Popup>
                    <strong>{vendor.name}</strong><br />
                    {vendor.shopName}<br />
                    {vendor.phone}
                  </Popup>
                </Marker>
              );
            }
            return null; // Skip if no valid location
          })}
        </MapContainer>
      )}
    </div>
  );
};

export default NearbyVendors;
