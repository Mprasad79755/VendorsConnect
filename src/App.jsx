import { useState } from 'react'
import {BrowserRouter , Route, Routes, Navigate   } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from "./contexts/AppContext";
import RoleBasedRoute from "./PrivateRoute";
import { Link } from "react-router-dom";
import Login from './authentication/Login'
import Signup from './authentication/Signup';
import ForgotPassword from './authentication/ForgotPassword';
import AddProduct from './vendors/AddProduct'
import VendorHomePage from './vendors/VendorHomePage';
import VendorProfile from './vendors/Profile';
import Header from './vendors/Header';
import VendorProfilePage from './authentication/VendorProfile';
import UserDashboard from './customers/UserDashboard';
import UserProfile from './customers/UserProfile'
import UserHeader from './customers/Header'
import Footer from './customers/Footer';
import CartPage from './customers/Cart';
import Sc from './authentication/Signup';
import MapView from './customers/MapView'
import ProductCatalog from './customers/ProductCatalog';
import Class from './customers/class';
import VendorViewProfile from './customers/VendorProfile'
import VendorProfileCreation from './authentication/VendorProfile'
import Track from './customers/track'
import OrderRequest from './vendors/OrderRequest';

function App() {


  return (
    <>
    <AppProvider>
          <AuthProvider>
    <BrowserRouter>
    
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Sc/>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/vendor-login" element={<VendorProfileCreation/>} />
      


        

      {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}

      {/* Vendor-only routes */}
      <Route
        path="/vendor/*"
        element={<><Header/><RoleBasedRoute allowedRoles={["Vendor"]} ></RoleBasedRoute> </>}
      >
        <Route path="dashboard" element={<VendorHomePage/>} />
        <Route path="manage-products" element={<AddProduct/>} />
        <Route path="profile" element={<VendorProfile/>} />
        <Route path="unauthorized" element={<VendorProfile/>} />
        <Route path="order-request" element={<OrderRequest/>} />




      </Route>

      {/* General user routes */}
      <Route
        path="/user/*"
        element={<><UserHeader/><RoleBasedRoute allowedRoles={["User"]} /><Footer/></>}
      >
        <Route path="dashboard" element={<><UserDashboard/></>} />
        <Route path="profile" element={<UserProfile/>} />
        <Route path="cart" element={<CartPage/>} />
        <Route path="map" element={<MapView/>} />
        <Route path="buy" element={<ProductCatalog/>} />
        <Route path="class" element={<Class/>} />
        <Route path="vendor-profile/:vendorId" element={<VendorViewProfile/>} />
        <Route path="track" element={<Track/>} />





      </Route>
    </Routes>

    </BrowserRouter>
    </AuthProvider>
    </AppProvider>
    </>
  )
}

export default App
