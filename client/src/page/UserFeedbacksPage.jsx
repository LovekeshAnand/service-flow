import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, Filter, AlertCircle, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/v1";

export default function UserFeedbacksPage() {
  const { userId } = useParams();
  
  const [feedbacks, setFeedbacks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalFeedbacks: 0
  });
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (userId) {
      fetchUserFeedbacks();
    }
  }, [userId, debouncedSearch, sortBy, sortOrder, pagination.currentPage]);

  async function fetchUserFeedbacks() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${API_BASE_URL}/users/${userId}/feedbacks`, 
        {
          params: {
            search: debouncedSearch,
            sortBy: sortBy,
            sortOrder: sortOrder,
            page: pagination.currentPage,
            limit: 10
          },
          headers: {
            Authorization: token ? `Bearer ${token}` : ""
          },
          withCredentials: true
        }
      );
      
      console.log("User feedbacks response:", response.data);
      setFeedbacks(response.data.data.feedbacks || []);
      setPagination(response.data.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalFeedbacks: 0
      });
    } catch (error) {
      console.error("Error fetching user feedbacks:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch feedbacks");
    } finally {
      setLoading(false);
    }
  }

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
            My Feedbacks
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Browse all feedbacks you've submitted across different services.
          </p>
        </div>
        
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
                  placeholder="Search feedbacks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-3 pl-10 rounded-lg bg-white dark:bg-gray-700 border border-violet-300 dark:border-violet-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
                />
                <Search className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={20} />
              </div>
              <button 
                onClick={() => {
                  setPagination({...pagination, currentPage: 1});
                  fetchUserFeedbacks();
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
                  <span className="text-xs font-bold">↑</span> Most Upvotes
                </button>
                <button
                  onClick={() => {
                    setSortBy("upvotes");
                    setSortOrder("asc");
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    sortBy === "upvotes" && sortOrder === "asc"
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <span className="text-xs font-bold">↓</span> Least Upvotes
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
          </div>
        </motion.div>
        
        {/* Results information */}
        {!loading && !error && (
          <div className="mb-4 text-gray-500 dark:text-gray-400">
            Showing {feedbacks.length} of {pagination.totalFeedbacks} feedbacks
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
        
        {/* Feedbacks List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : feedbacks.length > 0 ? (
          <div className="space-y-4">
            {feedbacks.map((feedback, index) => (
              <motion.div
                key={feedback._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                          {feedback.title || "Untitled Feedback"}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 px-2 py-1 rounded-full text-xs font-medium">
                            <MessageCircle size={12} className="fill-violet-400" />
                            {feedback.service?.serviceName || "Service"}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{feedback.description}</p>
                      
                      <div className="flex flex-wrap justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Submitted on {new Date(feedback.createdAt).toLocaleDateString()}
                          </span>
                          <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300 text-sm">
                            <span className="i-lucide-thumbs-up text-indigo-500 w-4 h-4"></span>
                            {feedback.upvotes || 0}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => window.location.href = `/services/${feedback.service?._id}`}
                            className="gap-1 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                          >
                            View Service
                          </Button>
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
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">No feedbacks found</p>
              <p className="text-gray-500 dark:text-gray-400">You haven't submitted any feedbacks yet or try adjusting your search criteria</p>
            </div>
          </motion.div>
        )}
        
        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination({...pagination, currentPage: Math.max(1, pagination.currentPage - 1)})}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2"
              >
                Previous
              </Button>
              
              {[...Array(pagination.totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={pagination.currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPagination({...pagination, currentPage: i + 1})}
                  className={`px-4 py-2 ${
                    pagination.currentPage === i + 1
                      ? "bg-violet-600 hover:bg-violet-700 text-white"
                      : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {i + 1}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
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