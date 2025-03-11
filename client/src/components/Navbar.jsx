import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import RegisterPopup from "./RegisterPopup";
import LoginPopup from "./LoginPopup";
import { useAlert } from "./AlertProvider"; // Make sure this path is correct

const Navbar = () => {
  const [isRegisterPopupOpen, setIsRegisterPopupOpen] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    const loadProfile = () => {
      const storedProfile = localStorage.getItem("profile");
      
      if (storedProfile && storedProfile !== "undefined" && storedProfile !== "null") {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          console.log("Profile loaded from localStorage:", parsedProfile);
          setProfile(parsedProfile);
        } catch (error) {
          console.error("⚠️ Error parsing profile:", error);
          localStorage.removeItem("profile");
        }
      }
    };

    loadProfile();

    window.addEventListener("storage", loadProfile);
    
    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("storage", loadProfile);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAuthSuccess = (userData) => {
    console.log("Authentication successful, updating profile with:", userData);
    
    if (userData) {
      console.log("Setting profile with userData:", userData);
      setProfile(userData);
      showAlert("Success", "Authentication successful", "success");
    } else {
      try {
        const storedProfile = localStorage.getItem("profile");
        if (storedProfile && storedProfile !== "undefined" && storedProfile !== "null") {
          const parsedProfile = JSON.parse(storedProfile);
          console.log("Fallback: Setting profile from localStorage:", parsedProfile);
          setProfile(parsedProfile);
        }
      } catch (error) {
        console.error("⚠️ Error updating profile after authentication:", error);
        showAlert("Error", "Error updating profile", "error");
      }
    }
  };

  const isServiceProvider = () => {
    if (!profile) return false;
    
    console.log("Checking if service provider, profile:", profile);
    
    return Boolean(
      profile.serviceName || 
      profile.service_name || 
      profile.isService || 
      profile.is_service ||
      profile.userType === 'service' ||
      profile.user_type === 'service'
    );
  };

  const getServiceId = () => {
    if (!profile) return "";
    return profile._id || profile.id || "";
  };

  const handleLogout = async () => {
    if (!profile) return;

    const API_BASE = "http://localhost:8000/api/v1";
    const logoutUrl = isServiceProvider()
      ? `${API_BASE}/services/logout`
      : `${API_BASE}/users/logout`;

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ No token found, user might already be logged out.");
      showAlert("Warning", "No active session found.", "warning");
      setProfile(null);
      return;
    }

    try {
      const response = await fetch(logoutUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        showAlert("Success", "Logged out successfully!", "success");
      } else {
        console.error("❌ Logout failed:", await response.text());
        showAlert("Error", "Logout failed. Please try again.", "error");
      }
    } catch (error) {
      console.error("❌ Logout error:", error);
      showAlert("Error", "An error occurred while logging out.", "error");
    } finally {
      localStorage.removeItem("profile");
      localStorage.removeItem("token");
      setProfile(null);
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <nav className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full px-4 sm:px-6 md:px-8 py-3 flex items-center gap-2 sm:gap-4 md:gap-8 border border-gray-300 z-50 backdrop-blur-lg w-[90%] sm:w-auto max-w-5xl">
        <Link to="/" className="text-lg font-semibold text-green-700 whitespace-nowrap">
          Service Flow
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6">
          <Link to="/" className="text-gray-700 hover:text-green-600 transition">
            Home
          </Link>
          <a href="#" className="text-gray-700 hover:text-green-600 transition">
            Docs
          </a>
          <Link to="/services" className="text-gray-700 hover:text-green-600 transition">
            Services
          </Link>
          <a href="#" className="text-gray-700 hover:text-green-600 transition">
            Contact
          </a>
        </div>
        
        <div className="ml-auto hidden md:flex gap-4">
          {!profile ? (
            <>
              <button
                onClick={() => setIsLoginPopupOpen(true)}
                className="px-5 py-2 text-green-700 border border-green-600 rounded-full bg-white hover:bg-green-100 transition"
              >
                Login
              </button>
              <button
                onClick={() => setIsRegisterPopupOpen(true)}
                className="px-5 py-2 text-white bg-green-600 rounded-full hover:bg-green-700 transition"
              >
                Register
              </button>
            </>
          ) : (
            <>
              {isServiceProvider() ? (
                <Link 
                  to={`/services/${getServiceId()}/dashboard`} 
                  className="px-5 py-2 text-white bg-green-600 rounded-full hover:bg-green-700 transition"
                >
                  Dashboard
                </Link>
              ) : (
                <Link 
                  to={`/profile/${profile._id || profile.id}`} 
                  className="px-5 py-2 text-white bg-green-600 rounded-full hover:bg-green-700 transition"
                >
                  Profile
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-5 py-2 text-green-600 border border-green-600 rounded-full bg-white hover:bg-green-100 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <div className="ml-auto md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-green-700 hover:bg-green-50 rounded-full transition"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              className="w-6 h-6"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>
      
      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div 
          ref={menuRef}
          className="fixed top-20 right-5 bg-white shadow-xl rounded-xl p-4 z-50 border border-gray-200 w-64 md:hidden"
        >
          <div className="flex flex-col gap-3">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-green-600 transition py-2 px-3 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <a 
              href="#" 
              className="text-gray-700 hover:text-green-600 transition py-2 px-3 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
            <Link 
              to="/services" 
              className="text-gray-700 hover:text-green-600 transition py-2 px-3 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <a 
              href="#" 
              className="text-gray-700 hover:text-green-600 transition py-2 px-3 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
            
            <div className="border-t border-gray-200 my-2 pt-2">
              {!profile ? (
                <>
                  <button
                    onClick={() => {
                      setIsLoginPopupOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full my-1 px-3 py-2 text-green-700 border border-green-600 rounded-lg bg-white hover:bg-green-50 transition text-left"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setIsRegisterPopupOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full my-1 px-3 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition text-left"
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  {isServiceProvider() ? (
                    <Link 
                      to={`/services/${getServiceId()}/dashboard`}
                      className="w-full my-1 px-3 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition block text-left"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link 
                      to={`/profile/${profile._id || profile.id}`} 
                      className="w-full my-1 px-3 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full my-1 px-3 py-2 text-green-600 border border-green-600 rounded-lg bg-white hover:bg-green-50 transition text-left"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <RegisterPopup
        isOpen={isRegisterPopupOpen}
        onClose={() => setIsRegisterPopupOpen(false)}
        onRegisterSuccess={handleAuthSuccess}
        setUser={setProfile}
      />
      
      <LoginPopup
        isOpen={isLoginPopupOpen}
        onClose={() => setIsLoginPopupOpen(false)}
        onLoginSuccess={handleAuthSuccess}
        setUser={setProfile}
      />
    </>
  );
};

export default Navbar;