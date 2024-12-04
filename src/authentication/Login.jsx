import React, { useState } from "react";
import "./LoginPage1.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection// Firebase Auth import
import { doc, getDoc } from "firebase/firestore"; // Firestore imports
import { db } from "../firebase"; // Firebase DB import

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
    // Initialize the navigate function
    
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      toast.success("Welcome back! Login Successful!");
      console.log("User Info:", userCredential.user);
  
      // Check if the user exists in the users collection
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (userDoc.exists()) {
        // If user found in users collection, redirect to user dashboard
        navigate("/user/dashboard"); // Update the path to your user dashboard
      } else {
        // Check if the user exists in the vendors collection
        const vendorDoc = await getDoc(doc(db, "vendors", userCredential.user.uid));
        
        if (vendorDoc.exists()) {
          // If vendor found in vendors collection, redirect to vendor dashboard
          navigate("/vendor/dashboard"); // Update the path to your vendor dashboard
        } else {
          // If user is not found in either collection
          toast.error("User not found in either users or vendors collection.");
        }
      }
    } catch (error) {
      toast.error(`Login Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="login-card">
        <h2>Freshly Delivered to Your Door!</h2>
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
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="loader"></span> : "Log In"}
          </button>
        </form>
        <p>
          New here? <Link to="/signup">Create an Account</Link>
        </p>
        <p>
         <Link to="/forgot-password">Forgot Your Password?</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
