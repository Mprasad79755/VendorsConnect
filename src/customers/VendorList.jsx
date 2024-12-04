import React from "react";

const VendorList = ({ type }) => {
  const vendors = [
    { id: 1, name: "Vendor A", location: "Market Road" },
    { id: 2, name: "Vendor B", location: "Main Street" },
    { id: 3, name: "Vendor C", location: "Downtown" },
  ];

  return (
    <div className="container">
      {vendors.map((vendor) => (
        <div
          key={vendor.id}
          className="card mb-3 p-3 shadow-lg animate__animated animate__fadeIn"
          style={{
            background: "linear-gradient(120deg, #f6d365, #fda085)",
            borderRadius: "12px",
          }}
        >
          <div className="card-body text-white">
            <h5 className="card-title">{vendor.name}</h5>
            <p className="card-text">📍 {vendor.location}</p>
            <button className="btn btn-sm btn-light mt-2">View Details</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VendorList;
