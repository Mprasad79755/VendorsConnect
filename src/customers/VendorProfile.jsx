import React, { useEffect, useState } from "react";
import {  doc, getDoc } from "firebase/firestore"; // Adjust path to your Firebase config
import FixedVendorProfile from "./FixedVendorProfile"; // Fixed vendor profile component
import RoamingVendorProfile from "./RoamingVendorProfile"; // Roaming vendor profile component
import { useParams } from "react-router-dom"; // For getting the vendor ID from URL
import { auth, db } from "../firebase"; // Import Firebase config

const VendorProfile = () => {
  const { vendorId } = useParams(); // Get the vendor ID from the URL
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the vendor details based on the vendorId
  const fetchVendor = async () => {
    try {
      const vendorRef = doc(db, "vendors", vendorId); 
      
      // Reference to the vendor document in Firestore
      const vendorDoc = await getDoc(vendorRef);
      if (vendorDoc.exists()) {
        setVendor(vendorDoc.data());
      } else {
        console.log("No such vendor found!");
      }
    } catch (error) {
      console.error("Error fetching vendor: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendor();
  }, [vendorId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!vendor) {
    return <p>Vendor not found.</p>;
  }
 
  return (
    <div className="container">
      {vendor.type === "Fixed Vendor" ? (
        <FixedVendorProfile vendor={vendor} />
      ) : (
        <RoamingVendorProfile vendor={vendor} />
      )}
    </div>
  );
};

export default VendorProfile;
