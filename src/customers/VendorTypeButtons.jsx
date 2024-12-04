import React from "react";

const VendorTypeButtons = ({ onSelection }) => {
  return (
    <div className="d-flex justify-content-center gap-3">
      <button
        onClick={() => onSelection("roaming")}
        className="btn btn-lg btn-gradient shadow-lg"
        style={{
          background: "linear-gradient(90deg, #6a11cb, #2575fc)",
          color: "#fff",
          width: "180px",
          height: "60px",
          borderRadius: "12px",
        }}
      >
        Roaming Vendors
      </button>
      <button
        onClick={() => onSelection("fixed")}
        className="btn btn-lg btn-gradient shadow-lg"
        style={{
          background: "linear-gradient(90deg, #ff7e5f, #feb47b)",
          color: "#fff",
          width: "180px",
          height: "60px",
          borderRadius: "12px",
        }}
      >
        Fixed Vendors
      </button>
    </div>
  );
};

export default VendorTypeButtons;
