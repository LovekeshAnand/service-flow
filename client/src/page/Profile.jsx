import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCircle, AlertCircle, MessageSquare, Edit, X, ThumbsUp, FileText, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlert } from '../components/AlertProvider';

const API_BASE_URL = "http://localhost:8000/api/v1/users";

// Animated counter component
const CounterCard = ({ icon, label, count, color }) => {
  const [counter, setCounter] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (counter < count) {
        setCounter(prev => Math.min(prev + 1, count));
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [counter, count]);
  
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`p-8 rounded-xl shadow-lg ${color} text-white h-full`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-medium opacity-90">{label}</p>
          <h3 className="text-5xl font-bold mt-3">{counter}</h3>
        </div>
        <div className="p-6 bg-white bg-opacity-20 rounded-full">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

// Circular text component
const AnimatedCircularText = ({ text }) => (
  <div className="relative w-40 h-40">
    <svg 
      viewBox="0 0 100 100" 
      className="w-full h-full animate-spin" 
      style={{ animationDuration: '15s' }}
    >
      <path 
        id="textPath" 
        d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" 
        fill="transparent" 
      />
      <text className="text-green-600 text-[13px] tracking-tight">
        <textPath href="#textPath" startOffset="0%">
          {text} • {text} • {text} •
        </textPath>
      </text>
    </svg>
    <div className="absolute inset-0 flex items-center justify-center">
      <UserCircle size={50} className="text-green-600" />
    </div>
  </div>
);

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
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isOpen, onClose]);

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
      onClose();
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="max-w-md w-full p-6 rounded-3xl shadow-2xl bg-white dark:bg-gray-800 relative animate-fadeIn"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800 transition-colors duration-200 hover:rotate-90 transform"
        >
          <X className="h-4 w-4 text-green-700 dark:text-green-300" />
        </button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-500 relative">
            Update Profile
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-green-500 rounded-full"></div>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-3 rounded-2xl text-center font-semibold border-l-4 border-red-500 animate-pulse">
              {errorMessage}
            </div>
          )}
          
          <div className="space-y-4">
            <Input 
              name="fullname"
              placeholder="Full Name"
              value={updateData.fullname}
              onChange={(e) => setUpdateData({ ...updateData, fullname: e.target.value })}
              className="rounded-xl"
              required
            />
            <Input 
              name="username"
              placeholder="Username"
              value={updateData.username}
              onChange={(e) => setUpdateData({ ...updateData, username: e.target.value })}
              className="rounded-xl"
              required
            />
            <Input 
              type="email"
              name="email"
              placeholder="Email"
              value={updateData.email}
              onChange={(e) => setUpdateData({ ...updateData, email: e.target.value })}
              className="rounded-xl"
              required
            />
            <Input 
              type="password"
              name="newPassword"
              placeholder="New Password (leave empty to keep current)"
              value={updateData.newPassword}
              onChange={(e) => setUpdateData({ ...updateData, newPassword: e.target.value })}
              className="rounded-xl"
            />
            <Input 
              type="password"
              name="currentPassword"
              placeholder="Current Password (required)"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="rounded-xl"
              required
            />
          </div>
          
          <div className="pt-4 space-y-3">
            <Button 
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-3"
            >
              Save Changes
            </Button>
            <Button 
              type="button"
              onClick={onClose}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3"
            >
              Cancel
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
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-green-600"></div>
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
      <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <p className="text-gray-600 dark:text-gray-400">No upvoted services yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h3 className="text-2xl font-bold mb-6 text-green-700 dark:text-green-500">Upvoted Services</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          // Skip any null or invalid services
          if (!service || typeof service !== 'object') return null;
          
          return (
            <motion.div
              key={service._id || `service-${Math.random()}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center mb-3">
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
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-3">
                    <span className="text-green-700 dark:text-green-300 font-bold">
                      {service.serviceName?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
                <h4 className="font-semibold text-lg flex-1 truncate">
                  {service.serviceName || "Unnamed Service"}
                </h4>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 h-10">
                {service.description || "No description available"}
              </p>
              
              <div className="flex items-center justify-between mt-4">
                <span className="flex items-center text-green-600 dark:text-green-400">
                  <ThumbsUp size={16} className="mr-1" />
                  {service.upvotes || 0}
                </span>
                
                <Link 
                  to={`/services/${service._id}`}
                  className="text-sm text-green-600 dark:text-green-400 hover:underline"
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
            className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
          >
            Previous
          </Button>
          
          <span className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md">
            {currentPage} of {totalPages}
          </span>
          
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
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
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-green-600"></div>
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
          className="mt-6 bg-green-600 hover:bg-green-700 text-white text-lg py-3 px-6"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <AnimatedCircularText text="Service Flow" />
            
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-green-700 dark:text-green-500 mb-4">
                {user?.fullname || "User"}
              </h1>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Username:</span> {user?.username || "N/A"}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Email:</span> {user?.email || "N/A"}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Member Since:</span>{" "}
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <CounterCard 
            icon={<AlertCircle size={32} className="text-white" />}
            label="Issues Created"
            count={userStats?.issues?.length || 0}
            color="bg-gradient-to-br from-violet-500 to-violet-700"
          />
          <CounterCard 
            icon={<MessageSquare size={32} className="text-white" />}
            label="Feedbacks Shared"
            count={userStats?.feedbacks?.length || 0}
            color="bg-gradient-to-br from-teal-500 to-teal-700"
          />
        </div>

        {/* Activity Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Button 
            onClick={handleViewIssues}
            className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl"
          >
            <FileText size={24} />
            <span>View My Issues</span>
          </Button>
          
          <Button 
            onClick={handleViewFeedbacks}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl"
          >
            <MessageCircle size={24} />
            <span>View My Feedbacks</span>
          </Button>
        </div>

        {/* Update Profile Button */}
        <Button 
          onClick={() => setShowUpdateModal(true)}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl mb-8"
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