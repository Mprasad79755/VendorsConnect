import React from 'react';
import { useAuth } from './contexts/AuthContext';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = () => {
  const { userLoggedIn } = useAuth();
  const location = useLocation(); // Capture the current location

  // If not logged in, redirect to AdminLogin, passing the current location as state
  return userLoggedIn ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
