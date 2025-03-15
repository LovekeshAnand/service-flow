import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  AlertCircle, 
  MessageSquare, 
  Loader,
  ThumbsUp,
  X,
  Bug
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlert } from "../components/AlertProvider";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import IssuesLineChart from "@/components/LineChart";

// Updated base URL to match your backend structure
const API_BASE_URL = "http://localhost:8000/api/v1";

// Animated counter component from ServiceDashboard
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
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-blue-900/70 to-blue-950/90 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-lg relative overflow-hidden border border-blue-800/30"
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
            <label className="block text-blue-200 mb-2 font-medium">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-blue-900/30 border border-blue-700/50 focus:ring-2 focus:ring-blue-500 text-white placeholder-blue-300/50"
              placeholder="Enter a clear title"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-blue-200 mb-2 font-medium">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-3 rounded-lg bg-blue-900/30 border border-blue-700/50 focus:ring-2 focus:ring-blue-500 text-white placeholder-blue-300/50"
              placeholder="Provide detailed information"
            />
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              onClick={onClose}
              className="bg-blue-950 hover:bg-blue-900 text-blue-200 border border-blue-800/50"
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

  // Navigation handlers for "See All" buttons
  const navigateToAllIssues = useCallback(() => {
    navigateRef.current(`/issues/${id}`);
  }, [id]);

  const navigateToAllFeedbacks = useCallback(() => {
    navigateRef.current(`/feedbacks/${id}`);
  }, [id]);

  // Handle submit issue
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
        navigateRef.current(`/issues/${id}`);
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
  }, [id]);

  // Handle submit feedback
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
        navigateRef.current(`/feedbacks/${id}`);
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
  }, [id]);

  const tryAgain = useCallback(() => {
    setLoading(true);
    setError(null);
    // Call the memoized fetch function directly
    fetchServiceDetails();
    // Show alert using the ref
    showAlertRef.current("Retrying", "Attempting to reload service details", "info");
  }, [fetchServiceDetails]); // Only depend on fetchServiceDetails

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 to-black">
      <Loader className="h-16 w-16 text-blue-500 animate-spin mb-4" />
      <p className="text-blue-300 text-xl animate-pulse">Loading service details...</p>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 to-black px-4">
      <div className="max-w-md w-full text-center">
        <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4">Could not load service details</h2>
        <p className="text-blue-300 mb-8">{error}</p>
        <Button 
          onClick={tryAgain} 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl text-lg font-medium"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-black pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Service Details Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm rounded-2xl border border-blue-800/30 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              {service && service.logo && (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-400 flex-shrink-0">
                  <img src={service.logo} alt={`${service.serviceName} logo`} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {service?.serviceName}
                  <div className="h-1 w-40 bg-gradient-to-r from-blue-600 to-transparent rounded-full mt-2"></div>
                </h1>
                <p className="text-blue-300 mt-1">{service?.email}</p>
                <a 
                  href={service?.serviceLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {service?.serviceLink}
                </a>
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={navigateToAllIssues}
                className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white flex items-center gap-2 px-4 py-2 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/20"
              >
                <AlertCircle size={18} />
                <span>See All Issues</span>
              </Button>
              
              <Button
                onClick={navigateToAllFeedbacks}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white flex items-center gap-2 px-4 py-2 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20"
              >
                <MessageSquare size={18} />
                <span>See All Feedbacks</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-blue-300 font-medium">Description</p>
            <p className="text-white">{service?.description}</p>
            <p className="text-blue-400 text-sm mt-2">
              Created on: {service?.createdAt ? new Date(service.createdAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </motion.div>
        
        {/* Stats Grid */}
        {service && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <CounterCard 
              icon={ThumbsUp}
              label="Upvotes" 
              count={service.upvotes} 
              delay={0}
            />
            <CounterCard 
              icon={Bug}
              label="Issues" 
              count={service.issues || 0} 
              delay={150}
            />
            <CounterCard 
              icon={MessageSquare}
              label="Feedbacks" 
              count={service.feedbacks || 0} 
              delay={300}
            />
          </div>
        )}
        
        {/* Enhanced Chart Section */}
        {service && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm rounded-2xl border border-blue-800/30 p-6 mb-8 overflow-hidden"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              Service Activity Timeline
              <div className="h-1 w-40 bg-gradient-to-r from-blue-600 to-transparent rounded-full mt-2"></div>
            </h2>
            <div className="h-80">
              <IssuesLineChart data={chartData} />
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button 
            onClick={handleUpvoteService}
            disabled={isUpvoting}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20"
          >
            {isUpvoting ? (
              <>
                <Loader className="h-6 w-6 animate-spin" />
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
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20"
          >
            <AlertCircle size={24} />
            <span>Report Issue</span>
          </Button>
          <Button 
            onClick={() => setFeedbackFormOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 rounded-xl text-xl font-medium shadow-lg flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20"
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
      
      {/* Add global animation keyframes */}
      <style jsx global>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(20px) translateX(-10px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-15px) translateX(-15px); }
        }
      `}</style>
    </div>
  );
};

export default ServiceDetails;