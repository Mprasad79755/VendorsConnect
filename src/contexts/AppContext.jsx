// Context.js
import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [sharedVar, setSharedVar] = useState("Hello, React!");

  return (
    <AppContext.Provider value={{ sharedVar, setSharedVar }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
