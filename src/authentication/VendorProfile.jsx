import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { db, auth } from "../firebase"; // Import Firebase config
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth"; // Import the sign-in method
import "react-toastify/dist/ReactToastify.css";
import "./signup.css";
import { useNavigate } from "react-router-dom";

const VendorProfile = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "",
    shopName: "",
    timings: "",
    additionalDetails: "",
    password:"",
  });
  const [loading, setLoading] = useState(false);

  const inputs = [
    {
      name: "name",
      placeholder: "Enter Your Full Name",
      type: "text",
      validate: (value) => value.trim() !== "",
      error: "Name cannot be empty.",
    },
    {
      name: "email",
      placeholder: "Enter Your Email Address",
      type: "email",
      validate: (value) => /\S+@\S+\.\S+/.test(value),
      error: "Enter a valid email address.",
    },
    {
      name: "phone",
      placeholder: "Enter Your Mobile Number",
      type: "text",
      validate: (value) => /^[0-9]{10}$/.test(value),
      error: "Enter a valid 10-digit mobile number.",
    },
    {
      name: "type",
      placeholder: "Select Vendor Type",
      type: "select",
      options: ["Roaming Vendor", "Fixed Vendor"],
      validate: (value) => value.trim() !== "",
      error: "Please select a vendor type.",
    },
    {
      name: "shopName",
      placeholder: "Enter Shop Name (Fixed Vendor Only)",
      type: "text",
      validate: (value) =>
        formData.type === "Fixed Vendor" ? value.trim() !== "" : true,
      error: "Shop name cannot be empty for fixed vendors.",
    },
    {
      name: "timings",
      placeholder: "Enter Shop Timings (Fixed Vendor Only)",
      type: "text",
      validate: (value) =>
        formData.type === "Fixed Vendor" ? value.trim() !== "" : true,
      error: "Timings cannot be empty for fixed vendors.",
    },
    {
      name: "additionalDetails",
      placeholder: "Enter Any Additional Details",
      type: "text",
      validate: () => true,
      error: "",
    },
    {
      name: "password",
      placeholder: "Create a Password",
      type: "password",
      validate: (value) => value.length >= 6,
      error: "Password must be at least 6 characters long.",
    
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNext = () => {
    if (!inputs[currentStep].validate(formData[inputs[currentStep].name])) {
      toast.error(inputs[currentStep].error);
      return;
    }
    if (currentStep < inputs.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { name, email, phone, type, shopName, timings, additionalDetails, password } = formData;

      // Sign in with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      // Save vendor data to Firestore with the uid as the document ID
      await setDoc(doc(db, "vendors", uid), {
        uid,
        name,
        email,
        phone,
        type,
        shopName,
        timings,
        additionalDetails,
        createdAt: new Date(),
      });

      toast.success("Vendor profile created successfully!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        type: "",
        shopName: "",
        timings: "",
        additionalDetails: "",
        password:""
      });
      navigate("/vendor/dashboard")
      setCurrentStep(0);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vendor-profile-container">
      <h1>
        Vendor <span>Profile</span>
      </h1>

      <ToastContainer position="top-center" autoClose={3000} />
      <div className="vendor-profile-card">
        <h1>
          <span>Create Your Vendor Profile</span>
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="input-wrapper">
            {inputs[currentStep].type === "select" ? (
              <select
                name={inputs[currentStep].name}
                value={formData[inputs[currentStep].name]}
                onChange={handleChange}
              >
                <option value="">-- Select --</option>
                {inputs[currentStep].options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : inputs[currentStep].type === "textarea" ? (
              <textarea
                name={inputs[currentStep].name}
                value={formData[inputs[currentStep].name]}
                onChange={handleChange}
                placeholder={inputs[currentStep].placeholder}
              />
            ) : (
              <input
                type={inputs[currentStep].type}
                name={inputs[currentStep].name}
                value={formData[inputs[currentStep].name]}
                onChange={handleChange}
                placeholder={inputs[currentStep].placeholder}
                autoFocus
                required
              />
            )}
          </div>
          <div className="actions">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="action-btn prev-btn"
              >
                &#8592; Back
              </button>
            )}
            {currentStep < inputs.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="action-btn next-btn"
              >
                Next &#8594;
              </button>
            ) : (
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? <span className="spinner"></span> : "Submit"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorProfile;
