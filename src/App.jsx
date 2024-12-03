import { useState } from 'react'
import {BrowserRouter , Route, Routes, Navigate   } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from "./contexts/AppContext";
import PrivateRoute from "./PrivateRoute";
import { Link } from "react-router-dom";
import Login from './authentication/Login'
import Signup from './authentication/Signup';


function App() {


  return (
    <>
    <AppProvider>
          <AuthProvider>
    <BrowserRouter>
    <Routes >
    <Route element={<><PrivateRoute/></>}>
    <Route   path="/admin" element={<Login/>} exact/> 
    </Route>
    
    {/*paths*/}
    <Route  path="/login" element={<Login/>} />
    <Route  path="/signup" element={<Signup/>} />


    </Routes>
    </BrowserRouter>
    </AuthProvider>
    </AppProvider>
    </>
  )
}

export default App
