import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import { auth } from "../firebase"; // Import Firebase config
import "react-toastify/dist/ReactToastify.css";
import "./ForgotPassword.css";
import { Link } from "react-router-dom";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading spinner

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.");
      setEmail("");
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  return (
    <div className="forgot-password-container">
      <h1>
        Reset <span>Password</span>
      </h1>
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="forgot-password-card">
        <form onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Registered Email Address"
              required
            />
          </div>
          <button
            type="submit"
            className="submit-btn"
            disabled={loading} // Disable button while loading
          >
            {loading ? <span className="spinner"></span> : "Send Reset Link"}
          </button>
        </form>

        <p>
           <Link to="/signup">Go Back</Link>
        </p>
      </div>
     
    </div>
  );
};

export default ForgotPassword;
