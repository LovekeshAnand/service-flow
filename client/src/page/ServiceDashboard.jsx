import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  AlertCircle, 
  Edit, Trash2,
  Loader, ThumbsUp, MessageSquare, Bug
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import IssuesLineChart from '@/components/LineChart';
import UpdateServiceModal from '@/components/UpdateServiceModal';

// Define the base API URL
const API_BASE_URL = "http://localhost:8000/api/v1/services";

// Animated counter component
const CounterCard = ({ icon: Icon, label, count, color, delay = 0 }) => {
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

const ServiceDashboard = () => {
  // Get the service ID from URL params
  const { id: serviceId } = useParams();
  const navigate = useNavigate();
  
  // State for service data and UI states
  const [service, setService] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  
  // Fetch service details and activity data on component mount
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem("token");
        const [serviceResponse, activityResponse] = await Promise.all([
          // Fetch service details
          axios.get(`${API_BASE_URL}/${serviceId}`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
          // Fetch service activity data
          axios.get(`${API_BASE_URL}/${serviceId}/activity`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          })
        ]);
        
        
        if (serviceResponse.data && serviceResponse.data.data) {
          setService(serviceResponse.data.data);
          
          if (activityResponse.data && activityResponse.data.data) {
            setActivityData(activityResponse.data.data);
          } else {
            setActivityData(generateServiceActivityData(serviceResponse.data.data));
          }
          
          toast.success("Dashboard loaded successfully");
        } else {
          setError("Invalid data structure received from server");
          toast.error("Error loading dashboard data");
        }
      } catch (err) {
        console.error("Service fetch error:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load service details");
        toast.error("Could not load service details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchServiceDetails();
  }, [serviceId]);
  
  // Generate service activity data as a fallback
  const generateServiceActivityData = (serviceData) => {
    // Calculate days since creation
    const createdAt = new Date(serviceData.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    
    // Generate data points based on real timestamps
    const data = [];
    let baseUpvotes = serviceData.upvotes;
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
  };
  
  // Handle service update
  const handleUpdate = async (formData) => {
    try {
      toast.info("Updating service details...");
      
      const token = localStorage.getItem("token");
      await axios.patch(`${API_BASE_URL}/${serviceId}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true,
      });
      
      setShowUpdateModal(false);
      toast.success("Service updated successfully");
      
      // Reload page to show updated data
      window.location.reload();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Update failed";
      toast.error(errorMessage);
      console.error("Service update error:", err.response?.data || err.message);
    }
  };
  
  // Handle service deletion
  const handleDeleteService = async () => {
    if (!window.confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      
      toast.success("Service deleted successfully");
      navigate("/services"); // Redirect to services page
    } catch (err) {
      setIsDeleting(false);
      const errorMessage = err.response?.data?.message || "Delete failed";
      toast.error(errorMessage);
      console.error("Service delete error:", err.response?.data || err.message);
    }
  };

  // Handle upvote service
  const handleUpvoteService = async () => {
    try {
      setIsUpvoting(true);
      
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/${serviceId}/upvote`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      
      // Update local state to reflect the upvote
      setService(prevService => ({
        ...prevService,
        upvotes: prevService.upvotes + 1
      }));
      
      toast.success("Service upvoted successfully");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Upvote failed";
      toast.error(errorMessage);
      console.error("Service upvote error:", err.response?.data || err.message);
    } finally {
      setIsUpvoting(false);
    }
  };
  
  // Navigation handlers for "See All" buttons
  const navigateToAllIssues = () => {
    navigate(`/issues/${serviceId}`);
  };

  const navigateToAllFeedbacks = () => {
    navigate(`/feedbacks/${serviceId}`);
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 to-black">
        <Loader className="h-16 w-16 text-blue-500 animate-spin mb-4" />
        <p className="text-blue-300 text-xl animate-pulse">Loading dashboard...</p>
      </div>
    );
  }
  
  // Show error state
  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 to-black px-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Could not load dashboard</h2>
          <p className="text-blue-300 mb-8">{error || "Service data not available"}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl text-lg font-medium"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  // Enhanced chart data with all metrics
  const chartData = {
    serviceData: activityData,
    serviceName: service.serviceName,
    metrics: ['upvotes', 'feedbacks', 'issues']
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-black pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Service Details Header (Moved from bottom to top) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm rounded-2xl border border-blue-800/30 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              {service.logo && (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-400 flex-shrink-0">
                  <img src={service.logo} alt={`${service.serviceName} logo`} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {service.serviceName}
                  <div className="h-1 w-40 bg-gradient-to-r from-blue-600 to-transparent rounded-full mt-2"></div>
                </h1>
                <p className="text-blue-300 mt-1">{service.email}</p>
                <a 
                  href={service.serviceLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {service.serviceLink}
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
            <p className="text-white">{service.description}</p>
            <p className="text-blue-400 text-sm mt-2">
              Created on: {service.createdAt ? new Date(service.createdAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </motion.div>
        
        {/* Stats Grid */}
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
        
        {/* Enhanced Chart Section */}
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
        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button 
              onClick={() => setShowUpdateModal(true)} 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl text-lg font-medium shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <Edit className="h-5 w-5" />
              Update Service
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button 
              onClick={handleDeleteService}
              disabled={isDeleting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl text-lg font-medium shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5" />
                  Delete Service
                </>
              )}
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button 
              onClick={handleUpvoteService}
              disabled={isUpvoting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl text-lg font-medium shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {isUpvoting ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Upvoting...
                </>
              ) : (
                <>
                  <ThumbsUp className="h-5 w-5" />
                  Upvote Service
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Update Modal */}
      <UpdateServiceModal 
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onUpdate={handleUpdate}
        initialData={{
          serviceName: service.serviceName,
          email: service.email,
          description: service.description,
          serviceLink: service.serviceLink,
          logo: service.logo,
        }}
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

export default ServiceDashboard;