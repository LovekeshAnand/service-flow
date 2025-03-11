import React, { createContext, useContext, useState } from "react";
import { Alert } from "@heroui/react";

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ isVisible: false, title: "", description: "", color: "success" });

  const showAlert = (title, description, color = "success") => {
    setAlert({ isVisible: true, title, description, color });

    // Auto-hide the alert after 5 seconds
    setTimeout(() => setAlert({ ...alert, isVisible: false }), 5000);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert.isVisible && (
        <div className="fixed top-5 right-5 z-50">
          <Alert
            color={alert.color}
            description={alert.description}
            title={alert.title}
            variant="faded"
            onClose={() => setAlert({ ...alert, isVisible: false })}
          />
        </div>
      )}
    </AlertContext.Provider>
  );
};

// Custom hook to use the alert context
export const useAlert = () => useContext(AlertContext);
