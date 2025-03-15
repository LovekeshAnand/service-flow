import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCircle, AlertCircle, MessageSquare, Edit, X, ThumbsUp, FileText, MessageCircle, User, Mail, Calendar } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlert } from '../components/AlertProvider';
import { Lock } from "lucide-react";

const API_BASE_URL = "http://localhost:8000/api/v1/users";

// Animated counter component
const CounterCard = ({ icon: Icon, label, count, delay = 0 }) => {
  const [counter, setCounter] = useState(0);
  const cardRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(cardRef.current);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (!isInView) return;
    
    const timer = setTimeout(() => {
      if (counter < count) {
        setCounter(prev => Math.min(prev + 1, count));
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [counter, count, isInView]);
  
  return (
    <div
      ref={cardRef}
      className={`bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm p-6 rounded-2xl border border-blue-800/30 transition-all duration-700 hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-500/10 ${
        isInView 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-medium text-blue-200">{label}</p>
          <h3 className="text-4xl font-bold mt-3 text-white">{counter}</h3>
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl w-14 h-14 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/20 transition-all duration-500 group-hover:scale-110">
          <Icon className="text-blue-100 w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// Animated profile avatar
const AnimatedProfileAvatar = ({ name }) => {
  return (
    <div className="relative h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48">
      {/* Animated circles */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 animate-pulse" style={{ animationDuration: '3s' }}></div>
      <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-900 to-blue-800"></div>
      
      {/* User initial */}
      <div className="absolute inset-0 flex items-center justify-center text-4xl md:text-5xl font-bold text-blue-100">
        {name?.charAt(0) || "U"}
      </div>
      
      {/* Animated particles */}
      {[...Array(8)].map((_, i) => (
        <div 
          key={i}
          className="absolute w-2 h-2 rounded-full bg-blue-500/70"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float${i % 3 + 1} ${3 + Math.random() * 5}s infinite ease-in-out`
          }}
        ></div>
      ))}
    </div>
  );
};

// Update Profile Modal
// Update Profile Modal
const UpdateProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [updateData, setUpdateData] = useState({
    fullname: user?.fullname || "",
    username: user?.username || "",
    email: user?.email || "",
    newPassword: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const modalRef = useRef(null);
  const { showAlert } = useAlert();
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

  useEffect(() => {
    if (isOpen && user) {
      setUpdateData({
        fullname: user.fullname || "",
        username: user.username || "",
        email: user.email || "",
        newPassword: ""
      });
      setOldPassword("");
      setErrorMessage("");
    }
  }, [isOpen, user]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isOpen, onClose]);

  const handleClose = () => {
    // Set animateIn to false to trigger exit animations
    setAnimateIn(false);
    // Delay actual closing to allow exit animations to play
    setTimeout(() => onClose(), 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!oldPassword) {
      setErrorMessage("⚠️ Current password is required");
      return;
    }

    try {
      await onUpdate({ 
        ...updateData, 
        password: oldPassword
      });
      handleClose();
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong. Please try again.");
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
            Update Profile
            <div className="mt-2 mx-auto w-16 h-1 bg-gradient-to-r from-gray-600 to-gray-400 rounded-full"></div>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="bg-red-900/30 text-red-100 p-4 rounded-xl text-center font-medium border border-red-500/40 animate-pulse backdrop-blur-sm">
              {errorMessage}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                name="fullname"
                placeholder="Full Name"
                value={updateData.fullname}
                onChange={(e) => setUpdateData({ ...updateData, fullname: e.target.value })}
                className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 py-6 text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                name="username"
                placeholder="Username"
                value={updateData.username}
                onChange={(e) => setUpdateData({ ...updateData, username: e.target.value })}
                className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 py-6 text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                type="email"
                name="email"
                placeholder="Email"
                value={updateData.email}
                onChange={(e) => setUpdateData({ ...updateData, email: e.target.value })}
                className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 py-6 text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                type="password"
                name="newPassword"
                placeholder="New Password (leave empty to keep current)"
                value={updateData.newPassword}
                onChange={(e) => setUpdateData({ ...updateData, newPassword: e.target.value })}
                className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 py-6 text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                type="password"
                name="currentPassword"
                placeholder="Current Password (required)"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="bg-gray-950/50 border border-gray-700/30 rounded-xl pl-12 py-6 text-gray-100 placeholder:text-gray-400/60 focus:ring-2 focus:ring-gray-500/40 focus:border-gray-600/40"
                required
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
                Save Changes
              </span>
            </Button>
            <Button 
              type="button"
              onClick={handleClose}
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
      </div>
    </div>
  );
};

// Upvoted Services Component
const UpvotedServices = ({ userId }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { showAlert } = useAlert();

  useEffect(() => {
    const fetchUpvotedServices = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/${userId}/upvoted-services?page=${currentPage}&limit=6`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        
        // Ensure we have a valid services array
        if (response.data?.data?.services && Array.isArray(response.data.data.services)) {
          setServices(response.data.data.services);
          setTotalPages(response.data.data.totalPages || 1);
        } else {
          setServices([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Failed to load upvoted services:", err);
        setError("Failed to load upvoted services");
        showAlert("Error", "Failed to load upvoted services", "error");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUpvotedServices();
  }, [userId, currentPage, showAlert]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="text-center p-6 bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-800/30">
        <p className="text-blue-300">No upvoted services yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h3 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
        Upvoted Services
        <div className="h-1 w-40 bg-gradient-to-r from-blue-600 to-transparent rounded-full mt-2"></div>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => {
          // Skip any null or invalid services
          if (!service || typeof service !== 'object') return null;
          
          return (
            <motion.div
              key={service._id || `service-${Math.random()}`}
              initial={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm p-6 rounded-2xl border border-blue-800/30 transition-all duration-300 hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-500/10 group"
            >
              <div className="flex items-center justify-between mb-3">
                {service.logo ? (
                  <img 
                    src={service.logo} 
                    alt={service.serviceName || "Service"} 
                    className="w-10 h-10 rounded-full mr-3"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/40"; // Fallback image
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                    <span className="text-blue-700 dark:text-blue-300 font-bold">
                      {service.serviceName?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
                <h4 className="font-semibold text-lg flex-1 truncate text-blue-100">
                  {service.serviceName || "Unnamed Service"}
                </h4>
              </div>
              
              <p className="text-sm text-blue-200 dark:text-blue-300 line-clamp-2 h-10">
                {service.description || "No description available"}
              </p>
              
              <div className="flex items-center justify-between mt-4">
                <span className="flex items-center text-blue-300 dark:text-blue-300">
                  <ThumbsUp size={16} className="mr-1" />
                  {service.upvotes || 0}
                </span>
                
                <Link 
                  to={`/services/${service._id}`}
                  className="text-sm text-blue-300 dark:text-blue-300 hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:text-gray-400"
          >
            Previous
          </Button>
          
          <span className="flex items-center px-4 py-2 bg-blue-900/30 rounded-md text-blue-200">
            {currentPage} of {totalPages}
          </span>
          
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:text-gray-400"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

const ProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState({ issues: [], feedbacks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { showAlert } = useAlert();
  const [dataLoaded, setDataLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (dataLoaded) return;
      
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("Authentication required. Please log in.");
        }
        
        const response = await axios.get(`${API_BASE_URL}/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        
        if (response.data?.data?.user) {
          setUser(response.data.data.user);
          setUserStats({
            feedbacks: response.data.data.userStats?.feedbacks || [],
            issues: response.data.data.userStats?.issues || []
          });
          setDataLoaded(true);
          
          showAlert("Profile Loaded", "Profile data loaded successfully", "success");
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (err) {
        console.error("Profile fetch error:", err.response?.data || err.message);
        
        if (err.response?.status === 401) {
          showAlert("Authentication Error", "Please log in to view this profile", "error");
          navigate("/login");
        } else {
          setError("Failed to load profile. " + (err.response?.data?.message || err.message || "Please try again later."));
          showAlert("Error", "Failed to load profile", "error");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId, dataLoaded, showAlert, navigate]);

  const handleUpdate = async (updateData) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }
      
      await axios.put(`${API_BASE_URL}/${userId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      
      const response = await axios.get(`${API_BASE_URL}/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      
      setUser(response.data.data.user);
      showAlert("Success", "Profile updated successfully", "success");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Update failed: " + (err.message || "Unknown error");
      showAlert("Error", errorMessage, "error");
      throw new Error(errorMessage);
    }
  };
  
  const handleViewIssues = () => { 
    navigate(`/users/${userId}/issues`); 
  };
    
  const handleViewFeedbacks = () => { 
    navigate(`/users/${userId}/feedbacks`); 
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen pt-24">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center p-12 pt-32">
        <AlertCircle size={64} className="mx-auto text-red-500 mb-6" />
        <p className="text-2xl font-medium text-red-500">{error}</p>
        <Button 
          onClick={() => {
            setDataLoaded(false);
            setError(null);
            window.location.reload();
          }} 
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white text-lg py-3 px-6"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm rounded-2xl border border-blue-800/30 p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <AnimatedProfileAvatar name={user?.fullname} />
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200 mb-4">
                {user?.fullname || "User"}
              </h1>
              <div className="space-y-3">
                <p className="text-blue-200 flex items-center justify-center md:justify-start gap-2">
                  <User className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">Username:</span> {user?.username || "N/A"}
                </p>
                <p className="text-blue-200 flex items-center justify-center md:justify-start gap-2">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">Email:</span> {user?.email || "N/A"}
                </p>
                <p className="text-blue-200 flex items-center justify-center md:justify-start gap-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">Member Since:</span>{" "}
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <CounterCard 
            icon={AlertCircle}
            label="Issues Created"
            count={userStats?.issues?.length || 0}
            delay={0}
          />
          <CounterCard 
            icon={MessageSquare}
            label="Feedbacks Shared"
            count={userStats?.feedbacks?.length || 0}
            delay={100}
          />
          <CounterCard 
            icon={ThumbsUp}
            label="Upvoted Services"
            count={user?.upvotedServices?.length || 0}
            delay={200}
          />
        </div>

        {/* Activity Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Button 
            onClick={handleViewIssues}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
          >
            <FileText size={24} />
            <span>View My Issues</span>
          </Button>
          
          <Button 
            onClick={handleViewFeedbacks}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
          >
            <MessageCircle size={24} />
            <span>View My Feedbacks</span>
          </Button>
        </div>

        {/* Update Profile Button */}
        <Button 
          onClick={() => setShowUpdateModal(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 mb-8"
        >
          <Edit size={24} />
          <span>Update Profile</span>
        </Button>

        {/* Upvoted Services */}
        <UpvotedServices userId={userId} />

        {/* Update Modal */}
        <UpdateProfileModal 
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          user={user}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
};

export default ProfilePage;