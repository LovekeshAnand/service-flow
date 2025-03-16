import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, User, Briefcase, Mail, Lock } from "lucide-react";
import { useAlert } from "./AlertProvider"; // Make sure this path is correct

const LoginPopup = ({ isOpen, onClose, onLoginSuccess, setUser }) => {
  const { showAlert } = useAlert();
  const [loginType, setLoginType] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const modalRef = useRef(null);
  const [animateIn, setAnimateIn] = useState(false);
  
  // Handle animation timing
  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger animations after modal appears
      setTimeout(() => setAnimateIn(true), 50);
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

  // Reset form when popup closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleClose = () => {
    // Set animateIn to false to trigger exit animations
    setAnimateIn(false);
    // Delay actual closing to allow exit animations to play
    setTimeout(() => onClose(), 300);
  };

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
    
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const API_BASE = import.meta.env.VITE_API_URL + "/api/v1";
    const loginUrl =
        loginType === "user"
            ? `${API_BASE}/users/login`
            : `${API_BASE}/services/login`;

    if (!formData.email.trim() || !formData.password) {
        setErrorMessage("⚠️ Email and password are required.");
        return;
    }

    try {
        const response = await fetch(loginUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",  // ✅ Ensure cookies are sent with request
            body: JSON.stringify({
                email: formData.email.trim(),
                password: formData.password,
            }),
        });

        const responseData = await response.json();

        if (response.ok && responseData.data) {
            let userData;
            const accessToken = responseData.data.accessToken;

            if (loginType === "user") {
                userData = responseData.data.user;
            } else {
                userData = responseData.data.service;
                if (userData) {
                    userData.isService = true;
                }
            }

            if (!userData) {
                console.error("No user/service data in response:", responseData);
                setErrorMessage("Login successful but user data is missing.");
                showAlert("Error", "Login successful but user data is missing.", "error");
                return;
            }

            // ✅ Store token properly
            if (accessToken) {
                localStorage.setItem("accessToken", accessToken);
                document.cookie = `accessToken=${accessToken}; path=/; Secure; SameSite=Strict`; // ✅ Save token as a cookie
            }

            localStorage.setItem("profile", JSON.stringify(userData));

            if (setUser) {
                setUser(userData);
            }

            if (onLoginSuccess) {
                onLoginSuccess(userData);
            }

            showAlert("Login Successful", "🎉 You have successfully logged in!", "success");

            resetForm();
            handleClose();
        } else {
            showAlert("Login Failed", responseData.message || "❌ Login failed. Check your credentials and try again.", "error");
            setErrorMessage(responseData.message || "❌ Login failed. Check your credentials and try again.");
        }
    } catch (error) {
        console.error("❌ Error:", error);
        showAlert("Login Error", "Something went wrong. Please try again.", "error");
        setErrorMessage("Something went wrong. Please try again.");
    }
};


  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-lg transition-opacity duration-300 ${animateIn ? 'opacity-100' : 'opacity-0'}`}>
      {/* Animated background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated gradient circles */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gray-900/20 blur-[100px] top-[10%] -left-[200px] animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gray-800/20 blur-[100px] bottom-[20%] -right-[200px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        
        {/* Animated lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-500/20 to-transparent opacity-30"></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-500/20 to-transparent transform translate-y-[40vh] opacity-30"></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-500/20 to-transparent transform translate-y-[80vh] opacity-30"></div>
        </div>
        
        {/* Animated particles */}
        {[...Array(12)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gray-500/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.5,
              animation: `float${i % 3 + 1} ${8 + Math.random() * 15}s infinite ease-in-out`
            }}
          ></div>
        ))}
      </div>

      <div 
        ref={modalRef}
        className={`max-w-md w-full bg-gradient-to-br from-black to-gray-900/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl shadow-gray-900/50 border border-gray-800/30 relative transition-all duration-500 
        ${animateIn ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gray-500/30 rounded-tl-2xl"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gray-500/30 rounded-br-2xl"></div>
        
        {/* Glowing orbs decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gray-500/10 blur-xl"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-gray-600/10 blur-xl"></div>
        
        {/* Close button with animation */}
        <button
          onClick={handleClose}
          className="absolute right-6 top-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/50 hover:bg-gray-700/60 transition-all duration-300 hover:rotate-90 transform border border-gray-700/30 group z-10"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-gray-100 group-hover:text-white" />
        </button>
        
        <div className="text-center mb-8 relative">
          <h2 className={`text-2xl font-bold text-white transition-all duration-500 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {loginType 
              ? `Login as a ${loginType === "user" ? "User" : "Service"}`
              : "How would you like to login?"
            }
            <div className="mt-2 mx-auto w-16 h-1 bg-gradient-to-r from-gray-600 to-gray-400 rounded-full"></div>
          </h2>
        </div>

        {!loginType ? (
          <div className="flex flex-col space-y-6 items-center py-4">
            <Button 
              onClick={() => setLoginType("user")} 
              className={`relative w-64 h-16 group overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-600/30 rounded-xl shadow-lg hover:shadow-gray-500/20 transition-all duration-300 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ transitionDelay: '100ms' }}
            >
              <div className="absolute inset-0 bg-gray-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-r from-gray-400/20 to-transparent blur-sm"></div>
              
              <div className="relative flex items-center justify-center gap-3 text-lg">
                <User className="w-5 h-5 text-gray-200 group-hover:text-white transition-colors duration-300" />
                <span className="text-gray-100 group-hover:text-white transition-colors duration-300">Login as User</span>
              </div>
              
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-gray-400 to-gray-300 w-0 group-hover:w-full transition-all duration-500"></div>
            </Button>
            
            <Button 
              onClick={() => setLoginType("service")} 
              className={`relative w-64 h-16 group overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-600/30 rounded-xl shadow-lg hover:shadow-gray-500/20 transition-all duration-300 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ transitionDelay: '200ms' }}
            >
              <div className="absolute inset-0 bg-gray-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-r from-gray-400/20 to-transparent blur-sm"></div>
              
              <div className="relative flex items-center justify-center gap-3 text-lg">
              <Briefcase className="w-5 h-5 text-gray-200 group-hover:text-white transition-colors duration-300" />
                <span className="text-gray-100 group-hover:text-white transition-colors duration-300">Login as Service</span>
              </div>
              
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-gray-400 to-gray-300 w-0 group-hover:w-full transition-all duration-500"></div>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="bg-red-900/30 text-red-100 p-4 rounded-xl text-center font-medium border border-red-500/40 animate-pulse backdrop-blur-sm">
                {errorMessage}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input 
                  type="email" 
                  name="email" 
                  placeholder="Email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 py-6 text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input 
                  type="password" 
                  name="password" 
                  placeholder="Password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 py-6 text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
                />
              </div>
            </div>
            
            <div className="pt-6 space-y-3">
              <Button 
                type="submit" 
                className="w-full py-6 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white border border-gray-500/30 shadow-lg shadow-gray-600/20 hover:shadow-gray-500/30 group"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Login
                </span>
              </Button>
              <Button 
                type="button" 
                onClick={() => { resetForm(); handleClose(); }} 
                className="w-full py-6 rounded-xl font-medium transition-all duration-300 bg-gradient-to-r from-red-600/80 to-red-500/80 hover:from-red-500 hover:to-red-400 text-white border border-red-500/30 group"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Cancel
                </span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPopup;