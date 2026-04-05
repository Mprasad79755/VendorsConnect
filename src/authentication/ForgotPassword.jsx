import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import { auth } from "../firebase";
import "react-toastify/dist/ReactToastify.css";
import "./AuthLayout.css";
import { Link } from "react-router-dom";
import { getFirebaseErrorMessage } from "../utils/firebaseErrors";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Check your inbox.");
      setEmail("");
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
        <h1>Account Recovery</h1>
        <p>Don't worry, we'll help you get back to your fresh groceries in no time.</p>
      </div>

      <div className="auth-form-section">
        <div className="auth-form-card">
          <h2>Reset Password</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-wrapper">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Registered Email Address"
                required
              />
            </div>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : "Send Reset Link"}
            </button>
          </form>

          <div className="auth-links">
            <p>Remembered your password? <Link to="/login">Back to Login</Link></p>
            <p>Don't have an account? <Link to="/signup">Register Now</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
