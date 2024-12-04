import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // Firebase configuration
import "./styles/VendorHeader.css"; // Make sure to import your CSS
import { Link } from "react-router-dom";

const VendorHeader = () => {
  const { currentUser } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [watcherId, setWatcherId] = useState(null);

  const updateLocation = async (latitude, longitude) => {
    try {
      await updateDoc(doc(db, "vendors", currentUser.uid), {
        location: {
          latitude,
          longitude,
        },
      });
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const startLocationWatcher = () => {
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation(latitude, longitude);
      },
      (error) => {
        console.error("Error watching location:", error);
        alert("Failed to get location updates. Please enable location services.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
      }
    );
    setWatcherId(id);
  };

  const stopLocationWatcher = () => {
    if (watcherId !== null) {
      navigator.geolocation.clearWatch(watcherId);
      setWatcherId(null);
    }
  };

  const toggleOnlineStatus = async () => {
    if (!currentUser) {
      alert("You are not logged in!");
      return;
    }

    setLoading(true);

    if (!isOnline) {
      // Go online and start watching location
      try {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            await updateDoc(doc(db, "vendors", currentUser.uid), {
              isOnline: true,
              location: {
                latitude,
                longitude,
              },
            });

            setIsOnline(true);
            startLocationWatcher();
            setLoading(false);
          },
          (error) => {
            alert("Failed to get location. Please enable location services.");
            console.error("Error getting location:", error);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Error updating online status:", error);
        setLoading(false);
      }
    } else {
      // Go offline and stop watching location
      try {
        await updateDoc(doc(db, "vendors", currentUser.uid), {
          isOnline: false,
          location: null,
        });

        setIsOnline(false);
        stopLocationWatcher();
        setLoading(false);
      } catch (error) {
        console.error("Error updating online status:", error);
      }
    }
  };

  useEffect(() => {
    return () => stopLocationWatcher(); // Cleanup on component unmount
  }, []);

  return (
    <header className="vendor-header navbar navbar-expand-lg navbar-light bg-light fixed-top">
      <div className="container">
        <a className="navbar-brand" href="#">
          <Link to="/vendor/dashboard" style={{textDecoration:"none"}}> VendorGo</Link>
        </a>
        <button
          className={`btn btn-toggle ${isOnline ? "btn-danger" : "btn-success"}`}
          onClick={toggleOnlineStatus}
          disabled={loading}
        >
          {loading ? "Updating..." : isOnline ? "Go Offline" : "Go Online"}
        </button>
      </div>
    </header>
  );
};

export default VendorHeader;
