import React, { useState, useEffect } from 'react';
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
        
        // Log responses in development
        console.log("Service Response:", serviceResponse.data);
        console.log("Activity Response:", activityResponse.data);
        
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-300 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }
  
  // Show error state
  if (error || !service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Could not load dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error || "Service data not available"}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Dashboard Header with Animation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Service Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your service and view analytics</p>
            </div>
            
            {/* New: See All Issues and Feedbacks buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={navigateToAllIssues}
                className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-colors"
              >
                <AlertCircle size={18} />
                <span>See All Issues</span>
              </Button>
              
              <Button
                onClick={navigateToAllFeedbacks}
                className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-colors"
              >
                <MessageSquare size={18} />
                <span>See All Feedbacks</span>
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* Service Header */}
        <div className="mb-8">
          <Header 
            serviceName={service.serviceName}
            logo={service.logo}
            email={service.email}
            serviceLink={service.serviceLink}
            description={service.description}
          />
        </div>
        
        {/* Stats Grid - Removed "Created On" card and updated colors */}
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
            value={service.issues || 0} 
            icon={Bug} 
            color="linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" // Purple gradient
            delay={0.3}
          />
          <StatCard 
            title="Feedbacks" 
            value={service.feedbacks || 0} 
            icon={MessageSquare} 
            color="linear-gradient(135deg, #2DD4BF 0%, #0D9488 100%)" // Teal gradient
            delay={0.4}
          />
        </div>
        
        {/* Enhanced Chart Section */}
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
        
        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button 
            onClick={() => setShowUpdateModal(true)} 
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors"
          >
            <Edit className="h-5 w-5" />
            Update Service
          </Button>
          
          <Button 
            onClick={handleDeleteService}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors"
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
          
          <Button 
            onClick={handleUpvoteService}
            disabled={isUpvoting}
            className="flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-600 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-colors"
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
    </div>
  );
};

export default ServiceDashboard;