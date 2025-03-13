import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, ThumbsUp, ThumbsDown, Filter, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

// Use the same API base URL as in your ServiceDetails component
const API_BASE_URL = "http://localhost:8000/api/v1";

export default function IssuesPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate(); // Add the navigate hook
  
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("votes");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (serviceId) {
      fetchIssues();
    }
  }, [serviceId, debouncedSearch, sortBy]);

  async function fetchIssues() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      console.log("Fetching issues for service:", serviceId);
      
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
      
      console.log("Issues response:", response.data);
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
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
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
            Service Issues
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Browse and vote on issues related to this service. Help improve the service by providing your feedback.
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
                  placeholder="Search issues..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-3 pl-10 rounded-lg bg-white dark:bg-gray-700 border border-violet-300 dark:border-violet-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
                />
                <Search className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={20} />
              </div>
              <button 
                onClick={() => fetchIssues()}
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
                  onClick={() => setSortBy("votes")}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    sortBy === "votes"
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <ThumbsUp size={14} /> Most Votes
                </button>
                <button
                  onClick={() => setSortBy("newest")}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    sortBy === "newest"
                      ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  <span className="text-xs font-serif font-bold">New</span> Newest
                </button>
                <button
                  onClick={() => setSortBy("oldest")}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                    sortBy === "oldest"
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
            Showing {issues.length} issues
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
                <Card 
                  className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleIssueClick(issue._id)}
                >
                  <CardContent className="p-0">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{issue.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{issue.description}</p>
                      
                      <div className="flex flex-wrap justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {issue.netVotes || 0} votes
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <span className="text-sm">
                              ({issue.upvotes || 0} upvotes, {issue.downvotes || 0} downvotes)
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={(e) => handleVote(issue._id, 'upvote', e)}
                            className="gap-1 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400"
                          >
                            <ThumbsUp size={16} /> Upvote
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={(e) => handleVote(issue._id, 'downvote', e)}
                            className="gap-1 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                          >
                            <ThumbsDown size={16} /> Downvote
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
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">No issues found for this service</p>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}