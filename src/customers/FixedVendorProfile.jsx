import React from "react";

const FixedVendorProfile = ({ vendor }) => {
  return (
    <div className="profile-card">
      <h2>{vendor.shopName}</h2>
      <p>{vendor.name}</p>
      {/* <p><strong>Location:</strong> {vendor.location}</p> */}
      <p><strong>Timings:</strong> {vendor.timings}</p>
      <p><strong>Contact:</strong> {vendor.phone}</p>
      {/* Add any other relevant details here */}
    </div>
  );
};

export default FixedVendorProfile;
