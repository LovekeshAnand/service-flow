import { useEffect, useState, useRef } from "react";
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
  const [isVisible, setIsVisible] = useState(false);
  const scrollY = useRef(0);

  useEffect(() => {
    if (userId) {
      fetchUserFeedbacks();
    }
  }, [userId, debouncedSearch, sortBy, sortOrder, pagination.currentPage]);

  useEffect(() => {
    // Animation timing and scroll tracking
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Skeleton loader component
  const SkeletonCard = () => (
    <motion.div 
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      className="bg-gradient-to-br from-blue-900/20 to-blue-950/30 backdrop-blur-sm rounded-xl h-32 w-full border border-blue-800/30"
    />
  );

  return (
    <div className="bg-gradient-to-b from-[#061426] to-[#0a2341] min-h-screen pt-20 pb-16 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Animated gradient circles */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[#0a4b8c]/10 blur-[100px] top-[10%] -left-[300px] animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[#2a6baf]/10 blur-[100px] bottom-[20%] -right-[300px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#5396e3]/5 blur-[80px] top-[60%] left-[30%] animate-pulse" style={{ animationDuration: '12s' }}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        
        {/* Animated lines */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent transform opacity-30" style={{ transform: `translateY(${20 + scrollY.current * 0.5}vh)` }}></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent transform opacity-30" style={{ transform: `translateY(${40 + scrollY.current * 0.3}vh)` }}></div>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent transform opacity-30" style={{ transform: `translateY(${60 + scrollY.current * 0.2}vh)` }}></div>
        </div>
        
        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-500/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.5,
              animation: `float${i % 3 + 1} ${8 + Math.random() * 15}s infinite ease-in-out`
            }}
          ></div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-6 relative z-10"
      >
        {/* Header with enhanced styling */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="inline-block px-4 py-2 bg-blue-900/30 rounded-full text-blue-200 text-sm font-medium mb-6 border border-blue-800/40 backdrop-blur-sm"
          >
            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
            My Issues & Feedback
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#5396e3] to-[#9ecbff]"
          >
            My Feedbacks
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-blue-200/90 max-w-2xl mx-auto"
          >
            Browse all feedbacks you've submitted across different services.
          </motion.p>
        </div>
        
        {/* Search and Filter Bar with enhanced styling */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm p-4 md:p-6 rounded-2xl shadow-lg mb-8 border border-blue-800/30"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search feedbacks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-3 pl-10 rounded-lg bg-blue-900/20 backdrop-blur-sm border border-blue-700/50 text-blue-100 placeholder-blue-300/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                />
                <Search className="absolute left-3 top-3.5 text-blue-400" size={20} />
              </div>
              <button 
                onClick={() => {
                  setPagination({...pagination, currentPage: 1});
                  fetchUserFeedbacks();
                }}
                className="py-3 px-6 bg-gradient-to-r from-[#0a4b8c] to-[#0a2c54] rounded-xl text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#5396e3]/30 group flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <span className="relative z-10">Search</span>
                <Search size={18} className="relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a5b9c] to-[#1a3c64] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-blue-500/50 to-blue-300/50 opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300"></div>
              </button>
            </div>
            
            {/* Sort options */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="text-blue-300 flex items-center">
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
                      ? "bg-blue-600/30 text-blue-200 font-medium border border-blue-600/50"
                      : "bg-blue-900/20 text-blue-300 hover:bg-blue-800/30 border border-blue-800/30"
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
                      ? "bg-blue-600/30 text-blue-200 font-medium border border-blue-600/50"
                      : "bg-blue-900/20 text-blue-300 hover:bg-blue-800/30 border border-blue-800/30"
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
                      ? "bg-blue-600/30 text-blue-200 font-medium border border-blue-600/50"
                      : "bg-blue-900/20 text-blue-300 hover:bg-blue-800/30 border border-blue-800/30"
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
                      ? "bg-blue-600/30 text-blue-200 font-medium border border-blue-600/50"
                      : "bg-blue-900/20 text-blue-300 hover:bg-blue-800/30 border border-blue-800/30"
                  }`}
                >
                  <span className="text-xs font-serif font-bold">Old</span> Oldest
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Results information with updated styling */}
        {!loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-blue-300"
          >
            Showing {feedbacks.length} of {pagination.totalFeedbacks} feedbacks
          </motion.div>
        )}
        
        {/* Error message with updated styling */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-red-900/20 border border-red-700/30 rounded-xl p-6 text-center backdrop-blur-sm"
          >
            <div className="flex flex-col items-center">
              <AlertCircle size={36} className="text-red-400 mb-3" />
              <p className="text-red-300 text-lg">{error}</p>
              <button 
                onClick={fetchUserFeedbacks}
                className="mt-4 px-5 py-2 bg-red-600/80 hover:bg-red-700/80 text-white rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
        
        {/* Feedbacks List with updated styling */}
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
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="group"
              >
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/10 transition-all overflow-hidden block border border-blue-800/30 group-hover:border-blue-600/50 relative">
                  {/* Hover effect glow */}
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-blue-500/50 to-blue-300/50 opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
                  
                  <div className="p-5 flex flex-col relative z-10">
                    <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-blue-100 group-hover:text-white transition duration-300">
                        {feedback.title || "Untitled Feedback"}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 bg-blue-600/20 text-blue-200 px-2 py-1 rounded-full text-xs font-medium border border-blue-600/40">
                          <MessageCircle size={12} className="text-blue-300" />
                          {feedback.service?.serviceName || "Service"}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-blue-200/90 mb-4">{feedback.description}</p>
                    
                    <div className="flex flex-wrap justify-between items-center mt-auto">
                      <div className="flex items-center gap-4">
                        <div className="text-blue-300/70 text-sm">
                          Submitted on {formatDate(feedback.createdAt)}
                        </div>
                        <div className="flex items-center gap-1 text-blue-300">
                          <span className="font-medium">
                            {feedback.upvotes || 0} upvotes
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <Button 
                          size="sm"
                          onClick={() => window.location.href = `/services/${feedback.service?._id}`}
                          className="bg-blue-900/50 hover:bg-blue-800/60 text-blue-100 border border-blue-700/50 rounded-lg px-4 py-2 transition-colors"
                        >
                          View Service
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm p-10 text-center rounded-xl shadow-md border border-blue-800/30"
          >
            <div className="flex flex-col items-center">
              <AlertCircle size={48} className="text-blue-400/70 mb-4" />
              <p className="text-blue-200 text-lg mb-2">No feedbacks found</p>
              <p className="text-blue-300/70">You haven't submitted any feedbacks yet or try adjusting your search criteria</p>
            </div>
          </motion.div>
        )}
        
        {/* Pagination with updated styling */}
        {!loading && !error && pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPagination({...pagination, currentPage: Math.max(1, pagination.currentPage - 1)})}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 bg-blue-900/50 hover:bg-blue-800/60 text-blue-100 border border-blue-700/50 rounded-lg disabled:opacity-50 disabled:hover:bg-blue-900/50"
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
                        ? "bg-blue-600 text-white border border-blue-500"
                        : "bg-blue-900/40 text-blue-200 border border-blue-800/50 hover:bg-blue-800/50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <Button
                onClick={() => setPagination({...pagination, currentPage: Math.min(pagination.totalPages, pagination.currentPage + 1)})}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 bg-blue-900/50 hover:bg-blue-800/60 text-blue-100 border border-blue-700/50 rounded-lg disabled:opacity-50 disabled:hover:bg-blue-900/50"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </motion.div>
      
      {/* CSS animations for particles */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(20px) translateX(-15px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-15px) translateX(-10px); }
        }
      `}</style>
    </div>
  );
}