import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";
import "./AuthLayout.css";
import { Link } from "react-router-dom";
import { getFirebaseErrorMessage } from "../utils/firebaseErrors";

const Signup = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phonenumber: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const inputs = [
    {
      name: "fullname",
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
      name: "phonenumber",
      placeholder: "Enter Your Mobile Number",
      type: "text",
      validate: (value) => /^[0-9]{10}$/.test(value),
      error: "Enter a valid 10-digit mobile number.",
    },
    {
      name: "password",
      placeholder: "Create Password",
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
      const { email, password, fullname, phonenumber } = formData;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      await setDoc(doc(db, "users", userId), {
        fullname,
        email,
        phonenumber,
        createdAt: new Date(),
      });

      toast.success("Account created successfully!");
      setFormData({ fullname: "", email: "", phonenumber: "", password: "" });
      setCurrentStep(0);
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="auth-branding">
        <h1>Join GroceryApp</h1>
        <p>Your favorite local farm and market goods, delivered right to your doorstep.</p>
      </div>

      <div className="auth-form-section">
        <div className="auth-form-card">
          <h2>Create Account</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-wrapper">
              <input
                type={inputs[currentStep].type}
                name={inputs[currentStep].name}
                value={formData[inputs[currentStep].name]}
                onChange={handleChange}
                placeholder={inputs[currentStep].placeholder}
                autoFocus
                required
              />
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
                  {loading ? (
                    <span className="spinner"></span>
                  ) : (
                    "Register"
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="auth-links">
            <p>Already have an account? <Link to="/login">Login Here</Link></p>
            <p>Want to sell with us? <Link to="/vendor-login">Vendor Registration</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
