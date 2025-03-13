import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Send, Clock, User, MessageCircle, AlertCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";

// API base URL
const API_BASE_URL = "http://localhost:8000/api/v1";

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
  
  // Reply functionality state
  const [selectedReply, setSelectedReply] = useState(null);
  const [newReply, setNewReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    if (serviceId && issueId) {
      fetchIssue();
    }
  }, [serviceId, issueId, user]);

  const fetchIssue = async () => {
    setLoading(true);
    setError(null);
    try {
      // Using the correct endpoint according to the API structure
      const response = await axios.get(
        `${API_BASE_URL}/issues/service/${serviceId}/issues/${issueId}`, 
        {
          headers: {
            Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ""
          },
          withCredentials: true
        }
      );
      
      // Extract issue and comments from response
      const issueData = response.data.data;
      setIssue(issueData);
      
      // If the API returns comments directly, use those
      setComments(issueData.comments || []);
      
      // Set userVote from issue data
      setUserVote(issueData.userVote);
    } catch (err) {
      console.error("Error fetching issue:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch issue details");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (voteType) => {
    if (!user) return; // Require login to vote
    
    setVoteLoading(true);
    try {
      // Determine if we're upvoting or downvoting based on parameter
      const endpoint = voteType === 'upvote' 
        ? `${API_BASE_URL}/issues/service/${serviceId}/issues/${issueId}/upvote` 
        : `${API_BASE_URL}/issues/service/${serviceId}/issues/${issueId}/downvote`;
      
      // Optimistically update UI
      const currentVote = userVote;
      const updatedIssue = {...issue};
      
      // Logic to handle vote changes
      if (currentVote === voteType) {
        // User is removing their vote
        if (voteType === 'upvote') {
          updatedIssue.upvotes--;
          updatedIssue.netVotes--;
        } else {
          updatedIssue.downvotes--;
          updatedIssue.netVotes++;
        }
        setUserVote(null);
      } else if (currentVote === null) {
        // User is adding a new vote
        if (voteType === 'upvote') {
          updatedIssue.upvotes++;
          updatedIssue.netVotes++;
        } else {
          updatedIssue.downvotes++;
          updatedIssue.netVotes--;
        }
        setUserVote(voteType);
      } else {
        // User is switching vote type
        if (voteType === 'upvote') {
          updatedIssue.upvotes++;
          updatedIssue.downvotes--;
          updatedIssue.netVotes += 2;
        } else {
          updatedIssue.downvotes++;
          updatedIssue.upvotes--;
          updatedIssue.netVotes -= 2;
        }
        setUserVote(voteType);
      }
      
      setIssue(updatedIssue);
      
      // Make API call
      await axios.post(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          withCredentials: true
        }
      );
      
    } catch (err) {
      console.error(`Failed to ${voteType} issue:`, err);
      setError(`Failed to ${voteType} issue. Please try again later.`);
      
      // Revert to original state by refreshing data
      fetchIssue();
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setVoteLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    
    setCommentLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Using the correct endpoint according to the API structure
      const response = await axios.post(
        `${API_BASE_URL}/issues/service/${serviceId}/issues/${issueId}/comments`,
        { message: newComment },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : ""
          },
          withCredentials: true
        }
      );
      
      // Add the new comment to the existing comments
      setComments([...comments, response.data.data]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
      setError(err.response?.data?.message || err.message || "Failed to add comment");
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${API_BASE_URL}/issues/comments/${commentId}/like`, 
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );
      
      // Refetch issue to get updated like counts
      fetchIssue();
    } catch (err) {
      console.error("Failed to toggle like:", err);
      setError("Failed to toggle like. Please try again later.");
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleLikeReply = async (replyId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${API_BASE_URL}/issues/replies/${replyId}/like`, 
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );
      
      // Refetch issue to get updated data
      fetchIssue();
    } catch (err) {
      console.error("Failed to toggle reply like:", err);
      setError("Failed to toggle reply like. Please try again later.");
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleReply = async (commentId) => {
    if (!newReply.trim()) return;
    
    setReplyLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Using the correct endpoint according to the API structure
      const response = await axios.post(
        `${API_BASE_URL}/issues/comments/${commentId}/replies`,
        { message: newReply },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        }
      );
      
      // Optimistically update the UI with the new reply
      const updatedComments = comments.map(comment => {
        if (comment._id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), response.data.data]
          };
        }
        return comment;
      });
      
      setComments(updatedComments);
      setNewReply("");
      setSelectedReply(null);
    } catch (err) {
      console.error("Failed to post reply:", err);
      setError("Failed to post reply. Please try again later.");
      
      // Refresh the data to ensure consistency
      fetchIssue();
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setReplyLoading(false);
    }
  };

  const changeIssueStatus = async (status) => {
    setStatusLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Using the correct endpoint according to the API structure
      await axios.patch(
        `${API_BASE_URL}/issues/service/${serviceId}/issues/${issueId}`,
        { status },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : ""
          },
          withCredentials: true
        }
      );
      
      // Update the issue status locally
      setIssue(prevIssue => ({
        ...prevIssue,
        status
      }));
    } catch (err) {
      console.error("Failed to update status:", err);
      setError(err.response?.data?.message || err.message || "Failed to update status");
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setStatusLoading(false);
    }
  };

  // Function to check if the current user is a service owner
  const isServiceOwner = () => {
    return user && user.role === 'service_owner';
  };

  // Function to get status badge color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'resolved':
        return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400';
      case 'closed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 flex flex-col items-center">
            <AlertCircle size={48} className="text-red-500 dark:text-red-400 mb-4" />
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Error Loading Issue</h2>
            <p className="text-red-600 dark:text-red-300 text-center">{error}</p>
            <Link to={`/issues/${serviceId}`} className="mt-4 inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline">
              <ArrowLeft size={16} className="mr-1" /> Back to Issues
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pt-20 pb-16">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto px-6"
      >
        {/* Error message toast */}
        {error && (
          <div className="fixed top-20 right-4 z-50 bg-red-100 dark:bg-red-900/70 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded shadow-md">
            <p>{error}</p>
          </div>
        )}
        
        {/* Back to issues link */}
        <Link 
          to={`/issues/${serviceId}`}
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline mb-6"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Issues
        </Link>
        
        {/* Issue details card */}
        <Card className="mb-8 border border-gray-200 dark:border-gray-700 shadow-md">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{issue?.title}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue?.status)}`}>
                {issue?.status}
              </span>
            </div>
            
            <div className="mb-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{issue?.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-y-4 justify-between items-center text-sm mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <User size={16} className="mr-1" />
                  <span>Opened by: <span className="font-medium text-gray-700 dark:text-gray-300">
                    {issue?.openedBy?.username || 'Anonymous'}
                  </span></span>
                </div>
                
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Clock size={16} className="mr-1" />
                  <span>{formatDate(issue?.createdAt)}</span>
                </div>
              </div>
              
              {/* Vote controls */}
              <div className="flex items-center">
                {user ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote('upvote')}
                      disabled={voteLoading}
                      className={`${userVote === 'upvote' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      <ThumbsUp size={16} className="mr-1" />
                      {issue?.upvotes || 0}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote('downvote')}
                      disabled={voteLoading}
                      className={`${userVote === 'downvote' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      <ThumbsDown size={16} className="mr-1" />
                      {issue?.downvotes || 0}
                    </Button>
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      {issue?.netVotes > 0 ? '+' : ''}{issue?.netVotes || 0} votes
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{issue?.netVotes || 0} votes</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      ({issue?.upvotes || 0} up / {issue?.downvotes || 0} down)
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Status change buttons - only for service owners */}
            {isServiceOwner() && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Update Issue Status:</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => changeIssueStatus("open")}
                    disabled={statusLoading || issue?.status === 'open'}
                    variant={issue?.status === 'open' ? 'default' : 'outline'}
                    className={issue?.status === 'open' ? 'bg-green-600 hover:bg-green-700' : 'border-green-200 text-green-700 hover:bg-green-50'}
                  >
                    Open
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => changeIssueStatus("in-progress")}
                    disabled={statusLoading || issue?.status === 'in-progress'}
                    variant={issue?.status === 'in-progress' ? 'default' : 'outline'}
                    className={issue?.status === 'in-progress' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-200 text-blue-700 hover:bg-blue-50'}
                  >
                    In Progress
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => changeIssueStatus("resolved")}
                    disabled={statusLoading || issue?.status === 'resolved'}
                    variant={issue?.status === 'resolved' ? 'default' : 'outline'}
                    className={issue?.status === 'resolved' ? 'bg-violet-600 hover:bg-violet-700' : 'border-violet-200 text-violet-700 hover:bg-violet-50'}
                  >
                    Resolved
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => changeIssueStatus("closed")}
                    disabled={statusLoading || issue?.status === 'closed'}
                    variant={issue?.status === 'closed' ? 'default' : 'outline'}
                    className={issue?.status === 'closed' ? 'bg-gray-600 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}
                  >
                    Closed
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Comments section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <MessageCircle size={20} className="mr-2" />
            Comments ({comments.length})
          </h2>
          
          {comments.length === 0 ? (
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardContent className="py-8 flex flex-col items-center justify-center text-center">
                <MessageCircle size={32} className="text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Be the first to comment on this issue</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <motion.div
                  key={comment._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="border border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold">
                            {comment.user?.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">
                              {comment.user?.username || 'Anonymous'}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleLikeComment(comment._id)}
                            className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            disabled={!user}
                          >
                            <ThumbsUp size={16} className={`mr-2 ${comment.hasLiked ? 'text-blue-500 fill-blue-500' : ''}`} />
                            {comment.likeCount || 0}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedReply(selectedReply === comment._id ? null : comment._id)}
                            className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            disabled={!user}
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line pl-11">
                        {comment.message}
                      </p>
                      
                      {/* Reply Form */}
                      {selectedReply === comment._id && (
                        <div className="mt-4 pl-11">
                          <Textarea
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            placeholder="Write a reply..."
                            className="mb-2"
                          />
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedReply(null);
                                setNewReply("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleReply(comment._id)}
                              disabled={replyLoading || !newReply.trim()}
                            >
                              {replyLoading ? 'Posting...' : 'Post Reply'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {comment.replies?.length > 0 && (
                        <div className="mt-4 pl-11 space-y-3">
                          {comment.replies.map((reply, replyIndex) => (
                            <div 
                              key={reply._id || `reply-${replyIndex}`} 
                              className="border-l-2 border-gray-200 dark:border-gray-700 pl-3 py-2"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs text-blue-700 dark:text-blue-300 font-semibold">
                                    {reply.user?.username?.[0]?.toUpperCase() || 'U'}
                                  </div>
                                  <p className="font-medium text-sm text-gray-800 dark:text-white">
                                    {reply.user?.username || 'Anonymous'}
                                  </p>
                                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                                    {formatDate(reply.createdAt)}
                                  </p>
                                </div>
                                {user && (
                                  <Button 
                                    variant="ghost" 
                                    size="xs"
                                    onClick={() => handleLikeReply(reply._id)}
                                    className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 h-6 px-2"
                                  >
                                    <ThumbsUp size={12} className={`mr-1 ${reply.hasLiked ? 'text-blue-500 fill-blue-500' : ''}`} />
                                    {reply.likeCount || 0}
                                  </Button>
                                )}
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm pl-9">
                                {reply.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {/* Add comment form */}
        {user ? (
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="pt-4">
              <h3 className="text-md font-medium text-gray-800 dark:text-white mb-3">Add your comment</h3>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="mb-3 min-h-24 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <div className="flex justify-end">
                <Button 
                  onClick={addComment} 
                  disabled={!newComment.trim() || commentLoading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {commentLoading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Send size={16} className="mr-2" /> Add Comment
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <CardContent className="py-8 flex flex-col items-center justify-center text-center">
              <p className="text-gray-700 dark:text-gray-300 mb-3">You need to be logged in to comment</p>
              <Link 
                to="/login" 
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
              >
                Log in to comment
              </Link>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default IssueCommentPage;