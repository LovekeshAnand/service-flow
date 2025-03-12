import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  AlertCircle, 
  MessageSquare, 
  Loader,
  ThumbsUp,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlert } from "../components/AlertProvider";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import IssuesLineChart from "@/components/LineChart";

// Updated base URL to match your backend structure
const API_BASE_URL = "http://localhost:8000/api/v1";

// Reusable form component for issue and feedback submission
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
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for form modals
  const [issueFormOpen, setIssueFormOpen] = useState(false);
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  
  // Ref to track if component is mounted
  const isMounted = useRef(true);
  
  // Ref to store the current showAlert function
  const showAlertRef = useRef(showAlert);
  
  // Update the ref whenever showAlert changes
  useEffect(() => {
    showAlertRef.current = showAlert;
  }, [showAlert]);
  
  // Store navigate in ref to avoid dependency issues
  const navigateRef = useRef(navigate);
  
  // Update navigate ref when it changes
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);
  
  // Generate service activity data as a fallback
  const generateServiceActivityData = useCallback((serviceData) => {
    // Calculate days since creation
    const createdAt = new Date(serviceData.createdAt || new Date());
    const now = new Date();
    const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    
    // Generate data points based on real timestamps
    const data = [];
    let baseUpvotes = serviceData.upvotes || 0;
    let baseIssues = serviceData.issues || 0;
    let baseFeedbacks = serviceData.feedbacks || 0;
    
    // Create at least 7 data points, or one per day since creation (whichever is greater)
    const numPoints = Math.max(7, Math.min(daysSinceCreation, 30)); // Cap at 30 points
    
    for (let i = numPoints - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Distribute metrics over time with more recent days having more activity
      const dailyUpvotes = i === 0 ? baseUpvotes : Math.max(0, Math.floor(baseUpvotes * (i / numPoints)));
      const dailyIssues = i === 0 ? baseIssues : Math.max(0, Math.floor(baseIssues * (i / numPoints)));
      const dailyFeedbacks = i === 0 ? baseFeedbacks : Math.max(0, Math.floor(baseFeedbacks * (i / numPoints)));
      
      data.push({
        date: date.toISOString().split('T')[0],
        upvotes: dailyUpvotes,
        issues: dailyIssues,
        feedbacks: dailyFeedbacks,
        activity: Math.floor(Math.random() * 10) + 1, // Random activity metric
      });
    }
    
    return data;
  }, []);
  
  // Memoize fetchServiceDetails with useCallback and proper dependencies
  const fetchServiceDetails = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      // Fetch both service details and activity data in parallel
      const [serviceResponse, activityResponse] = await Promise.all([
        // Fetch service details
        axios.get(`${API_BASE_URL}/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }),
        // Fetch service activity data
        axios.get(`${API_BASE_URL}/services/${id}/activity`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }).catch(() => ({ data: { data: null } })) // Handle if activity endpoint fails
      ]);

      // Check if component is still mounted before updating state
      if (!isMounted.current) return;
      
      // Handle the specific API response structure
      if (serviceResponse.data && serviceResponse.data.data) {
        const serviceData = serviceResponse.data.data;
        
        // Set service information
        setService({
          serviceName: serviceData.serviceName || "",
          email: serviceData.email || "",
          description: serviceData.description || "",
          serviceLink: serviceData.serviceLink || "",
          logo: serviceData.logo || "",
          upvotes: serviceData.upvotes || 0,
          issues: serviceData.issues || 0,
          feedbacks: serviceData.feedbacks || 0,
          createdAt: serviceData.createdAt || new Date().toISOString(),
        });
        
        // Set activity data if available or generate it
        if (activityResponse.data && activityResponse.data.data) {
          setActivityData(activityResponse.data.data);
        } else {
          setActivityData(generateServiceActivityData(serviceData));
        }
        
        // Show success alert for data loading
        if (isMounted.current) {
          showAlertRef.current("Service Details", "Service information loaded successfully", "success");
        }
      } else {
        // Fallback to old structure or handle error
        setError("Invalid data structure received from server");
        if (isMounted.current) {
          showAlertRef.current("Data Error", "Invalid data structure received from server", "error");
        }
      }
    } catch (err) {
      // Check if component is still mounted before updating state
      if (!isMounted.current) return;
      
      setError("Failed to load service details");
      console.error("Service fetch error:", err.response?.data || err.message);
      if (isMounted.current) {
        showAlertRef.current("Error", "Failed to load service details", "error");
      }
    } finally {
      // Check if component is still mounted before updating state
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [id, generateServiceActivityData]); // Only depend on id and the stable generateServiceActivityData
  
  // Fetch service details on mount
  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true;
    
    // Only fetch data when component mounts
    fetchServiceDetails();
    
    // Cleanup function when component unmounts
    return () => {
      isMounted.current = false;
    };
  }, [fetchServiceDetails]); // Only run when fetchServiceDetails changes

  // Handle upvote service
  const handleUpvoteService = useCallback(async () => {
    try {
      setIsUpvoting(true);
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_BASE_URL}/services/${id}/upvote`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      
      // Update local state to reflect the upvote
      if (isMounted.current) {
        setService(prevService => ({
          ...prevService,
          upvotes: prevService.upvotes + 1
        }));
        
        showAlertRef.current("Success", "Service upvoted successfully", "success");
      }
    } catch (err) {
      if (isMounted.current) {
        showAlertRef.current("Error", err.response?.data?.message || "Upvote failed", "error");
      }
    } finally {
      if (isMounted.current) {
        setIsUpvoting(false);
      }
    }
  }, [id]); // Only depend on id

  const handleSubmitIssue = useCallback(async (formData) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_BASE_URL}/issues/service/${id}/issues`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (isMounted.current) {
        showAlertRef.current("Success", "Issue reported successfully", "success");
        setIssueFormOpen(false);
        // Redirect to issues list for this service
        navigateRef.current(`/service/${id}/issues`);
      }
    } catch (err) {
      if (isMounted.current) {
        showAlertRef.current("Error", err.response?.data?.message || "Failed to report issue", "error");
      }
    } finally {
      if (isMounted.current) {
        setSubmitting(false);
      }
    }
  }, [id]); // Only depend on id

  const handleSubmitFeedback = useCallback(async (formData) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`${API_BASE_URL}/feedbacks/service/${id}/feedbacks`, formData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (isMounted.current) {
        showAlertRef.current("Success", "Feedback submitted successfully", "success");
        setFeedbackFormOpen(false);
        // Redirect to feedbacks list for this service
        navigateRef.current(`/service/${id}/feedbacks`);
      }
    } catch (err) {
      if (isMounted.current) {
        showAlertRef.current("Error", err.response?.data?.message || "Failed to submit feedback", "error");
      }
    } finally {
      if (isMounted.current) {
        setSubmitting(false);
      }
    }
  }, [id]); // Only depend on id

  const tryAgain = useCallback(() => {
    setLoading(true);
    setError(null);
    // Call the memoized fetch function directly
    fetchServiceDetails();
    // Show alert using the ref
    showAlertRef.current("Retrying", "Attempting to reload service details", "info");
  }, [fetchServiceDetails]); // Only depend on fetchServiceDetails

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Loader className="h-12 w-12 text-blue-500 animate-spin mb-4" />
      <p className="text-gray-600 dark:text-gray-300 animate-pulse">Loading service details...</p>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Could not load service details</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
        <Button 
          onClick={tryAgain} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl"
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  // Enhanced chart data with all metrics
  const chartData = {
    serviceData: activityData,
    serviceName: service?.serviceName || "",
    metrics: ['upvotes', 'feedbacks', 'issues']
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Dashboard Header with Animation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Service Details</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">View service information and report issues</p>
        </motion.div>
        
        {/* Service Header */}
        {service && (
          <div className="mb-8">
            <Header 
              serviceName={service.serviceName}
              logo={service.logo}
              email={service.email}
              serviceLink={service.serviceLink}
              description={service.description}
            />
          </div>
        )}
        
        {/* Stats Grid */}
        {service && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Upvotes" 
              value={service.upvotes} 
              icon={ThumbsUp} 
              color="linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)" // Indigo gradient
              delay={0.2}
            />
            <StatCard 
              title="Issues" 
              value={service.issues} 
              icon={AlertCircle} 
              color="linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" // Purple gradient
              delay={0.3}
            />
            <StatCard 
              title="Feedbacks" 
              value={service.feedbacks} 
              icon={MessageSquare} 
              color="linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)" // Teal gradient
              delay={0.4}
            />
          </div>
        )}
        
        {/* Enhanced Chart Section */}
        {service && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Service Activity Timeline</h2>
            <div className="h-80">
              <IssuesLineChart data={chartData} />
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button 
            onClick={handleUpvoteService}
            disabled={isUpvoting}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl"
          >
            {isUpvoting ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Upvoting...</span>
              </>
            ) : (
              <>
                <ThumbsUp size={24} />
                <span>Upvote Service</span>
              </>
            )}
          </Button>
          <Button 
            onClick={() => setIssueFormOpen(true)}
            className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl"
          >
            <AlertCircle size={24} />
            <span>Report Issue</span>
          </Button>
          <Button 
            onClick={() => setFeedbackFormOpen(true)}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl"
          >
            <MessageSquare size={24} />
            <span>Give Feedback</span>
          </Button>
        </motion.div>
      </div>
      
      {/* Form Modals */}
      <SubmissionForm 
        isOpen={issueFormOpen}
        onClose={() => setIssueFormOpen(false)}
        title="Report an Issue"
        color="bg-violet-600"
        icon={<AlertCircle size={24} className="text-white" />}
        onSubmit={handleSubmitIssue}
        isSubmitting={submitting}
      />
      
      <SubmissionForm 
        isOpen={feedbackFormOpen}
        onClose={() => setFeedbackFormOpen(false)}
        title="Give Feedback"
        color="bg-teal-600"
        icon={<MessageSquare size={24} className="text-white" />}
        onSubmit={handleSubmitFeedback}
        isSubmitting={submitting}
      />
    </div>
  );
};

export default ServiceDetails;