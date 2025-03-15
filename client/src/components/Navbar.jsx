import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import RegisterPopup from "./RegisterPopup";
import LoginPopup from "./LoginPopup";
import { useAlert } from "./AlertProvider";
import { Menu, X, ChevronDown } from "lucide-react";

const Navbar = () => {
  const [isRegisterPopupOpen, setIsRegisterPopupOpen] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef(null);
  const { showAlert } = useAlert();

  useEffect(() => {
    const loadProfile = () => {
      const storedProfile = localStorage.getItem("profile");
      
      if (storedProfile && storedProfile !== "undefined" && storedProfile !== "null") {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          console.log("Profile loaded from localStorage.");
          setProfile(parsedProfile);
        } catch (error) {
          console.error("⚠️ Error parsing profile:", error);
          localStorage.removeItem("profile");
        }
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    loadProfile();
    window.addEventListener("storage", loadProfile);
    window.addEventListener("scroll", handleScroll);
    
    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("storage", loadProfile);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAuthSuccess = (userData) => {
    console.log("Authentication successful, updating profile with User data.");
    
    if (userData) {
      console.log("Setting profile with userData.");
      setProfile(userData);
      showAlert("Success", "Authentication successful", "success");
    } else {
      try {
        const storedProfile = localStorage.getItem("profile");
        if (storedProfile && storedProfile !== "undefined" && storedProfile !== "null") {
          const parsedProfile = JSON.parse(storedProfile);
          console.log("Fallback: Setting profile from localStorage");
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
    
    console.log("Checking if service provider, profile");
    
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

    const API_BASE = import.meta.env.VITE_API_URL + "/api/v1";
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
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? "py-3 backdrop-blur-xl bg-[#0a2c54]/80 shadow-lg shadow-blue-900/20" 
            : "py-5 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center space-x-2 group"
            >
              <img 
                src="/logo.png"  // Replace with your actual logo filename
                alt="Service Flow Logo"
                className="w-10 h-10 object-contain"
              />
              <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#5396e3] to-[#9ecbff] transition-all duration-300 ${
                isScrolled ? "opacity-100" : "opacity-90"
              }`}>
                Service Flow
              </span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                <Link to="/" className="text-blue-100 hover:text-white transition-colors duration-300">
                  Home
                </Link>
                <a href="/About" className="text-blue-100 hover:text-white transition-colors duration-300">
                  About
                </a>
                <Link to="/services" className="text-blue-100 hover:text-white transition-colors duration-300">
                  Services
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                {!profile ? (
                  <>
                    <button
                      onClick={() => setIsLoginPopupOpen(true)}
                      className="px-5 py-2 text-blue-100 border border-[#5396e3]/30 rounded-xl hover:bg-[#0a4b8c]/20 hover:border-[#5396e3]/50 hover:text-white transition-all duration-300"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setIsRegisterPopupOpen(true)}
                      className="px-5 py-2 bg-gradient-to-r from-[#0a4b8c] to-[#0a2c54] rounded-xl text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#5396e3]/30 group relative"
                    >
                      <span className="relative z-10">Register</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#1a5b9c] to-[#1a3c64] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    </button>
                  </>
                ) : (
                  <>
                    {isServiceProvider() ? (
                      <Link 
                        to={`/services/${getServiceId()}/dashboard`} 
                        className="px-5 py-2 bg-gradient-to-r from-[#0a4b8c] to-[#0a2c54] rounded-xl text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#5396e3]/30 group relative"
                      >
                        <span className="relative z-10">Dashboard</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1a5b9c] to-[#1a3c64] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      </Link>
                    ) : (
                      <Link 
                        to={`/profile/${profile._id || profile.id}`} 
                        className="px-5 py-2 bg-gradient-to-r from-[#0a4b8c] to-[#0a2c54] rounded-xl text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#5396e3]/30 group relative"
                      >
                        <span className="relative z-10">Profile</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1a5b9c] to-[#1a3c64] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="px-5 py-2 text-blue-100 border border-[#5396e3]/30 rounded-xl hover:bg-[#0a4b8c]/20 hover:border-[#5396e3]/50 hover:text-white transition-all duration-300"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 flex items-center justify-center text-blue-100 hover:text-white transition-colors duration-300"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div 
          ref={menuRef}
          className="fixed top-0 left-0 w-full h-screen bg-gradient-to-b from-[#0a2c54]/95 to-[#0a4b8c]/95 backdrop-blur-lg z-40 transform transition-transform duration-300 ease-in-out"
          style={{ 
            clipPath: isMenuOpen ? "circle(150% at 100% 0)" : "circle(0% at 100% 0)",
          }}
        >
          <div className="flex flex-col h-full p-6">
            <div className="flex flex-col space-y-6 mt-16">
              <Link 
                to="/"
                className="text-blue-100 hover:text-white text-3xl font-light transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <a
                href="/about"
                className="text-blue-100 hover:text-white text-3xl font-light transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
              <Link
                to="/services"
                className="text-blue-100 hover:text-white text-3xl font-light transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
            </div>
            
            <div className="mt-auto mb-10 flex flex-col space-y-4">
              {!profile ? (
                <>
                  <button
                    onClick={() => {
                      setIsLoginPopupOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-5 py-3 text-blue-100 border border-[#5396e3]/30 rounded-xl hover:bg-[#0a4b8c]/20 hover:border-[#5396e3]/50 hover:text-white transition-all duration-300 text-center"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setIsRegisterPopupOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-5 py-3 bg-gradient-to-r from-[#0a4b8c] to-[#0a2c54] rounded-xl text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#5396e3]/30 text-center relative overflow-hidden group"
                  >
                    <span className="relative z-10">Register</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1a5b9c] to-[#1a3c64] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </>
              ) : (
                <>
                  {isServiceProvider() ? (
                    <Link 
                      to={`/services/${getServiceId()}/dashboard`}
                      className="w-full px-5 py-3 bg-gradient-to-r from-[#0a4b8c] to-[#0a2c54] rounded-xl text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#5396e3]/30 text-center relative overflow-hidden group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="relative z-10">Dashboard</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#1a5b9c] to-[#1a3c64] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                  ) : (
                    <Link 
                      to={`/profile/${profile._id || profile.id}`}
                      className="w-full px-5 py-3 bg-gradient-to-r from-[#0a4b8c] to-[#0a2c54] rounded-xl text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#5396e3]/30 text-center relative overflow-hidden group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="relative z-10">Profile</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#1a5b9c] to-[#1a3c64] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full px-5 py-3 text-blue-100 border border-[#5396e3]/30 rounded-xl hover:bg-[#0a4b8c]/20 hover:border-[#5396e3]/50 hover:text-white transition-all duration-300 text-center"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animated background elements for navbar */}
      <div className="fixed top-0 left-0 w-full h-20 pointer-events-none z-40 overflow-hidden">
        {/* <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div> */}
        <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>
      </div>

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