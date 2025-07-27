import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Send, Clock, User, MessageCircle, AlertCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";


const API_BASE_URL = import.meta.env.VITE_API_URL + "/api/v1";

const IssueCommentPage = () => {
  const { serviceId, issueId } = useParams();
  const { user } = useAuth();
  
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [voteLoading, setVoteLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  const [selectedReply, setSelectedReply] = useState(null);
  const [newReply, setNewReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  
  const [apiHealthStatus, setApiHealthStatus] = useState({
    voteEndpoint: true,
    statusEndpoint: true
  });

  const getAuthToken = () => {
    const token = localStorage.getItem("accessToken");
    console.log("Retrieved token:", token);
    return token;
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    if (!token) {
      console.warn("No access token found in localStorage");
    }
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    };
  };

  useEffect(() => {
    if (serviceId && issueId) {
      fetchIssue();
      checkApiHealth();
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [serviceId, issueId]);

  useEffect(() => {
    const checkUserVote = async () => {
      if (!user || !apiHealthStatus.voteEndpoint) return;
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/issues/service/${serviceId}/issues/${issueId}/vote`,
          { 
            headers: getAuthHeaders(),
            withCredentials: true
          }
        );
        setUserVote(response.data.voteType);
      } catch (err) {
        console.error("Error fetching user vote:", err);
        if (issue && issue.userVote) {
          setUserVote(issue.userVote);
        }
      }
    };
    
    if (user) checkUserVote();
  }, [user, serviceId, issueId, issue, apiHealthStatus.voteEndpoint]);

  const checkApiHealth = async () => {
    try {
      const voteEndpointStatus = await checkApiEndpoint(`/issues/service/${serviceId}/issues/${issueId}/vote`);
      
      const statusEndpointStatus = await checkApiEndpoint(`/issues/service/${serviceId}/issues/${issueId}/status`);
      
      setApiHealthStatus({
        voteEndpoint: voteEndpointStatus,
        statusEndpoint: statusEndpointStatus
      });
      
      if (!voteEndpointStatus || !statusEndpointStatus) {
        console.warn("Some API endpoints may be unavailable");
      }
    } catch (err) {
      console.error("Error checking API health:", err);
    }
  };

  const checkApiEndpoint = async (endpoint) => {
    try {
      await axios.head(
        `${API_BASE_URL}${endpoint}`,
        {
          headers: getAuthHeaders(),
          withCredentials: true
        }
      );
      return true;
    } catch (err) {
      return false;
    }
  };

  const fetchIssue = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/issues/service/${serviceId}/issues/${issueId}`, 
        {
          headers: getAuthHeaders(),
          withCredentials: true
        }
      );
      
      const issueData = response.data.data;
      setIssue(issueData);
      setComments(issueData.comments || []);
      if (issueData.userVote) {
        setUserVote(issueData.userVote);
      }
    } catch (err) {
      console.error("Error fetching issue:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch issue details");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    if (!user) return;
    
    setVoteLoading(true);
    try {
      const endpoint = voteType === 'upvote' 
        ? `${API_BASE_URL}/issues/service/${serviceId}/issues/${issueId}/upvote` 
        : `${API_BASE_URL}/issues/service/${serviceId}/issues/${issueId}/downvote`;
      
      const currentVote = userVote;
      const updatedIssue = {...issue};
      
      if (currentVote === voteType) {
        if (voteType === 'upvote') {
          updatedIssue.upvotes = (updatedIssue.upvotes || 1) - 1;
          updatedIssue.netVotes = (updatedIssue.netVotes || 1) - 1;
        } else {
          updatedIssue.downvotes = (updatedIssue.downvotes || 1) - 1;
          updatedIssue.netVotes = (updatedIssue.netVotes || -1) + 1;
        }
        setUserVote(null);
      } else if (currentVote === null) {
        if (voteType === 'upvote') {
          updatedIssue.upvotes = (updatedIssue.upvotes || 0) + 1;
          updatedIssue.netVotes = (updatedIssue.netVotes || 0) + 1;
        } else {
          updatedIssue.downvotes = (updatedIssue.downvotes || 0) + 1;
          updatedIssue.netVotes = (updatedIssue.netVotes || 0) - 1;
        }
        setUserVote(voteType);
      } else {
        if (voteType === 'upvote') {
          updatedIssue.upvotes = (updatedIssue.upvotes || 0) + 1;
          updatedIssue.downvotes = (updatedIssue.downvotes || 1) - 1;
          updatedIssue.netVotes = (updatedIssue.netVotes || -1) + 2;
        } else {
          updatedIssue.downvotes = (updatedIssue.downvotes || 0) + 1;
          updatedIssue.upvotes = (updatedIssue.upvotes || 1) - 1;
          updatedIssue.netVotes = (updatedIssue.netVotes || 1) - 2;
        }
        setUserVote(voteType);
      }
      
      setIssue(updatedIssue);
      
      try {
        await axios.post(
          endpoint,
          {},
          {
            headers: getAuthHeaders(),
            withCredentials: true
          }
        );
      } catch (voteErr) {
        
        if (voteErr.response?.status === 500) {
          try {
            await axios.post(
              `${API_BASE_URL}/issues/${issueId}/${voteType}`,
              {},
              {
                headers: getAuthHeaders(),
                withCredentials: true
              }
            );

          } catch (altErr) {
            throw altErr;
          }
        } else {
          throw voteErr;
        }
      }
      
    } catch (err) {
      console.error("Vote error:", err);
      setError(`Failed to ${voteType} issue. Please try again later.`);
      
      fetchIssue();

      setTimeout(() => setError(null), 3000);
    } finally {
      setVoteLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    
    setCommentLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/issues/service/${serviceId}/issues/${issueId}/comments`,
        { message: newComment },
        {
          headers: getAuthHeaders(),
          withCredentials: true
        }
      );
      
      setComments([...comments, response.data.data]);
      setNewComment("");
    } catch (err) {
      console.error("Add comment error:", err);
      setError(err.response?.data?.message || err.message || "Failed to add comment");
      
      setTimeout(() => setError(null), 3000);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment._id === commentId) {
            const hasLiked = !comment.hasLiked;
            const likeCount = hasLiked 
              ? (comment.likeCount || 0) + 1 
              : (comment.likeCount || 1) - 1;
            return { ...comment, hasLiked, likeCount };
          }
          return comment;
        })
      );
      
      const response = await axios.post(
        `${API_BASE_URL}/issues/comments/${commentId}/like`, 
        {},
        {
          headers: getAuthHeaders(),
          withCredentials: true
        }
      );
      
      const { hasLiked, likeCount } = response.data.data;

      setComments(prevComments => 
        prevComments.map(comment => 
          comment._id === commentId 
            ? { ...comment, hasLiked, likeCount } 
            : comment
        )
      );
    } catch (err) {
      console.error("Like comment error:", err);
      setError("Failed to toggle like. Please try again later.");
      
      fetchIssue();
      
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleLikeReply = async (commentId, replyId) => {
    try {
      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: (comment.replies || []).map(reply => {
                if (reply._id === replyId) {
                  const hasLiked = !reply.hasLiked;
                  const likeCount = hasLiked 
                    ? (reply.likeCount || 0) + 1 
                    : (reply.likeCount || 1) - 1;
                  return { ...reply, hasLiked, likeCount };
                }
                return reply;
              })
            };
          }
          return comment;
        })
      );
      
      const response = await axios.post(
        `${API_BASE_URL}/issues/replies/${replyId}/like`, 
        {},
        {
          headers: getAuthHeaders(),
          withCredentials: true
        }
      );
      

      const { hasLiked, likeCount } = response.data.data;

      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: (comment.replies || []).map(reply => 
                reply._id === replyId 
                  ? { ...reply, hasLiked, likeCount } 
                  : reply
              )
            };
          }
          return comment;
        })
      );
    } catch (err) {
      console.error("Like reply error:", err);
      setError("Failed to toggle reply like. Please try again later.");
      
      fetchIssue();
      
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleReply = async (commentId) => {
    if (!newReply.trim()) return;
    
    setReplyLoading(true);
    try {

      const response = await axios.post(
        `${API_BASE_URL}/issues/comments/${commentId}/replies`,
        { message: newReply },
        {
          headers: getAuthHeaders(),
          withCredentials: true
        }
      );

      setComments(prevComments => 
        prevComments.map(comment => {
          if (comment._id === commentId) {
            const updatedReplies = [...(comment.replies || []), response.data.data];
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        })
      );
      

      setNewReply("");
      setSelectedReply(null);
    } catch (err) {
      console.error("Reply error:", err);
      setError(err.response?.data?.message || err.message || "Failed to add reply");
      

      setTimeout(() => setError(null), 3000);
    } finally {
      setReplyLoading(false);
    }
  };

  const updateIssueStatus = async (newStatus) => {
    setStatusLoading(true);
    try {

      if (!apiHealthStatus.statusEndpoint) {
        setError("Status update functionality is currently unavailable");
        return;
      }
      

      setIssue(prev => ({ ...prev, status: newStatus }));
      
      await axios.patch(
        `${API_BASE_URL}/issues/service/${serviceId}/issues/${issueId}/status`,
        { status: newStatus },
        {
          headers: getAuthHeaders(),
          withCredentials: true
        }
      );
    } catch (err) {
      console.error("Status update error:", err);
      setError(err.response?.data?.message || err.message || "Failed to update status");
      

      fetchIssue();
      

      setTimeout(() => setError(null), 3000);
    } finally {
      setStatusLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#061426] to-[#0a2341]">
        <div className="p-6 rounded-xl bg-blue-900/30 backdrop-blur-sm border border-blue-800/30 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
            className="w-12 h-12 border-4 border-blue-500/40 border-t-blue-400 rounded-full animate-spin mb-4"
          />
          <p className="text-blue-200">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (error && !issue) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#061426] to-[#0a2341]">
        <div className="p-6 rounded-xl bg-red-900/30 backdrop-blur-sm border border-red-800/30 flex flex-col items-center">
          <AlertCircle size={48} className="text-red-400 mb-4" />
          <p className="text-red-200 mb-4">{error}</p>
          <Button onClick={fetchIssue} variant="destructive" className="bg-red-600 hover:bg-red-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#061426] to-[#0a2341] min-h-screen pt-20 pb-16 relative overflow-hidden">
      {/* Background elements - similar to IssuesPage */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[#0a4b8c]/10 blur-[100px] top-[10%] -left-[300px] animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[#2a6baf]/10 blur-[100px] bottom-[20%] -right-[300px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[#5396e3]/5 blur-[80px] top-[60%] left-[30%] animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto px-6 relative z-10"
      >
        {/* Back button */}
        <Link to={`/issues/${serviceId}`} className="inline-flex items-center text-blue-300 hover:text-blue-200 transition-colors mb-6">
          <ArrowLeft size={18} className="mr-2" />
          Back to Issues
        </Link>

        {issue && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Issue details card */}
            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm border-blue-800/30 shadow-lg mb-8">
              <CardContent className="p-6 pt-5">
                <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                  <h1 className="text-2xl font-bold text-blue-100">{issue.title}</h1>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(issue.status)}`}>
                    {issue.status || "Open"}
                  </span>
                </div>

                <p className="text-blue-200/90 mb-6 whitespace-pre-line">{issue.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-4 mb-2 pb-4 border-b border-blue-800/30">
                  <div className="flex items-center gap-3 text-blue-300/80">
                    <div className="flex items-center">
                      <User size={16} className="mr-2" />
                      <span>{issue.author?.username || "Anonymous"}</span>
                    </div>
                    {issue.createdAt && (
                      <div className="flex items-center">
                        <Clock size={16} className="mr-2" />
                        <span>{formatDate(issue.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-blue-300">
                      <span className="font-medium">{issue.netVotes || 0} votes</span>
                      <span className="text-sm ml-2 text-blue-400/70">
                        ({issue.upvotes || 0} up, {issue.downvotes || 0} down)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Voting buttons */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleVote('upvote')}
                      disabled={voteLoading}
                      className={`flex items-center gap-2 ${
                        userVote === 'upvote'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-blue-900/40 hover:bg-blue-800/50 border border-blue-700/50'
                      }`}
                    >
                      <ThumbsUp size={18} />
                      Upvote
                    </Button>
                    
                    <Button
                      onClick={() => handleVote('downvote')}
                      disabled={voteLoading}
                      className={`flex items-center gap-2 ${
                        userVote === 'downvote'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-blue-900/40 hover:bg-blue-800/50 border border-blue-700/50'
                      }`}
                    >
                      <ThumbsDown size={18} />
                      Downvote
                    </Button>
                  </div>

                  {/* Status update dropdown for admins/moderators */}
                  {user && user.role === 'service_owner' && (
                    <div className="flex items-center">
                      <select
                        value={issue.status || 'Open'}
                        onChange={(e) => updateIssueStatus(e.target.value)}
                        disabled={statusLoading}
                        className="px-3 py-2 rounded-lg bg-blue-900/40 border border-blue-700/50 text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comments section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-blue-100 mb-4 flex items-center">
                <MessageCircle size={20} className="mr-2" />
                Comments ({comments.length})
              </h2>

              {/* Comment list */}
              {comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <motion.div
                      key={comment._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-br from-blue-900/20 to-blue-950/30 backdrop-blur-sm rounded-xl border border-blue-800/30 overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center text-blue-300/80">
                            <User size={16} className="mr-2" />
                            <span>{comment.author?.username || "Anonymous"}</span>
                          </div>
                          {comment.createdAt && (
                            <div className="text-blue-400/70 text-sm">
                              {formatDate(comment.createdAt)}
                            </div>
                          )}
                        </div>

                        <p className="text-blue-200 mb-3 whitespace-pre-line">{comment.message}</p>

                        <div className="flex items-center justify-between">
                          <Button
                            onClick={() => handleLikeComment(comment._id)}
                            variant="ghost"
                            className={`text-blue-300 hover:text-blue-200 px-2 py-1 h-auto ${
                              comment.hasLiked ? 'text-blue-400' : ''
                            }`}
                          >
                            <ThumbsUp size={16} className="mr-1" />
                            {comment.likeCount || 0}
                          </Button>

                          <Button
                            onClick={() => setSelectedReply(selectedReply === comment._id ? null : comment._id)}
                            variant="ghost"
                            className="text-blue-300 hover:text-blue-200 px-2 py-1 h-auto"
                          >
                            Reply
                          </Button>
                        </div>

                        {/* Reply form */}
                        {selectedReply === comment._id && (
                          <div className="mt-3 pl-4 border-l-2 border-blue-800/50">
                            <Textarea
                              value={newReply}
                              onChange={(e) => setNewReply(e.target.value)}
                              placeholder="Write a reply..."
                              className="w-full bg-blue-900/20 border border-blue-800/50 text-blue-200 placeholder-blue-400/70 mb-2"
                            />
                            <div className="flex justify-end">
                              <Button
                                onClick={() => handleReply(comment._id)}
                                disabled={replyLoading}
                                className="bg-blue-700 hover:bg-blue-600 text-white"
                              >
                                {replyLoading ? 'Sending...' : 'Reply'}
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Replies list */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 pl-4 border-l-2 border-blue-800/50 space-y-3">
{comment.replies.map((reply) => (
                              <div key={reply._id} className="bg-blue-900/20 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center text-blue-300/80">
                                    <User size={14} className="mr-1.5" />
                                    <span className="text-sm">{reply.author?.username || "Anonymous"}</span>
                                  </div>
                                  {reply.createdAt && (
                                    <div className="text-blue-400/70 text-xs">
                                      {formatDate(reply.createdAt)}
                                    </div>
                                  )}
                                </div>
                                
                                <p className="text-blue-200 text-sm mb-2">{reply.message}</p>
                                
                                <Button
                                  onClick={() => handleLikeReply(comment._id, reply._id)}
                                  variant="ghost"
                                  className={`text-blue-300 hover:text-blue-200 px-2 py-1 h-auto text-xs ${
                                    reply.hasLiked ? 'text-blue-400' : ''
                                  }`}
                                >
                                  <ThumbsUp size={14} className="mr-1" />
                                  {reply.likeCount || 0}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gradient-to-br from-blue-900/20 to-blue-950/30 backdrop-blur-sm rounded-xl border border-blue-800/30">
                  <p className="text-blue-300">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>

            {/* Add comment form */}
            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-950/40 backdrop-blur-sm border-blue-800/30 shadow-lg mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-blue-100 mb-4">Leave a Comment</h3>
                
                {user ? (
                  <>
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write your comment here..."
                      className="w-full bg-blue-900/20 border border-blue-800/50 text-blue-200 placeholder-blue-400/70 mb-4"
                      rows={4}
                    />
                    
                    <div className="flex justify-end">
                      <Button
                        onClick={addComment}
                        disabled={commentLoading}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Send size={18} />
                        {commentLoading ? 'Sending...' : 'Post Comment'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <p className="text-blue-300 mb-4">You need to be logged in to comment</p>
                    <Link to="/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                      Login to Comment
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Error toast notification */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-900/90 text-red-200 px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm border border-red-700/50 flex items-center"
          >
            <AlertCircle size={20} className="mr-2 text-red-400" />
            {error}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default IssueCommentPage;