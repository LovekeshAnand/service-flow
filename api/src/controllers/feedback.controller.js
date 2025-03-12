import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Feedback } from "../models/feedbackSchema.model.js";
import { Comment } from "../models/commentSchema.model.js";
import { Like } from "../models/likeSchema.model.js";
import { Vote } from "../models/voteSchema.model.js";

/** ✅ 1. Get All Feedbacks for a Specific Service */
const getAllFeedbacksForService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { page = 1, limit = 10, search = "", sortBy = "votes" } = req.query;

    const query = {
        service: serviceId,
        $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ]
    };

    const totalFeedbacks = await Feedback.countDocuments(query);
    const totalPages = Math.ceil(totalFeedbacks / limit);

    // Determine the sort order
    let sortOrder = {};
    if (sortBy === "votes") {
        sortOrder = { netVotes: -1, createdAt: -1 }; // Sort by votes, then by date
    } else if (sortBy === "date") {
        sortOrder = { createdAt: -1 }; // Sort by date only
    } else {
        sortOrder = { netVotes: -1, createdAt: -1 }; // Default sort
    }

    const feedbacks = await Feedback.find(query)
        .populate("openedBy", "username")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort(sortOrder);

    return res.status(200).json(new ApiResponse(200, { feedbacks, totalPages, currentPage: parseInt(page) }, "Feedbacks retrieved successfully."));
});

/** ✅ 2. Get All Feedbacks Created by a Specific User */
const getAllFeedbacksByUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const totalFeedbacks = await Feedback.countDocuments({ openedBy: userId });
    const totalPages = Math.ceil(totalFeedbacks / limit);

    const feedbacks = await Feedback.find({ openedBy: userId })
        .populate("service", "serviceName")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, { feedbacks, totalPages, currentPage: parseInt(page) }, "User's feedbacks retrieved successfully."));
});

/** ✅ 3. Get a Single Feedback with Comments & Replies */
const getFeedbackById = asyncHandler(async (req, res) => {
    const { serviceId, feedbackId } = req.params;
    const userId = req.user?._id;

    const feedback = await Feedback.findOne({ _id: feedbackId, service: serviceId })
        .populate("openedBy", "username")
        .populate({
            path: "comments",
            populate: [
                { path: "user", select: "username" },
                { path: "replies", populate: { path: "user", select: "username" } }
            ]
        });

    if (!feedback) {
        throw new ApiError(404, "Feedback not found.");
    }

    // Get the current user's vote on this feedback, if any
    let userVote = null;
    if (userId) {
        userVote = await Vote.findOne({ user: userId, feedback: feedbackId });
    }

    // Add userVote to the response
    const responseData = {
        ...feedback.toObject(),
        userVote: userVote ? userVote.voteType : null
    };

    return res.status(200).json(new ApiResponse(200, responseData, "Feedback details retrieved successfully."));
});

/** ✅ 4. Create Feedback for a Specific Service */
const createFeedback = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { title, description } = req.body;
    const userId = req.user._id;

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required.");
    }

    const feedback = await Feedback.create({ 
        title, 
        description, 
        service: serviceId, 
        openedBy: userId,
        upvotes: 0,
        downvotes: 0,
        netVotes: 0
    });

    return res.status(201).json(new ApiResponse(201, feedback, "Feedback created successfully."));
});

/** ✅ 5. Delete Feedback (Only Creator Can Delete) */
const deleteFeedback = asyncHandler(async (req, res) => {
    const { serviceId, feedbackId } = req.params;
    const userId = req.user._id;

    const feedback = await Feedback.findOne({ _id: feedbackId, service: serviceId });

    if (!feedback) {
        throw new ApiError(404, "Feedback not found.");
    }

    if (feedback.openedBy.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized: You can only delete your own feedback.");
    }

    // Delete all associated votes
    await Vote.deleteMany({ feedback: feedbackId });
    
    // Delete feedback and associated comments
    await Comment.deleteMany({ _id: { $in: feedback.comments } });
    await feedback.deleteOne();

    return res.status(200).json(new ApiResponse(200, {}, "Feedback deleted successfully."));
});

/** ✅ 6. Add a Comment to Feedback */
const addComment = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    if (!message) {
        throw new ApiError(400, "Message cannot be empty.");
    }

    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
        throw new ApiError(404, "Feedback not found.");
    }

    const comment = await Comment.create({ user: userId, message });
    feedback.comments.push(comment._id);
    await feedback.save();

    return res.status(201).json(new ApiResponse(201, comment, "Comment added successfully."));
});

/** ✅ 7. Reply to a Comment */
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

/** ✅ 8. Like/Unlike a Comment */
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ user: userId, targetId: commentId, targetType: "Comment" });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, {}, "Comment unliked."));
    }

    const like = await Like.create({ user: userId, targetId: commentId, targetType: "Comment" });
    return res.status(201).json(new ApiResponse(201, like, "Comment liked."));
});

/** ✅ 9. Like/Unlike a Reply */
const toggleReplyLike = asyncHandler(async (req, res) => {
    const { replyId } = req.params;
    const userId = req.user._id;

    const existingLike = await Like.findOne({ user: userId, targetId: replyId, targetType: "Reply" });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, {}, "Reply unliked."));
    }

    const like = await Like.create({ user: userId, targetId: replyId, targetType: "Reply" });
    return res.status(201).json(new ApiResponse(201, like, "Reply liked."));
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

/** ✅ 11. Upvote a Feedback */
/** ✅ 11. Upvote a Feedback */
const upvoteFeedback = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;
    const userId = req.user._id;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
        throw new ApiError(404, "Feedback not found.");
    }

    // Check if the user has already voted
    const existingVote = await Vote.findOne({ 
        user: userId, 
        targetId: feedbackId,
        targetType: "Feedback" 
    });

    if (existingVote) {
        if (existingVote.voteType === "upvote") {
            // User is removing their upvote
            await Vote.findByIdAndDelete(existingVote._id);
            
            // Update the feedback vote counts
            feedback.upvotes -= 1;
            feedback.netVotes -= 1;
            await feedback.save();
            
            return res.status(200).json(new ApiResponse(200, { voteType: null }, "Upvote removed."));
        } else {
            // User is changing from downvote to upvote
            existingVote.voteType = "upvote";
            await existingVote.save();
            
            // Update the feedback vote counts
            feedback.upvotes += 1;
            feedback.downvotes -= 1;
            feedback.netVotes += 2; // +1 for adding upvote, +1 for removing downvote
            await feedback.save();
            
            return res.status(200).json(new ApiResponse(200, { voteType: "upvote" }, "Vote changed to upvote."));
        }
    } else {
        // Create a new upvote
        await Vote.create({ 
            user: userId, 
            targetId: feedbackId,
            targetType: "Feedback",
            voteType: "upvote" 
        });
        
        // Update the feedback vote counts
        feedback.upvotes += 1;
        feedback.netVotes += 1;
        await feedback.save();
        
        return res.status(201).json(new ApiResponse(201, { voteType: "upvote" }, "Feedback upvoted."));
    }
});

/** ✅ 12. Downvote a Feedback */
const downvoteFeedback = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;
    const userId = req.user._id;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
        throw new ApiError(404, "Feedback not found.");
    }

    // Check if the user has already voted
    const existingVote = await Vote.findOne({ 
        user: userId, 
        targetId: feedbackId,
        targetType: "Feedback" 
    });

    if (existingVote) {
        if (existingVote.voteType === "downvote") {
            // User is removing their downvote
            await Vote.findByIdAndDelete(existingVote._id);
            
            // Update the feedback vote counts
            feedback.downvotes -= 1;
            feedback.netVotes += 1;
            await feedback.save();
            
            return res.status(200).json(new ApiResponse(200, { voteType: null }, "Downvote removed."));
        } else {
            // User is changing from upvote to downvote
            existingVote.voteType = "downvote";
            await existingVote.save();
            
            // Update the feedback vote counts
            feedback.upvotes -= 1;
            feedback.downvotes += 1;
            feedback.netVotes -= 2; // -1 for removing upvote, -1 for adding downvote
            await feedback.save();
            
            return res.status(200).json(new ApiResponse(200, { voteType: "downvote" }, "Vote changed to downvote."));
        }
    } else {
        // Create a new downvote
        await Vote.create({ 
            user: userId, 
            targetId: feedbackId,
            targetType: "Feedback",
            voteType: "downvote" 
        });
        
        // Update the feedback vote counts
        feedback.downvotes += 1;
        feedback.netVotes -= 1;
        await feedback.save();
        
        return res.status(201).json(new ApiResponse(201, { voteType: "downvote" }, "Feedback downvoted."));
    }
});

/** ✅ 13. Get User's Vote on a Feedback */
const getUserVote = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;
    const userId = req.user._id;

    const vote = await Vote.findOne({ user: userId, feedback: feedbackId });
    
    if (!vote) {
        return res.status(200).json(new ApiResponse(200, { voteType: null }, "User has not voted on this feedback."));
    }
    
    return res.status(200).json(new ApiResponse(200, { voteType: vote.voteType }, "User's vote retrieved successfully."));
});

export {
    getAllFeedbacksForService,
    getAllFeedbacksByUser,
    getFeedbackById,
    createFeedback,
    deleteFeedback,
    addComment,
    replyToComment,
    toggleCommentLike,
    toggleReplyLike,
    deleteComment,
    upvoteFeedback,
    downvoteFeedback,
    getUserVote
}