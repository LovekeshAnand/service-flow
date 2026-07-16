import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAlert } from "./AlertProvider";
import { Menu, X } from "lucide-react";
import { toast } from "sonner";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef(null);
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    
    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isServiceProvider = () => {
    if (!user) return false;
    return Boolean(
      user.serviceName || 
      user.service_name || 
      user.isService || 
      user.is_service ||
      user.userType === 'service' ||
      user.user_type === 'service'
    );
  };

  const getServiceId = () => {
    if (!user) return "";
    return user._id || user.id || "";
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
      showAlert("Success", "Logged out successfully!", "success");
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      showAlert("Error", "An error occurred while logging out.", "error");
    } finally {
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
                src="/logo.png"
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
                <Link to="/about" className="text-blue-100 hover:text-white transition-colors duration-300">
                  About
                </Link>
                <Link to="/services" className="text-blue-100 hover:text-white transition-colors duration-300">
                  Services
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      className="px-5 py-2 text-blue-100 border border-[#5396e3]/30 rounded-xl hover:bg-[#0a4b8c]/20 hover:border-[#5396e3]/50 hover:text-white transition-all duration-300 text-center"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="px-5 py-2 bg-gradient-to-r from-[#0a4b8c] to-[#0a2c54] rounded-xl text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#5396e3]/30 group relative text-center"
                    >
                      <span className="relative z-10">Register</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#1a5b9c] to-[#1a3c64] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    </Link>
                  </>
                ) : (
                  <>
                    {isServiceProvider() ? (
                      <Link 
                        to={`/services/${getServiceId()}/dashboard`} 
                        className="px-5 py-2 bg-gradient-to-r from-[#0a4b8c] to-[#0a2c54] rounded-xl text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#5396e3]/30 group relative text-center"
                      >
                        <span className="relative z-10">Dashboard</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1a5b9c] to-[#1a3c64] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      </Link>
                    ) : (
                      <Link 
                        to={`/profile/${user._id || user.id}`} 
                        className="px-5 py-2 bg-gradient-to-r from-[#0a4b8c] to-[#0a2c54] rounded-xl text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#5396e3]/30 group relative text-center"
                      >
                        <span className="relative z-10">Profile</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1a5b9c] to-[#1a3c64] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      </Link>
                    )}
                    <button
                      onClick={handleLogoutClick}
                      className="px-5 py-2 text-blue-100 border border-[#5396e3]/30 rounded-xl hover:bg-[#0a4b8c]/20 hover:border-[#5396e3]/50 hover:text-white transition-all duration-300 cursor-pointer"
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
                className="w-10 h-10 flex items-center justify-center text-blue-100 hover:text-white transition-colors duration-300 cursor-pointer"
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
              <Link
                to="/about"
                className="text-blue-100 hover:text-white text-3xl font-light transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/services"
                className="text-blue-100 hover:text-white text-3xl font-light transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
            </div>
            
            <div className="mt-auto mb-10 flex flex-col space-y-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="w-full px-5 py-3 text-blue-100 border border-[#5396e3]/30 rounded-xl hover:bg-[#0a4b8c]/20 hover:border-[#5396e3]/50 hover:text-white transition-all duration-300 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="w-full px-5 py-3 bg-gradient-to-r from-[#0a4b8c] to-[#0a2c54] rounded-xl text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#5396e3]/30 text-center relative overflow-hidden group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="relative z-10">Register</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1a5b9c] to-[#1a3c64] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
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
                      to={`/profile/${user._id || user.id}`}
                      className="w-full px-5 py-3 bg-gradient-to-r from-[#0a4b8c] to-[#0a2c54] rounded-xl text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#5396e3]/30 text-center relative overflow-hidden group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="relative z-10">Profile</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#1a5b9c] to-[#1a3c64] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                  )}
                  <button
                    onClick={handleLogoutClick}
                    className="w-full px-5 py-3 text-blue-100 border border-[#5396e3]/30 rounded-xl hover:bg-[#0a4b8c]/20 hover:border-[#5396e3]/50 hover:text-white transition-all duration-300 text-center cursor-pointer"
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
        <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"></div>
      </div>
    </>
  );
};

export default Navbar;