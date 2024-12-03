import { useState } from 'react'
import {BrowserRouter , Route, Routes, Navigate   } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from "./PrivateRoute";
import { Link } from "react-router-dom";
import Login from './components/Login';


function App() {


  return (
    <>
          <AuthProvider>
    <BrowserRouter>
    <Routes >
    <Route element={<><PrivateRoute/></>}>
    <Route   path="/admin" element={<Login/>} exact/> 
    </Route>
    
    {/* add your paths here */}
    <Route  path="/lo" element={<Login></Login>} />

    



   
   






    </Routes>
    </BrowserRouter>
    </AuthProvider>
    </>
  )
}

export default App
