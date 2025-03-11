import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, MessageSquare, Package, Wrench, FileText, X } from "lucide-react";
import { useAlert } from "../components/AlertProvider";

// Updated base URL to match your backend structure
const API_BASE_URL = "http://localhost:8000/api/v1";

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

// Reusable form component for bug, issue and feedback submission
const SubmissionForm = ({ 
  isOpen, 
  onClose, 
  title, 
  color, 
  icon, 
  onSubmit, 
  isSubmitting 
}) => {
  const [formData, setFormData] = useState({ title: "", description: "" });
  
  // Extract color name from the color class (e.g., "bg-blue-600" -> "blue")
  const colorName = color.split('-')[1];
  
  // Create border color classes based on the color prop
  const borderColorClass = `border-${colorName}-500`;
  const focusRingClass = `focus:ring-${colorName}-500`;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg relative overflow-hidden"
      >
        {/* Header with color from prop */}
        <div className={`${color} p-6 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            {icon}
            <h3 className="text-2xl font-bold text-white">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-lg bg-white border ${borderColorClass} focus:ring-2 ${focusRingClass} text-gray-800`}
              placeholder="Enter a clear title"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className={`w-full px-4 py-3 rounded-lg bg-white border ${borderColorClass} focus:ring-2 ${focusRingClass} text-gray-800`}
              placeholder="Provide detailed information"
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className={`${color} text-white`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [service, setService] = useState(null);
  const [serviceStats, setServiceStats] = useState({ bugs: 0, issues: 0, feedbacks: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for form modals
  const [bugFormOpen, setBugFormOpen] = useState(false);
  const [issueFormOpen, setIssueFormOpen] = useState(false);
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Ref to track if component is mounted
  const isMounted = useRef(true);
  // Ref to track if data has already been fetched
  const dataFetchedRef = useRef(false);
  
  // Fetch service details function wrapped in useCallback to prevent recreation on every render
  const fetchServiceDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      // Updated endpoint to get service details
      const response = await axios.get(`${API_BASE_URL}/services/${id}`);

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
        
        // Show success alert for data loading
        if (isMounted.current) {
          showAlert("Service Details", "Service information loaded successfully", "success");
        }
      } else {
        // Fallback to old structure or handle error
        setError("Invalid data structure received from server");
        if (isMounted.current) {
          showAlert("Data Error", "Invalid data structure received from server", "error");
        }
      }
    } catch (err) {
      // Check if component is still mounted before updating state
      if (!isMounted.current) return;
      
      setError("Failed to load service details");
      console.error("Service fetch error:", err.response?.data || err.message);
      if (isMounted.current) {
        showAlert("Error", "Failed to load service details", "error");
      }
    } finally {
      // Check if component is still mounted before updating state
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [id]); // Only depend on id, not showAlert

  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true;
    
    // Only fetch if the data hasn't been fetched yet or if the id changes
    if (!dataFetchedRef.current || id) {
      setLoading(true);
      setError(null);
      fetchServiceDetails();
      dataFetchedRef.current = true;
    }
    
    // Cleanup function when component unmounts
    return () => {
      isMounted.current = false;
    };
  }, [id, fetchServiceDetails]); // Keep both dependencies

  // Memoize submission handlers to prevent recreation on every render
  const handleSubmitBug = useCallback(async (formData) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_BASE_URL}/bugs/service/${id}`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (isMounted.current) {
        showAlert("Success", "Bug reported successfully", "success");
        setBugFormOpen(false);
        // Redirect to bugs list for this service
        navigate(`/${id}/bugs`);
      }
    } catch (err) {
      if (isMounted.current) {
        showAlert("Error", err.response?.data?.message || "Failed to report bug", "error");
      }
    } finally {
      if (isMounted.current) {
        setSubmitting(false);
      }
    }
  }, [id, navigate, showAlert]);

  const handleSubmitIssue = useCallback(async (formData) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_BASE_URL}/issues/service/${id}`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (isMounted.current) {
        showAlert("Success", "Issue reported successfully", "success");
        setIssueFormOpen(false);
        // Redirect to issues list for this service
        navigate(`/${id}/issues`);
      }
    } catch (err) {
      if (isMounted.current) {
        showAlert("Error", err.response?.data?.message || "Failed to report issue", "error");
      }
    } finally {
      if (isMounted.current) {
        setSubmitting(false);
      }
    }
  }, [id, navigate, showAlert]);

  const handleSubmitFeedback = useCallback(async (formData) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_BASE_URL}/feedbacks/service/${id}`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (isMounted.current) {
        showAlert("Success", "Feedback submitted successfully", "success");
        setFeedbackFormOpen(false);
        // Redirect to feedbacks list for this service
        navigate(`/${id}/feedbacks`);
      }
    } catch (err) {
      if (isMounted.current) {
        showAlert("Error", err.response?.data?.message || "Failed to submit feedback", "error");
      }
    } finally {
      if (isMounted.current) {
        setSubmitting(false);
      }
    }
  }, [id, navigate, showAlert]);

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
          setLoading(true);
          setError(null);
          // Try to fetch the data again
          fetchServiceDetails();
          showAlert("Retrying", "Attempting to reload service details", "info");
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

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          onClick={() => setBugFormOpen(true)} 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl"
        >
          <Wrench size={24} />
          <span>Report Bug</span>
        </Button>
        <Button 
          onClick={() => setIssueFormOpen(true)}
          className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl"
        >
          <AlertCircle size={24} />
          <span>Report Issue</span>
        </Button>
        <Button 
          onClick={() => setFeedbackFormOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl"
        >
          <MessageSquare size={24} />
          <span>Give Feedback</span>
        </Button>
      </div>
      
      {/* Form Modals */}
      <SubmissionForm 
        isOpen={bugFormOpen}
        onClose={() => setBugFormOpen(false)}
        title="Report a Bug"
        color="bg-blue-600"
        icon={<Wrench size={24} className="text-white" />}
        onSubmit={handleSubmitBug}
        isSubmitting={submitting}
      />
      
      <SubmissionForm 
        isOpen={issueFormOpen}
        onClose={() => setIssueFormOpen(false)}
        title="Report an Issue"
        color="bg-amber-600"
        icon={<AlertCircle size={24} className="text-white" />}
        onSubmit={handleSubmitIssue}
        isSubmitting={submitting}
      />
      
      <SubmissionForm 
        isOpen={feedbackFormOpen}
        onClose={() => setFeedbackFormOpen(false)}
        title="Give Feedback"
        color="bg-purple-600"
        icon={<MessageSquare size={24} className="text-white" />}
        onSubmit={handleSubmitFeedback}
        isSubmitting={submitting}
      />
    </div>
  );
};

export default ServiceDetails;