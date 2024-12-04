import React, { useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // "Vendor" or "User"
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setUserLoggedIn(true);
        await determineUserRole(user.uid); // Check which collection the user belongs to
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserLoggedIn(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Determine user role based on presence in collections
  const determineUserRole = async (uid) => {
    try {
      // Check if the user is a vendor
      const vendorDoc = await getDoc(doc(db, "vendors", uid));
      if (vendorDoc.exists()) {
        setUserRole("Vendor");
        return;
      }

      // Check if the user is a general user
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserRole("User");
        return;
      }

      // If not found in any collection
      setUserRole(null);
    } catch (error) {
      console.error("Error determining user role:", error);
    }
  };

  const value = {
    currentUser,
    userRole,
    userLoggedIn,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
