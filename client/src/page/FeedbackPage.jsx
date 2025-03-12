import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, ThumbsUp, ThumbsDown, Filter, AlertCircle, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

// Use the same API base URL as in your other components
const API_BASE_URL = "http://localhost:8000/api/v1";

export default function FeedbacksPage() {
  const { serviceId } = useParams();
  
  const [feedbacks, setFeedbacks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("votes");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (serviceId) {
      fetchFeedbacks();
    }
  }, [serviceId, debouncedSearch, sortBy]);

  async function fetchFeedbacks() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      console.log("Fetching feedbacks for service:", serviceId);
      
      const response = await fetch(
        `${API_BASE_URL}/feedbacks/service/${serviceId}/feedbacks?search=${debouncedSearch}&sortBy=${sortBy}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : ""
          },
          credentials: "include"
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch feedbacks');
      }
      
      const data = await response.json();
      console.log("Feedbacks response:", data);
      setFeedbacks(data.data.feedbacks || []);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      setError(error.message || "Failed to fetch feedbacks");
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(feedbackId, voteType) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please login to vote on feedback");
        return;
      }
      
      console.log(`${voteType === 'upvote' ? 'Upvoting' : 'Downvoting'} feedback: ${feedbackId}`);
      
      const response = await fetch(
        `${API_BASE_URL}/feedbacks/service/${serviceId}/feedbacks/${feedbackId}/${voteType}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${voteType} feedback`);
      }
      
      // Refetch feedbacks after successful vote
      fetchFeedbacks();
    } catch (error) {
      console.error(`Error ${voteType}ing feedback:`, error);
      setError(error.message || `Failed to ${voteType} feedback`);
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
            Service Feedback
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Browse and vote on feedback for this service. Help improve the service by upvoting the feedback you find valuable.
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
                  placeholder="Search feedback..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-3 pl-10 rounded-lg bg-white dark:bg-gray-700 border border-violet-300 dark:border-violet-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
                />
                <Search className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={20} />
              </div>
              <button 
                onClick={() => fetchFeedbacks()}
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
            Showing {feedbacks.length} feedback items
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
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{feedback.title}</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{feedback.description}</p>
                      
                      <div className="flex flex-wrap justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <ThumbsUp size={16} className="text-indigo-500 dark:text-indigo-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {feedback.upvotes || 0} upvotes
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsDown size={16} className="text-red-500 dark:text-red-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {feedback.downvotes || 0} downvotes
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            <MessageSquare size={16} />
                            <span className="text-sm">
                              {feedback.comments?.length || 0} comments
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleVote(feedback._id, 'upvote')}
                            className="gap-1 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                          >
                            <ThumbsUp size={16} /> Upvote
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleVote(feedback._id, 'downvote')}
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
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">No feedback found for this service</p>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}