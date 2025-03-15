import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Issue } from "../models/issueSchema.model.js";
import { Comment } from "../models/commentSchema.model.js";
import { Like } from "../models/likeSchema.model.js";
import { Vote } from "../models/voteSchema.model.js";
import { Service } from "../models/serviceSchema.model.js";

/** ✅ 1. Get All Issues for a Specific Service */
const getAllIssuesForService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { page = 1, limit = 10, search = "", sortBy = "votes" } = req.query;

    const query = {
        service: serviceId,
        $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ]
    };

    const totalIssues = await Issue.countDocuments(query);
    const totalPages = Math.ceil(totalIssues / limit);

    // Determine the sort order
    let sortOrder = {};
    if (sortBy === "votes") {
        sortOrder = { netVotes: -1, createdAt: -1 }; // Sort by votes, then by date
    } else if (sortBy === "date") {
        sortOrder = { createdAt: -1 }; // Sort by date only
    } else {
        sortOrder = { netVotes: -1, createdAt: -1 }; // Default sort
    }

    const issues = await Issue.find(query)
        .populate("openedBy", "username")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort(sortOrder);

    return res.status(200).json(new ApiResponse(200, { issues, totalPages, currentPage: parseInt(page) }, "Issues retrieved successfully."));
});

/** ✅ 2. Get a Single Issue with Comments & Replies */
const getIssueById = asyncHandler(async (req, res) => {
    const { serviceId, issueId } = req.params;
    const userId = req.user?._id;

    // Start building the issue with its base data
    const issue = await Issue.findOne({ _id: issueId, service: serviceId })
        .populate("openedBy", "username");
    
    if (!issue) {
        throw new ApiError(404, "Issue not found.");
    }
    
    // Get the comments for this issue
    const comments = await Comment.find({ _id: { $in: issue.comments } })
        .populate("user", "username");
    
    // For each comment, fetch its replies and add like information
    const commentsWithLikes = await Promise.all(comments.map(async (comment) => {
        // Get replies for this comment
        const replies = await Comment.find({ _id: { $in: comment.replies } })
            .populate("user", "username");
        
        // Get like counts for each reply
        const repliesWithLikes = await Promise.all(replies.map(async (reply) => {
            const likeCount = await Like.countDocuments({ 
                targetId: reply._id, 
                targetType: "Reply" 
            });
            
            // Check if current user has liked this reply
            let hasLiked = false;
            if (userId) {
                hasLiked = await Like.exists({ 
                    targetId: reply._id, 
                    targetType: "Reply",
                    user: userId 
                });
            }
            
            return {
                ...reply.toObject(),
                likeCount,
                hasLiked: !!hasLiked
            };
        }));
        
        // Get like count for this comment
        const likeCount = await Like.countDocuments({ 
            targetId: comment._id, 
            targetType: "Comment" 
        });
        
        // Check if current user has liked this comment
        let hasLiked = false;
        if (userId) {
            hasLiked = await Like.exists({ 
                targetId: comment._id, 
                targetType: "Comment",
                user: userId 
            });
        }
        
        return {
            ...comment.toObject(),
            replies: repliesWithLikes,
            likeCount,
            hasLiked: !!hasLiked
        };
    }));
    
    // Get the current user's vote on this issue, if any
    let userVote = null;
    if (userId) {
        userVote = await Vote.findOne({ 
            user: userId, 
            targetId: issueId,
            targetType: "Issue" 
        });
    }

    // Add userVote to the response
    const responseData = {
        ...issue.toObject(),
        comments: commentsWithLikes,
        userVote: userVote ? userVote.voteType : null
    };

    return res.status(200).json(new ApiResponse(200, responseData, "Issue details retrieved successfully."));
});


/** ✅ 3. Create an Issue for a Specific Service */
const createIssue = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { title, description } = req.body;
    const userId = req.user._id;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required.");
    }

    const issue = await Issue.create({ 
        title, 
        description, 
        service: serviceId, 
        openedBy: userId,
        upvotes: 0,
        downvotes: 0,
        netVotes: 0
    });

    return res.status(201).json(new ApiResponse(201, issue, "Issue reported successfully."));
});

/** ✅ 4. Delete an Issue (Only the Creator Can Delete) */
const deleteIssue = asyncHandler(async (req, res) => {
    const { serviceId, issueId } = req.params;
    const userId = req.user._id;

    const issue = await Issue.findOne({ _id: issueId, service: serviceId });

    if (!issue) {
        throw new ApiError(404, "Issue not found.");
    }

    if (issue.openedBy.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized: You can only delete your own issues.");
    }

    // Delete all associated votes
    await Vote.deleteMany({ 
        targetId: issueId,
        targetType: "Issue"
    });
    
    // Delete issue and associated comments
    await Comment.deleteMany({ _id: { $in: issue.comments } });
    await issue.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Issue deleted successfully."));
});

/** ✅ 5. Add a Comment to an Issue */
const addComment = asyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const { message } = req.body;
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(401, "Authentication required to add a comment.");
    }

    if (!message) {
        throw new ApiError(400, "Message cannot be empty.");
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
        throw new ApiError(404, "Issue not found.");
    }

    const comment = await Comment.create({ user: userId, message });
    issue.comments.push(comment._id);
    await issue.save();

    return res.status(201).json(new ApiResponse(201, comment, "Comment added successfully."));
});

/** ✅ 6. Reply to a Comment */
const replyToComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
        throw new ApiError(400, "Reply cannot be empty.");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found.");
    }

    const reply = await Comment.create({ user: userId, message });
    comment.replies.push(reply._id);
    await comment.save();

    return res.status(201).json(new ApiResponse(201, reply, "Reply added successfully."));
});

/** ✅ 7. Like/Unlike a Comment */
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ user: userId, targetId: commentId, targetType: "Comment" });

    // Check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found.");
    }

    let action = "";
    let hasLiked = false;

    if (existingLike) {
        // User is unliking
        await Like.findByIdAndDelete(existingLike._id);
        action = "unliked";
        hasLiked = false;
    } else {
        // User is liking
        await Like.create({ user: userId, targetId: commentId, targetType: "Comment" });
        action = "liked";
        hasLiked = true;
    }

    // Get the updated like count
    const likeCount = await Like.countDocuments({ targetId: commentId, targetType: "Comment" });

    return res.status(200).json(
        new ApiResponse(200, { hasLiked, likeCount }, `Comment ${action}.`)
    );
});

/** ✅ 8. Like/Unlike a Reply */
const toggleReplyLike = asyncHandler(async (req, res) => {
    const { replyId } = req.params;
    const userId = req.user._id;

    // Check if reply exists
    const reply = await Comment.findById(replyId);
    if (!reply) {
        throw new ApiError(404, "Reply not found.");
    }

    const existingLike = await Like.findOne({ user: userId, targetId: replyId, targetType: "Reply" });

    let action = "";
    let hasLiked = false;

    if (existingLike) {
        // User is unliking
        await Like.findByIdAndDelete(existingLike._id);
        action = "unliked";
        hasLiked = false;
    } else {
        // User is liking
        await Like.create({ user: userId, targetId: replyId, targetType: "Reply" });
        action = "liked";
        hasLiked = true;
    }

    // Get the updated like count
    const likeCount = await Like.countDocuments({ targetId: replyId, targetType: "Reply" });

    return res.status(200).json(
        new ApiResponse(200, { hasLiked, likeCount }, `Reply ${action}.`)
    );
});

/** ✅ 9. Update a Comment (Only Owner) */
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found.");
    }

    if (comment.user.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized: You can only update your own comments.");
    }

    comment.message = message;
    await comment.save();

    return res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully."));
});

/** ✅ 10. Delete a Comment (Only Owner) */
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found.");
    }

    if (comment.user.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized: You can only delete your own comments.");
    }

    await comment.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully."));
});

const updateIssueStatus = asyncHandler(async (req, res) => {
    const { serviceId, issueId } = req.params;
    const { status } = req.body;
    
    const userId = req.user?._id || req.service?._id; // ✅ Handle both user & service IDs

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: User/Service ID is missing" });
    }

    // Validate status
    const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(400, "Invalid status value");
    }

    // Find service and check ownership
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new ApiError(404, "Service not found");
    }

    // Check if the authenticated entity is the service itself
    if (service._id.toString() !== userId.toString()) {
      throw new ApiError(403, "Only service owners can update issue status");
    }

    // Update issue
    const issue = await Issue.findOneAndUpdate(
      { _id: issueId, service: serviceId },
      { status },
      { new: true }
    );

    if (!issue) {
      throw new ApiError(404, "Issue not found");
    }

    return res.status(200).json(new ApiResponse(200, issue, "Issue status updated successfully"));
});


/** ✅ 11. Upvote an Issue */
const upvoteIssue = asyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const userId = req.user._id;

    const issue = await Issue.findById(issueId);
    if (!issue) {
        throw new ApiError(404, "Issue not found.");
    }

    // Check if the user has already voted
    const existingVote = await Vote.findOne({ 
        user: userId, 
        targetId: issueId,
        targetType: "Issue" 
    });

    if (existingVote) {
        if (existingVote.voteType === "upvote") {
            // User is removing their upvote
            await Vote.findByIdAndDelete(existingVote._id);
            
            // Update the issue vote counts
            issue.upvotes -= 1;
            issue.netVotes -= 1;
            await issue.save();
            
            return res.status(200).json(new ApiResponse(200, { voteType: null }, "Upvote removed."));
        } else {
            // User is changing from downvote to upvote
            existingVote.voteType = "upvote";
            await existingVote.save();
            
            // Update the issue vote counts
            issue.upvotes += 1;
            issue.downvotes -= 1;
            issue.netVotes += 2; // +1 for adding upvote, +1 for removing downvote
            await issue.save();
            
            return res.status(200).json(new ApiResponse(200, { voteType: "upvote" }, "Vote changed to upvote."));
        }
    } else {
        // Create a new upvote
        await Vote.create({ 
            user: userId, 
            targetId: issueId,
            targetType: "Issue",
            voteType: "upvote" 
        });
        
        // Update the issue vote counts
        issue.upvotes += 1;
        issue.netVotes += 1;
        await issue.save();
        
        return res.status(201).json(new ApiResponse(201, { voteType: "upvote" }, "Issue upvoted."));
    }
});

/** ✅ 12. Downvote an Issue */
const downvoteIssue = asyncHandler(async (req, res) => {
    const { issueId } = req.params;
    const userId = req.user._id;

    const issue = await Issue.findById(issueId);
    if (!issue) {
        throw new ApiError(404, "Issue not found.");
    }

    // Check if the user has already voted
    const existingVote = await Vote.findOne({ 
        user: userId, 
        targetId: issueId,
        targetType: "Issue" 
    });

    if (existingVote) {
        if (existingVote.voteType === "downvote") {
            // User is removing their downvote
            await Vote.findByIdAndDelete(existingVote._id);
            
            // Update the issue vote counts
            issue.downvotes -= 1;
            issue.netVotes += 1;
            await issue.save();
            
            return res.status(200).json(new ApiResponse(200, { voteType: null }, "Downvote removed."));
        } else {
            // User is changing from upvote to downvote
            existingVote.voteType = "downvote";
            await existingVote.save();
            
            // Update the issue vote counts
            issue.upvotes -= 1;
            issue.downvotes += 1;
            issue.netVotes -= 2; // -1 for removing upvote, -1 for adding downvote
            await issue.save();
            
            return res.status(200).json(new ApiResponse(200, { voteType: "downvote" }, "Vote changed to downvote."));
        }
    } else {
        // Create a new downvote - FIX: use targetId and targetType instead of issue
        await Vote.create({ 
            user: userId, 
            targetId: issueId,
            targetType: "Issue",
            voteType: "downvote" 
        });
        
        // Update the issue vote counts
        issue.downvotes += 1;
        issue.netVotes -= 1;
        await issue.save();
        
        return res.status(201).json(new ApiResponse(201, { voteType: "downvote" }, "Issue downvoted."));
    }
});

const getUserVote = asyncHandler(async (req, res) => {

    const { issueId } = req.params;
    const userId = req.user?._id || req.service?._id; // ✅ Handle both user & service IDs

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: User/Service ID is missing" });
    }

    const vote = await Vote.findOne({ user: userId, issue: issueId });

    if (!vote) {
        return res.status(200).json(new ApiResponse(200, { voteType: null }, "User has not voted on this issue."));
    }

    return res.status(200).json(new ApiResponse(200, { voteType: vote.voteType }, "User's vote retrieved successfully."));
});


export {
    getAllIssuesForService,
    getIssueById,
    createIssue,
    deleteIssue,
    addComment,
    replyToComment,
    toggleCommentLike,
    toggleReplyLike,
    updateComment,
    deleteComment,
    upvoteIssue,
    downvoteIssue,
    getUserVote,
    updateIssueStatus
}