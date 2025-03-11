import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { UserCircle, Bug, AlertCircle, MessageSquare, Edit, X } from "lucide-react";
import { useAlert } from "../components/AlertProvider"; // Import the useAlert hook

const API_BASE_URL = "http://localhost:8000/api/v1/users";

// Animated counter component with improved styling and larger size
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

// Circular text component with SVG animation
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

// Custom Update Profile Modal
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
  const { showAlert } = useAlert(); // Access the showAlert function

  useEffect(() => {
    // Reset data when modal opens
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

  // Close modal when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && isOpen) {
        onClose();
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
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!oldPassword) {
      setErrorMessage("⚠️ Current password is required");
      return;
    }

    try {
      await onUpdate({ ...updateData, password: oldPassword });
      // Show success alert instead of reloading the page
      showAlert("Profile Updated", "Your profile has been successfully updated.", "success");
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong. Please try again.");
      // Show error alert
      showAlert("Update Failed", error.message || "Something went wrong. Please try again.", "error");
    }
  };

  if (!isOpen) return null;

  const inputClasses = "rounded-2xl px-4 py-3 w-full border-2 border-green-100 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 outline-none";
  const buttonClasses = "w-full rounded-2xl py-3 font-medium transition-all duration-200 transform hover:scale-[1.02] focus:scale-[0.98]";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="max-w-md w-full p-6 rounded-3xl shadow-2xl bg-white dark:bg-gray-800 relative animate-fadeIn"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800 transition-colors duration-200 hover:rotate-90 transform"
          aria-label="Close"
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
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <Input 
                name="fullname" 
                placeholder="Full Name" 
                value={updateData.fullname} 
                onChange={(e) => setUpdateData({ ...updateData, fullname: e.target.value })} 
                className={`${inputClasses} pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <Input 
                name="username" 
                placeholder="Username" 
                value={updateData.username} 
                onChange={(e) => setUpdateData({ ...updateData, username: e.target.value })} 
                className={`${inputClasses} pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <Input 
                type="email" 
                name="email" 
                placeholder="Email" 
                value={updateData.email} 
                onChange={(e) => setUpdateData({ ...updateData, email: e.target.value })} 
                className={`${inputClasses} pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <Input 
                type="password" 
                name="newPassword" 
                placeholder="New Password (leave empty to keep current)" 
                value={updateData.newPassword} 
                onChange={(e) => setUpdateData({ ...updateData, newPassword: e.target.value })} 
                className={`${inputClasses} pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                </svg>
              </div>
              <Input 
                type="password"
                name="currentPassword" 
                placeholder="Current Password (required)" 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
                className={`${inputClasses} pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
            </div>
          </div>
          
          <div className="pt-4 space-y-3">
            <Button 
              type="submit" 
              className={`${buttonClasses} group`}
              style={{ backgroundColor: "#16a34a", color: "white" }}
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
              onClick={onClose} 
              className={`${buttonClasses} group`}
              style={{ backgroundColor: "#ef4444", color: "white" }}
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

const ProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState({ bugs: [], issues: [], feedbacks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { showAlert } = useAlert(); // Access the showAlert function
  const [dataLoaded, setDataLoaded] = useState(false); // Add this to track initial data loading

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (dataLoaded) return; // Skip if data already loaded
      
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUser(response.data.data.user);
        setUserStats(response.data.data.userStats);
        setDataLoaded(true); // Mark data as loaded
        
        // Show success alert for profile load only once after initial load
        showAlert("Profile Loaded", "Your profile data has been successfully loaded.", "success");
      } catch (err) {
        setError("Failed to load profile");
        console.error("Profile fetch error:", err.response?.data || err.message);
        
        // Show error alert for profile load failure only once
        showAlert("Profile Load Failed", "Failed to load profile data. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [userId, dataLoaded, showAlert]); // Add dataLoaded to the dependency array

  const handleUpdate = async (updateData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/${userId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setShowUpdateModal(false);
      
      // Show success alert
      showAlert("Profile Updated", "Your profile has been successfully updated.", "success");
      
      // Reload user data without refreshing the page
      const response = await axios.get(`${API_BASE_URL}/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUser(response.data.data.user);
    } catch (err) {
      showAlert("Update Failed", err.response?.data?.message || "Update failed", "error");
      throw new Error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen pt-24">
      <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-green-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center p-12 pt-32">
      <AlertCircle size={64} className="mx-auto text-red-500 mb-6" />
      <p className="text-2xl font-medium text-red-500">{error}</p>
      <Button 
        onClick={() => {
          setDataLoaded(false); // Reset data loaded state
          window.location.reload();
        }} 
        className="mt-6 bg-green-600 hover:bg-green-700 text-lg py-3 px-6"
      >
        Try Again
      </Button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-xl text-gray-900 dark:text-white">
      {/* Profile Header */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 p-8 md:p-10 rounded-xl shadow-md mb-10 mt-14">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 dark:bg-green-900 opacity-20 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-100 dark:bg-green-900 opacity-20 rounded-full -ml-16 -mb-16"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <AnimatedCircularText text="Service Flow" />
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-green-700 dark:text-green-500">
              {user?.fullname || "User"}
            </h2>
            <div className="mt-6 space-y-3">
              <p className="flex items-center justify-center md:justify-start gap-3 text-xl">
                <span className="font-medium text-gray-600 dark:text-gray-400">Username:</span> 
                <span className="font-semibold">{user?.username}</span>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-3 text-xl">
                <span className="font-medium text-gray-600 dark:text-gray-400">Email:</span> 
                <span className="font-semibold">{user?.email}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10">
        <CounterCard 
          icon={<Bug size={32} className="text-white" />} 
          label="Bugs Created" 
          count={userStats.bugs.length || 0} 
          color="bg-gradient-to-br from-blue-500 to-blue-700"
        />
        <CounterCard 
          icon={<AlertCircle size={32} className="text-white" />} 
          label="Issues Created" 
          count={userStats.issues.length || 0} 
          color="bg-gradient-to-br from-amber-500 to-amber-700"
        />
        <CounterCard 
          icon={<MessageSquare size={32} className="text-white" />} 
          label="Feedbacks Created" 
          count={userStats.feedbacks.length || 0} 
          color="bg-gradient-to-br from-purple-500 to-purple-700"
        />
      </div>

      {/* Update Profile Button */}
      <Button 
        onClick={() => setShowUpdateModal(true)}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl"
      >
        <Edit size={24} />
        <span>Update Profile</span>
      </Button>

      {/* Custom Update Modal */}
      <UpdateProfileModal 
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        user={user}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default ProfilePage;