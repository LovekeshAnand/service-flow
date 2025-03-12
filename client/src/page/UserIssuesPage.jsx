import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, ThumbsUp, Filter, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";

export default function UserIssuesPage() {
  const { userId } = useParams();
  
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("upvotes");
  const [sortOrder, setSortOrder] = useState("desc");
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalIssues: 0
  });
  const debouncedSearch = useDebounce(search, 300);

  // Add logging to track component mounting and userId
  useEffect(() => {
    console.log("Component mounted with userId:", userId);
    if (userId) {
      fetchUserIssues();
    } else {
      console.error("No userId available in params");
    }
  }, [userId, debouncedSearch, sortBy, sortOrder, status, pagination.currentPage]);

  async function fetchUserIssues() {
    setLoading(true);
    setError(null);
    try {
      // Check if token exists and log it (partially)
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn("No authentication token found in localStorage");
      } else {
        console.log("Token found (first 10 chars):", token.substring(0, 10) + "...");
      }
      
      // Build API URL with proper status format
      // Convert "in progress" to "in-progress" to match backend schema
      let statusParam = status;
      if (status === "in progress") {
        statusParam = "in-progress";
      }
      
      console.log("Fetching issues with params:", {
        search: debouncedSearch,
        sortBy,
        sortOrder,
        status: statusParam,
        page: pagination.currentPage
      });
      
      const response = await axios.get(
        `${API_BASE_URL}/users/${userId}/issues`, 
        {
          params: {
            search: debouncedSearch,
            sortBy: sortBy,
            sortOrder: sortOrder,
            status: statusParam,
            page: pagination.currentPage,
            limit: 10
          },
          headers: {
            Authorization: token ? `Bearer ${token}` : ""
          },
          withCredentials: true
        }
      );
      
      console.log("Full response:", response);
      
      if (response.data.data && response.data.data.issues) {
        console.log("Issues found:", response.data.data.issues.length);
        setIssues(response.data.data.issues);
        setPagination(response.data.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalIssues: 0
        });
      } else {
        console.error("Unexpected response structure:", response.data);
        setError("Received unexpected data structure from server");
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
      console.error("Response data:", error.response?.data);
      console.error("Status:", error.response?.status);
      setError(error.response?.data?.message || error.message || "Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  }

  // Function to display status with the correct format
  const formatStatus = (status) => {
    if (status === "in-progress") return "In Progress";
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : "";
  };

  // Function to get status badge color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress':
      case 'in progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'resolved':
        return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400';
      case 'closed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Skeleton loader component
  const SkeletonCard = () => (
    <motion.div 
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      className="bg-gray-100 dark:bg-gray-800 rounded-xl h-28 w-full"
    />
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pt-20 pb-16">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-violet-700 dark:text-violet-400 mb-3">
            My Issues
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Browse all issues you've created across different services.
          </p>
        </div>
        
        {/* Debug information - only visible during development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-400">Debug Info:</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">UserId: {userId || 'Not set'}</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">Has token: {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">Filter status: {status || 'None'}</p>
          </div>
        )}
        
        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-md mb-6"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-3 pl-10 rounded-lg bg-white dark:bg-gray-700 border border-violet-300 dark:border-violet-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
                />
                <Search className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={20} />
              </div>
              <button 
                onClick={() => {
                  setPagination({...pagination, currentPage: 1});
                  fetchUserIssues();
                }}
                className="py-3 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Search size={18} /> Search
              </button>
            </div>
            
            {/* Sort options */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="text-gray-500 dark:text-gray-400 flex items-center">
                <Filter size={16} className="mr-2" /> Sort by:
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSortBy("upvotes");
                    setSortOrder("desc");
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    sortBy === "upvotes" && sortOrder === "desc"
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <ThumbsUp size={14} /> Most Upvotes
                </button>
                <button
                  onClick={() => {
                    setSortBy("createdAt");
                    setSortOrder("desc");
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    sortBy === "createdAt" && sortOrder === "desc"
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <span className="text-xs font-serif font-bold">New</span> Newest
                </button>
                <button
                  onClick={() => {
                    setSortBy("createdAt");
                    setSortOrder("asc");
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    sortBy === "createdAt" && sortOrder === "asc"
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <span className="text-xs font-serif font-bold">Old</span> Oldest
                </button>
              </div>
            </div>
            
            {/* Status filter - UPDATED to match backend schema */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="text-gray-500 dark:text-gray-400 flex items-center">
                Status:
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setStatus("")}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    status === ""
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatus("open")}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    status === "open"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Open
                </button>
                <button
                  onClick={() => setStatus("in-progress")}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    status === "in-progress"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setStatus("resolved")}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    status === "resolved"
                      ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-medium"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Resolved
                </button>
                <button
                  onClick={() => setStatus("closed")}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    status === "closed"
                      ? "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Closed
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Results information */}
        {!loading && !error && (
          <div className="mb-4 text-gray-500 dark:text-gray-400">
            Showing {issues.length} of {pagination.totalIssues} issues
          </div>
        )}
      
        {/* Error message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-center gap-3"
          >
            <AlertCircle className="text-red-500 dark:text-red-400 flex-shrink-0" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}
        
        {/* Issues List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : issues.length > 0 ? (
          <div className="space-y-4">
            {issues.map((issue, index) => (
              <motion.div
                key={issue._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{issue.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {formatStatus(issue.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{issue.description}</p>
                      
                      <div className="flex flex-wrap justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {issue.upvotes || 0} upvotes
                            </span>
                          </div>
                          {issue.service && (
                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              <span className="text-sm">
                                Service: {issue.service.serviceName}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center shadow-sm"
          >
            <div className="flex flex-col items-center">
              <AlertCircle size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">You haven't created any issues yet</p>
              <p className="text-gray-500 dark:text-gray-400">Or try adjusting your search criteria</p>
            </div>
          </motion.div>
        )}
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPagination({...pagination, currentPage: Math.max(1, pagination.currentPage - 1)})}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2"
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPagination({...pagination, currentPage: i + 1})}
                    className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      pagination.currentPage === i + 1
                        ? "bg-violet-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setPagination({...pagination, currentPage: Math.min(pagination.totalPages, pagination.currentPage + 1)})}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}