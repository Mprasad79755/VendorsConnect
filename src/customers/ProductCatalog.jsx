import React, { useEffect, useState } from "react";
import {  collection, getDocs, query, where } from "firebase/firestore"; // Adjust path to your Firebase config
import { Link } from "react-router-dom"; // Make sure to import Bootstrap CSS
import "./prod.css"; // For additional styling if needed.
import { auth, db } from "../firebase"; // Import Firebase config


const VendorPage = () => {
  const [fixedVendors, setFixedVendors] = useState([]);
  const [roamingVendors, setRoamingVendors] = useState([]);
  
  // Fetch vendors from Firebase
  const fetchVendors = async () => {
    try {
      const vendorRef = collection(db, "vendors"); // Your Firestore collection name
      const vendorQuery = query(vendorRef,  where("isOnline", "==", true)); // Filter by isActive and isOnline
      const vendorSnapshot = await getDocs(vendorQuery);
      
      let fixed = [];
      let roaming = [];

      vendorSnapshot.forEach((doc) => {
        const vendorData = doc.data();
        if (vendorData.type === "Fixed Vendor") {
          fixed.push({ id: doc.id, ...vendorData });
        } else if (vendorData.type === "Roaming Vendor") {
          roaming.push({ id: doc.id, ...vendorData });
        }
      });

      setFixedVendors(fixed);
      setRoamingVendors(roaming);
    } catch (error) {
      console.error("Error fetching vendors: ", error);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <div className="vendor-page container-fluid p-4">
        <br /><br /><br /><br /><br /><br /><br /><br /><br />
        <br /><br /><br /><br /><br /><br /><br /><br /><br />
        <br />

      {/* Search Bar */}
      <div className="row justify-content-center mt-4">
        <button className="btn btn-dark col-12 col-md-6 col-lg-4 search-btn">
          Search
        </button>
      </div>

      {/* Fixed Vendors Section */}
      <section className="vendor-section mt-5">
        <h2 className="section-title text-center">
          🛍️ Explore Our Fixed Vendors!
          <br />
          Find Your Favorite Spot Today!
        </h2>
        <div className="row overflow-auto gy-4 d-flex flex-nowrap custom-scroll">
          {fixedVendors.length > 0 ? (
            fixedVendors.map((vendor) => (
              <div key={vendor.id} className="col-12 col-sm-6 col-md-4 col-lg-3 flex-shrink-0">
                <div className="card vendor-card shadow-sm" style={{ borderRadius: "10px", background: "linear-gradient(135deg, #e0f7fa, #80deea)" }}>
                  <div className="card-header text-white" style={{ background: "linear-gradient(to bottom, #009688, #00796b)", borderRadius: "10px 10px 0 0" }}>
                    <h5 className="card-title">{vendor.shopName}</h5>
                    <p className="card-text">{vendor.name}</p>
                  </div>
                  <div className="card-body">
                    <p className="card-text">{vendor.timings}</p>
                    <Link
                      to={`/user/vendor-profile/${vendor.id}`}
                      className="btn btn-dark w-100"
                      style={{ borderRadius: "8px" }}
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
                <br />
              </div>
            ))
          ) : (
            <p className="text-center">No active fixed vendors available.</p>
          )}
        </div>
      </section>

      {/* Division (for separation) */}
      <hr className="divider" />

      {/* Roaming Vendors Section */}
      <section className="vendor-section mt-5">
        <h2 className="section-title text-center">
          🚚 Meet Our Roaming Vendors!
          <br />
          Bringing Fresh Goods Right To Your Door!
        </h2>
        <div className="row overflow-auto gy-4 d-flex flex-nowrap custom-scroll">
          {roamingVendors.length > 0 ? (
            roamingVendors.map((vendor) => (
              <div key={vendor.id} className="col-12 col-sm-6 col-md-4 col-lg-3 flex-shrink-0">
                <div className="card vendor-card shadow-sm" style={{ borderRadius: "10px", background: "linear-gradient(135deg, #f1f8e9, #c8e6c9)" }}>
                  <div className="card-header text-white" style={{ background: "linear-gradient(to bottom, #388e3c, #2c6e2d)", borderRadius: "10px 10px 0 0" }}>
                    <h5 className="card-title">{vendor.shopName}</h5>
                    <p className="card-text">{vendor.name}</p>
                  </div>
                  <div className="card-body">
                    <p className="card-text">{vendor.timings}</p>
                    <Link
                      to={`/user/vendor-profile/${vendor.id}`}
                      className="btn btn-dark w-100"
                      style={{ borderRadius: "8px" }}
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
                <br /><br /><br /><br /><br /><br /><br />
              </div>
            ))
          ) : (
            <p className="text-center">No active roaming vendors available.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default VendorPage;
