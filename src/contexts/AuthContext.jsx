import React, { useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setcurrentUser] = useState();
  const [userLoggedIn, setuserLoggedIn] = useState(false);
  const [loading, setloading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);

    return () => unsubscribe();
  }, []);

  async function initializeUser(user) {
    if (user) {
      setcurrentUser(user);
      setuserLoggedIn(true);
    } else {
      setcurrentUser(null);
      setuserLoggedIn(false);
    }
    setloading(false);
  }

  const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
      if (currentUser) {
        resolve(currentUser);
      } else {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          setcurrentUser(user);
          resolve(user);
        });
      }
    });
  };

  const value = {
    currentUser,
    userLoggedIn,
    loading,
    getCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
