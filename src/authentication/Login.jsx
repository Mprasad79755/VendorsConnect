import React, { useState } from "react";
import "./AuthLayout.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getFirebaseErrorMessage } from "../utils/firebaseErrors";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      toast.success("Welcome back! Login Successful!");
  
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (userDoc.exists()) {
        navigate("/user/dashboard");
      } else {
        const vendorDoc = await getDoc(doc(db, "vendors", userCredential.user.uid));
        
        if (vendorDoc.exists()) {
          navigate("/vendor/dashboard");
        } else {
          toast.error("User not found in either users or vendors collection.");
        }
      }
    } catch (error) {
      toast.error(`Login Failed: ${getFirebaseErrorMessage(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="auth-branding">
        <h1>Welcome Back</h1>
        <p>Log in to access fresh groceries delivered straight from vendors to your door.</p>
      </div>

      <div className="auth-form-section">
        <div className="auth-form-card">
          <h2>Secure Login</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? <span className="loader"></span> : "Log In"}
            </button>
          </form>
          
          <div className="auth-links">
            <p>New customer? <Link to="/signup">Create an Account</Link></p>
            <p>Are you a vendor? <Link to="/vendor-login">Partner With Us</Link></p>
            <p><Link to="/forgot-password">Forgot Your Password?</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
