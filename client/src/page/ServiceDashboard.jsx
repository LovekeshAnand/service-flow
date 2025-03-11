import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; 
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, MessageSquare, Edit, Package, Wrench, FileText, Trash2 } from "lucide-react";
import { X } from "lucide-react";
import { useAlert } from "../components/AlertProvider"; // Adjust the import path as needed

const API_BASE_URL = "http://localhost:8000/api/v1/services";

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

const ServiceDashboard = () => {
  const { id } = useParams();
  const serviceId = id;
  const navigate = useNavigate();
  const { showAlert } = useAlert(); // Get the showAlert function from context
  const [service, setService] = useState(null);
  const [serviceStats, setServiceStats] = useState({ bugs: 0, issues: 0, feedbacks: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [updateData, setUpdateData] = useState({ 
    serviceName: "", 
    email: "", 
    description: "",
    serviceLink: "",
    newPassword: "",
    logo: null
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const modalRef = useRef(null);
  // Add a ref to track if the component is mounted
  const isMounted = useRef(true);
  // Add a ref to track if the initial fetch has completed
  const initialFetchCompleted = useRef(false);

  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true;
    
    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      // If we've already completed the initial fetch, don't do it again
      if (initialFetchCompleted.current) return;
      
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
  
        // Only log once during development
        console.log("API Response:", response.data);
  
        // Check if component is still mounted before updating state
        if (!isMounted.current) return;
        
        // Handle the specific API response structure
        if (response.data && response.data.data) {
          const serviceData = response.data.data;
          
          // Set service information
          setService({
            serviceName: serviceData.serviceName || "",
            email: serviceData.email || "",
            description: serviceData.description || "",
            serviceLink: serviceData.serviceLink || "",
            logo: serviceData.logo || ""
          });
          
          // Set service stats
          setServiceStats({
            bugs: serviceData.bugs || 0,
            issues: serviceData.issues || 0,
            feedbacks: serviceData.feedbacks || 0
          });
          
          // Pre-fill update form with current service data
          setUpdateData({
            serviceName: serviceData.serviceName || "",
            email: serviceData.email || "",
            description: serviceData.description || "",
            serviceLink: serviceData.serviceLink || "",
            newPassword: "",
            logo: null
          });
          
          if (serviceData.logo) {
            setLogoPreview(serviceData.logo);
          }
          
          // Show success alert for data loading - ONLY ON INITIAL LOAD
          showAlert("Dashboard Loaded", "Service information loaded successfully", "success");
          
          // Mark initial fetch as completed
          initialFetchCompleted.current = true;
        } else {
          // Fallback to old structure or handle error
          setError("Invalid data structure received from server");
          showAlert("Data Error", "Invalid data structure received from server", "error");
        }
      } catch (err) {
        // Check if component is still mounted before updating state
        if (!isMounted.current) return;
        
        setError("Failed to load service dashboard");
        console.error("Service fetch error:", err.response?.data || err.message);
        showAlert("Error", "Failed to load service dashboard", "error");
      } finally {
        // Check if component is still mounted before updating state
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
  
    fetchServiceDetails();
    
    // The dependency array now only includes serviceId and showAlert
    // We don't need to re-run this effect when other state changes
  }, [serviceId, showAlert]);
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && showUpdateModal) {
        setShowUpdateModal(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showUpdateModal]);

  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && showUpdateModal) {
        setShowUpdateModal(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [showUpdateModal]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showUpdateModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showUpdateModal]);
  
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setUpdateData((prev) => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
      showAlert("File Selected", "New logo has been selected", "info");
    }
  };

  const handleUpdate = async () => {
    try {
      // Validate required fields
      if (!updateData.serviceName.trim()) {
        showAlert("Validation Error", "Service name is required", "warning");
        return;
      }
      
      if (!updateData.email.trim()) {
        showAlert("Validation Error", "Email is required", "warning");
        return;
      }
      
      if (!oldPassword.trim()) {
        showAlert("Validation Error", "Current password is required", "warning");
        return;
      }
      
      // Show loading alert
      showAlert("Processing", "Updating service details...", "info");
      
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("serviceName", updateData.serviceName);
      formData.append("email", updateData.email);
      formData.append("description", updateData.description);
      formData.append("serviceLink", updateData.serviceLink);
      formData.append("password", oldPassword);
      
      if (updateData.newPassword) {
        formData.append("newPassword", updateData.newPassword);
      }
      
      if (updateData.logo) {
        formData.append("logo", updateData.logo);
      }
      
      const response = await axios.patch(`${API_BASE_URL}/${serviceId}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true,
      });
      
      setShowUpdateModal(false);
      
      // Show success alert
      showAlert("Success", "Service details updated successfully", "success");
      
      // Reload the page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      // Show error alert with specific message from backend if available
      const errorMessage = err.response?.data?.message || "An unexpected error occurred";
      showAlert("Update Failed", errorMessage, "error");
      console.error("Service update error:", err.response?.data || err.message);
    }
  };

  const handleDeleteService = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_BASE_URL}/delete-services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (response.status === 200) {
        showAlert("Success", "Service deleted successfully", "success");
        navigate("/services"); // Redirect to services page after deletion
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An unexpected error occurred";
      showAlert("Delete Failed", errorMessage, "error");
      console.error("Service delete error:", err.response?.data || err.message);
    }
  };

  const resetForm = () => {
    // Reset form to current service data
    if (service) {
      setUpdateData({
        serviceName: service.serviceName || "",
        email: service.email || "",
        description: service.description || "",
        serviceLink: service.serviceLink || "",
        newPassword: "",
        logo: null
      });
      setLogoPreview(service.logo);
    }
    setOldPassword("");
  };

  const closeModal = () => {
    resetForm();
    setShowUpdateModal(false);
    showAlert("Cancelled", "Update cancelled - no changes made", "info");
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
          // Reset initialFetchCompleted to false so we can try again
          initialFetchCompleted.current = false;
          window.location.reload();
          showAlert("Retrying", "Attempting to reload dashboard", "info");
        }} 
        className="mt-6 bg-green-600 hover:bg-green-700 text-lg py-3 px-6"
      >
        Try Again
      </Button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-xl text-gray-900 dark:text-white">
      {/* Service Header */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 p-8 md:p-10 rounded-xl shadow-md mb-10 mt-14">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 dark:bg-green-900 opacity-20 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-100 dark:bg-green-900 opacity-20 rounded-full -ml-16 -mb-16"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          {/* Logo from backend */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-green-600 shadow-xl">
              {service?.logo ? (
                <img 
                  src={service.logo} 
                  alt={`${service.serviceName} logo`} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="bg-green-100 w-full h-full flex items-center justify-center">
                  <Package size={64} className="text-green-600" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-green-700 dark:text-green-500">
              {service?.serviceName || "Service"}
            </h2>
            <div className="mt-6 space-y-3">
              <p className="flex items-center justify-center md:justify-start gap-3 text-xl">
                <span className="font-medium text-gray-600 dark:text-gray-400">Email:</span> 
                <span className="font-semibold">{service?.email}</span>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-3 text-xl">
                <span className="font-medium text-gray-600 dark:text-gray-400">Service Link:</span> 
                <a href={service?.serviceLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-green-600 hover:underline">
                  {service?.serviceLink}
                </a>
              </p>
              <div className="mt-4">
                <p className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">Description:</p>
                <p className="text-lg leading-relaxed bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  {service?.description || "No description available."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-10">
        <CounterCard 
          icon={<Wrench size={32} className="text-white" />} 
          label="Bugs Received" 
          count={serviceStats.bugs || 0} 
          color="bg-gradient-to-br from-blue-500 to-blue-700"
        />
        <CounterCard 
          icon={<AlertCircle size={32} className="text-white" />} 
          label="Issues Received" 
          count={serviceStats.issues || 0} 
          color="bg-gradient-to-br from-amber-500 to-amber-700"
        />
        <CounterCard 
          icon={<FileText size={32} className="text-white" />} 
          label="Feedbacks Received" 
          count={serviceStats.feedbacks || 0} 
          color="bg-gradient-to-br from-purple-500 to-purple-700"
        />
      </div>

      {/* Update and Delete Service Buttons */}
      <div className="flex flex-col md:flex-row gap-4">
        <Button 
          onClick={() => {
            setShowUpdateModal(true);
            showAlert("Edit Mode", "Now editing service details", "info");
          }} 
          className="w-full md:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl"
        >
          <Edit size={24} />
          <span>Update Service Details</span>
        </Button>
        <Button 
          onClick={handleDeleteService}
          className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl"
        >
          <Trash2 size={24} />
          <span>Delete Service</span>
        </Button>
      </div>

      {/* Custom Update Modal - Similar to RegisterPopup */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div 
            ref={modalRef}
            className="max-w-md w-full p-6 rounded-3xl shadow-2xl bg-white dark:bg-gray-800 relative animate-fadeIn"
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            {/* Close button with animation */}
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800 transition-colors duration-200 hover:rotate-90 transform"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-green-700 dark:text-green-300" />
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-500 relative">
                Update Service Details
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-green-500 rounded-full"></div>
              </h2>
            </div>

            <div className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <Input 
                  name="serviceName" 
                  placeholder="Service Name" 
                  value={updateData.serviceName} 
                  onChange={(e) => setUpdateData({ ...updateData, serviceName: e.target.value })} 
                  className="rounded-2xl px-4 py-3 w-full border-2 border-green-100 dark:border-green-700 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 outline-none pl-10"
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
                  className="rounded-2xl px-4 py-3 w-full border-2 border-green-100 dark:border-green-700 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 outline-none pl-10"
                />
              </div>
              
              <div className="relative">
                <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <Textarea 
                  name="description" 
                  placeholder="Service Description" 
                  value={updateData.description} 
                  onChange={(e) => setUpdateData({ ...updateData, description: e.target.value })} 
                  className="rounded-2xl px-4 py-3 w-full border-2 border-green-100 dark:border-green-700 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 outline-none pl-10 min-h-[100px]"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                  </svg>
                </div>
                <Input 
                  name="serviceLink" 
                  placeholder="Service Link" 
                  value={updateData.serviceLink} 
                  onChange={(e) => setUpdateData({ ...updateData, serviceLink: e.target.value })} 
                  className="rounded-2xl px-4 py-3 w-full border-2 border-green-100 dark:border-green-700 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 outline-none pl-10"
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
                  placeholder="New Password (Optional)" 
                  value={updateData.newPassword} 
                  onChange={(e) => setUpdateData({ ...updateData, newPassword: e.target.value })} 
                  className="rounded-2xl px-4 py-3 w-full border-2 border-green-100 dark:border-green-700 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 outline-none pl-10"
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
                  name="oldPassword" 
                  placeholder="Current Password (Required)" 
                  value={oldPassword} 
                  onChange={(e) => setOldPassword(e.target.value)} 
                  className="rounded-2xl px-4 py-3 w-full border-2 border-green-100 dark:border-green-700 focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50 outline-none pl-10"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Update logo (optional)
                </label>
                <div className="flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-green-200 dark:border-green-700 rounded-2xl text-center hover:bg-green-50 dark:hover:bg-green-900 transition-all cursor-pointer group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                      id="logo-upload" 
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center">
                      <svg className="w-10 h-10 text-green-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <span className="mt-2 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">Click to upload new logo</span>
                    </label>
                  </div>
                  {logoPreview && (
                    <div className="mt-3 flex justify-center">
                      <div className="relative w-32 h-24 overflow-hidden rounded-xl border-2 border-green-200 dark:border-green-700 p-1 shadow-sm">
                        <img 
                          src={logoPreview} 
                          alt="Logo Preview" 
                          className="object-contain w-full h-full" 
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(service?.logo || null);
                            setUpdateData(prev => ({ ...prev, logo: null }));
                            showAlert("Logo Reset", "Logo selection cleared", "info");
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-6 space-y-3">
              <Button 
                onClick={handleUpdate} 
                className="w-full rounded-2xl py-3 font-medium transition-all duration-200 transform hover:scale-[1.02] focus:scale-[0.98] group"
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
                onClick={closeModal} 
                className="w-full rounded-2xl py-3 font-medium transition-all duration-200 transform hover:scale-[1.02] focus:scale-[0.98] group"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDashboard;