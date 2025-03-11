import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useAlert } from "./AlertProvider"; // Make sure this path is correct

const LoginPopup = ({ isOpen, onClose, onLoginSuccess, setUser }) => {
  const [loginType, setLoginType] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const modalRef = useRef(null);
  const { showAlert } = useAlert();

  // Reset form when popup closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && isOpen) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const resetForm = () => {
    setLoginType(null);
    setFormData({
      email: "",
      password: "",
    });
    setErrorMessage("");
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
  
    const API_BASE = "http://localhost:8000/api/v1";
    const loginUrl =
      loginType === "user"
        ? `${API_BASE}/users/login`
        : `${API_BASE}/services/login`;
  
    if (!formData.email.trim() || !formData.password) {
      setErrorMessage("⚠️ Email and password are required.");
      showAlert("Warning", "Email and password are required.", "warning");
      return;
    }
  
    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });
  
      const responseData = await response.json();
  
      if (response.ok && responseData.data) {
        // Handle different response structures for user and service login
        let userData;
        const accessToken = responseData.data.accessToken;
        
        if (loginType === "user") {
          userData = responseData.data.user;
        } else {
          userData = responseData.data.service;
          // For services, add isService flag if it doesn't exist
          if (userData) {
            userData.isService = true;
          }
        }
        
        // Verify we have user data before proceeding
        if (!userData) {
          console.error("No user/service data in response:", responseData);
          setErrorMessage("Login successful but user data is missing.");
          showAlert("Error", "Login successful but user data is missing.", "error");
          return;
        }
  
        if (accessToken) {
          localStorage.setItem("token", accessToken);
        }
        
        // Store in localStorage
        localStorage.setItem("profile", JSON.stringify(userData));
        
        console.log("Successfully logged in as:", loginType);
        console.log("User data:", userData);
  
        // Call both callbacks with the user data
        if (setUser) {
          setUser(userData); // Update state immediately in Navbar
        }
        
        if (onLoginSuccess) {
          onLoginSuccess(userData); // Pass the user data to the callback
        }
        
        showAlert("Success", "Login successful!", "success");
        resetForm();
        onClose();
      } else {
        setErrorMessage(responseData.message || "❌ Login failed. Check your credentials and try again.");
        showAlert("Error", responseData.message || "Login failed. Check your credentials and try again.", "error");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      setErrorMessage("Something went wrong. Please try again.");
      showAlert("Error", "Something went wrong. Please try again.", "error");
    }
  };
  
  const inputClasses = "rounded-2xl px-4 py-3 w-full border-green-100 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50";
  const buttonClasses = "w-full rounded-2xl py-3 font-medium transition-all duration-200 transform hover:scale-[1.02] focus:scale-[0.98]";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Custom close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-50 hover:bg-green-100 transition-colors duration-200"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-green-700" />
        </button>
        
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-green-700">
            {loginType ? `Login as a ${loginType === "user" ? "User" : "Service"}` : "Login As"}
          </h2>
        </div>

        {!loginType ? (
          <div className="flex flex-col space-y-4 items-center">
            <Button 
              onClick={() => setLoginType("user")} 
              className={`${buttonClasses} max-w-xs`}
              style={{ backgroundColor: "#16a34a", color: "white" }}
            >
              Login as User
            </Button>
            <Button 
              onClick={() => setLoginType("service")} 
              className={`${buttonClasses} max-w-xs`}
              style={{ backgroundColor: "#16a34a", color: "white" }}
            >
              Login as Service
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="bg-red-50 text-red-500 p-3 rounded-2xl text-center font-semibold">
                {errorMessage}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <Input 
                  type="email" 
                  name="email" 
                  placeholder="Email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className={inputClasses}
                />
              </div>
              <div>
                <Input 
                  type="password" 
                  name="password" 
                  placeholder="Password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  className={inputClasses}
                />
              </div>
            </div>
            
            <div className="pt-4 space-y-3">
              <Button 
                type="submit" 
                className={buttonClasses}
                style={{ backgroundColor: "#16a34a", color: "white" }}
              >
                Login
              </Button>
              <Button 
                type="button" 
                onClick={() => { resetForm(); onClose(); }} 
                className={buttonClasses}
                style={{ backgroundColor: "#ef4444", color: "white" }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPopup;