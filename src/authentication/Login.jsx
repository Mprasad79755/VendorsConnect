import React, { useState } from "react";
import "./LoginPage1.css";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = () => {
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
      console.log("User Info:", userCredential.user);
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
          New here? <a href="/signup">Create an Account</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
