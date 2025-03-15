import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, ThumbsUp, ThumbsDown, Filter, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

// Use the same API base URL as in your ServiceDetails component
const API_BASE_URL = "http://localhost:8000/api/v1";

export default function IssuesPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("votes");
  const debouncedSearch = useDebounce(search, 300);
  const [isVisible, setIsVisible] = useState(false);
  const scrollY = useRef(0);

  useEffect(() => {
    if (serviceId) {
      fetchIssues();
    }
  }, [serviceId, debouncedSearch, sortBy]);

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

  async function fetchIssues() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      
      // Use the absolute URL with the correct API base URL
      const response = await axios.get(
        `${API_BASE_URL}/issues/service/${serviceId}/issues`, 
        {
          params: {
            search: debouncedSearch,
            sortBy: sortBy
          },
          headers: {
            Authorization: token ? `Bearer ${token}` : ""
          },
          withCredentials: true
        }
      );
      
      setIssues(response.data.data.issues || []);
    } catch (error) {
      console.error("Error fetching issues:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(issueId, voteType, event) {
    // Stop event propagation to prevent navigation when clicking vote buttons
    event.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/issues/service/${serviceId}/issues/${issueId}/${voteType}`, 
        {},
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
          },
          withCredentials: true
        }
      );
      
      // Refetch issues after voting
      fetchIssues();
    } catch (error) {
      console.error(`Error ${voteType}ing issue:`, error);
      setError(error.response?.data?.message || error.message || `Failed to ${voteType} issue`);
    }
  }

  // Function to handle issue click and navigate to issue detail
  const handleIssueClick = (issueId) => {
    navigate(`/services/${serviceId}/issues/${issueId}`);
  };

  // Function to get status badge color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'open':
        return 'bg-blue-600/20 text-blue-200 border border-blue-600/40';
      case 'in progress':
        return 'bg-amber-600/20 text-amber-200 border border-amber-600/40';
      case 'resolved':
        return 'bg-green-600/20 text-green-200 border border-green-600/40';
      case 'closed':
        return 'bg-gray-600/20 text-gray-300 border border-gray-600/40';
      default:
        return 'bg-blue-600/20 text-blue-200 border border-blue-600/40';
    }
  };

  // Skeleton loader component with pulse animation
  const SkeletonCard = () => (
    <motion.div 
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      className="bg-gradient-to-br from-blue-900/20 to-blue-950/30 backdrop-blur-sm rounded-xl h-32 w-full border border-blue-800/30"
    />
  );

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

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
        className="max-w-6xl mx-auto px-6 relative z-10"
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
            Service Issues & Feedback
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#5396e3] to-[#9ecbff]"
          >
            Service Issues
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-blue-200/90 max-w-2xl mx-auto"
          >
            Browse and vote on issues related to this service. Help improve the service by providing your feedback.
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
                  placeholder="Search issues..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-3 pl-10 rounded-lg bg-blue-900/20 backdrop-blur-sm border border-blue-700/50 text-blue-100 placeholder-blue-300/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition"
                />
                <Search className="absolute left-3 top-3.5 text-blue-400" size={20} />
              </div>
              <button 
                onClick={() => fetchIssues()}
                className="py-3 px-6 bg-gradient-to-r from-[#0a4b8c] to-[#0a2c54] rounded-xl text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#5396e3]/30 group flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <span className="relative z-10">Search</span>
                <Search size={18} className="relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a5b9c] to-[#1a3c64] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-blue-500/50 to-blue-300/50 opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300"></div>
              </button>
            </div>
            
            {/* Sort options with enhanced styling */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="text-blue-300 flex items-center">
                <Filter size={16} className="mr-2" /> Sort by:
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSortBy("votes")}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    sortBy === "votes"
                      ? "bg-blue-600/30 text-blue-200 font-medium border border-blue-600/50"
                      : "bg-blue-900/20 text-blue-300 hover:bg-blue-800/30 border border-blue-800/30"
                  }`}
                >
                  <ThumbsUp size={14} /> Most Votes
                </button>
                <button
                  onClick={() => setSortBy("newest")}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    sortBy === "newest"
                      ? "bg-blue-600/30 text-blue-200 font-medium border border-blue-600/50"
                      : "bg-blue-900/20 text-blue-300 hover:bg-blue-800/30 border border-blue-800/30"
                  }`}
                >
                  <span className="text-xs font-serif font-bold">New</span> Newest
                </button>
                <button
                  onClick={() => setSortBy("oldest")}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    sortBy === "oldest"
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

        {/* Results counter with enhanced styling */}
        {!loading && !error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-blue-300"
          >
Showing {issues.length} issues
          </motion.div>
        )}

        {/* Error message */}
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
                onClick={fetchIssues}
                className="mt-4 px-5 py-2 bg-red-600/80 hover:bg-red-700/80 text-white rounded-lg transition"
              >
                Try Again
              </button>
            </div>
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
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                onClick={() => handleIssueClick(issue._id)}
                className="group cursor-pointer"
              >
                <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/10 transition-all overflow-hidden block border border-blue-800/30 group-hover:border-blue-600/50 relative">
                  {/* Hover effect glow */}
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-blue-500/50 to-blue-300/50 opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-300"></div>
                  
                  <div className="p-5 flex flex-col relative z-10">
                    <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-blue-100 group-hover:text-white transition duration-300">
                        {issue.title}
                      </h3>
                      
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                        {issue.status || "Open"}
                      </span>
                    </div>
                    
                    <p className="text-blue-200/90 mb-4">
                      {issue.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-between mt-auto">
                      <div className="flex items-center gap-4 text-blue-300">
                        <div className="flex items-center">
                          <span className="font-medium">
                            {issue.netVotes || 0} votes
                          </span>
                        </div>
                        <div className="text-blue-400/70">
                          <span className="text-sm">
                            ({issue.upvotes || 0} up, {issue.downvotes || 0} down)
                          </span>
                        </div>
                        
                        {issue.createdAt && (
                          <div className="text-blue-400/70 text-sm">
                            {formatDate(issue.createdAt)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <button 
                          onClick={(e) => handleVote(issue._id, 'upvote', e)}
                          className="px-3 py-1.5 flex items-center gap-1 rounded-lg bg-blue-900/40 border border-blue-700/50 text-blue-200 hover:bg-blue-800/50 transition-colors"
                        >
                          <ThumbsUp size={16} /> Upvote
                        </button>
                        <button 
                          onClick={(e) => handleVote(issue._id, 'downvote', e)}
                          className="px-3 py-1.5 flex items-center gap-1 rounded-lg bg-blue-900/40 border border-blue-700/50 text-blue-200 hover:bg-blue-800/50 transition-colors"
                        >
                          <ThumbsDown size={16} /> Downvote
                        </button>
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
              <p className="text-blue-200 text-lg mb-2">No issues found for this service</p>
              <p className="text-blue-300/70">Try adjusting your search criteria</p>
            </div>
          </motion.div>
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